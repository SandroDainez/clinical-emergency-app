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
  "ISR: 1–1,5 mg/kg IV em bólus ultrarrápido (2 mg/kg em obeso). TETO 200 mg.": "ISR: 1–1,5 mg/kg IV en bolo ultrarrápido (2 mg/kg en obeso). TECHO 200 mg.",
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
};
