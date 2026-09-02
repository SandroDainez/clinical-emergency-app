export type TargetPromotionDebt = {
  id: string;
  protocolId: string;
  nodeId: string;
  targetModuleId: string;
  expectedMode: "returnable" | "terminal";
  contextContractId?: string;
  reason: string;
  migrationRule: string;
};

/**
 * Targets cujo estado clínico atual já sugere transferência real de controle,
 * mas que ainda permanecem como `targets` dentro de um transition assistencial.
 *
 * Esta lista é dívida de migração, não autorização para mudar navegação sem
 * trajetória executável e validação do runtime de interrupções.
 */
export const TARGET_PROMOTION_DEBTS: readonly TargetPromotionDebt[] = [


] as const;
