/**
 * MongoDB migration for content collections.
 *
 * Collections mirror the types in `lib/content.ts`:
 * - menu_items         -> MenuItem
 * - site_config        -> site (singleton, references menu_items)
 * - headings           -> heading (singleton)
 * - reporting_tabs     -> ContentTab<Article> (without embedded items)
 * - reporting_articles -> Article (without embedded paragraphs)
 * - reporting_paragraphs -> ReportingParagraph
 * - audit_tabs         -> ContentTab<CollapsibleItem> (without embedded items)
 * - audit_items        -> CollapsibleItem
 *
 * Run with: npm run db:migrate
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { getDb, closeDb } from "../lib/mongodb";

export const COLLECTIONS = {
  menuItems: "menu_items",
  siteConfig: "site_config",
  headings: "headings",
  reportingTabs: "reporting_tabs",
  reportingArticles: "reporting_articles",
  reportingParagraphs: "reporting_paragraphs",
  auditTabs: "audit_tabs",
  auditItems: "audit_items",
} as const;

const VALIDATORS: Record<string, object> = {
  [COLLECTIONS.menuItems]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "label", "href"],
      properties: {
        _id: { bsonType: "string" },
        label: { bsonType: "string" },
        href: { bsonType: "string" },
      },
    },
  },
  [COLLECTIONS.siteConfig]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "brand", "title", "description", "search", "avatar", "menu"],
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
        menu: {
          bsonType: "object",
          required: ["label", "itemIds"],
          properties: {
            label: { bsonType: "string" },
            itemIds: { bsonType: "array", items: { bsonType: "string" } },
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
  [COLLECTIONS.reportingTabs]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "label", "order"],
      properties: {
        _id: { bsonType: "string" },
        label: { bsonType: "string" },
        order: { bsonType: "int" },
      },
    },
  },
  [COLLECTIONS.reportingArticles]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "tabId", "title", "order"],
      properties: {
        _id: { bsonType: "string" },
        tabId: { bsonType: "string" },
        title: { bsonType: "string" },
        ipfsCid: { bsonType: "string" },
        order: { bsonType: "int" },
      },
    },
  },
  [COLLECTIONS.reportingParagraphs]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "articleId", "text", "auditItemIds", "order"],
      properties: {
        _id: { bsonType: "string" },
        articleId: { bsonType: "string" },
        text: { bsonType: "string" },
        auditItemIds: { bsonType: "array", items: { bsonType: "string" } },
        order: { bsonType: "int" },
      },
    },
  },
  [COLLECTIONS.auditTabs]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "label", "order"],
      properties: {
        _id: { bsonType: "string" },
        label: { bsonType: "string" },
        author: { bsonType: "string" },
        date: { bsonType: "string" },
        order: { bsonType: "int" },
      },
    },
  },
  [COLLECTIONS.auditItems]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "tabId", "title", "paragraphs", "order"],
      properties: {
        _id: { bsonType: "string" },
        tabId: { bsonType: "string" },
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

  await db.collection(COLLECTIONS.reportingArticles).createIndex({ tabId: 1, order: 1 });
  await db.collection(COLLECTIONS.reportingParagraphs).createIndex({ articleId: 1, order: 1 });
  await db.collection(COLLECTIONS.auditItems).createIndex({ tabId: 1, order: 1 });
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
