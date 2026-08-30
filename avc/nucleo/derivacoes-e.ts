/**
 * DERIVAÇÕES DA SUPERFÍCIE E — Correções. Recalculadas a cada leitura (§4.3).
 *
 * ── ⚠️⚠️ AS QUATRO COISAS QUE E ⛔ NÃO PODE CONCLUIR ──────────────────────────
 *
 *   ⛔ que a pressão está na meta;
 *   ⛔ que a glicemia foi corrigida;
 *   ⛔ que o bloqueio caiu;
 *   ⛔ ⛔ nada sobre reperfusão.
 *
 * ⚠️⚠️ **O BLOQUEIO CAI EM D, LENDO A** — ⛔ nunca aqui. E registra ação; a resposta
 * é **outra aferição**. ⛔ Não existe botão "corrigido" nesta superfície, e é essa
 * ausência que mantém separadas as três coisas que o autor distinguiu:
 * correção documental, tratamento clínico e nova aferição.
 */

import type { EstadoAvc } from "./estado";
import { instanciasDe, valorNaInstancia } from "./instancia";
import type { Pendencia } from "./tipos";
import { bloqueiosCorrigiveis, type BloqueioCorrigivel } from "./derivacoes-d";
import {
  ACAO,
  ACOES_DE_CORRECAO,
  ESTADO_DA_ACAO,
  type AcaoDeCorrecao,
} from "../conteudo/superficie-e";

/** ⚠️ Uma ação registrada, como a tela e a prova a enxergam. */
export type AcaoRegistrada = {
  readonly instancia: string;
  readonly tipo?: string;
  readonly estado?: string;
  /** ⚠️ A definição por trás do rótulo — `undefined` se ninguém escolheu o tipo. */
  readonly definicao?: AcaoDeCorrecao;
};

const rotuloNa = (estado: EstadoAvc, inst: string, campo: string): string | undefined => {
  const f = valorNaInstancia(estado, inst, campo);
  if (f === undefined) return undefined;
  const v = String(f.valor);
  return v === "nao_perguntado" || v === "nao_sei" ? undefined : v;
};

/** Todas as ações registradas, na ordem de registro. */
export function acoes(estado: EstadoAvc): readonly AcaoRegistrada[] {
  return instanciasDe(estado, ACAO).map((instancia) => {
    const tipo = rotuloNa(estado, instancia, "acao_tipo");
    return {
      instancia,
      tipo,
      estado: rotuloNa(estado, instancia, "acao_estado"),
      definicao: ACOES_DE_CORRECAO.find((a) => a.rotulo === tipo),
    };
  });
}

/**
 * AS AÇÕES QUE E OFERECE AGORA — ⚠️ ⛔ **uma por bloqueio aberto**, e ⛔ nada mais.
 *
 * ⚠️⚠️ ⛔ **E ⛔ não decide que há bloqueio.** Ela pergunta a D, que lê A. Se D ⛔ não
 * declara bloqueio, E ⛔ não oferece ação — ⛔ nem "por precaução".
 */
export function acoesDisponiveis(estado: EstadoAvc): readonly AcaoDeCorrecao[] {
  const abertos = bloqueiosCorrigiveis(estado).map((b) => b.id);
  return ACOES_DE_CORRECAO.filter((a) => abertos.includes(a.bloqueio));
}

/**
 * ⚠️⚠️ AS AÇÕES DE UM BLOQUEIO — **todas**, e ⛔ não a última.
 *
 * > *"Pode haver mais de uma intervenção terapêutica antes da nova aferição."*
 *
 * ⛔ Devolver ⛔ só a mais recente apagaria da leitura que houve duas — e a trilha
 * guarda as duas justamente porque as duas aconteceram.
 */
export function acoesDoBloqueio(estado: EstadoAvc, bloqueio: string): readonly AcaoRegistrada[] {
  return acoes(estado).filter((a) => a.definicao?.bloqueio === bloqueio);
}

