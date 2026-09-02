import type { ClinicalGatePolicy } from "./clinical-gate-policy";

export const CLINICAL_GATE_REGISTRY: readonly ClinicalGatePolicy[] = [
  {
    id: "avc-ivt-hemorragia-aguda",
    protocolId: "avc",
    nodeId: "trombolise",
    level: "hard_stop",
    title: "Trombólise IV contraindicada",
    message: "Há hemorragia intracraniana aguda na TC. Não administrar trombólise IV para AVC isquêmico.",
    rationale:
      "A presença de hemorragia intracraniana aguda na neuroimagem é contraindicação absoluta à trombólise IV; não é um cenário apropriado para override operacional.",
    overrideAllowed: false,
    resolution: "Voltar ao resultado da TC e seguir o ramo hemorrágico apropriado em vez de trombólise IV.",
    resolutionNodeId: "tc_resultado",
    source: {
      reference: "2026 AHA/ASA Guideline for the Early Management of Patients With Acute Ischemic Stroke — Table 8",
      version: "2026",
      reviewedAt: "2026-09-02",
    },
  },
  {
    id: "sca-tempo-icp-nao-confirmado",
    protocolId: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    level: "soft_stop",
    title: "Tempo real até ICP ainda não confirmado",
    message:
      "A estratégia de reperfusão depende do tempo operacional real até o primeiro dispositivo; confirme a rede antes de assumir ≤120 min ou >120 min.",
    rationale:
      "É uma informação operacional crítica, mas situações excepcionais podem exigir prosseguir com julgamento clínico; por isso o sistema alerta e exige justificativa, sem bloqueio absoluto.",
    overrideAllowed: true,
    resolution: "Confirmar aceitação, transporte e estimativa FMC-to-device, ou registrar motivo para prosseguir sem o dado.",
    source: {
      reference: "2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for Acute Coronary Syndromes",
      version: "2025",
      reviewedAt: "2026-09-02",
    },
  },
  {
    id: "taquicardia-sedacao-cardioversao",
    protocolId: "taquicardia-acls",
    nodeId: "unstable_cardioversion",
    level: "advisory",
    title: "Sedação quando factível",
    message:
      "Providencie sedação quando factível, mas não atrase cardioversão necessária em paciente crítico por indisponibilidade imediata de sedação.",
    rationale:
      "A AHA recomenda sedação quando factível; em condição crítica, atraso do choque por esse motivo pode ser mais perigoso que proceder sem sedação.",
    overrideAllowed: false,
    resolution: "Sedação realizada quando viável ou cardioversão imediata quando a condição clínica exige.",
    source: {
      reference: "AHA 2025 Electrical Cardioversion Algorithm",
      version: "2025",
      reviewedAt: "2026-09-02",
    },
  },
] as const;

export function clinicalGateFor(id: string): ClinicalGatePolicy | undefined {
  return CLINICAL_GATE_REGISTRY.find((gate) => gate.id === id);
}
