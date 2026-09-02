export type MissingTerminalDispositionDebt = {
  protocolId: string;
  evidence: string;
  requiredFix: string;
  reviewedAt: string;
};

/**
 * Care pathways já classificados como linhas de cuidado completas, mas que ainda
 * não possuem `disposition: discharge | observation | icu` explícito na árvore.
 * `other_module` não quita esta dívida: é handoff/interrupção, não destino final.
 */
export const MISSING_TERMINAL_DISPOSITION_DEBTS: readonly MissingTerminalDispositionDebt[] = [
  {
    protocolId: "politrauma",
    evidence:
      "A árvore possui handoffs `other_module` (por exemplo para controle cirúrgico de hemorragia), mas a varredura não encontrou discharge, observation ou icu.",
    requiredFix:
      "Definir nós terminais assistenciais alcançáveis após estabilização/controle inicial, preservando handoffs urgentes como interrupções clínicas quando apropriado.",
    reviewedAt: "2026-09-02",
  },
  {
    protocolId: "injuria_renal_aguda",
    evidence:
      "A árvore possui `other_module` para crises prioritárias, porém a varredura não encontrou discharge, observation ou icu para encerrar a linha renal.",
    requiredFix:
      "Definir destino renal explícito conforme gravidade, complicações, necessidade de terapia renal substitutiva e possibilidade de seguimento, sem transformar handoffs em destinos falsos.",
    reviewedAt: "2026-09-02",
  },
] as const;
