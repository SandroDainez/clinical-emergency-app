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
};
