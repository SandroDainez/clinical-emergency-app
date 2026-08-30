/**
 * A LEITURA — a forma de tudo que o sistema DIZ ao médico, em qualquer
 * superfície do AVC.
 *
 * ⚠️ REGRAS QUE GOVERNAM QUALQUER LEITURA:
 *   · §4.1 — o dado ⛔ não carrega a própria interpretação;
 *   · §4.3 — derivado ⛔ nunca é persistido como verdade clínica;
 *   · E-22 — toda derivação **declara os insumos** e a **fonte**;
 *   · E-23 — ⛔ ausência de dado NUNCA vira dado negativo;
 *   · E-46 — leitura do sistema é **apoio**, ⛔ nunca veredito.
 *
 * ── POR QUE ISTO SAIU DE `derivacoes.ts` (2026-08-28) ──────────────────────
 *
 * `ternario()` é a função que decide quando um vazio vira "não" — e é a que
 * E-23 existe para governar. Com a Superfície B, ela seria escrita de novo
 * noutro arquivo, e duas versões dela é a forma mais direta de um "não sei"
 * virar "não" numa superfície e não na outra. Uma cópia só, lida pelas duas.
 */

import type { EstadoAvc } from "./estado";
import { valorAtual } from "./estado";
import { itensSelecionados } from "./selecao";

export type Leitura = {
  readonly conclusao: "sim" | "nao" | "desconhecido";
  /**
   * O que o médico lê de relance — curto e acionável.
   *
   * ⚠️ É esta frase que vai para a tela de atendimento. A longa fica atrás do
   * ⓘ, junto com insumos e fonte: rastreabilidade ⛔ não pode disputar espaço
   * com conduta na porta do pronto-socorro (§7.3).
   */
  readonly curto: string;
  /**
   * ⚠️⚠️ DE QUEM A LEITURA FALA, quando a mesma frase serve a vários sujeitos.
   *
   * ⚠️ Na maioria das superfícies a frase já se nomeia ("Exclusão de hemorragia
   * ⛔ não estabelecida"). No Laboratório ⛔ não: `Resultado registrado` cabe em
   * quatro analitos, e quatro linhas idênticas ⛔ **não dizem nada**. O sujeito é
   * o rótulo do analito, e a tela o prefixa.
   */
  readonly sujeito?: string;
  /**
   * ⚠️⚠️ OS ESTUDOS QUE SUSTENTAM A LEITURA — e a tela os **nomeia**.
   *
   * ⚠️ Sem isto, *"Exames de imagem com resultados divergentes"* ⛔ não diz
   * **quais**: com três exames na tela, o médico ⛔ não sabe onde está o conflito
   * que retém a reperfusão. **E-30**: a leitura diz de onde veio.
   */
  readonly estudos?: readonly string[];
  /**
   * Quanto esta leitura pede da atenção **agora**.
   *
   * ⚠️⚠️ ⛔ NÃO É A POLARIDADE DA CONCLUSÃO, e a diferença é clínica. "SpO₂ acima
   * da meta" e "SpO₂ abaixo da meta" são ambas `conclusao` definida, e só uma
   * delas pede alguma coisa. No outro sentido, "peso não informado" é
   * `desconhecido` e ainda assim merece destaque, porque alimenta dose.
   *
   * ⚠️ `atencao` ⛔ NUNCA significa "bloqueia": ⛔ nenhuma leitura do módulo trava
   * terapia tempo-dependente (E-49). Significa "olhe para isto primeiro".
   */
  readonly tom: "atencao" | "pendente" | "informativo";
  /** Frase de apoio, em PT. ⛔ Traduzida no render, nunca aqui. */
  readonly texto: string;
  /** Os campos que produziram esta leitura (E-22). */
  readonly insumos: readonly string[];
  /** O slot de fonte que a sustenta (E-30). */
  readonly fonte: string;
};

/** ⚠️ Os dois vazios de §4.2 — e ⛔ nenhum deles é resposta negativa. */
export const VAZIOS: readonly string[] = ["nao_perguntado", "nao_sei"];

/** O valor numérico de um campo, ou `undefined` quando vazio ou não informado. */
export function numero(estado: EstadoAvc, campo: string): number | undefined {
  const f = valorAtual(estado, campo);
  if (!f) return undefined;
  if (typeof f.valor === "number") return f.valor;
  return undefined;
}

/**
 * `true`/`false`/`undefined` para campos de resposta. ⛔ Vazio nunca vira `false`.
 *
 * ⚠️⚠️ ⛔ NÃO USAR EM CAMPO DE VOCABULÁRIO PRÓPRIO (origem do peso, lateralidade,
 * mRS, decisão assumida). Ali o valor gravado é o próprio rótulo, e ⛔ nenhum
 * deles é `"sim"` — a função devolveria `false` para TODOS, transformando
 * "Direito" e "Esquerdo" em "não" com a mesma cara de resposta legítima. As
 * provas de superfície conferem que isso não acontece.
 */
export function ternario(estado: EstadoAvc, campo: string): boolean | undefined {
  const f = valorAtual(estado, campo);
  if (!f) return undefined;
  if (VAZIOS.includes(String(f.valor))) return undefined;
  return f.valor === "sim";
}

/**
 * Os achados marcados num campo de seleção múltipla.
 *
 * ⚠️⚠️ ⛔ NUNCA LER ESSE CAMPO POR `ternario()`: o valor gravado é a composição
 * dos rótulos, ⛔ nenhum deles é `"sim"`, e a função devolveria `false` — cinco
 * achados presentes lidos como "não há disfunção". É a negativa silenciosa que
 * E-23 proíbe, na pergunta que decide via aérea.
 */
export function selecaoDe(estado: EstadoAvc, campo: string): readonly string[] {
  const f = valorAtual(estado, campo);
  if (!f || typeof f.valor !== "string") return [];
  if (VAZIOS.includes(f.valor)) return [];
  return itensSelecionados(f.valor);
}

/** O rótulo gravado de um campo de vocabulário próprio. ⛔ Nunca passa por `ternario`. */
export function rotuloGravado(estado: EstadoAvc, campo: string): string | undefined {
  const f = valorAtual(estado, campo);
  if (!f) return undefined;
  const v = String(f.valor);
  return VAZIOS.includes(v) ? undefined : v;
}

/** ⚠️ O campo foi respondido com a incerteza explícita — ⛔ diferente de não perguntado. */
export function respondeuDesconhecido(estado: EstadoAvc, campo: string): boolean {
  return String(valorAtual(estado, campo)?.valor ?? "") === "nao_sei";
}
