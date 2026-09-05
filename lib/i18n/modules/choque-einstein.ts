/**
 * Espanhol (es-419) — conteúdo do módulo de Choque acrescentado a partir do
 * pathway Einstein/SBIBAE "Manejo Inicial do Paciente Adulto com Choque".
 *
 * Termos mantidos como se usam na terapia intensiva em espanhol: "gasto
 * cardíaco" (débito cardíaco), "llenado capilar" (enchimento capilar),
 * "presión de pulso", "marcapasos", "balón de contrapulsación intraaórtico".
 */
export const ES_CHOQUE_EINSTEIN: Record<string, string> = {
  // ── Reconhecimento ──
  "Hipoperfusão nas 3 janelas do corpo — PELE: fria, pegajosa, pálida ou azulada, livedo, acrocianose, enchimento capilar > 3 s. RENAL: diurese < 0,5 mL/kg/h. NEURO: desorientação, inquietação, confusão, rebaixamento.":
    "Hipoperfusión en las 3 ventanas del cuerpo — PIEL: fría, pegajosa, pálida o azulada, livedo, acrocianosis, llenado capilar > 3 s. RENAL: diuresis < 0,5 mL/kg/h. NEURO: desorientación, inquietud, confusión, deterioro del nivel de conciencia.",
  "Sinais laboratoriais: hiperlactatemia, acidose metabólica, SvcO₂ < 70% (ou SvO₂ < 65%), gap de PCO₂ > 6 mmHg.":
    "Signos de laboratorio: hiperlactatemia, acidosis metabólica, SvcO₂ < 70% (o SvO₂ < 65%), gap de PCO₂ > 6 mmHg.",
  "A hipotensão NÃO é obrigatória para o diagnóstico: taquicardia e vasoconstrição podem preservar a PA na fase inicial (choque compensado ou oculto) com hipoperfusão já instalada.":
    "La hipotensión NO es obligatoria para el diagnóstico: taquicardia y vasoconstricción pueden preservar la PA en la fase inicial (choque compensado u oculto) con hipoperfusión ya instalada.",
  "Há perda de volume conhecida ou provável, inclusive hemorragia oculta?":
    "¿Hay pérdida de volumen conocida o probable, incluida hemorragia oculta?",
  "A ausência de uma perda externa óbvia não exclui hipovolemia ou hemorragia oculta. Integre mecanismo, exame, tendência hemodinâmica, hemoglobina/lactato, FAST/POCUS quando pertinente e resposta à ressuscitação.":
    "La ausencia de una pérdida externa evidente no excluye hipovolemia ni hemorragia oculta. Integre mecanismo, examen, tendencia hemodinámica, hemoglobina/lactato, FAST/POCUS cuando corresponda y respuesta a la reanimación.",
  "Extremidades frias, pressão de pulso, enchimento capilar e SvcO₂ ajudam a caracterizar perfusão, mas NÃO separam de forma rígida o tipo de choque; há sobreposição e fenótipos mistos.":
    "Las extremidades frías, la presión de pulso, el llenado capilar y la SvcO₂ ayudan a caracterizar la perfusión, pero NO separan de forma rígida el tipo de shock; existe superposición y fenotipos mixtos.",
  "Na reavaliação, acompanhar enchimento capilar em série junto com pressão, diurese, estado mental e lactato quando elevado; SvcO₂ deve ser interpretada em série e no contexto, não como classificador isolado do subtipo.":
    "En la reevaluación, seguir el llenado capilar en serie junto con presión, diuresis, estado mental y lactato cuando esté elevado; la SvcO₂ debe interpretarse en serie y en contexto, no como clasificador aislado del subtipo.",
  "Quando a causa permanecer incerta ou a resposta inicial for inadequada, usar ecocardiografia/POCUS como imagem de primeira linha para caracterizar o fenótipo hemodinâmico.":
    "Cuando la causa siga siendo incierta o la respuesta inicial sea inadecuada, usar ecocardiografía/POCUS como imagen de primera línea para caracterizar el fenotipo hemodinámico.",
  "Antes de repetir fluidos, avaliar responsividade a fluido com variáveis dinâmicas quando aplicáveis, como elevação passiva das pernas e mudança de volume sistólico/débito após pequena prova de fluido.":
    "Antes de repetir fluidos, evaluar la respuesta a fluidos con variables dinámicas cuando sean aplicables, como elevación pasiva de piernas y cambio del volumen sistólico/gasto tras una pequeña prueba de fluidos.",
  "Não usar um marcador estático isolado de pré-carga como prova de hipovolemia nem como autorização automática para expansão volêmica.":
    "No usar un marcador estático aislado de precarga como prueba de hipovolemia ni como autorización automática para expansión con fluidos.",

  // ── Estabilização e metas ──
  "Estabilizar e fixar as metas": "Estabilizar y fijar las metas",
  "As metas valem para qualquer tipo de choque — o tipo define o tratamento, não o alvo.":
    "Las metas valen para cualquier tipo de choque — el tipo define el tratamiento, no el objetivo.",
  "Metas hemodinâmicas gerais: PAM ≥ 65 mmHg; normalização do lactato (alvo < 2 mmol/L ≈ 18 mg/dL), com queda esperada ≥ 10% por hora.":
    "Metas hemodinámicas generales: PAM ≥ 65 mmHg; normalización del lactato (objetivo < 2 mmol/L ≈ 18 mg/dL), con descenso esperado ≥ 10% por hora.",
  "Metas de oferta de O₂: hemoglobina ≥ 7 g/dL e saturação de pulso > 90%.":
    "Metas de aporte de O₂: hemoglobina ≥ 7 g/dL y saturación de pulso > 90%.",
  "Meta de reversão de disfunção orgânica: diurese > 0,5 mL/kg/h e melhora do estado neurológico atribuível ao choque.":
    "Meta de reversión de la disfunción orgánica: diuresis > 0,5 mL/kg/h y mejoría del estado neurológico atribuible al choque.",
  "Ressuscitação volêmica guiada por resposta: repetir a prova de fluido-responsividade enquanto os parâmetros sugerirem resposta a volume — não infundir volume fixo no automático.":
    "Reanimación con volumen guiada por respuesta: repetir la prueba de fluido-respondedor mientras los parámetros sugieran respuesta a volumen — no infundir un volumen fijo de forma automática.",
  "Linha arterial para PAM quando a dose de noradrenalina passar de 0,3–0,5 mcg/kg/min, ou por outra indicação de monitorização invasiva.":
    "Línea arterial para PAM cuando la dosis de noradrenalina supere 0,3–0,5 mcg/kg/min, o por otra indicación de monitorización invasiva.",
  "Exames para todos: lactato, gasometria, hemograma, PCR, ureia, creatinina, eletrólitos, cálcio iônico, magnésio, bilirrubinas, troponina, coagulograma, D-dímero, fibrinogênio, ECG, RX de tórax e ecocardiograma.":
    "Exámenes para todos: lactato, gasometría, hemograma, PCR, urea, creatinina, electrolitos, calcio iónico, magnesio, bilirrubinas, troponina, coagulograma, dímero-D, fibrinógeno, ECG, Rx de tórax y ecocardiograma.",
  "POCUS/RUSH à beira leito quando a causa não for rapidamente evidente, quando o paciente não responder ao manejo inicial, ou na deterioração clínica rápida.":
    "POCUS/RUSH a pie de cama cuando la causa no sea rápidamente evidente, cuando el paciente no responda al manejo inicial, o ante deterioro clínico rápido.",

  // ── Hipovolêmico / hemorrágico ──
  "Ações: 2 acessos calibrosos; bólus inicial de 500–1000 mL de cristaloide; controlar a fonte (hemostasia/cirurgia); hemoderivados e protocolo de transfusão maciça se hemorrágico; reavaliar após cada alíquota.":
    "Acciones: 2 accesos de grueso calibre; bolo inicial de 500–1000 mL de cristaloide; controlar la fuente (hemostasia/cirugía); hemoderivados y protocolo de transfusión masiva si es hemorrágico; reevaluar tras cada alícuota.",
  "Classificação do choque hemorrágico (ATLS): classe I até 750 mL (15%), FC < 100, PA normal · classe II 750–1500 mL (15–30%), FC 100–120, pressão de pulso estreita · classe III 1500–2000 mL (30–40%), FC 120–140, PA reduzida · classe IV acima de 2000 mL (> 40%), FC > 140, confusão e letargia.":
    "Clasificación del choque hemorrágico (ATLS): clase I hasta 750 mL (15%), FC < 100, PA normal · clase II 750–1500 mL (15–30%), FC 100–120, presión de pulso estrecha · clase III 1500–2000 mL (30–40%), FC 120–140, PA reducida · clase IV más de 2000 mL (> 40%), FC > 140, confusión y letargia.",
  "Atenção: pressão arterial normal NÃO exclui hemorragia importante. A resposta compensatória, a idade, medicamentos, gestação, reserva fisiológica e a velocidade da perda podem dissociar a pressão arterial da gravidade do sangramento; não use um percentual fixo de perda volêmica como limiar diagnóstico. Integre perfusão periférica, estado mental, tendência hemodinâmica, mecanismo/fonte, POCUS quando útil e resposta à ressuscitação.":
    "Atención: una presión arterial normal NO excluye una hemorragia importante. La respuesta compensatoria, la edad, los medicamentos, el embarazo, la reserva fisiológica y la velocidad de la pérdida pueden disociar la presión arterial de la gravedad del sangrado; no use un porcentaje fijo de pérdida de volemia como umbral diagnóstico. Integre perfusión periférica, estado mental, tendencia hemodinámica, mecanismo/fuente, POCUS cuando sea útil y respuesta a la reanimación.",
  "Metas no hemorrágico até a hemostasia: hipotensão permissiva pode ser considerada em casos selecionados (PAM-alvo 50 mmHg), tolerando PAM < 65 no sangramento ativo — EXCETO em lesão cerebral grave, em que o alvo é PAM 90–100 mmHg.":
    "Metas en el hemorrágico hasta la hemostasia: la hipotensión permisiva puede considerarse en casos seleccionados (PAM objetivo 50 mmHg), tolerando PAM < 65 en el sangrado activo — EXCEPTO en lesión cerebral grave, donde el objetivo es PAM 90–100 mmHg.",
  "Hemoglobina-alvo 7–8 g/dL; em paciente neurológico agudo, 9–10 g/dL. Corrigir a coagulopatia guiada por tromboelastometria quando disponível.":
    "Hemoglobina objetivo 7–8 g/dL; en paciente neurológico agudo, 9–10 g/dL. Corregir la coagulopatía guiada por tromboelastometría cuando esté disponible.",
  "Manter temperatura entre 35,7 e 37 °C; repor cálcio durante a transfusão maciça (o protocolo-fonte usa cloreto de cálcio a cada 2 hemocomponentes — seguir o regime institucional); suspender anticoagulantes, antiagregantes e fibrinolíticos.":
    "Mantener la temperatura entre 35,7 y 37 °C; reponer calcio durante la transfusión masiva (el protocolo fuente usa cloruro de calcio cada 2 hemocomponentes — seguir el régimen institucional); suspender anticoagulantes, antiagregantes y fibrinolíticos.",
  "Acidemia: evitar bicarbonato de rotina e considerar vasopressor mais precocemente; bicarbonato de sódio 8,4% 1 mEq/kg apenas se pH < 7,1 e/ou bicarbonato < 12 mEq/L.":
    "Acidemia: evitar el bicarbonato de rutina y considerar el vasopresor más precozmente; bicarbonato de sodio 8,4% 1 mEq/kg solo si pH < 7,1 y/o bicarbonato < 12 mEq/L.",

  // ── Cardiogênico: pergunta de subtipo ──
  "Qual o perfil do choque cardiogênico?": "¿Cuál es el perfil del choque cardiogénico?",
  "O subtipo muda a conduta — sobretudo quanto a volume e a inotrópico. Qual se aplica?":
    "El subtipo cambia la conducta — sobre todo en cuanto a volumen e inotrópico. ¿Cuál se aplica?",
  "Síndrome coronariana aguda é uma causa crítica e tempo-dependente de choque cardiogênico, mas não representa todo o espectro contemporâneo. Obter ECG precocemente e investigar isquemia/reperfusão sem atrasar a definição hemodinâmica do choque.":
    "El síndrome coronario agudo es una causa crítica y tiempo-dependiente de choque cardiogénico, pero no representa todo el espectro contemporáneo. Obtenga un ECG precoz e investigue isquemia/reperfusión sin retrasar la definición hemodinámica del choque.",
  "Choque cardiogênico não relacionado a IAM é substancial e vem ganhando importância, incluindo insuficiência cardíaca aguda/descompensada, valvopatias, miocardite, arritmias e outras causas de falência de bomba.":
    "El choque cardiogénico no relacionado con infarto es sustancial y gana importancia, incluyendo insuficiencia cardiaca aguda/descompensada, valvulopatías, miocarditis, arritmias y otras causas de fallo de bomba.",
  "Complicações mecânicas do IAM (ruptura de septo, ruptura valvar) exigem alto índice de suspeita e ecocardiograma rápido — ocorrem mais nas primeiras 24 h.":
    "Las complicaciones mecánicas del IAM (rotura de septo, rotura valvular) exigen alto índice de sospecha y ecocardiograma rápido — ocurren sobre todo en las primeras 24 h.",
  "Se o subtipo não estiver claro, siga em 'Não definido' e reavalie com o ecocardiograma.":
    "Si el subtipo no está claro, siga en 'No definido' y reevalúe con el ecocardiograma.",
  "Ventrículo direito / IAM de VD": "Ventrículo derecho / IAM de VD",
  "Clássico — frio e úmido (congesto)": "Clásico — frío y húmedo (congestivo)",
  "Euvolêmico — frio e seco": "Euvolémico — frío y seco",
  "Choque com normotensão (PAS > 90)": "Choque con normotensión (PAS > 90)",
  "Valvopatia ou obstrução da via de saída": "Valvulopatía u obstrucción del tracto de salida",
  "Bradiarritmia como causa": "Bradiarritmia como causa",
  "Não definido — conduta geral": "No definido — conducta general",

  // ── Cardiogênico: VD ──
  "Choque CARDIOGÊNICO — ventrículo direito": "Choque CARDIOGÉNICO — ventrículo derecho",
  "Falência do VD. Aqui a regra do 'evitar volume' NÃO se aplica.":
    "Falla del VD. Aquí la regla de 'evitar volumen' NO se aplica.",
  "Mecanismo: falência do VD com queda da pré-carga do VE. O IAM de VD NÃO cursa com congestão pulmonar e responde bem à infusão de volume — o oposto do IAM de VE.":
    "Mecanismo: falla del VD con caída de la precarga del VI. El IAM de VD NO cursa con congestión pulmonar y responde bien a la infusión de volumen — lo opuesto al IAM de VI.",
  "Confirmar: ECG com derivações direitas (V3R–V4R) no IAM inferior; ECO com VD dilatado/hipocontrátil; ausência de congestão pulmonar.":
    "Confirmar: ECG con derivaciones derechas (V3R–V4R) en el IAM inferior; ECO con VD dilatado/hipocontráctil; ausencia de congestión pulmonar.",
  "Ações: administrar fluidos com a meta de recuperar e manter a pré-carga; noradrenalina; tratar bradiarritmia (absoluta ou relativa) e manter o sincronismo atrioventricular; considerar acrescentar ou transicionar para inotrópico.":
    "Acciones: administrar fluidos con la meta de recuperar y mantener la precarga; noradrenalina; tratar la bradiarritmia (absoluta o relativa) y mantener el sincronismo auriculoventricular; considerar agregar o transicionar a un inotrópico.",
  "Reperfusão coronariana quando o IAM for a causa.": "Reperfusión coronaria cuando el IAM sea la causa.",
  "IAM de VD — reperfusão.": "IAM de VD — reperfusión.",
  "Titulação de vasopressor e inotrópico.": "Titulación de vasopresor e inotrópico.",

  // ── Cardiogênico: frio e úmido ──
  "Choque CARDIOGÊNICO — frio e úmido": "Choque CARDIOGÉNICO — frío y húmedo",
  "O perfil clássico: baixo débito com congestão. Volume agressivo piora.":
    "El perfil clásico: bajo gasto con congestión. El volumen agresivo empeora.",
  "Mecanismo: ↓ contratilidade → ↓ débito com pressões de enchimento altas.":
    "Mecanismo: ↓ contractilidad → ↓ gasto cardíaco con presiones de llenado altas.",
  "Confirmar: extremidades frias, congestão pulmonar ao exame/RX/ECO, FE reduzida.":
    "Confirmar: extremidades frías, congestión pulmonar al examen/Rx/ECO, FE reducida.",
  "Ações: estabilização hemodinâmica com NORADRENALINA (vasopressor de escolha); considerar acrescentar inotrópico; evitar expansão volêmica — mais de 70% dos IAM de VE em choque já têm congestão e pioram com volume.":
    "Acciones: estabilización hemodinámica con NORADRENALINA (vasopresor de elección); considerar agregar inotrópico; evitar la expansión con volumen — más del 70% de los IAM de VI en choque ya tienen congestión y empeoran con volumen.",
  "Reperfusão coronariana quando o IAM for a causa; considerar suporte circulatório mecânico conforme disponibilidade e avaliação especializada.":
    "Reperfusión coronaria cuando el IAM sea la causa; considerar soporte circulatorio mecánico según disponibilidad y evaluación especializada.",

  // ── Cardiogênico: frio e seco ──
  "Ações: se houver baixa pré-carga provável ou responsividade demonstrada, testar PEQUENA alíquota e reavaliar imediatamente volume sistólico/perfusão e sinais de congestão; interromper se não houver benefício. Na hipotensão, usar noradrenalina; considerar inotrópico se baixo débito persistir com pressão adequada.":
    "Acciones: si hay baja precarga probable o respuesta a volumen demostrada, probar una PEQUEÑA alícuota y reevaluar de inmediato volumen sistólico/perfusión y signos de congestión; suspender si no hay beneficio. Ante hipotensión, usar noradrenalina; considerar un inotrópico si persiste bajo gasto con presión adecuada.",
  "Mecanismo: baixo débito sem congestão clínica pode coexistir com baixa pré-carga, mas também com falência de bomba sem responsividade a volume; confirmar o fenótipo antes de expandir.":
    "Mecanismo: el bajo gasto sin congestión clínica puede coexistir con baja precarga, pero también con fallo de bomba sin respuesta a volumen; confirmar el fenotipo antes de expandir.",
  "Baixo débito SEM congestão: ausência de congestão, sozinha, NÃO prova responsividade a volume.":
    "Bajo gasto SIN congestión: la ausencia de congestión, por sí sola, NO demuestra respuesta a volumen.",
  "Ações: na hipotensão, usar NORADRENALINA como vasopressor de primeira linha; considerar inotrópico quando houver baixo débito persistente apesar de pressão adequada. Na presença de congestão, NÃO usar expansão volêmica empírica como tratamento primário; reavaliar perfusão e congestão após cada intervenção.":
    "Acciones: ante hipotensión, usar NORADRENALINA como vasopresor de primera línea; considerar un inotrópico cuando persista bajo gasto a pesar de una presión adecuada. En presencia de congestión, NO usar expansión con volumen empírica como tratamiento primario; reevaluar perfusión y congestión después de cada intervención.",
  "Choque CARDIOGÊNICO — frio e seco": "Choque CARDIOGÉNICO — frío y seco",
  "Baixo débito SEM congestão: aqui cabem alíquotas de volume.":
    "Bajo gasto SIN congestión: aquí sí caben alícuotas de volumen.",
  "Mecanismo: baixo débito com pressão diastólica final do VE possivelmente baixa — o paciente pode tolerar bólus de fluido.":
    "Mecanismo: bajo gasto con presión diastólica final del VI posiblemente baja — el paciente puede tolerar un bolo de fluido.",
  "Confirmar: extremidades frias sem congestão pulmonar; ECO sem sinais de sobrecarga de volume.":
    "Confirmar: extremidades frías sin congestión pulmonar; ECO sin signos de sobrecarga de volumen.",
  "Ações: fluidos em PEQUENAS alíquotas, reavaliando a cada uma; estabilização hemodinâmica com noradrenalina; considerar acrescentar inotrópico.":
    "Acciones: fluidos en PEQUEÑAS alícuotas, reevaluando tras cada una; estabilización hemodinámica con noradrenalina; considerar agregar inotrópico.",
  "Titulação de inotrópico e vasopressor.": "Titulación de inotrópico y vasopresor.",

  // ── Cardiogênico: normotenso ──
  "Choque CARDIOGÊNICO — com normotensão": "Choque CARDIOGÉNICO — con normotensión",
  "Hipoperfusão com PAS > 90 mmHg e resistência vascular relativamente alta.":
    "Hipoperfusión con PAS > 90 mmHg y resistencia vascular relativamente alta.",
  "Mecanismo: baixo débito compensado por vasoconstrição — a PA está preservada, a perfusão não.":
    "Mecanismo: bajo gasto compensado por vasoconstricción — la PA está preservada, la perfusión no.",
  "Confirmar: sinais de hipoperfusão (lactato, oligúria, pele fria) apesar de PAS > 90 mmHg.":
    "Confirmar: signos de hipoperfusión (lactato, oliguria, piel fría) a pesar de PAS > 90 mmHg.",
  "Ações: começar por INOTRÓPICO pode ser apropriado, já que a resistência vascular sistêmica está relativamente alta — dobutamina, milrinone ou levosimendana.":
    "Acciones: comenzar por un INOTRÓPICO puede ser apropiado, ya que la resistencia vascular sistémica está relativamente alta — dobutamina, milrinona o levosimendán.",
  "Reavaliar continuamente: se a PA cair, associar vasopressor.":
    "Reevaluar continuamente: si la PA cae, asociar vasopresor.",
  "Titulação de inotrópico.": "Titulación de inotrópico.",

  // ── Cardiogênico: valvopatia e obstrução ──
  "Choque CARDIOGÊNICO — valvopatia ou obstrução da via de saída":
    "Choque CARDIOGÉNICO — valvulopatía u obstrucción del tracto de salida",
  "Cada lesão tem uma conduta própria — e algumas são opostas entre si.":
    "Cada lesión tiene una conducta propia — y algunas son opuestas entre sí.",
  "Estenose aórtica: noradrenalina ± dobutamina. Com FE reduzida, considerar dobutamina titulada por ecocardiograma ou cateter de artéria pulmonar; com FE preservada, o inotrópico não traz ganho hemodinâmico.":
    "Estenosis aórtica: noradrenalina ± dobutamina. Con FE reducida, considerar dobutamina titulada por ecocardiograma o catéter de arteria pulmonar; con FE preservada, el inotrópico no aporta ganancia hemodinámica.",
  "Insuficiência aórtica: dopamina; considerar marca-passo temporário para manter a FC alta — a FC alta reduz o tempo de enchimento diastólico e ajuda a baixar a pressão diastólica final do VE.":
    "Insuficiencia aórtica: dopamina; considerar marcapasos temporal para mantener la FC alta — la FC alta reduce el tiempo de llenado diastólico y ayuda a bajar la presión diastólica final del VI.",
  "Estenose mitral: noradrenalina ± amiodarona. EVITAR cronotrópicos — aqui o choque é pré-carga dependente; reduzir a FC e manter a sincronia atrioventricular melhoram a pré-carga.":
    "Estenosis mitral: noradrenalina ± amiodarona. EVITAR cronotrópicos — aquí el choque es precarga dependiente; reducir la FC y mantener la sincronía auriculoventricular mejoran la precarga.",
  "Insuficiência mitral: noradrenalina ± dobutamina ± balão intra-aórtico. Depois de estabilizar com vasopressor, considerar inotrópico; a redução da pós-carga ajuda a baixar a pressão diastólica final do VE.":
    "Insuficiencia mitral: noradrenalina ± dobutamina ± balón de contrapulsación intraaórtico. Tras estabilizar con vasopresor, considerar inotrópico; la reducción de la poscarga ayuda a bajar la presión diastólica final del VI.",
  "Obstrução dinâmica da via de saída do VE: alíquotas de fluido em bólus, noradrenalina, manter a sincronia atrioventricular e EVITAR inotrópicos e vasodilatadores.":
    "Obstrucción dinámica del tracto de salida del VI: alícuotas de fluido en bolo, noradrenalina, mantener la sincronía auriculoventricular y EVITAR inotrópicos y vasodilatadores.",
  "Ruptura de septo interventricular: noradrenalina ± dobutamina ± balão intra-aórtico, com avaliação cirúrgica imediata.":
    "Rotura del septo interventricular: noradrenalina ± dobutamina ± balón de contrapulsación intraaórtico, con evaluación quirúrgica inmediata.",
  "Avaliação especializada e ecocardiograma são parte da conduta, não etapa posterior.":
    "La evaluación especializada y el ecocardiograma son parte de la conducta, no una etapa posterior.",
  "Titulação por lesão valvar.": "Titulación según la lesión valvular.",

  // ── Cardiogênico: bradiarritmia ──
  "Choque CARDIOGÊNICO — bradiarritmia": "Choque CARDIOGÉNICO — bradiarritmia",
  "O débito caiu por frequência; tratar a frequência é tratar o choque.":
    "El gasto cardíaco cayó por la frecuencia; tratar la frecuencia es tratar el choque.",
  "Mecanismo: débito cardíaco insuficiente por frequência baixa (absoluta ou inapropriada para a demanda).":
    "Mecanismo: gasto cardíaco insuficiente por frecuencia baja (absoluta o inapropiada para la demanda).",
  "Ações: agente cronotrópico ou marca-passo temporário — atropina, dopamina ou adrenalina.":
    "Acciones: agente cronotrópico o marcapasos temporal — atropina, dopamina o adrenalina.",
  "Identificar e tratar a causa da bradiarritmia (isquemia, fármacos, distúrbio eletrolítico, hipotermia, BAV).":
    "Identificar y tratar la causa de la bradiarritmia (isquemia, fármacos, trastorno electrolítico, hipotermia, BAV).",
  "Escalonamento de atropina, cronotrópicos e marca-passo.":
    "Escalonamiento de atropina, cronotrópicos y marcapasos.",
  "Titulação de cronotrópico.": "Titulación de cronotrópico.",

  // ── Nó genérico ──
  "Ações: EVITAR volume agressivo; noradrenalina como vasopressor de escolha, com inotrópico (dobutamina) associado; tratar a causa (reperfusão no IAM; cardioversão na arritmia instável); considerar suporte mecânico (BIA/Impella/ECMO).":
    "Acciones: EVITAR volumen agresivo; noradrenalina como vasopresor de elección, con inotrópico (dobutamina) asociado; tratar la causa (reperfusión en el IAM; cardioversión en la arritmia inestable); considerar soporte mecánico (BCIA/Impella/ECMO).",
  "⚠️ EXCEÇÃO — IAM de ventrículo direito: NÃO cursa com congestão pulmonar e responde bem a volume. Regra do 'evitar volume' não se aplica; a conduta é oposta à do VE.":
    "⚠️ EXCEPCIÓN — IAM de ventrículo derecho: NO cursa con congestión pulmonar y responde bien a volumen. La regla de 'evitar volumen' no se aplica; la conducta es opuesta a la del VI.",
  "Na ausência de sinais de congestão, administrar pequenas alíquotas de fluido e reavaliar os parâmetros clínicos a cada uma.":
    "En ausencia de signos de congestión, administrar pequeñas alícuotas de fluido y reevaluar los parámetros clínicos tras cada una.",
  "Os objetivos gerais são restaurar perfusão e oferta de oxigênio, mas os alvos numéricos NÃO são universais: devem seguir etiologia, sangramento/isquemia, comorbidades e resposta ao tratamento.":
    "Los objetivos generales son restaurar la perfusión y el aporte de oxígeno, pero los objetivos numéricos NO son universales: deben ajustarse a la etiología, sangrado/isquemia, comorbilidades y respuesta al tratamiento.",
  "Oferta de O₂: não usar hemoglobina ≥7 g/dL nem SpO₂ >90% como metas universais de todo choque. Em adultos hospitalizados hemodinamicamente estáveis, estratégia transfusional restritiva costuma considerar transfusão quando Hb <7 g/dL; esse limiar não se aplica automaticamente a hemorragia ativa/exsanguinante e deve ser individualizado em doença cardiovascular/isquemia. Oxigênio e alvo de saturação também devem seguir hipoxemia e contexto clínico, evitando tratar um número isolado como objetivo único de ressuscitação.":
    "Aporte de O₂: no usar hemoglobina ≥7 g/dL ni SpO₂ >90% como objetivos universales de todo choque. En adultos hospitalizados hemodinámicamente estables, una estrategia transfusional restrictiva suele considerar transfusión cuando Hb <7 g/dL; este umbral no se aplica automáticamente a hemorragia activa/exanguinante y debe individualizarse en enfermedad cardiovascular/isquemia. El oxígeno y el objetivo de saturación también deben seguir la hipoxemia y el contexto clínico, evitando tratar un número aislado como único objetivo de reanimación.",
};
