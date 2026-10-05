import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { MongoClient, type Db } from "mongodb";
import { logger } from "@/lib/logger";
import { getServerConfig } from "@/lib/config";

const { mongoUri: uri, mongoDb: dbName } = getServerConfig();

const mongoLog = logger.child({ component: "mongodb", dbName });

function safeHost(value: string): string {
  try {
    const url = new URL(value.replace(/^mongodb(\+srv)?:\/\//, "http://"));
    return url.host;
  } catch {
    return "unknown-host";
  }
}

let clientPromise: Promise<MongoClient> | null = null;
let listenersAttached = false;

function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    mongoLog.info(
      { event: "mongodb.connecting", host: safeHost(uri) },
      "Connecting to MongoDB",
    );
    const client = new MongoClient(uri, {
      monitorCommands: true,
      // Local single-node topologies (e.g. mongodb-atlas-local, which
      // advertises its internal container hostname) must be dialed directly.
      directConnection: true,
    });
    // attachMonitoring(client);
    const started = performance.now();
    clientPromise = client.connect().then(
      (connected) => {
        mongoLog.info(
          {
            event: "mongodb.connected",
            host: safeHost(uri),
            durationMs: Math.round(performance.now() - started),
          },
          "Connected to MongoDB",
        );
        return connected;
      },
      (error: unknown) => {
        clientPromise = null;
        mongoLog.error(
          { event: "mongodb.connectError", err: error },
          "Failed to connect to MongoDB",
        );
        throw error;
      },
    );
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const db = client.db(dbName);

  return db;
}

export async function closeDb(): Promise<void> {
  if (clientPromise) {
    const client = await clientPromise;
    await client.close();
    clientPromise = null;
    listenersAttached = false;
    mongoLog.info({ event: "mongodb.closed" }, "Closed MongoDB connection");
  }
}
