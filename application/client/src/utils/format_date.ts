export function formatLongDate(date: string | Date): string {
  return new Intl.DateTimeFormat("ja", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("ja", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffSeconds = Math.round((then - now) / 1000);
  const absDiff = Math.abs(diffSeconds);

  const rtf = new Intl.RelativeTimeFormat("ja", { numeric: "auto" });

  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; divisor: number }> = [
    { limit: 60, unit: "second", divisor: 1 },
    { limit: 3600, unit: "minute", divisor: 60 },
    { limit: 86400, unit: "hour", divisor: 3600 },
    { limit: 604800, unit: "day", divisor: 86400 },
    { limit: 2592000, unit: "week", divisor: 604800 },
    { limit: 31536000, unit: "month", divisor: 2592000 },
    { limit: Infinity, unit: "year", divisor: 31536000 },
  ];

  for (const { limit, unit, divisor } of thresholds) {
    if (absDiff < limit) {
      return rtf.format(Math.round(diffSeconds / divisor), unit);
    }
  }

  return rtf.format(Math.round(diffSeconds / 31536000), "year");
}
