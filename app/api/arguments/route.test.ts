/**
 * @jest-environment node
 */
import { GET } from "./route";
import { listArguments } from "@/app/server/repositories/arguments";

jest.mock("@/app/server/repositories/arguments", () => ({
  listArguments: jest.fn(),
}));

const listArgumentsMock = listArguments as jest.Mock;

const items = [
  {
    id: "arg-1",
    title: "Carbon border taxes",
    description: "Counterarguments and evidence.",
    labels: ["Clima"],
    createdAt: "2026-10-01T00:00:00.000Z",
  },
];

describe("GET /api/arguments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists arguments with defaults", async () => {
    listArgumentsMock.mockResolvedValue(items);

    const response = await GET(new Request("http://localhost/api/arguments"));
    const body = await response.json();

    expect(listArgumentsMock).toHaveBeenCalledWith({
      labels: [],
      sort: "newest",
    });
    expect(body).toEqual({ arguments: items, total: 1 });
  });

  it("forwards labels and sort", async () => {
    listArgumentsMock.mockResolvedValue(items);

    const response = await GET(
      new Request("http://localhost/api/arguments?labels=Clima,Policy&sort=oldest"),
    );

    expect(listArgumentsMock).toHaveBeenCalledWith({
      labels: ["Clima", "Policy"],
      sort: "oldest",
    });
    expect(response.status).toBe(200);
  });

  it("rejects an invalid sort with 400", async () => {
    await expect(
      GET(new Request("http://localhost/api/arguments?sort=random")),
    ).rejects.toThrow();
    expect(listArgumentsMock).not.toHaveBeenCalled();
  });

  it("propagates repository failures to the error handler", async () => {
    listArgumentsMock.mockRejectedValue(new Error("db down"));

    await expect(
      GET(new Request("http://localhost/api/arguments")),
    ).rejects.toThrow("db down");
  });
});
