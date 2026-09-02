/* Sets an admin account's password directly, without needing to sign in first.

   Usage:
     npm run admin:password -- <email> <new-password>

   Example:
     npm run admin:password -- admin@gmail.com "S0me-Strong-Pass"
*/
import 'dotenv/config';
import { connectDb, disconnectDb } from './connect.js';
import { AdminUser, hashPassword } from './models/AdminUser.js';

const [email, newPassword] = process.argv.slice(2);

function usage(message) {
  console.error(`\n${message}\n`);
  console.error('Usage: npm run admin:password -- <email> <new-password>');
  console.error('       Password must be at least 8 characters.');
  console.error('       Wrap it in "quotes" if it contains spaces or symbols.\n');
  process.exit(1);
}

if (!email || !newPassword) usage('Both an email and a new password are required.');
if (newPassword.length < 8) usage('Password must be at least 8 characters.');

async function main() {
  await connectDb();

  const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const all = await AdminUser.find({}, { email: 1 });
    console.error(`\nNo account found for "${email}".`);
    console.error(
      all.length
        ? `Existing accounts: ${all.map((u) => u.email).join(', ')}\n`
        : 'There are no admin accounts yet — run `npm run db:seed` first.\n'
    );
    await disconnectDb();
    process.exit(1);
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  console.log(`\nPassword updated for ${user.email} (role: ${user.role}).`);
  console.log('Existing sign-in sessions stay valid for up to 8 hours.\n');

  await disconnectDb();
}

main().catch(async (err) => {
  console.error('Failed to set password:', err.message);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
