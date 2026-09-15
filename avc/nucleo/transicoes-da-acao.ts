/**
 * TRILHA DAS TRANSIÇÕES DE UMA AÇÃO — AC-13 (autor, 2026-09-14; `docs/decisoes.md`, 19ª rodada §8, e seção
 * "AC-13 reaberto", §2, §5 e §9).
 *
 * ⚠️ Leitura de AUDITORIA, não derivação clínica: diz o que foi registrado, em que ordem, quando e por qual fato (a
 * autoria vem do fato, AC-40). Nenhum estado antigo some quando um novo é registrado.
 *
 * ⚠️ Desfazer e corrigir são linhas próprias da trilha (AC-13 reaberto, item 2):
 *  · «Limpar» é correção SEM motivo: vira linha `limpeza`. O registro limpo não perde a validade.
 *  · A correção explícita COM motivo vira linha `correcao_por_engano` e invalida só o registro que ela aponta.
 * ⚠️ A situação vigente vem do valor atual reconstruído da instância, e não da última linha listada: depois de uma
 * limpeza ou de uma correção por engano, nenhuma linha é vigente.
 * ⚠️ Item 5: o registro que contraria a ordem causal decidida fica marcado `foraDaOrdemCausal`, comparado com os
 * registros válidos anteriores a ele; `registradaComoCorrecao` diz que entrou como correção explícita.
 *
 * Mora fora de `derivacoes-e.ts` de propósito: a leitura de E não pode usar a ordem nem o horário de registro para
 * inferir resposta (prova da Superfície E, §6). Aqui o horário só é MOSTRADO — nada é concluído dele.
 */
import type { EstadoAvc } from "./estado";
import type { FatoRegistrado } from "./tipos";
import { fatosDaInstancia, valorNaInstancia } from "./instancia";
import { violacaoDaOrdemCausal, type RegistroValido } from "./ordem-da-acao";
import {
  ROTULO_DO_ESTADO_DA_ACAO,
  informacaoDoEstadoDaAcao,
  type EstadoDaAcaoRegistrado,
} from "../conteudo/superficie-e";

/** ⚠️ Correção com motivo invalida o fato corrigido; correção sem motivo (o «Limpar») não invalida. */
export function ehCorrecaoComMotivo(f: FatoRegistrado): boolean {
  return f.tipo === "correcao" && f.corrigeFatoId !== undefined && typeof f.motivo === "string" && f.motivo.trim().length > 0;
}

/** ⚠️ Os ids dos fatos invalidados por correção explícita, entre os fatos dados. */
export function idsInvalidadosPorCorrecao(fatos: readonly FatoRegistrado[]): ReadonlySet<string> {
  return new Set(fatos.filter(ehCorrecaoComMotivo).map((f) => f.corrigeFatoId as string));
}

/**
 * ⚠️ Os campos de situação que recebem, nesta rodada, os gestos novos do AC-13 reaberto: correção por engano (item 2),
 * ordem causal (item 5) e idempotência (item 6). A ação corretiva (Correções) fica de fora: «Ações corretivas: nenhuma
 * mudança nesta rodada» (autor, §9).
 */
export const CAMPOS_DE_SITUACAO_DA_RODADA: ReadonlySet<string> = new Set(["ivt_estado"]);

/**
 * ⚠️ AC-13 reaberto, item 6: a mesma transição idêntica, na mesma instância, sem mudança de contexto, é ignorada também
 * no núcleo. Idêntica = mesmo valor e mesmo horário clínico do último fato do campo na instância, sendo esse último
 * fato um registro. Marcar, limpar ou corrigir, e marcar de novo, não é duplicação: o último fato é a correção.
 */
export function repeteATransicaoAnterior(
  estado: EstadoAvc,
  instancia: string,
  fato: Pick<FatoRegistrado, "campo" | "valor" | "horaClinica">
): boolean {
  if (!CAMPOS_DE_SITUACAO_DA_RODADA.has(fato.campo)) return false;
  const anterior = valorNaInstancia(estado, instancia, fato.campo);
  if (anterior === undefined || anterior.tipo === "correcao") return false;
  return anterior.valor === fato.valor && anterior.horaClinica === fato.horaClinica;
}

