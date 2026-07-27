import React, { useCallback, useSyncExternalStore } from "react";
import {
  getActiveLocale,
  setActiveLocale,
  subscribeLocale,
  type AppLocale,
} from "./locale";

/**
 * Idioma do app via store externo (lib/locale.ts) + useSyncExternalStore.
 *
 * Por que assim: a abordagem anterior (Context + singleton lido por tr()) podia
 * ficar dessincronizada em produção — o seletor mudava, mas as telas não
 * re-renderizavam de forma confiável (idioma "preso"). useSyncExternalStore é o
 * mecanismo canônico do React para assinar um store externo: TODO componente que
 * chama useLanguage() re-renderiza no lugar quando o idioma muda, sem remontar.
 */

type LanguageContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

export function useLanguage(): LanguageContextValue {
  const locale = useSyncExternalStore(subscribeLocale, getActiveLocale, getActiveLocale);
  const setLocale = useCallback((next: AppLocale) => {
    setActiveLocale(next); // atualiza o store + notifica → re-render de todos
  }, []);
  return { locale, setLocale };
}

/**
 * Mantido por compatibilidade com app/_layout.tsx. Não precisa mais segurar
 * estado — o store externo é a fonte de verdade — então é só um passthrough.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
