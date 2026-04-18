import type { CoronarySnapshot } from "./domain";
import { DESTINATION_LABELS } from "./protocol-config";

export function buildCoronaryPrescriptionTemplates(snapshot: CoronarySnapshot) {
  const templates: Array<{ title: string; tone?: "info" | "warning" | "danger"; lines: string[] }> = [];
  const category = snapshot.classification.category;
  const strategy = snapshot.treatment.reperfusionStrategy;

  if (category === "stemi" && strategy === "primary_pci") {
    templates.push({
      title: "STEMI com angioplastia primária",
      tone: "danger",
      lines: [
        "Monitorização intensiva contínua e preparo para hemodinâmica imediata.",
        "AAS, segundo antiagregante, anticoagulação e estatina de alta intensidade conforme protocolo e contraindicações.",
        "Registrar hora de diagnóstico, decisão, entrada na hemodinâmica e reperfusão.",
        "Cuidados pós-PCI e vigilância para arritmias, choque e isquemia recorrente.",
      ],
    });
  }

  if (category === "stemi" && strategy === "fibrinolysis") {
    templates.push({
      title: "STEMI com trombólise",
      tone: "warning",
      lines: [
        "Administrar trombolítico apenas após dupla checagem de contraindicações e dose.",
        "Associar antiagregação e anticoagulação conforme protocolo configurado.",
        "Monitorização intensiva, avaliação de sucesso/falha e estratégia farmacoinvasiva / resgate.",
        "Registrar porta-agulha, início da trombólise e evolução da dor/ECG.",
      ],
    });
  }

  if (category === "nstemi" || category === "unstable_angina") {
    templates.push({
      title: category === "nstemi" ? "NSTEMI internado" : "Angina instável internada",
      tone: "info",
      lines: [
        "Monitorização cardíaca, ECG/troponina seriados e reavaliação de dor/instabilidade.",
        "AAS e segundo antiagregante/anticoagulante conforme risco, estratégia e contraindicações.",
        "Estatina de alta intensidade e analgesia/nitrato apenas se apropriado.",
        "Definir estratégia invasiva imediata, precoce ou seletiva conforme risco clínico.",
      ],
    });
  }

  if (category === "stable_angina") {
    templates.push({
      title: "Angina estável / DAC crônica",
      tone: "info",
      lines: [
        "Ajustar antianginosos, controle pressórico e prevenção secundária conforme risco global.",
        "Revisar adesão medicamentosa, fatores de risco e metas lipídicas.",
        "Programar investigação funcional/anatômica e seguimento com cardiologia conforme perfil clínico.",
        `Destino previsto: ${DESTINATION_LABELS[snapshot.destination.recommended]}.`,
      ],
    });
  }

  if (category === "non_coronary" || category === "indeterminate") {
    templates.push({
      title: "Dor torácica em observação / revisão diagnóstica",
      tone: "warning",
      lines: [
        "Não sugerir alta sem dados mínimos de segurança e série diagnóstica adequada.",
        "Repetir ECG/troponina quando indicado e reavaliar diagnósticos diferenciais graves.",
        "Documentar motivo para manter observação ou eventual alta com seguimento.",
      ],
    });
  }

  return templates;
}
