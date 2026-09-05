/**
 * ARMAZENAMENTO LOCAL — iOS/Android.
 *
 * `expo-sqlite/kv-store` (já dependência do app) tem API **síncrona**, o que o
 * AsyncStorage ⛔ não tem — ⛔ e a tela lê no primeiro efeito, ⛔ sem estado de
 * "carregando". Mesma interface do arquivo web; o Metro escolhe este pela
 * extensão `.native.ts`.
 */
import Storage from "expo-sqlite/kv-store";
import type { ArmazenamentoLocal } from "./armazenamento-local";

export type { ArmazenamentoLocal };

export function armazenamentoLocal(): ArmazenamentoLocal | null {
  try {
    return {
      ler: (k) => Storage.getItemSync(k),
      gravar: (k, v) => Storage.setItemSync(k, v),
      apagar: (k) => {
        Storage.removeItemSync(k);
      },
    };
  } catch {
    return null;
  }
}
