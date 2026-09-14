/**
 * PLANO ATÉ 48 H — LEITURA (T08, C08; autor, 2026-09-13, 14ª rodada).
 *
 * ⚠️ Um caminho por EVENTO REAL registrado: início da trombólise (exposição com horário),
 * fim da trombectomia, decisão de ⛔ reperfundir ⛔ e hemorragia confirmada em imagem.
 * ⚠️ Cada tarefa declara evento de origem, prazo ⛔ ou condição, ⛔ e critério de conclusão.
 *
 * ⛔ O TEMPO ⛔ AUTORIZA ⛔ NEM CONCLUI: tarefa só conclui por fato registrado; terapia
 * dependente de imagem fica retida até o laudo (A15) — ⛔ e, com laudo, é "condição
 * atendida", ⛔ liberação. ⚠️ Piora registrada depois da última reavaliação ANTECIPA.
 * ⚠️ Instantes em ms: ⛔ fuso ⛔ entra na conta (a tela formata).
 *
 * ⚠️ Intervalo de reavaliação só onde a fonte transcrita traz: Table 7 pós-trombólise (F-15).
 * ⛔ Os outros caminhos ⛔ herdam esse intervalo.
 */
import { valorDaOpcao } from "../conteudo/campo";
import {
  CONCLUSAO_POR_REGISTRO,
  EVENTO_DE_ORIGEM,
  TAREFAS_DO_CAMINHO,
  TAREFAS_TRANSVERSAIS,
  type CaminhoDoPlanoId,
  type ConteudoDaTarefa,
  type DefinicaoDeTarefa,
} from "../conteudo/plano-48h";
import { RESULTADO_TC } from "../conteudo/superficie-c";
import { MONITORIZACAO_POS_IVT } from "../conteudo/superficie-g";
import { estudos, imagensAposInstante } from "./derivacoes-c";
import { exposicaoAoTrombolitico } from "./derivacoes-f";
import { eventosDePiora } from "./deterioracao";
import { valorAtual, type EstadoAvc } from "./estado";

const MIN = 60_000;
const H = 60 * MIN;

export type EstadoDaTarefa =
  | "pendente"
  | "atrasada"
  | "concluida"
  | "retida"
  | "condicao_atendida"
  | "antecipada"
  | "conteudo_pendente";

export type QuandoDaTarefa =
  | { readonly tipo: "prazo"; readonly instante: number }
  | { readonly tipo: "periodica"; readonly instante?: number; readonly aCadaMin?: number }
  | { readonly tipo: "condicao"; readonly instante?: undefined }
  | { readonly tipo: "sem_prazo_transcrito"; readonly instante?: undefined }
  | { readonly tipo: "sem_horario_de_origem"; readonly instante?: undefined };

export type TarefaDoPlano = {
  readonly id: string;
  readonly caminho: CaminhoDoPlanoId | "transversal";
  readonly rotulo: string;
  readonly eventoDeOrigem: string;
  readonly quando: QuandoDaTarefa;
  readonly criterioDeConclusao: string;
  readonly estado: EstadoDaTarefa;
  readonly atrasoMin?: number;
  readonly conteudo: ConteudoDaTarefa;
  readonly fonte: string;
};

export type OrigemDoCaminho = {
  readonly evento: string;
  readonly instante?: number;
  readonly horaDesconhecida: boolean;
};

export type CaminhoDoPlano = {
  readonly id: CaminhoDoPlanoId;
  readonly origem: OrigemDoCaminho;
  readonly tarefas: readonly TarefaDoPlano[];
};

export type ItemDaAgenda = {
  readonly tarefaId: string;
  readonly caminho: CaminhoDoPlanoId;
  readonly rotulo: string;
  readonly instante: number;
  readonly atrasoMin: number;
};

export type ProximaReavaliacao =
  | { readonly tipo: "horario"; readonly instante: number; readonly caminho: CaminhoDoPlanoId; readonly atrasoMin: number }
  | { readonly tipo: "agora"; readonly instante: number; readonly motivo: "piora" }
  | { readonly tipo: "sem_intervalo"; readonly caminhos: readonly CaminhoDoPlanoId[] };

