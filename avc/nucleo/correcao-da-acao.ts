/**
 * CORREÇÃO EXPLÍCITA DO REGISTRO DE UMA AÇÃO — AC-13 reaberto, itens 2 e 5 (autor, 2026-09-14; `docs/decisoes.md`,
 * seção "AC-13 reaberto", §2, §5 e §9).
 *
 * ⚠️ Item 2 · «Limpar» ⛔ remove exposição passada. Para retirar a consequência de um registro, o gesto é uma
 * correção COM o motivo «registrado por engano», apontando para o registro que a originou. Só esse registro perde a
 * validade; ele continua na trilha, marcado. ⛔ Nada é apagado.
 *
 * ⚠️ Item 5 · a situação que contraria a ordem causal decidida é permitida, depois de confirmação, e entra como
 * correção explícita do registro com que conflita, SEM motivo: ⛔ ninguém perguntou por quê, ⛔ e a correção sem
 * motivo ⛔ invalida o que já foi registrado.
 */
import type { EstadoAvc } from "./estado";
import { corrigirFato } from "./estado";
import type { Relogio } from "./relogio";
import { MOTIVO_ENGANO } from "./deterioracao";
import { fatosDaInstancia } from "./instancia";
import { violacaoDaOrdemCausal, type RegistroValido, type ViolacaoDaOrdem } from "./ordem-da-acao";
import { CAMPOS_DE_SITUACAO_DA_RODADA, idsInvalidadosPorCorrecao } from "./transicoes-da-acao";
import { registrarComInstancia } from "../conteudo/campos";
import { informacaoDoEstadoDaAcao } from "../conteudo/superficie-e";

/** ⚠️ Nesta rodada, só a situação da trombólise: a lista mora num lugar só, `CAMPOS_DE_SITUACAO_DA_RODADA` (§9). */
const CAMPOS_DE_SITUACAO = CAMPOS_DE_SITUACAO_DA_RODADA;

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

/** ⚠️ Os registros com estado, na ordem, ⛔ invalidados por correção. O registro limpo continua: limpar ⛔ apaga o que houve. */
export function registrosValidosDaSituacao(estado: EstadoAvc, instancia: string, campo: string): readonly RegistroValido[] {
  const doCampo = fatosDaInstancia(estado, instancia).filter((f) => f.campo === campo);
  const invalidados = idsInvalidadosPorCorrecao(doCampo);
  return doCampo.flatMap((f) => {
    const info = informacaoDoEstadoDaAcao(f.valor);
    return info.tipo === "registrado" && !invalidados.has(f.id) ? [{ fatoId: f.id, estado: info.estado }] : [];
  });
}

/** ⚠️ `undefined` quando o registro segue a ordem, ⛔ quando o campo ⛔ é de situação de ação. ⛔ Grava nada. */
export function violacaoAoRegistrar(estado: EstadoAvc, instancia: string, campo: string, valor: string): ViolacaoDaOrdem | undefined {
  if (!CAMPOS_DE_SITUACAO.has(campo)) return undefined;
  const info = informacaoDoEstadoDaAcao(valor);
  if (info.tipo !== "registrado") return undefined;
  return violacaoDaOrdemCausal(registrosValidosDaSituacao(estado, instancia, campo), info.estado);
}

/**
 * ⚠️ O gravador depois da confirmação. Com registro anterior em conflito, grava correção explícita dele; sem registro
 * anterior (ex.: «Interrompida» numa instância vazia), ⛔ há o que corrigir e grava registro comum, que a trilha marca
 * fora da ordem. Sem violação, grava registro comum.
 */
export function registrarForaDaOrdemComoCorrecao(
  estado: EstadoAvc,
  instancia: string,
  campo: string,
  valor: string,
  relogio: Relogio
): EstadoAvc {
  const v = violacaoAoRegistrar(estado, instancia, campo, valor);
  if (v === undefined || v.referencia === undefined) return registrarComInstancia(estado, { campo, valor }, relogio, instancia);
  return corrigirFato(estado, { campo, valor, instancia, corrigeFatoId: v.referencia.fatoId }, relogio);
}
