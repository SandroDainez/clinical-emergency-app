export type ClinicalGateCandidateLevel = "hard_stop" | "soft_stop" | "advisory" | "needs_level_review";
export type ClinicalGateCandidateStatus =
  | "needs_evidence_review"
  | "needs_fact_model"
  | "needs_action_surface"
  | "needs_tree_content_review";

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
  evidenceReview?: {
    reviewedAt: string;
    sources: readonly string[];
    conclusion: string;
  };
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
    protocolId: "intoxicacoes_exogenas",
    nodeId: "tox_sedativo",
    candidateLevel: "needs_level_review",
    status: ["needs_fact_model", "needs_action_surface"],
    riskStatement: "Flumazenil pode causar dano em pacientes com risco aumentado de convulsão ou arritmia; o benefício se concentra em intoxicação benzodiazepínica pura e de baixo risco.",
    currentTreeEvidence: "FLUMAZENIL_NAO_USAR declara não usar em uso crônico de benzodiazepínico, epilepsia, coingestão de tricíclico, convulsão e alguns usos terapêuticos vitais de benzodiazepínico.",
    requiredFacts: [
      "dependencia_ou_tolerancia_benzodiazepinico",
      "transtorno_convulsivo",
      "coingestao_proconvulsivante_ou_cardiotoxica",
      "sinais_de_superdose_ciclica_antidepressiva",
      "benzodiazepinico_controlando_condicao_potencialmente_fatal",
      "intoxicacao_benzodiazepinica_pura_confirmada",
    ],
    activationRuleDraft: "Somente avaliar ao tentar administrar flumazenil. O nível final deve distinguir contraindicação/alto risco bem documentado de situações que exigem cautela, sem transformar qualquer história de epilepsia em hard stop automático.",
    evidenceReview: {
      reviewedAt: "2026-09-02",
      sources: [
        "AHA 2025 CPR/ECC — Part 10, Benzodiazepine Poisoning",
        "AHA 2023 Focused Update on Life-Threatening Toxicity Due to Poisoning",
        "FDA labeling — flumazenil warnings/contraindications and cyclic antidepressant overdose risk",
      ],
      conclusion: "Evidência confirma benefício apenas em pacientes selecionados de baixo risco e associação com dano em pacientes com maior risco de convulsão/arrítmia. Ainda falta modelar fatos e resolver o nível por subcenário antes de ativar gate.",
    },
  },
  {
    id: "tox-toxic-alcohol-decontamination",
    protocolId: "intoxicacoes_exogenas",
    nodeId: "tox_alcool_toxico",
    candidateLevel: "needs_level_review",
    status: ["needs_action_surface", "needs_tree_content_review"],
    riskStatement: "Carvão ativado não tem papel em metanol/etilenoglicol; já a proibição absoluta de lavagem gástrica precisa ser reescrita para refletir que a técnica não é rotineira e raramente é indicada, em vez de afirmar impossibilidade universal.",
    currentTreeEvidence: "O summary de tox_alcool_toxico contém literalmente 'NÃO fazer carvão nem lavagem'.",
    requiredFacts: ["agente_suspeito_metanol_ou_etilenoglicol", "tentativa_descontaminacao_gastrointestinal"],
    activationRuleDraft: "Não promover enquanto o texto da árvore não separar carvão ativado (sem papel para esses álcoois) de lavagem gástrica (não rotineira, benefício não demonstrado e apenas raramente considerada em intoxicações selecionadas).",
    evidenceReview: {
      reviewedAt: "2026-09-02",
      sources: [
        "Clinical Toxicology Recommendations Collaborative 2026 — activated charcoal in acute oral overdose",
        "AACT/EAPCCT 2013 Position Paper Update — gastric lavage",
        "AACT/EAPCCT Position Statement — gastric lavage",
      ],
      conclusion: "A recomendação atual sustenta ausência de papel do carvão ativado em metanol e etilenoglicol. Para lavagem gástrica, a literatura sustenta não uso rotineiro e benefício não comprovado, mas não uma proibição universal; o conteúdo da árvore deve ser revisado antes de qualquer SafetyGate.",
    },
  },
  {
    id: "tep-high-risk-deep-sedation-ventilation",
    protocolId: "tep_2024",
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
    protocolId: "tep_2024",
    nodeId: "tep_dor_isquemica",
    candidateLevel: "hard_stop",
    status: ["needs_evidence_review", "needs_fact_model", "needs_action_surface"],
    riskStatement: "A árvore alerta que dor torácica isquêmica isolada não deve ser usada como justificativa para trombólise de TEP.",
    currentTreeEvidence: "tep_dor_isquemica declara literalmente que não se deve trombolisar por dor torácica e orienta investigação coronariana paralela.",
    requiredFacts: ["dor_isquemica_isolada", "sem_instabilidade_hemodinamica", "tep_confirmado_ou_fortemente_suspeito"],
    activationRuleDraft: "Só considerar bloqueio se a tentativa de trombólise estiver sustentada apenas por dor isquêmica isolada, sem critério de TEP de alto risco explicitamente registrado.",
  },
] as const;
