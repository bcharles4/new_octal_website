import 'dotenv/config';
import mongoose from 'mongoose';

/* Opened once at boot and reused for the process lifetime — Mongoose maintains
   its own internal connection pool, so nothing else needs to manage sockets. */
export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to your .env file.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined,
    serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS || 10000),
  });

  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
