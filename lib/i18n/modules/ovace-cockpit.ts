/**
 * Espanhol (es-419) — cockpit do OVACE, alinhado ao padrão operacional do AVC.
 *
 * ⚠️ ESTE ARQUIVO NASCEU DE UMA FALHA DE PROCESSO, ⛔ e não de conteúdo novo:
 * o commit `refactor(ovace)` reescreveu `acls-choking-screen.tsx` (522 linhas)
 * e subiu para o origin **sem rodar `test:all`** — a varredura de PT acusou
 * 55 literais sem par em espanhol, e o `test:all` ficou vermelho para quem
 * puxasse a branch. As traduções abaixo fecham exatamente esse buraco.
 *
 * Terminologia (mesma de `acls-ovace.ts`, que já cobre o fluxo antigo): o
 * quadro é OVACE (obstrucción de la vía aérea por cuerpo extraño); as manobras
 * são "golpes en la espalda" (interescapulares) e "compresiones abdominales".
 *
 * ⚠️ O QUE ⛔ NÃO SE TRADUZIU POR APROXIMAÇÃO: "tosse eficaz" ⛔ não é "tos
 * fuerte" — é **eficaz**, ⛔ e é a eficácia que classifica a obstrução em leve.
 * Trocar por "fuerte" moveria a fronteira clínica entre observar e intervir.
 */
