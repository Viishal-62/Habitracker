import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type IonName = ComponentProps<typeof Ionicons>["name"];

export const HABIT_PRESETS: {
  name: string;
  title: string;
  hint: string;
  icon: IonName;
}[] = [
  { name: "Smoking", title: "Smoking", hint: "Cigarettes, vapes", icon: "cloud-outline" },
  { name: "Drinking", title: "Drinking", hint: "Beer, liquor, nights out", icon: "wine-outline" },
  { name: "Porn", title: "Porn", hint: "Videos, sites, DMs", icon: "eye-off-outline" },
  { name: "Masturbation", title: "No fap", hint: "Masturbation", icon: "shield-outline" },
  { name: "Junk food", title: "Junk food", hint: "The usual junk", icon: "fast-food-outline" },
  { name: "Doomscrolling", title: "Doomscrolling", hint: "Endless feeds", icon: "phone-portrait-outline" },
];

export const GOAL_PRESETS: {
  days: number;
  hint: string;
  icon: IonName;
}[] = [
  { days: 7, hint: "First week", icon: "sunny-outline" },
  { days: 21, hint: "Classic", icon: "flame-outline" },
  { days: 30, hint: "A month", icon: "calendar-outline" },
  { days: 90, hint: "Hard mode", icon: "trophy-outline" },
];

export function isPresetHabit(name: string): boolean {
  const n = name.trim().toLowerCase();
  return HABIT_PRESETS.some((p) => p.name.toLowerCase() === n);
}

export function habitMeta(name: string) {
  const n = name.trim().toLowerCase();
  return HABIT_PRESETS.find((p) => p.name.toLowerCase() === n);
}

export function habitIcon(name: string): IonName {
  return habitMeta(name)?.icon ?? "ban-outline";
}

export function isNofapHabit(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n.includes("fap") || n.includes("porn") || n.includes("masturb");
}

export function goalHint(days: number, habitName: string): string {
  if (days === 90 && isNofapHabit(habitName)) return "NoFap mode";
  return GOAL_PRESETS.find((g) => g.days === days)?.hint ?? "Your run";
}

export function clampGoalDays(raw: number): number {
  return Math.min(365, Math.max(2, Math.floor(raw)));
}

export function normalizeGoalDays(value?: number | null): number | null {
  if (!value || value < 2) return null;
  return clampGoalDays(value);
}
