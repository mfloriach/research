import { render, screen } from "@testing-library/react";
import type { ArticleView } from "@/app/hooks/use-content-index";
import { ProvenanceSummary } from "./provenance-summary";

function makeArticle(overrides: Partial<ArticleView> = {}): ArticleView {
  return {
    id: "article-1",
    title: "Test article",
    labels: ["label"],
    total: 4,
    counts: [
      { tab: "Evidences", count: 3, percent: 75 },
      { tab: "Sources", count: 1, percent: 25 },
    ],
    rows: [],
    ...overrides,
  };
}

describe("ProvenanceSummary", () => {
  it("renders nothing when there are no articles", () => {
    const { container } = render(<ProvenanceSummary articles={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one labeled bar line per audit kind", () => {
    render(<ProvenanceSummary articles={[makeArticle()]} />);

    expect(screen.getByText("Evidences")).toBeInTheDocument();
    expect(screen.getByText("Sources")).toBeInTheDocument();
    expect(screen.getByText("3 · 75%")).toBeInTheDocument();
    expect(screen.getByText("1 · 25%")).toBeInTheDocument();
  });

  it("sizes each bar by its percent", () => {
    render(<ProvenanceSummary articles={[makeArticle()]} />);

    expect(screen.getByTitle("Evidences: 3 (75%)")).toHaveStyle({
      width: "75%",
    });
    expect(screen.getByTitle("Sources: 1 (25%)")).toHaveStyle({
      width: "25%",
    });
  });

  it("shows an empty state for articles without linked items", () => {
    render(
      <ProvenanceSummary
        articles={[makeArticle({ total: 0, counts: [] })]}
      />,
    );

    expect(screen.getByText("No linked audit items.")).toBeInTheDocument();
  });
});
