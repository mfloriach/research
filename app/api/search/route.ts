import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import {
  MAX_SEARCH_QUERY_LENGTH,
  searchQuerySchema,
} from "@/lib/api-schemas";

/**
 * Log a search query
 *
 * @description Validates the `q` query parameter, truncates it to 200
 * characters, logs it, and echoes it back.
 * @tag Search
 * @query SearchQuery
 * @response SearchResponse:Logged query
 * @response 400:ErrorResponse:Invalid query
 * @openapi
 */
export const GET = withRouteLogging("api/search", async (request, _context, log) => {
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

  log.info(
    {
      event: "search.query",
      query,
      queryLength: query.length,
      truncated: rawQuery.length > MAX_SEARCH_QUERY_LENGTH,
    },
    `Search query: "${query}"`,
  );

  return NextResponse.json({ query, logged: true });
});
