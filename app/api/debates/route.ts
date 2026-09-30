import { NextResponse } from "next/server";
import { debateInputSchema, splitMarkdownParagraphs } from "@/lib/api-schemas";
import { parseJson } from "@/lib/parse_json";
import { createReport } from "@/app/server/repositories/reporting";

/**
 * Create a debate report
 *
 * @description Pins the report to IPFS, then stores it as an article with
 * embedded paragraphs under its label.
 * @tag Debates
 * @requestBody DebateInput required
 * @response 201:DebateResponse:Report stored
 * @response 400:ErrorResponse:Invalid input
 * @response 500:ErrorResponse:Storage failed
 * @openapi
 */
export const POST = async (request: Request) => {
  const parsed = await parseJson(request, debateInputSchema);

  const chunks = splitMarkdownParagraphs(parsed.description);
  if (chunks.length === 0) {
    return NextResponse.json(
      { error: "Description must not be empty" },
      { status: 400 },
    );
  }

  const { articleId, tab, paragraphIds, ipfsCid } = await createReport(
    {
      title: parsed.title,
      description: parsed.description,
      ...(parsed.label ? { label: parsed.label } : {}),
    },
    chunks,
  );

  return NextResponse.json(
    {
      articleId,
      tab: tab,
      paragraphIds,
      ipfsCid,
    },
    { status: 201 },
  );
};
