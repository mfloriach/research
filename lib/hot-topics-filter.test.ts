import {
  DEFAULT_HOT_TOPICS_FILTER,
  availableArgumentLabels,
  hotTopicsFilterQuery,
  isDefaultHotTopicsFilter,
  parseHotTopicsFilter,
  toggleHotTopicsLabel,
} from "./hot-topics-filter";

describe("hot-topics-filter", () => {
  it("defaults to newest first with no labels", () => {
    expect(parseHotTopicsFilter(new URLSearchParams())).toEqual({
      labels: [],
      sort: "newest",
    });
    expect(isDefaultHotTopicsFilter(DEFAULT_HOT_TOPICS_FILTER)).toBe(true);
  });

  it("parses labels and sort from the query string", () => {
    expect(
      parseHotTopicsFilter(new URLSearchParams("labels=Clima,Policy&sort=oldest")),
    ).toEqual({ labels: ["Clima", "Policy"], sort: "oldest" });
  });

  it("falls back to newest on an unrecognised sort", () => {
    expect(
      parseHotTopicsFilter(new URLSearchParams("sort=random")).sort,
    ).toBe("newest");
  });

  it("omits defaults when serialising", () => {
    expect(hotTopicsFilterQuery(DEFAULT_HOT_TOPICS_FILTER)).toBe("");
    expect(
      hotTopicsFilterQuery({ labels: ["Clima"], sort: "newest" }),
    ).toBe("?labels=Clima");
    expect(hotTopicsFilterQuery({ labels: [], sort: "oldest" })).toBe(
      "?sort=oldest",
    );
  });

  it("toggles a label while keeping the sort", () => {
    const added = toggleHotTopicsLabel(
      { labels: [], sort: "oldest" },
      "Clima",
    );
    expect(added).toEqual({ labels: ["Clima"], sort: "oldest" });
    expect(toggleHotTopicsLabel(added, "Clima")).toEqual({
      labels: [],
      sort: "oldest",
    });
  });

  it("derives sorted labels only from loaded arguments", () => {
    expect(
      availableArgumentLabels([
        { labels: ["Policy", "Clima"] },
        { labels: ["Clima"] },
      ]),
    ).toEqual(["Clima", "Policy"]);
  });
});
