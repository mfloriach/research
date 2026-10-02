import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@/app/hooks/use-wallet";
import { useProvenance } from "@/app/hooks/use-provenance";
import ProvenancePage from "./page";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));
jest.mock("@/app/hooks/use-wallet", () => ({
  useWallet: jest.fn(),
}));
jest.mock("@/app/hooks/use-provenance", () => ({
  useProvenance: jest.fn(),
}));

const mockFetch = jest.fn();

const content = {
  argument: { title: "Argument", description: "Description", labels: ["Clima"] },
  reportingCard: {
    title: "Reporting",
    tabs: [
      {
        id: "tab-clima",
        label: "Clima",
        items: [
          {
            id: "article-1",
            title: "Article One",
            labels: ["Clima", "Science"],
            paragraphs: [
              { id: "p1", text: "a", auditItemIds: ["evidence-1", "source-1"] },
            ],
          },
        ],
      },
    ],
  },
  auditCard: {
    title: "Argument audit",
    tabs: [
      {
        id: "tab-evidences",
        label: "Evidences",
        items: [
          {
            id: "evidence-1",
            title: "Evidence One",
            paragraphs: ["Evidence paragraph one is longer than twenty"],
            date: "2025-01-10",
          },
        ],
      },
      {
        id: "tab-sources",
        label: "Sources",
        items: [
          {
            id: "source-1",
            title: "Source One",
            paragraphs: ["Source text"],
            date: "2024-05-01",
          },
        ],
      },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  (useSearchParams as jest.Mock).mockReturnValue({ get: () => null });
  (useWallet as jest.Mock).mockReturnValue({
    address: "0xabc",
    isConnected: false,
  });
  (useProvenance as jest.Mock).mockReturnValue({
    entries: [],
    loading: false,
    error: null,
  });
  mockFetch.mockResolvedValue({ ok: true, json: async () => content });
  global.fetch = mockFetch as unknown as typeof fetch;
});

describe("ProvenancePage", () => {
  it("shows article names with copy buttons instead of raw IDs", async () => {
    render(<ProvenancePage />);

    expect(await screen.findAllByText("Article One")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Copy article ID" }),
    ).toBeInTheDocument();
  });

  it("summarizes the audit-type mix per article", async () => {
    render(<ProvenancePage />);

    expect(await screen.findByText("Dossier summary")).toBeInTheDocument();
    expect(screen.getByText("2 linked items")).toBeInTheDocument();
    expect(screen.getAllByText("Evidences").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sources").length).toBeGreaterThan(0);
  });

  it("renders one date-ordered table row per linked audit item", async () => {
    render(<ProvenancePage />);

    const section = await screen.findByRole("region", {
      name: "Articles and audit items",
    });
    expect(
      within(section).getByRole("columnheader", { name: "Audit paragraph" }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("columnheader", { name: "Date" }),
    ).toBeInTheDocument();

    const rows = within(section).getAllByRole("row");
    expect(rows).toHaveLength(3);

    const firstCells = within(rows[1] as HTMLElement).getAllByRole("cell");
    expect(firstCells[1]).toHaveTextContent("Source text");
    expect(firstCells[2]).toHaveTextContent("2024-05-01");

    expect(
      within(section).getByTitle("Evidence paragraph one is longer than twenty"),
    ).toHaveTextContent("Evidence paragraph o…");
    expect(
      screen.getByRole("button", { name: "Copy Evidences item ID" }),
    ).toBeInTheDocument();
  });

  it("prefills the wallet from the ?address= deep link", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) =>
        key === "address" ? "0x0000000000000000000000000000000000000009" : null,
    });
    (useProvenance as jest.Mock).mockReturnValue({
      entries: [],
      loading: false,
      error: null,
    });

    render(<ProvenancePage />);

    expect(screen.getByPlaceholderText("0x…")).toHaveValue(
      "0x0000000000000000000000000000000000000009",
    );
    expect(useProvenance).toHaveBeenCalledWith(
      "0x0000000000000000000000000000000000000009",
    );
  });

  it("resolves on-chain entries to names in the table", async () => {
    const user = userEvent.setup();
    (useProvenance as jest.Mock).mockReturnValue({
      entries: [
        {
          kind: "signature",
          itemId: "evidence-1",
          contentHash: "0xhash",
          attester: "0xabc",
          txHash: "0xtx",
          blockNumber: BigInt(1),
          logIndex: 0,
          timestamp: null,
        },
      ],
      loading: false,
      error: null,
    });
    render(<ProvenancePage />);

    await user.type(
      screen.getByPlaceholderText("0x…"),
      "0x0000000000000000000000000000000000000001",
    );
    await user.click(screen.getByRole("button", { name: "Show provenance" }));

    await waitFor(() => {
      expect(screen.getAllByText("Evidence One").length).toBeGreaterThan(0);
    });
    expect(
      screen.getByRole("button", { name: "Copy item ID" }),
    ).toBeInTheDocument();
  });
});
