/**
 * Q-01 · A FRONTEIRA ÚNICA DE RELÓGIO DO MÓDULO AVC.
 *
 * ⚠️ NENHUM outro arquivo do domínio clínico do AVC pode chamar `Date.now()`.
 * Se precisar de tempo, recebe um `Relogio`.
 *
 * POR QUE ISTO EXISTE (spec §8.7, E-01, E-21):
 * o AVC tem um derivado que muda SEM QUE NENHUM DADO MUDE — a janela terapêutica
 * fecha porque o relógio andou. Um sistema que só recalcula "quando algo muda"
 * nunca recalcula esse caso, porque nada muda.
 *
 * E as provas de natureza T (§8.2) exigem tempo INJETÁVEL: sem isto, E-01, E-21
 * e E-38 ficam sem prova nenhuma — não é preferência de teste, é a diferença
 * entre exigência verificável e exigência declarada.
 *
 * ⛔ Este arquivo é deliberadamente RN-free e sem dependência: roda em node puro,
 * para que a prova do núcleo não precise de bundler.
 */

/** Instante em milissegundos desde a época. Um número, nunca um `Date` mutável. */
export type Instante = number;

/**
 * A única porta de tempo do módulo.
 *
 * ⚠️ É intencionalmente MÍNIMA. Formatação, fuso e apresentação não moram aqui —
 * relógio responde "que horas são", e nada mais.
 */
export type Relogio = {
  agora(): Instante;
};

/** Produção. */
export const relogioDoSistema: Relogio = {
  agora: () => Date.now(),
};

/**
 * Relógio controlado, para teste e para as provas de natureza **T**.
 *
 * ⚠️ `avancar` existe porque a passagem do tempo é o gatilho que não emite
 * evento (§4.4-ii). Sem poder avançar o relógio, não há como provar que o
 * derivado muda sozinho.
 */
export type RelogioControlado = Relogio & {
  /** Move o relógio para frente. Aceita só valores não negativos. */
  avancar(ms: number): void;
  /** Põe o relógio num instante exato. */
  definir(instante: Instante): void;
};

export function relogioControlado(inicial: Instante = 0): RelogioControlado {
  let t = inicial;
  return {
    agora: () => t,
    avancar(ms: number) {
      // ⚠️ Mensagem de invariante, para quem depura — ⛔ nunca chega à tela.
      if (ms < 0) throw new Error("relogioControlado.avancar: o tempo não anda para trás");
      t += ms;
    },
    definir(instante: Instante) {
      t = instante;
    },
  };
}

/**
 * Tempo decorrido entre dois instantes, em minutos.
 *
 * ⚠️ Devolve `undefined` quando o marco não é conhecido — e isso é deliberado:
 * "não sei quando começou" NÃO é "começou agora" (E-02). Um `0` aqui seria a
 * mentira mais cara do módulo.
 */
export function minutosDesde(marco: Instante | undefined, relogio: Relogio): number | undefined {
  if (marco === undefined) return undefined;
  return Math.floor((relogio.agora() - marco) / 60_000);
}
