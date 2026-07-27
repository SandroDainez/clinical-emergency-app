/**
 * TCE (Traumatismo craneoencefálico) — dicionário PT → ES.
 * Terminologia: lesión secundaria, herniación, terapia hiperosmolar, PPC,
 * craniectomía descompresiva. Tokens {salina3Min}, {manitolMin}… preservados.
 */
export const ES_TCE: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Estabilização primeiro — evitar lesão secundária":
    "Estabilización primero — evitar la lesión secundaria",
  "Classificar pela escala de Glasgow": "Clasificar según la escala de Glasgow",
  "TCE leve — indicação de tomografia": "TCE leve — indicación de tomografía",
  "TCE leve sem critérios — observação": "TCE leve sin criterios — observación",
  "Tomografia de crânio sem contraste": "Tomografía de cráneo sin contraste",
  "Resultado da tomografia": "Resultado de la tomografía",
  "Acionar neurocirurgia — lesão com indicação cirúrgica":
    "Activar neurocirugía — lesión con indicación quirúrgica",
  "Anticoagulação ou coagulopatia?": "¿Anticoagulación o coagulopatía?",
  "Reversão de anticoagulação": "Reversión de la anticoagulación",
  "Necessita monitorização intensiva?": "¿Requiere monitorización intensiva?",
  "TCE grave — neuroproteção": "TCE grave — neuroprotección",
  "Peso do paciente": "Peso del paciente",
  "Sinais de herniação / hipertensão intracraniana?":
    "¿Signos de herniación / hipertensión intracraneal?",
  "Herniação — medidas imediatas": "Herniación — medidas inmediatas",
  "UTI neurológica": "UCI neurológica",
  "Traumatismo cranioencefálico": "Traumatismo craneoencefálico",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "Qual o Glasgow após a estabilização inicial?":
    "¿Cuál es el Glasgow tras la estabilización inicial?",
  "Há algum critério de risco para lesão intracraniana?":
    "¿Hay algún criterio de riesgo de lesión intracraneal?",
  "Há lesão com efeito de massa, desvio de linha média ou sangramento significativo?":
    "¿Hay lesión con efecto de masa, desviación de la línea media o sangrado significativo?",
  "O paciente usa anticoagulante/antiagregante ou tem coagulopatia?":
    "¿El paciente usa anticoagulante/antiagregante o tiene coagulopatía?",
  "Glasgow ≤ 8, TC alterada ou deterioração neurológica?":
    "¿Glasgow ≤ 8, TC alterada o deterioro neurológico?",
  "Há anisocoria, midríase fixa, postura de descerebração/decorticação, tríade de Cushing ou queda ≥ 2 pontos no Glasgow?":
    "¿Hay anisocoria, midriasis fija, postura de descerebración/decorticación, tríada de Cushing o caída ≥ 2 puntos en el Glasgow?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "A lesão secundária (hipotensão e hipóxia) determina o desfecho mais que a lesão primária.":
    "La lesión secundaria (hipotensión e hipoxia) determina el desenlace más que la lesión primaria.",
  "Glasgow 15, exame normal e sem fatores de risco.":
    "Glasgow 15, examen normal y sin factores de riesgo.",
  "Exame de escolha na fase aguda — rápido e disponível.":
    "Estudio de elección en la fase aguda — rápido y disponible.",
  "Drenagem precoce muda o desfecho, sobretudo no extradural.":
    "El drenaje precoz cambia el desenlace, sobre todo en el hematoma epidural.",
  "Reverter agora; a expansão do hematoma é tempo-dependente.":
    "Revertir ahora; la expansión del hematoma es tiempo-dependiente.",
  "Objetivo: manter oferta de oxigênio ao cérebro e evitar hipertensão intracraniana.":
    "Objetivo: mantener el aporte de oxígeno al cerebro y evitar la hipertensión intracraneal.",
  "Ponte até a descompressão cirúrgica. Acionar neurocirurgia AGORA.":
    "Puente hasta la descompresión quirúrgica. Activar neurocirugía AHORA.",
  "Monitorização contínua e prevenção da lesão secundária.":
    "Monitorización continua y prevención de la lesión secundaria.",

  // ── Opções e campos ────────────────────────────────────────────────────────
  "Grave — Glasgow 3–8": "Grave — Glasgow 3–8",
  "Moderado — Glasgow 9–12": "Moderado — Glasgow 9–12",
  "Leve — Glasgow 13–15": "Leve — Glasgow 13–15",
  "Sim — há critério de risco": "Sí — hay criterio de riesgo",
  "Não — sem critérios": "No — sin criterios",
  "Sim — lesão cirúrgica / efeito de massa": "Sí — lesión quirúrgica / efecto de masa",
  "Não — sem lesão cirúrgica": "No — sin lesión quirúrgica",
  "Politrauma": "Politraumatismo",
  "Sim": "Sí",
  "Não": "No",
  "Não — estável, TC sem lesão": "No — estable, TC sin lesión",
  "Peso": "Peso",
  "50 kg": "50 kg",
  "60 kg": "60 kg",
  "70 kg": "70 kg",
  "80 kg": "80 kg",
  "90 kg": "90 kg",
  "100 kg": "100 kg",
  "Outro peso (kg)": "Otro peso (kg)",
  "Sim — sinais de herniação": "Sí — signos de herniación",
  "Ventilação mecânica": "Ventilación mecánica",
  "Sedoanalgesia & BNM": "Sedoanalgesia y BNM",
  "Drogas vasoativas": "Drogas vasoactivas",
  "Para calcular a terapia hiperosmolar.": "Para calcular la terapia hiperosmolar.",
  "Lesões associadas no traumatizado grave": "Lesiones asociadas en el politraumatizado grave",
  "Controle de PaCO₂ e oxigenação": "Control de la PaCO₂ y la oxigenación",
  "Sedação para controle da PIC": "Sedación para el control de la PIC",
  "Manter PPC 60–70 mmHg": "Mantener PPC 60–70 mmHg",

  // ── Evidência ──────────────────────────────────────────────────────────────
  "Leve 13–15 · Moderado 9–12 · Grave 3–8.": "Leve 13–15 · Moderado 9–12 · Grave 3–8.",
  "Usar a MELHOR resposta e avaliar após corrigir hipóxia, hipotensão, hipoglicemia e sedação.":
    "Usar la MEJOR respuesta y evaluar tras corregir la hipoxia, la hipotensión, la hipoglucemia y la sedación.",
  "Registrar sempre as pupilas (tamanho e reatividade) — valor prognóstico independente.":
    "Registrar siempre las pupilas (tamaño y reactividad) — valor pronóstico independiente.",
  "Canadian CT Head Rule (alto risco): Glasgow < 15 após 2 h; suspeita de fratura aberta/afundamento; sinais de fratura de base de crânio (equimose periorbitária/retroauricular, otorragia, fístula liquórica); ≥ 2 episódios de vômito; idade ≥ 65 anos.":
    "Canadian CT Head Rule (alto riesgo): Glasgow < 15 tras 2 h; sospecha de fractura abierta/hundimiento; signos de fractura de base de cráneo (equimosis periorbitaria/retroauricular, otorragia, fístula de LCR); ≥ 2 episodios de vómito; edad ≥ 65 años.",
  "Risco médio: amnésia retrógrada > 30 min; mecanismo perigoso (atropelamento, ejeção, queda > 1 m ou 5 degraus).":
    "Riesgo medio: amnesia retrógrada > 30 min; mecanismo peligroso (atropello, eyección, caída > 1 m o 5 escalones).",
  "Independentemente da regra: ANTICOAGULAÇÃO ou antiagregação, coagulopatia, déficit focal, convulsão pós-trauma ou intoxicação = TC.":
    "Independientemente de la regla: ANTICOAGULACIÓN o antiagregación, coagulopatía, déficit focal, convulsión postraumática o intoxicación = TC.",
  "Indicações cirúrgicas típicas: hematoma extradural > 30 cm³; subdural agudo com espessura > 10 mm ou desvio > 5 mm; contusão com efeito de massa e deterioração; fratura com afundamento maior que a espessura da calota.":
    "Indicaciones quirúrgicas típicas: hematoma epidural > 30 cm³; subdural agudo con espesor > 10 mm o desviación > 5 mm; contusión con efecto de masa y deterioro; fractura con hundimiento mayor que el espesor de la calota.",
  "Acionar neurocirurgia imediatamente diante de qualquer dessas.":
    "Activar neurocirugía de inmediato ante cualquiera de estas.",
  "Sangramento intracraniano em anticoagulado exige reversão IMEDIATA — não aguardar exames de coagulação para decidir.":
    "El sangrado intracraneal en un paciente anticoagulado exige reversión INMEDIATA — no esperar las pruebas de coagulación para decidir.",
  "Repetir TC precocemente mesmo se a primeira foi normal.":
    "Repetir la TC precozmente incluso si la primera fue normal.",
  "TCE grave com TC alterada tem indicação de monitorização da PIC (BTF).":
    "El TCE grave con TC alterada tiene indicación de monitorización de la PIC (BTF).",
  "Qualquer queda de 2 pontos no Glasgow = reavaliação e nova TC.":
    "Cualquier caída de 2 puntos en el Glasgow = reevaluación y nueva TC.",
  "Tríade de Cushing: hipertensão + bradicardia + respiração irregular (sinal tardio).":
    "Tríada de Cushing: hipertensión + bradicardia + respiración irregular (signo tardío).",
  "Herniação é emergência — tratar imediatamente enquanto aciona a neurocirurgia.":
    "La herniación es una emergencia — tratar de inmediato mientras se activa la neurocirugía.",

  // ── Ações ──────────────────────────────────────────────────────────────────
  "Via aérea: Glasgow ≤ 8 → via aérea definitiva com estabilização cervical em linha.":
    "Vía aérea: Glasgow ≤ 8 → vía aérea definitiva con estabilización cervical en línea.",
  "Oxigenação: manter SpO₂ ≥ 90% (idealmente ≥ 94%). UM episódio de hipóxia já piora o prognóstico.":
    "Oxigenación: mantener SpO₂ ≥ 90% (idealmente ≥ 94%). UN solo episodio de hipoxia ya empeora el pronóstico.",
  "Pressão arterial: manter PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 anos e > 70 anos; ≥ 100 para 50–69 anos). Hipotensão é proibida no TCE.":
    "Presión arterial: mantener PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 años y > 70 años; ≥ 100 para 50–69 años). La hipotensión está prohibida en el TCE.",
  "Glicemia capilar — hipoglicemia simula e agrava lesão neurológica.":
    "Glucemia capilar — la hipoglucemia simula y agrava la lesión neurológica.",
  "Imobilização cervical até excluir lesão de coluna.":
    "Inmovilización cervical hasta excluir una lesión de columna.",
  "Normocapnia: PaCO₂ 35–45 mmHg. NÃO hiperventilar profilaticamente.":
    "Normocapnia: PaCO₂ 35–45 mmHg. NO hiperventilar de forma profiláctica.",
  "TC de crânio sem contraste o mais precoce possível (paciente estável para transporte).":
    "TC de cráneo sin contraste lo antes posible (paciente estable para el traslado).",
  "Buscar: hematoma extradural, subdural, contusão, hemorragia subaracnoide traumática, lesão axonal difusa, fratura, desvio de linha média e apagamento de cisternas.":
    "Buscar: hematoma epidural, subdural, contusión, hemorragia subaracnoidea traumática, lesión axonal difusa, fractura, desviación de la línea media y borramiento de cisternas.",
  "Incluir coluna cervical na tomografia quando indicado.":
    "Incluir la columna cervical en la tomografía cuando esté indicado.",
  "REVERTER anticoagulação imediatamente se sangramento (ver nó específico).":
    "REVERTIR la anticoagulación de inmediato si hay sangrado (ver el paso específico).",
  "Repetir TC em 6–12 h ou se houver qualquer deterioração neurológica.":
    "Repetir la TC en 6–12 h o ante cualquier deterioro neurológico.",
  "Varfarina: vitamina K 10 mg IV + complexo protrombínico (CCP 4 fatores) 25–50 UI/kg conforme INR. Alvo INR < 1,5.":
    "Warfarina: vitamina K 10 mg IV + concentrado de complejo protrombínico (CCP de 4 factores) 25–50 UI/kg según el INR. Objetivo INR < 1,5.",
  "Dabigatrana: idarucizumabe 5 g IV (2 × 2,5 g).": "Dabigatrán: idarucizumab 5 g IV (2 × 2,5 g).",
  "Rivaroxabana/apixabana/edoxabana: andexanet alfa; se indisponível, CCP 4 fatores 50 UI/kg.":
    "Rivaroxabán/apixabán/edoxabán: andexanet alfa; si no está disponible, CCP de 4 factores 50 UI/kg.",
  "Heparina não fracionada: protamina 1 mg por 100 UI (máx 50 mg).":
    "Heparina no fraccionada: protamina 1 mg por cada 100 UI (máx. 50 mg).",
  "Antiagregante: transfusão de plaquetas NÃO é rotina (estudo PATCH mostrou pior desfecho na hemorragia espontânea) — reservar para neurocirurgia iminente, com discussão conjunta.":
    "Antiagregante: la transfusión de plaquetas NO es de rutina (el estudio PATCH mostró peor desenlace en la hemorragia espontánea) — reservarla para neurocirugía inminente, con discusión conjunta.",
  "Corrigir plaquetopenia e fibrinogênio; controlar a pressão arterial.":
    "Corregir la plaquetopenia y el fibrinógeno; controlar la presión arterial.",
  "Via aérea definitiva; sedação e analgesia adequadas (evitar tosse, dor e assincronia).":
    "Vía aérea definitiva; sedación y analgesia adecuadas (evitar la tos, el dolor y la asincronía).",
  "Cabeceira a 30°, cabeça em posição neutra, evitar compressão jugular (colar/fixação de tubo apertados).":
    "Cabecera a 30°, cabeza en posición neutra, evitar la compresión yugular (collar/fijación del tubo apretados).",
  "Metas: PAS ≥ 110 mmHg · SpO₂ ≥ 90% · PaCO₂ 35–45 mmHg · normotermia (evitar febre) · normoglicemia · sódio normal-alto.":
    "Metas: PAS ≥ 110 mmHg · SpO₂ ≥ 90% · PaCO₂ 35–45 mmHg · normotermia (evitar la fiebre) · normoglucemia · sodio normal-alto.",
  "Monitorização da PIC se Glasgow ≤ 8 com TC alterada: manter PIC < 22 mmHg e PPC 60–70 mmHg (PPC = PAM − PIC).":
    "Monitorización de la PIC si Glasgow ≤ 8 con TC alterada: mantener PIC < 22 mmHg y PPC 60–70 mmHg (PPC = PAM − PIC).",
  "Profilaxia de convulsão precoce: fenitoína ou levetiracetam por 7 dias em alto risco (BTF) — reduz crise precoce, não altera epilepsia tardia.":
    "Profilaxis de convulsión precoz: fenitoína o levetiracetam durante 7 días en alto riesgo (BTF) — reduce la crisis precoz, no modifica la epilepsia tardía.",
  "NÃO usar corticoide — aumenta mortalidade no TCE (estudo CRASH).":
    "NO usar corticoide — aumenta la mortalidad en el TCE (estudio CRASH).",
  "Normovolemia com cristaloide isotônico; evitar soluções hipotônicas (glicosado, Ringer lactato em excesso).":
    "Normovolemia con cristaloide isotónico; evitar las soluciones hipotónicas (dextrosa, exceso de Ringer lactato).",
  "Cabeceira 30°, cabeça neutra, aliviar qualquer compressão jugular; garantir sedação/analgesia.":
    "Cabecera a 30°, cabeza neutra, aliviar cualquier compresión yugular; asegurar sedación/analgesia.",
  "Terapia hiperosmolar — Salina hipertônica 3%: {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min (preferida se hipotenso/hipovolêmico).":
    "Terapia hiperosmolar — Solución salina hipertónica al 3%: {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) en 10–20 min (preferida si está hipotenso/hipovolémico).",
  "OU Manitol 20%: {manitolMin}–{manitolMax} g (0,25–1 g/kg) em 15–20 min — cuidado: diurese osmótica e hipotensão; manter volemia.":
    "O Manitol al 20%: {manitolMin}–{manitolMax} g (0,25–1 g/kg) en 15–20 min — cuidado: diuresis osmótica e hipotensión; mantener la volemia.",
  "Hiperventilação APENAS como ponte curta: PaCO₂ 30–35 mmHg por poucos minutos até a descompressão (vasoconstrição reduz fluxo cerebral — nunca prolongar).":
    "Hiperventilación SOLO como puente breve: PaCO₂ 30–35 mmHg durante pocos minutos hasta la descompresión (la vasoconstricción reduce el flujo cerebral — nunca prolongarla).",
  "Acionar neurocirurgia imediatamente (drenagem/craniectomia descompressiva).":
    "Activar neurocirugía de inmediato (drenaje/craniectomía descompresiva).",
  "Tratar febre, convulsão e agitação — todos aumentam a PIC.":
    "Tratar la fiebre, las convulsiones y la agitación — todas aumentan la PIC.",
  "Manter PPC 60–70 mmHg com vasopressor se necessário.":
    "Mantener PPC 60–70 mmHg con vasopresor si es necesario.",
  "Observação clínica; alta com acompanhante orientado e orientações POR ESCRITO.":
    "Observación clínica; alta con acompañante instruido e indicaciones POR ESCRITO.",
  "Retorno imediato: rebaixamento, cefaleia progressiva, vômitos repetidos, convulsão, déficit focal, assimetria pupilar, saída de líquido claro pelo nariz/ouvido.":
    "Regreso inmediato: deterioro del sensorio, cefalea progresiva, vómitos repetidos, convulsión, déficit focal, asimetría pupilar, salida de líquido claro por la nariz/el oído.",
  "Evitar álcool, sedativos e atividade de risco; retorno gradual às atividades.":
    "Evitar el alcohol, los sedantes y las actividades de riesgo; retorno gradual a las actividades.",
  "Se anticoagulado: observação prolongada e TC mesmo com exame normal.":
    "Si está anticoagulado: observación prolongada y TC incluso con examen normal.",
  "Neurocirurgia IMEDIATA; hematoma extradural com anisocoria é emergência absoluta (janela terapêutica curta).":
    "Neurocirugía INMEDIATA; el hematoma epidural con anisocoria es una emergencia absoluta (ventana terapéutica corta).",
  "Manter PAS ≥ 110 mmHg, SpO₂ ≥ 90%, normocapnia e cabeceira a 30°.":
    "Mantener PAS ≥ 110 mmHg, SpO₂ ≥ 90%, normocapnia y cabecera a 30°.",
  "Reverter anticoagulação/coagulopatia sem demora.":
    "Revertir la anticoagulación/coagulopatía sin demora.",
  "Se sinais de herniação enquanto aguarda: terapia hiperosmolar e hiperventilação apenas como ponte.":
    "Si aparecen signos de herniación mientras espera: terapia hiperosmolar e hiperventilación solo como puente.",
  "Metas mantidas: PIC < 22 mmHg, PPC 60–70 mmHg, PaCO₂ 35–45, SpO₂ ≥ 90%, PAS ≥ 110, normotermia e normoglicemia.":
    "Metas mantenidas: PIC < 22 mmHg, PPC 60–70 mmHg, PaCO₂ 35–45, SpO₂ ≥ 90%, PAS ≥ 110, normotermia y normoglucemia.",
  "TC de controle em 6–12 h ou a qualquer deterioração; exame neurológico seriado.":
    "TC de control en 6–12 h o ante cualquier deterioro; examen neurológico seriado.",
  "Profilaxia de TVP (mecânica imediata; farmacológica após 24–48 h com sangramento estável, em conjunto com a neurocirurgia).":
    "Profilaxis de TVP (mecánica inmediata; farmacológica tras 24–48 h con sangrado estable, en conjunto con neurocirugía).",
  "Nutrição enteral precoce; profilaxia de úlcera de estresse; controle rigoroso de febre.":
    "Nutrición enteral precoz; profilaxis de úlcera de estrés; control estricto de la fiebre.",
  "Evitar hipo-osmolaridade; sódio sérico normal-alto conforme protocolo.":
    "Evitar la hipoosmolaridad; sodio sérico normal-alto según el protocolo.",
};
