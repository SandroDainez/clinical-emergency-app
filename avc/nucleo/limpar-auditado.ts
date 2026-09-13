/**
 * «LIMPAR» AUDITADO — D-PEND-26 (AC-63), decisão do autor, 2026-09-13.
 *
 * > *"«Limpar» sobre um fato que sustenta retenção ou bloqueio exige confirmação
 * > explícita ("foi engano?"), grava evento de correção com autor e motivo "toque
 * > errado", e devolve a pergunta a "não respondida" — nunca a "Não". A retenção cai
 * > porque o fato deixou de existir. "Sim"→"Não" direto continua não liberando. Regra
 * > genérica para toda pergunta que sustente retenção."*
 *
 * ⚠️⚠️ GENÉRICA, ⛔ e ⛔ não uma lista de campos: uma resposta **sustenta** retenção ou
 * bloqueio quando limpá-la faria **sumir** algum motivo restritivo do portão da IVT.
 * ⛔ Motivo de efeito "condição resolutiva" ⛔ ou "informa" ⛔ restringe nada. ⚠️ Assim a
 * suspeita de HSA «Sim» ⛔ e a coagulação «Sim» (bloqueio até resultado) entram; a
 * coagulação «Não» ⛔ entra — limpá-la só aumenta a cautela.
 *
 * ⛔ O autor do evento ⛔ é carimbado aqui: a persistência carimba todo evento (AC-40).
 */
import { corrigirNaInstancia } from "../conteudo/campos";
import { corrigirFato, type EstadoAvc } from "./estado";
import { estadoDoPortaoIVT } from "./portao-ivt";
import type { Relogio } from "./relogio";

export const MOTIVO_TOQUE_ERRADO = "toque errado";

const NAO_RESTRITIVOS: ReadonlySet<string> = new Set(["condicao_resolutiva", "informa"]);

function motivosRestritivos(estado: EstadoAvc, agoraMs: number): ReadonlySet<string> {
  return new Set(
    estadoDoPortaoIVT(estado, agoraMs)
      .motivos.filter((m) => m.efeito === undefined || !NAO_RESTRITIVOS.has(m.efeito))
      .map((m) => `${m.id}|${m.efeito ?? m.camada}`)
  );
}

/**
 * ⚠️ Corrige TODAS as respostas vigentes do campo (⛔ só a última): com «Sim» seguido de
 * «Não», corrigir ⛔ só o «Não» deixaria o «Sim» sustentando a retenção para sempre.
 * ⚠️ Cada correção aponta o fato corrigido ⛔ e leva o motivo "toque errado".
 */
export function limparComCorrecaoAuditada(estado: EstadoAvc, campo: string, relogio: Relogio): EstadoAvc {
  const corrigidos = new Set(estado.fatos.map((f) => f.corrigeFatoId).filter((id): id is string => id !== undefined));
  const vigentes = estado.fatos.filter(
    (f) => f.campo === campo && f.instancia === undefined && String(f.valor) !== "nao_perguntado" && !corrigidos.has(f.id)
  );
  if (vigentes.length === 0) {
    return corrigirNaInstancia(estado, { campo, valor: "nao_perguntado", motivo: MOTIVO_TOQUE_ERRADO }, relogio);
  }
  return vigentes.reduce(
    (e, f) => corrigirFato(e, { campo, valor: "nao_perguntado", motivo: MOTIVO_TOQUE_ERRADO, corrigeFatoId: f.id }, relogio),
    estado
  );
}

/** ⚠️ `true` quando limpar a resposta faria sumir um motivo restritivo do portão. */
export function campoSustentaRetencaoOuBloqueio(estado: EstadoAvc, campo: string, relogio: Relogio): boolean {
  const agora = relogio.agora();
  const antes = motivosRestritivos(estado, agora);
  if (antes.size === 0) return false;
  const depois = motivosRestritivos(limparComCorrecaoAuditada(estado, campo, relogio), agora);
  for (const k of antes) if (!depois.has(k)) return true;
  return false;
}
