/**
 * Vasoativos e sedoanalgesia — strings que vivem como ELEMENTOS DE ARRAY
 * (reference.notes, info, strategy, alert.lines…) — dicionário PT → ES.
 *
 * Estas escaparam de todos os blocos anteriores porque o extrator só procurava
 * o formato `campo: "valor"`, nunca strings soltas dentro de arrays. O ponto de
 * render já chamava tr(); faltava a entrada no dicionário.
 */
export const ES_ARRAYS_CALCULADORAS: Record<string, string> = {
  // ══ Vasoativos — referência clínica por droga ══════════════════════════════
  "Objetivo inicial: PAM ≥ 65 mmHg (SSC 2021 — vasopressor de 1ª linha em choque séptico).":
    "Objetivo inicial: PAM ≥ 65 mmHg (SSC 2021 — vasopresor de 1.ª línea en el choque séptico).",
  "⚠️ Dose excepcional (> 1–3 mcg/kg/min): eficiência reduzida por saturação de receptores — adicionar vasopressina 0,03 U/min, considerar hidrocortisona 200 mg/dia e angiotensina II se disponível (estratégia multimodal).":
    "⚠️ Dosis excepcional (> 1–3 mcg/kg/min): eficacia reducida por saturación de receptores — añadir vasopresina 0,03 U/min, considerar hidrocortisona 200 mg/día y angiotensina II si está disponible (estrategia multimodal).",
  "Choque séptico (SSC 2021): dose fixa de 0,03 U/min — NÃO titular como vasopressor principal; usar como adjuvante para poupar noradrenalina.":
    "Choque séptico (SSC 2021): dosis fija de 0,03 U/min — NO titularla como vasopresor principal; usarla como adyuvante para ahorrar noradrenalina.",
  "Agonista alfa-1 PURO — sem efeito beta: causa bradicardia reflexa (reduz FC).":
    "Agonista alfa-1 PURO — sin efecto beta: causa bradicardia refleja (reduce la FC).",
  "Desvantagem: pode reduzir débito cardíaco por aumento da pós-carga — avaliar função ventricular antes.":
    "Desventaja: puede reducir el gasto cardíaco por aumento de la poscarga — evaluar antes la función ventricular.",
  "Doses altas (> 150 mcg/min): vasodilatação arterial — reduz pós-carga.":
    "Dosis altas (> 150 mcg/min): vasodilatación arterial — reduce la poscarga.",
  "Indicações: EPA hipertensivo, SCA com IC/angina, emergência hipertensiva.":
    "Indicaciones: edema agudo de pulmón hipertensivo, SCA con insuficiencia cardíaca o angina, y emergencia hipertensiva.",
  "Indicações: ICC descompensada grave, choque cardiogênico, desmame de suporte circulatório mecânico.":
    "Indicaciones: insuficiencia cardíaca descompensada grave, choque cardiogénico y retirada del soporte circulatorio mecánico.",
  "Indicações: emergência hipertensiva, dissecção de aorta, IC aguda grave com PAM muito elevada.":
    "Indicaciones: emergencia hipertensiva, disección de aorta e insuficiencia cardíaca aguda grave con PAM muy elevada.",
  "Monitorar PA durante infusão — pode necessitar suporte vasopressor.":
    "Monitorizar la PA durante la infusión — puede requerir soporte vasopresor.",
  "Monitorar frequência cardíaca, pressão arterial e lactato.":
    "Monitorizar la frecuencia cardíaca, la presión arterial y el lactato.",
  "Se houver hipotensão, associar vasopressor (noradrenalina 1ª linha).":
    "Si hay hipotensión, asociar un vasopresor (noradrenalina de 1.ª línea).",
  "Segunda linha em choque séptico vs. noradrenalina — evidência menor.":
    "Segunda línea en el choque séptico frente a la noradrenalina — menor evidencia.",
  "⚠️ Segunda linha para choque séptico — SSC 2021 prefere noradrenalina; usar dopamina apenas se contraindicação ou indisponibilidade.":
    "⚠️ Segunda línea para el choque séptico — la SSC 2021 prefiere la noradrenalina; usar dopamina solo si hay contraindicación o no está disponible.",
  "Dose de ataque frequentemente OMITIDA em pacientes instáveis — risco de hipotensão.":
    "La dosis de carga se OMITE con frecuencia en pacientes inestables — riesgo de hipotensión.",
  "⚠️ Dose de ataque (50 mcg/kg em 10 min) pode causar hipotensão — considerar omitir em pacientes instáveis.":
    "⚠️ La dosis de carga (50 mcg/kg en 10 min) puede causar hipotensión — considerar omitirla en pacientes inestables.",
  "Efeito persiste horas após suspensão (meia-vida longa) — desmame gradual.":
    "El efecto persiste horas tras la suspensión (vida media larga) — retirada gradual.",
  "⚠️ FOTOSSENSÍVEL — enrolar equipo e seringa em papel alumínio.":
    "⚠️ FOTOSENSIBLE — envolver el equipo y la jeringa en papel de aluminio.",
  "⚠️ NÃO usar equipo de PVC — usar vidro ou polietileno.":
    "⚠️ NO usar equipo de PVC — usar vidrio o polietileno.",
  "Usar SG 5% SOMENTE — precipita com SF.":
    "Usar SOLO dextrosa al 5% — precipita con la solución fisiológica.",

  // ══ Vasoativos — instruções da interface ══════════════════════════════════
  "Escolha entre calcular a taxa da bomba a partir da dose ou converter mL por hora em dose.":
    "Elija entre calcular la velocidad de la bomba a partir de la dosis o convertir los mL por hora en dosis.",
  "Escolha uma solução padrão ou montagem manual.":
    "Elija una solución estándar o el armado manual.",
  "Nenhum preparo confirmado ainda.": "Aún no se confirmó ninguna preparación.",
  "Revisar perfusão, hemodinâmica e metas clínicas antes de aplicar.":
    "Revisar la perfusión, la hemodinamia y las metas clínicas antes de administrarlo.",
  "Use o painel para revisar preparo, concentração e resultado.":
    "Use el panel para revisar la preparación, la concentración y el resultado.",

  // ══ Sedoanalgesia — perfil de cada fármaco ════════════════════════════════
  "Hipnótico de início ultrarrápido e despertar rápido — sedação de curta/média duração na UTI e em procedimentos.":
    "Hipnótico de inicio ultrarrápido y despertar rápido — sedación de corta o media duración en la UCI y en procedimientos.",
  "Benzodiazepínico para sedação — útil em abstinência alcoólica, status epilepticus e quando se deseja amnésia.":
    "Benzodiacepina para sedación — útil en la abstinencia alcohólica, el estado epiléptico y cuando se busca amnesia.",
  "Anestésico dissociativo com analgesia potente e broncodilatação; preserva drive e pressão (simpatomimético).":
    "Anestésico disociativo con analgesia potente y broncodilatación; preserva el impulso respiratorio y la presión (simpaticomimético).",
  "Agonista α-2: sedação com analgesia preservando o drive respiratório — paciente comunicativo (RASS 0/−1).":
    "Agonista α-2: sedación con analgesia preservando el impulso respiratorio — paciente comunicativo (RASS 0/−1).",
  "Opioide de 1ª linha para analgesia em VM (analgosedação) — analgesia primeiro, sedação depois.":
    "Opioide de 1.ª línea para la analgesia en ventilación mecánica (analgosedación) — primero la analgesia, después la sedación.",
  "Opioide para analgesia moderada a intensa; útil também no edema agudo de pulmão (alívio + venodilatação).":
    "Opioide para analgesia de moderada a intensa; útil también en el edema agudo de pulmón (alivio + venodilatación).",
  "BNM adespolarizante de início rápido — alternativa à succinilcolina na ISR (1,2 mg/kg).":
    "Bloqueante neuromuscular no despolarizante de inicio rápido — alternativa a la succinilcolina en la ISR (1,2 mg/kg).",
  "BNM de escolha para infusão prolongada em UTI — eliminação de Hofmann (independe de rim e fígado).":
    "Bloqueante neuromuscular de elección para la infusión prolongada en la UCI — eliminación de Hofmann (independiente del riñón y del hígado).",
  "BNM adespolarizante com eliminação de Hofmann; alternativa quando cisatracúrio indisponível.":
    "Bloqueante neuromuscular no despolarizante con eliminación de Hofmann; alternativa cuando no hay cisatracurio.",

  // ══ Sedoanalgesia — doses e modo de uso ═══════════════════════════════════
  "Indução: 1–2 mg/kg IV em 60 s.": "Inducción: 1–2 mg/kg IV en 60 s.",
  "Iniciar direto na manutenção (sem bolus de ataque em UTI).":
    "Iniciar directamente con el mantenimiento (sin bolo de carga en la UCI).",
  "Sedação / ansiólise: 0,01–0,05 mg/kg IV lento (titular).":
    "Sedación / ansiólisis: 0,01–0,05 mg/kg IV lento (titular).",
  "Analgesia: 1–2 mcg/kg IV lento (2–3 min).":
    "Analgesia: 1–2 mcg/kg IV lento (2–3 min).",
  "Co-indutor ISR: 2–3 mcg/kg.": "Coinductor en la ISR: 2–3 mcg/kg.",
  "2–4 mg IV lento (5 min) — repetir a cada 4 h se necessário.":
    "2–4 mg IV lento (5 min) — repetir cada 4 h si es necesario.",
  "ISR: 1,2 mg/kg IV em bolus ultrarrápido (da ampola pura 10 mg/mL).":
    "ISR: 1,2 mg/kg IV en bolo ultrarrápido (de la ampolla pura de 10 mg/mL).",
  "Bolus calculado a partir da ampola PURA (10 mg/mL).":
    "Bolo calculado a partir de la ampolla PURA (10 mg/mL).",
  "1 mL = 50 mcg na apresentação padrão.":
    "1 mL = 50 mcg en la presentación estándar.",
  "Protocolo ACURASYS: 37,5 mg/h × 48 h na SARA grave.":
    "Protocolo ACURASYS: 37,5 mg/h × 48 h en la SDRA grave.",
  "NÃO usar bolus de ataque em UTI (risco de bradicardia grave e hipotensão).":
    "NO usar bolo de carga en la UCI (riesgo de bradicardia grave e hipotensión).",

  // ══ Sedoanalgesia — farmacocinética e alertas ═════════════════════════════
  "Início 1–3 min; pico em 3–5 min. Bolus rápido pode causar hipotensão/depressão respiratória.":
    "Inicio en 1–3 min; pico en 3–5 min. Un bolo rápido puede causar hipotensión o depresión respiratoria.",
  "Início ~30–60 s; duração 10–20 min.": "Inicio ~30–60 s; duración 10–20 min.",
  "Início de ação mais lento que o fentanil.":
    "Inicio de acción más lento que el del fentanilo.",
  "Acúmulo significativo após 24–48 h (metabólito ativo 1-OH-midazolam).":
    "Acumulación significativa tras 24–48 h (metabolito activo 1-OH-midazolam).",
  "Meia-vida contexto-sensível aumenta com infusões longas.":
    "La vida media contexto-sensible aumenta con las infusiones prolongadas.",
  "Meia-vida aumenta em insuficiência hepática e renal.":
    "La vida media aumenta en la insuficiencia hepática y renal.",
  "Metabólito ativo (M6G) acumula em IRA — preferir fentanil.":
    "El metabolito activo (M6G) se acumula en la lesión renal aguda — preferir el fentanilo.",
  "Não tem metabólito ativo relevante — preferível à morfina em IRA.":
    "No tiene un metabolito activo relevante — preferible a la morfina en la lesión renal aguda.",
  "Causa hipotensão dose-dependente — cuidado em instável; associar vasopressor se necessário.":
    "Causa hipotensión dosis-dependiente — cuidado en el paciente inestable; asociar un vasopresor si es necesario.",
  "Emulsão lipídica: 1 mL = ~1,1 kcal — descontar do suporte nutricional.":
    "Emulsión lipídica: 1 mL = ~1,1 kcal — descontarlo del soporte nutricional.",
  "Síndrome do propofol: doses > 5 mg/kg/h (≈ 83 mcg/kg/min) por > 48 h — monitorar triglicerídeos, CPK e pH/lactato.":
    "Síndrome por infusión de propofol: dosis > 5 mg/kg/h (≈ 83 mcg/kg/min) durante > 48 h — monitorizar triglicéridos, CPK y pH/lactato.",
  "pH ácido — dor na injeção (lidocaína prévia reduz).":
    "pH ácido — dolor en la inyección (la lidocaína previa lo reduce).",
  "Antídoto: flumazenil 0,2 mg IV (repetir até 1 mg).":
    "Antídoto: flumazenilo 0,2 mg IV (repetir hasta 1 mg).",
  "Aumenta secreções (pré-medicar atropina 0,01 mg/kg se necessário).":
    "Aumenta las secreciones (premedicar con atropina 0,01 mg/kg si es necesario).",
  "Disforia pós-uso em adultos — mitigar com benzodiazepínico.":
    "Disforia tras su uso en adultos — mitigarla con una benzodiacepina.",
  "Reduz consumo de opioide (opioid-sparing) em dose subanestésica.":
    "Reduce el consumo de opioides (efecto ahorrador) en dosis subanestésica.",
  "Rigidez torácica com bolus IV rápido em dose alta (> 5 mcg/kg).":
    "Rigidez torácica con bolo IV rápido en dosis alta (> 5 mcg/kg).",
  "Histaminoliberação dose-dependente — hipotensão, broncoespasmo, flushing (sobretudo em bolus rápido).":
    "Liberación de histamina dosis-dependiente — hipotensión, broncoespasmo y rubor (sobre todo con bolo rápido).",
  "Histaminoliberação: pode causar hipotensão e broncoespasmo.":
    "Liberación de histamina: puede causar hipotensión y broncoespasmo.",
  "Preferir cisatracúrio na UTI (sem histaminoliberação).":
    "Preferir el cisatracurio en la UCI (sin liberación de histamina).",
  "Refrigerar (2–8 °C); monitorar com TOF.":
    "Refrigerar (2–8 °C); monitorizar con TOF.",
  "Monitorar com neuroestimulador (TOF).":
    "Monitorizar con neuroestimulador (TOF).",
  "Titular pelo RASS; vigiar acúmulo em disfunção hepática/renal.":
    "Titular según el RASS; vigilar la acumulación en la disfunción hepática o renal.",
  "MgSO₄ potencializa — reduzir dose 30–50% (ex.: eclâmpsia). Monitorar TOF.":
    "El MgSO₄ lo potencia — reducir la dosis un 30–50% (p. ej., en la eclampsia). Monitorizar con TOF.",
  "NUNCA bloquear sem garantir sedação e analgesia adequadas (paciente acordado paralisado).":
    "NUNCA bloquear sin asegurar una sedación y analgesia adecuadas (paciente despierto y paralizado).",
  "NÃO tem antídoto específico — aguardar metabolismo (Hofmann). Neostigmina com cautela para reversão parcial.":
    "NO tiene antídoto específico — esperar el metabolismo (Hofmann). Neostigmina con cautela para la reversión parcial.",
  "ANTÍDOTO SUGAMADEX — CICO/emergência: 16 mg/kg IV (70 kg = 1.120 mg); profunda: 4 mg/kg; moderada (T2): 2 mg/kg. Reversão < 3 min.":
    "ANTÍDOTO SUGAMMADEX — CICO/emergencia: 16 mg/kg IV (70 kg = 1.120 mg); bloqueo profundo: 4 mg/kg; moderado (T2): 2 mg/kg. Reversión en < 3 min.",

  // ══ Sedoanalgesia — indicações destacadas ═════════════════════════════════
  "✅ ISR em paciente instável (indutor de escolha).":
    "✅ ISR en el paciente inestable (inductor de elección).",
  "✅ Broncoespasmo grave / status asmático.":
    "✅ Broncoespasmo grave / estado asmático.",
  "✅ Desmame de VM (preserva drive respiratório).":
    "✅ Destete de la ventilación mecánica (preserva el impulso respiratorio).",
  "✅ Opioid-sparing; sedação com paciente comunicativo.":
    "✅ Ahorrador de opioides; sedación con el paciente comunicativo.",
  "✅ BNM de escolha em UTI para infusão prolongada.":
    "✅ Bloqueante neuromuscular de elección en la UCI para la infusión prolongada.",
  "✅ Eliminação de Hofmann — independe de função renal/hepática.":
    "✅ Eliminación de Hofmann — independiente de la función renal y hepática.",
};
