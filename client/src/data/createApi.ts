import Constants from "expo-constants";
import { httpHabitApi } from "./httpHabitApi";
import { mockHabitApi } from "./mockHabitApi";
import type { HabitApi } from "./types";

const extra = Constants.expoConfig?.extra as { useMock?: boolean } | undefined;
const useMock =
  process.env.EXPO_PUBLIC_USE_MOCK === "true" || extra?.useMock === true;

export const api: HabitApi = useMock ? mockHabitApi : httpHabitApi;
