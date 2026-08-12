/**
 * Ventilação mecânica — dicionário PT → ES.
 * Terminologia: SDRA, peso predicho, volumen corriente, presión meseta,
 * driving pressure, destete, prueba de respiración espontánea (PRE).
 * Tokens {pbw} {vc4} {vc6} {vc8} preservados.
 */
export const ES_VENTILACAO: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Ventilação mecânica — objetivo, modo e sedação":
    "Ventilación mecánica — objetivo, modo y sedación",
  "Dados para o peso predito": "Datos para el peso predicho",
  "Ajuste inicial protetor": "Ajuste inicial protector",
  "Estratégia ventilatória por patologia": "Estrategia ventilatoria por patología",
  "SARA — ventilação protetora (único tratamento que reduz mortalidade)":
    "SDRA — ventilación protectora (el único tratamiento que reduce la mortalidad)",
  "Asma / DPOC — evitar auto-PEEP (expiração longa)":
    "Asma / EPOC — evitar el auto-PEEP (espiración prolongada)",
  "TCE grave / HIC — normoventilação": "TCE grave / HIC — normoventilación",
  "Choque séptico com VM": "Choque séptico con VM",
  "ICC / EAP cardiogênico — PEEP mais alto ajuda":
    "ICC / EAP cardiogénico — un PEEP más alto ayuda",
  "Obeso (IMC ≥ 35) — peso predito + PEEP mais alto":
    "Obeso (IMC ≥ 35) — peso predicho + PEEP más alto",
  "Pulmão normal / outro — manter protetor": "Pulmón normal / otro — mantener la protección",
  "Pressões dentro do alvo?": "¿Presiones dentro del objetivo?",
  "Pressão de platô / driving pressure altas — reduzir":
    "Presión meseta / driving pressure elevadas — reducir",
  "Reavaliação e problemas": "Reevaluación y problemas",
  "Troubleshooting — DOPES + assincronia": "Resolución de problemas — DOPES + asincronía",
  "Elegível para avaliar desmame?": "¿Elegible para evaluar el destete?",
  "Teste de Respiração Espontânea (TRE)": "Prueba de Respiración Espontánea (PRE)",
  "Resultado do TRE": "Resultado de la PRE",
  "Extubação — checagem final e prevenção de falha":
    "Extubación — verificación final y prevención del fracaso",
  "Falha do TRE — reconectar e investigar": "Fracaso de la PRE — reconectar e investigar",
  "UTI — VM contínua e reavaliação diária": "UCI — VM continua y reevaluación diaria",
  "Pós-extubação — observação monitorizada": "Posextubación — observación monitorizada",
  "Ventilação Mecânica": "Ventilación Mecánica",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "Qual o cenário dominante? (os parâmetros mudam de forma importante)":
    "¿Cuál es el escenario dominante? (los parámetros cambian de forma importante)",
  "A pressão de platô está ≤ 30 e a driving pressure ≤ 15 cmH₂O?":
    "¿La presión meseta es ≤ 30 y la driving pressure ≤ 15 cmH₂O?",
  "Há deterioração aguda, hipoxemia ou assincronia?":
    "¿Hay deterioro agudo, hipoxemia o asincronía?",
  "A causa da VM está controlada e o paciente preenche os critérios de elegibilidade?":
    "¿La causa de la VM está controlada y el paciente cumple los criterios de elegibilidad?",
  "O paciente tolerou o TRE (preencheu os critérios de sucesso)?":
    "¿El paciente toleró la PRE (cumplió los criterios de éxito)?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Definir objetivo (oxigenação × ventilação), modo inicial e a sedação (analgesia primeiro).":
    "Definir el objetivo (oxigenación × ventilación), el modo inicial y la sedación (analgesia primero).",
  "Volume baixo guiado pelo peso predito desde o início. Peso predito ≈ {pbw} kg.":
    "Volumen bajo guiado por el peso predicho desde el inicio. Peso predicho ≈ {pbw} kg.",
  "Berlim: P/F ≤ 300 com PEEP ≥ 5 (leve 200–300 · moderada 100–200 · grave ≤ 100). VC {vc4}–{vc6} mL.":
    "Berlín: P/F ≤ 300 con PEEP ≥ 5 (leve 200–300 · moderada 100–200 · grave ≤ 100). Vt {vc4}–{vc6} mL.",
  "Prioridade: tempo expiratório longo e PEEP baixo. Medir auto-PEEP (pausa expiratória).":
    "Prioridad: tiempo espiratorio prolongado y PEEP bajo. Medir el auto-PEEP (pausa espiratoria).",
  "Evitar hiper e hipocapnia. Proteger a perfusão cerebral.":
    "Evitar la hiper y la hipocapnia. Proteger la perfusión cerebral.",
  "Priorizar a ressuscitação hemodinâmica; VM com PEEP moderado e liberação precoce.":
    "Priorizar la reanimación hemodinámica; VM con PEEP moderado y liberación precoz.",
  "Pressão positiva reduz pré e pós-carga do VE e melhora a oxigenação.":
    "La presión positiva reduce la pre y la poscarga del VI y mejora la oxigenación.",
  "VC pelo peso PREDITO (nunca o atual). Compensar a pressão abdominal.":
    "Vt según el peso PREDICHO (nunca el actual). Compensar la presión abdominal.",
  "Mesmo sem doença pulmonar, ventilar de forma protetora.":
    "Aun sin enfermedad pulmonar, ventilar de forma protectora.",
  "Proteger o pulmão: menos volume, diferenciar complacência × resistência.":
    "Proteger el pulmón: menos volumen, diferenciar distensibilidad × resistencia.",
  "Deterioração: desconectar e ventilar à mão separa problema do paciente × do circuito.":
    "Deterioro: desconectar y ventilar manualmente separa el problema del paciente × del circuito.",
  "Padrão atual: PSV 5–8 + PEEP 5 por 30–120 min (ou tubo T). IRRS < 105 prediz sucesso.":
    "Estándar actual: PSV 5–8 + PEEP 5 durante 30–120 min (o tubo en T). El IRRS < 105 predice el éxito.",
  "Confirmar via aérea e tosse antes de extubar; prevenir falha pós-extubação.":
    "Confirmar la vía aérea y la tos antes de extubar; prevenir el fracaso posextubación.",
  "Não insistir; descansar 24 h e corrigir a causa antes de novo TRE.":
    "No insistir; descansar 24 h y corregir la causa antes de una nueva PRE.",
  "Paciente ventilado → cuidado intensivo, bundles e avaliação diária de desmame.":
    "Paciente ventilado → cuidado intensivo, paquetes de medidas y evaluación diaria del destete.",
  "Extubado → vigilância de falha nas primeiras horas.":
    "Extubado → vigilancia del fracaso en las primeras horas.",

  // ── Opções e campos ────────────────────────────────────────────────────────
  "Altura": "Altura",
  "Sexo": "Sexo",
  "Masculino": "Masculino",
  "Feminino": "Femenino",
  "SARA / ARDS": "SDRA / ARDS",
  "Asma / DPOC (obstrutivo)": "Asma / EPOC (obstructivo)",
  "TCE grave / HIC": "TCE grave / HIC",
  "Choque séptico": "Choque séptico",
  "ICC / EAP cardiogênico": "ICC / EAP cardiogénico",
  "Obeso (IMC ≥ 35)": "Obeso (IMC ≥ 35)",
  "Pulmão normal / outro": "Pulmón normal / otro",
  "Sim — dentro do alvo": "Sí — dentro del objetivo",
  "Não — pressões altas": "No — presiones elevadas",
  "Sim — investigar (DOPES / assincronia)": "Sí — investigar (DOPES / asincronía)",
  "Não — estável, avaliar desmame": "No — estable, evaluar el destete",
  "Sim — elegível: realizar TRE": "Sí — elegible: realizar la PRE",
  "Não — manter VM e reavaliar diariamente": "No — mantener la VM y reevaluar a diario",
  "Sucesso — avaliar extubação": "Éxito — evaluar la extubación",
  "Falha — reconectar e investigar": "Fracaso — reconectar e investigar",
  "Toque nos valores. A ALTURA (não o peso real) define o volume corrente protetor.":
    "Toque los valores. La ALTURA (no el peso real) define el volumen corriente protector.",

  // ── Evidência ──────────────────────────────────────────────────────────────
  "Cada patologia tem alvos próprios de VC, FR, PEEP, I:E e gasometria — escolher orienta os ajustes.":
    "Cada patología tiene objetivos propios de Vt, FR, PEEP, I:E y gasometría — elegirla orienta los ajustes.",
  "SARA → ventilação protetora rigorosa; obstrutivo (asma/DPOC) → expiração longa e PEEP baixo (auto-PEEP); TCE → normoventilação; choque séptico → liberação precoce; ICC/EAP → PEEP mais alto; obeso → PEEP mais alto + ramped.":
    "SDRA → ventilación protectora estricta; obstructivo (asma/EPOC) → espiración prolongada y PEEP bajo (auto-PEEP); TCE → normoventilación; choque séptico → liberación precoz; ICC/EAP → PEEP más alto; obeso → PEEP más alto + posición en rampa.",
  "Pressão de platô (pausa inspiratória de 0,5 s, sem esforço) reflete a pressão alveolar — manter ≤ 30 cmH₂O.":
    "La presión meseta (pausa inspiratoria de 0,5 s, sin esfuerzo) refleja la presión alveolar — mantener ≤ 30 cmH₂O.",
  "Driving pressure = platô − PEEP — quanto menor, melhor (≤ 15 associada a melhor desfecho).":
    "Driving pressure = meseta − PEEP — cuanto menor, mejor (≤ 15 se asocia a mejor desenlace).",
  "Deterioração aguda → DOPES: Deslocamento do tubo, Obstrução, Pneumotórax, Equipamento, empilhamento (Stacking/auto-PEEP).":
    "Deterioro agudo → DOPES: Desplazamiento del tubo, Obstrucción, Neumotórax, Equipo, apilamiento (Stacking/auto-PEEP).",
  "Assincronia comum: trigger delay, esforço ineficaz (missed trigger), duplo disparo, auto-PEEP, fome de fluxo, ciclagem tardia, autociclagem.":
    "Asincronías frecuentes: retraso del disparo, esfuerzo ineficaz (disparo fallido), doble disparo, auto-PEEP, hambre de flujo, ciclado tardío, autociclado.",
  "Elegibilidade (ACCP/ATS 2017): causa reversível/controlada; oxigenação SpO₂ ≥ 90% com FiO₂ ≤ 0,40 e PEEP ≤ 8 (ou P/F ≥ 150–200); hemodinâmica sem vasopressor ou dose baixa estável (NE ≤ 0,1 mcg/kg/min).":
    "Elegibilidad (ACCP/ATS 2017): causa reversible/controlada; oxigenación SpO₂ ≥ 90% con FiO₂ ≤ 0,40 y PEEP ≤ 8 (o P/F ≥ 150–200); hemodinamia sin vasopresor o con dosis baja estable (NA ≤ 0,1 mcg/kg/min).",
  "Neuro: obedece comandos (GCS ≥ 8, RASS ≥ −2); drive inspiratório espontâneo presente.":
    "Neurológico: obedece órdenes (GCS ≥ 8, RASS ≥ −2); impulso inspiratorio espontáneo presente.",
  "Ausência de: agitação incontrolável, convulsão ativa, isquemia miocárdica ativa, sepse não controlada.":
    "Ausencia de: agitación incontrolable, convulsión activa, isquemia miocárdica activa, sepsis no controlada.",
  "TRE bem-sucedido → avaliar extubação (tosse, secreções, via aérea).":
    "PRE exitosa → evaluar la extubación (tos, secreciones, vía aérea).",
  "TRE com falha → reconectar ao ventilador em modo de repouso e investigar a causa.":
    "PRE fallida → reconectar al ventilador en modo de descanso e investigar la causa.",
  "Meta de segurança: pressão de platô ≤ 30 cmH₂O e driving pressure (platô − PEEP) ≤ 15 cmH₂O.":
    "Meta de seguridad: presión meseta ≤ 30 cmH₂O y driving pressure (meseta − PEEP) ≤ 15 cmH₂O.",
  "IRRS (índice de respiração rápida superficial) = FR / VC(L), medido em 1 min de respiração espontânea: < 105 prediz sucesso (S 97%); ≥ 105 = alto risco de falha.":
    "IRRS (índice de respiración rápida superficial) = FR / Vt(L), medido en 1 min de respiración espontánea: < 105 predice éxito (S 97%); ≥ 105 = alto riesgo de fracaso.",
  "Critérios de SUCESSO (30–120 min): SpO₂ ≥ 90%, FR 10–35 sem distress, FC 50–130 sem arritmia nova, PAS 80–180, sem agitação/diaforese, IRRS < 105.":
    "Criterios de ÉXITO (30–120 min): SpO₂ ≥ 90%, FR 10–35 sin distrés, FC 50–130 sin arritmia nueva, PAS 80–180, sin agitación/diaforesis, IRRS < 105.",
  "Critérios de FALHA: SpO₂ < 90% ou PaO₂ < 60, FR > 35 ou < 8, musculatura acessória/paradoxo, agitação/rebaixamento, taquicardia > 140, novas arritmias, hipo/hipertensão grave.":
    "Criterios de FRACASO: SpO₂ < 90% o PaO₂ < 60, FR > 35 o < 8, uso de musculatura accesoria/paradoja, agitación/deterioro del sensorio, taquicardia > 140, arritmias nuevas, hipo/hipertensión grave.",

  // ── Ações ──────────────────────────────────────────────────────────────────
  "Indicação/objetivo: corrigir hipoxemia (P/F < 150–200 refratária), hipoventilação (pH < 7,25–7,30), proteger via aérea (GCS ≤ 8) ou reduzir trabalho respiratório.":
    "Indicación/objetivo: corregir la hipoxemia (P/F < 150–200 refractaria), la hipoventilación (pH < 7,25–7,30), proteger la vía aérea (GCS ≤ 8) o reducir el trabajo respiratorio.",
  "Modo inicial: VCV (garante VC, monitora Pplat/complacência) ou PCV (limita pressão) assistido-controlado. PSV para desmame.":
    "Modo inicial: VCV (garantiza el Vt, monitoriza la Pmeseta/distensibilidad) o PCV (limita la presión) asistido-controlado. PSV para el destete.",
  "Monitorização: capnografia waveform, oximetria, curvas do ventilador. Cabeceira 30–45°.":
    "Monitorización: capnografía con onda, oximetría, curvas del ventilador. Cabecera a 30–45°.",
  "Gasometria arterial 20–30 min após estabilizar os parâmetros.":
    "Gasometría arterial 20–30 min después de estabilizar los parámetros.",
  "Volume corrente: alvo {vc6} mL (6 mL/kg PBW; faixa {vc4}–{vc8} mL = 4–8 mL/kg). NUNCA usar o peso atual, sobretudo em obesos.":
    "Volumen corriente: objetivo {vc6} mL (6 mL/kg de peso predicho; rango {vc4}–{vc8} mL = 4–8 mL/kg). NUNCA usar el peso actual, sobre todo en obesos.",
  "FR 12–16/min (ajustar para PaCO₂ 35–45 e pH 7,35–7,45; vigiar auto-PEEP); relação I:E ~1:2; fluxo 40–60 L/min (VCV).":
    "FR 12–16/min (ajustar para PaCO₂ 35–45 y pH 7,35–7,45; vigilar el auto-PEEP); relación I:E ~1:2; flujo 40–60 L/min (VCV).",
  "PEEP inicial 5 cmH₂O; FiO₂ 1,0 → reduzir o mais rápido possível para SpO₂ 94–98% / PaO₂ 60–100 (evitar hiperóxia).":
    "PEEP inicial 5 cmH₂O; FiO₂ 1,0 → reducir lo más rápido posible hasta SpO₂ 94–98% / PaO₂ 60–100 (evitar la hiperoxia).",
  "Trigger sensível (pressão −1 a −2 cmH₂O ou fluxo 1–3 L/min) sem autociclagem.":
    "Disparo sensible (presión −1 a −2 cmH₂O o flujo 1–3 L/min) sin autociclado.",
  "VC 4–6 mL/kg PBW ({vc4}–{vc6} mL): iniciar em 6, reduzir 1 mL/kg se Pplat > 30 (até 4).":
    "Vt 4–6 mL/kg de peso predicho ({vc4}–{vc6} mL): iniciar en 6, reducir 1 mL/kg si la Pmeseta > 30 (hasta 4).",
  "Pplat ≤ 30 cmH₂O e DRIVING PRESSURE ≤ 15 cmH₂O (preditor mecânico mais forte de mortalidade — Amato 2015).":
    "Pmeseta ≤ 30 cmH₂O y DRIVING PRESSURE ≤ 15 cmH₂O (el predictor mecánico más fuerte de mortalidad — Amato 2015).",
  "NOVA DEFINIÇÃO GLOBAL de SDRA (2024) — amplia Berlim: inclui SDRA NÃO INTUBADA em cateter nasal de alto fluxo ≥ 30 L/min ou VNI/CPAP ≥ 5 cmH₂O; aceita SpO₂/FiO₂ ≤ 315 (quando SpO₂ ≤ 97%) como alternativa ao P/F ≤ 300; aceita ULTRASSOM como imagem; em locais com poucos recursos não exige PEEP nem dispositivo específico.":
    "NUEVA DEFINICIÓN GLOBAL de SDRA (2024) — amplía Berlín: incluye SDRA NO INTUBADA con cánula nasal de alto flujo ≥ 30 L/min o VNI/CPAP ≥ 5 cmH₂O; acepta SpO₂/FiO₂ ≤ 315 (cuando SpO₂ ≤ 97%) como alternativa al P/F ≤ 300; acepta la ECOGRAFÍA como imagen; en entornos con pocos recursos no exige PEEP ni un dispositivo específico.",
  "PEEP por gravidade (tabela PEEP/FiO₂ ARDSNet): leve 5–8 · moderada 8–13 · grave 13–18 cmH₂O. Tendência atual: PEEP mínimo para SpO₂ ≥ 88% sem DP > 15 (ART aumentou mortalidade com recrutamento agressivo).":
    "PEEP según la gravedad (tabla PEEP/FiO₂ de ARDSNet): leve 5–8 · moderada 8–13 · grave 13–18 cmH₂O. Tendencia actual: el PEEP mínimo para SpO₂ ≥ 88% sin driving pressure > 15 (el estudio ART aumentó la mortalidad con reclutamiento agresivo).",
  "FiO₂ mínima para SpO₂ 88–95% / PaO₂ 55–80. FR 12–35 (pH ≥ 7,20 — hipercapnia permissiva, PaCO₂ até 55–60; contraindicada em HIC).":
    "FiO₂ mínima para SpO₂ 88–95% / PaO₂ 55–80. FR 12–35 (pH ≥ 7,20 — hipercapnia permisiva, PaCO₂ hasta 55–60; contraindicada en la HIC).",
  "SARA grave (P/F ≤ 150): posição PRONA ≥ 16 h/dia (PROSEVA, RR 0,61); BNM cisatracúrio × 48 h se dissincronia/drive excessivo; ECMO-VV se refratária (P/F < 80, pH < 7,25 — EOLIA).":
    "SDRA grave (P/F ≤ 150): posición en PRONO ≥ 16 h/día (PROSEVA, RR 0,61); bloqueo neuromuscular con cisatracurio × 48 h si hay asincronía/impulso excesivo; ECMO-VV si es refractaria (P/F < 80, pH < 7,25 — EOLIA).",
  "VC 6–8 mL/kg PBW ({vc6}–{vc8} mL). FR BAIXA — asma 8–12, DPOC 10–14 — para evitar hiperinsuflação.":
    "Vt 6–8 mL/kg de peso predicho ({vc6}–{vc8} mL). FR BAJA — asma 8–12, EPOC 10–14 — para evitar la hiperinsuflación.",
  "I:E 1:3 a 1:4; fluxo inspiratório alto 60–80 L/min para encurtar a inspiração e prolongar a expiração.":
    "I:E 1:3 a 1:4; flujo inspiratorio alto 60–80 L/min para acortar la inspiración y prolongar la espiración.",
  "PEEP: asma 0–5 (mínimo); DPOC 3–8 (PEEP externo ≤ 75–85% do auto-PEEP medido) para reduzir o trabalho sem hiperinsuflar.":
    "PEEP: asma 0–5 (mínimo); EPOC 3–8 (PEEP externo ≤ 75–85% del auto-PEEP medido) para reducir el trabajo sin hiperinsuflar.",
  "Alvos: asma SpO₂ ≥ 90%, PaCO₂ tolerar 60–70, pH ≥ 7,20; DPOC SpO₂ 88–92%, pH ≥ 7,25 (hipercapnia permissiva).":
    "Objetivos: asma SpO₂ ≥ 90%, tolerar PaCO₂ 60–70, pH ≥ 7,20; EPOC SpO₂ 88–92%, pH ≥ 7,25 (hipercapnia permisiva).",
  "Adjuvantes: salbutamol nebulizado no circuito; asma grave → MgSO₄ 2 g IV, ketamina (broncodilatação). DPOC → desmame precoce com VNI pós-extubação.":
    "Adyuvantes: salbutamol nebulizado en el circuito; asma grave → MgSO₄ 2 g IV, ketamina (broncodilatación). EPOC → destete precoz con VNI posextubación.",
  "VC 6–8 mL/kg PBW ({vc6}–{vc8} mL); FR 14–18; I:E 1:2.":
    "Vt 6–8 mL/kg de peso predicho ({vc6}–{vc8} mL); FR 14–18; I:E 1:2.",
  "Alvos: SpO₂ ≥ 95%, PaCO₂ 35–40 mmHg (NORMOventilação), PAM ≥ 80 mmHg.":
    "Objetivos: SpO₂ ≥ 95%, PaCO₂ 35–40 mmHg (NORMOventilación), PAM ≥ 80 mmHg.",
  "Hiperventilar (PaCO₂ 30–35) APENAS em herniação aguda como ponte (< 30 min) — hipocapnia prolongada causa isquemia.":
    "Hiperventilar (PaCO₂ 30–35) SOLO en la herniación aguda como puente (< 30 min) — la hipocapnia prolongada causa isquemia.",
  "Cabeceira 30°; PEEP 5–8 (evitar PEEP alto — pode elevar a PIC).":
    "Cabecera a 30°; PEEP 5–8 (evitar un PEEP alto — puede elevar la PIC).",
  "Evitar hipoxemia e hipotensão (lesão cerebral secundária).":
    "Evitar la hipoxemia y la hipotensión (lesión cerebral secundaria).",
  "VC 6 mL/kg PBW ({vc6} mL); FR 16–20; I:E 1:2; PEEP 5–8 (moderado — evitar reduzir o retorno venoso).":
    "Vt 6 mL/kg de peso predicho ({vc6} mL); FR 16–20; I:E 1:2; PEEP 5–8 (moderado — evitar reducir el retorno venoso).",
  "Alvos: SpO₂ ≥ 94%, PaCO₂ 35–45, lactato em queda.":
    "Objetivos: SpO₂ ≥ 94%, PaCO₂ 35–45, lactato en descenso.",
  "Se evoluir para SARA (P/F ≤ 300) → migrar para a estratégia protetora de SARA.":
    "Si evoluciona a SDRA (P/F ≤ 300) → migrar a la estrategia protectora de SDRA.",
  "VC 6–8 mL/kg PBW ({vc6}–{vc8} mL); FR 12–16; I:E 1:2.":
    "Vt 6–8 mL/kg de peso predicho ({vc6}–{vc8} mL); FR 12–16; I:E 1:2.",
  "PEEP 8–12 cmH₂O: reduz pré/pós-carga do VE e melhora a oxigenação. Cuidado em disfunção de VD (PEEP alto aumenta a pós-carga do VD).":
    "PEEP 8–12 cmH₂O: reduce la pre/poscarga del VI y mejora la oxigenación. Cuidado en la disfunción del VD (un PEEP alto aumenta la poscarga del VD).",
  "Alvos: SpO₂ ≥ 94–96%, PaCO₂ 35–45.": "Objetivos: SpO₂ ≥ 94–96%, PaCO₂ 35–45.",
  "Preferir VNI (CPAP/BiPAP) ANTES da IOT quando possível — reduz intubação no EAP cardiogênico.":
    "Preferir la VNI (CPAP/BiPAP) ANTES de la intubación cuando sea posible — reduce la intubación en el EAP cardiogénico.",
  "VC 6 mL/kg do peso PREDITO ({vc6} mL) — jamais pelo peso atual. FR 14–18.":
    "Vt 6 mL/kg del peso PREDICHO ({vc6} mL) — nunca según el peso actual. FR 14–18.",
  "PEEP mais alto 8–12 cmH₂O para compensar a pressão abdominal e prevenir atelectasia.":
    "PEEP más alto 8–12 cmH₂O para compensar la presión abdominal y prevenir la atelectasia.",
  "Ramped position (cabeceira 30–45°). Recrutamento cauteloso; atelectasia precoce é comum.":
    "Posición en rampa (cabecera a 30–45°). Reclutamiento cauteloso; la atelectasia precoz es frecuente.",
  "Alvos: SpO₂ ≥ 94%, PaCO₂ 35–45. Desmame tende a ser mais lento.":
    "Objetivos: SpO₂ ≥ 94%, PaCO₂ 35–45. El destete suele ser más lento.",
  "VC 6–8 mL/kg PBW ({vc6}–{vc8} mL); FR 12–16; I:E 1:2; PEEP 5 cmH₂O.":
    "Vt 6–8 mL/kg de peso predicho ({vc6}–{vc8} mL); FR 12–16; I:E 1:2; PEEP 5 cmH₂O.",
  "FiO₂ mínima para SpO₂ 94–98% (evitar hiperóxia).":
    "FiO₂ mínima para SpO₂ 94–98% (evitar la hiperoxia).",
  "Pplat ≤ 30 e driving pressure ≤ 15 — vale para todos.":
    "Pmeseta ≤ 30 y driving pressure ≤ 15 — vale para todos.",
  "Pós-operatório cardíaco: extubação precoce (fast-track) < 6 h se estável; monitorar função do VD.":
    "Posoperatorio cardíaco: extubación precoz (fast-track) < 6 h si está estable; monitorizar la función del VD.",
  "Reduzir o VC 1 mL/kg em direção a 4 mL/kg PBW ({vc4} mL); aceitar hipercapnia permissiva (pH ≥ 7,20).":
    "Reducir el Vt 1 mL/kg hacia 4 mL/kg de peso predicho ({vc4} mL); aceptar la hipercapnia permisiva (pH ≥ 7,20).",
  "Diferenciar: Pplat alta = complacência (recrutamento/PEEP, derrame, distensão, edema); pico alto com platô normal = resistência (broncoespasmo, secreção, tubo dobrado/mordido).":
    "Diferenciar: Pmeseta alta = distensibilidad (reclutamiento/PEEP, derrame, distensión, edema); pico alto con meseta normal = resistencia (broncoespasmo, secreciones, tubo acodado/mordido).",
  "Tratar a causa: broncodilatador, aspirar, drenar derrame/pneumotórax, ajustar PEEP.":
    "Tratar la causa: broncodilatador, aspirar, drenar el derrame/neumotórax, ajustar el PEEP.",
  "Reavaliar Pplat e driving pressure após cada ajuste.":
    "Reevaluar la Pmeseta y la driving pressure tras cada ajuste.",
  "Desconectar do ventilador e ventilar com BVM em O₂ 100%. D: posição do tubo (deslocamento/seletivo). O: obstrução/secreção → aspirar, checar dobra/mordida. P: pneumotórax hipertensivo → descompressão (agulha 14G 2º EIC LMC). E: equipamento/circuito. S: auto-PEEP → reduzir FR, prolongar expiração.":
    "Desconectar del ventilador y ventilar con bolsa-válvula-mascarilla con O₂ al 100%. D: posición del tubo (desplazamiento/selectivo). O: obstrucción/secreciones → aspirar, revisar acodamiento/mordida. P: neumotórax a tensión → descompresión (aguja 14G, 2.º EIC línea medioclavicular). E: equipo/circuito. S: auto-PEEP → reducir la FR, prolongar la espiración.",
  "Assincronia — esforço ineficaz/auto-PEEP: reduzir sedação, reduzir auto-PEEP (↓FR, ↑fluxo), ajustar PEEP externo.":
    "Asincronía — esfuerzo ineficaz/auto-PEEP: reducir la sedación, reducir el auto-PEEP (↓FR, ↑flujo), ajustar el PEEP externo.",
  "Assincronia — duplo disparo/fome de fluxo: aumentar Ti/fluxo, mudar para PCV; se drive muito forte na SARA grave, considerar BNM.":
    "Asincronía — doble disparo/hambre de flujo: aumentar el Ti/flujo, cambiar a PCV; si el impulso es muy intenso en la SDRA grave, considerar el bloqueo neuromuscular.",
  "Assincronia — ciclagem tardia (DPOC): reduzir Ti ou critério de ciclagem em PSV (↓% do pico de fluxo).":
    "Asincronía — ciclado tardío (EPOC): reducir el Ti o el criterio de ciclado en PSV (↓% del pico de flujo).",
  "Hipoxemia refratária: ↑PEEP/FiO₂, recrutar com cautela, prona/BNM; reavaliar gasometria.":
    "Hipoxemia refractaria: ↑PEEP/FiO₂, reclutar con cautela, prono/bloqueo neuromuscular; reevaluar la gasometría.",
  "Antes: SAT (suspender a sedação) bem-sucedido. Método: PSV 5–8 cmH₂O + PEEP 5 por 30–120 min (equivalente ao tubo T e mais confortável) ou peça em T.":
    "Antes: prueba de despertar espontáneo (suspender la sedación) exitosa. Método: PSV 5–8 cmH₂O + PEEP 5 durante 30–120 min (equivalente al tubo en T y más cómodo) o pieza en T.",
  "Tosse eficaz ao comando (tosse fraca prediz falha); secreções manejáveis sem aspiração excessiva; ausência de obstrução de VA.":
    "Tos eficaz a la orden (la tos débil predice el fracaso); secreciones manejables sin aspiración excesiva; ausencia de obstrucción de la vía aérea.",
  "Teste de cuff leak (se suspeita de edema subglótico): desinsuflar o cuff → diferença VC inspirado − expirado > 110 mL = leak adequado. Sem leak: dexametasona 8 mg IV/6 h × 24 h antes da extubação.":
    "Prueba de fuga del neumotaponamiento (si se sospecha edema subglótico): desinflar el balón → diferencia entre el Vt inspirado y el espirado > 110 mL = fuga adecuada. Sin fuga: dexametasona 8 mg IV cada 6 h × 24 h antes de la extubación.",
  "VNI profilática pós-extubação se alto risco (DPOC, IC, P/F < 150, hipercapnia crônica, obeso, ≥ 2 fatores) — reduz reintubação (EPICO). HFN para hipoxemia moderada (OPERA).":
    "VNI profiláctica posextubación si hay alto riesgo (EPOC, insuficiencia cardíaca, P/F < 150, hipercapnia crónica, obesidad, ≥ 2 factores) — reduce la reintubación (EPICO). Cánula nasal de alto flujo para la hipoxemia moderada (OPERA).",
  "Estridor pós-extubação: adrenalina 5 mL (1:1.000) NBZ + dexametasona IV; reintubar se sem melhora em 30 min.":
    "Estridor posextubación: adrenalina 5 mL (1:1.000) nebulizada + dexametasona IV; reintubar si no mejora en 30 min.",
  "Monitorar nas primeiras horas — reintubação é fator de pior prognóstico.":
    "Monitorizar en las primeras horas — la reintubación es un factor de peor pronóstico.",
  "Reconectar ao ventilador em modo de repouso confortável (ex.: PSV com suporte adequado) por ~24 h.":
    "Reconectar al ventilador en un modo de descanso cómodo (p. ej., PSV con soporte adecuado) durante ~24 h.",
  "Investigar a causa da falha: sobrecarga cardíaca (disfunção de VE no desmame), fraqueza muscular/ICU-AW, sedação residual, distúrbio metabólico, infecção, hiper/hipovolemia.":
    "Investigar la causa del fracaso: sobrecarga cardíaca (disfunción del VI durante el destete), debilidad muscular adquirida en la UCI, sedación residual, trastorno metabólico, infección, hiper/hipovolemia.",
  "Otimizar: balanço hídrico, eletrólitos, nutrição (proteína 1,3 g/kg/dia), mobilização precoce, reduzir sedação.":
    "Optimizar: balance hídrico, electrolitos, nutrición (proteínas 1,3 g/kg/día), movilización precoz, reducir la sedación.",
  "Repetir o TRE diariamente quando os critérios de elegibilidade voltarem a ser preenchidos.":
    "Repetir la PRE a diario cuando vuelvan a cumplirse los criterios de elegibilidad.",
  "Bundle ABCDEF (avaliar dor, SAT+SBT, escolha de sedação, delirium, mobilização precoce, família) e bundle PAV (cabeceira 30–45°, higiene oral com clorexidina, aspiração subglótica, checagem do cuff 20–30 cmH₂O).":
    "Paquete ABCDEF (evaluar el dolor, pruebas de despertar y respiración espontánea, elección de la sedación, delirio, movilización precoz, familia) y paquete de prevención de NAV (cabecera a 30–45°, higiene oral con clorhexidina, aspiración subglótica, control del balón a 20–30 cmH₂O).",
  "Gasometria e mecânica seriadas; ajustar conforme evolução. Traqueostomia se VM > 7–14 dias prevista.":
    "Gasometría y mecánica seriadas; ajustar según la evolución. Traqueostomía si se prevé VM > 7–14 días.",
  "Reavaliar diariamente a prontidão para desmame quando a causa estiver controlada.":
    "Reevaluar a diario la disposición para el destete cuando la causa esté controlada.",
  "Monitorizar SpO₂, FR, esforço respiratório e estridor nas primeiras 24–48 h (maior risco de reintubação).":
    "Monitorizar la SpO₂, la FR, el esfuerzo respiratorio y el estridor en las primeras 24–48 h (mayor riesgo de reintubación).",
  "Manter VNI/HFN profilático nos pacientes de alto risco conforme indicado.":
    "Mantener la VNI/cánula nasal de alto flujo profiláctica en los pacientes de alto riesgo según esté indicado.",
  "Fisioterapia respiratória e motora; reavaliar deglutição antes de dieta VO.":
    "Fisioterapia respiratoria y motora; reevaluar la deglución antes de iniciar la dieta por vía oral.",
  "Reintubar prontamente se falha respiratória — não retardar.":
    "Reintubar de inmediato si hay fracaso respiratorio — no demorar.",
  "Sedação leve (RASS −2 a 0); liberação precoce da VM quando estabilizar.": "Sedación ligera (RASS −2 a 0); liberación precoz de la VM cuando se estabilice.",
  "Parâmetros protetores (Pplat ≤ 30, DP ≤ 15) e analgosedação leve (RASS −2 a 0); SAT/SBT diários.": "Parámetros protectores (Pmeseta ≤ 30, driving pressure ≤ 15) y analgosedación ligera (RASS −2 a 0); pruebas diarias de despertar y de respiración espontánea.",
};
