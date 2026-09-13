/**
 * OPÇÃO DE DECISÃO — Sim · Não · Incerto. ⚠️ A aparência nasce AQUI, ⛔ e ⛔ em
 * nenhuma tela.
 *
 * ── ⚠️⚠️ D-PEND-21 (autor, 2026-09-13) ─────────────────────────────────────
 *
 * > *"opção não marcada é neutra (contorno, sem preenchimento de cor semântica);
 * >  cor só após marcação, sempre acompanhada de ✓ e borda."*
 *
 * ⛔ O que havia antes: Sim nascia verde cheio ⛔ e Não vermelho cheio, marcados ou
 * ⛔ não; a marcada se distinguia ⛔ só por um anel ⛔ e pelo ✓. ⚠️ Numa fileira de
 * três, dois blocos coloridos pareciam duas respostas dadas.
 *
 * ── AS TRÊS APARÊNCIAS ──────────────────────────────────────────────────────
 *
 *   1. **não marcada** — corpo neutro (`controlSurface`) com contorno
 *      (`controlBorder`), texto na cor do texto, ⛔ sem ✓. ⚠️ O corpo ⛔ e o
 *      contorno são as marcas de afordância (`afordancia.ts`): ⛔ neutra ⛔ não é
 *      ⛔ "sem botão".
 *   2. **Sim ou Não marcado** — borda de 2 px na cor do texto, ✓, ⛔ e só então o
 *      verde ou o vermelho, com texto em `onFill`.
 *   3. **Incerto marcado** — borda ⛔ e ✓, ⛔ e ⛔ nenhuma cor: *"Incerto"* ⛔ não é
 *      uma terceira cor, ⛔ é ausência de resposta.
 *
 * ⚠️ A cor ⛔ nunca vem sozinha (**E-15**): borda ⛔ e ✓ dizem o mesmo para quem
 * ⛔ não distingue verde de vermelho. ⚠️ ⛔ E verde ⛔ não é "bom": *"Há
 * hemorragia? Sim"* continua verde, porque a cor identifica a **resposta**.
 */
import type { TextStyle, ViewStyle } from "react-native";

import type { Tema } from "./theme";

export type ChaveDoCorpoDaDecisao = "decisaoNeutra" | "decisaoMarcada" | "decisaoSim" | "decisaoNao";
export type ChaveDoTextoDaDecisao = "decisaoTextoNeutro" | "decisaoTextoPreenchido";

export type EstilosDaOpcaoDeDecisao = Record<ChaveDoCorpoDaDecisao, ViewStyle> & Record<ChaveDoTextoDaDecisao, TextStyle>;

/** ⚠️ Espalhe no `StyleSheet` do desenhador; a tipografia continua sendo dele. */
export function opcaoDeDecisao(tema: Tema): EstilosDaOpcaoDeDecisao {
  return {
    decisaoNeutra: {
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    decisaoMarcada: { borderWidth: 2, borderColor: tema.cores.text },
    decisaoSim: { backgroundColor: tema.cores.successFill },
    decisaoNao: { backgroundColor: tema.cores.criticalFill },
    decisaoTextoNeutro: { color: tema.cores.text },
    decisaoTextoPreenchido: { color: tema.cores.onFill },
  };
}

export type VistaDaOpcaoDeDecisao = {
  /** ⚠️ Em ordem de aplicação: a última chave vence. */
  readonly corpo: readonly ChaveDoCorpoDaDecisao[];
  readonly texto: ChaveDoTextoDaDecisao;
  readonly marca: "✓ " | "";
};

/** ⚠️ `gravado` é o valor na trilha (`sim` · `nao` · `nao_sei`), ⛔ nunca a posição. */
export function vistaDaOpcaoDeDecisao(gravado: string | undefined, marcada: boolean): VistaDaOpcaoDeDecisao {
  if (!marcada) return { corpo: ["decisaoNeutra"], texto: "decisaoTextoNeutro", marca: "" };
  if (gravado === "sim") return { corpo: ["decisaoNeutra", "decisaoMarcada", "decisaoSim"], texto: "decisaoTextoPreenchido", marca: "✓ " };
  if (gravado === "nao") return { corpo: ["decisaoNeutra", "decisaoMarcada", "decisaoNao"], texto: "decisaoTextoPreenchido", marca: "✓ " };
  return { corpo: ["decisaoNeutra", "decisaoMarcada"], texto: "decisaoTextoNeutro", marca: "✓ " };
}
