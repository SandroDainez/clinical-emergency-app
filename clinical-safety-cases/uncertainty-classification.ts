import type { DecisionUncertaintyPolicyEntry } from "../lib/decision-uncertainty-policy";

/**
 * Primeira classificação humana de achados do inventário de decisões sem
 * `nao_sei` explícito.
 *
 * Este arquivo NÃO altera árvores nem cria opções. Ele separa falsos positivos
 * do inventário de lacunas reais que precisam de correção posterior.
 */
export const INITIAL_UNCERTAINTY_CLASSIFICATION: readonly DecisionUncertaintyPolicyEntry[] = [
  {
    protocolId: "avc",
    nodeId: "isq_pa_check",
    classification: "binary_observable",
    source: "missing_observation",
    rationale:
      "A pergunta é comparação direta de uma PA medida com 185/110 mmHg; não exige interpretação diagnóstica. Ausência de medida é problema de captura do dado, não uma terceira conclusão clínica.",
    reviewedAt: "2026-09-02",
  },
  {
    protocolId: "isr",
    nodeId: "confirmacao",
    classification: "binary_observable",
    source: "missing_observation",
    rationale:
      "O nó pergunta se há confirmação traqueal por capnografia. Sem curva persistente, a posição não está confirmada; a resposta não depende de julgamento subjetivo.",
    reviewedAt: "2026-09-02",
  },
  {
    protocolId: "avc",
    nodeId: "hic_anticoag",
    classification: "unknown_required",
    source: "missing_history",
    reviewedAt: "2026-09-02",
  },
  {
    protocolId: "sca",
    nodeId: "stemi_reperfusao",
    classification: "unknown_required",
    source: "external_operational_data",
    reviewedAt: "2026-09-02",
  },
  {
    protocolId: "taquicardia-acls",
    nodeId: "assess_stability",
    classification: "guided_elsewhere",
    source: "clinical_interpretation",
    rationale:
      "O próprio nó já oferece a opção guiada e encaminha para coleta objetiva dos critérios de instabilidade; o inventário textual não reconhecia `guiado` como saída de incerteza.",
    guidedNodeId: "tqi_dados",
    reviewedAt: "2026-09-02",
  },
  {
    protocolId: "choque",
    nodeId: "inicio",
    classification: "guided_elsewhere",
    source: "clinical_interpretation",
    rationale:
      "O próprio nó oferece caminho guiado para decompor hipoperfusão em achados observáveis; não é necessário duplicar um botão `nao_sei` quando a descoberta já é a terceira opção explícita.",
    guidedNodeId: "choque_dados",
    reviewedAt: "2026-09-02",
  },
  {
    protocolId: "tep",
    nodeId: "estabilidade",
    classification: "guided_elsewhere",
    source: "clinical_interpretation",
    rationale:
      "A decisão já oferece caminho guiado para decompor choque/hipoperfusão em achados observáveis antes de definir alto risco; a opção `guiado` é a saída explícita para incerteza.",
    guidedNodeId: "tep_instab_dados",
    reviewedAt: "2026-09-02",
  },
] as const;
