/**
 * @jest-environment node
 */
import { GET } from "./route";
import { searchArticlesByText } from "@/app/server/repositories/search";
import { getLlmProvider } from "@/app/server/services/llm/factory";

jest.mock("@/app/server/repositories/search", () => ({
  searchArticlesByText: jest.fn(),
}));

jest.mock("@/app/server/services/llm/factory", () => ({
  getLlmProvider: jest.fn(),
}));

const searchArticlesByTextMock = searchArticlesByText as jest.Mock;
const getLlmProviderMock = getLlmProvider as jest.Mock;

describe("GET /api/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns atlas matches and the LLM answer", async () => {
    const matches = [{ articleId: "article-1", score: 0.85 }];
    searchArticlesByTextMock.mockResolvedValue({ matches, top: 0.85 });
    getLlmProviderMock.mockReturnValue({
      generateAnswer: jest.fn().mockResolvedValue({
        answer: "OpenAI answer",
        model: "gpt-4o-mini",
      }),
    });

    const response = await GET(
      new Request("http://localhost/api/search?q=climate"),
    );
    const body = await response.json();

    expect(searchArticlesByTextMock).toHaveBeenCalledWith("climate");
    expect(getLlmProviderMock).toHaveBeenCalled();
    expect(
      getLlmProviderMock().generateAnswer,
    ).toHaveBeenCalledWith({ query: "climate" });
    expect(console.log).toHaveBeenCalledWith(matches);
    expect(body).toEqual({
      query: "climate",
      match: true,
      score: 0.85,
      matches,
      answer: "OpenAI answer",
      model: "gpt-4o-mini",
    });
  });

  it("maps repository failures to a 500 error response", async () => {
    searchArticlesByTextMock.mockRejectedValue(new Error("db down"));

    const response = await GET(
      new Request("http://localhost/api/search?q=climate"),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Internal server error",
    });
  });
});
