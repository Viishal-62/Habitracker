import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { getAuthToken, loadAuthToken, setAuthToken } from "../data/authToken";
import { api } from "../data/createApi";
import { readDeviceFlags } from "../data/httpHabitApi";
import {
  clearSessionSnapshot,
  readSessionSnapshot,
  writeSessionSnapshot,
} from "../data/sessionCache";
import type { Answer, BillingPeriod, Checkin, Habit, HabitRun, Subscription, User } from "../data/types";
import { toISODate } from "../lib/dates";
import { currentStreak, yesCount } from "../lib/stats";

const FREE: Subscription = { plan: "free", period: null, renewsAt: null };
let localHydration: Promise<void> | null = null;
let refreshSequence = 0;

export type AppView = {
  ready: boolean;
  localReady: boolean;
  syncing: boolean;
  remoteSettled: boolean;
  hasSessionToken: boolean;
  onboardingComplete: boolean;
  pendingHabitName: string | null;
  hasAccount: boolean;
  user: User | null;
  habit: Habit | null;
  checkins: Checkin[];
  history: HabitRun[];
  today: string;
  todayAnswer: Answer | null;
  subscription: Subscription;
  refresh: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setHabit: (name: string, goalDays: number, endCurrent?: boolean) => Promise<void>;
  saveCheckin: (answer: Answer) => Promise<{ isFirstYes: boolean; hitGoal: boolean }>;
  purchasePlus: (period: BillingPeriod) => Promise<void>;
  restorePlus: () => Promise<Subscription>;
  endMockPlus: () => Promise<void>;
  updateProfile: (input: { name?: string; avatarUri?: string | null }) => Promise<void>;
};