export type PlanoAte48h = {
  readonly caminhos: readonly CaminhoDoPlano[];
  readonly encerrados: readonly { readonly caminho: CaminhoDoPlanoId; readonly motivo: string }[];
  readonly transversais: readonly TarefaDoPlano[];
  readonly agenda: readonly ItemDaAgenda[];
  readonly proximaReavaliacao?: ProximaReavaliacao;
};

type Fato = EstadoAvc["fatos"][number];
const quando = (f: Fato) => f.horaClinica ?? f.horaRegistro;

function corrigidos(estado: EstadoAvc): ReadonlySet<string> {
  return new Set(estado.fatos.map((f) => f.corrigeFatoId).filter((id): id is string => id !== undefined));
}

/* ── eventos de origem ───────────────────────────────────────────────────── */

type LeituraDeOrigem = { readonly origem?: OrigemDoCaminho; readonly encerrado?: string };

function origemDoHorario(estado: EstadoAvc, campo: string, caminho: CaminhoDoPlanoId, motivo: string): LeituraDeOrigem {
  const v = valorAtual(estado, campo)?.valor;
  if (typeof v === "number") return { origem: { evento: EVENTO_DE_ORIGEM[caminho], instante: v, horaDesconhecida: false } };
  if (v === "nao_sei") return { origem: { evento: EVENTO_DE_ORIGEM[caminho], horaDesconhecida: true } };
  const houve = estado.fatos.some((f) => f.campo === campo && (typeof f.valor === "number" || f.valor === "nao_sei"));
  return houve ? { encerrado: motivo } : {};
}

function origemDaTrombolise(estado: EstadoAvc): LeituraDeOrigem {
  const x = exposicaoAoTrombolitico(estado);
  if (x.estado === "exposta") {
    return {
      origem: {
        evento: EVENTO_DE_ORIGEM.ivt,
        instante: x.inicio.tipo === "conhecido" ? x.inicio.ms : undefined,
        horaDesconhecida: x.inicio.tipo !== "conhecido",
      },
    };
  }
  return x.estado === "cancelada_antes_do_inicio" ? { encerrado: "Trombólise cancelada antes do início" } : {};
}

function origemDaHemorragia(estado: EstadoAvc): LeituraDeOrigem {
  const com = estudos(estado).filter((e) => e.resultado === RESULTADO_TC.hemorragia);
  if (com.length > 0) {
    const horas = com.map((e) => e.hora).filter((h): h is number => h !== undefined);
    return {
      origem: {
        evento: EVENTO_DE_ORIGEM.hemorragia,
        instante: horas.length > 0 ? Math.min(...horas) : undefined,
        horaDesconhecida: horas.length === 0,
      },
    };
  }
  const laudo = valorDaOpcao(RESULTADO_TC.hemorragia);
  const houve = estado.fatos.some((f) => f.campo === "estudo_resultado" && f.valor === laudo);
  return houve ? { encerrado: "Laudo de hemorragia corrigido" } : {};
}

/* ── reavaliação real: PA completa ⛔ exame neurológico ─────────────────────── */

type Marca = { readonly instante: number; readonly indice: number };

/** ⚠️ A última PA COMPLETA (as duas metades na mesma aferição) desde o limiar. */
function ultimaPaCompleta(estado: EstadoAvc, desde: number, fora: ReadonlySet<string>): Marca | undefined {
  const porAfericao = new Map<string, { pas?: Marca; pad?: Marca }>();
  estado.fatos.forEach((f, indice) => {
    if ((f.campo !== "pas" && f.campo !== "pad") || typeof f.valor !== "number" || fora.has(f.id) || f.instancia === undefined) return;
    const atual = porAfericao.get(f.instancia) ?? {};
    porAfericao.set(f.instancia, { ...atual, [f.campo]: { instante: quando(f), indice } });
  });
  let ultima: Marca | undefined;
  for (const { pas, pad } of porAfericao.values()) {
    if (pas === undefined || pad === undefined) continue;
    const m = { instante: Math.max(pas.instante, pad.instante), indice: Math.max(pas.indice, pad.indice) };
    if (m.instante >= desde && (ultima === undefined || m.instante > ultima.instante)) ultima = m;
  }
  return ultima;
}

