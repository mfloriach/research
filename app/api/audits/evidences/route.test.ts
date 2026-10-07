/**
 * @jest-environment node
 */
import { POST } from "./route";
import { createEvidence } from "@/app/server/repositories/evidences";

jest.mock("@/app/server/repositories/evidences", () => ({
  createEvidence: jest.fn(),
}));

const createEvidenceMock = createEvidence as jest.Mock;

const body = {
  title: "ETS coverage fell over a decade",
  content: "Covered emissions fell while the scheme ran.",
  author: "L. Brandt",
  date: "2024-10-03",
};

function post(payload: unknown) {
  return POST(
    new Request("http://localhost/api/audits/evidences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

describe("POST /api/audits/evidences", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates the item", async () => {
    createEvidenceMock.mockResolvedValue({
      itemId: "item-1",
      ipfsCid: "bafy1",
    });

    const response = await post(body);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual({ itemId: "item-1", ipfsCid: "bafy1" });
    expect(createEvidenceMock).toHaveBeenCalledWith({
      ...body,
      paragraphIds: [],
      paragraphs: ["Covered emissions fell while the scheme ran."],
    });
  });

  it("rejects invalid input with 400", async () => {
    await expect(post({ ...body, content: "  " })).rejects.toThrow();
    expect(createEvidenceMock).not.toHaveBeenCalled();
  });
});
