export type Answer = "yes" | "no";

export type Subscription = {
  plan: "free" | "plus";
  period: "monthly" | "yearly" | null;
  renewsAt: string | null;
};

export type UserJson = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  avatarUri: string | null;
};

export type HabitJson = {
  id: string;
  name: string;
  goalDays: number | null;
};

export type HabitRunJson = {
  id: string;
  name: string;
  goalDays: number | null;
  startedAt: string;
  endedAt: string;
  yesCount: number;
  longestStreak: number;
};

export type CheckinJson = {
  id: string;
  date: string;
  answer: Answer;
};

export const FREE_SUBSCRIPTION: Subscription = {
  plan: "free",
  period: null,
  renewsAt: null,
};
