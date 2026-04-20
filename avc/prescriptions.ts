import type { AvcCaseSnapshot } from "./domain";
import { AVC_DESTINATION_LABELS, THROMBOLYTICS } from "./protocol-config";

export function buildAvcPrescriptionTemplates(snapshot: AvcCaseSnapshot) {
  const templates: Array<{ title: string; tone?: "info" | "warning" | "danger"; lines: string[] }> = [];
  const destinationLabel = AVC_DESTINATION_LABELS[snapshot.decision.destination.recommended];
  const selectedDrug = THROMBOLYTICS.find((item) => item.id === snapshot.dose.thrombolyticId) ?? THROMBOLYTICS[0];
  const doseSummary =
    snapshot.dose.totalDoseMg != null
      ? `${selectedDrug.label} ${snapshot.dose.totalDoseMg.toFixed(1)} mg`
      : `${selectedDrug.label} com peso ainda pendente para cálculo definitivo`;

  if (snapshot.decision.pathway === "hemorrhagic") {
    templates.push({
      title: "AVC hemorrágico — conduta intensiva inicial",
      tone: "danger",
      lines: [
        "Internação preferencial em UTI / neurointensivismo com monitorização neurológica e hemodinâmica contínuas.",
        "Controlar PA conforme meta institucional para hemorragia intracraniana e tratar deterioração neurológica imediatamente.",
        "Revisar anticoagulantes/antiagregantes e considerar reversão específica quando aplicável.",
        "Acionar neurocirurgia/neurointensivismo diante de HIC, hidrocefalia, rebaixamento ou hematoma expansivo.",
      ],
    });
    templates.push({
      title: "UTI / destino e critérios de transição",
      tone: "warning",
      lines: [
        `Destino recomendado: ${destinationLabel}.`,
        "Tempo médio inicial em leito intensivo: 24-72 h, prolongando se houver expansão do sangramento, ventilação mecânica ou instabilidade.",
        "Critérios de saída do leito intensivo: exame neurológico estável, PA controlada sem droga vasoativa, sem piora radiológica aguda e sem necessidade de suporte avançado.",
      ],
    });
    return templates;
  }

  if (snapshot.decision.ivThrombolysis.gate === "eligible") {
    templates.push({
      title: "Pré-trombólise IV — preparo e medicações",
      tone: "warning",
      lines: [
        `Trombolítico do caso: ${doseSummary}.`,
        "Garantir 2 acessos periféricos, solução isotônica, monitor cardíaco e bomba de infusão quando aplicável.",
        "Se PA estiver acima da meta, usar anti-hipertensivo IV do protocolo institucional antes do bolus/infusão.",
        "Não iniciar AAS, clopidogrel, heparina ou anticoagulante antes da reimagem de controle em 24 h.",
      ],
    });
    templates.push({
      title: "Pós-trombólise IV — primeiras 24 horas",
      tone: "warning",
      lines: [
        "Destino preferencial em unidade de AVC ou UTI com exame neurológico e PA seriados.",
        "Meta pressórica pós-trombólise: manter abaixo do limite institucional; tratar qualquer elevação prontamente.",
        "Evitar punções arteriais/venosas desnecessárias, SNG e procedimentos invasivos se não forem indispensáveis.",
        "Repetir TC/RM de controle em 24 h ou antes se houver piora neurológica.",
      ],
    });
  } else {
    templates.push({
      title: "AVC isquêmico sem trombólise IV — conduta clínica",
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

  templates.push({
    title: "Destino, monitorização e alta do cuidado intensivo",
    tone: snapshot.decision.ivThrombolysis.gate === "eligible" ? "warning" : "info",
    lines: [
      `Destino recomendado agora: ${destinationLabel}.`,
      snapshot.decision.ivThrombolysis.gate === "eligible"
        ? "Tempo médio de permanência em unidade monitorizada/UTI: 24-48 h após trombólise, prolongando se houver sangramento, piora neurológica ou instabilidade."
        : "Tempo médio em unidade monitorizada depende da estabilidade clínica, da necessidade de investigação e do risco de deterioração neurológica.",
      "Cuidados no leito monitorizado: cabeceira elevada, triagem de deglutição antes de dieta, controle de glicemia/temperatura, prevenção de broncoaspiração e mobilização conforme segurança.",
      "Critérios de alta da UTI/unidade monitorizada: exame neurológico estável, PA/glicemia controladas, sem necessidade de suporte avançado e plano de prevenção secundária/destino já definido.",
    ],
  });

  return templates;
}
