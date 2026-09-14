/**
 * VIA AÉREA COMO CONDUTA EXTERNA — leitura (autor, 2026-09-13, 13ª rodada, opção A; A09).
 *
 * ⚠️ ESTADO REGISTRADO PELA EQUIPE, ⛔ e ⛔ não conduta do app. ⛔ Fármaco, dose ⛔ e parâmetro
 * ⛔ entram.
 *
 * ⚠️ 14ª rodada (AC-76, correção do autor): a pergunta é "via aérea AVANÇADA instalada".
 * ⛔ Supraglótico ⛔ é via aérea definitiva — definitiva é tubo com balonete na traqueia
 * (intubação orotraqueal ⛔ ou cirúrgica). ⚠️ O TIPO define se é definitiva; outra ⛔ e não sei
 * ficam indeterminadas (⛔ presumidas).
 *
 * ⚠️ Com via aérea avançada = sim, para TODOS os tipos:
 *  · suporte ativo no cabeçalho, com o rótulo do tipo;
 *  · eixo A em "intervenção registrada · reavaliação pendente" até nova medida da via aérea;
 *  · marca de sedação em cada NIHSS ⛔ e Glasgow (AC-78): anterior ao horário → "anterior à
 *    sedação"; posterior → "sob sedação"; horário desconhecido → ⛔ separável;
 *  · AC-77: exame sob sedação ⛔ é critério — só vale para as regras com "sedação suspensa
 *    para o exame = sim", registrado no próprio exame;
 *  · o item de barreira à fala (AC-01) é SUGERIDO — ⛔ nunca gravado.
 * ⚠️ «Não sei» em qualquer campo mantém pendência.
 */
import { VIA_AEREA_A } from "../conteudo/superficie-a";
import { ITENS_QUE_ACEITAM_NAO_TESTAVEL } from "../../lib/nihss";
import { registrarFato, valorAtual, type EstadoAvc } from "./estado";
import type { Relogio } from "./relogio";
import type { Pendencia } from "./tipos";

type Ternario = "sim" | "nao" | "nao_sei";

export type RegistroDeViaAerea = {
  readonly avancada?: Ternario;
  readonly tipo?: string;
  readonly observado?: number | "nao_sei";
  readonly quem?: string;
  readonly sedacao?: Ternario;
  readonly ventilacao?: Ternario;
};

export const TIPO_IOT = "Intubação orotraqueal";
export const TIPO_CIRURGICA = "Via aérea cirúrgica";
export const TIPO_SUPRAGLOTICO = "Dispositivo supraglótico";

const CAMPO = {
  avancada: "va_avancada",
  tipo: "va_tipo",
  hora: "va_hora",
  quem: "va_quem",
  sedacao: "va_sedacao",
  ventilacao: "va_ventilacao",
} as const;

/** ⚠️ AC-77: resposta registrada NO EXAME (instância = id do fato do total). */
export const CAMPO_SEDACAO_SUSPENSA = "exame_sedacao_suspensa";

export type LeituraDaViaAerea = {
  readonly registrada: boolean;
  readonly avancada?: string;
  /** ⚠️ Derivada do tipo, só com via aérea avançada = sim. */
  readonly definitiva?: "sim" | "nao" | "indeterminada";
  readonly tipo?: string;
  readonly observado?: number;
  readonly horaDesconhecida: boolean;
  readonly quem?: string;
  readonly sedacao?: string;
  readonly ventilacao?: string;
  readonly pendencias: readonly Pendencia[];
};

export type ParteDoSuporte = { readonly rotulo: string; readonly hora?: number; readonly sufixo?: string };

export type MarcaDoExame = "anterior_a_sedacao" | "sob_sedacao" | "sem_referencia" | "sedacao_suspensa" | "com_via_aerea_sem_sedacao";

/**
 * ⚠️ AC-83 (15ª rodada; `nih-nihss-2024.md`, p. 2, item 1b): o intubado que ⛔ fala RECEBE 1 —
 * ⛔ é UN. ⚠️ Lembrete na tela, ⛔ nunca gravado.
 */
export function lembreteNihss1b(estado: EstadoAvc): string | undefined {
  return leituraDaViaAereaExterna(estado).avancada === "sim"
    ? "Instrução NIH, item 1b: intubado que não fala recebe 1 (não é não testável)."
    : undefined;
}

