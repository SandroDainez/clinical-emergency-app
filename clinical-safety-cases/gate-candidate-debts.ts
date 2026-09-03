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
    status: ["needs_action_surface"],
    riskStatement: "Carvão ativado não tem papel em metanol/etilenoglicol; lavagem gástrica não é recomendada rotineiramente e seu benefício não foi demonstrado, portanto ainda é preciso decidir se algum desses pontos merece uma superfície de SafetyGate.",
    currentTreeEvidence: "O summary de tox_alcool_toxico separa carvão ativado (sem papel em metanol/etilenoglicol) de lavagem gástrica (não rotineira; benefício não demonstrado).",
    requiredFacts: ["agente_suspeito_metanol_ou_etilenoglicol", "tentativa_descontaminacao_gastrointestinal"],
    activationRuleDraft: "Avaliar somente quando existir uma superfície explícita de tentativa de descontaminação; não criar gate baseado apenas em estar no ramo de álcool tóxico.",
    evidenceReview: {
      reviewedAt: "2026-09-02",
      sources: [
        "Clinical Toxicology Recommendations Collaborative 2026 — activated charcoal in acute oral overdose",
        "AACT/EAPCCT 2013 Position Paper Update — gastric lavage",
        "AACT/EAPCCT Position Statement — gastric lavage",
      ],
      conclusion: "A recomendação atual sustenta ausência de papel do carvão ativado em metanol e etilenoglicol. Para lavagem gástrica, a literatura sustenta não uso rotineiro e benefício não comprovado, mas não uma proibição universal; o conteúdo da árvore foi alinhado antes de qualquer SafetyGate.",
    },
  },
  {
    id: "tep-high-risk-deep-sedation-ventilation",
    protocolId: "tep_2024",
    nodeId: "ar_suporte",
    candidateLevel: "soft_stop",
    status: ["needs_fact_model", "needs_action_surface"],
    riskStatement: "Em TEP agudo categorias C–E, sedação profunda e ventilação mecânica sem indicação clínica podem precipitar colapso hemodinâmico; quando intubação é necessária, o suporte hemodinâmico deve estar prontamente disponível.",
    currentTreeEvidence: "ar_suporte orienta evitar sedação profunda e ventilação mecânica sempre que possível, mantendo IOT para insuficiência respiratória grave.",
    requiredFacts: [
      "tep_categoria_c_d_ou_e_ou_disfuncao_vd",
      "hipoxemia_profunda_refrataria_a_suporte_nao_invasivo",
      "necessidade_protecao_via_aerea",
      "outra_indicacao_clinica_forte_para_intubacao",
      "vasopressor_ou_inotropico_prontamente_disponivel",
      "va_ecmo_disponivel_quando_aplicavel",
    ],
    activationRuleDraft: "A superfície provável é a tentativa de sedação profunda/ISR, idealmente no módulo de via aérea chamado a partir do TEP. Se hipoxemia refratária, proteção de via aérea ou outra indicação forte já estiver explicitamente registrada, não bloquear a intervenção; nesse caso exibir no máximo orientação de preparação hemodinâmica. Se não houver indicação registrada, usar soft stop para confirmar indicação antes de indução/ventilação.",
    evidenceReview: {
      reviewedAt: "2026-09-02",
      sources: [
        "2026 AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN Acute Pulmonary Embolism Guideline — Section 4.2.3 Sedation and Ventilatory Strategies",
      ],
      conclusion: "A diretriz classifica como Classe 3: Harm (C-LD) realizar sedação profunda e ventilação mecânica em TEP categorias C–E sem indicação clínica. Quando sedação para intubação é necessária, recomenda Classe 1 (C-LD) ter vasopressores, inotrópicos e/ou VA-ECMO disponíveis para eventual instabilidade. O candidato pode ter nível soft_stop, condicionado à ausência de indicação clínica explícita; nunca hard stop absoluto.",
    },
  },

] as const;
