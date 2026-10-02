import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DEFAULT_ARTICLE_FILTER, type ArticleFilter } from "@/lib/content-filter";
import { ReportingFilters } from "./reporting-filters";

const labels = ["Clima", "Economy", "Science"];

function filter(overrides: Partial<ArticleFilter> = {}): ArticleFilter {
  return { ...DEFAULT_ARTICLE_FILTER, ...overrides };
}

function setup(overrides: Partial<ArticleFilter> = {}) {
  const onChange = jest.fn();
  render(
    <ReportingFilters filter={filter(overrides)} labels={labels} onChange={onChange} />,
  );
  return onChange;
}

describe("ReportingFilters", () => {
  it("renders the format options", () => {
    setup();
    const select = screen.getByLabelText("Format") as HTMLSelectElement;
    expect(
      [...select.options].map((option) => option.value),
    ).toEqual(["all", "text", "video"]);
  });

  it("renders the date options", () => {
    setup();
    const select = screen.getByLabelText("Date") as HTMLSelectElement;
    expect([...select.options].map((option) => option.value)).toEqual([
      "default",
      "newest",
      "oldest",
    ]);
  });

  it("reflects the current filter", () => {
    setup({ type: "video", sort: "newest" });
    expect(screen.getByLabelText("Format")).toHaveValue("video");
    expect(screen.getByLabelText("Date")).toHaveValue("newest");
  });

  it("emits the new format, keeping other facets", async () => {
    const user = userEvent.setup();
    const onChange = setup({ labels: ["Clima"], sort: "newest" });

    await user.selectOptions(screen.getByLabelText("Format"), "video");

    expect(onChange).toHaveBeenCalledWith({
      type: "video",
      labels: ["Clima"],
      sort: "newest",
    });
  });

  it("emits the new date order, keeping other facets", async () => {
    const user = userEvent.setup();
    const onChange = setup({ type: "text" });

    await user.selectOptions(screen.getByLabelText("Date"), "oldest");

    expect(onChange).toHaveBeenCalledWith({
      type: "text",
      labels: [],
      sort: "oldest",
    });
  });

  it("renders a toggle per label", () => {
    setup();
    for (const label of labels) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("marks selected labels as pressed", () => {
    setup({ labels: ["Science"] });
    expect(screen.getByRole("button", { name: "Science" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Clima" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("adds a label when toggled on", async () => {
    const user = userEvent.setup();
    const onChange = setup({ type: "video" });

    await user.click(screen.getByRole("button", { name: "Economy" }));

    expect(onChange).toHaveBeenCalledWith({
      type: "video",
      labels: ["Economy"],
      sort: "default",
    });
  });

  it("removes a label when toggled off", async () => {
    const user = userEvent.setup();
    const onChange = setup({ labels: ["Clima", "Science"] });

    await user.click(screen.getByRole("button", { name: "Clima" }));

    expect(onChange).toHaveBeenCalledWith({
      type: "all",
      labels: ["Science"],
      sort: "default",
    });
  });

  it("hides the clear control until something is active", async () => {
    const user = userEvent.setup();
    // Controlled: the wrapper feeds the change back, as the page does.
    function Harness() {
      const [state, setState] = useState<ArticleFilter>(DEFAULT_ARTICLE_FILTER);
      return (
        <ReportingFilters
          filter={state}
          labels={labels}
          onChange={setState}
        />
      );
    }
    render(<Harness />);

    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();

    await user.selectOptions(screen.getByLabelText("Format"), "text");

    expect(
      screen.getByRole("button", { name: "Clear filters" }),
    ).toBeInTheDocument();
  });

  it("resets every facet on clear", async () => {
    const user = userEvent.setup();
    const onChange = setup({ type: "video", labels: ["Clima"], sort: "newest" });

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onChange).toHaveBeenCalledWith(DEFAULT_ARTICLE_FILTER);
  });

  it("omits the label group when there are no labels", () => {
    const onChange = jest.fn();
    render(
      <ReportingFilters
        filter={DEFAULT_ARTICLE_FILTER}
        labels={[]}
        onChange={onChange}
      />,
    );
    expect(screen.queryByText("Labels")).toBeNull();
  });
});