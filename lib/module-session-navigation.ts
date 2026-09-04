import { getClinicalSessionRuntime } from "./clinical-session-runtime";

const RESUME_TTL_MS = 30 * 60 * 1000;
type ResumeMarker = { caseId: string; markedAt: number };
const preservedProtocolSessions = new Map<string, ResumeMarker>();

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
const preMarcacaoDeCausas = new Map<string, { caseId: string; markedAt: number; causas: string[] }>();

function currentCaseId(): string | undefined {
  return getClinicalSessionRuntime().caseId;
}

function markerIsValid(marker: ResumeMarker | undefined, now: number = Date.now()): marker is ResumeMarker {
  if (!marker) return false;
  const activeCaseId = currentCaseId();
  return Boolean(activeCaseId && marker.caseId === activeCaseId && now - marker.markedAt <= RESUME_TTL_MS);
}

function markProtocolSessionForResume(protocolId: string, causasSuspeitas?: string[]) {
  if (!protocolId) return;
  const caseId = currentCaseId();
  if (!caseId) return;
  const markedAt = Date.now();
  preservedProtocolSessions.set(protocolId, { caseId, markedAt });
  if (causasSuspeitas?.length) {
    preMarcacaoDeCausas.set(protocolId, { caseId, markedAt, causas: [...causasSuspeitas] });
  }
}

/** Consome as causas a pré-marcar — uma vez só, como o próprio resume. */
function consumeCausasPreMarcadas(protocolId: string): string[] {
  const marker = preMarcacaoDeCausas.get(protocolId);
  preMarcacaoDeCausas.delete(protocolId);
  if (!marker) return [];
  if (!markerIsValid({ caseId: marker.caseId, markedAt: marker.markedAt })) return [];
  return marker.causas;
}

function isProtocolSessionMarkedForResume(protocolId: string) {
  const marker = preservedProtocolSessions.get(protocolId);
  if (markerIsValid(marker)) return true;
  preservedProtocolSessions.delete(protocolId);
  preMarcacaoDeCausas.delete(protocolId);
  return false;
}

function consumeProtocolSessionResume(protocolId: string) {
  const marker = preservedProtocolSessions.get(protocolId);
  preservedProtocolSessions.delete(protocolId);
  if (!markerIsValid(marker)) {
    preMarcacaoDeCausas.delete(protocolId);
    return false;
  }
  return true;
}

export {
  consumeCausasPreMarcadas,
  consumeProtocolSessionResume,
  isProtocolSessionMarkedForResume,
  markProtocolSessionForResume,
};
