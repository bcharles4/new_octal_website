import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import jwt from 'jsonwebtoken';
import { connectDb } from './db/connect.js';
import { Job } from './db/models/Job.js';
import { AdminUser, hashPassword } from './db/models/AdminUser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Verifies the bearer token, then re-loads the account from the database on
   every request. The extra lookup means deactivating or deleting an admin takes
   effect immediately instead of waiting out their 8-hour token. */
async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let payload;
  try {
    payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const user = await AdminUser.findById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Account is no longer active.' });
    }
    req.admin = user;
    return next();
  } catch {
    return res.status(500).json({ error: 'Failed to verify account.' });
  }
}

/* Managing other accounts is restricted to the `admin` role; `editor` accounts
   can still do everything job-related. */
function requireAdminRole(req, res, next) {
  if (req.admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Requires an admin role.' });
  }
  return next();
}

const app = express();
/* The frontend is served from cPanel while this API runs on a separate host, so
   requests are cross-origin. Only the domains listed in ALLOWED_ORIGINS may call
   it; an unset list means same-origin only (local development uses the Vite
   proxy, which is same-origin and sends no Origin header). */
/* Trailing slashes are stripped because a browser's Origin header never has
   one, so "https://site.com/" in the env would never match. */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

/* Any localhost port is allowed outside production so `npm run dev` works
   without having to list the Vite port in ALLOWED_ORIGINS. */
const isDevOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      /* No Origin header: curl, health probes, and same-origin requests. */
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/+$/, '');
      if (ALLOWED_ORIGINS.includes(normalized)) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' && isDevOrigin(normalized)) {
        return callback(null, true);
      }

      /* Refuse by omitting the CORS headers rather than throwing — an Error
         here becomes an opaque 500 that looks like a server fault, when the
         browser is going to block the response on its own anyway. */
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// File upload (resume) stored in memory; max 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true, // SSL on port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Logo used as inline attachment (CID)
const LOGO_PATH = path.join(__dirname, 'src', 'assets', 'img', 'octal-logo-withText.png');

