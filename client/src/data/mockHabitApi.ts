import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDays, toISODate } from "../lib/dates";
import { clampGoalDays, normalizeGoalDays } from "../lib/habitPresets";
import { longestStreak, yesCount } from "../lib/stats";
import type {
  Answer,
  Bootstrap,
  Checkin,
  Habit,
  HabitApi,
  HabitRun,
  Subscription,
  User,
} from "./types";

const KEY = "chooseone.store.v1";

type Store = {
  onboardingComplete: boolean;
  pendingHabitName: string | null;
  pendingGoalDays: number | null;
  sessionUserId: string | null;
  users: {
    user: User;
    password: string;
    habit: Habit | null;
    habitStartedAt: string | null;
    checkins: Checkin[];
    history: HabitRun[];
    subscription: Subscription;
  }[];
};

const empty = (): Store => ({
  onboardingComplete: false,
  pendingHabitName: null,
  pendingGoalDays: null,
  sessionUserId: null,
  users: [],
});

function asUser(user: User | null): User | null {
  if (!user) return null;
  return { ...user, avatarUri: user.avatarUri ?? null };
}

function asHabit(habit: Habit | null): Habit | null {
  if (!habit) return null;
  return { ...habit, goalDays: normalizeGoalDays(habit.goalDays) };
}

function asSub(value?: Subscription | null): Subscription {
  if (!value || value.plan !== "plus") {
    return { plan: "free", period: null, renewsAt: null };
  }
  return value;
}

function plusSub(period: "monthly" | "yearly"): Subscription {
  const days = period === "yearly" ? 365 : 30;
  return {
    plan: "plus",
    period,
    renewsAt: addDays(toISODate(), days),
  };
}

function toRun(habit: Habit, checkins: Checkin[], startedAt: string | null): HabitRun {
  return {
    id: habit.id,
    name: habit.name,
    goalDays: habit.goalDays,
    startedAt: startedAt ?? toISODate(),
    endedAt: toISODate(),
    yesCount: yesCount(checkins),
    longestStreak: longestStreak(checkins),
  };
}

async function read(): Promise<Store> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return empty();
  try {
    const parsed = { ...empty(), ...JSON.parse(raw) } as Store;
    parsed.users = parsed.users.map((row) => ({
      ...row,
      history: row.history ?? [],
      habitStartedAt: row.habitStartedAt ?? row.user.createdAt ?? null,
    }));
    return parsed;
  } catch {
    return empty();
  }
}

async function write(store: Store): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(store));
}

