/**
 * VIA AÉREA COMO CONDUTA EXTERNA — leitura (autor, 2026-09-13, 13ª rodada, opção A; A09).
 *
 * ⚠️ ESTADO REGISTRADO PELA EQUIPE, ⛔ e ⛔ não conduta do app. ⛔ Fármaco, dose ⛔ e parâmetro
 * ⛔ entram.
 *
 * ⚠️ Com via aérea definitiva = sim:
 *  · suporte ativo no cabeçalho ("intubado às HH:MM · sedação em curso");
 *  · eixo A em "intervenção registrada · reavaliação pendente" até nova medida da via
 *    aérea (fato do bloco A registrado depois do registro);
 *  · exame neurológico (NIHSS) anterior ao horário → "anterior à sedação — basal
 *    preservado"; posterior → "sob sedação — confundidor"; sem horário conhecido ⛔ se
 *    classifica (⛔ inventa basal);
 *  · o item de barreira à fala (UN por intubação, AC-01) é SUGERIDO — ⛔ nunca gravado.
 * ⚠️ «Não sei» em qualquer campo mantém pendência.
 *
 * ⚠️ Rótulo "intubado" só com tipo = intubação orotraqueal; ⛔ nos outros tipos o texto diz
 * "via aérea definitiva" (supraglótico ⛔ é intubação) — interpretação a confirmar.
 */
import { VIA_AEREA_A } from "../conteudo/superficie-a";
import { ITENS_QUE_ACEITAM_NAO_TESTAVEL } from "../../lib/nihss";
import { registrarFato, valorAtual, type EstadoAvc } from "./estado";
import type { Relogio } from "./relogio";
import type { Pendencia } from "./tipos";

type Ternario = "sim" | "nao" | "nao_sei";

export type RegistroDeViaAerea = {
  readonly definitiva?: Ternario;
  readonly tipo?: string;
  readonly observado?: number | "nao_sei";
  readonly quem?: string;
  readonly sedacao?: Ternario;
  readonly ventilacao?: Ternario;
};

export const TIPO_IOT = "Intubação orotraqueal";
const CAMPO = {
  definitiva: "va_definitiva",
  tipo: "va_tipo",
  hora: "va_hora",
  quem: "va_quem",
  sedacao: "va_sedacao",
  ventilacao: "va_ventilacao",
} as const;

export type LeituraDaViaAerea = {
  readonly registrada: boolean;
  readonly definitiva?: string;
  readonly tipo?: string;
  readonly observado?: number;
  readonly horaDesconhecida: boolean;
  readonly quem?: string;
  readonly sedacao?: string;
  readonly ventilacao?: string;
  readonly pendencias: readonly Pendencia[];
};

export type ParteDoSuporte = { readonly rotulo: string; readonly hora?: number };

export type ExameNihss = {
  readonly fatoId: string;
  readonly total: number;
  readonly quando: number;
  readonly marca?: "anterior_a_sedacao" | "sob_sedacao" | "sem_referencia";
};

