import type { AvcCaseSnapshot } from "./domain";
import { AVC_DESTINATION_LABELS, THROMBOLYTICS } from "./protocol-config";

function normalizeDestinationLabel(snapshot: AvcCaseSnapshot, destinationOverride?: string) {
  const manual = destinationOverride?.trim();
  if (manual) return manual;
  return AVC_DESTINATION_LABELS[snapshot.decision.destination.recommended];
}

function buildDestinationPlan(snapshot: AvcCaseSnapshot, destinationLabel: string) {
  const lower = destinationLabel.toLowerCase();
  const postThrombolysis = snapshot.decision.ivThrombolysis.gate === "eligible";

  if (lower.includes("alta")) {
    return {
      title: "Destino final — alta com plano estruturado",
      tone: "info" as const,
      lines: [
        `Destino final: ${destinationLabel}.`,
        "Entregar prescrição de prevenção secundária, metas pressóricas/glicêmicas e orientação formal de sinais de alarme.",
        "Garantir triagem de deglutição, avaliação funcional e seguimento neurológico definidos antes da saída.",
        postThrombolysis
          ? "Se houve trombólise, alta só após imagem de controle, estabilidade neurológica e ausência de complicações hemorrágicas."
          : "Alta apenas se o déficit estiver estável, a etiologia estiver encaminhada e o risco de deterioração imediata for baixo.",
      ],
    };
  }

  if (lower.includes("enfermaria")) {
    return {
      title: "Destino final — transição para enfermaria",
      tone: "info" as const,
      lines: [
        `Destino final: ${destinationLabel}.`,
        "Transferir da vigilância intensiva apenas com exame neurológico estável, PA/glicemia controladas e sem necessidade de suporte avançado.",
        "Deixar explícitos prevenção de broncoaspiração, mobilização segura, reabilitação e prevenção secundária já iniciadas.",
        postThrombolysis
          ? "Após trombólise, a transição exige 24 h completas de monitorização, imagem de controle e liberação para iniciar antitrombótico conforme protocolo."
          : "Sem trombólise, manter reavaliação seriada nas primeiras 24 h e plano etiológico/documental fechado.",
      ],
    };
  }

  if (lower.includes("unidade de avc") || lower.includes("unidade avc")) {
    return {
      title: "Destino final — unidade de AVC",
      tone: "warning" as const,
      lines: [
        `Destino final: ${destinationLabel}.`,
        "Manter leito monitorizado com exame neurológico seriado, triagem de deglutição, controle de PA/temperatura/glicemia e mobilização conforme segurança.",
        "Transferir o cuidado já com metas das próximas 24 h, prevenção secundária e investigação etiológica explicitadas.",
        postThrombolysis
          ? "Se pós-trombólise, manter as restrições de 24 h e só iniciar antiagregante/anticoagulação após imagem de controle."
          : "Sem trombólise, consolidar rapidamente o plano antitrombótico e o destino subsequente conforme estabilidade clínica.",
      ],
    };
  }

  return {
    title: "Destino, monitorização e alta do cuidado intensivo",
    tone: postThrombolysis ? "warning" as const : "info" as const,
    lines: [
      `Destino recomendado agora: ${destinationLabel}.`,
      postThrombolysis
        ? "Pós-trombólise: manter permanência mínima de 24 h em unidade monitorizada/UTI, prolongando se houver transformação hemorrágica, piora neurológica, PA instável ou necessidade de suporte avançado."
        : "Tempo médio em unidade monitorizada depende da estabilidade clínica, da necessidade de investigação e do risco de deterioração neurológica.",
      postThrombolysis
        ? "Prescrição-base das primeiras 24 h: monitor cardíaco contínuo, oximetria, cabeceira 30°, dieta zero até triagem de deglutição, solução isotônica EV e neurochecks/PA seriados."
        : "Cuidados no leito monitorizado: cabeceira elevada, triagem de deglutição antes de dieta, controle de glicemia/temperatura, prevenção de broncoaspiração e mobilização conforme segurança.",
      postThrombolysis
        ? "Controle pressórico pós-trombólise: meta < 180/105 mmHg; se acima da meta, usar anti-hipertensivo EV protocolizado como labetalol em bolus ou nicardipina/clevidipina em bomba conforme disponibilidade e protocolo local."
        : "Critérios de alta da UTI/unidade monitorizada: exame neurológico estável, PA/glicemia controladas, sem necessidade de suporte avançado e plano de prevenção secundária/destino já definido.",
      postThrombolysis
        ? "Restrições críticas: não prescrever AAS, clopidogrel, heparina, profilaxia farmacológica para TEV ou anticoagulação terapêutica antes de 24 h e TC de controle liberadora."
        : "Plano do próximo nível assistencial deve sair com prevenção secundária, investigação etiológica e seguimento já definidos.",
      postThrombolysis
        ? "Solicitar TC de controle em 24 h e repetir imediatamente se houver cefaleia intensa, náusea/vômitos, rebaixamento, piora do NIHSS, nova hipertensão sustentada ou qualquer suspeita de sangramento."
        : "Critérios de alta da UTI/unidade monitorizada: exame neurológico estável, PA/glicemia controladas, sem necessidade de suporte avançado e plano de prevenção secundária/destino já definido.",
      postThrombolysis
        ? "Sinais de alerta que exigem reavaliação imediata: piora neurológica, sangramento externo, angioedema orolingual, queda de saturação, broncoaspiração, PA refratária ou suspeita de transformação hemorrágica."
        : "Manter vigilância para piora neurológica, broncoaspiração, febre, hipoxemia e descompensação hemodinâmica.",
    ],
  };
}

