/**
 * @jest-environment node
 */
import { POST } from "./route";
import { createInterpretation } from "@/app/server/repositories/interpretations";

jest.mock("@/app/server/repositories/interpretations", () => ({
  createInterpretation: jest.fn(),
}));

const createInterpretationMock = createInterpretation as jest.Mock;

const body = {
  title: "Read as a pricing instrument",
  content: "The border measure prices carbon at the frontier.",
  author: "E. Duarte",
  date: "2025-03-05",
};

function post(payload: unknown) {
  return POST(
    new Request("http://localhost/api/audits/interpretations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

describe("POST /api/audits/interpretations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates the item", async () => {
    createInterpretationMock.mockResolvedValue({
      itemId: "item-1",
      ipfsCid: "bafy1",
    });

    const response = await post(body);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual({ itemId: "item-1", ipfsCid: "bafy1" });
    expect(createInterpretationMock).toHaveBeenCalledWith({
      ...body,
      paragraphIds: [],
      paragraphs: ["The border measure prices carbon at the frontier."],
    });
  });

  it("rejects invalid input with 400", async () => {
    await expect(post({ ...body, date: "tomorrow" })).rejects.toThrow();
    expect(createInterpretationMock).not.toHaveBeenCalled();
  });
});
