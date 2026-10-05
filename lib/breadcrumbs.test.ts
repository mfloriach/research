import { buildCrumbs, HOME_LABEL, segmentLabel } from "@/lib/breadcrumbs";

const TITLE = "Carbon border taxes, audited";
const ID = "arg-1";

describe("buildCrumbs", () => {
  it("renders no trail on the landing page", () => {
    expect(buildCrumbs({ pathname: "/" })).toEqual([]);
  });

  it("shows home and the argument title on the dossier route", () => {
    expect(
      buildCrumbs({ pathname: `/debate/argument/${ID}`, argumentTitle: TITLE }),
    ).toEqual([
      { label: HOME_LABEL, href: "/" },
      { label: TITLE },
    ]);
  });

  it("falls back to a generic label while the title loads", () => {
    expect(buildCrumbs({ pathname: `/debate/argument/${ID}` })).toEqual([
      { label: HOME_LABEL, href: "/" },
      { label: "Argument" },
    ]);
  });

  it("shows home, argument and audit title on audit create routes", () => {
    expect(
      buildCrumbs({
        pathname: "/debate/contraarguments/create",
        argumentId: ID,
        argumentTitle: TITLE,
      }),
    ).toEqual([
      { label: HOME_LABEL, href: "/" },
      { label: TITLE, href: `/debate/argument/${ID}` },
      { label: "Contraargument" },
    ]);
  });

  it("omits the argument crumb when its title is unknown", () => {
    expect(
      buildCrumbs({ pathname: "/debate/evidences/create" }),
    ).toEqual([
      { label: HOME_LABEL, href: "/" },
      { label: "Evidences" },
    ]);
  });

  it("covers the report create and provenance routes", () => {
    expect(
      buildCrumbs({
        pathname: "/debate/create",
        argumentId: ID,
        argumentTitle: TITLE,
      }),
    ).toEqual([
      { label: HOME_LABEL, href: "/" },
      { label: TITLE, href: `/debate/argument/${ID}` },
      { label: "Create" },
    ]);
    expect(buildCrumbs({ pathname: "/debate/provenance" })).toEqual([
      { label: HOME_LABEL, href: "/" },
      { label: "Provenance" },
    ]);
  });

  it("falls back to one crumb per segment for unknown routes", () => {
    expect(buildCrumbs({ pathname: "/audit-report" })).toEqual([
      { label: HOME_LABEL, href: "/" },
      { label: "Audit report", href: "/audit-report" },
    ]);
    expect(buildCrumbs({ pathname: "/debate/unknown-page" })).toEqual([
      { label: HOME_LABEL, href: "/" },
      { label: "Debate", href: "/debate" },
      { label: "Unknown page", href: "/debate/unknown-page" },
    ]);
  });

  it("ignores trailing slashes and empty segments", () => {
    expect(
      buildCrumbs({ pathname: `/debate/argument/${ID}/` }),
    ).toEqual([
      { label: HOME_LABEL, href: "/" },
      { label: "Argument" },
    ]);
  });

  it("handles underscored segments", () => {
    expect(segmentLabel("some_new_page")).toBe("Some new page");
  });

  it("prefers the canonical label over humanising", () => {
    expect(segmentLabel("interpretations")).toBe("Interpretation");
    expect(segmentLabel("evidences")).toBe("Evidences");
  });
});
