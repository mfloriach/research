/**
 * @jest-environment node
 */
import { POST } from "./route";
import { createSource } from "@/app/server/repositories/sources";

jest.mock("@/app/server/repositories/sources", () => ({
  createSource: jest.fn(),
}));

const createSourceMock = createSource as jest.Mock;

const body = {
  title: "CBAM impact assessment 2021-2023",
  content: "Primary source for scope and phase-in schedule.",
  author: "European Commission",
  date: "2023-05-10",
};

function post(payload: unknown) {
  return POST(
    new Request("http://localhost/api/audits/sources", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

describe("POST /api/audits/sources", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates the item", async () => {
    createSourceMock.mockResolvedValue({
      itemId: "item-1",
      ipfsCid: "bafy1",
    });

    const response = await post(body);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual({ itemId: "item-1", ipfsCid: "bafy1" });
    expect(createSourceMock).toHaveBeenCalledWith({
      ...body,
      paragraphIds: [],
      paragraphs: ["Primary source for scope and phase-in schedule."],
    });
  });

  it("rejects invalid input with 400", async () => {
    await expect(post({ ...body, title: "ab" })).rejects.toThrow();
    expect(createSourceMock).not.toHaveBeenCalled();
  });
});
