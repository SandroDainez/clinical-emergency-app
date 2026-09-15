/**
 * CORREÇÃO EXPLÍCITA DO REGISTRO DE UMA AÇÃO — AC-13 reaberto, item 2 (autor, 2026-09-14; `docs/decisoes.md`,
 * seção "AC-13 reaberto", §2 e §9).
 *
 * ⚠️ «Limpar» ⛔ remove exposição passada. Para retirar a consequência de um registro, o gesto é este: uma correção
 * COM o motivo «registrado por engano», apontando para o registro que a originou. Só esse registro perde a validade;
 * ele continua na trilha, marcado. ⛔ Nada é apagado.
 */
import type { EstadoAvc } from "./estado";
import { corrigirFato } from "./estado";
import type { Relogio } from "./relogio";
import { MOTIVO_ENGANO } from "./deterioracao";
import { idsInvalidadosPorCorrecao } from "./transicoes-da-acao";
import { informacaoDoEstadoDaAcao } from "../conteudo/superficie-e";

/**
 * ⚠️ Nesta rodada, só a situação da trombólise aceita a correção por engano. A ação corretiva (Correções) fica de
 * fora: «Ações corretivas: nenhuma mudança nesta rodada» (autor, AC-13 reaberto, §9).
 */
const CAMPOS_DE_SITUACAO: ReadonlySet<string> = new Set(["ivt_estado"]);

export function corrigirRegistroDaAcaoPorEngano(estado: EstadoAvc, fatoId: string, relogio: Relogio): EstadoAvc {
  const alvo = estado.fatos.find((f) => f.id === fatoId);
  if (alvo === undefined || alvo.instancia === undefined || !CAMPOS_DE_SITUACAO.has(alvo.campo)) return estado;
  /** ⚠️ Só um registro com informação se corrige por engano: ⛔ uma limpeza ⛔ nem outra correção. */
  if (alvo.tipo === "correcao" || informacaoDoEstadoDaAcao(alvo.valor).tipo === "nao_perguntado") return estado;
  const doCampo = estado.fatos.filter((f) => f.instancia === alvo.instancia && f.campo === alvo.campo);
  /** ⚠️ Idempotente: o mesmo registro ⛔ recebe segunda correção. */
  if (idsInvalidadosPorCorrecao(doCampo).has(fatoId)) return estado;
  return corrigirFato(
    estado,
    { campo: alvo.campo, valor: "nao_perguntado", instancia: alvo.instancia, corrigeFatoId: fatoId, motivo: MOTIVO_ENGANO },
    relogio
  );
}
