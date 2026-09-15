/**
 * CAMINHO HEMORRÁGICO — LEITURA (A07; autor, 2026-09-13, 15ª rodada).
 *
 * ⚠️ Abre com a saída "hemorragia" da imagem (TC com "Hemorragia intracraniana identificada").
 * ⛔ Suspeita de HSA sem hemorragia na imagem ⛔ abre.
 * ⚠️ Bloqueia a reperfusão isquêmica com motivo (o portão ⛔ a classe da EVT já retêm pela
 * imagem — `barreiraDeReperfusao`; aqui o bloqueio é DITO).
 * ⚠️ Complicação depois de trombólise iniciada: o mesmo caminho; com infusão em curso, a
 * pendência pede o registro da interrupção — ⛔ o app ⛔ grava sozinho um evento que a equipe
 * ⛔ fez.
 * ⛔ Nenhuma conduta sai daqui: condutas são "conteúdo pendente de validação" no conteúdo.
 */
import { RESULTADO_TC } from "../conteudo/superficie-c";
import { registrarComInstancia } from "../conteudo/campos";
import { estudos } from "./derivacoes-c";
import { certezaDaInstancia, exposicaoAoTrombolitico } from "./derivacoes-f";
import { valorAtual, type EstadoAvc } from "./estado";
import { fatosDaInstancia } from "./instancia";
import type { Relogio } from "./relogio";
import { itensSelecionados } from "./selecao";
import type { Pendencia } from "./tipos";

/** AC-13 reaberto, item 1: `desconhecida` quando não se sabe se houve trombólise. */
export type InfusaoNoCaminho = "sem_trombolise" | "desconhecida" | "em_curso" | "interrompida" | "concluida";

export type LeituraDoCaminhoHemorragico = {
  readonly ativo: boolean;
  readonly desde?: number;
  readonly tipo?: string;
  readonly anticoagulante?: { readonly campo: "anticoagulante_em_uso"; readonly itens: readonly string[] };
  readonly bloqueio?: { readonly ivt: true; readonly evt: true; readonly motivo: string };
  readonly infusao: InfusaoNoCaminho;
  readonly interrompidaEm?: number;
  readonly pendencias: readonly Pendencia[];
  /** ⚠️ 16ª rodada: as mesmas pendências, com rótulo curto — dentro do caminho o prefixo é redundante. */
  readonly pendenciasNoCaminho: readonly Pendencia[];
};

const ROTULO_NO_CAMINHO: Readonly<Record<string, string>> = {
  registrar_interrupcao_da_infusao: "Registrar a interrupção da infusão",
  hem_anticoagulante: "Registrar o anticoagulante em uso",
  hem_tipo: "Registrar o tipo de hemorragia",
};

const ROTULO_DO_TIPO: Readonly<Record<string, string>> = { nao_sei: "Não sei" };

function infusao(estado: EstadoAvc): { estado: InfusaoNoCaminho; instancia?: string; interrompidaEm?: number } {
  const x = exposicaoAoTrombolitico(estado);
  if (x.estado !== "exposta") return { estado: certezaDaInstancia(x) === "desconhecida" ? "desconhecida" : "sem_trombolise" };
  if (x.fase === "iniciada") return { estado: "em_curso", instancia: x.instancia };
  if (x.fase === "interrompida") {
    const f = [...fatosDaInstancia(estado, x.instancia)].reverse().find((y) => y.campo === "ivt_estado" && y.valor === "Interrompida");
    return { estado: "interrompida", instancia: x.instancia, interrompidaEm: f === undefined ? undefined : f.horaClinica ?? f.horaRegistro };
  }
  return { estado: "concluida", instancia: x.instancia };
}

export function caminhoHemorragico(estado: EstadoAvc): LeituraDoCaminhoHemorragico {
  const com = estudos(estado).filter((e) => e.resultado === RESULTADO_TC.hemorragia);
  const inf = infusao(estado);
  if (com.length === 0) return { ativo: false, infusao: inf.estado, pendencias: [], pendenciasNoCaminho: [] };

  const horas = com.map((e) => e.hora).filter((h): h is number => h !== undefined);
  const t = valorAtual(estado, "hem_tipo")?.valor;
  const tipo = typeof t === "string" && t !== "nao_perguntado" ? ROTULO_DO_TIPO[t] ?? t : undefined;
  const bruto = valorAtual(estado, "anticoagulante_em_uso")?.valor;
  const itens = typeof bruto === "string" && bruto !== "nao_perguntado" ? itensSelecionados(bruto) : [];

  const pendencias: Pendencia[] = [];
  if (inf.estado === "em_curso") {
    pendencias.push({ id: "registrar_interrupcao_da_infusao", rotulo: "Hemorragia com trombólise em curso: registrar a interrupção da infusão", dono: "destino", campo: "ivt_estado", resolvePor: "Registrar a interrupção da infusão" });
  }
  if (itens.length === 0) {
    pendencias.push({ id: "hem_anticoagulante", rotulo: "Hemorragia intracraniana (HIC): registrar o anticoagulante em uso", dono: "paciente", campo: "anticoagulante_em_uso", resolvePor: "Registrar o anticoagulante em uso no Paciente" });
  }
  if (tipo === undefined) {
    pendencias.push({ id: "hem_tipo", rotulo: "Hemorragia intracraniana (HIC): registrar o tipo de hemorragia", dono: "destino", campo: "hem_tipo", resolvePor: "Registrar o tipo de hemorragia" });
  }

  return {
    ativo: true,
    desde: horas.length > 0 ? Math.min(...horas) : undefined,
    tipo,
    anticoagulante: itens.length === 0 ? undefined : { campo: "anticoagulante_em_uso", itens },
    bloqueio: { ivt: true, evt: true, motivo: "Hemorragia intracraniana identificada na imagem: trombólise e trombectomia isquêmicas bloqueadas neste caminho" },
    infusao: inf.estado,
    interrompidaEm: inf.interrompidaEm,
    pendencias,
    pendenciasNoCaminho: pendencias.map((p) => ({ ...p, rotulo: ROTULO_NO_CAMINHO[p.id] ?? p.rotulo })),
  };
}

/** ⚠️ Registro da interrupção pela equipe, na trilha da trombólise ("Interrompida", com horário). */
export function registrarInterrupcaoDaInfusao(estado: EstadoAvc, observado: number, relogio: Relogio): EstadoAvc {
  const inf = infusao(estado);
  if (inf.estado !== "em_curso" || inf.instancia === undefined) return estado;
  return registrarComInstancia(estado, { campo: "ivt_estado", valor: "Interrompida", horaClinica: observado }, relogio, inf.instancia);
}
