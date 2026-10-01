import { getDb } from "@/lib/mongodb";
import { COLLECTIONS, VECTOR_INDEX_NAME } from "@/db/migration";
import { embedText } from "@/lib/embeddings";

export type SearchMatch = {
  articleId: string;
  score: number;
};

export type ArticleSearchResult = {
  matches: SearchMatch[];
  top: number;
};

export async function searchArticleEmbeddings(
  queryVector: number[],
): Promise<SearchMatch[]> {
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
    .toArray()) as SearchMatch[];

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
  return { matches, top };
}
