export function toISODate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function monthKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

export function formatMonthTitle(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function formatLongDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function weekdayLabel(date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: "long" });
}

export function formatDayLine(iso?: string): string {
  const date = iso ? parseISODate(iso) : new Date();
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function daysElapsedInMonth(month: string, today: string): number {
  const now = monthKey(parseISODate(today));
  if (month > now) return 0;
  if (month === now) return parseISODate(today).getDate();
  return daysInMonth(month);
}

export function startWeekday(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).getDay();
}

export function lastSevenDays(today: string): string[] {
  return [6, 5, 4, 3, 2, 1, 0].map((offset) => addDays(today, -offset));
}

export function dayLetter(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, { weekday: "narrow" });
}

export function hourWhisper(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Even 2am counts.";
  if (h < 12) return "Morning is a good time to be honest.";
  if (h < 18) return "The day’s still open.";
  return "Night is fine. Just tap.";
}
