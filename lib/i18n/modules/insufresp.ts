/**
 * Insuficiência respiratória / dispneia — dicionário PT → ES.
 * Terminologia: insuficiencia respiratoria, neumotórax, EPOC, sibilancias,
 * VNI, ventilación protectora, decúbito prono.
 *
 * Identificadores de nó (sim, nao, q_subito…) mapeiam para si mesmos.
 */
export const ES_INSUFRESP: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Dispneia grave?": "¿Disnea grave?",
  "Dispneia leve": "Disnea leve",
  "Início súbito (segundos a minutos)?": "¿Inicio súbito (de segundos a minutos)?",
  "Trauma torácico / procedimento recente?": "¿Trauma torácico o procedimiento reciente?",
  "PNEUMOTÓRAX": "NEUMOTÓRAX",
  "Suspeita de TEP?": "¿Sospecha de TEP?",
  "TEP SUSPEITO": "TEP SOSPECHADO",
  "Suspeita de anafilaxia?": "¿Sospecha de anafilaxia?",
  "ANAFILAXIA": "ANAFILAXIA",
  "Avaliar embolia / arritmia / isquemia": "Evaluar embolia / arritmia / isquemia",
  "Chiado / sibilância predominante?": "¿Predominan las sibilancias?",
  "História de asma ou atopia?": "¿Antecedente de asma o atopia?",
  "ASMA EXACERBADA": "ASMA EXACERBADA",
  "Tabagismo extenso / DPOC conhecido?": "¿Tabaquismo importante o EPOC conocida?",
  "DPOC EXACERBADO": "EPOC EXACERBADA",
  "SIBILÂNCIA DE NOVO": "SIBILANCIAS DE NOVO",
  "Congestão cardíaca?": "¿Congestión cardíaca?",
  "EAP CARDIOGÊNICO": "EAP CARDIOGÉNICO",
  "Pneumonia?": "¿Neumonía?",
  "PNEUMONIA": "NEUMONÍA",
  "SARA?": "¿SDRA?",
  "SARA (critérios de Berlim)": "SDRA (criterios de Berlín)",
  "Hipoventilação / hipercapnia?": "¿Hipoventilación / hipercapnia?",
  "Causa de hipoventilação?": "¿Causa de la hipoventilación?",
  "INSUFICIÊNCIA RESPIRATÓRIA HIPERCÁPNICA": "INSUFICIENCIA RESPIRATORIA HIPERCÁPNICA",
  "Causa indefinida — investigar": "Causa indefinida — investigar",
  "Insuficiência respiratória": "Insuficiencia respiratoria",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "SpO₂ < 90% ou dispneia grave (uso de musculatura acessória, exaustão)?":
    "¿SpO₂ < 90% o disnea grave (uso de musculatura accesoria, agotamiento)?",
  "O quadro instalou-se de forma abrupta?": "¿El cuadro se instaló de forma brusca?",
  "Trauma de tórax, punção, intubação ou cateter venoso central recente?":
    "¿Trauma torácico, punción, intubación o catéter venoso central reciente?",
  "Fator de risco para TEP + taquicardia + dor pleurítica?":
    "¿Factor de riesgo para TEP + taquicardia + dolor pleurítico?",
  "Exposição a alérgeno, urticária ou angioedema?":
    "¿Exposición a un alérgeno, urticaria o angioedema?",
  "Sibilância expiratória predomina à ausculta?":
    "¿Predominan las sibilancias espiratorias en la auscultación?",
  "Asma/atopia conhecida?": "¿Asma o atopia conocida?",
  "DPOC conhecido ou tabagismo importante?": "¿EPOC conocida o tabaquismo importante?",
  "Crepitantes bilaterais + JVP elevada + edema de membros?":
    "¿Crepitantes bilaterales + ingurgitación yugular + edema de miembros?",
  "Febre + tosse produtiva + crepitantes localizados?":
    "¿Fiebre + tos productiva + crepitantes localizados?",
  "Infiltrado bilateral + P/F < 300 + causa identificável (sepse, aspiração, trauma)?":
    "¿Infiltrado bilateral + P/F < 300 + causa identificable (sepsis, aspiración, trauma)?",
  "Hipoventilação + hipercapnia sem doença pulmonar clara?":
    "¿Hipoventilación + hipercapnia sin enfermedad pulmonar clara?",
  "GCS rebaixado, intoxicação ou obesidade mórbida?":
    "¿Glasgow disminuido, intoxicación u obesidad mórbida?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Sem hipoxemia grave — avaliar ambulatorialmente se estável.":
    "Sin hipoxemia grave — evaluar de forma ambulatoria si está estable.",
  "Dispneia súbita + dor + murmúrio ausente unilateral.":
    "Disnea súbita + dolor + murmullo vesicular ausente unilateral.",
  "Dispneia súbita + taquicardia + fator de risco.":
    "Disnea súbita + taquicardia + factor de riesgo.",
  "Reação sistêmica com comprometimento respiratório.":
    "Reacción sistémica con compromiso respiratorio.",
  "Dispneia súbita sem trauma/TEP/anafilaxia evidentes.":
    "Disnea súbita sin trauma, TEP ni anafilaxia evidentes.",
  "Broncoespasmo com sibilância e história de asma.":
    "Broncoespasmo con sibilancias y antecedente de asma.",
  "Sibilância + história de DPOC/tabagismo.": "Sibilancias + antecedente de EPOC o tabaquismo.",
  "Sibilância sem asma/DPOC prévios.": "Sibilancias sin asma ni EPOC previas.",
  "Congestão pulmonar por falência de VE.":
    "Congestión pulmonar por fallo del ventrículo izquierdo.",
  "Infecção do parênquima pulmonar.": "Infección del parénquima pulmonar.",
  "Lesão inflamatória difusa com hipoxemia refratária.":
    "Lesión inflamatoria difusa con hipoxemia refractaria.",
  "Falência ventilatória (bomba) — drive ou mecânica.":
    "Fallo ventilatorio (de bomba) — del impulso respiratorio o mecánico.",
  "Sem padrão claro — ampliar investigação.": "Sin un patrón claro — ampliar la investigación.",

  // ── Opções e atalhos ───────────────────────────────────────────────────────
  "Sim — grave": "Sí — grave",
  "Não — leve": "No — leve",
  "Sim — súbito": "Sí — súbito",
  "Não — gradual": "No — gradual",
  "Sim": "Sí",
  "Não": "No",
  "Sim — TEP suspeito": "Sí — TEP sospechado",
  "Guia de TEP": "Guía de TEP",
  "Sim — anafilaxia": "Sí — anafilaxia",
  "Guia de anafilaxia": "Guía de anafilaxia",
  "Sim — asma": "Sí — asma",
  "Ventilação mecânica": "Ventilación mecánica",
  "Sim — DPOC": "Sí — EPOC",
  "Sim — EAP cardiogênico": "Sí — EAP cardiogénico",
  "Guia de EAP": "Guía de EAP",
  "Sim — pneumonia": "Sí — neumonía",
  "Sim — SARA (Berlim)": "Sí — SDRA (Berlín)",
  "Não / indefinido": "No / indefinido",
  "Probabilidade, diagnóstico e tratamento.": "Probabilidad, diagnóstico y tratamiento.",
  "Adrenalina IM e manejo escalonado.": "Adrenalina IM y manejo escalonado.",
  "Estratégia obstrutiva se IOT.": "Estrategia obstructiva si se intuba.",
  "VNI/VM na exacerbação.": "VNI/ventilación mecánica en la exacerbación.",
  "Manejo cardiogênico × SARA.": "Manejo cardiogénico × SDRA.",
  "Estratégia protetora ARDSNet.": "Estrategia protectora ARDSNet.",
  "VNI/IOT na falência ventilatória.": "VNI/intubación en el fallo ventilatorio.",

  // ── Evidência e ações ──────────────────────────────────────────────────────
  "Estabilização primeiro: O₂ alvo, monitor, acessos. Preparar VNI/IOT se falência.":
    "Estabilización primero: O₂ según objetivo, monitor y accesos. Preparar la VNI o la intubación si hay fallo.",
  "Investigar a causa; reavaliar SpO₂, FR e esforço; escalar se piora.":
    "Investigar la causa; reevaluar SpO₂, FR y esfuerzo respiratorio; escalar si empeora.",
  "Exames: clínico + RX/USG (não atrasar se hipertensivo).":
    "Exámenes: clínico + radiografía/ecografía (no demorar si es a tensión).",
  "Tratamento: hipertensivo → descompressão imediata (agulha 14G) → dreno; simples → drenagem conforme tamanho.":
    "Tratamiento: a tensión → descompresión inmediata (aguja 14G) → tubo de drenaje; simple → drenaje según el tamaño.",
  "IOT se insuficiência respiratória refratária.":
    "Intubar si la insuficiencia respiratoria es refractaria.",
  "Exames: Wells + D-dímero (se improvável) / AngioTC; ECG, gasometria, troponina/BNP.":
    "Exámenes: escala de Wells + dímero D (si es improbable) o angiotomografía; ECG, gasometría, troponina y BNP.",
  "Tratamento: O₂; anticoagulação; trombólise se alto risco/instável. Ver o guia de TEP.":
    "Tratamiento: O₂; anticoagulación; trombólisis si es de alto riesgo o está inestable. Ver la guía de TEP.",
  "Tratamento: ADRENALINA IM IMEDIATA (0,3–0,5 mg na coxa); O₂; cristaloide; via aérea se angioedema progressivo.":
    "Tratamiento: ADRENALINA IM INMEDIATA (0,3–0,5 mg en el muslo); O₂; cristaloide; asegurar la vía aérea si el angioedema progresa.",
  "Exames: o diagnóstico é clínico — não atrasar a adrenalina.":
    "Exámenes: el diagnóstico es clínico — no retrasar la adrenalina.",
  "Exames: ECG (arritmia/IAM), saturação, gasometria, troponina.":
    "Exámenes: ECG (arritmia/infarto), saturación, gasometría y troponina.",
  "Considerar SCA, arritmia, embolia gasosa/gordurosa; tratar conforme achado.":
    "Considerar SCA, arritmia y embolia gaseosa o grasa; tratar según el hallazgo.",
  "Exames: pico de fluxo/espirometria, SpO₂, gasometria (vigiar normo/hipercapnia = fadiga).":
    "Exámenes: pico flujo/espirometría, SpO₂ y gasometría (vigilar la normocapnia o hipercapnia = fatiga).",
  "Tratamento: β2 + ipratrópio inalatórios contínuos, corticoide sistêmico, MgSO₄ 2 g IV se grave; O₂.":
    "Tratamiento: β2 + ipratropio inhalados de forma continua, corticoide sistémico, MgSO₄ 2 g IV si es grave; O₂.",
  "IOT se exaustão/rebaixamento; VM com expiração longa (auto-PEEP). Ver ventilação mecânica.":
    "Intubar si hay agotamiento o deterioro del sensorio; ventilación mecánica con espiración prolongada (auto-PEEP). Ver ventilación mecánica.",
  "Exames: gasometria (hipercapnia), RX (descartar pneumotórax/pneumonia), ECG.":
    "Exámenes: gasometría (hipercapnia), radiografía (descartar neumotórax o neumonía) y ECG.",
  "Tratamento: β2 + ipratrópio, corticoide, ATB se exacerbação infecciosa; O₂ alvo 88–92%.":
    "Tratamiento: β2 + ipratropio, corticoide y antibiótico si la exacerbación es infecciosa; O₂ con objetivo de 88–92%.",
  "VNI precoce na acidose hipercápnica (pH < 7,35); IOT se falha. Ver ventilação mecânica.":
    "VNI precoz en la acidosis hipercápnica (pH < 7,35); intubar si fracasa. Ver ventilación mecánica.",
  "Considerar EAP ('asma cardíaca' — sibilos cardíacos), broncoespasmo por outra causa, corpo estranho, anafilaxia.":
    "Considerar EAP («asma cardíaca» — sibilancias de origen cardíaco), broncoespasmo por otra causa, cuerpo extraño y anafilaxia.",
  "Exames: BNP, ECG, RX, ecocardiograma se suspeita cardíaca.":
    "Exámenes: BNP, ECG, radiografía y ecocardiograma si se sospecha causa cardíaca.",
  "Exames: BNP/NT-proBNP, ECG, RX, ecocardiograma urgente, troponina.":
    "Exámenes: BNP/NT-proBNP, ECG, radiografía, ecocardiograma urgente y troponina.",
  "Tratamento: VNI (CPAP) precoce; diurético IV; vasodilatador (NTG) se PAS ≥ 110; tratar causa (SCA/arritmia).":
    "Tratamiento: VNI (CPAP) precoz; diurético IV; vasodilatador (nitroglicerina) si la PAS ≥ 110; tratar la causa (SCA/arritmia).",
  "Ver o guia de EAP.": "Ver la guía de EAP.",
  "Exames: RX de tórax, culturas/hemoculturas, gasometria, lactato; aplicar CURB-65.":
    "Exámenes: radiografía de tórax, cultivos y hemocultivos, gasometría y lactato; aplicar el CURB-65.",
  "Tratamento: antibiótico empírico precoce conforme foco/gravidade; O₂; avaliar UTI (ATS/IDSA).":
    "Tratamiento: antibiótico empírico precoz según el foco y la gravedad; O₂; evaluar el ingreso a UCI (ATS/IDSA).",
  "Critérios de Berlim: início < 1 sem, infiltrado bilateral, não explicado por IC, P/F ≤ 300 com PEEP ≥ 5.":
    "Criterios de Berlín: inicio < 1 semana, infiltrado bilateral, no explicado por insuficiencia cardíaca y P/F ≤ 300 con PEEP ≥ 5.",
  "Tratamento: ventilação protetora (VC 4–6 mL/kg, Pplat ≤ 30, DP ≤ 15); PEEP titulada; prona se P/F ≤ 150; tratar a causa.":
    "Tratamiento: ventilación protectora (volumen corriente 4–6 mL/kg, Pplat ≤ 30, driving pressure ≤ 15); PEEP titulada; decúbito prono si P/F ≤ 150; tratar la causa.",
  "Ver ventilação mecânica.": "Ver ventilación mecánica.",
  "Exames: gasometria (PaCO₂ ↑, pH ↓), causa (neuro, drogas, obesidade-hipoventilação, neuromuscular).":
    "Exámenes: gasometría (PaCO₂ ↑, pH ↓) y causa (neurológica, farmacológica, síndrome de obesidad-hipoventilación, neuromuscular).",
  "Tratamento: VNI se cooperativo e protegendo VA; IOT se rebaixamento/apneia. Reverter causa (naloxona/flumazenil se opioide/BZD).":
    "Tratamiento: VNI si coopera y protege la vía aérea; intubar si hay deterioro del sensorio o apnea. Revertir la causa (naloxona o flumazenilo si hay opioides o benzodiacepinas).",
  "Exames: gasometria, ECG, RX, BNP, troponina, D-dímero conforme suspeita; ecocardiograma/POCUS.":
    "Exámenes: gasometría, ECG, radiografía, BNP, troponina y dímero D según la sospecha; ecocardiograma/POCUS.",
  "Considerar causas mistas, metabólicas (acidose), anemia grave, ansiedade (diagnóstico de exclusão).":
    "Considerar causas mixtas, metabólicas (acidosis), anemia grave y ansiedad (diagnóstico de exclusión).",

  // ── Identificadores de nó (não traduzir) ───────────────────────────────────
  "sim": "sim",
  "nao": "nao",
  "leve": "leve",
  "decision": "decision",
  "q_subito": "q_subito",
  "q_trauma": "q_trauma",
  "q_chiado": "q_chiado",
  "⏱ SE VOCÊ COMEÇAR VNI, A REGRA DOS 30–60 MINUTOS DECIDE: melhora das trocas gasosas ou da frequência respiratória nesse intervalo prediz sucesso. SEM MELHORA, INTUBE — insistir na VNI que não está funcionando é o erro que transforma insuficiência respiratória em parada.":
    "⏱ SI USTED INICIA VNI, LA REGLA DE LOS 30–60 MINUTOS DECIDE: la mejoría del intercambio gaseoso o de la frecuencia respiratoria en ese intervalo predice éxito. SIN MEJORÍA, INTUBE — insistir en la VNI que no está funcionando es el error que convierte insuficiencia respiratoria en paro.",
};
