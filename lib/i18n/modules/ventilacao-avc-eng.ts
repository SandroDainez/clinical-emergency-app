/**
 * Ventilação mecânica e AVC (engines) — dicionário PT → ES.
 *
 * Nota: o motor de ventilação tem um trecho de template literal
 * ("}/min e ajuste inspiratório compatível…") que é interpolação de código, não
 * chave de tradução — o texto visível dele já está coberto pelas frases abaixo.
 */
export const ES_VENT_AVC_ENG: Record<string, string> = {
  // ══ VENTILAÇÃO ════════════════════════════════════════════════════════════
  // ── Estratégia por cenário ─────────────────────────────────────────────────
  "Acidose metabólica: priorizar ventilação minuto alta sem extrapolar pressões seguras":
    "Acidosis metabólica: priorizar un volumen minuto alto sin sobrepasar las presiones seguras",
  "Edema cardiogênico: oxigenar com PEEP, mas reavaliar impacto hemodinâmico":
    "Edema cardiogénico: oxigenar con PEEP, pero reevaluar el impacto hemodinámico",
  "Hipoxêmico: melhorar oxigenação com PEEP/FiO₂, mantendo Vt protetor":
    "Hipoxémico: mejorar la oxigenación con PEEP y FiO₂, manteniendo un volumen corriente protector",
  "Neuromuscular: garantir ventilação e conforto, sem hiperinsuflação desnecessária":
    "Neuromuscular: garantizar la ventilación y el confort, sin hiperinsuflación innecesaria",
  "Obstrutivo: expiração longa, evitar auto-PEEP, aceitar algum CO₂ se pH tolerável":
    "Obstructivo: espiración larga, evitar la auto-PEEP y aceptar algo de CO₂ si el pH lo tolera",
  "Pós-operatório: SpO₂ ≥92%, FiO₂ tão baixa quanto possível após estabilizar":
    "Postoperatorio: SpO₂ ≥ 92%, FiO₂ tan baja como sea posible tras estabilizar",
  "Quadro hipoxêmico difuso sem SDRA confirmado ainda pede estratégia protetora.":
    "Un cuadro hipoxémico difuso sin SDRA confirmado aún exige una estrategia protectora.",
  "Setup inicial genérico enquanto a fisiopatologia ainda está sendo refinada.":
    "Configuración inicial genérica mientras la fisiopatología aún se está precisando.",
  "Sem cenário clínico o app não consegue decidir entre estratégia protetora, obstrutiva, neuro ou alta ventilação minuto.":
    "Sin un escenario clínico la app no puede decidir entre una estrategia protectora, obstructiva, neurológica o de volumen minuto alto.",
  "Use estratégia protetora com foco em oxigenação por PEEP e FiO₂.":
    "Use una estrategia protectora centrada en la oxigenación mediante PEEP y FiO₂.",
  "Use volumes protetores e ajuste FR pela troca gasosa.":
    "Use volúmenes protectores y ajuste la frecuencia respiratoria por el intercambio gaseoso.",
  "o cenário atual favorece estratégia protetora no modo sugerido pelo app":
    "el escenario actual favorece una estrategia protectora en el modo sugerido por la app",

  // ── Modos ventilatórios ────────────────────────────────────────────────────
  "CPAP: foco em PEEP/CPAP e FiO₂; acompanhar FR, esforço respiratório e Vt espontâneo do paciente.":
    "CPAP: foco en la PEEP/CPAP y la FiO₂; seguir la frecuencia respiratoria, el esfuerzo respiratorio y el volumen corriente espontáneo del paciente.",
  "PC-AC: titule a pressão inspiratória para atingir Vt protetor, mantendo vigilância de volume entregue.":
    "PC-AC: titule la presión inspiratoria para alcanzar un volumen corriente protector, vigilando el volumen entregado.",
  "PRVC/VC+: manter alvo de volume com limite de pressão, útil quando se quer proteção pulmonar com adaptação de pressão.":
    "PRVC/VC+: mantener un objetivo de volumen con límite de presión; es útil cuando se busca protección pulmonar con adaptación de la presión.",
  "PSV: ajuste a pressão de suporte para manter Vt protetor e FR confortável, em paciente com esforço espontâneo.":
    "PSV: ajuste la presión de soporte para mantener un volumen corriente protector y una frecuencia respiratoria confortable, en un paciente con esfuerzo espontáneo.",
  "SIMV: usar quando a estratégia da unidade pedir respirações mandatórias intercaladas; não costuma ser a primeira escolha em instabilidade aguda.":
    "SIMV: usarlo cuando la estrategia de la unidad exija respiraciones mandatorias intercaladas; no suele ser la primera elección en la inestabilidad aguda.",

  // ── Volume corrente e pressões ─────────────────────────────────────────────
  "O Vt continua baseado em PBW, não no peso real do paciente.":
    "El volumen corriente sigue basándose en el peso predicho, no en el peso real del paciente.",
  "O Vt continua sendo calculado por PBW, não pelo peso real.":
    "El volumen corriente se sigue calculando por el peso predicho, no por el peso real.",
  "mesmo na obesidade o Vt continua guiado pelo PBW, não pelo peso real":
    "incluso en la obesidad el volumen corriente sigue guiándose por el peso predicho, no por el peso real",
  "na ARDS o Vt deve seguir proteção pulmonar por PBW":
    "en el SDRA el volumen corriente debe seguir la protección pulmonar por peso predicho",
  "Sem sexo e altura não dá para calcular o peso predito (PBW), que orienta o Vt seguro.":
    "Sin el sexo y la talla no se puede calcular el peso predicho, que orienta el volumen corriente seguro.",
  "Pulmão sem grande lesão aguda costuma tolerar Vt 6–8 mL/kg PBW.":
    "Un pulmón sin lesión aguda importante suele tolerar un volumen corriente de 6–8 mL/kg de peso predicho.",
  "Reduza Vt e revise esforço do paciente, auto-PEEP, sincronia e necessidade de sedação antes de novas escaladas.":
    "Reduzca el volumen corriente y revise el esfuerzo del paciente, la auto-PEEP, la sincronía y la necesidad de sedación antes de escalar más.",
  "Reduza Vt em direção a ~6 mL/kg PBW, sobretudo se Pplat ou driving pressure estiverem elevados.":
    "Reduzca el volumen corriente hacia ~6 mL/kg de peso predicho, sobre todo si la presión meseta o la presión de distensión están elevadas.",
  "Evite corrigir oxigenação aumentando Vt acima do alvo protetor.":
    "Evite corregir la oxigenación aumentando el volumen corriente por encima del objetivo protector.",
  "Mantenha Pplat ≤30 cmH₂O e driving pressure idealmente ≤15 cmH₂O.":
    "Mantenga la presión meseta ≤ 30 cmH₂O y la presión de distensión idealmente ≤ 15 cmH₂O.",
  "Se possível, medir Pplat ajuda a avaliar segurança da distensão pulmonar.":
    "Si es posible, medir la presión meseta ayuda a evaluar la seguridad de la distensión pulmonar.",
  "Se a pressão subir sem hipoxemia importante, procure problema mecânico antes de subir suporte.":
    "Si la presión sube sin una hipoxemia importante, busque un problema mecánico antes de aumentar el soporte.",
  "Pinsp / ajuste da pressão": "Presión inspiratoria / ajuste de la presión",
  "Pressão de suporte / observação": "Presión de soporte / observación",

  // ── PEEP e FiO₂ ────────────────────────────────────────────────────────────
  "A PEEP ajuda no edema alveolar, mas pode derrubar pressão se o doente estiver instável.":
    "La PEEP ayuda en el edema alveolar, pero puede bajar la presión si el paciente está inestable.",
  "Atelectasia e baixa complacência de parede torácica podem exigir PEEP acima do mínimo.":
    "La atelectasia y una distensibilidad baja de la pared torácica pueden exigir una PEEP por encima del mínimo.",
  "Muitos pacientes obesos precisam de PEEP acima do mínimo para combater atelectasia, se a perfusão tolerar.":
    "Muchos pacientes con obesidad necesitan una PEEP por encima del mínimo para combatir la atelectasia, si la perfusión lo tolera.",
  "PEEP baixa ou moderada conforme oxigenação.":
    "PEEP baja o moderada según la oxigenación.",
  "PEEP costuma ajudar recrutamento e redistribuição de edema alveolar.":
    "La PEEP suele ayudar al reclutamiento y a la redistribución del edema alveolar.",
  "PEEP e FiO₂ são tituladas pela oxigenação e pela hemodinâmica.":
    "La PEEP y la FiO₂ se titulan por la oxigenación y por la hemodinámica.",
  "PEEP inadequada pode piorar perfusão ou manter oxigenação abaixo do alvo":
    "Una PEEP inadecuada puede empeorar la perfusión o mantener la oxigenación por debajo del objetivo",
  "PEEP inicial baixa para não piorar aprisionamento aéreo.":
    "PEEP inicial baja para no empeorar el atrapamiento aéreo.",
  "PEEP reduz retorno venoso; em choque pode ser necessário aceitar PEEP mais contida temporariamente.":
    "La PEEP reduce el retorno venoso; en el choque puede ser necesario aceptar temporalmente una PEEP más contenida.",
  "Em hipotensão, reavalie resposta hemodinâmica a cada ajuste de PEEP.":
    "En la hipotensión, reevalúe la respuesta hemodinámica con cada ajuste de la PEEP.",
  "Depois da estabilização inicial, reduza FiO₂ ao menor valor que mantenha SpO₂ adequada.":
    "Tras la estabilización inicial, reduzca la FiO₂ al menor valor que mantenga una SpO₂ adecuada.",
  "FiO₂ inicialmente mais alta e depois reduzir conforme SpO₂.":
    "FiO₂ inicialmente más alta y luego reducirla según la SpO₂.",
  "Titule FiO₂ e PEEP para a meta de oxigenação, evitando hiperóxia e PEEP excessiva desnecessária.":
    "Titule la FiO₂ y la PEEP hacia el objetivo de oxigenación, evitando la hiperoxia y una PEEP excesiva innecesaria.",
  "Use a menor FiO₂ que mantenha meta de oxigenação após estabilizar.":
    "Use la menor FiO₂ que mantenga el objetivo de oxigenación tras estabilizar.",
  "vale reduzir FiO2 excessiva quando o cenário permite, para evitar hiperóxia desnecessária":
    "conviene reducir una FiO₂ excesiva cuando el escenario lo permite, para evitar una hiperoxia innecesaria",
  "o suporte de oxigênio atual pode estar abaixo do necessário para o cenário":
    "el soporte de oxígeno actual puede estar por debajo de lo necesario para el escenario",

  // ── Frequência, fluxo e auto-PEEP ──────────────────────────────────────────
  "Ajuste FR em passos pequenos, guiando-se pela PaCO₂ e pela situação clínica.":
    "Ajuste la frecuencia respiratoria en pasos pequeños, guiándose por la PaCO₂ y la situación clínica.",
  "FR alta demais pode encurtar a expiração e gerar auto-PEEP":
    "Una frecuencia respiratoria demasiado alta puede acortar la espiración y generar auto-PEEP",
  "FR escolhida para manter CO₂ próximo do normal.":
    "Frecuencia respiratoria elegida para mantener el CO₂ cerca de lo normal.",
  "a frequência respiratória ficou fora da faixa sugerida pelo setup inicial":
    "la frecuencia respiratoria quedó fuera del rango sugerido por la configuración inicial",
  "Ajuste FR e fluxo inspiratório para garantir expiração longa.":
    "Ajuste la frecuencia respiratoria y el flujo inspiratorio para garantizar una espiración larga.",
  "Fluxo inspiratório (L/min) ou observação":
    "Flujo inspiratorio (L/min) u observación",
  "Fluxo inspiratório mais alto para encurtar inspiração.":
    "Flujo inspiratorio más alto para acortar la inspiración.",
  "no obstrutivo, fluxo mais alto ajuda a encurtar a inspiração e ganhar tempo expiratório":
    "en el patrón obstructivo, un flujo más alto ayuda a acortar la inspiración y ganar tiempo espiratorio",
  "o fluxo inspiratório ficou distante do valor sugerido pelo app":
    "el flujo inspiratorio quedó lejos del valor sugerido por la app",
  "Observe a curva: o fluxo expiratório deve voltar a zero antes da próxima inspiração.":
    "Observe la curva: el flujo espiratorio debe volver a cero antes de la siguiente inspiración.",
  "Se houver auto-PEEP, reduza FR e encurte o tempo inspiratório antes de tentar ganhar volume minuto.":
    "Si hay auto-PEEP, reduzca la frecuencia respiratoria y acorte el tiempo inspiratorio antes de intentar ganar volumen minuto.",
  "Ganhe ventilação preferindo FR antes de extrapolar volumes inseguros.":
    "Gane ventilación aumentando la frecuencia respiratoria antes de sobrepasar volúmenes inseguros.",

  // ── Gasometria ─────────────────────────────────────────────────────────────
  "A alteração principal parece metabólica: o ventilador ajuda na compensação, mas não resolve a causa.":
    "La alteración principal parece metabólica: el ventilador ayuda en la compensación, pero no resuelve la causa.",
  "A gasometria atual não sugere correção ventilatória imediata relevante.":
    "La gasometría actual no sugiere una corrección ventilatoria inmediata relevante.",
  "A ventilação ajuda a compensar, mas a correção da causa da acidose continua central.":
    "La ventilación ayuda a compensar, pero corregir la causa de la acidosis sigue siendo lo central.",
  "CO₂ está alto para o pH atual: aumente ventilação minuto.":
    "El CO₂ está alto para el pH actual: aumente el volumen minuto.",
  "CO₂ está baixo: reduza a ventilação em pequenos passos.":
    "El CO₂ está bajo: reduzca la ventilación en pasos pequeños.",
  "PaCO₂ alta com HCO₃⁻ alto e pH quase normal sugerem compensação metabólica de distúrbio respiratório crônico.":
    "Una PaCO₂ alta con HCO₃⁻ alto y un pH casi normal sugieren una compensación metabólica de un trastorno respiratorio crónico.",
  "pH alto com PaCO₂ baixa sugere ventilação excessiva para a necessidade atual.":
    "Un pH alto con PaCO₂ baja sugiere una ventilación excesiva para la necesidad actual.",
  "pH alto sem PaCO₂ reduzida sugere componente metabólico ou compensação respiratória insuficiente.":
    "Un pH alto sin PaCO₂ reducida sugiere un componente metabólico o una compensación respiratoria insuficiente.",
  "pH baixo com PaCO₂ alta sugere hipoventilação alveolar ou ventilação minuto insuficiente.":
    "Un pH bajo con PaCO₂ alta sugiere hipoventilación alveolar o un volumen minuto insuficiente.",
  "pH baixo sem retenção de CO₂ e com HCO₃⁻ baixo sugere acidose metabólica.":
    "Un pH bajo sin retención de CO₂ y con HCO₃⁻ bajo sugiere acidosis metabólica.",
  "pH baixo sem retenção de CO₂ sugere componente metabólico, possivelmente com compensação respiratória.":
    "Un pH bajo sin retención de CO₂ sugiere un componente metabólico, posiblemente con compensación respiratoria.",
  "Sem acidemia ou alcalemia claras pelos dados atuais; interpretar junto com contexto clínico e tendência gasométrica.":
    "Sin acidemia ni alcalemia claras según los datos actuales; interpretarlo junto con el contexto clínico y la tendencia gasométrica.",
  "Sem recomendação de ajuste ventilatório com base na gasometria atual":
    "Sin recomendación de ajuste ventilatorio a partir de la gasometría actual",
  "Mantenha ventilação minuto adequada e trate o distúrbio de base em paralelo.":
    "Mantenga un volumen minuto adecuado y trate el trastorno de base en paralelo.",
  "na acidose metabólica a ventilação minuto precisa acompanhar a compensação":
    "en la acidosis metabólica el volumen minuto debe acompañar la compensación",
  "Evitar hiperventilação sem indicação específica.":
    "Evitar la hiperventilación sin una indicación específica.",
  "Evite hiperventilação prolongada fora de indicação neurológica bem definida.":
    "Evite la hiperventilación prolongada fuera de una indicación neurológica bien definida.",
  "retenção crônica": "retención crónica",
  "sem hipoxemia importante pela relação P/F":
    "sin hipoxemia importante según la relación PaO₂/FiO₂",

  // ── Hipoxemia refratária e reavaliação ─────────────────────────────────────
  "PaO₂/FiO₂ ≤150: considerar pronação prolongada se não houver contraindicação.":
    "PaO₂/FiO₂ ≤ 150: considerar el decúbito prono prolongado si no hay contraindicación.",
  "Se o quadro for moderado ou grave e houver equipe/estrutura, considerar pronação prolongada.":
    "Si el cuadro es moderado o grave y hay equipo y estructura, considerar el decúbito prono prolongado.",
  "Se a hipoxemia permanecer importante, reavalie se o caso já migrou para ARDS/SDRA.":
    "Si la hipoxemia sigue siendo importante, reevalúe si el caso ya evolucionó a SDRA.",
  "Se a oxigenação estiver pior do que o esperado, procure causa pulmonar associada em vez de apenas aumentar suporte.":
    "Si la oxigenación es peor de lo esperado, busque una causa pulmonar asociada en lugar de solo aumentar el soporte.",
  "Se a troca gasosa não evoluir, procure causa associada além do edema cardiogênico.":
    "Si el intercambio gaseoso no mejora, busque una causa asociada más allá del edema cardiogénico.",
  "Se oxigenação estiver ruim, procure atelectasia, secreção, pneumonia ou outro fator associado.":
    "Si la oxigenación es mala, busque atelectasia, secreciones, neumonía u otro factor asociado.",
  "Se persistir dessaturação, revise posição, secreção e estratégia de recrutamento com a equipe.":
    "Si la desaturación persiste, revise la posición, las secreciones y la estrategia de reclutamiento con el equipo.",
  "O problema principal costuma ser falência de bomba ventilatória, não lesão alveolar difusa.":
    "El problema principal suele ser un fallo de la bomba ventilatoria, no una lesión alveolar difusa.",
  "Acompanhe conforto, sincronia e força residual do paciente ao longo do tempo.":
    "Siga el confort, la sincronía y la fuerza residual del paciente a lo largo del tiempo.",
  "Após qualquer ajuste, reavalie PAM, perfusão periférica, necessidade de vasopressor e resposta respiratória.":
    "Tras cualquier ajuste, reevalúe la PAM, la perfusión periférica, la necesidad de vasopresor y la respuesta respiratoria.",
  "Cheque SpO₂, pressão arterial, mecânica pulmonar, curvas/alarme e contexto hemodinâmico.":
    "Compruebe la SpO₂, la presión arterial, la mecánica pulmonar, las curvas y alarmas, y el contexto hemodinámico.",
  "Correlacione o resultado com o ventilador, perfusão e esforço do paciente antes de mudar múltiplos parâmetros ao mesmo tempo.":
    "Correlacione el resultado con el ventilador, la perfusión y el esfuerzo del paciente antes de cambiar varios parámetros a la vez.",
  "Espere 5–15 min após a mudança principal, salvo piora clínica imediata.":
    "Espere 5–15 min tras el cambio principal, salvo que haya un empeoramiento clínico inmediato.",
  "Faça ajustes pequenos e reavalie perfusão junto com a melhora da oxigenação.":
    "Haga ajustes pequeños y reevalúe la perfusión junto con la mejoría de la oxigenación.",
  "Reavalie a resposta antes de acumular múltiplas mudanças no aparelho.":
    "Reevalúe la respuesta antes de acumular varios cambios en el ventilador.",
  "Mantenha a estratégia vigente, vigie mecânica/oxigenação e repita a gasometria se houver mudança clínica, piora de alarmes ou nova intervenção.":
    "Mantenga la estrategia vigente, vigile la mecánica y la oxigenación, y repita la gasometría si hay un cambio clínico, un empeoramiento de las alarmas o una nueva intervención.",
  "A configuração atual se afastou do setup mais adequado para o cenário clínico informado.":
    "La configuración actual se apartó de la más adecuada para el escenario clínico informado.",
  "Isso não obriga retorno automático ao valor sugerido, mas exige checagem ativa para evitar ventilação subótima ou insegura.":
    "Esto no obliga a volver automáticamente al valor sugerido, pero exige una comprobación activa para evitar una ventilación subóptima o insegura.",
  "Use esse bloco para confrontar o que está no aparelho com o que o cenário clínico está exigindo agora, e não apenas com o setup inicial.":
    "Use este bloque para confrontar lo que está en el ventilador con lo que el escenario clínico exige ahora, y no solo con la configuración inicial.",
  "Use esse setup como ponto de partida; qualquer mudança relevante no aparelho deve ser reavaliada à luz da gasometria, da mecânica e da hemodinâmica.":
    "Use esta configuración como punto de partida; cualquier cambio relevante en el ventilador debe reevaluarse a la luz de la gasometría, la mecánica y la hemodinámica.",
  "Ex.: manter CPAP e observar esforço": "Ej.: mantener el CPAP y observar el esfuerzo",
  "Anotações": "Anotaciones",
  "Observação do suporte": "Observación del soporte",
  "Sem identificação": "Sin identificación",
  "Ventilação mecânica — resumo": "Ventilación mecánica — resumen",
  "O último caso salvo automaticamente foi reaberto neste módulo.":
    "El último caso guardado automáticamente se reabrió en este módulo.",

  // ══ AVC ═══════════════════════════════════════════════════════════════════
  // ── Etapas e seções ────────────────────────────────────────────────────────
  "AVC em definição": "ACV en definición",
  "Avaliação clínica inicial": "Evaluación clínica inicial",
  "Ações de estabilização": "Acciones de estabilización",
  "Como corrigir / observação": "Cómo corregirlo / observación",
  "Condutas de estabilização": "Conductas de estabilización",
  "Contraindicações absolutas": "Contraindicaciones absolutas",
  "Contraindicações potencialmente corrigíveis":
    "Contraindicaciones potencialmente corregibles",
  "Contraindicações relativas": "Contraindicaciones relativas",
  "Correção de glicemia": "Corrección de la glucemia",
  "Decisão clínica alterada": "Decisión clínica modificada",
  "Decisão final por item": "Decisión final por ítem",
  "Decisão médica final": "Decisión médica final",
  "Decisão terapêutica e prescrição": "Decisión terapéutica y prescripción",
  "Dose total: peso pendente": "Dosis total: peso pendiente",
  "Função renal / observação": "Función renal / observación",
  "Gravidade e intervenções imediatas": "Gravedad e intervenciones inmediatas",
  "Inicialização do módulo": "Inicialización del módulo",
  "Intervenções sugeridas agora": "Intervenciones sugeridas ahora",
  "Laboratório e anticoagulação": "Laboratorio y anticoagulación",
  "Manejo de convulsão": "Manejo de la convulsión",
  "NIHSS — consciência": "NIHSS — consciencia",
  "NIHSS — coordenação e sensibilidade": "NIHSS — coordinación y sensibilidad",
  "NIHSS — olhar e visão": "NIHSS — mirada y visión",
  "Não identificado": "No identificado",
  "Nível de consciência (auto pelo NIHSS)":
    "Nivel de consciencia (automático por el NIHSS)",
  "Pendências diagnósticas e laboratoriais":
    "Pendientes diagnósticos y de laboratorio",
  "Profissional não identificado": "Profesional no identificado",
  "Responsável e identificação": "Responsable e identificación",
  "Responsável pelo preenchimento": "Responsable de completar los datos",
  "Transferência para trombectomia": "Traslado para trombectomía",
  "Confuso / não obedece plenamente": "Confuso / no obedece plenamente",
  "Convulsão / pós-ictal no contexto": "Convulsión / postictal en este contexto",
  "Proteção de via aérea necessária": "Se necesita proteger la vía aérea",
  "Via aérea sem proteção adequada": "Vía aérea sin protección adecuada",
  "déficit não incapacitante": "déficit no incapacitante",
  "em documentação pelo NIHSS": "en documentación mediante el NIHSS",
  "Será preenchido automaticamente conforme os itens de consciência do NIHSS.":
    "Se completará automáticamente según los ítems de consciencia del NIHSS.",
  "Sugestões automáticas geradas a partir dos dados preenchidos nesta etapa.":
    "Sugerencias automáticas generadas a partir de los datos completados en esta etapa.",

  // ── Estabilização e intervenções ───────────────────────────────────────────
  "Baixar PA para meta segura se reperfusão IV estiver em discussão":
    "Bajar la presión arterial a una meta segura si se está planteando la reperfusión IV",
  "Controlar temperatura e pesquisar gatilho infeccioso":
    "Controlar la temperatura e investigar un desencadenante infeccioso",
  "Estabilizar ABC antes da reperfusão": "Estabilizar el ABC antes de la reperfusión",
  "Estabilizar perfusão e investigar causa não neurológica":
    "Estabilizar la perfusión e investigar una causa no neurológica",
  "Oxigênio suplementar e monitorização contínua":
    "Oxígeno suplementario y monitorización continua",
  "Proteger via aérea e prevenir aspiração":
    "Proteger la vía aérea y prevenir la aspiración",
  "Reavaliar ventilação, esforço respiratório e via aérea":
    "Reevaluar la ventilación, el esfuerzo respiratorio y la vía aérea",
  "Sem gatilho crítico documentado até agora. Esta área deve responder se há algo a tratar antes de seguir para reperfusão.":
    "Sin un desencadenante crítico documentado hasta ahora. Esta área debe responder si hay algo que tratar antes de pasar a la reperfusión.",
  "Sem intervenção automática sugerida. Se o caso estiver estável, prossiga com monitorização e documentação objetiva.":
    "Sin intervención automática sugerida. Si el caso está estable, continúe con la monitorización y la documentación objetiva.",
  "A creatinina ajuda na leitura de função renal e no contexto de contraste/anticoagulação.":
    "La creatinina ayuda a interpretar la función renal y el contexto del contraste y la anticoagulación.",
  "Valor atual para detectar hipo/hiperglicemia antes da decisão neurológica; conversão interna mantém a lógica em mg/dL.":
    "Valor actual para detectar hipoglucemia o hiperglucemia antes de la decisión neurológica; la conversión interna mantiene la lógica en mg/dL.",
  "Valor atual para detectar hipoglicemia, hiperglicemia e necessidade de correção imediata antes da decisão neurológica.":
    "Valor actual para detectar hipoglucemia, hiperglucemia y la necesidad de corrección inmediata antes de la decisión neurológica.",

  // ── Decisão, destino e seguimento ──────────────────────────────────────────
  "Caso ainda em revisão; completar dados críticos para consolidar decisão terapêutica e destino.":
    "Caso aún en revisión; complete los datos críticos para consolidar la decisión terapéutica y el destino.",
  "Caso classificado como hemorrágico; reperfusão IV não indicada e fluxo redirecionado para controle de sangramento/alta vigilância.":
    "Caso clasificado como hemorrágico; reperfusión IV no indicada y flujo redirigido al control del sangrado y a una vigilancia alta.",
  "Caso com potencial necessidade de trombectomia; priorizar transferência/acionamento endovascular sem atrasar medidas já indicadas.":
    "Caso con posible necesidad de trombectomía; priorizar el traslado o la activación del equipo endovascular sin retrasar las medidas ya indicadas.",
  "Critérios de trombólise preenchidos com os dados atuais; manter dupla checagem e registrar horários críticos da decisão.":
    "Criterios de trombólisis cumplidos con los datos actuales; mantener la doble comprobación y registrar los horarios críticos de la decisión.",
  "Critérios objetivos de trombólise preenchidos com os dados atuais; manter dupla checagem e registrar horário da decisão.":
    "Criterios objetivos de trombólisis cumplidos con los datos actuales; mantener la doble comprobación y registrar la hora de la decisión.",
  "Decisão baseada nos dados clínicos e de imagem preenchidos no módulo, com rastreabilidade do racional terapêutico e do destino assistencial.":
    "Decisión basada en los datos clínicos y de imagen completados en el módulo, con trazabilidad del razonamiento terapéutico y del destino asistencial.",
  "Fluxo redirecionado para AVC hemorrágico, sem reperfusão IV, com prioridade para controle de sangramento e destino intensivo.":
    "Flujo redirigido al ACV hemorrágico, sin reperfusión IV, con prioridad para el control del sangrado y un destino intensivo.",
  "Controle pressórico e neurológico intensivos, avaliar reversão de anticoagulação e manter vigilância de alta complexidade.":
    "Control tensional y neurológico intensivos, evaluar la reversión de la anticoagulación y mantener una vigilancia de alta complejidad.",
  "Manter PA < 180/105 mmHg, solução isotônica EV, vigilância de sangramento/angioedema e evitar procedimentos invasivos desnecessários nas primeiras 24 h.":
    "Mantener la PA < 180/105 mmHg, solución isotónica IV, vigilancia de sangrado y angioedema, y evitar procedimientos invasivos innecesarios en las primeras 24 h.",
  "Manter monitorização contínua, não atrasar transferência/avaliação endovascular se houver grande vaso e registrar horários críticos de imagem e decisão.":
    "Mantener la monitorización continua, no retrasar el traslado ni la evaluación endovascular si hay oclusión de gran vaso, y registrar los horarios críticos de imagen y decisión.",
  "Monitorização neurológica e hemodinâmica contínua, controle pressórico, avaliar reversão de anticoagulação quando aplicável e manter destino assistencial de alta vigilância.":
    "Monitorización neurológica y hemodinámica continua, control tensional, evaluar la reversión de la anticoagulación cuando corresponda y mantener un destino asistencial de vigilancia alta.",
  "Monitorização neurológica seriada, controle de PA/glicemia/temperatura, prevenção de complicações e reavaliação clínica frequente.":
    "Monitorización neurológica seriada, control de la PA, la glucemia y la temperatura, prevención de complicaciones y reevaluación clínica frecuente.",
  "Monitorização neurológica seriada, controle de PA/glicemia/temperatura, prevenção de complicações e registrar claramente o motivo de não reperfusão.":
    "Monitorización neurológica seriada, control de la PA, la glucemia y la temperatura, prevención de complicaciones y registrar claramente el motivo de la no reperfusión.",
  "Registrar prevenção secundária, investigação etiológica e plano do próximo nível assistencial antes da transferência.":
    "Registrar la prevención secundaria, la investigación etiológica y el plan del siguiente nivel asistencial antes del traslado.",
  "Triagem de deglutição antes de dieta, cabeceira elevada, prevenção de broncoaspiração e mobilização conforme segurança.":
    "Cribado de la deglución antes de la dieta, cabecera elevada, prevención de la broncoaspiración y movilización según la seguridad.",
  "UTI/unidade monitorizada por 24 h, neurochecks e PA seriados, dieta zero até triagem de deglutição e imagem de controle antes de liberar antitrombótico.":
    "UCI o unidad monitorizada durante 24 h, controles neurológicos y de PA seriados, dieta absoluta hasta el cribado de la deglución e imagen de control antes de autorizar el antitrombótico.",
  "UTI/unidade monitorizada por 24 h, neurochecks e PA seriados, dieta zero até triagem de deglutição, sem antitrombótico nas primeiras 24 h e imagem de controle antes de liberar prevenção secundária.":
    "UCI o unidad monitorizada durante 24 h, controles neurológicos y de PA seriados, dieta absoluta hasta el cribado de la deglución, sin antitrombótico en las primeras 24 h e imagen de control antes de autorizar la prevención secundaria.",
};
