import { NextResponse } from "next/server";
import { incrementArticleOpenCount } from "@/app/server/repositories/reporting";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Record an article open
 *
 * @description Increments the open count for a reporting article.
 * @tag Articles
 * @path ArticlePathParams
 * @response ArticleOpenResponse:Open count incremented
 * @response 404:ErrorResponse:Article not found
 * @response 500:ErrorResponse:Update failed
 * @openapi
 */
export const POST = async (request: Request, { params }: Props) => {
  const { id: articleId } = await params;

  const openCount = await incrementArticleOpenCount(articleId);

  return NextResponse.json({ articleId, openCount });
};