import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useAttestations } from "@/app/hooks/use-attestation";
import { useWallet } from "@/app/hooks/use-wallet";
import type { Article } from "@/db/nuclear";
import { ArticleList } from "./article-list";

jest.mock("@/app/hooks/use-wallet", () => ({
  useWallet: jest.fn(),
}));

jest.mock("@/app/hooks/use-attestation", () => ({
  useAttestations: jest.fn(),
}));

const useWalletMock = useWallet as jest.Mock;
const useAttestationsMock = useAttestations as jest.Mock;

function mockAttestations(items: Record<string, unknown> = {}) {
  useAttestationsMock.mockReturnValue({
    items,
    attest: jest.fn(),
    loading: false,
    error: null,
    clearError: jest.fn(),
    isReady: true,
    isConnected: true,
  });
}

const mockFetch = jest.fn();

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: "article-1",
    title: "Climate sensitivity is a range",
    labels: ["Clima"],
    paragraphs: [
      { id: "p-1", text: "First paragraph.", auditItemIds: ["audit-1"] },
      { id: "p-2", text: "Second paragraph.", auditItemIds: [] },
    ],
    ...overrides,
  };
}

// Paragraphs live inside a closed <details>, so they are hidden until opened.
const paragraph = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

/** jsdom does not implement the toggle event, so dispatch a shaped one. */
function expand(details: Element) {
  fireEvent(details, Object.assign(new Event("toggle"), { newState: "open" }));
}

