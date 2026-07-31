/**
 * Telas de entrada dos módulos (*-flow-screen.tsx) — dicionário PT → ES.
 *
 * São as props `headerTitle`, `intro` e `source` passadas ao
 * AclsDecisionFlowScreen, que já as traduz com tr(). Antes ficavam em
 * português porque não são chamadas tr("literal") — a varredura anterior
 * só olhava as chamadas diretas.
 */
export const ES_TELAS_ENTRADA: Record<string, string> = {
  // ── Cabeçalhos ─────────────────────────────────────────────────────────────
  "Anafilaxia · Emergência": "Anafilaxia · Emergencia",
  "AVC · Emergência": "ACV · Emergencia",
  "SCA · Emergência": "SCA · Emergencia",
  "CAD · EHH": "CAD · EHH",
  "Insuficiência respiratória · Diferencial": "Insuficiencia respiratoria · Diferencial",
  "EAP · Emergência": "EAP · Emergencia",
  "Politrauma · Atendimento inicial": "Politrauma · Atención inicial",
  "ISR · Via aérea": "ISR · Vía aérea",
  "Crises convulsivas": "Crisis convulsivas",
  "Sepse · Emergência": "Sepsis · Emergencia",
  "Choque · Diagnóstico e conduta": "Choque · Diagnóstico y conducta",
  "TCE · Traumatismo cranioencefálico": "TCE · Traumatismo craneoencefálico",
  "TEP · Emergência": "TEP · Emergencia",

  // ── ACLS: bradicardia e taquicardia ────────────────────────────────────────
  "Algoritmo interativo de bradicardia no adulto com pulso. Responda a cada passo — o app conduz a sequência exata do ACLS, da identificação ao marcapasso definitivo.":
    "Algoritmo interactivo de la bradicardia en el adulto con pulso. Responda cada paso — la app conduce la secuencia exacta del ACLS, desde la identificación hasta el marcapasos definitivo.",
  "Algoritmo interativo de taquicardia no adulto com pulso. Responda a cada passo — o app conduz a sequência exata do ACLS: estável vs instável, largura do QRS e regularidade.":
    "Algoritmo interactivo de la taquicardia en el adulto con pulso. Responda cada paso — la app conduce la secuencia exacta del ACLS: estable vs. inestable, anchura del QRS y regularidad.",

  // ── Abdome agudo ───────────────────────────────────────────────────────────
  "Exclusão das catástrofes abdominais (aneurisma roto, gravidez ectópica, isquemia mesentérica, perfuração), classificação do padrão (inflamatório, obstrutivo, perfurativo, vascular), exames dirigidos e definição do destino cirúrgico.":
    "Exclusión de las catástrofes abdominales (aneurisma roto, embarazo ectópico, isquemia mesentérica, perforación), clasificación del patrón (inflamatorio, obstructivo, perforativo, vascular), exámenes dirigidos y definición del destino quirúrgico.",
  "Diretrizes de cirurgia de emergência (WSES) e literatura de referência":
    "Guías de cirugía de emergencia (WSES) y literatura de referencia",

  // ── Anafilaxia ─────────────────────────────────────────────────────────────
  "Fluxo interativo da anafilaxia. Responda a cada passo — o app conduz a sequência: reconhecimento, adrenalina IM imediata, estratificação de gravidade, pacotes de suporte, reavaliação e destino (incluindo transição para via aérea/ISR, ventilação ou drogas vasoativas quando indicado).":
    "Flujo interactivo de la anafilaxia. Responda cada paso — la app conduce la secuencia: reconocimiento, adrenalina IM inmediata, estratificación de la gravedad, paquetes de soporte, reevaluación y destino (incluida la transición a vía aérea/ISR, ventilación o fármacos vasoactivos cuando esté indicado).",
  "Baseado em diretrizes de anafilaxia (WAO/EAACI e AHA)":
    "Basado en las guías de anafilaxia (WAO/EAACI y AHA)",

  // ── AVC ────────────────────────────────────────────────────────────────────
  "Fluxo interativo do AVC agudo. Responda a cada passo — o app conduz a sequência: tempo de início, TC, NIHSS, elegibilidade para trombólise (dose calculada por peso) e trombectomia.":
    "Flujo interactivo del ACV agudo. Responda cada paso — la app conduce la secuencia: hora de inicio, TC, NIHSS, elegibilidad para la trombólisis (dosis calculada por peso) y trombectomía.",
  "Baseado em AHA/ASA 2019 (Manejo Precoce do AVC Isquêmico Agudo)":
    "Basado en AHA/ASA 2019 (manejo precoz del ACV isquémico agudo)",

  // ── Síndromes coronarianas ─────────────────────────────────────────────────
  "Fluxo interativo da síndrome coronariana aguda. O app conduz a sequência real do atendimento: medidas imediatas + AAS, ECG ≤10 min, classificação STEMI x sem supra de ST, terapia antitrombótica/anti-isquêmica, reperfusão (ICP x fibrinólise, dose por peso) ou estratégia invasiva por risco e destino.":
    "Flujo interactivo del síndrome coronario agudo. La app conduce la secuencia real de la atención: medidas inmediatas + AAS, ECG en ≤ 10 min, clasificación en IAMCEST vs. sin elevación del ST, tratamiento antitrombótico y antiisquémico, reperfusión (angioplastia vs. fibrinólisis, dosis por peso) o estrategia invasiva según el riesgo, y destino.",
  "Baseado em AHA/ACC e ESC 2023 (Síndromes Coronarianas Agudas)":
    "Basado en AHA/ACC y ESC 2023 (síndromes coronarios agudos)",

  // ── CAD / EHH ──────────────────────────────────────────────────────────────
  "Fluxo interativo da cetoacidose diabética e do estado hiperosmolar. O app conduz a sequência real: reconhecimento e diagnóstico, hidratação, checagem do potássio (que define o início da insulina), insulina IV (dose por peso), bicarbonato, ajuste ao atingir a meta glicêmica e critérios de resolução.":
    "Flujo interactivo de la cetoacidosis diabética y del estado hiperosmolar. La app conduce la secuencia real: reconocimiento y diagnóstico, hidratación, comprobación del potasio (que define el inicio de la insulina), insulina IV (dosis por peso), bicarbonato, ajuste al alcanzar la meta glucémica y criterios de resolución.",
  "Baseado nas diretrizes ADA (manejo de CAD e EHH no adulto)":
    "Basado en las guías de la ADA (manejo de la CAD y del EHH en el adulto)",

  // ── Insuficiência respiratória ─────────────────────────────────────────────
  "Diagnóstico diferencial da dispneia aguda guiado por perguntas: início súbito (pneumotórax, TEP, anafilaxia) × gradual (asma, DPOC, EAP, pneumonia, SARA, insuficiência hipercápnica). Cada diagnóstico traz exames prioritários, tratamento imediato, critérios de IOT e link para o protocolo.":
    "Diagnóstico diferencial de la disnea aguda guiado por preguntas: inicio súbito (neumotórax, TEP, anafilaxia) × gradual (asma, EPOC, EAP, neumonía, SDRA, insuficiencia hipercápnica). Cada diagnóstico trae los exámenes prioritarios, el tratamiento inmediato, los criterios de intubación y el enlace a la guía.",
  "Insuficiência respiratória aguda — diagnóstico diferencial e suporte":
    "Insuficiencia respiratoria aguda — diagnóstico diferencial y soporte",

  // ── EAP ────────────────────────────────────────────────────────────────────
  "Fluxo interativo do edema agudo de pulmão. A primeira decisão separa cardiogênico × não-cardiogênico (SARA) — o tratamento é fundamentalmente diferente. No cardiogênico: posição e O₂/VNI, classificação pela PA sistólica, tratamento por perfil (vasodilatador / diurético / inotrópico-vasopressor no choque), causa (SCA, arritmia), reavaliação e destino. Na SARA: critérios de Berlim, ventilação protetora ARDSNet (VC por peso predito, Pplat ≤ 30, ΔP ≤ 15) e manobras de resgate (prona, BNM, ECMO).":
    "Flujo interactivo del edema agudo de pulmón. La primera decisión separa el cardiogénico del no cardiogénico (SDRA) — el tratamiento es fundamentalmente distinto. En el cardiogénico: posición y O₂/VNI, clasificación según la PA sistólica, tratamiento por perfil (vasodilatador / diurético / inotrópico-vasopresor en el choque), causa (SCA, arritmia), reevaluación y destino. En la SDRA: criterios de Berlín, ventilación protectora ARDSNet (volumen corriente por peso predicho, Pplat ≤ 30, ΔP ≤ 15) y maniobras de rescate (decúbito prono, bloqueo neuromuscular, ECMO).",
  "ESC HF 2021 · AHA/ACC 2022 · ARDS Network · Berlim 2012 · UpToDate 2024":
    "ESC HF 2021 · AHA/ACC 2022 · ARDS Network · Berlín 2012 · UpToDate 2024",

  // ── Pré-eclâmpsia / eclâmpsia ──────────────────────────────────────────────
  "Fluxo interativo da pré-eclâmpsia e eclâmpsia. O app conduz: reconhecimento, convulsão ativa (eclâmpsia → proteção, via aérea e MgSO₄ imediato), classificação (HAS gestacional / PE / PE grave / HELLP), sulfato de magnésio com tríade de segurança e antídoto (gluconato de cálcio), crise hipertensiva (hidralazina/labetalol/nifedipina), momento e via do parto, e manejo pós-parto/prevenção.":
    "Flujo interactivo de la preeclampsia y la eclampsia. La app conduce: reconocimiento, convulsión activa (eclampsia → protección, vía aérea y MgSO₄ inmediato), clasificación (hipertensión gestacional / preeclampsia / preeclampsia grave / HELLP), sulfato de magnesio con la tríada de seguridad y su antídoto (gluconato de calcio), crisis hipertensiva (hidralazina/labetalol/nifedipina), momento y vía del parto, y manejo posparto y prevención.",
  "ACOG 222 (2020/2023) · ISSHP 2018 · FIGO 2019 · Magpie · ASPRE · FEBRASGO 2021":
    "ACOG 222 (2020/2023) · ISSHP 2018 · FIGO 2019 · Magpie · ASPRE · FEBRASGO 2021",

  // ── Intoxicações ───────────────────────────────────────────────────────────
  "Estabilização e antídotos do coma, identificação da síndrome tóxica (opioide, colinérgica, anticolinérgica, simpaticomimética, sedativa), descontaminação com carvão ativado, antídotos específicos por tóxico e indicações de hemodiálise.":
    "Estabilización y antídotos del coma, identificación del síndrome tóxico (opioide, colinérgico, anticolinérgico, simpaticomimético, sedante), descontaminación con carbón activado, antídotos específicos por tóxico e indicaciones de hemodiálisis.",
  "Toxicologia de emergência — contatar o CIATox":
    "Toxicología de emergencia — contactar al centro de información toxicológica",

  // ── Politrauma ─────────────────────────────────────────────────────────────
  "Atendimento ao traumatizado grave conforme o ATLS: controle da hemorragia exsanguinante (X) antes do ABCDE, avaliação primária, reanimação hemostática com transfusão 1:1:1, ácido tranexâmico, damage control e avaliação secundária.":
    "Atención al politraumatizado grave según el ATLS: control de la hemorragia exanguinante (X) antes del ABCDE, evaluación primaria, reanimación hemostática con transfusión 1:1:1, ácido tranexámico, cirugía de control de daños y evaluación secundaria.",
  "ATLS — Advanced Trauma Life Support / CRASH-2":
    "ATLS — Advanced Trauma Life Support / CRASH-2",

  // ── ISR ────────────────────────────────────────────────────────────────────
  "Fluxo interativo da intubação em sequência rápida (7 P's). O app conduz a sequência real: preparação (SOAP-ME), pré-oxigenação, predição de via aérea difícil, otimização hemodinâmica, indução (agente conforme a hemodinâmica), bloqueador neuromuscular, passagem do tubo, confirmação por capnografia e manejo pós-intubação. Doses calculadas por peso.":
    "Flujo interactivo de la intubación de secuencia rápida (las 7 P). La app conduce la secuencia real: preparación (SOAP-ME), preoxigenación, predicción de vía aérea difícil, optimización hemodinámica, inducción (agente según la hemodinamia), bloqueante neuromuscular, paso del tubo, confirmación por capnografía y manejo posintubación. Dosis calculadas por peso.",
  "Baseado em consensos de manejo de via aérea de emergência (ISR no adulto)":
    "Basado en consensos de manejo de la vía aérea de emergencia (ISR en el adulto)",

  // ── Crises convulsivas ─────────────────────────────────────────────────────
  "Protocolo tempo-dependente: estabilização e glicemia (0–5 min), benzodiazepínico em dose plena (5–20 min), antiepiléptico IV de 2ª linha (20–40 min) e anestésico com intubação e EEG contínuo no mal epiléptico refratário (40–60 min). Doses calculadas pelo peso.":
    "Guía dependiente del tiempo: estabilización y glucemia (0–5 min), benzodiacepina a dosis plena (5–20 min), antiepiléptico IV de 2.ª línea (20–40 min) y anestésico con intubación y EEG continuo en el estado epiléptico refractario (40–60 min). Dosis calculadas por peso.",
  "American Epilepsy Society (2016) / Neurocritical Care Society":
    "American Epilepsy Society (2016) / Neurocritical Care Society",

  // ── Sepse ──────────────────────────────────────────────────────────────────
  "Fluxo interativo da sepse e do choque séptico (pacote da 1ª hora). O app conduz a sequência real: reconhecimento, lactato e culturas, antibiótico de amplo espectro ≤1 h, ressuscitação volêmica (30 mL/kg calculado por peso), vasopressor com alvo de PAM ≥65, controle do foco e reavaliação dinâmica.":
    "Flujo interactivo de la sepsis y del choque séptico (paquete de la 1.ª hora). La app conduce la secuencia real: reconocimiento, lactato y cultivos, antibiótico de amplio espectro en ≤ 1 h, reanimación con volumen (30 mL/kg calculados por peso), vasopresor con objetivo de PAM ≥ 65, control del foco y reevaluación dinámica.",
  "Baseado na Surviving Sepsis Campaign 2021 (pacote da 1ª hora)":
    "Basado en la Surviving Sepsis Campaign 2021 (paquete de la 1.ª hora)",

  // ── Choque ─────────────────────────────────────────────────────────────────
  "Diagnóstico diferencial do choque por perguntas binárias: hipovolêmico, obstrutivo (pneumotórax, tamponamento, TEP), cardiogênico e distributivo (séptico, anafilático, neurogênico). Cada diagnóstico traz mecanismo, sinais confirmatórios, próximas ações e link para o protocolo.":
    "Diagnóstico diferencial del choque mediante preguntas binarias: hipovolémico, obstructivo (neumotórax, taponamiento, TEP), cardiogénico y distributivo (séptico, anafiláctico, neurogénico). Cada diagnóstico trae el mecanismo, los signos confirmatorios, las próximas acciones y el enlace a la guía.",
  "Perfis hemodinâmicos — ATLS / Surviving Sepsis Campaign":
    "Perfiles hemodinámicos — ATLS / Surviving Sepsis Campaign",

  // ── TCE ────────────────────────────────────────────────────────────────────
  "Classificação por Glasgow, indicação de tomografia (Canadian CT Head Rule), prevenção da lesão secundária (evitar hipotensão e hipóxia), reversão de anticoagulação e controle da hipertensão intracraniana com terapia hiperosmolar.":
    "Clasificación por Glasgow, indicación de tomografía (Canadian CT Head Rule), prevención de la lesión secundaria (evitar la hipotensión y la hipoxia), reversión de la anticoagulación y control de la hipertensión intracraneal con terapia hiperosmolar.",
  "ATLS / Brain Trauma Foundation (4ª ed.)": "ATLS / Brain Trauma Foundation (4.ª ed.)",

  // ── TEP ────────────────────────────────────────────────────────────────────
  "Fluxo interativo da tromboembolia pulmonar. A primeira decisão é a estabilidade: instável (alto risco) → suporte + HNF + trombólise imediata; estável → probabilidade pré-teste (Wells), D-dímero/AngioTC, estratificação de risco (disfunção de VD + biomarcadores + sPESI) e anticoagulação (NOAC 1ª linha) com opção de tratamento ambulatorial no baixo risco. Doses de HNF, enoxaparina e trombolítico calculadas pelo peso.":
    "Flujo interactivo de la tromboembolia pulmonar. La primera decisión es la estabilidad: inestable (alto riesgo) → soporte + heparina no fraccionada + trombólisis inmediata; estable → probabilidad pretest (Wells), dímero D/angiotomografía, estratificación de riesgo (disfunción del ventrículo derecho + biomarcadores + sPESI) y anticoagulación (ACOD de 1.ª línea) con opción de tratamiento ambulatorio en el bajo riesgo. Dosis de heparina no fraccionada, enoxaparina y trombolítico calculadas por peso.",
  "ESC 2019 · AHA 2011 (updated) · ACCP/CHEST 2022 · ASH 2020 · UpToDate 2024":
    "ESC 2019 · AHA 2011 (actualizada) · ACCP/CHEST 2022 · ASH 2020 · UpToDate 2024",

  // ── Ventilação mecânica ────────────────────────────────────────────────────
  "Fluxo interativo da ventilação mecânica invasiva. O app conduz a sequência real: objetivos e modo, cálculo do peso predito (pela altura — define o volume corrente protetor), ajuste inicial, estratégia por patologia, checagem de segurança (platô e driving pressure), troubleshooting (DOPES) e desmame.":
    "Flujo interactivo de la ventilación mecánica invasiva. La app conduce la secuencia real: objetivos y modo, cálculo del peso predicho (por la talla — define el volumen corriente protector), ajuste inicial, estrategia según la patología, comprobación de seguridad (presión meseta y driving pressure), resolución de problemas (DOPES) y destete.",
  "ARDSNet · Surviving Sepsis 2021 · ERS/ESICM 2017 · ACCP Weaning 2017":
    "ARDSNet · Surviving Sepsis 2021 · ERS/ESICM 2017 · ACCP Weaning 2017",
  "Falta informar": "Falta informar",
  "Faltam": "Faltan",
  "campos": "campos",
};