function buildPostThrombolysisIcuPlan(destinationLabel: string) {
  return {
    title: "UTI / unidade monitorizada — prescrição padrão pós-trombólise",
    tone: "warning" as const,
    lines: [
      `1. Internar em ${destinationLabel} por pelo menos 24 h após trombólise, com monitor cardíaco contínuo e oximetria.`,
      "2. Sinais vitais + exame neurológico/NIHSS: 15/15 min por 2 h, depois 30/30 min por 6 h, depois 1/1 h até completar 24 h.",
      "3. Meta de PA: manter < 180/105 mmHg por 24 h.",
      "4. Se PA > 180/105 mmHg: tratar imediatamente com anti-hipertensivo IV protocolizado; opção prática labetalol 10-20 mg EV em 1-2 min, repetir 1 vez se necessário, ou nicardipina EV 5 mg/h com titulação progressiva conforme protocolo local.",
      "5. Cabeceira a 30°, repouso relativo e vigilância contínua de sangramento, angioedema orolingual, broncoaspiração e piora neurológica.",
      "6. Dieta zero até triagem de deglutição; após liberação, dieta conforme via segura definida.",
      "7. Hidratação venosa: solução isotônica EV; evitar soluções glicosadas de rotina salvo indicação específica.",
      "8. Metas clínicas: SpO2 > 94%, temperatura < 38 °C, glicemia preferencialmente 140-180 mg/dL; corrigir imediatamente se glicemia < 60 mg/dL.",
      "9. Evitar nas primeiras 24 h: punção arterial, acesso central, SNG/SNE, sonda vesical e outros procedimentos invasivos, salvo necessidade incontornável.",
      "10. Não prescrever antes de 24 h e TC de controle liberadora: AAS, clopidogrel, heparina, profilaxia farmacológica para TEV ou anticoagulação terapêutica.",
      "11. Solicitar TC de crânio em 24 h; repetir imediatamente se cefaleia intensa, náusea/vômitos, piora neurológica ou elevação sustentada da PA.",
      "12. Se angioedema pós-alteplase: suspender infusão se ainda em curso, proteger via aérea e tratar conforme protocolo institucional de reação/edema orolingual.",
      "13. Acionar equipe médica imediatamente se rebaixamento do nível de consciência, sangramento, PA refratária, queda de saturação ou suspeita de transformação hemorrágica.",
    ],
  };
}

function buildPostThrombectomyPlan(snapshot: AvcCaseSnapshot, destinationLabel: string) {
  const receivedIvT = snapshot.decision.ivThrombolysis.gate === "eligible";
  return {
    title: "Pós-trombectomia / transferência — prescrição padrão",
    tone: "warning" as const,
    lines: [
      `1. Internar em ${destinationLabel} com monitorização neurológica e hemodinâmica contínuas nas primeiras 24 h.`,
      "2. Sinais vitais + exame neurológico seriado conforme protocolo do serviço/centro de trombectomia.",
      receivedIvT
        ? "3. Se recebeu trombólise IV associada: manter PA < 180/105 mmHg por pelo menos 24 h."
        : "3. Se não recebeu trombólise IV: manter PA conforme protocolo pós-trombectomia do serviço, evitando hipotensão e reduções excessivas.",
      "4. Cabeceira a 30°, dieta zero até triagem de deglutição e solução isotônica EV.",
      "5. Revisar neuroimagem de controle conforme protocolo local ou imediatamente se houver piora neurológica.",
      receivedIvT
        ? "6. Não iniciar AAS, clopidogrel, heparina ou anticoagulação terapêutica antes de 24 h e imagem de controle liberadora."
        : "6. Definir antitrombótico/prevenção secundária após imagem de controle e estratégia final da neurologia/intervenção.",
      "7. Vigiar complicações de punção arterial, transformação hemorrágica, broncoaspiração, febre e hiperglicemia.",
      "8. Acionar equipe médica imediatamente se piora neurológica, rebaixamento da consciência, novo déficit, sangramento no sítio de punção ou instabilidade hemodinâmica.",
    ],
  };
}

