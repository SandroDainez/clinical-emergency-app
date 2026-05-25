import { Platform } from "react-native";

export type AppRole = "admin" | "user";

const AUTH_ROLE_KEY = "cea_auth_role";
let memoryRole: AppRole | null = null;

function readWebStorageRole(): AppRole | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(AUTH_ROLE_KEY);
  if (value === "admin" || value === "user") return value;
  return null;
}

export function getAuthRole(): AppRole | null {
  if (Platform.OS === "web") {
    return readWebStorageRole();
  }
  return memoryRole;
}

export function setAuthRole(role: AppRole) {
  memoryRole = role;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_ROLE_KEY, role);
  }
}

export function clearAuthRole() {
  memoryRole = null;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_ROLE_KEY);
  }
}
