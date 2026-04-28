import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const isBrowser = typeof window !== "undefined"

const memoryStorage = {
  async getItem() {
    return null;
  },
  async setItem() {
    return;
  },
  async removeItem() {
    return;
  },
};

const storage = {
  async getItem(key: string) {
    if (!isBrowser) {
      return memoryStorage.getItem(key);
    }
    if (Platform.OS === "web") {
      return window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (!isBrowser) {
      return memoryStorage.setItem(key, value);
    }
    if (Platform.OS === "web") {
      window.localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (!isBrowser) {
      return memoryStorage.removeItem(key);
    }
    if (Platform.OS === "web") {
      window.localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
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
