/**
 * TEP — Tromboembolia Pulmonar — dicionário PT → ES.
 * Terminologia: EP/TEP, angioTC, dímero D, trombólisis, ACOD (NOAC),
 * HBPM/HNF, PERT, HPTEC. Tokens de dose por peso preservados.
 */
export const ES_TEP: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Suspeita de TEP — reconhecimento": "Sospecha de TEP — reconocimiento",
  "Dados iniciais": "Datos iniciales",
  "Estabilidade hemodinâmica": "Estabilidad hemodinámica",
  "TEP alto risco — suporte + anticoagulação imediata":
    "TEP de alto riesgo — soporte + anticoagulación inmediata",
  "Confirmação diagnóstica rápida": "Confirmación diagnóstica rápida",
  "Trombólise sistêmica — contraindicações": "Trombólisis sistémica — contraindicaciones",
  "Trombólise sistêmica — dose": "Trombólisis sistémica — dosis",
  "Alternativas à trombólise — alto risco": "Alternativas a la trombólisis — alto riesgo",
  "Probabilidade pré-teste — Wells": "Probabilidad pretest — Wells",
  "D-dímero": "Dímero D",
  "AngioTC de tórax": "AngioTC de tórax",
  "TEP excluído": "TEP excluido",
  "Estratificação de risco (ESC 2019 · categorias AHA/ACC 2026)":
    "Estratificación del riesgo (ESC 2019 · categorías AHA/ACC 2026)",
  "Intermediário-alto — anticoagulação plena + vigilância":
    "Intermedio-alto — anticoagulación plena + vigilancia",
  "Baixo risco — tratamento ambulatorial?": "Bajo riesgo — ¿tratamiento ambulatorio?",
  "Anticoagulação — escolha do agente": "Anticoagulación — elección del agente",
  "Anticoagulação ambulatorial — baixo risco": "Anticoagulación ambulatoria — bajo riesgo",
  "UTI — TEP de alto risco / intermediário-alto":
    "UCI — TEP de alto riesgo / intermedio-alto",
  "Internação — risco intermediário-baixo": "Internación — riesgo intermedio-bajo",
  "Alta precoce / tratamento ambulatorial": "Alta precoz / tratamiento ambulatorio",
  "Tromboembolia Pulmonar": "Tromboembolia Pulmonar",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "Há instabilidade hemodinâmica (choque ou hipotensão)?":
    "¿Hay inestabilidad hemodinámica (choque o hipotensión)?",
  "Há contraindicação ABSOLUTA à trombólise?":
    "¿Hay alguna contraindicación ABSOLUTA para la trombólisis?",
  "Qual a probabilidade pré-teste pelo escore de Wells?":
    "¿Cuál es la probabilidad pretest según la escala de Wells?",
  "O D-dímero é positivo (acima do corte)?":
    "¿El dímero D es positivo (por encima del punto de corte)?",
  "A AngioTC confirmou o TEP?": "¿La angioTC confirmó el TEP?",
  "Qual a categoria de risco (disfunção de VD + biomarcadores + sPESI)?":
    "¿Cuál es la categoría de riesgo (disfunción del VD + biomarcadores + sPESI)?",
  "O paciente preenche TODOS os critérios para alta precoce/ambulatorial?":
    "¿El paciente cumple TODOS los criterios para el alta precoz/ambulatoria?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "3ª causa de doença cardiovascular aguda. Mortalidade 1–3% (baixo risco) a 15–65% (maciço com choque).":
    "3.ª causa de enfermedad cardiovascular aguda. Mortalidad del 1–3% (bajo riesgo) al 15–65% (masivo con choque).",
  "PAS informada: {pas} mmHg · FC {fc}.": "PAS informada: {pas} mmHg · FC {fc}.",
  "Emergência com risco de morte. Suporte hemodinâmico cauteloso + HNF JÁ.":
    "Emergencia con riesgo de muerte. Soporte hemodinámico cauteloso + heparina no fraccionada YA.",
  "Confirmar sem atrasar a reperfusão.": "Confirmar sin retrasar la reperfusión.",
  "Suspender a HNF durante a infusão de alteplase; reiniciar SEM bolus quando TTPa < 80 s.":
    "Suspender la heparina no fraccionada durante la infusión de alteplasa; reiniciarla SIN bolo cuando el TTPa < 80 s.",
  "Contraindicação à trombólise ou falha — reperfusão mecânica.":
    "Contraindicación para la trombólisis o fracaso de esta — reperfusión mecánica.",
  "D-dímero negativo em baixa probabilidade ou AngioTC negativa excluem TEP com segurança.":
    "Un dímero D negativo con probabilidad baja o una angioTC negativa excluyen el TEP con seguridad.",
  "Anticoagulação plena + monitorização intensiva; trombólise de resgate se deteriorar.":
    "Anticoagulación plena + monitorización intensiva; trombólisis de rescate si se deteriora.",
  "Iniciar IMEDIATAMENTE. NOACs são preferidos (ESC 2019 — Classe I).":
    "Iniciar DE INMEDIATO. Los anticoagulantes orales directos son preferidos (ESC 2019 — Clase I).",
  "NOAC oral é ideal para alta precoce (sem necessidade de parenteral).":
    "El anticoagulante oral directo es ideal para el alta precoz (sin necesidad de vía parenteral).",
  "Monitorização intensiva e vigilância de deterioração.":
    "Monitorización intensiva y vigilancia del deterioro.",
  "Anticoagulação plena com vigilância clínica.":
    "Anticoagulación plena con vigilancia clínica.",
  "Baixo risco selecionado — reduz custos sem aumentar mortalidade (HOME-PE).":
    "Bajo riesgo seleccionado — reduce costos sin aumentar la mortalidad (HOME-PE).",

  // ── Campos e opções ────────────────────────────────────────────────────────
  "PA sistólica": "PA sistólica",
  "Frequência cardíaca": "Frecuencia cardíaca",
  "Peso estimado": "Peso estimado",
  "Instável — choque/hipotensão (alto risco)":
    "Inestable — choque/hipotensión (alto riesgo)",
  "Estável": "Estable",
  "Sem contraindicação absoluta": "Sin contraindicación absoluta",
  "Há contraindicação absoluta": "Hay contraindicación absoluta",
  "Wells ≤ 4 — TEP improvável": "Wells ≤ 4 — TEP improbable",
  "Wells > 4 — TEP provável": "Wells > 4 — TEP probable",
  "Negativo — abaixo do corte": "Negativo — por debajo del punto de corte",
  "Positivo — acima do corte": "Positivo — por encima del punto de corte",
  "Sim — TEP confirmado": "Sí — TEP confirmado",
  "Não — TEP excluído": "No — TEP excluido",
  "Intermediário-alto (VD + biomarcadores)": "Intermedio-alto (VD + biomarcadores)",
  "Intermediário-baixo": "Intermedio-bajo",
  "Baixo risco (sPESI = 0)": "Bajo riesgo (sPESI = 0)",
  "Sim — elegível a ambulatorial": "Sí — elegible para tratamiento ambulatorio",
  "Não — internar": "No — internar",
  "Toque nos valores (ou adicione). PAS define a estabilidade; o peso calcula as doses.":
    "Toque los valores (o agréguelos). La PAS define la estabilidad; el peso calcula las dosis.",

  // ── Evidência ──────────────────────────────────────────────────────────────
  "ALTO RISCO (maciço) = PAS < 90 mmHg ou queda ≥ 40 mmHg por > 15 min, ou necessidade de vasopressor — mortalidade > 15%.":
    "ALTO RIESGO (masivo) = PAS < 90 mmHg o caída ≥ 40 mmHg durante > 15 min, o necesidad de vasopresor — mortalidad > 15%.",
  "Se instável: iniciar anticoagulação com HNF e considerar trombólise IMEDIATAMENTE — não aguardar AngioTC se a instabilidade impedir.":
    "Si está inestable: iniciar la anticoagulación con heparina no fraccionada y considerar la trombólisis DE INMEDIATO — no esperar la angioTC si la inestabilidad lo impide.",
  "Se estável: seguir o algoritmo diagnóstico (probabilidade pré-teste → D-dímero/AngioTC).":
    "Si está estable: seguir el algoritmo diagnóstico (probabilidad pretest → dímero D/angioTC).",
  "Trombólise sistêmica é PRIMEIRA LINHA no TEP de alto risco se não houver contraindicação absoluta.":
    "La trombólisis sistémica es la PRIMERA LÍNEA en el TEP de alto riesgo si no hay contraindicación absoluta.",
  "Absolutas: AVC hemorrágico (qualquer tempo) ou isquêmico < 3 meses; neoplasia intracraniana; TCE grave/cirurgia intracraniana/espinhal recente; sangramento ativo; suspeita de dissecção de aorta; punção em sítio não compressível < 7 dias.":
    "Absolutas: ACV hemorrágico (en cualquier momento) o isquémico < 3 meses; neoplasia intracraneal; TCE grave/cirugía intracraneal o espinal reciente; sangrado activo; sospecha de disección aórtica; punción en un sitio no compresible < 7 días.",
  "Em PCR ou colapso iminente, contraindicações RELATIVAS tornam-se aceitáveis (benefício supera risco).":
    "En un paro cardíaco o colapso inminente, las contraindicaciones RELATIVAS se vuelven aceptables (el beneficio supera al riesgo).",
  "Escore de Wells (pontos): sinais clínicos de TVP = 3; diagnóstico alternativo menos provável que TEP = 3; FC > 100 = 1,5; imobilização/cirurgia < 4 sem = 1,5; TVP/TEP prévios = 1,5; hemoptise = 1; câncer ativo = 1.":
    "Escala de Wells (puntos): signos clínicos de TVP = 3; diagnóstico alternativo menos probable que el TEP = 3; FC > 100 = 1,5; inmovilización/cirugía < 4 semanas = 1,5; TVP/TEP previos = 1,5; hemoptisis = 1; cáncer activo = 1.",
  "Wells dicotômico: ≤ 4 = TEP IMPROVÁVEL (baixa/intermediária) → D-dímero. > 4 = TEP PROVÁVEL (alta) → AngioTC direto (NÃO pedir D-dímero).":
    "Wells dicotómico: ≤ 4 = TEP IMPROBABLE (baja/intermedia) → dímero D. > 4 = TEP PROBABLE (alta) → angioTC directa (NO solicitar dímero D).",
  "Alternativa: Geneva revisado (0–5 baixa, 6–11 intermediária, ≥ 12 alta).":
    "Alternativa: Ginebra revisada (0–5 baja, 6–11 intermedia, ≥ 12 alta).",
  "Corte padrão < 500 ng/mL (ou < 0,5 mg/L FEU) exclui TEP em probabilidade baixa/intermediária (sensibilidade 95–99%).":
    "El punto de corte estándar < 500 ng/mL (o < 0,5 mg/L FEU) excluye el TEP con probabilidad baja/intermedia (sensibilidad 95–99%).",
  "Ajuste por idade (> 50 anos, ADJUST-PE): corte = idade × 10 ng/mL (ex.: 70 anos → 700).":
    "Ajuste por edad (> 50 años, ADJUST-PE): punto de corte = edad × 10 ng/mL (p. ej., 70 años → 700).",
  "AHA/ACC 2026: escore YEARS recomendado para decidir a necessidade de imagem — inclusive na GESTANTE; D-dímero ajustado por idade nos de probabilidade baixa/intermediária.":
    "AHA/ACC 2026: se recomienda la escala YEARS para decidir la necesidad de imagen — incluso en la EMBARAZADA; dímero D ajustado por edad en los de probabilidad baja/intermedia.",
  "D-dímero eleva-se em infecção, neoplasia, gestação, cirurgia recente, idosos — baixa especificidade.":
    "El dímero D se eleva en infecciones, neoplasias, embarazo, cirugía reciente y ancianos — baja especificidad.",
  "AngioTC é o padrão-ouro (sensibilidade 83–90%, especificidade 94–96%); visualiza até ramos subsegmentares.":
    "La angioTC es el estándar de oro (sensibilidad 83–90%, especificidad 94–96%); visualiza hasta las ramas subsegmentarias.",
  "Contraindicação relativa: TFG < 30 (nefropatia por contraste), alergia grave ao iodo, gestação — alternativa: cintilografia V/Q.":
    "Contraindicación relativa: TFG < 30 (nefropatía por contraste), alergia grave al yodo, embarazo — alternativa: gammagrafía V/Q.",
  "TEP subsegmentar isolado: anticoagular na maioria (ESC 2019/ACCP 2022); vigilância sem anticoagular só se baixo risco + CUS negativo + seguimento garantido.":
    "TEP subsegmentario aislado: anticoagular en la mayoría (ESC 2019/ACCP 2022); vigilancia sin anticoagular solo si hay bajo riesgo + ecografía de compresión negativa + seguimiento garantizado.",
  "Disfunção de VD: dilatação/hipocinesia ao ECO ou relação VD/VE > 0,9 na AngioTC. Biomarcadores: troponina e/ou BNP elevados.":
    "Disfunción del VD: dilatación/hipocinesia en el ecocardiograma o relación VD/VI > 0,9 en la angioTC. Biomarcadores: troponina y/o BNP elevados.",
  "sPESI (1 ponto cada): idade > 80, câncer, doença cardiopulmonar crônica, FC ≥ 110, PAS < 100, SpO₂ < 90%. sPESI = 0 → baixo risco (mortalidade 30 dias ~1%); ≥ 1 → risco elevado (~10,9%).":
    "sPESI (1 punto cada uno): edad > 80, cáncer, enfermedad cardiopulmonar crónica, FC ≥ 110, PAS < 100, SpO₂ < 90%. sPESI = 0 → bajo riesgo (mortalidad a 30 días ~1%); ≥ 1 → riesgo elevado (~10,9%).",
  "Intermediário-ALTO: disfunção de VD E biomarcadores elevados (ambos). Intermediário-BAIXO: VD ou biomarcador (apenas um) ou nenhum, com sPESI ≥ 1. BAIXO: sPESI = 0, sem disfunção de VD, troponina normal.":
    "Intermedio-ALTO: disfunción del VD Y biomarcadores elevados (ambos). Intermedio-BAJO: VD o biomarcador (solo uno) o ninguno, con sPESI ≥ 1. BAJO: sPESI = 0, sin disfunción del VD y troponina normal.",
  "AHA/ACC 2026 — nova classificação A–E: A subclínico (assintomático) · B baixa gravidade · C gravidade elevada (biomarcador e/ou disfunção de VD → internar) · D falência incipiente (instabilidade TRANSITÓRIA) · E falência cardiopulmonar (hipotensão/choque persistente). Equivalência: A–B ≈ baixo risco, C ≈ intermediário, D–E ≈ alto risco.":
    "AHA/ACC 2026 — nueva clasificación A–E: A subclínico (asintomático) · B gravedad baja · C gravedad elevada (biomarcador y/o disfunción del VD → internar) · D falla incipiente (inestabilidad TRANSITORIA) · E falla cardiopulmonar (hipotensión/choque persistente). Equivalencia: A–B ≈ bajo riesgo, C ≈ intermedio, D–E ≈ alto riesgo.",
  "AHA/ACC 2026: acionar o time de resposta a TEP (PERT) nos casos C–E — melhora a agilidade do cuidado.":
    "AHA/ACC 2026: activar el equipo de respuesta al TEP (PERT) en los casos C–E — mejora la agilidad de la atención.",
  "Critérios (HOME-PE/Hestia): sPESI = 0, sem disfunção de VD ao ECO, troponina normal.":
    "Criterios (HOME-PE/Hestia): sPESI = 0, sin disfunción del VD en el ecocardiograma y troponina normal.",
  "Hemodinâmica estável (PAS ≥ 100, FC < 110, SpO₂ ≥ 90% em ar ambiente); sem dor intensa/síncope; sem sangramento ou contraindicação à anticoagulação.":
    "Hemodinamia estable (PAS ≥ 100, FC < 110, SpO₂ ≥ 90% al aire ambiente); sin dolor intenso ni síncope; sin sangrado ni contraindicación para la anticoagulación.",
  "Sem TVP iliofemoral extensa/phlegmasia; suporte social adequado, adesão e acesso à emergência; seguimento em 5–7 dias.":
    "Sin TVP iliofemoral extensa ni flegmasía; soporte social adecuado, adherencia y acceso a urgencias; seguimiento en 5–7 días.",
  "Regra de Hestia: qualquer critério presente (O₂, PA < 100, analgesia IV, câncer em tratamento, sangramento, TFG < 30, gestação, dor torácica grave) = internação.":
    "Regla de Hestia: la presencia de cualquier criterio (O₂, PA < 100, analgesia IV, cáncer en tratamiento, sangrado, TFG < 30, embarazo, dolor torácico grave) = internación.",

  // ── Ações ──────────────────────────────────────────────────────────────────
  "Apresentação: dispneia súbita (73–80%), dor pleurítica, taquicardia, taquipneia, síncope (alto risco), hipotensão/choque (maciço), sinais de TVP.":
    "Presentación: disnea súbita (73–80%), dolor pleurítico, taquicardia, taquipnea, síncope (alto riesgo), hipotensión/choque (masivo) y signos de TVP.",
  "Monitor, oximetria, PA, FC, 2 acessos venosos; O₂ se SpO₂ < 90% (alvo ≥ 94% com suporte no risco intermediário/alto).":
    "Monitor, oximetría, PA, FC, 2 accesos venosos; O₂ si la SpO₂ < 90% (objetivo ≥ 94% con soporte en el riesgo intermedio/alto).",
  "ECG (taquicardia sinusal, S1Q3T3, BRD novo, inversão de T V1–V4), gasometria, troponina, BNP, D-dímero (conforme probabilidade).":
    "ECG (taquicardia sinusal, S1Q3T3, bloqueo de rama derecha nuevo, inversión de la T en V1–V4), gasometría, troponina, BNP y dímero D (según la probabilidad).",
  "Fatores de risco: cirurgia/trauma/imobilização recente, câncer ativo, TVP/TEP prévios, estrogênio, gestação/puerpério, trombofilia.":
    "Factores de riesgo: cirugía/trauma/inmovilización reciente, cáncer activo, TVP/TEP previos, estrógenos, embarazo/puerperio y trombofilia.",
  "Suporte: O₂ (IOT se insuficiência respiratória grave); fluidos CAUTELOSOS — SF 0,9% 500 mL (máx 500–1.000 mL): sobrecarga piora a função do VD.":
    "Soporte: O₂ (intubación si hay insuficiencia respiratoria grave); líquidos con CAUTELA — solución fisiológica 500 mL (máx. 500–1.000 mL): la sobrecarga empeora la función del VD.",
  "Vasopressor: norepinefrina 0,1–1 mcg/kg/min para PAM ≥ 65. Dobutamina 2–10 mcg/kg/min se baixo débito com PA mantida. Evitar hipóxia/hipercapnia.":
    "Vasopresor: noradrenalina 0,1–1 mcg/kg/min para una PAM ≥ 65. Dobutamina 2–10 mcg/kg/min si hay bajo gasto con la PA conservada. Evitar la hipoxia y la hipercapnia.",
  "HNF IV imediata: bolus {hnfBolus} U (80 U/kg, máx 10.000) + {hnfInf} U/h (18 U/kg/h); alvo TTPa 60–100 s. Iniciar ANTES da AngioTC se risco de morte iminente.":
    "Heparina no fraccionada IV inmediata: bolo {hnfBolus} U (80 U/kg, máx. 10.000) + {hnfInf} U/h (18 U/kg/h); objetivo TTPa 60–100 s. Iniciarla ANTES de la angioTC si hay riesgo de muerte inminente.",
  "HNF é o anticoagulante de escolha no alto risco (permite interrupção rápida se for trombolisar).":
    "La heparina no fraccionada es el anticoagulante de elección en el alto riesgo (permite suspenderla rápidamente si se va a trombolizar).",
  "AHA/ACC 2026: preferir cateter nasal de ALTO FLUXO ao cateter comum na hipoxemia moderada-grave; EVITAR sedação profunda e ventilação mecânica sempre que possível (risco de colapso hemodinâmico).":
    "AHA/ACC 2026: preferir la cánula nasal de ALTO FLUJO a la cánula común en la hipoxemia moderada-grave; EVITAR la sedación profunda y la ventilación mecánica siempre que sea posible (riesgo de colapso hemodinámico).",
  "AHA/ACC 2026: VA-ECMO é razoável no choque cardiogênico refratário por TEP.":
    "AHA/ACC 2026: la ECMO venoarterial es razonable en el choque cardiogénico refractario por TEP.",
  "Anticoagulação de manutenção: DOAC preferido a antagonista da vitamina K (AHA/ACC 2026); HBPM preferida à HNF na maioria das categorias C–E, exceto quando se planeja trombólise ou há instabilidade que exija reversão rápida.":
    "Anticoagulación de mantenimiento: el anticoagulante oral directo es preferido al antagonista de la vitamina K (AHA/ACC 2026); la HBPM es preferida a la heparina no fraccionada en la mayoría de las categorías C–E, excepto cuando se planea trombólisis o hay inestabilidad que exija una reversión rápida.",
  "AngioTC se a hemodinâmica permitir (< 5–10 min de estabilização).":
    "AngioTC si la hemodinamia lo permite (< 5–10 min de estabilización).",
  "AngioTC impossível: ecocardiograma à beira leito — dilatação/disfunção de VD + sinal de McConnell + TVP ao ultrassom = suficiente para indicar trombólise em extremis.":
    "Si la angioTC es imposible: ecocardiograma a pie de cama — dilatación/disfunción del VD + signo de McConnell + TVP en la ecografía = suficiente para indicar la trombólisis in extremis.",
  "Não retardar a reperfusão por exames se o colapso for iminente.":
    "No retrasar la reperfusión por exámenes si el colapso es inminente.",
  "Alteplase (rt-PA) 100 mg IV em 2 h: 10 mg em bolus (1–2 min) → 90 mg em 2 h. Regime aprovado FDA/ESC.":
    "Alteplasa (rt-PA) 100 mg IV en 2 h: 10 mg en bolo (1–2 min) → 90 mg en 2 h. Régimen aprobado por la FDA/ESC.",
  "Alternativas: estreptoquinase 250.000 UI em 30 min → 100.000 UI/h × 12–24 h; uroquinase 4.400 UI/kg em 10 min → 4.400 UI/kg/h × 12–24 h.":
    "Alternativas: estreptoquinasa 250.000 UI en 30 min → 100.000 UI/h × 12–24 h; uroquinasa 4.400 UI/kg en 10 min → 4.400 UI/kg/h × 12–24 h.",
  "SUSPENDER a HNF durante a infusão; reiniciar (sem bolus) quando TTPa < 80 s. Monitorização pós-trombólise: melhora em 30–60 min; repetir ECO em 2–4 h.":
    "SUSPENDER la heparina no fraccionada durante la infusión; reiniciarla (sin bolo) cuando el TTPa < 80 s. Monitorización postrombólisis: mejoría en 30–60 min; repetir el ecocardiograma en 2–4 h.",
  "Complicação hemorrágica grave: suspender, plasma fresco congelado + ácido tranexâmico 1 g IV.":
    "Complicación hemorrágica grave: suspender, plasma fresco congelado + ácido tranexámico 1 g IV.",
  "Embolectomia cirúrgica: contraindicação absoluta à trombólise ou falha; cirurgia cardíaca com CEC (melhor sem PCR prolongado). Acionar cirurgia cardiovascular precocemente.":
    "Embolectomía quirúrgica: contraindicación absoluta para la trombólisis o fracaso de esta; cirugía cardíaca con circulación extracorpórea (mejor sin un paro prolongado). Activar la cirugía cardiovascular precozmente.",
  "Trombólise cateter-dirigida (CDT): alteplase 1–2 mg/h intra-arterial pulmonar via cateter — menor dose, menor sangramento; centro de hemodinâmica.":
    "Trombólisis dirigida por catéter: alteplasa 1–2 mg/h intraarterial pulmonar por catéter — menor dosis y menos sangrado; en un centro de hemodinamia.",
  "Trombectomia mecânica percutânea (AngioJet, FlowTriever, Aspirex): em centros com experiência.":
    "Trombectomía mecánica percutánea (AngioJet, FlowTriever, Aspirex): en centros con experiencia.",
  "ECMO venoarterial (VA-ECMO): TEP maciço com PCR/colapso refratário — ponte para cirurgia/trombólise.":
    "ECMO venoarterial: TEP masivo con paro/colapso refractario — puente hacia la cirugía o la trombólisis.",
  "Manter HNF e suporte hemodinâmico durante a abordagem.":
    "Mantener la heparina no fraccionada y el soporte hemodinámico durante el procedimiento.",
  "Anticoagulação plena imediata: HNF IV (bolus {hnfBolus} U + {hnfInf} U/h, alvo TTPa 60–100 s) — preferir HNF pela possibilidade de trombólise de resgate; OU enoxaparina {enoxa} mg SC 12/12h.":
    "Anticoagulación plena inmediata: heparina no fraccionada IV (bolo {hnfBolus} U + {hnfInf} U/h, objetivo TTPa 60–100 s) — preferirla por la posibilidad de trombólisis de rescate; O enoxaparina {enoxa} mg SC cada 12 h.",
  "Monitorização intensiva (UTI): PA, FC, SpO₂ contínuos; repetir troponina/BNP e ECO.":
    "Monitorización intensiva (UCI): PA, FC y SpO₂ continuas; repetir la troponina/BNP y el ecocardiograma.",
  "TROMBÓLISE DE RESGATE imediata se houver deterioração hemodinâmica (passar para o ramo de alto risco).":
    "TROMBÓLISIS DE RESCATE inmediata si hay deterioro hemodinámico (pasar a la rama de alto riesgo).",
  "Considerar CDT (cateter-dirigida) em centros com experiência se risco de deterioração.":
    "Considerar la trombólisis dirigida por catéter en centros con experiencia si hay riesgo de deterioro.",
  "NOAC 1ª linha — Rivaroxabana 15 mg VO 12/12h × 21 dias → 20 mg/dia (com refeição); OU Apixabana 10 mg VO 12/12h × 7 dias → 5 mg 12/12h. Evitar se TFG < 15, gestação.":
    "Anticoagulante oral directo de 1.ª línea — Rivaroxabán 15 mg VO cada 12 h × 21 días → 20 mg/día (con alimentos); O Apixabán 10 mg VO cada 12 h × 7 días → 5 mg cada 12 h. Evitarlos si TFG < 15 o en el embarazo.",
  "Alternativas NOAC (requerem parenteral inicial 5–10 dias): Dabigatrana 150 mg 12/12h; Edoxabana 60 mg/dia (30 mg se ≤ 60 kg ou TFG 15–50).":
    "Alternativas orales directas (requieren tratamiento parenteral inicial de 5–10 días): Dabigatrán 150 mg cada 12 h; Edoxabán 60 mg/día (30 mg si ≤ 60 kg o TFG 15–50).",
  "Esquema clássico: enoxaparina {enoxa} mg SC 12/12h + varfarina (alvo INR 2,0–3,0; sobrepor ≥ 5 dias e até INR ≥ 2 por 24 h).":
    "Esquema clásico: enoxaparina {enoxa} mg SC cada 12 h + warfarina (objetivo INR 2,0–3,0; solaparlas ≥ 5 días y hasta que el INR ≥ 2 durante 24 h).",
  "Situações especiais — gestante: HBPM (NOAC contraindicado); câncer ativo: HBPM ou NOAC (rivaroxabana/apixabana); TIH: argatrobana/fondaparinux (suspender toda heparina); IRA TFG < 30: HNF preferida.":
    "Situaciones especiales — embarazada: HBPM (los anticoagulantes orales directos están contraindicados); cáncer activo: HBPM o anticoagulante oral directo (rivaroxabán/apixabán); trombocitopenia inducida por heparina: argatrobán/fondaparinux (suspender toda heparina); insuficiencia renal aguda con TFG < 30: se prefiere la heparina no fraccionada.",
  "DURAÇÃO: provocado por fator transitório → 3 meses; não provocado/recorrente/trombofilia de alto risco → indefinido (reavaliar risco de sangramento); câncer ativo → enquanto ativo.":
    "DURACIÓN: provocado por un factor transitorio → 3 meses; no provocado/recurrente/trombofilia de alto riesgo → indefinida (reevaluar el riesgo de sangrado); cáncer activo → mientras esté activo.",
  "Rivaroxabana 15 mg VO 12/12h × 21 dias → 20 mg/dia OU Apixabana 10 mg VO 12/12h × 7 dias → 5 mg 12/12h — não exigem ponte parenteral.":
    "Rivaroxabán 15 mg VO cada 12 h × 21 días → 20 mg/día O Apixabán 10 mg VO cada 12 h × 7 días → 5 mg cada 12 h — no requieren puente parenteral.",
  "Orientar sinais de alarme (piora da dispneia, dor torácica, síncope, sangramento) e retorno imediato à emergência.":
    "Indicar los signos de alarma (empeoramiento de la disnea, dolor torácico, síncope, sangrado) y el regreso inmediato a urgencias.",
  "Garantir seguimento ambulatorial em 5–7 dias e acesso à emergência.":
    "Garantizar el seguimiento ambulatorio en 5–7 días y el acceso a urgencias.",
  "Duração mínima 3 meses; reavaliar conforme o fator (provocado × não provocado).":
    "Duración mínima de 3 meses; reevaluar según el factor (provocado × no provocado).",
  "TEP excluído pelo algoritmo (D-dímero negativo em probabilidade baixa/intermediária ou AngioTC negativa).":
    "TEP excluido por el algoritmo (dímero D negativo con probabilidad baja/intermedia o angioTC negativa).",
  "Investigar e tratar diagnósticos alternativos (SCA, pneumonia, pneumotórax, dissecção, causa musculoesquelética).":
    "Investigar y tratar diagnósticos alternativos (síndrome coronario agudo, neumonía, neumotórax, disección, causa musculoesquelética).",
  "Reavaliar se surgir instabilidade ou novos achados; considerar CUS de MMII se suspeita de TVP persistir.":
    "Reevaluar si aparece inestabilidad o nuevos hallazgos; considerar la ecografía de compresión de miembros inferiores si persiste la sospecha de TVP.",
  "UTI com monitorização contínua de PA, FC, SpO₂; ECO seriado (24–48 h pós-trombólise ou se deterioração).":
    "UCI con monitorización continua de PA, FC y SpO₂; ecocardiograma seriado (24–48 h postrombólisis o ante deterioro).",
  "Metas: SpO₂ ≥ 94% com suporte; HNF com TTPa 60–100 s; repetir troponina/BNP em 6–12 h.":
    "Metas: SpO₂ ≥ 94% con soporte; heparina no fraccionada con TTPa 60–100 s; repetir la troponina/BNP en 6–12 h.",
  "Trombólise de resgate imediata se deterioração no intermediário-alto; transição para anticoagulação oral após estabilização.":
    "Trombólisis de rescate inmediata ante deterioro en el riesgo intermedio-alto; transición a la anticoagulación oral tras la estabilización.",
  "Investigar HPTEC (hipertensão pulmonar tromboembólica crônica) no seguimento se dispneia persistir > 3 meses (cintilografia V/Q).":
    "Investigar la hipertensión pulmonar tromboembólica crónica en el seguimiento si la disnea persiste > 3 meses (gammagrafía V/Q).",
  "Internação com anticoagulação plena e vigilância clínica (PA, FC, SpO₂, sinais de deterioração).":
    "Internación con anticoagulación plena y vigilancia clínica (PA, FC, SpO₂ y signos de deterioro).",
  "Reclassificar para UTI/trombólise de resgate se houver instabilidade.":
    "Reclasificar a UCI/trombólisis de rescate si aparece inestabilidad.",
  "Planejar duração da anticoagulação (3 meses se provocado; indefinido se não provocado/alto risco).":
    "Planificar la duración de la anticoagulación (3 meses si fue provocado; indefinida si no fue provocado o es de alto riesgo).",
  "Pesquisar trombofilia se TEP não provocado < 50 anos, recorrente ou de localização inusual (coletar antes da anticoagulação ou ≥ 4 sem após).":
    "Estudiar trombofilia si el TEP no provocado ocurre en < 50 años, es recurrente o de localización inusual (tomar la muestra antes de la anticoagulación o ≥ 4 semanas después).",
  "Alta com NOAC oral, orientações de sinais de alarme e retorno imediato.":
    "Alta con anticoagulante oral directo, indicaciones sobre los signos de alarma y regreso inmediato.",
  "Seguimento ambulatorial garantido em 5–7 dias; acesso à emergência.":
    "Seguimiento ambulatorio garantizado en 5–7 días; acceso a urgencias.",
  "Duração mínima de 3 meses; reavaliar fator provocador × não provocado.":
    "Duración mínima de 3 meses; reevaluar el factor provocador × no provocado.",
  "Reforçar adesão; investigar causa de base (câncer oculto conforme idade/risco).":
    "Reforzar la adherencia; investigar la causa de base (cáncer oculto según la edad/el riesgo).",

  // ══ CAMADA 2 — correções conforme o capítulo clínico de TEP v1.3 ════════
  "Alteplase (rt-PA) 100 mg IV em 2 h: 10 mg em bólus (1–2 min) → 90 mg em infusão por 2 h.":
    "Alteplasa (rt-PA) 100 mg IV en 2 h: 10 mg en bolo (1–2 min) → 90 mg en infusión durante 2 h.",
  "⚠️ Peso abaixo de 65 kg: a dose TOTAL não deve exceder 1,5 mg/kg.":
    "⚠️ Peso inferior a 65 kg: la dosis TOTAL no debe superar 1,5 mg/kg.",
  "Reconstituir apenas conforme a bula da apresentação disponível. NÃO misturar nem administrar outro medicamento — inclusive heparina — no mesmo frasco, solução ou acesso venoso da alteplase.":
    "Reconstituir únicamente según el prospecto de la presentación disponible. NO mezclar ni administrar otro medicamento — incluida la heparina — en el mismo frasco, solución o acceso venoso de la alteplasa.",
  "PCR atribuída ao TEP: a AHA 2025 NÃO estabelece dose única de alteplase nesse cenário. Não usar 0,6 mg/kg (máx 50 mg) nem 50 mg em bólus como se fossem dose padrão de PCR.":
    "Paro cardíaco atribuido a la TEP: la AHA 2025 NO establece una dosis única de alteplasa en ese escenario. No usar 0,6 mg/kg (máx. 50 mg) ni 50 mg en bolo como si fueran dosis estándar de paro.",
  "Qualquer regime acelerado durante a ressuscitação precisa estar previamente definido em protocolo institucional validado, com fonte farmacológica explícita, avaliação do risco hemorrágico e plano de continuidade da RCP.":
    "Cualquier régimen acelerado durante la reanimación debe estar previamente definido en un protocolo institucional validado, con fuente farmacológica explícita, evaluación del riesgo hemorrágico y plan de continuidad de la RCP.",
  "Suspender a HNF durante a infusão de alteplase; reiniciar SEM bólus quando o TTPa estiver abaixo de 2× o limite superior da normalidade.":
    "Suspender la HNF durante la infusión de alteplasa; reiniciar SIN bolo cuando el TTPa esté por debajo de 2× el límite superior de la normalidad.",
  "SUSPENDER a HNF durante a infusão; reiniciar sem bólus quando o TTPa estiver ABAIXO DE 2× o limite superior da normalidade do laboratório, ajustando pelo nomograma institucional. Não administrar heparina pelo mesmo acesso da alteplase.":
    "SUSPENDER la HNF durante la infusión; reiniciar sin bolo cuando el TTPa esté POR DEBAJO DE 2× el límite superior de la normalidad del laboratorio, ajustando por el nomograma institucional. No administrar heparina por el mismo acceso de la alteplasa.",
  "Monitorização pós-trombólise: hemodinâmica, estado neurológico, oxigenação e sítios de punção continuamente; melhora esperada em 30–60 min; repetir ECO em 2–4 h.":
    "Monitorización tras la trombólisis: hemodinámica, estado neurológico, oxigenación y sitios de punción de forma continua; mejoría esperada en 30–60 min; repetir el ecocardiograma en 2–4 h.",
  "Sangramento grave: INTERROMPER imediatamente alteplase e heparina, suspender intervenções invasivas evitáveis e acionar o protocolo de hemorragia grave do serviço.":
    "Sangrado grave: INTERRUMPIR de inmediato la alteplasa y la heparina, suspender las intervenciones invasivas evitables y activar el protocolo de hemorragia grave del servicio.",
  "Fibrinólise é razoável na PCR por TEP confirmado, e pode ser considerada quando o TEP é apenas suspeito. A AHA 2025 NÃO estabelece dose única de alteplase nesse cenário: seguir protocolo institucional validado, com fonte farmacológica explícita. A duração ideal da RCP após a fibrinólise permanece incerta. Considerar ECMO.":
    "La fibrinólisis es razonable en el paro por TEP confirmada, y puede considerarse cuando la TEP es solo sospechada. La AHA 2025 NO establece una dosis única de alteplasa en ese escenario: seguir un protocolo institucional validado, con fuente farmacológica explícita. La duración ideal de la RCP tras la fibrinólisis sigue siendo incierta. Considerar ECMO.",
  "Escore de Wells (pontos): sinais clínicos de TVP = 3; diagnóstico alternativo menos provável que TEP = 3; FC ≥ 100 = 1,5; imobilização ≥ 3 dias OU cirurgia nas últimas 4 semanas = 1,5; TVP/TEP prévios = 1,5; hemoptise = 1; câncer ativo = 1. Máximo 12,5.":
    "Escala de Wells (puntos): signos clínicos de TVP = 3; diagnóstico alternativo menos probable que TEP = 3; FC ≥ 100 = 1,5; inmovilización ≥ 3 días O cirugía en las últimas 4 semanas = 1,5; TVP/TEP previos = 1,5; hemoptisis = 1; cáncer activo = 1. Máximo 12,5.",
  "Wells em três faixas: < 2 baixa · 2–6 moderada · > 6 alta probabilidade.":
    "Wells en tres rangos: < 2 baja · 2–6 moderada · > 6 alta probabilidad.",
  "Wells SIMPLIFICADO: todos os itens valem 1 ponto, e ≥ 2 já indica TEP provável.":
    "Wells SIMPLIFICADO: todos los ítems valen 1 punto, y ≥ 2 ya indica TEP probable.",
  "Alternativa — Genebra simplificado: TVP/TEP prévios 1; FC 74–94 = 1 e FC ≥ 94 = 2; cirurgia ou fratura no último mês 1; hemoptise 1; câncer ativo 1; dor unilateral em membro inferior 1; dor à palpação venosa profunda ou edema unilateral 1; idade > 65 anos 1. Corte: ≤ 2 TEP improvável, > 2 TEP provável.":
    "Alternativa — Ginebra simplificada: TVP/TEP previos 1; FC 74–94 = 1 y FC ≥ 94 = 2; cirugía o fractura en el último mes 1; hemoptisis 1; cáncer activo 1; dolor unilateral en miembro inferior 1; dolor a la palpación venosa profunda o edema unilateral 1; edad > 65 años 1. Corte: ≤ 2 TEP improbable, > 2 TEP probable.",
  "PERC — quem tem BAIXA probabilidade e cumpre os OITO critérios tem TEP descartado SEM exame adicional: idade < 50 anos · FC < 100 bpm · SpO₂ ≥ 95% · sem hemoptise · sem uso de estrogênio · sem TEP/TVP prévios · sem empastamento de panturrilha · sem trauma ou cirurgia com internação nas últimas 4 semanas. Basta UM critério falhar para o PERC não se aplicar.":
    "PERC — quien tiene BAJA probabilidad y cumple los OCHO criterios tiene el TEP descartado SIN examen adicional: edad < 50 años · FC < 100 lpm · SpO₂ ≥ 95% · sin hemoptisis · sin uso de estrógenos · sin TEP/TVP previos · sin empastamiento de pantorrilla · sin trauma o cirugía con internación en las últimas 4 semanas. Basta que UN criterio falle para que el PERC no se aplique.",
  "Imobilização ≥ 3 dias ou cirurgia nas últimas 4 semanas":
    "Inmovilización ≥ 3 días o cirugía en las últimas 4 semanas",
  "Wells PS et al. Ann Intern Med. 2001;135:98–107 (escore original). Tabela de itens e pesos conferida contra o pathway Einstein/SBIBAE de Tromboembolismo Pulmonar v.3, que a reproduz por extenso.":
    "Wells PS et al. Ann Intern Med. 2001;135:98–107 (escala original). Tabla de ítems y pesos verificada contra el pathway Einstein/SBIBAE de Tromboembolismo Pulmonar v.3, que la reproduce por extenso.",
  "Alternativa citada em diretriz de TEP (não de PCR): regime acelerado 0,6 mg/kg em 15 min, máximo 50 mg.":
    "Alternativa citada en guías de TEP (no de PCR): régimen acelerado 0,6 mg/kg en 15 min, máximo 50 mg.",
  "Havendo protocolo institucional validado, ele prevalece sobre o que está acima.":
    "Si existe un protocolo institucional validado, este prevalece sobre lo anterior.",
  "MANTER RCP por 60–90 MIN após a fibrinólise antes de considerar encerrar — o trombolítico precisa de tempo e de compressões para chegar ao trombo. Encerrar aos 20 min desperdiça a droga que acabou de ser dada. (ERC; não há evidência de alta qualidade sobre a duração ideal.)":
    "MANTENER RCP durante 60–90 MIN tras la fibrinólisis antes de considerar detenerla — el trombolítico necesita tiempo y compresiones para llegar al trombo. Detenerla a los 20 min desperdicia el fármaco recién administrado. (ERC; no hay evidencia de alta calidad sobre la duración ideal.)",
  "NA PRÁTICA, quando NÃO há protocolo institucional: alteplase 50 mg IV em BÓLUS durante a RCP é o esquema mais usado e mais descrito. Pode-se repetir 50 mg 15–20 min depois se a parada persistir. É o que orienta o ERC e o que aparece nas séries publicadas — não é dose chancelada pela AHA. Registre a decisão e a fonte no prontuário.":
    "EN LA PRÁCTICA, cuando NO hay protocolo institucional: alteplasa 50 mg IV en BOLO durante la RCP es el esquema más usado y más descrito. Puede repetirse 50 mg 15–20 min después si el paro persiste. Es lo que orienta el ERC y lo que aparece en las series publicadas — no es una dosis avalada por la AHA. Registre la decisión y la fuente en la historia clínica.",
  "PCR atribuída ao TEP: a AHA 2025 NÃO estabelece dose única de alteplase nesse cenário — a recomendação é fibrinolisar, sem fixar esquema.":
    "PCR atribuida al TEP: la AHA 2025 NO establece una dosis única de alteplasa en ese escenario — la recomendación es fibrinolisar, sin fijar el esquema.",
  "Por que o bólus de 50 mg e não os 100 mg em 2 h: em parada não existe circulação para sustentar uma infusão de 2 h, e a diretriz de TEP de 2026 (AHA/ACC/CHEST) registra que doses de 25–50 mg têm eficácia comparável para recuperar o VD com menos sangramento grave, inclusive intracraniano, do que 100 mg.":
    "Por qué el bolo de 50 mg y no los 100 mg en 2 h: en paro no hay circulación que sostenga una infusión de 2 h, y la guía de TEP de 2026 (AHA/ACC/CHEST) registra que dosis de 25–50 mg tienen eficacia comparable para recuperar el VD con menos sangrado grave, incluido el intracraneal, que 100 mg.",
  "Se houver ROSC sem ter completado 100 mg, o restante pode ser infundido em 1 h, conforme a resposta e o risco hemorrágico.":
    "Si hay ROSC sin haber completado 100 mg, el resto puede infundirse en 1 h, según la respuesta y el riesgo hemorrágico.",
  "Fibrinólise é razoável na PCR por TEP confirmado, e pode ser considerada quando o TEP é apenas suspeito. A AHA 2025 não fixa esquema. SEM protocolo institucional, o mais usado e mais descrito é alteplase 50 mg IV em BÓLUS durante a RCP, repetindo 50 mg em 15–20 min se a parada persistir (ERC e séries publicadas — não é dose chancelada pela AHA; registre a fonte). MANTER RCP por 60–90 min após a dose antes de considerar encerrar. Considerar ECMO.":
    "La fibrinólisis es razonable en la PCR por TEP confirmado, y puede considerarse cuando el TEP es solo sospechado. La AHA 2025 no fija esquema. SIN protocolo institucional, el más usado y más descrito es alteplasa 50 mg IV en BOLO durante la RCP, repitiendo 50 mg en 15–20 min si el paro persiste (ERC y series publicadas — no es una dosis avalada por la AHA; registre la fuente). MANTENER RCP durante 60–90 min tras la dosis antes de considerar detenerla. Considerar ECMO.",
};
