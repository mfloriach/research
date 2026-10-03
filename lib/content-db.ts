/**
 * Read page content from MongoDB and reassemble it into the shapes
 * defined in `db/content.ts`.
 */
import { getDb } from "@/lib/mongodb";
import type {
  Article,
  CollapsibleItem,
  ContentTab,
  AUDIT_TABS,
} from "@/db/types";
import { COLLECTIONS } from "@/db/migration";

type ArgumentContent = {
  title: string;
  description: string;
  labels: readonly string[];
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
  argument: ArgumentContent;
  reportingCard: ReportingCardContent;
  auditCard: AuditCardContent;
};

type ArgumentDoc = {
  _id: string;
  title: string;
  description: string;
  labels?: string[];
};
type StoredParagraphDoc = {
  id: string;
  text: string;
  auditItemIds: string[];
  order?: number;
};
type ArticleDoc = {
  _id: string;
  title: string;
  type?: "text" | "video";
  videoUrl?: string;
  labels: string[];
  argumentId: string;
  paragraphs: StoredParagraphDoc[];
  author?: string;
  date?: string;
  authorAddress?: string;
  openCount?: number;
  ipfsCid?: string;
  order?: number;
};
type ReplyDoc = {
  _id: string;
  tab: string;
  title: string;
  type: string;
  paragraphs: string[];
  author?: string;
  date?: string;
  ipfsCid?: string;
  order?: number;
  openCount?: number;
};

const byOrder = (a: { order?: number }, b: { order?: number }) =>
  (a.order ?? 0) - (b.order ?? 0);

export async function getContentFromDb(): Promise<DbContent> {
  const db = await getDb();

  const [argumentDoc] = await db
    .collection<ArgumentDoc>(COLLECTIONS.arguments)
    .find({})
    .limit(1)
    .toArray();
  if (!argumentDoc) {
    throw new Error(
      "Content collections are empty. Run `npm run db:seed` first.",
    );
  }

  const [articleDocs, replies] = await Promise.all([
    db.collection<ArticleDoc>(COLLECTIONS.articles).find({}).toArray(),
    db.collection<ReplyDoc>(COLLECTIONS.replies).find({}).toArray(),
  ]);

  const articlesByLabel = new Map<string, (Article & { order: number })[]>();
  for (const doc of articleDocs) {
    const paragraphs = (doc.paragraphs ?? [])
      .slice()
      .sort(byOrder)
      .map((paragraph) => ({
        id: paragraph.id,
        text: paragraph.text,
        auditItemIds: paragraph.auditItemIds ?? [],
      }));
    const labels = [...new Set(doc.labels ?? [])];
    for (const label of labels) {
      const list = articlesByLabel.get(label) ?? [];
      list.push({
        id: doc._id,
        title: doc.title,
        labels,
        // Legacy documents predate the media kind; they are text.
        type: doc.type ?? "text",
        ...(doc.videoUrl ? { videoUrl: doc.videoUrl } : {}),
        ...(doc.author ? { author: doc.author } : {}),
        ...(doc.date ? { date: doc.date } : {}),
        ...(doc.authorAddress ? { authorAddress: doc.authorAddress } : {}),
        openCount: doc.openCount ?? 0,
        order: doc.order ?? 0,
        paragraphs,
      });
      articlesByLabel.set(label, list);
    }
  }
  const reportingTabs = [...articlesByLabel.entries()]
    .map(([label, entries]) => ({
      id: label,
      label,
      order: Math.min(...entries.map((entry) => entry.order)),
      items: entries.sort(byOrder).map((article) => ({
        id: article.id,
        title: article.title,
        labels: article.labels,
        type: article.type ?? "text",
        ...(article.videoUrl ? { videoUrl: article.videoUrl } : {}),
        ...(article.author ? { author: article.author } : {}),
        ...(article.date ? { date: article.date } : {}),
        ...(article.authorAddress
          ? { authorAddress: article.authorAddress }
          : {}),
        openCount: article.openCount ?? 0,
        paragraphs: article.paragraphs,
      })),
    }))
    .sort(byOrder);

  const itemsByTab = new Map<string, (CollapsibleItem & { order: number })[]>();
  for (const item of replies) {
    const list = itemsByTab.get(item.tab) ?? [];
    list.push({
      id: item._id,
      title: item.title,
      ...(item.author ? { author: item.author } : {}),
      ...(item.date ? { date: item.date } : {}),
      paragraphs: item.paragraphs,
      openCount: item.openCount ?? 0,
      order: item.order ?? 0,
    });
    itemsByTab.set(item.tab, list);
  }

  return {
    argument: {
      title: argumentDoc.title,
      description: argumentDoc.description,
      labels: argumentDoc.labels ?? [],
    },
    reportingCard: {
      title: "Reporting",
      tabs: reportingTabs,
    },
    auditCard: {
      title: "Argument audit",
      tabs: AUDIT_TABS.map((tab) => ({
        id: tab.label,
        label: tab.label,
        ...(tab.author ? { author: tab.author } : {}),
        ...(tab.date ? { date: tab.date } : {}),
        items: (itemsByTab.get(tab.label) ?? []).sort(byOrder).map((item) => ({
          id: item.id,
          title: item.title,
          ...(item.author ? { author: item.author } : {}),
          ...(item.date ? { date: item.date } : {}),
          paragraphs: item.paragraphs,
          openCount: item.openCount ?? 0,
        })),
      })),
    },
  };
}
