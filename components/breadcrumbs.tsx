"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { buildCrumbs } from "@/lib/breadcrumbs";

export type BreadcrumbsProps = {
  /** Dossier topic, used as the leading crumb. */
  topic: string;
};

/**
 * Route trail: a static "Topic" label, the dossier topic, then each ancestor
 * of the current path.
 *
 * Ancestors are links; the current page renders as a non-link `aria-current`
 * span so it reads as the end of the trail rather than another destination.
 * The leading label has no destination and is rendered as plain text.
 */
export function Breadcrumbs({ topic }: BreadcrumbsProps) {
  const pathname = usePathname();
  const crumbs = useMemo(() => buildCrumbs(pathname, topic), [pathname, topic]);

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs py-3 text-sm">
      <ul>
        {crumbs.map((crumb, index) => {
          const isCurrent = index === crumbs.length - 1;
          return (
            <li key={crumb.href ?? crumb.label}>
              {crumb.href === undefined ? (
                <span className="text-base-content/60">{crumb.label}</span>
              ) : isCurrent ? (
                <span aria-current="page" className="font-semibold text-primary">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="link link-hover">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}