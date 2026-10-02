/**
 * MongoDB migration for content collections.
 *
 * - arguments    -> argument (singleton: the debated thesis, with labels)
 * - articles     -> Article (paragraphs and labels embedded, references arguments)
 * - replies      -> audit reply (tab is a hardcoded label string)
 * - article_embeddings -> embedding vector per article (Atlas Vector Search)
 *
 * Removed collections (dropped when present): site_config, headings,
 * audit_items, menu_items, reporting_tabs, reporting_articles,
 * reporting_paragraphs, audit_tabs.
 *
 * Backfills single `label` article docs to `labels` arrays and ensures the
 * argument document carries labels.
 *
 * Run with: npm run db:migrate
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { getDb, closeDb } from "../lib/mongodb";
import { EMBEDDING_DIMENSIONS } from "../lib/embeddings";
import { ARGUMENT_LABELS } from "./content";

export const COLLECTIONS = {
  arguments: "arguments",
  articles: "articles",
  replies: "replies",
  articleEmbeddings: "article_embeddings",
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
      required: ["_id", "title", "description", "labels"],
      properties: {
        _id: { bsonType: "string" },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        labels: { bsonType: "array", items: { bsonType: "string" } },
      },
    },
  },
  [COLLECTIONS.articles]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "title", "type", "labels", "argumentId", "paragraphs", "order"],
      properties: {
        _id: { bsonType: "string" },
        title: { bsonType: "string" },
        type: { enum: ["text"] },
        labels: { bsonType: "array", minItems: 1, items: { bsonType: "string" } },
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
        author: { bsonType: "string" },
        date: { bsonType: "string" },
        authorAddress: { bsonType: "string" },
        openCount: { bsonType: "int" },
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
  [COLLECTIONS.articleEmbeddings]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "articleId", "embedding"],
      properties: {
        _id: { bsonType: "string" },
        articleId: { bsonType: "string" },
        embedding: { bsonType: "array", items: { bsonType: "double" } },
      },
    },
  },
};

export const VECTOR_INDEX_NAME = "vector_index";

async function ensureVectorIndex(db: Awaited<ReturnType<typeof getDb>>): Promise<void> {
  const collection = db.collection(COLLECTIONS.articleEmbeddings);
  const existing = await collection.listSearchIndexes().toArray();
  if (existing.some((index) => index.name === VECTOR_INDEX_NAME)) {
    console.log("[migration] vector search index already exists");
    return;
  }
  await collection.createSearchIndex({
    name: VECTOR_INDEX_NAME,
    definition: {
      mappings: {
        dynamic: false,
        fields: {
          embedding: {
            type: "knnVector",
            dimensions: EMBEDDING_DIMENSIONS,
            similarity: "cosine",
          },
        },
      },
    },
  });
  console.log("[migration] created vector search index");
}

export async function migrate(): Promise<void> {
  const db = await getDb();
  await waitForPrimary(db);
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

  await db.collection(COLLECTIONS.articles).createIndex({ labels: 1, order: 1 });
  await db.collection(COLLECTIONS.articles).createIndex({ argumentId: 1 });
  await db.collection(COLLECTIONS.replies).createIndex({ tab: 1, order: 1 });
  console.log("[migration] indexes ensured");

  const backfilledArticles = (
    await db.collection(COLLECTIONS.articles).updateMany(
      { label: { $exists: true } },
      [{ $set: { labels: ["$label"] } }, { $unset: "label" }],
    )
  ).modifiedCount;
  if (backfilledArticles > 0) {
    console.log(`[migration] backfilled labels for ${backfilledArticles} articles`);
  }
  const backfilledArguments = (
    await db.collection(COLLECTIONS.arguments).updateMany(
      { labels: { $exists: false } },
      { $set: { labels: [...ARGUMENT_LABELS] } },
    )
  ).modifiedCount;
  if (backfilledArguments > 0) {
    console.log(`[migration] backfilled labels for ${backfilledArguments} arguments`);
  }

  await ensureVectorIndex(db);
}

/** Wait until the node elects itself primary (single-node replica set). */
async function waitForPrimary(
  db: Awaited<ReturnType<typeof getDb>>,
  timeoutMs = 60000,
): Promise<void> {
  const started = Date.now();
  for (;;) {
    try {
      const hello = (await db.command({ hello: 1 })) as {
        isWritablePrimary?: boolean;
      };
      if (hello.isWritablePrimary) {
        return;
      }
    } catch {
      // Not ready yet; fall through to retry.
    }
    if (Date.now() - started > timeoutMs) {
      throw new Error(
        "MongoDB did not become primary in time. Check `docker logs epistimology-mongodb`.",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
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