type AppState = {
  ready: boolean;
  localReady: boolean;
  syncing: boolean;
  remoteSettled: boolean;
  hasSessionToken: boolean;
  onboardingComplete: boolean;
  pendingHabitName: string | null;
  hasAccount: boolean;
  user: User | null;
  habit: Habit | null;
  checkins: Checkin[];
  history: HabitRun[];
  today: string;
  subscription: Subscription;
  hydrateLocal: () => Promise<void>;
  syncRemote: () => Promise<void>;
  refresh: () => Promise<void>;
  tickToday: () => void;
  completeOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setHabit: (name: string, goalDays: number, endCurrent?: boolean) => Promise<void>;
  saveCheckin: (answer: Answer) => Promise<{ isFirstYes: boolean; hitGoal: boolean }>;
  purchasePlus: (period: BillingPeriod) => Promise<void>;
  restorePlus: () => Promise<Subscription>;
  endMockPlus: () => Promise<void>;
  updateProfile: (input: { name?: string; avatarUri?: string | null }) => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  localReady: false,
  syncing: false,
  remoteSettled: false,
  hasSessionToken: false,
  onboardingComplete: false,
  pendingHabitName: null,
  hasAccount: false,
  user: null,
  habit: null,
  checkins: [],
  history: [],
  today: toISODate(),
  subscription: FREE,

  hydrateLocal: async () => {
    if (get().localReady) return;
    if (localHydration) return localHydration;

    localHydration = (async () => {
      const [token, device, snapshot] = await Promise.all([
        loadAuthToken().catch(() => null),
        readDeviceFlags().catch(() => ({
          onboardingComplete: false,
          pendingHabitName: null,
          pendingGoalDays: null,
          hasAccount: false,
        })),
        readSessionSnapshot().catch(() => null),
      ]);
      const cached = token ? snapshot : null;

      set({
        ready: true,
        localReady: true,
        hasSessionToken: Boolean(token),
        onboardingComplete: device.onboardingComplete,
        pendingHabitName: device.pendingHabitName,
        hasAccount: device.hasAccount || Boolean(token),
        user: cached?.user ?? null,
        habit: cached?.habit ?? null,
        checkins: cached?.checkins ?? [],
        history: [],
        subscription: cached?.subscription ?? FREE,
      });

      if (!token && snapshot) {
        void clearSessionSnapshot();
      }
    })();

    try {
      await localHydration;
    } finally {
      localHydration = null;
    }
  },

  syncRemote: async () => {
    await get().refresh();
  },

  refresh: async () => {
    const sequence = ++refreshSequence;
    set({ syncing: true });
    try {
      const boot = await api.getBootstrap();
      if (sequence !== refreshSequence) return;
      set({
        onboardingComplete: boot.onboardingComplete,
        pendingHabitName: boot.pendingHabitName,
        hasAccount: boot.hasAccount,
        user: boot.user,
        habit: boot.habit,
        checkins: boot.checkins,
        history: boot.history ?? [],
        subscription: boot.subscription,
        hasSessionToken: Boolean(getAuthToken()),
      });

      if (boot.user) {
        void writeSessionSnapshot({
          user: boot.user,
          habit: boot.habit,
          checkins: boot.checkins,
          subscription: boot.subscription,
        }).catch(() => {});
      } else if (!getAuthToken()) {
        void clearSessionSnapshot();
      }
    } finally {
      if (sequence === refreshSequence) {
        set({ syncing: false, remoteSettled: true });
      }
    }
  },

  tickToday: () => {
    const next = toISODate();
    if (get().today !== next) set({ today: next });
  },

  completeOnboarding: async () => {
    set({ onboardingComplete: true });
    await api.completeOnboarding();
    void get().refresh().catch(() => {});
  },

  login: async (email, password) => {
    await api.login({ email, password });
    set({ hasSessionToken: true });
    try {
      await get().refresh();
    } catch (error) {
      refreshSequence += 1;
      set({
        hasSessionToken: false,
        user: null,
        habit: null,
        checkins: [],
        history: [],
        subscription: FREE,
      });
      await Promise.allSettled([setAuthToken(null), clearSessionSnapshot()]);
      throw error;
    }
  },

  logout: async () => {
    refreshSequence += 1;
    const remoteLogout = api.logout();
    const hasAccount = get().hasAccount || Boolean(get().user);
    set({
      ready: true,
      localReady: true,
      syncing: false,
      remoteSettled: true,
      hasSessionToken: false,
      hasAccount,
      user: null,
      habit: null,
      checkins: [],
      history: [],
      subscription: FREE,
    });
    await Promise.allSettled([setAuthToken(null), clearSessionSnapshot()]);
    void remoteLogout.catch(() => {});
  },

  setHabit: async (name, goalDays, endCurrent) => {
    await api.setHabit({ name, goalDays, endCurrent });
    await get().refresh();
  },

  saveCheckin: async (answer) => {
    const { checkins, today, habit } = get();
    const existing = checkins.find((c) => c.date === today);
    if (existing?.answer === answer) {
      return { isFirstYes: false, hitGoal: false };
    }
    const isFirstYes = answer === "yes" && yesCount(checkins) === 0;
    const before = currentStreak(checkins, today);
    await api.saveCheckin({ date: today, answer });
    const next = existing
      ? checkins.map((c) => (c.date === today ? { ...c, answer } : c))
      : [...checkins, { id: "local", date: today, answer }];
    const after = currentStreak(next, today);
    const goal = habit?.goalDays ?? 0;
    const hitGoal = answer === "yes" && goal > 0 && before < goal && after >= goal;
    await get().refresh();
    return { isFirstYes, hitGoal };
  },

  purchasePlus: async (period) => {
    await api.purchasePlus({ period });
    await get().refresh();
  },

  restorePlus: async () => {
    const sub = await api.restorePlus();
    await get().refresh();
    return sub;
  },

  endMockPlus: async () => {
    await api.endMockPlus();
    await get().refresh();
  },

  updateProfile: async (input) => {
    await api.updateProfile(input);
    await get().refresh();
  },
}));

export function useApp(): AppView {
  return useAppStore(
    useShallow((s) => ({
      ready: s.ready,
      localReady: s.localReady,
      syncing: s.syncing,
      remoteSettled: s.remoteSettled,
      hasSessionToken: s.hasSessionToken,
      onboardingComplete: s.onboardingComplete,
      pendingHabitName: s.pendingHabitName,
      hasAccount: s.hasAccount,
      user: s.user,
      habit: s.habit,
      checkins: s.checkins,
      history: s.history,
      today: s.today,
      todayAnswer: s.checkins.find((c) => c.date === s.today)?.answer ?? null,
      subscription: s.subscription,
      refresh: s.refresh,
      completeOnboarding: s.completeOnboarding,
      login: s.login,
      logout: s.logout,
      setHabit: s.setHabit,
      saveCheckin: s.saveCheckin,
      purchasePlus: s.purchasePlus,
      restorePlus: s.restorePlus,
      endMockPlus: s.endMockPlus,
      updateProfile: s.updateProfile,
    })),
  );
}
