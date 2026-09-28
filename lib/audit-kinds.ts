export type AuditKind = {
  /** URL + API slug, e.g. "contraarguments". */
  slug: string;
  /** Singular name for headings/buttons, e.g. "Contraargument". */
  name: string;
  /** Exact `label` of the tab in `audit_tabs`, e.g. "Contraargument". */
  tabLabel: string;
};

export const AUDIT_KINDS: AuditKind[] = [
  { slug: "contraarguments", name: "Contraargument", tabLabel: "Contraargument" },
  { slug: "fallacies", name: "Fallacy", tabLabel: "Fallacies" },
  { slug: "evidences", name: "Evidence", tabLabel: "Evidences" },
  { slug: "sources", name: "Source", tabLabel: "Sources" },
  { slug: "interpretations", name: "Interpretation", tabLabel: "Interpretation" },
];

export function getAuditKind(slug: string): AuditKind | undefined {
  return AUDIT_KINDS.find((kind) => kind.slug === slug);
}

export function getCreatePath(kind: AuditKind): string {
  return `/debate/${kind.slug}/create`;
}

export function getApiPath(kind: AuditKind): string {
  return `/api/audits/${kind.slug}`;
}