function buildIschemicClinicalCarePlan(destinationLabel: string) {
  return {
    title: "AVC isquêmico sem trombólise — prescrição padrão",
    tone: "info" as const,
    lines: [
      `1. Internar em ${destinationLabel} com monitorização neurológica seriada nas primeiras 24 h.`,
      "2. Cabeceira a 30°, monitor cardíaco se indicado, oximetria e controle seriado de PA, temperatura e glicemia.",
      "3. Dieta zero até triagem de deglutição; após liberação, dieta conforme via segura definida.",
      "4. Solução isotônica EV se necessário; evitar hipotensão e hipovolemia.",
      "5. Meta clínica: SpO2 > 94%, temperatura < 38 °C, glicemia preferencialmente 140-180 mg/dL e correção imediata se < 60 mg/dL.",
      "6. Iniciar prevenção secundária/antitrombótico conforme neurologia, imagem e etiologia, se não houver contraindicação.",
      "7. Solicitar investigação etiológica, avaliação funcional e plano de reabilitação conforme estabilidade clínica.",
      "8. Acionar equipe médica imediatamente se piora neurológica, broncoaspiração, febre persistente, hipoxemia ou instabilidade hemodinâmica.",
    ],
  };
}

function buildHemorrhagicIcuPlan(destinationLabel: string) {
  return {
    title: "AVC hemorrágico — prescrição padrão de UTI",
    tone: "danger" as const,
    lines: [
      `1. Internar em ${destinationLabel} com monitorização neurológica e hemodinâmica contínuas.`,
      "2. Sinais vitais + exame neurológico seriados; vigiar rebaixamento da consciência, sinais de hipertensão intracraniana e expansão do hematoma.",
      "3. Controle pressórico com titulação cuidadosa; em geral, se PAS inicial 150-220 mmHg, perseguir redução rápida e sustentada para cerca de 140 mmHg, evitando queda excessiva e variabilidade ampla.",
      "4. Cabeceira a 30°, dieta zero até avaliação de deglutição e solução isotônica EV.",
      "5. Revisar imediatamente uso de anticoagulantes/antiagregantes e providenciar reversão específica quando indicada.",
      "6. Solicitar TC de controle/seriada nas primeiras 24 h conforme evolução e imediatamente se houver piora neurológica.",
      "7. Acionar neurocirurgia/neurointensivismo diante de IVH, hidrocefalia, efeito de massa, hematoma expansivo ou deterioração clínica.",
      "8. Não usar profilaxia anticonvulsivante de rotina se não houver crise clínica/eletrográfica documentada, salvo indicação especializada.",
    ],
  };
}

export function buildAvcPrescriptionTemplates(snapshot: AvcCaseSnapshot, destinationOverride?: string) {
  const templates: Array<{ title: string; tone?: "info" | "warning" | "danger"; lines: string[] }> = [];
  const destinationLabel = normalizeDestinationLabel(snapshot, destinationOverride);
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
    templates.push(buildHemorrhagicIcuPlan(destinationLabel));
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
        "Meta pressórica pós-trombólise: manter PA < 180/105 mmHg por pelo menos 24 h; tratar qualquer elevação prontamente.",
        "Evitar punções arteriais/venosas desnecessárias, SNG, sonda vesical e procedimentos invasivos se não forem indispensáveis.",
        "Não iniciar antiagregante, anticoagulante ou heparina profilática antes de 24 h e imagem de controle liberadora.",
        "Repetir TC/RM de controle em 24 h ou antes se houver piora neurológica, cefaleia intensa, náusea/vômitos ou suspeita de sangramento.",
        "Vigiar sinais de alarme: transformação hemorrágica, angioedema orolingual, broncoaspiração, hipoxemia e hipertensão refratária.",
      ],
    });
    templates.push(buildPostThrombolysisIcuPlan(destinationLabel));
  } else if (snapshot.decision.ivThrombolysis.gate === "correctable") {
    templates.push({
      title: "AVC isquêmico com bloqueio corrigível — conduta imediata",
      tone: "warning",
      lines: [
        "Não classificar ainda como sem trombólise definitiva: o caso permanece em janela de reperfusão enquanto as correções forem factíveis e rápidas.",
        "Corrigir imediatamente os fatores reversíveis destacados pelo módulo, reavaliar elegibilidade após cada intervenção e registrar o horário da liberação ou contraindicação final.",
        "Manter preparo de reperfusão, monitorização intensiva e comunicação ativa com neurologia enquanto o bloqueio corrigível estiver sendo manejado.",
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
    templates.push(buildIschemicClinicalCarePlan(destinationLabel));
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
    templates.push(buildPostThrombectomyPlan(snapshot, destinationLabel));
  }

  templates.push(buildDestinationPlan(snapshot, destinationLabel));

  return templates;
}
