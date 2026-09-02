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
 *
 * Estado atual: sem dívidas confirmadas neste registry. Politrauma e IRA foram
 * rechecados diretamente na branch `emergencias-2-ui-core` e já possuem destinos
 * assistenciais explícitos; não manter dívida obsoleta.
 */
export const MISSING_TERMINAL_DISPOSITION_DEBTS: readonly MissingTerminalDispositionDebt[] = [] as const;