export function registrarViaAereaExterna(estado: EstadoAvc, r: RegistroDeViaAerea, relogio: Relogio, chamadaId?: string): EstadoAvc {
  const inst = chamadaId === undefined ? {} : { instancia: chamadaId };
  let e = estado;
  if (r.definitiva !== undefined) e = registrarFato(e, { campo: CAMPO.definitiva, valor: r.definitiva, ...inst }, relogio);
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

/** ⚠️ Eixo A: nenhum fato do bloco da via aérea DEPOIS do registro de via aérea definitiva. */
export function intervencaoDeViaAereaPendente(estado: EstadoAvc): boolean {
  if (atual(estado, CAMPO.definitiva) !== "sim") return false;
  const registro = valorAtual(estado, CAMPO.definitiva);
  const indice = registro === undefined ? -1 : estado.fatos.indexOf(registro);
  /** ⚠️ Os campos do bloco vêm da constante de conteúdo — ⛔ do nome do card (independência da UI). */
  const bloco = new Set(VIA_AEREA_A.map((c) => c.id));
  return !estado.fatos.slice(indice + 1).some((f) => bloco.has(f.campo) && f.valor !== "nao_perguntado");
}

const PENDENCIA_DO_NAO_SEI: Readonly<Record<string, string>> = {
  va_definitiva: "Confirmar se há via aérea definitiva",
  va_tipo: "Confirmar o tipo de via aérea",
  va_hora: "Confirmar o horário da via aérea definitiva",
  va_sedacao: "Confirmar se há sedação em curso",
  va_ventilacao: "Confirmar se há ventilação mecânica",
};

export function leituraDaViaAereaExterna(estado: EstadoAvc): LeituraDaViaAerea {
  const valores = Object.fromEntries(Object.values(CAMPO).map((c) => [c, atual(estado, c)])) as Record<string, string | number | undefined>;
  const registrada = Object.values(valores).some((v) => v !== undefined);
  const hora = valores[CAMPO.hora];
  const pendencias: Pendencia[] = [];
  for (const [campo, rotulo] of Object.entries(PENDENCIA_DO_NAO_SEI)) {
    if (valores[campo] === "nao_sei") {
      pendencias.push({ id: `confirmar_${campo}`, rotulo, dono: "estabilizacao", campo, resolvePor: "Registrar a resposta quando for conhecida" });
    }
  }
  if (valores[CAMPO.definitiva] === "sim" && hora === undefined) {
    pendencias.push({ id: "confirmar_va_hora", rotulo: "Registrar o horário da via aérea definitiva", dono: "estabilizacao", campo: CAMPO.hora, resolvePor: "Registrar o horário observado" });
  }
  if (intervencaoDeViaAereaPendente(estado)) {
    pendencias.push({ id: "reavaliar_via_aerea", rotulo: "Reavaliar a via aérea depois da intervenção registrada", dono: "estabilizacao", campo: "consciencia_rebaixada", resolvePor: "Registrar nova avaliação da via aérea" });
  }
  return {
    registrada,
    definitiva: typeof valores[CAMPO.definitiva] === "string" ? String(valores[CAMPO.definitiva]) : undefined,
    tipo: typeof valores[CAMPO.tipo] === "string" ? String(valores[CAMPO.tipo]) : undefined,
    observado: typeof hora === "number" ? hora : undefined,
    horaDesconhecida: hora === "nao_sei",
    quem: typeof valores[CAMPO.quem] === "string" ? String(valores[CAMPO.quem]) : undefined,
    sedacao: typeof valores[CAMPO.sedacao] === "string" ? String(valores[CAMPO.sedacao]) : undefined,
    ventilacao: typeof valores[CAMPO.ventilacao] === "string" ? String(valores[CAMPO.ventilacao]) : undefined,
    pendencias,
  };
}

export function suporteAtivo(estado: EstadoAvc): readonly ParteDoSuporte[] {
  const l = leituraDaViaAereaExterna(estado);
  if (l.definitiva !== "sim") return [];
  const iot = l.tipo === TIPO_IOT;
  const partes: ParteDoSuporte[] = [
    l.observado !== undefined
      ? { rotulo: iot ? "intubado às" : "via aérea definitiva às", hora: l.observado }
      : { rotulo: iot ? (l.horaDesconhecida ? "intubado · horário desconhecido" : "intubado · horário não registrado") : (l.horaDesconhecida ? "via aérea definitiva · horário desconhecido" : "via aérea definitiva · horário não registrado") },
  ];
  if (l.sedacao === "sim") partes.push({ rotulo: "sedação em curso" });
  else if (l.sedacao === "nao_sei") partes.push({ rotulo: "sedação: não sei" });
  if (l.ventilacao === "sim") partes.push({ rotulo: "ventilação mecânica" });
  else if (l.ventilacao === "nao_sei") partes.push({ rotulo: "ventilação: não sei" });
  return partes;
}

/** ⚠️ Os NIHSS registrados (um por confirmação da escala), com a marca em relação à intubação. */
export function examesNihss(estado: EstadoAvc): readonly ExameNihss[] {
  const l = leituraDaViaAereaExterna(estado);
  const corrigidos = new Set(estado.fatos.map((f) => f.corrigeFatoId).filter((id) => id !== undefined));
  return estado.fatos
    .filter((f) => f.campo === "nihss_calculado" && typeof f.valor === "number" && !corrigidos.has(f.id))
    .map((f) => {
      const quando = f.horaClinica ?? f.horaRegistro;
      const marca: ExameNihss["marca"] =
        l.definitiva !== "sim" ? undefined
          : l.observado === undefined ? "sem_referencia"
            : quando < l.observado ? "anterior_a_sedacao" : "sob_sedacao";
      return { fatoId: f.id, total: f.valor as number, quando, marca };
    });
}

/** ⚠️ Instante de corte do basal: o horário da via aérea definitiva, se conhecido. */
export function horarioDaIntubacao(estado: EstadoAvc): number | undefined {
  const l = leituraDaViaAereaExterna(estado);
  return l.definitiva === "sim" ? l.observado : undefined;
}

export function itensNihssSugeridosComoNaoTestaveis(estado: EstadoAvc): readonly string[] {
  if (leituraDaViaAereaExterna(estado).definitiva !== "sim") return [];
  return Object.entries(ITENS_QUE_ACEITAM_NAO_TESTAVEL).filter(([, motivo]) => /intuba/i.test(motivo)).map(([id]) => id);
}
