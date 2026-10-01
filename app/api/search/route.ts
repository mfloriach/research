import { NextResponse } from "next/server";
import { BadRequestError } from "@/lib/errors";
import { MAX_SEARCH_QUERY_LENGTH, searchQuerySchema } from "@/lib/api-schemas";
import { isMatch } from "@/lib/embeddings";
import { searchArticlesByText } from "@/app/server/repositories/search";
import { getLlmProvider } from "@/app/server/services/llm/factory";

/**
 * Vector search over articles with an LLM answer
 *
 * @description Runs Atlas Vector Search over article embeddings, logs the
 * Atlas hits server-side, then answers the raw query with the configured
 * LLM provider. Returns both the Atlas matches and the LLM answer.
 * @tag Search
 * @query SearchQuery
 * @response SearchResponse:Search result with LLM answer
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
    throw new BadRequestError(
      parsed.error.issues[0]?.message ?? "Invalid query",
    );
  }

  const rawQuery = parsed.data.q ?? "";
  const query = rawQuery.slice(0, MAX_SEARCH_QUERY_LENGTH);

  const { matches, top } = await searchArticlesByText(query);

  const { answer, model } = await getLlmProvider().generateAnswer({ query });

  return NextResponse.json({
    query,
    match: isMatch(top),
    score: top,
    matches,
    answer,
    model,
  });
};
