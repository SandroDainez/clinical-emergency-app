/**
 * Sedoanalgesia & BNM — dicionário PT → ES (calculadora de diluição/dose).
 * Terminologia: ketamina, fentanilo, rocuronio, cisatracurio, bloqueo
 * neuromuscular, RASS, solución fisiológica (SF), dextrosa al 5% (SG5%).
 */
export const ES_SEDACAO: Record<string, string> = {
  "PERSONALIZAR DILUIÇÃO": "PERSONALIZAR DILUCIÓN",
  "Diluições salvas e preparo personalizado": "Diluciones guardadas y preparación personalizada",
  "salva(s)": "guardada(s)",
  "NOTAS DO BOLUS": "NOTAS DEL BOLO",
  "Indicação, contexto hemodinâmico e observações de administração": "Indicación, contexto hemodinámico y observaciones de administración",
  // ── Fármacos ───────────────────────────────────────────────────────────────
  "Propofol": "Propofol",
  "Midazolam": "Midazolam",
  "Cetamina": "Ketamina",
  "Dexmedetomidina": "Dexmedetomidina",
  "Fentanil": "Fentanilo",
  "Remifentanil": "Remifentanilo",
  "Opioide ultracurto": "Opioide ultracorto",
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
  // ── Etomidato e succinilcolina (D-4b) · bólus de indução do propofol ─────
  "Etomidato": "Etomidato",
  "Succinilcolina": "Succinilcolina",
  "Hipnótico não-barbitúrico (agonista GABA-A)": "Hipnótico no barbitúrico (agonista GABA-A)",
  "BNM despolarizante": "BNM despolarizante",
  "Puro 2 mg/mL · 1 amp (20 mg) → 10 mL": "Puro 2 mg/mL · 1 ampolla (20 mg) → 10 mL",
  "Frasco-ampola 100 mg (pó) → 10 mL = 10 mg/mL": "Frasco-ampolla 100 mg (polvo) → 10 mL = 10 mg/mL",
  "10 mg/mL (reconstituído em 10 mL)": "10 mg/mL (reconstituido en 10 mL)",
  "10 mg/mL · 1 fr (100 mg) + 10 mL → 10 mL": "10 mg/mL · 1 fr (100 mg) + 10 mL → 10 mL",
  "Indução: 0,3 mg/kg IV — início 15–45 s, duração 5–10 min.": "Inducción: 0,3 mg/kg IV — inicio 15–45 s, duración 5–10 min.",
  "ISR em adulto crítico: 0,2–0,3 mg/kg IV é faixa usada em estudos; o default deste módulo permanece 0,3 mg/kg. Não reduzir automaticamente apenas pela instabilidade, mas individualizar conforme idade, reserva fisiológica e fármacos concomitantes.": "ISR en el adulto crítico: 0,2–0,3 mg/kg IV es un rango utilizado en estudios; el valor predeterminado de este módulo sigue siendo 0,3 mg/kg. No reducir automáticamente solo por la inestabilidad; individualizar según edad, reserva fisiológica y fármacos concomitantes.",
  "NÃO tem modo de infusão: uso em bólus único. Infusão contínua causa supressão adrenal sustentada.": "NO tiene modo de infusión: uso en bolo único. La infusión continua causa supresión adrenal sostenida.",
  "Hipnótico de ação curta, hemodinamicamente NEUTRO — indutor de escolha quando a pressão não tolera propofol.": "Hipnótico de acción corta, hemodinámicamente NEUTRO — inductor de elección cuando la presión no tolera propofol.",
  "Não tem efeito analgésico: associar opioide.": "No tiene efecto analgésico: asociar opioide.",
  "Supressão adrenal transitória após dose única (relevância clínica debatida no choque séptico) — NUNCA em infusão contínua.": "Supresión adrenal transitoria tras dosis única (relevancia clínica debatida en el choque séptico) — NUNCA en infusión continua.",
  "Mioclonias em até 1/3 dos pacientes; podem ser confundidas com convulsão.": "Mioclonías en hasta 1/3 de los pacientes; pueden confundirse con convulsión.",
  "Sem analgesia: bólus isolado deixa o paciente hipnótico e com dor.": "Sin analgesia: el bolo aislado deja al paciente hipnótico y con dolor.",
  "✅ ISR no paciente hipotenso ou com reserva cardíaca limitada.": "✅ ISR en el paciente hipotenso o con reserva cardíaca limitada.",
  "Evitar limites por número de ampolas: a dose deve permanecer baseada em mg/kg e individualização clínica; a bula descreve 0,2–0,6 mg/kg para indução, com 0,3 mg/kg como dose usual.": "Evitar límites por número de ampollas: la dosis debe mantenerse basada en mg/kg e individualización clínica; la ficha técnica describe 0,2–0,6 mg/kg para inducción, con 0,3 mg/kg como dosis habitual.",
    "ISR: 1–1,5 mg/kg IV em bólus ultrarrápido. Em obesidade, calcular pelo peso corporal total/real; não aumentar automaticamente para 2 mg/kg apenas por obesidade. Não aplicar teto IV absoluto de 200 mg: a bula brasileira não traz esse teto para via IV.": "ISR: 1–1,5 mg/kg IV en bolo ultrarrápido. En obesidad, calcular según el peso corporal total/real; no aumentar automáticamente a 2 mg/kg solo por obesidad. No aplicar un techo IV absoluto de 200 mg: el prospecto brasileño no establece ese techo para la vía IV.",
  "Início 45–60 s; duração ultracurta 8–12 min. SEM antídoto.": "Inicio 45–60 s; duración ultracorta 8–12 min. SIN antídoto.",
  "Aguardar as fasciculações cessarem antes da laringoscopia.": "Esperar a que cesen las fasciculaciones antes de la laringoscopia.",
  "BNM despolarizante de início mais rápido e duração mais curta — o padrão histórico da ISR.": "BNM despolarizante de inicio más rápido y duración más corta — el estándar histórico de la ISR.",
  "A duração curta NÃO é resgate confiável no paciente crítico: a dessaturação costuma chegar antes do retorno da ventilação espontânea adequada.": "La duración corta NO es un rescate confiable en el paciente crítico: la desaturación suele llegar antes del retorno de la ventilación espontánea adecuada.",
  "CONTRAINDICAÇÕES IMPORTANTES (usar rocurônio quando presentes): hipercalemia conhecida ou suspeita clinicamente relevante — não usar um corte isolado de K⁺ como regra universal; após a fase aguda de queimadura grave, trauma múltiplo, denervação/lesão de neurônio motor superior ou imobilização prolongada, pelo risco de hipercalemia grave; rabdomiólise/esmagamento; miopatias/distrofias musculares e miotonias; suscetibilidade pessoal ou familiar à hipertermia maligna; pseudocolinesterase atípica OU inibição adquirida da colinesterase (organofosforado — risco de bloqueio prolongado); trauma ocular aberto/franca perfuração ocular — preferir bloqueador não despolarizante.": "CONTRAINDICACIONES IMPORTANTES (usar rocuronio cuando estén presentes): hiperpotasemia conocida o sospechada clínicamente relevante — no usar un punto de corte aislado de K⁺ como regla universal; tras la fase aguda de quemadura grave, traumatismo múltiple, denervación/lesión de neurona motora superior o inmovilización prolongada, por riesgo de hiperpotasemia grave; rabdomiólisis/aplastamiento; miopatías/distrofias musculares y miotonías; susceptibilidad personal o familiar a hipertermia maligna; seudocolinesterasa atípica O inhibición adquirida de colinesterasa (organofosforados — riesgo de bloqueo prolongado); trauma ocular abierto/perforación ocular franca — preferir bloqueante no despolarizante.",
  "NUNCA bloquear sem garantir sedação e analgesia adequadas — o paciente paralisado e mal sedado está acordado, sentindo, e sem como avisar. Monitorar TOF quando houver.": "NUNCA bloquear sin garantizar sedación y analgesia adecuadas — el paciente paralizado y mal sedado está despierto, sintiendo, y sin poder avisar. Monitorizar TOF cuando se disponga.",
  "Bradicardia vagal em criança < 5 anos: pré-medicar atropina 0,02 mg/kg (mín 0,1 mg).": "Bradicardia vagal en niño < 5 años: premedicar atropina 0,02 mg/kg (mín 0,1 mg).",
  "✅ ISR quando não há contraindicação — inclusive na anafilaxia/angioedema de via aérea (ver lib/doses-isr.ts).": "✅ ISR cuando no hay contraindicación — incluso en la anafilaxia/angioedema de vía aérea.",
  "SEM antídoto: a única saída é o tempo. Por isso o plano de resgate precisa estar pronto ANTES do bólus.": "SIN antídoto: la única salida es el tiempo. Por eso el plan de rescate debe estar listo ANTES del bolo.",
  "Indução (estável): 1,5–2 mg/kg IV — início 15–45 s.": "Inducción (estable): 1,5–2 mg/kg IV — inicio 15–45 s.",
  "Idoso ou reserva limitada: 1 mg/kg.": "Anciano o reserva limitada: 1 mg/kg.",
  "ISR no INSTÁVEL: EVITAR — hipotensão dose-dependente. Preferir cetamina 1 mg/kg (0,5 no choque grave) ou etomidato 0,3 mg/kg.": "ISR en el INESTABLE: EVITAR — hipotensión dosis-dependiente. Preferir ketamina 1 mg/kg (0,5 en el choque grave) o etomidato 0,3 mg/kg.",
  "⚠️ VIA — Dimorf 0,1 e 0,2 mg/mL são apresentações PERIDURAL/INTRATECAL, sem conservantes. NÃO usar para as doses IV deste módulo: 0,2 mg/mL por via IV é subdose de 50×, e a ampola de 10 mg/mL por via intratecal é catastrófica. Conferir a via impressa na ampola antes de aspirar.": "⚠️ VÍA — Dimorf 0,1 y 0,2 mg/mL son presentaciones PERIDURAL/INTRATECAL, sin conservantes. NO usar para las dosis IV de este módulo: 0,2 mg/mL por vía IV es subdosis de 50×, y la ampolla de 10 mg/mL por vía intratecal es catastrófica. Verificar la vía impresa en la ampolla antes de aspirar.",
  "25–50 mcg/h — procedimentos, pós-op simples": "25–50 mcg/h — procedimientos, posoperatorio simple",
  "NUNCA bloquear sem garantir sedação e analgesia adequadas — o paciente paralisado e mal sedado está acordado, sentindo, e sem como avisar. Monitorar TOF.":
    "NUNCA bloquear sin garantizar sedación y analgesia adecuadas — el paciente paralizado y mal sedado está despierto, sintiendo, y sin poder avisar. Monitorizar TOF.",
  "Infusões prolongadas podem atrasar o despertar por acúmulo e aumento da meia-vida contexto-sensível; não há um corte universal em 2–4 h. O efeito depende de duração, dose e fatores do paciente/doença crítica. Se recuperação rápida e previsível for prioridade, considerar remifentanil.": "Las infusiones prolongadas pueden retrasar el despertar por acumulación y aumento de la semivida sensible al contexto; no existe un punto de corte universal de 2–4 h. El efecto depende de la duración, la dosis y factores del paciente/la enfermedad crítica. Si una recuperación rápida y predecible es prioritaria, considerar remifentanilo.",
  "Meia-vida contexto-sensível aumenta progressivamente com a duração da infusão; em pacientes críticos, distribuição e depuração podem variar amplamente.": "La semivida sensible al contexto aumenta progresivamente con la duración de la infusión; en pacientes críticos, la distribución y la depuración pueden variar ampliamente.",
  "Rigidez torácica/laríngea (wooden chest) é rara, mas pode comprometer a ventilação; é favorecida por dose alta e administração IV rápida, porém também foi descrita com doses menores — não usar 5 mcg/kg como fronteira de segurança. Administrar bolus lentamente e reconhecer ventilação difícil súbita após fentanil.": "La rigidez torácica/laríngea (wooden chest) es rara, pero puede comprometer la ventilación; se favorece por dosis altas y administración IV rápida, aunque también se ha descrito con dosis menores — no usar 5 mcg/kg como frontera de seguridad. Administrar los bolos lentamente y reconocer la dificultad ventilatoria súbita tras fentanilo.",

  // ── Remifentanil em UTI · morfina e disfunção renal ──────────────────────
  "Frasco-ampola 2 mg (pó liofilizado)": "Frasco-ampolla 2 mg (polvo liofilizado)",
  "pó — concentração definida após diluição": "polvo — concentración definida después de la dilución",
  "50 mcg/mL · 1 fr (2 mg) + diluente q.s.p. 40 mL → 40 mL": "50 mcg/mL · 1 frasco (2 mg) + diluyente c.s.p. 40 mL → 40 mL",
  "20 mcg/mL · 1 fr (2 mg) + diluente q.s.p. 100 mL → 100 mL": "20 mcg/mL · 1 frasco (2 mg) + diluyente c.s.p. 100 mL → 100 mL",
  "Infusão contínua — UTI ventilada": "Infusión continua — UCI ventilada",
  "Faixa inicial recomendada em UTI": "Rango inicial recomendado en UCI",
  "0,10–0,15 mcg/kg/min; titular à analgesia e sedação": "0,10–0,15 mcg/kg/min; titular según analgesia y sedación",
  "Titulação antes de acrescentar sedativo": "Titulación antes de añadir un sedante",
  "Ajustar em incrementos de 0,025 mcg/kg/min, com intervalo mínimo de 5 min": "Ajustar en incrementos de 0,025 mcg/kg/min, con intervalo mínimo de 5 min",
  "Faixa típica descrita em bula para UTI": "Rango típico descrito en el prospecto para UCI",
  "0,006–0,74 mcg/kg/min; acima de 0,2, aumentos adicionais devem responder a necessidade de ANALGESIA, não substituir sedativo quando o alvo de sedação não foi atingido": "0,006–0,74 mcg/kg/min; por encima de 0,2, los aumentos adicionales deben responder a necesidad de ANALGESIA, no sustituir al sedante cuando no se alcanzó el objetivo de sedación",
  "Acima da faixa típica descrita em bula para UTI": "Por encima del rango típico descrito en el prospecto para UCI",
  "Reavaliar indicação, analgesia, sedação concomitante e efeitos hemodinâmicos; 0,74 mcg/kg/min é limite da faixa típica descrita, não fronteira farmacológica universal": "Reevaluar indicación, analgesia, sedación concomitante y efectos hemodinámicos; 0,74 mcg/kg/min es el límite del rango típico descrito, no una frontera farmacológica universal",
  "Opioide de ação ultracurta para analgosedação em paciente mecanicamente ventilado quando se deseja titulação rápida e despertar previsível.": "Opioide de acción ultracorta para analgosedación en el paciente con ventilación mecánica cuando se desea titulación rápida y despertar predecible.",
  "Metabolizado por esterases inespecíficas de sangue e tecidos; o efeito desaparece rapidamente após redução ou interrupção da infusão.": "Metabolizado por esterasas inespecíficas de sangre y tejidos; el efecto desaparece rápidamente tras reducir o interrumpir la infusión.",
  "Se a sedação estiver inadequada a 0,2 mcg/kg/min, adicionar/titular sedativo apropriado; aumentos posteriores de remifentanil devem responder à necessidade de analgesia adicional.": "Si la sedación es inadecuada a 0,2 mcg/kg/min, añadir/titular un sedante apropiado; los aumentos posteriores de remifentanilo deben responder a la necesidad de analgesia adicional.",
  "UTI: NÃO administrar em bolus. A bula brasileira recomenda infusão contínua, com ajuste em incrementos de 0,025 mcg/kg/min e intervalo mínimo de 5 min.": "UCI: NO administrar en bolo. El prospecto brasileño recomienda infusión continua, con ajustes en incrementos de 0,025 mcg/kg/min y un intervalo mínimo de 5 min.",
  "Bradicardia, hipotensão, depressão respiratória e rigidez muscular podem ocorrer; reduzir/interromper a infusão e oferecer suporte conforme a gravidade.": "Pueden ocurrir bradicardia, hipotensión, depresión respiratoria y rigidez muscular; reducir/interrumpir la infusión y brindar soporte según la gravedad.",
  "A interrupção da linha pode retirar analgesia em poucos minutos. Usar linha exclusiva ou de fluxo rápido próxima à cânula e vigiar obstrução/desconexão.": "La interrupción de la línea puede retirar la analgesia en pocos minutos. Usar una línea exclusiva o de flujo rápido próxima a la cánula y vigilar obstrucción/desconexión.",
  "ANTES de suspender, instituir analgesia alternativa com antecedência suficiente: não há atividade opioide residual clinicamente relevante cerca de 5–10 min após a descontinuação.": "ANTES de suspender, instaurar analgesia alternativa con suficiente antelación: no queda actividad opioide residual clínicamente relevante aproximadamente 5–10 min después de la suspensión.",
  "Insuficiência renal, inclusive terapia renal substitutiva: a bula não exige ajuste inicial específico; titular ao efeito e monitorar.": "Insuficiencia renal, incluso terapia renal sustitutiva: el prospecto no exige un ajuste inicial específico; titular al efecto y monitorizar.",
  "Insuficiência hepática: não há ajuste farmacocinético rotineiro, mas hepatopatia grave pode aumentar sensibilidade à depressão respiratória.": "Insuficiencia hepática: no hay ajuste farmacocinético rutinario, pero la hepatopatía grave puede aumentar la sensibilidad a la depresión respiratoria.",
  "A bula brasileira relata estudos controlados em UTI por até 3 dias e dados mais longos limitados; não transformar 3 dias em teto automático, mas reavaliar necessidade e estratégia em uso prolongado.": "El prospecto brasileño informa estudios controlados en UCI de hasta 3 días y datos más prolongados limitados; no convertir 3 días en un límite automático, sino reevaluar necesidad y estrategia en uso prolongado.",
  "Faixa típica de UTI na bula: 0,006–0,74 mcg/kg/min. Para procedimentos estimulantes em ventilados, foram usados valores médios de 0,25 e máximos de 0,75 mcg/kg/min — contexto procedural, não alvo basal de sedação.": "Rango típico de UCI en el prospecto: 0,006–0,74 mcg/kg/min. Para procedimientos estimulantes en pacientes ventilados se usaron valores medios de 0,25 y máximos de 0,75 mcg/kg/min — contexto procedimental, no objetivo basal de sedación.",
  "Em disfunção renal significativa, sobretudo no uso contínuo/prolongado, M3G/M6G podem acumular: reduzir dose e/ou alongar intervalo, ou preferir opioide sem metabólitos ativos relevantes como fentanil/remifentanil.": "En disfunción renal significativa, sobre todo con uso continuo/prolongado, M3G/M6G pueden acumularse: reducir la dosis y/o alargar el intervalo, o preferir un opioide sin metabolitos activos relevantes como fentanilo/remifentanilo.",
  "Disfunção renal: M3G/M6G acumulam e podem prolongar sedação/depressão respiratória; no uso contínuo ou prolongado, reduzir/intervalar ou preferir fentanil/remifentanil.": "Disfunción renal: M3G/M6G se acumulan y pueden prolongar la sedación/depresión respiratoria; con uso continuo o prolongado, reducir/espaciar o preferir fentanilo/remifentanilo.",
  // ── BNM/SDRA · SCCM 2026 ────────────────────────────────────────────────
  "Bloqueio contínuo na UTI deve ser reservado a indicação fisiológica clara, com sedação e analgesia adequadas; na SDRA, a SCCM 2026 sugere BNM quando P/F < 150 e há hipoxemia persistente e/ou metas ventilatórias não atingidas apesar da sedação.": "El bloqueo continuo en UCI debe reservarse para una indicación fisiológica clara, con sedación y analgesia adecuadas; en el SDRA, la SCCM 2026 sugiere BNM cuando P/F < 150 y persiste hipoxemia y/o no se alcanzan los objetivos ventilatorios pese a la sedación.",
  "Cisatracúrio é uma opção útil quando se escolhe bloqueio sustentado em UTI, especialmente quando a eliminação de Hofmann é vantajosa; não tratar nenhum BNM como escolha universal apenas pelo contexto de UTI.": "El cisatracurio es una opción útil cuando se elige bloqueo sostenido en UCI, especialmente cuando la eliminación de Hofmann es ventajosa; no tratar ningún BNM como elección universal solo por el contexto de UCI.",
  "ACURASYS: 37,5 mg/h × 48 h é um regime histórico de dose fixa. A SCCM 2026 aceita tanto estratégia fixa quanto estratégia titulada quando BNM é indicado na SDRA; não confundir protocolo estudado com obrigação universal.": "ACURASYS: 37,5 mg/h × 48 h es un régimen histórico de dosis fija. La SCCM 2026 acepta tanto estrategia fija como titulada cuando el BNM está indicado en el SDRA; no confundir un protocolo estudiado con una obligación universal.",
  "Garantir sedação e analgesia adequadas antes e durante o bloqueio — o paciente paralisado não consegue comunicar dor ou consciência. TOF/monitorização neuromuscular é especialmente útil quando a estratégia é titulada, mas a SCCM 2026 não estabelece TOF como obrigação universal em toda estratégia fixa de BNM na SDRA.": "Garantizar sedación y analgesia adecuadas antes y durante el bloqueo — el paciente paralizado no puede comunicar dolor ni consciencia. El TOF/monitorización neuromuscular es especialmente útil cuando la estrategia es titulada, pero la SCCM 2026 no establece el TOF como obligación universal en toda estrategia fija de BNM en el SDRA.",
  "✅ Opção de BNM sustentado em UTI quando há indicação; eliminação de Hofmann favorece seu uso quando disfunção renal/hepática torna outros agentes menos previsíveis.": "✅ Opción de BNM sostenido en UCI cuando existe indicación; la eliminación de Hofmann favorece su uso cuando la disfunción renal/hepática hace menos predecibles otros agentes.",
  "⚠️ EVIDÊNCIA ATUALIZADA — ACURASYS e ROSE produziram resultados diferentes. No ROSE, bloqueio precoce + sedação PROFUNDA foi comparado com cuidado usual SEM bloqueio de rotina e com sedação LEVE; o estudo foi interrompido por futilidade, com mortalidade em 90 dias semelhante e mais eventos adversos no braço bloqueado. A diretriz SCCM 2026 sugere BNM em adultos com SDRA e P/F < 150 quando persiste hipoxemia e/ou não se atingem metas de ventilação mecânica apesar da sedação; aceita estratégia fixa ou titulada. Portanto, não usar bloqueio contínuo por rotina apenas pelo diagnóstico de SDRA, nem exigir que todo caso replique o ACURASYS.": "⚠️ EVIDENCIA ACTUALIZADA — ACURASYS y ROSE produjeron resultados diferentes. En ROSE, bloqueo precoz + sedación PROFUNDA se comparó con cuidado habitual SIN bloqueo de rutina y con sedación LIGERA; el estudio se interrumpió por futilidad, con mortalidad a 90 días similar y más eventos adversos en el brazo bloqueado. La guía SCCM 2026 sugiere BNM en adultos con SDRA y P/F < 150 cuando persiste hipoxemia y/o no se alcanzan objetivos de ventilación mecánica pese a la sedación; acepta estrategia fija o titulada. Por tanto, no usar bloqueo continuo de rutina solo por el diagnóstico de SDRA ni exigir que todo caso replique ACURASYS.",

  // ── Atracúrio · laudanosina ─────────────────────────────────────────────
  "Laudanosina pode acumular em infusões prolongadas, com concentrações maiores em disfunção renal/hepática. Efeito excitatório/convulsões são demonstrados em animais; em humanos, relatos são raros e geralmente têm fatores predisponentes, e a contribuição causal da laudanosina permanece incerta. Titular à necessidade e limitar exposição desnecessária. Sem antídoto específico. Refrigerar (perde potência em 14 dias a 25 °C).": "La laudanosina puede acumularse con infusiones prolongadas, con concentraciones mayores en la disfunción renal/hepática. Los efectos excitatorios/convulsiones están demostrados en animales; en humanos, los informes son raros y suelen tener factores predisponentes, y la contribución causal de la laudanosina sigue siendo incierta. Titular según la necesidad y limitar la exposición innecesaria. Sin antídoto específico. Refrigerar (pierde potencia en 14 días a 25 °C).",

  "⚠️ REGRA DE OURO — antes de qualquer BNM: garantir hipnose/sedação e analgesia adequadas ao contexto clínico. Em UTI, documentar a meta de sedação e avaliar a profundidade quando possível; não transformar RASS −5 em pré-requisito universal. O paciente paralisado e mal sedado pode permanecer consciente, com dor e sem conseguir avisar.": "⚠️ REGLA DE ORO — antes de cualquier BNM: garantizar hipnosis/sedación y analgesia adecuadas al contexto clínico. En UCI, documentar la meta de sedación y evaluar la profundidad cuando sea posible; no convertir RASS −5 en un requisito universal. El paciente paralizado y mal sedado puede permanecer consciente, con dolor y sin poder avisar.",
  "Na SDRA, a SCCM 2026 sugere BNM quando PaO₂/FiO₂ < 150 e persiste hipoxemia e/ou não se atingem metas de ventilação mecânica apesar de analgesia/sedação adequadas; não usar bloqueio contínuo apenas pelo diagnóstico de SDRA. Outras indicações de BNM dependem do contexto, como procedimentos específicos, hipertensão intracraniana selecionada ou estado de mal refratário com monitorização eletroencefalográfica, porque a paralisia mascara atividade motora.": "En el SDRA, la SCCM 2026 sugiere BNM cuando PaO₂/FiO₂ < 150 y persiste hipoxemia y/o no se alcanzan las metas de ventilación mecánica pese a analgesia/sedación adecuadas; no usar bloqueo continuo solo por el diagnóstico de SDRA. Otras indicaciones de BNM dependen del contexto, como procedimientos específicos, hipertensión intracraneal seleccionada o estado epiléptico refractario con monitorización electroencefalográfica, porque la parálisis enmascara la actividad motora.",
  "Plano de retirada desde o início: reavaliar diariamente se a indicação persiste e interromper quando o objetivo fisiológico puder ser mantido sem bloqueio. Não usar PaO₂/FiO₂ > 150 como gatilho universal de suspensão.": "Plan de retirada desde el inicio: reevaluar a diario si la indicación persiste e interrumpir cuando el objetivo fisiológico pueda mantenerse sin bloqueo. No usar PaO₂/FiO₂ > 150 como disparador universal de suspensión.",
  "Opioide deve ser titulado à necessidade e integrado à analgesia multimodal. Doses intermitentes podem reduzir exposição quando a dor é episódica; infusão contínua pode ser apropriada quando a dor é persistente ou recorrente. Evitar transformar uma via de administração em regra universal.": "El opioide debe titularse según la necesidad e integrarse a la analgesia multimodal. Las dosis intermitentes pueden reducir la exposición cuando el dolor es episódico; la infusión continua puede ser apropiada cuando el dolor es persistente o recurrente. Evitar convertir una vía de administración en una regla universal.",
  "Antipsicótico não é tratamento rotineiro do delirium. O PADIS 2025 não estabelece recomendação a favor ou contra seu uso para tratar delirium; considerar uso individualizado e de curta duração apenas quando agitação perigosa ou sofrimento importante exigirem controle sintomático, após corrigir causas reversíveis e revisar risco de QT, efeitos extrapiramidais e interações.": "El antipsicótico no es tratamiento rutinario del delirium. PADIS 2025 no establece una recomendación a favor ni en contra de su uso para tratar delirium; considerar un uso individualizado y de corta duración solo cuando la agitación peligrosa o un sufrimiento importante exijan control sintomático, tras corregir causas reversibles y revisar riesgo de QT, efectos extrapiramidales e interacciones.",
  "Agitação perigosa exige contenção clínica imediata e ambiente monitorado. Se um antipsicótico for escolhido, individualizar fármaco, dose e repetição conforme idade, fragilidade, comorbidades, QT e resposta; não aplicar um esquema IV fixo universal como tratamento do delirium.": "La agitación peligrosa exige contención clínica inmediata y un entorno monitorizado. Si se elige un antipsicótico, individualizar fármaco, dosis y repetición según edad, fragilidad, comorbilidades, QT y respuesta; no aplicar un esquema IV fijo universal como tratamiento del delirium.",
  "⚠️ MgSO₄ pode potencializar e prolongar o bloqueio por rocurônio. Não aplicar redução percentual fixa universal: titular doses subsequentes à resposta clínica e neuromuscular e usar monitorização quantitativa/TOF quando disponível.": "⚠️ MgSO₄ puede potenciar y prolongar el bloqueo por rocuronio. No aplicar una reducción porcentual fija universal: titular las dosis posteriores según la respuesta clínica y neuromuscular y usar monitorización cuantitativa/TOF cuando esté disponible.",
  "Garantir hipnose/sedação + analgesia antes do bloqueio": "Garantizar hipnosis/sedación + analgesia antes del bloqueo",
  "Avaliar dor · titular ao efeito · usar analgesia multimodal": "Evaluar dolor · titular al efecto · usar analgesia multimodal",
  "Analgesia primeiro · definir RASS-alvo · sedação leve quando apropriada": "Analgesia primero · definir RASS objetivo · sedación ligera cuando sea apropiada",
  "Abrir segurança do BNM, monitorização, retirada e reversão": "Abrir seguridad del BNM, monitorización, retirada y reversión",
  "Indicação declarada · monitorização · plano de retirada": "Indicación declarada · monitorización · plan de retirada",
  "Abrir critérios de uso, monitorização neuromuscular e reversão": "Abrir criterios de uso, monitorización neuromuscular y reversión",
  "Abrir estratégia clínica": "Abrir estrategia clínica",
};
