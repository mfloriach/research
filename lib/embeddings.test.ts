import { cosineSimilarity, isMatch, MATCH_THRESHOLD } from "@/lib/embeddings";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("returns 0 for mismatched or empty vectors", () => {
    expect(cosineSimilarity([1, 0], [1, 0, 0])).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
  });
});

describe("isMatch", () => {
  it(`matches at or above ${MATCH_THRESHOLD}`, () => {
    expect(isMatch(0.7)).toBe(true);
    expect(isMatch(0.95)).toBe(true);
  });

  it("rejects below threshold and non-finite scores", () => {
    expect(isMatch(0.6999)).toBe(false);
    expect(isMatch(0)).toBe(false);
    expect(isMatch(Number.NaN)).toBe(false);
  });
});
