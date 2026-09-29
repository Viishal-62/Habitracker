export type Answer = "yes" | "no";

export type BillingPeriod = "monthly" | "yearly";

export type Subscription = {
  plan: "free" | "plus";
  period: BillingPeriod | null;
  renewsAt: string | null;
};

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  avatarUri: string | null;
};

export type Habit = {
  id: string;
  name: string;
  goalDays: number | null;
};

export type HabitRun = {
  id: string;
  name: string;
  goalDays: number | null;
  startedAt: string;
  endedAt: string;
  yesCount: number;
  longestStreak: number;
};

export type Checkin = {
  id: string;
  date: string;
  answer: Answer;
};

export type Bootstrap = {
  onboardingComplete: boolean;
  pendingHabitName: string | null;
  pendingGoalDays: number | null;
  hasAccount: boolean;
  user: User | null;
  habit: Habit | null;
  checkins: Checkin[];
  history: HabitRun[];
  subscription: Subscription;
};

export type HabitApi = {
  getBootstrap(): Promise<Bootstrap>;
  completeOnboarding(): Promise<void>;
  login(input: { email: string; password: string }): Promise<{ user: User }>;
  logout(): Promise<void>;
  getSession(): Promise<{ user: User } | null>;
  getHabit(): Promise<Habit | null>;
  setHabit(input: { name: string; goalDays: number; endCurrent?: boolean }): Promise<Habit>;
  getHistory(): Promise<HabitRun[]>;
  saveCheckin(input: { date: string; answer: Answer }): Promise<Checkin>;
  getCheckins(input?: { month?: string }): Promise<Checkin[]>;
  updateProfile(input: { name?: string; avatarUri?: string | null }): Promise<{ user: User }>;
  purchasePlus(input: { period: BillingPeriod }): Promise<Subscription>;
  restorePlus(): Promise<Subscription>;
  endMockPlus(): Promise<Subscription>;
};
