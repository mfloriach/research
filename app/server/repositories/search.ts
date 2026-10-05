import { getDb } from "@/lib/mongodb";
import { COLLECTIONS, VECTOR_INDEX_NAME } from "@/db/migration";
import { embedText } from "@/lib/embeddings";

export type SearchMatch = {
  articleId: string;
  argumentId: string;
  title: string;
  openCount: number;
  score: number;
};

export type ArticleSearchResult = {
  matches: SearchMatch[];
  top: number;
};

export async function searchArticleEmbeddings(
  queryVector: number[],
): Promise<{ articleId: string; score: number }[]> {
  const db = await getDb();
  const hits = (await db
    .collection(COLLECTIONS.articleEmbeddings)
    .aggregate([
      {
        $vectorSearch: {
          index: VECTOR_INDEX_NAME,
          path: "embedding",
          queryVector,
          numCandidates: 50,
          limit: 5,
        },
      },
      {
        $project: {
          _id: 0,
          articleId: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ])
    .toArray()) as { articleId: string; score: number }[];

  return hits.map((hit) => ({
    articleId: hit.articleId,
    score: hit.score,
  }));
}

export async function searchArticlesByText(
  query: string,
): Promise<ArticleSearchResult> {
  const queryVector = await embedText(query);
  const matches = await searchArticleEmbeddings(queryVector);
  const top = matches[0]?.score ?? 0;
  if (matches.length === 0) {
    return { matches: [], top };
  }
  const titled = await withArticleTitles(matches);
  return { matches: titled, top };
}

/**
 * Attach article titles and view counts to vector-search hits in rank order.
 * Titles and counts live on the articles themselves, so one lookup covers
 * every argument — unlike resolving them client-side from a single dossier.
 * A missing article falls back to its id with zero views rather than
 * dropping the hit.
 */
async function withArticleTitles(
  matches: { articleId: string; score: number }[],
): Promise<SearchMatch[]> {
  const db = await getDb();
  const docs = await db
    .collection<{
      _id: string;
      argumentId: string;
      title: string;
      openCount?: number;
    }>(COLLECTIONS.articles)
    .find({ _id: { $in: matches.map((match) => match.articleId) } })
    .project({ argumentId: 1, title: 1, openCount: 1 })
    .toArray();
  const byId = new Map(docs.map((doc) => [doc._id, doc]));
  return matches.map((match) => {
    const doc = byId.get(match.articleId);
    return {
      articleId: match.articleId,
      argumentId: doc?.argumentId ?? "",
      title: doc?.title ?? match.articleId,
      openCount: doc?.openCount ?? 0,
      score: match.score,
    };
  });
}
