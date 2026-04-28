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
        ? "Pós-trombólise: foco em 24 h de vigilância, com cardio-monitorização, oximetria, neurochecks seriados e reimagem liberadora antes de liberar antitrombóticos e a transição do restante da prescrição."
        : "Tempo médio em unidade monitorizada depende da estabilidade clínica, da necessidade de investigação e do risco de deterioração neurológica.",
      postThrombolysis
        ? "Se permanecer em unidade de AVC/UTI, o papel deste card é definir o destino e lembrar as travas principais: PA controlada, via oral segura antes de medicações orais e liberação da imagem de controle."
        : "Cuidados no leito monitorizado: cabeceira elevada, triagem de deglutição antes de dieta, controle de glicemia/temperatura, prevenção de broncoaspiração e mobilização conforme segurança.",
      postThrombolysis
        ? "Sinais de alerta que exigem reavaliação imediata: piora neurológica, sangramento, angioedema orolingual, queda de saturação, broncoaspiração, PA refratária ou suspeita de transformação hemorrágica."
        : "Plano do próximo nível assistencial deve sair com prevenção secundária, investigação etiológica e seguimento já definidos.",
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
      "3. Meta de PA: manter < 180/105 mmHg por 24 h; se acima da meta, usar anti-hipertensivo IV do protocolo institucional.",
      "4. Cabeceira a 30°, repouso relativo, dieta zero até triagem de deglutição e solução isotônica EV.",
      "5. Metas clínicas: SpO2 > 94%, temperatura < 38 °C, glicemia preferencialmente 140-180 mg/dL; corrigir imediatamente se glicemia < 60 mg/dL.",
      "6. Evitar nas primeiras 24 h: punção arterial, acesso central, SNG/SNE, sonda vesical e outros procedimentos invasivos, salvo necessidade incontornável.",
      "7. Não prescrever antes de 24 h e TC de controle liberadora: AAS, clopidogrel, heparina, profilaxia farmacológica para TEV ou anticoagulação terapêutica.",
      "8. Solicitar TC de crânio em 24 h; repetir imediatamente se cefaleia intensa, náusea/vômitos, piora neurológica ou elevação sustentada da PA.",
      "9. Se angioedema pós-alteplase: suspender infusão se ainda em curso, proteger via aérea e tratar conforme protocolo institucional de reação/edema orolingual.",
      "10. Acionar equipe médica imediatamente se rebaixamento do nível de consciência, sangramento, PA refratária, queda de saturação ou suspeita de transformação hemorrágica.",
    ],
  };
}

