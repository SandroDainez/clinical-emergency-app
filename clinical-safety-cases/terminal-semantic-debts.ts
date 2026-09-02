export type TerminalSemanticDebt = {
  protocolId: string;
  nodeId: string;
  currentDisposition: "discharge" | "observation" | "icu" | "other_module";
  issue: string;
  expectedSemantics: string;
  reviewedAt: string;
};

/**
 * Dívidas semânticas terminais ainda abertas.
 *
 * A ISR deixou de ser dívida: ela é `embedded_care_pathway`, pois pode terminar
 * em observação/UTI quando aberta diretamente e, quando embutida em outro fluxo,
 * precisa preservar retorno à origem.
 */
export const TERMINAL_SEMANTIC_DEBTS: readonly TerminalSemanticDebt[] = [] as const;
