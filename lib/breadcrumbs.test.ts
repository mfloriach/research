import { buildCrumbs, segmentLabel } from "@/lib/breadcrumbs";

const TOPIC = "Carbon border taxes, audited";

describe("buildCrumbs", () => {
  it("leads with the static topic label, then the topic name", () => {
    expect(buildCrumbs("/", TOPIC)).toEqual([
      { label: "Topic" },
      { label: TOPIC, href: "/" },
    ]);
  });

  it("drills down through the full path", () => {
    expect(buildCrumbs("/debate/contraarguments/create", TOPIC)).toEqual([
      { label: "Topic" },
      { label: TOPIC, href: "/" },
      { label: "Debate", href: "/debate" },
      { label: "Contraargument", href: "/debate/contraarguments" },
      { label: "Create", href: "/debate/contraarguments/create" },
    ]);
  });

  it("maps single-segment routes", () => {
    expect(buildCrumbs("/debate/provenance", TOPIC)).toEqual([
      { label: "Topic" },
      { label: TOPIC, href: "/" },
      { label: "Debate", href: "/debate" },
      { label: "Provenance", href: "/debate/provenance" },
    ]);
  });

  it("ignores trailing slashes and empty segments", () => {
    expect(buildCrumbs("/debate//sources/create/", TOPIC)).toEqual([
      { label: "Topic" },
      { label: TOPIC, href: "/" },
      { label: "Debate", href: "/debate" },
      { label: "Sources", href: "/debate/sources" },
      { label: "Create", href: "/debate/sources/create" },
    ]);
  });

  it("humanises segments with no explicit label", () => {
    expect(buildCrumbs("/audit-report", TOPIC)).toEqual([
      { label: "Topic" },
      { label: TOPIC, href: "/" },
      { label: "Audit report", href: "/audit-report" },
    ]);
  });

  it("handles underscored segments", () => {
    expect(segmentLabel("some_new_page")).toBe("Some new page");
  });

  it("prefers the canonical label over humanising", () => {
    expect(segmentLabel("interpretations")).toBe("Interpretation");
    expect(segmentLabel("evidences")).toBe("Evidences");
  });

  it("keeps query strings out of the href", () => {
    // The pathname never carries a query, but assert we do not leak one.
    expect(buildCrumbs("/debate/evidences/create", TOPIC).at(-1)?.href).toBe(
      "/debate/evidences/create",
    );
  });

  it("covers every audit route", () => {
    const expected: Record<string, string> = {
      "/debate/create": "Create",
      "/debate/contraarguments/create": "Create",
      "/debate/evidences/create": "Create",
      "/debate/fallacies/create": "Create",
      "/debate/interpretations/create": "Create",
      "/debate/sources/create": "Create",
      "/debate/provenance": "Provenance",
    };
    for (const [pathname, last] of Object.entries(expected)) {
      expect(buildCrumbs(pathname, TOPIC).at(-1)).toEqual({
        label: last,
        href: pathname,
      });
    }
  });
});