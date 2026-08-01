/**
 * Fechamento da tradução — parte C.
 *
 * Frases que a primeira varredura deixou passar por não terem acento nem cair
 * na lista curta de palavras-pista (ex.: "Assinar plano anual", "Iniciar
 * noradrenalina"). A heurística de scripts/varredura-pt.cjs foi ampliada para
 * função gramatical e trouxe este bloco.
 */
export const ES_FINAL_C: Record<string, string> = {
  // ══ PAINEL DE ACOMPANHAMENTO (Fase 5) ═════════════════════════════════════
  "Tempo de parada": "Tiempo de paro",
  "ABCDE — estabilização": "ABCDE — estabilización",
  "Próxima dose só ao fim do intervalo de 3–5 min; o contador acima marca o tempo. Não repetir antes disso.\nUse este ciclo para RCP de alta qualidade, via aérea e causas reversíveis (Hs e Ts).":
    "La próxima dosis solo al final del intervalo de 3–5 min; el contador de arriba marca el tiempo. No repetir antes de eso.\nUse este ciclo para RCP de alta calidad, vía aérea y causas reversibles (H y T).",
  "Ver ABCDE completo": "Ver el ABCDE completo",

  // ══ PAYWALL ═══════════════════════════════════════════════════════════════
  "Guia completo à beira do leito": "Guía completa a pie de cama",
  "Assinar plano anual": "Suscribir el plan anual",
  "Assinar plano mensal": "Suscribir el plan mensual",
  "Cancele a qualquer momento": "Cancele en cualquier momento",

  // ══ SEPSE ═════════════════════════════════════════════════════════════════
  "UTI — Triagem do Atendimento": "UCI — Triaje de la atención",
  "UTI — Foco da Piora": "UCI — Foco del empeoramiento",
  "Hora de chegada": "Hora de llegada",
  "novo na uti": "nuevo en la UCI",
  "alto risco de sepse — completar SOFA":
    "riesgo alto de sepsis — completar el SOFA",
  "lactato maior ou igual a 4": "lactato mayor o igual a 4",
  "Cada hora de atraso aumenta mortalidade. Priorizar agora.":
    "Cada hora de retraso aumenta la mortalidad. Priorizarlo ahora.",
  "Mortalidade estimada ~30% — escalonamento de suporte.":
    "Mortalidad estimada ~30% — escalamiento del soporte.",
  "Iniciar antimicrobianos": "Iniciar los antimicrobianos",
  "Antimicrobiano priorizado no bundle.":
    "Antimicrobiano priorizado en el paquete de medidas.",
  "Antimicrobiano registrado como iniciado.":
    "Antimicrobiano registrado como iniciado.",
  "Cristaloide registrado como iniciado.":
    "Cristaloide registrado como iniciado.",
  "Culturas registradas como coletadas.": "Culturas registradas como tomadas.",
  "Lactato registrado como realizado.": "Lactato registrado como realizado.",
  "Noradrenalina registrada como iniciada.":
    "Noradrenalina registrada como iniciada.",
  "Coletar 2 pares de hemoculturas simultaneamente enquanto prepara o ATB.":
    "Tomar 2 pares de hemocultivos de forma simultánea mientras prepara el antibiótico.",
  "Hemoculturas — 2 pares antes do ATB":
    "Hemocultivos — 2 pares antes del antibiótico",
  "Hemoculturas seriadas (3+ pares em 24h)":
    "Hemocultivos seriados (3 o más pares en 24 h)",
  "  → 2 pares de hemoculturas + cultura do foco suspeito":
    "  → 2 pares de hemocultivos + cultivo del foco sospechado",
  "→ Hemoculturas (2 pares) antes de modificar ATB":
    "→ Hemocultivos (2 pares) antes de modificar el antibiótico",
  "→ Hemoculturas se febre alta ou instabilidade":
    "→ Hemocultivos si hay fiebre alta o inestabilidad",
  "Solicite lactato agora e considere redosagem se vier elevado.":
    "Solicite el lactato ahora y considere repetirlo si viene elevado.",
  "Revisar necessidade de dosagem.": "Revisar la necesidad de dosificación.",
  "Retirada do cateter se indicada": "Retirada del catéter si está indicada",
  "Iniciar noradrenalina": "Iniciar noradrenalina",
  "Inicie noradrenalina se a PAM seguir abaixo de 65 mmHg ou o choque estiver evidente.":
    "Inicie noradrenalina si la PAM sigue por debajo de 65 mmHg o el choque es evidente.",
  "Abaixo de 65 mmHg": "Por debajo de 65 mmHg",
  "⚠️ Abaixo da meta": "⚠️ Por debajo de la meta",
  " ⚠️ Abaixo da meta": " ⚠️ Por debajo de la meta",
  "Adicionar se a PAM continuar inadequada.":
    "Añadirla si la PAM sigue siendo inadecuada.",
  "→ Iniciar/escalonar noradrenalina": "→ Iniciar o escalar la noradrenalina",
  "→ Meta PAM ≥ 65 mmHg (≥ 70–75 em HAS grave)":
    "→ Meta de PAM ≥ 65 mmHg (≥ 70–75 en la hipertensión grave)",
  "Reavaliar PAM, FR, diurese e lactato a cada 30 min.":
    "Reevaluar la PAM, la frecuencia respiratoria, la diuresis y el lactato cada 30 min.",
  "Indicar se GCS ≤ 8, SpO₂ < 90% ou FR ≥ 35.":
    "Indicarlo si el Glasgow es ≤ 8, la SpO₂ < 90% o la frecuencia respiratoria ≥ 35.",
  "Se SpO₂ < 94% ou FR > 22 irpm, iniciar cateter nasal 2–4 L/min.":
    "Si la SpO₂ < 94% o la frecuencia respiratoria > 22 rpm, iniciar cánula nasal 2–4 L/min.",
  "PA invasiva (radial) + PANI de resgate":
    "PA invasiva (radial) + PA no invasiva de rescate",
  "PAM calculada automaticamente ao preencher PAS e PAD.":
    "La PAM se calcula automáticamente al completar la PAS y la PAD.",
  "IMC calculado automaticamente ao preencher peso e altura.":
    "El IMC se calcula automáticamente al completar el peso y la talla.",
  "Preencher PA": "Completar la PA",
  "Glicemia capilar (meta 140–180 mg/dL — tratar se > 180)":
    "Glucemia capilar (meta 140–180 mg/dL — tratarla si es > 180)",
  "Lipase/Amilase (se pancreatite suspeita)":
    "Lipasa/amilasa (si se sospecha pancreatitis)",
  "Endocardite sugerida — sopro novo ou fator de risco identificado":
    "Endocarditis sugerida — soplo nuevo o factor de riesgo identificado",
  "Foco pulmonar sugerido — tosse, dispneia ou achados de ausculta presentes":
    "Foco pulmonar sugerido — tos, disnea o hallazgos en la auscultación",
  "Selecione a(s) queixa(s) ou descreva livremente":
    "Seleccione el motivo o los motivos de consulta, o descríbalos libremente",
  "Selecione sintomas individualmente ou descreva livremente":
    "Seleccione los síntomas de uno en uno o descríbalos libremente",
  "Profilaxia de TVP: enoxaparina 40 mg SC 1x/dia (ClCr > 30) · ou HNF 5.000 UI SC 8/8h se ClCr < 30 mL/min":
    "Profilaxis de trombosis venosa profunda: enoxaparina 40 mg subcutánea una vez al día (aclaramiento de creatinina > 30) · o heparina no fraccionada 5.000 UI subcutánea cada 8 h si el aclaramiento es < 30 mL/min",
  "   Ceftriaxona 2g IV 1x/dia OU amp-sulbactam 3g IV 6/6h":
    "   Ceftriaxona 2 g IV una vez al día O ampicilina-sulbactam 3 g IV cada 6 h",
  "   Micafungina 100mg IV 1x/dia OU Anidulafungina 200mg IV ataque → 100mg/dia":
    "   Micafungina 100 mg IV una vez al día O anidulafungina 200 mg IV de carga → 100 mg/día",
  "→ Risco MDR (UTI ≥ 5d ou ATB recente): pip-tazo 4,5g IV 6/6h":
    "→ Riesgo de multirresistencia (UCI ≥ 5 días o antibiótico reciente): piperacilina-tazobactam 4,5 g IV cada 6 h",
  "→ Complete o bundle de sepse (ATB 1h, culturas, lactato, volume)":
    "→ Complete el paquete de medidas de la sepsis (antibiótico en 1 h, culturas, lactato y volumen)",
  "→ Considerar prona se P/F < 150 apesar de PEEP otimizado":
    "→ Considerar el decúbito prono si la PaO₂/FiO₂ < 150 a pesar de una PEEP optimizada",
  "→ Prona imediata ≥ 16h/dia (PROSEVA — reduz mortalidade em SDRA grave)":
    "→ Decúbito prono inmediato ≥ 16 h/día (PROSEVA — reduce la mortalidad en el SDRA grave)",
  "→ Manter VM protetora e planejar desmame precoce":
    "→ Mantener la ventilación mecánica protectora y planificar un destete precoz",
  "→ RASS 0 a −1, reflexo de tosse preservado":
    "→ RASS de 0 a −1, con el reflejo tusígeno conservado",
  "→ Manter porta FECHADA o tempo todo":
    "→ Mantener la puerta CERRADA en todo momento",
  "→ Quarto individual ou coorte de MDR":
    "→ Habitación individual o cohorte de multirresistentes",
  "⚠️ Isolamento de Contato — MDR Confirmado":
    "⚠️ Aislamiento de contacto — multirresistencia confirmada",

  // ══ ANTIBIÓTICOS (sepse) ══════════════════════════════════════════════════
  "a cada 6 horas": "cada 6 horas",
  "a cada 8 horas": "cada 8 horas",
  "a cada 24 horas": "cada 24 horas",
  "3,375 g IV a cada 8 horas como base operacional.":
    "3,375 g IV cada 8 horas como base operativa.",
  "3,375 g IV a cada 8 horas como ponto de partida operacional.":
    "3,375 g IV cada 8 horas como punto de partida operativo.",
  "3,375 g IV a cada 8 horas costuma ser usado como base operacional.":
    "3,375 g IV cada 8 horas suele usarse como base operativa.",
  "Ampicilina-sulbactam 3 g IV a cada 6 horas":
    "Ampicilina-sulbactam 3 g IV cada 6 horas",
  "Ampicilina-sulbactam 3 g IV a cada 6 horas + azitromicina 500 mg IV/VO a cada 24 horas":
    "Ampicilina-sulbactam 3 g IV cada 6 horas + azitromicina 500 mg IV/VO cada 24 horas",
  "Cefepime 2 g IV a cada 8 horas": "Cefepima 2 g IV cada 8 horas",
  "Cefepime 2 g IV a cada 8 horas + metronidazol 500 mg IV/VO a cada 8 horas":
    "Cefepima 2 g IV cada 8 horas + metronidazol 500 mg IV/VO cada 8 horas",
  "Meropenem 1 g IV a cada 8 horas se risco elevado de MDR":
    "Meropenem 1 g IV cada 8 horas si el riesgo de multirresistencia es elevado",
  "Piperacilina-tazobactam 4,5 g IV a cada 6 horas se necessidade de cobertura ampliada":
    "Piperacilina-tazobactam 4,5 g IV cada 6 horas si se necesita una cobertura ampliada",
  "Clindamicina 600 a 900 mg IV a cada 8 horas se alergia importante e contexto selecionado":
    "Clindamicina 600 a 900 mg IV cada 8 horas si hay una alergia importante y un contexto seleccionado",
  "Cobre gram-negativos e Pseudomonas em pneumonia hospitalar.":
    "Cubre gramnegativos y Pseudomonas en la neumonía intrahospitalaria.",
  "Risco de MDR marcado: preferir ampliar cobertura inicial e revisar cultura/antibiograma cedo.":
    "Riesgo de multirresistencia marcado: preferir ampliar la cobertura inicial y revisar pronto el cultivo y el antibiograma.",

  // ══ ANAFILAXIA ════════════════════════════════════════════════════════════
  "Administrar adrenalina IM na coxa": "Administrar adrenalina IM en el muslo",
  "Adrenalina IM na coxa lateral — administrar imediatamente":
    "Adrenalina IM en la cara lateral del muslo — administrarla de inmediato",
  "Reavaliar em 5 minutos": "Reevaluar a los 5 minutos",
  "Reavaliacao frequente e obrigatoria nas fases iniciais da anafilaxia.":
    "La reevaluación frecuente es obligatoria en las fases iniciales de la anafilaxia.",
  "Alerta de via aerea": "Alerta de vía aérea",
  "edema de glote": "edema de glotis",
  "Manter material de IOT pronto":
    "Mantener listo el material de intubación",
  "Oxigenio de alto fluxo": "Oxígeno de alto flujo",
  "bvm em standby": "bolsa-válvula-mascarilla en espera",
  "nao se aplica": "no corresponde",
  "Ha sinais de alerta respiratorios, mas ainda cabe observar resposta inicial a adrenalina e oxigenio.":
    "Hay signos de alarma respiratorios, pero todavía cabe observar la respuesta inicial a la adrenalina y al oxígeno.",
  "Hipotensao e/ou hipoperfusao exigem adrenalina IM imediata e reposicao titulada.":
    "La hipotensión o la hipoperfusión exigen adrenalina IM inmediata y una reposición titulada.",
  "Checklist de alta": "Lista de verificación del alta",
  "Pergunta-chave: paciente/familiar sabem usar o autoinjetor e receberam plano escrito?":
    "Pregunta clave: ¿el paciente o el familiar saben usar el autoinyector y recibieron un plan escrito?",
  "Prescrever 2 autoinjetores de adrenalina e treinar paciente/familiares no uso correto antes da alta.":
    "Prescribir 2 autoinyectores de adrenalina y entrenar al paciente y a los familiares en su uso correcto antes del alta.",
  "💉 Prescrever 2 autoinjetores de adrenalina. Treinar paciente e familiar no uso correto antes da alta.":
    "💉 Prescribir 2 autoinyectores de adrenalina. Entrenar al paciente y al familiar en su uso correcto antes del alta.",

  // ══ AVC ═══════════════════════════════════════════════════════════════════
  "1b. Perguntas de LOC": "1b. Preguntas de nivel de consciencia",
  "1c. Comandos de LOC": "1c. Órdenes de nivel de consciencia",
  "Mudo ou afasia global.": "Mudo o afasia global.",
  "Paralisia parcial do olhar.": "Parálisis parcial de la mirada.",
  "Perda severa ou total.": "Pérdida grave o total.",
  "Resposta apenas reflexa ou ausente.": "Respuesta solo refleja o ausente.",
  "Unidade de AVC": "Unidad de ictus",
  "unidade de avc": "unidad de ictus",
  "Destino final — unidade de AVC": "Destino final — unidad de ictus",
  "Imagem e tempos de TC": "Imagen y tiempos de la TC",
  "Sinais precoces de isquemia": "Signos precoces de isquemia",
  "Resultado da AngioTC": "Resultado de la angio-TC",
  "Hemorragia intracraniana na TC": "Hemorragia intracraneal en la TC",
  "Qualquer hemorragia na neuroimagem inicial.":
    "Cualquier hemorragia en la neuroimagen inicial.",
  "Hemorragia em TC.": "Hemorragia en la TC.",
  "Crise convulsiva / mimetizador de AVC":
    "Crisis convulsiva / imitador de ictus",
  "Hipoglicemia ou hiperglicemia que possa mimetizar ou agravar o quadro.":
    "Hipoglucemia o hiperglucemia que pueda imitar o agravar el cuadro.",
  "Corrigir glicemia imediatamente e repetir controle":
    "Corregir la glucemia de inmediato y repetir el control",
  "Tratar hiperglicemia e repetir glicemia seriada":
    "Tratar la hiperglucemia y repetir la glucemia seriada",
  "PAS > 185 mmHg ou PAD > 110 mmHg.": "PAS > 185 mmHg o PAD > 110 mmHg.",
  "Trombectomia depende de imagem vascular/neurologia.":
    "La trombectomía depende de la imagen vascular y de neurología.",
  "Depende de imagem": "Depende de la imagen",
  "Depende de neurologia / imagem adicional":
    "Depende de neurología o de una imagen adicional",
  "Dupla checagem de alto risco": "Doble verificación de alto riesgo",
  "Origem do paciente": "Procedencia del paciente",
  "Dia da chegada": "Día de la llegada",
  "Estado do guia alterado": "Estado de la guía modificado",
  "a pior da vida": "la peor de la vida",
  "3. Meta de PA: manter < 180/105 mmHg por 24 h.":
    "3. Meta de PA: mantenerla < 180/105 mmHg durante 24 h.",
  "Acionar neurocirurgia/neurointensivismo diante de HIC, hidrocefalia, rebaixamento ou hematoma expansivo.":
    "Avisar a neurocirugía o a neurocríticos ante una hemorragia intracraneal, hidrocefalia, deterioro del sensorio o un hematoma expansivo.",

  // ══ CORONÁRIAS ════════════════════════════════════════════════════════════
  "Fatores de risco e antecedentes": "Factores de riesgo y antecedentes",
  "Antiagregantes em uso": "Antiagregantes en uso",
  "Anticoagulantes em uso": "Anticoagulantes en uso",
  "Dor em repouso": "Dolor en reposo",
  "Tipo da dor": "Tipo de dolor",
  "Tipo de troponina": "Tipo de troponina",
  "FC no ECG": "Frecuencia cardíaca en el ECG",
  "Supra de ST": "Elevación del ST",
  "Infra de ST": "Descenso del ST",
  "Suspeita de VD": "Sospecha de infarto de ventrículo derecho",
  "Sinais de choque": "Signos de choque",
  "NSTEMI de alto risco": "IAMSEST de alto riesgo",
  "ECG, troponina ou quadro ainda insuficientes.":
    "El ECG, la troponina o el cuadro todavía son insuficientes.",
  "Estatina de alta intensidade": "Estatina de alta intensidad",
  "Estatina de alta intensidade e analgesia/nitrato apenas se apropriado.":
    "Estatina de alta intensidad, y analgesia o nitrato solo si es apropiado.",
  "15 mg em bolus IV imediato": "15 mg en bolo IV inmediato",
  "30 mg IV em bolus": "30 mg IV en bolo",
  "ajustada ao peso": "ajustada al peso",

  // ══ VASOATIVOS ════════════════════════════════════════════════════════════
  "Iniciar adrenalina": "Iniciar adrenalina",
  "Iniciar vasopressina": "Iniciar vasopresina",
  "Confirmar preparo e taxa": "Confirmar la preparación y la velocidad",
  "Informar peso em kg": "Introducir el peso en kg",
  "Velocidade da bomba (mL/h)": "Velocidad de la bomba (mL/h)",
  "Use a velocidade programada na bomba.":
    "Use la velocidad programada en la bomba.",
  "Informe a velocidade da bomba antes de confirmar.":
    "Introduzca la velocidad de la bomba antes de confirmar.",
  "Selecione uma droga antes de confirmar a conduta.":
    "Seleccione un fármaco antes de confirmar la conducta.",
  "Selecione uma droga antes de usar o painel.":
    "Seleccione un fármaco antes de usar el panel.",
  "Aceita 0,05 ou 0.05.": "Acepta 0,05 o 0.05.",
  "0,05–0,2 mcg/kg/min por 24h; ataque: 6–12 mcg/kg em 10 min (opcional)":
    "0,05–0,2 mcg/kg/min durante 24 h; carga: 6–12 mcg/kg en 10 min (opcional)",

  // ══ SEDAÇÃO ═══════════════════════════════════════════════════════════════
  "Calculadora de sedoanalgesia, analgesia e BNM.":
    "Calculadora de sedoanalgesia, analgesia y bloqueo neuromuscular.",
  "Miller's Anesthesia 9ª ed. · consensos de ISR.":
    "Miller's Anesthesia, 9.ª ed. · consensos de intubación de secuencia rápida.",
  "Desmame de VM, procedimentos":
    "Destete de la ventilación mecánica, procedimientos",
  "Considerar remifentanil": "Considerar el remifentanilo",
  "Preferir fentanil em IRA":
    "Preferir el fentanilo en la lesión renal aguda",
  "Monitorar TOF": "Monitorizar el tren de cuatro",
  "Ideal no desmame de VM e no delirium hiperativo; reduz consumo de opioide.":
    "Ideal en el destete de la ventilación mecánica y en el delirium hiperactivo; reduce el consumo de opioides.",
  "✅ Analgesia em grande queimado / trauma e procedimentos dolorosos.":
    "✅ Analgesia en el gran quemado, el trauma y los procedimientos dolorosos.",
  "✅ Delirium hiperativo em UTI.": "✅ Delirium hiperactivo en la UCI.",

  // ══ VENTILAÇÃO ════════════════════════════════════════════════════════════
  "Meta de SpO₂ geralmente 92–96%": "Meta de SpO₂ habitualmente 92–96%",
  "Opcional — importante no obstrutivo":
    "Opcional — importante en el patrón obstructivo",
  "pressao de suporte": "presión de soporte",
  "PEEP moderada/mais alta se hipoxemia relevante.":
    "PEEP moderada o más alta si hay hipoxemia relevante.",
  "Se hipoxemia persistir, priorize ajuste de PEEP/FiO₂ antes de elevar Vt.":
    "Si la hipoxemia persiste, priorice el ajuste de la PEEP y la FiO₂ antes de subir el volumen corriente.",
  "Suba FR em pequenos passos e reavalie antes de aceitar volumes maiores.":
    "Suba la frecuencia respiratoria en pasos pequeños y reevalúe antes de aceptar volúmenes mayores.",
  "Vt um pouco maior, mas ainda dentro de faixa protetora.":
    "Volumen corriente algo mayor, pero todavía dentro del rango protector.",

  // ══ CAD / EHH ═════════════════════════════════════════════════════════════
  "2) Expandir volume; corrigir K⁺ se < 3,3 antes de insulina IV.":
    "2) Expandir el volumen; corregir el K⁺ si es < 3,3 antes de la insulina IV.",
  "4) Precipitante e destino (ver roteiro completo no topo da tela).":
    "4) Precipitante y destino (ver la guía completa en la parte superior de la pantalla).",
  "7,3 (acidose leve na arterial)": "7,3 (acidosis leve en la arterial)",
  "Bicarbonato: considerar apenas se pH < 6,9 (debate; seguir protocolo institucional).":
    "Bicarbonato: considerarlo solo si el pH < 6,9 (tema en debate; seguir el protocolo institucional).",
  "K⁺: manter 4–5 mEq/L; repor se <5,3 (protocolo local de mEq por K⁺ medido).":
    "K⁺: mantenerlo en 4–5 mEq/L; reponerlo si es < 5,3 (según el protocolo local de mEq por K⁺ medido).",
  "Reclassificar automaticamente ao preencher os campos.":
    "Reclasificar automáticamente al completar los campos.",

  // ══ EAP ═══════════════════════════════════════════════════════════════════
  " | Gasometria arterial | Capnografia se VNI":
    " | Gasometría arterial | Capnografía si hay ventilación no invasiva",
  "FiO₂: 0,40–0,60 → titular SpO₂ 88–92% (evitar hiperoxia em DPOC).":
    "FiO₂: 0,40–0,60 → titular para una SpO₂ de 88–92% (evitar la hiperoxia en la EPOC).",
  "Meta FC: < 110 bpm na fase aguda.":
    "Meta de frecuencia cardíaca: < 110 lpm en la fase aguda.",
  "Meta: diurese 0,5–1 mL/kg/h nas primeiras horas.":
    "Meta: diuresis de 0,5–1 mL/kg/h en las primeras horas.",
  "⚠️ Interromper se PAS < 90 mmHg ou queda > 30% do basal.":
    "⚠️ Interrumpirlo si la PAS < 90 mmHg o cae más del 30% respecto al basal.",

  // ══ ACLS ══════════════════════════════════════════════════════════════════
  "Ritmos no ACLS": "Ritmos en el ACLS",
  "Registrar choque": "Registrar la descarga",
  "Registrar epinefrina": "Registrar la adrenalina",
  "Repetir adrenalina": "Repetir la adrenalina",
  "Epinefrina ainda pendente. Administrar 1 mg IV ou IO agora.":
    "Adrenalina aún pendiente. Administrar 1 mg IV o IO ahora.",
  "se perde": "si se pierde",
  "se perder": "si se pierde",
  "Ciclo em andamento": "Ciclo en curso",
  "Fim do ciclo": "Fin del ciclo",
  "Linha do tempo resumida": "Línea de tiempo resumida",
  "Insight de Hs/Ts": "Observación sobre las H y las T",
  "Evento de voz": "Evento de voz",
  "Modo de voz ativado": "Modo de voz activado",
  "Modo de voz desativado": "Modo de voz desactivado",
  "Comando de voz executado": "Comando de voz ejecutado",
  "Comando de voz cancelado.": "Comando de voz cancelado.",
  "Falha ao captar o comando de voz.": "Error al captar el comando de voz.",
  "Checagens de ritmo registradas ao fim dos ciclos.":
    "Comprobaciones de ritmo registradas al final de los ciclos.",
  "Primeira epinefrina dentro da janela esperada.":
    "Primera adrenalina dentro de la ventana esperada.",
  "Primeiro choque dentro da janela de 2 minutos.":
    "Primera descarga dentro de la ventana de 2 minutos.",
  "Controle de temperatura 32–37,5°C": "Control de la temperatura 32–37,5 °C",
  "Contexto de trauma ou ultrassom sugestivo":
    "Contexto de trauma o ecografía sugestiva",
  "Perda ou hemorragia registrada": "Pérdida o hemorragia registrada",
  "TEP ou embolia pulmonar registrados":
    "Tromboembolia pulmonar registrada",
  "Temperatura baixa ou hipotermia registradas":
    "Temperatura baja o hipotermia registradas",
  "capnografia ou ETCO2": "capnografía o ETCO₂",
  "considerar gasometria": "considerar la gasometría",
  "contexto de trauma": "contexto de trauma",
  "exposicao ao frio": "exposición al frío",
  "perdas ou hemorragia ativa": "pérdidas o hemorragia activa",
  "revisar perdas ou hemorragia": "revisar las pérdidas o la hemorragia",
  "revisar contexto de TEP": "revisar el contexto de tromboembolia pulmonar",

  // ══ TELAS ═════════════════════════════════════════════════════════════════
  "Confirmar conduta": "Confirmar la conducta",
  "Controle de foco infeccioso": "Control del foco infeccioso",
  "Ver controle de foco": "Ver el control del foco",
  "Ocultar controle de foco": "Ocultar el control del foco",
  "Necessidade de droga vasoativa / adrenalina EV":
    "Necesidad de fármaco vasoactivo o adrenalina IV",
  "Erro no fluxo": "Error en el flujo",
  "Erro no registro": "Error en el registro",
  "por que usar": "por qué usarla",
  "Falha ao criar a conta.": "Error al crear la cuenta.",
  "3,5–4,9 ou < 500 mL/d": "3,5–4,9 o < 500 mL/d",
  "≥ 5,0 ou < 200 mL/d": "≥ 5,0 o < 200 mL/d",

  // ══ RETOMADA DE FLUXO ═════════════════════════════════════════════════════
  // Barra que devolve o médico ao ponto onde estava depois de consultar outro
  // protocolo. "Você estava aqui" (não "sesión anterior"): o que importa é o
  // lugar no protocolo, não a sessão.
  "Você estava aqui": "Usted estaba aquí",
  Continuar: "Continuar",
  "Começar do início": "Comenzar desde el inicio",

  // ══ CAMADA 2 — correções conforme o capítulo clínico de TEP v1.2 ════════
  "⚠️ NÃO trombolisar de rotina o paciente NORMOTENSO apenas por disfunção de VD e troponina elevada: no PEITHO a tenecteplase reduziu a descompensação hemodinâmica, mas AUMENTOU hemorragia grave e AVC hemorrágico. A trombólise aqui é de resgate, não profilática.":
    "⚠️ NO trombolisar de rutina al paciente NORMOTENSO solo por disfunción del VD y troponina elevada: en el PEITHO la tenecteplasa redujo la descompensación hemodinámica, pero AUMENTÓ la hemorragia grave y el ACV hemorrágico. La trombólisis aquí es de rescate, no profiláctica.",
  "FILTRO DE VEIA CAVA: não usar de rotina junto à anticoagulação. Considerar apenas em TEP/TVP agudo com contraindicação absoluta TEMPORÁRIA à anticoagulação — e já com plano de retirada assim que ela puder ser reiniciada.":
    "FILTRO DE VENA CAVA: no usar de rutina junto con la anticoagulación. Considerar solo en TEP/TVP agudo con contraindicación absoluta TEMPORAL a la anticoagulación — y ya con un plan de retirada en cuanto pueda reiniciarse.",
  "PESO E OBESIDADE: usar peso real para HBPM, sem teto empírico; considerar anti-Xa em casos selecionados. Em obesidade extrema (IMC > 40 kg/m² ou peso > 120 kg), apixabana e rivaroxabana podem ser consideradas conforme bula; os dados de dabigatrana e edoxabana são menos robustos nesse grupo. Não reduzir dose apenas pelo peso.":
    "PESO Y OBESIDAD: usar el peso real para HBPM, sin techo empírico; considerar anti-Xa en casos seleccionados. En obesidad extrema (IMC > 40 kg/m² o peso > 120 kg), apixabán y rivaroxabán pueden considerarse según el prospecto; los datos de dabigatrán y edoxabán son menos robustos en ese grupo. No reducir la dosis solo por el peso.",
};