function buildEmailHtml({ firstName, lastName, email, phone, message }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:27px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#060a08 0%,#0c4513 100%);padding:5px 20px;">
            <img src="cid:octal-logo" alt="Octal Philippines Inc." width="230"/>
          </td>
        </tr>

        <tr>
          <td style="background:#59a14a;padding:14px 40px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">New Contact Form Inquiry</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
              Hello,<br><br>
              You have received a new inquiry through the Octal Philippines website contact form. Please find the details below.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;width:130px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Full Name</td>
                <td style="padding:14px 20px;color:#111827;font-size:15px;font-weight:500;">${firstName} ${lastName}</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Email</td>
                <td style="padding:14px 20px;"><a href="mailto:${email}" style="color:#59a14a;text-decoration:none;font-size:15px;">${email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Phone</td>
                <td style="padding:14px 20px;color:#111827;font-size:15px;">${phone || '—'}</td>
              </tr>
              <tr>
                <td style="padding:14px 20px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Message</td>
                <td style="padding:14px 20px;color:#111827;font-size:15px;line-height:1.6;white-space:pre-wrap;">${message}</td>
              </tr>
            </table>

          </td>
        </tr>

        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

        <tr>
          <td style="padding:28px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">This is an automated notification from the Octal Philippines website.</p>
            <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">Please do not reply directly to this email — use the <strong>Reply to ${firstName}</strong> button above.</p>
            <p style="margin:16px 0 0;color:#d1d5db;font-size:11px;">© ${year} Octal Philippines Inc. All rights reserved.</p>
            <p style="margin:4px 0 0;color:#d1d5db;font-size:11px;">QY Building, 233 Tomas Morato Ext., Quezon City, Philippines</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildCareerEmailHtml({
  firstName,
  lastName,
  email,
  phone,
  linkedin,
  coverLetter,
  jobTitle,
  jobLocation,
  jobType,
}) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:27px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#060a08 0%,#0c4513 100%);padding:5px 20px;">
            <img src="cid:octal-logo" alt="Octal Philippines Inc." width="230"/>
          </td>
        </tr>

        <tr>
          <td style="background:#59a14a;padding:14px 40px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">New Job Application Received</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
              Hello,<br><br>
              A new job application has been submitted through the Octal Philippines careers page. Please find the details below.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ee;border:1px solid #c3e0b8;border-radius:8px;overflow:hidden;margin-bottom:20px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Position Applied For</p>
                  <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">${jobTitle}</p>
                  <p style="margin:6px 0 0;color:#4b7c3f;font-size:13px;">${jobLocation} &nbsp;·&nbsp; ${jobType}</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;width:130px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Full Name</td>
                <td style="padding:14px 20px;color:#111827;font-size:15px;font-weight:500;">${firstName} ${lastName}</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Email</td>
                <td style="padding:14px 20px;"><a href="mailto:${email}" style="color:#59a14a;text-decoration:none;font-size:15px;">${email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Phone</td>
                <td style="padding:14px 20px;color:#111827;font-size:15px;">${phone || '—'}</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">LinkedIn</td>
                <td style="padding:14px 20px;">${
                  linkedin
                    ? `<a href="${linkedin}" style="color:#59a14a;text-decoration:none;font-size:15px;">${linkedin}</a>`
                    : '—'
                }</td>
              </tr>
              ${
                coverLetter
                  ? `<tr>
                <td style="padding:14px 20px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Cover Letter</td>
                <td style="padding:14px 20px;color:#111827;font-size:15px;line-height:1.6;white-space:pre-wrap;">${coverLetter}</td>
              </tr>`
                  : ''
              }
            </table>

          </td>
        </tr>

        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

        <tr>
          <td style="padding:28px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">This is an automated notification from the Octal Philippines careers page.</p>
            <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">Please do not reply directly to this email — use the <strong>Reply to ${firstName}</strong> button above.</p>
            <p style="margin:16px 0 0;color:#d1d5db;font-size:11px;">© ${year} Octal Philippines Inc. All rights reserved.</p>
            <p style="margin:4px 0 0;color:#d1d5db;font-size:11px;">QY Building, 233 Tomas Morato Ext., Quezon City, Philippines</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildApplicantConfirmationHtml({
  firstName,
  lastName,
  jobTitle,
  jobLocation,
  jobType,
}) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:27px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#060a08 0%,#0c4513 100%);padding:5px 20px;">
            <img src="cid:octal-logo" alt="Octal Philippines Inc." width="230"/>
          </td>
        </tr>

        <tr>
          <td style="background:#59a14a;padding:14px 40px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Application Received</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;color:#111827;font-size:18px;font-weight:700;">Hi ${firstName},</p>
            <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
              Thank you for applying at <strong>Octal Philippines Inc.</strong> We have successfully received your application and our team will carefully review it.
            </p>
            <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.7;">
              You can expect to hear from us within <strong>5 business days</strong>. In the meantime, feel free to explore more about us at <a href="https://octaltech.net" style="color:#59a14a;text-decoration:none;">octaltech.net</a>.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ee;border:1px solid #c3e0b8;border-radius:8px;overflow:hidden;margin-bottom:32px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Position Applied For</p>
                  <p style="margin:0 0 6px;color:#111827;font-size:18px;font-weight:700;">${jobTitle}</p>
                  <p style="margin:0;color:#4b7c3f;font-size:13px;">${jobLocation} &nbsp;·&nbsp; ${jobType}</p>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
              If you have any questions, you may reach us at
              <a href="mailto:${process.env.ADMIN_EMAIL}" style="color:#59a14a;text-decoration:none;">${process.env.ADMIN_EMAIL}</a>.
            </p>
          </td>
        </tr>

        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

        <tr>
          <td style="padding:28px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">This is an automated confirmation. Please do not reply to this email.</p>
            <p style="margin:16px 0 0;color:#d1d5db;font-size:11px;">© ${year} Octal Philippines Inc. All rights reserved.</p>
            <p style="margin:4px 0 0;color:#d1d5db;font-size:11px;">QY Building, 233 Tomas Morato Ext., Quezon City, Philippines</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Health check (useful for Nginx/probes)
app.get('/health', (_req, res) => res.json({ ok: true }));

/* Whitelisted so a client can never set fields like timestamps by stuffing
   extra keys into the request body. */
function jobFieldsFrom(body) {
  const fields = {};
  for (const key of ['title', 'department', 'location', 'type', 'description']) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  for (const key of ['responsibilities', 'requirements', 'benefits']) {
    if (body[key] !== undefined) {
      fields[key] = Array.isArray(body[key]) ? body[key] : [];
    }
  }
  return fields;
}

// PUBLIC: Get all job listings
app.get('/api/jobs', async (_req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.json(jobs);
  } catch {
    return res.status(500).json({ error: 'Failed to load jobs.' });
  }
});

// ADMIN: Login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await AdminUser.findOne({ email: String(email).toLowerCase().trim() });
    /* Same message and status either way, so the response can't be used to work
       out which email addresses have accounts. */
    const ok = user && user.isActive && (await user.verifyPassword(password));
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ token, user: user.toJSON() });
  } catch {
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// ADMIN: The signed-in account
app.get('/api/admin/me', authMiddleware, (req, res) => {
  res.json(req.admin.toJSON());
});

// ADMIN: Change your own password
app.post('/api/admin/me/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required.' });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  try {
    if (!(await req.admin.verifyPassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    req.admin.passwordHash = await hashPassword(newPassword);
    await req.admin.save();
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to change password.' });
  }
});

