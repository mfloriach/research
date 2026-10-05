/**
 * Breadcrumb trail construction.
 *
 * Pure and route-agnostic so the trail can be tested without a router.
 * Route-aware rather than one-crumb-per-segment:
 * - `/` renders no trail at all.
 * - `/debate/argument/[id]` renders `Hot topics › {argument title}`.
 * - Audit routes (`/debate/create`, `/debate/provenance`,
 *   `/debate/<tab>/create`) render
 *   `Hot topics › {argument title} › {audit title}`, omitting the argument
 *   crumb when its title is unknown (e.g. a direct visit with no context).
 * - Anything else falls back to one crumb per segment under `Hot topics`.
 */
import { ROUTE_LABELS } from "@/db/nuclear";

/** Landing label; also the first crumb, linking home. */
export const HOME_LABEL = "Hot topics";

export type Crumb = {
  label: string;
  /**
   * Ancestor path this crumb links to. Absent for the current page, which
   * renders as a non-link `aria-current` span.
   */
  href?: string;
};

/** `audit-report` → `Audit report`, for segments with no explicit label. */
function humanize(segment: string): string {
  const words = segment.replace(/[-_]+/g, " ").trim();
  if (words === "") {
    return segment;
  }
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function segmentLabel(segment: string): string {
  return ROUTE_LABELS[segment] ?? humanize(segment);
}

export type BreadcrumbTrailInput = {
  pathname: string;
  /** Dossier id the trail links back to, when the route carries one. */
  argumentId?: string | null;
  /** Resolved dossier title; absent while still loading or unknown. */
  argumentTitle?: string | null;
};

function homeCrumb(): Crumb {
  return { label: HOME_LABEL, href: "/" };
}

/**
 * Audit title for dossier-child routes: the audit tab label
 * (`Contraargument`, `Evidences`, …), `Create` for `/debate/create` and
 * `Provenance` for `/debate/provenance`. `null` for non-audit routes.
 */
function auditLabelFor(segments: string[]): string | null {
  const [, second, third] = segments;
  if (segments.length === 2 && (second === "create" || second === "provenance")) {
    return segmentLabel(second);
  }
  if (segments.length === 3 && third === "create") {
    return segmentLabel(second ?? "");
  }
  return null;
}

/**
 * Builds the trail for `pathname`. The landing page has no trail; the
 * dossier page shows the resolved argument title (falling back to a generic
 * label while it loads); audit routes append their audit title and include
 * the argument crumb only once its title is known.
 */
export function buildCrumbs({
  pathname,
  argumentId,
  argumentTitle,
}: BreadcrumbTrailInput): Crumb[] {
  if (pathname === "/") {
    return [];
  }

  const segments = pathname.split("/").filter((segment) => segment !== "");
  const home = homeCrumb();

  if (
    segments.length === 3 &&
    segments[0] === "debate" &&
    segments[1] === "argument"
  ) {
    return [home, { label: argumentTitle ?? "Argument" }];
  }

  if (segments[0] === "debate") {
    const auditLabel = auditLabelFor(segments);
    if (auditLabel !== null) {
      const crumbs: Crumb[] = [home];
      if (argumentId && argumentTitle) {
        crumbs.push({
          label: argumentTitle,
          href: `/debate/argument/${argumentId}`,
        });
      }
      crumbs.push({ label: auditLabel });
      return crumbs;
    }
  }

  return [
    home,
    ...segments.map((segment, index) => ({
      label: segmentLabel(segment),
      href: `/${segments.slice(0, index + 1).join("/")}`,
    })),
  ];
}
