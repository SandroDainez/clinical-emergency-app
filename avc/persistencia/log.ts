/**
 * O LOG DO ATENDIMENTO — transição de estado → eventos, e eventos → estado.
 *
 * ⚠️⚠️ PURO: ⛔ nenhum acesso a disco aqui. Quem grava ⛔ e ORDENA é o armazenamento.
 *
 * ── O QUE VIRA EVENTO ──────────────────────────────────────────────────────
 *  · cada fato NOVO da trilha (a trilha já é append-only, §3.1);
 *  · relógio clínico definido, eixo concluído ⛔ ou reaberto, superfície vista;
 *  · cada NOVA VERSÃO de conclusão derivada (A14) — ⚠️ como HISTÓRICO: ⛔ a
 *    reconstrução ⛔ nunca a lê de volta; a verdade continua sendo derivada dos
 *    fatos a cada leitura (§4.3).
 *
 * ⚠️⚠️ ⛔ ESTE MÓDULO ⛔ NÃO ATRIBUI `seq`. O produtor entrega `NovoEvento`; a ordem
 * nasce na gravação (`ArmazenamentoDoAtendimento.anexarEventos`).
 *
 * ⚠️ Correção de fato é evento próprio, com o autor do contexto ⛔ e o motivo que o
 * médico deu — ⛔ e, se ⛔ não deu, o motivo fica AUSENTE, ⛔ nunca inventado
 * (decisão do autor de 2026-08-30 em `corrigirFato`); a linha do tempo mostra
 * "sem motivo informado".
 */
import type { EstadoAvc } from "../nucleo/estado";
import { certezaDaExposicaoAoTrombolitico, exposicaoAoTrombolitico } from "../nucleo/derivacoes-f";
import { estadoDaPopulacao } from "../nucleo/populacao";
import { estadoDoPortaoIVT } from "../nucleo/portao-ivt";
import { vereditoDaTrombolise } from "../nucleo/veredito-da-trombolise";
import { vereditoDaTrombectomia } from "../nucleo/veredito-da-trombectomia";
import type { FatoRegistrado } from "../nucleo/tipos";
import {
  VERSAO_DO_SCHEMA,
  type DadosDoCasoAberto,
  type EventoDoAtendimento,
  type NovoEvento,
  type OrigemDoAutor,
  type TipoDeEvento,
} from "./tipos";

export type ContextoDoLog = {
  readonly casoId: string;
  readonly autor: string;
  /** ⚠️ AC-40: sessão, sessão anônima ⛔ ou recurso do aparelho. */
  readonly origemDoAutor: OrigemDoAutor;
  readonly agora: number;
  readonly gerarId: () => string;
};

/** As conclusões cujas versões ficam no histórico (A14). */
export function conclusoesDo(estado: EstadoAvc, agora: number): Readonly<Record<string, string>> {
  return {
    populacao: estadoDaPopulacao(estado).estado,
    exposicao_trombolitico: exposicaoAoTrombolitico(estado).estado,
    exposicao_trombolitico_certeza: certezaDaExposicaoAoTrombolitico(estado),
    veredito_ivt: vereditoDaTrombolise(estado, agora).tipo,
    portao_ivt: estadoDoPortaoIVT(estado, agora).estado,
    veredito_evt: vereditoDaTrombectomia(estado, agora).tipo,
  };
}

function evento(
  ctx: ContextoDoLog,
  tipo: TipoDeEvento,
  dados: EventoDoAtendimento["dados"],
  registradoEm: number,
  observadoEm: number | null
): NovoEvento {
  return {
    id: ctx.gerarId(),
    casoId: ctx.casoId,
    tipo,
    registradoEm,
    observadoEm,
    autor: ctx.autor,
    origemDoAutor: ctx.origemDoAutor,
    versaoDoSchema: VERSAO_DO_SCHEMA,
    dados,
  };
}

export function eventosDeAbertura(estado: EstadoAvc, ctx: ContextoDoLog): NovoEvento[] {
  const dados: DadosDoCasoAberto = {
    abertoEm: estado.abertoEm,
    relogiosClinicos: { ...(estado.relogiosClinicos as Record<string, number>) },
    superficieVista: estado.superficieVista,
    eixosConcluidos: [...estado.eixosConcluidos],
  };
  const eventos = [evento(ctx, "caso_aberto", dados, estado.abertoEm, null)];
  for (const [nome, valor] of Object.entries(conclusoesDo(estado, ctx.agora))) {
    eventos.push(evento(ctx, "conclusao", { nome, valor, baseadaEm: [] }, ctx.agora, null));
  }
  return eventos;
}