/**
 * ⛔⛔ ⛔ NENHUM ESTADO DE AÇÃO RESOLVE BLOQUEIO — ⛔ **nem `realizada`**.
 *
 * ⚠️ `realizada` diz que a ação **aconteceu**; se ela funcionou, quem responde é a
 * nova aferição. E `cancelada` ⛔ **nunca** produz derivação favorável: ela fica
 * como registro da decisão, e ⛔ nada mais (trava do autor).
 *
 * ⚠️⚠️ Esta função existe para ser **medida**: ela devolve `false` sempre, por
 * construção, e a prova reprova qualquer versão que devolva `true`.
 */
export function acaoResolveBloqueio(_acao: AcaoRegistrada): boolean {
  return false;
}

export type LeituraDoBloqueio = {
  readonly bloqueio: BloqueioCorrigivel;
  readonly acoes: readonly AcaoRegistrada[];
  /** ⚠️ ⛔ SEMPRE `true` enquanto D o declarar. ⛔ Ação ⛔ nenhuma muda isto. */
  readonly aberto: true;
};

/**
 * O QUE A TELA MOSTRA — ⚠️ um bloqueio aberto, com as ações já registradas nele.
 *
 * ⛔⛔ E ⛔ **não** liga ação a aferição por ordem de registro:
 *
 * > *"Se houver múltiplas aferições e múltiplas ações, o sistema ⛔ não deve
 * > inventar causalidade temporal ⛔ só porque uma veio depois no log."*
 *
 * ⚠️ Por isso `LeituraDoBloqueio` carrega as ações **daquele bloqueio**, e ⛔ nunca
 * *"a aferição que respondeu a esta ação"*. ⛔ Esse vínculo ⛔ não existe no modelo,
 * e inventá-lo seria afirmar uma causa que ninguém declarou.
 */
export function bloqueiosComAcoes(estado: EstadoAvc): readonly LeituraDoBloqueio[] {
  return bloqueiosCorrigiveis(estado).map((b) => ({
    bloqueio: b,
    acoes: acoesDoBloqueio(estado, b.id),
    aberto: true as const,
  }));
}

/**
 * A PENDÊNCIA DE REAVALIAR O DÉFICIT — ⚠️ e ela **⛔ não é de E**.
 *
 * > *"A pendência pertence a B · Neurológico. E pode ser a origem/causa da
 * > pendência, mas ⛔ não é sua dona. O fechamento ocorre quando o déficit é
 * > reavaliado em B."*
 *
 * ⚠️ Verbatim que a sustenta — F-06, §4.6.1 *Supportive Text* 5:
 * *"clinical deficits **should be assessed after correction of glucose** to
 * evaluate thrombolytic eligibility"*.
 *
 * ⚠️⚠️ E ela nasce da **ação glicêmica registrada**, e ⛔ não do bloqueio: enquanto
 * ⛔ ninguém corrigiu, ⛔ não há "depois da correção" para reavaliar.
 *
 * ⛔ `cancelada` ⛔ não a abre — ⛔ nada foi corrigido.
 */
export function pendenciasOriginadasEmE(estado: EstadoAvc): readonly Pendencia[] {
  const glicemicas = acoesDoBloqueio(estado, "glicemia_alterada");
  const houveCorrecao = glicemicas.some(
    (a) => a.estado === ESTADO_DA_ACAO.iniciada || a.estado === ESTADO_DA_ACAO.realizada
  );
  if (!houveCorrecao) return [];
  return [
    {
      id: "reavaliar_deficit_apos_glicemia",
      rotulo: "Reavaliar déficit neurológico após correção da glicemia",
      /** ⛔⛔ DONO É **B**, e ⛔ não E — é lá que a resposta clínica é registrada. */
      dono: "neurologico",
      campo: "deficit_focal",
      resolvePor: "Registrar o exame neurológico depois da correção",
    },
  ];
}
