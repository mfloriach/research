import type { Article, ContentTab } from "@/db/content";
import {
  DEFAULT_ARTICLE_FILTER,
  articleFilterQuery,
  availableLabels,
  filterReportingTabs,
  isDefaultArticleFilter,
  parseArticleFilter,
  toggleLabel,
  type ArticleFilter,
} from "@/lib/content-filter";

function article(overrides: Partial<Article> = {}): Article {
  return {
    id: "a",
    title: "Article",
    labels: ["Clima"],
    paragraphs: [],
    ...overrides,
  };
}

function tab(label: string, items: Article[]): ContentTab<Article> {
  return { id: label, label, items };
}

const filter = (overrides: Partial<ArticleFilter> = {}): ArticleFilter => ({
  ...DEFAULT_ARTICLE_FILTER,
  ...overrides,
});

describe("filterReportingTabs type", () => {
  const tabs = [
    tab("Clima", [
      article({ id: "text", type: "text" }),
      // Articles written before the media kind existed carry no type.
      article({ id: "legacy" }),
      article({ id: "video", type: "video" }),
    ]),
  ];

  it("keeps everything for 'all'", () => {
    expect(filterReportingTabs(tabs, filter()).total).toBe(3);
  });

  it("treats a missing type as text", () => {
    const result = filterReportingTabs(tabs, filter({ type: "text" }));
    expect(result.tabs[0]?.items.map((a) => a.id)).toEqual(["text", "legacy"]);
  });

  it("keeps only videos for 'video'", () => {
    const result = filterReportingTabs(tabs, filter({ type: "video" }));
    expect(result.tabs[0]?.items.map((a) => a.id)).toEqual(["video"]);
  });

  it("drops tabs left with no matches", () => {
    const result = filterReportingTabs(tabs, filter({ type: "video" }));
    expect(result.total).toBe(1);
    const mixed = [tab("Clima", [article({ type: "text" })]), tab("Policy", [article({ type: "video" })])];
    const only = filterReportingTabs(mixed, filter({ type: "video" }));
    expect(only.tabs.map((t) => t.label)).toEqual(["Policy"]);
  });
});

