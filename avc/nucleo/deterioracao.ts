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
 * persistência registra cada `eixo_reaberto`. Os eixos que estavam concluídos ficam
 * gravados num fato ao lado do evento, para a correção por engano poder devolvê-los.
 *
 * ⚠️ A11 — ⛔ SEM ESPERAR TAREFA AGENDADA: a tarefa existe no mesmo instante do
 * evento ⛔ e fica em primeiro na lista de problemas (`problemas-ativos.ts`). Ela se
 * resolve quando os cinco eixos voltam a ser concluídos.
 *
 * ⚠️ AC-67 — PIORA REGISTRADA POR ENGANO (autor, 2026-09-13, 11ª rodada): o evento ⛔
 * some; ganha correção com motivo "registrado por engano". ⚠️ Se nenhum eixo foi
 * reavaliado entre o evento ⛔ e a correção, a tarefa cai ⛔ e os eixos concluídos antes
 * voltam. ⚠️ Se a reavaliação já começou, ela fica — ⛔ e a tarefa também, até terminar.
 *
 * ⚠️ A espera da transferência usa este mesmo mecanismo (`transferencia.ts` só lê).
 */
import type { EstadoAvc } from "./estado";
import { corrigirFato, registrarFato } from "./estado";
import type { Relogio } from "./relogio";
import type { Pendencia } from "./tipos";
import { ameacasImediatas } from "./ameacas-imediatas";
import { TODOS_OS_CAMPOS_A } from "../conteudo/superficie-a";

export const CAMPO_PACIENTE_PIOROU = "paciente_piorou";

/** ⚠️ Sem texto, o evento existe ⛔ e ⛔ não inventa descrição. */
export const SEM_DESCRICAO = "sem_descricao";

/** ⚠️ Os eixos que estavam concluídos no instante da piora (para a correção por engano). */
const CAMPO_EIXOS_REABERTOS = "paciente_piorou_eixos_reabertos";
/** ⚠️ Marca, na correção por engano, que a reavaliação já tinha começado ⛔ e fica. */
const CAMPO_REAVALIACAO_MANTIDA = "paciente_piorou_reavaliacao_mantida";
export const MOTIVO_ENGANO = "registrado por engano";

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
  /** ⚠️ Corrigido com motivo "registrado por engano" — ⛔ continua na trilha. */
  readonly engano: boolean;
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
  const reabertos = comEvento.eixosConcluidos.filter((x) => eixos.includes(x));
  const comReabertos = reabertos.length === 0
    ? comEvento
    : registrarFato(comEvento, { campo: CAMPO_EIXOS_REABERTOS, valor: reabertos.join(",") }, relogio);
  return { ...comReabertos, eixosConcluidos: comReabertos.eixosConcluidos.filter((x) => !eixos.includes(x)) };
}

export function eventosDePiora(estado: EstadoAvc): readonly EventoDePiora[] {
  const enganos = new Set(
    estado.fatos.filter((f) => f.campo === CAMPO_PACIENTE_PIOROU && f.corrigeFatoId !== undefined).map((f) => f.corrigeFatoId)
  );
  return estado.fatos
    .filter((f) => f.campo === CAMPO_PACIENTE_PIOROU && f.corrigeFatoId === undefined)
    .map((f) => ({
      fatoId: f.id,
      quando: f.horaClinica ?? f.horaRegistro,
      descricao: f.valor === SEM_DESCRICAO ? undefined : String(f.valor),
      engano: enganos.has(f.id),
    }));
}

/**
 * ⚠️ AC-67. ⚠️ "Reavaliado depois" = algum fato da Estabilização registrado depois do
 * evento, ⛔ ou algum eixo concluído de novo (a piora reabriu todos).
 */
export function corrigirPioraPorEngano(estado: EstadoAvc, fatoId: string, relogio: Relogio): EstadoAvc {
  const indice = estado.fatos.findIndex((f) => f.id === fatoId && f.campo === CAMPO_PACIENTE_PIOROU);
  if (indice === -1 || eventosDePiora(estado).some((ev) => ev.fatoId === fatoId && ev.engano)) return estado;
  const camposA = new Set(TODOS_OS_CAMPOS_A.map((c) => c.id));
  const eixos = eixosDaReavaliacao(estado);
  const reavaliou =
    estado.fatos.slice(indice + 1).some((f) => camposA.has(f.campo))
    || estado.eixosConcluidos.some((x) => eixos.includes(x));
  const corrigido = corrigirFato(
    estado,
    { campo: CAMPO_PACIENTE_PIOROU, valor: "nao_perguntado", corrigeFatoId: fatoId, motivo: MOTIVO_ENGANO },
    relogio
  );
  if (reavaliou) {
    /**
     * ⚠️ AC-73: com a reavaliação COMPLETA, ⛔ há o que manter pendente — ⛔ grava a marca
     * (senão reabrir um eixo à mão ressuscitaria a tarefa de uma piora corrigida).
     */
    const incompleta = eixos.some((x) => !estado.eixosConcluidos.includes(x));
    return incompleta ? registrarFato(corrigido, { campo: CAMPO_REAVALIACAO_MANTIDA, valor: fatoId }, relogio) : corrigido;
  }
  const vizinho = estado.fatos[indice + 1];
  const reabertos = vizinho !== undefined && vizinho.campo === CAMPO_EIXOS_REABERTOS ? String(vizinho.valor).split(",") : [];
  return {
    ...corrigido,
    eixosConcluidos: [...corrigido.eixosConcluidos, ...reabertos.filter((x) => !corrigido.eixosConcluidos.includes(x))],
  };
}

export function reavaliacaoPendente(estado: EstadoAvc): Pendencia | undefined {
  const eventos = eventosDePiora(estado);
  if (eventos.length === 0) return undefined;
  const ultimo = eventos[eventos.length - 1];
  const mantida = estado.fatos.some((f) => f.campo === CAMPO_REAVALIACAO_MANTIDA && f.valor === ultimo.fatoId);
  if (ultimo.engano && !mantida) return undefined;
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
