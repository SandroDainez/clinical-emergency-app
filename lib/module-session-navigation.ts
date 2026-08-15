const preservedProtocolSessions = new Set<string>();

/**
 * Causas reversíveis a PRÉ-MARCAR ao retomar um protocolo, por id de protocolo.
 *
 * ── POR QUE ISTO EXISTE ─────────────────────────────────────────────────────
 *
 * A parada por engasgo tem CAUSA CONHECIDA. Quando o fluxo entra na PCR vindo
 * do OVACE, hipóxia por corpo estranho já é a causa identificada — e o app
 * pedia que se procurasse do zero o que a própria navegação sabia.
 *
 * ── SUSPEITA, NUNCA ABORDADA ────────────────────────────────────────────────
 *
 * "Abordada" significa TRATEI. No engasgo a hipóxia só está tratada quando o
 * objeto sai; marcá-la como abordada faria o app declarar resolvida uma causa
 * que ainda está matando o paciente. "Suspeita" é o estado real: identificada e
 * não resolvida.
 *
 * A promoção para "abordada" é MANUAL POR DESENHO. Conferido: o status só muda
 * pelo evento `reversible_cause_status_updated`, sempre com `origin: "user"` —
 * não existe promoção automática em lugar nenhum do reducer.
 *
 * ── ⚠️ A REDUNDÂNCIA COM O TEXTO É DELIBERADA E NÃO VIOLA O R-12 ────────────
 *
 * O card de destino DIZ que a causa já está identificada, mesmo com esta
 * marcação funcionando. Uma auditoria futura pode ler isso como duplicação e
 * querer "unificar". NÃO SÃO O MESMO CONSTRUTO:
 *
 *   · a marcação é ESTADO — o APP sabe, e o painel de causas reflete;
 *   · o texto é ENSINO — a PESSOA sabe, e entende por que a causa está lá.
 *
 * O R-12 trata de CONTEÚDO IGUAL em dois lugares, que pode divergir com o
 * tempo. Aqui divergir é impossível, porque um não é cópia do outro: o texto
 * não repete a marcação, explica-a. E há a razão prática — se a sessão for
 * retomada por outro caminho, ou se este mecanismo falhar, o texto continua
 * ensinando. Remover qualquer um dos dois perde algo que o outro não cobre.
 */
const preMarcacaoDeCausas = new Map<string, string[]>();

function markProtocolSessionForResume(protocolId: string, causasSuspeitas?: string[]) {
  if (!protocolId) {
    return;
  }
  preservedProtocolSessions.add(protocolId);
  if (causasSuspeitas?.length) {
    preMarcacaoDeCausas.set(protocolId, [...causasSuspeitas]);
  }
}

/** Consome as causas a pré-marcar — uma vez só, como o próprio resume. */
function consumeCausasPreMarcadas(protocolId: string): string[] {
  const causas = preMarcacaoDeCausas.get(protocolId) ?? [];
  if (causas.length) {
    preMarcacaoDeCausas.delete(protocolId);
  }
  return causas;
}

function isProtocolSessionMarkedForResume(protocolId: string) {
  return preservedProtocolSessions.has(protocolId);
}

function consumeProtocolSessionResume(protocolId: string) {
  const marked = preservedProtocolSessions.has(protocolId);
  if (marked) {
    preservedProtocolSessions.delete(protocolId);
  }
  return marked;
}

export {
  consumeCausasPreMarcadas,
  consumeProtocolSessionResume,
  isProtocolSessionMarkedForResume,
  markProtocolSessionForResume,
};
