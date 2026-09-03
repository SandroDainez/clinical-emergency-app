export type ClinicalGateSurfaceDebt = {
  id: string;
  candidateId: string;
  originProtocolId: string;
  originNodeId: string;
  intendedActionId: string;
  preferredSurface: "origin_action" | "destination_action" | "handoff_action";
  destinationModuleId?: string;
  problem: string;
  targetState: string;
};

/**
 * Dívidas de SUPERFÍCIE, não de regra clínica.
 *
 * Um SafetyGate não pode ser ativado até existir uma interação concreta que o
 * usuário esteja tentando executar. Texto dentro de `actions[]` não é uma
 * interação e o botão genérico "continuar" não pode ser usado como substituto.
 */
export const CLINICAL_GATE_SURFACE_DEBTS: readonly ClinicalGateSurfaceDebt[] = [
  {
    id: "tep-isr-sedation-surface",
    candidateId: "tep-high-risk-deep-sedation-ventilation",
    originProtocolId: "tep_2024",
    originNodeId: "ar_suporte",
    intendedActionId: "iniciar_sedacao_profunda_ou_isr",
    preferredSurface: "destination_action",
    destinationModuleId: "isr-rapida",
    problem:
      "O nó ar_suporte hoje apenas contém texto sobre IOT/sedação dentro de actions[] e segue para ar_diagnostico; não há uma ação específica de intubação nem handoff TEP→ISR que possa ser interceptado sem transformar o botão genérico de avanço em gate.",
    targetState:
      "Quando o atendimento realmente abrir ISR a partir do TEP, carregar contexto explícito de categoria C–E/disfunção de VD e indicação de intubação. Avaliar o SafetyGate na ação de indução/sedação do módulo de destino, preservando via rápida quando hipoxemia refratária/proteção de via aérea já estiver documentada.",
  },
  {
    id: "tce-hyperventilation-action-surface",
    candidateId: "tce-prophylactic-severe-hyperventilation",
    originProtocolId: "tce",
    originNodeId: "tce_grave",
    intendedActionId: "iniciar_hiperventilacao_tce",
    preferredSurface: "origin_action",
    problem:
      "tce_grave e conduta_hic exibem instruções de normocapnia, ponte para herniação e resgate de HIC dentro de actions[], mas hoje não existe botão/ação canônica que represente a tentativa de hiperventilar. Aplicar o gate ao avanço do nó bloquearia também quem apenas está seguindo para osmoterapia/monitorização e confundiria profilaxia com resgate.",
    targetState:
      "Criar interação específica somente quando o usuário optar por hiperventilação. Antes da execução, registrar finalidade (profilática versus resgate), alvo de PaCO₂ e presença explícita de herniação/HIC refratária; só então avaliar o hard stop estreito contra profilaxia prolongada com PaCO₂ ≤25 mmHg.",
  },
  {
    id: "choque-cardiogenico-fluid-action-surface",
    candidateId: "choque-cardiogenico-fluid-bolus-with-congestion",
    originProtocolId: "choque",
    originNodeId: "dx_cardio_frio_umido",
    intendedActionId: "administrar_expansao_volemica_choque",
    preferredSurface: "origin_action",
    problem:
      "Os ramos cardiogênicos são transitions com recomendações dentro de exitCriteria; não existe uma ação canônica de administrar fluido que diferencie expansão empírica, pequena prova responsiva e reposição por hipovolemia verdadeira. Um gate no nó inteiro bloquearia condutas corretas e não interceptaria a tentativa real de volume.",
    targetState:
      "Expor uma interação clínica específica para expansão volêmica quando o cockpit passar a executar condutas de choque. Carregar fenótipo de congestão e evidência de baixa pré-carga/responsividade; usar soft stop apenas quando houver choque cardiogênico esquerdo congesto e a tentativa for fluido como tratamento primário, mantendo liberada pequena prova justificada e reavaliada.",
  },
] as const;