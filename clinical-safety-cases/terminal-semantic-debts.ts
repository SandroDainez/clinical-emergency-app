export type TerminalSemanticDebt = {
  protocolId: string;
  nodeId: string;
  currentDisposition: "discharge" | "observation" | "icu" | "other_module";
  issue: string;
  expectedSemantics: string;
  reviewedAt: string;
};

/**
 * Dívidas detectadas onde o tipo `transition` carrega uma semântica de destino
 * assistencial que não combina com o papel do módulo.
 *
 * Este arquivo NÃO altera árvore. Serve para impedir que o auditor trate uma
 * classificação inadequada como sucesso silencioso.
 */
export const TERMINAL_SEMANTIC_DEBTS: readonly TerminalSemanticDebt[] = [
  {
    protocolId: "isr_rsi_adulto",
    nodeId: "adiar_iot",
    currentDisposition: "observation",
    issue:
      "O nó representa decisão procedural de otimizar as condições antes da tentativa de intubação; observation sugere destino assistencial e pode gerar falso verde no auditor.",
    expectedSemantics:
      "Modelar como continuidade/pausa procedural com critérios explícitos de retorno à ISR e, ao concluir o subfluxo, devolver controle ao protocolo de origem.",
    reviewedAt: "2026-09-02",
  },
] as const;
