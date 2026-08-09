/**
 * Últimos engines — dicionário PT → ES.
 * Cobre: AVC (avc-engine), drogas vasoativas, síndromes coronarianas,
 * antibiótico da sepse, ISR, calculadoras e resíduos das árvores.
 *
 * Identificadores internos (yes/present/absent/unknown, vanco, sem_lvo,
 * "típica", "masculino"…) são mapeados para si mesmos — traduzi-los quebraria
 * o roteamento e as comparações do motor.
 */
export const ES_RESTO_ENGINES: Record<string, string> = {
  // ══ AVC — chips e revisão ═════════════════════════════════════════════════
  "Em revisão": "En revisión",
  "NIHSS": "NIHSS",
  "Imagem": "Imagen",
  "Reperfusão IV": "Reperfusión IV",
  "Trombectomia": "Trombectomía",
  "Presente": "Presente",
  "Registrar ação corretiva, motivo ou pendência":
    "Registrar la acción correctiva, el motivo o el pendiente",
  "Ex.: mantido bloqueio / corrigido e liberado / depende neurologia":
    "Ej.: se mantiene el bloqueo / corregido y liberado / depende de neurología",
  "Nome / plantonista": "Nombre / médico de guardia",
  "Identificação do paciente": "Identificación del paciente",
  "Prontuário / leito": "Historia clínica / cama",

  // ── Datas e origem ─────────────────────────────────────────────────────────
  "Hoje": "Hoy",
  "Ontem": "Ayer",
  "Anteontem": "Anteayer",
  "Exato": "Exacto",
  "Estimado": "Estimado",
  "SAMU": "Servicio de emergencias",
  "Demanda espontânea": "Demanda espontánea",
  "Transferência": "Traslado",
  "Internado": "Ingresado",

  // ── Antecedentes ───────────────────────────────────────────────────────────
  "DAC": "Enfermedad coronaria",
  "Insuficiência cardíaca": "Insuficiencia cardíaca",
  "AVC prévio": "ACV previo",
  "Sem uso": "Sin uso",
  "AAS": "AAS",
  "Clopidogrel": "Clopidogrel",
  "Dupla antiagregação": "Doble antiagregación",
  "Varfarina": "Warfarina",
  "DOAC": "ACOD",
  "Heparina recente": "Heparina reciente",
  "Sem DRC conhecida": "Sin enfermedad renal crónica conocida",
  "DRC leve/moderada": "Enfermedad renal crónica leve/moderada",
  "DRC avançada": "Enfermedad renal crónica avanzada",
  "Em diálise": "En diálisis",
  "Creatinina pendente": "Creatinina pendiente",

  // ── Estabilização (textos de ajuda) ────────────────────────────────────────
  "Marque instabilidade respiratória, hemodinâmica ou rebaixamento que exija abordagem antes da reperfusão.":
    "Marque la inestabilidad respiratoria, hemodinámica o el deterioro del sensorio que exija abordarse antes de la reperfusión.",
  "Use este campo se o paciente não protege via aérea, tem rebaixamento importante ou risco de aspiração.":
    "Use este campo si el paciente no protege la vía aérea, tiene un deterioro importante del sensorio o riesgo de aspiración.",
  "Hipoxemia deve ser corrigida imediatamente; em AVC, alvo usual é SpO₂ ≥ 94%.":
    "La hipoxemia debe corregirse de inmediato; en el ACV, el objetivo habitual es una SpO₂ ≥ 94%.",
  "Hipotensão sugere outra causa/choque; pressão alta pode bloquear trombólise se acima da meta.":
    "La hipotensión sugiere otra causa o choque; una presión alta puede bloquear la trombólisis si supera la meta.",
  "Use junto com PAS para definir risco hemodinâmico e meta pressórica antes da reperfusão.":
    "Úsela junto con la PAS para definir el riesgo hemodinámico y la meta de presión antes de la reperfusión.",
  "Taqui ou bradiarritmias graves podem exigir tratamento antes de seguir o fluxo do AVC.":
    "Las taquiarritmias o bradiarritmias graves pueden requerir tratamiento antes de seguir el flujo del ACV.",
  "FR extrema aponta fadiga, broncoaspiração, insuficiência ventilatória ou crise convulsiva associada.":
    "Una FR extrema apunta a fatiga, broncoaspiración, insuficiencia ventilatoria o una crisis convulsiva asociada.",
  "Febre agrava lesão cerebral e deve ser corrigida quando presente.":
    "La fiebre agrava la lesión cerebral y debe corregirse cuando esté presente.",
  "Registre apenas as medidas feitas agora para estabilizar o caso antes de seguir.":
    "Registre solo las medidas realizadas ahora para estabilizar el caso antes de continuar.",
  "Cabeceira elevada": "Cabecera elevada",
  "Aspiração de vias aéreas": "Aspiración de la vía aérea",
  "Reposicionamento de via aérea": "Reposicionamiento de la vía aérea",
  "ECG realizado e revisado": "ECG realizado y revisado",
  "Acionada equipe avançada": "Equipo avanzado activado",

  // ── PA, glicemia, convulsão, acesso, monitorização ─────────────────────────
  "Documente conduta se a PA exigiu intervenção antes da decisão de trombólise.":
    "Documente la conducta si la PA exigió una intervención antes de decidir la trombólisis.",
  "Sem necessidade imediata": "Sin necesidad inmediata",
  "Repetir PA seriada": "Repetir la PA de forma seriada",
  "Labetalol": "Labetalol",
  "Nicardipina": "Nicardipino",
  "Meta pressórica definida": "Meta de presión definida",
  "Preencha apenas se glicemia atual exigiu correção antes da interpretação neurológica.":
    "Complete solo si la glucemia actual exigió corrección antes de la interpretación neurológica.",
  "Sem correção necessária": "Sin corrección necesaria",
  "Glicose EV": "Dextrosa IV",
  "Nova glicemia solicitada": "Nueva glucemia solicitada",
  "Use se houve crise, atividade pós-ictal ou suspeita de mimetizador com convulsão.":
    "Úselo si hubo una crisis, actividad posictal o sospecha de un imitador con convulsión.",
  "Sem convulsão no momento": "Sin convulsión por ahora",
  "Benzodiazepínico": "Benzodiacepina",
  "Antiepiléptico": "Antiepiléptico",
  "EEG / neurologia acionados": "EEG / neurología activados",
  "Deixe explícito se já há acesso periférico confiável para exames e medicações.":
    "Deje explícito si ya hay un acceso periférico fiable para los exámenes y la medicación.",
  "1 acesso periférico": "1 acceso periférico",
  "2 acessos periféricos": "2 accesos periféricos",
  "Acesso difícil": "Acceso difícil",
  "Ainda não obtido": "Aún no obtenido",
  "Marque o que já está em monitorização contínua durante a estabilização.":
    "Marque lo que ya está en monitorización continua durante la estabilización.",
  "Monitor cardíaco": "Monitor cardíaco",
  "PA seriada": "PA seriada",
  "Glicemia seriada": "Glucemia seriada",

  // ── Imagem ─────────────────────────────────────────────────────────────────
  "Sem sangramento": "Sin sangrado",
  "Hemorragia": "Hemorragia",
  "Inconclusivo": "No concluyente",
  "⚠️ Campo crítico. A trombólise só pode ser considerada após excluir hemorragia na TC sem contraste.":
    "⚠️ Campo crítico. La trombólisis solo puede considerarse tras descartar la hemorragia en la TC sin contraste.",
  "Apagamento de sulcos": "Borramiento de los surcos",
  "Hipodensidade insular": "Hipodensidad insular",
  "Perda da diferenciação córtico-subcortical":
    "Pérdida de la diferenciación corticosubcortical",
  "Obscurecimento do núcleo lentiforme": "Borramiento del núcleo lenticular",
  "Hipodensidade em território da ACM":
    "Hipodensidad en el territorio de la arteria cerebral media",
  "Sinal da ACM hiperdensa": "Signo de la arteria cerebral media hiperdensa",
  "Sem sinais precoces evidentes": "Sin signos precoces evidentes",
  "Marque os achados presentes. Se houver descrição fora da lista, complemente em Outros.":
    "Marque los hallazgos presentes. Si hay una descripción fuera de la lista, compleméntela en Otros.",
  "Opcional. Use apenas se houver suspeita de oclusão de grande vaso e necessidade de planejar trombectomia.":
    "Opcional. Úselo solo si se sospecha una oclusión de gran vaso y hay que planificar la trombectomía.",
  "Opcional. Não bloqueia a avaliação de trombólise IV se a TC sem contraste já excluiu hemorragia.":
    "Opcional. No bloquea la evaluación de la trombólisis IV si la TC sin contraste ya descartó la hemorragia.",
  "Oclusão de grande vaso": "Oclusión de gran vaso",
  "Sem oclusão de grande vaso": "Sin oclusión de gran vaso",
  "Não realizada": "No realizada",

  // ── Laboratório e decisão ──────────────────────────────────────────────────
  "Plaquetas < 100.000 aumentam o risco hemorrágico e podem bloquear trombólise; toque para usar presets ou informar outro valor.":
    "Unas plaquetas < 100.000 aumentan el riesgo hemorrágico y pueden bloquear la trombólisis; toque para usar los valores predefinidos o indicar otro valor.",
  "INR > 1,7 sugere anticoagulação/coagulopatia relevante para trombólise; toque para presets ou informe outro valor.":
    "Un INR > 1,7 sugiere anticoagulación o coagulopatía relevante para la trombólisis; toque para los valores predefinidos o indique otro valor.",
  "TTPa prolongado pode indicar efeito anticoagulante ou coagulopatia; toque para presets ou informe outro valor.":
    "Un TTPa prolongado puede indicar efecto anticoagulante o coagulopatía; toque para los valores predefinidos o indique otro valor.",
  "As doses e limites vêm da configuração clínica do módulo.":
    "Las dosis y los límites provienen de la configuración clínica del módulo.",
  "Trombólise IV": "Trombólisis IV",
  "Trombectomia / transferência": "Trombectomía / traslado",
  "AVC hemorrágico — sem reperfusão": "ACV hemorrágico — sin reperfusión",
  "Sem reperfusão": "Sin reperfusión",
  "Registrar a segunda conferência antes de conduta de alto risco.":
    "Registrar la segunda verificación antes de una conducta de alto riesgo.",
  "Conferido por dupla checagem": "Verificado por doble comprobación",
  "O sistema sugere a melhor formulação para o caso atual. Aceite a sugestão ou ajuste manualmente se precisar.":
    "El sistema sugiere la mejor formulación para el caso actual. Acepte la sugerencia o ajústela manualmente si lo necesita.",
  "O sistema sugere o destino mais indicado com base no atendimento. Ajuste manualmente apenas se o caso real exigir outro caminho.":
    "El sistema sugiere el destino más indicado según la atención. Ajústelo manualmente solo si el caso real exige otro camino.",
  "Síntese automática do racional para auditoria. Aceite a sugestão ou refine manualmente se precisar complementar.":
    "Síntesis automática del razonamiento para la auditoría. Acepte la sugerencia o refínela manualmente si necesita complementarla.",
  "🧠 AVC": "🧠 ACV",
  "Fluxo de AVC isquêmico e hemorrágico com verificação de segurança para reperfusão.":
    "Flujo del ACV isquémico y hemorrágico con verificación de seguridad para la reperfusión.",
  "LKW": "Última vez visto bien",
  "Chegada": "Llegada",
  "Diagnóstico sindrômico": "Diagnóstico sindrómico",
  "Trombólise": "Trombólisis",

  // ══ Drogas vasoativas — apresentações e diluições ═════════════════════════
  "Ampola 4 mL • 4 mg base por ampola": "Ampolla 4 mL • 4 mg base por ampolla",
  "16 mcg/mL • 1 amp + 246 mL → 250 mL final":
    "16 mcg/mL • 1 ampolla + 246 mL → 250 mL finales",
  "32 mcg/mL • 2 amp + 242 mL → 250 mL final":
    "32 mcg/mL • 2 ampollas + 242 mL → 250 mL finales",
  "64 mcg/mL • 4 amp + 234 mL → 250 mL final":
    "64 mcg/mL • 4 ampollas + 234 mL → 250 mL finales",
  "Ampola 1 mL • 1 mg por ampola": "Ampolla 1 mL • 1 mg por ampolla",
  "20 mcg/mL • 2 amp + 98 mL → 100 mL final":
    "20 mcg/mL • 2 ampollas + 98 mL → 100 mL finales",
  "40 mcg/mL • 4 amp + 96 mL → 100 mL final":
    "40 mcg/mL • 4 ampollas + 96 mL → 100 mL finales",
  "Ampola 20 mL • 250 mg por ampola": "Ampolla 20 mL • 250 mg por ampolla",
  "2000 mcg/mL • 1 amp + 105 mL → 125 mL final":
    "2000 mcg/mL • 1 ampolla + 105 mL → 125 mL finales",
  "4000 mcg/mL • 2 amp + 85 mL → 125 mL final":
    "4000 mcg/mL • 2 ampollas + 85 mL → 125 mL finales",
  "Ampola 5 mL • 200 mg por ampola": "Ampolla 5 mL • 200 mg por ampolla",
  "Ampola 10 mL • 400 mg por ampola": "Ampolla 10 mL • 400 mg por ampolla",
  "1600 mcg/mL • 1 amp + 240 mL → 250 mL final":
    "1600 mcg/mL • 1 ampolla + 240 mL → 250 mL finales",
  "3200 mcg/mL • 1 amp + 115 mL → 125 mL final":
    "3200 mcg/mL • 1 ampolla + 115 mL → 125 mL finales",
  "Ampola 1 mL • 20 U por ampola": "Ampolla 1 mL • 20 U por ampolla",
  "0,2 U/mL • 1 amp + 99 mL → 100 mL final":
    "0,2 U/mL • 1 ampolla + 99 mL → 100 mL finales",
  "0,4 U/mL • 1 amp + 49 mL → 50 mL final":
    "0,4 U/mL • 1 ampolla + 49 mL → 50 mL finales",
  "1 U/mL • 1 amp + 19 mL → 20 mL final": "1 U/mL • 1 ampolla + 19 mL → 20 mL finales",
  "Milrinona": "Milrinona",
  "Frasco-ampola 10 mL • 10 mg (1 mg/mL)": "Vial 10 mL • 10 mg (1 mg/mL)",
  "100 mcg/mL • 1 fr + 90 mL → 100 mL final": "100 mcg/mL • 1 vial + 90 mL → 100 mL finales",
  "200 mcg/mL • 2 fr + 80 mL → 100 mL final": "200 mcg/mL • 2 viales + 80 mL → 100 mL finales",
  "Levosimendan": "Levosimendán",
  "Frasco-ampola 5 mL • 12,5 mg (2,5 mg/mL)": "Vial 5 mL • 12,5 mg (2,5 mg/mL)",
  "50 mcg/mL • 1 fr + 245 mL → 250 mL final": "50 mcg/mL • 1 vial + 245 mL → 250 mL finales",
  "25 mcg/mL • 1 fr + 495 mL → 500 mL final": "25 mcg/mL • 1 vial + 495 mL → 500 mL finales",
  "Nitroprussiato": "Nitroprusiato",
  "Frasco-ampola 50 mg pó liofilizado": "Vial 50 mg de polvo liofilizado",
  "200 mcg/mL • 1 fr + 248 mL → 250 mL final": "200 mcg/mL • 1 vial + 248 mL → 250 mL finales",
  "100 mcg/mL • 1 fr + 498 mL → 500 mL final": "100 mcg/mL • 1 vial + 498 mL → 500 mL finales",
  "Nitroglicerina": "Nitroglicerina",
  "Ampola 10 mL • 50 mg (5 mg/mL)": "Ampolla 10 mL • 50 mg (5 mg/mL)",
  "Ampola 5 mL • 25 mg (5 mg/mL)": "Ampolla 5 mL • 25 mg (5 mg/mL)",
  "200 mcg/mL • 1 amp + 240 mL → 250 mL final":
    "200 mcg/mL • 1 ampolla + 240 mL → 250 mL finales",
  "100 mcg/mL • 1 amp + 245 mL → 250 mL final":
    "100 mcg/mL • 1 ampolla + 245 mL → 250 mL finales",
  "Fenilefrina": "Fenilefrina",
  "Ampola 1 mL • 10 mg (10 mg/mL)": "Ampolla 1 mL • 10 mg (10 mg/mL)",
  "100 mcg/mL • 1 amp + 99 mL → 100 mL final":
    "100 mcg/mL • 1 ampolla + 99 mL → 100 mL finales",
  "200 mcg/mL • 2 amp + 98 mL → 100 mL final":
    "200 mcg/mL • 2 ampollas + 98 mL → 100 mL finales",

  // ── Vasoativos: preparo e marcos ───────────────────────────────────────────
  "Usar SF": "Usar solución fisiológica",
  "Usar SG": "Usar dextrosa",
  "Registrar junto ao peso para manter os dados antropométricos completos.":
    "Registrarlo junto con el peso para mantener completos los datos antropométricos.",
  "Número de ampolas": "Número de ampollas",
  "Volume do diluente (mL)": "Volumen del diluyente (mL)",
  "Apresentação": "Presentación",
  "Concentração": "Concentración",
  "Volume final": "Volumen final",
  "Resultado principal": "Resultado principal",
  "Faixa usual": "Rango habitual",
  "Atenção clínica": "Atención clínica",
  "Módulo de drogas vasoativas iniciado": "Módulo de fármacos vasoactivos iniciado",
  "Droga selecionada": "Fármaco seleccionado",
  "Solução selecionada": "Solución seleccionada",
  "Modo de cálculo definido": "Modo de cálculo definido",
  "Apresentação farmacológica selecionada": "Presentación farmacológica seleccionada",
  "Diluente ajustado": "Diluyente ajustado",
  "Preparo confirmado": "Preparación confirmada",
  "Ajuste confirmado": "Ajuste confirmado",
  "Associação de vasopressina sugerida": "Asociación de vasopresina sugerida",
  "Módulo concluído": "Módulo concluido",
  "Atualização do módulo": "Actualización del módulo",
  "Droga": "Fármaco",
  "Solução": "Solución",
  "Modo": "Modo",
  "Resultado": "Resultado",
  "Status": "Estado",

  // ══ Síndromes coronarianas ════════════════════════════════════════════════
  "HEART": "HEART",
  "TIMI": "TIMI",
  "GRACE": "GRACE",
  "Killip-Kimball": "Killip-Kimball",
  "Registrar correção, motivo de bloqueio ou revisão":
    "Registrar la corrección, el motivo del bloqueo o la revisión",
  "Ex.: mantido bloqueio / corrigido / segue em revisão":
    "Ej.: se mantiene el bloqueo / corregido / sigue en revisión",
  "Típica": "Típica",
  "Provavelmente anginosa": "Probablemente anginosa",
  "Pouco sugestiva": "Poco sugestiva",
  "III": "III",
  "Alta sensibilidade": "Alta sensibilidad",
  "Convencional": "Convencional",
  "Sugestão do sistema; nunca substitui a decisão médica final.":
    "Sugerencia del sistema; nunca sustituye la decisión médica final.",
  "Opções configuradas: Tenecteplase e Alteplase, conforme protocolo local.":
    "Opciones configuradas: tenecteplasa y alteplasa, según el protocolo local.",
  "STEMI — angioplastia primária": "IAMCEST — angioplastia primaria",
  "STEMI — trombólise": "IAMCEST — trombólisis",
  "NSTEMI / UA — estratégia invasiva": "IAMSEST / angina inestable — estrategia invasiva",
  "Observação com protocolo de dor torácica":
    "Observación con protocolo de dolor torácico",
  "DAC crônica / angina estável": "Enfermedad coronaria crónica / angina estable",
  "Obrigatório antes de trombólise e decisões de alto risco.":
    "Obligatorio antes de la trombólisis y de las decisiones de alto riesgo.",
  "Categoria": "Categoría",
  "Troponina": "Troponina",
  "Estratégia": "Estrategia",
  "❤️ Síndromes coronarianas": "❤️ Síndromes coronarios",
  "Fluxo completo para STEMI, NSTEMI, angina instável e angina estável / DAC crônica.":
    "Flujo completo para IAMCEST, IAMSEST, angina inestable y angina estable / enfermedad coronaria crónica.",
  "Dor início": "Inicio del dolor",
  "1º ECG": "1.er ECG",
  "Killip": "Killip",
  "Reperfusão": "Reperfusión",

  // ══ Antibiótico da sepse — racional da cobertura ══════════════════════════
  "Cobertura para foco pulmonar comunitário grave":
    "Cobertura para un foco pulmonar comunitario grave",
  "Cobertura pulmonar hospitalar / risco de Pseudomonas":
    "Cobertura pulmonar hospitalaria / riesgo de Pseudomonas",
  "Cobertura urinária empírica inicial": "Cobertura urinaria empírica inicial",
  "Cobertura urinária complicada / alto risco de ESBL":
    "Cobertura urinaria complicada / alto riesgo de BLEE",
  "Cobertura abdominal com entéricos e anaeróbios":
    "Cobertura abdominal para enterobacterias y anaerobios",
  "Cobertura abdominal grave / hospitalar / MDR":
    "Cobertura abdominal grave / hospitalaria / multirresistente",
  "Cobertura inicial de pele e partes moles":
    "Cobertura inicial de piel y partes blandas",
  "Cobertura ampliada de pele/partes moles graves":
    "Cobertura ampliada para piel y partes blandas graves",
  "Cobertura para bacteremia relacionada a dispositivo":
    "Cobertura para bacteriemia relacionada con un dispositivo",
  "Cobertura empírica ampla para foco ainda indefinido":
    "Cobertura empírica amplia para un foco aún indefinido",

  // ══ ISR e calculadoras ════════════════════════════════════════════════════
  "Intubação em sequência rápida": "Intubación de secuencia rápida",
  "Referência + checklist": "Referencia + lista de verificación",
  "qSOFA": "qSOFA",
  "Sequential Organ Failure Assessment": "Sequential Organ Failure Assessment",
  "CURB-65": "CURB-65",
  "HEART Score": "HEART Score",
  "APACHE II": "APACHE II",
  "SAPS 3": "SAPS 3",

  // ══ Rótulos das telas de referência do ACLS ═══════════════════════════════
  "Referência de ritmos no ACLS": "Referencia de ritmos en el ACLS",
  "Referência farmacológica no ACLS": "Referencia farmacológica en el ACLS",
  "Referência — Bradicardia no ACLS": "Referencia — bradicardia en el ACLS",
  "Referência — Taquicardia no ACLS": "Referencia — taquicardia en el ACLS",
  "Referência — Causas Reversíveis (Hs e Ts)":
    "Referencia — causas reversibles (H y T)",
  "Referência — Cuidados Pós-PCR": "Referencia — cuidados pos-paro",

  // ══ Resíduos das árvores ══════════════════════════════════════════════════
  "desconhecido / ao acordar": "desconocido / al despertar",
  "intermitente / indefinido": "intermitente / indefinido",

  // ══ Identificadores internos — NÃO traduzir ═══════════════════════════════
  "absent": "absent",
  "present": "present",
  "unknown": "unknown",
  "yes": "yes",
  "today": "today",
  "yesterday": "yesterday",
  "day_before_yesterday": "day_before_yesterday",
  "exact": "exact",
  "estimated": "estimated",
  "sem_sangramento": "sem_sangramento",
  "hemorragia": "hemorragia",
  "inconclusivo": "inconclusivo",
  "oclusao_grande_vaso": "oclusao_grande_vaso",
  "sem_lvo": "sem_lvo",
  "nao_realizada": "nao_realizada",
  "típica": "típica",
  "provavelmente anginosa": "provavelmente anginosa",
  "pouco sugestiva": "pouco sugestiva",
  "alta_sensibilidade": "alta_sensibilidade",
  "convencional": "convencional",
  "masculino": "masculino",
  "feminino": "feminino",
  "vanco": "vanco",
  "piptazo": "piptazo",
  "meropenem": "meropenem",
  "Vamos verificar juntos":
    "Vamos a verificar juntos",
  "Não sei dizer — me guie pelos sinais":
    "No sé decir — guíeme por los signos",
  "Pressão sistólica (o número de cima)":
    "Presión sistólica (el número de arriba)",
  "Está confuso, muito sonolento, desmaiou ou quase desmaiou agora?":
    "¿Está confuso, muy somnoliento, se desmayó o casi se desmaya ahora?",
  "A pele está pálida, fria ou suada?":
    "¿La piel está pálida, fría o sudorosa?",
  "Falta de ar que apareceu ou piorou agora?":
    "¿Falta de aire que apareció o empeoró ahora?",
  "Pelo que você respondeu: paciente INSTÁVEL":
    "Por lo que respondió: paciente INESTABLE",
  "Se algum deles tiver outra explicação evidente e independente da frequência (por exemplo, dor torácica de causa traumática), reavalie com quem estiver conduzindo o caso.":
    "Si alguno tiene otra explicación evidente e independiente de la frecuencia (por ejemplo, dolor torácico de causa traumática), reevalúe con quien esté conduciendo el caso.",
  "Siga para o tratamento da bradicardia instável.":
    "Siga al tratamiento de la bradicardia inestable.",
  "Pelo que você respondeu: paciente ESTÁVEL":
    "Por lo que respondió: paciente ESTABLE",
  "Frequência baixa sem sinal de instabilidade — não há indicação de atropina ou marcapasso agora.":
    "Frecuencia baja sin signos de inestabilidad — no hay indicación de atropina ni marcapasos ahora.",
  "Nenhum dos sinais de instabilidade apareceu, e a pressão sistólica não está abaixo de 90.":
    "No apareció ninguno de los signos de inestabilidad, y la presión sistólica no está por debajo de 90.",
  "Isso NÃO significa que está tudo bem: significa que não há indicação de tratar a frequência neste momento.":
    "Esto NO significa que todo esté bien: significa que no hay indicación de tratar la frecuencia en este momento.",
  "Mantenha o monitor ligado e refaça esta verificação a qualquer piora — a bradicardia pode passar a causar instabilidade a qualquer momento.":
    "Mantenga el monitor encendido y repita esta verificación ante cualquier empeoramiento — la bradicardia puede pasar a causar inestabilidad en cualquier momento.",
  "Siga para a investigação da causa.":
    "Siga a la investigación de la causa.",
  "Achado isolado — ainda NÃO é critério de instabilidade":
    "Hallazgo aislado — todavía NO es criterio de inestabilidad",
  "Basta UM critério FECHADO junto da frequência baixa — não é preciso ter todos. Mas os dois compostos só fecham completos: choque = pele alterada COM má perfusão objetiva; IC aguda = dispneia COM congestão.":
    "Basta UN criterio CERRADO junto con la frecuencia baja — no hacen falta todos. Pero los dos compuestos solo cierran completos: choque = piel alterada CON mala perfusión objetiva; IC aguda = disnea CON congestión.",
  "Critérios da diretriz: hipotensão, alteração aguda do estado mental, sinais de choque, dor torácica isquêmica ou insuficiência cardíaca aguda.":
    "Criterios de la guía: hipotensión, alteración aguda del estado mental, signos de choque, dolor torácico isquémico o insuficiencia cardíaca aguda.",
  "Dor no peito em aperto, peso ou queimação — podendo irradiar para braço, ombro, pescoço ou mandíbula?":
    "¿Dolor en el pecho opresivo, como peso o ardor — que pueda irradiar a brazo, hombro, cuello o mandíbula?",
  "Falta de ar entra na definição de INSUFICIÊNCIA CARDÍACA AGUDA quando vem com congestão — estertores na ausculta, ortopneia ou queda da saturação. Sozinha, pode ser ansiedade, dor, anemia, doença pulmonar.":
    "La falta de aire entra en la definición de INSUFICIENCIA CARDÍACA AGUDA cuando viene con congestión — estertores en la auscultación, ortopnea o caída de la saturación. Sola, puede ser ansiedad, dolor, anemia o enfermedad pulmonar.",
  "Junto com isso: chiado/estalidos na ausculta dos pulmões, não consegue ficar deitado, ou a saturação caiu?":
    "Junto con eso: ¿sibilancias/crepitantes en la auscultación pulmonar, no tolera el decúbito, o cayó la saturación?",
  "Manter atropina e marcapasso transcutâneo prontos à beira do leito enquanto reavalia.":
    "Mantener atropina y marcapasos transcutáneo listos junto a la cama mientras reevalúa.",
  "Não consegui avaliar":
    "No pude evaluarlo",
  "O QUE FAZER AGORA: manter monitorização contínua, oxigênio se SpO₂ < 94%, acesso venoso, ECG de 12 derivações. Procurar a causa da bradicardia (medicamentos, isquemia, distúrbio eletrolítico, hipóxia, hipotermia).":
    "QUÉ HACER AHORA: mantener monitorización continua, oxígeno si SpO₂ < 94%, acceso venoso, ECG de 12 derivaciones. Buscar la causa de la bradicardia (medicamentos, isquemia, trastorno electrolítico, hipoxia, hipotermia).",
  "O que você marcou fecha um dos critérios de instabilidade da diretriz, junto da frequência baixa.":
    "Lo que usted marcó cierra uno de los criterios de inestabilidad de la guía, junto con la frecuencia baja.",
  "O que você marcou é um sinal real, mas sozinho não fecha nenhum dos critérios da diretriz. Não trate como bradicardia instável ainda.":
    "Lo que usted marcó es un signo real, pero por sí solo no cierra ninguno de los criterios de la guía. No lo trate todavía como bradicardia inestable.",
  "Pele fria, pálida ou suada entra na definição de CHOQUE quando vem com má perfusão objetiva — enchimento capilar lento, débito urinário muito reduzido, hipotensão ou alteração do estado mental. Sozinha, aparece também em dor, ansiedade, febre, hipoglicemia e reação vagal.":
    "La piel fría, pálida o sudorosa entra en la definición de CHOQUE cuando viene con mala perfusión objetiva — llenado capilar lento, diuresis muy reducida, hipotensión o alteración del estado mental. Sola, aparece también en dolor, ansiedad, fiebre, hipoglucemia y reacción vagal.",
  "REAVALIAR em poucos minutos, e a cada mudança. Se surgir hipotensão, alteração do estado mental, dor torácica isquêmica, ou o achado ganhar o par que falta, passa a ser bradicardia INSTÁVEL — volte e trate como tal.":
    "REEVALUAR en pocos minutos, y ante cada cambio. Si aparece hipotensión, alteración del estado mental, dolor torácico isquémico, o el hallazgo gana el par que falta, pasa a ser bradicardia INESTABLE — vuelva y trátela como tal.",
  "ABAIXO de 150: sintomas atribuíveis só à frequência são incomuns — EXCETO em quem já tem disfunção ventricular, valvopatia ou coronariopatia, em que frequências menores já descompensam. Não descarte o caso pelo número.":
    "POR DEBAJO de 150: los síntomas atribuibles solo a la frecuencia son poco comunes — EXCEPTO en quien ya tiene disfunción ventricular, valvulopatía o coronariopatía, en quienes frecuencias menores ya descompensan. No descarte el caso por el número.",
  "ANTES de tratar o número: a taquicardia é SINUSAL? Febre, dor, hipovolemia, anemia, ansiedade, hipóxia, sepse, abstinência, drogas. Taquicardia sinusal NÃO se cardioverte nem se freia às cegas — trata-se a causa; frear a resposta compensatória pode piorar o paciente.":
    "ANTES de tratar el número: ¿la taquicardia es SINUSAL? Fiebre, dolor, hipovolemia, anemia, ansiedad, hipoxia, sepsis, abstinencia, drogas. La taquicardia sinusal NO se cardiovierte ni se frena a ciegas — se trata la causa; frenar la respuesta compensatoria puede empeorar al paciente.",
  "Identificar a taquicardia no monitor e correlacionar com os sintomas. Taquiarritmia com repercussão hemodinâmica é TÍPICA a partir de ~150 bpm, mas isso é observação, não critério.":
    "Identificar la taquicardia en el monitor y correlacionarla con los síntomas. La taquiarritmia con repercusión hemodinámica es TÍPICA a partir de ~150 lpm, pero eso es una observación, no un criterio.",
  "Taquicardia = FC > 100 bpm. O que decide a conduta é a instabilidade atribuível à arritmia e o ritmo no ECG — não o número.":
    "Taquicardia = FC > 100 lpm. Lo que decide la conducta es la inestabilidad atribuible a la arritmia y el ritmo en el ECG — no el número.",
  "A FV pode ter sido desencadeada por um choque que saiu fora de sincronismo — seguir o algoritmo de PCR, não voltar para o de taquicardia.":
    "La FV puede haber sido desencadenada por una descarga que salió fuera de sincronismo — seguir el algoritmo de PCR, no volver al de taquicardia.",
  "A reavaliação após cada choque é o que decide o próximo passo — não avance sem ela.":
    "La reevaluación tras cada descarga es lo que decide el próximo paso — no avance sin ella.",
  "ANTES de cardioverter, confirme que o ritmo é uma TAQUIARRITMIA e não taquicardia SINUSAL. Na sinusal a frequência é resposta a outra coisa (febre, dor, hipovolemia, anemia, hipóxia, sepse) — cardioverter não resolve e tirar a compensação piora o paciente.":
    "ANTES de cardiovertir, confirme que el ritmo es una TAQUIARRITMIA y no taquicardia SINUSAL. En la sinusal la frecuencia es respuesta a otra cosa (fiebre, dolor, hipovolemia, anemia, hipoxia, sepsis) — cardiovertir no resuelve y quitar la compensación empeora al paciente.",
  "ANTIARRÍTMICO se persistir apesar dos choques — Amiodarona 150 mg IV em 10 min; repetir se houver recorrência; depois 1 mg/min por 6 h. Monitorar PA, FC, bradicardia e QT. Evitar em torsades por QT longo.":
    "ANTIARRÍTMICO si persiste pese a las descargas — Amiodarona 150 mg IV en 10 min; repetir si hay recurrencia; luego 1 mg/min por 6 h. Monitorizar PA, FC, bradicardia y QT. Evitar en torsades por QT largo.",
  "APROFUNDAR A SEDAÇÃO se o paciente estiver reagindo. Paciente semiacordado se move, e movimento atrapalha o sincronismo.":
    "PROFUNDIZAR LA SEDACIÓN si el paciente reacciona. Un paciente semidespierto se mueve, y el movimiento dificulta el sincronismo.",
  "Basta UM critério FECHADO — não é preciso ter todos. Mas os dois compostos só fecham completos: choque = pele alterada COM má perfusão objetiva; IC aguda = dispneia COM congestão.":
    "Basta UN criterio CERRADO — no hacen falta todos. Pero los dos compuestos solo cierran completos: choque = piel alterada CON mala perfusión objetiva; IC aguda = disnea CON congestión.",
  "CHAMAR ESPECIALISTA (cardiologia/eletrofisiologia) — refratariedade à cardioversão muda a conduta e pode exigir marcapasso, sedação profunda ou suporte avançado.":
    "LLAMAR AL ESPECIALISTA (cardiología/electrofisiología) — la refractariedad a la cardioversión cambia la conducta y puede exigir marcapasos, sedación profunda o soporte avanzado.",
  "CORRIGIR o que sustenta a arritmia: hipóxia, hipocalemia, hipomagnesemia, acidose, isquemia, drogas (cocaína, simpaticomiméticos), hipovolemia, hipotermia.":
    "CORREGIR lo que sostiene la arritmia: hipoxia, hipopotasemia, hipomagnesemia, acidosis, isquemia, drogas (cocaína, simpaticomiméticos), hipovolemia, hipotermia.",
  "Checar o aparelho e a técnica ANTES de escalar. A causa mais comum de choque sem efeito é técnica, não refratariedade real.":
    "Revisar el equipo y la técnica ANTES de escalar. La causa más común de una descarga sin efecto es técnica, no refractariedad real.",
  "Conferir contato: pás/pás adesivas bem aderidas, gel suficiente, pele seca, sem curativo ou adesivo de medicação embaixo. Considerar posição ântero-posterior — melhora a eficácia sobretudo em FA.":
    "Verificar el contacto: palas/parches bien adheridos, gel suficiente, piel seca, sin apósitos ni parches de medicación debajo. Considerar la posición anteroposterior — mejora la eficacia sobre todo en FA.",
  "Conferir se o aparelho está marcando cada QRS (setas de sincronismo sobre as ondas R). Sem marcação, o choque não sai — trocar a derivação ou reposicionar os eletrodos.":
    "Verificar que el equipo esté marcando cada QRS (marcas de sincronismo sobre las ondas R). Sin marcación la descarga no sale — cambiar la derivación o reposicionar los electrodos.",
  "Corrigir o que desencadeou: distúrbio eletrolítico (K, Mg), hipóxia, isquemia, drogas, hipovolemia, tireotoxicose.":
    "Corregir lo que lo desencadenó: trastorno electrolítico (K, Mg), hipoxia, isquemia, drogas, hipovolemia, tirotoxicosis.",
  "Depois do choque: o que aconteceu?":
    "Después de la descarga: ¿qué pasó?",
  "Estável não é sinônimo de benigno: significa que há tempo para o ECG de 12 derivações e para escolher o tratamento certo do ritmo.":
    "Estable no es sinónimo de benigno: significa que hay tiempo para el ECG de 12 derivaciones y para elegir el tratamiento correcto del ritmo.",
  "Iniciar RCP imediatamente e seguir o algoritmo de parada.":
    "Iniciar RCP de inmediato y seguir el algoritmo de paro.",
  "Iniciar compressões AGORA — não repetir cardioversão sincronizada em paciente sem pulso.":
    "Iniciar compresiones AHORA — no repetir cardioversión sincronizada en un paciente sin pulso.",
  "Manter material de cardioversão e sedação prontos à beira do leito enquanto reavalia.":
    "Mantener el material de cardioversión y la sedación listos junto a la cama mientras reevalúa.",
  "Nenhum critério de instabilidade fechado. A conduta passa a depender do RITMO — é o ECG que decide.":
    "Ningún criterio de inestabilidad cerrado. La conducta pasa a depender del RITMO — es el ECG el que decide.",
  "NÃO reverteu ou recorreu":
    "NO revirtió o recurrió",
  "Não reverteu — antes de repetir o choque":
    "No revirtió — antes de repetir la descarga",
  "Não reverteu: a taquiarritmia persiste, ou volta em seguida (recorrência precoce).":
    "No revirtió: la taquiarritmia persiste, o vuelve enseguida (recurrencia precoz).",
  "O QUE FAZER AGORA: monitorização contínua, oxigênio se SpO₂ < 94%, acesso venoso e ECG de 12 derivações — é o ECG que define a conduta do paciente estável.":
    "QUÉ HACER AHORA: monitorización continua, oxígeno si SpO₂ < 94%, acceso venoso y ECG de 12 derivaciones — es el ECG el que define la conducta del paciente estable.",
  "O que você marcou fecha um dos critérios de instabilidade da diretriz, com a taquicardia em curso.":
    "Lo que usted marcó cierra uno de los criterios de inestabilidad de la guía, con la taquicardia en curso.",
  "O que você marcou é um sinal real, mas sozinho não fecha nenhum dos critérios da diretriz. Não cardioverta ainda — siga a via do paciente estável, reavaliando.":
    "Lo que usted marcó es un signo real, pero por sí solo no cierra ninguno de los criterios de la guía. No cardiovierta todavía — siga la vía del paciente estable, reevaluando.",
  "Paciente perdeu o pulso — seguir o algoritmo de parada.":
    "El paciente perdió el pulso — seguir el algoritmo de paro.",
  "REAVALIAR em poucos minutos, e a cada mudança. Se surgir hipotensão, alteração do estado mental, dor torácica isquêmica, ou o achado ganhar o par que falta, passa a ser taquicardia INSTÁVEL — cardioversão sincronizada imediata.":
    "REEVALUAR en pocos minutos, y ante cada cambio. Si aparece hipotensión, alteración del estado mental, dolor torácico isquémico, o el hallazgo gana el par que falta, pasa a ser taquicardia INESTABLE — cardioversión sincronizada inmediata.",
  "RECORRÊNCIA é comum: se a taquiarritmia voltar, o ciclo recomeça (reavaliar → corrigir causa → escalar energia → chocar), e o antiarrítmico passa a ter papel para SUSTENTAR o ritmo revertido.":
    "La RECURRENCIA es común: si la taquiarritmia vuelve, el ciclo recomienza (reevaluar → corregir la causa → escalar energía → chocar), y el antiarrítmico pasa a tener el papel de SOSTENER el ritmo revertido.",
  "REPETIR a cardioversão com energia ESCALADA — subir para o próximo degrau disponível no aparelho, até a energia máxima.":
    "REPETIR la cardioversión con energía ESCALADA — subir al siguiente escalón disponible en el equipo, hasta la energía máxima.",
  "Reavaliar continuamente. Instabilidade pode surgir a qualquer momento — e aí a conduta muda para cardioversão sincronizada.":
    "Reevaluar continuamente. La inestabilidad puede aparecer en cualquier momento — y entonces la conducta cambia a cardioversión sincronizada.",
  "Reavaliar ritmo e pulso imediatamente após cada choque — e de novo a cada mudança clínica.":
    "Reevaluar ritmo y pulso inmediatamente después de cada descarga — y de nuevo ante cada cambio clínico.",
  "Reavalie ritmo e pulso IMEDIATAMENTE após o choque.":
    "Reevalúe ritmo y pulso INMEDIATAMENTE después de la descarga.",
  "Reverteu: ritmo organizado, com pulso, e a perfusão melhora.":
    "Revirtió: ritmo organizado, con pulso, y la perfusión mejora.",
  "Reverteu — ritmo e pulso recuperados":
    "Revirtió — ritmo y pulso recuperados",
  "Ritmo chocável sem pulso (FV/TV) → desfibrilação NÃO sincronizada em alta energia.":
    "Ritmo desfibrilable sin pulso (FV/TV) → desfibrilación NO sincronizada en alta energía.",
  "Se a instabilidade tiver causa evidente e independente da arritmia, trate a causa em paralelo e reavalie com quem estiver conduzindo o caso.":
    "Si la inestabilidad tiene una causa evidente e independiente de la arritmia, trate la causa en paralelo y reevalúe con quien esté conduciendo el caso.",
  "Seguir para a análise do QRS (estreito ou largo, regular ou irregular).":
    "Seguir al análisis del QRS (estrecho o ancho, regular o irregular).",
  "Sem pulso — isto é PCR":
    "Sin pulso — esto es PCR",
  "Sem pulso: qualquer ritmo sem pulso — inclusive FV desencadeada pelo choque — é PCR.":
    "Sin pulso: cualquier ritmo sin pulso — incluida una FV desencadenada por la descarga — es PCR.",
  "Siga para a cardioversão sincronizada.":
    "Siga a la cardioversión sincronizada.",
  "TV POLIMÓRFICA (torsades): choque NÃO sincronizado em alta energia + sulfato de magnésio 1–2 g IV. Não usar amiodarona se o QT for longo.":
    "TV POLIMÓRFICA (torsades): descarga NO sincronizada en alta energía + sulfato de magnesio 1–2 g IV. No usar amiodarona si el QT es largo.",
  "Voltar a reavaliar após cada choque. O ciclo se repete: reavaliar → corrigir → escalar → chocar.":
    "Volver a reevaluar tras cada descarga. El ciclo se repite: reevaluar → corregir → escalar → chocar.",
  "⚠️ REARMAR O SYNC. A maioria dos cardioversores SAI do modo sincronizado após cada choque. Se ninguém reapertar SYNC, o próximo disparo sai não sincronizado — e um choque não sincronizado sobre a onda T pode desencadear FV.":
    "⚠️ REARMAR EL SYNC. La mayoría de los cardioversores SALE del modo sincronizado tras cada descarga. Si nadie vuelve a pulsar SYNC, el siguiente disparo sale no sincronizado — y una descarga no sincronizada sobre la onda T puede desencadenar FV.",
  "Junto com isso: aperte a ponta do dedo por 5 segundos e solte — a cor demora mais de 3 segundos para voltar? (ou urina quase parou)":
    "Junto con eso: presione la yema del dedo por 5 segundos y suelte — ¿el color tarda más de 3 segundos en volver? (o la orina casi se detuvo)",
  "Iniciar compressões AGORA. Bradicardia extrema sem pulso é PCR — o ritmo lento no monitor não muda isso.":
    "Iniciar compresiones AHORA. La bradicardia extrema sin pulso es PCR — el ritmo lento en el monitor no cambia eso.",
  "Ritmo NÃO chocável (assistolia ou AESP): adrenalina 1 mg IV/IO o quanto antes, a cada 3–5 min. Não desfibrilar.":
    "Ritmo NO desfibrilable (asistolia o AESP): adrenalina 1 mg IV/IO cuanto antes, cada 3–5 min. No desfibrilar.",
  "O marcapasso transcutâneo NÃO substitui as compressões e não é tratamento de parada — se já estiver ligado, não interrompa a RCP por causa dele.":
    "El marcapasos transcutáneo NO sustituye las compresiones y no es tratamiento del paro — si ya está encendido, no interrumpa la RCP por él.",
  "Procurar as causas reversíveis que produzem bradicardia terminal: hipóxia, hipercalemia, intoxicação (betabloqueador, bloqueador de canal de cálcio, digital), hipotermia, IAM.":
    "Buscar las causas reversibles que producen bradicardia terminal: hipoxia, hiperpotasemia, intoxicación (betabloqueante, bloqueante de canales de calcio, digital), hipotermia, IAM.",
  "⚠️ PERGUNTE POR QUE a atropina não funcionou — há causas em que ela NÃO vai funcionar por dose nenhuma:":
    "⚠️ PREGUNTE POR QUÉ la atropina no funcionó — hay causas en las que NO va a funcionar con ninguna dosis:",
  "· Intoxicação por BETABLOQUEADOR ou BLOQUEADOR DE CANAL DE CÁLCIO → o tratamento é o antídoto (glucagon, cálcio, insulina em altas doses), não mais atropina. Ver o módulo de Intoxicações exógenas.":
    "· Intoxicación por BETABLOQUEANTE o BLOQUEANTE DE CANALES DE CALCIO → el tratamiento es el antídoto (glucagón, calcio, insulina en altas dosis), no más atropina. Ver el módulo de Intoxicaciones exógenas.",
  "· HIPERCALEMIA (bradicardia com QRS alargado, onda T apiculada) → cálcio IV imediato e as demais medidas. Ver o módulo de Correções eletrolíticas.":
    "· HIPERPOTASEMIA (bradicardia con QRS ancho, onda T picuda) → calcio IV inmediato y las demás medidas. Ver el módulo de Correcciones electrolíticas.",
  "· INTOXICAÇÃO DIGITÁLICA → considerar anticorpo antidigoxina (Fab); evitar cálcio.":
    "· INTOXICACIÓN DIGITÁLICA → considerar anticuerpo antidigoxina (Fab); evitar el calcio.",
  "· HIPÓXIA, HIPOTERMIA, IAM DE PAREDE INFERIOR, hipertensão intracraniana (reflexo de Cushing) — tratar a causa muda a bradicardia; o suporte sozinho não.":
    "· HIPOXIA, HIPOTERMIA, IAM DE PARED INFERIOR, hipertensión intracraneal (reflejo de Cushing) — tratar la causa cambia la bradicardia; el soporte solo no.",
  "· Mobitz II e BAV total são infranodais: a atropina não age ali. Marcapasso, não mais atropina.":
    "· Mobitz II y BAV completo son infranodales: la atropina no actúa allí. Marcapasos, no más atropina.",
  "O marcapasso não está capturando":
    "El marcapasos no está capturando",
  "Marcapasso sem captura — antes de declarar refratário":
    "Marcapasos sin captura — antes de declarar refractario",
  "Falha de captura quase sempre é técnica, e tem conserto imediato. Confira antes de escalar.":
    "La falla de captura casi siempre es técnica, y tiene arreglo inmediato. Verifique antes de escalar.",
  "SUBIR A CORRENTE (mA) progressivamente até obter captura. Começar baixo e subir é correto, mas parar cedo demais é a falha mais comum — vá até capturar ou até o limite do aparelho.":
    "SUBIR LA CORRIENTE (mA) progresivamente hasta obtener captura. Empezar bajo e ir subiendo es correcto, pero detenerse demasiado pronto es la falla más común — suba hasta capturar o hasta el límite del equipo.",
  "CAPTURA ELÉTRICA: cada espícula tem de ser seguida de um QRS ALARGADO com onda T. Espícula isolada, sem QRS atrás, NÃO é captura.":
    "CAPTURA ELÉCTRICA: cada espiga debe ir seguida de un QRS ANCHO con onda T. Una espiga aislada, sin QRS detrás, NO es captura.",
  "CAPTURA MECÂNICA: confirme PULSO no FEMORAL, não no carotídeo. A contração dos músculos do pescoço pela própria estimulação simula pulso carotídeo e engana — é o erro clássico.":
    "CAPTURA MECÁNICA: confirme el PULSO FEMORAL, no el carotídeo. La contracción de los músculos del cuello por la propia estimulación simula un pulso carotídeo y engaña — es el error clásico.",
  "Conferir os eletrodos: bem aderidos, pele seca e sem pelos, posição ântero-posterior se a anterolateral não capturar. Trocar as pás se estiverem ressecadas.":
    "Verificar los electrodos: bien adheridos, piel seca y sin vello, posición anteroposterior si la anterolateral no captura. Cambiar los parches si están resecos.",
  "SEDAÇÃO E ANALGESIA: o marcapasso transcutâneo dói. Paciente que se contorce desloca o eletrodo e perde captura — e sem analgesia o tratamento acaba sendo suspenso pelo desconforto.":
    "SEDACIÓN Y ANALGESIA: el marcapasos transcutáneo duele. Un paciente que se retuerce desplaza el electrodo y pierde la captura — y sin analgesia el tratamiento acaba suspendiéndose por el malestar.",
  "Corrigir o que impede a captura: hipóxia, acidose grave, hipercalemia, hipotermia. Miocárdio muito hipóxico ou acidótico não responde ao estímulo.":
    "Corregir lo que impide la captura: hipoxia, acidosis grave, hiperpotasemia, hipotermia. Un miocardio muy hipóxico o acidótico no responde al estímulo.",
  "Mantendo tudo isso e ainda sem captura, é refratariedade real: marcapasso transvenoso e cardiologia com urgência, sem soltar as drogas cronotrópicas.":
    "Manteniendo todo eso y aún sin captura, es refractariedad real: marcapasos transvenoso y cardiología con urgencia, sin soltar los fármacos cronotrópicos.",
  "0 corretas":
    "0 correctas",
  "0 corretos":
    "0 correctos",
  "1 correta":
    "1 correcta",
  "1 correto":
    "1 correcto",
  "2 corretas":
    "2 correctas",
  "2 corretos":
    "2 correctos",
  "1 membro":
    "1 miembro",
  "2 membros":
    "2 miembros",
  "2. Melhor olhar conjugado":
    "2. Mejor mirada conjugada",
  "6a. Perna esquerda":
    "6a. Pierna izquierda",
  "6b. Perna direita":
    "6b. Pierna derecha",
  "7. Ataxia":
    "7. Ataxia",
  "Cirurgia maior / trauma recente":
    "Cirugía mayor / trauma reciente",
  "Hemianopsia bilateral":
    "Hemianopsia bilateral",
  "Leve":
    "Leve",
  "Leve/moderada":
    "Leve/moderada",
  "Mudo":
    "Mudo",
  "Mínima":
    "Mínima",
  "Profunda":
    "Profunda",
  "Quadro":
    "Cuadro",
  "Queda parcial":
    "Caída parcial",
  "Sangramento ativo importante":
    "Sangrado activo importante",
  "Sonolento":
    "Somnoliento",
  "Tenecteplase":
    "Tenecteplasa",
  "0,02–0,04 mg/kg/h — RASS −1":
    "0,02–0,04 mg/kg/h — RASS −1",
  "0,2–0,4 mcg/kg/h":
    "0,2–0,4 mcg/kg/h",
  "0,4–0,7 mcg/kg/h":
    "0,4–0,7 mcg/kg/h",
  "0,7–1,0 mcg/kg/h":
    "0,7–1,0 mcg/kg/h",
  "50–100 mcg/h":
    "50–100 mcg/h",
  "> 0,20 mg/kg/h — preferir propofol/dexmedetomidina":
    "> 0,20 mg/kg/h — preferir propofol/dexmedetomidina",
  "Queimado, politrauma":
    "Quemado, politrauma",
  "Reavaliar necessidade":
    "Reevaluar la necesidad",
  "Reavaliar objetivo":
    "Reevaluar el objetivo",
  "SARA, status epilepticus":
    "SDRA, estado epiléptico",
  "Dor":
    "Dolor",
  "ECG/Troponina":
    "ECG/Troponina",
  "Risco":
    "Riesgo",
  "Sangramento ativo":
    "Sangrado activo",
  "Avaliação":
    "Evaluación",
  "Dados":
    "Datos",
  "Exames":
    "Exámenes",
  "Seguimento":
    "Seguimiento",
  "Inicio":
    "Inicio",
  "Temperatura seriada":
    "Temperatura seriada",
  "AIDS":
    "SIDA",
  "Admissão":
    "Ingreso",
  "PaO₂":
    "PaO₂",
  "Clínico":
    "Clínico",
  "Evolução":
    "Evolución",
  "Tratamento":
    "Tratamiento",
  "Laboratório":
    "Laboratorio",
  "Choque aplicado":
    "Descarga aplicada",
  "Choque indicado":
    "Descarga indicada",
  "PCR iniciada":
    "PCR iniciada",
  "Mais":
    "Más",
  "Protocolos":
    "Protocolos",
  "35–45 mmHg":
    "35–45 mmHg",
  "≥ 65 mmHg":
    "≥ 65 mmHg",
  "Perdeu o pulso":
    "Perdió el pulso",
  "Modal":
    "Modal",
  "Ventilador":
    "Ventilador",
  "Troponina pendente / incompleta":
    "Troponina pendiente / incompleta",
  "TIMI UA/NSTEMI":
    "TIMI AI/IAMSEST",
  "SpO₂ (%)":
    "SpO₂ (%)",
  "Responda o que dá para observar agora, à beira do leito. Não precisa saber o que cada achado significa — o app conclui no fim. Na dúvida sobre um item, responda \"Não\": ele deixa de contar, e os demais continuam valendo.":
    "Responda lo que se pueda observar ahora, junto a la cama. No hace falta saber qué significa cada hallazgo — la app concluye al final. Ante la duda sobre un ítem, responda \"No\": deja de contar, y los demás siguen valiendo.",
  "A barriga está DURA como tábua, sem relaxar, e o paciente se contrai ao encostar de leve?":
    "¿El abdomen está DURO como tabla, sin relajarse, y el paciente se contrae al tocar suavemente?",
  "A dor é MUITO maior do que o exame sugere — dor intensa com barriga relativamente mole ao apalpar?":
    "¿El dolor es MUCHO mayor de lo que sugiere el examen — dolor intenso con abdomen relativamente blando a la palpación?",
  "Apalpando o meio da barriga, acima do umbigo: existe uma massa que PULSA e se expande a cada batimento?":
    "Al palpar el centro del abdomen, por encima del ombligo: ¿hay una masa que PULSA y se expande con cada latido?",
  "Não há sinal de catástrofe abdominal, e o achado que você marcou sozinho não fecha critério de instabilidade. Siga a investigação, reavaliando.":
    "No hay signo de catástrofe abdominal, y el hallazgo que usted marcó por sí solo no cierra criterio de inestabilidad. Siga la investigación, reevaluando.",
  "Pele fria, pálida ou suada entra na definição de CHOQUE quando vem com má perfusão objetiva — enchimento capilar lento, débito urinário muito reduzido, hipotensão ou alteração do estado mental. Sozinha, aparece também em dor intensa, ansiedade, febre e reação vagal — e dor abdominal forte basta para produzi-la.":
    "La piel fría, pálida o sudorosa entra en la definición de CHOQUE cuando viene con mala perfusión objetiva — llenado capilar lento, diuresis muy reducida, hipotensión o alteración del estado mental. Sola, aparece también en dolor intenso, ansiedad, fiebre y reacción vagal — y un dolor abdominal fuerte basta para producirla.",
  "Falta de ar entra na definição de INSUFICIÊNCIA CARDÍACA AGUDA quando vem com congestão — estertores, ortopneia ou queda da saturação. Sozinha, no abdome agudo, costuma ser dor, distensão ou acidose.":
    "La falta de aire entra en la definición de INSUFICIENCIA CARDÍACA AGUDA cuando viene con congestión — estertores, ortopnea o caída de la saturación. Sola, en el abdomen agudo, suele ser dolor, distensión o acidosis.",
  "O QUE FAZER AGORA: dois acessos calibrosos, monitorização, analgesia (analgesia NÃO mascara o diagnóstico), exames e imagem conforme o padrão da dor. Manter jejum.":
    "QUÉ HACER AHORA: dos accesos gruesos, monitorización, analgesia (la analgesia NO enmascara el diagnóstico), exámenes e imagen según el patrón del dolor. Mantener ayuno.",
  "REAVALIAR o abdome em série, pelo mesmo examinador quando possível. Abdome agudo muda de hora em hora — o exame normal de agora não garante o de daqui a duas horas.":
    "REEVALUAR el abdomen en serie, por el mismo examinador cuando sea posible. El abdomen agudo cambia de hora en hora — el examen normal de ahora no garantiza el de dentro de dos horas.",
  "Se surgir hipotensão, alteração do estado mental, abdome em tábua, dor desproporcional ao exame ou massa pulsátil, volte: passa a ser catástrofe e a conduta é cirúrgica.":
    "Si aparece hipotensión, alteración del estado mental, abdomen en tabla, dolor desproporcionado al examen o masa pulsátil, vuelva: pasa a ser catástrofe y la conducta es quirúrgica.",
  "Achado isolado — ainda NÃO fecha choque":
    "Hallazgo aislado — todavía NO cierra choque",
  "O que você marcou é um sinal real, mas sozinho não confirma hipoperfusão. Não descarte: meça o que falta.":
    "Lo que usted marcó es un signo real, pero por sí solo no confirma hipoperfusión. No lo descarte: mida lo que falta.",
  "MEDIR O QUE DECIDE: lactato arterial e enchimento capilar cronometrado (aperte a polpa do dedo por 5 segundos e conte quanto tempo a cor leva para voltar; acima de 3 segundos é anormal). Diurese horária se houver sonda.":
    "MEDIR LO QUE DECIDE: lactato arterial y llenado capilar cronometrado (presione la yema del dedo por 5 segundos y cuente cuánto tarda en volver el color; por encima de 3 segundos es anormal). Diuresis horaria si hay sonda.",
  "Lactato acima de 2 mmol/L com pele alterada fecha hipoperfusão mesmo com pressão normal — é o choque compensado, e ele existe justamente porque a PA se mantém à custa de vasoconstrição.":
    "Un lactato por encima de 2 mmol/L con piel alterada cierra hipoperfusión incluso con presión normal — es el choque compensado, y existe justamente porque la PA se mantiene a costa de vasoconstricción.",
  "Pele fria e suada sozinha também aparece em dor, febre, ansiedade e reação vagal. Procure a explicação alternativa antes de descartar.":
    "La piel fría y sudorosa sola también aparece en dolor, fiebre, ansiedad y reacción vagal. Busque la explicación alternativa antes de descartar.",
  "REAVALIAR em minutos, não em horas. Choque compensado descompensa sem aviso, e a pressão é o último parâmetro a cair.":
    "REEVALUAR en minutos, no en horas. El choque compensado se descompensa sin aviso, y la presión es el último parámetro en caer.",
  "Se o lactato subir, a diurese cair, o enchimento capilar passar de 3 segundos ou a pressão ceder, volte: é choque, e o tratamento começa.":
    "Si el lactato sube, la diuresis cae, el llenado capilar supera los 3 segundos o la presión cede, vuelva: es choque, y el tratamiento empieza.",
  "Achado isolado — ainda NÃO é alto risco":
    "Hallazgo aislado — todavía NO es alto riesgo",
  "Não fecha critério de instabilidade, mas também não afasta TEP grave. Siga a investigação SEM soltar a vigilância.":
    "No cierra criterio de inestabilidad, pero tampoco descarta un TEP grave. Siga la investigación SIN soltar la vigilancia.",
  "O achado isolado não classifica como alto risco — a definição exige PAS < 90 mmHg, queda ≥ 40 mmHg por mais de 15 min, ou necessidade de vasopressor.":
    "El hallazgo aislado no clasifica como alto riesgo — la definición exige PAS < 90 mmHg, caída ≥ 40 mmHg por más de 15 min, o necesidad de vasopresor.",
  "SEGUIR o algoritmo diagnóstico: probabilidade pré-teste, D-dímero conforme a probabilidade, AngioTC.":
    "SEGUIR el algoritmo diagnóstico: probabilidad pretest, dímero D según la probabilidad, AngioTC.",
  "PROCURAR o risco intermediário-alto, que é o que descompensa: disfunção de VD na AngioTC ou no ecocardiograma, com troponina ou BNP elevados. Esse paciente fica em ambiente monitorizado, com trombólise de resgate pactuada.":
    "BUSCAR el riesgo intermedio-alto, que es el que se descompensa: disfunción del VD en la AngioTC o en el ecocardiograma, con troponina o BNP elevados. Ese paciente queda en ambiente monitorizado, con trombólisis de rescate pactada.",
  "Ecocardiograma à beira do leito é o exame que mais muda a conduta aqui: VD dilatado, septo retificado e veia cava sem colapso apontam sobrecarga aguda mesmo com pressão normal.":
    "El ecocardiograma junto a la cama es el examen que más cambia la conducta aquí: VD dilatado, septo rectificado y vena cava sin colapso apuntan a sobrecarga aguda incluso con presión normal.",
  "REAVALIAR de perto. A deterioração no TEP é abrupta: se aparecer hipotensão, alteração do estado mental ou necessidade de vasopressor, passa a ser alto risco e a trombólise entra em discussão imediata.":
    "REEVALUAR de cerca. El deterioro en el TEP es abrupto: si aparece hipotensión, alteración del estado mental o necesidad de vasopresor, pasa a ser alto riesgo y la trombólisis entra en discusión inmediata.",
  "A assimetria é real e merece explicação, mas não há o que autorize descomprimir o tórax agora.":
    "La asimetría es real y merece explicación, pero no hay nada que autorice descomprimir el tórax ahora.",
  "AGORA: oxigênio, oximetria e capnografia contínuas, radiografia de tórax e ultrassom à beira do leito (e-FAST). O ultrassom vê pneumotórax mais rápido e melhor que a radiografia.":
    "AHORA: oxígeno, oximetría y capnografía continuas, radiografía de tórax y ecografía junto a la cama (e-FAST). La ecografía ve el neumotórax más rápido y mejor que la radiografía.",
  "Achado isolado — no trauma, trate como choque até provar o contrário":
    "Hallazgo aislado — en el trauma, trátelo como choque hasta demostrar lo contrario",
  "As veias do pescoço estão salientes, cheias, mesmo com a cabeceira elevada?":
    "¿Las venas del cuello están salientes, llenas, incluso con la cabecera elevada?",
  "Batendo com os dedos nesse mesmo lado, o som é OCO (como tambor) ou SURDO (abafado)?":
    "Al percutir con los dedos en ese mismo lado, ¿el sonido es HUECO (como tambor) o MATE (apagado)?",
  "Causas frequentes de murmúrio assimétrico no trauma: pneumotórax simples, hemotórax pequeno, contusão pulmonar, atelectasia, e o tubo orotraqueal fundo demais (seletivo à direita) em quem já foi intubado — confira a marca do tubo nos dentes antes de qualquer outra coisa.":
    "Causas frecuentes de murmullo asimétrico en el trauma: neumotórax simple, hemotórax pequeño, contusión pulmonar, atelectasia, y el tubo orotraqueal demasiado profundo (selectivo derecho) en quien ya fue intubado — verifique la marca del tubo en los dientes antes que cualquier otra cosa.",
  "Choque hemorrágico CLASSE I e II cursa com pressão sistólica NORMAL. O que muda primeiro é a pele, o enchimento capilar, a frequência e a pressão de PULSO (diferença entre sistólica e diastólica) — não a sistólica.":
    "El choque hemorrágico CLASE I y II cursa con presión sistólica NORMAL. Lo que cambia primero es la piel, el llenado capilar, la frecuencia y la presión de PULSO (diferencia entre sistólica y diastólica) — no la sistólica.",
  "Dois acessos calibrosos (14–16 G) agora, amostras para tipagem e provas cruzadas, ácido tranexâmico se dentro de 3 h do trauma.":
    "Dos accesos gruesos (14–16 G) ahora, muestras para tipificación y pruebas cruzadas, ácido tranexámico si es dentro de las 3 h del trauma.",
  "Encostando o estetoscópio nos DOIS lados do peito: de um lado quase não entra ar?":
    "Apoyando el estetoscopio en AMBOS lados del pecho: ¿en un lado casi no entra aire?",
  "Está com pressão baixa, pele fria ou muito agitado/confuso?":
    "¿Tiene presión baja, piel fría o está muy agitado/confuso?",
  "Não, parecido nos dois":
    "No, parecido en ambos",
  "Oco — como tambor":
    "Hueco — como tambor",
  "Olhando o peito de lado enquanto respira: existe um pedaço que AFUNDA quando o resto sobe?":
    "Mirando el pecho de lado mientras respira: ¿hay un segmento que se HUNDE cuando el resto sube?",
  "Pele fria e pegajosa num traumatizado é hipoperfusão até prova em contrário: aqui não vale a lista de causas banais (dor, ansiedade, febre) que se aplica fora do trauma.":
    "Piel fría y pegajosa en un traumatizado es hipoperfusión hasta demostrar lo contrario: aquí no vale la lista de causas banales (dolor, ansiedad, fiebre) que se aplica fuera del trauma.",
  "Pressão normal não afasta hemorragia. O jovem traumatizado mantém a PA à custa de vasoconstrição e taquicardia — até não manter mais.":
    "La presión normal no descarta hemorragia. El joven traumatizado mantiene la PA a costa de vasoconstricción y taquicardia — hasta que ya no la mantiene.",
  "REAVALIAR a cada mudança e SEMPRE após intubar ou iniciar ventilação com pressão positiva: um pneumotórax simples vira hipertensivo sob pressão positiva, e isso acontece em minutos.":
    "REEVALUAR ante cada cambio y SIEMPRE tras intubar o iniciar ventilación con presión positiva: un neumotórax simple se vuelve hipertensivo bajo presión positiva, y eso ocurre en minutos.",
  "REAVALIAR a cada poucos minutos. A descompensação no trauma é tardia e abrupta: quando a sistólica cai, a perda já passou de 30% da volemia.":
    "REEVALUAR cada pocos minutos. La descompensación en el trauma es tardía y abrupta: cuando la sistólica cae, la pérdida ya superó el 30% de la volemia.",
  "SEM turgência jugular, sem choque e sem som oco, não há critério de pneumotórax HIPERTENSIVO — e descomprimir sem critério cria o pneumotórax que não existia.":
    "SIN ingurgitación yugular, sin choque y sin sonido hueco, no hay criterio de neumotórax HIPERTENSIVO — y descomprimir sin criterio crea el neumotórax que no existía.",
  "Se surgir hipotensão, turgência jugular ou piora súbita da ventilação, é hipertensivo: descompressão imediata, sem esperar imagem.":
    "Si aparece hipotensión, ingurgitación yugular o empeoramiento súbito de la ventilación, es hipertensivo: descompresión inmediata, sin esperar imagen.",
  "Sim, um lado é bem mais fraco":
    "Sí, un lado es bastante más débil",
  "Surdo — abafado":
    "Mate — apagado",
  "Um lado mais fraco, sem sinal de catástrofe — investigue sem parar o atendimento":
    "Un lado más débil, sin signo de catástrofe — investigue sin detener la atención",
  "Anafilaxia pode começar SEM lesão de pele em cerca de 10% dos casos — a ausência de urticária não afasta o diagnóstico.":
    "La anafilaxia puede comenzar SIN lesión cutánea en cerca del 10% de los casos — la ausencia de urticaria no descarta el diagnóstico.",
  "CIRCULAÇÃO: pressão caiu, tontura ao sentar ou levantar, palidez, pele fria, ou desmaiou?":
    "CIRCULACIÓN: ¿cayó la presión, mareo al sentarse o levantarse, palidez, piel fría, o se desmayó?",
  "Com o que foi observado não há critério de anafilaxia. Isso não descarta: o quadro pode estar começando.":
    "Con lo observado no hay criterio de anafilaxia. Eso no lo descarta: el cuadro puede estar comenzando.",
  "DIGESTIVO: cólica, vômito ou diarreia que começaram junto com o quadro?":
    "DIGESTIVO: ¿cólico, vómito o diarrea que comenzaron junto con el cuadro?",
  "Deixar adrenalina preparada e a dose calculada à beira do leito enquanto observa.":
    "Dejar la adrenalina preparada y la dosis calculada junto a la cama mientras observa.",
  "GRAVE AGORA: está sem responder, sem respirar normalmente, ou sem pulso?":
    "GRAVE AHORA: ¿no responde, no respira normalmente, o está sin pulso?",
  "Nenhum achado marcado — reavalie, não libere":
    "Ningún hallazgo marcado — reevalúe, no dé el alta",
  "PELE: placas vermelhas que coçam, inchaço de lábios, pálpebras ou língua, vermelhidão pelo corpo?":
    "PIEL: ¿placas rojas que pican, hinchazón de labios, párpados o lengua, enrojecimiento del cuerpo?",
  "REAVALIAR em poucos minutos, e a cada mudança. Ao surgir QUALQUER envolvimento de via aérea, respiração ou circulação, é Grau II ou mais — adrenalina IM imediata.":
    "REEVALUAR en pocos minutos, y ante cada cambio. Al aparecer CUALQUIER compromiso de vía aérea, respiración o circulación, es Grado II o más — adrenalina IM inmediata.",
  "RESPIRAÇÃO: falta de ar, chiado no peito, tosse persistente, ou saturação caindo?":
    "RESPIRACIÓN: ¿falta de aire, sibilancias en el pecho, tos persistente, o saturación cayendo?",
  "Se houve exposição a um desencadeante conhecido (alimento, fármaco, ferroada) nas últimas horas, mantenha em observação monitorizada mesmo sem achados.":
    "Si hubo exposición a un desencadenante conocido (alimento, fármaco, picadura) en las últimas horas, mantenga en observación monitorizada aun sin hallazgos.",
  "VOZ E GARGANTA: voz rouca ou abafada, sensação de garganta fechando, dificuldade para engolir, ruído agudo ao inspirar?":
    "VOZ Y GARGANTA: ¿voz ronca o apagada, sensación de garganta que se cierra, dificultad para tragar, ruido agudo al inspirar?",
  "Consegue falar uma frase inteira sem parar para respirar?":
    "¿Puede decir una frase entera sin parar para respirar?",
  "Está sonolento, confuso, ou ficou QUIETO e com respiração lenta depois de estar ofegante?":
    "¿Está somnoliento, confuso, o se quedó QUIETO y con respiración lenta después de estar jadeante?",
  "Está usando o pescoço e os ombros para respirar, com as costelas afundando, ou a asa do nariz abrindo?":
    "¿Está usando el cuello y los hombros para respirar, con las costillas hundiéndose, o aleteo nasal?",
  "Precisa ficar sentado e inclinado para a frente, sem conseguir deitar?":
    "¿Necesita estar sentado e inclinado hacia adelante, sin poder acostarse?",
  "Saturação de oxigênio (SpO₂)":
    "Saturación de oxígeno (SpO₂)",
  "Sim, fala normal":
    "Sí, habla normal",
  "Só frases curtas":
    "Solo frases cortas",
  "Só palavras soltas":
    "Solo palabras sueltas",
  "AGORA: oxigênio para alvo, monitorização contínua, acesso venoso, gasometria e radiografia. Sentar o paciente na posição em que ele respira melhor.":
    "AHORA: oxígeno para el objetivo, monitorización continua, acceso venoso, gasometría y radiografía. Sentar al paciente en la posición en que respira mejor.",
  "Esforço presente, mas ainda sem critério de gravidade":
    "Esfuerzo presente, pero todavía sin criterio de gravedad",
  "Há trabalho respiratório aumentado sem os marcadores de gravidade. Não é leve: é o paciente que pode virar nos próximos minutos.":
    "Hay trabajo respiratorio aumentado sin los marcadores de gravedad. No es leve: es el paciente que puede virar en los próximos minutos.",
  "NÃO se tranquilize pela saturação. O oxímetro erra em pele fria, esmalte, perfusão ruim e movimento — e o paciente compensa a hipoxemia aumentando o trabalho até não conseguir mais. Saturação normal com esforço alto é um sistema perto do limite.":
    "NO se tranquilice por la saturación. El oxímetro falla con piel fría, esmalte, mala perfusión y movimiento — y el paciente compensa la hipoxemia aumentando el trabajo hasta no poder más. Saturación normal con esfuerzo alto es un sistema cerca del límite.",
  "O QUE VOCÊ VIU CONTA: usar musculatura acessória, falar em frases curtas ou não conseguir deitar são sinais de esforço — significam que o paciente está compensando, não que está bem.":
    "LO QUE USTED VIO CUENTA: usar musculatura accesoria, hablar en frases cortas o no poder acostarse son signos de esfuerzo — significan que el paciente está compensando, no que está bien.",
  "REAVALIAR de perto — frequência respiratória, fala e esforço são mais sensíveis que a saturação para perceber a piora.":
    "REEVALUAR de cerca — frecuencia respiratoria, habla y esfuerzo son más sensibles que la saturación para percibir el empeoramiento.",
  "SINAL DE ALARME que muda tudo: se ficar sonolento, confuso, ou QUIETO com respiração lenta depois de estar ofegante, não melhorou — cansou. É pré-parada respiratória: preparar via aérea imediatamente.":
    "SEÑAL DE ALARMA que lo cambia todo: si queda somnoliento, confuso, o QUIETO con respiración lenta después de estar jadeante, no mejoró — se agotó. Es preparo respiratorio: preparar la vía aérea de inmediato.",
  "A indução tira o tônus simpático e a pressão positiva reduz o retorno venoso. Quem tem QUALQUER sinal de má perfusão antes da laringoscopia pode parar depois dela.":
    "La inducción quita el tono simpático y la presión positiva reduce el retorno venoso. Quien tiene CUALQUIER signo de mala perfusión antes de la laringoscopia puede parar después de ella.",
  "Achado isolado — otimize mesmo assim antes de induzir":
    "Hallazgo aislado — optimice igualmente antes de inducir",
  "Escolha a dose do indutor pensando na hemodinâmica: reduzir a dose do indutor e manter a do bloqueador é o padrão em quem está no limite.":
    "Elija la dosis del inductor pensando en la hemodinámica: reducir la dosis del inductor y mantener la del bloqueante es el estándar en quien está al límite.",
  "Não fecha critério de instabilidade, mas na intubação a margem é outra: quem está no limite colapsa com a indução.":
    "No cierra criterio de inestabilidad, pero en la intubación el margen es otro: quien está al límite colapsa con la inducción.",
  "OTIMIZE ANTES: volume conforme o contexto, vasopressor preparado (bolus de push-dose ou infusão já montada e conectada), pré-oxigenação caprichada.":
    "OPTIMICE ANTES: volumen según el contexto, vasopresor preparado (bolo push-dose o infusión ya montada y conectada), preoxigenación cuidadosa.",
  "Se houver tempo, reavalie após a otimização — muitos saem do limítrofe antes da laringoscopia.":
    "Si hay tiempo, reevalúe tras la optimización — muchos salen del límite antes de la laringoscopia.",
  "Índice de choque (FC ÷ PAS) acima de 0,9 prevê colapso peri-intubação mesmo com pressão ainda normal — some 100 de FC com 100 de PAS e o risco já está lá.":
    "El índice de choque (FC ÷ PAS) por encima de 0,9 predice colapso periintubación incluso con presión aún normal — sume 100 de FC con 100 de PAS y el riesgo ya está ahí.",
  "As veias do pescoço estão MUITO cheias, mas os pulmões estão LIMPOS na ausculta?":
    "¿Las venas del cuello están MUY llenas, pero los pulmones están LIMPIOS en la auscultación?",
  "Existe um sopro no coração que apareceu agora, ou que ninguém tinha descrito antes?":
    "¿Hay un soplo cardíaco que apareció ahora, o que nadie había descrito antes?",
  "Fria":
    "Fría",
  "Há sinal de água sobrando: estalidos na ausculta, veias do pescoço cheias, pernas inchadas ou não consegue deitar?":
    "¿Hay signo de sobrecarga de líquido: crepitantes en la auscultación, venas del cuello llenas, piernas hinchadas o no puede acostarse?",
  "Morna/quente":
    "Tibia/caliente",
  "Passe a mão do joelho para baixo: a perna está FRIA em relação à coxa e ao tronco?":
    "Pase la mano de la rodilla hacia abajo: ¿la pierna está FRÍA en relación con el muslo y el tronco?",
  "Estas são ALTERNATIVAS do mesmo degrau, não etapas em sequência — e podem ser usadas JUNTAS. O que decide é o que fica pronto primeiro e o tipo de bloqueio.":
    "Estas son ALTERNATIVAS del mismo escalón, no etapas en secuencia — y pueden usarse JUNTAS. Lo que decide es qué queda listo primero y el tipo de bloqueo.",
  "NA PRÁTICA, com equipe: enquanto alguém prepara o marcapasso (pás, aparelho, sedação), OUTRA pessoa já inicia a droga. Não espere o marcapasso ficar pronto para tratar, nem descarte o marcapasso porque a droga já está correndo.":
    "EN LA PRÁCTICA, con equipo: mientras alguien prepara el marcapasos (parches, equipo, sedación), OTRA persona ya inicia el fármaco. No espere a que el marcapasos esté listo para tratar, ni descarte el marcapasos porque el fármaco ya está corriendo.",
  "MARCAPASSO TRANSCUTÂNEO — prioridade em Mobitz II e BAV total: são bloqueios INFRANODAIS, onde a droga tem pouca ação e a atropina nenhuma. Aqui o marcapasso não é alternativa, é o caminho.":
    "MARCAPASOS TRANSCUTÁNEO — prioridad en Mobitz II y BAV completo: son bloqueos INFRANODALES, donde el fármaco tiene poca acción y la atropina ninguna. Aquí el marcapasos no es una alternativa, es el camino.",
  "Ajustar frequência 60–80 bpm; analgesia/sedação para conforto; confirmar captura elétrica (espícula + QRS) e mecânica (pulso femoral).":
    "Ajustar la frecuencia a 60–80 lpm; analgesia/sedación para el confort; confirmar captura eléctrica (espiga + QRS) y mecánica (pulso femoral).",
  "DROGA — comece por ela quando o marcapasso vai demorar, quando o bloqueio NÃO é de alto grau, ou como ponte enquanto ele é montado:":
    "FÁRMACO — empiece por él cuando el marcapasos vaya a demorar, cuando el bloqueo NO sea de alto grado, o como puente mientras se monta:",
  "· Dopamina 5–20 mcg/kg/min IV em infusão — titular pela FC e pela PA.":
    "· Dopamina 5–20 mcg/kg/min IV en infusión — titular por la FC y la PA.",
  "· Epinefrina 2–10 mcg/min IV em infusão — preferir quando há hipotensão associada.":
    "· Adrenalina 2–10 mcg/min IV en infusión — preferir cuando hay hipotensión asociada.",
  "Reavaliar após CADA medida. Se a droga não sustentar a frequência e a perfusão, o marcapasso passa a ser obrigatório — e o contrário também vale: sem captura, a droga continua.":
    "Reevaluar tras CADA medida. Si el fármaco no sostiene la frecuencia y la perfusión, el marcapasos pasa a ser obligatorio — y lo contrario también vale: sin captura, el fármaco continúa.",
  "Glucagon 1–2 mg EV/IM / considerar apenas se uso de betabloqueador e resposta inadequada à adrenalina":
    "Glucagón 1–2 mg EV/IM / considerar solo si usa betabloqueante y hay respuesta inadecuada a la adrenalina",
  "Glucagon 1–2 mg EV/IM / considerar se uso de betabloqueador e resposta inadequada à adrenalina":
    "Glucagón 1–2 mg EV/IM / considerar si usa betabloqueante y hay respuesta inadecuada a la adrenalina",
  "Interromper imediatamente a infusão de magnésio E dar cálcio AGORA: cloreto de cálcio 10% 10 mL (1 g) IV em 2–5 min — preferido na parada por agir mais rápido, mas irritante: pelo acesso mais central disponível. Só há acesso periférico: gluconato de cálcio 10% 15–30 mL IV, que é ~⅓ tão potente por grama e não causa necrose. (Dose maior que a da intoxicação COM pulso na pré-eclâmpsia, que é 1 g de gluconato — o contexto é outro.) A intoxicação por magnésio é causa reversível e frequente de PCR na gestante em tratamento de pré-eclâmpsia ou de trabalho de parto prematuro.":
    "Interrumpir de inmediato la infusión de magnesio Y dar calcio AHORA: cloruro de calcio 10% 10 mL (1 g) IV en 2–5 min — preferido en el paro por actuar más rápido, pero irritante: por el acceso más central disponible. Si solo hay acceso periférico: gluconato de calcio 10% 15–30 mL IV, que es ~⅓ tan potente por gramo y no causa necrosis. (Dosis mayor que la de la intoxicación CON pulso en la preeclampsia, que es 1 g de gluconato — el contexto es otro.) La intoxicación por magnesio es causa reversible y frecuente de PCR en la gestante en tratamiento de preeclampsia o de trabajo de parto prematuro.",
};
