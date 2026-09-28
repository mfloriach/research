import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";

const MAX_QUERY_LENGTH = 200;

export const GET = withRouteLogging("api/search", async (request, log) => {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  const query = rawQuery.slice(0, MAX_QUERY_LENGTH);

  log.info(
    {
      event: "search.query",
      query,
      queryLength: query.length,
      truncated: rawQuery.length > MAX_QUERY_LENGTH,
    },
    `Search query: "${query}"`,
  );

  return NextResponse.json({ query, logged: true });
});
