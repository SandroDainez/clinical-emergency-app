/**
 * ES — SCA V2: o caminho crítico por decisões clínicas.
 *
 * ⚠️ MÓDULO PRÓPRIO, e não um apêndice do dicionário da V1, porque as duas
 * árvores convivem: quando a V2 substituir a V1, este arquivo continua e o
 * outro é que sai. Misturar as duas obrigaria a separá-las depois, sem que
 * nada indicasse qual entrada pertence a qual.
 *
 * Termos da especialidade, não literalidade: "supradesnível" é "elevación del
 * ST" no uso hispanofalante, "traçado" é "trazado", "derivações" é
 * "derivaciones". O médico precisa reconhecer o achado na tela.
 */
export const scaV2Es: Record<string, string> = {
  // ── Módulo e tela ────────────────────────────────────────────────────
  "Coronarianas · V2": "Coronarias · V2",
  "Síndromes Coronarianas · V2": "Síndromes Coronarios · V2",
  "Caminho crítico por decisões": "Camino crítico por decisiones",
  "SCA V2 · Emergência": "SCA V2 · Emergencia",
  "Versão em avaliação: o atendimento organizado em três decisões clínicas, com o ECG guiado no ponto de cada decisão. Implementa o caminho crítico — entrada, ECG, STEMI, ICP ou fibrinólise e reavaliação. O módulo de Síndromes Coronarianas (V1) segue completo.":
    "Versión en evaluación: la atención organizada en tres decisiones clínicas, con el ECG guiado en el punto de cada decisión. Implementa el camino crítico — entrada, ECG, STEMI, ICP o fibrinólisis y reevaluación. El módulo de Síndromes Coronarios (V1) sigue completo.",

  // ── 01 · Entrada ─────────────────────────────────────────────────────
  "Faça agora, em paralelo. Nada aqui espera exame.":
    "Haga ahora, en paralelo. Nada aquí espera un examen.",
  "Área monitorada: monitor cardíaco, 2 acessos venosos, desfibrilador próximo":
    "Área monitorizada: monitor cardíaco, 2 accesos venosos, desfibrilador cerca",
  "Não atrasar a reperfusão por exame nenhum":
    "No retrasar la reperfusión por ningún examen",
  "Tempo é músculo. As medidas iniciais correm ao lado do ECG, não antes dele.":
    "Tiempo es músculo. Las medidas iniciales corren junto al ECG, no antes de él.",

  // ── 02 · Linha do tempo ──────────────────────────────────────────────
  "Linha do tempo da SCA": "Línea de tiempo del SCA",
  "Meta: obter E INTERPRETAR o ECG em até 10 min do primeiro contato médico. Um ECG feito no prazo e lido depois não cumpriu a meta.":
    "Meta: obtener E INTERPRETAR el ECG en hasta 10 min del primer contacto médico. Un ECG hecho a tiempo y leído después no cumplió la meta.",
  "Há quantos minutos começaram os sintomas?": "¿Hace cuántos minutos comenzaron los síntomas?",
  "2 h ou mais": "2 h o más",
  "mais de 12 h": "más de 12 h",
  "~60 min": "~60 min",
  "~90 min": "~90 min",

  // ── 03/04 · Ameaças e estabilização ──────────────────────────────────
  "Há ameaça imediata à vida?": "¿Hay amenaza inmediata para la vida?",
  "Um bloco só. O app conclui a gravidade a partir do que você medir.":
    "Un solo bloque. La app concluye la gravedad a partir de lo que usted mida.",
  "A ameaça identificada tem precedência. O fluxo volta a este ponto.":
    "La amenaza identificada tiene prioridad. El flujo vuelve a este punto.",
  "Tratar a ameaça identificada antes de avançar na classificação do ECG":
    "Tratar la amenaza identificada antes de avanzar en la clasificación del ECG",
  "A reperfusão continua sendo o objetivo — estabilizar não é adiar":
    "La reperfusión sigue siendo el objetivo — estabilizar no es posponer",
  "Abrir o módulo da ameaça": "Abrir el módulo de la amenaza",

  // ── 05/06 · Decisão 1 e ajuda ────────────────────────────────────────
  "Decisão 1 de 3 · O ECG": "Decisión 1 de 3 · El ECG",
  "Há supradesnível persistente do segmento ST ou equivalente de oclusão?":
    "¿Hay elevación persistente del segmento ST o equivalente de oclusión?",
  "Compare com o traçado normal ao lado.": "Compare con el trazado normal al lado.",
  "O segmento ST volta à linha de base depois do QRS.":
    "El segmento ST vuelve a la línea de base después del QRS.",
  "O ST permanece acima da linha de base antes da onda T.":
    "El ST permanece por encima de la línea de base antes de la onda T.",
  "Referência para comparação.": "Referencia para comparación.",
  "Critério de STEMI — reperfusão.": "Criterio de STEMI — reperfusión.",
  "Sim — há supra ou equivalente": "Sí — hay elevación o equivalente",
  "Reconhecer supra e equivalentes": "Reconocer elevación del ST y equivalentes",
  "Com estes critérios e traçados, o ECG tem supra ou equivalente de oclusão?":
    "Con estos criterios y trazados, ¿el ECG tiene elevación del ST o equivalente de oclusión?",
  "ST na linha de base.": "ST en la línea de base.",
  "ST acima da linha de base, persistente.": "ST por encima de la línea de base, persistente.",
  "Infra ascendente em V1–V6 com T altas e simétricas — oclusão proximal da DA.":
    "Infradesnivel ascendente en V1–V6 con T altas y simétricas — oclusión proximal de la DA.",
  "Sala de hemodinâmica agora; o padrão pode não virar supra.":
    "Sala de hemodinamia ahora; el patrón puede no convertirse en elevación.",
  "V1–V3 com infra horizontal, R alta e larga, T positiva.":
    "V1–V3 con infradesnivel horizontal, R alta y ancha, T positiva.",
  "Confirmar com V7–V9 — o limiar ali é 0,5 mm.":
    "Confirmar con V7–V9 — el umbral allí es 0,5 mm.",
  "Tem supra ou equivalente": "Tiene elevación o equivalente",
  "Continuo sem conseguir determinar": "Sigo sin poder determinarlo",
  "sem supra": "sin elevación del ST",
  "ainda não sei": "aún no lo sé",

  // ── 06b · ECG indeterminado ──────────────────────────────────────────
  "ECG ainda não classificado": "ECG aún no clasificado",
  "Isto não é 'sem supra'. É 'ainda não sei'.":
    "Esto no es 'sin elevación'. Es 'aún no lo sé'.",
  "Repetir o ECG agora e comparar com o traçado anterior, se houver":
    "Repetir el ECG ahora y compararlo con el trazado anterior, si lo hay",
  "Registrar V7–V9 (posterior) e V3R–V4R (ventrículo direito) — dois padrões só aparecem em derivações que ninguém colocou":
    "Registrar V7–V9 (posterior) y V3R–V4R (ventrículo derecho) — dos patrones solo aparecen en derivaciones que nadie colocó",
  "Discutir com quem vai assumir o paciente: ligar para o serviço de referência custa minutos":
    "Hablar con quien va a recibir al paciente: llamar al servicio de referencia cuesta minutos",
  "Enquanto a leitura não fecha, o paciente não sai da fila da reperfusão — a dúvida não o move para o ramo sem supra.":
    "Mientras la lectura no cierre, el paciente no sale de la fila de la reperfusión — la duda no lo mueve a la rama sin elevación.",

  // ── 07 · Território ──────────────────────────────────────────────────
  "Ramo A · Território": "Rama A · Territorio",
  "Em quais derivações está o supradesnível?": "¿En qué derivaciones está la elevación del ST?",
  "Inferior — II, III, aVF": "Inferior — II, III, aVF",
  "Anterior/septal — V1–V4": "Anterior/septal — V1–V4",
  "Lateral — I, aVL, V5–V6": "Lateral — I, aVL, V5–V6",
  "Posterior — V7–V9": "Posterior — V7–V9",
  "Não consigo localizar": "No logro localizarla",
  "Supra nas derivações inferiores.": "Elevación en las derivaciones inferiores.",
  "Supra nas precordiais anteriores.": "Elevación en las precordiales anteriores.",
  "Supra nas derivações laterais.": "Elevación en las derivaciones laterales.",
  "Imagem em espelho em V1–V3; confirmar nas posteriores.":
    "Imagen en espejo en V1–V3; confirmar en las posteriores.",
  "Pesquisar ventrículo direito com V3R–V4R.": "Investigar ventrículo derecho con V3R–V4R.",
  "Supra de 0,5 mm em V7–V9 já fecha o diagnóstico.":
    "Una elevación de 0,5 mm en V7–V9 ya cierra el diagnóstico.",

  // ── 08 · Ventrículo direito ──────────────────────────────────────────
  "Ramo A · Ventrículo direito": "Rama A · Ventrículo derecho",
  "As derivações direitas (V3R–V4R) mostram supradesnível?":
    "¿Las derivaciones derechas (V3R–V4R) muestran elevación del ST?",
  "Sim — supra em V3R–V4R": "Sí — elevación en V3R–V4R",
  "Não há supra nas direitas": "No hay elevación en las derechas",
  "Ainda não registrei V3R–V4R": "Aún no registré V3R–V4R",

  // ── 09 · Decisão 2 ───────────────────────────────────────────────────
  "Decisão 2 de 3 · Reperfusão mecânica": "Decisión 2 de 3 · Reperfusión mecánica",
  "A intervenção coronária percutânea primária pode ocorrer em até 120 minutos a partir do primeiro contato médico?":
    "¿La intervención coronaria percutánea primaria puede ocurrir en hasta 120 minutos desde el primer contacto médico?",
  "Se a resposta for sim, a ICP primária é a estratégia preferida.":
    "Si la respuesta es sí, la ICP primaria es la estrategia preferida.",
  "Sim — ativar hemodinâmica": "Sí — activar hemodinamia",
  "Não — avaliar fibrinólise": "No — evaluar fibrinólisis",
  "Não sei estimar o tempo — me ajude": "No sé estimar el tiempo — ayúdeme",
  "O que entra nos 120 minutos": "Qué entra en los 120 minutos",
  "Com estes componentes somados, a ICP cabe em 120 min do primeiro contato?":
    "Con estos componentes sumados, ¿la ICP cabe en 120 min del primer contacto?",
  "O relógio conta do PRIMEIRO CONTATO MÉDICO até o DISPOSITIVO cruzar a lesão — não do diagnóstico, não da chegada ao hospital com hemodinâmica.":
    "El reloj cuenta desde el PRIMER CONTACTO MÉDICO hasta que el DISPOSITIVO cruza la lesión — no desde el diagnóstico, no desde la llegada al hospital con hemodinamia.",
  "Some: tempo até a decisão + acionamento e deslocamento da ambulância + transporte + porta do hospital receptor até a sala + preparo até o dispositivo.":
    "Sume: tiempo hasta la decisión + activación y desplazamiento de la ambulancia + transporte + puerta del hospital receptor hasta la sala + preparación hasta el dispositivo.",
  "Se o paciente já está em hospital com hemodinâmica, a meta operacional é mais curta e a fibrinólise raramente entra na conta.":
    "Si el paciente ya está en un hospital con hemodinamia, la meta operativa es más corta y la fibrinólisis rara vez entra en cuenta.",
  "⚠️ Na dúvida entre transferir e trombolisar, o critério não é a distância em quilômetros — é o tempo real porta-dispositivo que o seu serviço consegue reproduzir num dia comum.":
    "⚠️ Ante la duda entre trasladar y trombolizar, el criterio no es la distancia en kilómetros — es el tiempo real puerta-dispositivo que su servicio logra reproducir en un día común.",
  "Cabe em 120 min": "Cabe en 120 min",
  "Não cabe": "No cabe",
  "Continuo sem conseguir estimar": "Sigo sin poder estimarlo",
  "⏱️ Meta de 120 min do primeiro contato até o dispositivo.":
    "⏱️ Meta de 120 min desde el primer contacto hasta el dispositivo.",
  "⏱️ Passou dos 120 min do primeiro contato. A janela da ICP primária como estratégia preferida se fechou — reavaliar fibrinólise se ainda houver indicação.":
    "⏱️ Pasaron los 120 min del primer contacto. La ventana de la ICP primaria como estrategia preferida se cerró — reevaluar fibrinólisis si aún hay indicación.",

  // ── 10 · ICP primária ────────────────────────────────────────────────
  "ICP primária — ativar agora": "ICP primaria — activar ahora",
  "Abrir a artéria culpada o mais cedo possível.": "Abrir la arteria culpable lo antes posible.",
  "Ativar a hemodinâmica agora": "Activar la hemodinamia ahora",
  "Acesso radial preferencial; tratar primeiro a artéria culpada":
    "Acceso radial preferente; tratar primero la arteria culpable",
  "Antitrombóticos e controle de dor em paralelo — sem atrasar a sala":
    "Antitrombóticos y control del dolor en paralelo — sin retrasar la sala",

  // ── 11/12 · Decisão 3 e contraindicações ─────────────────────────────
  "Decisão 3 de 3 · Fibrinólise": "Decisión 3 de 3 · Fibrinólisis",
  "Sintomas há menos de 12 horas e sem contraindicação absoluta à fibrinólise?":
    "¿Síntomas de menos de 12 horas y sin contraindicación absoluta a la fibrinólisis?",
  "Se elegível, o fibrinolítico deve sair idealmente em até 30 minutos.":
    "Si es elegible, el fibrinolítico debe administrarse idealmente en hasta 30 minutos.",
  "Sim — elegível": "Sí — elegible",
  "Não — há contraindicação absoluta": "No — hay contraindicación absoluta",
  "Preciso conferir a lista": "Necesito revisar la lista",
  "⏱️ Janela de 12 h do início dos sintomas para a fibrinólise.":
    "⏱️ Ventana de 12 h desde el inicio de los síntomas para la fibrinólisis.",
  "⏱️ Passou de 12 h do início dos sintomas. Fora da janela, a fibrinólise deixa de ser a estratégia — a decisão passa a ser sobre isquemia persistente e transferência.":
    "⏱️ Pasaron 12 h del inicio de los síntomas. Fuera de la ventana, la fibrinólisis deja de ser la estrategia — la decisión pasa a ser sobre isquemia persistente y traslado.",
  "Marque o que estiver PRESENTE. Item que você não consegue afastar conta como presente.":
    "Marque lo que esté PRESENTE. El ítem que usted no logra descartar cuenta como presente.",
  "Absolutas": "Absolutas",
  "Relativas": "Relativas",
  "Hemorragia intracraniana prévia, em qualquer época":
    "Hemorragia intracraneal previa, en cualquier época",
  "Lesão vascular cerebral estrutural (MAV, aneurisma)":
    "Lesión vascular cerebral estructural (MAV, aneurisma)",
  "Neoplasia intracraniana maligna": "Neoplasia intracraneal maligna",
  "AVC isquêmico nos últimos 3 meses": "ACV isquémico en los últimos 3 meses",
  "Suspeita de dissecção de aorta": "Sospecha de disección aórtica",
  "Sangramento ativo ou diátese hemorrágica": "Sangrado activo o diátesis hemorrágica",
  "Trauma craniano/facial significativo nos últimos 3 meses":
    "Traumatismo craneal/facial significativo en los últimos 3 meses",
  "Cirurgia intracraniana ou intraespinhal nos últimos 2 meses":
    "Cirugía intracraneal o intraespinal en los últimos 2 meses",
  "PAS > 180 ou PAD > 110 mmHg na apresentação": "PAS > 180 o PAD > 110 mmHg en la presentación",
  "AVC isquêmico prévio há mais de 3 meses": "ACV isquémico previo hace más de 3 meses",
  "RCP traumática ou prolongada (> 10 min)": "RCP traumática o prolongada (> 10 min)",
  "Cirurgia de grande porte há menos de 3 semanas": "Cirugía mayor hace menos de 3 semanas",
  "Sangramento interno recente (2 a 4 semanas)": "Sangrado interno reciente (2 a 4 semanas)",
  "Punção vascular não compressível": "Punción vascular no compresible",
  "Gravidez": "Embarazo",
  "Úlcera péptica ativa": "Úlcera péptica activa",
  "Uso de anticoagulante oral": "Uso de anticoagulante oral",

  // ── 13/14 · Fibrinólise e transferência ──────────────────────────────
  "Fibrinólise — tenecteplase": "Fibrinólisis — tenecteplasa",
  "Tenecteplase {tnk} mg IV em bolus único. ⚠️ 1 mg = 200 U — confira no frasco antes de aspirar, porque é bolus único e não há como corrigir depois. {avisoPeso}":
    "Tenecteplasa {tnk} mg IV en bolo único. ⚠️ 1 mg = 200 U — verifique en el frasco antes de aspirar, porque es bolo único y no hay forma de corregir después. {avisoPeso}",
  "Este peso é": "Este peso es",
  "Estimado": "Estimado",
  "Real (pesado)": "Real (pesado)",
  "Se já administrou: há quantos minutos foi o bolus?":
    "Si ya lo administró: ¿hace cuántos minutos fue el bolo?",
  "Não fibrinolisar — transferir agora": "No fibrinolizar — trasladar ahora",
  "Contraindicação absoluta ou janela inadequada.":
    "Contraindicación absoluta o ventana inadecuada.",
  "Organizar transferência imediata para intervenção coronária percutânea primária":
    "Organizar traslado inmediato para intervención coronaria percutánea primaria",
  "Ligar agora para o serviço de referência — a decisão precisa de quem vai assumir o paciente":
    "Llamar ahora al servicio de referencia — la decisión necesita a quien va a recibir al paciente",
  "Antitrombóticos e anti-isquêmicos seguem em paralelo, conforme os vereditos":
    "Antitrombóticos y antiisquémicos siguen en paralelo, según los veredictos",

  // ── 15/16 · Reavaliação e indeterminado ──────────────────────────────
  "Ramo A · Reavaliação 60–90 min": "Rama A · Reevaluación 60–90 min",
  "Houve reperfusão clínica e eletrocardiográfica?":
    "¿Hubo reperfusión clínica y electrocardiográfica?",
  "Compare com o traçado de antes do fibrinolítico.":
    "Compare con el trazado previo al fibrinolítico.",
  "Antes do fibrinolítico": "Antes del fibrinolítico",
  "Supra de ST no território acometido.": "Elevación del ST en el territorio afectado.",
  "Traçado de referência para a comparação.": "Trazado de referencia para la comparación.",
  "Reperfusão — ST resolvido": "Reperfusión — ST resuelto",
  "Queda do supra maior que 50% em relação ao traçado inicial.":
    "Caída de la elevación mayor al 50% respecto al trazado inicial.",
  "Critério eletrocardiográfico de reperfusão.": "Criterio electrocardiográfico de reperfusión.",
  "Reperfusão provável — ST caiu > 50% e a dor cedeu":
    "Reperfusión probable — el ST cayó > 50% y el dolor cedió",
  "Falha — ST não caiu, dor persiste ou há instabilidade":
    "Fallo — el ST no cayó, el dolor persiste o hay inestabilidad",
  "⏱️ Janela de 60–90 min desde o bolus para julgar a reperfusão.":
    "⏱️ Ventana de 60–90 min desde el bolo para juzgar la reperfusión.",
  "⏱️ Passou de 90 min desde o bolus sem definição. Sem critério de reperfusão, a conduta é angiografia de resgate.":
    "⏱️ Pasaron 90 min desde el bolo sin definición. Sin criterio de reperfusión, la conducta es angiografía de rescate.",
  "Avaliação indeterminada": "Evaluación indeterminada",
  "Não foi possível avaliar a reperfusão. Isto não é falha nem sucesso.":
    "No fue posible evaluar la reperfusión. Esto no es fallo ni éxito.",
  "Repetir o ECG agora, nas mesmas derivações do traçado inicial":
    "Repetir el ECG ahora, en las mismas derivaciones del trazado inicial",
  "Comparar com o traçado pré-fibrinólise — a queda do ST se mede contra ele, não contra o normal":
    "Comparar con el trazado prefibrinólisis — la caída del ST se mide contra él, no contra el normal",
  "Medir a resolução do ST: a referência é queda maior que 50% no território acometido":
    "Medir la resolución del ST: la referencia es una caída mayor al 50% en el territorio afectado",
  "Reavaliar a dor: persistente ou em piora conta como critério de falha":
    "Reevaluar el dolor: persistente o en empeoramiento cuenta como criterio de fallo",
  "Checar instabilidade hemodinâmica ou elétrica — qualquer uma delas fecha o critério de falha":
    "Verificar inestabilidad hemodinámica o eléctrica — cualquiera de ellas cierra el criterio de fallo",
  "Falha de reperfusão se define por achado objetivo. Ausência de avaliação não é ausência de reperfusão, nem prova dela — e converter a dúvida em qualquer um dos dois lados decide por um dado que ninguém tem.":
    "El fallo de reperfusión se define por un hallazgo objetivo. La ausencia de evaluación no es ausencia de reperfusión, ni prueba de ella — y convertir la duda en cualquiera de los dos lados decide por un dato que nadie tiene.",

  // ── 17/18 · Fármaco-invasiva e resgate ───────────────────────────────
  "Reperfusão provável — estratégia fármaco-invasiva":
    "Reperfusión probable — estrategia fármaco-invasiva",
  "Transferir mesmo com reperfusão aparentemente bem-sucedida.":
    "Trasladar incluso con reperfusión aparentemente exitosa.",
  "Angiografia entre 2 e 24 h do fibrinolítico, com intenção de ICP quando indicada":
    "Angiografía entre 2 y 24 h del fibrinolítico, con intención de ICP cuando esté indicada",
  "Transferir para centro com hemodinâmica — a indicação não depende de o paciente ter melhorado":
    "Trasladar a centro con hemodinamia — la indicación no depende de que el paciente haya mejorado",
  "Manter monitorização contínua: a reoclusão é possível e costuma ser precoce":
    "Mantener monitorización continua: la reoclusión es posible y suele ser precoz",
  "Falha de reperfusão — ICP de resgate": "Fallo de reperfusión — ICP de rescate",
  "Angiografia imediata com intenção de intervenção.":
    "Angiografía inmediata con intención de intervención.",
  "Acionar a hemodinâmica para angiografia de resgate agora":
    "Activar la hemodinamia para angiografía de rescate ahora",
  "Não repetir o fibrinolítico": "No repetir el fibrinolítico",
  "Transferência imediata se o serviço não tiver hemodinâmica":
    "Traslado inmediato si el servicio no tiene hemodinamia",

  // ── 19/20 · Terapias e terminais ─────────────────────────────────────
  "O que o app não consegue deduzir dos dados que você já deu.":
    "Lo que la app no puede deducir de los datos que usted ya dio.",
  "Sildenafila (Viagra, Revatio)": "Sildenafilo (Viagra, Revatio)",
  "Tadalafila (Cialis)": "Tadalafilo (Cialis)",
  "Vardenafila (Levitra)": "Vardenafilo (Levitra)",
  "Avanafila (Spedra)": "Avanafilo (Spedra)",
  "Fim do caminho crítico desta versão": "Fin del camino crítico de esta versión",
  "Até aqui vai a SCA V2 nesta etapa.": "Hasta aquí llega el SCA V2 en esta etapa.",
  "Ramo sem supra, complicações pós-IAM, unidade coronariana e checklist de alta ainda não foram construídos nesta versão":
    "La rama sin elevación, las complicaciones post-IAM, la unidad coronaria y la lista de alta aún no fueron construidas en esta versión",
  "Para esses, use o módulo de Síndromes Coronarianas (V1), que segue completo e publicado":
    "Para eso, use el módulo de Síndromes Coronarios (V1), que sigue completo y publicado",
  "Sem supra — ainda não construído nesta versão":
    "Sin elevación del ST — aún no construido en esta versión",
  "O ramo B está no mapa aprovado e vem depois deste caminho ser testado.":
    "La rama B está en el mapa aprobado y viene después de que este camino sea probado.",
  "Troponina ultrassensível seriada, reavaliação clínica e do ECG, estratificação de risco e estratégia invasiva":
    "Troponina ultrasensible seriada, reevaluación clínica y del ECG, estratificación de riesgo y estrategia invasiva",
  "Enquanto o ramo B da V2 não existe, use o módulo de Síndromes Coronarianas (V1)":
    "Mientras la rama B del V2 no exista, use el módulo de Síndromes Coronarios (V1)",

  // ── Bloco inicial reestruturado (2026-08-27) ─────────────────────────
  "Dados do paciente": "Datos del paciente",
  "Coletados uma vez. As decisões seguintes leem daqui — nada será perguntado de novo.":
    "Recolectados una vez. Las decisiones siguientes leen de aquí — nada se preguntará de nuevo.",
  "Outra": "Otra",
  "Medidas iniciais": "Medidas iniciales",
  "Tudo em paralelo. Nada aqui espera o resultado do anterior.":
    "Todo en paralelo. Nada aquí espera el resultado de lo anterior.",
  "Monitorização cardíaca contínua": "Monitorización cardíaca continua",
  "Oximetria de pulso — O₂ apenas se SpO₂ < 90%": "Oximetría de pulso — O₂ solo si SpO₂ < 90%",
  "Pressão arterial (aferir nos dois braços)": "Presión arterial (medir en ambos brazos)",
  "Acesso venoso periférico — dois se o quadro for grave":
    "Acceso venoso periférico — dos si el cuadro es grave",
  "Desfibrilador disponível ao lado do paciente": "Desfibrilador disponible junto al paciente",
  "⏱️ REALIZAR E INTERPRETAR O MAIS RÁPIDO POSSÍVEL — meta de até 10 minutos do primeiro contato médico. Em paralelo: troponina ultrassensível, hemograma, creatinina e eletrólitos. Nenhum exame atrasa a reperfusão.":
    "⏱️ REALIZAR E INTERPRETAR LO MÁS RÁPIDO POSIBLE — meta de hasta 10 minutos del primer contacto médico. En paralelo: troponina ultrasensible, hemograma, creatinina y electrolitos. Ningún examen retrasa la reperfusión.",

  // ── Decisão 1 · só supra, com traçados reais ─────────────────────────
  "O ECG mostra supradesnível de ST?": "¿El ECG muestra elevación del ST?",
  "Compare com o traçado normal ao lado. Apoio visual — o diagnóstico é no ECG do seu paciente.":
    "Compare con el trazado normal al lado. Apoyo visual — el diagnóstico se hace en el ECG de su paciente.",
  "Normal — DII": "Normal — DII",
  "Supra de ST — V3": "Elevación del ST — V3",
  "Infra de ST — DII": "Infradesnivel del ST — DII",
  "Ritmo sinusal, segmento ST na linha de base.": "Ritmo sinusal, segmento ST en la línea de base.",
  "Ritmo sinusal, ST na linha de base, T positiva.":
    "Ritmo sinusal, ST en la línea de base, T positiva.",
  "ST elevado e convexo, acima da linha de base antes da onda T.":
    "ST elevado y convexo, por encima de la línea de base antes de la onda T.",
  "ST elevado e convexo — lesão transmural.": "ST elevado y convexo — lesión transmural.",
  "ST deprimido — isquemia subendocárdica.": "ST deprimido — isquemia subendocárdica.",
  "É supra: siga para o território.": "Es elevación: siga al territorio.",
  "NÃO é supra. Segue pelo ramo sem supradesnível.":
    "NO es elevación. Sigue por la rama sin elevación del ST.",
  "Com estes traçados ao lado, o ECG do seu paciente tem supradesnível de ST?":
    "Con estos trazados al lado, ¿el ECG de su paciente tiene elevación del ST?",
  "SUPRA: o segmento ST fica ACIMA da linha de base depois do QRS, e assim PERMANECE até a onda T. Costuma ser convexo (abaulado para cima).":
    "ELEVACIÓN: el segmento ST queda POR ENCIMA de la línea de base después del QRS, y así PERMANECE hasta la onda T. Suele ser convexo (abombado hacia arriba).",
  "INFRA: o ST fica ABAIXO da linha de base. Não é supra — mas também não é normal, e as alterações horizontais ou descendentes são as que mais importam.":
    "INFRADESNIVEL: el ST queda POR DEBAJO de la línea de base. No es elevación — pero tampoco es normal, y las alteraciones horizontales o descendentes son las que más importan.",
  "A linha de base é o segmento entre o fim da onda T e o início da P seguinte. É contra ela que se mede, não contra o traçado vizinho.":
    "La línea de base es el segmento entre el fin de la onda T y el inicio de la P siguiente. Es contra ella que se mide, no contra el trazado vecino.",
  "⚠️ Um ECG inicial normal NÃO exclui síndrome coronariana aguda. Repita o traçado se os sintomas persistirem ou mudarem.":
    "⚠️ Un ECG inicial normal NO excluye síndrome coronario agudo. Repita el trazado si los síntomas persisten o cambian.",

  // ── Trava: sem supra clássico ≠ NSTE automático (2026-08-27) ─────────
  "Antes de seguir como sem supra": "Antes de seguir como sin elevación",
  "Há algum destes padrões de oclusão ou alto risco?":
    "¿Hay alguno de estos patrones de oclusión o alto riesgo?",
  "Sem supra no traçado padrão NÃO significa sem oclusão.":
    "Sin elevación en el trazado estándar NO significa sin oclusión.",
  "De Winter": "De Winter",
  "Posterior": "Posterior",
  "Nenhum destes": "Ninguno de estos",
  "Supra em aVR com infra difuso": "Elevación en aVR con infradesnivel difuso",
  "aVR com infra difuso": "aVR con infradesnivel difuso",
  "Infra ascendente em V1–V6 com T altas e simétricas.":
    "Infradesnivel ascendente en V1–V6 con T altas y simétricas.",
  "Infra ascendente no ponto J em V1–V6, seguida de T altas e simétricas.":
    "Infradesnivel ascendente en el punto J en V1–V6, seguido de T altas y simétricas.",
  "Oclusão proximal da DA — sala agora.": "Oclusión proximal de la DA — sala ahora.",
  "Não espere virar supra: pode não virar.":
    "No espere que se convierta en elevación: puede no hacerlo.",
  "Confirmar em V7–V9 — o limiar ali é 0,5 mm.":
    "Confirmar en V7–V9 — el umbral allí es 0,5 mm.",
  "Supra de 0,5 mm em V7–V9 já fecha.": "Una elevación de 0,5 mm en V7–V9 ya cierra.",
  "Supra em aVR com infra em ≥ 6 derivações.":
    "Elevación en aVR con infradesnivel en ≥ 6 derivaciones.",
  "T altas, largas e simétricas — pode preceder o supra.":
    "T altas, anchas y simétricas — puede preceder a la elevación.",
  "Repetir o ECG em minutos.": "Repetir el ECG en minutos.",
  "De Winter ou T hiperaguda": "De Winter o T hiperaguda",
  "Reconhecer oclusão sem supra clássico": "Reconocer oclusión sin elevación clásica",
  "Com estes critérios, algum dos padrões está presente?":
    "Con estos criterios, ¿alguno de los patrones está presente?",
  "Padrão ainda não determinado": "Patrón aún no determinado",
  "Isto não é 'nenhum destes'. É 'ainda não sei'.":
    "Esto no es 'ninguno de estos'. Es 'aún no lo sé'.",
  "Registrar V7–V9 (posterior) e V3R–V4R (ventrículo direito) — dois dos padrões só aparecem aí":
    "Registrar V7–V9 (posterior) y V3R–V4R (ventrículo derecho) — dos de los patrones solo aparecen ahí",
  "Repetir o ECG em poucos minutos e comparar: T hiperaguda e De Winter mudam com o tempo":
    "Repetir el ECG en pocos minutos y comparar: la T hiperaguda y De Winter cambian con el tiempo",
  "Ligar para o serviço de referência antes de classificar como sem supra — a decisão precisa de quem vai assumir o paciente":
    "Llamar al servicio de referencia antes de clasificar como sin elevación — la decisión necesita a quien va a recibir al paciente",
  "Enquanto o padrão não for afastado, o paciente não é reclassificado como sem supra — a dúvida não o tira da fila da reperfusão.":
    "Mientras el patrón no se descarte, el paciente no se reclasifica como sin elevación — la duda no lo saca de la fila de la reperfusión.",
  "Oclusão de alto risco — sala agora": "Oclusión de alto riesgo — sala ahora",
  "Reperfusão com a mesma urgência do STEMI, mesmo sem supra clássico.":
    "Reperfusión con la misma urgencia del STEMI, incluso sin elevación clásica.",
  "Acionar a hemodinâmica AGORA — o relógio da reperfusão conta a partir deste reconhecimento":
    "Activar la hemodinamia AHORA — el reloj de la reperfusión cuenta desde este reconocimiento",
  "Não aguardar troponina para decidir: o padrão do ECG já indica oclusão":
    "No esperar la troponina para decidir: el patrón del ECG ya indica oclusión",
  "Seguir pela mesma decisão de reperfusão do STEMI":
    "Seguir por la misma decisión de reperfusión del STEMI",
  "Antitrombóticos e anti-isquêmicos conforme os vereditos, sem atrasar a sala":
    "Antitrombóticos y antiisquémicos según los veredictos, sin retrasar la sala",

  // ── aVR: alto risco sem nomear a anatomia (2026-08-27) ───────────────
  "Alto risco — fibrinólise não indicada": "Alto riesgo — fibrinólisis no indicada",
  "Alto risco — avaliação invasiva, não fibrinólise.":
    "Alto riesgo — evaluación invasiva, no fibrinólisis.",
  "Padrão de isquemia subendocárdica extensa e de alto risco. A fibrinólise não está indicada por este padrão.":
    "Patrón de isquemia subendocárdica extensa y de alto riesgo. La fibrinólisis no está indicada por este patrón.",
  "Avaliação invasiva com urgência — acionar a hemodinâmica":
    "Evaluación invasiva con urgencia — activar la hemodinamia",
  "NÃO administrar trombolítico com base neste padrão":
    "NO administrar trombolítico con base en este patrón",
  "Considerar anatomia coronariana crítica conforme o contexto clínico — o padrão SUGERE, não fecha diagnóstico":
    "Considerar anatomía coronaria crítica según el contexto clínico — el patrón SUGIERE, no cierra el diagnóstico",
  "⚠️ O ECG não nomeia a artéria acometida. O que este padrão estabelece é isquemia extensa de alto risco e que o trombolítico não é o caminho — a anatomia quem define é a angiografia.":
    "⚠️ El ECG no nombra la arteria comprometida. Lo que este patrón establece es isquemia extensa de alto riesgo y que el trombolítico no es el camino — la anatomía la define la angiografía.",
  "SUPRA EM aVR COM INFRA DIFUSO (≥ 6 derivações): padrão de isquemia subendocárdica EXTENSA e de alto risco. Não é candidato a trombolítico por este padrão, e a conduta é avaliação invasiva. ⚠️ O ECG não fecha a anatomia — quem define é a angiografia.":
    "ELEVACIÓN EN aVR CON INFRADESNIVEL DIFUSO (≥ 6 derivaciones): patrón de isquemia subendocárdica EXTENSA y de alto riesgo. No es candidato a trombolítico por este patrón, y la conducta es evaluación invasiva. ⚠️ El ECG no cierra la anatomía — la define la angiografía.",

  // ── Derivações adicionais conforme a suspeita ────────────────────────
  "Se a suspeita for POSTERIOR (infra horizontal em V1–V3 com R alta e larga): registrar V7–V9 — o limiar ali é 0,5 mm":
    "Si la sospecha es POSTERIOR (infradesnivel horizontal en V1–V3 con R alta y ancha): registrar V7–V9 — el umbral allí es 0,5 mm",
  "Se houver supra INFERIOR (II, III, aVF): registrar V3R–V4R para pesquisar ventrículo direito":
    "Si hay elevación INFERIOR (II, III, aVF): registrar V3R–V4R para investigar ventrículo derecho",
  "Se não for possível distinguir o padrão: completar a avaliação do ECG sem assumir nenhum deles":
    "Si no es posible distinguir el patrón: completar la evaluación del ECG sin asumir ninguno de ellos",
  "Se não for possível distinguir o padrão: completar a avaliação do ECG sem assumir nenhum deles — repetir o traçado em poucos minutos e comparar, porque T hiperaguda e De Winter mudam com o tempo":
    "Si no es posible distinguir el patrón: completar la evaluación del ECG sin asumir ninguno de ellos — repetir el trazado en pocos minutos y comparar, porque la T hiperaguda y De Winter cambian con el tiempo",
  "Se a suspeita for posterior: registrar V7–V9. Se houver supra inferior: registrar V3R–V4R. Um conjunto responde a uma pergunta — pedir os dois sempre é ruído":
    "Si la sospecha es posterior: registrar V7–V9. Si hay elevación inferior: registrar V3R–V4R. Un conjunto responde a una pregunta — pedir ambos siempre es ruido",
};
