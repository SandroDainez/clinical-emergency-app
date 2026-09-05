/**
 * ARMAZENAMENTO LOCAL — web.
 *
 * `window.localStorage` quando existe; sem ele (Node nos testes, modo privado,
 * render estático) devolve `null`, ⛔ e quem chama decide o que fazer com a
 * ausência. ⚠️ Aqui ⛔ não há fallback em memória de propósito: um "aceite"
 * ⛔ ou uma preferência que vivem só no processo somem no reload ⛔ sem avisar, ⛔ e
 * o chamador passaria a acreditar num dado que ⛔ não persiste.
 *
 * ⚠️ O NATIVO tem o seu arquivo, `armazenamento-local.native.ts`, escolhido pelo
 * Metro em iOS/Android. Os dois expõem a MESMA interface **síncrona** — é o que
 * permite ler no primeiro efeito da tela, ⛔ sem estado de "carregando".
 */
export type ArmazenamentoLocal = {
  ler(chave: string): string | null;
  gravar(chave: string, valor: string): void;
  apagar(chave: string): void;
};

export function armazenamentoLocal(): ArmazenamentoLocal | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const disco = window.localStorage;
    return {
      ler: (k) => disco.getItem(k),
      gravar: (k, v) => disco.setItem(k, v),
      apagar: (k) => disco.removeItem(k),
    };
  } catch {
    // acesso ao storage pode lançar (modo privado etc.) — trata como indisponível
    return null;
  }
}
