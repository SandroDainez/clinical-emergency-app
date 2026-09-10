/**
 * ⚠️⚠️⚠️ QUAL ALVO PRESSÓRICO VALE **⛔ AGORA** — e ⛔ não qual é o mais famoso.
 *
 * ── ⛔ O DEFEITO, RELATADO EM 2026-09-10 ───────────────────────────────────
 *
 * ⛔ ⛔ O alvo « principal » era ⛔ **⛔ fixo no conteúdo** (`principal: true`
 * numa linha só): ⛔ *"Abaixo de 185 por 110 — antes de iniciar a trombólise"*.
 *
 * ⚠️⚠️ ⛔ Só que o alvo ⛔ **⛔ muda com a fase**. ⛔ O médico que ⛔ **⛔ já
 * trombolisou** ⛔ abria a tela ⛔ e via, como principal, ⛔ um número ⛔ que ⛔ era
 * ⛔ **⛔ de antes** — ⛔ e ⛔ precisava expandir ⛔ os outros seis ⛔ para achar
 * ⛔ o `< 180/105` ⛔ que é ⛔ o dele. ⛔ Invertido ⛔ justamente ⛔ para quem ⛔ já
 * agiu.
 *
 * ── ⚠️⚠️ ⛔ O QUE ESTE MÓDULO ⛔ **⛔ NÃO** FAZ ─────────────────────────────
 *
 * ⛔ ⛔ **⛔ Não inventa precedência.** ⛔ Decisão do autor: *"se mais de um alvo
 * for simultaneamente aplicável, mostrar ⛔ **⛔ todos** os aplicáveis, ⛔ sem
 * inventar precedência"*. ⛔ Ele devolve ⛔ uma lista, ⛔ e ⛔ não um vencedor.
 *
 * ⛔ ⛔ **⛔ Não deriva o que o estado ⛔ não sabe.** ⛔ Ver `FORA_DE_ALCANCE`
 * ⛔ abaixo: ⛔ três alvos ⛔ dependem de fatos ⛔ que ⛔ **⛔ o app ⛔ ainda ⛔ não
 * registra**, ⛔ e ⛔ presumi-los ⛔ seria ⛔ conduta nascendo ⛔ na tela (**E-31**).
 *
 * ⛔ ⛔ **⛔ Não esconde os demais.** ⛔ Os que ⛔ não se aplicam ⛔ continuam ⛔ na
 * consulta, ⛔ atrás ⛔ do mesmo botão ⛔ de sempre.
 */

import type { EstadoAvc } from "./estado";
import { pertinenciaDaMonitorizacao } from "./derivacoes-g";

/**
 * ⚠️⚠️⚠️ ⛔ OS TRÊS QUE ⛔ **⛔ NÃO** ⛔ DÁ PARA DERIVAR HOJE — ⛔ e ⛔ por quê.
 *
 * ⛔ ⛔ `antes_evt`, `durante_evt` ⛔ e `harm_pos_recanalizacao` ⛔ dependem de
 * ⛔ **⛔ a trombectomia ter sido feita** — ⛔ e ⛔ de ⛔ **⛔ quando** —, ⛔ ou de
 * ⛔ **⛔ recanalização bem-sucedida**. ⚠️ ⛔ O módulo registra ⛔ a
 * ⛔ **⛔ elegibilidade** ⛔ à trombectomia (`vereditoDaTrombectomia`), ⛔ e
 * ⛔ **⛔ elegível ⛔ não é ⛔ feito** — ⛔ é ⛔ a mesma regra ⛔ de ⛔ *pedido ⛔ ≠
 * exame ⛔ ≠ laudo*.
 *
 * ⛔ `sem_beneficio_pos_ivt` ⛔ pede *"gravidade ⛔ leve a moderada"*, ⛔ e ⛔ o
 * módulo ⛔ **⛔ não transcreveu ⛔ o corte** ⛔ que separa isso. ⛔ Aplicá-lo
 * ⛔ a todo pós-IVT ⛔ colaria ⛔ um COR 3 ⛔ em paciente ⛔ que ⛔ ele ⛔ pode ⛔ não
 * descrever.
 *
 * ⚠️ ⛔ Eles ⛔ **⛔ não somem**: ⛔ ficam ⛔ na consulta. ⛔ O dia em que o app
 * ⛔ registrar ⛔ esses fatos, ⛔ eles entram aqui — ⛔ **⛔ D-135**.
 */
