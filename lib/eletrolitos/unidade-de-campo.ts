/**
 * A UNIDADE É DO CAMPO — nunca do rótulo em prosa.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A REGRA (autor, 2026-08-23) — e ela é do app, não de um módulo
 *
 *   **O campo identifica obrigatoriamente a unidade. Armazenar uma unidade
 *   canônica e converter de forma programática e auditável. Não permitir que um
 *   valor seja interpretado sem unidade.**
 *
 * ⚠️ E O MOTIVO QUE FECHA A DISCUSSÃO: **unidade em prosa é TRADUZÍVEL; unidade
 * em campo, não.**
 *
 * O app tem uma segunda cópia de todo texto em espanhol. Uma tradução que
 * escreva "Peso (lb)" — por descuido ou por convenção local — **muda a unidade
 * de entrada de um cálculo, e nenhum instrumento vê**, porque para eles aquilo é
 * só prosa.
 *
 * Não aconteceu. Mas é o **mesmo mecanismo** do D-80, onde o critério da
 * hidrocortisona DE FATO divergiu entre os idiomas. Ali era conduta; aqui seria
 * unidade de dose.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️ "SEM UNIDADE" E "ADIMENSIONAL" NÃO SÃO A MESMA COISA
 *
 * pH não tem unidade **por propriedade**, não por esquecimento. Se os dois forem
 * representados do mesmo jeito no dado, o instrumento nunca distingue um do
 * outro — e a trava vira negociável no primeiro caso duvidoso.
 */
export type UnidadeDeCampo =
  | "mg/dL" | "mEq/L" | "mmol/L" | "g/dL"
  | "kg" | "mL" | "h" | "mcg/kg/min" | "UI" | "%" | "mmHg"
  /** ⚠️ NÃO é ausência de unidade: é a declaração de que a grandeza não tem uma. */
  | "adimensional"
  /** Escore, contagem, idade — número puro por natureza. */
  | "pontos";

/**
 * O rótulo com a unidade — DERIVADO do campo, mesmo princípio do corte.
 *
 * ⚠️ A prosa pode continuar mostrando a unidade; o que não pode é ela ser a
 * fonte. Quem manda é o campo, e este texto sai dele.
 */
export function rotuloComUnidade(nome: string, unidade: UnidadeDeCampo): string {
  if (unidade === "adimensional" || unidade === "pontos") return nome;
  return `${nome} (${unidade})`;
}
