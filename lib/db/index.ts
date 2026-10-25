import { MongoClient, Db } from "mongodb";
import { applySchema } from "./schema";

// Checked lazily (inside connectToDatabase) so `next build` doesn't crash when env vars
// are only available at runtime.
function getUri() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("Please add your DATABASE_URL (MongoDB connection string) to .env or .env.local");
  }
  return uri;
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection = global as unknown as {
  conn: MongoConnection | null;
  promise: Promise<MongoConnection> | null;
};

if (!cachedConnection.conn) {
  cachedConnection.conn = null;
}
if (!cachedConnection.promise) {
  cachedConnection.promise = null;
}

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    const opts = {};
    cachedConnection.promise = MongoClient.connect(getUri(), opts).then(async (client) => {
      const db = client.db();
      // Apply validators + indexes once per server instance (idempotent, never throws)
      await applySchema(db).catch((e) => console.warn("[schema] setup skipped:", e?.message));
      return { client, db };
    });
  }

  try {
    cachedConnection.conn = await cachedConnection.promise;
  } catch (e) {
    cachedConnection.promise = null;
    throw e;
  }

  return cachedConnection.conn;
}
