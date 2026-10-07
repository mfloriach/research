/**
 * @jest-environment node
 */
import { POST } from "./route";
import { createContraargument } from "@/app/server/repositories/contraarguments";

jest.mock("@/app/server/repositories/contraarguments", () => ({
  createContraargument: jest.fn(),
}));

const createContraargumentMock = createContraargument as jest.Mock;

const body = {
  title: "Relocation concern",
  content: "Production may move abroad.",
  author: "H. Müller",
  date: "2024-09-12",
};

function post(payload: unknown) {
  return POST(
    new Request("http://localhost/api/audits/contraarguments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

describe("POST /api/audits/contraarguments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates the item", async () => {
    createContraargumentMock.mockResolvedValue({
      itemId: "item-1",
      ipfsCid: "bafy1",
    });

    const response = await post(body);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual({ itemId: "item-1", ipfsCid: "bafy1" });
    expect(createContraargumentMock).toHaveBeenCalledWith({
      ...body,
      paragraphIds: [],
      paragraphs: ["Production may move abroad."],
    });
  });

  it("rejects invalid input with 400", async () => {
    await expect(post({ ...body, title: "ab" })).rejects.toThrow();
    expect(createContraargumentMock).not.toHaveBeenCalled();
  });
});
