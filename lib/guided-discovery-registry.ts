import type { GuidedDiscoveryContract } from "./guided-discovery-contract";

export const GUIDED_DISCOVERY_REGISTRY: readonly GuidedDiscoveryContract[] = [
  {
    id: "avc-hic-anticoagulante-desconhecido",
    protocolId: "avc",
    decisionNodeId: "hic_anticoag",
    source: "missing_history",
    mode: "prepared_plan",
    missingInformation: "Uso de anticoagulante, agente, dose e última tomada.",
    steps: [
      {
        id: "recuperar-historia",
        prompt: "Há fonte confiável para recuperar a medicação em uso?",
        obtainBy: "Consultar familiar/cuidador, prontuário, prescrição, farmácia habitual e embalagens disponíveis em paralelo.",
      },
      {
        id: "caracterizar-agente",
        prompt: "Foi possível identificar o anticoagulante e a última dose?",
        obtainBy: "Registrar nome do fármaco, dose, horário da última tomada e função renal quando pertinente.",
      },
      {
        id: "apoio-laboratorial",
        prompt: "Os exames disponíveis ajudam a confirmar/excluir efeito anticoagulante relevante?",
        obtainBy: "Usar TP/INR, TTPa e, quando disponíveis/pertinentes, testes específicos como anti-Xa calibrado ou ensaios baseados em trombina; não usar testes rotineiros normais para excluir DOAC de forma automática.",
      },
    ],
    sufficientWhen: "Há informação suficiente para classificar uso relevante de anticoagulante como sim ou não; se o agente permanecer desconhecido, não escolher reversor específico às cegas.",
    returnDecisionNodeId: "hic_anticoag",
    reviewedAt: "2026-09-02",
  },
  {
    id: "sca-stemi-tempo-icp-desconhecido",
    protocolId: "sca",
    decisionNodeId: "stemi_reperfusao",
    source: "external_operational_data",
    mode: "prepared_plan",
    missingInformation: "Tempo real estimado do primeiro contato médico ao primeiro dispositivo na ICP primária.",
    steps: [
      {
        id: "acionar-rede",
        prompt: "A hemodinâmica/central de transferência confirmou aceitação e disponibilidade?",
        obtainBy: "Acionar imediatamente a rede, confirmar aceitação, disponibilidade da sala e logística de transporte.",
      },
      {
        id: "estimar-tempo-real",
        prompt: "Qual é o tempo total estimado até o primeiro dispositivo?",
        obtainBy: "Somar transporte, transferência, chegada e preparo real da hemodinâmica; não usar apenas tempo ideal/nominal.",
      },
    ],
    sufficientWhen: "Existe estimativa operacional suficientemente confiável para classificar FMC-to-device em ≤120 min ou >120 min.",
    returnDecisionNodeId: "stemi_reperfusao",
    reviewedAt: "2026-09-02",
  },
  {
    id: "taquicardia-instabilidade-guiada",
    protocolId: "taquicardia-acls",
    decisionNodeId: "assess_stability",
    source: "clinical_interpretation",
    mode: "existing_node",
    guidedNodeId: "tqi_dados",
    missingInformation: "Se a taquicardia está causando instabilidade clínica relevante.",
    steps: [{ id: "decompor-instabilidade", prompt: "Quais sinais objetivos de instabilidade estão presentes?", obtainBy: "Coletar os critérios observáveis já definidos no nó guiado tqi_dados." }],
    sufficientWhen: "Os critérios objetivos permitem classificar o paciente como instável, limítrofe ou estável conforme o roteamento existente.",
    returnDecisionNodeId: "assess_stability",
    reviewedAt: "2026-09-02",
  },
  {
    id: "choque-hipoperfusao-guiada",
    protocolId: "choque",
    decisionNodeId: "inicio",
    source: "clinical_interpretation",
    mode: "existing_node",
    guidedNodeId: "choque_dados",
    missingInformation: "Se há choque/hipoperfusão e quais achados sustentam essa classificação.",
    steps: [{ id: "decompor-hipoperfusao", prompt: "Quais sinais objetivos de hipoperfusão estão presentes?", obtainBy: "Coletar os achados observáveis já definidos no nó choque_dados." }],
    sufficientWhen: "Os dados objetivos permitem seguir o roteamento de choque já existente sem depender de impressão subjetiva isolada.",
    returnDecisionNodeId: "inicio",
    reviewedAt: "2026-09-02",
  },
  {
    id: "tep-instabilidade-guiada",
    protocolId: "tep",
    decisionNodeId: "estabilidade",
    source: "clinical_interpretation",
    mode: "existing_node",
    guidedNodeId: "tep_instab_dados",
    missingInformation: "Se há instabilidade hemodinâmica/hipoperfusão que classifique TEP como alto risco.",
    steps: [{ id: "decompor-risco-hemodinamico", prompt: "Quais critérios objetivos de instabilidade estão presentes?", obtainBy: "Usar o nó tep_instab_dados para decompor pressão, perfusão e demais achados observáveis." }],
    sufficientWhen: "O roteamento guiado consegue classificar instável, limítrofe, estável ou achado isquêmico isolado.",
    returnDecisionNodeId: "estabilidade",
    reviewedAt: "2026-09-02",
  },
] as const;

export function guidedDiscoveryFor(protocolId: string, decisionNodeId: string): GuidedDiscoveryContract | undefined {
  return GUIDED_DISCOVERY_REGISTRY.find(
    (item) => item.protocolId === protocolId && item.decisionNodeId === decisionNodeId
  );
}
