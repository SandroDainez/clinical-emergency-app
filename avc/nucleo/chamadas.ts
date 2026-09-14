/**
 * CONTRATO DE NAVEGAÇÃO ENTRE MÓDULOS — C05 (spec §04 e §19; autor, 2026-09-13, 13ª rodada,
 * opção A).
 *
 * ⚠️ A CHAMADA recebe `encounterId`, destino ⛔ e ponto de origem (módulo, superfície, campo,
 * rolagem). ⚠️ O RETORNO devolve o mesmo `encounterId`, a origem, os eventos REALMENTE
 * registrados na chamada, o suporte ativo, a resposta ⛔ e as pendências.
 *
 * ⚠️ A PILHA é derivada da trilha (fatos `chamada_*`): chamadas sucessivas empilham, ⛔ só o
 * topo retorna, ⛔ e fechar ⛔ reabrir o atendimento devolve a intervenção em andamento.
 *
 * ⚠️ ⛔ Voltar ⛔ conclui a ameaça: a resposta de um destino indisponível é "não medida" ⛔ e
 * a reavaliação continua pendente no AVC. ⚠️ Cancelar volta sem apagar o que foi
 * registrado — a trilha é append-only.
 */
import { registrarFato, type EstadoAvc } from "./estado";
import type { Relogio } from "./relogio";
import { leituraDaViaAereaExterna } from "./via-aerea-externa";

export type OrigemDaChamada = {
  readonly modulo: string;
  readonly superficie?: string;
  readonly campo?: string;
  readonly rolagem: number;
};

export type ChamadaAberta = {
  readonly chamadaId: string;
  readonly encounterId: string;
  readonly destino: string;
  readonly origem: OrigemDaChamada;
  readonly abertaEm: number;
};

export type RetornoDeModulo = {
  readonly chamadaId: string;
  readonly encounterId: string;
  readonly destino: string;
  readonly origem: OrigemDaChamada;
  readonly cancelado: boolean;
  readonly eventos: readonly string[];
  readonly suporteAtivo: readonly string[];
  readonly resposta: "nao_medida";
  readonly pendencias: readonly string[];
};

const CHAMADA = "chamada_modulo";
const ENCOUNTER = "chamada_encounter";
const ORIGEM = "chamada_origem";
const RETORNO = "chamada_retorno";
const META = new Set([CHAMADA, ENCOUNTER, ORIGEM, RETORNO]);

export function chamarModulo(
  estado: EstadoAvc,
  pedido: { readonly encounterId: string; readonly destino: string; readonly origem: OrigemDaChamada },
  relogio: Relogio
): EstadoAvc {
  const n = estado.fatos.filter((f) => f.campo === CHAMADA).length;
  const chamadaId = `chamada_${n + 1}`;
  let e = registrarFato(estado, { campo: CHAMADA, valor: pedido.destino, instancia: chamadaId }, relogio);
  e = registrarFato(e, { campo: ENCOUNTER, valor: pedido.encounterId, instancia: chamadaId }, relogio);
  return registrarFato(e, { campo: ORIGEM, valor: JSON.stringify(pedido.origem), instancia: chamadaId }, relogio);
}

function lerOrigem(valor: unknown): OrigemDaChamada {
  try {
    const o = JSON.parse(String(valor)) as OrigemDaChamada;
    return { modulo: String(o.modulo), superficie: o.superficie, campo: o.campo, rolagem: Number(o.rolagem) || 0 };
  } catch {
    return { modulo: "avc", rolagem: 0 };
  }
}

function daChamada(estado: EstadoAvc, chamadaId: string, campo: string) {
  return estado.fatos.find((f) => f.campo === campo && f.instancia === chamadaId);
}

export function pilhaDeChamadas(estado: EstadoAvc): readonly ChamadaAberta[] {
  return estado.fatos
    .filter((f) => f.campo === CHAMADA && f.instancia !== undefined && daChamada(estado, f.instancia, RETORNO) === undefined)
    .map((f) => ({
      chamadaId: f.instancia as string,
      encounterId: String(daChamada(estado, f.instancia as string, ENCOUNTER)?.valor ?? ""),
      destino: String(f.valor),
      origem: lerOrigem(daChamada(estado, f.instancia as string, ORIGEM)?.valor),
      abertaEm: f.horaRegistro,
    }));
}

export function retornarDoModulo(estado: EstadoAvc, chamadaId: string, relogio: Relogio, cancelado = false): EstadoAvc {
  const pilha = pilhaDeChamadas(estado);
  if (pilha.length === 0 || pilha[pilha.length - 1].chamadaId !== chamadaId) return estado;
  return registrarFato(estado, { campo: RETORNO, valor: cancelado ? "cancelado" : "retornado", instancia: chamadaId }, relogio);
}

export function retornoDaChamada(estado: EstadoAvc, chamadaId: string): RetornoDeModulo | undefined {
  const chamada = daChamada(estado, chamadaId, CHAMADA);
  if (chamada === undefined) return undefined;
  const leitura = leituraDaViaAereaExterna(estado);
  const suporte: string[] = [];
  /** ⚠️ AC-76: avançada ≠ definitiva — o tipo decide a segunda. */
  if (leitura.avancada === "sim") suporte.push("via_aerea_avancada");
  if (leitura.definitiva === "sim") suporte.push("via_aerea_definitiva");
  if (leitura.sedacao === "sim") suporte.push("sedacao_em_curso");
  if (leitura.ventilacao === "sim") suporte.push("ventilacao_mecanica");
  return {
    chamadaId,
    encounterId: String(daChamada(estado, chamadaId, ENCOUNTER)?.valor ?? ""),
    destino: String(chamada.valor),
    origem: lerOrigem(daChamada(estado, chamadaId, ORIGEM)?.valor),
    cancelado: daChamada(estado, chamadaId, RETORNO)?.valor === "cancelado",
    eventos: estado.fatos.filter((f) => f.instancia === chamadaId && !META.has(f.campo)).map((f) => f.id),
    suporteAtivo: suporte,
    resposta: "nao_medida",
    pendencias: leitura.pendencias.map((p) => p.id),
  };
}
