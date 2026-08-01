/**
 * AVC (ACV) — dicionário PT → ES (espanhol latino-americano).
 * Terminologia: ACV, trombólisis, trombectomía, resangrado, clipaje, LCR.
 * Tokens de cálculo ({alteplaseDose}, {tnkDose}, {nihss}…) preservados.
 */
export const ES_AVC: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Reconhecimento — suspeita de AVC (FAST)": "Reconocimiento — sospecha de ACV (FAST)",
  "Tempo desde o início (último momento visto bem)": "Tiempo desde el inicio (última vez visto bien)",
  "TC de crânio SEM contraste — URGENTE": "TC de cráneo SIN contraste — URGENTE",
  "Resultado da TC de crânio": "Resultado de la TC de cráneo",
  "Dados para elegibilidade": "Datos para la elegibilidad",
  "Gravidade — NIHSS (0 a 42)": "Gravedad — NIHSS (0 a 42)",
  "Janela para trombólise intravenosa": "Ventana para trombólisis intravenosa",
  "Contraindicações à trombólise IV": "Contraindicaciones para la trombólisis IV",
  "Pressão arterial antes da trombólise": "Presión arterial antes de la trombólisis",
  "Reduzir a PA antes da trombólise": "Reducir la PA antes de la trombólisis",
  "Trombólise IV — dose calculada": "Trombólisis IV — dosis calculada",
  "Trombectomia mecânica (OGV)": "Trombectomía mecánica (OGV)",
  "Acionar trombectomia mecânica": "Activar la trombectomía mecánica",
  "Cuidados de suporte e antitrombóticos — AVC isquêmico":
    "Cuidados de soporte y antitrombóticos — ACV isquémico",
  "Unidade de AVC / UTI neurológica": "Unidad de ACV / UCI neurológica",
  "HIC — estabilização e controle pressórico": "HIC — estabilización y control tensional",
  "Reversão de anticoagulação": "Reversión de la anticoagulación",
  "Reversão por agente — EMERGÊNCIA": "Reversión según el agente — EMERGENCIA",
  "Manejo de PIC, convulsões e suporte": "Manejo de PIC, convulsiones y soporte",
  "Avaliação neurocirúrgica": "Evaluación neuroquirúrgica",
  "Neurocirurgia + UTI neurológica": "Neurocirugía + UCI neurológica",
  "HSA — diagnóstico e gravidade (Hunt-Hess / Fisher)":
    "HSA — diagnóstico y gravedad (Hunt-Hess / Fisher)",
  "HSA — nimodipino e tratamento do aneurisma": "HSA — nimodipino y tratamiento del aneurisma",
  "UTI neurológica + neurocirurgia/neurorradiologia":
    "UCI neurológica + neurocirugía/neurorradiología",
  "AVC Agudo": "ACV Agudo",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "O que a TC mostrou?": "¿Qué mostró la TC?",
  "O início foi há ≤ 4,5 horas (tempo bem definido)?":
    "¿El inicio fue hace ≤ 4,5 horas (tiempo bien definido)?",
  "Há alguma contraindicação ABSOLUTA à trombólise?":
    "¿Hay alguna contraindicación ABSOLUTA para la trombólisis?",
  "A PA está < 185/110 mmHg?": "¿La PA está < 185/110 mmHg?",
  "O paciente é candidato à trombectomia mecânica?":
    "¿El paciente es candidato a trombectomía mecánica?",
  "O paciente usa anticoagulante?": "¿El paciente usa anticoagulante?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Déficit neurológico focal súbito. Tempo é cérebro — ~1,9 milhão de neurônios/min. Agir em paralelo.":
    "Déficit neurológico focal súbito. El tiempo es cerebro — ~1,9 millones de neuronas/min. Actuar en paralelo.",
  "Meta porta-imagem ≤ 20–25 min. A TC define hemorrágico vs isquêmico.":
    "Meta puerta-imagen ≤ 20–25 min. La TC define hemorrágico vs isquémico.",
  "Janela atual: {janela} · NIHSS {nihss}.": "Ventana actual: {janela} · NIHSS {nihss}.",
  "PA informada: {pas}/{pad} mmHg.": "PA informada: {pas}/{pad} mmHg.",
  "Alvo < 185/110 mmHg para liberar o trombolítico.":
    "Objetivo < 185/110 mmHg para liberar el trombolítico.",
  "Iniciar o quanto antes (meta porta-agulha ≤ 60 min).":
    "Iniciar lo antes posible (meta puerta-aguja ≤ 60 min).",
  "NIHSS informado: {nihss}.": "NIHSS informado: {nihss}.",
  "A trombectomia não exclui a trombólise — fazer ambas se elegível (bridging).":
    "La trombectomía no excluye la trombólisis — hacer ambas si es elegible (terapia puente).",
  "Suporte + prevenção secundária precoce.": "Soporte + prevención secundaria precoz.",
  "Monitorização neurológica e investigação etiológica.":
    "Monitorización neurológica e investigación etiológica.",
  "Mortalidade 30–40% em 30 dias. NÃO trombolisar nem antiagregar. PA agressiva + reversão + neurocirurgia.":
    "Mortalidad 30–40% a 30 días. NO trombolizar ni antiagregar. Control tensional agresivo + reversión + neurocirugía.",
  "Reverter conforme o anticoagulante em uso. Alvo INR < 1,3.":
    "Revertir según el anticoagulante en uso. Objetivo INR < 1,3.",
  "Neuroproteção e prevenção de lesão secundária.":
    "Neuroprotección y prevención de la lesión secundaria.",
  "Acionar neurocirurgia; indicações são seletivas (STICH I/II negativos para hematoma profundo).":
    "Activar neurocirugía; las indicaciones son selectivas (STICH I/II negativos para hematoma profundo).",
  "Cuidado neurointensivo com controle pressórico contínuo.":
    "Cuidado neurointensivo con control tensional continuo.",
  "Cefaleia súbita intensa ('a pior da vida'). Pensar em aneurisma. NÃO trombolisar.":
    "Cefalea súbita intensa ('la peor de la vida'). Pensar en aneurisma. NO trombolizar.",
  "Nimodipino previne vasoespasmo (nível I). Obliterar o aneurisma em 24–72 h.":
    "El nimodipino previene el vasoespasmo (nivel I). Obliterar el aneurisma en 24–72 h.",
  "Cuidado neurointensivo com prevenção de ressangramento e vasoespasmo.":
    "Cuidado neurointensivo con prevención de resangrado y vasoespasmo.",

  // ── Campos e opções ────────────────────────────────────────────────────────
  "Janela de tempo (LKW)": "Ventana de tiempo (LKW)",
  "< 3 h": "< 3 h",
  "3–4,5 h": "3–4,5 h",
  "4,5–6 h": "4,5–6 h",
  "6–24 h": "6–24 h",
  "Desconhecido / ao acordar": "Desconocido / al despertar",
  "Sem hemorragia (isquêmico)": "Sin hemorragia (isquémico)",
  "Hemorragia intracerebral (HIC)": "Hemorragia intracerebral (HIC)",
  "Hemorragia subaracnóidea (HSA)": "Hemorragia subaracnoidea (HSA)",
  "PA sistólica": "PA sistólica",
  "PA diastólica": "PA diastólica",
  "Glicemia": "Glucemia",
  "Peso estimado": "Peso estimado",
  "NIHSS total": "NIHSS total",
  "Sim — ≤ 4,5 h": "Sí — ≤ 4,5 h",
  "Não / desconhecido (> 4,5 h)": "No / desconocido (> 4,5 h)",
  "Sem contraindicação": "Sin contraindicación",
  "Há contraindicação": "Hay contraindicación",
  "Sim — < 185/110": "Sí — < 185/110",
  "Não — ≥ 185/110": "No — ≥ 185/110",
  "Sim — oclusão de grande vaso": "Sí — oclusión de gran vaso",
  "Não / sem grande vaso": "No / sin gran vaso",
  "Sim — em anticoagulante": "Sí — con anticoagulante",
  "Não anticoagulado": "No anticoagulado",
  "Toque na janela de tempo. Define a elegibilidade para reperfusão.":
    "Toque la ventana de tiempo. Define la elegibilidad para la reperfusión.",
  "Toque nos valores (ou adicione o seu). Usados para PA, glicemia e cálculo de dose.":
    "Toque los valores (o agregue el suyo). Se usan para PA, glucemia y cálculo de dosis.",
  "Toque na pontuação. Interpretação: 0 sem déficit (investigar AIT) · 1–4 menor (trombólise + DAPT se elegível) · 5–15 moderado (trombólise + avaliar trombectomia) · 16–20 moderado-grave (trombólise + trombectomia preferencial) · 21–42 grave (trombectomia prioritária; avaliar prognóstico). Quanto maior, maior o déficit e o risco.":
    "Toque el puntaje. Interpretación: 0 sin déficit (investigar AIT) · 1–4 menor (trombólisis + DAPT si es elegible) · 5–15 moderado (trombólisis + evaluar trombectomía) · 16–20 moderado-grave (trombólisis + trombectomía preferente) · 21–42 grave (trombectomía prioritaria; evaluar pronóstico). A mayor puntaje, mayor déficit y riesgo.",

  // ── Evidência / ações ──────────────────────────────────────────────────────
  "Sem sangramento em quadro focal agudo = AVC isquêmico até prova em contrário.":
    "Sin sangrado en un cuadro focal agudo = ACV isquémico hasta demostrar lo contrario.",
  "Hemorragia intraparenquimatosa = HIC (hematoma no parênquima). NÃO trombolisar.":
    "Hemorragia intraparenquimatosa = HIC (hematoma en el parénquima). NO trombolizar.",
  "Sangue no espaço subaracnóideo (cisternas/sulcos) = HSA — pensar em aneurisma; cefaleia 'a pior da vida'.":
    "Sangre en el espacio subaracnoideo (cisternas/surcos) = HSA — pensar en aneurisma; cefalea 'la peor de la vida'.",
  "Trombólise IV até 4,5 h do início em pacientes elegíveis (ECASS III).":
    "Trombólisis IV hasta 4,5 h del inicio en pacientes elegibles (ECASS III).",
  "0–3 h: critérios padrão. 3–4,5 h: critérios adicionais (cautela se > 80 anos, NIHSS > 25, DM + AVC prévio, anticoagulante).":
    "0–3 h: criterios estándar. 3–4,5 h: criterios adicionales (precaución si > 80 años, NIHSS > 25, DM + ACV previo, anticoagulante).",
  "AHA/ASA 2026 — janela ESTENDIDA: 4,5–9 h do último-visto-bem, ou AVC ao acordar (até 9 h do ponto médio do sono), quando há mismatch em neuroimagem avançada (DWI-FLAIR ou perfusão).":
    "AHA/ASA 2026 — ventana EXTENDIDA: 4,5–9 h desde la última vez visto bien, o ACV al despertar (hasta 9 h desde el punto medio del sueño), cuando hay mismatch en neuroimagen avanzada (DWI-FLAIR o perfusión).",
  "AHA/ASA 2026: trombolisar déficit INCAPACITANTE na janela de 4,5 h independentemente do NIHSS. Déficit NÃO incapacitante (ex.: sintoma sensitivo isolado) não se beneficia — preferir dupla antiagregação.":
    "AHA/ASA 2026: trombolizar el déficit DISCAPACITANTE en la ventana de 4,5 h independientemente del NIHSS. El déficit NO discapacitante (p. ej., síntoma sensitivo aislado) no se beneficia — preferir doble antiagregación.",
  "Início desconhecido / ao acordar: considerar protocolo guiado por imagem (RM DWI-FLAIR) em centro especializado.":
    "Inicio desconocido / al despertar: considerar un protocolo guiado por imagen (RM DWI-FLAIR) en un centro especializado.",
  "Hemorragia na TC ou hipodensidade extensa (> 1/3 do território de ACM; ASPECTS ≤ 5 = risco hemorrágico alto).":
    "Hemorragia en la TC o hipodensidad extensa (> 1/3 del territorio de la ACM; ASPECTS ≤ 5 = riesgo hemorrágico alto).",
  "AVC isquêmico ou TCE grave nos últimos 3 meses; cirurgia intracraniana/espinhal recente.":
    "ACV isquémico o TCE grave en los últimos 3 meses; cirugía intracraneal/espinal reciente.",
  "História de hemorragia intracraniana; neoplasia/MAV/aneurisma intracraniano.":
    "Antecedente de hemorragia intracraneal; neoplasia/MAV/aneurisma intracraneal.",
  "Sangramento ativo; plaquetas < 100.000; INR > 1,7 / TTPa elevado; uso de DOAC nas últimas 48 h.":
    "Sangrado activo; plaquetas < 100.000; INR > 1,7 / TTPa elevado; uso de ACOD en las últimas 48 h.",
  "PA > 185/110 mmHg não controlável; glicemia < 50 mg/dL não corrigida.":
    "PA > 185/110 mmHg no controlable; glucemia < 50 mg/dL no corregida.",
  "Para trombolisar, a PA deve estar < 185/110 mmHg.":
    "Para trombolizar, la PA debe estar < 185/110 mmHg.",
  "Após a trombólise, manter < 180/105 mmHg por 24 horas.":
    "Tras la trombólisis, mantener < 180/105 mmHg durante 24 horas.",
  "Oclusão de grande vaso: ACI intracraniana, ACM (M1, M2) ou basilar à angio-TC/angio-RM.":
    "Oclusión de gran vaso: ACI intracraneal, ACM (M1, M2) o basilar en angio-TC/angio-RM.",
  "NIHSS ≥ 6, ASPECTS ≥ 6, independência funcional prévia (mRS 0–1).":
    "NIHSS ≥ 6, ASPECTS ≥ 6, independencia funcional previa (mRS 0–1).",
  "AHA/ASA 2026: elegibilidade AMPLIADA — inclui pacientes com core isquêmico maior; oclusão de BASILAR tem recomendação forte para trombectomia em até 24 h quando NIHSS ≥ 10.":
    "AHA/ASA 2026: elegibilidad AMPLIADA — incluye pacientes con core isquémico mayor; la oclusión BASILAR tiene recomendación fuerte para trombectomía hasta 24 h cuando el NIHSS ≥ 10.",
  "Até 6 h do início; entre 6–24 h apenas com critérios de mismatch por imagem (DAWN / DEFUSE-3).":
    "Hasta 6 h del inicio; entre 6–24 h solo con criterios de mismatch por imagen (DAWN / DEFUSE-3).",
  "Trombectomia + trombólise quando ambos elegíveis (bridging — NÃO substituir uma pela outra).":
    "Trombectomía + trombólisis cuando ambas son elegibles (terapia puente — NO sustituir una por la otra).",
  "Reversão é EMERGÊNCIA na HIC — quanto antes, menor a expansão do hematoma.":
    "La reversión es una EMERGENCIA en la HIC — cuanto antes, menor la expansión del hematoma.",
  "Identificar o agente define o reversor específico.":
    "Identificar el agente define el reversor específico.",
  "FAST: Face (assimetria), Arms (queda do braço), Speech (fala arrastada/afasia), Time (registrar a hora do último momento visto bem — LKW).":
    "FAST: Face (asimetría facial), Arms (caída del brazo), Speech (habla arrastrada/afasia), Time (registrar la hora de la última vez visto bien — LKW).",
  "Acionar o CÓDIGO AVC e a equipe de neurologia/imagem imediatamente.":
    "Activar el CÓDIGO ACV y al equipo de neurología/imagen de inmediato.",
  "ABC: O₂ apenas se SpO₂ < 94%, monitor, ECG, 2 acessos venosos.":
    "ABC: O₂ solo si SpO₂ < 94%, monitor, ECG, 2 accesos venosos.",
  "Glicemia capilar AGORA (alvo 60–180) — tratar se < 60 mg/dL (hipoglicemia simula AVC).":
    "Glucemia capilar AHORA (objetivo 60–180) — tratar si < 60 mg/dL (la hipoglucemia simula un ACV).",
  "Coletar labs: HMG, coagulograma (INR, TTPa), eletrólitos, função renal, troponina. NIHSS basal.":
    "Tomar laboratorio: hemograma, coagulación (INR, TTPa), electrolitos, función renal, troponina. NIHSS basal.",
  "TC de crânio sem contraste imediatamente (exclui hemorragia). Não atrasar por outros exames.":
    "TC de cráneo sin contraste de inmediato (excluye hemorragia). No retrasar por otros exámenes.",
  "AngioTC + TC de perfusão se suspeita de oclusão de grande vaso (OGV) ou janela estendida (6–24 h).":
    "AngioTC + TC de perfusión si se sospecha oclusión de gran vaso (OGV) o ventana extendida (6–24 h).",
  "Aferir PA nos dois braços; ECG de 12 derivações.":
    "Medir la PA en ambos brazos; ECG de 12 derivaciones.",
  "Aplicar a escala NIHSS para quantificar o déficit (interpretação no próximo passo).":
    "Aplicar la escala NIHSS para cuantificar el déficit (interpretación en el siguiente paso).",
  "Reaferir a PA — só liberar a trombólise com PA < 185/110 mmHg.":
    "Volver a medir la PA — liberar la trombólisis solo con PA < 185/110 mmHg.",
  "Se a PA não baixar de forma sustentada, não trombolisar.":
    "Si la PA no baja de forma sostenida, no trombolizar.",
  "Alteplase: dose total {alteplaseDose} mg (0,9 mg/kg, máx 90 mg) — {alteplaseBolus} mg em bolus em 1 min (10%) + {alteplaseInfusao} mg em infusão por 60 min.":
    "Alteplasa: dosis total {alteplaseDose} mg (0,9 mg/kg, máx 90 mg) — {alteplaseBolus} mg en bolo en 1 min (10%) + {alteplaseInfusao} mg en infusión durante 60 min.",
  "Tenecteplase {tnkDose} mg IV em BOLUS ÚNICO (0,25 mg/kg, máx 25 mg) — AHA/ASA 2026 endossa alteplase OU tenecteplase na janela de 4,5 h; o bolus único simplifica a administração e é prático como ponte pré-trombectomia.":
    "Tenecteplasa {tnkDose} mg IV en BOLO ÚNICO (0,25 mg/kg, máx 25 mg) — AHA/ASA 2026 avala alteplasa O tenecteplasa en la ventana de 4,5 h; el bolo único simplifica la administración y es práctico como puente pre-trombectomía.",
  "Monitorização pós-trombólise (24 h): PA < 180/105, glicemia 140–180, temperatura ≤ 37,5 °C, SpO₂ ≥ 94%. TC de controle em 24 h.":
    "Monitorización pos-trombólisis (24 h): PA < 180/105, glucemia 140–180, temperatura ≤ 37,5 °C, SpO₂ ≥ 94%. TC de control a las 24 h.",
  "AHA/ASA 2026: NÃO baixar a PAS de forma intensiva para < 140 mmHg, mesmo após reperfusão completa — não melhora desfecho e pode causar dano.":
    "AHA/ASA 2026: NO bajar la PAS de forma intensiva a < 140 mmHg, incluso tras una reperfusión completa — no mejora el desenlace y puede causar daño.",
  "SEM antiagregante/anticoagulante/punções por 24 h. Deterioração/cefaleia/vômito → suspender e TC (suspeita de hemorragia).":
    "SIN antiagregante/anticoagulante/punciones durante 24 h. Deterioro/cefalea/vómito → suspender y TC (sospecha de hemorragia).",
  "Confirmar oclusão de grande vaso com angio-TC / angio-RM.":
    "Confirmar la oclusión de gran vaso con angio-TC / angio-RM.",
  "Acionar a neurorradiologia intervencionista IMEDIATAMENTE.":
    "Activar la neurorradiología intervencionista DE INMEDIATO.",
  "Transferir para centro com capacidade de trombectomia se necessário — não atrasar.":
    "Trasladar a un centro con capacidad de trombectomía si es necesario — no retrasar.",
  "Manter PA < 180/105 mmHg; reavaliar NIHSS continuamente.":
    "Mantener PA < 180/105 mmHg; reevaluar el NIHSS continuamente.",
  "PA permissiva: se NÃO trombolisou, tratar apenas se > 220/120 mmHg (reduzir ~15% nas primeiras 24 h). Pós-trombólise: < 180/105.":
    "PA permisiva: si NO se trombolizó, tratar solo si > 220/120 mmHg (reducir ~15% en las primeras 24 h). Pos-trombólisis: < 180/105.",
  "Antiagregante: AAS 160–325 mg em 24–48 h (após 24 h e TC sem hemorragia se houve trombólise).":
    "Antiagregante: AAS 160–325 mg en 24–48 h (tras 24 h y TC sin hemorragia si hubo trombólisis).",
  "AVC minor (NIHSS ≤ 3) ou AIT de alto risco: DAPT AAS + clopidogrel por 21 dias (POINT/CHANCE). FA: anticoagular em 4–14 dias.":
    "ACV menor (NIHSS ≤ 3) o AIT de alto riesgo: DAPT AAS + clopidogrel durante 21 días (POINT/CHANCE). FA: anticoagular en 4–14 días.",
  "Glicemia 140–180; normotermia (≤ 37,5); rastrear disfagia antes da via oral; profilaxia de TVP (compressão pneumática).":
    "Glucemia 140–180; normotermia (≤ 37,5); cribar disfagia antes de la vía oral; profilaxis de TVP (compresión neumática).",
  "Investigar etiologia: carótidas, ECG/Holter, ecocardiograma. PA-alvo de prevenção após 24 h: < 130/80.":
    "Investigar la etiología: carótidas, ECG/Holter, ecocardiograma. PA objetivo de prevención tras 24 h: < 130/80.",
  "Estabilizar: ABC, GCS, NIHSS. Cabeceira 30°. 2 acessos calibrosos. Labs: HMG, coagulograma (TP/TTPa/INR), plaquetas, função renal/hepática, tipagem, toxicológico (< 50 anos).":
    "Estabilizar: ABC, GCS, NIHSS. Cabecera a 30°. 2 accesos gruesos. Laboratorio: hemograma, coagulación (TP/TTPa/INR), plaquetas, función renal/hepática, tipificación, toxicológico (< 50 años).",
  "Volume do hematoma (ABC/2 = A × B × C / 2, em cm): > 30 mL = maior mortalidade; > 60 mL hemisférico ou > 20 mL fossa posterior = prognóstico grave. Avaliar extensão intraventricular (SIV).":
    "Volumen del hematoma (ABC/2 = A × B × C / 2, en cm): > 30 mL = mayor mortalidad; > 60 mL hemisférico o > 20 mL en fosa posterior = pronóstico grave. Evaluar la extensión intraventricular.",
  "CONTROLE PRESSÓRICO (AHA/ASA 2022): se PAS 150–220 → reduzir para alvo 140 mmHg em 1 h (INTERACT2/ATACH-2). NÃO reduzir abaixo de 130 nas primeiras 24 h. PAS > 220 → redução IV guiada por cateter arterial.":
    "CONTROL TENSIONAL (AHA/ASA 2022): si PAS 150–220 → reducir a un objetivo de 140 mmHg en 1 h (INTERACT2/ATACH-2). NO reducir por debajo de 130 en las primeras 24 h. PAS > 220 → reducción IV guiada por catéter arterial.",
  "AngioTC se jovem, sem HAS ou com 'spot sign' (prediz expansão do hematoma).":
    "AngioTC si es joven, sin HTA o con 'spot sign' (predice expansión del hematoma).",
  "Warfarina/AVK: Vitamina K 10 mg IV + complexo protrombínico (CCP) 4 fatores 25–50 UI/kg IV → alvo INR < 1,3 em 1–2 h.":
    "Warfarina/AVK: Vitamina K 10 mg IV + concentrado de complejo protrombínico (CCP) de 4 factores 25–50 UI/kg IV → objetivo INR < 1,3 en 1–2 h.",
  "Heparina não fracionada (HNF): sulfato de protamina 1 mg / 100 UI de heparina (máx 50 mg).":
    "Heparina no fraccionada (HNF): sulfato de protamina 1 mg / 100 UI de heparina (máx 50 mg).",
  "Dabigatrana: idarucizumabe (Praxbind®) 5 g IV (2 × 2,5 g).":
    "Dabigatrán: idarucizumab (Praxbind®) 5 g IV (2 × 2,5 g).",
  "Rivaroxabana / Apixabana / Edoxabana (anti-Xa): andexanet alfa OU CCP 4 fatores 50 UI/kg IV.":
    "Rivaroxabán / Apixabán / Edoxabán (anti-Xa): andexanet alfa O CCP de 4 factores 50 UI/kg IV.",
  "Suspender o anticoagulante; reavaliar coagulação após a reversão.":
    "Suspender el anticoagulante; reevaluar la coagulación tras la reversión.",
  "Sinais de hipertensão intracraniana: osmoterapia — manitol 20% 0,5–1 g/kg IV em 20 min OU SF 3% 150 mL. Alvo osmolalidade 300–320 mOsm/L; evitar hiponatremia.":
    "Signos de hipertensión intracraneal: osmoterapia — manitol 20% 0,5–1 g/kg IV en 20 min O SF 3% 150 mL. Objetivo de osmolalidad 300–320 mOsm/L; evitar la hiponatremia.",
  "Convulsões CLÍNICAS: tratar imediatamente (levetiracetam, lacosamida ou fenitoína). Profilaxia anticonvulsivante de rotina NÃO é recomendada (AHA/ASA 2022).":
    "Convulsiones CLÍNICAS: tratar de inmediato (levetiracetam, lacosamida o fenitoína). La profilaxis anticonvulsiva de rutina NO se recomienda (AHA/ASA 2022).",
  "Glicemia 140–180; normotermia (≤ 37,5); cabeceira 30°; evitar hipotensão e hipóxia.":
    "Glucemia 140–180; normotermia (≤ 37,5); cabecera a 30°; evitar la hipotensión y la hipoxia.",
  "Profilaxia de TEV: meia elástica/compressão; heparina SC apenas após 24–48 h de estabilidade imagiológica.":
    "Profilaxis de ETV: medias de compresión; heparina SC solo tras 24–48 h de estabilidad imagenológica.",
  "INDICADA: HIC cerebelar > 3 cm com deterioração ou hidrocefalia; hematoma lobar superficial com deterioração neurológica; DVE (derivação ventricular externa) para hidrocefalia aguda por sangue intraventricular.":
    "INDICADA: HIC cerebelosa > 3 cm con deterioro o hidrocefalia; hematoma lobar superficial con deterioro neurológico; DVE (derivación ventricular externa) para hidrocefalia aguda por sangre intraventricular.",
  "SEM benefício: hematoma profundo (tálamo/putâmen) sem deterioração — STICH I e II negativos.":
    "SIN beneficio: hematoma profundo (tálamo/putamen) sin deterioro — STICH I y II negativos.",
  "Acionar neurocirurgia para avaliação à beira leito; repetir TC se deterioração.":
    "Activar neurocirugía para evaluación a pie de cama; repetir la TC si hay deterioro.",
  "Reavaliar continuamente o nível de consciência e o efeito de massa.":
    "Reevaluar continuamente el nivel de conciencia y el efecto de masa.",
  "Diagnóstico: TC sem contraste (sensibilidade ~98% nas primeiras 6 h). TC negativa com alta suspeita → punção lombar (xantocromia). AngioTC/arteriografia para localizar o aneurisma.":
    "Diagnóstico: TC sin contraste (sensibilidad ~98% en las primeras 6 h). TC negativa con alta sospecha → punción lumbar (xantocromía). AngioTC/arteriografía para localizar el aneurisma.",
  "Hunt-Hess (gravidade clínica): I assintomático/cefaleia leve (~1%) · II cefaleia intensa + rigidez nucal, sem déficit (~5%) · III sonolência/confusão/déficit leve (~15%) · IV estupor/hemiplegia/descerebração (~40%) · V coma (~70–80%).":
    "Hunt-Hess (gravedad clínica): I asintomático/cefalea leve (~1%) · II cefalea intensa + rigidez de nuca, sin déficit (~5%) · III somnolencia/confusión/déficit leve (~15%) · IV estupor/hemiplejía/descerebración (~40%) · V coma (~70–80%).",
  "Fisher modificada (risco de vasoespasmo): 1 sem sangue (~24%) · 2 HSA fina (~33%) · 3 HSA espessa (~33%) · 4 HSA com sangue intraventricular (~40%).":
    "Fisher modificada (riesgo de vasoespasmo): 1 sin sangre (~24%) · 2 HSA fina (~33%) · 3 HSA espesa (~33%) · 4 HSA con sangre intraventricular (~40%).",
  "Estabilizar: ABC, cabeceira 30°, 2 acessos, controle da PA, analgesia. Manter EUVOLEMIA (hipovolemia predispõe vasoespasmo).":
    "Estabilizar: ABC, cabecera a 30°, 2 accesos, control de la PA, analgesia. Mantener EUVOLEMIA (la hipovolemia predispone al vasoespasmo).",
  "NIMODIPINO 60 mg VO a cada 4 h por 21 dias (nível I, AHA/ASA 2023) — reduz o déficit isquêmico tardio por vasoespasmo. Vigiar hipotensão.":
    "NIMODIPINO 60 mg VO cada 4 h durante 21 días (nivel I, AHA/ASA 2023) — reduce el déficit isquémico tardío por vasoespasmo. Vigilar la hipotensión.",
  "Tratamento do aneurisma: clipagem cirúrgica × coiling endovascular — decisão multidisciplinar (neurocirurgia + neurorradiologia). Obliterar nas primeiras 24–72 h para evitar ressangramento.":
    "Tratamiento del aneurisma: clipaje quirúrgico vs. coiling endovascular — decisión multidisciplinaria (neurocirugía + neurorradiología). Obliterar en las primeras 24–72 h para evitar el resangrado.",
  "Cuidados gerais: euvolemia, evitar hipóxia/hipotermia/hipotensão. Estatina de rotina NÃO recomendada na HSA.":
    "Cuidados generales: euvolemia, evitar hipoxia/hipotermia/hipotensión. La estatina de rutina NO se recomienda en la HSA.",
  "Vigiar vasoespasmo (déficit isquêmico tardio), hidrocefalia (DVE se necessário) e hiponatremia.":
    "Vigilar el vasoespasmo (déficit isquémico tardío), la hidrocefalia (DVE si es necesario) y la hiponatremia.",
  "Internar em unidade de AVC ou UTI com NIHSS seriado.":
    "Ingresar en unidad de ACV o UCI con NIHSS seriado.",
  "Metas: glicemia 140–180, temperatura ≤ 37,5, SpO₂ ≥ 94%, PaCO₂ 35–45 (se intubado), Na⁺ 135–145, cabeceira 30°.":
    "Metas: glucemia 140–180, temperatura ≤ 37,5, SpO₂ ≥ 94%, PaCO₂ 35–45 (si está intubado), Na⁺ 135–145, cabecera a 30°.",
  "TC de controle em 24 h (obrigatória após trombólise) antes de antiagregar.":
    "TC de control a las 24 h (obligatoria tras la trombólisis) antes de antiagregar.",
  "Investigar etiologia e iniciar prevenção secundária (antitrombótico, estatina, controle de PA < 130/80).":
    "Investigar la etiología e iniciar la prevención secundaria (antitrombótico, estatina, control de PA < 130/80).",
  "UTI / unidade de AVC com monitorização neurológica seriada (GCS, pupilas).":
    "UCI / unidad de ACV con monitorización neurológica seriada (GCS, pupilas).",
  "Metas: PAS ~140 (não < 130 nas 24 h), glicemia 140–180, temperatura ≤ 37,5, Na⁺ 135–145, cabeceira 30°, osmolalidade 300–320 com osmoterapia.":
    "Metas: PAS ~140 (no < 130 en las 24 h), glucemia 140–180, temperatura ≤ 37,5, Na⁺ 135–145, cabecera a 30°, osmolalidad 300–320 con osmoterapia.",
  "Controle contínuo da PA e da coagulação; TC de controle se deterioração.":
    "Control continuo de la PA y de la coagulación; TC de control si hay deterioro.",
  "Avaliação neurocirúrgica conforme indicação; profilaxia de TEV após 24–48 h.":
    "Evaluación neuroquirúrgica según indicación; profilaxis de ETV tras 24–48 h.",
  "UTI neurológica com monitorização seriada (GCS, déficit focal, sinais de vasoespasmo).":
    "UCI neurológica con monitorización seriada (GCS, déficit focal, signos de vasoespasmo).",
  "Tratamento precoce do aneurisma (24–72 h); nimodipino 21 dias.":
    "Tratamiento precoz del aneurisma (24–72 h); nimodipino durante 21 días.",
  "Metas: euvolemia, Na⁺ 135–145, glicemia 140–180, temperatura ≤ 37,5, cabeceira 30°.":
    "Metas: euvolemia, Na⁺ 135–145, glucemia 140–180, temperatura ≤ 37,5, cabecera a 30°.",
  "Acionar neurocirurgia/neurorradiologia para clipagem ou coiling.":
    "Activar neurocirugía/neurorradiología para clipaje o coiling.",
  "0 · sem déficit":
    "0 · sin déficit",
  "1–4 · menor":
    "1–4 · menor",
  "5–15 · moderado":
    "5–15 · moderado",
  "16–20 · mod. grave":
    "16–20 · mod. grave",
  "21–42 · grave":
    "21–42 · grave",
  "Escore exato":
    "Puntaje exacto",
  "Confirmar":
    "Confirmar",
  "O NIHSS é um exame de 15 itens, não uma estimativa — se ainda não foi pontuado, use a calculadora de NIHSS do app (Calculadoras clínicas), que traz item por item, e volte com o total. Os atalhos abaixo são REFERÊNCIAS DE FAIXA, para quando o total já é conhecido: cada um marca o meio da sua faixa, não o seu escore. Tendo o número exato, arraste a barra ou use \"Outro…\".":
    "El NIHSS es un examen de 15 ítems, no una estimación — si aún no fue puntuado, use la calculadora de NIHSS de la app (Calculadoras clínicas), que lo trae ítem por ítem, y vuelva con el total. Los atajos de abajo son REFERENCIAS DE RANGO, para cuando el total ya se conoce: cada uno marca el medio de su rango, no su puntaje. Con el número exacto, arrastre la barra.",
  "METOPROLOL IV (1ª linha no Brasil): 5 mg a cada 10 min, a 1 mg/min, máximo 20 mg. Ampola de 5 mL com 1 mg/mL.":
    "METOPROLOL IV (1.ª línea en Brasil): 5 mg cada 10 min, a 1 mg/min, máximo 20 mg. Ampolla de 5 mL con 1 mg/mL.",
  "OU ESMOLOL IV: 500 mcg/kg/min em 1 min → 50 mcg/kg/min por 4 min. Se a PA seguir inadequada, repetir o bólus de 500 mcg/kg/min e subir a manutenção para 100, depois 150, depois 200 mcg/kg/min (máximo). Atingido o alvo, manter em infusão contínua.":
    "O ESMOLOL IV: 500 mcg/kg/min en 1 min → 50 mcg/kg/min por 4 min. Si la PA sigue inadecuada, repetir el bolo de 500 mcg/kg/min y subir el mantenimiento a 100, luego 150, luego 200 mcg/kg/min (máximo). Alcanzado el objetivo, mantener en infusión continua.",
  "NITROPRUSSIATO DE SÓDIO 0,5–8 mcg/kg/min, com reajuste a cada 10 min — indicado quando o betabloqueador está contraindicado (asma, insuficiência cardíaca, anormalidade grave da função cardíaca) ou quando a hipertensão não cede.":
    "NITROPRUSIATO DE SODIO 0,5–8 mcg/kg/min, con reajuste cada 10 min — indicado cuando el betabloqueante está contraindicado (asma, insuficiencia cardíaca, anormalidad grave de la función cardíaca) o cuando la hipertensión no cede.",
  "⚠️ Labetalol, nicardipino e clevidipino são as escolhas da AHA, mas NÃO têm apresentação intravenosa comercializada no Brasil. A diretriz brasileira (SBDCV) trabalha com metoprolol, esmolol e nitroprussiato — é o que existe à beira do leito aqui.":
    "⚠️ Labetalol, nicardipino y clevidipino son las opciones de la AHA, pero NO tienen presentación intravenosa comercializada en Brasil. La directriz brasileña (SBDCV) trabaja con metoprolol, esmolol y nitroprusiato — es lo que existe a pie de cama allí. Verifique la disponibilidad en su país.",
  "NÃO usar nitrato sublingual.":
    "NO usar nitrato sublingual.",
  "Fármacos NO BRASIL: metoprolol IV ou esmolol IV; nitroprussiato de sódio quando o betabloqueador estiver contraindicado ou a PA não ceder. Labetalol, nicardipino e clevidipino IV — as escolhas citadas pela AHA — não têm apresentação intravenosa comercializada no país.":
    "Fármacos EN BRASIL: metoprolol IV o esmolol IV; nitroprusiato de sodio cuando el betabloqueante esté contraindicado o la PA no ceda. Labetalol, nicardipino y clevidipino IV — las opciones citadas por la AHA — no tienen presentación intravenosa comercializada en el país.",
};
