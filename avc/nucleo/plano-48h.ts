/**
 * PLANO ATÉ 48 H — LEITURA (T08, C08; autor, 2026-09-13, 14ª ⛔ 15ª rodadas).
 *
 * ⚠️ Um caminho por EVENTO REAL registrado: início da trombólise (exposição com horário), fim
 * da trombectomia, desfechos negativos de IVT E de EVT (AC-85) ⛔ hemorragia confirmada em imagem.
 * ⚠️ Cada tarefa declara evento de origem, prazo ⛔ ou condição, ⛔ e critério de conclusão.
 *
 * ⛔ O TEMPO ⛔ AUTORIZA ⛔ NEM CONCLUI: tarefa só conclui por fato registrado; terapia
 * dependente de imagem fica retida até o laudo (A15) — ⛔ e, com laudo, é "condição
 * atendida", ⛔ liberação. ⚠️ Piora registrada depois da última reavaliação ANTECIPA.
 * ⚠️ Instantes em ms: ⛔ fuso ⛔ entra na conta (a tela formata).
 *
 * ⚠️ AC-88 (15ª rodada): transversais com RESULTADO; deglutição ≠ aprovada mantém a trava
 * "nada por via oral" (`travaDeViaOral`), dita no cabeçalho de suporte.
 */
import { valorDaOpcao } from "../conteudo/campo";
import {
  CAMPO_DO_RESULTADO,
  EVENTO_DE_ORIGEM,
  RESULTADOS_DA_TAREFA,
  TAREFAS_DO_CAMINHO,
  TAREFAS_TRANSVERSAIS,
  type CaminhoDoPlanoId,
  type ConteudoDaTarefa,
  type DefinicaoDeTarefa,
} from "../conteudo/plano-48h";
import { RESULTADO_TC } from "../conteudo/superficie-c";
import { MONITORIZACAO_POS_IVT } from "../conteudo/superficie-g";
import { estudos, exclusaoDeHemorragia, imagensAposInstante } from "./derivacoes-c";
import { exposicaoAoTrombolitico } from "./derivacoes-f";
import { eventosDePiora } from "./deterioracao";
import { registrarFato, valorAtual, type EstadoAvc } from "./estado";
import type { Relogio } from "./relogio";
import type { Pendencia } from "./tipos";

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
  /** ⚠️ AC-88: o resultado registrado, como rótulo (aprovada · reprovada · não realizada · não sei). */
  readonly resultado?: string;
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
  readonly pendencias: readonly Pendencia[];
};

type Fato = EstadoAvc["fatos"][number];
const quando = (f: Fato) => f.horaClinica ?? f.horaRegistro;

function corrigidos(estado: EstadoAvc): ReadonlySet<string> {
  return new Set(estado.fatos.map((f) => f.corrigeFatoId).filter((id): id is string => id !== undefined));
}

/** ⚠️ `96` → "1 h 36 min". ⛔ Minuto cru ("em 1439 min") vira conta na cabeça (captura da 14ª rodada). */
export function textoDoIntervalo(minutos: number): string {
  const m = Math.abs(Math.round(minutos));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto === 0 ? `${h} h` : `${h} h ${resto} min`;
}

/* ── AC-85 · desfechos negativos ─────────────────────────────────────────── */

type Desfecho = { readonly motivo?: string; readonly instante?: number; readonly completo: boolean };

function desfecho(estado: EstadoAvc, campoMotivo: string, campoHora: string): Desfecho {
  const m = valorAtual(estado, campoMotivo)?.valor;
  const motivo = typeof m === "string" && m !== "nao_perguntado" ? m : undefined;
  const h = valorAtual(estado, campoHora)?.valor;
  const instante = typeof h === "number" ? h : undefined;
  return { motivo, instante, completo: motivo !== undefined && instante !== undefined };
}

export type DesfechosNegativos = {
  readonly ivt: Desfecho;
  readonly evt: Desfecho;
  readonly ivtExposta: boolean;
};

