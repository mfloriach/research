export function truncateText(value: string, maxLength = 20): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}…`;
}

export function formatTime(timestamp: number | null): string {
  if (timestamp === null) {
    return "—";
  }
  return new Date(timestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
