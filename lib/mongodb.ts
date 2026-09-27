import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "epistimology";

if (!uri && process.env.NODE_ENV === "production") {
  console.warn("[mongodb] MONGODB_URI is not set.");
}

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Copy .env.example to .env.local and start MongoDB with `docker compose up -d`.",
      );
    }
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export async function closeDb(): Promise<void> {
  if (clientPromise) {
    const client = await clientPromise;
    await client.close();
    clientPromise = null;
  }
}