// ADMIN: Get all jobs (protected)
app.get('/api/admin/jobs', authMiddleware, async (_req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.json(jobs);
  } catch {
    return res.status(500).json({ error: 'Failed to load jobs.' });
  }
});

// ADMIN: Create job (protected)
app.post('/api/admin/jobs', authMiddleware, async (req, res) => {
  const fields = jobFieldsFrom(req.body);
  if (!fields.title || !fields.description) {
    return res.status(400).json({ error: 'title and description are required.' });
  }

  try {
    const job = await Job.create(fields);
    return res.status(201).json(job);
  } catch {
    return res.status(500).json({ error: 'Failed to create job.' });
  }
});

// ADMIN: Update job (protected)
app.put('/api/admin/jobs/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, jobFieldsFrom(req.body), {
      new: true,
      runValidators: true,
    });
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    return res.json(job);
  } catch (err) {
    /* A malformed id throws a CastError rather than returning null. */
    if (err.name === 'CastError') return res.status(404).json({ error: 'Job not found.' });
    return res.status(500).json({ error: 'Failed to update job.' });
  }
});

// ADMIN: Delete job (protected)
app.delete('/api/admin/jobs/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    return res.json({ success: true });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Job not found.' });
    return res.status(500).json({ error: 'Failed to delete job.' });
  }
});

// ADMIN ACCOUNTS: List (admin role only)
app.get('/api/admin/accounts', authMiddleware, requireAdminRole, async (_req, res) => {
  try {
    const users = await AdminUser.find().sort({ createdAt: 1 });
    return res.json(users);
  } catch {
    return res.status(500).json({ error: 'Failed to load accounts.' });
  }
});