export const ES_OVACE_COCKPIT: Record<string, string> = {
  // ── Reconhecimento e classificação ─────────────────────────────────────────
  "Reconhecimento e classificação": "Reconocimiento y clasificación",
  "A obstrução é leve, grave ou já houve inconsciência?":
    "¿La obstrucción es leve, grave o ya hubo pérdida de conciencia?",
  "DECISÃO AGORA": "DECISIÓN AHORA",
  "OBSTRUÇÃO LEVE · tosse eficaz": "OBSTRUCCIÓN LEVE · tos eficaz",
  "OBSTRUÇÃO GRAVE · vítima responsiva": "OBSTRUCCIÓN GRAVE · víctima que responde",
  "INCONSCIENTE · trate como parada": "INCONSCIENTE · trate como paro",
  "Tosse fraca/ausente ou não consegue falar": "Tos débil/ausente o no puede hablar",
  "Não consegue emitir som ou responder.": "No puede emitir sonido ni responder.",
  "A tosse deixou de produzir fluxo de ar eficaz.": "La tos dejó de producir flujo de aire eficaz.",
  "Alteração de cor indica hipóxia já instalada.": "El cambio de color indica hipoxia ya instalada.",
  "Confusão ou sonolência precedem a inconsciência.": "La confusión o la somnolencia preceden a la inconsciencia.",
  "Está inconsciente": "Está inconsciente",

  // ── Obstrução leve · observação ────────────────────────────────────────────
  "Tosse eficaz · observação": "Tos eficaz · observación",
  "Não aplique golpes nem compressões enquanto a tosse permanecer forte e eficaz.":
    "No aplique golpes ni compresiones mientras la tos siga siendo fuerte y eficaz.",
  "Não deixe a vítima sozinha. Reclassifique se a tosse enfraquecer, a fala desaparecer ou houver alteração de consciência.":
    "No deje sola a la víctima. Reclasifique si la tos se debilita, desaparece el habla o hay alteración de la conciencia.",
  "Peça ajuda agora; não espere a perda de consciência.":
    "Pida ayuda ahora; no espere la pérdida de la conciencia.",
  "Tosse enfraqueceu · tratar como grave": "La tos se debilitó · tratar como grave",
  "A tosse enfraqueceu / não consegue falar": "La tos se debilitó / no puede hablar",

  // ── Desobstrução ativa · ciclos 5 + 5 ──────────────────────────────────────
  "Desobstrução ativa · ciclos 5 + 5": "Desobstrucción activa · ciclos 5 + 5",
  "REAVALIE APÓS CADA CICLO 5 + 5": "REEVALÚE DESPUÉS DE CADA CICLO 5 + 5",
  "Faça 5 golpes nas costas": "Aplique 5 golpes en la espalda",
  "Incline o tronco para frente e aplique golpes firmes entre as escápulas com a base da mão.":
    "Incline el tronco hacia adelante y aplique golpes firmes entre las escápulas con la base de la mano.",
  "Faça 5 compressões ABDOMINAIS": "Aplique 5 compresiones ABDOMINALES",
  "Punho ACIMA DO UMBIGO e abaixo do xifoide; tracione rapidamente para dentro e para cima.":
    "Puño POR ENCIMA DEL OMBLIGO y por debajo del apéndice xifoides; traccione rápidamente hacia adentro y hacia arriba.",
  "Faça 5 compressões TORÁCICAS": "Aplique 5 compresiones TORÁCICAS",
  "Comprima na METADE INFERIOR DO ESTERNO. Use na gestação avançada ou quando o abdome for inacessível.":
    "Comprima en la MITAD INFERIOR DEL ESTERNÓN. Úselas en el embarazo avanzado o cuando el abdomen sea inaccesible.",
  "As compressões são TORÁCICAS na gestação avançada ou quando não for possível circundar o abdome":
    "Las compresiones son TORÁCICAS en el embarazo avanzado o cuando no sea posible rodear el abdomen",
  "Repita até expulsão ou inconsciência.": "Repita hasta la expulsión o la pérdida de conciencia.",
  "Objeto saiu? Perdeu a consciência? Se não: repita 5 golpes + 5 compressões.":
    "¿Salió el objeto? ¿Perdió la conciencia? Si no: repita 5 golpes + 5 compresiones.",
  /**
   * ⚠️ A ORDEM É CONTEÚDO CLÍNICO, ⛔ e não estilo: a frase existe para dizer
   * que os golpes vêm ANTES — ⛔ e que o ensino anterior (compressão abdominal
   * isolada) mudou. Traduzir sem o contraste apagaria a atualização.
   */
  "No adulto responsivo, os golpes nas costas vêm primeiro: alterne 5 golpes com 5 compressões. Antes, ensinava-se compressão abdominal isolada.":
    "En el adulto que responde, los golpes en la espalda van primero: alterne 5 golpes con 5 compresiones. Antes se enseñaba la compresión abdominal aislada.",
  "Acione ajuda / emergência": "Active la ayuda / emergencia",
  "Acione a emergência e peça um DEA": "Active la emergencia y pida un DEA",
  "Peça DEA e suporte sem abandonar a vítima.": "Pida un DEA y apoyo sin abandonar a la víctima.",
  "Se ficar inconsciente": "Si queda inconsciente",
  "Perdeu a consciência": "Perdió la conciencia",

  // ── Inconsciência · RCP ────────────────────────────────────────────────────
  "Inconsciência · RCP": "Inconsciencia · RCP",
  "Perdeu a consciência · abrir PCR": "Perdió la conciencia · abrir PCR",
  "Coloque em superfície firme e inicie RCP": "Colóquela sobre una superficie firme e inicie RCP",
  "Comece pelas compressões. A RCP mantém a sequência padrão 30:2.":
    "Comience por las compresiones. La RCP mantiene la secuencia estándar 30:2.",
  "Inicie RCP pelas compressões e examine a boca antes das ventilações.":
    "Inicie la RCP por las compresiones y examine la boca antes de las ventilaciones.",
  "Após cada 30 compressões, olhe a boca": "Después de cada 30 compresiones, mire la boca",
  /**
   * ⚠️ "SOMENTE se estiver visível" e "NUNCA às cegas" são os dois lados da
   * mesma regra de segurança — ⛔ nenhum dos dois pode perder a ênfase.
   */
  "Antes das 2 ventilações, retire o objeto SOMENTE se estiver visível. NUNCA faça varredura digital às cegas.":
    "Antes de las 2 ventilaciones, retire el objeto SOLO si está visible. NUNCA haga barrido digital a ciegas.",

  // ── Reavaliação e destino ──────────────────────────────────────────────────
  "REAVALIAÇÃO E DESTINO": "REEVALUACIÓN Y DESTINO",
  "Reavalie via aérea, ventilação e consciência": "Reevalúe vía aérea, ventilación y conciencia",
  "Tosse, estridor, sibilos, dispneia ou hipoxemia persistentes sugerem obstrução residual ou lesão.":
    "Tos, estridor, sibilancias, disnea o hipoxemia persistentes sugieren obstrucción residual o lesión.",
  "Encaminhe para avaliação médica": "Derive para evaluación médica",
  "AVALIAÇÃO MÉDICA É NECESSÁRIA MESMO EM QUEM FICOU ASSINTOMÁTICO, pelo risco de corpo estranho residual e lesões da via aérea ou das manobras.":
    "LA EVALUACIÓN MÉDICA ES NECESARIA INCLUSO EN QUIEN QUEDÓ ASINTOMÁTICO, por el riesgo de cuerpo extraño residual y de lesiones de la vía aérea o por las maniobras.",
  "Voltar e reclassificar": "Volver y reclasificar",

  // ── Cromado do cockpit ─────────────────────────────────────────────────────
  "Siga uma decisão por vez. O app preserva o contexto e conduz do reconhecimento à desobstrução, RCP ou avaliação pós-evento.":
    "Siga una decisión a la vez. La app preserva el contexto y conduce del reconocimiento a la desobstrucción, la RCP o la evaluación posterior al evento.",
  "Depois de executar e conferir a conduta, registre a conclusão da etapa.":
    "Después de ejecutar y verificar la conducta, registre la conclusión de la etapa.",
  "Depois de executar e conferir a conduta, registre o resultado do ciclo.":
    "Después de ejecutar y verificar la conducta, registre el resultado del ciclo.",
  "Intercorrências sem perder o fluxo atual": "Intercurrencias sin perder el flujo actual",
  "ABRIR ▼": "ABRIR ▼",
  /** ⚠️ "detalhes" ⛔ não é "detalles" por acaso: o dígrafo `lh` é PT, ⛔ e a trava
   *  de tela em espanhol cobra exatamente ele. */
  "VER DETALHES ›": "VER DETALLES ›",
  "OCULTAR DETALHES": "OCULTAR DETALLES",
  "Mudou em 2025": "Cambió en 2025",
  "Fonte: American Heart Association · Diretrizes de RCP e ACE 2025 · OVACE em adultos":
    "Fuente: American Heart Association · Guías de RCP y ACE 2025 · OVACE en adultos",

  // ── constants/module-groups.ts ─────────────────────────────────────────────
  "Antropometria, TFG, SOFA, Glasgow, Wells, HEART, NIHSS, RASS e mais":
    "Antropometría, TFG, SOFA, Glasgow, Wells, HEART, NIHSS, RASS y más",
};
