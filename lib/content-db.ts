/**
 * Read page content from MongoDB and reassemble it into the shapes
 * defined in `lib/content.ts`.
 */
import { getDb } from "@/lib/mongodb";
import type { Article, CollapsibleItem, ContentTab } from "@/lib/content";
import { COLLECTIONS } from "@/db/migration";

type SiteContent = {
  brand: string;
  title: string;
  description: string;
  search: { placeholder: string; label: string };
  avatar: { src: string; alt: string };
  menu: { label: string; items: { id: string; label: string; href: string }[] };
};

type HeadingContent = {
  title: string;
  description: string;
};

type ReportingCardContent = {
  title: string;
  tabs: ContentTab<Article>[];
};

type AuditCardContent = {
  title: string;
  tabs: ContentTab<CollapsibleItem>[];
};

export type DbContent = {
  site: SiteContent;
  heading: HeadingContent;
  reportingCard: ReportingCardContent;
  auditCard: AuditCardContent;
};

type MenuItemDoc = { _id: string; label: string; href: string };
type SiteConfigDoc = {
  _id: string;
  brand: string;
  title: string;
  description: string;
  search: { placeholder: string; label: string };
  avatar: { src: string; alt: string };
  menu: { label: string; itemIds: string[] };
};
type HeadingDoc = { _id: string; title: string; description: string };
type ReportingTabDoc = { _id: string; label: string; order?: number };
type ReportingArticleDoc = { _id: string; tabId: string; title: string; order?: number };
type ReportingParagraphDoc = {
  _id: string;
  articleId: string;
  text: string;
  auditItemIds: string[];
  order?: number;
};
type AuditTabDoc = { _id: string; label: string; order?: number; author?: string; date?: string };
type AuditItemDoc = {
  _id: string;
  tabId: string;
  title: string;
  paragraphs: string[];
  author?: string;
  date?: string;
  order?: number;
};

const byOrder = (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0);

export async function getContentFromDb(): Promise<DbContent> {
  const db = await getDb();

  const [siteDoc, headingDoc] = await Promise.all([
    db.collection<SiteConfigDoc>(COLLECTIONS.siteConfig).findOne({ _id: "site" }),
    db.collection<HeadingDoc>(COLLECTIONS.headings).findOne({ _id: "heading" }),
  ]);
  if (!siteDoc || !headingDoc) {
    throw new Error("Content collections are empty. Run `npm run db:seed` first.");
  }

  const itemIds = siteDoc.menu.itemIds ?? [];
  const menuDocs = itemIds.length
    ? await db
        .collection<MenuItemDoc>(COLLECTIONS.menuItems)
        .find({ _id: { $in: itemIds } })
        .toArray()
    : [];
  const menuById = new Map(menuDocs.map((d) => [d._id, d]));

  const [reportingTabs, reportingArticles, reportingParagraphs, auditTabs, auditItems] =
    await Promise.all([
      db.collection<ReportingTabDoc>(COLLECTIONS.reportingTabs).find({}).toArray(),
      db.collection<ReportingArticleDoc>(COLLECTIONS.reportingArticles).find({}).toArray(),
      db.collection<ReportingParagraphDoc>(COLLECTIONS.reportingParagraphs).find({}).toArray(),
      db.collection<AuditTabDoc>(COLLECTIONS.auditTabs).find({}).toArray(),
      db.collection<AuditItemDoc>(COLLECTIONS.auditItems).find({}).toArray(),
    ]);

  const paragraphsByArticle = new Map<
    string,
    { id: string; text: string; auditItemIds: string[]; order: number }[]
  >();
  for (const p of reportingParagraphs) {
    const list = paragraphsByArticle.get(p.articleId) ?? [];
    list.push({ id: p._id, text: p.text, auditItemIds: p.auditItemIds, order: p.order ?? 0 });
    paragraphsByArticle.set(p.articleId, list);
  }

  const articlesByTab = new Map<string, (Article & { order: number })[]>();
  for (const a of reportingArticles) {
    const paragraphs = (paragraphsByArticle.get(a._id) ?? [])
      .sort(byOrder)
      .map((p) => ({ id: p.id, text: p.text, auditItemIds: p.auditItemIds }));
    const list = articlesByTab.get(a.tabId) ?? [];
    list.push({ id: a._id, title: a.title, order: a.order ?? 0, paragraphs });
    articlesByTab.set(a.tabId, list);
  }

  const itemsByTab = new Map<string, (CollapsibleItem & { order: number })[]>();
  for (const item of auditItems) {
    const list = itemsByTab.get(item.tabId) ?? [];
    list.push({
      id: item._id,
      title: item.title,
      ...(item.author ? { author: item.author } : {}),
      ...(item.date ? { date: item.date } : {}),
      paragraphs: item.paragraphs,
      order: item.order ?? 0,
    });
    itemsByTab.set(item.tabId, list);
  }

  return {
    site: {
      brand: siteDoc.brand,
      title: siteDoc.title,
      description: siteDoc.description,
      search: {
        placeholder: siteDoc.search.placeholder,
        label: siteDoc.search.label,
      },
      avatar: { src: siteDoc.avatar.src, alt: siteDoc.avatar.alt },
      menu: {
        label: siteDoc.menu.label,
        items: itemIds.map((id) => ({
          id,
          label: menuById.get(id)?.label ?? id,
          href: menuById.get(id)?.href ?? "#",
        })),
      },
    },
    heading: {
      title: headingDoc.title,
      description: headingDoc.description,
    },
    reportingCard: {
      title: "Reporting",
      tabs: reportingTabs.sort(byOrder).map((tab) => ({
        id: tab._id,
        label: tab.label,
        items: (articlesByTab.get(tab._id) ?? [])
          .sort(byOrder)
          .map((article) => ({
            id: article.id,
            title: article.title,
            paragraphs: article.paragraphs,
          })),
      })),
    },
    auditCard: {
      title: "Argument audit",
      tabs: auditTabs.sort(byOrder).map((tab) => ({
        id: tab._id,
        label: tab.label,
        ...(tab.author ? { author: tab.author } : {}),
        ...(tab.date ? { date: tab.date } : {}),
        items: (itemsByTab.get(tab._id) ?? [])
          .sort(byOrder)
          .map((item) => ({
            id: item.id,
            title: item.title,
            ...(item.author ? { author: item.author } : {}),
            ...(item.date ? { date: item.date } : {}),
            paragraphs: item.paragraphs,
          })),
      })),
    },
  };
}
