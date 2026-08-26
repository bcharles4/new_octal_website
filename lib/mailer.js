/* Mail delivery with two backends behind one function.

   Railway (and most container platforms) block outbound SMTP ports entirely —
   25, 465 and 587 all fail with ENETUNREACH or ETIMEDOUT — so SMTP cannot be
   used in production there. SendGrid's HTTP API goes out over ordinary HTTPS on
   443, which is never blocked.

   Set SENDGRID_API_KEY and mail goes over the API. Leave it unset (local
   development) and it falls back to the SMTP settings, so nothing changes for
   `npm run dev`. Callers use the same nodemailer-shaped message either way. */
import { readFileSync } from 'fs';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const usingSendGrid = Boolean(SENDGRID_API_KEY);

if (usingSendGrid) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

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

/* -------------------------------------------------------------- SendGrid -- */

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

/* nodemailer attachments -> SendGrid attachments. `cid` becomes an inline
   content_id so the <img src="cid:octal-logo"> in the templates still resolves. */
function toSendGridAttachments(attachments = []) {
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

    const out = {
      filename: a.filename,
      content,
      type: a.contentType || guessType(a.filename),
    };

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

/* ---------------------------------------------------------------- Public -- */

/* Accepts the nodemailer message shape already used across the app:
   { from, to, cc, replyTo, subject, html, attachments } */
export async function sendMail(message) {
  if (!usingSendGrid) {
    return getSmtpTransporter().sendMail(message);
  }

  const to = toAddressList(message.to);
  if (to.length === 0) throw new Error('sendMail: no recipient.');

  /* SendGrid rejects a message where the same address appears in both `to` and
     `cc`, which happens whenever ADMIN_EMAIL and CC_EMAIL are the same. */
  const toEmails = new Set(to.map((a) => a.email.toLowerCase()));
  const cc = toAddressList(message.cc).filter((a) => !toEmails.has(a.email.toLowerCase()));

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
