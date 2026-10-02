import { fireEvent, render, screen } from "@testing-library/react";
import type { Article } from "@/db/content";
import { ArticleList } from "./article-list";

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

// Cards render closed, so their paragraphs are hidden until expanded.
const paragraph = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

describe("ArticleList", () => {
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

  it("shows the author and date on the card", () => {
    render(
      <ArticleList
        articles={[makeArticle({ author: "L. Brandt", date: "2024-06-18" })]}
      />,
    );

    expect(screen.getByText("By L. Brandt")).toBeInTheDocument();
    expect(document.querySelector("time")).toHaveAttribute(
      "datetime",
      "2024-06-18",
    );
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

  it("omits the byline when author and date are absent", () => {
    render(<ArticleList articles={[makeArticle()]} />);

    expect(document.querySelector("time")).toBeNull();
    expect(screen.queryByText(/^By /)).toBeNull();
  });

  it("reports the clicked paragraph with its index", () => {
    const onParagraphClick = jest.fn();
    render(
      <ArticleList articles={[makeArticle()]} onParagraphClick={onParagraphClick} />,
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
});