export function desfechosNegativos(estado: EstadoAvc): DesfechosNegativos {
  return {
    ivt: desfecho(estado, "ivt_nao_prosseguir_motivo", "ivt_nao_prosseguir_hora"),
    evt: desfecho(estado, "evt_desfecho_motivo", "evt_desfecho_hora"),
    ivtExposta: exposicaoAoTrombolitico(estado).estado === "exposta",
  };
}

/** ⚠️ AC-85: um gesto registra a decisão global nos DOIS desfechos — ⛔ sem pular a avaliação de nenhum. */
export function registrarDecisaoGlobalDeNaoReperfundir(estado: EstadoAvc, motivo: string, observado: number, relogio: Relogio): EstadoAvc {
  let e = registrarFato(estado, { campo: "ivt_nao_prosseguir_motivo", valor: motivo }, relogio);
  e = registrarFato(e, { campo: "ivt_nao_prosseguir_hora", valor: observado, horaClinica: observado }, relogio);
  e = registrarFato(e, { campo: "evt_desfecho_motivo", valor: motivo }, relogio);
  return registrarFato(e, { campo: "evt_desfecho_hora", valor: observado, horaClinica: observado }, relogio);
}

/** ⚠️ Rótulos literais (traduzíveis), um por combinação do que falta: trombólise | trombectomia. */
const ROTULO_DA_PENDENCIA_SEM_REPERFUSAO: Readonly<Record<string, string>> = {
  "ok|desfecho": "Sem reperfusão: falta o desfecho da trombectomia (motivo e horário)",
  "ok|horario": "Sem reperfusão: falta o horário do desfecho da trombectomia",
  "desfecho|ok": "Sem reperfusão: falta o desfecho da trombólise (motivo e horário)",
  "horario|ok": "Sem reperfusão: falta o horário do desfecho da trombólise",
  "desfecho|desfecho": "Sem reperfusão: faltam os desfechos da trombólise e da trombectomia (motivo e horário)",
  "desfecho|horario": "Sem reperfusão: falta o desfecho da trombólise (motivo e horário) e o horário do desfecho da trombectomia",
  "horario|desfecho": "Sem reperfusão: falta o horário do desfecho da trombólise e o desfecho da trombectomia (motivo e horário)",
  "horario|horario": "Sem reperfusão: faltam os horários dos desfechos da trombólise e da trombectomia",
};

