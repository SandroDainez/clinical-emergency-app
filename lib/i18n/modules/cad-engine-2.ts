/**
 * Módulo CAD / EHH — dicionário PT → ES. Parte 2 de 2:
 * oxigênio, via aérea, acesso, vasoativo, monitorização, laboratório,
 * hidratação, potássio, insulina, glicose, bicarbonato, adjuvantes,
 * resposta, destino e transição.
 */
export const ES_CAD_ENGINE_2: Record<string, string> = {
  // ── Oxigênio ───────────────────────────────────────────────────────────────
  "Oxigênio é tratamento para hipoxemia. Em adulto agudamente doente, alvo usual de SpO₂ 94–98%; se risco de insuficiência respiratória hipercápnica, alvo 88–92%.":
    "El oxígeno es el tratamiento de la hipoxemia. En un adulto agudamente enfermo, el objetivo habitual de SpO₂ es 94–98%; si hay riesgo de insuficiencia respiratoria hipercápnica, el objetivo es 88–92%.",
  "88 (alvo possível em DPOC selecionado)": "88 (objetivo posible en EPOC seleccionada)",
  "92 (limite aceitável na maioria)": "92 (límite aceptable en la mayoría)",
  "95 (normal 95–100)": "95 (normal 95–100)",
  "98 (normal 95–100)": "98 (normal 95–100)",
  "Oxigênio suplementar": "Oxígeno suplementario",
  "Titular oxigênio conforme SpO₂, padrão respiratório e estado mental. Alvo usual 94–98%; se risco de retenção crônica de CO₂, considerar 88–92%.":
    "Titular el oxígeno según la SpO₂, el patrón respiratorio y el estado mental. Objetivo habitual 94–98%; si hay riesgo de retención crónica de CO₂, considerar 88–92%.",
  "Ar ambiente (sem necessidade de O₂ no momento)":
    "Aire ambiente (sin necesidad de O₂ por ahora)",
  "Ar ambiente": "Aire ambiente",
  "Cateter nasal 1–5 L/min (hipoxemia leve, paciente vigil e sem esforço importante)":
    "Cánula nasal 1–5 L/min (hipoxemia leve, paciente vigil y sin esfuerzo importante)",
  "Cateter nasal": "Cánula nasal",
  "Máscara / Venturi / reservatório (maior oferta de O₂ se SpO₂ baixa ou esforço respiratório)":
    "Mascarilla / Venturi / reservorio (mayor aporte de O₂ si la SpO₂ es baja o hay esfuerzo respiratorio)",
  "Máscara / Venturi / reservatório": "Mascarilla / Venturi / reservorio",

  // ── Via aérea ──────────────────────────────────────────────────────────────
  "Via aérea / suporte ventilatório": "Vía aérea / soporte ventilatorio",
  "Decidir entre observação, máscara, intubação e ventilação mecânica conforme consciência, fadiga, padrão respiratório, proteção de via aérea e resposta ao oxigênio.":
    "Decidir entre observación, mascarilla, intubación y ventilación mecánica según la consciencia, la fatiga, el patrón respiratorio, la protección de la vía aérea y la respuesta al oxígeno.",
  "Sem suporte ventilatório avançado no momento (reavaliar continuamente)":
    "Sin soporte ventilatorio avanzado por ahora (reevaluar de forma continua)",
  "Sem suporte ventilatório avançado no momento":
    "Sin soporte ventilatorio avanzado por ahora",
  "Observação respiratória intensiva (taquipneia compensatória, mas protegendo via aérea)":
    "Observación respiratoria intensiva (taquipnea compensadora, pero protegiendo la vía aérea)",
  "Observação respiratória intensiva": "Observación respiratoria intensiva",
  "Intubação orotraqueal (IOT) se rebaixamento importante, falha respiratória ou incapacidade de proteger via aérea)":
    "Intubación orotraqueal si hay deterioro importante del sensorio, fallo respiratorio o incapacidad de proteger la vía aérea)",
  "Avaliar / realizar intubação orotraqueal": "Valorar / realizar la intubación orotraqueal",
  "Ventilação mecânica após IOT (se insuficiência respiratória, coma ou deterioração clínica)":
    "Ventilación mecánica tras la intubación (si hay insuficiencia respiratoria, coma o deterioro clínico)",
  "Ventilação mecânica invasiva": "Ventilación mecánica invasiva",

  // ── Acesso venoso ──────────────────────────────────────────────────────────
  "Ainda sem acesso": "Aún sin acceso",
  "Periférico calibroso": "Periférico grueso",
  "Dois acessos": "Dos accesos",
  "Central (se indicado)": "Central (si está indicado)",
  "ECG realizado": "ECG realizado",
  "Não / pendente": "No / pendiente",

  // ── Suporte hemodinâmico ───────────────────────────────────────────────────
  "Suporte hemodinâmico / vasoativo": "Soporte hemodinámico / vasoactivo",
  "Hipotensão persistente após expansão inicial deve fazer pensar em choque e necessidade de vasopressor. Meta prática inicial: PAM ≥ 65 mmHg, com reavaliação de perfusão e diurese.":
    "La hipotensión persistente tras la expansión inicial debe hacer pensar en choque y en la necesidad de un vasopresor. Meta práctica inicial: PAM ≥ 65 mmHg, con reevaluación de la perfusión y la diuresis.",
  "Sem vasoativo no momento (perfusão e PAM sem choque evidente)":
    "Sin vasoactivo por ahora (perfusión y PAM sin choque evidente)",
  "Sem vasoativo no momento": "Sin vasoactivo por ahora",
  "Reavaliar após volume inicial (perfusão limítrofe ou hipotensão em correção)":
    "Reevaluar tras el volumen inicial (perfusión límite o hipotensión en corrección)",
  "Reavaliar necessidade de vasoativo após volume inicial":
    "Reevaluar la necesidad de vasoactivo tras el volumen inicial",
  "Noradrenalina se hipotensão persistente após volume (titular para PAM ≥ 65 mmHg)":
    "Noradrenalina si la hipotensión persiste tras el volumen (titular para una PAM ≥ 65 mmHg)",
  "Iniciar noradrenalina se hipotensão persistente após volume":
    "Iniciar noradrenalina si la hipotensión persiste tras el volumen",
  "Encaminhar para monitorização intensiva / bomba de infusão se vasoativo necessário":
    "Derivar a monitorización intensiva / bomba de infusión si se necesita vasoactivo",
  "Suporte vasoativo com monitorização intensiva":
    "Soporte vasoactivo con monitorización intensiva",

  // ── Monitorização ──────────────────────────────────────────────────────────
  "Monitorização contínua é parte do tratamento. Sem isso, é fácil perder hipocalemia, hipoglicemia, falha terapêutica e resolução metabólica.":
    "La monitorización continua es parte del tratamiento. Sin ella, es fácil pasar por alto la hipopotasemia, la hipoglucemia, el fallo terapéutico y la resolución metabólica.",
  "Glicemia horária (ajustar insulina e glicose conforme meta)":
    "Glucemia horaria (ajustar la insulina y la dextrosa según el objetivo)",
  "Glicemia horária": "Glucemia horaria",
  "Eletrólitos e gasometria 2–4/4 h (K, Na, HCO₃⁻, pH)":
    "Electrolitos y gasometría cada 2–4 h (K, Na, HCO₃⁻, pH)",
  "Eletrólitos e gasometria 2–4/4 h": "Electrolitos y gasometría cada 2–4 h",
  "Balanço hídrico rigoroso": "Balance hídrico riguroso",
  "Diurese horária (meta ≥ 0,5 mL/kg/h se possível)":
    "Diuresis horaria (objetivo ≥ 0,5 mL/kg/h si es posible)",
  "Vigilância neurológica": "Vigilancia neurológica",

  // ── Laboratório ────────────────────────────────────────────────────────────
  "Venosa": "Venosa",
  "Arterial": "Arterial",
  "7,1 (acidose grave)": "7,1 (acidosis grave)",
  "7,2 (acidose moderada)": "7,2 (acidosis moderada)",
  "5 (muito baixo; ref. ~22–28)": "5 (muy bajo; ref. ~22–28)",
  "10 (baixo; ref. ~22–28)": "10 (bajo; ref. ~22–28)",
  "15 (baixo; ref. ~22–28)": "15 (bajo; ref. ~22–28)",
  "20 (limítrofe baixo; ref. ~22–28)": "20 (límite bajo; ref. ~22–28)",
  "Na⁺ (mEq/L)": "Na⁺ (mEq/L)",
  "Normal ~135–145. Interpretar junto com glicemia e osmolaridade.":
    "Normal ~135–145. Interpretarlo junto con la glucemia y la osmolaridad.",
  "125 (hiponatremia; normal 135–145)": "125 (hiponatremia; normal 135–145)",
  "135 (normal 135–145)": "135 (normal 135–145)",
  "145 (limite superior; ref. 135–145)": "145 (límite superior; ref. 135–145)",
  "155 (hipernatremia; normal 135–145)": "155 (hipernatremia; normal 135–145)",
  "Cl⁻ (mEq/L)": "Cl⁻ (mEq/L)",
  "Normal ~98–106. Necessário para calcular o gap aniônico.":
    "Normal ~98–106. Necesario para calcular la brecha aniónica.",
  "95 (baixo-normal; ref. 98–106)": "95 (bajo-normal; ref. 98–106)",
  "100 (normal 98–106)": "100 (normal 98–106)",
  "110 (elevado; normal 98–106)": "110 (elevado; normal 98–106)",
  "K⁺ (mEq/L)": "K⁺ (mEq/L)",
  "Normal ~3,5–5,0. Se < 3,3, não iniciar insulina até corrigir.":
    "Normal ~3,5–5,0. Si < 3,3, no iniciar la insulina hasta corregirlo.",
  "2,8 (hipocalemia grave; normal 3,5–5,0)": "2,8 (hipopotasemia grave; normal 3,5–5,0)",
  "3,3 (limiar crítico para insulina)": "3,3 (umbral crítico para la insulina)",
  "4,0 (normal 3,5–5,0)": "4,0 (normal 3,5–5,0)",
  "5,5 (hipercalemia; normal 3,5–5,0)": "5,5 (hiperpotasemia; normal 3,5–5,0)",
  "Cetonemia / β-hidroxibutirato ou cetonúria":
    "Cetonemia / betahidroxibutirato o cetonuria",
  "Positiva / negativa ou valor numérico": "Positiva / negativa o valor numérico",
  "Use um padrão consistente. Se houver β-hidroxibutirato sérico, prefira registrar o valor ou a faixa de elevação.":
    "Use un estándar consistente. Si hay betahidroxibutirato sérico, prefiera registrar el valor o el rango de elevación.",
  "Negativa (sem cetose detectável)": "Negativa (sin cetosis detectable)",
  "Traços (cetose discreta)": "Trazas (cetosis leve)",
  "Traços": "Trazas",
  "++ (cetose moderada)": "++ (cetosis moderada)",
  "+++ (cetose importante)": "+++ (cetosis importante)",
  "β-hidroxibutirato ≥ 3 mmol/L (CAD provável)":
    "Betahidroxibutirato ≥ 3 mmol/L (CAD probable)",
  "β-hidroxibutirato ≥ 3 mmol/L": "Betahidroxibutirato ≥ 3 mmol/L",

  // ── Hidratação ─────────────────────────────────────────────────────────────
  "Hidratação / cristalóide": "Hidratación / cristaloide",
  "Definir solução e volume pelo quadro: perfusão, osmolaridade, sódio corrigido, diurese e comorbidades como ICC/DRC.":
    "Definir la solución y el volumen según el cuadro: perfusión, osmolaridad, sodio corregido, diuresis y comorbilidades como insuficiencia cardíaca/enfermedad renal crónica.",
  "SF 0,9% 15–20 mL/kg na 1ª hora (expansão inicial padrão; reduzir se ICC/DRC)":
    "Solución fisiológica 0,9% 15–20 mL/kg en la 1.ª hora (expansión inicial estándar; reducir si hay insuficiencia cardíaca/enfermedad renal crónica)",
  "SF 0,9% 15–20 mL/kg na 1ª hora": "Solución fisiológica 0,9% 15–20 mL/kg en la 1.ª hora",
  "Cristaloide balanceado 15–20 mL/kg na 1ª hora (se protocolo local permitir)":
    "Cristaloide balanceado 15–20 mL/kg en la 1.ª hora (si el protocolo local lo permite)",
  "Cristaloide balanceado 15–20 mL/kg na 1ª hora":
    "Cristaloide balanceado 15–20 mL/kg en la 1.ª hora",
  "Manutenção guiada por perfusão, diurese, Na corrigido e osmolaridade":
    "Mantenimiento guiado por la perfusión, la diuresis, el sodio corregido y la osmolaridad",
  "Cristaloide isotônico com reavaliação seriada":
    "Cristaloide isotónico con reevaluación seriada",
  "Expansão cautelosa com reavaliação frequente (ICC/DRC/idoso frágil)":
    "Expansión cautelosa con reevaluación frecuente (insuficiencia cardíaca/enfermedad renal crónica/anciano frágil)",
  "Expansão cautelosa com reavaliação frequente":
    "Expansión cautelosa con reevaluación frecuente",

  // ── Potássio ───────────────────────────────────────────────────────────────
  "Reposição de K⁺": "Reposición de K⁺",
  "A insulina tende a reduzir o K sérico. Se K < 3,3 mEq/L, repor potássio antes de iniciar insulina. O plano deve seguir o K atual e ser reavaliado de forma seriada.":
    "La insulina tiende a reducir el K sérico. Si el K < 3,3 mEq/L, reponer el potasio antes de iniciar la insulina. El plan debe seguir el K actual y reevaluarse de forma seriada.",
  "Sem reposição inicial (se K > 5,2; repetir dosagem seriada)":
    "Sin reposición inicial (si el K > 5,2; repetir la medición de forma seriada)",
  "Sem reposição inicial; K seriado": "Sin reposición inicial; K seriado",
  "20–30 mEq/L (se K 3,3–5,2 para manter K entre 4 e 5)":
    "20–30 mEq/L (si el K está en 3,3–5,2 para mantenerlo entre 4 y 5)",
  "20–30 mEq/L na infusão": "20–30 mEq/L en la infusión",
  "40 mEq/L (reposição mais agressiva com monitorização)":
    "40 mEq/L (reposición más agresiva con monitorización)",
  "40 mEq/L com monitorização": "40 mEq/L con monitorización",
  "20–30 mEq/h antes da insulina (se K < 3,3)":
    "20–30 mEq/h antes de la insulina (si el K < 3,3)",
  "20–30 mEq/h antes da insulina": "20–30 mEq/h antes de la insulina",

  // ── Insulina ───────────────────────────────────────────────────────────────
  "Insulinoterapia": "Insulinoterapia",
  "Selecionar esquema e ajustes": "Seleccionar el esquema y los ajustes",
  "Escolher o esquema pela hipótese principal. Iniciar após volume inicial e somente com K ≥ 3,3. Meta inicial: queda da glicemia em torno de 50–70 mg/dL/h, sem suspender cedo demais antes da resolução metabólica.":
    "Elegir el esquema según la hipótesis principal. Iniciar tras el volumen inicial y solo con un K ≥ 3,3. Meta inicial: descenso de la glucemia de unos 50–70 mg/dL/h, sin suspenderla demasiado pronto antes de la resolución metabólica.",

  // ── Glicose ────────────────────────────────────────────────────────────────
  "Glicose IV (SG 5% ou 10%)": "Dextrosa IV (al 5% o al 10%)",
  "Card separado da insulina: usar glicose para permitir continuidade da insulinoterapia quando a glicemia atingir o alvo do quadro, evitando hipoglicemia e interrupção precoce da correção metabólica.":
    "Tarjeta separada de la insulina: usar la dextrosa para permitir la continuidad de la insulinoterapia cuando la glucemia alcance el objetivo del cuadro, evitando la hipoglucemia y la interrupción precoz de la corrección metabólica.",
  "CAD: iniciar SG 5% ou 10% quando glicemia cair para ~200 mg/dL (manter insulina IV; alvo subsequente 150–200 mg/dL até fechar o gap e resolver a acidose)":
    "CAD: iniciar dextrosa al 5% o al 10% cuando la glucemia baje a ~200 mg/dL (mantener la insulina IV; objetivo posterior 150–200 mg/dL hasta cerrar la brecha y resolver la acidosis)",
  "CAD: SG 5% ou 10% iniciada quando glicemia ~200 mg/dL, mantendo insulina IV":
    "CAD: dextrosa al 5% o al 10% iniciada con una glucemia de ~200 mg/dL, manteniendo la insulina IV",
  "EHH: iniciar SG 5% ou 10% quando glicemia cair para ~300 mg/dL (manter insulina IV; alvo subsequente 250–300 mg/dL até corrigir a hiperosmolaridade)":
    "EHH: iniciar dextrosa al 5% o al 10% cuando la glucemia baje a ~300 mg/dL (mantener la insulina IV; objetivo posterior 250–300 mg/dL hasta corregir la hiperosmolaridad)",
  "EHH: SG 5% ou 10% iniciada quando glicemia ~300 mg/dL, mantendo insulina IV":
    "EHH: dextrosa al 5% o al 10% iniciada con una glucemia de ~300 mg/dL, manteniendo la insulina IV",
  "Quantidade prática inicial: adicionar SG 5% em manutenção ou considerar SG 10% se precisar mais oferta de glicose com menor volume; titular conforme glicemia horária e protocolo local":
    "Cantidad práctica inicial: añadir dextrosa al 5% en el mantenimiento o considerar dextrosa al 10% si se necesita más aporte de glucosa con menor volumen; titular según la glucemia horaria y el protocolo local",
  "Glicose IV titulada conforme glicemia horária e protocolo institucional":
    "Dextrosa IV titulada según la glucemia horaria y el protocolo institucional",
  "Não suspender a insulina ao iniciar glicose (o objetivo é evitar hipoglicemia enquanto a acidose, cetose ou hiperosmolaridade ainda estão em correção)":
    "No suspender la insulina al iniciar la dextrosa (el objetivo es evitar la hipoglucemia mientras la acidosis, la cetosis o la hiperosmolaridad todavía están en corrección)",
  "Manter insulina IV após início da glicose, com ajuste conjunto":
    "Mantener la insulina IV tras iniciar la dextrosa, con un ajuste conjunto",

  // ── Bicarbonato ────────────────────────────────────────────────────────────
  "Bicarbonato (se utilizado)": "Bicarbonato (si se utiliza)",
  "Não é rotina. Em geral considerar apenas em acidose extrema, tipicamente pH < 6,9, seguindo protocolo institucional.":
    "No es de rutina. En general considerarlo solo en la acidosis extrema, típicamente con un pH < 6,9, siguiendo el protocolo institucional.",
  "Não indicado de rotina (maioria dos casos)": "No indicado de rutina (la mayoría de los casos)",
  "Não utilizado": "No utilizado",
  "Bicarbonato IV (apenas em acidose extrema ou situação excepcional)":
    "Bicarbonato IV (solo en la acidosis extrema o en una situación excepcional)",
  "Bicarbonato IV em acidose extrema": "Bicarbonato IV en la acidosis extrema",

  // ── Adjuvantes ─────────────────────────────────────────────────────────────
  "Outras medicações (antibiótico, heparina de baixo peso molecular [HBPM], etc.)":
    "Otros medicamentos (antibiótico, heparina de bajo peso molecular, etc.)",
  "Registrar medicações adjuvantes conforme gatilho e risco do caso. Informar sempre o fármaco escolhido, a dose inicial e ajustar por função renal, peso, foco infeccioso e protocolo institucional.":
    "Registrar los medicamentos adyuvantes según el desencadenante y el riesgo del caso. Indicar siempre el fármaco elegido, la dosis inicial, y ajustar por la función renal, el peso, el foco infeccioso y el protocolo institucional.",
  "Antibiótico (se infecção for precipitante provável ou confirmada: ex. ceftriaxona 1–2 g IV; ampliar conforme foco, sepse e protocolo local)":
    "Antibiótico (si la infección es un precipitante probable o confirmado: p. ej., ceftriaxona 1–2 g IV; ampliar según el foco, la sepsis y el protocolo local)",
  "Antibiótico iniciado conforme foco infeccioso e protocolo institucional":
    "Antibiótico iniciado según el foco infeccioso y el protocolo institucional",
  "Heparina de baixo peso molecular (HBPM) / tromboprofilaxia (ex. enoxaparina 40 mg SC 1x/dia; ajustar por TFG, peso e contraindicações, especialmente no EHH)":
    "Heparina de bajo peso molecular / tromboprofilaxis (p. ej., enoxaparina 40 mg SC 1 vez al día; ajustar por la TFG, el peso y las contraindicaciones, sobre todo en el EHH)",
  "Heparina de baixo peso molecular (HBPM) / tromboprofilaxia instituída":
    "Heparina de bajo peso molecular / tromboprofilaxis instaurada",
  "Antiemético (se vômitos limitarem hidratação/manejo: ex. ondansetrona 4 mg IV lenta ou metoclopramida 10 mg IV, se não houver contraindicação)":
    "Antiemético (si los vómitos limitan la hidratación/el manejo: p. ej., ondansetrón 4 mg IV lento o metoclopramida 10 mg IV, si no hay contraindicación)",
  "Antiemético administrado para controle de náuseas e vômitos":
    "Antiemético administrado para el control de las náuseas y los vómitos",
  "Analgesia (se dor abdominal, pancreatite ou gatilho doloroso: ex. dipirona 1 g IV ou paracetamol 1 g IV/VO; evitar AINE se hipovolemia/IRA)":
    "Analgesia (si hay dolor abdominal, pancreatitis o un desencadenante doloroso: p. ej., metamizol 1 g IV o paracetamol 1 g IV/VO; evitar los AINE si hay hipovolemia/lesión renal aguda)",
  "Analgesia administrada conforme dor e contexto clínico":
    "Analgesia administrada según el dolor y el contexto clínico",

  // ── Resposta e destino ─────────────────────────────────────────────────────
  "Resposta clínica": "Respuesta clínica",
  "Melhora (perfusão, consciência e parâmetros metabólicos em recuperação)":
    "Mejoría (perfusión, consciencia y parámetros metabólicos en recuperación)",
  "Melhora": "Mejoría",
  "Estável (sem piora, mas ainda sem resolução completa)":
    "Estable (sin empeoramiento, pero aún sin resolución completa)",
  "Piora (acidose persistente, choque, piora neurológica ou complicação)":
    "Empeoramiento (acidosis persistente, choque, deterioro neurológico o complicación)",
  "Piora": "Empeoramiento",
  "UTI (instabilidade, acidose grave, choque, K crítico ou suporte avançado)":
    "UCI (inestabilidad, acidosis grave, choque, K crítico o soporte avanzado)",
  "Observação intensiva (reavaliação laboratorial e clínica estreita)":
    "Observación intensiva (reevaluación analítica y clínica estrecha)",
  "Observação intensiva": "Observación intensiva",
  "Enfermaria (apenas após resolução metabólica e transição segura)":
    "Sala de hospitalización (solo tras la resolución metabólica y una transición segura)",

  // ── Transição SC ───────────────────────────────────────────────────────────
  "Transição SC / notas": "Transición a la vía subcutánea / notas",
  "Critérios de resolução, esquema basal-bolus…":
    "Criterios de resolución, esquema basal-bolo…",
  "Na transição, garantir resolução clínica/metabólica e sobrepor a insulina basal SC por cerca de 2 h antes de desligar a infusão IV.":
    "En la transición, asegurar la resolución clínica/metabólica y solapar la insulina basal subcutánea durante unas 2 h antes de detener la infusión IV.",
  "Basal antes da suspensão (aplicar insulina basal SC 2 h antes de desligar a IV)":
    "Basal antes de la suspensión (aplicar la insulina basal subcutánea 2 h antes de detener la IV)",
  "Aplicar basal SC 2 h antes de suspender a IV":
    "Aplicar la basal subcutánea 2 h antes de suspender la IV",
  "Confirmar resolução metabólica (fechar gap, melhorar HCO₃⁻ e tolerar dieta)":
    "Confirmar la resolución metabólica (cerrar la brecha, mejorar el HCO₃⁻ y tolerar la dieta)",
  "Confirmar resolução metabólica antes da transição":
    "Confirmar la resolución metabólica antes de la transición",
  "Esquema basal-bolus (TDD ~0,3–0,5 U/kg/dia)":
    "Esquema basal-bolo (dosis diaria total ~0,3–0,5 U/kg/día)",
  "Planejar basal-bolus SC": "Planificar el esquema basal-bolo subcutáneo",
  "Aguardando leito de maior complexidade": "A la espera de una cama de mayor complejidad",

  // ── Documentação do caso ───────────────────────────────────────────────────
  "Resumo do caso real, gatilho, condutas, resposta e pendências...":
    "Resumen del caso real, desencadenante, conductas, respuesta y pendientes...",
  "Documente a história real do atendimento: apresentação, dados-chave, precipitante provável, condutas executadas, resposta clínica e plano de continuidade.":
    "Documente la historia real de la atención: presentación, datos clave, precipitante probable, conductas ejecutadas, respuesta clínica y plan de continuidad.",
  "Caso resumido (hiperglicemia + desidratação tratados com cristalóide, correção eletrolítica e insulina IV)":
    "Caso resumido (hiperglucemia + deshidratación tratadas con cristaloide, corrección electrolítica e insulina IV)",
  "Paciente admitido com hiperglicemia, desidratação e distúrbio metabólico compatível com CAD/EHH, tratado com cristalóide, correção eletrolítica e insulina IV, evoluindo com melhora clínica e laboratorial.":
    "Paciente ingresado con hiperglucemia, deshidratación y trastorno metabólico compatible con CAD/EHH, tratado con cristaloide, corrección electrolítica e insulina IV, con evolución hacia la mejoría clínica y analítica.",
  "Caso com gatilho infeccioso (tratamento metabólico + investigação do foco)":
    "Caso con desencadenante infeccioso (tratamiento metabólico + investigación del foco)",
  "Quadro precipitado por provável infecção, com abordagem metabólica em paralelo à investigação e ao tratamento do foco infeccioso.":
    "Cuadro precipitado por una probable infección, con un abordaje metabólico en paralelo a la investigación y al tratamiento del foco infeccioso.",
  "Caso grave (necessidade de monitorização intensiva e leito crítico)":
    "Caso grave (necesidad de monitorización intensiva y cama crítica)",
  "Caso grave, com necessidade de monitorização intensiva, reavaliação laboratorial seriada e encaminhamento para leito de maior complexidade.":
    "Caso grave, con necesidad de monitorización intensiva, reevaluación analítica seriada y derivación a una cama de mayor complejidad.",
  "CAD / EHH — roteiro de emergência": "CAD / EHH — guion de emergencia",
};
