import type { AvcCaseSnapshot } from "./domain";

export function buildAvcPrescriptionTemplates(snapshot: AvcCaseSnapshot) {
  const templates: Array<{ title: string; tone?: "info" | "warning" | "danger"; lines: string[] }> = [];

  if (snapshot.decision.pathway === "hemorrhagic") {
    templates.push({
      title: "Paciente com AVC hemorrágico",
      tone: "danger",
      lines: [
        "Monitorização neurológica intensiva e pressão arterial conforme alvo do protocolo local.",
        "Revisar anticoagulação e considerar reversão específica quando aplicável.",
        "Acionar neurocirurgia/neurointensivismo diante de HIC, hidrocefalia, deterioração ou hematoma expansivo.",
        "Evitar trombólise: hemorragia confirmada na imagem inicial.",
      ],
    });
    return templates;
  }

  if (snapshot.decision.ivThrombolysis.gate === "eligible") {
    templates.push({
      title: "Paciente trombolisado",
      tone: "warning",
      lines: [
        "Monitorização intensiva com reavaliação neurológica e pressórica seriadas.",
        "Manter PA abaixo do alvo pós-trombólise configurado; tratar elevações prontamente.",
        "Evitar punções desnecessárias e antitrombóticos até controle por protocolo local.",
        "Programar reimagem de controle conforme protocolo institucional.",
      ],
    });
  } else {
    templates.push({
      title: "AVC isquêmico sem trombólise intravenosa",
      tone: "info",
      lines: [
        "Suporte clínico, monitorização, prevenção de complicações e reavaliação neurológica seriada.",
        "Considerar antitrombótico/prevenção secundária apenas quando permitido e após excluir contraindicações específicas.",
        "Documentar claramente o motivo de não trombólise e manter vigilância para deterioração.",
      ],
    });
  }

  if (snapshot.decision.thrombectomy.gate === "eligible" || snapshot.decision.thrombectomy.gate === "needs_review") {
    templates.push({
      title: "Avaliação para trombectomia / transferência",
      tone: "warning",
      lines: [
        "Acionar neurologia/intervenção e registrar horário de decisão.",
        "Organizar transferência imediata quando não houver hemodinâmica/neurointervenção local.",
        "Manter suporte hemodinâmico e via aérea durante a janela de transferência.",
      ],
    });
  }

  return templates;
}