function ultimoFatoNumerico(estado: EstadoAvc, campos: readonly string[], desde: number, fora: ReadonlySet<string>): Marca | undefined {
  let ultima: Marca | undefined;
  estado.fatos.forEach((f, indice) => {
    if (!campos.includes(f.campo) || typeof f.valor !== "number" || fora.has(f.id)) return;
    const t = quando(f);
    if (t >= desde && (ultima === undefined || t >= ultima.instante)) ultima = { instante: t, indice };
  });
  return ultima;
}

/** ⚠️ Reavaliação completa: PA completa ⛔ e exame neurológico (NIHSS ⛔ ou Glasgow) — ⛔ meia medida ⛔ conta. */
function ultimaReavaliacao(estado: EstadoAvc, desde: number, fora: ReadonlySet<string>): Marca | undefined {
  const pa = ultimaPaCompleta(estado, desde, fora);
  const neuro = ultimoFatoNumerico(estado, ["nihss_calculado", "glasgow"], desde, fora);
  if (pa === undefined || neuro === undefined) return undefined;
  return { instante: Math.min(pa.instante, neuro.instante), indice: Math.max(pa.indice, neuro.indice) };
}

/** ⚠️ Piora (⛔ por engano) registrada depois da última reavaliação ⛔ e do evento de origem. */
function pioraQueAntecipa(estado: EstadoAvc, desde: number | undefined, reavaliacao: Marca | undefined): number | undefined {
  const indices = new Map(estado.fatos.map((f, i) => [f.id, i]));
  const pioras = eventosDePiora(estado).filter((p) => !p.engano
    && (desde === undefined || p.quando >= desde)
    && (reavaliacao === undefined || (indices.get(p.fatoId) ?? -1) > reavaliacao.indice));
  return pioras.length === 0 ? undefined : pioras[pioras.length - 1].quando;
}

/** ⚠️ Os horários da Table 7 desde o início da trombólise (F-15) — ⛔ nenhum inventado. */
function horariosDaTabela(origem: number): readonly { instante: number; aCadaMin: number }[] {
  return MONITORIZACAO_POS_IVT.fases.flatMap((fase) => {
    const n = Math.floor(((fase.ateHoras - fase.deHoras) * 60) / fase.aCadaMin);
    return Array.from({ length: n }, (_, k) => ({ instante: origem + fase.deHoras * H + (k + 1) * fase.aCadaMin * MIN, aCadaMin: fase.aCadaMin }));
  });
}

const atrasoEmMin = (instante: number, agoraMs: number) => Math.max(0, Math.floor((agoraMs - instante) / MIN));

/* ── tarefas ─────────────────────────────────────────────────────────────── */

function tarefa(def: DefinicaoDeTarefa, caminho: TarefaDoPlano["caminho"], evento: string, quandoDaTarefa: QuandoDaTarefa, estadoDaTarefa: EstadoDaTarefa, atrasoMin?: number): TarefaDoPlano {
  return {
    id: def.id,
    caminho,
    rotulo: def.rotulo,
    eventoDeOrigem: evento,
    quando: quandoDaTarefa,
    criterioDeConclusao: def.criterioDeConclusao,
    estado: estadoDaTarefa,
    atrasoMin,
    conteudo: def.conteudo,
    fonte: def.fonte,
  };
}

function registroConclui(estado: EstadoAvc, tarefaId: string): boolean {
  const r = CONCLUSAO_POR_REGISTRO[tarefaId];
  return r !== undefined && valorAtual(estado, r.campo)?.valor === valorDaOpcao(r.opcao);
}

