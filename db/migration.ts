/**
 * MongoDB migration for content collections.
 *
 * - articles      -> Article (paragraphs and label embedded)
 * - audit_items   -> CollapsibleItem (tab is a hardcoded label string)
 * - site_config   -> site (singleton, no menu)
 * - headings      -> heading (singleton)
 *
 * Removed collections (dropped when present): menu_items, reporting_tabs,
 * reporting_articles, reporting_paragraphs, audit_tabs.
 *
 * Run with: npm run db:migrate
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { getDb, closeDb } from "../lib/mongodb";

export const COLLECTIONS = {
  articles: "articles",
  auditItems: "audit_items",
  siteConfig: "site_config",
  headings: "headings",
} as const;

const REMOVED_COLLECTIONS = [
  "menu_items",
  "reporting_tabs",
  "reporting_articles",
  "reporting_paragraphs",
  "audit_tabs",
];

const VALIDATORS: Record<string, object> = {
  [COLLECTIONS.articles]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "title", "type", "label", "paragraphs", "order"],
      properties: {
        _id: { bsonType: "string" },
        title: { bsonType: "string" },
        type: { enum: ["text"] },
        label: { bsonType: "string" },
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
  [COLLECTIONS.auditItems]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "tab", "title", "paragraphs", "order"],
      properties: {
        _id: { bsonType: "string" },
        tab: { bsonType: "string" },
        title: { bsonType: "string" },
        paragraphs: { bsonType: "array", items: { bsonType: "string" } },
        author: { bsonType: "string" },
        date: { bsonType: "string" },
        ipfsCid: { bsonType: "string" },
        order: { bsonType: "int" },
        openCount: { bsonType: "int" },
      },
    },
  },
  [COLLECTIONS.siteConfig]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "brand", "title", "description", "search", "avatar"],
      properties: {
        _id: { bsonType: "string" },
        brand: { bsonType: "string" },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        search: {
          bsonType: "object",
          required: ["placeholder", "label"],
          properties: {
            placeholder: { bsonType: "string" },
            label: { bsonType: "string" },
          },
        },
        avatar: {
          bsonType: "object",
          required: ["src", "alt"],
          properties: {
            src: { bsonType: "string" },
            alt: { bsonType: "string" },
          },
        },
      },
    },
  },
  [COLLECTIONS.headings]: {
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
  await db.collection(COLLECTIONS.auditItems).createIndex({ tab: 1, order: 1 });
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
