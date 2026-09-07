/**
 * OS SETE ESTADOS — ⚠️ **a semântica**, ⛔ e ⛔ nenhum pixel.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ESTE ARQUIVO EXISTE SEPARADO ───────────────────────────
 *
 * ⛔ Na Fase 1 eu pus os sete estados **inteiros** em `design-system/`, ⛔ e o
 * núcleo clínico passou a importar de lá:
 *
 *   ⛔ `avc/nucleo/ameacas-imediatas.ts` → `design-system/estados-clinicos`
 *   ⛔ `avc/nucleo/problemas-ativos.ts`  → `design-system/estados-clinicos`
 *
 * ⚠️⚠️ ⛔ ISSO É A CAMADA ERRADA, ⛔ e fui eu que introduzi. ⛔ O motor clínico
 * passou a depender do sistema de desenho: ⛔ mexer numa cor ⛔ ou num símbolo
 * tocaria o grafo de quem decide conduta. ⚠️ É ⛔ exatamente o acoplamento que o
 * **item 7** do aceite da Fase 3 proíbe — *"⛔ não houver consumidor lendo
 * componente de UI"* — ⛔ e eu ia escrever a prova disso com o defeito dentro.
 *
 * ── ⚠️ A DIVISÃO ──────────────────────────────────────────────────────────
 *
 * ⛔ **Aqui:** ⛔ o que os estados **são** ⛔ e como se ordenam por urgência.
 *    ⛔ Semântica clínica, ⛔ legível por ⛔ qualquer módulo, ⛔ sem tema.
 * ⛔ **Em `design-system/estados-clinicos`:** ⛔ como ⛔ eles **aparecem** —
 *    símbolo, rótulo ⛔ e cor. ⛔ Apresentação, ⛔ e ⛔ nada mais.
 *
 * ⚠️ ⛔ O núcleo importa **daqui**. ⛔ Nunca de lá.
 */

export type EstadoClinico =
  | "favoravel"
  | "corrigivel"
  | "verificar"
  | "impede"
  | "andamento"
  | "ausente"
  | "medido";

/**
 * ⚠️⚠️ A ORDEM É A DA **URGÊNCIA**, ⛔ e ⛔ ela ⛔ não é decorativa: quem lista
 * problemas ativos ordena por ela, ⛔ e o que **impede** vem antes do que
 * **falta**.
 *
 * ⚠️ Ela vive aqui, ⛔ e ⛔ não no design system, porque é **julgamento
 * clínico** — ⛔ qual problema o médico deve ver primeiro —, ⛔ e ⛔ não
 * hierarquia visual.
 */
export const ORDEM_DOS_ESTADOS: readonly EstadoClinico[] = [
  "impede",
  "corrigivel",
  "andamento",
  "verificar",
  "medido",
  "favoravel",
  "ausente",
];
