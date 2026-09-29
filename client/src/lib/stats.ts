import { addDays, monthKey, toISODate } from "./dates";
import type { Checkin } from "../data/types";

export function currentStreak(checkins: Checkin[], today = toISODate()): number {
  const yes = new Set(
    checkins.filter((c) => c.answer === "yes").map((c) => c.date),
  );
  let cursor = yes.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (yes.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function longestStreak(checkins: Checkin[]): number {
  const days = checkins
    .filter((c) => c.answer === "yes")
    .map((c) => c.date)
    .sort();
  if (days.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === addDays(days[i - 1], 1)) {
      run += 1;
      best = Math.max(best, run);
    } else if (days[i] !== days[i - 1]) {
      run = 1;
    }
  }
  return best;
}

export function firesInMonth(checkins: Checkin[], month = monthKey()): number {
  return checkins.filter(
    (c) => c.answer === "yes" && c.date.startsWith(month),
  ).length;
}

export function yesCount(checkins: Checkin[]): number {
  return checkins.filter((c) => c.answer === "yes").length;
}