type Reavaliacao = { readonly estado: EstadoDaTarefa; readonly quando: QuandoDaTarefa; readonly atrasoMin?: number; readonly antecipadaEm?: number };

function reavaliacaoDoCaminho(estado: EstadoAvc, caminho: CaminhoDoPlanoId, origem: OrigemDoCaminho, agoraMs: number, fora: ReadonlySet<string>): Reavaliacao {
  const desde = origem.instante;
  const reav = desde === undefined ? undefined : ultimaReavaliacao(estado, desde, fora);
  const piora = pioraQueAntecipa(estado, desde, reav);
  if (piora !== undefined) {
    return { estado: "antecipada", quando: { tipo: "periodica", instante: piora }, atrasoMin: 0, antecipadaEm: piora };
  }
  if (desde === undefined) return { estado: caminho === "ivt" ? "pendente" : "conteudo_pendente", quando: { tipo: "sem_horario_de_origem" } };
  if (caminho !== "ivt") return { estado: "conteudo_pendente", quando: { tipo: "sem_prazo_transcrito" } };
  const referencia = reav?.instante ?? desde;
  const proximo = horariosDaTabela(desde).find((h) => h.instante > referencia);
  if (proximo === undefined) return { estado: "conteudo_pendente", quando: { tipo: "sem_prazo_transcrito" } };
  const atraso = atrasoEmMin(proximo.instante, agoraMs);
  return {
    estado: agoraMs > proximo.instante ? "atrasada" : "pendente",
    quando: { tipo: "periodica", instante: proximo.instante, aCadaMin: proximo.aCadaMin },
    atrasoMin: atraso,
  };
}

function tarefasDoCaminho(estado: EstadoAvc, caminho: CaminhoDoPlanoId, origem: OrigemDoCaminho, agoraMs: number, fora: ReadonlySet<string>): readonly TarefaDoPlano[] {
  const evento = origem.evento;
  const semOrigem: QuandoDaTarefa = { tipo: "sem_horario_de_origem" };
  const reav = reavaliacaoDoCaminho(estado, caminho, origem, agoraMs, fora);
  return TAREFAS_DO_CAMINHO[caminho].map((def) => {
    if (def.id.endsWith("_reavaliacao")) return tarefa(def, caminho, evento, reav.quando, reav.estado, reav.atrasoMin);
    switch (def.id) {
      case "ivt_imagem_controle": {
        if (origem.instante === undefined) return tarefa(def, caminho, evento, semOrigem, "pendente");
        const prazo = origem.instante + MONITORIZACAO_POS_IVT.imagemDeControle.prazoHoras * H;
        const laudo = imagensAposInstante(estado, origem.instante).estado === "com_resultado";
        return tarefa(def, caminho, evento, { tipo: "prazo", instante: prazo },
          laudo ? "concluida" : agoraMs > prazo ? "atrasada" : "pendente", laudo ? undefined : atrasoEmMin(prazo, agoraMs));
      }
      case "ivt_antitromboticos": {
        const laudo = origem.instante !== undefined && imagensAposInstante(estado, origem.instante).estado === "com_resultado";
        return tarefa(def, caminho, evento, { tipo: "condicao" }, laudo ? "condicao_atendida" : "retida");
      }
      case "sem_reperfusao_pressao": {
        const pa = origem.instante === undefined ? undefined : ultimaPaCompleta(estado, origem.instante, fora);
        return tarefa(def, caminho, evento, origem.instante === undefined ? semOrigem : { tipo: "condicao" }, pa !== undefined ? "concluida" : "pendente");
      }
      case "hemorragia_caminho_proprio":
        return tarefa(def, caminho, evento, { tipo: "condicao" }, registroConclui(estado, def.id) ? "concluida" : "pendente");
      case "evt_antitromboticos":
      case "sem_reperfusao_antitromboticos":
      case "hemorragia_antitromboticos":
        return tarefa(def, caminho, evento, { tipo: "condicao" }, "retida");
      default:
        return tarefa(def, caminho, evento, origem.instante === undefined ? semOrigem : { tipo: "sem_prazo_transcrito" }, "conteudo_pendente");
    }
  });
}

