export function truncateText(value: string, maxLength = 20): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}…`;
}

/**
 * Middle-truncate a wallet address, keeping the prefix and the distinctive
 * suffix (e.g. `0x0000000000…00000007`).
 */
export function truncateAddress(value: string): string {
  if (value.length <= 20) {
    return value;
  }
  return `${value.slice(0, 12)}…${value.slice(-8)}`;
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