/** ⚠️ AC-85: com um desfecho pendente, o caminho ⛔ abre ⛔ e a pendência NOMEIA o que falta. */
export function pendenciasDoPlano(estado: EstadoAvc): readonly Pendencia[] {
  const d = desfechosNegativos(estado);
  if (d.ivtExposta) return [];
  const iniciado = d.ivt.motivo !== undefined || d.ivt.instante !== undefined || d.evt.motivo !== undefined || d.evt.instante !== undefined;
  if (!iniciado || (d.ivt.completo && d.evt.completo)) return [];
  const falta = (x: Desfecho) => (x.completo ? "ok" : x.motivo === undefined ? "desfecho" : "horario");
  const rotulo = ROTULO_DA_PENDENCIA_SEM_REPERFUSAO[`${falta(d.ivt)}|${falta(d.evt)}`];
  const campo = !d.ivt.completo ? (d.ivt.motivo === undefined ? "ivt_nao_prosseguir_motivo" : "ivt_nao_prosseguir_hora")
    : d.evt.motivo === undefined ? "evt_desfecho_motivo" : "evt_desfecho_hora";
  return [{
    id: "sem_reperfusao",
    rotulo,
    dono: "reperfusao",
    campo,
    resolvePor: "Registrar motivo e horário no desfecho negativo da reperfusão",
  }];
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

function origemSemReperfusao(estado: EstadoAvc): LeituraDeOrigem {
  const d = desfechosNegativos(estado);
  if (d.ivtExposta) return {};
  if (d.ivt.completo && d.evt.completo) {
    return { origem: { evento: EVENTO_DE_ORIGEM.sem_reperfusao, instante: Math.max(d.ivt.instante as number, d.evt.instante as number), horaDesconhecida: false } };
  }
  const campos = ["ivt_nao_prosseguir_hora", "evt_desfecho_hora"];
  const tinhaOsDois = campos.every((c) => estado.fatos.some((f) => f.campo === c && typeof f.valor === "number"));
  return tinhaOsDois ? { encerrado: "Desfecho negativo corrigido" } : {};
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

function leiturasDeOrigem(estado: EstadoAvc): readonly [CaminhoDoPlanoId, LeituraDeOrigem][] {
  return [
    ["ivt", origemDaTrombolise(estado)],
    ["evt", origemDoHorario(estado, "evt_fim", "evt", "Fim da trombectomia corrigido")],
    ["sem_reperfusao", origemSemReperfusao(estado)],
    ["hemorragia", origemDaHemorragia(estado)],
  ];
}

/* ── AC-88 · resultado ⛔ trava de via oral ──────────────────────────────── */

const ROTULO_DO_RESULTADO: Readonly<Record<string, string>> = Object.fromEntries(RESULTADOS_DA_TAREFA.map((r) => [valorDaOpcao(r), r]));

function resultadoDaTarefa(estado: EstadoAvc, tarefaId: string): string | undefined {
  const campo = CAMPO_DO_RESULTADO[tarefaId];
  if (campo === undefined) return undefined;
  const v = valorAtual(estado, campo)?.valor;
  return typeof v === "string" && v !== "nao_perguntado" ? ROTULO_DO_RESULTADO[v] ?? v : undefined;
}

export type TravaDeViaOral = { readonly motivo: "reprovada" | "nao_realizada" | "nao_sei" | "sem_registro" };

/**
 * ⚠️ AC-88: com caminho do plano aberto, a triagem de deglutição ⛔ aprovada mantém "nada por
 * via oral". ⛔ Sem caminho aberto ⛔ há trava no cabeçalho (o plano ⛔ começou).
 */
export function travaDeViaOral(estado: EstadoAvc): TravaDeViaOral | undefined {
  /**
   * ⚠️ AC-92 (16ª rodada, autor): a trava ⛔ depende do plano de 48 h — vale desde que o caminho esteja
   * definido pela imagem registrada (TC com ⛔ sem hemorragia, ⛔ divergente). Antes do laudo, ⛔ trava.
   */
  if (exclusaoDeHemorragia(estado).exclusao === "sem_informacao") return undefined;
  const r = resultadoDaTarefa(estado, "degluticao");
  if (r === "Aprovada") return undefined;
  if (r === "Reprovada") return { motivo: "reprovada" };
  if (r === "Não realizada") return { motivo: "nao_realizada" };
  if (r === "Não sei") return { motivo: "nao_sei" };
  return { motivo: "sem_registro" };
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

function tarefa(def: DefinicaoDeTarefa, caminho: TarefaDoPlano["caminho"], evento: string, quandoDaTarefa: QuandoDaTarefa, estadoDaTarefa: EstadoDaTarefa, extra: { atrasoMin?: number; resultado?: string } = {}): TarefaDoPlano {
  return {
    id: def.id,
    caminho,
    rotulo: def.rotulo,
    eventoDeOrigem: evento,
    quando: quandoDaTarefa,
    criterioDeConclusao: def.criterioDeConclusao,
    estado: estadoDaTarefa,
    atrasoMin: extra.atrasoMin,
    resultado: extra.resultado,
    conteudo: def.conteudo,
    fonte: def.fonte,
  };
}

type Reavaliacao = { readonly estado: EstadoDaTarefa; readonly quando: QuandoDaTarefa; readonly atrasoMin?: number };

function reavaliacaoDoCaminho(estado: EstadoAvc, caminho: CaminhoDoPlanoId, origem: OrigemDoCaminho, agoraMs: number, fora: ReadonlySet<string>): Reavaliacao {
  const desde = origem.instante;
  const reav = desde === undefined ? undefined : ultimaReavaliacao(estado, desde, fora);
  const piora = pioraQueAntecipa(estado, desde, reav);
  if (piora !== undefined) return { estado: "antecipada", quando: { tipo: "periodica", instante: piora }, atrasoMin: 0 };
  if (desde === undefined) return { estado: caminho === "ivt" ? "pendente" : "conteudo_pendente", quando: { tipo: "sem_horario_de_origem" } };
  if (caminho !== "ivt") return { estado: "conteudo_pendente", quando: { tipo: "sem_prazo_transcrito" } };
  const referencia = reav?.instante ?? desde;
  const proximo = horariosDaTabela(desde).find((h) => h.instante > referencia);
  if (proximo === undefined) return { estado: "conteudo_pendente", quando: { tipo: "sem_prazo_transcrito" } };
  return {
    estado: agoraMs > proximo.instante ? "atrasada" : "pendente",
    quando: { tipo: "periodica", instante: proximo.instante, aCadaMin: proximo.aCadaMin },
    atrasoMin: atrasoEmMin(proximo.instante, agoraMs),
  };
}

function tarefasDoCaminho(estado: EstadoAvc, caminho: CaminhoDoPlanoId, origem: OrigemDoCaminho, agoraMs: number, fora: ReadonlySet<string>): readonly TarefaDoPlano[] {
  const evento = origem.evento;
  const semOrigem: QuandoDaTarefa = { tipo: "sem_horario_de_origem" };
  const reav = reavaliacaoDoCaminho(estado, caminho, origem, agoraMs, fora);
  return TAREFAS_DO_CAMINHO[caminho].map((def) => {
    if (def.id.endsWith("_reavaliacao")) return tarefa(def, caminho, evento, reav.quando, reav.estado, { atrasoMin: reav.atrasoMin });
    switch (def.id) {
      case "ivt_imagem_controle": {
        if (origem.instante === undefined) return tarefa(def, caminho, evento, semOrigem, "pendente");
        const prazo = origem.instante + MONITORIZACAO_POS_IVT.imagemDeControle.prazoHoras * H;
        const laudo = imagensAposInstante(estado, origem.instante).estado === "com_resultado";
        return tarefa(def, caminho, evento, { tipo: "prazo", instante: prazo },
          laudo ? "concluida" : agoraMs > prazo ? "atrasada" : "pendente", { atrasoMin: laudo ? undefined : atrasoEmMin(prazo, agoraMs) });
      }
      case "ivt_antitromboticos": {
        const laudo = origem.instante !== undefined && imagensAposInstante(estado, origem.instante).estado === "com_resultado";
        return tarefa(def, caminho, evento, { tipo: "condicao" }, laudo ? "condicao_atendida" : "retida");
      }
      case "sem_reperfusao_pressao": {
        const pa = origem.instante === undefined ? undefined : ultimaPaCompleta(estado, origem.instante, fora);
        return tarefa(def, caminho, evento, origem.instante === undefined ? semOrigem : { tipo: "condicao" }, pa !== undefined ? "concluida" : "pendente");
      }
      case "hemorragia_caminho_proprio": {
        const r = valorAtual(estado, "plano_hemorragia_revisada")?.valor;
        return tarefa(def, caminho, evento, { tipo: "condicao" }, r === "Revisado" ? "concluida" : "pendente", { resultado: typeof r === "string" && r !== "nao_perguntado" ? r : undefined });
      }
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
    if (def.id === "glicemia" || def.id === "temperatura") {
      const medida = desde === undefined ? undefined : ultimoFatoNumerico(estado, [def.id], desde, fora);
      return tarefa(def, "transversal", evento, q, medida !== undefined ? "concluida" : "pendente");
    }
    const resultado = resultadoDaTarefa(estado, def.id);
    if (def.id === "degluticao") return tarefa(def, "transversal", evento, q, resultado === "Aprovada" ? "concluida" : "retida", { resultado });
    const registrado = resultado === "Aprovada" || resultado === "Reprovada";
    return tarefa(def, "transversal", evento, q, registrado ? "concluida" : "pendente", { resultado });
  });
}

export function planoAte48h(estado: EstadoAvc, agoraMs: number): PlanoAte48h {
  const fora = corrigidos(estado);
  const caminhos: CaminhoDoPlano[] = [];
  const encerrados: { caminho: CaminhoDoPlanoId; motivo: string }[] = [];
  for (const [id, l] of leiturasDeOrigem(estado)) {
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

  return { caminhos, encerrados, transversais: transversais(estado, caminhos, fora), agenda, proximaReavaliacao, pendencias: pendenciasDoPlano(estado) };
}
