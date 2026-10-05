"use client";

import Link from "next/link";
import { useBreadcrumbTrail } from "@/app/hooks/use-breadcrumb-trail";

/**
 * Route trail. Renders nothing on the landing page; elsewhere it starts at
 * the "Hot topics" home link, then the dossier title on argument and audit
 * routes, then the audit title on audit routes.
 *
 * Ancestors are links; the current page renders as a non-link `aria-current`
 * span so it reads as the end of the trail rather than another destination.
 */
export function Breadcrumbs() {
  const crumbs = useBreadcrumbTrail();

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs py-3 text-sm">
      <ul>
        {crumbs.map((crumb, index) => {
          const isCurrent = index === crumbs.length - 1;
          return (
            <li key={crumb.href ?? crumb.label}>
              {isCurrent || crumb.href === undefined ? (
                <span
                  className={
                    isCurrent ? "font-semibold text-primary" : "text-base-content/60"
                  }
                  {...(isCurrent ? { "aria-current": "page" as const } : {})}
                >
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
