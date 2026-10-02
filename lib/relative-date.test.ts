import {
  formatAbsoluteDate,
  formatRelativeDate,
} from "@/lib/relative-date";

/** Local midnight on the given day, the reference "now" for these tests. */
function now(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

/** ISO date `offset` days before `reference`. */
function isoDaysBefore(reference: Date, offset: number): string {
  const date = new Date(reference);
  date.setDate(date.getDate() - offset);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

describe("formatRelativeDate", () => {
  const reference = now(2025, 3, 20);

  it("reads today and yesterday for the nearest days", () => {
    expect(formatRelativeDate(isoDaysBefore(reference, 0), reference)).toBe(
      "today",
    );
    expect(formatRelativeDate(isoDaysBefore(reference, 1), reference)).toBe(
      "yesterday",
    );
  });

  it("counts days within the first week", () => {
    expect(formatRelativeDate(isoDaysBefore(reference, 4), reference)).toBe(
      "4 days ago",
    );
    expect(formatRelativeDate(isoDaysBefore(reference, 6), reference)).toBe(
      "6 days ago",
    );
  });

  it("switches to weeks, then months, then years", () => {
    expect(formatRelativeDate(isoDaysBefore(reference, 8), reference)).toBe(
      "1 week ago",
    );
    expect(formatRelativeDate(isoDaysBefore(reference, 21), reference)).toBe(
      "3 weeks ago",
    );
    expect(formatRelativeDate(isoDaysBefore(reference, 60), reference)).toBe(
      "2 months ago",
    );
    expect(formatRelativeDate(isoDaysBefore(reference, 400), reference)).toBe(
      "1 year ago",
    );
    expect(formatRelativeDate(isoDaysBefore(reference, 800), reference)).toBe(
      "2 years ago",
    );
  });

  it("handles dates in the future", () => {
    expect(formatRelativeDate(isoDaysBefore(reference, -1), reference)).toBe(
      "tomorrow",
    );
    expect(formatRelativeDate(isoDaysBefore(reference, -5), reference)).toBe(
      "in 5 days",
    );
  });

  it("crosses month and year boundaries by calendar day", () => {
    expect(formatRelativeDate("2025-03-19", now(2025, 4, 1))).toBe(
      "2 weeks ago",
    );
    expect(formatRelativeDate("2024-12-31", now(2025, 1, 2))).toBe("2 days ago");
  });

  it("returns the input unchanged when it is not a date", () => {
    expect(formatRelativeDate("not-a-date", reference)).toBe("not-a-date");
  });
});

describe("formatAbsoluteDate", () => {
  it("formats an ISO date for the tooltip", () => {
    expect(formatAbsoluteDate("2024-06-18")).toMatch(/2024/);
  });
});