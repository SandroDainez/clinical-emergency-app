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
  "TC de controle em 6–12 h ou a qualquer deterioração; exame neurológico seriado.":
    "TC de control en 6–12 h o ante cualquier deterioro; examen neurológico seriado.",
  "Profilaxia de TVP (mecânica imediata; farmacológica após 24–48 h com sangramento estável, em conjunto com a neurocirurgia).":
    "Profilaxis de TVP (mecánica inmediata; farmacológica tras 24–48 h con sangrado estable, en conjunto con neurocirugía).",
  "Nutrição enteral precoce; profilaxia de úlcera de estresse; controle rigoroso de febre.":
    "Nutrición enteral precoz; profilaxis de úlcera de estrés; control estricto de la fiebre.",
  "Evitar hipo-osmolaridade; sódio sérico normal-alto conforme protocolo.":
    "Evitar la hipoosmolaridad; sodio sérico normal-alto según el protocolo.",
  "Repetir TC em 6–12 h da TC INICIAL ou se houver qualquer deterioração neurológica.": "Repetir la TC a las 6–12 h de la TC INICIAL o si hay cualquier deterioro neurológico.",
  "⚠️ NÃO ESPERE A TRÍADE DE CUSHING: hipertensão, bradicardia e respiração irregular juntas são incomuns e costumam ser tardias. Um sinal isolado desta lista já responde SIM.":
    "⚠️ NO ESPERE LA TRÍADA DE CUSHING: hipertensión, bradicardia y respiración irregular juntas son infrecuentes y suelen ser tardías. Un signo aislado de esta lista ya responde SÍ.",
  "⚠️ TCE CLASSIFICADO COMO LEVE PODE VIRAR EMERGÊNCIA NEUROCIRÚRGICA — o hematoma extradural em expansão é o exemplo clássico. O que muda a conduta não é o Glasgow de agora, é a AVALIAÇÃO SERIADA: a queda ao longo das horas vale mais que o número desta medida.":
    "⚠️ EL TCE CLASIFICADO COMO LEVE PUEDE VOLVERSE EMERGENCIA NEUROQUIRÚRGICA — el hematoma epidural en expansión es el ejemplo clásico. Lo que cambia la conducta no es el Glasgow de ahora, es la EVALUACIÓN SERIADA: la caída a lo largo de las horas vale más que el número de esta medida.",
  "⚠️ INDEPENDENTEMENTE DE QUALQUER REGRA DE IMAGEM, ESTES CINCO PEDEM TC: anticoagulação ou antiagregação, coagulopatia, déficit focal, convulsão pós-trauma e intoxicação. Nenhum escore os dispensa — a regra canadense abaixo é para quem NÃO tem nenhum deles.":
    "⚠️ INDEPENDIENTEMENTE DE CUALQUIER REGLA DE IMAGEN, ESTOS CINCO PIDEN TC: anticoagulación o antiagregación, coagulopatía, déficit focal, convulsión postraumática e intoxicación. Ningún puntaje los dispensa — la regla canadiense de abajo es para quien NO tiene ninguno de ellos.",
  "⚠️ NÃO transformar a Canadian CT Head Rule em regra universal. Déficit focal, convulsão pós-trauma, suspeita de fratura e outros sinais de alto risco indicam TC. Em anticoagulante ou antiagregante (EXCETO aspirina em monoterapia), considerar TC mesmo sem outro critério; intoxicação isolada torna o exame menos confiável e exige julgamento/observação, mas não é indicação automática de TC por si só.": "⚠️ NO convertir la Canadian CT Head Rule en una regla universal. Déficit focal, convulsión postraumática, sospecha de fractura y otros signos de alto riesgo indican TC. En anticoagulantes o antiagregantes (EXCEPTO aspirina en monoterapia), considerar TC incluso sin otro criterio; la intoxicación aislada hace menos confiable el examen y exige juicio/observación, pero no es una indicación automática de TC por sí sola.",
  "Fora da Canadian CT Head Rule: déficit focal, convulsão pós-trauma e sinais de fratura/lesão grave têm indicação própria de TC. Em anticoagulante ou antiagregante (exceto aspirina em monoterapia), o NICE recomenda CONSIDERAR TC mesmo sem outra indicação; coagulopatia aumenta o risco. Intoxicação isolada reduz a confiabilidade do exame e exige julgamento clínico/observação, não TC automática apenas por esse motivo.": "Fuera de la Canadian CT Head Rule: déficit focal, convulsión postraumática y signos de fractura/lesión grave tienen indicación propia de TC. En anticoagulantes o antiagregantes (excepto aspirina en monoterapia), NICE recomienda CONSIDERAR TC incluso sin otra indicación; la coagulopatía aumenta el riesgo. La intoxicación aislada reduce la confiabilidad del examen y exige juicio clínico/observación, no TC automática solo por ese motivo.",
  "Em anticoagulante ou antiagregante (exceto aspirina em monoterapia), considerar TC mesmo sem outro critério conforme risco e possibilidade de seguimento. Após TC normal, não impor observação prolongada apenas pelo fármaco: decidir pela evolução clínica, confiabilidade do exame, supervisão disponível e capacidade de retorno.": "En anticoagulantes o antiagregantes (excepto aspirina en monoterapia), considerar TC incluso sin otro criterio según riesgo y posibilidad de seguimiento. Tras una TC normal, no imponer observación prolongada solo por el fármaco: decidir según evolución clínica, confiabilidad del examen, supervisión disponible y capacidad de retorno.",
  "Repetir TC IMEDIATAMENTE se houver deterioração neurológica. Em paciente estável com lesão já conhecida, individualizar TC seriada conforme tipo/tamanho da lesão, gravidade do TCE, exame neurológico, anticoagulação/coagulopatia, intervenção planejada e protocolo neurocirúrgico — não impor janela fixa de 6–12 h a todos.": "Repetir TC INMEDIATAMENTE si hay deterioro neurológico. En paciente estable con lesión ya conocida, individualizar la TC seriada según tipo/tamaño de la lesión, gravedad del TCE, examen neurológico, anticoagulación/coagulopatía, intervención planificada y protocolo neuroquirúrgico; no imponer una ventana fija de 6–12 h a todos.",
  "Terapia hiperosmolar — no TCE com PIC elevada/edema cerebral, a Neurocritical Care Society sugere solução hipertônica sobre manitol como manejo inicial quando não houver contraindicação. Regime do protocolo institucional citado: NaCl 3% {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min. Concentração e dose variam entre protocolos: titular à resposta clínica/PIC e monitorar sódio, cloro e função renal. NaCl 20% 40 mL IV em 5 min é outro regime institucional; repetir apenas conforme resposta e protocolo neurocrítico, não por intervalo universal fixo.": "Terapia hiperosmolar — en TCE con PIC elevada/edema cerebral, la Neurocritical Care Society sugiere solución hipertónica sobre manitol como manejo inicial cuando no haya contraindicación. Régimen del protocolo institucional citado: NaCl 3% {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) en 10–20 min. La concentración y la dosis varían entre protocolos: titular según respuesta clínica/PIC y monitorizar sodio, cloro y función renal. NaCl 20% 40 mL IV en 5 min es otro régimen institucional; repetir solo según respuesta y protocolo neurocrítico, no por un intervalo universal fijo.",
  "Manitol 20%: {manitolMin}–{manitolMax} g (0,25–1 g/kg) em 15–20 min permanece alternativa eficaz quando solução hipertônica não é apropriada ou não está disponível. Repetição deve ser guiada pela resposta/PIC e segurança, não por relógio fixo; vigiar volemia, pressão arterial e função renal por diurese osmótica e risco de hipotensão/lesão renal.": "Manitol 20%: {manitolMin}–{manitolMax} g (0,25–1 g/kg) en 15–20 min sigue siendo una alternativa eficaz cuando la solución hipertónica no es apropiada o no está disponible. La repetición debe guiarse por la respuesta/PIC y la seguridad, no por un reloj fijo; vigilar volemia, presión arterial y función renal por diuresis osmótica y riesgo de hipotensión/lesión renal.",
  "Durante manitol, monitorar função renal, volemia e carga osmótica. A NCS sugere usar o GAP OSMOLAR em vez de um limiar isolado de osmolaridade para acompanhar risco de acúmulo/lesão renal, mas NÃO há evidência suficiente para um cutoff obrigatório; 20 mOsm/kg é usado em alguns protocolos, porém não é um limite validado. Gap = osmolaridade medida − calculada; ao calcular com ureia total em mg/dL, usar a fórmula compatível com o laboratório local e não confundir ureia com BUN.": "Durante manitol, monitorizar función renal, volemia y carga osmótica. La NCS sugiere usar el GAP OSMOLAR en lugar de un umbral aislado de osmolaridad para seguir el riesgo de acumulación/lesión renal, pero NO hay evidencia suficiente para un punto de corte obligatorio; 20 mOsm/kg se usa en algunos protocolos, pero no es un límite validado. Gap = osmolaridad medida − calculada; al calcular con urea total en mg/dL, usar la fórmula compatible con el laboratorio local y no confundir urea con BUN.",
  "HIC REFRATÁRIA às medidas acima — 2ª ETAPA: aprofundar sedação e analgesia, repetir/ajustar terapia hiperosmolar guiada pela PIC e pela resposta clínica e avaliar craniectomia descompressiva com o neurocirurgião. Não perseguir um alvo fixo de natremia apenas para tratar a PIC; evitar hipernatremia/hipercloremia graves e monitorar função renal. ⚠️ Antes de subir de etapa, refazer a checagem das causas extracranianas — a resistência ao tratamento costuma ter causa remediável.": "HIC REFRACTARIA a las medidas anteriores — 2ª ETAPA: profundizar sedación y analgesia, repetir/ajustar terapia hiperosmolar guiada por la PIC y la respuesta clínica y evaluar craniectomía descompresiva con neurocirugía. No perseguir un objetivo fijo de natremia solo para tratar la PIC; evitar hipernatremia/hipercloremia graves y monitorizar función renal. ⚠️ Antes de subir de etapa, repetir la búsqueda de causas extracraneales: la resistencia al tratamiento suele tener una causa corregible.",
  "HIC refratária — 3ª ETAPA, medidas de RESGATE de maior risco: após revisar causas reversíveis, terapias dos tiers anteriores e opções neurocirúrgicas, considerar barbitúrico em dose alta para PIC refratária apenas com estabilidade hemodinâmica e monitorização intensiva/EEG contínuo. A BTF recomenda barbitúrico nesse contexto, mas não impõe um agente, esquema de dose ou padrão universal de surto-supressão; seguir protocolo neurocrítico local e titular à PIC/EEG/tolerância hemodinâmica.": "HIC refractaria — 3ª ETAPA, medidas de RESCATE de mayor riesgo: tras revisar causas reversibles, terapias de los tiers previos y opciones neuroquirúrgicas, considerar barbitúrico en dosis altas para PIC refractaria solo con estabilidad hemodinámica y monitorización intensiva/EEG continuo. La BTF recomienda barbitúrico en este contexto, pero no impone un agente, esquema de dosis ni patrón universal de supresión-brote; seguir el protocolo neurocrítico local y titular según PIC/EEG/tolerancia hemodinámica.",
  "TEMPERATURA: nos tiers 1–2, manter normotermia controlada com temperatura central 36,0–37,5 °C e tratar febre. Se a PIC permanecer refratária apesar dos tiers 1–2, hipotermia terapêutica <36 °C pode ser considerada de forma selecionada pela equipe neurocrítica; se usada, manter o alvo o mais próximo possível da fisiologia. Não impor 32–34 °C como alvo universal nem uma ordem obrigatória entre hipotermia, barbitúrico e craniectomia. Hiperventilação permanece medida de resgate e exige monitorização cerebral quando disponível.": "TEMPERATURA: en los tiers 1–2, mantener normotermia controlada con temperatura central 36,0–37,5 °C y tratar la fiebre. Si la PIC permanece refractaria pese a los tiers 1–2, la hipotermia terapéutica <36 °C puede considerarse de forma seleccionada por el equipo neurocrítico; si se usa, mantener el objetivo lo más próximo posible a la fisiología. No imponer 32–34 °C como objetivo universal ni un orden obligatorio entre hipotermia, barbitúrico y craniectomía. La hiperventilación sigue siendo una medida de rescate y exige monitorización cerebral cuando esté disponible.",
  "Exame neurológico seriado; repetir TC IMEDIATAMENTE diante de deterioração. Em paciente estável com lesão conhecida, individualizar imagem de controle conforme padrão da lesão, evolução, coagulação, intervenção planejada e protocolo neurocirúrgico — sem janela fixa universal.": "Examen neurológico seriado; repetir TC INMEDIATAMENTE ante deterioro. En paciente estable con lesión conocida, individualizar la imagen de control según patrón de la lesión, evolución, coagulación, intervención planificada y protocolo neuroquirúrgico, sin una ventana fija universal.",
  "HIC REFRATÁRIA: a escalada em etapas está no passo de conduta da herniação — 1ª etapa (medidas gerais, osmoterapia e drenagem quando disponível), 2ª (aprofundar sedação, ajustar osmoterapia pela resposta e reavaliar opção neurocirúrgica) e 3ª (resgates selecionados de maior risco, como barbitúrico, hipotermia terapêutica e hiperventilação monitorizada). Aqui se mantém apenas o que demonstrar benefício sobre a PIC e tolerância clínica, com reavaliação contínua.": "HIC REFRACTARIA: la escalada por etapas está en el paso de manejo de la herniación — 1ª etapa (medidas generales, osmoterapia y drenaje cuando esté disponible), 2ª (profundizar sedación, ajustar osmoterapia según respuesta y reevaluar opción neuroquirúrgica) y 3ª (rescates seleccionados de mayor riesgo, como barbitúrico, hipotermia terapéutica e hiperventilación monitorizada). Aquí se mantiene solo lo que demuestre beneficio sobre la PIC y tolerancia clínica, con reevaluación continua.",
  "Profilaxia de TEV: usar compressão pneumática quando não houver contraindicação. Em TCE não operado com imagem de controle estável e baixo risco de progressão hemorrágica, considerar LMWH precocemente (frequentemente dentro de 24–48 h após demonstrar estabilidade); em hemorragia de maior risco, progressão, craniotomia/craniectomia, EVD ou outra intervenção intracraniana, individualizar o início em conjunto com trauma/neurocirurgia — não usar 24–48 h como relógio automático.": "Profilaxis de TEV: usar compresión neumática cuando no haya contraindicación. En TCE no operado con imagen de control estable y bajo riesgo de progresión hemorrágica, considerar HBPM precozmente (con frecuencia dentro de 24–48 h después de demostrar estabilidad); en hemorragia de mayor riesgo, progresión, craneotomía/craniectomía, DVE u otra intervención intracraneal, individualizar el inicio junto con trauma/neurocirugía; no usar 24–48 h como reloj automático.",
  "Monitorização invasiva da PIC: a BTF recomenda manejar o TCE grave usando informação da PIC. As regras clássicas — GCS 3–8 com TC alterada; ou TC normal com ≥2 entre idade >40 anos, postura motora anômala e PAS <90 mmHg — são REAPRESENTADAS pela 4ª edição para reconhecer alto risco, mas derivam de recomendações antigas que não atendem aos padrões atuais de evidência. Usar quadro clínico, TC, possibilidade de exame neurológico, necessidade de sedação/intervenção e decisão neurocirúrgica, não um checklist isolado.": "Monitorización invasiva de la PIC: la BTF recomienda manejar el TCE grave usando información de la PIC. Las reglas clásicas — GCS 3–8 con TC alterada; o TC normal con ≥2 entre edad >40 años, postura motora anormal y PAS <90 mmHg — son REEXPUESTAS por la 4ª edición para reconocer alto riesgo, pero derivan de recomendaciones antiguas que no cumplen los estándares actuales de evidencia. Usar cuadro clínico, TC, posibilidad de examen neurológico, necesidad de sedación/intervención y decisión neuroquirúrgica, no un checklist aislado.",
  "Sem monitor invasivo de PIC disponível, Doppler transcraniano, ultrassom da bainha do nervo óptico e pupilometria quantitativa podem acrescentar informação e acompanhar TENDÊNCIAS, especialmente quando combinados ao exame e à TC. Não usar PI, diâmetro da bainha ou NPi com um único cutoff universal para diagnosticar/excluir HIC ou decidir terapia isoladamente; técnica, dispositivo, população e contexto alteram os valores. Deterioração clínica/hernição deve ser tratada pelo quadro global sem esperar um teste não invasivo.": "Sin monitor invasivo de PIC disponible, Doppler transcraneal, ultrasonido de la vaina del nervio óptico y pupilometría cuantitativa pueden añadir información y seguir TENDENCIAS, especialmente combinados con el examen y la TC. No usar PI, diámetro de la vaina o NPi con un único punto de corte universal para diagnosticar/excluir HIC ni decidir terapia aisladamente; técnica, dispositivo, población y contexto modifican los valores. El deterioro clínico/herniación debe tratarse por el cuadro global sin esperar una prueba no invasiva.",
  "EEG contínuo é preferível quando há suspeita relevante de crise não convulsiva, coma/alteração inexplicada ou necessidade de acompanhar terapia que depende do EEG. A duração deve seguir probabilidade pré-teste, achados iniciais, sedação e evolução: em geral são necessárias pelo menos 24 h para rastreio adequado, e pacientes com coma, descargas periódicas ou forte suspeita podem precisar 48 h ou mais — não impor 48 h a todo TCE em coma.": "El EEG continuo es preferible cuando existe sospecha relevante de crisis no convulsiva, coma/alteración inexplicada o necesidad de acompañar terapia dependiente del EEG. La duración debe seguir la probabilidad preprueba, hallazgos iniciales, sedación y evolución: en general se necesitan al menos 24 h para un cribado adecuado, y pacientes con coma, descargas periódicas o alta sospecha pueden requerir 48 h o más; no imponer 48 h a todo TCE en coma.",
};