function buildPostThrombolysisMedicationPlan(selectedDrugLabel: string) {
  return {
    title: "Pós-trombólise IV — medicações, controles e reimagem",
    tone: "warning" as const,
    lines: [
      `1. Trombolítico administrado/planejado: ${selectedDrugLabel}. Registrar horário de bolus/início e término da infusão no prontuário e na prescrição.`,
      "2. Nas primeiras 24 h, controlar PA com anti-hipertensivo EV se necessário; depois da imagem liberadora, se a hipertensão persistir e a deglutição estiver segura, retomar ou iniciar anti-hipertensivo VO conforme medicação prévia e protocolo local.",
      "3. Após 24 h e TC/RM de controle sem sangramento: liberar antiagregante/prevenção secundária conforme neurologia e etiologia. Esquema prático frequente: AAS 100-300 mg/dia, depois manutenção 81-100 mg/dia; clopidogrel 75 mg/dia apenas se estratégia alternativa/etiológica definida.",
      "4. Considerar estatina de alta intensidade após a imagem de controle: atorvastatina 40-80 mg/noite ou rosuvastatina 20-40 mg/noite, salvo contraindicação ou outro plano etiológico.",
      "5. Se o paciente estiver imobilizado e a neuroimagem de 24 h estiver estável: considerar profilaxia de TEV com enoxaparina 40 mg SC 1x/dia ou heparina não fracionada 5.000 UI SC 8/8-12/12 h, conforme risco hemorrágico e protocolo do serviço.",
      "6. Controle glicêmico prático entre 140-180 mg/dL; para hiperglicemia importante, usar insulina regular SC pela escala do hospital ou bomba EV 0,05-0,1 U/kg/h se controle fino for necessário.",
      "7. Exames de controle frequentes: glicemia capilar seriada, hemograma/coagulograma se suspeita hemorrágica, creatinina/eletrólitos conforme suporte clínico, além de TC/RM em 24 h obrigatória.",
      "8. Se cefaleia súbita, vômitos, piora do NIHSS, rebaixamento ou nova hipertensão sustentada: interromper progressão do plano e repetir neuroimagem imediatamente.",
      "9. Permanência mínima prática: 24 h em leito monitorizado/UTI; depois transição para unidade de AVC se exame neurológico, PA e reimagem estiverem estáveis.",
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
      "8. Solicitar neuroimagem de controle conforme protocolo do centro, e imediatamente se houver piora neurológica ou suspeita de reperfusão complicada.",
      "9. Acionar equipe médica imediatamente se piora neurológica, rebaixamento da consciência, novo déficit, sangramento no sítio de punção ou instabilidade hemodinâmica.",
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
      "6. Se não recebeu trombólise e não houver contraindicação: iniciar AAS 160-300 mg VO/VR nas primeiras 24-48 h; depois manutenção habitual 81-100 mg/dia.",
      "7. Em AVC/TIA menor selecionado e sem trombólise, DAPT curta pode ser discutida com neurologia: por exemplo AAS + clopidogrel 75 mg/dia por 21 dias, seguindo protocolo institucional.",
      "8. Se estiver imobilizado e sem contraindicação: compressão pneumática e, quando o risco hemorrágico permitir, enoxaparina 40 mg SC 1x/dia ou heparina não fracionada 5.000 UI SC 8/8-12/12 h.",
      "9. Iniciar estatina de alta intensidade: atorvastatina 40-80 mg/noite ou rosuvastatina 20-40 mg/noite, salvo contraindicação ou outro plano etiológico.",
      "10. Controle glicêmico prático entre 140-180 mg/dL; para hiperglicemia persistente importante, insulina regular SC pela escala do hospital ou bomba EV 0,05-0,1 U/kg/h se necessário.",
      "11. Se a PA permanecer elevada após a fase hiperaguda e a deglutição estiver segura, retomar ou iniciar anti-hipertensivo VO conforme medicação prévia e protocolo local.",
      "12. Neuroimagem de controle não precisa ser rotineira em todo caso estável, mas deve ser repetida imediatamente se houver piora neurológica; em infartos extensos/edema importante, seguir reimagem programada da neurologia.",
      "13. Exames de controle úteis na internação: ECG/telemetria, HbA1c, perfil lipídico, creatinina/eletrólitos e investigação vascular/cardioembólica conforme hipótese etiológica.",
      "14. Solicitar avaliação funcional, triagem de deglutição e plano de reabilitação conforme estabilidade clínica.",
      "15. Permanência prática: em geral 24-72 h em unidade monitorizada/unidade de AVC se estável; prolongar se NIHSS alto, disfagia importante, piora neurológica ou investigação pendente.",
      "16. Acionar equipe médica imediatamente se piora neurológica, broncoaspiração, febre persistente, hipoxemia ou instabilidade hemodinâmica.",
    ],
  };
}

function buildIschemicSecondaryPreventionPlan(receivedIvT: boolean) {
  return {
    title: "AVC isquêmico — prevenção secundária e prescrição hospitalar",
    tone: "info" as const,
    lines: [
      receivedIvT
        ? "1. Após 24 h e neuroimagem de controle sem hemorragia: iniciar antiagregante. Esquema prático comum: AAS 100-300 mg/dia, depois manutenção 81-100 mg/dia."
        : "1. Sem trombólise: manter AAS após ataque inicial 160-300 mg, seguindo com 81-100 mg/dia se essa for a estratégia definida.",
      "2. Se houver indicação cardioembólica (ex.: FA), anticoagulação oral não é iniciada de rotina na fase hiperaguda; programar início conforme tamanho do infarto, risco hemorrágico e imagem de controle.",
      "3. Profilaxia farmacológica de TEV, se indicada, não substitui anticoagulação plena para prevenção secundária cardioembólica.",
      "4. Considerar estatina de alta intensidade ainda na internação: atorvastatina 40-80 mg/noite ou rosuvastatina 20-40 mg/noite.",
      "5. Solicitar ECG/telemetria, investigação vascular/cardiogênica, perfil lipídico e HbA1c conforme protocolo da unidade de AVC.",
      "6. Prescrever triagem de deglutição, fisioterapia motora precoce quando seguro, prevenção de broncoaspiração e mobilização com metas documentadas.",
      "7. Definir antes da alta da unidade monitorizada: antitrombótico, alvo pressórico, controle glicêmico e seguimento ambulatorial/rehab.",
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
      "9. Profilaxia de TEV: compressão pneumática intermitente desde a admissão; heparina profilática só após estabilidade clínica/imagem e discussão com neurologia/neurocirurgia.",
      "10. Permanência prática: muitas vezes pelo menos 48-72 h em UTI/neurointensivismo, prolongando se houver drenagem, rebaixamento, hidrocefalia, expansão hematoma ou necessidade de suporte avançado.",
    ],
  };
}

