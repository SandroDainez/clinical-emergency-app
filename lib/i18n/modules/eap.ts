/**
 * Edema Agudo de Pulmão / SARA — dicionário PT → ES.
 * Terminologia: EAP (edema agudo de pulmón), SDRA, VNI, presión meseta,
 * driving pressure, decúbito prono, furosemida, nitroglicerina, nitroprusiato.
 */
export const ES_EAP: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "EAP — reconhecimento e medidas imediatas": "EAP — reconocimiento y medidas inmediatas",
  "Cardiogênico ou não-cardiogênico (SARA)?": "¿Cardiogénico o no cardiogénico (SDRA)?",
  "Sinais vitais": "Signos vitales",
  "Suporte ventilatório — VNI é PRIMEIRA LINHA": "Soporte ventilatorio — la VNI es la PRIMERA LÍNEA",
  "Classificação pela PA sistólica": "Clasificación según la PA sistólica",
  "EAP hipertensivo (PAS > 180) — vasodilatar é a base":
    "EAP hipertensivo (PAS > 180) — vasodilatar es la base",
  "EAP normotenso-alto (PAS 110–180) — vasodilatador + diurético":
    "EAP normotenso-alto (PAS 110–180) — vasodilatador + diurético",
  "EAP limítrofe (PAS 90–110) — diurético, vasodilatador cauteloso":
    "EAP limítrofe (PAS 90–110) — diurético, vasodilatador con cautela",
  "Choque cardiogênico (PAS < 90 + hipoperfusão)":
    "Choque cardiogénico (PAS < 90 + hipoperfusión)",
  "Causa precipitante": "Causa precipitante",
  "EAP por SCA — tratar a síndrome coronariana":
    "EAP por SCA — tratar el síndrome coronario",
  "EAP por taquiarritmia — controle do ritmo/frequência":
    "EAP por taquiarritmia — control del ritmo/la frecuencia",
  "Reavaliação da resposta": "Reevaluación de la respuesta",
  "EAP refratário — escalonar": "EAP refractario — escalar",
  "Reavaliação após escalonamento": "Reevaluación tras el escalamiento",
  "Destino — UTI / unidade de cuidados": "Destino — UCI / unidad de cuidados",
  "SARA — critérios de Berlim 2012": "SDRA — criterios de Berlín 2012",
  "Dados para ventilação protetora": "Datos para la ventilación protectora",
  "Ventilação protetora — ARDSNet": "Ventilación protectora — ARDSNet",
  "Gravidade da SARA e resposta": "Gravedad de la SDRA y respuesta",
  "Manobras de resgate — SARA grave": "Maniobras de rescate — SDRA grave",
  "Destino — UTI (SARA)": "Destino — UCI (SDRA)",
  "Módulo de ventilação mecânica": "Módulo de ventilación mecánica",
  "Módulo de drogas vasoativas": "Módulo de fármacos vasoactivos",
  "Edema Agudo de Pulmão": "Edema agudo de pulmón",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "Qual o mecanismo mais provável do edema pulmonar?":
    "¿Cuál es el mecanismo más probable del edema pulmonar?",
  "Qual a faixa da PA sistólica?": "¿En qué rango está la PA sistólica?",
  "Há SCA (supra de ST/isquemia) ou taquiarritmia como causa?":
    "¿Hay SCA (elevación del ST/isquemia) o taquiarritmia como causa?",
  "Houve melhora (oxigenação, dispneia, hemodinâmica, diurese)?":
    "¿Hubo mejoría (oxigenación, disnea, hemodinamia, diuresis)?",
  "Estabilizou após o escalonamento?": "¿Se estabilizó tras el escalamiento?",
  "O quadro preenche os critérios de Berlim para SARA?":
    "¿El cuadro cumple los criterios de Berlín para SDRA?",
  "A SARA é grave/refratária apesar da ventilação protetora?":
    "¿La SDRA es grave/refractaria a pesar de la ventilación protectora?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Emergência com risco imediato de morte por hipóxia. Agir ANTES da confirmação laboratorial/imagiológica.":
    "Emergencia con riesgo inmediato de muerte por hipoxia. Actuar ANTES de la confirmación de laboratorio o por imagen.",
  "O tratamento é FUNDAMENTALMENTE diferente — definir o mecanismo é a primeira decisão.":
    "El tratamiento es FUNDAMENTALMENTE distinto — definir el mecanismo es la primera decisión.",
  "VNI reduz intubação e mortalidade no EAP cardiogênico (evidência nível I — 3CPO trial).":
    "La VNI reduce la intubación y la mortalidad en el EAP cardiogénico (evidencia nivel I — estudio 3CPO).",
  "PAS informada: {pas} mmHg · SpO₂ {spo2}%. O vasodilatador IV exige PAS ≥ 110 mmHg.":
    "PAS informada: {pas} mmHg · SpO₂ {spo2}%. El vasodilatador IV exige una PAS ≥ 110 mmHg.",
  "Reduzir a pós-carga de forma controlada é o tratamento principal; diurético é adjuvante.":
    "Reducir la poscarga de forma controlada es el tratamiento principal; el diurético es adyuvante.",
  "Tríade: VNI + diurético IV + vasodilatador IV.": "Tríada: VNI + diurético IV + vasodilatador IV.",
  "Margem estreita para vasodilatar — priorizar diurético e vigiar a perfusão.":
    "Margen estrecho para vasodilatar — priorizar el diurético y vigilar la perfusión.",
  "Mortalidade 30–50%. EVITAR diurético/vasodilatador. Prioridade: inotrópico + vasopressor + causa reversível + suporte mecânico.":
    "Mortalidad 30–50%. EVITAR diuréticos y vasodilatadores. Prioridad: inotrópico + vasopresor + causa reversible + soporte mecánico.",
  "EAP + SCA é alto risco. A reperfusão pode ser o tratamento da congestão.":
    "EAP + SCA es de alto riesgo. La reperfusión puede ser el tratamiento de la congestión.",
  "Restaurar ritmo/frequência pode resolver a congestão.":
    "Restaurar el ritmo o la frecuencia puede resolver la congestión.",
  "Não insistir em medida que não responde; escalonar o suporte.":
    "No insistir en una medida que no responde; escalar el soporte.",
  "Destino conforme a gravidade e a resposta ao tratamento.":
    "Destino según la gravedad y la respuesta al tratamiento.",
  "Único tratamento que reduz mortalidade na SARA (39,8% → 31%). Peso predito {pp} kg · VC alvo {vc_min}–{vc_max} mL.":
    "Único tratamiento que reduce la mortalidad en la SDRA (39,8% → 31%). Peso predicho {pp} kg · volumen corriente objetivo {vc_min}–{vc_max} mL.",
  "Relação P/F: {pf_txt}.": "Relación P/F: {pf_txt}.",
  "Escalonar de forma estruturada; ECMO precoce em centro habilitado.":
    "Escalar de forma estructurada; ECMO precoz en un centro habilitado.",
  "SARA exige cuidado intensivo e ventilação protetora contínua.":
    "La SDRA exige cuidados intensivos y ventilación protectora continua.",
  "IOT realizada / ventilação protetora — ajuste detalhado de parâmetros.":
    "Intubación realizada / ventilación protectora — ajuste detallado de los parámetros.",
  "Choque cardiogênico — titulação de inotrópico/vasopressor.":
    "Choque cardiogénico — titulación de inotrópico/vasopresor.",

  // ── Opções e campos ────────────────────────────────────────────────────────
  "Cardiogênico (EAP-C) — congestão por falência de VE":
    "Cardiogénico (EAP-C) — congestión por fallo del ventrículo izquierdo",
  "Não-cardiogênico (SARA/ARDS) — lesão inflamatória":
    "No cardiogénico (SDRA/ARDS) — lesión inflamatoria",
  "PA sistólica": "PA sistólica",
  "SpO₂": "SpO₂",
  "Frequência cardíaca": "Frecuencia cardíaca",
  "PAS > 180 (crise hipertensiva / flash)": "PAS > 180 (crisis hipertensiva / flash)",
  "PAS 110–180 (vasodilatador + diurético)": "PAS 110–180 (vasodilatador + diurético)",
  "PAS 90–110 (diurético, vasodilatador cauteloso)":
    "PAS 90–110 (diurético, vasodilatador con cautela)",
  "PAS < 90 / hipoperfusão (choque cardiogênico)":
    "PAS < 90 / hipoperfusión (choque cardiogénico)",
  "SCA / isquemia": "SCA / isquemia",
  "Taquiarritmia causadora (FA/flutter)": "Taquiarritmia causante (FA/flutter)",
  "Outra causa / não aplicável": "Otra causa / no aplica",
  "Melhora clínica": "Mejoría clínica",
  "Refratário / piora": "Refractario / empeoramiento",
  "Estabilizou — manter monitorização": "Se estabilizó — mantener la monitorización",
  "Em ventilação mecânica — ajustar ventilador":
    "En ventilación mecánica — ajustar el ventilador",
  "Em infusão vasoativa — titular": "En infusión vasoactiva — titular",
  "Sim — critérios de Berlim preenchidos": "Sí — criterios de Berlín cumplidos",
  "Dúvida — pode ser cardiogênico/misto": "Duda — puede ser cardiogénico/mixto",
  "Altura": "Talla",
  "Sexo": "Sexo",
  "Homem": "Hombre",
  "Mulher": "Mujer",
  "Relação P/F (PaO₂/FiO₂)": "Relación P/F (PaO₂/FiO₂)",
  "Grave/refratária (P/F ≤ 150) — manobras de resgate":
    "Grave/refractaria (P/F ≤ 150) — maniobras de rescate",
  "Controlada com VM protetora": "Controlada con ventilación mecánica protectora",
  "Ventilação Mecânica": "Ventilación mecánica",
  "Drogas Vasoativas": "Fármacos vasoactivos",
  "Toque nos valores (ou adicione). A PA sistólica define o tratamento.":
    "Toque los valores (o agréguelos). La PA sistólica define el tratamiento.",
  "Altura e sexo calculam o peso predito e o volume corrente protetor (ARDSNet).":
    "La talla y el sexo calculan el peso predicho y el volumen corriente protector (ARDSNet).",
  "Setup e titulação do ventilador (protetora na SARA, suporte no EAP-C refratário).":
    "Configuración y titulación del ventilador (protectora en la SDRA, soporte en el EAP-C refractario).",
  "Titulação de inotrópico + vasopressor no choque cardiogênico.":
    "Titulación de inotrópico + vasopresor en el choque cardiogénico.",

  // ── Evidência ──────────────────────────────────────────────────────────────
  "CARDIOGÊNICO (↑ pressão hidrostática, PCP > 18): dispneia abrupta/ortopneia/DPN, secreção espumosa rosada, crepitantes de base→ápice, BNP muito elevado (> 400), cardiomegalia + linhas B Kerley no RX, FE reduzida/disfunção diastólica. Causas: ICC descompensada, IAM, crise hipertensiva, valvopatia aguda, taquiarritmia, sobrecarga de volume.":
    "CARDIOGÉNICO (↑ presión hidrostática, PCP > 18): disnea brusca/ortopnea/disnea paroxística nocturna, secreción espumosa rosada, crepitantes de base→ápice, BNP muy elevado (> 400), cardiomegalia + líneas B de Kerley en la radiografía, fracción de eyección reducida o disfunción diastólica. Causas: insuficiencia cardíaca descompensada, infarto agudo de miocardio, crisis hipertensiva, valvulopatía aguda, taquiarritmia, sobrecarga de volumen.",
  "NÃO-CARDIOGÊNICO / SARA (↑ permeabilidade capilar, PCP ≤ 18): dispneia progressiva (horas–dias), infiltrado bilateral difuso SEM cardiomegalia, BNP normal/pouco elevado, FE normal/VE não dilatado. Causas: pneumonia, sepse, aspiração, trauma, pancreatite, TRALI, inalação.":
    "NO CARDIOGÉNICO / SDRA (↑ permeabilidad capilar, PCP ≤ 18): disnea progresiva (horas–días), infiltrado bilateral difuso SIN cardiomegalia, BNP normal o poco elevado, fracción de eyección normal y ventrículo izquierdo no dilatado. Causas: neumonía, sepsis, aspiración, trauma, pancreatitis, TRALI, inhalación.",
  "MISTO (sepse em cardiopata, pós-op cardíaco): tratar componente dominante; reavaliar com POCUS/ecocardiograma.":
    "MIXTO (sepsis en cardiópata, posoperatorio cardíaco): tratar el componente dominante; reevaluar con POCUS/ecocardiograma.",
  "Na dúvida: BNP/NT-proBNP + ecocardiograma/POCUS à beira leito orientam.":
    "Ante la duda: BNP/NT-proBNP + ecocardiograma/POCUS a pie de cama orientan el diagnóstico.",
  "PAS > 180 (crise hipertensiva / 'flash'): predomínio de redistribuição de líquido — vasodilatador é a base; nitroprussiato preferível.":
    "PAS > 180 (crisis hipertensiva o «flash»): predomina la redistribución de líquido — el vasodilatador es la base; se prefiere el nitroprusiato.",
  "PAS 110–180: vasodilatador IV (nitroglicerina) + diurético conforme congestão.":
    "PAS 110–180: vasodilatador IV (nitroglicerina) + diurético según la congestión.",
  "PAS 90–110: diurético é a base; vasodilatador com MUITA cautela e monitorização estreita.":
    "PAS 90–110: el diurético es la base; el vasodilatador con MUCHA cautela y monitorización estrecha.",
  "PAS < 90 + hipoperfusão (choque cardiogênico): NÃO usar vasodilatador/diurético agressivo — inotrópico + vasopressor.":
    "PAS < 90 + hipoperfusión (choque cardiogénico): NO usar vasodilatadores ni diuréticos agresivos — inotrópico + vasopresor.",
  "EAP pode ser desencadeado por SCA, crise hipertensiva, taquiarritmia (FA de alta resposta, flutter), valvopatia aguda ou má adesão.":
    "El EAP puede desencadenarse por SCA, crisis hipertensiva, taquiarritmia (FA de respuesta rápida, flutter), valvulopatía aguda o mala adherencia al tratamiento.",
  "IAM: ECG + troponina seriada. IAMCSST ou IAMSSST de alto risco → cinecoronariografia de urgência. Não retardar reperfusão pelo EAP.":
    "Infarto: ECG + troponina seriada. IAMCEST o IAMSEST de alto riesgo → coronariografía urgente. No retrasar la reperfusión por el EAP.",
  "Taquiarritmia: cardioversão elétrica sincronizada se instável; amiodarona 150 mg IV em 10 min se FA estável; digoxina 0,5 mg IV em FA com disfunção sistólica severa.":
    "Taquiarritmia: cardioversión eléctrica sincronizada si está inestable; amiodarona 150 mg IV en 10 min si la FA es estable; digoxina 0,5 mg IV en FA con disfunción sistólica grave.",
  "Reavaliar SpO₂, padrão respiratório, PA, perfusão e diurese após as primeiras medidas (15–30 min).":
    "Reevaluar SpO₂, patrón respiratorio, PA, perfusión y diuresis tras las primeras medidas (15–30 min).",
  "EAP refratário ou exaustão respiratória → via aérea definitiva e cuidado intensivo.":
    "EAP refractario o agotamiento respiratorio → vía aérea definitiva y cuidados intensivos.",
  "Diurese < 0,5 mL/kg/h após furosemida = resposta inadequada (dobrar dose ou infusão contínua).":
    "Diuresis < 0,5 mL/kg/h tras la furosemida = respuesta inadecuada (duplicar la dosis o pasar a infusión continua).",
  "Reavaliar continuamente — reescalonar a qualquer sinal de deterioração.":
    "Reevaluar continuamente — volver a escalar ante cualquier signo de deterioro.",
  "Necessidade persistente de VM, inotrópico/vasopressor ou suporte mecânico = UTI obrigatória.":
    "La necesidad persistente de ventilación mecánica, inotrópico/vasopresor o soporte mecánico = UCI obligatoria.",
  "INÍCIO: agudo (< 1 semana) após fator precipitante identificável.":
    "INICIO: agudo (< 1 semana) tras un factor precipitante identificable.",
  "IMAGEM: opacidades bilaterais no RX/TC não explicadas por derrame, atelectasia ou nódulo.":
    "IMAGEN: opacidades bilaterales en la radiografía/TC no explicadas por derrame, atelectasia o nódulo.",
  "ORIGEM: edema NÃO explicado por IC/sobrecarga (BNP < 100 ou ecocardiograma normal). Na dúvida: ecocardiograma/Swan-Ganz.":
    "ORIGEN: edema NO explicado por insuficiencia cardíaca ni sobrecarga (BNP < 100 o ecocardiograma normal). Ante la duda: ecocardiograma o catéter de Swan-Ganz.",
  "HIPOXEMIA (PaO₂/FiO₂ com PEEP ≥ 5): Leve 200 < P/F ≤ 300 · Moderada 100 < P/F ≤ 200 · Grave P/F ≤ 100.":
    "HIPOXEMIA (PaO₂/FiO₂ con PEEP ≥ 5): leve 200 < P/F ≤ 300 · moderada 100 < P/F ≤ 200 · grave P/F ≤ 100.",
  "SARA grave: P/F ≤ 100. Refratária: P/F ≤ 150 com FiO₂ ≥ 0,6 e PEEP ≥ 5 após 12–24 h de VM protetora.":
    "SDRA grave: P/F ≤ 100. Refractaria: P/F ≤ 150 con FiO₂ ≥ 0,6 y PEEP ≥ 5 tras 12–24 h de ventilación mecánica protectora.",
  "Manobras de resgate são indicadas na SARA grave/refratária — não aguardar deterioração extrema.":
    "Las maniobras de rescate están indicadas en la SDRA grave o refractaria — no esperar a un deterioro extremo.",

  // ── Ações ──────────────────────────────────────────────────────────────────
  "Sentar o paciente (posição ereta, pernas pendentes) — reduz pré-carga e trabalho respiratório.":
    "Sentar al paciente (posición erguida, piernas colgando) — reduce la precarga y el trabajo respiratorio.",
  "Monitorização contínua: ECG, PA, SpO₂, FR. Dois acessos venosos. Glicemia capilar.":
    "Monitorización continua: ECG, PA, SpO₂ y FR. Dos accesos venosos. Glucemia capilar.",
  "O₂ para SpO₂ alvo ≥ 94% (DPOC 88–92%); preparar VNI precocemente.":
    "O₂ para una SpO₂ objetivo ≥ 94% (EPOC 88–92%); preparar la VNI de forma precoz.",
  "Anamnese/exame dirigidos: início (súbito × progressivo), febre, dor torácica, fator precipitante.":
    "Anamnesis y exploración dirigidas: inicio (súbito × progresivo), fiebre, dolor torácico y factor precipitante.",
  "O₂ para SpO₂ ≥ 94% (DPOC 88–92%).": "O₂ para una SpO₂ ≥ 94% (EPOC 88–92%).",
  "SpO₂ < 94% apesar de O₂ → iniciar VNI IMEDIATAMENTE.":
    "SpO₂ < 94% a pesar del O₂ → iniciar la VNI DE INMEDIATO.",
  "CPAP: PEEP 5–10 cmH₂O + FiO₂ ajustada (0,4–1,0) — evidência mais forte no EAP-C; tão eficaz quanto BiPAP.":
    "CPAP: PEEP 5–10 cmH₂O + FiO₂ ajustada (0,4–1,0) — la evidencia más sólida en el EAP-C; tan eficaz como el BiPAP.",
  "BiPAP: IPAP 10–15 cmH₂O / EPAP 5–8 cmH₂O + FR backup 10–14 rpm — preferir se hipercapnia (PaCO₂ > 45) ou trabalho respiratório aumentado.":
    "BiPAP: IPAP 10–15 cmH₂O / EPAP 5–8 cmH₂O + FR de respaldo 10–14 rpm — preferirlo si hay hipercapnia (PaCO₂ > 45) o aumento del trabajo respiratorio.",
  "Interface: máscara facial total.": "Interfaz: mascarilla facial total.",
  "Critérios de IOT (falha de VNI): SpO₂ < 90% com FiO₂ ≥ 0,6 após 1 h; pH < 7,20 ou PaCO₂ em elevação; FR > 35 com musculatura acessória/paradoxo abdominal; Glasgow < 8 ou agitação; PAS < 90 refratária; intolerância à interface.":
    "Criterios de intubación (fallo de la VNI): SpO₂ < 90% con FiO₂ ≥ 0,6 tras 1 h; pH < 7,20 o PaCO₂ en ascenso; FR > 35 con uso de musculatura accesoria o respiración paradójica; Glasgow < 8 o agitación; PAS < 90 refractaria; intolerancia a la interfaz.",
  "NITROPRUSSIATO DE SÓDIO IV: 0,3 mcg/kg/min → titular até 5 mcg/kg/min. Preferível na crise hipertensiva grave. Monitorar PA invasiva; máx 72 h (toxicidade por tiocianato); proteger da luz.":
    "NITROPRUSIATO DE SODIO IV: 0,3 mcg/kg/min → titular hasta 5 mcg/kg/min. Preferible en la crisis hipertensiva grave. Monitorizar la PA invasiva; máx. 72 h (toxicidad por tiocianato); protegerlo de la luz.",
  "ALTERNATIVA — NITROGLICERINA IV: 10–20 mcg/min → titular 5–10 mcg/min a cada 5 min até alívio ou PAS 90–100 (máx 200 mcg/min). Preferir em isquemia miocárdica concomitante.":
    "ALTERNATIVA — NITROGLICERINA IV: 10–20 mcg/min → titular 5–10 mcg/min cada 5 min hasta el alivio o una PAS de 90–100 (máx. 200 mcg/min). Preferirla en la isquemia miocárdica concomitante.",
  "FUROSEMIDA IV: 20–80 mg em bolus se sobrecarga (dose ≥ dose oral diária habitual do paciente).":
    "FUROSEMIDA IV: 20–80 mg en bolo si hay sobrecarga (dosis ≥ la dosis oral diaria habitual del paciente).",
  "Reduzir a PA de forma controlada (não < 90 mmHg); manter VNI conforme necessidade.":
    "Reducir la PA de forma controlada (no por debajo de 90 mmHg); mantener la VNI según la necesidad.",
  "Evitar morfina de rotina (associada a pior desfecho — ESC 2021 IIb).":
    "Evitar la morfina de rutina (asociada a peores desenlaces — ESC 2021 IIb).",
  "NITROGLICERINA IV: iniciar 10–20 mcg/min → titular 5–10 mcg/min a cada 5 min até alívio ou PAS 90–100 (máx 200 mcg/min). Primeira escolha em isquemia.":
    "NITROGLICERINA IV: iniciar con 10–20 mcg/min → titular 5–10 mcg/min cada 5 min hasta el alivio o una PAS de 90–100 (máx. 200 mcg/min). Primera elección en la isquemia.",
  "FUROSEMIDA IV: 20–80 mg em bolus (dose ≥ dose oral diária habitual). Sem uso prévio de diurético: 20–40 mg. Alvo de diurese: 100–200 mL/h nas primeiras horas.":
    "FUROSEMIDA IV: 20–80 mg en bolo (dosis ≥ la dosis oral diaria habitual). Sin uso previo de diuréticos: 20–40 mg. Objetivo de diuresis: 100–200 mL/h en las primeras horas.",
  "Sem resposta diurética em 1 h: dobrar a dose ou infusão contínua 5–10 mg/h.":
    "Sin respuesta diurética en 1 h: duplicar la dosis o pasar a infusión continua de 5–10 mg/h.",
  "Monitorar PA de perto — suspender vasodilatador se tendência à hipotensão (PAS < 90).":
    "Monitorizar la PA de cerca — suspender el vasodilatador ante una tendencia a la hipotensión (PAS < 90).",
  "Evitar morfina de rotina; reservar 2–4 mg IV lento para angústia refratária (ESC 2021 IIb).":
    "Evitar la morfina de rutina; reservar 2–4 mg IV lentos para la angustia refractaria (ESC 2021 IIb).",
  "FUROSEMIDA IV: 20–40 mg em bolus (ajustar se uso prévio de diurético).":
    "FUROSEMIDA IV: 20–40 mg en bolo (ajustar si hay uso previo de diuréticos).",
  "NITROGLICERINA IV em dose baixa (10 mcg/min) APENAS se sintomas/congestão persistirem e PA permitir — titular muito cautelosamente.":
    "NITROGLICERINA IV en dosis baja (10 mcg/min) SOLO si persisten los síntomas o la congestión y la PA lo permite — titular con mucha cautela.",
  "Monitorização estreita: suspender vasodilatador a qualquer tendência de hipotensão.":
    "Monitorización estrecha: suspender el vasodilatador ante cualquier tendencia a la hipotensión.",
  "Se evoluir para hipoperfusão (lactato ↑, oligúria, pele marmórea) → tratar como choque cardiogênico.":
    "Si evoluciona a hipoperfusión (lactato ↑, oliguria, piel moteada) → tratarlo como un choque cardiogénico.",
  "Evitar morfina de rotina; manter VNI conforme necessidade.":
    "Evitar la morfina de rutina; mantener la VNI según la necesidad.",
  "NÃO usar vasodilatador. Diurético só com MUITA cautela após estabilizar a perfusão.":
    "NO usar vasodilatadores. Diurético solo con MUCHA cautela tras estabilizar la perfusión.",
  "INOTRÓPICO 1ª linha — DOBUTAMINA 2–20 mcg/kg/min IV (aumenta DC, reduz PCWP). Diluir 250 mg em 250 mL.":
    "INOTRÓPICO de 1.ª línea — DOBUTAMINA 2–20 mcg/kg/min IV (aumenta el gasto cardíaco y reduce la PCWP). Diluir 250 mg en 250 mL.",
  "VASOPRESSOR de escolha — NOREPINEFRINA 0,1–1 mcg/kg/min IV (superior à dopamina — SOAP II). Alvo PAM ≥ 65 mmHg. Diluir 4 mg em 250 mL.":
    "VASOPRESOR de elección — NORADRENALINA 0,1–1 mcg/kg/min IV (superior a la dopamina — SOAP II). Objetivo de PAM ≥ 65 mmHg. Diluir 4 mg en 250 mL.",
  "Alternativas: dopamina 5–20 mcg/kg/min (mais arritmogênica) se norepi indisponível; levosimendan 0,05–0,2 mcg/kg/min (sem bolus se PAS < 90) ou milrinona 0,375–0,75 mcg/kg/min em betabloqueados.":
    "Alternativas: dopamina 5–20 mcg/kg/min (más arritmogénica) si no hay noradrenalina; levosimendán 0,05–0,2 mcg/kg/min (sin bolo si la PAS < 90) o milrinona 0,375–0,75 mcg/kg/min en pacientes betabloqueados.",
  "Ecocardiograma/POCUS urgente; cateter de artéria pulmonar (PCWP > 18 + IC < 2,2 confirma).":
    "Ecocardiograma/POCUS urgente; catéter de arteria pulmonar (PCWP > 18 + índice cardíaco < 2,2 lo confirma).",
  "SUPORTE CIRCULATÓRIO MECÂNICO (BIA, Impella, ECMO-VA): considerar precocemente se PAS < 90 após 30 min de vasopressor. Acionar hemodinâmica/UTI cardiovascular.":
    "SOPORTE CIRCULATORIO MECÁNICO (balón de contrapulsación, Impella, ECMO-VA): considerarlo precozmente si la PAS < 90 tras 30 min de vasopresor. Activar hemodinamia/UCI cardiovascular.",
  "Acionar cardiologia/hemodinâmica. IAMCSST → reperfusão imediata (ver módulo Síndromes Coronarianas).":
    "Activar cardiología/hemodinamia. IAMCEST → reperfusión inmediata (ver el módulo Síndromes coronarios).",
  "Iniciar terapia antitrombótica conforme protocolo de SCA (AAS + 2º antiplaquetário + anticoagulação).":
    "Iniciar el tratamiento antitrombótico según el protocolo de SCA (AAS + segundo antiagregante + anticoagulación).",
  "ECG seriado + troponina ultrassensível (repetir 1–3 h).":
    "ECG seriado + troponina ultrasensible (repetir a las 1–3 h).",
  "Manter suporte ventilatório e controle hemodinâmico em paralelo — não retardar a reperfusão.":
    "Mantener el soporte ventilatorio y el control hemodinámico en paralelo — no retrasar la reperfusión.",
  "INSTABILIDADE hemodinâmica → cardioversão elétrica sincronizada de urgência.":
    "INESTABILIDAD hemodinámica → cardioversión eléctrica sincronizada de urgencia.",
  "FA ESTÁVEL → amiodarona 150 mg IV em 10 min → 1 mg/min × 6 h → 0,5 mg/min × 18 h.":
    "FA ESTABLE → amiodarona 150 mg IV en 10 min → 1 mg/min × 6 h → 0,5 mg/min × 18 h.",
  "FA com disfunção sistólica severa → digoxina 0,5 mg IV em 10–20 min → 0,25 mg IV a cada 6 h (máx 1 mg/24 h) para controle de frequência.":
    "FA con disfunción sistólica grave → digoxina 0,5 mg IV en 10–20 min → 0,25 mg IV cada 6 h (máx. 1 mg/24 h) para el control de la frecuencia.",
  "Corrigir distúrbios eletrolíticos (K⁺ 4,0–5,0; Mg²⁺) — hipocalemia pela furosemida favorece arritmia.":
    "Corregir los trastornos electrolíticos (K⁺ 4,0–5,0; Mg²⁺) — la hipopotasemia por furosemida favorece las arritmias.",
  "IOT e ventilação mecânica se falha da VNI, exaustão respiratória ou rebaixamento.":
    "Intubación y ventilación mecánica si fracasa la VNI, hay agotamiento respiratorio o deterioro del sensorio.",
  "Otimizar terapia conforme o perfil hemodinâmico (vasodilatador × inotrópico/vasopressor).":
    "Optimizar el tratamiento según el perfil hemodinámico (vasodilatador × inotrópico/vasopresor).",
  "Resistência ao diurético: furosemida em infusão contínua (500 mg em 250 mL → 5–10 mg/h); monitorar K⁺, Mg²⁺, creatinina.":
    "Resistencia al diurético: furosemida en infusión continua (500 mg en 250 mL → 5–10 mg/h); monitorizar K⁺, Mg²⁺ y creatinina.",
  "Reavaliar a causa (isquemia em curso, arritmia, complicação mecânica) com ecocardiograma.":
    "Reevaluar la causa (isquemia en curso, arritmia, complicación mecánica) con ecocardiograma.",
  "Choque refratário (PAS < 90 após 30 min de vasopressor): acionar suporte circulatório mecânico (BIA/Impella/ECMO-VA).":
    "Choque refractario (PAS < 90 tras 30 min de vasopresor): activar el soporte circulatorio mecánico (balón de contrapulsación/Impella/ECMO-VA).",
  "VOLUME CORRENTE: 4–6 mL/kg de peso PREDITO (não o peso real). Para este paciente: {vc_min}–{vc_max} mL (PP {pp} kg).":
    "VOLUMEN CORRIENTE: 4–6 mL/kg de peso PREDICHO (no del peso real). Para este paciente: {vc_min}–{vc_max} mL (peso predicho {pp} kg).",
  "PRESSÃO DE PLATÔ (Pplat): ≤ 30 cmH₂O — medir a cada 4 h e após mudanças.":
    "PRESIÓN MESETA (Pplat): ≤ 30 cmH₂O — medirla cada 4 h y tras cada cambio.",
  "DRIVING PRESSURE (ΔP = Pplat − PEEP): ≤ 15 cmH₂O — preditor independente de mortalidade.":
    "DRIVING PRESSURE (ΔP = Pplat − PEEP): ≤ 15 cmH₂O — predictor independiente de mortalidad.",
  "PEEP: titular pela tabela PEEP/FiO₂ ARDSNet. SARA moderada-grave: PEEP ≥ 10–12 cmH₂O.":
    "PEEP: titular con la tabla PEEP/FiO₂ de ARDSNet. SDRA moderada-grave: PEEP ≥ 10–12 cmH₂O.",
  "FR: 12–35 rpm — ajustar para manter pH ≥ 7,30 (tolerar hipercapnia permissiva, PaCO₂ até 55).":
    "FR: 12–35 rpm — ajustarla para mantener un pH ≥ 7,30 (tolerar la hipercapnia permisiva, PaCO₂ hasta 55).",
  "ALVOS: SpO₂ 88–95% / PaO₂ 55–80 mmHg — tolerar hipoxemia moderada para evitar FiO₂ alta (> 0,6 por > 24 h é lesiva).":
    "OBJETIVOS: SpO₂ 88–95% / PaO₂ 55–80 mmHg — tolerar la hipoxemia moderada para evitar una FiO₂ alta (> 0,6 durante > 24 h es lesiva).",
  "MODO: VCV ou PCV — ambos aceitáveis se ΔP e Pplat controlados.":
    "MODO: VCV o PCV — ambos son aceptables si el ΔP y la Pplat están controlados.",
  "RESTRIÇÃO HÍDRICA: balanço zero a negativo após estabilização hemodinâmica (FACTT — menos dias de VM).":
    "RESTRICCIÓN HÍDRICA: balance de cero a negativo tras la estabilización hemodinámica (FACTT — menos días de ventilación mecánica).",
  "TRATAR A CAUSA: antibiótico se pneumonia/sepse; suporte da pancreatite, etc.":
    "TRATAR LA CAUSA: antibiótico si hay neumonía o sepsis; soporte de la pancreatitis, etc.",
  "POSIÇÃO PRONA: 16 h/dia — reduz mortalidade (PROSEVA, RR 0,61). Iniciar se P/F ≤ 150 com FiO₂ ≥ 0,6 e PEEP ≥ 5. Contraindicações: instabilidade hemodinâmica grave, trauma facial, PIC elevada, gestação avançada.":
    "DECÚBITO PRONO: 16 h/día — reduce la mortalidad (PROSEVA, RR 0,61). Iniciarlo si P/F ≤ 150 con FiO₂ ≥ 0,6 y PEEP ≥ 5. Contraindicaciones: inestabilidad hemodinámica grave, trauma facial, presión intracraneal elevada y embarazo avanzado.",
  "BLOQUEIO NEUROMUSCULAR precoce: cisatracúrio 37,5 mg/h × 48 h — considerar em dissincronia grave, drive excessivo ou prona (ACURASYS benefício; ROSE neutro com sedação profunda).":
    "BLOQUEO NEUROMUSCULAR precoz: cisatracurio 37,5 mg/h × 48 h — considerarlo en la disincronía grave, el impulso respiratorio excesivo o el decúbito prono (ACURASYS mostró beneficio; ROSE fue neutro con sedación profunda).",
  "CORTICOIDE: metilprednisolona 1 mg/kg/dia ou dexametasona 20 mg/dia × 5 d → 10 mg/dia × 5 d (DEXA-ARDS reduziu VM e mortalidade). COVID-19 com O₂: dexametasona 6 mg/dia × 10 d (RECOVERY).":
    "CORTICOIDE: metilprednisolona 1 mg/kg/día o dexametasona 20 mg/día × 5 días → 10 mg/día × 5 días (DEXA-ARDS redujo la ventilación mecánica y la mortalidad). COVID-19 con O₂: dexametasona 6 mg/día × 10 días (RECOVERY).",
  "RECRUTAMENTO ALVEOLAR: usar com CAUTELA e monitorização hemodinâmica (ART trial — recrutamento agressivo aumentou mortalidade).":
    "RECLUTAMIENTO ALVEOLAR: usarlo con CAUTELA y con monitorización hemodinámica (estudio ART — el reclutamiento agresivo aumentó la mortalidad).",
  "ÓXIDO NÍTRICO INALATÓRIO (5–40 ppm): melhora P/F transitoriamente, sem benefício em mortalidade — ponte para ECMO/resgate temporário.":
    "ÓXIDO NÍTRICO INHALADO (5–40 ppm): mejora la P/F de forma transitoria, sin beneficio en la mortalidad — puente hacia el ECMO o rescate temporal.",
  "ECMO VENOVENOSA: SARA grave refratária (P/F < 80 com FiO₂ 1,0 e PEEP ≥ 10, pH < 7,25 por > 6 h). Encaminhar PRECOCEMENTE a centro habilitado (EOLIA).":
    "ECMO VENOVENOSA: SDRA grave refractaria (P/F < 80 con FiO₂ 1,0 y PEEP ≥ 10, pH < 7,25 durante > 6 h). Derivar PRECOZMENTE a un centro habilitado (EOLIA).",
  "Choque cardiogênico, necessidade de VM/inotrópico/vasopressor ou EAP por SCA → UTI.":
    "Choque cardiogénico, necesidad de ventilación mecánica/inotrópico/vasopresor o EAP por SCA → UCI.",
  "Metas: SpO₂ ≥ 94%, PAS 110–130 com vasodilatador (não < 90), PAM ≥ 65 no choque, diurese ≥ 0,5 mL/kg/h, K⁺ 4,0–5,0, glicemia 140–180.":
    "Metas: SpO₂ ≥ 94%, PAS 110–130 con vasodilatador (no < 90), PAM ≥ 65 en el choque, diuresis ≥ 0,5 mL/kg/h, K⁺ 4,0–5,0 y glucemia 140–180.",
  "Boa resposta e estabilidade → observação monitorizada e otimização da IC.":
    "Buena respuesta y estabilidad → observación monitorizada y optimización del tratamiento de la insuficiencia cardíaca.",
  "Investigar e tratar a etiologia (BNP, troponina, ecocardiograma); ajustar terapia da insuficiência cardíaca.":
    "Investigar y tratar la etiología (BNP, troponina, ecocardiograma); ajustar el tratamiento de la insuficiencia cardíaca.",
  "Toda SARA confirmada → UTI com ventilação mecânica protetora.":
    "Toda SDRA confirmada → UCI con ventilación mecánica protectora.",
  "Metas: Pplat ≤ 30, ΔP ≤ 15, SpO₂ 88–95%, pH ≥ 7,30 (aceitar 7,20–7,30 com VC baixo), balanço hídrico zero a negativo.":
    "Metas: Pplat ≤ 30, ΔP ≤ 15, SpO₂ 88–95%, pH ≥ 7,30 (aceptar 7,20–7,30 con volumen corriente bajo) y balance hídrico de cero a negativo.",
  "Tratar a causa de base (sepse, pneumonia, aspiração, pancreatite).":
    "Tratar la causa de base (sepsis, neumonía, aspiración, pancreatitis).",
  "Reavaliar P/F seriado; iniciar manobras de resgate precocemente se piora (prona, BNM, ECMO).":
    "Reevaluar la P/F de forma seriada; iniciar precozmente las maniobras de rescate si empeora (decúbito prono, bloqueo neuromuscular, ECMO).",
  "Ventilação mecânica iniciada (falha de VNI no EAP-C ou SARA confirmada).":
    "Ventilación mecánica iniciada (fallo de la VNI en el EAP-C o SDRA confirmada).",
  "Ajuste de VC (peso predito), PEEP, Pplat ≤ 30, ΔP ≤ 15 e troca gasosa passam a dominar.":
    "El ajuste del volumen corriente (peso predicho), la PEEP, la Pplat ≤ 30, el ΔP ≤ 15 y el intercambio gaseoso pasan a ser lo principal.",
  "Choque cardiogênico em uso de dobutamina/norepinefrina e a titulação passa a ser o problema principal.":
    "Choque cardiogénico con dobutamina/noradrenalina, donde la titulación pasa a ser el problema principal.",
  "Considerar suporte circulatório mecânico se refratário (BIA/Impella/ECMO-VA).":
    "Considerar el soporte circulatorio mecánico si es refractario (balón de contrapulsación/Impella/ECMO-VA).",
  "Sugestão: sem O₂ suplementar (SpO₂ {0}%)": "Sugerencia: SIN O₂ suplementario (SpO₂ {0}%)",
  "⚠️ NÃO RETARDE A REPERFUSÃO POR CAUSA DO EAP. Se há IAM com supra, ou sem supra de alto risco, a cinecoronariografia é de urgência — tratar o edema não substitui abrir a artéria, e o EAP costuma ser consequência dela fechada.":
    "⚠️ NO RETRASE LA REPERFUSIÓN POR CAUSA DEL EAP. Si hay IAM con elevación, o sin elevación de alto riesgo, la coronariografía es de urgencia — tratar el edema no sustituye abrir la arteria, y el EAP suele ser consecuencia de ella cerrada.",
  "EAP REFRATÁRIO OU EXAUSTÃO RESPIRATÓRIA PEDEM VIA AÉREA DEFINITIVA e cuidado intensivo.":
    "EL EAP REFRACTARIO O EL AGOTAMIENTO RESPIRATORIO PIDEN VÍA AÉREA DEFINITIVA y cuidado intensivo.",
};
