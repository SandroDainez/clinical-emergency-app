export type TargetPromotionDebt = {
  id: string;
  protocolId: string;
  nodeId: string;
  targetModuleId: string;
  expectedMode: "returnable" | "terminal";
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
  {
    id: "tachy-pulseless-to-pcr",
    protocolId: "acls_tachycardia_2025",
    nodeId: "unstable_sem_pulso",
    targetModuleId: "pcr-adulto",
    expectedMode: "terminal",
    reason: "O paciente já está sem pulso e o próprio nó determina seguir o algoritmo de PCR sem retornar ao algoritmo de taquicardia.",
    migrationRule: "Promover a passagem para PCR a handoff terminal de módulo, preservando o contexto do ritmo e da cardioversão imediatamente anterior.",
  },
  {
    id: "brady-pulseless-to-pcr",
    protocolId: "acls_bradycardia_2025",
    nodeId: "bradi_sem_pulso",
    targetModuleId: "pcr-adulto",
    expectedMode: "terminal",
    reason: "O paciente já perdeu o pulso; compressões e algoritmo de PCR passam a dominar e o marcapasso não substitui RCP.",
    migrationRule: "Promover a passagem para PCR a handoff terminal de módulo, preservando ritmo pré-parada, suporte em curso e suspeita de causa reversível.",
  },
] as const;