export type ExameMarcado = {
  readonly fatoId: string;
  readonly total: number;
  readonly quando: number;
  readonly marca?: MarcaDoExame;
  /** ⚠️ Registrado no exame: "sim" · "nao" · ausente. */
  readonly sedacaoSuspensa?: string;
  /** ⚠️ AC-77: ⛔ vale quando feito sob sedação (ou ⛔ separável) sem sedação suspensa = sim. */
  readonly valeParaRegras: boolean;
};

/** ⚠️ Mantido para quem já importava o nome da 13ª rodada. */
export type ExameNihss = ExameMarcado;

export function registrarViaAereaExterna(estado: EstadoAvc, r: RegistroDeViaAerea, relogio: Relogio, chamadaId?: string): EstadoAvc {
  const inst = chamadaId === undefined ? {} : { instancia: chamadaId };
  let e = estado;
  if (r.avancada !== undefined) e = registrarFato(e, { campo: CAMPO.avancada, valor: r.avancada, ...inst }, relogio);
  if (r.tipo !== undefined) e = registrarFato(e, { campo: CAMPO.tipo, valor: r.tipo === "Não sei" ? "nao_sei" : r.tipo, ...inst }, relogio);
  if (typeof r.observado === "number") e = registrarFato(e, { campo: CAMPO.hora, valor: r.observado, horaClinica: r.observado, ...inst }, relogio);
  else if (r.observado === "nao_sei") e = registrarFato(e, { campo: CAMPO.hora, valor: "nao_sei", ...inst }, relogio);
  if (r.quem !== undefined && r.quem.trim() !== "") e = registrarFato(e, { campo: CAMPO.quem, valor: r.quem.trim(), ...inst }, relogio);
  if (r.sedacao !== undefined) e = registrarFato(e, { campo: CAMPO.sedacao, valor: r.sedacao, ...inst }, relogio);
  if (r.ventilacao !== undefined) e = registrarFato(e, { campo: CAMPO.ventilacao, valor: r.ventilacao, ...inst }, relogio);
  return e;
}

function atual(estado: EstadoAvc, campo: string): string | number | undefined {
  const f = valorAtual(estado, campo);
  return f === undefined || f.valor === "nao_perguntado" ? undefined : f.valor;
}

/** ⚠️ Eixo A: nenhum fato do bloco da via aérea DEPOIS do registro de via aérea avançada. */
export function intervencaoDeViaAereaPendente(estado: EstadoAvc): boolean {
  if (atual(estado, CAMPO.avancada) !== "sim") return false;
  const registro = valorAtual(estado, CAMPO.avancada);
  const indice = registro === undefined ? -1 : estado.fatos.indexOf(registro);
  /** ⚠️ Os campos do bloco vêm da constante de conteúdo — ⛔ do nome do card (independência da UI). */
  const bloco = new Set(VIA_AEREA_A.map((c) => c.id));
  return !estado.fatos.slice(indice + 1).some((f) => bloco.has(f.campo) && f.valor !== "nao_perguntado");
}

const PENDENCIA_DO_NAO_SEI: Readonly<Record<string, string>> = {
  va_avancada: "Confirmar se há via aérea avançada instalada",
  va_tipo: "Confirmar o tipo de via aérea",
  va_hora: "Confirmar o horário da via aérea avançada",
  va_sedacao: "Confirmar se há sedação em curso",
  va_ventilacao: "Confirmar se há ventilação mecânica",
};

function definitivaDoTipo(tipo: string | undefined): "sim" | "nao" | "indeterminada" {
  if (tipo === TIPO_IOT || tipo === TIPO_CIRURGICA) return "sim";
  if (tipo === TIPO_SUPRAGLOTICO) return "nao";
  return "indeterminada";
}

