import { sortAuditItems } from "@/lib/audit-sort";
import type { CollapsibleItem } from "@/db/content";

function item(
  id: string,
  overrides: Partial<CollapsibleItem> = {},
): CollapsibleItem {
  return { id, title: id, paragraphs: [], ...overrides };
}

describe("sortAuditItems", () => {
  const items = [
    item("a", { date: "2024-01-01" }),
    item("b", { date: "2025-06-15" }),
    item("c"),
    item("d", { date: "2024-06-15" }),
  ];

  it("sorts newest first and sinks dateless items", () => {
    expect(sortAuditItems(items, "newest").map((entry) => entry.id)).toEqual([
      "b",
      "d",
      "a",
      "c",
    ]);
  });

  it("sorts oldest first and sinks dateless items", () => {
    expect(sortAuditItems(items, "oldest").map((entry) => entry.id)).toEqual([
      "a",
      "d",
      "b",
      "c",
    ]);
  });

  it("keeps tab order for equal dates", () => {
    const tied = [item("x", { date: "2024-01-01" }), item("y", { date: "2024-01-01" })];
    expect(sortAuditItems(tied, "newest").map((entry) => entry.id)).toEqual([
      "x",
      "y",
    ]);
    expect(sortAuditItems(tied, "oldest").map((entry) => entry.id)).toEqual([
      "x",
      "y",
    ]);
  });

  it("sorts by attestation count and sinks unloaded counts", () => {
    const counts = { a: 2, b: null, c: 5, d: 2 };
    expect(
      sortAuditItems(items, "most-attested", {
        attestationCounts: counts,
      }).map((entry) => entry.id),
    ).toEqual(["c", "a", "d", "b"]);
  });

  it("sorts by views, falling back to stored openCount", () => {
    const viewed = [
      item("a", { openCount: 10 }),
      item("b", { openCount: 3 }),
      item("c"),
    ];
    expect(
      sortAuditItems(viewed, "most-viewed", { openCounts: { b: 12 } }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["b", "a", "c"]);
  });

  it("does not mutate the input", () => {
    const before = items.map((entry) => entry.id);
    sortAuditItems(items, "newest", { attestationCounts: { a: 9 } });
    expect(items.map((entry) => entry.id)).toEqual(before);
  });
});
