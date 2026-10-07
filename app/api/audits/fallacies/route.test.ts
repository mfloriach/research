/**
 * @jest-environment node
 */
import { POST } from "./route";
import { createFallacy } from "@/app/server/repositories/fallacies";

jest.mock("@/app/server/repositories/fallacies", () => ({
  createFallacy: jest.fn(),
}));

const createFallacyMock = createFallacy as jest.Mock;

const body = {
  title: "Appeal to consequence",
  content: "Cost objections are treated as refutations.",
  author: "J. Kim",
  date: "2025-02-14",
};

function post(payload: unknown) {
  return POST(
    new Request("http://localhost/api/audits/fallacies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

describe("POST /api/audits/fallacies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates the item", async () => {
    createFallacyMock.mockResolvedValue({
      itemId: "item-1",
      ipfsCid: "bafy1",
    });

    const response = await post(body);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual({ itemId: "item-1", ipfsCid: "bafy1" });
    expect(createFallacyMock).toHaveBeenCalledWith({
      ...body,
      paragraphIds: [],
      paragraphs: ["Cost objections are treated as refutations."],
    });
  });

  it("rejects invalid input with 400", async () => {
    await expect(post({ ...body, date: "yesterday" })).rejects.toThrow();
    expect(createFallacyMock).not.toHaveBeenCalled();
  });
});
