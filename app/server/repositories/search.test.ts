/**
 * @jest-environment node
 */
import { searchArticlesByText } from "./search";
import { getDb } from "@/lib/mongodb";
import { embedText } from "@/lib/embeddings";

jest.mock("@/lib/mongodb", () => ({
  getDb: jest.fn(),
}));

jest.mock("@/lib/embeddings", () => ({
  embedText: jest.fn(),
}));

const getDbMock = getDb as jest.Mock;
const embedTextMock = embedText as jest.Mock;

describe("searchArticlesByText", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    embedTextMock.mockResolvedValue([0.1, 0.2]);
  });

  function mockDb(hits: unknown[], articles: unknown[]) {
    getDbMock.mockResolvedValue({
      collection: (name: string) => {
        if (name === "article_embeddings") {
          return { aggregate: jest.fn().mockReturnValue({ toArray: async () => hits }) };
        }
        return {
          find: jest.fn().mockReturnValue({
            project: jest.fn().mockReturnValue({ toArray: async () => articles }),
          }),
        };
      },
    });
  }

  it("attaches article titles in rank order", async () => {
    mockDb(
      [
        { articleId: "b", score: 0.9 },
        { articleId: "a", score: 0.7 },
      ],
      [
        { _id: "a", argumentId: "arg-1", title: "Alpha", openCount: 12 },
        { _id: "b", argumentId: "arg-1", title: "Beta", openCount: 34 },
      ],
    );

    const { matches, top } = await searchArticlesByText("climate");

    expect(top).toBe(0.9);
    expect(matches).toEqual([
      {
        articleId: "b",
        argumentId: "arg-1",
        title: "Beta",
        openCount: 34,
        score: 0.9,
      },
      {
        articleId: "a",
        argumentId: "arg-1",
        title: "Alpha",
        openCount: 12,
        score: 0.7,
      },
    ]);
  });

  it("falls back to the id when the article is gone", async () => {
    mockDb([{ articleId: "missing", score: 0.5 }], []);

    const { matches } = await searchArticlesByText("climate");

    expect(matches).toEqual([
      {
        articleId: "missing",
        argumentId: "",
        title: "missing",
        openCount: 0,
        score: 0.5,
      },
    ]);
  });

  it("returns empty matches without touching articles", async () => {
    const find = jest.fn();
    getDbMock.mockResolvedValue({
      collection: (name: string) =>
        name === "article_embeddings"
          ? { aggregate: jest.fn().mockReturnValue({ toArray: async () => [] }) }
          : { find },
    });

    const result = await searchArticlesByText("climate");

    expect(result).toEqual({ matches: [], top: 0 });
    expect(find).not.toHaveBeenCalled();
  });
});
