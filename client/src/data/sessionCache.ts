import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { bytesToHex, concatBytes, hexToBytes } from "@noble/ciphers/utils.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { Checkin, Habit, Subscription, User } from "./types";

const CACHE_KEY = "chooseone.session-cache.v1";
const ENCRYPTION_KEY = "chooseone.session-cache-key.v1";
const KEY_BYTES = 32;
const NONCE_BYTES = 24;
const MAX_RECENT_CHECKINS = 120;

export type SessionSnapshot = {
  version: 1;
  savedAt: string;
  user: User;
  habit: Habit | null;
  checkins: Checkin[];
  subscription: Subscription;
};

let encryptionKeyPromise: Promise<Uint8Array> | null = null;
let cacheGeneration = 0;

async function getEncryptionKey(): Promise<Uint8Array> {
  if (encryptionKeyPromise) return encryptionKeyPromise;

  encryptionKeyPromise = (async () => {
    const stored = await SecureStore.getItemAsync(ENCRYPTION_KEY);
    if (stored) return hexToBytes(stored);

    const created = await Crypto.getRandomBytesAsync(KEY_BYTES);
    await SecureStore.setItemAsync(ENCRYPTION_KEY, bytesToHex(created));
    return created;
  })();

  try {
    return await encryptionKeyPromise;
  } catch (error) {
    encryptionKeyPromise = null;
    throw error;
  }
}

export async function readSessionSnapshot(): Promise<SessionSnapshot | null> {
  if (Platform.OS === "web") return null;

  const encoded = await AsyncStorage.getItem(CACHE_KEY);
  if (!encoded) return null;

  try {
    const payload = hexToBytes(encoded);
    if (payload.length <= NONCE_BYTES) throw new Error("Invalid session cache");

    const key = await getEncryptionKey();
    const nonce = payload.slice(0, NONCE_BYTES);
    const ciphertext = payload.slice(NONCE_BYTES);
    const plaintext = xchacha20poly1305(key, nonce).decrypt(ciphertext);
    const parsed = JSON.parse(new TextDecoder().decode(plaintext)) as SessionSnapshot;

    if (parsed.version !== 1 || !parsed.user?.id) {
      throw new Error("Unsupported session cache");
    }
    return parsed;
  } catch {
    await AsyncStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export async function writeSessionSnapshot(
  snapshot: Omit<SessionSnapshot, "version" | "savedAt">,
): Promise<void> {
  if (Platform.OS === "web") return;

  const generation = cacheGeneration;
  const key = await getEncryptionKey();
  const nonce = await Crypto.getRandomBytesAsync(NONCE_BYTES);
  const value: SessionSnapshot = {
    ...snapshot,
    version: 1,
    savedAt: new Date().toISOString(),
    checkins: [...snapshot.checkins]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-MAX_RECENT_CHECKINS),
  };
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = xchacha20poly1305(key, nonce).encrypt(plaintext);
  if (generation !== cacheGeneration) return;
  await AsyncStorage.setItem(CACHE_KEY, bytesToHex(concatBytes(nonce, ciphertext)));
}

export async function clearSessionSnapshot(): Promise<void> {
  cacheGeneration += 1;
  await AsyncStorage.removeItem(CACHE_KEY);
}