describe("ArticleList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWalletMock.mockReturnValue({ address: "0xabc", isConnected: true });
    mockAttestations();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ articleId: "article-1", openCount: 13 }),
    });
  });

  it("renders nothing when there are no articles", () => {
    const { container } = render(<ArticleList articles={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one collapsed card per article", () => {
    render(
      <ArticleList
        articles={[
          makeArticle({ id: "a-1", title: "First article" }),
          makeArticle({ id: "a-2", title: "Second article" }),
        ]}
      />,
    );

    expect(screen.getByText("First article")).toBeInTheDocument();
    expect(screen.getByText("Second article")).toBeInTheDocument();
    expect(document.querySelectorAll("details")).toHaveLength(2);
  });

  it("keeps each article collapsed by default", () => {
    render(<ArticleList articles={[makeArticle()]} />);
    expect(document.querySelector("details")).not.toHaveAttribute("open");
  });

  it("loads attestations for the tab's articles", () => {
    render(
      <ArticleList
        articles={[makeArticle({ id: "a-1" }), makeArticle({ id: "a-2" })]}
      />,
    );
    expect(useAttestationsMock).toHaveBeenCalledWith(["a-1", "a-2"]);
  });

  it("shows the author and a date relative to now", () => {
    render(
      <ArticleList
        articles={[makeArticle({ author: "L. Brandt", date: "2024-06-18" })]}
      />,
    );

    expect(screen.getByText("By L. Brandt")).toBeInTheDocument();
    const time = document.querySelector("time");
    expect(time).toHaveAttribute("datetime", "2024-06-18");
    // Relative label, not the absolute date.
    expect(time).toHaveTextContent(/ago$|today|yesterday|tomorrow/);
    expect(time?.textContent).not.toMatch(/2024/);
  });

  it("gives each article its own byline", () => {
    render(
      <ArticleList
        articles={[
          makeArticle({ id: "a-1", author: "A. Rossi", date: "2024-08-05" }),
          makeArticle({ id: "a-2", author: "S. Okafor", date: "2024-09-30" }),
        ]}
      />,
    );

    expect(screen.getByText("By A. Rossi")).toBeInTheDocument();
    expect(screen.getByText("By S. Okafor")).toBeInTheDocument();
  });

  it("links the author to their provenance page", () => {
    render(
      <ArticleList
        articles={[
          makeArticle({
            author: "L. Brandt",
            authorAddress: "0x1111111111111111111111111111111111111111",
          }),
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "By L. Brandt" })).toHaveAttribute(
      "href",
      "/debate/provenance?address=0x1111111111111111111111111111111111111111",
    );
  });

  it("leaves the author as plain text without an address", () => {
    render(<ArticleList articles={[makeArticle({ author: "L. Brandt" })]} />);

    expect(screen.queryByRole("link", { name: "By L. Brandt" })).toBeNull();
    expect(screen.getByText("By L. Brandt")).toBeInTheDocument();
  });

  it("omits the byline when author and date are absent", () => {
    render(<ArticleList articles={[makeArticle()]} />);

    expect(document.querySelector("time")).toBeNull();
    expect(screen.queryByText(/^By /)).toBeNull();
  });

  it("shows the stored view count", () => {
    render(<ArticleList articles={[makeArticle({ openCount: 12 })]} />);
    expect(screen.getByLabelText("12 opens")).toHaveTextContent("12");
  });

  it("omits views when there is no count", () => {
    render(<ArticleList articles={[makeArticle()]} />);
    expect(screen.queryByLabelText(/opens$/)).toBeNull();
  });

  it("embeds the YouTube player for a video article", () => {
    render(
      <ArticleList
        articles={[
          makeArticle({
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=yzmTNoiOtiY",
          }),
        ]}
      />,
    );

    const frame = document.querySelector("iframe");
    expect(frame).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/yzmTNoiOtiY",
    );
    expect(frame).toHaveAttribute("title", "Climate sensitivity is a range");
  });

  it("embeds a short youtu.be link too", () => {
    render(
      <ArticleList
        articles={[
          makeArticle({
            type: "video",
            videoUrl: "https://youtu.be/yzmTNoiOtiY?t=30",
          }),
        ]}
      />,
    );

    expect(document.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/yzmTNoiOtiY",
    );
  });

  it("falls back to a link when the video URL is not YouTube", () => {
    render(
      <ArticleList
        articles={[
          makeArticle({
            type: "video",
            videoUrl: "https://vimeo.com/123456789",
          }),
        ]}
      />,
    );

    expect(document.querySelector("iframe")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Watch the video on YouTube" }),
    ).toHaveAttribute("href", "https://vimeo.com/123456789");
  });

  it("renders no player for a text article", () => {
    render(<ArticleList articles={[makeArticle({ type: "text" })]} />);

    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.queryByRole("link", { name: /YouTube/ })).toBeNull();
  });

  it("still renders paragraphs and byline for a video article", () => {
    render(
      <ArticleList
        articles={[
          makeArticle({
            type: "video",
            author: "IPCC",
            videoUrl: "https://youtu.be/yzmTNoiOtiY",
          }),
        ]}
      />,
    );

    expect(paragraph("First paragraph.")).toBeInTheDocument();
    expect(screen.getByText("By IPCC")).toBeInTheDocument();
  });

  it("records an open when a card is expanded", async () => {
    render(<ArticleList articles={[makeArticle({ openCount: 12 })]} />);

    await act(async () => {
      expand(document.querySelector("details") as Element);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/articles/article-1/open", {
      method: "POST",
    });
  });

  it("rolls the optimistic view count back when the open fails", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    render(<ArticleList articles={[makeArticle({ openCount: 12 })]} />);

    await act(async () => {
      expand(document.querySelector("details") as Element);
    });

    expect(await screen.findByLabelText("12 opens")).toHaveTextContent("12");
  });

  it("shows the on-chain attestation count", () => {
    mockAttestations({
      "article-1": { count: 4, hasAttested: false, pending: false },
    });
    render(<ArticleList articles={[makeArticle()]} />);

    expect(screen.getByLabelText("4 attestations")).toHaveTextContent("4");
  });

  it("offers an attest action once the wallet is connected", () => {
    mockAttestations({
      "article-1": { count: 0, hasAttested: false, pending: false },
    });
    render(<ArticleList articles={[makeArticle()]} />);

    expect(
      screen.getByRole("button", { name: "Attest this article on-chain" }),
    ).toBeEnabled();
  });

  it("disables attesting once the wallet has attested", () => {
    mockAttestations({
      "article-1": { count: 1, hasAttested: true, pending: false },
    });
    render(<ArticleList articles={[makeArticle()]} />);

    expect(
      screen.getByRole("button", { name: "Attested by this wallet" }),
    ).toBeDisabled();
  });

  it("expands the card to a 90% dialog via its icon", () => {
    render(<ArticleList articles={[makeArticle()]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Expand to full screen" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute(
      "aria-label",
      "Climate sensitivity is a range",
    );
  });

  it("counts the expand as an open view", async () => {
    render(<ArticleList articles={[makeArticle({ openCount: 12 })]} />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Expand to full screen" }),
      );
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/articles/article-1/open", {
      method: "POST",
    });
    await waitFor(() =>
      expect(screen.getByLabelText("13 opens")).toHaveTextContent("13"),
    );
  });

  it("returns to the list via the close button", () => {
    render(<ArticleList articles={[makeArticle()]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Expand to full screen" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Return to list" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("returns to the list when clicking the backdrop", () => {
    render(<ArticleList articles={[makeArticle()]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Expand to full screen" }),
    );

    fireEvent.click(document.querySelector(".fixed.inset-0") as HTMLElement);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("returns to the list on Escape", () => {
    render(<ArticleList articles={[makeArticle()]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Expand to full screen" }),
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps paragraph clicks working inside the dialog", () => {
    const onParagraphClick = jest.fn();
    render(
      <ArticleList
        articles={[makeArticle()]}
        onParagraphClick={onParagraphClick}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Expand to full screen" }),
    );

    const dialog = screen.getByRole("dialog");
    const button = screen
      .getAllByRole("button", { name: "First paragraph." })
      .find((b) => dialog.contains(b));
    fireEvent.click(button as HTMLElement);

    expect(onParagraphClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "article-1" }),
      expect.objectContaining({ id: "p-1" }),
      0,
    );
  });

  it("keeps the expand button from expanding twice", () => {
    render(<ArticleList articles={[makeArticle()]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Expand to full screen" }),
    );
    // Dialog is open; the expand button is still aria-pressed true
    expect(
      screen.getByRole("button", { name: "Expand to full screen" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("reports the clicked paragraph with its index", () => {
    const onParagraphClick = jest.fn();
    render(
      <ArticleList
        articles={[makeArticle()]}
        onParagraphClick={onParagraphClick}
      />,
    );

    fireEvent.click(paragraph("Second paragraph."));

    expect(onParagraphClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "article-1" }),
      expect.objectContaining({ id: "p-2" }),
      1,
    );
  });

  it("marks the selected paragraph", () => {
    render(
      <ArticleList
        articles={[makeArticle()]}
        selected={{ articleId: "article-1", paragraphId: "p-1" }}
      />,
    );

    expect(paragraph("First paragraph.")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(paragraph("Second paragraph.")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  describe("hash deep link", () => {
    const priorHash = window.location.hash;

    afterEach(() => {
      window.location.hash = priorHash;
    });

    it("opens the card matching the URL hash", async () => {
      window.location.hash = "#article-1";
      render(<ArticleList articles={[makeArticle()]} />);

      await waitFor(() => {
        expect(document.querySelector("details")).toHaveAttribute("open");
      });
    });

    it("records an open for the hash-linked card", async () => {
      window.location.hash = "#article-1";
      render(<ArticleList articles={[makeArticle({ openCount: 12 })]} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/articles/article-1/open",
          { method: "POST" },
        );
      });
    });

    it("ignores a hash matching no article", async () => {
      window.location.hash = "#no-such-article";
      render(<ArticleList articles={[makeArticle()]} />);

      await act(async () => {});
      expect(document.querySelector("details")).not.toHaveAttribute("open");
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("opens only the matching card", async () => {
      window.location.hash = "#a-2";
      render(
        <ArticleList
          articles={[
            makeArticle({ id: "a-1", title: "First article" }),
            makeArticle({ id: "a-2", title: "Second article" }),
          ]}
        />,
      );

      await waitFor(() => {
        const cards = document.querySelectorAll("details");
        expect(cards[0]).not.toHaveAttribute("open");
        expect(cards[1]).toHaveAttribute("open");
      });
    });

    it("activates the tab holding the hash-linked card", async () => {
      window.location.hash = "#a-2";
      render(
        <div className="tabs">
          <input
            type="radio"
            name="reporting"
            className="tab"
            aria-label="First (1)"
            defaultChecked
          />
          <div className="tab-content">
            <ArticleList articles={[makeArticle({ id: "a-1" })]} />
          </div>
          <input
            type="radio"
            name="reporting"
            className="tab"
            aria-label="Second (1)"
          />
          <div className="tab-content">
            <ArticleList articles={[makeArticle({ id: "a-2" })]} />
          </div>
        </div>,
      );

      await waitFor(() => {
        const radios = screen.getAllByRole("radio");
        expect(radios[0]).not.toBeChecked();
        expect(radios[1]).toBeChecked();
      });
      const cards = document.querySelectorAll("details");
      expect(cards[1]).toHaveAttribute("open");
    });
  });
});
