export type ClinicalContextNavigationSemantic =
  | "reference"
  | "returnable_subflow"
  | "terminal_transition";

export type ClinicalContextNavigationContract = {
  id: string;
  fromModuleId: string;
  toModuleId: string;
  semantic: ClinicalContextNavigationSemantic;
  label: string;
  sublabel: string;
  icon: string;
};

/**
 * Atalhos abertos pelo painel “Recursos adicionais” durante a PCR.
 *
 * A semântica é a intenção NESTE ponto de origem, não o papel global da tela
 * de destino. Bradicardia, taquicardia e OVACE são fluxos quando iniciados como
 * atendimento próprio; aqui são apenas consulta contextual e não transferem o
 * controle da PCR nem abrem uma interrupção clínica.
 */
export const ACLS_REFERENCE_NAVIGATION: readonly ClinicalContextNavigationContract[] = [
  { id: "pcr-ref-ritmos", fromModuleId: "pcr-adulto", toModuleId: "ritmos-acls", semantic: "reference", icon: "〜", label: "Ritmos de Parada", sublabel: "FV · TV · AESP · Assistolia" },
  { id: "pcr-ref-farmacologia", fromModuleId: "pcr-adulto", toModuleId: "farmacologia-acls", semantic: "reference", icon: "Rx", label: "Farmacologia", sublabel: "Epinefrina · Amiodarona · +3" },
  { id: "pcr-ref-bradicardia", fromModuleId: "pcr-adulto", toModuleId: "bradicardia-acls", semantic: "reference", icon: "↓", label: "Bradicardia", sublabel: "Instável · Atropina · MP-TC" },
  { id: "pcr-ref-taquicardia", fromModuleId: "pcr-adulto", toModuleId: "taquicardia-acls", semantic: "reference", icon: "↑", label: "Taquicardia", sublabel: "Estável vs instável · CV" },
  { id: "pcr-ref-causas", fromModuleId: "pcr-adulto", toModuleId: "causas-reversiveis-acls", semantic: "reference", icon: "HT", label: "Hs e Ts", sublabel: "5H e 5T reversíveis" },
  { id: "pcr-ref-gestacao", fromModuleId: "pcr-adulto", toModuleId: "pcr-gestacao-acls", semantic: "reference", icon: "OB", label: "PCR na Gestação", sublabel: "Deslocamento uterino · 5 min" },
  { id: "pcr-ref-ovace", fromModuleId: "pcr-adulto", toModuleId: "ovace-adulto", semantic: "reference", icon: "VA", label: "Engasgo (OVACE)", sublabel: "Golpes nas costas · 5+5" },
  { id: "pcr-ref-pos-rosc", fromModuleId: "pcr-adulto", toModuleId: "pos-pcr-acls", semantic: "reference", icon: "✓", label: "Pós-PCR", sublabel: "ROSC · Metas · Neurologia" },
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
  },
  {
    id: "ovace-inconsciente-pcr",
    fromModuleId: "ovace-adulto",
    toModuleId: "pcr-adulto",
    semantic: "terminal_transition",
    icon: "RCP",
    label: "Abrir PCR no adulto",
    sublabel: "Perda de consciência após obstrução grave",
  },
  {
    id: "gestacao-pcr-adulto",
    fromModuleId: "pcr-gestacao-acls",
    toModuleId: "pcr-adulto",
    semantic: "returnable_subflow",
    icon: "RCP",
    label: "PCR no adulto",
    sublabel: "Ritmos, fármacos e ciclos dentro da PCR na gestação",
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
