import { act, renderHook, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHotTopics } from "./use-hot-topics";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const useRouterMock = useRouter as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;

const replace = jest.fn();

const payload = {
  arguments: [
    {
      id: "arg-1",
      title: "Carbon border taxes",
      description: "Counterarguments and evidence.",
      labels: ["Clima"],
      createdAt: "2026-10-01T00:00:00.000Z",
    },
  ],
  total: 1,
};

function setup(query = "") {
  useSearchParamsMock.mockReturnValue(new URLSearchParams(query));
  useRouterMock.mockReturnValue({ replace });
  return renderHook(() => useHotTopics());
}

describe("useHotTopics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    }) as unknown as typeof fetch;
  });

  it("fetches unfiltered arguments by default", async () => {
    const { result } = setup();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith("/api/arguments");
    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(1);
    expect(result.current.labels).toEqual(["Clima"]);
    expect(result.current.error).toBeNull();
  });

  it("encodes the URL filter into the request", async () => {
    const { result } = setup("labels=Clima&sort=oldest");

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/arguments?labels=Clima&sort=oldest",
    );
    expect(result.current.filter).toEqual({
      labels: ["Clima"],
      sort: "oldest",
    });
  });

  it("syncs filter changes to the root URL without stacking history", async () => {
    const { result } = setup();

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleFilterChange({ labels: ["Clima"], sort: "newest" });
    });

    expect(replace).toHaveBeenCalledWith("/?labels=Clima", { scroll: false });
  });

  it("reports fetch failures", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = setup();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe("Could not load hot topics. Try again.");
  });
});
