/**
 * Breadcrumb trail construction.
 *
 * Pure and route-agnostic so the trail can be tested without a router: a
 * static "Topic" label leads, then the dossier topic, then one crumb per
 * real path segment.
 */
import { ROUTE_LABELS, site } from "@/db/content";

export type Crumb = {
  label: string;
  /**
   * Ancestor path this crumb links to. Absent for the leading static label,
   * which is a caption rather than a destination.
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

/**
 * Builds the trail for `pathname`: the static "Topic" label, then the topic
 * name, then one crumb per real path segment.
 *
 * Each segment becomes a link to its ancestor path. On the topic route itself
 * the trail stops after the topic name.
 */
export function buildCrumbs(pathname: string, topicTitle: string): Crumb[] {
  const crumbs: Crumb[] = [
    { label: site.breadcrumbs.topicLabel },
    { label: topicTitle, href: "/" },
  ];

  const segments = pathname.split("/").filter((segment) => segment !== "");

  for (const [index, segment] of segments.entries()) {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    // The topic crumb already points at the root, so a segment that lands
    // back on it is dropped rather than rendered twice.
    if (crumbs.some((crumb) => crumb.href === href)) {
      continue;
    }
    crumbs.push({ label: segmentLabel(segment), href });
  }

  return crumbs;
}