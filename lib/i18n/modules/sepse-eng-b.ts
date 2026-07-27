/**
 * Sepse (engine) — dicionário PT → ES. Parte B de B.
 * Exames, isolamento, rastreio de colonização, aba UTI, falha terapêutica e
 * rótulos de estado.
 *
 * Nota: a chave "urineOutputMlh" do motor é um identificador de campo, não texto
 * de tela — fica de fora de propósito.
 */
export const ES_SEPSE_ENG_B: Record<string, string> = {
  // ── Rótulos curtos e estados ───────────────────────────────────────────────
  "Ainda não reavaliada": "Aún no reevaluada",
  "Apresentação clínica": "Presentación clínica",
  "Condutas e plano terapêutico": "Conductas y plan terapéutico",
  "Destino não definido": "Destino no definido",
  "Disfunção moderada": "Disfunción moderada",
  "Disfunção orgânica — sepse": "Disfunción orgánica — sepsis",
  "Estabilização": "Estabilización",
  "Estado mental / Consciência": "Estado mental / Consciencia",
  "Hora da avaliação / piora": "Hora de la evaluación / del empeoramiento",
  "Motivo da avaliação atual": "Motivo de la evaluación actual",
  "Não calculada": "No calculada",
  "Não calculado": "No calculado",
  "Não considerado": "No considerado",
  "Não definido": "No definido",
  "Não informada": "No informada",
  "Não informadas": "No informadas",
  "Não informado": "No informado",
  "Não reavaliada": "No reevaluada",
  "Não reconhecido": "No reconocido",
  "Não registrado": "No registrado",
  "Não sugerida": "No sugerida",
  "Reavaliação em curso": "Reevaluación en curso",
  "Reconhecido": "Reconocido",
  "Registro não disponível no estado atual.":
    "Registro no disponible en el estado actual.",
  "Selecionar opções ou descrever": "Seleccionar opciones o describir",
  "não calculado": "no calculado",
  "dessaturação": "desaturación",
  "frequência cardíaca": "frecuencia cardíaca",
  "frequência cardíaca elevada": "frecuencia cardíaca elevada",
  "frequência respiratória": "frecuencia respiratoria",
  "frequência respiratória elevada": "frecuencia respiratoria elevada",
  "imunossupressão": "inmunosupresión",
  "infecção suspeita — avaliar critérios de sepse":
    "infección sospechada — evaluar los criterios de sepsis",
  "internações frequentes": "hospitalizaciones frecuentes",
  "longa permanência": "estancia prolongada",
  "padrão respiratório alterado": "patrón respiratorio alterado",
  "precauções padrão": "precauciones estándar",
  "saturação baixa": "saturación baja",
  "sinais clínicos de hipoperfusão": "signos clínicos de hipoperfusión",
  "<div class=\"entry\"><div class=\"entry-details\">Nenhum evento clínico registrado.</div></div>":
    "<div class=\"entry\"><div class=\"entry-details\">Ningún evento clínico registrado.</div></div>",
  ">Duração</div><div class=": ">Duración</div><div class=",

  // ── Avaliação clínica e gravidade ──────────────────────────────────────────
  "Disfunção orgânica presente — sepse confirmada pelos critérios Sepsis-3.":
    "Disfunción orgánica presente — sepsis confirmada por los criterios Sepsis-3.",
  "Sem disfunção orgânica aparente pelos dados disponíveis.":
    "Sin disfunción orgánica aparente según los datos disponibles.",
  "SOFA baixo — monitorar evolução e repetir quando exames completados.":
    "SOFA bajo — monitorizar la evolución y repetirlo cuando se completen los exámenes.",
  "Evento ou achado que motivou esta avaliação clínica.":
    "Evento o hallazgo que motivó esta evaluación clínica.",
  "Horário da avaliação atual ou início identificado da piora clínica.":
    "Hora de la evaluación actual o inicio identificado del empeoramiento clínico.",
  "Quando iniciou a piora clínica atual ou o novo evento identificado.":
    "Cuándo comenzó el empeoramiento clínico actual o el nuevo evento identificado.",
  "Registrar dados básicos do paciente, foco infeccioso suspeito e sinais de disfunção orgânica.":
    "Registrar los datos básicos del paciente, el foco infeccioso sospechado y los signos de disfunción orgánica.",
  "Selecione cada sintoma separadamente — pode combinar quantos precisar. Complemento livre possível.":
    "Seleccione cada síntoma por separado — puede combinar los que necesite. Se admite un complemento libre.",
  "Foco SNC sugerido — cefaleia, rigidez nucal ou convulsão":
    "Foco en el sistema nervioso central sugerido — cefalea, rigidez de nuca o convulsión",
  "Foco abdominal sugerido — dor, vômito ou irritação peritoneal":
    "Foco abdominal sugerido — dolor, vómito o irritación peritoneal",
  "Foco pele/partes moles sugerido — sinais locais de infecção":
    "Foco en piel o partes blandas sugerido — signos locales de infección",
  "GCS <15 contribui para ponto qSOFA de alteração de consciência.":
    "Un Glasgow < 15 aporta el punto del qSOFA por alteración de la consciencia.",
  "Glasgow (GCS) — pré-sedação ou atual": "Glasgow — previo a la sedación o actual",
  "Para pacientes sedados/intubados: registrar GCS antes da sedação ou o valor antes da IOT. Use a escala RASS na aba UTI para sedados.":
    "En pacientes sedados o intubados: registrar el Glasgow previo a la sedación o el valor previo a la intubación. Use la escala RASS en la pestaña de UCI para los sedados.",
  "Grave (3-4+): prega cutânea, extremidades frias, taquicardia/hipotensão, oligúria/anúria, sonolento — déficit ≥10%.":
    "Grave (3-4+): signo del pliegue, extremidades frías, taquicardia o hipotensión, oliguria o anuria, somnolencia — déficit ≥ 10%.",
  "Moderado (2-3+): mucosas secas, turgor reduzido, olhos fundos, oligúria, déficit ~6-9%. ":
    "Moderado (2-3+): mucosas secas, turgencia reducida, ojos hundidos, oliguria, déficit ~6-9%. ",

  // ── Exames ─────────────────────────────────────────────────────────────────
  "Coagulação (TP, TTPA, Fibrinogênio)": "Coagulación (TP, TTPA, fibrinógeno)",
  "Coagulação — TP/TTPA/fibrinogênio (rastrear CIVD)":
    "Coagulación — TP/TTPA/fibrinógeno (cribado de coagulación intravascular diseminada)",
  "Cultura de secreção/lesão (swab ou aspirado)":
    "Cultivo de la secreción o la lesión (hisopado o aspirado)",
  "ECG (12 derivações)": "ECG (12 derivaciones)",
  "Ecocardiograma beira-leito (se disponível — avaliar função e volemia)":
    "Ecocardiograma a pie de cama (si está disponible — evaluar la función y la volemia)",
  "Ecocardiograma transtorácico (urgência)": "Ecocardiograma transtorácico (urgente)",
  "Função renal (Creatinina, Ureia)": "Función renal (creatinina, urea)",
  "Punção lombar (cultura + citologia + glicose + proteínas)":
    "Punción lumbar (cultivo + citología + glucosa + proteínas)",
  "RX Tórax (urgência)": "Radiografía de tórax (urgente)",
  "TC Crânio sem contraste (antes de punção se indicado)":
    "TC de cráneo sin contraste (antes de la punción si está indicada)",
  "TC Tórax (se RX inconclusivo ou deterioração)":
    "TC de tórax (si la radiografía no es concluyente o hay deterioro)",
  "Troponina / BNP (disfunção miocárdica associada à sepse)":
    "Troponina / BNP (disfunción miocárdica asociada a la sepsis)",
  "USG Abdominal (emergência)": "Ecografía abdominal (urgente)",
  "USG Rins e Vias Urinárias (descartar obstrução)":
    "Ecografía renal y de vías urinarias (descartar obstrucción)",
  "Solicitar conforme evolução clínica e necessidade de reavaliação.":
    "Solicitarlos según la evolución clínica y la necesidad de reevaluación.",

  // ── Rastreio de colonização ────────────────────────────────────────────────
  "Avaliar necessidade de swab retal após definição do contexto (internação hospitalar, uso de carbapenêmico ou MDR suspeito).":
    "Evaluar la necesidad de hisopado rectal tras definir el contexto (hospitalización, uso de carbapenémico o sospecha de multirresistencia).",
  "Considerar swab retal na admissão UTI (protocolo PCIRAS) ou se transfer de outra instituição":
    "Considerar el hisopado rectal al ingreso en la UCI (protocolo de control de infecciones) o si es un traslado desde otra institución",
  "Swab retal (rastreio de colonização por MDR bacteriano — frequente em candidemia)":
    "Hisopado rectal (cribado de colonización por bacterias multirresistentes — frecuente en la candidemia)",
  "Swab retal + nasal indicados na admissão — rastreio de MDR frequente em imunossuprimidos":
    "Hisopado rectal + nasal indicados al ingreso — cribado de multirresistencia frecuente en los inmunodeprimidos",
  "Swab retal + nasal indicados — rastreio de colonização por MDR na admissão e periodicamente":
    "Hisopado rectal + nasal indicados — cribado de colonización por multirresistentes al ingreso y de forma periódica",
  "Swab retal + swab nasal (rastreio de colonização e para mapa microbiológico da UTI)":
    "Hisopado rectal + hisopado nasal (cribado de colonización y para el mapa microbiológico de la UCI)",
  "Swab retal colher AGORA — rastreio ativo de KPC, ESBL e VRE (admissão hospitalar ou piora com risco MDR)":
    "Tomar el hisopado rectal AHORA — cribado activo de KPC, BLEE y enterococo resistente a vancomicina (ingreso hospitalario o empeoramiento con riesgo de multirresistencia)",
  "Swab retal não indicado aqui — considerar swab nasofaríngeo para N. meningitidis":
    "Hisopado rectal no indicado aquí — considerar el hisopado nasofaríngeo para N. meningitidis",
  "Swab retal não indicado no momento (sepse comunitária, baixo risco MDR). Reavaliar se houver uso de carbapenêmico ou internação prolongada.":
    "Hisopado rectal no indicado por ahora (sepsis comunitaria, bajo riesgo de multirresistencia). Reevaluarlo si hay uso de carbapenémico u hospitalización prolongada.",
  "Swab retal não indicado para TB — coletar escarro induzido ou BAL para BAAR e cultura de micobactéria":
    "Hisopado rectal no indicado para la tuberculosis — tomar esputo inducido o lavado broncoalveolar para baciloscopia y cultivo de micobacterias",
  "Swab retal não indicado para meningite — coletar swab nasofaríngeo para N. meningitidis se indicado.":
    "Hisopado rectal no indicado para la meningitis — tomar un hisopado nasofaríngeo para N. meningitidis si está indicado.",
  "Swab retal não indicado — risco MDR baixo para sepse pulmonar comunitária. Coletar swab nasofaríngeo para painel viral respiratório se disponível.":
    "Hisopado rectal no indicado — riesgo de multirresistencia bajo para la sepsis pulmonar comunitaria. Tomar un hisopado nasofaríngeo para el panel viral respiratorio si está disponible.",

  // ── Isolamento e precauções ────────────────────────────────────────────────
  "🦠 Precauções de Isolamento": "🦠 Precauciones de aislamiento",
  "🛡️ HSCT — Quarto HEPA + Pressão Positiva":
    "🛡️ Trasplante de progenitores hematopoyéticos — habitación con filtro HEPA + presión positiva",
  "🧪 Imunossuprimido — Precauções Padrão + Quarto Individual":
    "🧪 Inmunodeprimido — precauciones estándar + habitación individual",
  "Isolamento aéreo (airborne) — suspeita/confirmação de tuberculose pulmonar ativa":
    "Aislamiento aéreo — sospecha o confirmación de tuberculosis pulmonar activa",
  "Isolamento de contato — alto risco de MDR (transferência hospitalar, uso prévio de carbapenêmico ou UTI ≥ 7 dias)":
    "Aislamiento de contacto — riesgo alto de multirresistencia (traslado hospitalario, uso previo de carbapenémico o UCI ≥ 7 días)",
  "Isolamento de contato — infecção fúngica (risco de disseminação ambiental e em imunossuprimidos)":
    "Aislamiento de contacto — infección fúngica (riesgo de diseminación ambiental y en inmunodeprimidos)",
  "Isolamento de gotículas (droplet) — meningite/suspeita meningocócica · Manter por ≥ 24h após ATB":
    "Aislamiento por gotas — meningitis o sospecha de enfermedad meningocócica · Mantenerlo durante ≥ 24 h tras el antibiótico",
  "Precauções de gotículas (máscara cirúrgica a < 1m) até excluir vírus respiratório (influenza, COVID-19, VSR). Após confirmação de etiologia bacteriana, precauções padrão são suficientes.":
    "Precauciones por gotas (mascarilla quirúrgica a menos de 1 m) hasta descartar un virus respiratorio (influenza, COVID-19, virus respiratorio sincitial). Tras confirmar la etiología bacteriana, las precauciones estándar son suficientes.",
  "Precauções de gotículas — manter por ≥ 24h após início do ATB (meningocócica até excluída). Quarto individual.":
    "Precauciones por gotas — mantenerlas durante ≥ 24 h tras el inicio del antibiótico (enfermedad meningocócica hasta descartarla). Habitación individual.",
  "Precauções padrão + quarto individual — imunossuprimido (neoplasia/quimioterapia/transplante sólido/HIV). ⚠️ Isolamento protetor reverso clássico (avental+luvas+máscara para toda equipe) foi descontinuado — NÃO é recomendado por IDSA/CDC/SHEA 2024 para não-HSCT (sem evidência de benefício)":
    "Precauciones estándar + habitación individual — inmunodeprimido (neoplasia, quimioterapia, trasplante de órgano sólido, VIH). ⚠️ El aislamiento protector inverso clásico (bata + guantes + mascarilla para todo el equipo) se descontinuó — NO lo recomiendan IDSA/CDC/SHEA 2024 fuera del trasplante de progenitores hematopoyéticos (sin evidencia de beneficio)",
  "Precauções padrão enquanto foco infeccioso não identificado. Reavalie quando cultura/foco confirmado — escalone isolamento se MDR detectado.":
    "Precauciones estándar mientras el foco infeccioso no esté identificado. Reevalúe cuando se confirme el cultivo o el foco — escale el aislamiento si se detecta multirresistencia.",
  "Precauções padrão — UTI. Avaliar necessidade de isolamento de contato conforme evolução microbiológica":
    "Precauciones estándar — UCI. Evaluar la necesidad de aislamiento de contacto según la evolución microbiológica",
  "Precauções padrão — higiene das mãos + EPI conforme procedimento (avental e luvas para contato com fluidos). Risco MDR baixo para sepse comunitária com este foco.":
    "Precauciones estándar — higiene de manos + equipo de protección según el procedimiento (bata y guantes para el contacto con fluidos). Riesgo de multirresistencia bajo para la sepsis comunitaria con este foco.",
  "Quarto individual com pressão positiva e filtro HEPA — HSCT alogênico / transplante de medula (recomendação mantida por IDSA/CDC/ECIL 2024 para prevenção de aspergilose invasiva durante neutropenia)":
    "Habitación individual con presión positiva y filtro HEPA — trasplante alogénico de progenitores hematopoyéticos o de médula ósea (recomendación mantenida por IDSA/CDC/ECIL 2024 para la prevención de la aspergilosis invasiva durante la neutropenia)",
  "   Base: múltiplos ECRs e revisão Cochrane não demonstraram benefício em não-HSCT":
    "   Base: múltiples ensayos clínicos aleatorizados y una revisión Cochrane no demostraron beneficio fuera del trasplante de progenitores hematopoyéticos",
  "   Referência: IDSA / CDC / SHEA 2024 — não recomendam isolamento protetor para":
    "   Referencia: IDSA / CDC / SHEA 2024 — no recomiendan el aislamiento protector para",
  "⚠️ Avental/luvas/máscara para TODOS NÃO têm evidência adicional em HSCT":
    "⚠️ La bata, los guantes y la mascarilla para TODOS NO tienen evidencia adicional en el trasplante de progenitores hematopoyéticos",
  "→ Frutas/plantas NÃO permitidas (risco de Aspergillus/fungos)":
    "→ Frutas y plantas NO permitidas (riesgo de Aspergillus y hongos)",
  "→ Higiene das mãos (SEMPRE): antes e após contato":
    "→ Higiene de manos (SIEMPRE): antes y después del contacto",
  "→ Manter por ≥ 24h após início de ATB eficaz (meningococo)":
    "→ Mantenerlo durante ≥ 24 h tras el inicio de un antibiótico eficaz (meningococo)",
  "→ Notificar CCIH/SCIH da instituição":
    "→ Notificar al comité de control de infecciones de la institución",
  "→ Precauções padrão para equipe (higiene das mãos rigorosa)":
    "→ Precauciones estándar para el equipo (higiene de manos rigurosa)",
  "→ Precauções padrão: higiene das mãos, EPI conforme procedimento":
    "→ Precauciones estándar: higiene de manos y equipo de protección según el procedimiento",
  "→ Quarto individual (quando disponível)": "→ Habitación individual (cuando esté disponible)",
  "→ Quarto individual com pressão POSITIVA + filtro HEPA":
    "→ Habitación individual con presión POSITIVA + filtro HEPA",
  "→ Quarto individual com pressão negativa (se disponível)":
    "→ Habitación individual con presión negativa (si está disponible)",
  "→ Quarto individual ou coorte com pacientes semelhantes":
    "→ Habitación individual o cohorte con pacientes similares",
  "→ Restrição de visitantes com infecção respiratória ativa":
    "→ Restricción de visitantes con infección respiratoria activa",
  "→ Sinalização clara na porta do quarto":
    "→ Señalización clara en la puerta de la habitación",
  "→ Visitantes com infecção ativa: restringir acesso":
    "→ Visitantes con infección activa: restringir el acceso",

  // ── Falha terapêutica ──────────────────────────────────────────────────────
  "PASSO 1 — Confirmar causa infecciosa vs. não-infecciosa:":
    "PASO 1 — Confirmar la causa infecciosa frente a la no infecciosa:",
  "PASSO 2 — Colher culturas ANTES de modificar ATB:":
    "PASO 2 — Tomar las culturas ANTES de modificar el antibiótico:",
  "PASSO 3 — Avaliar adequação do ATB atual:":
    "PASO 3 — Evaluar la idoneidad del antibiótico actual:",
  "PASSO 4 — Buscar foco não controlado:":
    "PASO 4 — Buscar un foco no controlado:",
  "  → Coleção/abscesso não drenado? → cirurgia/intervenção":
    "  → ¿Colección o absceso no drenado? → cirugía o intervención",
  "  → Dose adequada ao peso e função renal?":
    "  → ¿Dosis adecuada al peso y a la función renal?",
  "  → Novo exame físico completo (dispositivos, feridas, abdome, pulmões)":
    "  → Nueva exploración física completa (dispositivos, heridas, abdomen, pulmones)",
  "  → Sem resposta após 48–72h = falha → modificar":
    "  → Sin respuesta tras 48–72 h = fracaso → modificar",
  "Cobertura ampla com falha + UTI ≥ 7 dias → considerar: (1) ceftazidima-avibactam se KPC suspeita (2) adicionar equinocandina para Candida (3) buscar foco não drenado (4) etiologia não infecciosa?":
    "Cobertura amplia con fracaso + UCI ≥ 7 días → considerar: (1) ceftazidima-avibactam si se sospecha KPC (2) añadir una equinocandina para Candida (3) buscar un foco no drenado (4) ¿etiología no infecciosa?",
  "Cobertura ampla com falha → rever foco (foco não drenado? cateter? dispositivo?), colher novas culturas e considerar equinocandina se fatores de risco para candidemia":
    "Cobertura amplia con fracaso → revisar el foco (¿foco no drenado?, ¿catéter?, ¿dispositivo?), tomar nuevas culturas y considerar una equinocandina si hay factores de riesgo de candidemia",
  "→ Rever causa: foco não controlado? ATB inadequado? causa não-infecciosa?":
    "→ Revisar la causa: ¿foco no controlado?, ¿antibiótico inadecuado?, ¿causa no infecciosa?",
  "→ Reavaliar conforme resultado de culturas":
    "→ Reevaluar según el resultado de las culturas",
  "→ Hemoculturas de 2 sítios (periférico + outro CVC se houver)":
    "→ Hemocultivos de 2 sitios (periférico + otro catéter venoso central si lo hay)",
  "→ Colher hemoculturas de controle a cada 24–48h (meta: negativas)":
    "→ Tomar hemocultivos de control cada 24–48 h (meta: negativos)",
  "→ Retirar CVC (SEMPRE em IVAS-CVC confirmada ou fortemente suspeita)":
    "→ Retirar el catéter venoso central (SIEMPRE en la infección asociada a catéter confirmada o fuertemente sospechada)",
  "→ Retirar SVD o mais cedo possível (reduz recorrência)":
    "→ Retirar la sonda vesical lo antes posible (reduce la recurrencia)",
  "→ Trocar SVD e colher urocultura da nova sonda":
    "→ Cambiar la sonda vesical y tomar un urocultivo de la sonda nueva",
  "→ TC abdome/pelve com contraste para localizar coleção":
    "→ TC de abdomen y pelvis con contraste para localizar la colección",
  "→ Fundo de olho (descartar endoftalmite candidósica)":
    "→ Fondo de ojo (descartar la endoftalmitis candidiásica)",
  "→ Iniciar equinocandina IMEDIATAMENTE (não aguardar especiação):":
    "→ Iniciar una equinocandina DE INMEDIATO (no esperar la identificación de especie):",
  "→ Meropeném 1g IV 8/8h se MDR ou falha anterior":
    "→ Meropenem 1 g IV cada 8 h si hay multirresistencia o un fracaso previo",
  "→ BAL ou mini-BAL (50mL SF colhido com cateter dirigido) OU aspirado traqueal quantitativo":
    "→ Lavado broncoalveolar o minilavado (50 mL de solución fisiológica tomados con catéter dirigido) O aspirado traqueal cuantitativo",
  "Stepdown VO (fluconazol) apenas após: estabilidade + C. albicans sensível + hemoculturas negativas":
    "Paso a vía oral (fluconazol) solo tras: estabilidad + C. albicans sensible + hemocultivos negativos",
  "Duração: 14 dias após ÚLTIMA hemocultura negativa":
    "Duración: 14 días tras el ÚLTIMO hemocultivo negativo",
  "Duração: 7 dias (14d se fungo, bacteremia associada)":
    "Duración: 7 días (14 días si hay hongo o bacteriemia asociada)",
  "Duração: 7 dias se boa resposta (não prolongar sem motivo)":
    "Duración: 7 días si hay buena respuesta (no prolongarla sin motivo)",
  "Duração: 7–14 dias (14d para S. aureus, Candida)":
    "Duración: 7–14 días (14 días para S. aureus y Candida)",

  // ── Aba UTI ────────────────────────────────────────────────────────────────
  "UTI — Sedação e Neurológico": "UCI — Sedación y neurológico",
  "UTI — Ventilação Mecânica": "UCI — Ventilación mecánica",
  "VM iniciada — retornou do módulo Ventilação":
    "Ventilación mecánica iniciada — volvió del módulo de Ventilación",
  "Se for admissão UTI após atendimento inicial no PS/emergência e o bundle já foi cumprido:":
    "Si es un ingreso en la UCI tras la atención inicial en urgencias y el paquete de medidas ya se cumplió:",
  "Se o paciente está chegando agora à UTI pela 1ª vez:":
    "Si el paciente llega ahora a la UCI por primera vez:",
  "→ Marque 'Pós-estabilização — reavaliação' no campo acima e continue":
    "→ Marque «Tras la estabilización — reevaluación» en el campo de arriba y continúe",
  "→ Retorne a este fluxo UTI quando o paciente já estiver estabilizado e em tratamento":
    "→ Vuelva a este flujo de UCI cuando el paciente ya esté estabilizado y en tratamiento",
  "→ Selecione 'Primeiro Atendimento' (botão abaixo)":
    "→ Seleccione «Primera atención» (botón de abajo)",
  "Avaliar prontidão para SBT (Spontaneous Breathing Trial):":
    "Evaluar la disponibilidad para la prueba de respiración espontánea:",
  "→ Causa da IRpA revertida ou em melhora":
    "→ Causa de la insuficiencia respiratoria aguda revertida o en mejoría",
  "→ Hemodinâmica estável (PAM ≥ 65, vasopressor ≤ dose mínima)":
    "→ Hemodinámica estable (PAM ≥ 65, vasopresor en dosis mínima o menor)",
  "→ Realizar PSV trial 30–120 min — se tolerado → extubação":
    "→ Realizar una prueba en presión de soporte de 30–120 min — si la tolera → extubación",
  "→ Reduzir FiO₂ / PEEP conforme melhora clínica e oxigenação":
    "→ Reducir la FiO₂ y la PEEP según la mejoría clínica y la oxigenación",
  "→ PEEP alto conforme ARDSnet PEEP table (target driving pressure ≤ 15)":
    "→ PEEP alta según la tabla de PEEP de ARDSnet (objetivo de presión de distensión ≤ 15)",
  "→ Considerar ECMO VV em centro de referência":
    "→ Considerar la ECMO venovenosa en un centro de referencia",
  "→ Avaliar volemia: eco ou variação de pressão de pulso":
    "→ Evaluar la volemia: ecografía o variación de la presión de pulso",
  "→ Ringer Lactato 250–500 mL se volume-responsivo e sem congestão (SSC 2021 — cristalóide balanceado)":
    "→ Ringer lactato 250–500 mL si es respondedor a volumen y no hay congestión (SSC 2021 — cristaloide balanceado)",
  "Se sem melhora em 30–60 min ou piora do esforço respiratório, considerar IOT precoce.":
    "Si no hay mejoría en 30–60 min o empeora el esfuerzo respiratorio, considerar la intubación precoz.",
  "Cabeceira elevada 30–45° (prevenir PAV e broncoaspiração)":
    "Cabecera elevada 30–45° (prevenir la neumonía asociada a la ventilación y la broncoaspiración)",
  "Diagnóstico: febre nova + infiltrado novo no RX/TC + secreção traqueal purulenta + ↑ necessidade de O₂":
    "Diagnóstico: fiebre nueva + infiltrado nuevo en la radiografía o TC + secreción traqueal purulenta + ↑ de la necesidad de O₂",
  "Nutrição enteral precoce: iniciar em 24–48h pós-estabilização hemodinâmica":
    "Nutrición enteral precoz: iniciarla en 24–48 h tras la estabilización hemodinámica",
  "Nutrição: avaliar via oral ou enteral precoce conforme tolerância e risco":
    "Nutrición: evaluar la vía oral o enteral precoz según la tolerancia y el riesgo",
  "Proteção gástrica: pantoprazol 40 mg IV 1x/dia (risco de úlcera de estresse)":
    "Protección gástrica: pantoprazol 40 mg IV 1 vez al día (riesgo de úlcera de estrés)",
};
