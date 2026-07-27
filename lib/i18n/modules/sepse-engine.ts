/**
 * Módulo Sepse (sepsis-engine.ts) — dicionário PT → ES.
 * Terminologia: UCI, sepsis, choque séptico, noradrenalina, hemocultivos,
 * urocultivo, catéter venoso central (CVC), sonda vesical, aclaramiento.
 * Parte 1 de 3 — classificação, painéis, sintomas e antecedentes.
 */
export const ES_SEPSE_ENGINE_1: Record<string, string> = {
  // ── Classificação e painel ─────────────────────────────────────────────────
  "Choque séptico — vasopressor + lactato > 2 após ressuscitação (Sepsis-3)":
    "Choque séptico — vasopresor + lactato > 2 tras la reanimación (Sepsis-3)",
  "Alto risco de sepse": "Alto riesgo de sepsis",
  "Sepse possível — alto risco": "Sepsis posible — alto riesgo",
  "Sepse possível — qSOFA 1 com foco suspeito (aguardar exames)":
    "Sepsis posible — qSOFA 1 con foco sospechado (esperar los exámenes)",
  "Infecção suspeita sem critérios de sepse": "Infección sospechada sin criterios de sepsis",
  "Infecção suspeita — sem critérios Sepsis-3 no momento":
    "Infección sospechada — sin criterios Sepsis-3 por ahora",
  "SOFA": "SOFA",
  "Exames pendentes": "Exámenes pendientes",
  "qSOFA*": "qSOFA*",
  "IMC": "IMC",
  "Vol. cristalóide": "Vol. cristaloide",
  "IOT": "Intubación",
  "Vasopressor": "Vasopresor",
  "P/F (PaO₂/FiO₂)": "P/F (PaO₂/FiO₂)",
  "RASS": "RASS",
  "➕ Cobertura anti-MRSA adicionada": "➕ Cobertura anti-SARM añadida",
  "📋 Observações": "📋 Observaciones",
  "Ressuscitação volêmica": "Reanimación con volumen",
  "panel": "panel",
  "Revisar etapa anterior": "Revisar la etapa anterior",

  // ── Blocos de conduta ──────────────────────────────────────────────────────
  "💧 Ressuscitação volêmica": "💧 Reanimación con volumen",
  "🩸 Vasopressor — PAM < 65 mmHg": "🩸 Vasopresor — PAM < 65 mmHg",
  "🩸 Vasopressor — choque séptico": "🩸 Vasopresor — choque séptico",
  "🦠 Antimicrobiano e controle de foco": "🦠 Antimicrobiano y control del foco",
  "🫁 Intubação orotraqueal — indicada": "🫁 Intubación orotraqueal — indicada",
  "🫁 Suporte de O₂": "🫁 Soporte de O₂",
  "🫁 Oxigenoterapia": "🫁 Oxigenoterapia",
  "🩺 Acesso vascular": "🩺 Acceso vascular",
  "🚰 Sondagem vesical de demora (SVD)": "🚰 Sondaje vesical permanente",
  "📊 Monitorização contínua": "📊 Monitorización continua",
  "🔪 Controle do foco — cirúrgico": "🔪 Control del foco — quirúrgico",
  "🔌 Controle do foco — cateter": "🔌 Control del foco — catéter",

  // ── Alergia, risco e contexto ──────────────────────────────────────────────
  "Sim — alergia a beta-lactâmico registrada em Alergias":
    "Sí — alergia a betalactámicos registrada en Alergias",
  "Não — sem alergias relevantes registradas":
    "No — sin alergias relevantes registradas",
  "Não — sem beta-lactâmico nas alergias registradas":
    "No — sin betalactámicos entre las alergias registradas",
  "Alto": "Alto",
  "Alto — imunossupressão identificada": "Alto — inmunosupresión identificada",
  "Baixo": "Bajo",
  "Baixo — sem fatores de risco para MDR identificados":
    "Bajo — sin factores de riesgo para multirresistencia identificados",
  "Não — sem fatores de risco para MRSA identificados":
    "No — sin factores de riesgo para SARM identificados",
  "Assistência à saúde": "Asociado a la asistencia sanitaria",
  "Assistência à saúde — internação recente registrada":
    "Asociado a la asistencia sanitaria — ingreso reciente registrado",
  "Hospitalar": "Hospitalario",
  "Hospitalar — contexto intra-hospitalar": "Hospitalario — contexto intrahospitalario",
  "Comunitário": "Comunitario",
  "Comunitário — sem indicativo de origem hospitalar":
    "Comunitario — sin indicios de origen hospitalario",

  // ── Suporte inicial sugerido ───────────────────────────────────────────────
  "Intubação orotraqueal + Ventilação mecânica":
    "Intubación orotraqueal + ventilación mecánica",
  "O₂ máscara com reservatório 10–15 L/min": "O₂ con mascarilla con reservorio 10–15 L/min",
  "O₂ máscara simples 5–8 L/min": "O₂ con mascarilla simple 5–8 L/min",
  "O₂ cateter nasal 2–4 L/min": "O₂ por cánula nasal 2–4 L/min",
  "Sem suporte de O₂ no momento": "Sin soporte de O₂ por ahora",
  "Ringer Lactato 500 mL em bolus — reavaliar":
    "Ringer lactato 500 mL en bolo — reevaluar",
  "Reposição volêmica restritiva — sem sinais de hipoperfusão":
    "Reposición de volumen restrictiva — sin signos de hipoperfusión",
  "2 acessos venosos periféricos calibrosos | Cateter venoso central — jugular interna | Cateter arterial radial (PA invasiva contínua)":
    "2 accesos venosos periféricos gruesos | Catéter venoso central — yugular interna | Catéter arterial radial (PA invasiva continua)",
  "Choque séptico — CVC + cateter arterial + 2× AVP calibrosos":
    "Choque séptico — CVC + catéter arterial + 2 accesos venosos periféricos gruesos",
  "2 acessos venosos periféricos calibrosos": "2 accesos venosos periféricos gruesos",
  "Sepse de alto risco — 2 acessos periféricos calibrosos, avaliar CVC":
    "Sepsis de alto riesgo — 2 accesos periféricos gruesos, valorar CVC",
  "Acesso venoso periférico 18G": "Acceso venoso periférico 18G",
  "Sepse possível — acesso periférico calibroso mínimo 18G":
    "Sepsis posible — acceso periférico grueso, mínimo 18G",
  "Noradrenalina 0,1 mcg/kg/min — titular até PAM ≥ 65":
    "Noradrenalina 0,1 mcg/kg/min — titular hasta una PAM ≥ 65",
  "Reavaliar perfil hemodinâmico — considerar dobutamina se baixo débito e manter PAM com noradrenalina se necessário":
    "Reevaluar el perfil hemodinámico — considerar dobutamina si hay bajo gasto y mantener la PAM con noradrenalina si es necesario",
  "Hipoxemia + cardiopatia: diferenciar vasoplegia de baixo débito antes de escalar catecolamina":
    "Hipoxemia + cardiopatía: diferenciar la vasoplejía del bajo gasto antes de escalar la catecolamina",
  "Sem vasopressor necessário no momento": "Sin necesidad de vasopresor por ahora",
  "Intubação orotraqueal imediata (SRI)": "Intubación orotraqueal inmediata (ISR)",
  "VNI de prova — reavaliar em 30–60 min": "VNI de prueba — reevaluar en 30–60 min",
  "Sem indicação de IOT no momento": "Sin indicación de intubación por ahora",
  "Parâmetros ventilatórios estáveis — sem indicação de IOT":
    "Parámetros ventilatorios estables — sin indicación de intubación",
  "Cateter vesical de demora — controle de diurese horária":
    "Sonda vesical permanente — control de la diuresis horaria",
  "Sem SVD — controle por outros meios": "Sin sonda vesical — control por otros medios",
  "Baixo risco — controle de diurese sem sondagem no momento":
    "Bajo riesgo — control de la diuresis sin sondaje por ahora",

  // ── Monitorização sugerida ─────────────────────────────────────────────────
  "ECG contínuo | Oximetria de pulso contínua | Pressão arterial invasiva (PAI) | Diurese horária (meta ≥ 0,5 mL/kg/h) | Lactato seriado em 2h (meta: ↓ ≥ 10%) | Glicemia capilar (meta 140–180 mg/dL) | Balanço hídrico horário":
    "ECG continuo | Pulsioximetría continua | Presión arterial invasiva | Diuresis horaria (objetivo ≥ 0,5 mL/kg/h) | Lactato seriado a las 2 h (objetivo: ↓ ≥ 10%) | Glucemia capilar (objetivo 140–180 mg/dL) | Balance hídrico horario",
  "Choque séptico — monitorização completa: ECG, SpO₂, PA invasiva, diurese, lactato seriado, glicemia, BH":
    "Choque séptico — monitorización completa: ECG, SpO₂, PA invasiva, diuresis, lactato seriado, glucemia y balance hídrico",
  "ECG contínuo | Oximetria de pulso contínua | PANI a cada 15 min | Diurese horária (meta ≥ 0,5 mL/kg/h) | Lactato seriado em 2h (meta: ↓ ≥ 10%) | Glicemia capilar (meta 140–180 mg/dL)":
    "ECG continuo | Pulsioximetría continua | PA no invasiva cada 15 min | Diuresis horaria (objetivo ≥ 0,5 mL/kg/h) | Lactato seriado a las 2 h (objetivo: ↓ ≥ 10%) | Glucemia capilar (objetivo 140–180 mg/dL)",
  "Sepse — ECG, SpO₂ contínua, PANI 15/15 min, diurese, lactato serial, glicemia":
    "Sepsis — ECG, SpO₂ continua, PA no invasiva cada 15 min, diuresis, lactato seriado y glucemia",
  "ECG contínuo | Oximetria de pulso contínua | PANI a cada 15 min | Temperatura seriada (2/2h)":
    "ECG continuo | Pulsioximetría continua | PA no invasiva cada 15 min | Temperatura seriada (cada 2 h)",
  "Monitorização básica — ECG, SpO₂, PANI, temperatura":
    "Monitorización básica — ECG, SpO₂, PA no invasiva y temperatura",

  // ── Destino ────────────────────────────────────────────────────────────────
  "Internação imediata em UTI": "Ingreso inmediato en UCI",
  "Internação em UTI ou semi-UTI": "Ingreso en UCI o en cuidados intermedios",
  "Internação em enfermaria com reavaliação em 4–6h":
    "Ingreso en sala de hospitalización con reevaluación en 4–6 h",
  "Enfermaria — qSOFA 1 — reavaliação seriada obrigatória":
    "Sala de hospitalización — qSOFA 1 — reevaluación seriada obligatoria",
  "Observação 6–12h + alta com ATB VO se sem critérios de internação":
    "Observación 6–12 h + alta con antibiótico oral si no hay criterios de ingreso",
  "Baixo risco — observação e reavaliação antes de alta":
    "Bajo riesgo — observación y reevaluación antes del alta",
  "Manter UTI — sem critérios de desmame ou alta neste momento":
    "Mantener en UCI — sin criterios de destete ni de alta por ahora",
  "Manter UTI — em desmame de suporte. Reavaliar critérios de alta em 24–48h":
    "Mantener en UCI — en destete del soporte. Reevaluar los criterios de alta en 24–48 h",
  "Manter UTI — desmame em curso (vasopressor ou VM ainda ativos)":
    "Mantener en UCI — destete en curso (vasopresor o ventilación mecánica aún activos)",
  "Manter UTI — dependência de vasopressor e/ou ventilação mecânica":
    "Mantener en UCI — dependencia de vasopresor o de ventilación mecánica",
  "Manter UTI — suporte crítico em curso (vasopressor / VM)":
    "Mantener en UCI — soporte crítico en curso (vasopresor / ventilación mecánica)",
  "Alta da UTI para enfermaria — estável, sem vasopressor, ventilando espontaneamente":
    "Alta de UCI a sala de hospitalización — estable, sin vasopresor y con ventilación espontánea",
  "Alta da UTI para unidade semi-intensiva — critérios de desmame atingidos, ainda necessita monitorização":
    "Alta de UCI a cuidados intermedios — criterios de destete alcanzados, aún requiere monitorización",
  "Alta UTI → Semi-UTI — desmame completo, monitorização ainda necessária":
    "Alta de UCI → cuidados intermedios — destete completo, aún requiere monitorización",
  "Manter UTI — aguardar evolução de 24h e reavaliação de critérios de desmame":
    "Mantener en UCI — esperar la evolución de 24 h y reevaluar los criterios de destete",
  "Manter UTI — dados insuficientes para definir alta no momento":
    "Mantener en UCI — datos insuficientes para definir el alta por ahora",

  // ── Ajuste automático de antibiótico ───────────────────────────────────────
  "Ajustar/confirmar cobertura MRSA — vancomicina 25–30 mg/kg ataque IV (alvo AUC/MIC 400–600)":
    "Ajustar o confirmar la cobertura para SARM — vancomicina 25–30 mg/kg de carga IV (objetivo AUC/CIM 400–600)",
  "MRSA confirmado → garantir vancomicina ou linezolida":
    "SARM confirmado → asegurar vancomicina o linezolid",
  "Trocar para ceftazidima-avibactam 2,5g IV 8/8h (KPC) — ou meropeném 2g IV 8/8h em infusão estendida 3h se for apenas ESBL":
    "Cambiar a ceftazidima-avibactam 2,5 g IV cada 8 h (KPC) — o meropenem 2 g IV cada 8 h en infusión extendida de 3 h si solo es BLEE",
  "KPC/carbapenemase → ceftazidima-avibactam urgente":
    "KPC/carbapenemasa → ceftazidima-avibactam urgente",
  "Manter ou iniciar meropeném 1g IV 8/8h (ESBL confirmada) — não descalonar para cefalosporina":
    "Mantener o iniciar meropenem 1 g IV cada 8 h (BLEE confirmada) — no desescalar a cefalosporina",
  "ESBL → manter carbapenêmico": "BLEE → mantener el carbapenémico",
  "Direcionar para antibiograma — cobrir Pseudomonas MDR: pip-tazo se sensível; meropeném se resistente; associar amicacina ou ciprofloxacino conforme resultado":
    "Dirigir según el antibiograma — cubrir Pseudomonas multirresistente: pip-tazo si es sensible; meropenem si es resistente; asociar amikacina o ciprofloxacino según el resultado",
  "Pseudomonas → aguardar antibiograma para cobertura adequada":
    "Pseudomonas → esperar el antibiograma para una cobertura adecuada",
  "Acinetobacter baumannii MDR → polimixina B 25.000 UI/kg/dia IV ÷ 12/12h + ampicilina-sulbactam 3g IV 4/4h (em dose alta)":
    "Acinetobacter baumannii multirresistente → polimixina B 25.000 UI/kg/día IV repartidas cada 12 h + ampicilina-sulbactam 3 g IV cada 4 h (a dosis alta)",
  "A. baumannii MDR → polimixina + sulbactam":
    "A. baumannii multirresistente → polimixina + sulbactam",
  "Descalonar para oxacilina 2g IV 4/4h (MSSA confirmada) — superior à vancomicina; suspender vancomicina se em uso":
    "Desescalar a oxacilina 2 g IV cada 4 h (SASM confirmado) — superior a la vancomicina; suspender la vancomicina si está en uso",
  "MSSA → descalonar para oxacilina": "SASM → desescalar a oxacilina",
  "Iniciar micafungina 100mg IV 1x/dia ou anidulafungina 200mg IV ataque → 100mg/dia — monitorar fundo de olho e ecocardiograma":
    "Iniciar micafungina 100 mg IV 1 vez al día o anidulafungina 200 mg IV de carga → 100 mg/día — controlar el fondo de ojo y el ecocardiograma",
  "Candidemia → equinocandina precocemente": "Candidemia → equinocandina de forma precoz",
  "Culturas negativas com boa resposta após ≥ 72h → descalonar espectro (ex: meropeném → pip-tazo ou cefalosporina 3G conforme foco)":
    "Cultivos negativos con buena respuesta tras ≥ 72 h → desescalar el espectro (p. ej., meropenem → pip-tazo o cefalosporina de 3.ª generación según el foco)",
  "Culturas negativas + melhora → descalonamento recomendado":
    "Cultivos negativos + mejoría → se recomienda el desescalamiento",
  "Piperacilina-tazobactam com falha → escalonar para meropeném 1g IV 8/8h (cobrir ESBL e Pseudomonas mais resistente)":
    "Fallo con piperacilina-tazobactam → escalar a meropenem 1 g IV cada 8 h (cubrir BLEE y Pseudomonas más resistente)",
  "Pip-tazo com falha → escalonar para meropeném":
    "Fallo con pip-tazo → escalar a meropenem",
  "Carbapenêmico com falha + sem cobertura MRSA → adicionar vancomicina 25–30 mg/kg ataque IV + colher novas culturas + buscar foco não drenado":
    "Fallo con carbapenémico y sin cobertura para SARM → añadir vancomicina 25–30 mg/kg de carga IV + tomar nuevos cultivos + buscar un foco no drenado",
  "Carbapenêmico com falha → adicionar MRSA + buscar foco oculto":
    "Fallo con carbapenémico → añadir cobertura para SARM + buscar un foco oculto",
  "Broadspectrum com falha → busca de foco + considerar fungal":
    "Fallo con amplio espectro → búsqueda del foco + considerar causa fúngica",
  "Cefalosporina de 1G com falha → escalonar para pip-tazo 4,5g IV 6/6h (suspeita gram-negativo ou foco abdominal)":
    "Fallo con cefalosporina de 1.ª generación → escalar a pip-tazo 4,5 g IV cada 6 h (sospecha de gramnegativo o foco abdominal)",
  "Cefalosporina 1G com falha → escalonar cobertura gram-negativo":
    "Fallo con cefalosporina de 1.ª generación → ampliar la cobertura de gramnegativos",
  "Cefalosporina 3G/4G com falha → escalonar para pip-tazo 4,5g IV 6/6h ou meropeném 1g IV 8/8h conforme risco de ESBL/Pseudomonas":
    "Fallo con cefalosporina de 3.ª/4.ª generación → escalar a pip-tazo 4,5 g IV cada 6 h o meropenem 1 g IV cada 8 h según el riesgo de BLEE/Pseudomonas",
  "Cefalo 3G/4G com falha → considerar carbapenêmico":
    "Fallo con cefalosporina de 3.ª/4.ª generación → considerar un carbapenémico",
  "Falha ao ATB atual → colher novas culturas de todos os sítios antes de modificar + ampliar espectro empiricamente + buscar foco não drenado":
    "Fallo del antibiótico actual → tomar nuevos cultivos de todos los sitios antes de modificar + ampliar el espectro empíricamente + buscar un foco no drenado",
  "Falha terapêutica → culturas + broadening empírico":
    "Fallo terapéutico → cultivos + ampliación empírica del espectro",
  "UTI ≥ 14 dias → alto risco de candidemia: considerar adicionar equinocandina empiricamente se piora inexplicada":
    "UCI ≥ 14 días → alto riesgo de candidemia: considerar añadir una equinocandina de forma empírica si hay un empeoramiento inexplicado",

  // ── Cabeçalhos de cenário ──────────────────────────────────────────────────
  "🚑 Paciente Novo na UTI — Usar Primeiro Atendimento":
    "🚑 Paciente nuevo en la UCI — usar Primera atención",
  "🚑 Ir para Primeiro Atendimento": "🚑 Ir a Primera atención",
  "🔴 Piora Clínica — Investigação Sistemática":
    "🔴 Empeoramiento clínico — investigación sistemática",
  "🫁 PAV — Pneumonia Associada à Ventilação":
    "🫁 NAV — neumonía asociada a la ventilación",
  "🩸 IVAS-CVC — Bacteremia por Cateter":
    "🩸 Bacteriemia asociada a catéter venoso central",
  "🚽 ITURSC — Infecção Urinária por Cateter":
    "🚽 Infección urinaria asociada a sonda vesical",
  "🫃 Infecção Intra-abdominal": "🫃 Infección intraabdominal",
  "🍄 Candidemia / Fungemia": "🍄 Candidemia / fungemia",
  "💊 Ajuste de ATB — Recomendação Automática":
    "💊 Ajuste del antibiótico — recomendación automática",
  "⚠️ PAM < 65 — Piora Hemodinâmica": "⚠️ PAM < 65 — empeoramiento hemodinámico",
  "✅ Critérios de Desmame / Extubação": "✅ Criterios de destete / extubación",

  // ── Isolamento sugerido ────────────────────────────────────────────────────
  "Candidemia/Aspergilose → contato + rastreio MDR":
    "Candidemia/aspergilosis → contacto + cribado de multirresistencia",
  "Suspeita TB → isolamento aéreo + quarto individual com pressão negativa":
    "Sospecha de tuberculosis → aislamiento aéreo + habitación individual con presión negativa",
  "Suspeita de meningococcemia → isolamento de gotículas 24h":
    "Sospecha de meningococemia → aislamiento por gotas durante 24 h",
  "Alto risco MDR → isolamento de contato + swab retal":
    "Alto riesgo de multirresistencia → aislamiento de contacto + hisopado rectal",
  "HSCT/TMO — quarto HEPA + pressão positiva (evidência mantida)":
    "Trasplante de progenitores hematopoyéticos — habitación con filtro HEPA + presión positiva (evidencia vigente)",
  "Imunossupressão (não-HSCT) → quarto individual + precauções padrão rigorosas":
    "Inmunosupresión (sin trasplante de progenitores) → habitación individual + precauciones estándar estrictas",
  "Risco MDR intermediário → avaliar swab retal na admissão":
    "Riesgo intermedio de multirresistencia → valorar el hisopado rectal al ingreso",
  "Foco pulmonar comunitário → gotículas até excluir vírus respiratório":
    "Foco pulmonar comunitario → precauciones por gotas hasta descartar un virus respiratorio",
  "Foco não respiratório comunitário → precauções padrão":
    "Foco no respiratorio comunitario → precauciones estándar",
  "Suspeita meningite → gotículas 24h após ATB":
    "Sospecha de meningitis → precauciones por gotas durante 24 h tras el antibiótico",
  "Foco indefinido → precauções padrão + reavaliação após culturas":
    "Foco indefinido → precauciones estándar + reevaluación tras los cultivos",

  // ── Status e rótulos curtos ────────────────────────────────────────────────
  "Pendente": "Pendiente",
  "Solicitado": "Solicitado",
  "Realizado": "Realizado",
  "Culturas": "Cultivos",
  "Antimicrobiano": "Antimicrobiano",
  "Ringer Lactato 30 mL/kg (bal.)": "Ringer lactato 30 mL/kg (balanceado)",

  // ── Dados demográficos ─────────────────────────────────────────────────────
  "Ex.: feminino": "Ej.: femenino",
  "Sexo biológico — impacta cálculo de ClCr.":
    "Sexo biológico — influye en el cálculo del aclaramiento de creatinina.",
  "Idade (anos)": "Edad (años)",
  "anos": "años",
  "Usado no cálculo de ClCr (Cockcroft-Gault).":
    "Se usa en el cálculo del aclaramiento de creatinina (Cockcroft-Gault).",
  "Peso (kg)": "Peso (kg)",
  "Cálculo de volume de cristalóide (30 mL/kg) e dose de medicamentos.":
    "Cálculo del volumen de cristaloide (30 mL/kg) y de la dosis de los medicamentos.",
  "Altura (cm)": "Talla (cm)",
  "Auto": "Auto",

  // ── Tempo de evolução ──────────────────────────────────────────────────────
  "< 30 min": "< 30 min",
  "30–60 min": "30–60 min",
  "1–2h atrás": "hace 1–2 h",
  "> 2h atrás": "hace más de 2 h",
  "Piora nas últimas 6 horas": "Empeoramiento en las últimas 6 horas",
  "Piora nas últimas 6–12 horas": "Empeoramiento en las últimas 6–12 horas",
  "Piora nas últimas 12–24 horas": "Empeoramiento en las últimas 12–24 horas",
  "Piora há mais de 24 horas": "Empeoramiento desde hace más de 24 horas",
  "Gradual (dias)": "Gradual (días)",
  "Piora gradual ao longo de 2–5 dias": "Empeoramiento gradual a lo largo de 2–5 días",
  "< 6 horas": "< 6 horas",
  "6 a 24 horas": "De 6 a 24 horas",
  "> 24 horas": "> 24 horas",
  "Dias": "Días",
  "Há alguns dias": "Desde hace algunos días",

  // ── Motivo da reavaliação em UTI ───────────────────────────────────────────
  "Piora hemodinâmica / mais vasopressor": "Empeoramiento hemodinámico / más vasopresor",
  "Piora hemodinâmica / necessidade de escalonamento de vasopressor":
    "Empeoramiento hemodinámico / necesidad de escalar el vasopresor",
  "Febre nova / pico febril em internado": "Fiebre nueva / pico febril en el paciente ingresado",
  "Febre nova ou pico febril em paciente internado":
    "Fiebre nueva o pico febril en un paciente ingresado",
  "Piora ventilatória / mais FiO₂ ou PEEP": "Empeoramiento ventilatorio / más FiO₂ o PEEP",
  "Piora ventilatória / aumento de FiO₂ ou PEEP":
    "Empeoramiento ventilatorio / aumento de la FiO₂ o de la PEEP",
  "Rebaixamento do nível de consciência": "Deterioro del nivel de consciencia",
  "Oligúria / piora renal aguda": "Oliguria / empeoramiento renal agudo",
  "Oligúria ou piora da função renal": "Oliguria o empeoramiento de la función renal",
  "Suspeita de nova infecção hospitalar": "Sospecha de una nueva infección hospitalaria",
  "Suspeita de nova infecção ou infecção não controlada":
    "Sospecha de una nueva infección o de una infección no controlada",
  "Piora laboratorial / aumento do SOFA": "Empeoramiento analítico / aumento del SOFA",
  "Piora laboratorial com aumento do SOFA": "Empeoramiento analítico con aumento del SOFA",

  // ── Queixas do paciente ────────────────────────────────────────────────────
  "Febre": "Fiebre",
  "Calafrio / tremores": "Escalofríos / temblores",
  "Calafrio e tremores": "Escalofríos y temblores",
  "Hipotensão / pressão baixa": "Hipotensión / presión baja",
  "Hipotensão": "Hipotensión",
  "Mal-estar / prostração intensa": "Malestar / postración intensa",
  "Mal-estar geral e prostração": "Malestar general y postración",
  "Fraqueza / fadiga súbita": "Debilidad / fatiga súbita",
  "Fraqueza e fadiga de início súbito": "Debilidad y fatiga de inicio súbito",
  "Tosse": "Tos",
  "Falta de ar / dispneia": "Falta de aire / disnea",
  "Dispneia": "Disnea",
  "Dor no peito": "Dolor en el pecho",
  "Dor torácica": "Dolor torácico",
  "Ardência / dor para urinar": "Ardor / dolor al orinar",
  "Disúria": "Disuria",
  "Dor nas costas / lombar": "Dolor de espalda / lumbar",
  "Dor lombar": "Dolor lumbar",
  "Urina escura / turva": "Orina oscura / turbia",
  "Urina turva ou escura": "Orina turbia u oscura",
  "Dor de barriga / abdominal": "Dolor de barriga / abdominal",
  "Dor abdominal": "Dolor abdominal",
  "Vômito": "Vómito",
  "Diarreia": "Diarrea",
  "Confusão / desorientação": "Confusión / desorientación",
  "Confusão mental": "Confusión mental",
  "Dor de cabeça forte": "Dolor de cabeza intenso",
  "Cefaleia intensa": "Cefalea intensa",
  "Pescoço rígido": "Cuello rígido",
  "Rigidez de nuca": "Rigidez de nuca",
  "Vermelhidão / inchaço na pele": "Enrojecimiento / hinchazón en la piel",
  "Lesão eritematosa em pele ou partes moles":
    "Lesión eritematosa en piel o partes blandas",
  "Ferida com secreção": "Herida con secreción",
  "Ferida infectada com secreção": "Herida infectada con secreción",
  "Trazido por familiar / inconsciente": "Traído por un familiar / inconsciente",
  "Trazido por familiar — sem relato de queixa":
    "Traído por un familiar — sin relato de la queja",
  "Encaminhado por UBS / outro serviço": "Derivado de atención primaria u otro servicio",
  "Encaminhado de outro serviço": "Derivado de otro servicio",

  // ── Cenários de piora ──────────────────────────────────────────────────────
  "Sepse em tratamento sem resposta adequada":
    "Sepsis en tratamiento sin respuesta adecuada",
  "Piora de sepse em tratamento na UTI — sem resposta ao ATB atual":
    "Empeoramiento de una sepsis en tratamiento en la UCI — sin respuesta al antibiótico actual",
  "Novo episódio infeccioso em paciente internado":
    "Nuevo episodio infeccioso en un paciente ingresado",
  "Novo episódio séptico em paciente previamente estável":
    "Nuevo episodio séptico en un paciente previamente estable",
  "Bacteremia relacionada a CVC": "Bacteriemia relacionada con el catéter venoso central",
  "Bacteremia provavelmente relacionada a cateter venoso central":
    "Bacteriemia probablemente relacionada con el catéter venoso central",
  "PAV / pneumonia associada à ventilação": "NAV / neumonía asociada a la ventilación",
  "Suspeita de pneumonia associada à ventilação mecânica (PAV)":
    "Sospecha de neumonía asociada a la ventilación mecánica (NAV)",
  "ITU relacionada a sonda vesical": "Infección urinaria relacionada con la sonda vesical",
  "ITU relacionada a sonda vesical (ITURSC)":
    "Infección urinaria relacionada con la sonda vesical",
  "Infecção de ferida / sítio cirúrgico": "Infección de la herida / del sitio quirúrgico",
  "Infecção de sítio cirúrgico / ferida operatória":
    "Infección del sitio quirúrgico / de la herida operatoria",
  "Imunossuprimido com piora infecciosa": "Inmunodeprimido con empeoramiento infeccioso",
  "Piora clínica em paciente imunossuprimido — ampliar cobertura":
    "Empeoramiento clínico en un paciente inmunodeprimido — ampliar la cobertura",
  "Choque séptico refratário": "Choque séptico refractario",
  "Choque séptico refratário com aumento de vasopressores":
    "Choque séptico refractario con aumento de los vasopresores",
  "Sepse com SDRA / disfunção multiorgânica":
    "Sepsis con SDRA / disfunción multiorgánica",
  "SDRA associada a sepse — VM protetora e manejo multiorgânico":
    "SDRA asociada a sepsis — ventilación mecánica protectora y manejo multiorgánico",

  // ── Sinais e sintomas (lista clínica) ──────────────────────────────────────
  "Hipotermia (<36 °C)": "Hipotermia (< 36 °C)",
  "Mal-estar / prostração": "Malestar / postración",
  "Perda de apetite": "Pérdida del apetito",
  "Anorexia / hiporexia": "Anorexia / hiporexia",
  "Tosse (seca)": "Tos (seca)",
  "Tosse seca": "Tos seca",
  "Tosse (produtiva/purulenta)": "Tos (productiva/purulenta)",
  "Tosse produtiva ou purulenta": "Tos productiva o purulenta",
  "Dispneia / falta de ar": "Disnea / falta de aire",
  "Taquipneia": "Taquipnea",
  "Dor torácica pleurítica": "Dolor torácico pleurítico",
  "Dor torácica de caráter pleurítico": "Dolor torácico de características pleuríticas",
  "Disúria / ardência": "Disuria / ardor",
  "Polaciúria": "Polaquiuria",
  "Dor lombar / flanco": "Dolor lumbar / en flanco",
  "Urgência urinária": "Urgencia urinaria",
  "Urina turva / odor fétido": "Orina turbia / de olor fétido",
  "Urina turva com odor fétido": "Orina turbia con olor fétido",
  "Dor abdominal difusa": "Dolor abdominal difuso",
  "Dor em hipocôndrio D / fígado": "Dolor en hipocondrio derecho / hígado",
  "Dor em hipocôndrio direito": "Dolor en hipocondrio derecho",
  "Náusea / vômito": "Náusea / vómito",
  "Náusea e vômito": "Náuseas y vómitos",
  "Distensão abdominal": "Distensión abdominal",
  "Distensão e rigidez abdominal": "Distensión y rigidez abdominal",
  "Confusão mental / delirium": "Confusión mental / delirium",
  "Confusão mental ou delirium": "Confusión mental o delirium",
  "Rebaixamento de consciência": "Deterioro de la consciencia",
  "Cefaleia intensa / súbita": "Cefalea intensa / súbita",
  "Cefaleia intensa de início súbito": "Cefalea intensa de inicio súbito",
  "Rigidez de nuca / fotofobia": "Rigidez de nuca / fotofobia",
  "Rigidez de nuca e fotofobia": "Rigidez de nuca y fotofobia",
  "Lesão / eritema em pele": "Lesión / eritema en la piel",
  "Lesão eritematosa em pele": "Lesión eritematosa en la piel",
  "Calor e dor local": "Calor y dolor local",
  "Calor, dor e edema local": "Calor, dolor y edema local",
  "Ferida / úlcera infectada": "Herida / úlcera infectada",
  "Ferida ou úlcera com sinais de infecção": "Herida o úlcera con signos de infección",
  "Petéquias / púrpura": "Petequias / púrpura",
  "Petéquias ou púrpura disseminada": "Petequias o púrpura diseminada",
  "Hipotensão / tontura postural": "Hipotensión / mareo postural",
  "Hipotensão ou tontura postural": "Hipotensión o mareo postural",
  "Oligúria / redução do débito urinário": "Oliguria / reducción de la diuresis",
  "Oligúria": "Oliguria",

  // ── Evolução e antecedentes ────────────────────────────────────────────────
  "Início súbito (horas)": "Inicio súbito (horas)",
  "Início súbito em poucas horas": "Inicio súbito en pocas horas",
  "Evolução em 1–2 dias": "Evolución en 1–2 días",
  "Evolução há 1–2 dias": "Evolución desde hace 1–2 días",
  "Evolução em 3–5 dias": "Evolución en 3–5 días",
  "Evolução há 3–5 dias": "Evolución desde hace 3–5 días",
  "Evolução lenta (>5 dias)": "Evolución lenta (> 5 días)",
  "Evolução insidiosa há mais de 5 dias": "Evolución insidiosa desde hace más de 5 días",
  "Pós-operatório": "Posoperatorio",
  "Pós-operatório com suspeita infecciosa": "Posoperatorio con sospecha infecciosa",
  "Internação recente (<90 dias)": "Ingreso reciente (< 90 días)",
  "Internação hospitalar recente (<90 dias)": "Ingreso hospitalario reciente (< 90 días)",
  "Imunossuprimido / neoplasia": "Inmunodeprimido / neoplasia",
  "Paciente imunossuprimido ou com neoplasia":
    "Paciente inmunodeprimido o con neoplasia",
  "Idoso (≥65 anos)": "Adulto mayor (≥ 65 años)",
  "Paciente idoso (≥65 anos)": "Paciente adulto mayor (≥ 65 años)",
  "Sem foco claro identificado": "Sin un foco claro identificado",
  "Sem foco infeccioso claro identificado": "Sin un foco infeccioso claro identificado",

  // ── Comorbidades e medicações ──────────────────────────────────────────────
  "Comorbidades": "Comorbilidades",
  "Ex.: DM, HAS, DRC, cirrose": "Ej.: diabetes, hipertensión, enfermedad renal crónica, cirrosis",
  "Impacta classificação de risco e escolha do ATB.":
    "Influye en la clasificación del riesgo y en la elección del antibiótico.",
  "HAS": "Hipertensión",
  "DRC": "Enfermedad renal crónica",
  "Cirrose": "Cirrosis",
  "Neoplasia": "Neoplasia",
  "Imunossup.": "Inmunosup.",
  "Imunossupressão": "Inmunosupresión",
  "ICC": "Insuficiencia cardíaca",
  "DPOC": "EPOC",
  "HIV": "VIH",
  "Medicações de uso contínuo": "Medicación de uso continuo",
  "Toque para selecionar": "Toque para seleccionar",
  "Selecione as classes mais relevantes para o atendimento.":
    "Seleccione las clases más relevantes para la atención.",
  "Nenhuma relevante": "Ninguna relevante",
  "Sem medicações relevantes": "Sin medicación relevante",
  "ATB prévio": "Antibiótico previo",
  "Antibiótico prévio (<30 dias)": "Antibiótico previo (< 30 días)",
  "Corticóide": "Corticoide",
  "Corticóide sistêmico": "Corticoide sistémico",
  "Imunossupressor": "Inmunosupresor",
  "Quimioterapia": "Quimioterapia",
  "Quimioterapia ativa": "Quimioterapia activa",
  "Anticoagulante": "Anticoagulante",
  "Diurético": "Diurético",
  "IECA/BRA": "IECA/ARA II",
  "Insulina": "Insulina",
  "AINE": "AINE",
  "Hipoglicemiante VO": "Hipoglucemiante oral",
  "Hipoglicemiante oral": "Hipoglucemiante oral",
  "Antifúngico": "Antifúngico",
  "Antifúngico em uso": "Antifúngico en uso",

  // ── Alergias ───────────────────────────────────────────────────────────────
  "Alergias": "Alergias",
  "Ex.: penicilina, dipirona, látex": "Ej.: penicilina, metamizol, látex",
  "⚠️ Alergias a antimicrobianos impactam diretamente a escolha do ATB.":
    "⚠️ Las alergias a antimicrobianos influyen directamente en la elección del antibiótico.",
  "Sem alergias conhecidas": "Sin alergias conocidas",
  "Penicilina": "Penicilina",
  "Cefalosporina": "Cefalosporina",
  "Sulfa": "Sulfamida",
  "Sulfonamida": "Sulfonamida",
  "Quinolona": "Quinolona",
  "Dipirona": "Metamizol",
  "AINEs": "AINE",

  // ── Sinais vitais ──────────────────────────────────────────────────────────
  "PAS (mmHg)": "PAS (mmHg)",
  "mmHg": "mmHg",
  "PAS ≤100 mmHg = 1 ponto qSOFA (complementar). PAM calculada automaticamente com PAD.":
    "PAS ≤ 100 mmHg = 1 punto de qSOFA (complementario). La PAM se calcula automáticamente con la PAD.",
  "PAD (mmHg)": "PAD (mmHg)",
  "FC (bpm)": "FC (lpm)",
  "bpm": "lpm",
  "Taquicardia ≥90 bpm é critério SIRS.": "La taquicardia ≥ 90 lpm es un criterio de SRIS.",
  "FR (irpm)": "FR (rpm)",
  "irpm": "rpm",
  "FR ≥22 irpm = 1 ponto qSOFA (complementar). SOFA respiratório usa SpO₂/FiO₂.":
    "FR ≥ 22 rpm = 1 punto de qSOFA (complementario). El SOFA respiratorio usa SpO₂/FiO₂.",
  "Temperatura (°C)": "Temperatura (°C)",
  "Febre ≥38°C ou hipotermia <36°C são critérios SIRS.":
    "La fiebre ≥ 38 °C o la hipotermia < 36 °C son criterios de SRIS.",
  "SpO2 (%)": "SpO₂ (%)",
  "Em ar ambiente ou com suporte de O2 (especificar).":
    "En aire ambiente o con soporte de O₂ (especificar).",
  "Inaval. (sedado)": "No evaluable (sedado)",
  "Enchimento capilar (TEC)": "Llenado capilar",
  "TEC >2s = sinal de hipoperfusão.": "Un llenado capilar > 2 s es signo de hipoperfusión.",
  "≤2s (normal)": "≤ 2 s (normal)",
  "Normal (≤2s)": "Normal (≤ 2 s)",
  "Lento (2–3s)": "Lento (2–3 s)",
  "Prolongado (>3s)": "Prolongado (> 3 s)",
  "Diurese / Débito urinário": "Diuresis / gasto urinario",
  "Ex.: preservada, oligúria, < 0,5 mL/kg/h": "Ej.: conservada, oliguria, < 0,5 mL/kg/h",
  "Oligúria <0,5 mL/kg/h = disfunção renal por hipoperfusão.":
    "Oliguria < 0,5 mL/kg/h = disfunción renal por hipoperfusión.",
  "Preservada": "Conservada",
  "Reduzida": "Reducida",
  "Oligúria (<0,5 mL/kg/h)": "Oliguria (< 0,5 mL/kg/h)",
  "Anúria": "Anuria",

  // ── Exame físico ───────────────────────────────────────────────────────────
  "Ausculta cardíaca (AC)": "Auscultación cardíaca",
  "Ex.: RCR 2T, sem sopros": "Ej.: rítmico, 2 ruidos, sin soplos",
  "Ritmo, bulhas, sopros, galope.": "Ritmo, ruidos cardíacos, soplos y galope.",
  "RCR 2T": "Rítmico, 2 ruidos",
  "RCR 2T, sem sopros": "Rítmico, 2 ruidos, sin soplos",
  "Sopro": "Soplo",
  "Sopro sistólico": "Soplo sistólico",
  "Galope": "Galope",
  "Galope (B3/B4)": "Galope (R3/R4)",
  "Arritmia": "Arritmia",
  "Ausculta pulmonar (AP)": "Auscultación pulmonar",
  "Selecionar achados — múltipla escolha": "Seleccionar hallazgos — opción múltiple",
  "MV, ruídos adventícios, simetria e percussão.":
    "Murmullo vesicular, ruidos agregados, simetría y percusión.",
  "MV normal bilateral": "Murmullo vesicular normal bilateral",
  "MV presente bilateralmente, sem ruídos adventícios":
    "Murmullo vesicular presente en ambos campos, sin ruidos agregados",
};
