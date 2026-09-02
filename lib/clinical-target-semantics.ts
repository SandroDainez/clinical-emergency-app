export type ClinicalTargetSemantic = "reference" | "adjunctive_module";

export type ClinicalTargetContract = {
  id: string;
  fromProtocolId: string;
  fromNodeId: string;
  targetModuleId: string;
  semantic: ClinicalTargetSemantic;
  rationale: string;
};

/**
 * `targets` em nós com disposition assistencial NÃO são interrupções por padrão.
 *
 * reference
 *   Consulta contextual de outro protocolo. Não abre pilha de retorno e não
 *   substitui o destino já declarado no nó atual.
 *
 * adjunctive_module
 *   Ferramenta/módulo especializado que pode ser aberto para executar uma parte
 *   do cuidado em paralelo (ex.: ventilação ou titulação vasoativa), mas o nó
 *   de origem continua sendo o responsável pelo destino assistencial já definido.
 *   Também não abre pilha de retorno automaticamente.
 */
export const CLINICAL_TARGET_CONTRACTS: readonly ClinicalTargetContract[] = [
  {
    id: "choque-dx-tep-guia",
    fromProtocolId: "choque",
    fromNodeId: "dx_tep",
    targetModuleId: "tep",
    semantic: "reference",
    rationale: "O nó já define UTI e apenas remete ao guia de TEP para estratificação e reperfusão.",
  },
  {
    id: "choque-cardio-vd-sca",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_vd",
    targetModuleId: "sindromes-coronarianas",
    semantic: "reference",
    rationale: "O choque permanece responsável pelo destino; o alvo abre a estratégia coronariana quando IAM é a causa.",
  },
  {
    id: "choque-cardio-vd-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_vd",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Titulação vasoativa é tarefa especializada em paralelo ao cuidado do choque e não substitui o destino UTI.",
  },
  {
    id: "choque-cardio-frio-umido-sca",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_frio_umido",
    targetModuleId: "sindromes-coronarianas",
    semantic: "reference",
    rationale: "A reperfusão é consultada quando síndrome coronariana é a causa; o nó de choque já encerra em UTI.",
  },
  {
    id: "choque-cardio-frio-umido-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_frio_umido",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "O módulo auxilia titulação de inotrópico/vasopressor sem assumir o destino assistencial.",
  },
  {
    id: "dispneia-tep",
    fromProtocolId: "insuficiencia_respiratoria",
    fromNodeId: "dx_tep",
    targetModuleId: "tep",
    semantic: "reference",
    rationale: "Diagnóstico respiratório já define UTI; o alvo oferece o protocolo específico de TEP.",
  },
  {
    id: "dispneia-anafilaxia",
    fromProtocolId: "insuficiencia_respiratoria",
    fromNodeId: "dx_anafilaxia",
    targetModuleId: "anafilaxia",
    semantic: "reference",
    rationale: "O alvo aprofunda tratamento específico sem transformar o diagnóstico terminal em interrupção.",
  },
  {
    id: "dispneia-asma-vm",
    fromProtocolId: "insuficiencia_respiratoria",
    fromNodeId: "dx_asma",
    targetModuleId: "ventilacao-mecanica",
    semantic: "adjunctive_module",
    rationale: "Se houver intubação, a ventilação obstrutiva exige configuração especializada, mas o destino UTI já está definido.",
  },
  {
    id: "dispneia-dpoc-vm",
    fromProtocolId: "insuficiencia_respiratoria",
    fromNodeId: "dx_dpoc",
    targetModuleId: "ventilacao-mecanica",
    semantic: "adjunctive_module",
    rationale: "VNI/VM é suporte especializado paralelo; o nó respiratório conserva o destino UTI.",
  },
  {
    id: "dispneia-eap",
    fromProtocolId: "insuficiencia_respiratoria",
    fromNodeId: "dx_eap",
    targetModuleId: "edema-agudo-pulmao",
    semantic: "reference",
    rationale: "O alvo remete ao manejo etiológico do EAP, sem criar interrupção automática.",
  },
  {
    id: "dispneia-sara-vm",
    fromProtocolId: "insuficiencia_respiratoria",
    fromNodeId: "dx_sara",
    targetModuleId: "ventilacao-mecanica",
    semantic: "adjunctive_module",
    rationale: "Ventilação protetora e pronação são suporte especializado em paralelo ao destino UTI já declarado.",
  },
] as const;