export function eventosDaTransicao(anterior: EstadoAvc, proximo: EstadoAvc, ctx: ContextoDoLog): NovoEvento[] {
  if (anterior === proximo) return [];
  /** ⛔ A trilha só cresce: se o prefixo mudou, alguém reescreveu o passado. */
  const n = anterior.fatos.length;
  if (proximo.fatos.length < n || proximo.fatos.slice(0, n).some((f, i) => f !== anterior.fatos[i])) {
    throw new Error("Trilha reescrita: o log do atendimento só aceita fatos acrescentados.");
  }
  const eventos: NovoEvento[] = [];
  const idsDosFatos: string[] = [];
  for (const fato of proximo.fatos.slice(n) as FatoRegistrado[]) {
    const e = evento(ctx, "fato", { fato }, fato.horaRegistro, fato.horaClinica ?? null);
    eventos.push(e);
    idsDosFatos.push(e.id);
  }
  const relA = anterior.relogiosClinicos as Record<string, number | undefined>;
  const relP = proximo.relogiosClinicos as Record<string, number | undefined>;
  for (const qual of Object.keys(relP)) {
    if (relP[qual] !== undefined && relP[qual] !== relA[qual]) {
      eventos.push(evento(ctx, "relogio_clinico", { qual, instante: relP[qual] as number }, ctx.agora, null));
    }
  }
  for (const eixo of proximo.eixosConcluidos) {
    if (!anterior.eixosConcluidos.includes(eixo)) eventos.push(evento(ctx, "eixo_concluido", { eixo }, ctx.agora, null));
  }
  for (const eixo of anterior.eixosConcluidos) {
    if (!proximo.eixosConcluidos.includes(eixo)) eventos.push(evento(ctx, "eixo_reaberto", { eixo }, ctx.agora, null));
  }
  if (proximo.superficieVista !== anterior.superficieVista) {
    eventos.push(evento(ctx, "superficie_vista", { superficie: proximo.superficieVista }, ctx.agora, null));
  }
  const cA = conclusoesDo(anterior, ctx.agora);
  const cP = conclusoesDo(proximo, ctx.agora);
  for (const nome of Object.keys(cP)) {
    if (cP[nome] !== cA[nome]) {
      eventos.push(evento(ctx, "conclusao", { nome, valor: cP[nome], baseadaEm: idsDosFatos }, ctx.agora, null));
    }
  }
  return eventos;
}

/**
 * ⚠️ A ordem do log: se TODOS os eventos já foram gravados (têm `seq`), vale o
 * `seq` da gravação; senão, a ordem em que chegaram — ⛔ nunca uma ordem inventada.
 */
function naOrdemDoLog<T extends NovoEvento | EventoDoAtendimento>(eventos: readonly T[]): T[] {
  const gravados = eventos.every((e) => typeof (e as Partial<EventoDoAtendimento>).seq === "number");
  return gravados
    ? [...eventos].sort((a, b) => (a as EventoDoAtendimento).seq - (b as EventoDoAtendimento).seq)
    : [...eventos];
}

/** ⚠️ O estado, reconstruído SÓ do log — ⛔ conclusões ⛔ não entram. */
export function reconstruirEstado(eventos: readonly (NovoEvento | EventoDoAtendimento)[]): EstadoAvc {
  const ordenados = naOrdemDoLog(eventos);
  const abertura = ordenados.find((e) => e.tipo === "caso_aberto");
  if (abertura === undefined) throw new Error("Log sem abertura de caso.");
  const d = abertura.dados as DadosDoCasoAberto;
  let estado: EstadoAvc = {
    abertoEm: d.abertoEm,
    fatos: [],
    relogiosClinicos: { ...d.relogiosClinicos } as EstadoAvc["relogiosClinicos"],
    superficieVista: d.superficieVista,
    eixosConcluidos: [...d.eixosConcluidos],
  };
  for (const e of ordenados) {
    if (e.tipo === "fato") {
      estado = { ...estado, fatos: [...estado.fatos, (e.dados as { fato: FatoRegistrado }).fato] };
    } else if (e.tipo === "relogio_clinico") {
      const r = e.dados as { qual: string; instante: number };
      estado = { ...estado, relogiosClinicos: { ...estado.relogiosClinicos, [r.qual]: r.instante } };
    } else if (e.tipo === "eixo_concluido") {
      const x = (e.dados as { eixo: string }).eixo;
      if (!estado.eixosConcluidos.includes(x)) estado = { ...estado, eixosConcluidos: [...estado.eixosConcluidos, x] };
    } else if (e.tipo === "eixo_reaberto") {
      const x = (e.dados as { eixo: string }).eixo;
      estado = { ...estado, eixosConcluidos: estado.eixosConcluidos.filter((y) => y !== x) };
    } else if (e.tipo === "superficie_vista") {
      estado = { ...estado, superficieVista: (e.dados as { superficie: EstadoAvc["superficieVista"] }).superficie };
    }
  }
  return estado;
}

export type VersaoDaConclusao = {
  readonly versao: number;
  readonly valor: string;
  readonly registradoEm: number;
  readonly eventoId: string;
  readonly baseadaEm: readonly string[];
};

/** ⚠️ Todas as versões de uma conclusão, na ordem do log — ⛔ a anterior ⛔ nunca some (A14). */
export function versoesDaConclusao(
  eventos: readonly (NovoEvento | EventoDoAtendimento)[],
  nome: string
): VersaoDaConclusao[] {
  return naOrdemDoLog(eventos)
    .filter((e) => e.tipo === "conclusao" && (e.dados as { nome: string }).nome === nome)
    .map((e, i) => {
      const c = e.dados as { valor: string; baseadaEm: readonly string[] };
      return { versao: i + 1, valor: c.valor, registradoEm: e.registradoEm, eventoId: e.id, baseadaEm: c.baseadaEm };
    });
}