function buildHemorrhagicMedicationPlan(snapshot: AvcCaseSnapshot) {
  const hasAntithrombotic =
    snapshot.patient.antithrombotics.trim().length > 0 &&
    !snapshot.patient.antithrombotics.toLowerCase().includes("nenhum");

  return {
    title: "AVC hemorrágico — medicações, reversão e cuidados de leito",
    tone: "danger" as const,
    lines: [
      "1. Prescrição-base: cabeceira 30°, dieta zero até avaliação de deglutição, solução isotônica EV, controle rigoroso de PA, temperatura e glicemia.",
      "2. Anti-hipertensivo EV conforme protocolo local para meta pressórica do caso; priorizar controle suave e sustentado. Se o serviço utiliza beta-bloqueador EV: metoprolol 5 mg EV lento pode ser repetido conforme resposta. Em casos refratários e monitorizados, considerar nitroprussiato em bomba.",
      "3. Controle glicêmico prático entre 140-180 mg/dL; tratar hipoglicemia imediatamente e evitar controle excessivamente intensivo. Se hiperglicemia importante persistente, usar insulina regular SC pela escala do hospital ou EV em bomba se necessário.",
      hasAntithrombotic
        ? `4. Antitrombótico prévio relatado: ${snapshot.patient.antithrombotics}. Discutir reversão específica imediatamente conforme fármaco, tempo da última dose e disponibilidade institucional.`
        : "4. Rever exposição a anticoagulantes/antiagregantes no prontuário e com família; se houver uso, discutir reversão específica imediatamente.",
      "5. Exemplos práticos de reversão: varfarina -> complexo protrombínico 4 fatores + vitamina K 10 mg EV; dabigatrana -> idarucizumabe 5 g EV; inibidores do fator Xa -> andexanet alfa se disponível ou complexo protrombínico conforme protocolo.",
      "6. Não iniciar antiagregante, anticoagulante terapêutico ou heparina profilática até estabilidade clínica/radiológica e definição especializada.",
      "7. Se o paciente estiver restrito ao leito: compressão pneumática desde a admissão; após 24-48 h, se a TC mostrar estabilidade e houver concordância da neurologia/neurocirurgia, pode ser considerada enoxaparina 40 mg SC 1x/dia ou heparina não fracionada 5.000 UI SC 8/8-12/12 h.",
      "8. Exames de controle: hemograma, coagulograma, função renal, eletrólitos, glicemia seriada e TC de controle nas primeiras 24 h ou antes se piora clínica.",
      "9. Repetir TC imediatamente se cefaleia, vômitos, anisocoria, queda do nível de consciência, nova crise convulsiva ou piora neurológica.",
      "10. Acionar neurocirurgia/neurointensivismo para avaliação de derivação, drenagem, descompressão ou monitorização invasiva quando houver indicação clínica/radiológica.",
    ],
  };
}

export function buildAvcPrescriptionTemplates(snapshot: AvcCaseSnapshot, destinationOverride?: string) {
  const templates: { title: string; tone?: "info" | "warning" | "danger"; lines: string[] }[] = [];
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
    templates.push(buildHemorrhagicMedicationPlan(snapshot));
    templates.push(buildDestinationPlan(snapshot, destinationLabel));
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
    templates.push(buildPostThrombolysisMedicationPlan(selectedDrug.label));
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
    templates.push(buildIschemicSecondaryPreventionPlan(false));
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

  if (snapshot.decision.ivThrombolysis.gate === "eligible") {
    templates.push(buildIschemicSecondaryPreventionPlan(true));
  }

  templates.push(buildDestinationPlan(snapshot, destinationLabel));

  return templates;
}
