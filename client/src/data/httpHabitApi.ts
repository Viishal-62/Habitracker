import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getAuthToken, loadAuthToken, setAuthToken } from "./authToken";
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

const DEVICE_KEY = "chooseone.device.v1";

export type DeviceFlags = {
  onboardingComplete: boolean;
  pendingHabitName: string | null;
  pendingGoalDays: number | null;
  hasAccount: boolean;
};

const emptyDevice = (): DeviceFlags => ({
  onboardingComplete: false,
  pendingHabitName: null,
  pendingGoalDays: null,
  hasAccount: false,
});

export async function readDeviceFlags(): Promise<DeviceFlags> {
  try {
    const raw = await AsyncStorage.getItem(DEVICE_KEY);
    if (!raw) return emptyDevice();
    return { ...emptyDevice(), ...JSON.parse(raw) } as DeviceFlags;
  } catch {
    return emptyDevice();
  }
}

async function writeDevice(next: DeviceFlags): Promise<void> {
  await AsyncStorage.setItem(DEVICE_KEY, JSON.stringify(next));
}

function hostFromExpo(): string | null {
  const raw =
    Constants.expoConfig?.hostUri ??
    Constants.linkingUri ??
    "";
  if (!raw) return null;
  try {
    const normalized = raw.startsWith("exp://")
      ? raw.replace("exp://", "http://")
      : raw.includes("://")
        ? raw
        : `http://${raw}`;
    return new URL(normalized).hostname;
  } catch {
    return raw.split(":")[0] || null;
  }
}

function extraApiUrl(): string | undefined {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  return extra?.apiUrl;
}

function baseUrl(): string {
  const explicit = (process.env.EXPO_PUBLIC_API_URL ?? extraApiUrl())?.replace(
    /\/$/,
    "",
  );
  if (explicit) return explicit;
  const host = hostFromExpo();
  if (host) return `http://${host}:3000`;
  throw new Error("EXPO_PUBLIC_API_URL is not set");
}

async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  tokenOverride?: string | null,
): Promise<T> {
  await loadAuthToken();
  const token = tokenOverride === undefined ? getAuthToken() : tokenOverride;
  const headers = new Headers(init?.headers);
  const body = init?.body;
  const isForm =
    !!body && typeof body === "object" && "append" in body && typeof body.append === "function";
  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("ngrok-skip-browser-warning", "true");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${baseUrl()}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await parseBody<{ error?: string; message?: string }>(res).catch(() => null);
    if (res.status === 401) {
      throw new Error(err?.error ?? err?.message ?? "Invalid email or password.");
    }
    throw new Error(err?.error ?? err?.message ?? `API request failed (${res.status})`);
  }
  return parseBody<T>(res);
}

function photoPart(uri: string): { uri: string; name: string; type: string } {
  const ext = uri.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "jpg";
  const safe = ext === "png" || ext === "webp" || ext === "heic" ? ext : "jpg";
  const type =
    safe === "png" ? "image/png" : safe === "webp" ? "image/webp" : "image/jpeg";
  return { uri, name: `avatar.${safe}`, type };
}

async function pushPendingHabit(): Promise<void> {
  const device = await readDeviceFlags();
  if (!device.pendingHabitName || !device.pendingGoalDays) return;
  await request<Habit>("/habit", {
    method: "POST",
    body: JSON.stringify({
      name: device.pendingHabitName,
      goalDays: device.pendingGoalDays,
    }),
  });
  await writeDevice({
    ...device,
    pendingHabitName: null,
    pendingGoalDays: null,
  });
}

export const httpHabitApi: HabitApi = {
  async getBootstrap(): Promise<Bootstrap> {
    await loadAuthToken();
    const requestToken = getAuthToken();
    const device = await readDeviceFlags();
    const boot = await request<Bootstrap>("/bootstrap", undefined, requestToken);
    if (requestToken && requestToken === getAuthToken() && !boot.user) {
      await setAuthToken(null);
    }
    return {
      ...boot,
      onboardingComplete: device.onboardingComplete || boot.onboardingComplete,
      pendingHabitName: boot.pendingHabitName ?? device.pendingHabitName,
      pendingGoalDays: boot.pendingGoalDays ?? device.pendingGoalDays,
      hasAccount: device.hasAccount || boot.hasAccount || Boolean(getAuthToken()),
      history: boot.history ?? [],
    };
  },

  async completeOnboarding(): Promise<void> {
    const device = await readDeviceFlags();
    try {
      await writeDevice({ ...device, onboardingComplete: true });
    } catch {
      // In-memory onboarding state can still continue this session.
    }
    try {
      await request<void>("/onboarding/complete", { method: "POST" });
    } catch {
      // Device flag is what the gate uses.
    }
  },

  async login(input) {
    const data = await request<{ user: User; token: string }>("/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await setAuthToken(data.token);
    try {
      const device = await readDeviceFlags();
      await writeDevice({ ...device, hasAccount: true });
    } catch {
      // A successful login must not fail because device metadata could not persist.
    }
    try {
      await pushPendingHabit();
    } catch {
      // Habit can be set again from pick-habit if this fails.
    }
    return { user: data.user };
  },

  async logout() {
    const requestToken = getAuthToken() ?? (await loadAuthToken());
    try {
      await request<void>("/logout", { method: "POST" }, requestToken);
    } catch {
      // Local sign-out still wins.
    }
    await setAuthToken(null);
  },

  getSession: () => request<{ user: User } | null>("/session"),
  getHabit: () => request<Habit | null>("/habit"),
  getHistory: () => request<HabitRun[]>("/history"),

  async setHabit(input) {
    if (!getAuthToken()) {
      await loadAuthToken();
    }
    if (!getAuthToken()) {
      const device = await readDeviceFlags();
      await writeDevice({
        ...device,
        pendingHabitName: input.name.trim(),
        pendingGoalDays: input.goalDays,
      });
      return {
        id: "pending",
        name: input.name.trim(),
        goalDays: input.goalDays,
      };
    }
    const habit = await request<Habit>("/habit", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        goalDays: input.goalDays,
        endCurrent: input.endCurrent,
      }),
    });
    const device = await readDeviceFlags();
    await writeDevice({
      ...device,
      pendingHabitName: null,
      pendingGoalDays: null,
    });
    return habit;
  },

  saveCheckin: (input: { date: string; answer: Answer }) =>
    request<Checkin>("/checkin", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getCheckins: (input) => {
    const query = input?.month ? `?month=${encodeURIComponent(input.month)}` : "";
    return request<Checkin[]>(`/checkins${query}`);
  },

  async updateProfile(input) {
    let user: User | undefined;
    if (input.name !== undefined) {
      ({ user } = await request<{ user: User }>("/profile", {
        method: "POST",
        body: JSON.stringify({ name: input.name }),
      }));
    }
    if (input.avatarUri) {
      const form = new FormData();
      form.append("photo", photoPart(input.avatarUri) as unknown as Blob);
      ({ user } = await request<{ user: User }>("/profile/avatar", {
        method: "POST",
        body: form,
      }));
    }
    if (!user) throw new Error("Nothing to update");
    return { user };
  },

  purchasePlus: (input) =>
    request<Subscription>("/plus/purchase", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  restorePlus: () =>
    request<Subscription>("/plus/restore", { method: "POST" }),
  endMockPlus: () =>
    request<Subscription>("/plus/end", { method: "POST" }),
};
