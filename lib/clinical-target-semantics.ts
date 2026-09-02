export type ClinicalTargetSemantic =
  | "reference"
  | "adjunctive_module"
  | "contingency"
  | "handoff_candidate";

export type ClinicalTargetContract = {
  id: string;
  fromProtocolId: string;
  fromNodeId: string;
  targetModuleId: string;
  semantic: ClinicalTargetSemantic;
  rationale: string;
  /**
   * Apenas para auditoria de candidatos: descreve o modo esperado caso o target
   * seja promovido futuramente a ClinicalTransitionContract.
   */
  candidateMode?: "returnable" | "terminal";
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
 *
 * contingency
 *   Porta disponível apenas se uma condição NOVA ocorrer depois (ex.: perder o
 *   pulso durante reavaliação). Não descreve o estado atual do paciente e não
 *   deve abrir automaticamente outro módulo.
 *
 * handoff_candidate
 *   O estado atual já parece exigir transferência real de controle para outro
 *   módulo. É marcador de auditoria: NÃO altera navegação nem runtime até a
 *   árvore ser migrada e os testes de trajetória cobrirem a promoção.
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
  {
    id: "convulsao-nao-convulsivo-isr",
    fromProtocolId: "mal_epileptico",
    fromNodeId: "nao_convulsivo",
    targetModuleId: "isr-rapida",
    semantic: "adjunctive_module",
    rationale: "A via aérea definitiva só é necessária quando o rebaixamento traz risco de aspiração ou incapacidade de proteção; o nó continua definindo UTI para o mal epiléptico não convulsivo.",
  },
  {
    id: "convulsao-nao-convulsivo-eclampsia",
    fromProtocolId: "mal_epileptico",
    fromNodeId: "nao_convulsivo",
    targetModuleId: "pre-eclampsia",
    semantic: "reference",
    rationale: "Gestação ou puerpério isoladamente não prova eclâmpsia; o alvo consulta o protocolo obstétrico quando o contexto hipertensivo/eclâmptico for plausível, sem transferir controle automaticamente.",
  },
  {
    id: "convulsao-uti-isr",
    fromProtocolId: "mal_epileptico",
    fromNodeId: "uti",
    targetModuleId: "isr-rapida",
    semantic: "adjunctive_module",
    rationale: "No mal epiléptico refratário, a intubação é uma etapa de suporte dentro de um cuidado que já tem destino UTI definido.",
  },
  {
    id: "convulsao-uti-sedoanalgesia",
    fromProtocolId: "mal_epileptico",
    fromNodeId: "uti",
    targetModuleId: "sedoanalgesia",
    semantic: "adjunctive_module",
    rationale: "Sedoanalgesia e bloqueio neuromuscular são suporte especializado em paralelo ao manejo do estado de mal; não substituem o protocolo de origem nem seu destino.",
  },
  {
    id: "convulsao-uti-vm",
    fromProtocolId: "mal_epileptico",
    fromNodeId: "uti",
    targetModuleId: "ventilacao-mecanica",
    semantic: "adjunctive_module",
    rationale: "A ventilação mecânica parametriza o suporte pós-intubação, enquanto o estado de mal continua responsável pelo tratamento etiológico e destino UTI.",
  },
  {
    id: "tce-uti-vm",
    fromProtocolId: "tce",
    fromNodeId: "uti",
    targetModuleId: "ventilacao-mecanica",
    semantic: "adjunctive_module",
    rationale: "Controle ventilatório de oxigenação e PaCO₂ é suporte especializado dentro da neuroproteção; o TCE conserva o destino UTI.",
  },
  {
    id: "tce-uti-sedoanalgesia",
    fromProtocolId: "tce",
    fromNodeId: "uti",
    targetModuleId: "sedoanalgesia",
    semantic: "adjunctive_module",
    rationale: "Sedação e bloqueio neuromuscular podem ser necessários para controle da pressão intracraniana, mas não substituem o protocolo de TCE.",
  },
  {
    id: "tce-uti-vasoativos",
    fromProtocolId: "tce",
    fromNodeId: "uti",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Vasoativos são suporte para manter pressão de perfusão cerebral; a responsabilidade pelo destino e pela neuroproteção permanece no TCE.",
  },
  {
    id: "abdome-cirurgia-sepse",
    fromProtocolId: "abdome_agudo",
    fromNodeId: "cirurgia",
    targetModuleId: "sepse-adulto",
    semantic: "reference",
    rationale: "Sepse abdominal com disfunção orgânica exige o protocolo etiológico de sepse, enquanto o nó mantém o destino cirúrgico/UTI.",
  },
  {
    id: "abdome-cirurgia-choque",
    fromProtocolId: "abdome_agudo",
    fromNodeId: "cirurgia",
    targetModuleId: "choque",
    semantic: "adjunctive_module",
    rationale: "A avaliação do perfil hemodinâmico e o suporte do choque ocorrem em paralelo ao controle do foco abdominal.",
  },
  {
    id: "abdome-cirurgia-vasoativos",
    fromProtocolId: "abdome_agudo",
    fromNodeId: "cirurgia",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Titulação vasoativa é suporte perioperatório especializado e não substitui o destino cirúrgico/UTI.",
  },
  {
    id: "dispneia-hipercapnica-vm",
    fromProtocolId: "insuficiencia_respiratoria",
    fromNodeId: "dx_hipercapnica",
    targetModuleId: "ventilacao-mecanica",
    semantic: "adjunctive_module",
    rationale: "A ventilação mecânica é suporte especializado no quadro hipercápnico; o nó respiratório continua responsável pelo destino UTI.",
  },
  {
    id: "ira-monitorizado-eletrólitos",
    fromProtocolId: "injuria_renal_aguda",
    fromNodeId: "destino_monitorizado",
    targetModuleId: "correcoes-eletroliticas",
    semantic: "adjunctive_module",
    rationale: "Correções eletrolíticas são uma tarefa terapêutica paralela durante a observação monitorizada da injúria renal.",
  },
  {
    id: "ira-monitorizado-calculadoras",
    fromProtocolId: "injuria_renal_aguda",
    fromNodeId: "destino_monitorizado",
    targetModuleId: "calculadoras-clinicas",
    semantic: "reference",
    rationale: "Calculadoras clínicas são ferramenta de consulta e não assumem o cuidado nem alteram o destino assistencial.",
  },
  {
    id: "ira-suporte-eletrólitos",
    fromProtocolId: "injuria_renal_aguda",
    fromNodeId: "destino_suporte",
    targetModuleId: "correcoes-eletroliticas",
    semantic: "adjunctive_module",
    rationale: "Correções eletrolíticas integram o suporte da injúria renal grave em paralelo ao destino UTI.",
  },
  {
    id: "ira-suporte-eap",
    fromProtocolId: "injuria_renal_aguda",
    fromNodeId: "destino_suporte",
    targetModuleId: "edema-agudo-pulmao",
    semantic: "reference",
    rationale: "O protocolo de edema agudo de pulmão é consultado quando congestão pulmonar compõe a injúria renal grave; não substitui o destino UTI.",
  },
  {
    id: "intoxicacoes-uti-isr",
    fromProtocolId: "intoxicacoes_exogenas",
    fromNodeId: "uti",
    targetModuleId: "isr-rapida",
    semantic: "adjunctive_module",
    rationale: "Proteção de via aérea é suporte especializado quando necessária na intoxicação grave, mantendo o destino UTI.",
  },
  {
    id: "intoxicacoes-uti-vasoativos",
    fromProtocolId: "intoxicacoes_exogenas",
    fromNodeId: "uti",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Suporte vasoativo é terapia paralela na intoxicação hemodinamicamente instável e não transfere a responsabilidade do caso.",
  },
  {
    id: "intoxicacoes-uti-eletrólitos",
    fromProtocolId: "intoxicacoes_exogenas",
    fromNodeId: "uti",
    targetModuleId: "correcoes-eletroliticas",
    semantic: "adjunctive_module",
    rationale: "Correções eletrolíticas são suporte específico dentro do manejo toxicológico e não substituem o protocolo de origem.",
  },
  {
    id: "politrauma-uti-vm",
    fromProtocolId: "politrauma",
    fromNodeId: "uti",
    targetModuleId: "ventilacao-mecanica",
    semantic: "adjunctive_module",
    rationale: "Parametrização ventilatória pós-intubação e na contusão pulmonar é suporte paralelo ao cuidado do trauma grave.",
  },
  {
    id: "politrauma-uti-vasoativos",
    fromProtocolId: "politrauma",
    fromNodeId: "uti",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Vasoativos são suporte hemodinâmico especializado dentro do destino UTI do trauma grave.",
  },
  {
    id: "politrauma-uti-sedoanalgesia",
    fromProtocolId: "politrauma",
    fromNodeId: "uti",
    targetModuleId: "sedoanalgesia",
    semantic: "adjunctive_module",
    rationale: "Sedoanalgesia e bloqueio neuromuscular são suporte paralelo no trauma grave e não substituem o protocolo de origem.",
  },
  {
    id: "choque-cardio-frio-seco-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_frio_seco",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Inotrópicos/vasopressores são suporte especializado dentro do manejo do choque cardiogênico frio e seco.",
  },
  {
    id: "choque-cardio-normotenso-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_normotenso",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "A titulação hemodinâmica é apoio especializado mesmo quando a pressão arterial ainda está preservada.",
  },
  {
    id: "choque-cardio-valvar-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_valvar",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Vasoativos/inotrópicos apoiam a estabilização da causa valvar sem substituir o manejo etiológico e o destino UTI.",
  },
  {
    id: "choque-cardio-bradi-acls",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_bradi",
    targetModuleId: "bradicardia-acls",
    semantic: "adjunctive_module",
    rationale: "O algoritmo de bradicardia executa o tratamento do ritmo em paralelo ao manejo do choque cardiogênico.",
  },
  {
    id: "choque-cardio-bradi-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_bradi",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Suporte vasoativo pode ser necessário enquanto o ritmo é tratado, sem substituir o destino UTI.",
  },
  {
    id: "choque-cardiogenico-sca",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardiogenico",
    targetModuleId: "sindromes-coronarianas",
    semantic: "reference",
    rationale: "O protocolo coronariano é referência etiológica quando síndrome coronariana é a causa do choque cardiogênico.",
  },
  {
    id: "choque-cardiogenico-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardiogenico",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Titulação de inotrópico/vasopressor é suporte paralelo no choque cardiogênico.",
  },
  {
    id: "choque-septico-sepse",
    fromProtocolId: "choque",
    fromNodeId: "dx_septico",
    targetModuleId: "sepse-adulto",
    semantic: "reference",
    rationale: "O módulo de sepse aprofunda antimicrobianos e controle de foco quando a etiologia do choque é séptica.",
  },
  {
    id: "choque-anafilatico-anafilaxia",
    fromProtocolId: "choque",
    fromNodeId: "dx_anafilatico",
    targetModuleId: "anafilaxia",
    semantic: "reference",
    rationale: "O protocolo de anafilaxia é a referência etiológica quando o choque é anafilático; o nó de choque já conserva o destino assistencial.",
  },
  {
    id: "choque-distributivo-outro-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_distributivo_outro",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Vasopressor é suporte especializado no choque distributivo de outra etiologia e não substitui a investigação causal.",
  },
  {
    id: "taquicardia-uti-pcr-contingencia",
    fromProtocolId: "acls_tachycardia_2025",
    fromNodeId: "unstable_disposition",
    targetModuleId: "pcr-adulto",
    semantic: "contingency",
    rationale: "O paciente ainda tem pulso; o target só se aplica se ocorrer perda de pulso durante a reavaliação.",
  },
  {
    id: "taquicardia-observacao-pcr-contingencia",
    fromProtocolId: "acls_tachycardia_2025",
    fromNodeId: "stable_reassess",
    targetModuleId: "pcr-adulto",
    semantic: "contingency",
    rationale: "É uma porta de deterioração futura: só deve assumir controle se o paciente perder o pulso.",
  },
] as const;
