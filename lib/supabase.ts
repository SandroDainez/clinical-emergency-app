import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function getWebStorage(): Storage | null {
  if (Platform.OS !== "web") {
    return null;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    return globalThis.localStorage as Storage;
  }

  return null;
}

const memoryStorage = {
  async getItem(_key: string) {
    return null;
  },
  async setItem(_key: string, _value: string) {
    return;
  },
  async removeItem(_key: string) {
    return;
  },
};

const storage = {
  async getItem(key: string) {
    const webStorage = getWebStorage();
    if (webStorage) {
      return webStorage.getItem(key);
    }
    if (Platform.OS !== "web") {
      return AsyncStorage.getItem(key);
    }
    return memoryStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.setItem(key, value);
      return;
    }
    if (Platform.OS !== "web") {
      await AsyncStorage.setItem(key, value);
      return;
    }
    return memoryStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.removeItem(key);
      return;
    }
    if (Platform.OS !== "web") {
      await AsyncStorage.removeItem(key);
      return;
    }
    return memoryStorage.removeItem(key);
  },
};

// In local dev without .env.local, supabase will be null.
// Features that require Supabase (session persistence, AI) will be silently disabled.
export const supabase = supabaseUrl
  && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
