/**
 * Módulo EAP (eap-engine.ts) — dicionário PT → ES.
 * Terminologia: EAP (edema agudo de pulmón), nitroglicerina, furosemida,
 * dobutamina, noradrenalina, VNI (CPAP/BiPAP), congestión, SDRA.
 */
export const ES_EAP_ENGINE: Record<string, string> = {
  // ── Chips e blocos de conduta ──────────────────────────────────────────────
  "SpO₂/FiO₂ (aprox.)": "SpO₂/FiO₂ (aprox.)",
  "🪑 Posicionamento": "🪑 Posición",
  "💊 Nitroglicerina — vasodilatador (hipertensão)":
    "💊 Nitroglicerina — vasodilatador (hipertensión)",
  "💊 Nitroglicerina — vasodilatador (PA preservada)":
    "💊 Nitroglicerina — vasodilatador (PA conservada)",
  "💊 Furosemida — diurético de alça": "💊 Furosemida — diurético de asa",
  "💊 Morfina — uso seletivo (controverso)": "💊 Morfina — uso selectivo (controvertido)",
  "🚨 Dobutamina — inotrópico (choque cardiogênico)":
    "🚨 Dobutamina — inotrópico (choque cardiogénico)",
  "🚨 Noradrenalina — vasopressor (hipotensão refratária)":
    "🚨 Noradrenalina — vasopresor (hipotensión refractaria)",
  "⚠️ Vasodilatadores — contraindicados no choque":
    "⚠️ Vasodilatadores — contraindicados en el choque",
  "🫀 EAP em contexto de SCA — conduta paralela":
    "🫀 EAP en contexto de SCA — conducta paralela",
  "💊 FA com EAP — controle de FC": "💊 FA con EAP — control de la FC",

  // ── Hipóteses diagnósticas (com sugestão) ──────────────────────────────────
  "EAP cardiogênico com choque (PAM < 65 mmHg) — avaliar inotrópico/vasopressor":
    "EAP cardiogénico con choque (PAM < 65 mmHg) — valorar inotrópico/vasopresor",
  "Sugestão: EAP + choque cardiogênico (hipotensão + congestão)":
    "Sugerencia: EAP + choque cardiogénico (hipotensión + congestión)",
  "EAP em contexto de SCA / isquemia miocárdica":
    "EAP en contexto de SCA / isquemia miocárdica",
  "Sugestão: EAP + SCA (dor torácica / isquemia + congestão)":
    "Sugerencia: EAP + SCA (dolor torácico / isquemia + congestión)",
  "EAP cardiogênico hipertensivo — congestão aguda":
    "EAP cardiogénico hipertensivo — congestión aguda",
  "Sugestão: EAP cardiogênico hipertensivo (PA alta + estertores)":
    "Sugerencia: EAP cardiogénico hipertensivo (PA alta + estertores)",
  "Sobrecarga volêmica / descompensação de IC crônica":
    "Sobrecarga de volumen / descompensación de insuficiencia cardíaca crónica",
  "Sugestão: sobrecarga volêmica (IC prévia ou renal + congestão)":
    "Sugerencia: sobrecarga de volumen (insuficiencia cardíaca previa o renal + congestión)",
  "EAP cardiogênico provável — PA preservada": "EAP cardiogénico probable — PA conservada",
  "Sugestão: EAP cardiogênico (estertores + sinais de congestão)":
    "Sugerencia: EAP cardiogénico (estertores + signos de congestión)",
  "SDRA / EAP não cardiogênico — origem infecciosa (avaliar)":
    "SDRA / EAP no cardiogénico — origen infeccioso (valorar)",
  "Sugestão: EAP não cardiogênico (infecção + hipoxemia)":
    "Sugerencia: EAP no cardiogénico (infección + hipoxemia)",
  "Outro / indeterminado — investigar diferencial (embolia, SDRA, pneumonia)":
    "Otro / indeterminado — investigar el diferencial (embolia, SDRA, neumonía)",
  "Sugestão: hipoxemia sem congestão evidente — ampliar diferencial":
    "Sugerencia: hipoxemia sin congestión evidente — ampliar el diferencial",
  "EAP cardiogênico provável — aguardar mais dados":
    "EAP cardiogénico probable — esperar más datos",
  "Sugestão: EAP provável (estertores bilaterais isolados)":
    "Sugerencia: EAP probable (estertores bilaterales aislados)",

  // ── O₂ / VNI sugeridos ─────────────────────────────────────────────────────
  "Cânula de alto fluxo (HFNC)": "Cánula de alto flujo",
  "Cateter nasal 2–4 L/min": "Cánula nasal 2–4 L/min",
  "Ar ambiente — FiO₂ 0,21": "Aire ambiente — FiO₂ 0,21",
  "BiPAP 14/6 — FiO₂ ajustar para SpO₂ 88–92%":
    "BiPAP 14/6 — ajustar la FiO₂ para una SpO₂ de 88–92%",
  "Sugestão: BiPAP (DPOC ou hipoxemia grave — risco hipercápnia)":
    "Sugerencia: BiPAP (EPOC o hipoxemia grave — riesgo de hipercapnia)",
  "CPAP 10 cmH₂O — boa tolerância": "CPAP 10 cmH₂O — buena tolerancia",
  "Sugestão: CPAP 10 cmH₂O (EAP cardiogênico — primeira linha)":
    "Sugerencia: CPAP 10 cmH₂O (EAP cardiogénico — primera línea)",
  "Sugestão: monitorização intensiva (hipotensão)":
    "Sugerencia: monitorización intensiva (hipotensión)",
  "Sugestão: monitorização com ênfase respiratória (hipoxemia)":
    "Sugerencia: monitorización con énfasis respiratorio (hipoxemia)",
  "Sugestão: monitorização padrão EAP": "Sugerencia: monitorización estándar de EAP",
  "Posição sentada com pernas pendentes | Oxigenoterapia de alto fluxo | Acesso venoso periférico | Monitorização contínua":
    "Posición sentada con las piernas colgando | Oxigenoterapia de alto flujo | Acceso venoso periférico | Monitorización continua",
  "Sugestão: posição + O₂ + acesso + monitor (ajustar)":
    "Sugerencia: posición + O₂ + acceso + monitor (ajustar)",

  // ── Comorbidades e alergias ────────────────────────────────────────────────
  "Comorbidades / IC": "Comorbilidades / insuficiencia cardíaca",
  "Selecione as comorbidades presentes.": "Seleccione las comorbilidades presentes.",
  "IC com FE reduzida": "Insuficiencia cardíaca con fracción de eyección reducida",
  "DAC / IAM prévio": "Enfermedad coronaria / infarto previo",
  "Sem comorbidade conhecida": "Sin comorbilidad conocida",
  "NKDA ou descrever": "Sin alergias conocidas o describir",
  "Alergia a nitrato": "Alergia a los nitratos",
  "Alergia a furosemida": "Alergia a la furosemida",

  // ── Queixa / início ────────────────────────────────────────────────────────
  "Queixa / início": "Queja / inicio",
  "Escolha os elementos que melhor descrevem o quadro respiratório e hemodinâmico.":
    "Elija los elementos que mejor describen el cuadro respiratorio y hemodinámico.",
  "Dispneia súbita / piora rápida respiratória":
    "Disnea súbita / empeoramiento respiratorio rápido",
  "Dispneia súbita": "Disnea súbita",
  "Ortopneia / não tolera decúbito": "Ortopnea / no tolera el decúbito",
  "Ortopneia": "Ortopnea",
  "Expectoração rosada / espumosa": "Expectoración rosada / espumosa",
  "Dor torácica associada / avaliar SCA": "Dolor torácico asociado / valorar SCA",
  "Dor torácica associada": "Dolor torácico asociado",
  "Desperta à noite com falta de ar": "Se despierta por la noche con falta de aire",
  "Dispneia paroxística noturna": "Disnea paroxística nocturna",
  "Tempo de evolução": "Tiempo de evolución",
  "ex.: minutos / horas": "ej.: minutos / horas",
  "30 min": "30 min",

  // ── O₂ em uso / dispositivos ───────────────────────────────────────────────
  "O₂ em uso / FiO₂": "O₂ en uso / FiO₂",
  "Selecionar dispositivo de O₂": "Seleccionar el dispositivo de O₂",
  "FiO₂ estimada automaticamente para o cálculo SpO₂/FiO₂.":
    "FiO₂ estimada automáticamente para el cálculo de SpO₂/FiO₂.",
  "Ar ambiente (sem O₂)": "Aire ambiente (sin O₂)",
  "Cateter nasal 2 L/min": "Cánula nasal 2 L/min",
  "Cateter nasal 4 L/min": "Cánula nasal 4 L/min",
  "Cateter nasal 6 L/min": "Cánula nasal 6 L/min",
  "Máscara c/ reservatório 10–15 L/min": "Mascarilla con reservorio 10–15 L/min",
  "Venturi 28%": "Venturi 28%",
  "Máscara Venturi 28%": "Mascarilla Venturi 28%",
  "Venturi 35%": "Venturi 35%",
  "Máscara Venturi 35%": "Mascarilla Venturi 35%",
  "Venturi 40%": "Venturi 40%",
  "Máscara Venturi 40%": "Mascarilla Venturi 40%",
  "Venturi 50%": "Venturi 50%",
  "Máscara Venturi 50%": "Mascarilla Venturi 50%",
  "Alto fluxo / HFNC": "Alto flujo / cánula de alto flujo",
  "VNI / CPAP-BiPAP": "VNI / CPAP-BiPAP",
  "IOT + VM": "Intubación + ventilación mecánica",
  "Intubação orotraqueal + VM": "Intubación orotraqueal + ventilación mecánica",
  "GCS (opcional)": "Glasgow (opcional)",

  // ── Exame ──────────────────────────────────────────────────────────────────
  "Ausculta pulmonar": "Auscultación pulmonar",
  "Cardiovascular": "Cardiovascular",
  "Estase jugular": "Ingurgitación yugular",
  "Edema de MMII": "Edema de miembros inferiores",

  // ── Hipótese (opções curtas) ───────────────────────────────────────────────
  "Hipótese diagnóstica": "Hipótesis diagnóstica",
  "EAP cardiogênico hipertensivo": "EAP cardiogénico hipertensivo",
  "EAP cardiogênico — PA preservada": "EAP cardiogénico — PA conservada",
  "EAP + choque cardiogênico": "EAP + choque cardiogénico",
  "EAP em contexto de SCA": "EAP en contexto de SCA",
  "Sobrecarga volêmica / IC descompensada":
    "Sobrecarga de volumen / insuficiencia cardíaca descompensada",
  "SDRA / EAP não cardiogênico": "SDRA / EAP no cardiogénico",
  "Outro / indeterminado": "Otro / indeterminado",

  // ── Condutas ───────────────────────────────────────────────────────────────
  "Condutas realizadas / planejadas": "Conductas realizadas / planificadas",
  "Posição sentada / reduzir retorno venoso":
    "Posición sentada / reducir el retorno venoso",
  "Posição sentada, pernas pendentes": "Posición sentada, piernas colgando",
  "Oxigenoterapia / alto fluxo se necessário":
    "Oxigenoterapia / alto flujo si es necesario",
  "Oxigenoterapia / alto fluxo": "Oxigenoterapia / alto flujo",
  "Nitrato SL ou IV / se PAS permitir": "Nitrato sublingual o IV / si la PAS lo permite",
  "Nitrato (SL ou IV)": "Nitrato (sublingual o IV)",
  "Furosemida IV / se congestão confirmada": "Furosemida IV / si se confirma la congestión",
  "Furosemida IV": "Furosemida IV",
  "Morfina IV (cautela e uso seletivo)": "Morfina IV (con cautela y uso selectivo)",
  "Morfina IV (cautela)": "Morfina IV (con cautela)",
  "VMNI (CPAP/BiPAP) / hipoxemia ou esforço respiratório":
    "VNI (CPAP/BiPAP) / hipoxemia o esfuerzo respiratorio",
  "VMNI (CPAP/BiPAP)": "VNI (CPAP/BiPAP)",

  // ── VNI: parâmetros ────────────────────────────────────────────────────────
  "VMNI — parâmetros / tolerância": "VNI — parámetros / tolerancia",
  "IPAP/EPAP ou CPAP, FiO₂, tempo": "IPAP/EPAP o CPAP, FiO₂, tiempo",
  "CPAP 8 cmH₂O (início)": "CPAP 8 cmH₂O (inicio)",
  "CPAP 8 cmH₂O — início": "CPAP 8 cmH₂O — inicio",
  "CPAP 10 cmH₂O": "CPAP 10 cmH₂O",
  "CPAP 12 cmH₂O (↑ recrutamento)": "CPAP 12 cmH₂O (↑ reclutamiento)",
  "CPAP 12 cmH₂O — maior recrutamento alveolar":
    "CPAP 12 cmH₂O — mayor reclutamiento alveolar",
  "BiPAP 12/6": "BiPAP 12/6",
  "BiPAP IPAP 12 / EPAP 6 cmH₂O": "BiPAP IPAP 12 / EPAP 6 cmH₂O",
  "BiPAP 14/6": "BiPAP 14/6",
  "BiPAP IPAP 14 / EPAP 6 cmH₂O": "BiPAP IPAP 14 / EPAP 6 cmH₂O",
  "BiPAP 14/8": "BiPAP 14/8",
  "BiPAP IPAP 14 / EPAP 8 cmH₂O": "BiPAP IPAP 14 / EPAP 8 cmH₂O",
  "BiPAP 16/8 (↑ suporte)": "BiPAP 16/8 (↑ soporte)",
  "BiPAP IPAP 16 / EPAP 8 cmH₂O — maior suporte pressórico":
    "BiPAP IPAP 16 / EPAP 8 cmH₂O — mayor soporte de presión",
  "FiO₂ 0,40 (VMNI)": "FiO₂ 0,40 (VNI)",
  "FiO₂ 0,40 na VMNI": "FiO₂ 0,40 en la VNI",
  "FiO₂ 0,60 (VMNI)": "FiO₂ 0,60 (VNI)",
  "FiO₂ 0,60 na VMNI": "FiO₂ 0,60 en la VNI",
  "FiO₂ 1,0 (VMNI)": "FiO₂ 1,0 (VNI)",
  "FiO₂ 1,0 na VMNI": "FiO₂ 1,0 en la VNI",
  "Boa tolerância": "Buena tolerancia",
  "Boa tolerância à VMNI": "Buena tolerancia a la VNI",
  "Má tolerância / ajustar": "Mala tolerancia / ajustar",
  "Má tolerância à VMNI — ajustar interface ou considerar IOT":
    "Mala tolerancia a la VNI — ajustar la interfaz o considerar la intubación",
  "SpO₂ melhorou": "La SpO₂ mejoró",
  "SpO₂ melhorou com VMNI": "La SpO₂ mejoró con la VNI",
  "SpO₂ não melhorou / IOT": "La SpO₂ no mejoró / intubación",
  "Sem melhora de SpO₂ — indicar IOT": "Sin mejoría de la SpO₂ — indicar la intubación",

  // ── Acessos ────────────────────────────────────────────────────────────────
  "1 via periférica": "1 vía periférica",
  "1 via periférica calibrosa": "1 vía periférica gruesa",
  "2 vias periféricas": "2 vías periféricas",
  "2 vias periféricas calibrosas": "2 vías periféricas gruesas",
  "Acesso central (CVC)": "Acceso central (CVC)",
  "Acesso venoso central (CVC)": "Acceso venoso central (CVC)",
  "Sonda vesical": "Sonda vesical",
  "Sonda vesical de demora": "Sonda vesical permanente",
  "Sonda nasogástrica": "Sonda nasogástrica",

  // ── Monitorização ──────────────────────────────────────────────────────────
  "Oximetria contínua": "Pulsioximetría continua",
  "PA não invasiva 5 min": "PA no invasiva cada 5 min",
  "PA não invasiva a cada 5 min": "PA no invasiva cada 5 min",
  "PA não invasiva 15 min": "PA no invasiva cada 15 min",
  "PA não invasiva a cada 15 min": "PA no invasiva cada 15 min",
  "Capnografia (EtCO₂)": "Capnografía (EtCO₂)",
  "Gasometria arterial seriada": "Gasometría arterial seriada",
  "PA invasiva (arterial)": "PA invasiva (arterial)",
  "PA invasiva (arterial line)": "PA invasiva (línea arterial)",
  "Troponina seriada": "Troponina seriada",
  "BNP / NT-proBNP": "BNP / NT-proBNP",
  "RX tórax portátil": "Radiografía de tórax portátil",
  "Raio-X tórax portátil": "Radiografía de tórax portátil",
  "Eco point-of-care": "Ecografía a pie de cama",
  "Ecocardiograma beira-leito (POCUS)": "Ecocardiograma a pie de cama (POCUS)",
  "Lactato sérico": "Lactato sérico",
  "Função renal / eletrólitos": "Función renal / electrolitos",
  "Função renal e eletrólitos (ureia, creatinina, Na, K)":
    "Función renal y electrolitos (urea, creatinina, Na, K)",
  "Hemograma completo": "Hemograma completo",
  "Coagulograma": "Coagulograma",
  "Coagulograma (TP, TTPA)": "Coagulograma (TP, TTPa)",

  // ── Resposta e destino ─────────────────────────────────────────────────────
  "Resposta ao tratamento": "Respuesta al tratamiento",
  "Melhora clínica (menos dispneia, FR menor, SpO₂ e PA melhores)":
    "Mejoría clínica (menos disnea, FR menor, mejor SpO₂ y PA)",
  "Estável (sem piora, mas ainda requer suporte e reavaliação)":
    "Estable (sin empeoramiento, pero aún requiere soporte y reevaluación)",
  "Piora (revisar VMNI, vasodilatador, diferencial e considerar IOT)":
    "Empeoramiento (revisar la VNI, el vasodilatador, el diferencial y considerar la intubación)",
  "Piora — revisar VMNI / IOT": "Empeoramiento — revisar la VNI / intubación",
  "UTI / unidade coronariana (instabilidade, VMNI prolongada, IOT, isquemia ou choque)":
    "UCI / unidad coronaria (inestabilidad, VNI prolongada, intubación, isquemia o choque)",
  "UTI / coronariana": "UCI / unidad coronaria",
  "Observação / unidade intermediária (reavaliação estreita e resposta parcial)":
    "Observación / unidad de cuidados intermedios (reevaluación estrecha y respuesta parcial)",
  "Observação / intermediate care": "Observación / cuidados intermedios",
  "Enfermaria (apenas se caso leve, compensado e sem suporte avançado)":
    "Sala de hospitalización (solo si el caso es leve, compensado y sin soporte avanzado)",
  "Enfermaria (caso leve estável)": "Sala de hospitalización (caso leve estable)",

  // ── Plano / notas ──────────────────────────────────────────────────────────
  "Plano / notas": "Plan / notas",
  "Ex.: troponina, RX, decisão de IOT, etiologia provável...":
    "Ej.: troponina, radiografía, decisión de intubación, etiología probable...",
  "Registre exames pendentes, resposta hemodinâmica/respiratória, necessidade de IOT, investigação etiológica e próximos passos.":
    "Registre los exámenes pendientes, la respuesta hemodinámica/respiratoria, la necesidad de intubación, la investigación etiológica y los próximos pasos.",
  "Reavaliar gasometria e RX após estabilização":
    "Reevaluar la gasometría y la radiografía tras la estabilización",
  "Reavaliar gasometria e raio-X após estabilização inicial":
    "Reevaluar la gasometría y la radiografía tras la estabilización inicial",
  "Investigar gatilho isquêmico / hipertensivo / valvar / arritmia":
    "Investigar el desencadenante isquémico / hipertensivo / valvular / arrítmico",
  "Investigar etiologia do EAP: isquemia, HAS, valvopatia, arritmia ou sobrecarga":
    "Investigar la etiología del EAP: isquemia, hipertensión, valvulopatía, arritmia o sobrecarga",
  "Preparar IOT se falha de VMNI ou fadiga respiratória":
    "Preparar la intubación si fracasa la VNI o hay fatiga respiratoria",
  "Preparar via aérea avançada se falha de VMNI ou piora respiratória":
    "Preparar la vía aérea avanzada si fracasa la VNI o empeora la respiración",

  // ── Documentação do caso ───────────────────────────────────────────────────
  "Resumo do caso real, condutas, resposta e pendências...":
    "Resumen del caso real, conductas, respuesta y pendientes...",
  "Descreva a apresentação real do paciente, gravidade, medidas tomadas, resposta clínica e destino definido.":
    "Describa la presentación real del paciente, la gravedad, las medidas tomadas, la respuesta clínica y el destino definido.",
  "Caso com boa resposta inicial (posição sentada, O₂/VMNI, nitrato/diurético)":
    "Caso con buena respuesta inicial (posición sentada, O₂/VNI, nitrato/diurético)",
  "Paciente com dispneia aguda e sinais de congestão pulmonar, abordado com posição sentada, oxigenoterapia/VMNI e terapia medicamentosa, evoluindo com melhora clínica inicial.":
    "Paciente con disnea aguda y signos de congestión pulmonar, abordado con posición sentada, oxigenoterapia/VNI y tratamiento farmacológico, con evolución hacia la mejoría clínica inicial.",
  "Caso hipertensivo (nitroglicerina e VMNI com resposta favorável)":
    "Caso hipertensivo (nitroglicerina y VNI con respuesta favorable)",
  "EAP cardiogênico hipertensivo tratado com VMNI e vasodilatação, com melhora progressiva da dispneia, saturação e pressão arterial.":
    "EAP cardiogénico hipertensivo tratado con VNI y vasodilatación, con mejoría progresiva de la disnea, la saturación y la presión arterial.",
  "Caso grave (falha inicial, necessidade de leito crítico e possível IOT)":
    "Caso grave (fallo inicial, necesidad de cama crítica y posible intubación)",
  "Quadro grave de edema agudo de pulmão, com necessidade de monitorização intensiva, reavaliação seriada e preparo para suporte avançado de via aérea.":
    "Cuadro grave de edema agudo de pulmón, con necesidad de monitorización intensiva, reevaluación seriada y preparación para el soporte avanzado de la vía aérea.",
  "🫁 Edema agudo de pulmão": "🫁 Edema agudo de pulmón",
  "Registro rápido — ciclo de tratamento curto": "Registro rápido — ciclo de tratamiento corto",
};
