/**
 * «PACIENTE PIOROU» — AÇÃO GLOBAL (ajuste de rota do autor, 2026-09-13; AC-10, A11).
 *
 * ⚠️ Um toque, de qualquer tela do AVC, grava UM evento de deterioração (autor
 * carimbado pela persistência — AC-40 —, horário, texto livre opcional), reabre a
 * avaliação de ameaças da Estabilização ⛔ e cria a tarefa «reavaliar agora».
 *
 * ⛔ SEM LIMIAR, ⛔ SEM CONDUTA: o evento ⛔ não é lido por nenhuma derivação clínica —
 * portão, veredito, dose ⛔ e ameaças continuam derivados só dos fatos medidos. ⚠️ O
 * que ele muda é **onde o médico olha agora**.
 *
 * ⚠️ HISTÓRICO PRESERVADO: ⛔ nada da trilha é corrigido ⛔ nem apagado. ⛔ Reabrir é
 * tirar os eixos de `eixosConcluidos` (o mesmo gesto de «Reabrir avaliação»), ⛔ e a
 * persistência registra cada `eixo_reaberto`.
 *
 * ⚠️ A11 — ⛔ SEM ESPERAR TAREFA AGENDADA: a tarefa existe no mesmo instante do
 * evento ⛔ e fica em primeiro na lista de problemas (`problemas-ativos.ts`). Ela se
 * resolve quando os cinco eixos voltam a ser concluídos.
 *
 * ⚠️ A espera da transferência usa este mesmo mecanismo (`transferencia.ts` só lê).
 */
import type { EstadoAvc } from "./estado";
import { registrarFato } from "./estado";
import type { Relogio } from "./relogio";
import type { Pendencia } from "./tipos";
import { ameacasImediatas } from "./ameacas-imediatas";

export const CAMPO_PACIENTE_PIOROU = "paciente_piorou";

/** ⚠️ Sem texto, o evento existe ⛔ e ⛔ não inventa descrição. */
export const SEM_DESCRICAO = "sem_descricao";

/**
 * ⚠️ Os eixos da avaliação de ameaças são os de `ameacasImediatas` — ⛔ lidos dela, ⛔ e
 * ⛔ não reescritos aqui: uma lista própria envelheceria no dia em que um eixo mudar.
 * ⛔ Os valores das ameaças ⛔ não são usados; só os ids.
 */
function eixosDaReavaliacao(estado: EstadoAvc): readonly string[] {
  return ameacasImediatas(estado).map((a) => a.id);
}

/**
 * ⚠️ O campo que a tarefa aponta: o primeiro da via aérea. ⛔ Ele ⛔ não é
 * aferição com instância — tocar a tarefa ⛔ não abre medida nova.
 */
const CAMPO_DA_TAREFA = "consciencia_rebaixada";

export type EventoDePiora = {
  readonly fatoId: string;
  readonly quando: number;
  readonly descricao?: string;
};

export function registrarPiora(estado: EstadoAvc, texto: string, relogio: Relogio): EstadoAvc {
  const descricao = texto.trim();
  const agora = relogio.agora();
  const comEvento = registrarFato(
    estado,
    { campo: CAMPO_PACIENTE_PIOROU, valor: descricao === "" ? SEM_DESCRICAO : descricao, horaClinica: agora },
    relogio
  );
  const eixos = eixosDaReavaliacao(comEvento);
  return { ...comEvento, eixosConcluidos: comEvento.eixosConcluidos.filter((x) => !eixos.includes(x)) };
}

export function eventosDePiora(estado: EstadoAvc): readonly EventoDePiora[] {
  return estado.fatos
    .filter((f) => f.campo === CAMPO_PACIENTE_PIOROU)
    .map((f) => ({
      fatoId: f.id,
      quando: f.horaClinica ?? f.horaRegistro,
      descricao: f.valor === SEM_DESCRICAO ? undefined : String(f.valor),
    }));
}

export function reavaliacaoPendente(estado: EstadoAvc): Pendencia | undefined {
  if (eventosDePiora(estado).length === 0) return undefined;
  const faltam = eixosDaReavaliacao(estado).filter((x) => !estado.eixosConcluidos.includes(x));
  if (faltam.length === 0) return undefined;
  return {
    id: "reavaliar_apos_piora",
    rotulo: "Paciente piorou: reavaliar agora",
    dono: "estabilizacao",
    campo: CAMPO_DA_TAREFA,
    resolvePor: "Concluir de novo a avaliação de cada eixo da Estabilização",
  };
}
