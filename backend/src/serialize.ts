import type { CheckinDoc } from "./models/Checkin.js";
import type { HabitDoc } from "./models/Habit.js";
import type { UserDoc } from "./models/User.js";
import type { CheckinJson, HabitJson, HabitRunJson, UserJson } from "./types.js";

function toDateString(value: Date | string): string {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function todayISO(): string {
  return toDateString(new Date());
}

export function currentStreak(checkins: CheckinDoc[], today = todayISO()): number {
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

export function longestStreak(checkins: CheckinDoc[]): number {
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

export function userJson(user: UserDoc): UserJson {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    createdAt: toDateString(user.createdAt),
    avatarUri: user.avatarUri ?? null,
  };
}

export function habitJson(habit: HabitDoc): HabitJson {
  return {
    id: String(habit._id),
    name: habit.name,
    goalDays: habit.goalDays ?? null,
  };
}

export function checkinJson(checkin: CheckinDoc): CheckinJson {
  return {
    id: String(checkin._id),
    date: checkin.date,
    answer: checkin.answer as CheckinJson["answer"],
  };
}

export function habitRunJson(habit: HabitDoc, checkins: CheckinDoc[]): HabitRunJson {
  return {
    id: String(habit._id),
    name: habit.name,
    goalDays: habit.goalDays ?? null,
    startedAt: toDateString(habit.startedAt ?? new Date()),
    endedAt: toDateString(habit.endedAt ?? new Date()),
    yesCount: checkins.filter((c) => c.answer === "yes").length,
    longestStreak: longestStreak(checkins),
  };
}
