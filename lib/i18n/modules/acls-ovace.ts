/**
 * Espanhol (es-419) — módulo "Engasgo (OVACE) no Adulto".
 *
 * Terminologia: em espanhol o quadro é OVACE (obstrucción de la vía aérea por
 * cuerpo extraño) e as manobras são "golpes interescapulares" e "compresiones
 * abdominales". "Atragantamiento" é o termo leigo equivalente a engasgo.
 */
export const ES_ACLS_OVACE: Record<string, string> = {
  // Cabeçalho e introdução
  "ACLS · Engasgo (OVACE)": "ACLS · Atragantamiento (OVACE)",
  "Engasgo (OVACE)": "Atragantamiento (OVACE)",
  "Engasgo (OVACE) no Adulto": "Atragantamiento (OVACE) en el Adulto",
  "Obstrução de via aérea por corpo estranho": "Obstrucción de la vía aérea por cuerpo extraño",
  "A obstrução leve se resolve com a própria tosse. A obstrução grave é uma emergência de minutos: a vítima que perde a consciência evolui rapidamente para parada.":
    "La obstrucción leve se resuelve con la propia tos. La obstrucción grave es una emergencia de minutos: la víctima que pierde la conciencia evoluciona rápidamente a paro.",

  // O que mudou
  "Mudou em 2025": "Cambió en 2025",
  "Golpes nas costas vêm PRIMEIRO": "Los golpes interescapulares van PRIMERO",
  "A AHA 2025 passou a recomendar ciclos de 5 golpes nas costas SEGUIDOS de 5 compressões abdominais. Antes, a manobra de escolha no adulto era a compressão abdominal isolada. Quem se guiar pela memória do curso antigo vai começar pela manobra errada.":
    "La AHA 2025 pasó a recomendar ciclos de 5 golpes interescapulares SEGUIDOS de 5 compresiones abdominales. Antes, la maniobra de elección en el adulto era la compresión abdominal aislada. Quien se guíe por la memoria del curso antiguo empezará por la maniobra equivocada.",

  // Sinais de gravidade
  "Sinais de obstrução GRAVE": "Signos de obstrucción GRAVE",
  "Qualquer um destes já define obstrução grave e manda agir:":
    "Cualquiera de estos ya define obstrucción grave y obliga a actuar:",
  "Tosse fraca ou ausente": "Tos débil o ausente",
  "A tosse eficaz é o melhor mecanismo de desobstrução — quando ela enfraquece, a obstrução virou grave.":
    "La tos eficaz es el mejor mecanismo de desobstrucción — cuando se debilita, la obstrucción pasó a ser grave.",
  "Incapaz de falar": "Incapaz de hablar",
  "Não consegue emitir som nem responder. Pergunte: “Você está engasgado?”":
    "No logra emitir sonido ni responder. Pregunte: “¿Se está atragantando?”",
  "Alteração de cor (cianose)": "Alteración del color (cianosis)",
  "Lábios e extremidades azulados indicam hipóxia já instalada.":
    "Labios y extremidades azulados indican hipoxia ya instalada.",
  "Estado mental alterado": "Estado mental alterado",
  "Sonolência, confusão ou perda de contato — precede a inconsciência.":
    "Somnolencia, confusión o pérdida de contacto — precede a la inconsciencia.",
  Apneia: "Apnea",
  "Ausência de esforço respiratório eficaz.": "Ausencia de esfuerzo respiratorio eficaz.",

  // Sequência
  Sequência: "Secuencia",
  "Do reconhecimento à RCP": "Del reconocimiento a la RCP",
  "Verifique a segurança do local": "Verifique la seguridad del lugar",
  "Antes de qualquer manobra, garanta que o ambiente é seguro para você e para a vítima.":
    "Antes de cualquier maniobra, asegure que el ambiente sea seguro para usted y para la víctima.",
  "Obstrução é GRAVE ou leve?": "¿La obstrucción es GRAVE o leve?",
  "Se a vítima tosse com força, fala e respira, a obstrução é LEVE: INCENTIVE A TOSSE e continue observando. Não interfira — a tosse é mais eficaz que qualquer manobra. Se houver qualquer sinal de gravidade, siga adiante.":
    "Si la víctima tose con fuerza, habla y respira, la obstrucción es LEVE: ANIME LA TOS y siga observando. No interfiera — la tos es más eficaz que cualquier maniobra. Si hay cualquier signo de gravedad, continúe.",
  "Acione o sistema de emergência": "Active el sistema de emergencia",
  "Na obstrução grave, chame ajuda ANTES de esgotar as manobras. A vítima que perde a consciência pode evoluir rapidamente para parada cardiorrespiratória.":
    "En la obstrucción grave, pida ayuda ANTES de agotar las maniobras. La víctima que pierde la conciencia puede evolucionar rápidamente a paro cardiorrespiratorio.",
  "5 golpes nas costas → 5 compressões abdominais":
    "5 golpes interescapulares → 5 compresiones abdominales",
  "Faça ciclos repetidos: 5 golpes (tapas) firmes entre as escápulas, com a base da mão, seguidos de 5 compressões abdominais. Repita até o objeto ser expelido ou a vítima ficar inconsciente.":
    "Haga ciclos repetidos: 5 golpes firmes entre las escápulas, con la base de la mano, seguidos de 5 compresiones abdominales. Repita hasta que el objeto sea expulsado o la víctima quede inconsciente.",
  "Se o objeto for expelido": "Si el objeto es expulsado",
  "Mantenha a vítima em observação até a chegada do serviço médico de emergência. Pode haver lesão de via aérea, aspiração residual ou lesão visceral pelas compressões.":
    "Mantenga a la víctima en observación hasta la llegada del servicio médico de emergencia. Puede haber lesión de la vía aérea, aspiración residual o lesión visceral por las compresiones.",
  "Se a vítima ficar INCONSCIENTE": "Si la víctima queda INCONSCIENTE",
  "Inicie a RCP imediatamente e siga o algoritmo de SBV do adulto até a chegada do suporte avançado. Comece pelas COMPRESSÕES. Antes de cada ventilação, olhe a boca e retire o objeto apenas se ele estiver visível.":
    "Inicie la RCP de inmediato y siga el algoritmo de SVB del adulto hasta la llegada del soporte avanzado. Comience por las COMPRESIONES. Antes de cada ventilación, mire la boca y retire el objeto solo si está visible.",

  // Exceção
  "⚠️ Quando as compressões são TORÁCICAS": "⚠️ Cuándo las compresiones son TORÁCICAS",
  "Na gestação em fase final — ou sempre que o socorrista não conseguir circundar o abdome da vítima — as 5 compressões são TORÁCICAS, não abdominais. Os 5 golpes nas costas continuam iguais.":
    "En la gestación en fase final — o siempre que el reanimador no logre rodear el abdomen de la víctima — las 5 compresiones son TORÁCICAS, no abdominales. Los 5 golpes interescapulares siguen iguales.",

  // Rodapé
  "Não confundir com a via aérea difícil da intubação":
    "No confundir con la vía aérea difícil de la intubación",
  "Este módulo é do engasgo presenciado, com a vítima ainda respondendo ou recém-inconsciente. Corpo estranho encontrado durante a intubação, angioedema e abscesso são via aérea difícil — ver o módulo de ISR.":
    "Este módulo es del atragantamiento presenciado, con la víctima aún respondiendo o recién inconsciente. Cuerpo extraño hallado durante la intubación, angioedema y absceso son vía aérea difícil — ver el módulo de ISR.",
  "Baseado em AHA 2025 — Destaques das Diretrizes de RCP e ACE (JN-1580), Figura 6 e Suporte Básico de Vida em adultos":
    "Basado en AHA 2025 — Aspectos Destacados de las Guías de RCP y ACE (JN-1580), Figura 6 y Soporte Vital Básico en adultos",

  // Engine, hub e atalho
  "Referência — Engasgo (OVACE) no Adulto": "Referencia — Atragantamiento (OVACE) en el Adulto",
  "Módulo de referência estática — Engasgo (OVACE) no Adulto":
    "Módulo de referencia estática — Atragantamiento (OVACE) en el Adulto",
  "Obstrução de via aérea por corpo estranho no adulto: sinais de gravidade e a sequência de 2025 — golpes nas costas antes das compressões abdominais.":
    "Obstrucción de la vía aérea por cuerpo extraño en el adulto: signos de gravedad y la secuencia de 2025 — golpes interescapulares antes de las compresiones abdominales.",
  "Golpes nas costas · 5+5": "Golpes interescapulares · 5+5",
};
