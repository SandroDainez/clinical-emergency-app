/**
 * Sedoanalgesia & BNM — dicionário PT → ES (calculadora de diluição/dose).
 * Terminologia: ketamina, fentanilo, rocuronio, cisatracurio, bloqueo
 * neuromuscular, RASS, solución fisiológica (SF), dextrosa al 5% (SG5%).
 */
export const ES_SEDACAO: Record<string, string> = {
  // ── Fármacos ───────────────────────────────────────────────────────────────
  "Propofol": "Propofol",
  "Midazolam": "Midazolam",
  "Cetamina": "Ketamina",
  "Dexmedetomidina": "Dexmedetomidina",
  "Fentanil": "Fentanilo",
  "Morfina": "Morfina",
  "Rocurônio": "Rocuronio",
  "Cisatracúrio": "Cisatracurio",
  "Atracúrio": "Atracurio",

  // ── Apresentações e diluições ──────────────────────────────────────────────
  "Ampola 10 mg/mL · 50 mL": "Ampolla 10 mg/mL · 50 mL",
  "Frasco 10 mg/mL · 20 mL": "Frasco 10 mg/mL · 20 mL",
  "Puro · 1 amp 50 mL → 50 mL": "Puro · 1 ampolla 50 mL → 50 mL",
  "Puro · 2 amp → 100 mL": "Puro · 2 ampollas → 100 mL",
  "Ampola 5 mg/mL · 10 mL (50 mg)": "Ampolla 5 mg/mL · 10 mL (50 mg)",
  "1 mg/mL · 2 amp (100 mg) + 80 mL SF → 100 mL":
    "1 mg/mL · 2 ampollas (100 mg) + 80 mL de solución fisiológica → 100 mL",
  "2 mg/mL · 4 amp (200 mg) + 60 mL SF → 100 mL":
    "2 mg/mL · 4 ampollas (200 mg) + 60 mL de solución fisiológica → 100 mL",
  "Frasco 50 mg/mL · 10 mL (500 mg)": "Frasco 50 mg/mL · 10 mL (500 mg)",
  "2 mg/mL · 1 amp (500 mg) + 240 mL SF → 250 mL":
    "2 mg/mL · 1 ampolla (500 mg) + 240 mL de solución fisiológica → 250 mL",
  "4 mg/mL · 2 amp (1.000 mg) + 230 mL SF → 250 mL":
    "4 mg/mL · 2 ampollas (1.000 mg) + 230 mL de solución fisiológica → 250 mL",
  "Ampola 100 mcg/mL · 2 mL (200 mcg)": "Ampolla 100 mcg/mL · 2 mL (200 mcg)",
  "1,6 mcg/mL · 2 amp (400 mcg) + 246 mL SF → 250 mL":
    "1,6 mcg/mL · 2 ampollas (400 mcg) + 246 mL de solución fisiológica → 250 mL",
  "4 mcg/mL · 5 amp (1.000 mcg) + 240 mL SF → 250 mL":
    "4 mcg/mL · 5 ampollas (1.000 mcg) + 240 mL de solución fisiológica → 250 mL",
  "Ampola 50 mcg/mL · 2 mL (100 mcg)": "Ampolla 50 mcg/mL · 2 mL (100 mcg)",
  "Ampola 50 mcg/mL · 10 mL (500 mcg)": "Ampolla 50 mcg/mL · 10 mL (500 mcg)",
  "Puro 50 mcg/mL → 20 mL (1.000 mcg)": "Puro 50 mcg/mL → 20 mL (1.000 mcg)",
  "Puro 50 mcg/mL → 50 mL (2.500 mcg)": "Puro 50 mcg/mL → 50 mL (2.500 mcg)",
  "10 mcg/mL · 5 amp (500 mcg) + 40 mL SF → 50 mL":
    "10 mcg/mL · 5 ampollas (500 mcg) + 40 mL de solución fisiológica → 50 mL",
  "Ampola 10 mg/mL · 1 mL (10 mg)": "Ampolla 10 mg/mL · 1 mL (10 mg)",
  "1 mg/mL · 10 amp (100 mg) + 90 mL SF → 100 mL":
    "1 mg/mL · 10 ampollas (100 mg) + 90 mL de solución fisiológica → 100 mL",
  "1 mg/mL · 10 amp (100 mg) + 90 mL SG5% → 100 mL":
    "1 mg/mL · 10 ampollas (100 mg) + 90 mL de dextrosa al 5% → 100 mL",
  "2 mg/mL · 20 amp (200 mg) + 80 mL SF → 100 mL":
    "2 mg/mL · 20 ampollas (200 mg) + 80 mL de solución fisiológica → 100 mL",
  "Ampola 10 mg/mL · 5 mL (50 mg)": "Ampolla 10 mg/mL · 5 mL (50 mg)",
  "2 mg/mL · 10 amp (500 mg) + 200 mL SF → 250 mL":
    "2 mg/mL · 10 ampollas (500 mg) + 200 mL de solución fisiológica → 250 mL",
  "2 mg/mL · 5 amp (250 mg) + 100 mL SF → 125 mL":
    "2 mg/mL · 5 ampollas (250 mg) + 100 mL de solución fisiológica → 125 mL",
  "Ampola 2 mg/mL · 10 mL (20 mg)": "Ampolla 2 mg/mL · 10 mL (20 mg)",
  "0,8 mg/mL · 10 amp (200 mg) + 150 mL SF → 250 mL":
    "0,8 mg/mL · 10 ampollas (200 mg) + 150 mL de solución fisiológica → 250 mL",
  "1 mg/mL · 10 amp (200 mg) + 100 mL SF → 200 mL":
    "1 mg/mL · 10 ampollas (200 mg) + 100 mL de solución fisiológica → 200 mL",
  "1 mg/mL · 5 amp (250 mg) + 200 mL SF → 250 mL":
    "1 mg/mL · 5 ampollas (250 mg) + 200 mL de solución fisiológica → 250 mL",

  // ── Modos e faixas ─────────────────────────────────────────────────────────
  "Infusão contínua": "Infusión continua",
  "Bolus": "Bolo",
  "Indução / bolus": "Inducción / bolo",
  "Sedação leve (RASS −1/−2)": "Sedación ligera (RASS −1/−2)",
  "Sedação moderada (RASS −2/−3)": "Sedación moderada (RASS −2/−3)",
  "Sedação profunda (RASS −3/−4)": "Sedación profunda (RASS −3/−4)",
  "Dose alta — risco de síndrome do propofol":
    "Dosis alta — riesgo de síndrome por infusión de propofol",
  "Sedação leve (ansiolítico/hipnótico)": "Sedación ligera (ansiolítico/hipnótico)",
  "Sedação moderada — RASS −2/−3": "Sedación moderada — RASS −2/−3",
  "Sedação profunda — RASS −3/−4": "Sedación profunda — RASS −3/−4",
  "Dose alta — acúmulo após 24–48 h": "Dosis alta — acumulación tras 24–48 h",
  "Sedação dissociativa (infusão)": "Sedación disociativa (infusión)",
  "Sedação leve / analgesia": "Sedación ligera / analgesia",
  "Sedação dissociativa": "Sedación disociativa",
  "Dose alta — vigiar disforia/secreções": "Dosis alta — vigilar la disforia y las secreciones",
  "Analgesia adjuvante (subanestésica)": "Analgesia adyuvante (subanestésica)",
  "Opioid-sparing (subanestésica)": "Ahorrador de opioides (subanestésica)",
  "Acima da faixa adjuvante": "Por encima del rango adyuvante",
  "Ansiolítico / adjuvante sem sedação significativa":
    "Ansiolítico / adyuvante sin sedación significativa",
  "Sedação leve (RASS 0/−1) — preserva drive":
    "Sedación ligera (RASS 0/−1) — preserva el impulso respiratorio",
  "Sedação moderada (RASS −1/−2)": "Sedación moderada (RASS −1/−2)",
  "Dose máxima — bradicardia/hipotensão": "Dosis máxima — bradicardia/hipotensión",
  "Analgesia leve": "Analgesia leve",
  "Analgesia moderada — UTI padrão": "Analgesia moderada — estándar en UCI",
  "Analgesia intensa": "Analgesia intensa",
  "Alta dose — acúmulo (meia-vida contexto-sensível)":
    "Dosis alta — acumulación (vida media contexto-sensible)",
  "Analgesia leve a moderada": "Analgesia de leve a moderada",
  "Analgesia moderada a intensa": "Analgesia de moderada a intensa",
  "Analgesia intensa — cuidado em IRA": "Analgesia intensa — cuidado en la insuficiencia renal aguda",
  "Alta dose — acúmulo de M6G em IRA":
    "Dosis alta — acumulación de M6G en la insuficiencia renal aguda",
  "Bolus — ISR / intubação": "Bolo — ISR / intubación",
  "Bolus — facilitação de VM": "Bolo — facilitación de la ventilación mecánica",
  "Infusão contínua — UTI": "Infusión continua — UCI",
  "Bloqueio contínuo (UTI)": "Bloqueo continuo (UCI)",
  "Acima da faixa usual": "Por encima del rango habitual",
  "Infusão contínua (SARA)": "Infusión continua (SDRA)",
  "Bloqueio contínuo na SARA": "Bloqueo continuo en la SDRA",
  "Dose ACURASYS (37,5 mg/h)": "Dosis ACURASYS (37,5 mg/h)",
  "Bloqueio contínuo": "Bloqueo continuo",
  // ── Atracúrio: a bolsa que fecha · Propofol puro com concentração ────────
  "1 mg/mL · 5 amp (250 mg) + 225 mL SF → 250 mL": "1 mg/mL · 5 ampollas (250 mg) + 225 mL SF → 250 mL",
  "Puro 10 mg/mL · 1 amp (500 mg) → 50 mL": "Puro 10 mg/mL · 1 ampolla (500 mg) → 50 mL",
  "Puro 10 mg/mL · 2 amp (1.000 mg) → 100 mL": "Puro 10 mg/mL · 2 ampollas (1.000 mg) → 100 mL",
  // ── Midazolam: os dois eixos ─────────────────────────────────────────────
  "Acima do teto da SEDAÇÃO titulada por RASS": "Por encima del techo de la SEDACIÓN titulada por RASS",
  "> 0,20 mg/kg/h — para SEDAR, preferir propofol/dexmedetomidina (acúmulo em 24–48 h). NÃO se aplica ao STATUS EPILÉPTICO REFRATÁRIO, que é outro objetivo: 0,05–2 mg/kg/h titulado por EEG, com IOT e meta de supressão da atividade elétrica.":
    "> 0,20 mg/kg/h — para SEDAR, preferir propofol/dexmedetomidina (acumulación en 24–48 h). NO se aplica al STATUS EPILÉPTICO REFRACTARIO, que es otro objetivo: 0,05–2 mg/kg/h titulado por EEG, con IOT y meta de supresión de la actividad eléctrica.",
  // ── Cisatracúrio: dois regimes, e o ROSE com o desenho ───────────────────
  "Bloqueio contínuo titulado por TOF": "Bloqueo continuo titulado por TOF",
  "0,1–0,2 mg/kg/h — o regime usual da UTI": "0,1–0,2 mg/kg/h — el régimen habitual de la UCI",
  "Acima da faixa titulada — só no protocolo de dose fixa": "Por encima del rango titulado — solo en el protocolo de dosis fija",
  "O ACURASYS usa 37,5 mg/h FIXO (~0,54 mg/kg/h em 70 kg), sem titulação, 48 h. É protocolo específico com EVIDÊNCIA CONFLITANTE, não alternativa equivalente — ver o alerta. Fora dele, monitorar TOF.":
    "El ACURASYS usa 37,5 mg/h FIJO (~0,54 mg/kg/h en 70 kg), sin titulación, 48 h. Es un protocolo específico con EVIDENCIA CONFLICTIVA, no una alternativa equivalente — ver la alerta. Fuera de él, monitorizar TOF.",
  "REGIME DE DOSE FIXA (ACURASYS, NEJM 2010): cisatracúrio 37,5 mg/h × 48 h, SEM titulação por TOF, na SDRA grave precoce (P/F < 150). É um protocolo específico — não a mesma coisa que a infusão titulada de 0,1–0,2 mg/kg/h.":
    "RÉGIMEN DE DOSIS FIJA (ACURASYS, NEJM 2010): cisatracurio 37,5 mg/h × 48 h, SIN titulación por TOF, en el SDRA grave precoz (P/F < 150). Es un protocolo específico — no lo mismo que la infusión titulada de 0,1–0,2 mg/kg/h.",
  "⚠️ EVIDÊNCIA CONFLITANTE — o ROSE (NEJM 2019, 1.006 pacientes, PETAL Network) reavaliou o ACURASYS com protocolos modernos: bloqueio precoce + sedação PROFUNDA contra cuidado usual SEM bloqueio de rotina e com sedação LEVE. Foi interrompido por futilidade; mortalidade em 90 dias igual (43%), com MAIS fraqueza adquirida na UTI e mais eventos cardiovasculares graves no braço bloqueado. O uso ROTINEIRO de BNM na SDRA deixou de ser recomendação forte — o regime de dose fixa é opção em situação selecionada (dissincronia grave, drive excessivo, prona), não conduta corrente.":
    "⚠️ EVIDENCIA CONFLICTIVA — el ROSE (NEJM 2019, 1.006 pacientes, PETAL Network) reevaluó el ACURASYS con protocolos modernos: bloqueo precoz + sedación PROFUNDA frente a cuidado habitual SIN bloqueo de rutina y con sedación LIGERA. Se interrumpió por futilidad; mortalidad a 90 días igual (43%), con MÁS debilidad adquirida en la UCI y más eventos cardiovasculares graves en el brazo bloqueado. El uso RUTINARIO de BNM en el SDRA dejó de ser recomendación fuerte — el régimen de dosis fija es opción en situación seleccionada (disincronía grave, drive excesivo, prona), no conducta corriente.",
};
