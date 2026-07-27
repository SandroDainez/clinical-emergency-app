/**
 * AVC — NIHSS, elegibilidade para trombólise e prompts de voz do ACLS.
 * Dicionário PT → ES.
 *
 * Nota sobre voz: as frases de reconhecimento (acls/voice-intents.ts) têm
 * arquivo espanhol próprio em acls/locales/es-419/voice-phrases.ts; aqui entram
 * só os textos de confirmação exibidos ao médico.
 */
export const ES_AVC_NIHSS: Record<string, string> = {
  // ── Seções e etapas ────────────────────────────────────────────────────────
  "Identificação, tempos e origem": "Identificación, tiempos y procedencia",
  "Tempos críticos": "Tiempos críticos",
  "Sinais vitais e monitorização": "Signos vitales y monitorización",
  "Sintomas e quadro neurológico": "Síntomas y cuadro neurológico",
  "Escala neurológica completa": "Escala neurológica completa",
  "História clínica relevante": "Antecedentes clínicos relevantes",
  "TC, AngioTC e pendências": "TC, angio-TC y pendientes",
  "Elegibilidade, correções e prescrição":
    "Elegibilidad, correcciones y prescripción",
  "Sala vermelha / observação monitorizada":
    "Sala roja / observación monitorizada",
  "Transferência para centro de trombectomia":
    "Traslado a un centro de trombectomía",

  // ── Itens do NIHSS ─────────────────────────────────────────────────────────
  "11. Extinção / negligência": "11. Extinción / negligencia",
  "5a. Braço esquerdo": "5a. Brazo izquierdo",
  "5b. Braço direito": "5b. Brazo derecho",
  "Braço D": "Brazo dcho.",
  "Braço E": "Brazo izq.",
  "Resposta global ao estímulo.": "Respuesta global al estímulo.",
  "Desperta ao estímulo mínimo.": "Despierta con un estímulo mínimo.",
  "Requer estímulo repetido": "Requiere estímulo repetido",
  "Necessita estímulos vigorosos.": "Necesita estímulos vigorosos.",
  "Acerta mês e idade.": "Acierta el mes y la edad.",
  "Mês e idade corretos.": "Mes y edad correctos.",
  "Não acerta nenhuma resposta.": "No acierta ninguna respuesta.",
  "Obedece abrir/fechar olhos e apertar/soltar mão.":
    "Obedece a abrir y cerrar los ojos y a apretar y soltar la mano.",
  "Não obedece comandos.": "No obedece órdenes.",
  "Sem paralisia ocular.": "Sin parálisis ocular.",
  "Desvio do olhar ou limitação.": "Desviación de la mirada o limitación.",
  "Desvio tônico ou ausência total.": "Desviación tónica o ausencia total.",
  "Movimento facial voluntário.": "Movimiento facial voluntario.",
  "Mantém elevação por 10 segundos.": "Mantiene la elevación durante 10 segundos.",
  "Mantém elevação por 5 segundos.": "Mantiene la elevación durante 5 segundos.",
  "Mantém o membro.": "Mantiene el miembro.",
  "Queda antes de 10 s sem tocar leito.":
    "Cae antes de los 10 s sin llegar a tocar la cama.",
  "Queda antes de 5 s sem tocar leito.":
    "Cae antes de los 5 s sin llegar a tocar la cama.",
  "Algum esforço": "Algún esfuerzo",
  "Movimento sem vencer gravidade.": "Movimiento sin vencer la gravedad.",
  "Não sustenta contra gravidade.": "No lo sostiene contra la gravedad.",
  "Sem movimento voluntário.": "Sin movimiento voluntario.",
  "Sem dismetria ou decomposição do movimento ao teste.":
    "Sin dismetría ni descomposición del movimiento en la prueba.",
  "Ataxia clara em um membro, além do esperado pela força.":
    "Ataxia clara en un miembro, más allá de lo esperable por la fuerza.",
  "Ataxia em dois membros, com descoordenação evidente.":
    "Ataxia en dos miembros, con descoordinación evidente.",
  "Ataxia = incoordenação do movimento que não se explica só por fraqueza. Testar dedo-nariz e calcanhar-joelho quando possível.":
    "Ataxia = descoordinación del movimiento que no se explica solo por la debilidad. Probar dedo-nariz y talón-rodilla cuando sea posible.",
  "Sem perda.": "Sin pérdida.",
  "Perda sensitiva hemisférica.": "Pérdida sensitiva hemisférica.",
  "Sem afasia.": "Sin afasia.",
  "Afasia e produção de linguagem.": "Afasia y producción del lenguaje.",
  "Disartria = dificuldade para articular as palavras. Avalie clareza da fala, não o conteúdo da linguagem.":
    "Disartria = dificultad para articular las palabras. Evalúe la claridad del habla, no el contenido del lenguaje.",
  "Fala arrastada, mas ainda compreensível.":
    "Habla arrastrada, pero todavía comprensible.",
  "Fala ininteligível, muito prejudicada ou anártrica.":
    "Habla ininteligible, muy afectada o anártrica.",
  "Negligência/extinção = o paciente ignora um lado do corpo ou do espaço, principalmente em estímulo simultâneo.":
    "Negligencia o extinción = el paciente ignora un lado del cuerpo o del espacio, sobre todo con estimulación simultánea.",
  "Reconhece ambos os lados sem extinção.":
    "Reconoce ambos lados sin extinción.",
  "Há extinção ou desatenção parcial a um lado.":
    "Hay extinción o desatención parcial a un lado.",
  "Negligência franca, persistente ou multimodal.":
    "Negligencia franca, persistente o multimodal.",

  // ── Contraindicações e bloqueios ───────────────────────────────────────────
  "Hemorragia não excluída por TC": "Hemorragia no descartada por TC",
  "Trombólise proibida até excluir hemorragia adequadamente.":
    "Trombólisis prohibida hasta descartar adecuadamente la hemorragia.",
  "TC ainda não realizada, sem laudo/interpretação ou inconclusiva.":
    "TC aún no realizada, sin informe o interpretación, o no concluyente.",
  "HIC prévia / lesão intracraniana de alto risco":
    "Hemorragia intracraneal previa / lesión intracraneal de alto riesgo",
  "História de hemorragia intracraniana, malformação, aneurisma/lesão estrutural de maior risco ou contexto neurocirúrgico relevante.":
    "Antecedente de hemorragia intracraneal, malformación, aneurisma o lesión estructural de mayor riesgo, o un contexto neuroquirúrgico relevante.",
  "Proíbe trombólise intravenosa.": "Prohíbe la trombólisis intravenosa.",
  "Coagulopatia incompatível": "Coagulopatía incompatible",
  "Plaquetas baixas, INR elevado, anticoagulação ativa incompatível ou TTPa prolongado relevante.":
    "Plaquetas bajas, INR elevado, anticoagulación activa incompatible o TTPA prolongado relevante.",
  "Aumenta risco hemorrágico grave com trombólise.":
    "Aumenta el riesgo de hemorragia grave con la trombólisis.",
  "Tempo de início / LKW (última vez visto bem) desconhecido":
    "Hora de inicio o de la última vez visto bien desconocida",
  "Sem hora confiável de início dos sintomas ou última vez normal.":
    "Sin una hora fiable de inicio de los síntomas ni de la última vez que estuvo normal.",
  "Impede recomendação automática de reperfusão padrão.":
    "Impide la recomendación automática de reperfusión estándar.",
  "PA acima do limite para trombólise":
    "PA por encima del límite para la trombólisis",
  "Exige controle pressórico antes de qualquer trombólise.":
    "Exige el control tensional antes de cualquier trombólisis.",
  "Controlar PA, registrar horário e reavaliar elegibilidade.":
    "Controlar la PA, registrar la hora y reevaluar la elegibilidad.",
  "Glicemia extrema não corrigida": "Glucemia extrema sin corregir",
  "Corrigir glicemia, repetir medida e reavaliar déficit neurológico.":
    "Corregir la glucemia, repetir la medición y reevaluar el déficit neurológico.",
  "Bloqueia decisão automática até correção e reavaliação neurológica.":
    "Bloquea la decisión automática hasta la corrección y la reevaluación neurológica.",
  "Crise ao início, período pós-ictal ou hipótese alternativa forte para o déficit.":
    "Crisis al inicio, período postictal o una hipótesis alternativa fuerte para el déficit.",
  "Exige revisão clínica e imagem antes de reperfusão.":
    "Exige una revisión clínica y de imagen antes de la reperfusión.",
  "Sangramento digestivo/geniturinário recente":
    "Sangrado digestivo o genitourinario reciente",
  "Sangramento gastrointestinal, geniturinário ou outro sangramento relevante em curso.":
    "Sangrado gastrointestinal, genitourinario u otro sangrado relevante en curso.",
  "Hemorragia digestiva, urinária ou menorragia clinicamente relevante nas últimas semanas.":
    "Hemorragia digestiva, urinaria o menorragia clínicamente relevante en las últimas semanas.",
  "Punção recente em sítio não compressível":
    "Punción reciente en un sitio no compresible",
  "Punção arterial em local não compressível, punção dural ou procedimento semelhante recente.":
    "Punción arterial en un sitio no compresible, punción dural o un procedimiento similar reciente.",
  "Risco hemorrágico depende do local e do intervalo; revisar caso a caso antes da trombólise.":
    "El riesgo hemorrágico depende del sitio y del intervalo; revisarlo caso por caso antes de la trombólisis.",
  "Cirurgia maior ou trauma cranioencefálico recente conforme protocolo local.":
    "Cirugía mayor o traumatismo craneoencefálico reciente según el protocolo local.",
  "Gestação / puerpério muito recente": "Embarazo / puerperio muy reciente",
  "Gestação em curso ou puerpério muito recente, especialmente nos primeiros 10 dias pós-parto.":
    "Embarazo en curso o puerperio muy reciente, sobre todo en los primeros 10 días tras el parto.",
  "Exige decisão compartilhada com neurologia/obstetrícia e ponderação individual do risco hemorrágico.":
    "Exige una decisión compartida con neurología y obstetricia, y una ponderación individual del riesgo hemorrágico.",
  "Exames pendentes em usuário de anticoagulante":
    "Exámenes pendientes en un paciente anticoagulado",
  "Exames essenciais não disponíveis em contexto de anticoagulação ou coagulopatia suspeita.":
    "Exámenes esenciales no disponibles en un contexto de anticoagulación o de sospecha de coagulopatía.",
  "Obter exames e revisar anticoagulante/última dose.":
    "Obtener los exámenes y revisar el anticoagulante y la última dosis.",
  "Rever tipo de anticoagulante, tempo da última dose, exames e possibilidade de reversão.":
    "Revisar el tipo de anticoagulante, el tiempo desde la última dosis, los exámenes y la posibilidad de reversión.",
  "Mantém decisão em revisão até completar dados.":
    "Mantiene la decisión en revisión hasta completar los datos.",
  "Déficit menor e potencialmente não incapacitante":
    "Déficit menor y potencialmente no incapacitante",
  "NIHSS baixo sem claro déficit incapacitante.":
    "NIHSS bajo sin un déficit incapacitante claro.",
  "Exige balanço risco-benefício individualizado; não é bloqueio automático universal.":
    "Exige un balance riesgo-beneficio individualizado; no es un bloqueo automático universal.",
  "Exige discussão clínica; não liberar automaticamente.":
    "Exige una discusión clínica; no autorizarlo de forma automática.",
  "Exige revisão especializada e correlação com imagem antes de liberar trombólise.":
    "Exige una revisión especializada y la correlación con la imagen antes de autorizar la trombólisis.",
  "Proíbe trombólise até resolução e revisão especializada.":
    "Prohíbe la trombólisis hasta su resolución y una revisión especializada.",
  "Bloqueia trombólise.": "Bloquea la trombólisis.",
  "Suspeita de oclusão de grande vaso sem avaliação vascular":
    "Sospecha de oclusión de gran vaso sin evaluación vascular",
  "CTA ainda não feita ou sem resultado apesar de suspeita clínica.":
    "Angio-TC aún no realizada o sin resultado a pesar de la sospecha clínica.",
  "Solicitar/interpretar angiotomografia e acionar neurologia/intervenção.":
    "Solicitar e interpretar la angio-TC y avisar a neurología o al equipo de intervención.",
  "Acelerar neuroimagem e registrar horário de interpretação.":
    "Acelerar la neuroimagen y registrar la hora de la interpretación.",

  // ── Dose de alteplase ──────────────────────────────────────────────────────
  "Dose total 0,9 mg/kg; 10% em bolus e 90% em infusão contínua por 60 minutos.":
    "Dosis total de 0,9 mg/kg; el 10% en bolo y el 90% en infusión continua durante 60 minutos.",
  "Dose em bolus único; confirmar alinhamento com protocolo local e estratégia de trombectomia.":
    "Dosis en un bolo único; confirmar la concordancia con el protocolo local y la estrategia de trombectomía.",

  // ── Prompts de confirmação por voz (ACLS) ──────────────────────────────────
  "Confirmar ação?": "¿Confirmar la acción?",
  "Baixa confiança no comando.": "Confianza baja en el comando.",
  "Confirmar antiarrítmico administrado?": "¿Confirmar el antiarrítmico administrado?",
  "Confirmar desfibrilador bifásico?": "¿Confirmar el desfibrilador bifásico?",
  "Confirmar desfibrilador monofásico?": "¿Confirmar el desfibrilador monofásico?",
  "Confirmar retorno da circulação espontânea?":
    "¿Confirmar la recuperación de la circulación espontánea?",
  "Confirmar ritmo chocável?": "¿Confirmar el ritmo desfibrilable?",
  "Confirmar ritmo não chocável?": "¿Confirmar el ritmo no desfibrilable?",
};
