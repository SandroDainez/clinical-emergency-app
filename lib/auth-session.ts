import { Platform } from "react-native";

import { supabase } from "./supabase";
import { invalidarProva } from "./prova-de-acesso";

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

/**
 * ⚠️⚠️ SAIR DA CONTA — a porta **única**, e é por isso que ela existe.
 *
 * ⛔ Havia duas saídas (`admin-users.tsx` e `module-hub.tsx`), cada uma chamando
 * `signOut()` por conta própria. ⚠️ Com duas, a próxima regra de logout entraria
 * numa e ⛔ não na outra — e a que ⛔ ninguém revisasse seria a que fica errada.
 *
 * ⚠️⚠️ A prova de acesso é **destruída aqui**. Ela já é vinculada ao `user_id`,
 * ⛔ então trocar de conta ⛔ não herdaria autorização — ⛔ mas estado residual de
 * autorização ⛔ não deve sobreviver a uma saída explícita. ⚠️ Menos estado, menos
 * raciocínio necessário para provar que ⛔ nada vazou.
 */
export async function sairDaConta(): Promise<void> {
  invalidarProva();
  clearAuthRole();
  await supabase?.auth.signOut();
}
