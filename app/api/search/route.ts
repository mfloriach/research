import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS, VECTOR_INDEX_NAME } from "@/db/migration";
import { MAX_SEARCH_QUERY_LENGTH, searchQuerySchema } from "@/lib/api-schemas";
import { embedText, isMatch } from "@/lib/embeddings";

type VectorHit = {
  articleId: string;
  score: number;
};

/**
 * Vector search over articles
 *
 * @description Embeds the `q` query with a local sentence model and runs
 * Atlas Vector Search over article embeddings. Returns a match when the
 * top similarity is at least 70%.
 * @tag Search
 * @query SearchQuery
 * @response SearchResponse:Search result
 * @response 400:ErrorResponse:Invalid query
 * @response 500:ErrorResponse:Search failed
 * @openapi
 */
export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  const parsed = searchQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  const rawQuery = parsed.data.q ?? "";
  const query = rawQuery.slice(0, MAX_SEARCH_QUERY_LENGTH);

  const queryVector = await embedText(query);
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
    .toArray()) as VectorHit[];

  const matches = hits.map((hit) => ({
    articleId: hit.articleId,
    score: hit.score,
  }));
  const top = matches[0]?.score ?? 0;
  console.log({
    query,
    match: isMatch(top),
    score: top,
    matches,
  })
  return NextResponse.json({
    query,
    match: isMatch(top),
    score: top,
    matches,
  });
};