function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function displayName(email: string): string {
  const raw = email.split("@")[0] ?? "you";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function current(store: Store) {
  if (!store.sessionUserId) return null;
  return store.users.find((u) => u.user.id === store.sessionUserId) ?? null;
}

function emptyRow(user: User, password: string) {
  return {
    user,
    password,
    habit: null as Habit | null,
    habitStartedAt: null as string | null,
    checkins: [] as Checkin[],
    history: [] as HabitRun[],
    subscription: { plan: "free" as const, period: null, renewsAt: null },
  };
}

export const mockHabitApi: HabitApi = {
  async getBootstrap(): Promise<Bootstrap> {
    const store = await read();
    const row = current(store);
    return {
      onboardingComplete: store.onboardingComplete,
      pendingHabitName: store.pendingHabitName,
      pendingGoalDays: store.pendingGoalDays,
      hasAccount: store.users.length > 0,
      user: asUser(row?.user ?? null),
      habit: asHabit(row?.habit ?? null),
      checkins: row?.checkins ?? [],
      history: row?.history ?? [],
      subscription: asSub(row?.subscription),
    };
  },

  async completeOnboarding(): Promise<void> {
    const store = await read();
    store.onboardingComplete = true;
    await write(store);
  },

  async login({ email, password }) {
    const store = await read();
    const normalized = email.trim().toLowerCase();
    let row = store.users.find((u) => u.user.email === normalized);
    if (!row) {
      row = emptyRow(
        {
          id: id("usr"),
          email: normalized,
          name: displayName(normalized),
          createdAt: toISODate(),
          avatarUri: null,
        },
        password,
      );
      if (store.pendingHabitName) {
        row.habit = {
          id: id("hab"),
          name: store.pendingHabitName,
          goalDays: normalizeGoalDays(store.pendingGoalDays),
        };
        row.habitStartedAt = toISODate();
      }
      store.users.push(row);
    } else {
      if (row.password && row.password !== password) {
        throw new Error("Invalid email or password.");
      }
      if (!row.habit && store.pendingHabitName) {
        row.habit = {
          id: id("hab"),
          name: store.pendingHabitName,
          goalDays: normalizeGoalDays(store.pendingGoalDays),
        };
        row.habitStartedAt = toISODate();
      }
    }
    store.pendingHabitName = null;
    store.pendingGoalDays = null;
    store.sessionUserId = row.user.id;
    await write(store);
    return { user: asUser(row.user) as User };
  },

  async logout() {
    const store = await read();
    store.sessionUserId = null;
    await write(store);
  },

  async getSession() {
    const store = await read();
    const row = current(store);
    return row ? { user: asUser(row.user) as User } : null;
  },

  async getHabit() {
    const store = await read();
    return asHabit(current(store)?.habit ?? null);
  },

  async getHistory() {
    const store = await read();
    return current(store)?.history ?? [];
  },

  async setHabit({ name, goalDays, endCurrent }) {
    const store = await read();
    const nextName = name.trim();
    const nextGoal = clampGoalDays(goalDays);
    const row = current(store);
    if (!row) {
      store.pendingHabitName = nextName;
      store.pendingGoalDays = nextGoal;
      await write(store);
      return { id: "pending", name: nextName, goalDays: nextGoal };
    }
    if (row.habit && row.habit.name === nextName) {
      row.habit.goalDays = nextGoal;
      store.pendingHabitName = null;
      store.pendingGoalDays = null;
      await write(store);
      return row.habit;
    }
    if (row.habit && row.habit.name !== nextName) {
      if (!endCurrent) {
        throw new Error("End this run first");
      }
      row.history = [
        toRun(row.habit, row.checkins, row.habitStartedAt),
        ...row.history,
      ];
      row.checkins = [];
    }
    row.habit = {
      id: id("hab"),
      name: nextName,
      goalDays: nextGoal,
    };
    row.habitStartedAt = toISODate();
    store.pendingHabitName = null;
    store.pendingGoalDays = null;
    await write(store);
    return row.habit;
  },

  async saveCheckin({ date, answer }: { date: string; answer: Answer }) {
    const store = await read();
    const row = current(store);
    if (!row) throw new Error("Not signed in");
    const existing = row.checkins.find((c) => c.date === date);
    if (existing) {
      existing.answer = answer;
      await write(store);
      return existing;
    }
    const created: Checkin = { id: id("chk"), date, answer };
    row.checkins.push(created);
    await write(store);
    return created;
  },

  async getCheckins({ month } = {}) {
    const store = await read();
    const all = current(store)?.checkins ?? [];
    if (!month) return all;
    return all.filter((c) => c.date.startsWith(month));
  },

  async updateProfile({ name, avatarUri }) {
    const store = await read();
    const row = current(store);
    if (!row) throw new Error("Not signed in");
    const nextName = name?.trim();
    if (nextName) row.user.name = nextName;
    if (avatarUri !== undefined) row.user.avatarUri = avatarUri;
    await write(store);
    return { user: asUser(row.user) as User };
  },

  async purchasePlus({ period }) {
    await new Promise((r) => setTimeout(r, 700));
    const store = await read();
    const row = current(store);
    if (!row) throw new Error("Not signed in");
    row.subscription = plusSub(period);
    await write(store);
    return row.subscription;
  },

  async restorePlus() {
    await new Promise((r) => setTimeout(r, 500));
    const store = await read();
    const row = current(store);
    if (!row) throw new Error("Not signed in");
    return asSub(row.subscription);
  },

  async endMockPlus() {
    const store = await read();
    const row = current(store);
    if (!row) throw new Error("Not signed in");
    row.subscription = { plan: "free", period: null, renewsAt: null };
    await write(store);
    return row.subscription;
  },
};
