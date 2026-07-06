import { MongoClient, Db } from "mongodb";

/**
 * Cached MongoDB connection for Next.js API routes.
 * The connection string lives only on the server (MONGODB_URI env var) and is
 * never exposed to the browser. In dev the client is cached on globalThis to
 * survive hot reloads; in production a module-level cache is used.
 */
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "talehgym";

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (process.env.NODE_ENV === "development") {
    const g = globalThis as unknown as { _talehMongo?: Promise<MongoClient> };
    if (!g._talehMongo) {
      g._talehMongo = new MongoClient(uri).connect();
    }
    return g._talehMongo;
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export function isConfigured(): boolean {
  return Boolean(uri);
}

/** Convert a Mongo document's _id (ObjectId) into a plain string `id`. */
export function serialize<T extends { _id?: unknown }>(doc: T) {
  const { _id, ...rest } = doc as Record<string, unknown> & { _id?: { toString(): string } };
  return { id: _id ? _id.toString() : undefined, ...rest };
}