function transversais(estado: EstadoAvc, caminhos: readonly CaminhoDoPlano[], fora: ReadonlySet<string>): readonly TarefaDoPlano[] {
  if (caminhos.length === 0) return [];
  const comHora = caminhos.filter((c) => c.origem.instante !== undefined)
    .sort((a, b) => (a.origem.instante as number) - (b.origem.instante as number));
  const primeiro = comHora[0] ?? caminhos[0];
  const desde = primeiro.origem.instante;
  const evento = primeiro.origem.evento;
  return TAREFAS_TRANSVERSAIS.map((def) => {
    const q: QuandoDaTarefa = { tipo: "sem_prazo_transcrito" };
    if (def.id === "degluticao") return tarefa(def, "transversal", evento, q, registroConclui(estado, def.id) ? "concluida" : "retida");
    if (def.id === "glicemia" || def.id === "temperatura") {
      const medida = desde === undefined ? undefined : ultimoFatoNumerico(estado, [def.id], desde, fora);
      return tarefa(def, "transversal", evento, q, medida !== undefined ? "concluida" : "pendente");
    }
    return tarefa(def, "transversal", evento, q, registroConclui(estado, def.id) ? "concluida" : "pendente");
  });
}

export function planoAte48h(estado: EstadoAvc, agoraMs: number): PlanoAte48h {
  const fora = corrigidos(estado);
  const leituras: readonly [CaminhoDoPlanoId, LeituraDeOrigem][] = [
    ["ivt", origemDaTrombolise(estado)],
    ["evt", origemDoHorario(estado, "evt_fim", "evt", "Fim da trombectomia corrigido")],
    ["sem_reperfusao", origemDoHorario(estado, "nao_reperfundir_hora", "sem_reperfusao", "Decisão de não reperfundir corrigida")],
    ["hemorragia", origemDaHemorragia(estado)],
  ];
  const caminhos: CaminhoDoPlano[] = [];
  const encerrados: { caminho: CaminhoDoPlanoId; motivo: string }[] = [];
  for (const [id, l] of leituras) {
    if (l.origem !== undefined) caminhos.push({ id, origem: l.origem, tarefas: tarefasDoCaminho(estado, id, l.origem, agoraMs, fora) });
    else if (l.encerrado !== undefined) encerrados.push({ caminho: id, motivo: l.encerrado });
  }

  const agenda: ItemDaAgenda[] = caminhos
    .flatMap((c) => c.tarefas.filter((t) => t.quando.instante !== undefined && t.estado !== "concluida")
      .map((t) => ({ tarefaId: t.id, caminho: c.id, rotulo: t.rotulo, instante: t.quando.instante as number, atrasoMin: t.atrasoMin ?? 0 })))
    .sort((a, b) => a.instante - b.instante);

  const reavaliacoes = caminhos.flatMap((c) => c.tarefas.filter((t) => t.id.endsWith("_reavaliacao")).map((t) => ({ c, t })));
  const antecipada = reavaliacoes.find(({ t }) => t.estado === "antecipada");
  const comHorario = reavaliacoes.filter(({ t }) => t.quando.tipo === "periodica" && t.quando.instante !== undefined)
    .sort((a, b) => (a.t.quando.instante as number) - (b.t.quando.instante as number))[0];
  const proximaReavaliacao: ProximaReavaliacao | undefined =
    antecipada !== undefined ? { tipo: "agora", instante: antecipada.t.quando.instante as number, motivo: "piora" }
      : comHorario !== undefined ? { tipo: "horario", instante: comHorario.t.quando.instante as number, caminho: comHorario.c.id, atrasoMin: comHorario.t.atrasoMin ?? 0 }
        : caminhos.length > 0 ? { tipo: "sem_intervalo", caminhos: caminhos.map((c) => c.id) }
          : undefined;

  return { caminhos, encerrados, transversais: transversais(estado, caminhos, fora), agenda, proximaReavaliacao };
}
