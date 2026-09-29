import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "chooseone.jwt";

let memory: string | null = null;
let loaded = false;
let loading: Promise<string | null> | null = null;

function tokenIsExpired(token: string): boolean {
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return true;
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(globalThis.atob(padded)) as { exp?: number };
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return true;
  }
}

async function removeStoredToken(): Promise<void> {
  try {
    if (Platform.OS === "web") await AsyncStorage.removeItem(KEY);
    else await SecureStore.deleteItemAsync(KEY);
  } catch {
    // Memory state still prevents this token from being reused.
  }
}

export function getAuthToken(): string | null {
  if (memory && tokenIsExpired(memory)) {
    memory = null;
    void removeStoredToken();
  }
  return memory;
}

export async function loadAuthToken(): Promise<string | null> {
  if (loaded) return memory;
  if (loading) return loading;

  loading = (async () => {
    try {
      memory =
        Platform.OS === "web"
          ? await AsyncStorage.getItem(KEY)
          : await SecureStore.getItemAsync(KEY);
      if (memory && tokenIsExpired(memory)) {
        memory = null;
        await removeStoredToken();
      }
    } catch {
      memory = null;
    }
    loaded = true;
    return memory;
  })();

  try {
    return await loading;
  } finally {
    loading = null;
  }
}

export async function setAuthToken(token: string | null): Promise<void> {
  memory = token;
  loaded = true;
  try {
    if (Platform.OS === "web") {
      if (token) await AsyncStorage.setItem(KEY, token);
      else await AsyncStorage.removeItem(KEY);
      return;
    }
    if (token) await SecureStore.setItemAsync(KEY, token);
    else await SecureStore.deleteItemAsync(KEY);
  } catch {
    // Token still lives in memory for this session.
  }
}
