/**
 * Format a date string or Date object into a human-readable format.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a percentage from a numerator and total.
 * Returns a string like "45.2%".
 */
export function formatPercentage(n: number, total: number): string {
  if (total === 0) {
    return "0%";
  }
  const pct = (n / total) * 100;
  return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`;
}
