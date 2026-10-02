import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/app/hooks/use-wallet";
import type { Article } from "@/db/content";
import Home from "./page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("@/app/hooks/use-wallet", () => ({
  useWallet: jest.fn(),
}));
// viem needs TextEncoder, which jsdom does not provide; the hook is mocked
// the same way the debate create-page suites mock the signing hook.
jest.mock("@/app/hooks/use-attestation", () => ({
  useAttestations: jest.fn(() => ({
    items: {},
    attest: jest.fn(),
    loading: false,
    error: null,
    clearError: jest.fn(),
    isReady: false,
    isConnected: false,
  })),
}));

const useRouterMock = useRouter as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;

const replace = jest.fn();

function article(overrides: Partial<Article> = {}): Article {
  return {
    id: "a-1",
    title: "Climate sensitivity is a range",
    labels: ["Clima", "Science"],
    date: "2024-06-18",
    openCount: 12,
    paragraphs: [
      { id: "p-1", text: "First paragraph.", auditItemIds: ["audit-1"] },
    ],
    ...overrides,
  };
}

const content = {
  argument: { title: "Carbon border taxes", description: "d", labels: ["Clima"] },
  reportingCard: {
    title: "Reporting",
    tabs: [
      {
        id: "Clima",
        label: "Clima",
        items: [
          article(),
          article({
            id: "a-2",
            title: "The IPCC video",
            date: "2021-06-30",
            type: "video",
            videoUrl: "https://youtu.be/yzmTNoiOtiY",
          }),
        ],
      },
      {
        id: "Policy",
        label: "Policy",
        items: [
          article({
            id: "a-3",
            title: "Border adjustments live or die on calibration",
            labels: ["Policy"],
            date: "2024-09-30",
          }),
        ],
      },
    ],
  },
  auditCard: { title: "Argument audit", tabs: [] },
};

function setParams(query: string) {
  const params = new URLSearchParams(query);
  useSearchParamsMock.mockReturnValue(params);
}

/** Card titles in document order; the title is the first span in the summary. */
function cardTitles(): (string | null | undefined)[] {
  return [...document.querySelectorAll("details")].map(
    (card) => card.querySelector("summary span")?.textContent,
  );
}

describe("Home reporting filters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouterMock.mockReturnValue({ replace, push: jest.fn() });
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    (useWallet as jest.Mock).mockReturnValue({ address: null, isConnected: false });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => content,
    }) as unknown as typeof fetch;
  });

  it("lists every label reachable from the content", async () => {
    render(<Home />);
    expect(await screen.findByText("The IPCC video")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Science" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Policy" })).toBeInTheDocument();
  });

  it("omits labels no content uses", async () => {
    render(<Home />);
    await screen.findByText("The IPCC video");
    // "Trade" is in ARGUMENT_LABELS but no article carries it.
    expect(screen.queryByRole("button", { name: "Trade" })).toBeNull();
  });

  it("shows tab labels with article counts", async () => {
    render(<Home />);
    await screen.findByText("The IPCC video");
    expect(screen.getByRole("radio", { name: "Clima (2)" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Policy (1)" })).toBeInTheDocument();
  });

  it("filters to videos and drops emptied tabs", async () => {
    setParams("type=video");
    render(<Home />);

    await screen.findByText("The IPCC video");
    expect(
      screen.queryByText("Climate sensitivity is a range"),
    ).toBeNull();
    expect(screen.queryByRole("radio", { name: "Policy (1)" })).toBeNull();
  });

  it("filters across tabs by label", async () => {
    setParams("labels=Science");
    render(<Home />);

    await screen.findByText("The IPCC video");
    expect(
      screen.getByRole("radio", { name: "Clima (2)" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Policy (1)" })).toBeNull();
  });

  it("keeps editorial order by default", async () => {
    render(<Home />);
    await screen.findByText("The IPCC video");
    expect(cardTitles()).toEqual([
      "Climate sensitivity is a range",
      "The IPCC video",
      "Border adjustments live or die on calibration",
    ]);
  });

  it("sorts within a tab by date", async () => {
    setParams("sort=oldest");
    render(<Home />);
    await screen.findByText("The IPCC video");
    // The 2021 video moves ahead of the 2024 article; tabs keep their order.
    expect(cardTitles()).toEqual([
      "The IPCC video",
      "Climate sensitivity is a range",
      "Border adjustments live or die on calibration",
    ]);
  });

  it("shows an empty state when nothing matches", async () => {
    setParams("labels=Trade");
    render(<Home />);

    expect(
      await screen.findByText(/No articles match these filters/),
    ).toBeInTheDocument();
    expect(screen.queryByText("The IPCC video")).toBeNull();
  });

  it("ignores unrecognised filter params instead of hiding everything", async () => {
    setParams("type=bogus&sort=random&labels=Clima,Policy");
    render(<Home />);

    expect(await screen.findByText("The IPCC video")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Clima (2)" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clima" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("writes the filter to the URL without stacking history", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await screen.findByText("The IPCC video");

    await user.click(screen.getByRole("button", { name: "Science" }));

    expect(replace).toHaveBeenCalledWith("/?labels=Science", {
      scroll: false,
    });
  });

  it("clears the URL query when filters are cleared", async () => {
    const user = userEvent.setup();
    setParams("type=video");
    render(<Home />);
    await screen.findByText("The IPCC video");

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(replace).toHaveBeenCalledWith("/", { scroll: false });
  });
});