/**
 * Idioma ativo do app (singleton de módulo).
 *
 * Lido INTERNAMENTE pelos getters de texto/áudio/voz (getActiveLocale()) para
 * evitar passar `locale` por centenas de chamadas e NÃO tocar no reducer ACLS.
 * O LanguageProvider (lib/language-context.tsx) chama setActiveLocale() e força
 * o re-render da árvore React.
 *
 * IMPORTANTE: este módulo NÃO importa react-native de propósito — ele entra no
 * grafo de imports do engine.ts (presentation → locales → locale), que é
 * compilado isoladamente pelos scripts de teste sem skipLibCheck. Importar
 * react-native aqui quebraria esse compile. A detecção de plataforma é feita
 * apenas por checagem de `window`/`localStorage` (web) — no native cai em memória.
 */

export type AppLocale = "pt-BR" | "es-419";

const LOCALE_KEY = "cea_active_locale";
const DEFAULT_LOCALE: AppLocale = "pt-BR";

function isAppLocale(value: unknown): value is AppLocale {
  return value === "pt-BR" || value === "es-419";
}

function getWebStorage(): Storage | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // acesso ao storage pode lançar (modo privado etc.) — trata como indisponível
  }
  return null;
}

function readWebStorageLocale(): AppLocale | null {
  const storage = getWebStorage();
  if (!storage) return null;
  const value = storage.getItem(LOCALE_KEY);
  return isAppLocale(value) ? value : null;
}

// Fonte de verdade ÚNICA em memória, guardada em globalThis para sobreviver a
// eventuais múltiplas instâncias do módulo no bundle (evita o idioma "preso":
// o seletor mudava o estado React mas getActiveLocale lia outra fonte).
// O localStorage é usado só para INICIALIZAR (lembrar a escolha entre sessões),
// nunca relido a cada chamada — assim o valor definido por setActiveLocale vale
// imediatamente.
const GLOBAL_KEY = "__cea_active_locale_store__";

type LocaleStore = { value: AppLocale; listeners: Set<() => void> };

function getStore(): LocaleStore {
  const g = globalThis as unknown as Record<string, LocaleStore | undefined>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = { value: readWebStorageLocale() ?? DEFAULT_LOCALE, listeners: new Set() };
  }
  return g[GLOBAL_KEY] as LocaleStore;
}

export function getDefaultLocale(): AppLocale {
  return DEFAULT_LOCALE;
}

export function getActiveLocale(): AppLocale {
  return getStore().value;
}

export function setActiveLocale(locale: AppLocale) {
  const store = getStore();
  if (store.value === locale) return;
  store.value = locale; // vale imediatamente para tr()/áudio/voz
  const storage = getWebStorage();
  if (storage) {
    try {
      storage.setItem(LOCALE_KEY, locale); // persiste para a próxima sessão
    } catch {
      // ignora falha de escrita
    }
  }
  // Notifica os componentes inscritos (useSyncExternalStore) → re-render.
  store.listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // listener individual não deve quebrar os demais
    }
  });
}

/** Inscreve um listener para mudanças de idioma. Retorna o cancelador. */
export function subscribeLocale(listener: () => void): () => void {
  const store = getStore();
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}
