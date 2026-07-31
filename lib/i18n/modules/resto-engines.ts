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
  "Responda o que dá para observar agora, à beira do leito. Não precisa saber o que cada achado significa — o app conclui no fim. Na dúvida sobre um item, responda \"Não\": ele deixa de contar, e os demais continuam valendo.":
    "Responda lo que se puede observar ahora, a pie de cama. No necesita saber qué significa cada hallazgo — la app concluye al final. Ante la duda sobre un ítem, responda \"No\": deja de contar, y los demás siguen valiendo.",
  "Não sei dizer — me guie pelos sinais":
    "No sé decir — guíeme por los signos",
  "Pressão sistólica (o número de cima)":
    "Presión sistólica (el número de arriba)",
  "Está confuso, muito sonolento, desmaiou ou quase desmaiou agora?":
    "¿Está confuso, muy somnoliento, se desmayó o casi se desmaya ahora?",
  "A pele está pálida, fria ou suada?":
    "¿La piel está pálida, fría o sudorosa?",
  "Está com dor ou aperto no peito agora?":
    "¿Tiene dolor u opresión en el pecho ahora?",
  "Falta de ar que apareceu ou piorou agora?":
    "¿Falta de aire que apareció o empeoró ahora?",
  "Pelo que você respondeu: paciente INSTÁVEL":
    "Por lo que respondió: paciente INESTABLE",
  "Com a frequência baixa e pelo menos um destes sinais, trata-se como bradicardia instável.":
    "Con la frecuencia baja y al menos uno de estos signos, se trata como bradicardia inestable.",
  "O que você marcou entra na definição de instabilidade da diretriz: hipotensão, alteração aguda do estado mental, sinais de choque, dor torácica isquêmica ou insuficiência cardíaca aguda.":
    "Lo que marcó entra en la definición de inestabilidad de la guía: hipotensión, alteración aguda del estado mental, signos de shock, dolor torácico isquémico o insuficiencia cardíaca aguda.",
  "Basta UM desses achados junto da frequência baixa — não é preciso ter todos.":
    "Basta UNO de estos hallazgos junto con la frecuencia baja — no hace falta tenerlos todos.",
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
};
