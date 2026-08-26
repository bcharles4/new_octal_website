/* One-off setup: builds indexes, imports the legacy data/jobs.json listings, and
   creates the first admin account. Safe to re-run — it never overwrites data
   that is already there.

   Usage: npm run db:seed
*/
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { connectDb, disconnectDb } from './connect.js';
import { Job } from './models/Job.js';
import { AdminUser, hashPassword } from './models/AdminUser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_JOBS_FILE = path.join(__dirname, '..', 'data', 'jobs.json');

async function seedJobs() {
  const existing = await Job.countDocuments();
  if (existing > 0) {
    console.log(`- jobs: ${existing} already in the database, skipping import.`);
    return;
  }
  if (!existsSync(LEGACY_JOBS_FILE)) {
    console.log('- jobs: no data/jobs.json to import, starting empty.');
    return;
  }

  const legacy = JSON.parse(readFileSync(LEGACY_JOBS_FILE, 'utf-8'));
  if (!Array.isArray(legacy) || legacy.length === 0) {
    console.log('- jobs: data/jobs.json is empty, nothing to import.');
    return;
  }

  /* Drop the old file-based `id`; Mongo assigns its own _id. */
  const docs = legacy.map((job) => ({
    title: job.title,
    department: job.department || '',
    location: job.location || '',
    type: job.type || 'Full-time',
    description: job.description || '',
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    benefits: job.benefits || [],
  }));

  await Job.insertMany(docs);
  console.log(`- jobs: imported ${docs.length} listing(s) from data/jobs.json.`);
}

async function seedAdmin() {
  const existing = await AdminUser.countDocuments();
  if (existing > 0) {
    console.log(`- admins: ${existing} account(s) already exist, skipping.`);
    return;
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      '- admins: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env to create the first account.'
    );
    return;
  }
  if (password.length < 8) {
    console.log('- admins: SEED_ADMIN_PASSWORD must be at least 8 characters. Skipped.');
    return;
  }

  await AdminUser.create({
    email,
    name: process.env.SEED_ADMIN_NAME || 'Administrator',
    passwordHash: await hashPassword(password),
    role: 'admin',
  });
  console.log(`- admins: created first admin account for ${email}.`);
}

async function main() {
  await connectDb();
  console.log('Connected. Seeding...');

  /* Builds the unique index on admin emails before anything is inserted. */
  await Promise.all([Job.syncIndexes(), AdminUser.syncIndexes()]);

  await seedJobs();
  await seedAdmin();

  await disconnectDb();
  console.log('Done.');
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
