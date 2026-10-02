/**
 * Human-friendly relative dates for bylines.
 *
 * Dates are parsed as local midnight so the day boundary matches what a
 * reader sees, rather than shifting with the UTC offset.
 */

const MS_PER_DAY = 86_400_000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** Formats an ISO `YYYY-MM-DD` date as an absolute label, e.g. `Jun 18, 2024`. */
export function formatAbsoluteDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats an ISO `YYYY-MM-DD` date relative to `now`, e.g. `4 days ago`.
 *
 * Uses calendar days at local midnight, so an article published earlier today
 * reads `today` rather than `0 days ago`. Anything past a year falls back to
 * whole years, which keeps the byline short on older content.
 */
export function formatRelativeDate(isoDate: string, now: Date = new Date()): string {
  const then = startOfDay(new Date(`${isoDate}T00:00:00`));
  if (Number.isNaN(then)) {
    return isoDate;
  }

  const days = Math.round((startOfDay(now) - then) / MS_PER_DAY);

  if (days === 0) {
    return "today";
  }
  if (days === 1) {
    return "yesterday";
  }
  if (days > 0) {
    if (days < 7) {
      return `${days} days ago`;
    }
    if (days < 30) {
      return `${plural(Math.round(days / 7), "week")} ago`;
    }
    if (days < 365) {
      return `${plural(Math.round(days / 30), "month")} ago`;
    }
    return `${plural(Math.round(days / 365), "year")} ago`;
  }

  const ahead = -days;
  if (ahead === 1) {
    return "tomorrow";
  }
  return `in ${plural(ahead, "day")}`;
}