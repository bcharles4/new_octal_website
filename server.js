import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JOBS_FILE = path.join(__dirname, 'data', 'jobs.json');

function readJobs() {
  if (!existsSync(JOBS_FILE)) return [];
  return JSON.parse(readFileSync(JOBS_FILE, 'utf-8'));
}

function writeJobs(jobs) {
  writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.admin = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

const app = express();
app.use(cors());
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

// PUBLIC: Get all job listings
app.get('/api/jobs', (_req, res) => {
  res.json(readJobs());
});

// ADMIN: Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password.' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token });
});

// ADMIN: Get all jobs (protected)
app.get('/api/admin/jobs', authMiddleware, (_req, res) => {
  res.json(readJobs());
});

// ADMIN: Create job (protected)
app.post('/api/admin/jobs', authMiddleware, (req, res) => {
  const jobs = readJobs();
  const { title, location, type, description, responsibilities, requirements, benefits } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required.' });
  }
  const newJob = {
    id: Date.now().toString(),
    title,
    location: location || '',
    type: type || 'Full-time',
    description,
    responsibilities: responsibilities || [],
    requirements: requirements || [],
    benefits: benefits || [],
  };
  jobs.push(newJob);
  writeJobs(jobs);
  return res.status(201).json(newJob);
});

// ADMIN: Update job (protected)
app.put('/api/admin/jobs/:id', authMiddleware, (req, res) => {
  const jobs = readJobs();
  const idx = jobs.findIndex((j) => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Job not found.' });
  jobs[idx] = { ...jobs[idx], ...req.body, id: jobs[idx].id };
  writeJobs(jobs);
  return res.json(jobs[idx]);
});

// ADMIN: Delete job (protected)
app.delete('/api/admin/jobs/:id', authMiddleware, (req, res) => {
  const jobs = readJobs();
  const idx = jobs.findIndex((j) => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Job not found.' });
  jobs.splice(idx, 1);
  writeJobs(jobs);
  return res.json({ success: true });
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

// Serve built frontend (production)
const DIST = path.join(__dirname, 'dist');
app.use(express.static(DIST));

// SPA fallback — send index.html for non-API routes so React Router works
app.get(/^(?!\/api).*$/, (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
