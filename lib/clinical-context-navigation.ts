import { markProtocolSessionForResume } from "./module-session-navigation";

export type ClinicalContextNavigationSemantic =
  | "reference"
  | "returnable_subflow"
  | "terminal_transition";

export type ClinicalContextNavigationResumePolicy = {
  /** Id do protocolo cujo estado deve ser preservado/retomado. */
  protocolId: string;
  /** Causas já conhecidas que devem chegar como suspeitas ao protocolo retomado. */
  suspectedCauses?: readonly string[];
};

export type ClinicalContextNavigationContract = {
  id: string;
  fromModuleId: string;
  toModuleId: string;
  semantic: ClinicalContextNavigationSemantic;
  label: string;
  sublabel: string;
  icon: string;
  /**
   * Política operacional de sessão pertencente ao contrato, não à tela.
   * Ausência significa navegação sem preservação/retomada especial.
   */
  resume?: ClinicalContextNavigationResumePolicy;
};

/**
 * Atalhos abertos pelo painel “Recursos adicionais” durante a PCR.
 *
 * A semântica é a intenção NESTE ponto de origem, não o papel global da tela
 * de destino. Bradicardia, taquicardia e OVACE são fluxos quando iniciados como
 * atendimento próprio; aqui são apenas consulta contextual e não transferem o
 * controle da PCR nem abrem uma interrupção clínica.
 *
 * Todos preservam a sessão de PCR porque são consultas abertas no meio de uma
 * ressuscitação em andamento. Essa política vive aqui para que a UI não precise
 * conhecer o id interno `pcr_adulto` nem lembrar de marcar resume manualmente.
 */
export const ACLS_REFERENCE_NAVIGATION: readonly ClinicalContextNavigationContract[] = [
  { id: "pcr-ref-ritmos", fromModuleId: "pcr-adulto", toModuleId: "ritmos-acls", semantic: "reference", icon: "〜", label: "Ritmos de Parada", sublabel: "FV · TV · AESP · Assistolia", resume: { protocolId: "pcr_adulto" } },
  { id: "pcr-ref-farmacologia", fromModuleId: "pcr-adulto", toModuleId: "farmacologia-acls", semantic: "reference", icon: "Rx", label: "Farmacologia", sublabel: "Epinefrina · Amiodarona · +3", resume: { protocolId: "pcr_adulto" } },
  { id: "pcr-ref-bradicardia", fromModuleId: "pcr-adulto", toModuleId: "bradicardia-acls", semantic: "reference", icon: "↓", label: "Bradicardia", sublabel: "Instável · Atropina · MP-TC", resume: { protocolId: "pcr_adulto" } },
  { id: "pcr-ref-taquicardia", fromModuleId: "pcr-adulto", toModuleId: "taquicardia-acls", semantic: "reference", icon: "↑", label: "Taquicardia", sublabel: "Estável vs instável · CV", resume: { protocolId: "pcr_adulto" } },
  { id: "pcr-ref-causas", fromModuleId: "pcr-adulto", toModuleId: "causas-reversiveis-acls", semantic: "reference", icon: "HT", label: "Hs e Ts", sublabel: "5H e 5T reversíveis", resume: { protocolId: "pcr_adulto" } },
  { id: "pcr-ref-gestacao", fromModuleId: "pcr-adulto", toModuleId: "pcr-gestacao-acls", semantic: "reference", icon: "OB", label: "PCR na Gestação", sublabel: "Deslocamento uterino · 5 min", resume: { protocolId: "pcr_adulto" } },
  { id: "pcr-ref-ovace", fromModuleId: "pcr-adulto", toModuleId: "ovace-adulto", semantic: "reference", icon: "VA", label: "Engasgo (OVACE)", sublabel: "Golpes nas costas · 5+5", resume: { protocolId: "pcr_adulto" } },
  { id: "pcr-ref-pos-rosc", fromModuleId: "pcr-adulto", toModuleId: "pos-pcr-acls", semantic: "reference", icon: "✓", label: "Pós-PCR", sublabel: "ROSC · Metas · Neurologia", resume: { protocolId: "pcr_adulto" } },
] as const;

/** Navegações acionáveis fora do painel de consulta, com intenção explícita. */
export const ACLS_ACTION_NAVIGATION: readonly ClinicalContextNavigationContract[] = [
  {
    id: "pcr-rosc-pos-pcr",
    fromModuleId: "pcr-adulto",
    toModuleId: "pos-pcr-acls",
    semantic: "terminal_transition",
    icon: "✓",
    label: "Cuidados pós-PCR",
    sublabel: "Retorno da circulação espontânea confirmado",
    resume: { protocolId: "pcr_adulto" },
  },
  {
    id: "ovace-inconsciente-pcr",
    fromModuleId: "ovace-adulto",
    toModuleId: "pcr-adulto",
    semantic: "terminal_transition",
    icon: "RCP",
    label: "Abrir PCR no adulto",
    sublabel: "Perda de consciência após obstrução grave",
    resume: { protocolId: "pcr_adulto", suspectedCauses: ["hipoxia"] },
  },
  {
    id: "gestacao-pcr-adulto",
    fromModuleId: "pcr-gestacao-acls",
    toModuleId: "pcr-adulto",
    semantic: "returnable_subflow",
    icon: "RCP",
    label: "PCR no adulto",
    sublabel: "Ritmos, fármacos e ciclos dentro da PCR na gestação",
    resume: { protocolId: "pcr_adulto" },
  },
  {
    id: "gestacao-pre-eclampsia-referencia",
    fromModuleId: "pcr-gestacao-acls",
    toModuleId: "pre-eclampsia",
    semantic: "reference",
    icon: "OB",
    label: "Pré-eclâmpsia e eclâmpsia",
    sublabel: "Consulta se houver pulso",
  },
] as const;

export function getClinicalContextNavigation(id: string): ClinicalContextNavigationContract {
  const contract = [...ACLS_REFERENCE_NAVIGATION, ...ACLS_ACTION_NAVIGATION].find((item) => item.id === id);
  if (!contract) throw new Error(`Navegação clínica contextual não registrada: ${id}`);
  return contract;
}

export function buildClinicalContextHref(contract: ClinicalContextNavigationContract): string {
  return `/modulos/${contract.toModuleId}?from_module=${encodeURIComponent(contract.fromModuleId)}`;
}

/**
 * Executor canônico de uma navegação clínica contextual.
 *
 * A tela fornece somente a função concreta de navegação do framework. Toda a
 * preparação clínica/operacional — preservar sessão, carregar causa conhecida e
 * construir a rota com proveniência — pertence ao contrato do orchestrator.
 */
export function executeClinicalContextNavigation(
  contract: ClinicalContextNavigationContract,
  navigate: (href: string) => void
): void {
  if (contract.resume) {
    markProtocolSessionForResume(
      contract.resume.protocolId,
      contract.resume.suspectedCauses ? [...contract.resume.suspectedCauses] : undefined
    );
  }
  navigate(buildClinicalContextHref(contract));
}