export type TipoDaLinhaDaTrilha = "registro" | "limpeza" | "correcao_por_engano";

/** ⚠️ Uma linha da trilha da situação de uma ação. */
export type TransicaoDaAcao = {
  readonly fatoId: string;
  readonly tipo: TipoDaLinhaDaTrilha;
  /** ⚠️ «não sei» é informação ausente, não estado: `estado` fica `undefined`. Limpeza e correção não trazem informação. */
  readonly informacao: "registrado" | "nao_sei" | "nenhuma";
  readonly estado?: EstadoDaAcaoRegistrado;
  readonly rotuloGravado: string;
  /** ⚠️ Gravado com rótulo antigo (ex.: «Realizada») — lido com o significado preservado. */
  readonly legado: boolean;
  /** ⚠️ Horário do registro; o clínico, quando informado. ⛔ Só exibição. */
  readonly horaRegistro: number;
  readonly horaClinica?: number;
  /** ⚠️ Limpeza e correção apontam para o fato que corrigem. */
  readonly corrigeFatoId?: string;
  readonly motivo?: string;
  /** ⚠️ O registro recebeu correção explícita com motivo: continua na trilha, mas não vale. */
  readonly invalidadaPorCorrecao: boolean;
  /** ⚠️ Item 5: o estado contraria a ordem causal decidida, diante dos registros válidos anteriores. */
  readonly foraDaOrdemCausal: boolean;
  /** ⚠️ Item 5: o estado entrou como correção explícita de um registro anterior. */
  readonly registradaComoCorrecao: boolean;
  readonly vigente: boolean;
};

export function transicoesDoEstadoDaAcao(estado: EstadoAvc, instancia: string, campo: string): readonly TransicaoDaAcao[] {
  const fatos = fatosDaInstancia(estado, instancia).filter((f) => f.campo === campo);
  const invalidados = idsInvalidadosPorCorrecao(fatos);
  const atual = valorNaInstancia(estado, instancia, campo);
  const validosAntes: RegistroValido[] = [];
  return fatos.map((f) => {
    const info = informacaoDoEstadoDaAcao(f.valor);
    const registrado = info.tipo === "registrado" ? info.estado : undefined;
    const tipo: TipoDaLinhaDaTrilha =
      info.tipo !== "nao_perguntado" ? "registro" : ehCorrecaoComMotivo(f) ? "correcao_por_engano" : "limpeza";
    const valido = registrado !== undefined && !invalidados.has(f.id);
    const foraDaOrdemCausal = valido && violacaoDaOrdemCausal(validosAntes, registrado) !== undefined;
    if (valido) {
      /** ⚠️ §10: o registro gravado como correção explícita de outro reabre o registro corrigido. */
      if (f.tipo === "correcao" && f.corrigeFatoId !== undefined) {
        const i = validosAntes.findIndex((r) => r.fatoId === f.corrigeFatoId);
        if (i !== -1) validosAntes[i] = { ...validosAntes[i], reaberto: true };
      }
      validosAntes.push({ fatoId: f.id, estado: registrado });
    }
    return {
      fatoId: f.id,
      tipo,
      informacao: info.tipo === "registrado" ? "registrado" : info.tipo === "nao_sei" ? "nao_sei" : "nenhuma",
      estado: registrado,
      rotuloGravado: String(f.valor),
      legado: registrado !== undefined && String(f.valor) !== ROTULO_DO_ESTADO_DA_ACAO[registrado],
      horaRegistro: f.horaRegistro,
      horaClinica: typeof f.horaClinica === "number" ? f.horaClinica : undefined,
      corrigeFatoId: f.corrigeFatoId,
      motivo: typeof f.motivo === "string" && f.motivo.length > 0 ? f.motivo : undefined,
      invalidadaPorCorrecao: invalidados.has(f.id),
      foraDaOrdemCausal,
      registradaComoCorrecao: tipo === "registro" && f.tipo === "correcao",
      vigente: tipo === "registro" && atual !== undefined && atual.id === f.id,
    };
  });
}
