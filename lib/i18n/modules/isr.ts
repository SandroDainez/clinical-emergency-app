/**
 * ISR — Intubação de Sequência Rápida — dicionário PT → ES.
 * Terminologia: ISR (intubación de secuencia rápida), preoxigenación,
 * videolaringoscopio, cricotiroidotomía, capnografía, CNAF.
 * Tokens de dose por peso preservados.
 */
export const ES_ISR: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Preparação — indicação e plano": "Preparación — indicación y plan",
  "Dados do paciente": "Datos del paciente",
  "Pré-oxigenação": "Preoxigenación",
  "Via aérea difícil prevista?": "¿Vía aérea difícil prevista?",
  "Via aérea difícil — preparar resgate": "Vía aérea difícil — preparar el rescate",
  "Otimização hemodinâmica": "Optimización hemodinámica",
  "Reanimar antes de intubar": "Reanimar antes de intubar",
  "Pré-tratamento — uso seletivo por cenário": "Pretratamiento — uso selectivo según el escenario",
  "Agente de indução": "Agente de inducción",
  "Indução — paciente estável": "Inducción — paciente estable",
  "Cetamina — dose calculada": "Ketamina — dosis calculada",
  "Bloqueador neuromuscular": "Bloqueante neuromuscular",
  "Succinilcolina — dose calculada": "Succinilcolina — dosis calculada",
  "Rocurônio — dose calculada": "Rocuronio — dosis calculada",
  "Posicionamento e passagem do tubo": "Posicionamiento y paso del tubo",
  "Confirmação (Prova)": "Confirmación (comprobación)",
  "Sem confirmação — corrigir e reoxigenar": "Sin confirmación — corregir y reoxigenar",
  "Consegue oxigenar/ventilar?": "¿Logra oxigenar/ventilar?",
  "CICO — declarar via aérea difícil": "CICO — declarar vía aérea difícil",
  "Via aérea cirúrgica — cricotireoidostomia": "Vía aérea quirúrgica — cricotiroidotomía",
  "Manejo pós-intubação": "Manejo posintubación",
  "UTI / cuidado pós-intubação": "UCI / cuidado posintubación",
  "ISR — Via aérea": "ISR — Vía aérea",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "Há preditores de via aérea/ventilação difícil (LEMON / MOANS)?":
    "¿Hay predictores de vía aérea/ventilación difícil (LEMON / MOANS)?",
  "Há instabilidade (PAS < 90 / choque / hipoperfusão)?":
    "¿Hay inestabilidad (PAS < 90 / choque / hipoperfusión)?",
  "Qual o perfil hemodinâmico para escolher o indutor?":
    "¿Cuál es el perfil hemodinámico para elegir el inductor?",
  "A succinilcolina está contraindicada?": "¿La succinilcolina está contraindicada?",
  "A capnografia (ETCO₂) confirma a posição traqueal?":
    "¿La capnografía (ETCO₂) confirma la posición traqueal?",
  "Após a falha, é possível manter a oxigenação (BVM ou máscara laríngea)?":
    "Tras el fracaso, ¿es posible mantener la oxigenación (bolsa-válvula-mascarilla o mascarilla laríngea)?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Indicação de via aérea definitiva (FLOW) + checklist SOAP-ME antes de qualquer droga.":
    "Indicación de vía aérea definitiva (FLOW) + lista de verificación SOAP-ME antes de cualquier fármaco.",
  "Maximizar a reserva de O₂ para tolerar apneia segura. Alvo SpO₂ ≥ 95% (idealmente ≥ 98%) antes de induzir.":
    "Maximizar la reserva de O₂ para tolerar una apnea segura. Objetivo SpO₂ ≥ 95% (idealmente ≥ 98%) antes de inducir.",
  "Não bloquear sem um plano de resgate definido.":
    "No bloquear sin un plan de rescate definido.",
  "PAS informada: {pas} mmHg.": "PAS informada: {pas} mmHg.",
  "Estabilizar a hemodinâmica antes da indução — indução + pressão positiva pioram a hipotensão e podem causar PCR peri-intubação.":
    "Estabilizar la hemodinamia antes de la inducción — la inducción + la presión positiva empeoran la hipotensión y pueden causar un paro periintubación.",
  "Adjuvantes opcionais, ~3 min antes da indução. Pular se não houver indicação específica.":
    "Adyuvantes opcionales, ~3 min antes de la inducción. Omitirlos si no hay una indicación específica.",
  "Propofol ou etomidato. Administrar imediatamente antes do bloqueador.":
    "Propofol o etomidato. Administrar inmediatamente antes del bloqueante.",
  "Preferida na instabilidade — simpatomimético, preserva a PA. Broncodilatadora.":
    "Preferida en la inestabilidad — simpaticomimética, preserva la PA. Broncodilatadora.",
  "Início rápido e duração ultracurta (8–12 min). Máx 200 mg.":
    "Inicio rápido y duración ultracorta (8–12 min). Máx. 200 mg.",
  "Alternativa segura quando a SCh é contraindicada. Antídoto: sugamadex.":
    "Alternativa segura cuando la succinilcolina está contraindicada. Antídoto: sugammadex.",
  "Aguardar relaxamento (45–60 s). Tentativa otimizada; limitar a apneia. Máx 2 tentativas por operador/dispositivo.":
    "Esperar la relajación (45–60 s). Intento optimizado; limitar la apnea. Máx. 2 intentos por operador/dispositivo.",
  "Não insistir às cegas. Remover tubo esofágico, reoxigenar e reabordar com plano B.":
    "No insistir a ciegas. Retirar el tubo esofágico, reoxigenar y reabordar con el plan B.",
  "Não intuba, não ventila, SpO₂ caindo. Chamar ajuda e preparar via aérea cirúrgica.":
    "No se intuba, no se ventila, SpO₂ en descenso. Pedir ayuda y preparar la vía aérea quirúrgica.",
  "SpO₂ em queda e todas as tentativas falharam → não retardar.":
    "SpO₂ en descenso y todos los intentos fallaron → no demorar.",
  "Iniciar sedoanalgesia IMEDIATAMENTE. Fixar, ventilar com segurança e tratar hipotensão.":
    "Iniciar la sedoanalgesia DE INMEDIATO. Fijar, ventilar con seguridad y tratar la hipotensión.",
  "Paciente intubado → monitorização intensiva.": "Paciente intubado → monitorización intensiva.",

  // ── Campos e opções ────────────────────────────────────────────────────────
  "Peso estimado": "Peso estimado",
  "PA sistólica": "PA sistólica",
  "SpO₂": "SpO₂",
  "Sim — preditores presentes": "Sí — hay predictores",
  "Não — via aparentemente fácil": "No — vía aparentemente fácil",
  "Sim — instável": "Sí — inestable",
  "Não — estável": "No — estable",
  "Estável → propofol / etomidato": "Estable → propofol / etomidato",
  "Instável / choque → cetamina (ou etomidato)": "Inestable / choque → ketamina (o etomidato)",
  "Não — usar succinilcolina": "No — usar succinilcolina",
  "Sim — usar rocurônio": "Sí — usar rocuronio",
  "Sim — ETCO₂ confirma traqueia": "Sí — el ETCO₂ confirma la tráquea",
  "Não — sem confirmação / esôfago": "No — sin confirmación / esófago",
  "Sim — oxigenando: nova tentativa com plano B":
    "Sí — oxigenando: nuevo intento con el plan B",
  "Não — CICO (não intuba, não ventila)": "No — CICO (no se intuba, no se ventila)",
  "Toque nos valores (ou adicione). O peso calcula as doses; a PA orienta o indutor.":
    "Toque los valores (o agréguelos). El peso calcula las dosis; la PA orienta la elección del inductor.",

  // ── Evidência ──────────────────────────────────────────────────────────────
  "LEMON: Look (anatomia), Evaluate 3-3-2, Mallampati, Obstrução, Neck (mobilidade).":
    "LEMON: Look (anatomía), Evaluate 3-3-2, Mallampati, Obstrucción, Neck (movilidad cervical).",
  "MOANS (ventilação com máscara difícil): Mask seal, Obesidade/Obstrução, Age > 55, No teeth, Stiffness.":
    "MOANS (ventilación con mascarilla difícil): sellado de la Mascarilla, Obesidad/Obstrucción, Age > 55, No teeth (sin dientes), Stiffness (rigidez).",
  "Via difícil prevista muda a estratégia: ajuda, videolaringoscopia, plano de resgate, eventual via acordada.":
    "Una vía difícil prevista cambia la estrategia: ayuda, videolaringoscopia, plan de rescate y eventual intubación con el paciente despierto.",
  "'Reanimar antes de intubar': a indução + pressão positiva pioram a hipotensão e podem causar PCR peri-intubação.":
    "'Reanimar antes de intubar': la inducción + la presión positiva empeoran la hipotensión y pueden causar un paro periintubación.",
  "Otimizar pré-carga e PA reduz o risco de colapso após a indução.":
    "Optimizar la precarga y la PA reduce el riesgo de colapso tras la inducción.",
  "ESTÁVEL: propofol {propInd} mg (1,5–2 mg/kg) — início ultrarrápido, reduz PIC/PIO, antiemético; ou etomidato {etom} mg (0,3 mg/kg) — hemodinamicamente neutro.":
    "ESTABLE: propofol {propInd} mg (1,5–2 mg/kg) — inicio ultrarrápido, reduce la PIC/PIO, antiemético; o etomidato {etom} mg (0,3 mg/kg) — hemodinámicamente neutro.",
  "INSTÁVEL/choque: cetamina {ketaShock} mg (1 mg/kg; 0,5 mg/kg em choque grave) ou etomidato {etom} mg. EVITAR propofol e midazolam (hipotensão).":
    "INESTABLE/choque: ketamina {ketaShock} mg (1 mg/kg; 0,5 mg/kg en choque grave) o etomidato {etom} mg. EVITAR el propofol y el midazolam (hipotensión).",
  "Cenários: asma/broncoespasmo → cetamina {ketaAsma} mg (2 mg/kg, broncodilatação); TCE/HIC → cetamina (segura com ventilação normal) ou propofol; status epilepticus → propofol ou midazolam; coronariopatia/HAS → etomidato ou cetamina+fentanil.":
    "Escenarios: asma/broncoespasmo → ketamina {ketaAsma} mg (2 mg/kg, broncodilatación); TCE/HIC → ketamina (segura con ventilación normal) o propofol; estado epiléptico → propofol o midazolam; coronariopatía/HTA → etomidato o ketamina + fentanilo.",
  "Fentanil NÃO é hipnótico — usar SEMPRE com um indutor, nunca isolado.":
    "El fentanilo NO es un hipnótico — usarlo SIEMPRE con un inductor, nunca solo.",
  "Contraindicações ABSOLUTAS da succinilcolina (usar rocurônio): hipercalemia (K⁺ > 5,5) ou risco; queimadura grave > 24 h até 1 ano; imobilização prolongada > 48–72 h (TCE, AVC, lesão medular); rabdomiólise/esmagamento; distrofias musculares (Duchenne/Becker); miotonia; hipertermia maligna (pessoal/familiar); pseudocolinesterase atípica; trauma ocular aberto.":
    "Contraindicaciones ABSOLUTAS de la succinilcolina (usar rocuronio): hiperpotasemia (K⁺ > 5,5) o riesgo de ella; quemadura grave de > 24 h hasta 1 año; inmovilización prolongada > 48–72 h (TCE, ACV, lesión medular); rabdomiólisis/aplastamiento; distrofias musculares (Duchenne/Becker); miotonía; hipertermia maligna (personal/familiar); seudocolinesterasa atípica; trauma ocular abierto.",
  "Succinilcolina: início 45–60 s, duração ultracurta 8–12 min. Sem antídoto.":
    "Succinilcolina: inicio 45–60 s, duración ultracorta 8–12 min. Sin antídoto.",
  "Rocurônio 1,2 mg/kg: início 45–60 s, duração 45–70 min. Antídoto: sugamadex 16 mg/kg reverte em < 3 min — com sugamadex disponível, mesma segurança que SCh.":
    "Rocuronio 1,2 mg/kg: inicio 45–60 s, duración 45–70 min. Antídoto: sugammadex 16 mg/kg revierte en < 3 min — con sugammadex disponible, tiene la misma seguridad que la succinilcolina.",
  "Capnografia waveform é o padrão-ouro: onda de ETCO₂ persistente em ≥ 6 ventilações.":
    "La capnografía con onda es el estándar de oro: onda de ETCO₂ persistente durante ≥ 6 ventilaciones.",
  "Confirmar também: ausculta 5 pontos (epigástrio + 2 axilas + 2 ápices), expansão torácica simétrica, condensação no tubo, SpO₂ mantendo/subindo; RX (tubo 2–3 cm acima da carina).":
    "Confirmar también: auscultación en 5 puntos (epigastrio + 2 axilas + 2 ápices), expansión torácica simétrica, condensación en el tubo, SpO₂ que se mantiene o sube; radiografía (tubo 2–3 cm por encima de la carina).",
  "ETCO₂ ausente = esôfago até prova em contrário.":
    "ETCO₂ ausente = esófago hasta demostrar lo contrario.",
  "Já houve falha de tentativas de IOT — a decisão agora é se há oxigenação adequada.":
    "Ya hubo intentos fallidos de intubación — ahora la decisión es si hay oxigenación adecuada.",
  "Oxigenando = há tempo para nova tentativa otimizada com plano B (VL, bougie, ML).":
    "Si se oxigena = hay tiempo para un nuevo intento optimizado con el plan B (videolaringoscopio, bougie, mascarilla laríngea).",
  "NÃO oxigena (CICO — cannot intubate, cannot oxygenate) com SpO₂ caindo = via aérea cirúrgica imediata.":
    "NO se oxigena (CICO — no se puede intubar, no se puede oxigenar) con SpO₂ en descenso = vía aérea quirúrgica inmediata.",

  // ── Ações ──────────────────────────────────────────────────────────────────
  "Confirmar a indicação (mnemônico FLOW): Failure (falência ventilatória — apneia, PaCO₂ > 55 + pH < 7,20 refratário à VNI); Lungs (falência de oxigenação — SpO₂ < 90% com FiO₂ 1,0, SARA grave, EAP refratário); Obstruction (angioedema, epiglotite, trauma/queimadura de VA, anafilaxia); Work (FR > 35, musculatura acessória, paradoxo abdominal, fadiga). Também: GCS ≤ 8 com risco de aspiração.":
    "Confirmar la indicación (mnemotecnia FLOW): Failure (falla ventilatoria — apnea, PaCO₂ > 55 + pH < 7,20 refractario a la VNI); Lungs (falla de oxigenación — SpO₂ < 90% con FiO₂ 1,0, SDRA grave, EAP refractario); Obstruction (angioedema, epiglotitis, trauma/quemadura de la vía aérea, anafilaxia); Work (FR > 35, musculatura accesoria, paradoja abdominal, fatiga). También: GCS ≤ 8 con riesgo de aspiración.",
  "Checklist SOAP-ME: Sucção (Yankauer), O₂ (fonte com flush, MNR, BVM), Aparato (laringoscópio Mac 3/4 ou Miller 2/3 + videolaringoscópio, TOT 7,0/7,5 com cuff testado, estilete, bougie, cânula orofaríngea), Posição, Monitor/medicações, ETCO₂.":
    "Lista SOAP-ME: Succión (Yankauer), O₂ (fuente con flujo alto, mascarilla no reinhalante, bolsa-válvula-mascarilla), Aparato (laringoscopio Mac 3/4 o Miller 2/3 + videolaringoscopio, tubo 7,0/7,5 con balón probado, estilete, bougie, cánula orofaríngea), Posición, Monitor/medicamentos, ETCO₂.",
  "Monitor completo (PA, ECG, SpO₂, capnografia waveform), 2 acessos venosos; equipe e funções definidas (operador, assistente, fármacos).":
    "Monitor completo (PA, ECG, SpO₂, capnografía con onda), 2 accesos venosos; equipo y funciones definidas (operador, asistente, fármacos).",
  "Definir plano A/B/C e ter à mão o kit de via aérea difícil: VL, ML de 2ª geração (i-gel/LMA Supreme), kit de cricotireoidostomia (bisturi + tubo 6,0 com cuff).":
    "Definir los planes A/B/C y tener a mano el equipo de vía aérea difícil: videolaringoscopio, mascarilla laríngea de 2.ª generación (i-gel/LMA Supreme), equipo de cricotiroidotomía (bisturí + tubo 6,0 con balón).",
  "Posição: sniffing (cabeça elevada 20–30°). Obeso/gestante: ramped — alinhar meato auditivo externo aos ombros.":
    "Posición: de olfateo (cabeza elevada 20–30°). Obeso/embarazada: en rampa — alinear el conducto auditivo externo con los hombros.",
  "Padrão: máscara não-reinalante (MNR) com reservatório, O₂ 15 L/min × 3–5 min (adulto saudável). Obeso/gestante/crítico: 30–90 s.":
    "Estándar: mascarilla no reinhalante con reservorio, O₂ 15 L/min × 3–5 min (adulto sano). Obeso/embarazada/crítico: 30–90 s.",
  "Oxigenação apneica (mantida DURANTE a laringoscopia): cânula nasal 15 L/min ou alto fluxo nasal (HFN) 60 L/min — THRIVE prolonga a apneia segura.":
    "Oxigenación apneica (mantenida DURANTE la laringoscopia): cánula nasal 15 L/min o cánula nasal de alto flujo 60 L/min — THRIVE prolonga la apnea segura.",
  "SpO₂ não sobe ou não tolera MNR: VNI (CPAP/BiPAP) PEEP 5–10 cmH₂O × 3 min para recrutamento alveolar.":
    "Si la SpO₂ no sube o no tolera la mascarilla no reinhalante: VNI (CPAP/BiPAP) con PEEP 5–10 cmH₂O × 3 min para el reclutamiento alveolar.",
  "BVM com máscara apenas se as demais opções forem insuficientes (risco de insuflação gástrica).":
    "Bolsa-válvula-mascarilla solo si las demás opciones son insuficientes (riesgo de insuflación gástrica).",
  "Posição: sniffing/ramped — alinhar meato auditivo aos ombros; cabeceira elevada 20–30°.":
    "Posición: de olfateo/en rampa — alinear el conducto auditivo con los hombros; cabecera elevada 20–30°.",
  "Chamar ajuda experiente; usar videolaringoscópio de primeira escolha.":
    "Pedir ayuda experimentada; usar el videolaringoscopio como primera elección.",
  "Preparar dispositivos de resgate: máscara laríngea, bougie, kit de cricotireoidostomia aberto.":
    "Preparar los dispositivos de rescate: mascarilla laríngea, bougie y equipo de cricotiroidotomía abierto.",
  "Considerar intubação acordada (com sedação leve e topização) se a anatomia for muito desfavorável.":
    "Considerar la intubación con el paciente despierto (con sedación ligera y anestesia tópica) si la anatomía es muy desfavorable.",
  "Definir claramente o gatilho para a via cirúrgica ('não intuba, não ventila').":
    "Definir claramente el disparador para la vía quirúrgica ('no se intuba, no se ventila').",
  "Volume: bolus de cristaloide 250–500 mL se responsivo; iniciar/otimizar vasopressor (noradrenalina) para PAS adequada.":
    "Volumen: bolo de cristaloide 250–500 mL si responde; iniciar/optimizar el vasopresor (noradrenalina) para lograr una PAS adecuada.",
  "Ter push-dose pressor à mão para hipotensão pós-indução (ex.: noradrenalina 8–12 mcg IV em bolus, repetir conforme resposta).":
    "Tener un vasopresor en bolo a mano para la hipotensión posinducción (p. ej., noradrenalina 8–12 mcg IV en bolo, repetir según la respuesta).",
  "Preferir indutor hemodinamicamente estável (cetamina; etomidato em dose plena).":
    "Preferir un inductor hemodinámicamente estable (ketamina; etomidato en dosis plena).",
  "Corrigir hipóxia e acidose graves na medida do possível antes de prosseguir.":
    "Corregir la hipoxia y la acidosis graves en la medida de lo posible antes de continuar.",
  "Fentanil {fenta} mcg IV (1–3 mcg/kg, 3 min antes): atenua a resposta simpática à laringoscopia. Indicado em coronariopatia, HAS grave, hipertensão intracraniana (HIC). Cuidado: rigidez torácica se > 5 mcg/kg.":
    "Fentanilo {fenta} mcg IV (1–3 mcg/kg, 3 min antes): atenúa la respuesta simpática a la laringoscopia. Indicado en coronariopatía, HTA grave e hipertensión intracraneal (HIC). Cuidado: rigidez torácica si > 5 mcg/kg.",
  "Lidocaína {lido} mg IV (1,5 mg/kg, 3 min antes): atenua HIC e broncoespasmo. Considerar em TCE grave e asma/DPOC (evidência limitada, perfil seguro).":
    "Lidocaína {lido} mg IV (1,5 mg/kg, 3 min antes): atenúa la HIC y el broncoespasmo. Considerarla en el TCE grave y en asma/EPOC (evidencia limitada, perfil seguro).",
  "Atropina 0,02 mg/kg IV (mín 0,1 mg): prevenir bradicardia vagal em crianças < 5 anos que recebem succinilcolina. NÃO de rotina em adultos.":
    "Atropina 0,02 mg/kg IV (mín. 0,1 mg): prevenir la bradicardia vagal en niños < 5 años que reciben succinilcolina. NO de rutina en adultos.",
  "Em asma/broncoespasmo: salbutamol inalatório antes da indução.":
    "En asma/broncoespasmo: salbutamol inhalado antes de la inducción.",
  "Sem indicação dos itens acima → seguir direto para a indução.":
    "Sin indicación de los puntos anteriores → pasar directamente a la inducción.",
  "Propofol {propInd} mg IV (1,5–2 mg/kg) em bolus — início 15–45 s. Reduzir para {propLow} mg (1 mg/kg) em idosos. Cuidado: hipotensão dose-dependente.":
    "Propofol {propInd} mg IV (1,5–2 mg/kg) en bolo — inicio 15–45 s. Reducir a {propLow} mg (1 mg/kg) en ancianos. Cuidado: hipotensión dosis-dependiente.",
  "Alternativa hemodinamicamente neutra: etomidato {etom} mg IV (0,3 mg/kg) — início 15–45 s; mioclonias e supressão adrenal transitória.":
    "Alternativa hemodinámicamente neutra: etomidato {etom} mg IV (0,3 mg/kg) — inicio 15–45 s; mioclonías y supresión suprarrenal transitoria.",
  "Asma/broncoespasmo: preferir cetamina {ketaAsma} mg (2 mg/kg).":
    "Asma/broncoespasmo: preferir ketamina {ketaAsma} mg (2 mg/kg).",
  "Injetar o indutor em bolus rápido e, em < 30 s, o bloqueador neuromuscular. NÃO ventilar no intervalo de apneia (salvo SpO₂ < 90%).":
    "Inyectar el inductor en bolo rápido y, en < 30 s, el bloqueante neuromuscular. NO ventilar durante el intervalo de apnea (salvo SpO₂ < 90%).",
  "Cetamina {ketaShock} mg IV (1 mg/kg) no instável/choque; 0,5 mg/kg se choque grave; até {ketaInd} mg (1,5 mg/kg) se mais estável.":
    "Ketamina {ketaShock} mg IV (1 mg/kg) en el paciente inestable/en choque; 0,5 mg/kg si el choque es grave; hasta {ketaInd} mg (1,5 mg/kg) si está más estable.",
  "Alternativa em instabilidade: etomidato {etom} mg IV (0,3 mg/kg).":
    "Alternativa en la inestabilidad: etomidato {etom} mg IV (0,3 mg/kg).",
  "Manter vasopressor/push-dose disponível (noradrenalina 8–12 mcg IV em bolus).":
    "Mantener disponible el vasopresor en bolo (noradrenalina 8–12 mcg IV).",
  "Succinilcolina {succLow}–{succHigh} mg IV (1–1,5 mg/kg; 2 mg/kg em obesos; máx 200 mg) em bolus ultrarrápido, logo após o indutor.":
    "Succinilcolina {succLow}–{succHigh} mg IV (1–1,5 mg/kg; 2 mg/kg en obesos; máx. 200 mg) en bolo ultrarrápido, justo después del inductor.",
  "Aguardar as fasciculações cessarem / relaxamento (~45–60 s) antes da laringoscopia.":
    "Esperar a que cesen las fasciculaciones / se logre la relajación (~45–60 s) antes de la laringoscopia.",
  "Se surgir contraindicação, trocar por rocurônio {rocu} mg.":
    "Si aparece una contraindicación, cambiar a rocuronio {rocu} mg.",
  "Prosseguir para o posicionamento e a passagem do tubo.":
    "Continuar con el posicionamiento y el paso del tubo.",
  "Rocurônio {rocu} mg IV (1,2 mg/kg) em bolus ultrarrápido, logo após o indutor.":
    "Rocuronio {rocu} mg IV (1,2 mg/kg) en bolo ultrarrápido, justo después del inductor.",
  "Início ~45–60 s; duração longa (45–70 min) — ter plano de resgate definido.":
    "Inicio ~45–60 s; duración prolongada (45–70 min) — tener un plan de rescate definido.",
  "ANTÍDOTO CICO: sugamadex {sugam} mg IV (16 mg/kg) reverte em < 3 min. Ter SEMPRE disponível quando usar rocurônio para ISR.":
    "ANTÍDOTO EN CICO: sugammadex {sugam} mg IV (16 mg/kg) revierte en < 3 min. Tenerlo SIEMPRE disponible cuando se use rocuronio para la ISR.",
  "Confirmar relaxamento (ausência de tônus mandibular) antes da laringoscopia.":
    "Confirmar la relajación (ausencia de tono mandibular) antes de la laringoscopia.",
  "Laringoscopia direta (Mac 3/4 ou Miller 2/3) ou videolaringoscópio (1ª escolha em VA difícil prevista ou após falha de LD; melhora a visão em > 90%).":
    "Laringoscopia directa (Mac 3/4 o Miller 2/3) o videolaringoscopio (1.ª elección en vía aérea difícil prevista o tras el fracaso de la laringoscopia directa; mejora la visión en > 90%).",
  "Sem visualizar a glote: bougie + manobra BURP (Backward-Upward-Rightward). Trocar para VL se Cormack-Lehane III/IV na LD.":
    "Sin visualizar la glotis: bougie + maniobra BURP (hacia atrás, arriba y a la derecha). Cambiar al videolaringoscopio si hay Cormack-Lehane III/IV en la laringoscopia directa.",
  "Avançar o TOT 2–3 cm abaixo das cordas; insuflar o cuff 20–30 cmH₂O. Profundidade na comissura: homem 21–23 cm, mulher 19–21 cm.":
    "Avanzar el tubo 2–3 cm por debajo de las cuerdas; inflar el balón a 20–30 cmH₂O. Profundidad en la comisura: hombre 21–23 cm, mujer 19–21 cm.",
  "Limitar a tentativa a ~30 s ou até SpO₂ ~90% → reoxigenar (BVM/HFN) entre tentativas. Máximo 2 tentativas com o mesmo operador/dispositivo.":
    "Limitar el intento a ~30 s o hasta SpO₂ ~90% → reoxigenar (bolsa-válvula-mascarilla/cánula de alto flujo) entre intentos. Máximo 2 intentos con el mismo operador/dispositivo.",
  "Intubação esofágica (ETCO₂ ausente): retirar o tubo IMEDIATAMENTE, ventilar com BVM + O₂ e reoxigenar antes de nova tentativa.":
    "Intubación esofágica (ETCO₂ ausente): retirar el tubo DE INMEDIATO, ventilar con bolsa-válvula-mascarilla + O₂ y reoxigenar antes de un nuevo intento.",
  "Intubação seletiva (murmúrio ausente à esquerda): recuar o tubo 1–2 cm e reconfirmar.":
    "Intubación selectiva (murmullo ausente en el lado izquierdo): retirar el tubo 1–2 cm y volver a confirmar.",
  "Trocar para videolaringoscópio / operador mais experiente; usar bougie + BURP.":
    "Cambiar al videolaringoscopio / a un operador más experimentado; usar bougie + BURP.",
  "Manter oxigenação apneica (HFN 60 L/min) e BVM entre tentativas.":
    "Mantener la oxigenación apneica (cánula de alto flujo 60 L/min) y la bolsa-válvula-mascarilla entre intentos.",
  "DECLARAR via aérea difícil em voz alta. Chamar ajuda (anestesiologista, otorrino, cirurgião).":
    "DECLARAR la vía aérea difícil en voz alta. Pedir ayuda (anestesiólogo, otorrinolaringólogo, cirujano).",
  "Tentar resgate ventilatório: BVM + cânula orofaríngea; máscara laríngea de 2ª geração (i-gel / LMA Supreme).":
    "Intentar el rescate ventilatorio: bolsa-válvula-mascarilla + cánula orofaríngea; mascarilla laríngea de 2.ª generación (i-gel / LMA Supreme).",
  "Se usou rocurônio: sugamadex {sugam} mg IV (16 mg/kg) — reverte em < 3 min; considerar despertar o paciente.":
    "Si usó rocuronio: sugammadex {sugam} mg IV (16 mg/kg) — revierte en < 3 min; considerar despertar al paciente.",
  "Se a oxigenação não for restaurada → via aérea cirúrgica SEM demora.":
    "Si no se restablece la oxigenación → vía aérea quirúrgica SIN demora.",
  "Cricotireoidostomia cirúrgica (padrão em adultos) — técnica scalpel-finger-tube (Walls): incisão vertical na pele + incisão horizontal na membrana cricotireóidea + tubo 6,0 com cuff.":
    "Cricotiroidotomía quirúrgica (estándar en adultos) — técnica bisturí-dedo-tubo (Walls): incisión vertical en la piel + incisión horizontal en la membrana cricotiroidea + tubo 6,0 con balón.",
  "Cricotireoidostomia por agulha (kit transtraqueal + O₂ a jato): apenas como ponte (< 30–45 min, risco de barotrauma).":
    "Cricotiroidotomía con aguja (equipo transtraqueal + O₂ a chorro): solo como puente (< 30–45 min, riesgo de barotrauma).",
  "Traqueostomia: mais demorada — reservar para sala cirúrgica.":
    "Traqueostomía: más lenta — reservarla para el quirófano.",
  "Confirmar a posição por capnografia e seguir para o manejo pós-intubação.":
    "Confirmar la posición por capnografía y pasar al manejo posintubación.",
  "Fixar o tubo; registrar a profundidade; RX de tórax (ponta 2–3 cm acima da carina).":
    "Fijar el tubo; registrar la profundidad; radiografía de tórax (punta 2–3 cm por encima de la carina).",
  "Ventilador (pulmão normal): VCV/PCV, VC 6–8 mL/kg de peso ideal, FR 12–16, PEEP 5, FiO₂ 1,0 → titular para SpO₂ ≥ 94% (reduzir o quanto antes), I:E 1:2.":
    "Ventilador (pulmón normal): VCV/PCV, Vt 6–8 mL/kg de peso ideal, FR 12–16, PEEP 5, FiO₂ 1,0 → titular para SpO₂ ≥ 94% (reducirla cuanto antes), I:E 1:2.",
  "Ajustes por cenário: TCE → PaCO₂ 35–40 (hiperventilar só em herniação aguda); SARA → VC 4–6 mL/kg, PEEP alto, driving pressure ≤ 15; asma/DPOC → FR 8–12, tempo expiratório longo, PEEP 3–5, hipercapnia permissiva.":
    "Ajustes según el escenario: TCE → PaCO₂ 35–40 (hiperventilar solo en la herniación aguda); SDRA → Vt 4–6 mL/kg, PEEP alto, driving pressure ≤ 15; asma/EPOC → FR 8–12, tiempo espiratorio prolongado, PEEP 3–5, hipercapnia permisiva.",
  "Hipotensão pós-IOT (comum): SF 250–500 mL, reduzir PEEP, descartar pneumotórax; noradrenalina 8–12 mcg IV em bolus se refratária.":
    "Hipotensión posintubación (frecuente): solución fisiológica 250–500 mL, reducir el PEEP, descartar neumotórax; noradrenalina 8–12 mcg IV en bolo si es refractaria.",
  "Gasometria arterial 20–30 min após a IOT para ajuste fino. Capnografia contínua.":
    "Gasometría arterial 20–30 min después de la intubación para el ajuste fino. Capnografía continua.",
  "Transferir para UTI com ventilação mecânica e sedação tituladas.":
    "Trasladar a la UCI con la ventilación mecánica y la sedación tituladas.",
  "Manter capnografia, oximetria e monitorização hemodinâmica contínuas.":
    "Mantener la capnografía, la oximetría y la monitorización hemodinámica continuas.",
  "Tratar a causa de base que motivou a via aérea definitiva.":
    "Tratar la causa de base que motivó la vía aérea definitiva.",
  "Reavaliar parâmetros ventilatórios e sedação periodicamente.":
    "Reevaluar los parámetros ventilatorios y la sedación periódicamente.",
  // ── Via aérea acordada e deferimento (a via que faltava percorrer) ───────
  "Estratégia diante da via aérea difícil": "Estrategia ante la vía aérea difícil",
  "Com o plano de resgate pronto: qual estratégia para esta via aérea?":
    "Con el plan de rescate listo: ¿qué estrategia para esta vía aérea?",
  "ISR com plano A/B/C pronto": "ISR con plan A/B/C listo",
  "ISR com plano A/B/C: quando a dificuldade prevista é manejável e a urgência não permite alternativa — a maioria dos casos.":
    "ISR con plan A/B/C: cuando la dificultad prevista es manejable y la urgencia no permite alternativa — la mayoría de los casos.",
  "VIA ACORDADA (paciente ventilando espontaneamente durante a laringoscopia): anatomia muito desfavorável + paciente colaborativo + tempo disponível. Preserva o drive — se a visualização falhar, o paciente continua respirando.":
    "VÍA DESPIERTA (paciente ventilando espontáneamente durante la laringoscopia): anatomía muy desfavorable + paciente colaborador + tiempo disponible. Preserva el impulso respiratorio — si la visualización falla, el paciente sigue respirando.",
  "ADIAR: se a indicação não é imediata e a otimização (VNI/HFN, posição, reavaliação com ajuda experiente) pode transformar uma via impossível agora numa via difícil depois.":
    "APLAZAR: si la indicación no es inmediata y la optimización (VNI/CNAF, posición, reevaluación con ayuda experta) puede transformar una vía imposible ahora en una vía difícil después.",
  "Urgência extrema (apneia, obstrução completa iminente) NÃO espera técnica acordada — ISR com kit cirúrgico aberto.":
    "La urgencia extrema (apnea, obstrucción completa inminente) NO espera técnica despierta — ISR con kit quirúrgico abierto.",
  "Via aérea ACORDADA (mantém ventilação espontânea)": "Vía aérea DESPIERTA (mantiene ventilación espontánea)",
  "Adiar — otimizar e reavaliar antes de intubar": "Aplazar — optimizar y reevaluar antes de intubar",
  "Via aérea acordada — topização e sedação leve": "Vía aérea despierta — topicalización y sedación ligera",
  "O paciente continua ventilando durante toda a tentativa. NÃO usar bloqueador neuromuscular.":
    "El paciente sigue ventilando durante todo el intento. NO usar bloqueador neuromuscular.",
  "Topização: lidocaína tópica na via aérea (spray/atomizador 4%; máx ~4 mg/kg somando todas as vias) — é a base da técnica, não a sedação.":
    "Topicalización: lidocaína tópica en la vía aérea (aerosol/atomizador 4%; máx ~4 mg/kg sumando todas las vías) — es la base de la técnica, no la sedación.",
  "Sedação LEVE mantendo o drive: cetamina em doses fracionadas de 10–20 mg IV (dissociação leve preservando respiração) OU dexmedetomidina 1 mcg/kg em 10 min. NÃO usar bolus de indução.":
    "Sedación LIGERA manteniendo el impulso respiratorio: ketamina en dosis fraccionadas de 10–20 mg IV (disociación ligera preservando la respiración) O dexmedetomidina 1 mcg/kg en 10 min. NO usar bolo de inducción.",
  "Videolaringoscópio ou broncoscópio flexível, com o operador mais experiente disponível.":
    "Videolaringoscopio o broncoscopio flexible, con el operador más experimentado disponible.",
  "Visualizou as cordas e passou o tubo → confirmar por capnografia. SÓ ENTÃO induzir e aprofundar sedação.":
    "Visualizó las cuerdas y pasó el tubo → confirmar por capnografía. SOLO ENTONCES inducir y profundizar la sedación.",
  "Falhou ou o paciente não tolera → ainda está ventilando: recuar, reoxigenar e reavaliar a estratégia (nova tentativa, ISR com kit cirúrgico aberto, ou via cirúrgica eletiva com equipe).":
    "Falló o el paciente no tolera → aún está ventilando: retroceder, reoxigenar y reevaluar la estrategia (nuevo intento, ISR con kit quirúrgico abierto, o vía quirúrgica electiva con equipo).",
  "Antissialogogo se houver tempo; aspiração pronta; O₂ contínuo (cânula nasal/HFN) durante toda a tentativa.":
    "Antisialogogo si hay tiempo; aspiración lista; O₂ continuo (cánula nasal/CNAF) durante todo el intento.",
  "Intubação adiada — otimizar e reavaliar": "Intubación aplazada — optimizar y reevaluar",
  "Decisão ativa, não omissão: melhorar as condições antes de tentar, com critérios de retorno definidos.":
    "Decisión activa, no omisión: mejorar las condiciones antes de intentar, con criterios de retorno definidos.",
  "Ponte de oxigenação: VNI ou HFN com monitorização contínua — SpO₂, FR, trabalho respiratório, consciência.":
    "Puente de oxigenación: VNI o CNAF con monitorización continua — SpO₂, FR, trabajo respiratorio, conciencia.",
  "Otimizar o que tornou a via difícil ou o paciente instável: posição, volemia, broncodilatador, reversão de sedativo, anafilaxia tratada.":
    "Optimizar lo que hizo la vía difícil o al paciente inestable: posición, volemia, broncodilatador, reversión de sedante, anafilaxia tratada.",
  "Acionar quem faltava: anestesiologia, otorrino/cirurgia, broncoscópio, sala preparada.":
    "Convocar a quien faltaba: anestesiología, otorrino/cirugía, broncoscopio, sala preparada.",
  "GATILHOS DE RETORNO IMEDIATO à intubação: rebaixamento, falha da VNI/HFN (SpO₂ < 90% ou FR subindo), estridor progressivo, fadiga.":
    "DESENCADENANTES DE RETORNO INMEDIATO a la intubación: deterioro de conciencia, falla de la VNI/CNAF (SpO₂ < 90% o FR en aumento), estridor progresivo, fatiga.",
  "Reavaliação formal em intervalo curto e definido — adiar sem hora de reavaliar é abandonar.":
    "Reevaluación formal en intervalo corto y definido — aplazar sin hora de reevaluación es abandonar.",
  // ── Doses da ISR: fonte única e cetamina no instável ─────────────────────
  "Indução (estável): 1,5 mg/kg IV em 60 s (até 2 mg/kg no broncoespasmo).":
    "Inducción (estable): 1,5 mg/kg IV en 60 s (hasta 2 mg/kg en el broncoespasmo).",
  "ISR no INSTÁVEL: reduzir para 1 mg/kg (0,5 mg/kg no choque grave) e MANTER a dose do bloqueador — dose plena de indutor no chocado é hipotensão pós-intubação.":
    "ISR en el INESTABLE: reducir a 1 mg/kg (0,5 mg/kg en el choque grave) y MANTENER la dosis del bloqueador — dosis plena de inductor en el chocado es hipotensión posintubación.",
  "1–1,5 mg/kg (2 mg/kg em obeso; máx 200 mg)": "1–1,5 mg/kg (2 mg/kg en obeso; máx 200 mg)",
  "No instável, REDUZIR o indutor e MANTER o bloqueador. Cetamina 1 mg/kg (0,5 mg/kg no choque grave) em vez de 1,5; etomidato segue 0,3 mg/kg, que é hemodinamicamente neutro; evitar propofol e midazolam. Reduzir o bloqueador junto daria relaxamento insuficiente e mais tentativas — exatamente o que quem está no limite não tolera.":
    "En el inestable, REDUCIR el inductor y MANTENER el bloqueador. Ketamina 1 mg/kg (0,5 mg/kg en el choque grave) en vez de 1,5; el etomidato sigue en 0,3 mg/kg, que es hemodinámicamente neutro; evitar propofol y midazolam. Reducir el bloqueador junto daría relajación insuficiente y más intentos — exactamente lo que quien está al límite no tolera.",
  "SUCCINILCOLINA é a escolha padrão na anafilaxia/angioedema de via aérea. O rocurônio 1,2 mg/kg compromete 45–70 min, e o resgate com sugamadex depende de ele estar disponível, dentro do prazo e de alguém ir buscá-lo — três condições que falham sob pressão. Nenhuma das contraindicações reais da succinilcolina (queimado crônico, imobilização prolongada, doença neuromuscular) é típica deste paciente, e a hipercalemia não é preocupação relevante na anafilaxia aguda.":
    "La SUCCINILCOLINA es la elección estándar en la anafilaxia/angioedema de vía aérea. El rocuronio 1,2 mg/kg compromete 45–70 min, y el rescate con sugammadex depende de que esté disponible, dentro del plazo y de que alguien vaya a buscarlo — tres condiciones que fallan bajo presión. Ninguna de las contraindicaciones reales de la succinilcolina (quemado crónico, inmovilización prolongada, enfermedad neuromuscular) es típica de este paciente, y la hipercalemia no es preocupación relevante en la anafilaxia aguda.",
  "Rocurônio SOMENTE se houver contraindicação à succinilcolina — e nesse caso o sugamadex 16 mg/kg é MANDATÓRIO à beira do leito, não opcional: sem ele, a paralisia dura 45–70 min num paciente cuja via aérea pode fechar.":
    "Rocuronio SOLO si hay contraindicación a la succinilcolina — y en ese caso el sugammadex 16 mg/kg es OBLIGATORIO junto a la cama, no opcional: sin él, la parálisis dura 45–70 min en un paciente cuya vía aérea puede cerrarse.",
  "⚠️ Se o desencadeante suspeito for um BLOQUEADOR NEUROMUSCULAR (anafilaxia perioperatória): a reatividade cruzada entre eles é alta — cerca de 44% com succinilcolina em quem reagiu ao rocurônio, cerca de 24% no sentido inverso. Evitar AMBOS se houver alternativa para garantir a via aérea; se não houver, a escolha é feita com o risco declarado e a equipe avisada.":
    "⚠️ Si el desencadenante sospechoso es un BLOQUEADOR NEUROMUSCULAR (anafilaxia perioperatoria): la reactividad cruzada entre ellos es alta — cerca de 44% con succinilcolina en quien reaccionó al rocuronio, cerca de 24% en sentido inverso. Evitar AMBOS si hay alternativa para asegurar la vía aérea; si no la hay, la elección se hace con el riesgo declarado y el equipo avisado.",
  "Lastro desta escolha: WAO e EAACI NÃO fazem recomendação sobre qual bloqueador usar na anafilaxia — tratam a via aérea de forma geral. Esta é uma decisão de raciocínio clínico do app, não uma citação de diretriz. A posição contrária existe (revisões defendem que, com sugamadex, a succinilcolina não deveria mais ser usada para intubação) e é opinião de revisão, não recomendação de diretriz. Questão em debate legítimo.":
    "Sustento de esta elección: la WAO y la EAACI NO hacen recomendación sobre qué bloqueador usar en la anafilaxia — tratan la vía aérea de forma general. Esta es una decisión de razonamiento clínico de la app, no una cita de directriz. La posición contraria existe (revisiones sostienen que, con sugammadex, la succinilcolina ya no debería usarse para intubación) y es opinión de revisión, no recomendación de directriz. Cuestión en debate legítimo.",
  "Contraindicações ABSOLUTAS da succinilcolina (usar rocurônio): hipercalemia (K⁺ > 5,5) ou risco; queimadura grave > 24 h até 1 ano; imobilização prolongada > 48–72 h (TCE, AVC, lesão medular); rabdomiólise/esmagamento; distrofias musculares (Duchenne/Becker); miotonia; hipertermia maligna (pessoal/familiar); pseudocolinesterase atípica OU inibição adquirida da colinesterase (intoxicação por organofosforado — bloqueio prolongado); trauma ocular aberto.":
    "Contraindicaciones ABSOLUTAS de la succinilcolina (usar rocuronio): hipercalemia (K⁺ > 5,5) o riesgo; quemadura grave > 24 h hasta 1 año; inmovilización prolongada > 48–72 h (TCE, ACV, lesión medular); rabdomiólisis/aplastamiento; distrofias musculares (Duchenne/Becker); miotonía; hipertermia maligna (personal/familiar); pseudocolinesterasa atípica O inhibición adquirida de la colinesterasa (intoxicación por organofosforado — bloqueo prolongado); trauma ocular abierto.",
  "Índice de choque (FC ÷ PAS) acima de 0,9 prevê colapso/PCR peri-intubação mesmo com pressão ainda normal (Heffner, J Crit Care 2013) — some 100 de FC com 100 de PAS e o risco já está lá. A partir de 0,8 já se prevê hipotensão pós-intubação; 0,9 é o limiar do desfecho mais grave, e é o que este passo vigia.":
    "Índice de choque (FC ÷ PAS) por encima de 0,9 predice colapso/PCR peri-intubación aun con presión todavía normal (Heffner, J Crit Care 2013) — sume 100 de FC con 100 de PAS y el riesgo ya está ahí. A partir de 0,8 ya se predice hipotensión posintubación; 0,9 es el umbral del desenlace más grave, y es lo que este paso vigila.",
  "Fonte deste módulo: The Walls Manual of Emergency Airway Management, 6ª ed., 2023 (7 P\u2019s, LEMON/MOANS, máximo de 2 tentativas por operador) · plano de falha conforme DAS 2015 (planos A/B/C, CICO, cricotireoidostomia com bisturi).":
    "Fuente de este módulo: The Walls Manual of Emergency Airway Management, 6.ª ed., 2023 (7 P\u2019s, LEMON/MOANS, máximo de 2 intentos por operador) · plan de falla según DAS 2015 (planes A/B/C, CICO, cricotiroidotomía con bisturí).",
  "Pré-intubação (atenuar resposta): 1–3 mcg/kg.": "Preintubación (atenuar respuesta): 1–3 mcg/kg.",
  "SEDOANALGESIA já: propofol 5–50 mcg/kg/min OU midazolam 0,02–0,1 mg/kg/h + fentanil 25–100 mcg/h. Alvo RASS −2 a 0 (sedação LEVE é o padrão — PADIS 2018); mais profundo só por indicação declarada. NUNCA deixar paralisado sem sedação — sob bloqueio, o alvo é RASS −5.": "SEDOANALGESIA ya: propofol 5–50 mcg/kg/min O midazolam 0,02–0,1 mg/kg/h + fentanilo 25–100 mcg/h. Objetivo RASS −2 a 0 (la sedación LIGERA es el estándar — PADIS 2018); más profundo solo por indicación declarada. NUNCA dejar paralizado sin sedación — bajo bloqueo, el objetivo es RASS −5.",
  "Rebaixamento neste nível exige AVALIAÇÃO imediata da via aérea — não intubação automática. A regra \"GCS ≤ 8 intuba\" erra justamente onde a causa é reversível em minutos: pós-ictal, hipoglicemia e intoxicação por opioide costumam recuperar a consciência com o tratamento específico, e o paciente acaba intubado por um número que já estava subindo. O que decide é a capacidade de proteger a via aérea, a trajetória (melhorando ou piorando) e a causa. Abrir o módulo ISR/Via aérea, que avalia indicação, preditores de dificuldade e preparo.": "El deterioro del nivel de conciencia en este rango exige EVALUACIÓN inmediata de la vía aérea — no intubación automática. La regla \"GCS ≤ 8 se intuba\" falla justamente donde la causa es reversible en minutos: pos-ictal, hipoglucemia e intoxicación por opioide suelen recuperar la consciencia con el tratamiento específico, y el paciente termina intubado por un número que ya estaba subiendo. Lo que decide es la capacidad de proteger la vía aérea, la trayectoria (mejorando o empeorando) y la causa. Abrir el módulo ISR/Vía aérea, que evalúa indicación, predictores de dificultad y preparación.",
  "PREVER VIA DIFÍCIL MUDA O QUE SE FAZ, NÃO SÓ O QUE SE ESPERA: chame ajuda antes, use videolaringoscópio de primeira, tenha o plano de resgate montado e considere a via aérea acordada. Os critérios de LEMON e MOANS estão abaixo.":
    "PREVER VÍA DIFÍCIL CAMBIA LO QUE SE HACE, NO SOLO LO QUE SE ESPERA: pida ayuda antes, use videolaringoscopio de entrada, tenga el plan de rescate montado y considere la vía aérea despierto. Los criterios de LEMON y MOANS están abajo.",
  "⚠️ ETCO₂ AUSENTE É ESÔFAGO ATÉ PROVA EM CONTRÁRIO — retire o tubo e ventile. Nenhum outro sinal desfaz esta conclusão.":
    "⚠️ ETCO₂ AUSENTE ES ESÓFAGO HASTA PRUEBA EN CONTRARIO — retire el tubo y ventile. Ninguna otra señal deshace esta conclusión.",
};
