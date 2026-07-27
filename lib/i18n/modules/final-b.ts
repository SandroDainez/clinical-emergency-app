/**
 * Fechamento da tradução — parte B.
 * Síndromes coronarianas (classificação, escores, prescrições, configuração),
 * AVC (elegibilidade e motor), ACLS (reducer, microcopy, voz, debrief) e telas
 * de sistema.
 */
export const ES_FINAL_B: Record<string, string> = {
  // ══ CORONÁRIAS — classificação ════════════════════════════════════════════
  "STEMI: reperfusão imediata com angioplastia primária":
    "IAMCEST: reperfusión inmediata con angioplastia primaria",
  "STEMI: considerar trombólise": "IAMCEST: considerar la trombólisis",
  "STEMI com estratégia de angioplastia primária.":
    "IAMCEST con estrategia de angioplastia primaria.",
  "STEMI sem PCI imediata local exige fibrinólise/transferência.":
    "IAMCEST sin angioplastia inmediata en el centro: exige fibrinólisis o traslado.",
  "STEMI sem PCI imediata local; trombólise bloqueada pelas contraindicações abaixo.":
    "IAMCEST sin angioplastia inmediata en el centro; la trombólisis está bloqueada por las contraindicaciones de abajo.",
  "ECG com padrão compatível com STEMI.":
    "ECG con un patrón compatible con IAMCEST.",
  "Classificação não compatível com STEMI.":
    "Clasificación no compatible con IAMCEST.",
  "Fluxo não classificado como STEMI.": "Flujo no clasificado como IAMCEST.",
  "Sem STEMI confirmado.": "Sin IAMCEST confirmado.",
  "NSTEMI/UA de altíssimo risco":
    "IAMSEST o angina inestable de muy alto riesgo",
  "SCA sem supra / angina instável requer internação monitorizada.":
    "Síndrome coronario agudo sin elevación del ST o angina inestable: requiere ingreso monitorizado.",
  "Síndrome coronariana aguda de alto risco.":
    "Síndrome coronario agudo de alto riesgo.",
  "Troponina positiva/dinâmica sem supra persistente.":
    "Troponina positiva o dinámica sin elevación persistente del ST.",
  "Dor com características isquêmicas em repouso/recorrente sem biomarcador positivo.":
    "Dolor con características isquémicas en reposo o recurrente sin biomarcador positivo.",
  "Quadro mais compatível com angina estável ou DAC crônica.":
    "Cuadro más compatible con angina estable o enfermedad coronaria crónica.",
  "Fluxo ambulatorial / DAC crônica":
    "Flujo ambulatorio / enfermedad coronaria crónica",
  "Fluxo ambulatorial / DAC crônica sem evidência de evento agudo.":
    "Flujo ambulatorio o enfermedad coronaria crónica sin evidencia de un evento agudo.",
  "Sintomas estáveis relacionados a esforço, sem evidência de evento agudo.":
    "Síntomas estables relacionados con el esfuerzo, sin evidencia de un evento agudo.",
  "Dor mais compatível com diagnóstico alternativo.":
    "Dolor más compatible con un diagnóstico alternativo.",
  "Dor torácica alternativa, manter segurança diagnóstica antes de alta.":
    "Dolor torácico de otra causa: mantener la seguridad diagnóstica antes del alta.",
  "Classificação indeterminada: observar com protocolo de dor torácica.":
    "Clasificación indeterminada: observar con el protocolo de dolor torácico.",
  "Dados insuficientes ou conflitantes para classificação segura.":
    "Datos insuficientes o contradictorios para una clasificación segura.",
  "Completar classificação clínica antes da decisão.":
    "Completar la clasificación clínica antes de la decisión.",
  "ECG inconclusivo para decisão automática.":
    "ECG no concluyente para una decisión automática.",
  "Primeiro ECG não registrado.": "Primer ECG no registrado.",
  "Necessita série de ECG/troponina e reavaliação de risco.":
    "Necesita una serie de ECG y troponina, y una reevaluación del riesgo.",
  "Estratégia invasiva em revisão": "Estrategia invasiva en revisión",
  "Estratégia seletiva / observação": "Estrategia selectiva / observación",
  "Risco clínico/biomarcadores/ECG favorecem estratégia invasiva precoce.":
    "El riesgo clínico, los biomarcadores y el ECG favorecen una estrategia invasiva precoz.",
  "Choque/instabilidade indica estratégia invasiva imediata.":
    "El choque o la inestabilidad indican una estrategia invasiva inmediata.",
  "Instabilidade clínica: priorizar estabilização antes da estratégia definitiva.":
    "Inestabilidad clínica: priorizar la estabilización antes de la estrategia definitiva.",
  "Transferir para hemodinâmica": "Trasladar a hemodinámica",
  "Hemodinâmica disponível dentro do alvo de tempo.":
    "Hemodinámica disponible dentro del objetivo de tiempo.",
  "Sem angioplastia primária em tempo adequado no local.":
    "Sin angioplastia primaria en un tiempo adecuado en el centro.",
  "Sem PCI dentro do alvo; fibrinólise disponível.":
    "Sin angioplastia dentro del objetivo; fibrinólisis disponible.",
  "Sem reperfusão imediata": "Sin reperfusión inmediata",
  "Organizar transferência imediata ou avaliar fibrinólise se elegível.":
    "Organizar el traslado inmediato o valorar la fibrinólisis si es elegible.",
  "Trombólise elegível": "Trombólisis elegible",
  "Trombólise contraindicada": "Trombólisis contraindicada",
  "Trombólise indisponível": "Trombólisis no disponible",
  "Trombólise não indicada": "Trombólisis no indicada",
  "Existem contraindicações absolutas/relativas não resolvidas.":
    "Hay contraindicaciones absolutas o relativas sin resolver.",
  "Sem contraindicações bloqueadoras registradas.":
    "Sin contraindicaciones bloqueantes registradas.",
  "Fibrinolítico não disponível no fluxo local.":
    "Fibrinolítico no disponible en el flujo local.",
  "Sem fibrinolítico configurado/disponível.":
    "Sin fibrinolítico configurado ni disponible.",
  "SCA / DAC provável favorece AAS se não houver contraindicação.":
    "Un síndrome coronario agudo o una enfermedad coronaria probable favorecen el ácido acetilsalicílico si no hay contraindicación.",
  "Reperfusão / SCA aguda favorece dupla antiagregação conforme estratégia.":
    "La reperfusión o el síndrome coronario agudo favorecen la doble antiagregación según la estrategia.",
  "Anticoagulação depende da classificação, sangramento e estratégia de reperfusão.":
    "La anticoagulación depende de la clasificación, el sangrado y la estrategia de reperfusión.",
  "Alta intensidade é favorecida em SCA e DAC estabelecida, salvo contraindicação.":
    "La alta intensidad se prefiere en el síndrome coronario agudo y la enfermedad coronaria establecida, salvo contraindicación.",
  "Avaliar conforme pressão, função renal, FEVE e fase do atendimento.":
    "Evaluarlo según la presión, la función renal, la fracción de eyección y la fase de la atención.",
  "Avaliar de acordo com risco e estratégia invasiva.":
    "Evaluarlo según el riesgo y la estrategia invasiva.",
  "Considerar se hemodinamicamente estável e sem contraindicações.":
    "Considerarlo si está hemodinámicamente estable y sin contraindicaciones.",
  "Usar apenas se dor/isquemia e sem contraindicações hemodinâmicas.":
    "Usarlo solo si hay dolor o isquemia y no hay contraindicaciones hemodinámicas.",
  "Hipotensão: evitar nitrato.": "Hipotensión: evitar el nitrato.",

  // ══ CORONÁRIAS — escores e biomarcadores ══════════════════════════════════
  "Baixo risco hemodinâmico": "Riesgo hemodinámico bajo",
  "Choque cardiogênico": "Choque cardiogénico",
  "Congestão / IC": "Congestión / insuficiencia cardíaca",
  "Killip não preenchido.": "Killip sin completar.",
  "Necessário para gravidade.": "Necesario para la gravedad.",
  "ECG com alteração importante.": "ECG con una alteración importante.",
  "ECG sem supra persistente informado.":
    "ECG sin elevación persistente del ST informada.",
  "Estimativa por idade, FC, PAS, função renal, Killip, ECG e biomarcadores.":
    "Estimación por edad, frecuencia cardíaca, PAS, función renal, Killip, ECG y biomarcadores.",
  "Score baseado em idade, fatores de risco, DAC conhecida, AAS prévio, recorrência, ECG e troponina.":
    "Puntuación basada en la edad, los factores de riesgo, la enfermedad coronaria conocida, el uso previo de ácido acetilsalicílico, la recurrencia, el ECG y la troponina.",
  "Favorece estratégia invasiva precoce e internação monitorizada.":
    "Favorece una estrategia invasiva precoz y el ingreso monitorizado.",
  "Favorece estratégia invasiva precoce/intensiva.":
    "Favorece una estrategia invasiva precoz o intensiva.",
  "Favorece internação / investigação intensiva.":
    "Favorece el ingreso o un estudio intensivo.",
  "Favorece observação e série diagnóstica.":
    "Favorece la observación y la serie diagnóstica.",
  "Sugere internação e observação monitorizada.":
    "Sugiere ingreso y observación monitorizada.",
  "Sugere leito intensivo e estratégia agressiva.":
    "Sugiere una cama de cuidados intensivos y una estrategia agresiva.",
  "Sugere observação/invasiva conforme contexto.":
    "Sugiere observación o estrategia invasiva según el contexto.",
  "Pode apoiar estratégia conservadora se restante do quadro permitir.":
    "Puede apoyar una estrategia conservadora si el resto del cuadro lo permite.",
  "Pode apoiar observação curta, nunca isoladamente.":
    "Puede apoyar una observación corta, nunca de forma aislada.",
  "Usar em conjunto com o restante do quadro.":
    "Usarlo junto con el resto del cuadro.",
  "Não usar como base única com dados faltantes.":
    "No usarlo como base única con datos faltantes.",
  "Não usar para alta até completar os dados.":
    "No usarlo para el alta hasta completar los datos.",
  "Completar dados antes de usar para decisão.":
    "Completar los datos antes de usarlo para decidir.",
  "classificação subjetiva da dor": "clasificación subjetiva del dolor",
  "função renal": "función renal",
  "Troponina positiva e dinâmica": "Troponina positiva y dinámica",
  "Troponina sem elevação significativa": "Troponina sin elevación significativa",
  "Sem valor inicial e limite de referência suficientes para classificar.":
    "Sin un valor inicial y un límite de referencia suficientes para clasificar.",

  // ══ CORONÁRIAS — configuração e prescrições ═══════════════════════════════
  "Identificação, antecedentes e tempos": "Identificación, antecedentes y tiempos",
  "Identificação, fatores de risco, medicações e tempos críticos.":
    "Identificación, factores de riesgo, medicaciones y tiempos críticos.",
  "Caracterização da dor e equivalentes isquêmicos":
    "Caracterización del dolor y equivalentes isquémicos",
  "Caracterize a dor, equivalentes isquêmicos e sinais de diagnósticos alternativos.":
    "Caracterice el dolor, los equivalentes isquémicos y los signos de diagnósticos alternativos.",
  "Exame clínico e vitais": "Exploración clínica y constantes",
  "Estabilizar, reavaliar perfusão e definir o fenótipo clínico.":
    "Estabilizar, reevaluar la perfusión y definir el fenotipo clínico.",
  "Scores e estratificação": "Puntuaciones y estratificación",
  "Scores, instabilidade e classificação clínica":
    "Puntuaciones, inestabilidad y clasificación clínica",
  "Valide scores, instabilidade e classificação clínica sugerida.":
    "Valide las puntuaciones, la inestabilidad y la clasificación clínica sugerida.",
  "Documente ECG estruturado, biomarcadores e logística de reperfusão.":
    "Documente el ECG estructurado, los biomarcadores y la logística de la reperfusión.",
  "Reperfusão, medicações e contraindicações":
    "Reperfusión, medicaciones y contraindicaciones",
  "Cheque contraindicações, reperfusão, antitrombóticos e dupla checagem.":
    "Compruebe las contraindicaciones, la reperfusión, los antitrombóticos y la doble verificación.",
  "Destino, checklist, prescrição e auditoria":
    "Destino, lista de verificación, prescripción y auditoría",
  "Fechamento do caso, prescrição inicial, checklist e auditoria.":
    "Cierre del caso, prescripción inicial, lista de verificación y auditoría.",
  "Sala de emergência": "Sala de urgencias",
  "Transferência para centro de referência": "Traslado a un centro de referencia",
  "Alta com seguimento e investigação ambulatorial":
    "Alta con seguimiento y estudio ambulatorio",
  "Heparina não fracionada": "Heparina no fraccionada",
  "60 U/kg bolus (máx 4000 U), depois 12 U/kg/h (máx 1000 U/h).":
    "60 U/kg en bolo (máx. 4000 U), luego 12 U/kg/h (máx. 1000 U/h).",
  "60 U/kg (máx 4000)": "60 U/kg (máx. 4000)",
  "12 U/kg/h (máx 1000)": "12 U/kg/h (máx. 1000)",
  "Esquema acelerado clássico: bolus 15 mg, depois 0,75 mg/kg e 0,5 mg/kg com teto total.":
    "Esquema acelerado clásico: bolo de 15 mg, luego 0,75 mg/kg y 0,5 mg/kg con un tope total.",
  "Faixas de peso para STEMI; ajustar ao protocolo institucional.":
    "Rangos de peso para el IAMCEST; ajustarlos al protocolo institucional.",
  "Ajuste por idade e função renal conforme protocolo configurado.":
    "Ajuste por edad y función renal según el protocolo configurado.",
  "Confirmar fármacos e laboratórios.":
    "Confirmar los fármacos y los resultados de laboratorio.",
  "Repetir ECG, derivações adicionais e revisão médica.":
    "Repetir el ECG, hacer derivaciones adicionales y una revisión médica.",
  "ECG inconclusivo para STEMI": "ECG no concluyente para IAMCEST",
  "Sem confirmação adequada de supra persistente ou equivalente aceito localmente.":
    "Sin una confirmación adecuada de elevación persistente del ST o de un equivalente aceptado localmente.",
  "Impede automatismo de estratégia invasiva/lytics.":
    "Impide el automatismo de la estrategia invasiva o de los fibrinolíticos.",
  "Instabilidade hemodinâmica não caracterizada":
    "Inestabilidad hemodinámica no caracterizada",
  "Sem definição adequada de choque, Killip ou estabilidade para estratégia.":
    "Sin una definición adecuada de choque, Killip o estabilidad para la estrategia.",
  "Mantém trombólise em revisão.": "Mantiene la trombólisis en revisión.",
  "Pode bloquear até correção.": "Puede bloquearla hasta su corrección.",
  "Bloqueia trombólise automática.": "Bloquea la trombólisis automática.",
  "Bloqueia trombólise e exige revisão diagnóstica imediata.":
    "Bloquea la trombólisis y exige una revisión diagnóstica inmediata.",
  "História de hemorragia intracraniana": "Antecedente de hemorragia intracraneal",
  "Antecedente de HIC é contraindicação absoluta clássica à trombólise.":
    "El antecedente de hemorragia intracraneal es una contraindicación absoluta clásica para la trombólisis.",
  "AVC isquêmico recente": "ACV isquémico reciente",
  "AVC recente dentro da janela considerada incompatível com trombólise.":
    "ACV reciente dentro de la ventana considerada incompatible con la trombólisis.",
  "Suspeita de dissecção de aorta": "Sospecha de disección aórtica",
  "Dor torácica com sinais de dissecção contraindica trombólise.":
    "El dolor torácico con signos de disección contraindica la trombólisis.",
  "Hipertensão grave não controlada": "Hipertensión grave no controlada",
  "PA muito elevada antes da fibrinólise aumenta risco hemorrágico.":
    "Una PA muy elevada antes de la fibrinólisis aumenta el riesgo hemorrágico.",
  "Sangramento maior ativo em qualquer território.":
    "Sangrado mayor activo en cualquier territorio.",
  "Anticoagulação / coagulopatia não esclarecida":
    "Anticoagulación o coagulopatía sin aclarar",
  "Sem confirmar anticoagulante, INR ou coagulopatia relevante.":
    "Sin confirmar el anticoagulante, el INR ni una coagulopatía relevante.",
  "STEMI com angioplastia primária": "IAMCEST con angioplastia primaria",
  "STEMI com trombólise": "IAMCEST con trombólisis",
  "Angina instável internada": "Angina inestable ingresada",
  "Angina estável / DAC crônica": "Angina estable / enfermedad coronaria crónica",
  "Angina estável": "Angina estable",
  "Dor torácica em observação / revisão diagnóstica":
    "Dolor torácico en observación / revisión diagnóstica",
  "Monitorização intensiva contínua e preparo para hemodinâmica imediata.":
    "Monitorización intensiva continua y preparación para una hemodinámica inmediata.",
  "Monitorização intensiva, avaliação de sucesso/falha e estratégia farmacoinvasiva / resgate.":
    "Monitorización intensiva, evaluación del éxito o el fracaso y estrategia farmacoinvasiva o de rescate.",
  "Monitorização cardíaca, ECG/troponina seriados e reavaliação de dor/instabilidade.":
    "Monitorización cardíaca, ECG y troponina seriados, y reevaluación del dolor y la inestabilidad.",
  "Cuidados pós-PCI e vigilância para arritmias, choque e isquemia recorrente.":
    "Cuidados tras la angioplastia y vigilancia de arritmias, choque e isquemia recurrente.",
  "Definir estratégia invasiva imediata, precoce ou seletiva conforme risco clínico.":
    "Definir una estrategia invasiva inmediata, precoz o selectiva según el riesgo clínico.",
  "AAS e segundo antiagregante/anticoagulante conforme risco, estratégia e contraindicações.":
    "Ácido acetilsalicílico y un segundo antiagregante o anticoagulante según el riesgo, la estrategia y las contraindicaciones.",
  "AAS, segundo antiagregante, anticoagulação e estatina de alta intensidade conforme protocolo e contraindicações.":
    "Ácido acetilsalicílico, un segundo antiagregante, anticoagulación y una estatina de alta intensidad según el protocolo y las contraindicaciones.",
  "Associar antiagregação e anticoagulação conforme protocolo configurado.":
    "Asociar la antiagregación y la anticoagulación según el protocolo configurado.",
  "Administrar trombolítico apenas após dupla checagem de contraindicações e dose.":
    "Administrar el fibrinolítico solo tras una doble verificación de las contraindicaciones y la dosis.",
  "Registrar hora de diagnóstico, decisão, entrada na hemodinâmica e reperfusão.":
    "Registrar la hora del diagnóstico, la decisión, la entrada en hemodinámica y la reperfusión.",
  "Registrar porta-agulha, início da trombólise e evolução da dor/ECG.":
    "Registrar el tiempo puerta-aguja, el inicio de la trombólisis y la evolución del dolor y del ECG.",
  "Repetir ECG/troponina quando indicado e reavaliar diagnósticos diferenciais graves.":
    "Repetir el ECG y la troponina cuando esté indicado y reevaluar los diagnósticos diferenciales graves.",
  "Documentar motivo para manter observação ou eventual alta com seguimento.":
    "Documentar el motivo para mantener la observación o para un eventual alta con seguimiento.",
  "Não sugerir alta sem dados mínimos de segurança e série diagnóstica adequada.":
    "No sugerir el alta sin unos datos mínimos de seguridad y una serie diagnóstica adecuada.",
  "Ajustar antianginosos, controle pressórico e prevenção secundária conforme risco global.":
    "Ajustar los antianginosos, el control tensional y la prevención secundaria según el riesgo global.",
  "Programar investigação funcional/anatômica e seguimento com cardiologia conforme perfil clínico.":
    "Programar el estudio funcional o anatómico y el seguimiento con cardiología según el perfil clínico.",
  "Revisar adesão medicamentosa, fatores de risco e metas lipídicas.":
    "Revisar la adherencia al tratamiento, los factores de riesgo y las metas lipídicas.",
  // Calculadoras coronárias
  "Confirmar peso antes de trombólise.": "Confirmar el peso antes de la trombólisis.",
  "Confirmar peso e função renal.": "Confirmar el peso y la función renal.",
  "Confirmar função renal e sangramento antes de iniciar.":
    "Confirmar la función renal y el sangrado antes de iniciarlo.",
  "Confirmar indicação e contraindicações antes da administração.":
    "Confirmar la indicación y las contraindicaciones antes de administrarlo.",
  "Conferir protocolo local e dose total máxima antes de administrar.":
    "Comprobar el protocolo local y la dosis total máxima antes de administrarlo.",
  "Ajustado para disfunção renal importante; confirmar protocolo institucional.":
    "Ajustado para una disfunción renal importante; confirmar el protocolo institucional.",
  "Monitorar TTPa/anti-Xa conforme protocolo.":
    "Monitorizar el TTPA o el anti-Xa según el protocolo.",
  "Idade ≥ 75 anos: sem bolus IV.": "Edad ≥ 75 años: sin bolo IV.",
  "Sem bolus IV": "Sin bolo IV",
  "Peso não informado: cálculo bloqueado.": "Peso no informado: cálculo bloqueado.",
  "Peso não informado: cálculo bloqueado até obter peso confiável.":
    "Peso no informado: cálculo bloqueado hasta obtener un peso fiable.",
  "Peso não informado: cálculo bloqueado até informar peso confiável.":
    "Peso no informado: cálculo bloqueado hasta introducir un peso fiable.",
  "Peso estimado: confirmar antes da administração.":
    "Peso estimado: confirmarlo antes de la administración.",
  // Motor de coronárias
  "Síndromes Coronarianas — resumo clínico":
    "Síndromes coronarios — resumen clínico",
  "Módulo síndromes coronarianas iniciado":
    "Módulo de síndromes coronarios iniciado",
  "ABC instável": "ABC inestable",
  "Angioplastia prévia": "Angioplastia previa",
  "CRM prévia": "Cirugía de revascularización previa",
  "DAC prévia": "Enfermedad coronaria previa",
  "Dor pleurítica": "Dolor pleurítico",
  "Fatores de alívio": "Factores que alivian",
  "Comparado com ECG prévio": "Comparado con un ECG previo",
  "Hemodinâmica disponível": "Hemodinámica disponible",
  "Trombólise disponível": "Trombólisis disponible",
  "Trombolítico preferido": "Fibrinolítico preferido",
  "Atraso estimado para PCI (min)":
    "Retraso estimado hasta la angioplastia (min)",
  "Hora do diagnóstico": "Hora del diagnóstico",
  "Horário do 1º ECG": "Hora del 1.º ECG",
  "Início da dor": "Inicio del dolor",
  "Última vez sem dor": "Última vez sin dolor",
  "Sem supra": "Sin elevación del ST",
  "Sem supra persistente": "Sin elevación persistente del ST",
  "Sinais de diagnóstico alternativo": "Signos de un diagnóstico alternativo",
  "Território provável": "Territorio probable",
  "Checklist pós-conduta": "Lista de verificación tras la conducta",
  "Comentário de auditoria": "Comentario de auditoría",
  "cálculo pendente": "cálculo pendiente",
  "· cálculo pendente": "· cálculo pendiente",
  "STEMI trombólise": "IAMCEST con trombólisis",

  // ══ AVC — elegibilidade e motor ═══════════════════════════════════════════
  "AVC — resumo clínico": "ACV — resumen clínico",
  "Módulo AVC iniciado": "Módulo de ACV iniciado",
  "AVC hemorrágico confirmado": "ACV hemorrágico confirmado",
  "AVC isquêmico provável": "ACV isquémico probable",
  "AVC isquêmico sem hemorragia na TC": "ACV isquémico sin hemorragia en la TC",
  "Sem hemorragia definida na TC": "Sin hemorragia definida en la TC",
  "Caso AVC hemorrágico": "Caso de ACV hemorrágico",
  "Caso AVC isquêmico": "Caso de ACV isquémico",
  "Hemorragia: trombólise proibida": "Hemorragia: trombólisis prohibida",
  "Hemorragia ainda não excluída por TC adequada.":
    "Hemorragia todavía no descartada con una TC adecuada.",
  "Neuroimagem ainda precisa excluir hemorragia com segurança.":
    "La neuroimagen todavía debe descartar la hemorragia con seguridad.",
  "Fluxo hemorrágico permanece fechado enquanto a TC não mostrar hemorragia.":
    "El flujo hemorrágico permanece cerrado mientras la TC no muestre hemorragia.",
  "Fluxo redirecionado para AVC hemorrágico.":
    "Flujo redirigido al ACV hemorrágico.",
  "Trombólise intravenosa contraindicada por hemorragia confirmada.":
    "Trombólisis intravenosa contraindicada por hemorragia confirmada.",
  "Hemorragia na TC exige monitorização neurológica intensiva e avaliação neurocirúrgica.":
    "La hemorragia en la TC exige monitorización neurológica intensiva y una evaluación neuroquirúrgica.",
  "Priorizar controle pressórico, reversão de anticoagulação e neurointensivismo/neurocirurgia conforme quadro.":
    "Priorizar el control tensional, la reversión de la anticoagulación y neurocríticos o neurocirugía según el cuadro.",
  "Terapia de reperfusão não aplicável": "Terapia de reperfusión no aplicable",
  "Não elegível no estado atual": "No elegible en el estado actual",
  "Trombectomia não recomendada agora": "Trombectomía no recomendada ahora",
  "Dentro da janela precoce para trombectomia.":
    "Dentro de la ventana precoz para la trombectomía.",
  "Fora da janela usual para trombectomia.":
    "Fuera de la ventana habitual para la trombectomía.",
  "Janela estendida possível; requer imagem/neurologia para seleção.":
    "Ventana extendida posible; requiere imagen y neurología para la selección.",
  "Revisar elegibilidade na janela estendida com neurologia/intervenção.":
    "Revisar la elegibilidad en la ventana extendida con neurología o el equipo de intervención.",
  "Elegibilidade dependente de oclusão de grande vaso e janela adequada.":
    "La elegibilidad depende de una oclusión de gran vaso y de una ventana adecuada.",
  "Suspeita/confirmada oclusão de grande vaso com necessidade de via intervencionista.":
    "Oclusión de gran vaso sospechada o confirmada con necesidad de vía intervencionista.",
  "Suspeita clínica de grande vaso": "Sospecha clínica de gran vaso",
  "Suspeita de grande vaso sem angiotomografia concluída.":
    "Sospecha de gran vaso sin la angio-TC concluida.",
  "Sem confirmação de oclusão de grande vaso.":
    "Sin confirmación de oclusión de gran vaso.",
  "Horário de início/LKW desconhecido ou sem confiabilidade.":
    "Hora de inicio o de la última vez visto bien desconocida o poco fiable.",
  "Tempo/LKW incerto para estratégia de reperfusão.":
    "Tiempo o última vez visto bien inciertos para la estrategia de reperfusión.",
  "Não foi possível calcular a janela temporal com os horários informados.":
    "No se pudo calcular la ventana temporal con los horarios introducidos.",
  "Confiabilidade do horário": "Fiabilidad de la hora",
  "Dia da última vez normal": "Día de la última vez normal",
  "Dia do início dos sintomas": "Día del inicio de los síntomas",
  "Última vez normal": "Última vez normal",
  "a última vez normal": "la última vez normal",
  "o início dos sintomas": "el inicio de los síntomas",
  "PA acima do limite para trombólise; controlar e reavaliar.":
    "PA por encima del límite para la trombólisis; controlarla y reevaluar.",
  "Glicemia crítica: corrigir antes de decidir reperfusão.":
    "Glucemia crítica: corregirla antes de decidir la reperfusión.",
  "NIHSS baixo: confirmar se o déficit é realmente incapacitante.":
    "NIHSS bajo: confirmar si el déficit es realmente incapacitante.",
  "NIHSS incompleto sem justificativa de déficit incapacitante documentada.":
    "NIHSS incompleto sin una justificación documentada de déficit incapacitante.",
  "déficit incapacitante": "déficit incapacitante",
  "Sem déficit mensurável": "Sin déficit mensurable",
  "Possível mimetizador de AVC; revisar hipótese e correlações clínicas.":
    "Posible imitador de ACV; revisar la hipótesis y las correlaciones clínicas.",
  "Coagulopatia/anticoagulação incompatível detectada; rever exames, última dose e possibilidade de reversão.":
    "Se detectó una coagulopatía o anticoagulación incompatible; revisar los exámenes, la última dosis y la posibilidad de reversión.",
  "Instabilidade clínica ou necessidade de proteção de via aérea.":
    "Inestabilidad clínica o necesidad de proteger la vía aérea.",
  "Instabilidade ABC já documentada": "Inestabilidad del ABC ya documentada",
  "Prioridade clínica imediata": "Prioridad clínica inmediata",
  "Sem alerta crítico imediato documentado":
    "Sin ninguna alerta crítica inmediata documentada",
  "Sem resposta adequada": "Sin una respuesta adecuada",
  "Controle pressórico": "Control tensional",
  "Controle pressórico imediato antes de seguir":
    "Control tensional inmediato antes de continuar",
  "Abortar crise, reavaliar mimetizador e proteger via aérea":
    "Yugular la crisis, reevaluar un posible imitador y proteger la vía aérea",
  "Checar ritmo, ECG e tratar arritmia com instabilidade":
    "Comprobar el ritmo y el ECG, y tratar la arritmia con inestabilidad",
  "Necessita observação monitorizada e reavaliação neurológica seriada.":
    "Necesita observación monitorizada y reevaluación neurológica seriada.",
  "Pós-trombólise requer monitorização intensiva/unidade especializada.":
    "Tras la trombólisis se requiere monitorización intensiva o una unidad especializada.",
  "Revisão baseada em tempo, imagem, NIHSS, hemodinâmica e contraindicações.":
    "Revisión basada en el tiempo, la imagen, el NIHSS, la hemodinámica y las contraindicaciones.",
  "Alta com seguimento em ambulatório de AVC":
    "Alta con seguimiento en consulta de ictus",
  "Estado AVC inválido": "Estado de ACV no válido",
  "TC sem contraste": "TC sin contraste",
  "Resumo automático a partir dos itens 1a, 1b e 1c do NIHSS.":
    "Resumen automático a partir de los ítems 1a, 1b y 1c del NIHSS.",
  "A creatinina é convertida internamente para mg/dL para manter a lógica clínica do módulo.":
    "La creatinina se convierte internamente a mg/dL para mantener la lógica clínica del módulo.",
  "Valor da chegada. A glicemia é convertida internamente para mg/dL para manter a lógica clínica do módulo.":
    "Valor a la llegada. La glucemia se convierte internamente a mg/dL para mantener la lógica clínica del módulo.",
  "Valor da chegada. Hipoglicemia e hiperglicemia podem simular ou agravar o déficit neurológico.":
    "Valor a la llegada. La hipoglucemia y la hiperglucemia pueden simular o agravar el déficit neurológico.",
  "0,9 mg/kg (máx 90)": "0,9 mg/kg (máx. 90)",
  "0,25 mg/kg (máx 25)": "0,25 mg/kg (máx. 25)",
  "0,6 mg/kg (máx 50)": "0,6 mg/kg (máx. 50)",
  "80 U/kg (máx 10.000)": "80 U/kg (máx. 10.000)",

  // ══ ACLS — reducer, microcopy, voz, debrief ═══════════════════════════════
  "Antiarrítmico agora": "Antiarrítmico ahora",
  "Antiarrítmico pendente": "Antiarrítmico pendiente",
  "Antiarrítmico administrado": "Antiarrítmico administrado",
  "Registrar antiarrítmico": "Registrar el antiarrítmico",
  "Primeiro antiarrítmico sugerido": "Primer antiarrítmico sugerido",
  "Antiarrítmico ainda pendente. Administrar agora.":
    "Antiarrítmico aún pendiente. Administrarlo ahora.",
  "Antiarrítmico administrado. Manter RCP de alta qualidade. Continuar compressões.":
    "Antiarrítmico administrado. Mantener la RCP de alta calidad. Continuar con las compresiones.",
  "Epinefrina administrada. Manter RCP de alta qualidade. Continuar compressões.":
    "Adrenalina administrada. Mantener la RCP de alta calidad. Continuar con las compresiones.",
  "Amiodarona 150 mg IV/IO ou lidocaína 0,5 a 0,75 mg/kg IV/IO":
    "Amiodarona 150 mg IV/IO o lidocaína 0,5 a 0,75 mg/kg IV/IO",
  "Amiodarona 300 mg IV/IO ou lidocaína 1 a 1,5 mg/kg IV/IO":
    "Amiodarona 300 mg IV/IO o lidocaína 1 a 1,5 mg/kg IV/IO",
  "Considerar antiarrítmico: amiodarona 300 mg IV IO ou lidocaína 1 a 1,5 mg por kg IV IO":
    "Considerar un antiarrítmico: amiodarona 300 mg IV/IO o lidocaína 1 a 1,5 mg por kg IV/IO",
  "Se persistir ritmo chocável, considerar nova dose de antiarrítmico: amiodarona 150 mg IV IO ou lidocaína 0,5 a 0,75 mg por kg IV IO":
    "Si persiste el ritmo desfibrilable, considerar una nueva dosis de antiarrítmico: amiodarona 150 mg IV/IO o lidocaína 0,5 a 0,75 mg por kg IV/IO",
  "Aplicar o choque agora. Bifásico, usar carga equivalente ou maior e considerar escalonamento":
    "Aplicar la descarga ahora. Bifásico: usar una carga equivalente o mayor y considerar el escalamiento",
  "Aplicar o choque agora. Bifásico, usar carga equivalente ou maior que a anterior":
    "Aplicar la descarga ahora. Bifásico: usar una carga equivalente o mayor que la anterior",
  "Aplicar o choque agora. Monofásico, trezentos e sessenta joules":
    "Aplicar la descarga ahora. Monofásico, trescientos sesenta julios",
  "Bifásico: usar dose equivalente ou maior que a anterior; considerar escalonamento":
    "Bifásico: usar una dosis equivalente o mayor que la anterior; considerar el escalamiento",
  "Bifásico: usar dose equivalente ou maior; considerar escalonamento":
    "Bifásico: usar una dosis equivalente o mayor; considerar el escalamiento",
  "Via aérea avançada confirmada. Ventilar uma vez a cada seis segundos. Compressões contínuas, sem pausar para ventilar.":
    "Vía aérea avanzada confirmada. Ventilar una vez cada seis segundos. Compresiones continuas, sin pausar para ventilar.",
  "Choque sem fase de CPR subsequente válida":
    "Descarga sin una fase de RCP posterior válida",
  "Conduta já registrada neste ciclo": "Conducta ya registrada en este ciclo",
  "Confirmação inválida para o estado atual":
    "Confirmación no válida para el estado actual",
  "Resposta inválida para o estado atual":
    "Respuesta no válida para el estado actual",
  "Registro não disponível para o estado atual":
    "Registro no disponible para el estado actual",
  "Intubação já registrada": "Intubación ya registrada",
  "voltar a pedir confirmação": "volver a pedir confirmación",
  "Causa reversível atualizada": "Causa reversible actualizada",
  "Comandos de voz disponíveis": "Comandos de voz disponibles",
  "Próx. epinefrina": "Próx. adrenalina",
  "Início de RCP": "Inicio de la RCP",
  "Reavaliação de ritmo": "Reevaluación del ritmo",
  // Microcopy e histórico
  "Debrief pós-caso": "Debriefing tras el caso",
  "Histórico de casos": "Historial de casos",
  "Nenhum caso salvo localmente.": "Ningún caso guardado localmente.",
  "Nenhuma H ou T foi registrada manualmente no caso.":
    "No se registró manualmente ninguna H ni T en el caso.",
  "Nenhuma métrica de latência registrada.":
    "Ninguna métrica de latencia registrada.",
  "Sugestões de melhoria": "Sugerencias de mejora",
  "Voltar ao caso atual": "Volver al caso actual",
  "transcrições não reconhecidas": "transcripciones no reconocidas",
  // Análise do caso
  "Fluxo ACLS consistente, sem atrasos ou desvios relevantes no caso analisado.":
    "Flujo del ACLS consistente, sin retrasos ni desviaciones relevantes en el caso analizado.",
  "Caso sem desvios relevantes no log analisado.":
    "Caso sin desviaciones relevantes en el registro analizado.",
  "Ciclos mantidos próximos de 2 minutos.":
    "Ciclos mantenidos cerca de los 2 minutos.",
  "Eventos críticos com latência perceptiva abaixo de 100 ms.":
    "Eventos críticos con una latencia perceptiva por debajo de 100 ms.",
  "Antecipar desfibrilação no primeiro ritmo chocável.":
    "Adelantar la desfibrilación en el primer ritmo desfibrilable.",
  "Garantir checagem de ritmo ao fim de cada ciclo concluído.":
    "Garantizar la comprobación del ritmo al final de cada ciclo completado.",
  "Reduzir latência perceptiva em eventos críticos como ritmo e choque.":
    "Reducir la latencia perceptiva en eventos críticos como el ritmo y la descarga.",
  "Reforçar ciclos de 2 minutos com reavaliação no tempo previsto.":
    "Reforzar los ciclos de 2 minutos con reevaluación en el tiempo previsto.",
  "Registrar epinefrina dentro da janela de 3 a 5 minutos quando indicada.":
    "Registrar la adrenalina dentro de la ventana de 3 a 5 minutos cuando esté indicada.",
  "Revisar guard rails disparados e evitar ações fora da fase clínica.":
    "Revisar las barreras de seguridad activadas y evitar acciones fuera de la fase clínica.",
  "Há ciclos com duração fora da faixa esperada de 2 minutos.":
    "Hay ciclos con una duración fuera del rango esperado de 2 minutos.",
  "Nem todo ciclo concluído tem checagem de ritmo correspondente no log.":
    "No todos los ciclos completados tienen una comprobación de ritmo correspondiente en el registro.",
  "Primeira epinefrina ocorreu após a janela recomendada de 3 a 5 minutos.":
    "La primera adrenalina se administró después de la ventana recomendada de 3 a 5 minutos.",
  "Primeiro choque ocorreu após 2 minutos do início do caso.":
    "La primera descarga se aplicó más de 2 minutos después del inicio del caso.",
  // Voz — mensagens ao usuário
  "Baixa confiança no comando. Comandos válidos mostrados abaixo.":
    "Confianza baja en el comando. Los comandos válidos se muestran abajo.",
  "Comando não válido neste passo. Comandos válidos mostrados abaixo.":
    "Comando no válido en este paso. Los comandos válidos se muestran abajo.",
  "Não entendi, tente novamente. Comandos válidos mostrados abaixo.":
    "No lo entendí, inténtelo de nuevo. Los comandos válidos se muestran abajo.",
  "Confirmação expirada.": "Confirmación caducada.",
  "Confirmação de voz expirada.": "Confirmación por voz caducada.",
  "Confirmação por voz pendente.": "Confirmación por voz pendiente.",
  "Não foi possível usar o comando de voz.":
    "No se pudo usar el comando de voz.",
  "Não foi possível iniciar o microfone.": "No se pudo iniciar el micrófono.",
  "Microfone ou reconhecimento de voz indisponível neste dispositivo.":
    "Micrófono o reconocimiento de voz no disponible en este dispositivo.",
  "Reconhecimento de voz indisponível neste dispositivo.":
    "Reconocimiento de voz no disponible en este dispositivo.",

  // ══ TELAS E SISTEMA ═══════════════════════════════════════════════════════
  "Causas reversíveis": "Causas reversibles",
  "Ocultar causas reversíveis": "Ocultar las causas reversibles",
  "Próximo passo": "Paso siguiente",
  "Relatório clínico": "Informe clínico",
  "Ritmo chocável selecionado": "Ritmo desfibrilable seleccionado",
  "Assistente IA indisponível no momento":
    "Asistente de IA no disponible en este momento",
  "Dados clínicos": "Datos clínicos",
  "ACLS · Título": "ACLS · Título",
  "Crítico · Agora": "Crítico · Ahora",
  " • crítico": " • crítico",
  "Adicionar à Tela de Início": "Añadir a la pantalla de inicio",
  "Revisão pendente": "Revisión pendiente",
  "Sessão iniciada pelo app": "Sesión iniciada por la app",
  "Falha ao iniciar sessão clínica": "Error al iniciar la sesión clínica",
  "Falha ao encerrar sessão clínica": "Error al cerrar la sesión clínica",
  "ID da sessão não retornado": "No se devolvió el identificador de la sesión",
  "Sessão expirada. Faça login novamente.":
    "Sesión caducada. Inicie sesión de nuevo.",
  "Supabase não configurado.": "Supabase no está configurado.",
  "Supabase não configurado. Verifique o .env.local com EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.":
    "Supabase no está configurado. Revise el archivo .env.local con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  "Sem permissão de admin. Faça login com uma conta que tenha role='admin' e status='ativo' no Supabase.":
    "Sin permiso de administrador. Inicie sesión con una cuenta que tenga role='admin' y status='ativo' en Supabase.",
  "Migração de admin não aplicada no Supabase. Execute as migrações em supabase/migrations/.":
    "Migración de administrador no aplicada en Supabase. Ejecute las migraciones en supabase/migrations/.",
  "Migração de perfil de usuário não aplicada.":
    "Migración del perfil de usuario no aplicada.",

  // ── Árvores de decisão ─────────────────────────────────────────────────────
  "no chão e mais 4": "en el suelo y 4 más",
  "não intuba, não ventila": "no se intuba, no se ventila",
};
