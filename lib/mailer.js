/* Mail delivery with three backends behind one function.

   Railway (and most container platforms) block outbound SMTP ports entirely —
   25, 465 and 587 all fail with ENETUNREACH or ETIMEDOUT — so SMTP cannot be
   used in production there. Anything that goes out over ordinary HTTPS on 443
   is never blocked, which is what the other two backends rely on.

   Backend selection is by env presence, in this order:

     1. MAIL_RELAY_URL   — POSTs the rendered message to a small PHP endpoint on
                           the cPanel host, which does the SMTP locally. Mail
                           then leaves from the server that is authoritative for
                           the domain, so SPF and DKIM align.
     2. SENDGRID_API_KEY — SendGrid's HTTP API.
     3. SMTP_*           — nodemailer. Local development; unchanged by the above.

   Callers use the same nodemailer-shaped message whichever one is active. */
import { readFileSync } from 'fs';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

const MAIL_RELAY_URL = process.env.MAIL_RELAY_URL;
const MAIL_RELAY_SECRET = process.env.MAIL_RELAY_SECRET;
export const usingRelay = Boolean(MAIL_RELAY_URL);

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const usingSendGrid = !usingRelay && Boolean(SENDGRID_API_KEY);

if (usingSendGrid) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/* A 10MB resume base64s to ~13MB and then has to cross two hops, so the default
   of "wait forever" is not good enough — a hung relay would otherwise pin the
   request open until the platform's own proxy gave up. */
const RELAY_TIMEOUT_MS = 30000;

/* ------------------------------------------------------------------ SMTP -- */

let smtpTransporter = null;

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  const port = Number(process.env.SMTP_PORT || 465);
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
  });
  return smtpTransporter;
}

/* -------------------------------------------------------------- Addresses -- */

/* "Display Name" <someone@example.com> -> { name, email } */
function parseAddress(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;

  const match = String(value).match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { email: String(value).trim() };
}

function toAddressList(value) {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : String(value).split(',');
  return parts.map((p) => parseAddress(p)).filter((a) => a && a.email);
}

/* Both HTTP backends reject a message where the same address appears in both
   `to` and `cc`, which happens whenever ADMIN_EMAIL also appears in CC_EMAIL. */
function normalizeRecipients(message) {
  const to = toAddressList(message.to);
  if (to.length === 0) throw new Error('sendMail: no recipient.');

  const toEmails = new Set(to.map((a) => a.email.toLowerCase()));
  const cc = toAddressList(message.cc).filter((a) => !toEmails.has(a.email.toLowerCase()));
  return { to, cc };
}

/* ------------------------------------------------------------ Attachments -- */

/* nodemailer attachments -> { filename, content (base64), type, cid }. Shared
   by both HTTP backends; `cid` is what keeps the <img src="cid:octal-logo"> in
   the templates resolving once the message is rebuilt on the far side. */
function toBase64Attachments(attachments = []) {
  return attachments.map((a) => {
    let content;
    if (a.content) {
      content = Buffer.isBuffer(a.content)
        ? a.content.toString('base64')
        : Buffer.from(a.content).toString('base64');
    } else if (a.path) {
      content = readFileSync(a.path).toString('base64');
    } else {
      content = '';
    }

    return {
      filename: a.filename,
      content,
      type: a.contentType || guessType(a.filename),
      cid: a.cid || null,
    };
  });
}

function toSendGridAttachments(attachments = []) {
  return toBase64Attachments(attachments).map((a) => {
    const out = { filename: a.filename, content: a.content, type: a.type };
    if (a.cid) {
      out.disposition = 'inline';
      out.content_id = a.cid;
    } else {
      out.disposition = 'attachment';
    }
    return out;
  });
}

function guessType(filename = '') {
  const ext = filename.toLowerCase().split('.').pop();
  const map = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return map[ext] || 'application/octet-stream';
}

/* ------------------------------------------------------------- PHP relay -- */