// ADMIN ACCOUNTS: Create (admin role only)
app.post('/api/admin/accounts', authMiddleware, requireAdminRole, async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const user = await AdminUser.create({
      email,
      name: name || '',
      role: role === 'admin' ? 'admin' : 'editor',
      passwordHash: await hashPassword(password),
    });
    return res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

// ADMIN ACCOUNTS: Update name / role / active state / password (admin role only)
app.put('/api/admin/accounts/:id', authMiddleware, requireAdminRole, async (req, res) => {
  const { name, role, isActive, password } = req.body;

  /* Blocks the one-way door of an admin removing their own access and leaving
     nobody able to manage accounts. */
  if (req.params.id === req.admin.id && (isActive === false || (role && role !== 'admin'))) {
    return res.status(400).json({ error: 'You cannot demote or deactivate your own account.' });
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (role !== undefined) updates.role = role === 'admin' ? 'admin' : 'editor';
  if (isActive !== undefined) updates.isActive = Boolean(isActive);

  try {
    if (password !== undefined) {
      if (String(password).length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      }
      updates.passwordHash = await hashPassword(password);
    }

    const user = await AdminUser.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    return res.json(user);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Account not found.' });
    return res.status(500).json({ error: 'Failed to update account.' });
  }
});

// ADMIN ACCOUNTS: Delete (admin role only)
app.delete('/api/admin/accounts/:id', authMiddleware, requireAdminRole, async (req, res) => {
  if (req.params.id === req.admin.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  try {
    const user = await AdminUser.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    return res.json({ success: true });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Account not found.' });
    return res.status(500).json({ error: 'Failed to delete account.' });
  }
});
// CONTACT endpoint
app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    await transporter.sendMail({
      from: `"No Reply | Octal Philippines" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      cc: process.env.CC_EMAIL,
      replyTo: `"${firstName} ${lastName}" <${email}>`,
      subject: `New Inquiry — ${firstName} ${lastName}`,
      html: buildEmailHtml({ firstName, lastName, email, phone, message }),
      attachments: [
        {
          filename: 'octal-logo-withText.png',
          path: LOGO_PATH,
          cid: 'octal-logo',
        },
      ],
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
});

// CAREER endpoint (multipart/form-data, optional resume file)
// Frontend must send field name: resume
app.post('/api/apply', upload.single('resume'), async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    linkedin,
    coverLetter,
    jobTitle,
    jobLocation,
    jobType,
  } = req.body;

  if (!firstName || !lastName || !email || !jobTitle) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (
    linkedin &&
    !linkedin.startsWith('https://linkedin.com/') &&
    !linkedin.startsWith('https://www.linkedin.com/')
  ) {
    return res.status(400).json({ error: 'Invalid LinkedIn URL. Must start with https://linkedin.com/' });
  }

  const attachments = [
    {
      filename: 'octal-logo-withText.png',
      path: LOGO_PATH,
      cid: 'octal-logo',
    },
  ];

  if (req.file) {
    attachments.push({
      filename: req.file.originalname,
      content: req.file.buffer,
      contentType: req.file.mimetype,
    });
  }

  try {
    // Admin notification
    await transporter.sendMail({
      from: `"No Reply | Octal Philippines" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      cc: process.env.CC_EMAIL,
      replyTo: `"${firstName} ${lastName}" <${email}>`,
      subject: `New Application — ${firstName} ${lastName} for ${jobTitle}`,
      html: buildCareerEmailHtml({
        firstName,
        lastName,
        email,
        phone,
        linkedin,
        coverLetter,
        jobTitle,
        jobLocation,
        jobType,
      }),
      attachments,
    });

    // Applicant confirmation
    await transporter.sendMail({
      from: `"Octal Philippines Inc." <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We received your application — ${jobTitle}`,
      html: buildApplicantConfirmationHtml({
        firstName,
        lastName,
        jobTitle,
        jobLocation,
        jobType,
      }),
      attachments: [
        {
          filename: 'octal-logo-withText.png',
          path: LOGO_PATH,
          cid: 'octal-logo',
        },
      ],
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Career mail error:', err);
    return res.status(500).json({ error: 'Failed to send application email.' });
  }
});

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';

/* Serve the built frontend when it is present. It will not be when this runs as
   an API-only deployment with the frontend hosted separately, so both cases are
   handled rather than letting sendFile throw an opaque 500. */
const DIST = path.join(__dirname, 'dist');
const INDEX_HTML = path.join(DIST, 'index.html');
const hasFrontend = existsSync(INDEX_HTML);

if (hasFrontend) {
  app.use(express.static(DIST));

  // SPA fallback — send index.html for non-API routes so React Router works.
  app.get(/^(?!\/api).*$/, (_req, res) => {
    res.sendFile(INDEX_HTML);
  });
} else {
  console.log('No dist/ build found — running in API-only mode.');

  app.get(/^(?!\/api).*$/, (_req, res) => {
    res.status(404).json({
      error: 'This server is running in API-only mode. The frontend is hosted separately.',
    });
  });
}

/* Connect before listening so the process fails loudly on a bad MONGODB_URI
   rather than serving 500s to the first visitor who loads the careers page. */
connectDb()
  .then(() => {
    console.log('MongoDB connected.');
    app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
