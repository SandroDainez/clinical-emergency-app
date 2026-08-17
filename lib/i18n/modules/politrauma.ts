/**
 * Politrauma — dicionário PT → ES (espanhol latino-americano).
 * Terminologia ATLS: exanguinante, empaquetamiento, faja pélvica, control de daños,
 * historia AMPLIA, tríada letal. Token {cristaloide} preservado.
 */
export const ES_POLITRAUMA: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Preparação e segurança": "Preparación y seguridad",
  "X · Hemorragia exsanguinante": "X · Hemorragia exanguinante",
  "Controle imediato da hemorragia": "Control inmediato de la hemorragia",
  "A · Via aérea com proteção cervical": "A · Vía aérea con protección cervical",
  "Via aérea definitiva": "Vía aérea definitiva",
  "B · Ventilação e oxigenação": "B · Ventilación y oxigenación",
  "Conduta torácica imediata": "Conducta torácica inmediata",
  "C · Circulação e controle de hemorragia": "C · Circulación y control de la hemorragia",
  "Peso estimado": "Peso estimado",
  "Reanimação hemostática": "Reanimación hemostática",
  "Resposta à reanimação": "Respuesta a la reanimación",
  "Cirurgia de controle de danos": "Cirugía de control de daños",
  "D · Avaliação neurológica": "D · Evaluación neurológica",
  "Trauma cranioencefálico associado": "Traumatismo craneoencefálico asociado",
  "E · Exposição e prevenção de hipotermia": "E · Exposición y prevención de la hipotermia",
  "Avaliação secundária": "Evaluación secundaria",
  "Destino": "Destino",
  "UTI / centro cirúrgico": "UCI / quirófano",
  "Observação e reavaliação": "Observación y reevaluación",
  "Politrauma — atendimento inicial": "Politraumatismo — atención inicial",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "Há sangramento externo maciço visível (jato, poça, membro amputado)?":
    "¿Hay sangrado externo masivo visible (chorro, charco, miembro amputado)?",
  "A via aérea está pérvia e protegida (fala normalmente, sem estridor/obstrução)?":
    "¿La vía aérea está permeable y protegida (habla normalmente, sin estridor/obstrucción)?",
  "Há sinais de pneumotórax hipertensivo, tórax instável ou hemotórax maciço?":
    "¿Hay signos de neumotórax a tensión, tórax inestable o hemotórax masivo?",
  "Há sinais de choque (PAS < 90, FC > 120, pele fria, enchimento capilar > 3 s, confusão)?":
    "¿Hay signos de choque (PAS < 90, FC > 120, piel fría, llenado capilar > 3 s, confusión)?",
  "O paciente respondeu e estabilizou após a reanimação inicial?":
    "¿El paciente respondió y se estabilizó tras la reanimación inicial?",
  "Glasgow ≤ 13, pupilas assimétricas, déficit focal ou trauma craniano significativo?":
    "¿Glasgow ≤ 13, pupilas asimétricas, déficit focal o traumatismo craneal significativo?",
  "Há lesão grave, necessidade de cirurgia ou suporte avançado?":
    "¿Hay lesión grave, necesidad de cirugía o soporte avanzado?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Antes do contato: equipe, EPI e material prontos.":
    "Antes del contacto: equipo, EPP y material listos.",
  "Parar o sangramento é a prioridade absoluta.":
    "Detener el sangrado es la prioridad absoluta.",
  "Intubação com estabilização cervical em linha.":
    "Intubación con estabilización cervical en línea.",
  "Tratar antes de qualquer exame de imagem.":
    "Tratar antes de cualquier estudio de imagen.",
  "Sangue precoce, pouco cristaloide, controle da fonte.":
    "Sangre precoz, poco cristaloide, control de la fuente.",
  "Sangramento ativo não controlado — hemostasia cirúrgica imediata.":
    "Sangrado activo no controlado — hemostasia quirúrgica inmediata.",
  "Priorizar perfusão cerebral e tomografia precoce.":
    "Priorizar la perfusión cerebral y la tomografía precoz.",
  "Expor tudo, examinar, e aquecer imediatamente.":
    "Exponer todo, examinar y calentar de inmediato.",
  "Só após a primária completa e o paciente estabilizado.":
    "Solo tras completar la evaluación primaria y con el paciente estabilizado.",
  "Trauma grave com necessidade de monitorização e suporte.":
    "Trauma grave con necesidad de monitorización y soporte.",
  "Trauma sem lesão grave identificada — vigiar deterioração tardia.":
    "Trauma sin lesión grave identificada — vigilar el deterioro tardío.",

  // ── Opções e campos ────────────────────────────────────────────────────────
  "Sim — sangramento maciço": "Sí — sangrado masivo",
  "Não": "No",
  "Pérvia e protegida": "Permeable y protegida",
  "Ameaçada / Glasgow ≤ 8": "Amenazada / Glasgow ≤ 8",
  "Sim — alteração torácica grave": "Sí — alteración torácica grave",
  "Sim — choque / instabilidade": "Sí — choque / inestabilidad",
  "Não — hemodinamicamente estável": "No — hemodinámicamente estable",
  "Peso": "Peso",
  "50 kg": "50 kg",
  "60 kg": "60 kg",
  "70 kg": "70 kg",
  "80 kg": "80 kg",
  "90 kg": "90 kg",
  "100 kg": "100 kg",
  "Outro peso (kg)": "Otro peso (kg)",
  "Respondeu e manteve-se estável": "Respondió y se mantuvo estable",
  "Não respondeu / resposta transitória": "No respondió / respuesta transitoria",
  "Choque": "Choque",
  "Drogas vasoativas": "Drogas vasoactivas",
  "Sim — alteração neurológica": "Sí — alteración neurológica",
  "Não — neurológico preservado": "No — neurológico conservado",
  "TCE — guia completo": "TCE — guía completa",
  "Sim — lesão grave / suporte": "Sí — lesión grave / soporte",
  "Não — trauma leve, estável": "No — trauma leve, estable",
  "Ventilação mecânica": "Ventilación mecánica",
  "Sedoanalgesia & BNM": "Sedoanalgesia y BNM",
  "Para calcular volume e hemocomponentes.": "Para calcular el volumen y los hemocomponentes.",
  "Confirmar perfil e suporte hemodinâmico": "Confirmar el perfil y el soporte hemodinámico",
  "Vasopressor após reposição volêmica adequada":
    "Vasopresor tras una reposición de volumen adecuada",
  "Classificação, indicação de TC e controle da PIC":
    "Clasificación, indicación de TC y control de la PIC",
  "Parametrização pós-intubação / contusão pulmonar":
    "Parametrización tras la intubación / contusión pulmonar",
  "Suporte hemodinâmico": "Soporte hemodinámico",
  "Sedação e analgesia do trauma grave": "Sedación y analgesia del trauma grave",

  // ── Evidência ──────────────────────────────────────────────────────────────
  "No trauma, hemorragia exsanguinante vem ANTES da via aérea (X-ABCDE) — é a causa evitável nº 1 de morte precoce.":
    "En el trauma, la hemorragia exanguinante va ANTES de la vía aérea (X-ABCDE) — es la causa evitable n.º 1 de muerte precoz.",
  "Controle imediato: compressão direta firme → torniquete em membro → packing/curativo hemostático em junções.":
    "Control inmediato: compresión directa firme → torniquete en el miembro → empaquetamiento/apósito hemostático en las uniones.",
  "IMOBILIZAÇÃO CERVICAL manual/colar durante toda a avaliação até excluir lesão.":
    "INMOVILIZACIÓN CERVICAL manual/collar durante toda la evaluación hasta excluir una lesión.",
  "Indicações de via aérea definitiva: apneia, Glasgow ≤ 8, obstrução, trauma de face grave, risco de aspiração, queimadura de via aérea.":
    "Indicaciones de vía aérea definitiva: apnea, Glasgow ≤ 8, obstrucción, trauma facial grave, riesgo de aspiración, quemadura de la vía aérea.",
  "Rouquidão, estridor, enfisema subcutâneo ou hematoma cervical expansivo = via aérea ameaçada.":
    "Disfonía, estridor, enfisema subcutáneo o hematoma cervical expansivo = vía aérea amenazada.",
  "Pneumotórax hipertensivo: hipotensão + turgência jugular + desvio de traqueia + murmúrio abolido + timpanismo. DIAGNÓSTICO CLÍNICO — não esperar radiografia.":
    "Neumotórax a tensión: hipotensión + ingurgitación yugular + desviación traqueal + murmullo vesicular abolido + timpanismo. DIAGNÓSTICO CLÍNICO — no esperar la radiografía.",
  "Hemotórax maciço: murmúrio abolido + macicez + choque.":
    "Hemotórax masivo: murmullo vesicular abolido + matidez + choque.",
  "Tórax instável (flail chest): segmento com movimento paradoxal + contusão pulmonar.":
    "Tórax inestable (volet costal): segmento con movimiento paradójico + contusión pulmonar.",
  "O₂ suplementar para todos; oximetria e capnografia contínuas.":
    "O₂ suplementario para todos; oximetría y capnografía continuas.",
  "No trauma, choque é HEMORRÁGICO até prova em contrário — buscar sangue em 5 locais: tórax, abdome, pelve/retroperitônio, ossos longos e externo ('no chão e mais 4').":
    "En el trauma, el choque es HEMORRÁGICO hasta demostrar lo contrario — buscar sangre en 5 sitios: tórax, abdomen, pelvis/retroperitoneo, huesos largos y el externo ('en el piso y cuatro más').",
  "Dois acessos calibrosos (14–16 G) periféricos; se falha, acesso intraósseo.":
    "Dos accesos periféricos gruesos (14–16 G); si falla, acceso intraóseo.",
  "Hipotensão permissiva (PAS ~80–90) até hemostasia — EXCETO no TCE, onde a meta é PAS ≥ 110 mmHg.":
    "Hipotensión permisiva (PAS ~80–90) hasta la hemostasia — EXCEPTO en el TCE, donde la meta es PAS ≥ 110 mmHg.",
  "Respondedor transitório ou não-respondedor = sangramento ativo → sala de cirurgia / angioembolização.":
    "Respondedor transitorio o no respondedor = sangrado activo → quirófano / angioembolización.",
  "Instável NÃO vai para tomografia — vai para controle da fonte.":
    "El paciente inestable NO va a la tomografía — va al control de la fuente.",
  "Calcular Glasgow (abertura ocular + resposta verbal + motora) e avaliar pupilas.":
    "Calcular el Glasgow (apertura ocular + respuesta verbal + motora) y evaluar las pupilas.",
  "Glasgow ≤ 8 = via aérea definitiva. Anisocoria = herniação até prova em contrário.":
    "Glasgow ≤ 8 = vía aérea definitiva. Anisocoria = herniación hasta demostrar lo contrario.",
  "Sempre excluir hipoglicemia e hipóxia como causa de rebaixamento.":
    "Siempre excluir la hipoglucemia y la hipoxia como causa del deterioro del sensorio.",
  "Considerar transferência precoce se o serviço não dispuser de recurso definitivo (não retardar por exames).":
    "Considerar el traslado precoz si el servicio no dispone del recurso definitivo (no demorar por exámenes).",

  // ── Ações ──────────────────────────────────────────────────────────────────
  "EPI completo (precaução universal): luvas, avental, óculos, máscara.":
    "EPP completo (precaución universal): guantes, bata, gafas, mascarilla.",
  "Equipe definida com líder único; funções distribuídas (via aérea, acessos, exposição, registro).":
    "Equipo definido con un único líder; funciones distribuidas (vía aérea, accesos, exposición, registro).",
  "Material pronto: via aérea difícil, aspirador, torniquete, dreno de tórax, aquecedor, USG (FAST).":
    "Material listo: vía aérea difícil, aspirador, torniquete, tubo de tórax, calentador, ecografía (FAST).",
  "Acionar banco de sangue e cirurgia PRECOCEMENTE se mecanismo grave ou instabilidade.":
    "Avisar al banco de sangre y a cirugía PRECOZMENTE si el mecanismo es grave o hay inestabilidad.",
  "Colher história AMPLA e mecanismo do trauma com a equipe pré-hospitalar.":
    "Obtener la historia AMPLIA y el mecanismo del trauma con el equipo prehospitalario.",
  "Compressão direta firme e contínua sobre o ponto sangrante.":
    "Compresión directa firme y continua sobre el punto sangrante.",
  "Membro: TORNIQUETE proximal, apertar até cessar o sangramento; anotar o horário. Não afrouxar.":
    "Miembro: TORNIQUETE proximal, apretar hasta que cese el sangrado; anotar la hora. No aflojar.",
  "Junções (axila/virilha/pescoço): packing com curativo hemostático + compressão.":
    "Uniones (axila/ingle/cuello): empaquetamiento con apósito hemostático + compresión.",
  "Pelve instável: cinta pélvica na altura dos grandes trocânteres.":
    "Pelvis inestable: faja pélvica a la altura de los trocánteres mayores.",
  "Acionar protocolo de transfusão maciça e cirurgia/hemostasia definitiva imediatamente.":
    "Activar el protocolo de transfusión masiva y la cirugía/hemostasia definitiva de inmediato.",
  "Ácido tranexâmico 1 g IV em 10 min (se < 3 h do trauma) → 1 g em 8 h (CRASH-2).":
    "Ácido tranexámico 1 g IV en 10 min (si < 3 h del trauma) → 1 g en 8 h (CRASH-2).",
  "Pré-oxigenar; sequência rápida com estabilização cervical MANUAL em linha (retirar a parte anterior do colar).":
    "Preoxigenar; secuencia rápida con estabilización cervical MANUAL en línea (retirar la parte anterior del collar).",
  "Escolher droga que preserve hemodinâmica: quetamina ou etomidato (evitar propofol no choque).":
    "Elegir un fármaco que preserve la hemodinamia: ketamina o etomidato (evitar el propofol en el choque).",
  "Confirmar com capnografia (EtCO₂) — padrão-ouro.":
    "Confirmar con capnografía (EtCO₂) — estándar de oro.",
  "Plano de resgate definido; se falha e não ventila/não intuba: via aérea cirúrgica (cricotireoidostomia).":
    "Plan de rescate definido; si falla y no se ventila/no se intuba: vía aérea quirúrgica (cricotiroidotomía).",
  "Fixar tubo e reavaliar o posicionamento após qualquer mobilização.":
    "Fijar el tubo y reevaluar su posición tras cualquier movilización.",
  "Pneumotórax hipertensivo: descompressão IMEDIATA — punção no 5º EIC linha axilar média (ou 2º EIC linha hemiclavicular) → drenagem em selo d'água.":
    "Neumotórax a tensión: descompresión INMEDIATA — punción en el 5.º EIC línea axilar media (o 2.º EIC línea medioclavicular) → drenaje bajo sello de agua.",
  "Hemotórax maciço (> 1.500 mL de saída ou > 200 mL/h por 2–4 h): drenagem + acionar toracotomia.":
    "Hemotórax masivo (> 1.500 mL de salida o > 200 mL/h durante 2–4 h): drenaje + activar toracotomía.",
  "Pneumotórax aberto: curativo de três pontas → drenagem torácica definitiva.":
    "Neumotórax abierto: apósito de tres puntas → drenaje torácico definitivo.",
  "Tórax instável: analgesia eficaz, O₂, considerar ventilação; tratar a contusão pulmonar (evitar hiper-hidratação).":
    "Tórax inestable: analgesia eficaz, O₂, considerar ventilación; tratar la contusión pulmonar (evitar la sobrehidratación).",
  "Tamponamento cardíaco (Beck: hipotensão + turgência + bulhas abafadas): FAST → pericardiocentese/toracotomia.":
    "Taponamiento cardíaco (Beck: hipotensión + ingurgitación yugular + ruidos cardíacos apagados): FAST → pericardiocentesis/toracotomía.",
  "Cristaloide AQUECIDO {cristaloide} mL (~1 L) como ponte — NÃO usar grandes volumes (piora coagulopatia e acidose).":
    "Cristaloide TIBIO {cristaloide} mL (~1 L) como puente — NO usar grandes volúmenes (empeora la coagulopatía y la acidosis).",
  "Iniciar HEMOCOMPONENTES precocemente: protocolo de transfusão maciça 1:1:1 (concentrado de hemácias : plasma : plaquetas).":
    "Iniciar HEMOCOMPONENTES precozmente: protocolo de transfusión masiva 1:1:1 (concentrado de glóbulos rojos : plasma : plaquetas).",
  "Ácido tranexâmico 1 g IV em 10 min se < 3 h do trauma → 1 g em 8 h (não iniciar após 3 h).":
    "Ácido tranexámico 1 g IV en 10 min si < 3 h del trauma → 1 g en 8 h (no iniciar después de 3 h).",
  "Cálcio: gluconato/cloreto de cálcio a cada 3–4 unidades transfundidas (citrato quela cálcio).":
    "Calcio: gluconato/cloruro de calcio cada 3–4 unidades transfundidas (el citrato quela el calcio).",
  "Combater a tríade letal: HIPOTERMIA (aquecer paciente/fluidos), ACIDOSE, COAGULOPATIA.":
    "Combatir la tríada letal: HIPOTERMIA (calentar al paciente y los líquidos), ACIDOSIS, COAGULOPATÍA.",
  "FAST + radiografias de tórax e pelve à beira-leito para localizar a fonte.":
    "FAST + radiografías de tórax y pelvis a pie de cama para localizar la fuente.",
  "Controle DEFINITIVO da fonte: cirurgia/angioembolização — não postergar por exames.":
    "Control DEFINITIVO de la fuente: cirugía/angioembolización — no posponer por exámenes.",
  "Despir completamente; rolamento em bloco para examinar o dorso, coluna e região perineal.":
    "Desvestir por completo; rodamiento en bloque para examinar el dorso, la columna y la región perineal.",
  "AQUECER IMEDIATAMENTE: manta térmica, fluidos aquecidos, sala aquecida — hipotermia agrava coagulopatia.":
    "CALENTAR DE INMEDIATO: manta térmica, líquidos tibios, sala caldeada — la hipotermia agrava la coagulopatía.",
  "Adjuntos: monitorização completa, sonda gástrica e vesical (contraindicada se suspeita de lesão uretral: sangue no meato, hematoma perineal, próstata alta).":
    "Complementos: monitorización completa, sonda gástrica y vesical (contraindicada si se sospecha lesión uretral: sangre en el meato, hematoma perineal, próstata elevada).",
  "Radiografias de tórax e pelve; FAST/e-FAST à beira-leito.":
    "Radiografías de tórax y pelvis; FAST/e-FAST a pie de cama.",
  "Analgesia adequada e profilaxia antitetânica.":
    "Analgesia adecuada y profilaxis antitetánica.",
  "História AMPLA: Alergias, Medicamentos, Passado, Líquidos/última refeição, Ambiente/mecanismo.":
    "Historia AMPLIA: Alergias, Medicamentos, Patologías previas, Líquidos/última comida, Ambiente/mecanismo.",
  "Exame da cabeça aos pés, incluindo dorso, períneo, toque retal quando indicado e todos os segmentos.":
    "Examen de la cabeza a los pies, incluyendo dorso, periné, tacto rectal cuando esté indicado y todos los segmentos.",
  "Reavaliar continuamente o ABCDE — qualquer deterioração exige voltar ao início da avaliação primária.":
    "Reevaluar continuamente el ABCDE — cualquier deterioro exige volver al inicio de la evaluación primaria.",
  "Exames dirigidos: tomografia de corpo inteiro se estável e mecanismo grave.":
    "Estudios dirigidos: tomografía de cuerpo entero si está estable y el mecanismo es grave.",
  "Documentar lesões, horários (torniquete, TXA) e transfusões.":
    "Documentar las lesiones, los horarios (torniquete, TXA) y las transfusiones.",
  "Sala cirúrgica IMEDIATA (ou angioembolização conforme a fonte) — não retardar por tomografia.":
    "Quirófano INMEDIATO (o angioembolización según la fuente) — no demorar por la tomografía.",
  "Damage control: controlar hemorragia e contaminação, empacotar, fechar temporariamente e levar à UTI para correção fisiológica.":
    "Control de daños: controlar la hemorragia y la contaminación, empaquetar, cerrar temporalmente y llevar a UCI para la corrección fisiológica.",
  "Manter transfusão 1:1:1, aquecimento ativo e correção de cálcio.":
    "Mantener la transfusión 1:1:1, el calentamiento activo y la corrección del calcio.",
  "Reoperação programada em 24–48 h após reversão da tríade letal.":
    "Reoperación programada en 24–48 h tras revertir la tríada letal.",
  "EVITAR hipotensão (meta PAS ≥ 110 mmHg) e hipóxia (SpO₂ ≥ 90%) — cada episódio piora o desfecho.":
    "EVITAR la hipotensión (meta PAS ≥ 110 mmHg) y la hipoxia (SpO₂ ≥ 90%) — cada episodio empeora el desenlace.",
  "TC de crânio precoce assim que estabilizado; neurocirurgia se lesão com efeito de massa.":
    "TC de cráneo precoz en cuanto se estabilice; neurocirugía si hay lesión con efecto de masa.",
  "Sinais de herniação: cabeceira 30°, normocapnia (PaCO₂ 35–38), salina hipertônica/manitol.":
    "Signos de herniación: cabecera a 30°, normocapnia (PaCO₂ 35–38), solución salina hipertónica/manitol.",
  "Corrigir a tríade letal: aquecer, corrigir acidose e coagulopatia (guiado por tromboelastometria quando disponível).":
    "Corregir la tríada letal: calentar, corregir la acidosis y la coagulopatía (guiado por tromboelastometría cuando esté disponible).",
  "Reavaliação seriada: síndrome compartimental (abdominal e de membros), lesões inicialmente despercebidas.":
    "Reevaluación seriada: síndrome compartimental (abdominal y de miembros), lesiones inicialmente inadvertidas.",
  "Profilaxia de TVP assim que a hemostasia permitir; nutrição precoce; analgesia adequada.":
    "Profilaxis de TVP en cuanto la hemostasia lo permita; nutrición precoz; analgesia adecuada.",
  "Reoperação programada se damage control.":
    "Reoperación programada si se hizo control de daños.",
  "Observação com reavaliação seriada — lesões abdominais e o TCE podem se manifestar tardiamente.":
    "Observación con reevaluación seriada — las lesiones abdominales y el TCE pueden manifestarse tardíamente.",
  "Analgesia, profilaxia antitetânica e orientação de sinais de alarme por escrito.":
    "Analgesia, profilaxis antitetánica e indicaciones de signos de alarma por escrito.",
  "Retorno imediato se dor progressiva, vômitos, rebaixamento, dispneia ou distensão abdominal.":
    "Regreso inmediato si hay dolor progresivo, vómitos, deterioro del sensorio, disnea o distensión abdominal.",
  "COMO SABER QUE A VIA AÉREA ESTÁ AMEAÇADA, MESMO COM O PACIENTE FALANDO: rouquidão, estridor, enfisema subcutâneo ou hematoma cervical expansivo. Qualquer um deles responde NÃO a esta pergunta.":
    "CÓMO SABER QUE LA VÍA AÉREA ESTÁ AMENAZADA, INCLUSO CON EL PACIENTE HABLANDO: ronquera, estridor, enfisema subcutáneo o hematoma cervical expansivo. Cualquiera de ellos responde NO a esta pregunta.",
  "⚠️ GLASGOW ≤ 8 PEDE VIA AÉREA DEFINITIVA, e ANISOCORIA É HERNIAÇÃO até prova em contrário.":
    "⚠️ GLASGOW ≤ 8 PIDE VÍA AÉREA DEFINITIVA, y la ANISOCORIA ES HERNIACIÓN hasta prueba en contrario.",
};
