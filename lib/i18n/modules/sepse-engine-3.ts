/**
 * Módulo Sepse — dicionário PT → ES. Parte 3 de 3:
 * reavaliação em UTI, dispositivos, culturas, ajuste de ATB, vasopressor,
 * ventilação, sedação, isolamento na UTI, destino e etapas do roteiro.
 */
export const ES_SEPSE_ENGINE_3: Record<string, string> = {
  // ── Swab retal (primeiro atendimento) ──────────────────────────────────────
  "Swab retal para rastreio de MDR": "Hisopado rectal para el cribado de multirresistencia",
  "Status do swab retal": "Estado del hisopado rectal",
  "Indicado em: admissão UTI, transfer de outra instituição, risco MDR alto, uso prévio de carbapenêmico.":
    "Indicado en: ingreso a UCI, traslado desde otra institución, alto riesgo de multirresistencia o uso previo de carbapenémicos.",
  "Sim — coletado agora": "Sí — tomado ahora",
  "Swab retal coletado nesta admissão / avaliação":
    "Hisopado rectal tomado en este ingreso o evaluación",
  "Sim — coletado na admissão": "Sí — tomado al ingreso",
  "Swab retal coletado na admissão (protocolo PCIRAS)":
    "Hisopado rectal tomado al ingreso (protocolo PCIRAS)",
  "Pendente — solicitar": "Pendiente — solicitar",
  "Swab retal indicado — solicitar coleta": "Hisopado rectal indicado — solicitar la toma",
  "Não indicado": "No indicado",
  "Swab retal não indicado no momento (baixo risco MDR)":
    "Hisopado rectal no indicado por ahora (bajo riesgo de multirresistencia)",
  "Já realizado (negativo)": "Ya realizado (negativo)",
  "Swab retal previamente realizado — resultado negativo":
    "Hisopado rectal realizado previamente — resultado negativo",
  "Já realizado (positivo MDR)": "Ya realizado (positivo para multirresistencia)",
  "Swab retal positivo para MDR — precauções de contato vigentes":
    "Hisopado rectal positivo para multirresistencia — precauciones de contacto vigentes",

  // ── Destino (primeiro atendimento) ─────────────────────────────────────────
  "Destino recomendado do paciente": "Destino recomendado del paciente",
  "Selecionar destino baseado na gravidade clínica":
    "Seleccionar el destino según la gravedad clínica",
  "Gerado com base em SOFA, PAM, lactato e necessidade de suporte. Confirme ou ajuste.":
    "Generado a partir del SOFA, la PAM, el lactato y la necesidad de soporte. Confírmelo o ajústelo.",
  "UTI — imediato": "UCI — inmediato",
  "Internação imediata em UTI — alta morbimortalidade (choque / SOFA alto / ventilação)":
    "Ingreso inmediato en UCI — alta morbimortalidad (choque / SOFA alto / ventilación)",
  "UTI ou semi-UTI": "UCI o cuidados intermedios",
  "Internação em UTI ou unidade semi-intensiva — monitorização contínua necessária":
    "Ingreso en UCI o en cuidados intermedios — requiere monitorización continua",
  "Enfermaria com monitorização": "Sala de hospitalización con monitorización",
  "Internação em enfermaria com monitorização e reavaliação em 4–6h":
    "Ingreso en sala de hospitalización con monitorización y reevaluación en 4–6 h",
  "Observação 6–12h": "Observación 6–12 h",
  "Observação 6–12h na emergência — reavaliação antes de decisão de destino":
    "Observación 6–12 h en urgencias — reevaluación antes de decidir el destino",
  "Alta com ATB VO": "Alta con antibiótico oral",
  "Alta com antibioticoterapia oral + retorno em 48h + instrução ao paciente":
    "Alta con antibioticoterapia oral + control en 48 h + indicaciones al paciente",
  "Anotações / condutas livres": "Anotaciones / conductas libres",
  "Condutas adicionais ou observações não contempladas acima...":
    "Conductas adicionales u observaciones no contempladas arriba...",
  "Campo livre para registrar qualquer conduta ou nota complementar.":
    "Campo libre para registrar cualquier conducta o nota complementaria.",

  // ── Reavaliação em UTI ─────────────────────────────────────────────────────
  "Situação atual do paciente": "Situación actual del paciente",
  "Selecionar a situação que melhor descreve o caso":
    "Seleccionar la situación que mejor describe el caso",
  "⚠️ Este módulo UTI é para pacientes JÁ EM TRATAMENTO com piora clínica. Se o paciente está chegando agora → use o fluxo Primeiro Atendimento.":
    "⚠️ Este módulo de UCI es para pacientes YA EN TRATAMIENTO con empeoramiento clínico. Si el paciente acaba de llegar → use el flujo de Primera atención.",
  "⚠️ Novo na UTI — usar 1º Atend.": "⚠️ Nuevo en la UCI — usar Primera atención",
  "Novo na UTI — usar o fluxo Primeiro Atendimento para atendimento inicial":
    "Nuevo en la UCI — usar el flujo de Primera atención para la atención inicial",
  "Em tratamento — piora hemodin.": "En tratamiento — empeoramiento hemodinámico",
  "Já em tratamento — piora hemodinâmica (choque, ↑ vasopressor)":
    "Ya en tratamiento — empeoramiento hemodinámico (choque, ↑ vasopresor)",
  "Em tratamento — piora ventilatória": "En tratamiento — empeoramiento ventilatorio",
  "Já em tratamento — piora ventilatória (↑ FiO₂, ↑ PEEP, hipoxemia)":
    "Ya en tratamiento — empeoramiento ventilatorio (↑ FiO₂, ↑ PEEP, hipoxemia)",
  "Em tratamento — piora renal": "En tratamiento — empeoramiento renal",
  "Já em tratamento — piora renal (oligúria, ↑ creatinina)":
    "Ya en tratamiento — empeoramiento renal (oliguria, ↑ creatinina)",
  "Em tratamento — febre + piora lab.": "En tratamiento — fiebre + empeoramiento analítico",
  "Já em tratamento — febre nova ou piora laboratorial (SOFA ↑)":
    "Ya en tratamiento — fiebre nueva o empeoramiento analítico (SOFA ↑)",
  "Em tratamento — piora neuro.": "En tratamiento — empeoramiento neurológico",
  "Já em tratamento — piora neurológica (rebaixamento, agitação)":
    "Ya en tratamiento — empeoramiento neurológico (deterioro del sensorio, agitación)",
  "Em tratamento — piora multissist.": "En tratamiento — empeoramiento multisistémico",
  "Já em tratamento — deterioração multissistêmica":
    "Ya en tratamiento — deterioro multisistémico",
  "Pós-estabilização — reavaliação": "Tras la estabilización — reevaluación",
  "Pós-estabilização — reavaliação de resposta ao tratamento":
    "Tras la estabilización — reevaluación de la respuesta al tratamiento",

  // ── Tempo de UTI e tendência do SOFA ───────────────────────────────────────
  "Dias de internação na UTI": "Días de estancia en la UCI",
  "≥ 5 dias = risco elevado de MDR. ≥ 14 dias = alto risco MDR + Candida + MRSA.":
    "≥ 5 días = riesgo elevado de multirresistencia. ≥ 14 días = alto riesgo de multirresistencia + Candida + SARM.",
  "1–2 dias": "1–2 días",
  "3 dias": "3 días",
  "5 dias": "5 días",
  "7 dias": "7 días",
  "10 dias": "10 días",
  "14 dias": "14 días",
  "> 14 dias": "> 14 días",
  "Tendência do SOFA vs. 24–48h atrás": "Tendencia del SOFA respecto a hace 24–48 h",
  "Comparar SOFA atual com avaliação anterior":
    "Comparar el SOFA actual con la evaluación anterior",
  "↑ ≥ 2 pts em 24–48h = nova disfunção orgânica → mudança de conduta urgente.":
    "↑ ≥ 2 puntos en 24–48 h = nueva disfunción orgánica → cambio de conducta urgente.",
  "SOFA melhorando (↓)": "SOFA mejorando (↓)",
  "SOFA em queda — resposta clínica positiva": "SOFA en descenso — respuesta clínica positiva",
  "SOFA estável": "SOFA estable",
  "SOFA estável — sem melhora nem piora significativa":
    "SOFA estable — sin mejoría ni empeoramiento significativos",
  "SOFA ↑ 1–2 pts": "SOFA ↑ 1–2 puntos",
  "SOFA aumentou 1–2 pts — atenção, reavaliação necessária":
    "El SOFA aumentó 1–2 puntos — atención, se requiere reevaluación",
  "SOFA ↑ ≥ 2 pts (urgente)": "SOFA ↑ ≥ 2 puntos (urgente)",
  "SOFA aumentou ≥ 2 pts em 24h → revisar conduta urgente":
    "El SOFA aumentó ≥ 2 puntos en 24 h → revisar la conducta con urgencia",
  "SOFA piora rápida": "SOFA con empeoramiento rápido",
  "Piora rápida do SOFA — nova disfunção orgânica emergindo":
    "Empeoramiento rápido del SOFA — está apareciendo una nueva disfunción orgánica",

  // ── Complicação infecciosa ─────────────────────────────────────────────────
  "Complicação infecciosa suspeita": "Complicación infecciosa sospechada",
  "Identificar o foco responsável pela piora":
    "Identificar el foco responsable del empeoramiento",
  "Definir a complicação orienta a coleta de culturas, troca de dispositivos e o ajuste do ATB.":
    "Definir la complicación orienta la toma de cultivos, el recambio de dispositivos y el ajuste del antibiótico.",
  "PAV (pneumonia VM)": "NAV (neumonía asociada a ventilación)",
  "PAV — Pneumonia associada à ventilação mecânica":
    "NAV — neumonía asociada a la ventilación mecánica",
  "IVAS-CVC (bacteremia CVC)": "Bacteriemia asociada a CVC",
  "IVAS-CVC — Bacteremia relacionada a cateter venoso central":
    "Bacteriemia relacionada con el catéter venoso central",
  "ITURSC (ITU cateter)": "Infección urinaria asociada a sonda",
  "ITURSC — Infecção urinária relacionada a sonda vesical":
    "Infección urinaria relacionada con la sonda vesical",
  "Infecção abdominal": "Infección abdominal",
  "Infecção intra-abdominal / peritonite secundária":
    "Infección intraabdominal / peritonitis secundaria",
  "Fungemia / candidemia": "Fungemia / candidemia",
  "Fungemia / candidemia — indicar equinocandina":
    "Fungemia / candidemia — indicar una equinocandina",
  "Endocardite": "Endocarditis",
  "Endocardite bacteriana — ecocardiograma urgente":
    "Endocarditis bacteriana — ecocardiograma urgente",
  "Meningite / SNC": "Meningitis / SNC",
  "Meningite / infecção do SNC": "Meningitis / infección del SNC",
  "Infecção de pele e partes moles / escaras infectadas":
    "Infección de piel y partes blandas / úlceras por presión infectadas",
  "Causa não infecciosa": "Causa no infecciosa",
  "Causa não infecciosa (TEP, TRALI, febre por fármaco, DRESS)":
    "Causa no infecciosa (TEP, TRALI, fiebre por fármacos, DRESS)",
  "Foco indefinido": "Foco indefinido",
  "Foco indefinido — busca ativa em andamento": "Foco indefinido — búsqueda activa en curso",

  // ── Dispositivos invasivos ─────────────────────────────────────────────────
  "Dispositivos invasivos em uso": "Dispositivos invasivos en uso",
  "Selecionar dispositivos presentes + tempo estimado de uso":
    "Seleccionar los dispositivos presentes + el tiempo estimado de uso",
  "CVC > 7 dias e SVD > 5 dias = principais focos potenciais de IVAS e ITURSC. Avaliar troca.":
    "CVC > 7 días y sonda vesical > 5 días = principales focos potenciales de bacteriemia e infección urinaria asociadas a dispositivo. Valorar el recambio.",
  "CVC < 7 dias": "CVC < 7 días",
  "CVC ≥ 7 dias (↑ risco IVAS)": "CVC ≥ 7 días (↑ riesgo de bacteriemia asociada)",
  "CVC ≥ 7 dias — considerar troca / avaliar IVAS-CVC":
    "CVC ≥ 7 días — considerar el recambio / valorar bacteriemia asociada al catéter",
  "TOT (VM)": "Tubo orotraqueal (ventilación mecánica)",
  "TOT — ventilação mecânica invasiva": "Tubo orotraqueal — ventilación mecánica invasiva",
  "Traqueostomia": "Traqueostomía",
  "Traqueostomia em uso": "Traqueostomía en uso",
  "SVD < 5 dias": "Sonda vesical < 5 días",
  "SVD ≥ 5 dias (↑ risco ITURSC)":
    "Sonda vesical ≥ 5 días (↑ riesgo de infección urinaria asociada)",
  "SVD ≥ 5 dias — considerar troca / avaliar ITURSC":
    "Sonda vesical ≥ 5 días — considerar el recambio / valorar infección urinaria asociada",
  "Cateter arterial": "Catéter arterial",
  "Cateter arterial (PA invasiva)": "Catéter arterial (PA invasiva)",
  "Dreno / drenagem abdominal": "Drenaje / drenaje abdominal",
  "Dreno torácico ou drenagem abdominal": "Drenaje torácico o drenaje abdominal",
  "Cateter CRRT/HD": "Catéter de diálisis (CRRT/HD)",
  "Cateter de diálise (CRRT/HD)": "Catéter de diálisis (CRRT/HD)",
  "SNE/SNG": "Sonda nasoenteral/nasogástrica",
  "Sonda nasoenteral / nasogástrica": "Sonda nasoenteral / nasogástrica",

  // ── Culturas de reavaliação ────────────────────────────────────────────────
  "Novas culturas coletadas ANTES de mudar ATB?":
    "¿Se tomaron nuevos cultivos ANTES de cambiar el antibiótico?",
  "Culturas de reavaliação — coletar antes de qualquer mudança":
    "Cultivos de reevaluación — tomarlos antes de cualquier cambio",
  "Regra obrigatória: coletar culturas ANTES de escalonar ou trocar ATB.":
    "Regla obligatoria: tomar los cultivos ANTES de escalar o cambiar el antibiótico.",
  "Sim — hemoculturas (2 pares)": "Sí — hemocultivos (2 pares)",
  "Sim — 2 pares de hemoculturas colhidos antes de modificar ATB":
    "Sí — 2 pares de hemocultivos tomados antes de modificar el antibiótico",
  "Sim — BAL / aspirado traqueal": "Sí — lavado broncoalveolar / aspirado traqueal",
  "Sim — BAL ou aspirado traqueal colhido (suspeita PAV)":
    "Sí — lavado broncoalveolar o aspirado traqueal tomado (sospecha de NAV)",
  "Sim — urocultura": "Sí — urocultivo",
  "Sim — urocultura colhida com nova SVD (ITURSC)":
    "Sí — urocultivo tomado con sonda vesical nueva (infección urinaria asociada)",
  "Sim — cultura ponta de CVC": "Sí — cultivo de la punta del CVC",
  "Sim — ponta de CVC colhida após retirada (suspeita IVAS-CVC)":
    "Sí — punta del CVC tomada tras la retirada (sospecha de bacteriemia asociada)",
  "Sim — cultura de secreção / ferida": "Sí — cultivo de secreción / herida",
  "Sim — cultura de secreção ou sítio cirúrgico":
    "Sí — cultivo de secreción o del sitio quirúrgico",
  "Sim — múltiplos sítios": "Sí — de múltiples sitios",
  "Sim — culturas de múltiplos sítios colhidas":
    "Sí — cultivos de múltiples sitios tomados",
  "Aguardando resultado anterior": "Esperando el resultado anterior",
  "Culturas anteriores ainda pendentes — aguardar resultado":
    "Cultivos anteriores aún pendientes — esperar el resultado",
  "Não coletado — urgência clínica": "No tomado — urgencia clínica",
  "ATB modificado sem nova cultura — urgência clínica (registrar justificativa)":
    "Antibiótico modificado sin un nuevo cultivo — urgencia clínica (registrar la justificación)",

  // ── Resultado das culturas ─────────────────────────────────────────────────
  "Resultado de culturas disponível": "Resultado de los cultivos disponible",
  "Resultado ou status atual — orientará o ATB definitivo":
    "Resultado o estado actual — orientará el antibiótico definitivo",
  "Cultura positiva → direcionar ATB. Negativa após 72h com melhora → descalonar.":
    "Cultivo positivo → dirigir el antibiótico. Negativo tras 72 h con mejoría → desescalar.",
  "Aguardando resultado": "Esperando el resultado",
  "Culturas em processamento — aguardando resultado":
    "Cultivos en procesamiento — esperando el resultado",
  "Negativo 72h (descalonar)": "Negativo a las 72 h (desescalar)",
  "Hemoculturas negativas após 72h — considerar descalonamento se melhora clínica":
    "Hemocultivos negativos tras 72 h — considerar el desescalamiento si hay mejoría clínica",
  "S. aureus — MRSA": "S. aureus — SARM",
  "MRSA confirmado — ajustar vancomicina (AUC/MIC 400–600)":
    "SARM confirmado — ajustar la vancomicina (AUC/CIM 400–600)",
  "S. aureus — MSSA": "S. aureus — SASM",
  "MSSA confirmada — descalonar para oxacilina 2g IV 4/4h":
    "SASM confirmado — desescalar a oxacilina 2 g IV cada 4 h",
  "Gram − (aguardar antibiograma)": "Gramnegativo (esperar el antibiograma)",
  "Bacilo gram-negativo — aguardar antibiograma completo":
    "Bacilo gramnegativo — esperar el antibiograma completo",
  "Pseudomonas aeruginosa": "Pseudomonas aeruginosa",
  "Pseudomonas aeruginosa — ajustar conforme antibiograma":
    "Pseudomonas aeruginosa — ajustar según el antibiograma",
  "ESBL confirmada": "BLEE confirmada",
  "ESBL confirmada — manter ou iniciar carbapenêmico":
    "BLEE confirmada — mantener o iniciar un carbapenémico",
  "KPC / carbapenemase": "KPC / carbapenemasa",
  "KPC confirmada → ceftazidima-avibactam 2,5g IV 8/8h":
    "KPC confirmada → ceftazidima-avibactam 2,5 g IV cada 8 h",
  "Candida sp.": "Candida sp.",
  "Candidemia — iniciar micafungina 100mg IV/dia ou anidulafungina":
    "Candidemia — iniciar micafungina 100 mg IV/día o anidulafungina",
  "Acinetobacter baumannii MDR": "Acinetobacter baumannii multirresistente",
  "A. baumannii MDR → polimixina B ou ampicilina-sulbactam em doses altas":
    "A. baumannii multirresistente → polimixina B o ampicilina-sulbactam a dosis altas",
  "Aspirado traqueal positivo (PAV)": "Aspirado traqueal positivo (NAV)",
  "Aspirado traqueal com crescimento — direcionar para agente isolado":
    "Aspirado traqueal con crecimiento — dirigir el tratamiento al agente aislado",

  // ── ATB em uso e resposta ──────────────────────────────────────────────────
  "ATB em uso + dia de tratamento": "Antibiótico en uso + día de tratamiento",
  "Ex.: Meropeném 1g 8/8h D5 · Vancomicina D5 · Fluconazol D3":
    "Ej.: meropenem 1 g cada 8 h día 5 · vancomicina día 5 · fluconazol día 3",
  "Registrar cada ATB com dose, intervalo e dia de tratamento. Planejar reavaliação aos D3, D5 e D7.":
    "Registrar cada antibiótico con la dosis, el intervalo y el día de tratamiento. Planificar la reevaluación en los días 3, 5 y 7.",
  "Resposta clínica ao esquema atual": "Respuesta clínica al esquema actual",
  "Como o paciente respondeu ao ATB atual?":
    "¿Cómo respondió el paciente al antibiótico actual?",
  "Sem resposta após 48–72h = falha terapêutica → modificar. Piora = mudar imediatamente.":
    "Sin respuesta tras 48–72 h = fallo terapéutico → modificar. Empeoramiento = cambiar de inmediato.",
  "Boa resposta clínica": "Buena respuesta clínica",
  "Boa resposta — afebre, estabilidade hemodinâmica, melhora laboratorial":
    "Buena respuesta — afebril, estabilidad hemodinámica y mejoría analítica",
  "Resposta parcial / lenta": "Respuesta parcial / lenta",
  "Resposta parcial — melhora incompleta ou muito lenta":
    "Respuesta parcial — mejoría incompleta o muy lenta",
  "Sem resposta (48–72h)": "Sin respuesta (48–72 h)",
  "Sem resposta após 48–72h — considerar falha terapêutica":
    "Sin respuesta tras 48–72 h — considerar un fallo terapéutico",
  "Piora apesar do ATB": "Empeoramiento a pesar del antibiótico",
  "Piora clínica apesar do ATB atual → mudança urgente":
    "Empeoramiento clínico a pesar del antibiótico actual → cambio urgente",
  "ATB < 48h (cedo para avaliar)": "Antibiótico < 48 h (es pronto para evaluar)",
  "ATB iniciado há < 48h — aguardar janela terapêutica":
    "Antibiótico iniciado hace menos de 48 h — esperar la ventana terapéutica",

  // ── Decisão de ajuste do ATB ───────────────────────────────────────────────
  "Decisão de ajuste do ATB": "Decisión de ajuste del antibiótico",
  "Conduta definida para o esquema antibiótico":
    "Conducta definida para el esquema antibiótico",
  "Sistema sugere automaticamente baseado nas culturas e no ATB em uso.":
    "El sistema lo sugiere automáticamente según los cultivos y el antibiótico en uso.",
  "Manter — aguardar reavaliação": "Mantener — esperar la reevaluación",
  "Manter esquema atual — reavaliação em 24–48h":
    "Mantener el esquema actual — reevaluación en 24–48 h",
  "Descalonar (culturas negativas)": "Desescalar (cultivos negativos)",
  "Descalonar — culturas negativas e boa resposta após ≥ 72h":
    "Desescalar — cultivos negativos y buena respuesta tras ≥ 72 h",
  "Pip-tazo → Meropeném": "Pip-tazo → meropenem",
  "Escalonar: trocar piperacilina-tazobactam por meropeném 1g 8/8h":
    "Escalar: cambiar piperacilina-tazobactam por meropenem 1 g cada 8 h",
  "Meropeném → Ceftaz-avibactam": "Meropenem → ceftazidima-avibactam",
  "Escalonar: trocar meropeném por ceftazidima-avibactam 2,5g 8/8h (KPC)":
    "Escalar: cambiar meropenem por ceftazidima-avibactam 2,5 g cada 8 h (KPC)",
  "Adicionar MRSA (Vanco)": "Añadir cobertura para SARM (vancomicina)",
  "Adicionar cobertura MRSA — vancomicina 25–30 mg/kg ataque IV":
    "Añadir cobertura para SARM — vancomicina 25–30 mg/kg de carga IV",
  "Adicionar antifúngico": "Añadir antifúngico",
  "Adicionar equinocandina — micafungina 100mg/dia ou anidulafungina 200mg ataque":
    "Añadir una equinocandina — micafungina 100 mg/día o anidulafungina 200 mg de carga",
  "MSSA → Oxacilina": "SASM → oxacilina",
  "Descalonar para oxacilina 2g IV 4/4h (MSSA confirmada)":
    "Desescalar a oxacilina 2 g IV cada 4 h (SASM confirmado)",
  "Direcionar por antibiograma": "Dirigir según el antibiograma",
  "Direcionar para ATB conforme antibiograma disponível":
    "Dirigir el antibiótico según el antibiograma disponible",
  "Suspender — não infeccioso": "Suspender — no infeccioso",
  "Suspender ATB — diagnóstico não-infeccioso confirmado":
    "Suspender el antibiótico — diagnóstico no infeccioso confirmado",

  // ── Vasopressor em uso ─────────────────────────────────────────────────────
  "Vasopressor(es) em uso + dose atual": "Vasopresor(es) en uso + dosis actual",
  "Ex.: Noradrenalina 0,2 mcg/kg/min — em aumento":
    "Ej.: noradrenalina 0,2 mcg/kg/min — en aumento",
  "Sem vasopressor — hemodinâmica estável": "Sin vasopresor — hemodinamia estable",
  "Nora 0,05–0,1 mcg/kg/min": "Noradrenalina 0,05–0,1 mcg/kg/min",
  "Noradrenalina 0,05–0,1 mcg/kg/min (dose baixa)":
    "Noradrenalina 0,05–0,1 mcg/kg/min (dosis baja)",
  "Nora 0,1–0,25 mcg/kg/min": "Noradrenalina 0,1–0,25 mcg/kg/min",
  "Noradrenalina 0,1–0,25 mcg/kg/min (dose moderada)":
    "Noradrenalina 0,1–0,25 mcg/kg/min (dosis moderada)",
  "Nora 0,25–0,5 mcg/kg/min": "Noradrenalina 0,25–0,5 mcg/kg/min",
  "Noradrenalina 0,25–0,5 mcg/kg/min (dose alta)":
    "Noradrenalina 0,25–0,5 mcg/kg/min (dosis alta)",
  "Nora > 0,5 (refratário)": "Noradrenalina > 0,5 (refractario)",
  "Noradrenalina > 0,5 mcg/kg/min — choque refratário":
    "Noradrenalina > 0,5 mcg/kg/min — choque refractario",
  "+ Vasopressina 0,03 U/min": "+ Vasopresina 0,03 U/min",
  "Vasopressina 0,03 U/min (adjuvante — poupar noradrenalina)":
    "Vasopresina 0,03 U/min (adyuvante — ahorrador de noradrenalina)",
  "+ Dobutamina (disfunção VE)": "+ Dobutamina (disfunción del ventrículo izquierdo)",
  "Dobutamina 2,5–10 mcg/kg/min (disfunção miocárdica séptica)":
    "Dobutamina 2,5–10 mcg/kg/min (disfunción miocárdica séptica)",
  "+ Adrenalina (refratário)": "+ Adrenalina (refractario)",
  "Adrenalina 0,05–0,3 mcg/kg/min (choque refratário total)":
    "Adrenalina 0,05–0,3 mcg/kg/min (choque refractario total)",
  "Desmame em curso": "Destete en curso",
  "Desmame de vasopressor — PAM estável > 24h sem suporte":
    "Destete del vasopresor — PAM estable durante más de 24 h sin soporte",

  // ── Ventilação ─────────────────────────────────────────────────────────────
  "Modo ventilatório atual": "Modo ventilatorio actual",
  "Selecionar modo ventilatório": "Seleccionar el modo ventilatorio",
  "VM protetora: VC 6 mL/kg PI · Pplatô ≤ 30 cmH₂O · driving pressure ≤ 15 cmH₂O.":
    "Ventilación protectora: volumen corriente 6 mL/kg de peso ideal · presión meseta ≤ 30 cmH₂O · driving pressure ≤ 15 cmH₂O.",
  "Espontâneo s/ VM": "Espontáneo sin ventilación mecánica",
  "Ventilação espontânea sem suporte mecânico":
    "Ventilación espontánea sin soporte mecánico",
  "O₂ suplementar": "O₂ suplementario",
  "Ventilação espontânea com O₂ suplementar":
    "Ventilación espontánea con O₂ suplementario",
  "VNI (CPAP/BiPAP)": "VNI (CPAP/BiPAP)",
  "VNI — CPAP ou BiPAP": "VNI — CPAP o BiPAP",
  "VCV — volume controlado": "VCV — volumen controlado",
  "VCV — VC 6 mL/kg PI · FR 14–18 irpm · PEEP titulado":
    "VCV — volumen corriente 6 mL/kg de peso ideal · FR 14–18 rpm · PEEP titulada",
  "PCV — pressão controlada": "PCV — presión controlada",
  "PCV — Pinsp titulada · PEEP titulado": "PCV — presión inspiratoria titulada · PEEP titulada",
  "PSV — pressão suporte": "PSV — presión de soporte",
  "PSV — desmame ventilatório em andamento": "PSV — destete ventilatorio en curso",
  "APRV (SDRA grave)": "APRV (SDRA grave)",
  "APRV — SDRA moderada/grave (Phigh/Plow titulado)":
    "APRV — SDRA moderada/grave (Phigh/Plow tituladas)",
  "ECMO VV": "ECMO venovenosa",
  "ECMO veno-venoso — SDRA grave refratária":
    "ECMO venovenosa — SDRA grave refractaria",
  "FiO₂ atual no ventilador (%)": "FiO₂ actual en el ventilador (%)",
  "Inserir FiO₂ para cálculo automático da relação P/F. Alvo: menor FiO₂ para SpO₂ 92–96%.":
    "Introduzca la FiO₂ para el cálculo automático de la relación P/F. Objetivo: la menor FiO₂ posible para una SpO₂ de 92–96%.",
  "PEEP atual (cmH₂O)": "PEEP actual (cmH₂O)",
  "SDRA moderada: PEEP 10–14 · SDRA grave: PEEP ≥ 14–18 (conforme ARDSnet PEEP table).":
    "SDRA moderada: PEEP 10–14 · SDRA grave: PEEP ≥ 14–18 (según la tabla de PEEP de ARDSNet).",

  // ── Consciência e sedação ──────────────────────────────────────────────────
  "Estado de consciência / sedação": "Estado de consciencia / sedación",
  "Nível de consciência ou status de sedação":
    "Nivel de consciencia o estado de sedación",
  "Meta padrão UTI: RASS 0 a −2 (sedação leve). Despertar diário para avaliar necessidade.":
    "Meta estándar en la UCI: RASS 0 a −2 (sedación ligera). Despertar diario para evaluar la necesidad.",
  "Acordado e orientado": "Despierto y orientado",
  "Acordado e orientado — sem sedação": "Despierto y orientado — sin sedación",
  "Confuso / delirium": "Confuso / delirium",
  "Confuso ou delirium (encefalopatia séptica ou delirium de UTI)":
    "Confuso o con delirium (encefalopatía séptica o delirium de la UCI)",
  "Sedado — avaliar RASS": "Sedado — evaluar el RASS",
  "Sedado — avaliar RASS abaixo": "Sedado — evaluar el RASS abajo",
  "Sedado profundo / BNM": "Sedación profunda / bloqueo neuromuscular",
  "Sedado profundo ou em uso de bloqueador neuromuscular":
    "Sedación profunda o con bloqueante neuromuscular",
  "Agitado — investigar causa": "Agitado — investigar la causa",
  "Agitado — investigar dor, hipóxia, delirium, abstinência":
    "Agitado — investigar dolor, hipoxia, delirium o abstinencia",
  "Coma / sem resposta": "Coma / sin respuesta",
  "Coma — sem resposta a estímulos": "Coma — sin respuesta a los estímulos",
  "RASS — Richmond Agitation-Sedation Scale": "RASS — Richmond Agitation-Sedation Scale",
  "Selecionar nível RASS atual": "Seleccionar el nivel actual de RASS",
  "Meta UTI: RASS 0 a −2. RASS −3 a −5 = sedação profunda → avaliar despertar diário.":
    "Meta en la UCI: RASS 0 a −2. RASS −3 a −5 = sedación profunda → valorar el despertar diario.",
  "+4 — Combativo": "+4 — Combativo",
  "+4 — Combativo (risco para equipe)": "+4 — Combativo (riesgo para el equipo)",
  "+3 — Muito agitado": "+3 — Muy agitado",
  "+3 — Muito agitado (remove dispositivos)": "+3 — Muy agitado (se retira dispositivos)",
  "+2 — Agitado": "+2 — Agitado",
  "+2 — Agitado (luta com ventilador)": "+2 — Agitado (lucha con el ventilador)",
  "+1 — Inquieto": "+1 — Inquieto",
  "+1 — Inquieto, ansioso": "+1 — Inquieto, ansioso",
  "0 — Alerta e calmo": "0 — Alerta y tranquilo",
  "0 — Alerta e calmo ✓": "0 — Alerta y tranquilo ✓",
  "−1 — Sonolento": "−1 — Somnoliento",
  "−1 — Sonolento (abre olhos ao voz)": "−1 — Somnoliento (abre los ojos a la voz)",
  "−2 — Sed. leve ✓ meta": "−2 — Sedación ligera ✓ meta",
  "−2 — Sedação leve (meta de UTI)": "−2 — Sedación ligera (meta de la UCI)",
  "−3 — Sed. moderada": "−3 — Sedación moderada",
  "−3 — Sedação moderada (move ao voz)": "−3 — Sedación moderada (se mueve a la voz)",
  "−4 — Sed. profunda": "−4 — Sedación profunda",
  "−4 — Sedação profunda (move ao estímulo físico)":
    "−4 — Sedación profunda (se mueve al estímulo físico)",
  "−5 — Não responsivo": "−5 — Sin respuesta",
  "−5 — Não responsivo a nenhum estímulo": "−5 — Sin respuesta a ningún estímulo",
  "GCS pré-sedação / último registro sem sedação":
    "Glasgow previo a la sedación / último registro sin sedación",
  "GCS antes da sedação ou pré-IOT": "Glasgow antes de la sedación o de la intubación",
  "Para intubados: registrar GCS da avaliação mais recente sem sedação. Componente verbal = 1T (intubado).":
    "En pacientes intubados: registrar el Glasgow de la evaluación más reciente sin sedación. Componente verbal = 1T (intubado).",
  "15 — Normal": "15 — Normal",
  "GCS 15 — sem déficit neurológico": "Glasgow 15 — sin déficit neurológico",
  "13–14 — Rebaixamento leve": "13–14 — Deterioro leve",
  "GCS 13–14 — rebaixamento leve": "Glasgow 13–14 — deterioro leve",
  "9–12 — Moderado": "9–12 — Moderado",
  "GCS 9–12 — rebaixamento moderado": "Glasgow 9–12 — deterioro moderado",
  "≤ 8 — Grave": "≤ 8 — Grave",
  "GCS ≤ 8 — rebaixamento grave": "Glasgow ≤ 8 — deterioro grave",
  "Não avaliável — sedado": "No evaluable — sedado",
  "Não avaliável — sob sedação (registrar RASS acima)":
    "No evaluable — bajo sedación (registrar el RASS arriba)",
  "Não avaliável — BNM": "No evaluable — bloqueo neuromuscular",
  "Não avaliável — bloqueio neuromuscular ativo":
    "No evaluable — bloqueo neuromuscular activo",
  "Notas clínicas / decisões": "Notas clínicas / decisiones",
  "Ex.: limitação terapêutica discutida, comunicação com família, objetivo de cuidado...":
    "Ej.: adecuación del esfuerzo terapéutico discutida, comunicación con la familia, objetivo de cuidado...",
  "Registrar decisões de manejo, objetivos de cuidado e planejamento de alta.":
    "Registrar las decisiones de manejo, los objetivos de cuidado y la planificación del alta.",

  // ── Isolamento na UTI ──────────────────────────────────────────────────────
  "Tipo de isolamento implementado": "Tipo de aislamiento implementado",
  "Definir e documentar isolamento — protege equipe, outros pacientes e orienta CCIH.":
    "Definir y documentar el aislamiento — protege al equipo y a los demás pacientes, y orienta al comité de control de infecciones.",
  "Precauções padrão vigentes": "Precauciones estándar vigentes",
  "Contato — MDR confirmado": "Contacto — multirresistencia confirmada",
  "Isolamento de contato — MDR confirmado (avental + luvas + quarto individual)":
    "Aislamiento de contacto — multirresistencia confirmada (bata + guantes + habitación individual)",
  "Contato — MDR suspeito": "Contacto — multirresistencia sospechada",
  "Isolamento de contato preemptivo — aguardar resultado de swab/cultura":
    "Aislamiento de contacto preventivo — esperar el resultado del hisopado o cultivo",
  "Aéreo (TB/VAR/sarampo)": "Aéreo (tuberculosis/varicela/sarampión)",
  "Gotículas (Influenza/Meningo)": "Por gotas (influenza/meningococo)",
  "HSCT — HEPA + P+": "Trasplante de progenitores — HEPA + presión positiva",
  "Quarto HEPA + pressão positiva — HSCT/TMO (recomendação vigente por IDSA/CDC/ECIL)":
    "Habitación con filtro HEPA + presión positiva — trasplante de progenitores (recomendación vigente de IDSA/CDC/ECIL)",
  "Precauções padrão + quarto individual — imunossuprimido não-HSCT (isolamento reverso clássico descontinuado)":
    "Precauciones estándar + habitación individual — inmunodeprimido sin trasplante de progenitores (el aislamiento inverso clásico fue descontinuado)",
  "Notificado CCIH": "Notificado al comité de control de infecciones",
  "CCIH/SCIH notificada — isolamento em curso":
    "Comité de control de infecciones notificado — aislamiento en curso",

  // ── Swab retal (UTI) ───────────────────────────────────────────────────────
  "Swab retal — rastreio de colonização por MDR":
    "Hisopado rectal — cribado de colonización por multirresistentes",
  "Indicado na admissão UTI, transfer, uso prévio de carbapenêmico ou UTI ≥ 7 dias.":
    "Indicado al ingreso a la UCI, en traslados, con uso previo de carbapenémicos o con ≥ 7 días de UCI.",
  "Coletado agora": "Tomado ahora",
  "Swab retal coletado — aguardando resultado (KPC, ESBL, VRE)":
    "Hisopado rectal tomado — esperando el resultado (KPC, BLEE, enterococo resistente a vancomicina)",
  "Coletado na admissão": "Tomado al ingreso",
  "Swab retal coletado na admissão UTI (protocolo PCIRAS)":
    "Hisopado rectal tomado al ingreso a la UCI (protocolo PCIRAS)",
  "Indicado — solicitar": "Indicado — solicitar",
  "Swab retal indicado — solicitar coleta urgente":
    "Hisopado rectal indicado — solicitar la toma con urgencia",
  "Negativo (swab anterior)": "Negativo (hisopado anterior)",
  "Swab retal anteriormente negativo para MDR":
    "Hisopado rectal previamente negativo para multirresistentes",
  "Positivo — KPC": "Positivo — KPC",
  "Swab retal positivo para KPC — isolamento de contato obrigatório":
    "Hisopado rectal positivo para KPC — aislamiento de contacto obligatorio",
  "Positivo — ESBL": "Positivo — BLEE",
  "Swab retal positivo para ESBL — isolamento de contato":
    "Hisopado rectal positivo para BLEE — aislamiento de contacto",
  "Positivo — VRE": "Positivo — enterococo resistente a vancomicina",
  "Swab retal positivo para VRE — isolamento de contato + notificar CCIH":
    "Hisopado rectal positivo para enterococo resistente a vancomicina — aislamiento de contacto + notificar al comité de control de infecciones",
  "Swab retal não indicado — baixo risco MDR, sem fatores de risco":
    "Hisopado rectal no indicado — bajo riesgo de multirresistencia, sin factores de riesgo",

  // ── Destino na UTI ─────────────────────────────────────────────────────────
  "Selecionar destino com base na evolução clínica atual":
    "Seleccionar el destino según la evolución clínica actual",
  "Recomendação gerada pelo sistema com base em SOFA, tendência clínica e necessidade de suporte. Confirme ou ajuste conforme avaliação clínica.":
    "Recomendación generada por el sistema según el SOFA, la tendencia clínica y la necesidad de soporte. Confírmela o ajústela según la evaluación clínica.",
  "Manter UTI": "Mantener en UCI",
  "Alta UTI → semi-UTI": "Alta de UCI → cuidados intermedios",
  "Alta UTI → enfermaria": "Alta de UCI → sala de hospitalización",
  "Alta hospitalar programada": "Alta hospitalaria programada",
  "Alta hospitalar programada — critérios clínicos e laboratoriais atingidos, ATB oral possível":
    "Alta hospitalaria programada — criterios clínicos y analíticos alcanzados, es posible el antibiótico oral",
  "Limitação terapêutica / cuidados paliativos":
    "Adecuación del esfuerzo terapéutico / cuidados paliativos",
  "Limitação terapêutica discutida — cuidados focados em conforto, sem escalada de suporte":
    "Adecuación del esfuerzo terapéutico discutida — cuidados centrados en el confort, sin escalar el soporte",

  // ── Etapas do roteiro ──────────────────────────────────────────────────────
  "Roteiro de atendimento — Sepse": "Guion de atención — sepsis",
  "Preencha os dados conforme avalia o paciente. PAM, IMC e qSOFA são calculados automaticamente.":
    "Complete los datos a medida que evalúa al paciente. La PAM, el IMC y el qSOFA se calculan automáticamente.",
  "Roteiro de atendimento — Classificação": "Guion de atención — clasificación",
  "Dados clínicos e calculados para apoiar a decisão de gravidade.":
    "Datos clínicos y calculados para apoyar la decisión sobre la gravedad.",
  "Roteiro de atendimento — Bundle 1ª hora": "Guion de atención — paquete de la 1.ª hora",
  "Marcar cada item do bundle. Sugestão de ATB gerada automaticamente pelos dados acima.":
    "Marque cada ítem del paquete. La sugerencia de antibiótico se genera automáticamente con los datos de arriba.",
  "Roteiro de atendimento — Reavaliação": "Guion de atención — reevaluación",
  "Atualizar sinais vitais e exames para guiar decisão sobre volume e vasopressor.":
    "Actualizar los signos vitales y los exámenes para guiar la decisión sobre el volumen y el vasopresor.",
  "Roteiro de atendimento — Choque séptico": "Guion de atención — choque séptico",
  "Registrar vasopressor, condutas e escalada terapêutica quando necessário.":
    "Registrar el vasopresor, las conductas y la escalada terapéutica cuando sea necesario.",
  "PAM estimada": "PAM estimada",
  "Perfusão": "Perfusión",
  "Sugerir vasopressina": "Sugerir vasopresina",
  "Roteiro de atendimento — Controle de foco": "Guion de atención — control del foco",
  "Identificar o foco e registrar as medidas de controle (drenagem, cirurgia, remoção de cateter).":
    "Identificar el foco y registrar las medidas de control (drenaje, cirugía, retirada del catéter).",
  "Foco suspeito": "Foco sospechado",
  "Roteiro de atendimento — Monitorização": "Guion de atención — monitorización",
  "Atualizar os dados de resposta clínica e revisar o antimicrobiano.":
    "Actualizar los datos de respuesta clínica y revisar el antimicrobiano.",
  "Achados críticos": "Hallazgos críticos",
  "Pendências no bundle": "Pendientes del paquete",
  "field": "field",

  // ── Marcos e resumo ────────────────────────────────────────────────────────
  "Antimicrobianos": "Antimicrobianos",
  "Cristaloide": "Cristaloide",
  "Inotrópico": "Inotrópico",
  "Suspeita de sepse reconhecida": "Sospecha de sepsis reconocida",
  "Gravidade inicial definida": "Gravedad inicial definida",
  "Bundle da primeira hora ativado": "Paquete de la primera hora activado",
  "Perfusão reavaliada": "Perfusión reevaluada",
  "Choque séptico reconhecido": "Choque séptico reconocido",
  "Noradrenalina sugerida": "Noradrenalina sugerida",
  "Vasopressina sugerida": "Vasopresina sugerida",
  "Inotrópico considerado": "Inotrópico considerado",
  "PAM reavaliada": "PAM reevaluada",
  "Foco infeccioso marcado": "Foco infeccioso marcado",
  "Lembrete de antimicrobiano": "Recordatorio de antimicrobiano",
  "Destino definido": "Destino definido",
  "Plano clínico inicial registrado": "Plan clínico inicial registrado",
  "Paciente": "Paciente",
  "Tempo desde reconhecimento": "Tiempo desde el reconocimiento",
  "PAS/PAD": "PAS/PAD",
  "PAM calculada": "PAM calculada",
  "Lactato atual": "Lactato actual",
  "ClCr estimado": "Aclaramiento de creatinina estimado",
  "Contexto assistencial": "Contexto asistencial",
  "Diálise": "Diálisis",
  "Risco MDR": "Riesgo de multirresistencia",
  "Risco MRSA": "Riesgo de SARM",
  "Alergia beta-lactâmico": "Alergia a betalactámicos",
  "Fluidos": "Líquidos",
  "65 mmHg": "65 mmHg",
  "Foco / source control": "Foco / control del foco",
  "Cenário inicial": "Escenario inicial",
  "Bundle pendente": "Paquete pendiente",
  "Focos suspeitos": "Focos sospechados",
  "Focos abordados": "Focos abordados",
  "não substitui o SOFA": "no sustituye al SOFA",
  "⚠️ A SSC 2026 NÃO recomenda o qSOFA como ferramenta ÚNICA de triagem: NEWS, MEWS e mesmo os critérios de SIRS têm sensibilidade maior para identificar quem vai deteriorar. O que mudou foi o PAPEL do escore, não o ponto de corte — o limiar ≥ 2 continua sendo o de Seymour 2016. Um qSOFA 0 ou 1 NÃO afasta sepse e não autoriza parar a investigação; qSOFA ≥ 2 identifica risco alto e apressa a avaliação completa. O diagnóstico formal é SOFA ≥ 2 com infecção suspeita ou confirmada.": "⚠️ La SSC 2026 NO recomienda el qSOFA como herramienta ÚNICA de triaje: NEWS, MEWS e incluso los criterios de SIRS tienen mayor sensibilidad para identificar a quien va a deteriorarse. Lo que cambió fue el PAPEL del puntaje, no el punto de corte — el umbral ≥ 2 sigue siendo el de Seymour 2016. Un qSOFA 0 o 1 NO descarta sepsis y no autoriza detener la investigación; qSOFA ≥ 2 identifica riesgo alto y acelera la evaluación completa. El diagnóstico formal es SOFA ≥ 2 con infección sospechada o confirmada.",
  "⚠️ O critério de UTI NÃO é o escore. O CURB-65 foi validado para decidir ambulatório × internação, e é isso que ele indica aqui. A terapia intensiva se decide por choque com necessidade de vasopressor, por ventilação mecânica ou pelos critérios menores da ATS/IDSA — um CURB-65 de 4 ou 5 pode vir só de idade, confusão, ureia e frequência respiratória, sem nenhum deles. Abrir o módulo Sepse para a estratificação de gravidade e a decisão de destino.": "⚠️ El criterio de UCI NO es el puntaje. El CURB-65 fue validado para decidir ambulatorio × ingreso, y es eso lo que indica aquí. La terapia intensiva se decide por choque con necesidad de vasopresor, por ventilación mecánica o por los criterios menores de la ATS/IDSA — un CURB-65 de 4 o 5 puede venir solo de edad, confusión, urea y frecuencia respiratoria, sin ninguno de ellos. Abrir el módulo Sepsis para la estratificación de gravedad y la decisión de destino.",
  "Internação em enfermaria com monitorização e reavaliação em 4–6h da admissão": "Ingreso en sala con monitorización y reevaluación a las 4–6 h del ingreso",
  "Internação em enfermaria com reavaliação em 4–6h da admissão": "Ingreso en sala con reevaluación a las 4–6 h del ingreso",
  "Lesão miocárdica associada (não necessariamente SCA). Repetir em 3–6h da primeira dosagem se suspeita de SCA.": "Lesión miocárdica asociada (no necesariamente SCA). Repetir a las 3–6 h de la primera determinación si hay sospecha de SCA.",
  "Manter esquema atual — reavaliação em 24–48h do início do esquema": "Mantener el esquema actual — reevaluación a las 24–48 h del inicio del esquema",
};