export function leituraDaViaAereaExterna(estado: EstadoAvc): LeituraDaViaAerea {
  const valores = Object.fromEntries(Object.values(CAMPO).map((c) => [c, atual(estado, c)])) as Record<string, string | number | undefined>;
  const registrada = Object.values(valores).some((v) => v !== undefined);
  const hora = valores[CAMPO.hora];
  const tipo = typeof valores[CAMPO.tipo] === "string" ? String(valores[CAMPO.tipo]) : undefined;
  const pendencias: Pendencia[] = [];
  for (const [campo, rotulo] of Object.entries(PENDENCIA_DO_NAO_SEI)) {
    if (valores[campo] === "nao_sei") {
      pendencias.push({ id: `confirmar_${campo}`, rotulo, dono: "estabilizacao", campo, resolvePor: "Registrar a resposta quando for conhecida" });
    }
  }
  /**
   * ⚠️ AC-82 (15ª rodada): sem horário da via aérea ⛔ há exame basal — ⛔ e isso é dito como
   * pendência explícita quando existe exame a recuperar (substitui a genérica do horário).
   */
  const haExame = estado.fatos.some((f) => f.campo === "nihss_calculado" && typeof f.valor === "number");
  if (valores[CAMPO.avancada] === "sim" && typeof hora !== "number" && haExame) {
    const i = pendencias.findIndex((p) => p.id === "confirmar_va_hora");
    if (i !== -1) pendencias.splice(i, 1);
    pendencias.push({ id: "recuperar_basal_va_hora", rotulo: "Informe o horário da via aérea para recuperar o exame basal", dono: "estabilizacao", campo: CAMPO.hora, resolvePor: "Registrar o horário observado da via aérea avançada" });
  } else if (valores[CAMPO.avancada] === "sim" && hora === undefined) {
    pendencias.push({ id: "confirmar_va_hora", rotulo: "Registrar o horário da via aérea avançada", dono: "estabilizacao", campo: CAMPO.hora, resolvePor: "Registrar o horário observado" });
  }
  /** ⚠️ AC-91 (16ª rodada): sedação ⛔ registrada conta como "não sei" — ⛔ e isso é dito, para liberar o basal. */
  if (valores[CAMPO.avancada] === "sim" && valores[CAMPO.sedacao] === undefined && haExame) {
    pendencias.push({ id: "informar_sedacao_va", rotulo: "Sedação não registrada — informe para liberar o exame como basal", dono: "estabilizacao", campo: CAMPO.sedacao, resolvePor: "Registrar se há sedação em curso" });
  }
  if (intervencaoDeViaAereaPendente(estado)) {
    pendencias.push({ id: "reavaliar_via_aerea", rotulo: "Reavaliar a via aérea depois da intervenção registrada", dono: "estabilizacao", campo: "consciencia_rebaixada", resolvePor: "Registrar nova avaliação da via aérea" });
  }
  const avancada = typeof valores[CAMPO.avancada] === "string" ? String(valores[CAMPO.avancada]) : undefined;
  return {
    registrada,
    avancada,
    definitiva: avancada === "sim" ? definitivaDoTipo(tipo) : undefined,
    tipo,
    observado: typeof hora === "number" ? hora : undefined,
    horaDesconhecida: hora === "nao_sei",
    quem: typeof valores[CAMPO.quem] === "string" ? String(valores[CAMPO.quem]) : undefined,
    sedacao: typeof valores[CAMPO.sedacao] === "string" ? String(valores[CAMPO.sedacao]) : undefined,
    ventilacao: typeof valores[CAMPO.ventilacao] === "string" ? String(valores[CAMPO.ventilacao]) : undefined,
    pendencias,
  };
}

/** ⚠️ AC-76: o cabeçalho diz o que foi instalado — ⛔ "intubado" só na intubação. */
type Cabecalho = { readonly as: string; readonly desconhecido: string; readonly naoRegistrado: string; readonly sufixo?: string };
const CABECALHO_DO_TIPO: Readonly<Record<string, Cabecalho>> = {
  [TIPO_IOT]: { as: "intubado às", desconhecido: "intubado · horário desconhecido", naoRegistrado: "intubado · horário não registrado" },
  [TIPO_CIRURGICA]: { as: "via aérea cirúrgica às", desconhecido: "via aérea cirúrgica · horário desconhecido", naoRegistrado: "via aérea cirúrgica · horário não registrado" },
  [TIPO_SUPRAGLOTICO]: { as: "dispositivo supraglótico às", desconhecido: "dispositivo supraglótico · horário desconhecido", naoRegistrado: "dispositivo supraglótico · horário não registrado", sufixo: "(não definitiva)" },
};
/** ⚠️ Outra ⛔ ou não sei: avançada, ⛔ e definitiva ⛔ presumida. */
const CABECALHO_SEM_TIPO: Cabecalho = { as: "via aérea avançada às", desconhecido: "via aérea avançada · horário desconhecido", naoRegistrado: "via aérea avançada · horário não registrado", sufixo: "(tipo não determinado)" };

