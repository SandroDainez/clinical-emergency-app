/**
 * Calculadoras Clínicas — dicionário PT → ES.
 * Terminologia alinhada aos demais módulos: UCI, SDRA, EPOC, glucemia,
 * urea, brecha aniónica, noradrenalina, ventilación mecánica.
 * Citações bibliográficas permanecem no original (não se traduzem).
 */
export const ES_CALCULADORAS: Record<string, string> = {
  // ── Hub ────────────────────────────────────────────────────────────────────
  "Calculadoras Clínicas": "Calculadoras clínicas",
  "Calculadoras clínicas": "Calculadoras clínicas",
  "Calculadoras clínicas e escores de gravidade.":
    "Calculadoras clínicas y escalas de gravedad.",
  "Calculadoras": "Calculadoras",
  "Calculadora": "Calculadora",
  "Escores": "Escalas",
  "Fonte": "Fuente",
  "DADOS": "DATOS",
  "PONTUAÇÃO": "PUNTUACIÓN",
  "MARQUE OS PRESENTES": "MARQUE LOS PRESENTES",
  "SELECIONE CADA ITEM": "SELECCIONE CADA ÍTEM",
  "Preencha os campos para calcular.": "Complete los campos para calcular.",
  "Sim": "Sí",
  "Não": "No",
  "Normal": "Normal",
  "Nenhuma": "Ninguna",
  "Nenhum": "Ninguno",
  "Observação": "Observación",
  "Uso": "Uso",
  "Alvo": "Objetivo",
  "Monitorização": "Monitorización",
  "Infusão": "Infusión",
  "Equação": "Ecuación",

  // ── Peso predito (VM) ──────────────────────────────────────────────────────
  "Peso predito (VM)": "Peso predicho (VM)",
  "Volume corrente protetor — ARDSNet": "Volumen corriente protector — ARDSNet",
  "Sexo": "Sexo",
  "Masculino": "Masculino",
  "Feminino": "Femenino",
  "Altura": "Talla",
  "SEMPRE usar peso predito (altura), NUNCA o peso atual. Em obesos, o VC pelo peso real causa lesão pulmonar (volutrauma).":
    "SIEMPRE usar el peso predicho (por la talla), NUNCA el peso actual. En obesos, el volumen corriente calculado por el peso real causa lesión pulmonar (volutrauma).",
  "Peso predito": "Peso predicho",
  "VC 6 mL/kg (padrão ARDSNet)": "VC 6 mL/kg (estándar ARDSNet)",
  "VC 4 mL/kg (SARA grave)": "VC 4 mL/kg (SDRA grave)",
  "VC 5 mL/kg (SARA moderada)": "VC 5 mL/kg (SDRA moderada)",
  "VC 7 mL/kg (pulmão não-SARA)": "VC 7 mL/kg (pulmón sin SDRA)",
  "VC 8 mL/kg (pulmão normal/pós-op)": "VC 8 mL/kg (pulmón normal/posoperatorio)",
  "Parâmetros iniciais (ARDSNet)": "Parámetros iniciales (ARDSNet)",
  "Pressão de platô": "Presión meseta",
  "Driving pressure": "Driving pressure",
  "≤ 15 cmH₂O (Pplat − PEEP)": "≤ 15 cmH₂O (Pplat − PEEP)",
  "PEEP inicial": "PEEP inicial",
  "5 cmH₂O (titular por tabela)": "5 cmH₂O (titular con la tabla)",
  "1,0 → titular p/ SpO₂ 94–98%": "1,0 → titular para SpO₂ 94–98%",
  "FR inicial": "FR inicial",
  "12–16 rpm (pH ≥ 7,30)": "12–16 rpm (pH ≥ 7,30)",
  "1:2 (asma/DPOC 1:3–1:4)": "1:2 (asma/EPOC 1:3–1:4)",

  // ── Clearance / TFG ────────────────────────────────────────────────────────
  "Clearance / TFG": "Aclaramiento / TFG",
  "Cockcroft-Gault · CKD-EPI 2021 · KDIGO": "Cockcroft-Gault · CKD-EPI 2021 · KDIGO",
  "Idade": "Edad",
  "Peso atual": "Peso actual",
  "Creatinina sérica": "Creatinina sérica",
  "Creatinina": "Creatinina",
  "TFG (CKD-EPI 2021)": "TFG (CKD-EPI 2021)",
  "ClCr (Cockcroft-Gault)": "AclCr (Cockcroft-Gault)",
  "informe o peso": "indique el peso",
  "Estágio KDIGO": "Estadio KDIGO",
  "Normal ou alta": "Normal o alta",
  "Levemente reduzida": "Levemente reducida",
  "Leve a moderada": "De leve a moderada",
  "Moderada a grave": "De moderada a grave",
  "Gravemente reduzida": "Gravemente reducida",
  "Falência renal": "Fallo renal",
  "Ajustar fármacos nefrotóxicos e de eliminação renal; evitar contraste; considerar nefrologia.":
    "Ajustar los fármacos nefrotóxicos y de eliminación renal; evitar el contraste; considerar nefrología.",
  "Ajustar dose de fármacos de eliminação renal.":
    "Ajustar la dosis de los fármacos de eliminación renal.",
  "Ajuste de fármacos comuns": "Ajuste de fármacos frecuentes",
  "Vancomicina": "Vancomicina",
  "ajustar por AUC/TFG; diálise: pós-sessão":
    "ajustar por AUC/TFG; diálisis: tras la sesión",
  "Enoxaparina": "Enoxaparina",
  "TFG < 30: 1 mg/kg/dia; < 15: evitar (preferir HNF)":
    "TFG < 30: 1 mg/kg/día; < 15: evitar (preferir heparina no fraccionada)",
  "Pip-tazo / Meropeném": "Pip-tazo / Meropenem",
  "reduzir intervalo conforme TFG": "ajustar el intervalo según la TFG",
  "Metformina / SGLT2i": "Metformina / iSGLT2",
  "suspender se TFG < 30": "suspender si la TFG < 30",
  "DOACs": "ACOD",
  "rivaroxabana/dabigatrana: cautela/contraindicado em TFG baixa":
    "rivaroxabán/dabigatrán: cautela o contraindicados con TFG baja",
  "CKD-EPI 2021 removeu a variável raça. Cockcroft-Gault é preferido para ajuste de dose de fármacos. Valores orientativos — confirmar com farmacêutico clínico.":
    "CKD-EPI 2021 eliminó la variable raza. Se prefiere Cockcroft-Gault para el ajuste de dosis de fármacos. Valores orientativos — confirmar con el farmacéutico clínico.",
  "Peso no Cockcroft-Gault: usar o peso atual no eutrófico. No OBESO, o peso atual superestima o clearance — usar peso ideal ou ajustado; no muito magro/edemaciado, também preferir o peso ideal.":
    "Peso en Cockcroft-Gault: usar el peso actual en el paciente eutrófico. En el OBESO, el peso actual sobrestima el aclaramiento — usar el peso ideal o ajustado; en el muy delgado o edematoso, preferir también el peso ideal.",

  // ── Osmolalidade ───────────────────────────────────────────────────────────
  "Osmolalidade sérica": "Osmolalidad sérica",
  "Osm calculada · efetiva · gap osmolar": "Osm calculada · efectiva · brecha osmolar",
  "Osmolalidade efetiva = tonicidade (não inclui ureia).":
    "Osmolalidad efectiva = tonicidad (no incluye la urea).",
  "Sódio": "Sodio",
  "Glicemia": "Glucemia",
  "Ureia": "Urea",
  "Osm medida (opcional)": "Osm medida (opcional)",
  "Hipoosmolalidade — avaliar hiponatremia dilucional":
    "Hipoosmolalidad — evaluar hiponatremia dilucional",
  "Osmolalidade efetiva normal (275–295)": "Osmolalidad efectiva normal (275–295)",
  "Hiperosmolalidade leve — hiperglicemia/hipernatremia":
    "Hiperosmolalidad leve — hiperglucemia/hipernatremia",
  "Hiperosmolalidade moderada — suspeitar EHH":
    "Hiperosmolalidad moderada — sospechar EHH",
  "Hiperosmolalidade grave — EHH/coma hiperosmolar":
    "Hiperosmolalidad grave — EHH/coma hiperosmolar",
  "Osm calculada": "Osm calculada",
  "Osm efetiva (tonicidade)": "Osm efectiva (tonicidad)",
  "Gap osmolar": "Brecha osmolar",
  "Borderline — avaliar contexto": "Límite — evaluar el contexto",
  "Elevado — suspeitar intoxicação (metanol, etilenoglicol, etanol)":
    "Elevada — sospechar intoxicación (metanol, etilenglicol, etanol)",

  // ── Ânion gap ──────────────────────────────────────────────────────────────
  "Ânion gap": "Brecha aniónica",
  "AG · correção pela albumina · delta-delta":
    "BA · corrección por albúmina · delta-delta",
  "AG = Na − (Cl + HCO₃). Normal 8–12 (albumina 4 g/dL).":
    "BA = Na − (Cl + HCO₃). Normal 8–12 (albúmina 4 g/dL).",
  "Cloro": "Cloro",
  "Bicarbonato": "Bicarbonato",
  "Albumina (opcional)": "Albúmina (opcional)",
  "AG corrigido (albumina)": "BA corregida (albúmina)",
  "Delta-delta": "Delta-delta",
  "Ânion gap ELEVADO — acidose com AG aumentado":
    "Brecha aniónica ELEVADA — acidosis con BA aumentada",
  "MUDPILES: Metanol/Metformina, Uremia, Diabética (CAD), Propilenoglicol/Paracetaldeído, Isoniazida, Lactato, Etilenoglicol, Salicilatos.":
    "MUDPILES: metanol/metformina, uremia, diabética (CAD), propilenglicol/paraldehído, isoniazida, lactato, etilenglicol y salicilatos.",
  "Ânion gap normal": "Brecha aniónica normal",
  "Se acidose: hiperclorêmica (HARDUPS): HCO₃ perdido (diarreia), ATR, reposição de NaCl, fístula pancreática, urostomia, pós-hipocápnia, espironolactona.":
    "Si hay acidosis: hiperclorémica (HARDUPS): pérdida de HCO₃ (diarrea), acidosis tubular renal, reposición de NaCl, fístula pancreática, urostomía, poshipocapnia y espironolactona.",
  "Acidose hiperclorêmica (AG normal)": "Acidosis hiperclorémica (BA normal)",
  "AG aumentado + componente hiperclorêmico misto":
    "BA aumentada + componente hiperclorémico mixto",
  "Acidose com AG aumentado pura": "Acidosis pura con BA aumentada",
  "AG aumentado + alcalose metabólica sobreposta":
    "BA aumentada + alcalosis metabólica sobreañadida",

  // ── Glasgow ────────────────────────────────────────────────────────────────
  "Glasgow (GCS)": "Glasgow (GCS)",
  "Escala de coma de Glasgow": "Escala de coma de Glasgow",
  "Abertura ocular (E)": "Apertura ocular (O)",
  "Espontânea": "Espontánea",
  "À voz": "A la voz",
  "À dor": "Al dolor",
  "Resposta verbal (V)": "Respuesta verbal (V)",
  "Orientada": "Orientada",
  "Confusa": "Confusa",
  "Palavras inapropriadas": "Palabras inapropiadas",
  "Sons incompreensíveis": "Sonidos incomprensibles",
  "Resposta motora (M)": "Respuesta motora (M)",
  "Obedece comandos": "Obedece órdenes",
  "Localiza a dor": "Localiza el dolor",
  "Retirada inespecífica": "Retirada inespecífica",
  "Flexão anormal (decorticação)": "Flexión anormal (decorticación)",
  "Extensão (descerebração)": "Extensión (descerebración)",
  "GCS 15 — normal": "GCS 15 — normal",
  "GCS 13–14 — leve": "GCS 13–14 — leve",
  "Monitorar — pode indicar disfunção.": "Monitorizar — puede indicar disfunción.",
  "GCS 9–12 — moderado": "GCS 9–12 — moderado",
  "Vigilância contínua — risco de deterioração.":
    "Vigilancia continua — riesgo de deterioro.",
  "GCS 8 — limiar de IOT": "GCS 8 — umbral de intubación",
  "⚠️ Proteção de via aérea — considerar intubação orotraqueal.":
    "⚠️ Protección de la vía aérea — considerar la intubación orotraqueal.",
  "GCS ≤ 8 — grave": "GCS ≤ 8 — grave",
  "🚨 IOT indicada — risco de aspiração. TCE: TC de crânio urgente.":
    "🚨 Intubación indicada — riesgo de aspiración. En el TCE: TC de cráneo urgente.",
  "Intubado/traqueostomizado: registrar V como 'T'. GCS < 13 em TCE → TC de crânio urgente.":
    "Intubado o traqueostomizado: registrar la V como «T». GCS < 13 en el TCE → TC de cráneo urgente.",

  // ── qSOFA / SOFA ───────────────────────────────────────────────────────────
  "Triagem rápida de sepse (fora da UTI)": "Cribado rápido de sepsis (fuera de la UCI)",
  "FR ≥ 22 rpm": "FR ≥ 22 rpm",
  "Alteração do estado mental (GCS < 15)": "Alteración del estado mental (GCS < 15)",
  "PAS ≤ 100 mmHg": "PAS ≤ 100 mmHg",
  "qSOFA ≥ 2 — alto risco de desfecho adverso":
    "qSOFA ≥ 2 — alto riesgo de desenlace adverso",
  "Acionar avaliação completa com SOFA; considerar UTI.":
    "Activar la evaluación completa con SOFA; considerar la UCI.",
  "qSOFA 0–1 — baixo risco": "qSOFA 0–1 — bajo riesgo",
  "qSOFA é ferramenta de TRIAGEM fora da UTI — NÃO substitui o SOFA para diagnóstico de sepse.":
    "El qSOFA es una herramienta de CRIBADO fuera de la UCI — NO sustituye al SOFA para el diagnóstico de sepsis.",
  "Respiratório — PaO₂/FiO₂": "Respiratorio — PaO₂/FiO₂",
  "100–199 (com VM)": "100–199 (con ventilación mecánica)",
  "< 100 (com VM)": "< 100 (con ventilación mecánica)",
  "Coagulação — Plaquetas (×10³)": "Coagulación — plaquetas (×10³)",
  "Hepático — Bilirrubina (mg/dL)": "Hepático — bilirrubina (mg/dL)",
  "Cardiovascular (PAM/vasopressor)": "Cardiovascular (PAM/vasopresor)",
  "PAM ≥ 70": "PAM ≥ 70",
  "PAM < 70": "PAM < 70",
  "Dopa < 5 ou dobuta": "Dopamina < 5 o dobutamina",
  "Dopa 5–15 ou NE/Epi ≤ 0,1": "Dopamina 5–15 o NA/adrenalina ≤ 0,1",
  "Dopa > 15 ou NE/Epi > 0,1": "Dopamina > 15 o NA/adrenalina > 0,1",
  "Neurológico — Glasgow": "Neurológico — Glasgow",
  "Renal — Creatinina (mg/dL)/diurese": "Renal — creatinina (mg/dL)/diuresis",
  "SOFA ≥ 2 com infecção = SEPSE (Sepsis-3).":
    "SOFA ≥ 2 con infección = SEPSIS (Sepsis-3).",
  "SOFA ≥ 2 pontos em paciente com infecção suspeita/confirmada = Sepse (Sepsis-3, 2016).":
    "SOFA ≥ 2 puntos en un paciente con infección sospechada o confirmada = sepsis (Sepsis-3, 2016).",

  // ── Wells (TEP) ────────────────────────────────────────────────────────────
  "Wells (TEP)": "Wells (TEP)",
  "Probabilidade pré-teste de TEP": "Probabilidad pretest de TEP",
  "Sinais/sintomas clínicos de TVP": "Signos o síntomas clínicos de TVP",
  "Sim (+3)": "Sí (+3)",
  "Diagnóstico alternativo menos provável que TEP":
    "Diagnóstico alternativo menos probable que el TEP",
  "FC > 100 bpm": "FC > 100 lpm",
  "Sim (+1,5)": "Sí (+1,5)",
  "Imobilização/cirurgia < 4 semanas": "Inmovilización o cirugía < 4 semanas",
  "TVP/TEP prévios": "TVP/TEP previos",
  "Hemoptise": "Hemoptisis",
  "Sim (+1)": "Sí (+1)",
  "Câncer ativo (tratamento < 6 meses ou paliativo)":
    "Cáncer activo (tratamiento < 6 meses o paliativo)",
  "TEP PROVÁVEL (Wells > 4)": "TEP PROBABLE (Wells > 4)",
  "AngioTC diretamente — NÃO solicitar D-dímero.":
    "Angiotomografía directamente — NO solicitar dímero D.",
  "TEP IMPROVÁVEL (Wells ≤ 4)": "TEP IMPROBABLE (Wells ≤ 4)",
  "D-dímero: se negativo (ajustado à idade se > 50 anos) → TEP excluído; se positivo → AngioTC.":
    "Dímero D: si es negativo (ajustado a la edad si > 50 años) → TEP descartado; si es positivo → angiotomografía.",

  // ── CURB-65 ────────────────────────────────────────────────────────────────
  "Gravidade da pneumonia (internação × ambulatório)":
    "Gravedad de la neumonía (ingreso × ambulatorio)",
  "Confusão mental (nova desorientação)": "Confusión mental (desorientación nueva)",
  "Ureia > 43 mg/dL (BUN > 20)": "Urea > 43 mg/dL (BUN > 20)",
  "FR ≥ 30 rpm": "FR ≥ 30 rpm",
  "PA: PAS < 90 ou PAD ≤ 60 mmHg": "PA: PAS < 90 o PAD ≤ 60 mmHg",
  "Idade ≥ 65 anos": "Edad ≥ 65 años",
  "Internação; UTI especialmente se ≥ 4.": "Ingreso; UCI especialmente si es ≥ 4.",
  "CURB-65 2 — 9,2% mortalidade": "CURB-65 2 — 9,2% de mortalidad",
  "Internação hospitalar.": "Ingreso hospitalario.",
  "Ambulatório (baixo risco).": "Manejo ambulatorio (bajo riesgo).",

  // ── HEART Score ────────────────────────────────────────────────────────────
  "Risco de MACE em dor torácica": "Riesgo de MACE en el dolor torácico",
  "História (características da dor)": "Historia (características del dolor)",
  "Levemente suspeita": "Levemente sospechosa",
  "Moderadamente suspeita": "Moderadamente sospechosa",
  "Altamente suspeita": "Altamente sospechosa",
  "Alteração inespecífica (BRE, HVE)":
    "Alteración inespecífica (bloqueo de rama izquierda, hipertrofia ventricular izquierda)",
  "Depressão de ST / inversão de T nova":
    "Depresión del ST / inversión de la T de nueva aparición",
  "< 45 anos": "< 45 años",
  "45–64 anos": "45–64 años",
  "≥ 65 anos": "≥ 65 años",
  "Fatores de risco": "Factores de riesgo",
  "1–2 fatores": "1–2 factores",
  "≥ 3 ou aterosclerose conhecida": "≥ 3 o aterosclerosis conocida",
  "Troponina inicial": "Troponina inicial",
  "Normal (≤ LSR)": "Normal (≤ límite superior de referencia)",
  "1–3× LSR": "1–3× el límite superior",
  "> 3× LSR": "> 3× el límite superior",
  "Internação + troponina seriada + coronariografia precoce.":
    "Ingreso + troponina seriada + coronariografía precoz.",
  "Observação + troponina seriada + teste não invasivo.":
    "Observación + troponina seriada + prueba no invasiva.",
  "Alta precoce — acompanhamento ambulatorial.":
    "Alta precoz — seguimiento ambulatorio.",
  "MACE = infarto, revascularização urgente ou morte em 6 semanas.":
    "MACE = infarto, revascularización urgente o muerte en 6 semanas.",

  // ── NIHSS ──────────────────────────────────────────────────────────────────
  "Gravidade do AVC isquêmico": "Gravedad del ACV isquémico",
  "1a. Nível de consciência": "1a. Nivel de consciencia",
  "Alerta": "Alerta",
  "Sonolento (responsivo)": "Somnoliento (responde)",
  "Obnubilado": "Obnubilado",
  "Sem resposta": "Sin respuesta",
  "1b. NC — perguntas (mês, idade)": "1b. NC — preguntas (mes, edad)",
  "Ambas corretas": "Ambas correctas",
  "Uma correta": "Una correcta",
  "1c. NC — comandos (olhos, mão)": "1c. NC — órdenes (ojos, mano)",
  "Ambos corretos": "Ambas correctas",
  "Um correto": "Una correcta",
  "2. Movimentos oculares": "2. Movimientos oculares",
  "Paralisia parcial": "Parálisis parcial",
  "Desvio forçado": "Desviación forzada",
  "3. Campos visuais": "3. Campos visuales",
  "Sem perda": "Sin pérdida",
  "Hemianopsia parcial": "Hemianopsia parcial",
  "Hemianopsia completa": "Hemianopsia completa",
  "Cegueira bilateral": "Ceguera bilateral",
  "4. Paralisia facial": "4. Parálisis facial",
  "Discreta": "Leve",
  "Parcial": "Parcial",
  "Completa": "Completa",
  "5a. Motor MSD": "5a. Motor MSD",
  "Sem queda": "Sin caída",
  "Queda < 10s": "Caída < 10 s",
  "Esforço contra gravidade": "Esfuerzo contra la gravedad",
  "Sem esforço": "Sin esfuerzo",
  "Sem movimento": "Sin movimiento",
  "5b. Motor MSE": "5b. Motor MSI",
  "6a. Motor MID": "6a. Motor MID",
  "Queda < 5s": "Caída < 5 s",
  "6b. Motor MIE": "6b. Motor MII",
  "7. Ataxia de membros": "7. Ataxia de extremidades",
  "Ausente": "Ausente",
  "Um membro": "Una extremidad",
  "Dois membros": "Dos extremidades",
  "8. Sensibilidade": "8. Sensibilidad",
  "Perda leve": "Pérdida leve",
  "Perda grave/ausente": "Pérdida grave o ausencia",
  "9. Linguagem": "9. Lenguaje",
  "Afasia leve": "Afasia leve",
  "Afasia grave": "Afasia grave",
  "Mudo/afasia global": "Mudo / afasia global",
  "10. Disartria": "10. Disartria",
  "Discreta a moderada": "De leve a moderada",
  "Grave/intubado": "Grave / intubado",
  "11. Extinção/desatenção": "11. Extinción / falta de atención",
  "Sem anormalidade": "Sin anormalidad",
  "Extinção 1 modalidade": "Extinción en 1 modalidad",
  "Hemi-inatenção grave": "Heminegligencia grave",
  "NIHSS 0 — sem déficit": "NIHSS 0 — sin déficit",
  "Investigar AIT.": "Investigar un AIT.",
  "Trombólise + DAPT se elegível.":
    "Trombólisis + doble antiagregación si es elegible.",
  "Trombólise + avaliar trombectomia.": "Trombólisis + evaluar la trombectomía.",
  "Trombólise + trombectomia preferencial.":
    "Trombólisis + trombectomía preferente.",
  "Trombectomia prioritária; avaliar prognóstico.":
    "Trombectomía prioritaria; evaluar el pronóstico.",
  "NIHSS ≥ 6 ou suspeita de oclusão de grande vaso → transferir para centro com trombectomia mecânica.":
    "NIHSS ≥ 6 o sospecha de oclusión de gran vaso → trasladar a un centro con trombectomía mecánica.",

  // ── RASS ───────────────────────────────────────────────────────────────────
  "Richmond Agitation-Sedation Scale": "Richmond Agitation-Sedation Scale",
  "Nível observado": "Nivel observado",
  "+4 Combativo": "+4 Combativo",
  "+3 Muito agitado": "+3 Muy agitado",
  "+2 Agitado": "+2 Agitado",
  "+1 Inquieto": "+1 Inquieto",
  "0 Alerta e calmo": "0 Alerta y tranquilo",
  "−1 Sonolento": "−1 Somnoliento",
  "−2 Sedação leve": "−2 Sedación ligera",
  "−3 Sedação moderada": "−3 Sedación moderada",
  "−4 Sedação profunda": "−4 Sedación profunda",
  "−5 Não desperta": "−5 No despierta",
  "Aumentar sedação/analgesia; tratar a causa. +4: contenção + sedação urgente.":
    "Aumentar la sedación y la analgesia; tratar la causa. +4: contención + sedación urgente.",
  "RASS +1 — inquieto": "RASS +1 — inquieto",
  "Analgésico / sedação leve.": "Analgésico / sedación ligera.",
  "RASS 0 — alerta e calmo": "RASS 0 — alerta y tranquilo",
  "Estado ideal — manter e monitorar.": "Estado ideal — mantener y monitorizar.",
  "Meta padrão em VM (bundle ABCDEF). −1: ideal no desmame.":
    "Meta estándar en ventilación mecánica (paquete ABCDEF). −1: ideal en el destete.",
  "RASS −3 — sedação moderada": "RASS −3 — sedación moderada",
  "Indicado em procedimentos / SARA.": "Indicado en procedimientos y en la SDRA.",
  "RASS −4 — sedação profunda": "RASS −4 — sedación profunda",
  "Evitar de rotina — risco de PICS e mais dias de VM.":
    "Evitarla de rutina — riesgo de síndrome poscuidados intensivos y más días de ventilación mecánica.",
  "RASS −5 — não desperta": "RASS −5 — no despierta",
  "Coma — investigar causa; reduzir sedação se excessiva.":
    "Coma — investigar la causa; reducir la sedación si es excesiva.",
  "Meta padrão em VM: RASS −1 a −2 (PADIS 2018). Avaliar: agitado → +1 a +4; calmo → chamar pelo nome (−1/0); sem resposta à voz → estímulo físico (−3/−4); sem resposta → −5.":
    "Meta estándar en ventilación mecánica: RASS −1 a −2 (PADIS 2018). Evaluación: agitado → +1 a +4; tranquilo → llamarlo por su nombre (−1/0); sin respuesta a la voz → estímulo físico (−3/−4); sin respuesta → −5.",

  // ── APACHE II ──────────────────────────────────────────────────────────────
  "Gravidade e mortalidade estimada em UTI":
    "Gravedad y mortalidad estimada en la UCI",
  "Temperatura": "Temperatura",
  "PAM": "PAM",
  "FiO₂ ≥ 0,5?": "¿FiO₂ ≥ 0,5?",
  "Não (usar PaO₂)": "No (usar PaO₂)",
  "Sim (usar A-aDO₂)": "Sí (usar A-aDO₂)",
  "PaO₂ (se FiO₂ < 0,5)": "PaO₂ (si FiO₂ < 0,5)",
  "A-aDO₂ (se FiO₂ ≥ 0,5)": "A-aDO₂ (si FiO₂ ≥ 0,5)",
  "pH arterial": "pH arterial",
  "Potássio": "Potasio",
  "Insuficiência renal aguda?": "¿Insuficiencia renal aguda?",
  "Sim (dobra Cr)": "Sí (duplica la creatinina)",
  "Hematócrito": "Hematocrito",
  "Leucócitos": "Leucocitos",
  "Doença crônica grave": "Enfermedad crónica grave",
  "Cirurgia eletiva (+2)": "Cirugía electiva (+2)",
  "Emergência/clínico (+5)": "Urgencia / paciente médico (+5)",
  "APACHE II total": "APACHE II total",
  "Mortalidade hospitalar estimada": "Mortalidad hospitalaria estimada",
  "Componente agudo (12 variáveis)": "Componente agudo (12 variables)",
  "Idade + doença crônica": "Edad + enfermedad crónica",
  "Comparação de populações e triagem de UTI. NÃO usar isoladamente para limitação de suporte.":
    "Comparación de poblaciones y cribado en la UCI. NO usarlo de forma aislada para limitar el soporte vital.",
  "Preencher todas as variáveis (escolher PaO₂ ou A-aDO₂ conforme a FiO₂). Mortalidade é estimativa por faixa (equação completa do artigo original).":
    "Completar todas las variables (elegir PaO₂ o A-aDO₂ según la FiO₂). La mortalidad es una estimación por rangos (la ecuación completa está en el artículo original).",

  // ── SAPS 3 ─────────────────────────────────────────────────────────────────
  "Gravidade e mortalidade prevista em UTI":
    "Gravedad y mortalidad prevista en la UCI",
  "Comorbidade mais grave": "Comorbilidad más grave",
  "Insuf. hepática crônica (+4)": "Insuficiencia hepática crónica (+4)",
  "ICC grau IV (+5)": "Insuficiencia cardíaca clase IV (+5)",
  "Câncer metastático (+11)": "Cáncer metastásico (+11)",
  "Hemopatia maligna (+13)": "Hemopatía maligna (+13)",
  "AIDS (+13)": "Sida (+13)",
  "Motivo de admissão": "Motivo de ingreso",
  "Pós-op eletivo (0)": "Posoperatorio electivo (0)",
  "Pós-op urgência (+6)": "Posoperatorio urgente (+6)",
  "Médica/trauma (+7)": "Médica / trauma (+7)",
  "Procedência": "Procedencia",
  "Direto/casa (0)": "Directo / domicilio (0)",
  "Outro hospital (+5)": "Otro hospital (+5)",
  "Enfermaria/piso (+6)": "Sala de hospitalización (+6)",
  "Emergência (+6)": "Urgencias (+6)",
  "PS externo (+8)": "Urgencias externas (+8)",
  "Cirurgia nas 4 sem antes da UTI": "Cirugía en las 4 semanas previas a la UCI",
  "Não (0)": "No (0)",
  "Eletiva (−6)": "Electiva (−6)",
  "Emergência (+4)": "Urgente (+4)",
  "Infecção na admissão": "Infección al ingreso",
  "Outros sítios (+4)": "Otros focos (+4)",
  "Respiratória (+5)": "Respiratoria (+5)",
  "Bilirrubina": "Bilirrubina",
  "PaO₂/FiO₂ (com VM)": "PaO₂/FiO₂ (con ventilación mecánica)",
  "Plaquetas": "Plaquetas",
  "PA sistólica": "PA sistólica",
  "SAPS 3 total": "SAPS 3 total",
  "Mortalidade prevista (equação global)": "Mortalidad prevista (ecuación global)",
  "Mortalidade pela equação GLOBAL (Moreno 2005). Existe customização para América do Sul com coeficientes regionais — confirmar no instrumento original.":
    "Mortalidad según la ecuación GLOBAL (Moreno 2005). Existe una personalización para Sudamérica con coeficientes regionales — confirmarla en el instrumento original.",
  "SAPS 3 tem boa acurácia preditiva em UTIs fora dos EUA. O escore é o resultado primário; a mortalidade é estimativa populacional.":
    "El SAPS 3 tiene buena exactitud predictiva en UCI fuera de EE. UU. La puntuación es el resultado primario; la mortalidad es una estimación poblacional.",
  "Preencher todas as variáveis (pior valor da 1ª hora na UTI). Selecionar a comorbidade mais grave e o cenário de admissão. Mortalidade pela equação global.":
    "Completar todas las variables (el peor valor de la 1.ª hora en la UCI). Seleccionar la comorbilidad más grave y el escenario de ingreso. Mortalidad según la ecuación global.",

  // ── Dose de antibiótico por TFG ────────────────────────────────────────────
  "Dose de antibiótico (TFG)": "Dosis de antibiótico (TFG)",
  "Vancomicina · Pip-tazo · Meropeném por função renal":
    "Vancomicina · pip-tazo · meropenem según la función renal",
  "Antibiótico": "Antibiótico",
  "Pip-tazo": "Pip-tazo",
  "Meropeném": "Meropenem",
  "Peso (real)": "Peso (real)",
  "ClCr / TFG": "AclCr / TFG",
  "48/48h ou por nível": "cada 48 h o según el nivel plasmático",
  "Dose de ataque (peso real)": "Dosis de carga (peso real)",
  "AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). Vale 15–20 mcg/mL se AUC indisponível.":
    "AUC₂₄/CIM 400–600 mg·h/L (CIM 1: AUC mín. 400). Valle de 15–20 mcg/mL si no se dispone del AUC.",
  "Diluir 1 g em ≥ 250 mL; infundir ≥ 60 min (máx 10 mg/min) — evitar síndrome do homem vermelho.":
    "Diluir 1 g en ≥ 250 mL; infundir en ≥ 60 min (máx. 10 mg/min) — evitar el síndrome del hombre rojo.",
  "Hemodiálise": "Hemodiálisis",
  "15–20 mg/kg após a sessão; dosar nível pré-diálise.":
    "15–20 mg/kg tras la sesión; medir el nivel antes de la diálisis.",
  "4,5 g IV 6/6h (Pseudomonas: infusão estendida 4 h)":
    "4,5 g IV cada 6 h (Pseudomonas: infusión extendida de 4 h)",
  "2,25 g IV 8/8h (HD: 2,25 g 12/12h + 0,75 g pós-diálise)":
    "2,25 g IV cada 8 h (hemodiálisis: 2,25 g cada 12 h + 0,75 g tras la diálisis)",
  "Piperacilina-tazobactam": "Piperacilina-tazobactam",
  "Infusão estendida (Pseudomonas)": "Infusión extendida (Pseudomonas)",
  "4,5 g em 250 mL SF → infundir em 4 h (maximiza tempo > MIC).":
    "4,5 g en 250 mL de solución fisiológica → infundir en 4 h (maximiza el tiempo por encima de la CIM).",
  "1 g IV 8/8h (MDR: 2 g 8/8h infusão 3 h; meningite: 2 g 8/8h)":
    "1 g IV cada 8 h (multirresistente: 2 g cada 8 h en infusión de 3 h; meningitis: 2 g cada 8 h)",
  "1 g IV 12/12h (MDR/meningite: 2 g 12/12h)":
    "1 g IV cada 12 h (multirresistente/meningitis: 2 g cada 12 h)",
  "500 mg–1 g IV 12/12h (MDR/meningite: 1 g 12/12h)":
    "500 mg–1 g IV cada 12 h (multirresistente/meningitis: 1 g cada 12 h)",
  "500 mg IV 24/24h (MDR/meningite: 1 g 24/24h)":
    "500 mg IV cada 24 h (multirresistente/meningitis: 1 g cada 24 h)",
  "Infusão estendida (MDR)": "Infusión extendida (multirresistente)",
  "2 g em 100 mL SF → infundir em 3 h.":
    "2 g en 100 mL de solución fisiológica → infundir en 3 h.",
  "Valores orientativos — confirmar com farmacêutico clínico e bula. Vancomicina: ataque pelo PESO REAL; ajustar manutenção por nível/AUC e função renal.":
    "Valores orientativos — confirmar con el farmacéutico clínico y la ficha técnica. Vancomicina: la carga se calcula con el PESO REAL; ajustar el mantenimiento por el nivel/AUC y la función renal.",
  "Quando calcular":
    "Cuándo calcular",
  "Nas PRIMEIRAS 24 h de internação na UTI, usando os PIORES valores do período (ou, por praticidade, os da admissão). Calcular fora dessa janela descaracteriza o escore.":
    "En las PRIMERAS 24 h de internación en la UTI, usando los PEORES valores del período (o, por practicidad, los del ingreso). Calcularlo fuera de esa ventana desvirtúa la escala.",
  "Não recalcular":
    "No recalcular",
  "O APACHE II é pontual, da admissão. NÃO deve ser recalculado em série para acompanhar melhora ou piora durante a internação.":
    "El APACHE II es puntual, del ingreso. NO debe recalcularse en serie para seguir la mejoría o el empeoramiento durante la internación.",
};
