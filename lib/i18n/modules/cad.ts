/**
 * CAD / EHH — dicionário PT → ES.
 * Terminologia: CAD (cetoacidosis diabética), EHH (estado hiperglucémico
 * hiperosmolar), glucemia, potasio, brecha aniónica, betahidroxibutirato.
 * Tokens de dose/valor preservados.
 */
export const ES_CAD: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Suspeita de CAD / EHH — reconhecimento": "Sospecha de CAD / EHH — reconocimiento",
  "Dados laboratoriais e peso": "Datos de laboratorio y peso",
  "Classificação diagnóstica": "Clasificación diagnóstica",
  "Hidratação CAD — 1º passo (antes da insulina)":
    "Hidratación en la CAD — 1.er paso (antes de la insulina)",
  "Hidratação EHH — correção LENTA da osmolalidade":
    "Hidratación en el EHH — corrección LENTA de la osmolalidad",
  "Potássio — define o início da insulina": "Potasio — define el inicio de la insulina",
  "K⁺ < 3,5 — repor ANTES da insulina": "K⁺ < 3,5 — reponer ANTES de la insulina",
  "K⁺ 3,5–5,0 — repor durante a hidratação": "K⁺ 3,5–5,0 — reponer durante la hidratación",
  "K⁺ > 5,0 — não repor agora": "K⁺ > 5,0 — no reponer por ahora",
  "Insulina regular IV — dose calculada": "Insulina regular IV — dosis calculada",
  "Bicarbonato — apenas CAD, por faixa de pH":
    "Bicarbonato — solo en la CAD, según el rango de pH",
  "Bicarbonato — administrar e reavaliar": "Bicarbonato — administrar y reevaluar",
  "Meta glicêmica atingida?": "¿Se alcanzó la meta glucémica?",
  "Adicionar glicose e reduzir a insulina": "Agregar dextrosa y reducir la insulina",
  "Manter infusão e monitorizar": "Mantener la infusión y monitorizar",
  "Critérios de resolução e transição para SC":
    "Criterios de resolución y transición a la vía subcutánea",
  "UTI / unidade de internação": "UCI / unidad de internación",
  "CAD / EHH": "CAD / EHH",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "O quadro é CAD ou EHH?": "¿El cuadro es una CAD o un EHH?",
  "Qual o valor do K⁺ sérico?": "¿Cuál es el valor del K⁺ sérico?",
  "Qual a faixa do pH arterial?": "¿En qué rango está el pH arterial?",
  "A glicemia chegou a ~200 (CAD) / ~300 (EHH) mg/dL?":
    "¿La glucemia llegó a ~200 (CAD) / ~300 (EHH) mg/dL?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Emergências hiperglicêmicas (mortalidade CAD 1–5%, EHH 5–20%). Diagnóstico clínico + laboratorial; podem coexistir.":
    "Emergencias hiperglucémicas (mortalidad de la CAD 1–5%, del EHH 5–20%). Diagnóstico clínico + de laboratorio; pueden coexistir.",
  "Glicemia {glicemia} mg/dL · pH {ph} · K⁺ {potassio} mEq/L.":
    "Glucemia {glicemia} mg/dL · pH {ph} · K⁺ {potassio} mEq/L.",
  "Déficit típico 3–5 L. Repõe volume, melhora perfusão e já reduz glicemia/osmolalidade.":
    "Déficit típico de 3–5 L. Repone volumen, mejora la perfusión y ya reduce la glucemia/osmolalidad.",
  "Déficit estimado ~{defEhhLow}–{defEhhHigh} L (100–200 mL/kg). Corrigir devagar — risco de edema cerebral.":
    "Déficit estimado ~{defEhhLow}–{defEhhHigh} L (100–200 mL/kg). Corregir lentamente — riesgo de edema cerebral.",
  "K⁺ informado: {potassio} mEq/L.": "K⁺ informado: {potassio} mEq/L.",
  "Iniciar insulina com K⁺ baixo pode ser fatal (arritmia).":
    "Iniciar la insulina con el K⁺ bajo puede ser mortal (arritmia).",
  "Pode iniciar a insulina; manter o K⁺ em 4,0–5,0.":
    "Se puede iniciar la insulina; mantener el K⁺ en 4,0–5,0.",
  "Iniciar insulina; o K⁺ tende a cair com o tratamento.":
    "Iniciar la insulina; el K⁺ tiende a caer con el tratamiento.",
  "Só após K⁺ ≥ 3,5 e hidratação iniciada. SEM bolus de rotina.":
    "Solo tras K⁺ ≥ 3,5 y con la hidratación iniciada. SIN bolo de rutina.",
  "pH informado: {ph}. Uso rotineiro NÃO recomendado.":
    "pH informado: {ph}. El uso rutinario NO está recomendado.",
  "Sempre com KCl junto e monitorização do K⁺.":
    "Siempre junto con KCl y con monitorización del K⁺.",
  "Manter insulina até resolver a cetoacidose (CAD) / normalizar a osmolalidade (EHH).":
    "Mantener la insulina hasta resolver la cetoacidosis (CAD) / normalizar la osmolalidad (EHH).",
  "Ainda acima da meta — manter o tratamento e reavaliar.":
    "Todavía por encima de la meta — mantener el tratamiento y reevaluar.",
  "Resolver ANTES de suspender a insulina IV — sempre com sobreposição.":
    "Resolver ANTES de suspender la insulina IV — siempre con solapamiento.",
  "Destino conforme a gravidade e a estabilidade.":
    "Destino según la gravedad y la estabilidad.",

  // ── Campos e opções ────────────────────────────────────────────────────────
  "Glicemia": "Glucemia",
  "Potássio (K⁺)": "Potasio (K⁺)",
  "pH arterial": "pH arterial",
  "Peso estimado": "Peso estimado",
  "CAD (cetoacidose)": "CAD (cetoacidosis)",
  "EHH (hiperosmolar)": "EHH (hiperosmolar)",
  "K⁺ < 3,5 mEq/L": "K⁺ < 3,5 mEq/L",
  "K⁺ 3,5–5,0 mEq/L": "K⁺ 3,5–5,0 mEq/L",
  "K⁺ > 5,0 mEq/L": "K⁺ > 5,0 mEq/L",
  "pH ≥ 7,0 ou EHH — sem bicarbonato": "pH ≥ 7,0 o EHH — sin bicarbonato",
  "pH 6,9–7,0 — bicarbonato (faixa intermediária)":
    "pH 6,9–7,0 — bicarbonato (rango intermedio)",
  "pH < 6,9 — bicarbonato (dose maior)": "pH < 6,9 — bicarbonato (dosis mayor)",
  "Sim — atingiu a meta": "Sí — alcanzó la meta",
  "Não — ainda acima": "No — todavía por encima",
  "Toque nos valores (ou adicione). O K⁺ decide o início da insulina; o peso calcula as doses.":
    "Toque los valores (o agréguelos). El K⁺ decide el inicio de la insulina; el peso calcula las dosis.",

  // ── Evidência ──────────────────────────────────────────────────────────────
  "CAD (consenso 2024): glicemia ≥ 200 mg/dL (ou história de diabetes; pode ser < 200 na euglicêmica por SGLT2i) + CETOSE (betaOHB ≥ 3,0 mmol/L ou cetonúria) + acidose metabólica (pH < 7,30 e/ou HCO₃⁻ < 18). Consciência preservada (grave: estupor/coma).":
    "CAD (consenso 2024): glucemia ≥ 200 mg/dL (o antecedente de diabetes; puede ser < 200 en la euglucémica por iSGLT2) + CETOSIS (betahidroxibutirato ≥ 3,0 mmol/L o cetonuria) + acidosis metabólica (pH < 7,30 y/o HCO₃⁻ < 18). Conciencia conservada (grave: estupor/coma).",
  "O consenso 2024 RETIROU o ânion gap dos critérios diagnósticos (sofre influência de outros distúrbios acidobásicos) — o ânion gap segue útil para ACOMPANHAR a evolução, não para diagnosticar.":
    "El consenso de 2024 RETIRÓ la brecha aniónica de los criterios diagnósticos (se ve influida por otros trastornos ácido-base) — la brecha aniónica sigue siendo útil para SEGUIR la evolución, no para diagnosticar.",
  "EHH (critérios formalizados no consenso 2024): glicemia > 600, osmolalidade efetiva > 320 mOsm/kg, pH > 7,30 e HCO₃⁻ > 18, cetose mínima/ausente. Estupor/coma em ≥ 50%. Déficit hídrico MUITO maior.":
    "EHH (criterios formalizados en el consenso de 2024): glucemia > 600, osmolalidad efectiva > 320 mOsm/kg, pH > 7,30 y HCO₃⁻ > 18, cetosis mínima o ausente. Estupor/coma en ≥ 50%. Déficit hídrico MUCHO mayor.",
  "Diferença-chave de manejo: no EHH a correção da osmolalidade/Na⁺ deve ser LENTA (risco de edema cerebral); na CAD o foco é fechar o ânion gap.":
    "Diferencia clave del manejo: en el EHH la corrección de la osmolalidad/Na⁺ debe ser LENTA (riesgo de edema cerebral); en la CAD el foco es cerrar la brecha aniónica.",
  "K⁺ inicial é FALSAMENTE elevado pela acidose; com insulina + correção da acidose ele despenca → hipocalemia fatal se não reposto.":
    "El K⁺ inicial está FALSAMENTE elevado por la acidosis; con la insulina + la corrección de la acidosis se desploma → hipopotasemia mortal si no se repone.",
  "K⁺ < 3,5: NÃO iniciar insulina — repor K⁺ primeiro.":
    "K⁺ < 3,5: NO iniciar la insulina — reponer primero el K⁺.",
  "K⁺ 3,5–5,0: iniciar insulina E repor K⁺ na hidratação (alvo 4,0–5,0).":
    "K⁺ 3,5–5,0: iniciar la insulina Y reponer el K⁺ en la hidratación (objetivo 4,0–5,0).",
  "K⁺ > 5,0: iniciar insulina sem repor K⁺; rechecar em 2 h.":
    "K⁺ > 5,0: iniciar la insulina sin reponer el K⁺; volver a controlarlo en 2 h.",
  "Bicarbonato de rotina NÃO é recomendado (ADA 2009/2024) — pode causar hipocalemia, alcalose paradoxal do LCR e edema cerebral.":
    "El bicarbonato de rutina NO está recomendado (ADA 2009/2024) — puede causar hipopotasemia, alcalosis paradójica del LCR y edema cerebral.",
  "pH ≥ 7,0: não usar — corrigir com hidratação + insulina.":
    "pH ≥ 7,0: no usarlo — corregir con hidratación + insulina.",
  "Consenso 2024: considerar bicarbonato APENAS na acidose grave com pH < 7,0 (a faixa 6,9–7,0 abaixo vem do protocolo clássico e virou opcional).":
    "Consenso 2024: considerar el bicarbonato SOLO en la acidosis grave con pH < 7,0 (el rango 6,9–7,0 que figura abajo proviene del protocolo clásico y pasó a ser opcional).",
  "pH 6,9–7,0: NaHCO₃ 50 mEq + KCl 10 mEq em 200 mL água destilada IV em 1 h; reavaliar em 2 h.":
    "pH 6,9–7,0: NaHCO₃ 50 mEq + KCl 10 mEq en 200 mL de agua destilada IV en 1 h; reevaluar en 2 h.",
  "pH < 6,9: NaHCO₃ 100 mEq + KCl 20 mEq em 400 mL água destilada IV em 2 h; repetir a cada 2 h até pH > 7,0. EHH não tem indicação (sem acidose).":
    "pH < 6,9: NaHCO₃ 100 mEq + KCl 20 mEq en 400 mL de agua destilada IV en 2 h; repetir cada 2 h hasta pH > 7,0. El EHH no tiene indicación (sin acidosis).",
  "Ao atingir a meta, adicionar glicose ao soro evita hipoglicemia e permite manter a insulina até resolver a cetoacidose (CAD) / a hiperosmolalidade (EHH).":
    "Al alcanzar la meta, agregar dextrosa al suero evita la hipoglucemia y permite mantener la insulina hasta resolver la cetoacidosis (CAD) / la hiperosmolalidad (EHH).",
  "CAD: troca para SG aos 200 mg/dL (manter 150–200). EHH: troca aos 300 mg/dL (manter 250–300 até osmol < 315).":
    "CAD: cambiar a suero glucosado a los 200 mg/dL (mantener 150–200). EHH: cambiar a los 300 mg/dL (mantener 250–300 hasta que la osmolalidad < 315).",

  // ── Ações ──────────────────────────────────────────────────────────────────
  "Monitor, oximetria, PA, 2 acessos venosos; avaliar nível de consciência e grau de desidratação.":
    "Monitor, oximetría, PA, 2 accesos venosos; evaluar el nivel de conciencia y el grado de deshidratación.",
  "Exames AGORA: glicemia capilar+venosa, gasometria (pH, HCO₃⁻), cetonemia (betaOHB) ou cetonúria, Na⁺/K⁺/Cl⁻, ureia/creatinina, HMG, EAS+urocultura, ECG. Considerar amilase/lipase, fósforo, Mg²⁺.":
    "Exámenes AHORA: glucemia capilar y venosa, gasometría (pH, HCO₃⁻), cetonemia (betahidroxibutirato) o cetonuria, Na⁺/K⁺/Cl⁻, urea/creatinina, hemograma, orina completa + urocultivo, ECG. Considerar amilasa/lipasa, fósforo y Mg²⁺.",
  "Calcular ânion gap = Na⁺ − (Cl⁻ + HCO₃⁻); Na⁺ corrigido = Na⁺ medido + 1,6 × (glicemia − 100)/100; osmolalidade efetiva = 2 × Na⁺ + glicemia/18.":
    "Calcular la brecha aniónica = Na⁺ − (Cl⁻ + HCO₃⁻); Na⁺ corregido = Na⁺ medido + 1,6 × (glucemia − 100)/100; osmolalidad efectiva = 2 × Na⁺ + glucemia/18.",
  "Buscar ATIVAMENTE o precipitante: infecção, omissão de insulina, DM1 inaugural, IAM/AVC, pancreatite, drogas (corticoide, antipsicótico), SGLT2i.":
    "Buscar ACTIVAMENTE el precipitante: infección, omisión de insulina, debut de DM1, infarto/ACV, pancreatitis, fármacos (corticoides, antipsicóticos), iSGLT2.",
  "CAD euglicêmica (uso de SGLT2i): glicemia pode ser < 250 mg/dL com cetonemia + acidose — suspender SGLT2i e tratar como CAD com glicose IV desde o início.":
    "CAD euglucémica (uso de iSGLT2): la glucemia puede ser < 250 mg/dL con cetonemia + acidosis — suspender el iSGLT2 y tratarla como CAD con dextrosa IV desde el inicio.",
  "1ª hora: SF 0,9% {sfLow}–{sfHigh} mL (15–20 mL/kg/h; ≈ 1–1,5 L). Em choque: 500 mL em 15–30 min, repetir até PAS ≥ 90 mmHg.":
    "1.ª hora: solución fisiológica al 0,9% {sfLow}–{sfHigh} mL (15–20 mL/kg/h; ≈ 1–1,5 L). En choque: 500 mL en 15–30 min, repetir hasta PAS ≥ 90 mmHg.",
  "Manutenção (2ª–12ª h) pelo Na⁺ CORRIGIDO: corrigido < 135 → manter SF 0,9% 250–500 mL/h; corrigido ≥ 135 → SF 0,45% 250–500 mL/h.":
    "Mantenimiento (2.ª–12.ª h) según el Na⁺ CORREGIDO: corregido < 135 → mantener solución fisiológica al 0,9% 250–500 mL/h; corregido ≥ 135 → solución salina al 0,45% 250–500 mL/h.",
  "Repor ~50% do déficit nas primeiras 8–12 h; restante em 12–24 h. Total estimado 24 h: 4–6 L.":
    "Reponer ~50% del déficit en las primeras 8–12 h; el resto en 12–24 h. Total estimado en 24 h: 4–6 L.",
  "CAD euglicêmica (SGLT2i): adicionar glicose IV desde o início para permitir a insulina sem hipoglicemia.":
    "CAD euglucémica (iSGLT2): agregar dextrosa IV desde el inicio para permitir la insulina sin hipoglucemia.",
  "Cuidado em idosos/cardiopatas/nefropatas: ausculta pulmonar e SpO₂ — risco de edema pulmonar.":
    "Cuidado en ancianos/cardiópatas/nefrópatas: auscultación pulmonar y SpO₂ — riesgo de edema pulmonar.",
  "1ª–2ª hora: SF 0,9% 1.000–1.500 mL/h ({sfLow}–{sfHigh} mL na 1ª hora).":
    "1.ª–2.ª hora: solución fisiológica al 0,9% 1.000–1.500 mL/h ({sfLow}–{sfHigh} mL en la 1.ª hora).",
  "Manutenção: SF 0,45% 250–500 mL/h após expansão. Se Na⁺ corrigido > 150 mEq/L, SF 0,45% (ou água livre via SNE com cautela).":
    "Mantenimiento: solución salina al 0,45% 250–500 mL/h tras la expansión. Si el Na⁺ corregido > 150 mEq/L, solución al 0,45% (o agua libre por sonda enteral con cautela).",
  "ALVO de correção da osmolalidade: ≤ 3 mOsm/kg/h. Correção do Na⁺: ≤ 0,5 mEq/L/h. NÃO normalizar a osmolalidade em menos de 24–36 h.":
    "OBJETIVO de corrección de la osmolalidad: ≤ 3 mOsm/kg/h. Corrección del Na⁺: ≤ 0,5 mEq/L/h. NO normalizar la osmolalidad en menos de 24–36 h.",
  "A hidratação isolada já reduz a glicemia 70–100 mg/dL/h — a insulina entra em dose baixa e mais tarde.":
    "La hidratación por sí sola ya reduce la glucemia 70–100 mg/dL/h — la insulina se inicia en dosis baja y más tarde.",
  "Vigiar nível de consciência de hora em hora; piora súbita → suspeitar de edema cerebral.":
    "Vigilar el nivel de conciencia cada hora; un empeoramiento súbito → sospechar edema cerebral.",
  "SEGURAR a insulina até K⁺ ≥ 3,5 mEq/L.": "RETENER la insulina hasta que el K⁺ ≥ 3,5 mEq/L.",
  "Repor KCl 20–40 mEq/h IV (máx 40 mEq/h em acesso central), com ECG contínuo.":
    "Reponer KCl 20–40 mEq/h IV (máx. 40 mEq/h por acceso central), con ECG continuo.",
  "Rechecar K⁺ a cada 2 h; iniciar insulina assim que K⁺ ≥ 3,5.":
    "Volver a controlar el K⁺ cada 2 h; iniciar la insulina en cuanto el K⁺ ≥ 3,5.",
  "Hipomagnesemia frequente: se Mg < 1,2 mg/dL ou sintomas, MgSO₄ 50% 2 g IV em 1 h (melhora a reposição de K⁺).":
    "Hipomagnesemia frecuente: si el Mg < 1,2 mg/dL o hay síntomas, MgSO₄ al 50% 2 g IV en 1 h (mejora la reposición del K⁺).",
  "Manter a hidratação em curso.": "Mantener la hidratación en curso.",
  "Adicionar 20–40 mEq de KCl por litro de fluido IV.":
    "Agregar 20–40 mEq de KCl por litro de líquido IV.",
  "Manter o K⁺ entre 4,0 e 5,0 mEq/L; rechecar a cada 2 h nas primeiras 6 h, depois a cada 4 h.":
    "Mantener el K⁺ entre 4,0 y 5,0 mEq/L; volver a controlarlo cada 2 h las primeras 6 h y luego cada 4 h.",
  "Pode iniciar a insulina agora (próximo passo).":
    "Se puede iniciar la insulina ahora (siguiente paso).",
  "Vigiar diurese — não repor K⁺ se anúria/oligúria significativa.":
    "Vigilar la diuresis — no reponer K⁺ si hay anuria/oliguria significativa.",
  "NÃO adicionar potássio neste momento.": "NO agregar potasio en este momento.",
  "Iniciar a insulina (próximo passo) e manter a hidratação.":
    "Iniciar la insulina (siguiente paso) y mantener la hidratación.",
  "Rechecar K⁺ em 2 h e iniciar a reposição quando K⁺ < 5,0 mEq/L.":
    "Volver a controlar el K⁺ en 2 h e iniciar la reposición cuando el K⁺ < 5,0 mEq/L.",
  "Garantir diurese adequada antes de repor potássio.":
    "Asegurar una diuresis adecuada antes de reponer potasio.",
  "Infusão contínua (padrão-ouro): insulina regular {insInf} U/h (0,1 U/kg/h) SEM bolus inicial — bolus de rotina não melhora desfecho e aumenta hipoglicemia/hipocalemia. Preparo: 100 UI em 100 mL SF → 1 U = 1 mL.":
    "Infusión continua (estándar de oro): insulina regular {insInf} U/h (0,1 U/kg/h) SIN bolo inicial — el bolo de rutina no mejora el desenlace y aumenta la hipoglucemia/hipopotasemia. Preparación: 100 UI en 100 mL de solución fisiológica → 1 U = 1 mL.",
  "No EHH: hidratação já reduz a glicemia; iniciar insulina só após 1–2 h de hidratação e em dose baixa (≈ 0,05 U/kg/h). Meta intermediária 250–300 mg/dL até osmolalidade normalizar.":
    "En el EHH: la hidratación ya reduce la glucemia; iniciar la insulina solo tras 1–2 h de hidratación y en dosis baja (≈ 0,05 U/kg/h). Meta intermedia de 250–300 mg/dL hasta que se normalice la osmolalidad.",
  "Alternativa em CAD leve-moderada (ADA 2009): insulina regular SC {scBolus} U (0,3 U/kg) → {scRepeat} U (0,2 U/kg) a cada 2 h SC.":
    "Alternativa en la CAD leve-moderada (ADA 2009): insulina regular SC {scBolus} U (0,3 U/kg) → {scRepeat} U (0,2 U/kg) cada 2 h por vía subcutánea.",
  "Meta de queda da glicemia: 50–75 mg/dL/h. Queda < 50 na 1ª hora → dobrar a taxa; queda > 100/h → reduzir 50%.":
    "Meta de descenso de la glucemia: 50–75 mg/dL/h. Descenso < 50 en la 1.ª hora → duplicar la velocidad; descenso > 100/h → reducirla un 50%.",
  "Monitorar glicemia de hora em hora e K⁺ a cada 2 h. NÃO suspender a insulina IV ao normalizar a glicemia se a acidose persistir.":
    "Monitorizar la glucemia cada hora y el K⁺ cada 2 h. NO suspender la insulina IV al normalizarse la glucemia si la acidosis persiste.",
  "pH 6,9–7,0: NaHCO₃ 50 mEq + KCl 10 mEq em 200 mL de água destilada IV em 1 h.":
    "pH 6,9–7,0: NaHCO₃ 50 mEq + KCl 10 mEq en 200 mL de agua destilada IV en 1 h.",
  "pH < 6,9: NaHCO₃ 100 mEq + KCl 20 mEq em 400 mL de água destilada IV em 2 h; repetir a cada 2 h até pH > 7,0.":
    "pH < 6,9: NaHCO₃ 100 mEq + KCl 20 mEq en 400 mL de agua destilada IV en 2 h; repetir cada 2 h hasta pH > 7,0.",
  "Monitorar K⁺ de perto (o bicarbonato baixa o K⁺).":
    "Monitorizar el K⁺ de cerca (el bicarbonato lo desciende).",
  "Reavaliar a gasometria após 2 h; suspender ao atingir pH > 7,0.":
    "Reevaluar la gasometría tras 2 h; suspenderlo al alcanzar un pH > 7,0.",
  "CAD (glicemia 200): adicionar SG 5% + SF 0,45% (ou SGI) 150–250 mL/h; manter glicemia 150–200 mg/dL.":
    "CAD (glucemia 200): agregar dextrosa al 5% + solución salina al 0,45% 150–250 mL/h; mantener la glucemia en 150–200 mg/dL.",
  "EHH (glicemia 300): adicionar SG 5%; manter glicemia 250–300 mg/dL até osmolalidade < 315 e consciência normal — só então reduzir a meta.":
    "EHH (glucemia 300): agregar dextrosa al 5%; mantener la glucemia en 250–300 mg/dL hasta que la osmolalidad < 315 y la conciencia sea normal — recién entonces bajar la meta.",
  "Reduzir a infusão de insulina para {insLow}–{insLowHigh} U/h (0,02–0,05 U/kg/h).":
    "Reducir la infusión de insulina a {insLow}–{insLowHigh} U/h (0,02–0,05 U/kg/h).",
  "Continuar reposição de K⁺ e monitorização (glicemia 1–2/h, K⁺ a cada 2–4 h).":
    "Continuar la reposición de K⁺ y la monitorización (glucemia cada 1–2 h, K⁺ cada 2–4 h).",
  "Manter a infusão de insulina e a hidratação.":
    "Mantener la infusión de insulina y la hidratación.",
  "Glicemia de hora em hora; se a queda for < 50 mg/dL/h, aumentar a infusão; se > 100/h, reduzir 50%.":
    "Glucemia cada hora; si el descenso es < 50 mg/dL/h, aumentar la infusión; si es > 100/h, reducirla un 50%.",
  "K⁺ a cada 2 h; eletrólitos e gasometria a cada 2–4 h. Cetonemia (betaOHB) a cada 2–4 h se disponível.":
    "K⁺ cada 2 h; electrolitos y gasometría cada 2–4 h. Cetonemia (betahidroxibutirato) cada 2–4 h si está disponible.",
  "Reavaliar quando a glicemia atingir ~200 (CAD) / ~300 (EHH).":
    "Reevaluar cuando la glucemia llegue a ~200 (CAD) / ~300 (EHH).",
  "CAD resolvida (consenso 2024): betaOHB < 0,6 mmol/L E (pH ≥ 7,30 OU HCO₃⁻ ≥ 18), com glicemia < 200 mg/dL. Se betaOHB indisponível, usar o fechamento do ânion gap. Cetonúria pode persistir — NÃO usá-la como critério isolado.":
    "CAD resuelta (consenso 2024): betahidroxibutirato < 0,6 mmol/L Y (pH ≥ 7,30 O HCO₃⁻ ≥ 18), con glucemia < 200 mg/dL. Si el betahidroxibutirato no está disponible, usar el cierre de la brecha aniónica. La cetonuria puede persistir — NO usarla como criterio aislado.",
  "EHH resolvido: osmolalidade efetiva < 315 mOsm/kg, glicemia < 300, consciência normalizada, aceitando VO.":
    "EHH resuelto: osmolalidad efectiva < 315 mOsm/kg, glucemia < 300, conciencia normalizada y tolerancia a la vía oral.",
  "Transição SC: calcular dose total diária (DM1/magro 0,5–0,6 U/kg/dia; DM2 0,6–0,8) — 50% basal + 50% bolus às refeições.":
    "Transición a la vía subcutánea: calcular la dosis total diaria (DM1/delgado 0,5–0,6 U/kg/día; DM2 0,6–0,8) — 50% basal + 50% en bolos con las comidas.",
  "SOBREPOSIÇÃO obrigatória: aplicar insulina basal SC 1–2 h ANTES de desligar a infusão IV (a IV tem meia-vida de 5–10 min → risco de rebote).":
    "SOLAPAMIENTO obligatorio: aplicar la insulina basal subcutánea 1–2 h ANTES de suspender la infusión IV (la IV tiene una vida media de 5–10 min → riesgo de rebote).",
  "Repor FÓSFORO se < 1,0 mmol/L (consenso 2024), sobretudo com fraqueza muscular ou disfunção cardíaca/respiratória.":
    "Reponer FÓSFORO si < 1,0 mmol/L (consenso 2024), sobre todo si hay debilidad muscular o disfunción cardíaca/respiratoria.",
  "Tratar o fator precipitante; retomar antidiabéticos orais quando estável (metformina contraindicada se Cr alta/TFG < 30; SGLT2i suspenso até reavaliação).":
    "Tratar el factor precipitante; reanudar los antidiabéticos orales cuando esté estable (la metformina está contraindicada si la creatinina está alta o la TFG < 30; el iSGLT2 se suspende hasta la reevaluación).",
  "CAD grave (pH < 7,0), rebaixamento, instabilidade, EHH com osmolalidade muito alta ou edema cerebral → UTI.":
    "CAD grave (pH < 7,0), deterioro del sensorio, inestabilidad, EHH con osmolalidad muy alta o edema cerebral → UCI.",
  "Edema cerebral (cefaleia súbita, queda de consciência, bradicardia + HAS): manitol 0,5–1 g/kg IV ou SF 3% 5–10 mL/kg, reduzir hidratação, TC, UTI imediata.":
    "Edema cerebral (cefalea súbita, caída del nivel de conciencia, bradicardia + hipertensión): manitol 0,5–1 g/kg IV o solución salina al 3% 5–10 mL/kg, reducir la hidratación, TC y UCI de inmediato.",
  "Quadros leves/moderados estáveis → internação com monitorização de glicemia e eletrólitos.":
    "Cuadros leves/moderados estables → internación con monitorización de la glucemia y los electrolitos.",
  "Manter a investigação e o tratamento do fator precipitante; educação e ajuste do esquema de insulina antes da alta.":
    "Mantener la investigación y el tratamiento del factor precipitante; educación y ajuste del esquema de insulina antes del alta.",
  "K⁺ > 5,0: iniciar insulina sem repor K⁺; rechecar em 2 h da coleta atual.": "K⁺ > 5,0: iniciar insulina sin reponer K⁺; volver a controlar a las 2 h de la extracción actual.",
  "pH 6,9–7,0: NaHCO₃ 50 mEq + KCl 10 mEq em 200 mL água destilada IV em 1 h; reavaliar o pH em 2 h após o término da infusão.": "pH 6,9–7,0: NaHCO₃ 50 mEq + KCl 10 mEq en 200 mL de agua destilada IV en 1 h; reevaluar el pH 2 h después del fin de la infusión.",
};
