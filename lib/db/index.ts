import { MongoClient, Db } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Please add your DATABASE_URL (MongoDB connection string) to .env or .env.local");
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
    cachedConnection.promise = MongoClient.connect(uri!, opts).then((client) => {
      return {
        client,
        db: client.db(),
      };
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
