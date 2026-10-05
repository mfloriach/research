/**
 * @jest-environment node
 */
import { GET } from "./route";
import { searchArticlesByText } from "@/app/server/repositories/search";

jest.mock("@/app/server/repositories/search", () => ({
  searchArticlesByText: jest.fn(),
}));

const searchArticlesByTextMock = searchArticlesByText as jest.Mock;

describe("GET /api/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns atlas matches with article titles", async () => {
    const matches = [
      {
        articleId: "article-1",
        title: "Climate sensitivity",
        openCount: 12,
        score: 0.85,
      },
    ];
    searchArticlesByTextMock.mockResolvedValue({ matches, top: 0.85 });

    const response = await GET(
      new Request("http://localhost/api/search?q=climate"),
    );
    const body = await response.json();

    expect(searchArticlesByTextMock).toHaveBeenCalledWith("climate");
    expect(body).toEqual({
      query: "climate",
      match: true,
      score: 0.85,
      matches,
    });
  });

  it("propagates repository failures to the error handler", async () => {
    searchArticlesByTextMock.mockRejectedValue(new Error("db down"));

    await expect(
      GET(new Request("http://localhost/api/search?q=climate")),
    ).rejects.toThrow("db down");
  });
});
