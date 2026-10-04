/**
 * Seed MongoDB with the content from `db/nuclear.ts` and `db/rickandmorty1_1.ts`.
 *
 * Run with: npm run db:seed  (runs the migration first; wipes all content)
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { randomUUID } from "node:crypto";
import { Int32, Db } from "mongodb";
import { getDb, closeDb } from "../lib/mongodb";
import { COLLECTIONS, migrate } from "./migration";
import * as nuclear from "./nuclear";
import * as rickandmorty from "./rickandmorty1_1";
import { articleEmbeddingText, embedText } from "../lib/embeddings";

type SeedDoc = {
  _id: string;
  order?: Int32;
  [key: string]: unknown;
};

type ContentModule = {
  ARGUMENT_LABELS: readonly string[];
  argument: { title: string; description: string };
  reportingCard: {
    tabs: {
      label: string;
      items: {
        id: string;
        title: string;
        type?: string;
        videoUrl?: string;
        labels: string[];
        paragraphs: { id: string; text: string; auditItemIds?: string[] }[];
        author?: string;
        date?: string;
        authorAddress?: string;
        openCount?: number;
      }[];
    }[];
  };
  auditCard: {
    tabs: {
      label: string;
      items: {
        id: string;
        title: string;
        paragraphs: unknown;
        author?: string;
        date?: string;
      }[];
    }[];
  };
};

async function seedContent(db: Db, content: ContentModule): Promise<void> {
  const mainArgumentId = randomUUID();

  const arguments_ = db.collection<SeedDoc>(COLLECTIONS.arguments);
  const articles = db.collection<SeedDoc>(COLLECTIONS.articles);
  const replies = db.collection<SeedDoc>(COLLECTIONS.replies);

  await arguments_.insertOne({
    _id: mainArgumentId,
    title: content.argument.title,
    description: content.argument.description,
    labels: [...content.ARGUMENT_LABELS],
    createdAt: new Date(),
  });

  const articleDocs: SeedDoc[] = [];
  const labelOrder = new Map<string, number>();
  for (const tab of content.reportingCard.tabs) {
    for (const article of tab.items) {
      const labels = [...new Set([tab.label, ...article.labels])];
      const firstLabel = labels[0] as string;
      const order = labelOrder.get(firstLabel) ?? 0;
      for (const label of labels) {
        labelOrder.set(label, (labelOrder.get(label) ?? 0) + 1);
      }
      articleDocs.push({
        _id: article.id,
        title: article.title,
        type: article.type ?? "text",
        ...(article.videoUrl ? { videoUrl: article.videoUrl } : {}),
        labels,
        argumentId: mainArgumentId,
        paragraphs: article.paragraphs.map((paragraph, paraOrder) => ({
          id: paragraph.id,
          text: paragraph.text,
          auditItemIds: paragraph.auditItemIds,
          order: new Int32(paraOrder),
        })),
        ...(article.author ? { author: article.author } : {}),
        ...(article.date ? { date: article.date } : {}),
        ...(article.authorAddress
          ? { authorAddress: article.authorAddress }
          : {}),
        openCount: new Int32(article.openCount ?? 0),
        order: new Int32(order),
      });
    }
  }
  if (articleDocs.length > 0) {
    await articles.insertMany(articleDocs);
    console.log(`[seed] embedding ${articleDocs.length} articles…`);
    const embeddings = db.collection<{
      _id: string;
      articleId: string;
      embedding: number[];
    }>(COLLECTIONS.articleEmbeddings);
    for (const doc of articleDocs) {
      const paragraphs = ((doc.paragraphs ?? []) as { text?: string }[]).map(
        (paragraph) => paragraph.text ?? "",
      );
      const embedding = await embedText(
        articleEmbeddingText(String(doc.title), paragraphs),
      );
      await embeddings.insertOne({
        _id: `emb-${mainArgumentId}-${String(doc._id)}`,
        articleId: String(doc._id),
        embedding,
      });
    }
  }

  const replyDocs: SeedDoc[] = [];
  const tabOrder = new Map<string, number>();
  for (const tab of content.auditCard.tabs) {
    for (const item of tab.items) {
      const order = tabOrder.get(tab.label) ?? 0;
      tabOrder.set(tab.label, order + 1);
      const author = "author" in item ? item.author : undefined;
      const date = "date" in item ? item.date : undefined;
      replyDocs.push({
        _id: item.id,
        tab: tab.label,
        title: item.title,
        type: "text",
        ...(author ? { author } : {}),
        ...(date ? { date } : {}),
        paragraphs: item.paragraphs,
        order: new Int32(order),
        openCount: new Int32(0),
      });
    }
  }
  if (replyDocs.length > 0) {
    await replies.insertMany(replyDocs);
  }

  const knownReplyIds = new Set(replyDocs.map((doc) => doc._id));
  const dangling = articleDocs.flatMap((doc) =>
    ((doc.paragraphs ?? []) as { auditItemIds?: string[] }[]).flatMap(
      (paragraph) =>
        (paragraph.auditItemIds ?? []).filter((id) => !knownReplyIds.has(id)),
    ),
  );
  if (dangling.length > 0) {
    console.warn(`[seed] warning: ${dangling.length} dangling auditItemIds:`, [
      ...new Set(dangling),
    ]);
  }

  console.log(
    `[seed] inserted 1 argument, ${articleDocs.length} articles, ` +
      `${replyDocs.length} replies`,
  );
}

export async function seed(): Promise<void> {
  await migrate();
  const db = await getDb();

  await Promise.all(
    Object.values(COLLECTIONS).map((name) =>
      db.collection(name).deleteMany({}),
    ),
  );

  await seedContent(db, nuclear as unknown as ContentModule);
  await seedContent(db, rickandmorty as unknown as ContentModule);
}

const isMain = process.argv[1]?.endsWith("seed.ts") ?? false;
if (isMain) {
  seed()
    .then(() => {
      console.log("[seed] done");
      return closeDb();
    })
    .catch(async (error) => {
      console.error("[seed] failed", error);
      await closeDb();
      process.exit(1);
    });
}