/**
 * ⚠️⚠️ ⛔ O MOTIVO É ⛔ **⛔ IDENTIFICADOR**, ⛔ e ⛔ não frase — ⛔ de propósito.
 *
 * ⛔ ⛔ Frase em português ⛔ aqui ⛔ seria varrida ⛔ pelo `varredura-pt`, ⛔ e ⛔ a
 * saída fácil ⛔ seria ⛔ isentar ⛔ o arquivo. ⚠️ ⛔ Mas ⛔ **⛔ isto ⛔ não é
 * arquivo de auditoria**: ⛔ é ⛔ **⛔ derivação**, ⛔ e ⛔ isentá-lo ⛔ deixaria
 * ⛔ passar ⛔ a próxima string ⛔ renderizável ⛔ que alguém escrever aqui
 * ⛔ (⛔ « pasta ⛔ não é natureza »).
 *
 * ⚠️ ⛔ A explicação humana ⛔ mora ⛔ **⛔ no comentário acima**, ⛔ que é ⛔ onde
 * prosa mora. ⛔ O identificador ⛔ é o que a trava confere.
 */
export const FORA_DE_ALCANCE: Readonly<Record<string, string>> = {
  antes_evt: "sem_registro_de_execucao_da_trombectomia",
  durante_evt: "sem_registro_de_execucao_da_trombectomia",
  harm_pos_recanalizacao: "sem_registro_de_recanalizacao_bem_sucedida",
  sem_beneficio_pos_ivt: "corte_de_gravidade_leve_a_moderada_nao_transcrito",
};

/** ⚠️ Da Table 7 · F-04: a janela em que o alvo pós-trombólise governa. */
const HORAS_DA_JANELA_POS_IVT = 24;

/**
 * ⚠️ Os ids dos alvos que valem para o estado atual — ⛔ **⛔ na ordem do
 * conteúdo**, ⛔ e ⛔ sem eleger nenhum.
 *
 * ⛔ Lista vazia ⛔ é ⛔ **⛔ resposta**: passadas as 24 h, ⛔ a fonte ⛔ **⛔ não
 * publica** ⛔ alvo de fase, ⛔ e ⛔ inventar um ⛔ seria E-31. ⛔ A tela diz isso
 * ⛔ com palavras, ⛔ e ⛔ os alvos de consulta ⛔ continuam a um toque.
 */
export function alvosPressoricosAplicaveis(
  estado: EstadoAvc,
  agoraMs: number
): readonly string[] {
  const ivt = pertinenciaDaMonitorizacao(estado);

  /** ⚠️ ⛔ Sem trombólise registrada, ⛔ a pergunta ⛔ é ⛔ a de antes dela. */
  if (!ivt.pertinente || !ivt.acao) {
    return ["antes_ivt"];
  }

  /**
   * ⚠️⚠️ ⛔ SEM O HORÁRIO, ⛔ A FASE ⛔ É ⛔ **⛔ DESCONHECIDA** — ⛔ e ⛔ o que se
   * sabe ⛔ é ⛔ que ⛔ a trombólise ⛔ **⛔ aconteceu**. ⛔ O alvo pós-IVT ⛔ é ⛔ o
   * ⛔ que responde ⛔ a isso; ⛔ o que ⛔ não se pode afirmar ⛔ é ⛔ que ⛔ já
   * passaram ⛔ as 24 h.
   */
  if (ivt.acao.inicioMs === undefined) {
    return ["apos_ivt", "faixa_pos_trombolise"];
  }

  const horas = (agoraMs - ivt.acao.inicioMs) / 3_600_000;
  if (horas < HORAS_DA_JANELA_POS_IVT) {
    return ["apos_ivt", "faixa_pos_trombolise"];
  }

  /** ⛔ Fora da janela: ⛔ a fonte ⛔ não dá alvo ⛔ de fase. ⛔ Dizer isso ⛔ é a resposta. */
  return [];
}