async function sendViaRelay(message) {
  const { to, cc } = normalizeRecipients(message);

  const payload = {
    from: parseAddress(message.from),
    to,
    subject: message.subject,
    html: message.html,
  };

  if (cc.length > 0) payload.cc = cc;
  if (message.replyTo) payload.replyTo = parseAddress(message.replyTo);
  if (message.attachments?.length) {
    payload.attachments = toBase64Attachments(message.attachments);
  }

  let res;
  try {
    res = await fetch(MAIL_RELAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mail-Secret': MAIL_RELAY_SECRET || '',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(RELAY_TIMEOUT_MS),
    });
  } catch (err) {
    /* A timeout arrives as a bare TimeoutError, which says nothing about what
       was being attempted once it reaches the route's catch block. */
    throw new Error(`Mail relay unreachable at ${MAIL_RELAY_URL}: ${err.message}`);
  }

  /* The relay answers JSON, but a PHP fatal error or an HTML error page from
     the host is exactly the case worth reporting verbatim, so read it as text
     and only then try to pull a message out of it. */
  const body = await res.text();
  if (!res.ok) {
    let detail = body.slice(0, 500);
    try {
      detail = JSON.parse(body).error || detail;
    } catch {
      /* Not JSON — the truncated body is the most useful thing available. */
    }
    throw new Error(`Mail relay returned ${res.status}: ${detail}`);
  }

  return { relay: true, response: body };
}

/* ---------------------------------------------------------------- Public -- */

/* Accepts the nodemailer message shape already used across the app:
   { from, to, cc, replyTo, subject, html, attachments } */
export async function sendMail(message) {
  if (usingRelay) return sendViaRelay(message);
  if (!usingSendGrid) return getSmtpTransporter().sendMail(message);

  const { to, cc } = normalizeRecipients(message);

  const payload = {
    to,
    from: parseAddress(message.from),
    subject: message.subject,
    html: message.html,
  };

  if (cc.length > 0) payload.cc = cc;
  if (message.replyTo) payload.replyTo = parseAddress(message.replyTo);
  if (message.attachments?.length) {
    payload.attachments = toSendGridAttachments(message.attachments);
  }

  return sgMail.send(payload);
}

/* Checked once at boot so a mail misconfiguration shows up in the deploy log
   rather than the first time a visitor submits the contact form. */
export async function verifyMailer() {
  if (usingRelay) {
    if (!MAIL_RELAY_SECRET) {
      throw new Error('MAIL_RELAY_URL is set but MAIL_RELAY_SECRET is not.');
    }
    if (!process.env.MAIL_FROM) {
      throw new Error('MAIL_RELAY_URL is set but MAIL_FROM is not.');
    }

    /* GET is the relay's health mode: it proves the file is deployed and the
       PHP parses, without sending anything. The secret is deliberately not
       checked there, so a failure here means the host is blocking the request
       rather than that the secret is wrong. */
    let res;
    try {
      res = await fetch(MAIL_RELAY_URL, { signal: AbortSignal.timeout(10000) });
    } catch (err) {
      throw new Error(`Mail relay unreachable at ${MAIL_RELAY_URL}: ${err.message}`);
    }
    if (!res.ok) {
      throw new Error(`Mail relay health check returned ${res.status}.`);
    }

    return `Mail relay ready (${new URL(MAIL_RELAY_URL).host}, from ${process.env.MAIL_FROM}).`;
  }

  if (usingSendGrid) {
    if (!process.env.MAIL_FROM && !process.env.SMTP_USER) {
      throw new Error('SENDGRID_API_KEY is set but MAIL_FROM is not.');
    }
    /* There is no cheap "ping" endpoint that avoids sending a message, so this
       only confirms the key is present and well-formed. A wrong key surfaces as
       a 401 on the first send. */
    if (!SENDGRID_API_KEY.startsWith('SG.')) {
      throw new Error('SENDGRID_API_KEY does not look like a SendGrid key (expected it to start with "SG.").');
    }
    return `SendGrid API ready (from ${process.env.MAIL_FROM || process.env.SMTP_USER}).`;
  }

  await getSmtpTransporter().verify();
  return `SMTP ready (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 465}).`;
}
