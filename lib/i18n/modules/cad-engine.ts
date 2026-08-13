/**
 * Módulo CAD / EHH (dka-hhs-engine.ts) — dicionário PT → ES. Parte 1 de 2.
 * Terminologia: CAD (cetoacidosis diabética), EHH (estado hiperglucémico
 * hiperosmolar), glucemia, potasio, brecha aniónica, betahidroxibutirato,
 * dextrosa (SG), insulina IV, iSGLT2.
 */
export const ES_CAD_ENGINE_1: Record<string, string> = {
  // ── Faixas de valores (glicemia, ureia, creatinina, lactato) ──────────────
  "13,9 (elevada)": "13,9 (elevada)",
  "22,2 (muito elevada)": "22,2 (muy elevada)",
  "33,3 (grave; pensar EHH/CAD)": "33,3 (grave; pensar en EHH/CAD)",
  "44,4 (extrema; alto risco hiperosmolar)": "44,4 (extrema; alto riesgo hiperosmolar)",
  "250 (elevada; normal ~70–99)": "250 (elevada; normal ~70–99)",
  "400 (muito elevada; normal ~70–99)": "400 (muy elevada; normal ~70–99)",
  "600 (grave; pensar EHH/CAD)": "600 (grave; pensar en EHH/CAD)",
  "800 (extrema; alto risco hiperosmolar)": "800 (extrema; alto riesgo hiperosmolar)",
  "70 (normal)": "70 (normal)",
  "133 (elevada)": "133 (elevada)",
  "221 (IRA importante)": "221 (lesión renal aguda importante)",
  "354 (grave)": "354 (grave)",
  "0,8 (normal ~0,6–1,3)": "0,8 (normal ~0,6–1,3)",
  "1,5 (elevada; ref. ~0,6–1,3)": "1,5 (elevada; ref. ~0,6–1,3)",
  "2,5 (IRA importante)": "2,5 (lesión renal aguda importante)",
  "4,0 (grave)": "4,0 (grave)",
  "3,3 (normal)": "3,3 (normal)",
  "6,7 (elevada)": "6,7 (elevada)",
  "13,3 (muito elevada)": "13,3 (muy elevada)",
  "20,0 (grave)": "20,0 (grave)",
  "20 (normal)": "20 (normal)",
  "40 (elevada)": "40 (elevada)",
  "80 (muito elevada)": "80 (muy elevada)",
  "120 (grave; desidratação/IRA importante)":
    "120 (grave; deshidratación/lesión renal aguda importante)",
  "9,0 (normal)": "9,0 (normal)",
  "18,0 (limite superior)": "18,0 (límite superior)",
  "36,0 (elevado; pensar em hipoperfusão/sepse)":
    "36,0 (elevado; pensar en hipoperfusión/sepsis)",
  "1,0 (normal)": "1,0 (normal)",
  "2,0 (limite superior)": "2,0 (límite superior)",
  "4,0 (elevado; pensar em hipoperfusão/sepse)":
    "4,0 (elevado; pensar en hipoperfusión/sepsis)",

  // ── Calculados ─────────────────────────────────────────────────────────────
  "Osmolaridade (est.)": "Osmolaridad (est.)",
  "GAP aniônico": "Brecha aniónica",
  "Gap elevado": "Brecha elevada",
  "Sugere acidose por ânions não medidos; em CAD/quadro misto, acompanhar fechamento do gap na resolução":
    "Sugiere acidosis por aniones no medidos; en la CAD o el cuadro mixto, seguir el cierre de la brecha en la resolución",
  "Acidose metabólica possível": "Posible acidosis metabólica",
  "Gap elevado pode sinalizar acidose metabólica mesmo com pH limítrofe; interpretar junto com cetose e HCO₃⁻":
    "Una brecha elevada puede indicar acidosis metabólica incluso con un pH límite; interpretarla junto con la cetosis y el HCO₃⁻",
  "⚠️ Potássio": "⚠️ Potasio",
  "CAD — eixo": "CAD — eje",
  "Acidose + cetose; insulina IV após K⁺ seguro":
    "Acidosis + cetosis; insulina IV tras asegurar un K⁺ seguro",
  "EHH — eixo": "EHH — eje",
  "Hiperglicemia + hiperosmolaridade; hidratação vigorosa; correção osmótica lenta":
    "Hiperglucemia + hiperosmolaridad; hidratación vigorosa; corrección osmótica lenta",

  // ── Gravidade / desidratação ───────────────────────────────────────────────
  "Grave": "Grave",
  "Sugestão: grave — hipotensão/PAM baixa ou rebaixamento sugerem má perfusão / choque":
    "Sugerencia: grave — la hipotensión/PAM baja o el deterioro del sensorio sugieren mala perfusión / choque",
  "Moderada": "Moderada",
  "Sugestão: moderada — taquicardia ou perfusão limítrofe sugerem hipovolemia clínica":
    "Sugerencia: moderada — la taquicardia o la perfusión límite sugieren hipovolemia clínica",
  "Sugestão: leve — sem hipotensão e sem sinais claros de choque":
    "Sugerencia: leve — sin hipotensión ni signos claros de choque",

  // ── Suporte ventilatório sugerido ──────────────────────────────────────────
  "Avaliar intubação orotraqueal e ventilação mecânica":
    "Valorar la intubación orotraqueal y la ventilación mecánica",
  "Rebaixamento importante de consciência ou insuficiência respiratória grave / considerar IOT e VM após preparo hemodinâmico":
    "Deterioro importante del sensorio o insuficiencia respiratoria grave / considerar la intubación y la ventilación mecánica tras la preparación hemodinámica",
  "Oxigênio suplementar por máscara ou dispositivo de maior oferta; reavaliar necessidade de IOT/VM":
    "Oxígeno suplementario con mascarilla o con un dispositivo de mayor aporte; reevaluar la necesidad de intubación/ventilación mecánica",
  "Taquipneia, hipoxemia ou padrão respiratório de esforço / escalar de cateter para máscara e monitorar falha respiratória":
    "Taquipnea, hipoxemia o patrón respiratorio de esfuerzo / escalar de cánula a mascarilla y vigilar el fallo respiratorio",
  "Oxigênio por cateter nasal com titulação por SpO₂":
    "Oxígeno por cánula nasal con titulación según la SpO₂",
  "Hipoxemia leve / usar cateter nasal e titular para manter SpO₂ em alvo":
    "Hipoxemia leve / usar cánula nasal y titular para mantener la SpO₂ en el objetivo",
  "Sem suporte ventilatório avançado no momento; reavaliar padrão respiratório continuamente":
    "Sin soporte ventilatorio avanzado por ahora; reevaluar el patrón respiratorio de forma continua",
  "Sem hipoxemia ou desconforto respiratório importantes / manter vigilância clínica":
    "Sin hipoxemia ni dificultad respiratoria importantes / mantener la vigilancia clínica",

  // ── Suporte hemodinâmico sugerido ──────────────────────────────────────────
  "Se hipotensão persistir após volume inicial, iniciar vasopressor (ex.: noradrenalina) para alvo de PAM ≥ 65 mmHg":
    "Si la hipotensión persiste tras el volumen inicial, iniciar un vasopresor (p. ej., noradrenalina) para un objetivo de PAM ≥ 65 mmHg",
  "Choque ou PAM baixa / reposição volêmica primeiro; se refratário, iniciar suporte vasoativo com monitorização estreita":
    "Choque o PAM baja / reposición de volumen primero; si es refractario, iniciar soporte vasoactivo con monitorización estrecha",
  "Reavaliar necessidade de vasoativo se houver hipoperfusão após expansão inicial":
    "Reevaluar la necesidad de vasoactivo si hay hipoperfusión tras la expansión inicial",
  "Perfusão limítrofe / manter reavaliação hemodinâmica frequente e considerar escalonamento precoce":
    "Perfusión límite / mantener la reevaluación hemodinámica frecuente y considerar un escalamiento precoz",
  "Sem vasoativo no momento; manter reavaliação de pressão, PAM e perfusão":
    "Sin vasoactivo por ahora; mantener la reevaluación de la presión, la PAM y la perfusión",
  "Hemodinâmica sem choque evidente neste momento":
    "Hemodinamia sin choque evidente en este momento",

  // ── Solução sugerida ───────────────────────────────────────────────────────
  "Cristaloide isotônico com expansão mais cautelosa e reavaliação frequente":
    "Cristaloide isotónico con una expansión más cautelosa y reevaluación frecuente",
  "ICC/DRC presentes / preferir volume inicial mais cauteloso, reavaliando perfusão, pulmão, diurese e pressão":
    "Insuficiencia cardíaca/enfermedad renal crónica presentes / preferir un volumen inicial más cauteloso, reevaluando la perfusión, el pulmón, la diuresis y la presión",
  "EHH provável / déficit hídrico costuma ser maior; iniciar isotônico e planejar reposição mais prolongada, guiada por osmolaridade e Na corrigido":
    "EHH probable / el déficit hídrico suele ser mayor; iniciar isotónico y planificar una reposición más prolongada, guiada por la osmolaridad y el sodio corregido",
  "Iniciar cristaloide isotônico; reavaliar e considerar solução com menor carga de Na após expansão inicial":
    "Iniciar cristaloide isotónico; reevaluar y considerar una solución con menor carga de sodio tras la expansión inicial",
  "Na elevado / após estabilização inicial, reavaliar sódio corrigido e considerar ajuste da solução para evitar piora da hipernatremia":
    "Sodio elevado / tras la estabilización inicial, reevaluar el sodio corregido y considerar ajustar la solución para evitar el empeoramiento de la hipernatremia",
  "CAD ou quadro misto / iniciar expansão com isotônico e depois ajustar por perfusão, Na corrigido, diurese e glicemia":
    "CAD o cuadro mixto / iniciar la expansión con isotónico y luego ajustar según la perfusión, el sodio corregido, la diuresis y la glucemia",

  // ── Insulina / glicose sugeridas ───────────────────────────────────────────
  "Aguardar K ≥ 3,3 antes de iniciar insulina": "Esperar un K ≥ 3,3 antes de iniciar la insulina",
  "Corrigir K primeiro / não iniciar insulina se K < 3,3 mEq/L":
    "Corregir el K primero / no iniciar la insulina si el K < 3,3 mEq/L",
  "Não iniciar insulina se K < 3,3 mEq/L (corrigir potássio antes e reavaliar eletrólitos em série)":
    "No iniciar la insulina si el K < 3,3 mEq/L (corregir el potasio primero y reevaluar los electrolitos de forma seriada)",
  "Aguardar K ≥ 3,3 antes da insulinoterapia":
    "Esperar un K ≥ 3,3 antes de la insulinoterapia",
  "Adicionar SG 5% ou 10% quando glicemia atingir ~300 mg/dL, mantendo insulina IV":
    "Añadir dextrosa al 5% o al 10% cuando la glucemia llegue a ~300 mg/dL, manteniendo la insulina IV",
  "EHH / iniciar glicose quando a glicemia cair para ~300 mg/dL; manter insulina para evitar queda abrupta e corrigir hiperosmolaridade com segurança":
    "EHH / iniciar la dextrosa cuando la glucemia baje a ~300 mg/dL; mantener la insulina para evitar una caída brusca y corregir la hiperosmolaridad con seguridad",
  "Adicionar SG 5% ou 10% quando glicemia atingir ~200–250 mg/dL, mantendo insulina IV":
    "Añadir dextrosa al 5% o al 10% cuando la glucemia llegue a ~200–250 mg/dL, manteniendo la insulina IV",
  "Quadro misto / geralmente iniciar glicose quando a glicemia cair para ~200–250 mg/dL, preservando correção do gap e evitando hipoglicemia":
    "Cuadro mixto / en general iniciar la dextrosa cuando la glucemia baje a ~200–250 mg/dL, preservando la corrección de la brecha y evitando la hipoglucemia",
  "Adicionar SG 5% ou 10% quando glicemia atingir ~200 mg/dL, mantendo insulina IV":
    "Añadir dextrosa al 5% o al 10% cuando la glucemia llegue a ~200 mg/dL, manteniendo la insulina IV",
  "CAD / iniciar glicose quando a glicemia cair para ~200 mg/dL para continuar insulina até fechar o gap e resolver a acidose":
    "CAD / iniciar la dextrosa cuando la glucemia baje a ~200 mg/dL para continuar la insulina hasta cerrar la brecha y resolver la acidosis",
  "KCl 20–30 mEq/h antes da insulina": "KCl 20–30 mEq/h antes de la insulina",
  "K < 3,3 / repor 20–30 mEq/h e adiar insulina até K ≥ 3,3":
    "K < 3,3 / reponer 20–30 mEq/h y posponer la insulina hasta un K ≥ 3,3",
  "KCl 20–30 mEq por litro de infusão": "KCl 20–30 mEq por litro de infusión",
  "K 3,3–5,2 / repor 20–30 mEq/L para manter K entre 4 e 5 mEq/L":
    "K 3,3–5,2 / reponer 20–30 mEq/L para mantener el K entre 4 y 5 mEq/L",
  "Sem reposição inicial; dosar K seriado": "Sin reposición inicial; medir el K de forma seriada",
  "K > 5,2 / não repor inicialmente; reavaliar K a cada 2 h":
    "K > 5,2 / no reponer al inicio; reevaluar el K cada 2 h",
  "Glicemia horária | K/Na/HCO₃⁻ 2/2–4/4 h | gap aniônico | diurese | sinais vitais":
    "Glucemia horaria | K/Na/HCO₃⁻ cada 2–4 h | brecha aniónica | diuresis | signos vitales",
  "Monitorização padrão CAD / glicemia horária, fechamento do gap, K seriado e diurese":
    "Monitorización estándar de la CAD / glucemia horaria, cierre de la brecha, K seriado y diuresis",
  "Transição para SC após resolução clínica e metabólica":
    "Transición a la vía subcutánea tras la resolución clínica y metabólica",

  // ── Referência ─────────────────────────────────────────────────────────────
  "Ordem na emergência (lembrete)": "Orden en la emergencia (recordatorio)",
  "Diferenças essenciais (referência)": "Diferencias esenciales (referencia)",
  "Por que o anion gap importa": "Por qué importa la brecha aniónica",
  "Gap elevado reforça CAD / quadro misto": "Una brecha elevada refuerza la CAD / el cuadro mixto",
  "Gap elevado exige contexto": "Una brecha elevada exige contexto",
  "Possível acidose metabólica apesar do pH limítrofe":
    "Posible acidosis metabólica a pesar del pH límite",
  "Hipocalemia grave antes de insulina": "Hipopotasemia grave antes de la insulina",
  "Condutas — CAD (além da hidratação e monitorização)":
    "Conductas — CAD (además de la hidratación y la monitorización)",
  "Condutas — EHH (além da hidratação e monitorização)":
    "Conductas — EHH (además de la hidratación y la monitorización)",
  "Resolução metabólica": "Resolución metabólica",
  "Completar avaliação": "Completar la evaluación",
  "Acidose grave (pH < 6,9)": "Acidosis grave (pH < 6,9)",

  // ── Anamnese: alergias, DM, medicações ─────────────────────────────────────
  "Alergias medicamentosas": "Alergias medicamentosas",
  "Alergia a penicilina / beta-lactâmico": "Alergia a la penicilina / betalactámicos",
  "Alergia a dipirona": "Alergia al metamizol",
  "Alergia a contraste": "Alergia al contraste",
  "Alergia a anti-inflamatório": "Alergia a los antiinflamatorios",
  "Tipo de DM": "Tipo de diabetes",
  "DM1 / mais típico na CAD": "Diabetes tipo 1 / más típica en la CAD",
  "DM2 / mais comum no EHH": "Diabetes tipo 2 / más frecuente en el EHH",
  "Desconhecido / primeiro episódio de diabetes":
    "Desconocido / primer episodio de diabetes",
  "Desconhecido / primeiro episódio": "Desconocido / primer episodio",
  "Uso de insulina": "Uso de insulina",
  "Em uso": "En uso",
  "Não usa": "No la usa",
  "Inibidor SGLT2 (canagliflozina, dapagliflozina, empagliflozina…)":
    "Inhibidor de SGLT2 (canagliflozina, dapagliflozina, empagliflozina…)",
  "Usa": "La usa",
  "Obesidade": "Obesidad",
  "Doença hepática": "Enfermedad hepática",

  // ── Manifestações clínicas ─────────────────────────────────────────────────
  "Manifestações clínicas": "Manifestaciones clínicas",
  "Poliúria / polidipsia / desidratação progressiva":
    "Poliuria / polidipsia / deshidratación progresiva",
  "Poliúria / polidipsia": "Poliuria / polidipsia",
  "Náuseas / vômitos / intolerância oral": "Náuseas / vómitos / intolerancia oral",
  "Náuseas / vômitos": "Náuseas / vómitos",
  "Dor abdominal / pode simular abdome agudo":
    "Dolor abdominal / puede simular un abdomen agudo",
  "Dispneia / respiração de Kussmaul": "Disnea / respiración de Kussmaul",
  "Dispneia / Kussmaul": "Disnea / Kussmaul",
  "Alteração de consciência / sonolência / coma":
    "Alteración de la consciencia / somnolencia / coma",
  "Alteração de consciência": "Alteración de la consciencia",
  "Perda ponderal / catabolismo recente": "Pérdida de peso / catabolismo reciente",
  "Perda ponderal / catabolismo": "Pérdida de peso / catabolismo",
  "Fraqueza / prostração importante": "Debilidad / postración importante",
  "Fraqueza / prostração": "Debilidad / postración",
  "Sede intensa / boca seca": "Sed intensa / boca seca",
  "Rebaixamento progressivo / confusão": "Deterioro progresivo del sensorio / confusión",

  // ── PAM, desidratação, outros achados ──────────────────────────────────────
  "PAM calculada (mmHg)": "PAM calculada (mmHg)",
  "Calculada automaticamente a partir de PAS e PAD":
    "Calculada automáticamente a partir de la PAS y la PAD",
  "PAM = (PAS + 2×PAD) / 3. Útil para leitura rápida da perfusão hemodinâmica.":
    "PAM = (PAS + 2×PAD) / 3. Útil para una lectura rápida de la perfusión hemodinámica.",
  "Desidratação / perfusão": "Deshidratación / perfusión",
  "Leve (mucosas secas, perfusão preservada, sem choque)":
    "Leve (mucosas secas, perfusión conservada, sin choque)",
  "Moderada (taquicardia, hipovolemia clínica, perfusão limítrofe)":
    "Moderada (taquicardia, hipovolemia clínica, perfusión límite)",
  "Grave (hipotensão, PAM baixa, extremidades frias, choque)":
    "Grave (hipotensión, PAM baja, extremidades frías, choque)",
  "Outros achados": "Otros hallazgos",
  "Hálito cetônico": "Aliento cetónico",
  "Respiração de Kussmaul": "Respiración de Kussmaul",
  "Dor abdominal localizada": "Dolor abdominal localizado",
  "Náuseas / vômitos persistentes": "Náuseas / vómitos persistentes",
  "Sonolência / lentificação": "Somnolencia / enlentecimiento",
  "Estupor / coma": "Estupor / coma",
  "Sinais neurológicos focais": "Signos neurológicos focales",
  "Sinais de infecção associada": "Signos de infección asociada",
  "Desconforto respiratório": "Dificultad respiratoria",

  // ── Precipitante ───────────────────────────────────────────────────────────
  "Precipitante suspeito": "Precipitante sospechado",
  "Infecção (colher foco, culturas e iniciar ATB se indicado)":
    "Infección (tomar el foco, cultivos e iniciar antibiótico si está indicado)",
  "Infecção": "Infección",
  "Omissão de insulina ou falha de bomba (checar adesão/dispositivo)":
    "Omisión de insulina o fallo de la bomba (comprobar la adherencia/el dispositivo)",
  "Omissão de insulina / falha de bomba": "Omisión de insulina / fallo de la bomba",
  "IAM / SCA (ECG, troponina e estratificação cardiovascular)":
    "Infarto / SCA (ECG, troponina y estratificación cardiovascular)",
  "IAM / SCA": "Infarto / SCA",
  "Medicamento precipitante (corticoide, antipsicótico, SGLT2 e outros)":
    "Medicamento precipitante (corticoide, antipsicótico, iSGLT2 y otros)",
  "Medicamento precipitante": "Medicamento precipitante",
  "Álcool, drogas ou pancreatite (gatilho metabólico associado)":
    "Alcohol, drogas o pancreatitis (desencadenante metabólico asociado)",
  "Álcool / drogas / pancreatite": "Alcohol / drogas / pancreatitis",
  "Gestação (maior vigilância e apoio obstétrico)":
    "Embarazo (mayor vigilancia y apoyo obstétrico)",
  "Gestação": "Embarazo",
  "Osm total (est.)": "Osm total (est.)",
  "Osm EFETIVA (critério de EHH)": "Osm EFECTIVA (criterio de EHH)",
  "UREIA, como os laboratórios brasileiros reportam — não nitrogênio ureico (BUN). Faixa usual ~10–50 mg/dL; a do BUN é ~7–20. Informar BUN neste campo infla a osmolaridade estimada em ~2×. Ureia elevada sugere desidratação importante, hipoperfusão renal ou injúria renal associada.": "UREA, como la reportan los laboratorios brasileños — no nitrógeno ureico (BUN). Rango habitual ~10–50 mg/dL; el del BUN es ~7–20. Informar BUN en este campo infla la osmolaridad estimada en ~2×. La urea elevada sugiere deshidratación importante, hipoperfusión renal o injuria renal asociada.",
  "⚠️ USAR A EFETIVA, NÃO A TOTAL. A osmolalidade total inclui a UREIA, que é osmol ineficaz — atravessa a membrana e não desloca água. Incluí-la INFLA o número e SUPERDIAGNOSTICA EHH. E a direção importa: um paciente com CAD rotulado como EHH recebe insulina em dose menor e hidratação mais prolongada enquanto a cetoacidose corre. O erro oposto é menos perigoso, porque a CAD é o esquema mais agressivo dos dois.": "⚠️ USAR LA EFECTIVA, NO LA TOTAL. La osmolalidad total incluye la UREA, que es un osmol ineficaz — atraviesa la membrana y no desplaza agua. Incluirla INFLA el número y SOBREDIAGNOSTICA EHH. Y la dirección importa: un paciente con CAD rotulado como EHH recibe insulina en dosis menor e hidratación más prolongada mientras la cetoacidosis avanza. El error opuesto es menos peligroso, porque la CAD es el esquema más agresivo de los dos.",
  "⚠️ UREIA × BUN: a fórmula clássica \"ureia/2,8\" pressupõe nitrogênio ureico (BUN), que os laboratórios brasileiros NÃO reportam. Com ureia total, o divisor é 6 — usar 2,8 superestima esse termo em ~2,14×. Na osmolalidade EFETIVA a questão não existe, porque a ureia não entra.": "⚠️ UREA × BUN: la fórmula clásica \"urea/2,8\" presupone nitrógeno ureico (BUN), que los laboratorios brasileños NO reportan. Con urea total, el divisor es 6 — usar 2,8 sobrestima ese término en ~2,14×. En la osmolalidad EFECTIVA la cuestión no existe, porque la urea no entra.",
  "CAD/quadro misto / iniciar após volume e K seguro com {0} U/h (0,1 U/kg/h); alvo inicial: queda de 50–70 mg/dL/h": "CAD/cuadro mixto / iniciar tras volumen y K seguro con {0} U/h (0,1 U/kg/h); objetivo inicial: descenso de 50–70 mg/dL/h",
  "EHH / iniciar após hidratação inicial com {0} U/h (0,05 U/kg/h); alvo inicial: queda de 50–70 mg/dL/h": "EHH / iniciar tras la hidratación inicial con {0} U/h (0,05 U/kg/h); objetivo inicial: descenso de 50–70 mg/dL/h",
  "Insulina regular IV {0} (alternativa mais cautelosa se preocupação com velocidade de correção osmótica)": "Insulina regular IV {0} (alternativa más cautelosa si preocupa la velocidad de corrección osmótica)",
  "Insulina regular IV {0} (alternativa mais lenta se necessário, com titulação pela resposta clínica e glicêmica)": "Insulina regular IV {0} (alternativa más lenta si es necesario, con titulación por la respuesta clínica y glucémica)",
  "Insulina regular IV {0} (esquema padrão na CAD após reposição volêmica inicial; manter meta de queda de 50–70 mg/dL/h)": "Insulina regular IV {0} (esquema estándar en la CAD tras la reposición volémica inicial; mantener la meta de descenso de 50–70 mg/dL/h)",
  "Insulina regular IV {0} (início usual no EHH após reposição volêmica inicial; titular para queda de 50–70 mg/dL/h e evitar queda osmótica rápida)": "Insulina regular IV {0} (inicio habitual en el EHH tras la reposición volémica inicial; titular para un descenso de 50–70 mg/dL/h y evitar una caída osmótica rápida)",
  "Insulina regular IV {0} (usar se houver cetose/acidose associada ou quadro misto, com monitorização mais próxima)": "Insulina regular IV {0} (usar si hay cetosis/acidosis asociada o cuadro mixto, con monitorización más estrecha)",
  "Transição SC / {0}, sobrepor insulina basal 2 h antes de suspender a IV e garantir aceitação oral": "Transición SC / {0}, solapar la insulina basal 2 h antes de suspender la IV y garantizar la aceptación oral",
  "Transição basal-bolus / TDD ~0,3–0,5 U/kg/dia; {0}; aplicar basal 2 h antes de desligar insulina IV": "Transición basal-bolo / TDD ~0,3–0,5 U/kg/día; {0}; aplicar la basal 2 h antes de apagar la insulina IV",
  "Ureia — não BUN ({0})": "Urea — NO BUN ({0})",
};
