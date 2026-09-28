import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { MongoClient, type Db } from "mongodb";
import { logger } from "@/lib/logger";

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "epistimology";

const mongoLog = logger.child({ component: "mongodb", dbName });

function safeHost(value: string): string {
  try {
    const url = new URL(value.replace(/^mongodb(\+srv)?:\/\//, "http://"));
    return url.host;
  } catch {
    return "unknown-host";
  }
}

if (!uri) {
  mongoLog.warn("MONGODB_URI is not set. Database calls will fail.");
}

let clientPromise: Promise<MongoClient> | null = null;
let listenersAttached = false;

function attachMonitoring(client: MongoClient) {
  if (listenersAttached) {
    return;
  }
  listenersAttached = true;

  client.on("serverHeartbeatFailed", (event) => {
    mongoLog.warn(
      { event: "mongodb.heartbeatFailed", failure: event.failure?.message },
      "MongoDB server heartbeat failed",
    );
  });
  client.on("serverHeartbeatSucceeded", (event) => {
    mongoLog.debug(
      { event: "mongodb.heartbeatSucceeded", durationMs: event.duration },
      "MongoDB heartbeat ok",
    );
  });
  client.on("connectionPoolCreated", (event) => {
    mongoLog.info(
      { event: "mongodb.poolCreated", address: event.address },
      "MongoDB connection pool created",
    );
  });
  client.on("connectionPoolCleared", (event) => {
    mongoLog.warn(
      { event: "mongodb.poolCleared" },
      "MongoDB connection pool cleared",
    );
    void event;
  });
  client.on("commandFailed", (event) => {
    mongoLog.error(
      {
        event: "mongodb.commandFailed",
        commandName: event.commandName,
        durationMs: event.duration,
        failure: event.failure?.message,
      },
      `MongoDB command ${event.commandName} failed`,
    );
  });
}

function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Copy .env.example to .env.local and start MongoDB with `docker compose up -d`.",
      );
    }
    mongoLog.info(
      { event: "mongodb.connecting", host: safeHost(uri) },
      "Connecting to MongoDB",
    );
    const client = new MongoClient(uri, { monitorCommands: true });
    attachMonitoring(client);
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
  const started = performance.now();
  const client = await getClientPromise();
  const db = client.db(dbName);
  mongoLog.debug(
    {
      event: "mongodb.getDb",
      durationMs: Math.round(performance.now() - started),
    },
    "Acquired MongoDB database handle",
  );
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
