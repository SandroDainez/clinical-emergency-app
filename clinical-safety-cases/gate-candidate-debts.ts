export type ClinicalGateCandidateLevel = "hard_stop" | "soft_stop" | "advisory" | "needs_level_review";
export type ClinicalGateCandidateStatus = "needs_evidence_review" | "needs_fact_model" | "needs_action_surface";

export type ClinicalGateCandidateDebt = {
  id: string;
  protocolId: string;
  nodeId: string;
  candidateLevel: ClinicalGateCandidateLevel;
  status: readonly ClinicalGateCandidateStatus[];
  riskStatement: string;
  currentTreeEvidence: string;
  requiredFacts: readonly string[];
  activationRuleDraft: string;
};

/**
 * Candidatos de auditoria — NÃO são policies e NÃO alteram runtime/UI.
 *
 * Entrar aqui significa apenas: há texto clínico de alto sinal na árvore que
 * merece revisão estruturada para saber se deve virar SafetyGate. A promoção
 * exige revisão da fonte atual, modelagem dos fatos explícitos e uma superfície
 * de ação/decisão declarada. Não promover por palavra-chave.
 */
export const CLINICAL_GATE_CANDIDATE_DEBTS: readonly ClinicalGateCandidateDebt[] = [
  {
    id: "tox-flumazenil-high-risk-context",
    protocolId: "intoxicacoes",
    nodeId: "tox_sedativo",
    candidateLevel: "hard_stop",
    status: ["needs_evidence_review", "needs_fact_model", "needs_action_surface"],
    riskStatement: "Flumazenil pode ser perigoso em cenários que a própria árvore descreve como de alto risco de convulsão ou descompensação.",
    currentTreeEvidence: "FLUMAZENIL_NAO_USAR declara não usar em uso crônico de benzodiazepínico, epilepsia, coingestão de tricíclico, convulsão e alguns usos terapêuticos vitais de benzodiazepínico.",
    requiredFacts: [
      "uso_cronico_benzodiazepinico",
      "epilepsia",
      "coingestao_triciclico",
      "convulsao_atual_ou_recente",
      "benzodiazepinico_controlando_condicao_potencialmente_fatal",
    ],
    activationRuleDraft: "Somente avaliar ao tentar administrar flumazenil e apenas com um dos fatos de alto risco explicitamente registrado.",
  },
  {
    id: "tox-toxic-alcohol-decontamination",
    protocolId: "intoxicacoes",
    nodeId: "tox_alcool_toxico",
    candidateLevel: "hard_stop",
    status: ["needs_evidence_review", "needs_action_surface"],
    riskStatement: "A árvore declara que carvão ativado e lavagem não devem ser realizados no ramo de metanol/etilenoglicol.",
    currentTreeEvidence: "O summary de tox_alcool_toxico contém literalmente 'NÃO fazer carvão nem lavagem'.",
    requiredFacts: ["agente_suspeito_metanal_ou_etilenoglicol"],
    activationRuleDraft: "Somente avaliar se houver tentativa explícita de descontaminação gastrointestinal nesse ramo; não bloquear outras medidas de suporte.",
  },
  {
    id: "tep-high-risk-deep-sedation-ventilation",
    protocolId: "tep",
    nodeId: "ar_suporte",
    candidateLevel: "needs_level_review",
    status: ["needs_evidence_review", "needs_fact_model", "needs_action_surface"],
    riskStatement: "No TEP de alto risco, a árvore alerta para risco de colapso hemodinâmico com sedação profunda e ventilação mecânica, mas reconhece que intubação pode ser necessária.",
    currentTreeEvidence: "ar_suporte orienta evitar sedação profunda e ventilação mecânica sempre que possível, mantendo IOT para insuficiência respiratória grave.",
    requiredFacts: ["tep_alto_risco", "necessidade_atual_de_intubacao", "instabilidade_hemodinamica", "estrategia_de_sedacao"],
    activationRuleDraft: "Provavelmente advisory ou soft stop contextual antes de sedação/IOT; nunca hard stop porque a via aérea pode exigir intervenção imediata.",
  },
  {
    id: "tep-thrombolysis-for-isolated-ischemic-pain",
    protocolId: "tep",
    nodeId: "tep_dor_isquemica",
    candidateLevel: "hard_stop",
    status: ["needs_evidence_review", "needs_fact_model", "needs_action_surface"],
    riskStatement: "A árvore alerta que dor torácica isquêmica isolada não deve ser usada como justificativa para trombólise de TEP.",
    currentTreeEvidence: "tep_dor_isquemica declara literalmente que não se deve trombolisar por dor torácica e orienta investigação coronariana paralela.",
    requiredFacts: ["dor_isquemica_isolada", "sem_instabilidade_hemodinamica", "tep_confirmado_ou_fortemente_suspeito"],
    activationRuleDraft: "Só considerar bloqueio se a tentativa de trombólise estiver sustentada apenas por dor isquêmica isolada, sem critério de TEP de alto risco explicitamente registrado.",
  },
] as const;
