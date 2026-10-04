import { render, screen } from "@testing-library/react";
import { HotTopicList } from "./hot-topic-list";
import type { ArgumentSummary } from "@/lib/api-schemas";

const items: ArgumentSummary[] = [
  {
    id: "arg-1",
    title: "Carbon border taxes",
    description: "Counterarguments and evidence.",
    labels: ["Clima", "Policy"],
    createdAt: "2026-10-01T12:00:00.000Z",
  },
  {
    id: "arg-2",
    title: "Nuclear baseload",
    description: "Costs and waste.",
    labels: ["Economy"],
    createdAt: "2026-09-20T12:00:00.000Z",
  },
];

describe("HotTopicList", () => {
  it("renders nothing without items", () => {
    const { container } = render(<HotTopicList items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title, description and labels per argument", () => {
    render(<HotTopicList items={items} />);

    expect(screen.getByText("Carbon border taxes")).toBeInTheDocument();
    expect(
      screen.getByText("Counterarguments and evidence."),
    ).toBeInTheDocument();
    expect(screen.getByText("Policy")).toBeInTheDocument();
  });

  it("links each card to its argument dossier", () => {
    render(<HotTopicList items={items} />);

    expect(
      screen.getByRole("link", { name: /Open argument Carbon border taxes/ }),
    ).toHaveAttribute("href", "/debate/argument/arg-1");
    expect(
      screen.getByRole("link", { name: /Open argument Nuclear baseload/ }),
    ).toHaveAttribute("href", "/debate/argument/arg-2");
  });

  it("shows the creation date", () => {
    render(<HotTopicList items={items} />);

    const time = screen.getAllByText("2026-10-01")[0];
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute(
      "datetime",
      "2026-10-01T12:00:00.000Z",
    );
  });
});
