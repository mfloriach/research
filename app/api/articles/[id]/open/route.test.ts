/**
 * @jest-environment node
 */
import { POST } from "./route";
import { incrementArticleOpenCount } from "@/app/server/repositories/reporting";
import { NotFoundError } from "@/lib/errors";

jest.mock("@/app/server/repositories/reporting", () => ({
  incrementArticleOpenCount: jest.fn(),
}));

const incrementArticleOpenCountMock =
  incrementArticleOpenCount as jest.Mock;

function post(id: string) {
  return POST(new Request(`http://localhost/api/articles/${id}/open`), {
    params: Promise.resolve({ id }),
  });
}

describe("POST /api/articles/[id]/open", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("increments the open count and returns it", async () => {
    incrementArticleOpenCountMock.mockResolvedValue(13);

    const response = await post("article-1");

    expect(incrementArticleOpenCountMock).toHaveBeenCalledWith("article-1");
    await expect(response.json()).resolves.toEqual({
      articleId: "article-1",
      openCount: 13,
    });
  });

  it("propagates a missing article to the error handler", async () => {
    incrementArticleOpenCountMock.mockRejectedValue(
      new NotFoundError("No article with id article-1"),
    );

    await expect(post("article-1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("propagates repository failures to the error handler", async () => {
    incrementArticleOpenCountMock.mockRejectedValue(new Error("db down"));

    await expect(post("article-1")).rejects.toThrow("db down");
  });
});