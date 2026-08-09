import dns from "node:dns";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

function applyLocalAtlasDnsFix() {
  // Only for local development. On Vercel/production, leave system DNS alone.
  // On some Windows setups Node's default resolver returns querySrv ECONNREFUSED
  // for MongoDB Atlas SRV records; public DNS resolves them correctly.
  if (process.env.NODE_ENV === "development") {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  applyLocalAtlasDnsFix();

  if (cached?.conn && cached.conn.connection?.readyState === 1) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached!.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        // Log host only (no credentials) so we can confirm Atlas vs local memory DB.
        console.log(
          `[MongoDB] Connected to ${m.connection.host} (db: ${m.connection.name})`
        );
        return m;
      })
      .catch((err) => {
        cached!.promise = null;
        throw err;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
