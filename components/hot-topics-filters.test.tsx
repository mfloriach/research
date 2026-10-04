import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  DEFAULT_HOT_TOPICS_FILTER,
  type HotTopicsFilter,
} from "@/lib/hot-topics-filter";
import { HotTopicsFilters } from "./hot-topics-filters";

const labels = ["Clima", "Economy", "Policy"];

function filter(overrides: Partial<HotTopicsFilter> = {}): HotTopicsFilter {
  return { ...DEFAULT_HOT_TOPICS_FILTER, ...overrides };
}

function setup(overrides: Partial<HotTopicsFilter> = {}) {
  const onChange = jest.fn();
  render(
    <HotTopicsFilters
      filter={filter(overrides)}
      labels={labels}
      onChange={onChange}
    />,
  );
  return onChange;
}

describe("HotTopicsFilters", () => {
  it("renders the creation-date options", () => {
    setup();
    const select = screen.getByLabelText("Date") as HTMLSelectElement;
    expect([...select.options].map((option) => option.value)).toEqual([
      "newest",
      "oldest",
    ]);
  });

  it("reflects the current filter", () => {
    setup({ labels: ["Clima"], sort: "oldest" });
    expect(screen.getByLabelText("Date")).toHaveValue("oldest");
    expect(screen.getByRole("button", { name: "Clima" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("emits the new date order, keeping labels", async () => {
    const user = userEvent.setup();
    const onChange = setup({ labels: ["Clima"] });

    await user.selectOptions(screen.getByLabelText("Date"), "oldest");

    expect(onChange).toHaveBeenCalledWith({
      labels: ["Clima"],
      sort: "oldest",
    });
  });

  it("adds a label when toggled on", async () => {
    const user = userEvent.setup();
    const onChange = setup({ sort: "oldest" });

    await user.click(screen.getByRole("button", { name: "Economy" }));

    expect(onChange).toHaveBeenCalledWith({
      labels: ["Economy"],
      sort: "oldest",
    });
  });

  it("removes a label when toggled off", async () => {
    const user = userEvent.setup();
    const onChange = setup({ labels: ["Clima", "Policy"] });

    await user.click(screen.getByRole("button", { name: "Clima" }));

    expect(onChange).toHaveBeenCalledWith({
      labels: ["Policy"],
      sort: "newest",
    });
  });

  it("hides the clear control until something is active", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [state, setState] = useState<HotTopicsFilter>(
        DEFAULT_HOT_TOPICS_FILTER,
      );
      return (
        <HotTopicsFilters filter={state} labels={labels} onChange={setState} />
      );
    }
    render(<Harness />);

    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();

    await user.selectOptions(screen.getByLabelText("Date"), "oldest");

    expect(
      screen.getByRole("button", { name: "Clear filters" }),
    ).toBeInTheDocument();
  });

  it("resets every facet on clear", async () => {
    const user = userEvent.setup();
    const onChange = setup({ labels: ["Clima"], sort: "oldest" });

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onChange).toHaveBeenCalledWith(DEFAULT_HOT_TOPICS_FILTER);
  });

  it("omits the label group when there are no labels", () => {
    render(
      <HotTopicsFilters
        filter={DEFAULT_HOT_TOPICS_FILTER}
        labels={[]}
        onChange={jest.fn()}
      />,
    );
    expect(screen.queryByText("Labels")).toBeNull();
  });
});
