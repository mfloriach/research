import { NextResponse } from "next/server";
import { argumentQuerySchema, type HotTopicsSort } from "@/lib/api-schemas";
import { listArguments } from "@/app/server/repositories/arguments";
import { parseQueryParams } from "@/lib/parse_json";

/**
 * List hot-topic arguments
 *
 * @description Lists arguments (title, description, labels, creation date)
 * for the hot-topics page. Labels combine with OR; sorting is by creation
 * date via a newest/oldest dropdown.
 * @tag Arguments
 * @query ArgumentQuery
 * @response ArgumentsResponse:Matching arguments
 * @response 400:ErrorResponse:Invalid query
 * @response 500:ErrorResponse:Listing failed
 * @openapi
 */
export const GET = async (request: Request) => {
  const parsed = parseQueryParams(request, argumentQuerySchema);

  const labels = (parsed.labels ?? "")
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label !== "");

  const sort: HotTopicsSort = parsed.sort ?? "newest";

  const items = await listArguments({ labels, sort });

  return NextResponse.json({ arguments: items, total: items.length });
};
