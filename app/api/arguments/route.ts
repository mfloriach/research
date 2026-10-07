import { NextResponse } from "next/server";
import { BadRequestError } from "@/lib/errors";
import { argumentQuerySchema, type HotTopicsSort } from "@/lib/api-schemas";
import { listArguments } from "@/app/server/repositories/arguments";
import { z } from "zod";
import { parseJson } from "@/lib/parse_json";

export const searchSchema = z.object({
  labels: z
    .string({ error: "Labels must be a string" })
    .trim()
    .min(3, {
      error: `Labels must be between 3 characters`,
    })
    .optional(),
  sort: z
    .string({ error: "Sort must be a string" })
    .trim()
    .min(1, { error: "Sort must not be empty" })
    .optional(),
});

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
  const { searchParams } = new URL(request.url);

  const parsed = argumentQuerySchema.safeParse({
    labels: searchParams.get("labels") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });
  if (!parsed.success) {
    throw new BadRequestError(
      parsed.error.issues[0]?.message ?? "Invalid query",
    );
  }

  const labels = (parsed.data.labels ?? "")
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label !== "");

  const sort: HotTopicsSort = parsed.data.sort ?? "newest";

  const items = await listArguments({ labels, sort });

  return NextResponse.json({ arguments: items, total: items.length });
};
