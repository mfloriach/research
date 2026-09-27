/**
 * Seed MongoDB with the content from `lib/content.ts`.
 *
 * Run with: npm run db:seed  (runs the migration first)
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { Int32 } from "mongodb";
import { getDb, closeDb } from "../lib/mongodb";
import { COLLECTIONS, migrate } from "./migration";
import { site, heading, reportingCard, auditCard } from "../lib/content";

type SeedDoc = {
  _id: string;
  order?: Int32;
  [key: string]: unknown;
};

export async function seed(): Promise<void> {
  await migrate();
  const db = await getDb();

  await Promise.all(Object.values(COLLECTIONS).map((name) => db.collection(name).deleteMany({})));

  const menuItems = db.collection<SeedDoc>(COLLECTIONS.menuItems);
  const siteConfig = db.collection<SeedDoc>(COLLECTIONS.siteConfig);
  const headings = db.collection<SeedDoc>(COLLECTIONS.headings);
  const reportingTabs = db.collection<SeedDoc>(COLLECTIONS.reportingTabs);
  const reportingArticles = db.collection<SeedDoc>(COLLECTIONS.reportingArticles);
  const reportingParagraphs = db.collection<SeedDoc>(COLLECTIONS.reportingParagraphs);
  const auditTabs = db.collection<SeedDoc>(COLLECTIONS.auditTabs);
  const auditItems = db.collection<SeedDoc>(COLLECTIONS.auditItems);

  await menuItems.insertMany(
    site.menu.items.map((item) => ({ _id: item.id, label: item.label, href: item.href })),
  );

  await siteConfig.insertOne({
    _id: "site",
    brand: site.brand,
    title: site.title,
    description: site.description,
    search: { placeholder: site.search.placeholder, label: site.search.label },
    avatar: { src: site.avatar.src, alt: site.avatar.alt },
    menu: { label: site.menu.label, itemIds: site.menu.items.map((item) => item.id) },
  });

  await headings.insertOne({
    _id: "heading",
    title: heading.title,
    description: heading.description,
  });

  const articleDocs: SeedDoc[] = [];
  const paragraphDocs: SeedDoc[] = [];
  for (const [tabOrder, tab] of reportingCard.tabs.entries()) {
    await reportingTabs.insertOne({
      _id: tab.id,
      label: tab.label,
      order: new Int32(tabOrder),
    });
    for (const [articleOrder, article] of tab.items.entries()) {
      articleDocs.push({
        _id: article.id,
        tabId: tab.id,
        title: article.title,
        order: new Int32(articleOrder),
      });
      for (const [paraOrder, paragraph] of article.paragraphs.entries()) {
        paragraphDocs.push({
          _id: paragraph.id,
          articleId: article.id,
          text: paragraph.text,
          auditItemIds: paragraph.auditItemIds,
          order: new Int32(paraOrder),
        });
      }
    }
  }
  if (articleDocs.length > 0) {
    await reportingArticles.insertMany(articleDocs);
  }
  if (paragraphDocs.length > 0) {
    await reportingParagraphs.insertMany(paragraphDocs);
  }

  const auditItemDocs: SeedDoc[] = [];
  for (const [tabOrder, tab] of auditCard.tabs.entries()) {
    await auditTabs.insertOne({
      _id: tab.id,
      label: tab.label,
      ...(tab.author ? { author: tab.author } : {}),
      ...(tab.date ? { date: tab.date } : {}),
      order: new Int32(tabOrder),
    });
    for (const [itemOrder, item] of tab.items.entries()) {
      const author = "author" in item ? item.author : undefined;
      const date = "date" in item ? item.date : undefined;
      auditItemDocs.push({
        _id: item.id,
        tabId: tab.id,
        title: item.title,
        ...(author ? { author } : {}),
        ...(date ? { date } : {}),
        paragraphs: item.paragraphs,
        order: new Int32(itemOrder),
      });
    }
  }
  if (auditItemDocs.length > 0) {
    await auditItems.insertMany(auditItemDocs);
  }

  const knownAuditIds = new Set(auditItemDocs.map((doc) => doc._id));
  const dangling = paragraphDocs.flatMap((doc) =>
    ((doc.auditItemIds ?? []) as string[]).filter((id) => !knownAuditIds.has(id)),
  );
  if (dangling.length > 0) {
    console.warn(`[seed] warning: ${dangling.length} dangling auditItemIds:`, [...new Set(dangling)]);
  }

  console.log(
    `[seed] inserted ${site.menu.items.length} menu items, ` +
      `${reportingCard.tabs.length} reporting tabs, ${articleDocs.length} articles, ` +
      `${paragraphDocs.length} paragraphs, ${auditCard.tabs.length} audit tabs, ` +
      `${auditItemDocs.length} audit items`,
  );
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
