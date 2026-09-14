/**
 * TRILHA DAS TRANSIÇÕES DE UMA AÇÃO — AC-13 (autor, 2026-09-14; `docs/decisoes.md`, 19ª rodada §8).
 *
 * ⚠️ Leitura de AUDITORIA, ⛔ derivação clínica: diz o que foi registrado, em que ordem, quando ⛔ por qual fato (a
 * autoria vem do fato, AC-40). ⛔ Nenhum estado antigo some quando um novo é registrado.
 *
 * ⛔ Mora fora de `derivacoes-e.ts` de propósito: a leitura de E ⛔ pode usar a ordem ⛔ o horário de registro para
 * inferir resposta (prova da Superfície E, §6). Aqui o horário só é MOSTRADO — ⛔ nada é concluído dele.
 */
import type { EstadoAvc } from "./estado";
import { fatosDaInstancia } from "./instancia";
import {
  ROTULO_DO_ESTADO_DA_ACAO,
  informacaoDoEstadoDaAcao,
  type EstadoDaAcaoRegistrado,
} from "../conteudo/superficie-e";

/** ⚠️ Uma transição registrada da situação de uma ação. */
export type TransicaoDaAcao = {
  readonly fatoId: string;
  /** ⚠️ «não sei» é informação ausente, ⛔ estado: `estado` fica `undefined`. */
  readonly informacao: "registrado" | "nao_sei";
  readonly estado?: EstadoDaAcaoRegistrado;
  readonly rotuloGravado: string;
  /** ⚠️ Gravado com rótulo antigo (ex.: «Realizada») — lido com o significado preservado. */
  readonly legado: boolean;
  /** ⚠️ Horário do registro; o clínico, quando informado. ⛔ Só exibição. */
  readonly horaRegistro: number;
  readonly horaClinica?: number;
  readonly vigente: boolean;
};

export function transicoesDoEstadoDaAcao(estado: EstadoAvc, instancia: string, campo: string): readonly TransicaoDaAcao[] {
  const fatos = fatosDaInstancia(estado, instancia)
    .filter((f) => f.campo === campo && informacaoDoEstadoDaAcao(f.valor).tipo !== "nao_perguntado");
  return fatos.map((f, i) => {
    const informacao = informacaoDoEstadoDaAcao(f.valor);
    const registrado = informacao.tipo === "registrado" ? informacao.estado : undefined;
    return {
      fatoId: f.id,
      informacao: registrado === undefined ? "nao_sei" : "registrado",
      estado: registrado,
      rotuloGravado: String(f.valor),
      legado: registrado !== undefined && String(f.valor) !== ROTULO_DO_ESTADO_DA_ACAO[registrado],
      horaRegistro: f.horaRegistro,
      horaClinica: typeof f.horaClinica === "number" ? f.horaClinica : undefined,
      vigente: i === fatos.length - 1,
    };
  });
}
