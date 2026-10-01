import type { DbContent } from "@/lib/content-db";
import {
  articleTableRows,
  buildContentIndex,
  resolveProvenanceItem,
  summarizeArticle,
  truncateText,
} from "./provenance-view";

const fixture: DbContent = {
  argument: { title: "Argument", description: "Description" },
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
            paragraphs: [
              { id: "p1", text: "a", auditItemIds: ["evidence-1", "source-1"] },
              { id: "p2", text: "b", auditItemIds: ["evidence-1", "fallacy-1"] },
            ],
          },
          {
            id: "article-2",
            title: "Article Two",
            paragraphs: [],
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
            paragraphs: ["Evidence paragraph one"],
            date: "2025-01-10",
          },
        ],
      },
      {
        id: "tab-sources",
        label: "Sources",
        items: [{ id: "source-1", title: "Source One", paragraphs: [] }],
      },
      {
        id: "tab-fallacies",
        label: "Fallacies",
        items: [
          {
            id: "fallacy-1",
            title: "Fallacy One",
            paragraphs: ["Fallacy paragraph one"],
            date: "2024-10-03",
          },
        ],
      },
    ],
  },
};

describe("provenance-view", () => {
  it("indexes articles with deduplicated audit item links", () => {
    const index = buildContentIndex(fixture);

    expect(index.articles).toHaveLength(2);
    expect(index.articles[0]).toEqual({
      id: "article-1",
      title: "Article One",
      label: "Clima",
      auditItemIds: ["evidence-1", "source-1", "fallacy-1"],
    });
    expect(index.auditItems.get("source-1")).toEqual({
      id: "source-1",
      title: "Source One",
      tab: "Sources",
      excerpt: "Source One",
    });
    expect(index.auditItems.get("evidence-1")).toEqual({
      id: "evidence-1",
      title: "Evidence One",
      tab: "Evidences",
      date: "2025-01-10",
      excerpt: "Evidence paragraph one",
    });
  });

  it("resolves article, audit item, and unknown IDs", () => {
    const index = buildContentIndex(fixture);

    expect(resolveProvenanceItem(index, "article-1")).toEqual({
      name: "Article One",
      kind: "Article",
      isArticle: true,
    });
    expect(resolveProvenanceItem(index, "source-1")).toEqual({
      name: "Source One",
      kind: "Sources",
      isArticle: false,
    });
    expect(resolveProvenanceItem(index, "missing")).toEqual({
      name: "missing",
      kind: "Unknown",
      isArticle: false,
    });
    expect(resolveProvenanceItem(null, "missing")).toEqual({
      name: "missing",
      kind: "Unknown",
      isArticle: false,
    });
  });

  it("summarizes the audit-type mix with percentages", () => {
    const index = buildContentIndex(fixture);

    const summary = summarizeArticle(index, "article-1");
    expect(summary.map((entry) => entry.tab)).toEqual([
      "Fallacies",
      "Evidences",
      "Sources",
    ]);
    expect(summary).toEqual([
      { tab: "Fallacies", count: 1, percent: (1 / 3) * 100 },
      { tab: "Evidences", count: 1, percent: (1 / 3) * 100 },
      { tab: "Sources", count: 1, percent: (1 / 3) * 100 },
    ]);
  });

  it("returns empty summaries for articles without links", () => {
    const index = buildContentIndex(fixture);

    expect(summarizeArticle(index, "article-2")).toEqual([]);
    expect(summarizeArticle(index, "missing")).toEqual([]);
  });

  it("returns article rows ordered by date with undated rows last", () => {
    const index = buildContentIndex(fixture);

    expect(articleTableRows(index, "article-1")).toEqual([
      {
        id: "fallacy-1",
        tab: "Fallacies",
        excerpt: "Fallacy paragraph one",
        date: "2024-10-03",
      },
      {
        id: "evidence-1",
        tab: "Evidences",
        excerpt: "Evidence paragraph one",
        date: "2025-01-10",
      },
      {
        id: "source-1",
        tab: "Sources",
        excerpt: "Source One",
      },
    ]);
    expect(articleTableRows(index, "article-2")).toEqual([]);
    expect(articleTableRows(index, "missing")).toEqual([]);
  });

  it("truncates excerpts to 20 characters", () => {
    expect(truncateText("short")).toBe("short");
    expect(truncateText("12345678901234567890")).toBe("12345678901234567890");
    expect(truncateText("123456789012345678901")).toBe("12345678901234567890…");
  });
});