export function suporteAtivo(estado: EstadoAvc): readonly ParteDoSuporte[] {
  const l = leituraDaViaAereaExterna(estado);
  if (l.avancada !== "sim") return [];
  const cab = (l.tipo !== undefined ? CABECALHO_DO_TIPO[l.tipo] : undefined) ?? CABECALHO_SEM_TIPO;
  const partes: ParteDoSuporte[] = [
    l.observado !== undefined
      ? { rotulo: cab.as, hora: l.observado, sufixo: cab.sufixo }
      : { rotulo: l.horaDesconhecida ? cab.desconhecido : cab.naoRegistrado, sufixo: cab.sufixo },
  ];
  if (l.sedacao === "sim") partes.push({ rotulo: "sedação em curso" });
  else if (l.sedacao === "nao_sei") partes.push({ rotulo: "sedação: não sei" });
  if (l.ventilacao === "sim") partes.push({ rotulo: "ventilação mecânica" });
  else if (l.ventilacao === "nao_sei") partes.push({ rotulo: "ventilação: não sei" });
  return partes;
}

/** ⚠️ AC-77: "sedação suspensa para o exame" — gravada no exame (instância = id do total). */
export function registrarSedacaoSuspensa(estado: EstadoAvc, exameFatoId: string, valor: "sim" | "nao", relogio: Relogio): EstadoAvc {
  return registrarFato(estado, { campo: CAMPO_SEDACAO_SUSPENSA, valor, instancia: exameFatoId }, relogio);
}

function sedacaoSuspensaDoExame(estado: EstadoAvc, exameFatoId: string): string | undefined {
  for (let i = estado.fatos.length - 1; i >= 0; i -= 1) {
    const f = estado.fatos[i];
    if (f.campo === CAMPO_SEDACAO_SUSPENSA && f.instancia === exameFatoId) return typeof f.valor === "string" ? f.valor : undefined;
  }
  return undefined;
}

/** ⚠️ Os totais de uma escala (um por confirmação), cada um com a marca de sedação. */
function examesMarcados(estado: EstadoAvc, campo: string): readonly ExameMarcado[] {
  const l = leituraDaViaAereaExterna(estado);
  const corrigidos = new Set(estado.fatos.map((f) => f.corrigeFatoId).filter((id) => id !== undefined));
  return estado.fatos
    .filter((f) => f.campo === campo && typeof f.valor === "number" && !corrigidos.has(f.id))
    .map((f) => {
      const quando = f.horaClinica ?? f.horaRegistro;
      const suspensa = sedacaoSuspensaDoExame(estado, f.id);
      /**
       * ⚠️ AC-83 (15ª rodada): dois confundidores. "Sob sedação" só com sedação = sim ⛔ não sei
       * (⛔ registrada conta como não sei); com sedação = não, o exame é "com via aérea
       * avançada, sem sedação" — vale, ⛔ só o item 10 é UN (instrução NIH).
       */
      const semSedacao = l.sedacao === "nao";
      const base: MarcaDoExame | undefined =
        l.avancada !== "sim" ? undefined
          : l.observado !== undefined && quando < l.observado ? "anterior_a_sedacao"
            : semSedacao ? "com_via_aerea_sem_sedacao"
              : l.observado === undefined ? "sem_referencia" : "sob_sedacao";
      const confundido = base === "sob_sedacao" || base === "sem_referencia";
      const marca: MarcaDoExame | undefined = confundido && suspensa === "sim" ? "sedacao_suspensa" : base;
      return { fatoId: f.id, total: f.valor as number, quando, marca, sedacaoSuspensa: suspensa, valeParaRegras: !confundido || suspensa === "sim" };
    });
}

export function examesNihss(estado: EstadoAvc): readonly ExameMarcado[] {
  return examesMarcados(estado, "nihss_calculado");
}

/** ⚠️ AC-78: a mesma marca no Glasgow. ⛔ Nenhuma leitura do Glasgow muda por ela. */
export function examesGlasgow(estado: EstadoAvc): readonly ExameMarcado[] {
  return examesMarcados(estado, "glasgow");
}

/** ⚠️ Instante de corte: o horário da via aérea avançada, se conhecido. */
export function horarioDaViaAereaAvancada(estado: EstadoAvc): number | undefined {
  const l = leituraDaViaAereaExterna(estado);
  return l.avancada === "sim" ? l.observado : undefined;
}

export function itensNihssSugeridosComoNaoTestaveis(estado: EstadoAvc): readonly string[] {
  if (leituraDaViaAereaExterna(estado).avancada !== "sim") return [];
  return Object.entries(ITENS_QUE_ACEITAM_NAO_TESTAVEL).filter(([, motivo]) => /intuba/i.test(motivo)).map(([id]) => id);
}