describe("filterReportingTabs labels", () => {
  const tabs = [
    tab("Clima", [
      article({ id: "clima", labels: ["Clima", "Science"] }),
      article({ id: "sci", labels: ["Science"] }),
    ]),
    tab("Economy", [article({ id: "econ", labels: ["Economy"] })]),
  ];

  it("matches any selected label (OR)", () => {
    const result = filterReportingTabs(tabs, filter({ labels: ["Clima", "Economy"] }));
    expect(result.total).toBe(2);
    expect(result.tabs.map((t) => t.label).sort()).toEqual(["Clima", "Economy"]);
  });

  it("matches a label that has no tab of its own", () => {
    const result = filterReportingTabs(tabs, filter({ labels: ["Science"] }));
    expect(result.tabs.map((t) => t.label)).toEqual(["Clima"]);
    expect(result.total).toBe(2);
  });

  it("returns nothing for an unknown label", () => {
    const result = filterReportingTabs(tabs, filter({ labels: ["Trade"] }));
    expect(result.tabs).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("combines type and label", () => {
    const withVideo = [
      tab("Clima", [
        article({ id: "t", type: "text", labels: ["Clima"] }),
        article({ id: "v", type: "video", labels: ["Clima"] }),
      ]),
    ];
    const result = filterReportingTabs(withVideo, filter({ type: "video", labels: ["Clima"] }));
    expect(result.tabs[0]?.items.map((a) => a.id)).toEqual(["v"]);
  });
});

describe("filterReportingTabs sort", () => {
  const tabs = [
    tab("Clima", [
      article({ id: "mid", date: "2024-06-18" }),
      article({ id: "none" }),
      article({ id: "new", date: "2024-09-30" }),
      article({ id: "old", date: "2021-06-30" }),
    ]),
  ];

  it("keeps editorial order by default", () => {
    expect(filterReportingTabs(tabs, filter()).tabs[0]?.items.map((a) => a.id)).toEqual([
      "mid",
      "none",
      "new",
      "old",
    ]);
  });

  it("sorts newest first with undated last", () => {
    expect(
      filterReportingTabs(tabs, filter({ sort: "newest" })).tabs[0]?.items.map((a) => a.id),
    ).toEqual(["new", "mid", "old", "none"]);
  });

  it("sorts oldest first with undated last", () => {
    expect(
      filterReportingTabs(tabs, filter({ sort: "oldest" })).tabs[0]?.items.map((a) => a.id),
    ).toEqual(["old", "mid", "new", "none"]);
  });

  it("does not mutate the source tabs", () => {
    filterReportingTabs(tabs, filter({ sort: "newest" }));
    expect(tabs[0]?.items.map((a) => a.id)).toEqual(["mid", "none", "new", "old"]);
  });
});

describe("availableLabels", () => {
  it("collects tab and article labels, sorted, without duplicates", () => {
    const tabs = [
      tab("Clima", [article({ labels: ["Science", "Clima"] })]),
      tab("Policy", [article({ labels: ["Policy"] })]),
    ];
    expect(availableLabels(tabs)).toEqual(["Clima", "Policy", "Science"]);
  });

  it("ignores labels no content uses", () => {
    expect(availableLabels([tab("Clima", [])])).toEqual(["Clima"]);
  });
});

describe("parseArticleFilter", () => {
  it("reads all three facets", () => {
    const params = new URLSearchParams("type=video&labels=Clima,Science&sort=newest");
    expect(parseArticleFilter(params)).toEqual({
      type: "video",
      labels: ["Clima", "Science"],
      sort: "newest",
    });
  });

  it("defaults when nothing is set", () => {
    expect(parseArticleFilter(new URLSearchParams())).toEqual(DEFAULT_ARTICLE_FILTER);
  });

  it("falls back on unrecognised values", () => {
    const params = new URLSearchParams("type=bogus&sort=random");
    expect(parseArticleFilter(params)).toEqual(DEFAULT_ARTICLE_FILTER);
  });

  it("trims and drops empty labels", () => {
    expect(parseArticleFilter(new URLSearchParams("labels= Clima , ,Policy ")).labels).toEqual([
      "Clima",
      "Policy",
    ]);
  });
});

describe("articleFilterQuery", () => {
  it("omits defaults", () => {
    expect(articleFilterQuery(DEFAULT_ARTICLE_FILTER)).toBe("");
  });

  it("serialises active facets", () => {
    const query = articleFilterQuery(
      filter({ type: "video", labels: ["Clima"], sort: "newest" }),
    );
    expect(query).toBe("?type=video&labels=Clima&sort=newest");
  });

  it("round-trips", () => {
    const original = filter({ type: "video", labels: ["Clima", "Science"], sort: "oldest" });
    const params = new URLSearchParams(articleFilterQuery(original).replace(/^\?/, ""));
    expect(parseArticleFilter(params)).toEqual(original);
  });

  it("escapes labels that need it", () => {
    expect(articleFilterQuery(filter({ labels: ["a b&c"] }))).toBe(
      "?labels=a+b%26c",
    );
  });
});

describe("toggleLabel", () => {
  it("adds and removes while keeping other facets", () => {
    const base = filter({ type: "video", sort: "newest" });
    const added = toggleLabel(base, "Clima");
    expect(added).toEqual({ type: "video", labels: ["Clima"], sort: "newest" });
    expect(toggleLabel(added, "Clima").labels).toEqual([]);
  });
});

describe("isDefaultArticleFilter", () => {
  it("detects whether anything is active", () => {
    expect(isDefaultArticleFilter(DEFAULT_ARTICLE_FILTER)).toBe(true);
    expect(isDefaultArticleFilter(filter({ labels: [] }))).toBe(true);
    expect(isDefaultArticleFilter(filter({ type: "text" }))).toBe(false);
    expect(isDefaultArticleFilter(filter({ sort: "newest" }))).toBe(false);
    expect(isDefaultArticleFilter(filter({ labels: ["Clima"] }))).toBe(false);
  });
});