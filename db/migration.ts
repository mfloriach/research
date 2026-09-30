/**
 * MongoDB migration for content collections.
 *
 * - arguments    -> argument (singleton: the debated thesis)
 * - articles     -> Article (paragraphs and label embedded, references arguments)
 * - replies      -> audit reply (tab is a hardcoded label string)
 *
 * Removed collections (dropped when present): site_config, headings,
 * audit_items, menu_items, reporting_tabs, reporting_articles,
 * reporting_paragraphs, audit_tabs.
 *
 * Run with: npm run db:migrate
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { getDb, closeDb } from "../lib/mongodb";

export const COLLECTIONS = {
  arguments: "arguments",
  articles: "articles",
  replies: "replies",
} as const;

const REMOVED_COLLECTIONS = [
  "site_config",
  "headings",
  "audit_items",
  "menu_items",
  "reporting_tabs",
  "reporting_articles",
  "reporting_paragraphs",
  "audit_tabs",
];

const VALIDATORS: Record<string, object> = {
  [COLLECTIONS.arguments]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "title", "description"],
      properties: {
        _id: { bsonType: "string" },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
      },
    },
  },
  [COLLECTIONS.articles]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "title", "type", "label", "argumentId", "paragraphs", "order"],
      properties: {
        _id: { bsonType: "string" },
        title: { bsonType: "string" },
        type: { enum: ["text"] },
        label: { bsonType: "string" },
        argumentId: { bsonType: "string" },
        paragraphs: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["id", "text", "auditItemIds"],
            properties: {
              id: { bsonType: "string" },
              text: { bsonType: "string" },
              auditItemIds: { bsonType: "array", items: { bsonType: "string" } },
              order: { bsonType: "int" },
            },
          },
        },
        ipfsCid: { bsonType: "string" },
        order: { bsonType: "int" },
      },
    },
  },
  [COLLECTIONS.replies]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "tab", "title", "type", "paragraphs", "order"],
      properties: {
        _id: { bsonType: "string" },
        tab: { bsonType: "string" },
        title: { bsonType: "string" },
        type: { enum: ["text"] },
        paragraphs: { bsonType: "array", items: { bsonType: "string" } },
        author: { bsonType: "string" },
        date: { bsonType: "string" },
        ipfsCid: { bsonType: "string" },
        order: { bsonType: "int" },
        openCount: { bsonType: "int" },
      },
    },
  },
};

export async function migrate(): Promise<void> {
  const db = await getDb();
  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));

  for (const name of Object.values(COLLECTIONS)) {
    if (!existing.has(name)) {
      await db.createCollection(name, { validator: VALIDATORS[name] });
      console.log(`[migration] created collection ${name}`);
    } else {
      await db.command({ collMod: name, validator: VALIDATORS[name] });
      console.log(`[migration] updated validator for ${name}`);
    }
  }

  for (const name of REMOVED_COLLECTIONS) {
    if (existing.has(name)) {
      await db.collection(name).drop();
      console.log(`[migration] dropped removed collection ${name}`);
    }
  }

  await db.collection(COLLECTIONS.articles).createIndex({ label: 1, order: 1 });
  await db.collection(COLLECTIONS.articles).createIndex({ argumentId: 1 });
  await db.collection(COLLECTIONS.replies).createIndex({ tab: 1, order: 1 });
  console.log("[migration] indexes ensured");
}

const isMain = process.argv[1]?.endsWith("migration.ts") ?? false;
if (isMain) {
  migrate()
    .then(() => {
      console.log("[migration] done");
      return closeDb();
    })
    .catch(async (error) => {
      console.error("[migration] failed", error);
      await closeDb();
      process.exit(1);
    });
}
