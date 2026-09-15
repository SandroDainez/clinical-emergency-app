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
import { RESULTADOS_COM_HEMORRAGIA } from "../conteudo/superficie-c";
import { TIPO_LEGADO_SUBARACNOIDEA } from "../conteudo/caminho-hemorragico";
import { registrarComInstancia } from "../conteudo/campos";
import { destinoDaImagem, estudos } from "./derivacoes-c";
import { certezaDaInstancia, exposicaoAoTrombolitico, exposicoesPorInstancia } from "./derivacoes-f";
import { valorAtual, type EstadoAvc } from "./estado";
import { fatosDaInstancia } from "./instancia";
import { idsInvalidadosPorCorrecao } from "./transicoes-da-acao";
import { horarioClinicoDaTransicao } from "./horario-clinico";
import type { Relogio } from "./relogio";
import { itensSelecionados } from "./selecao";
import type { Pendencia } from "./tipos";

/** AC-13 reaberto, item 1: `desconhecida` quando não se sabe se houve trombólise. */
export type InfusaoNoCaminho = "sem_trombolise" | "desconhecida" | "em_curso" | "interrompida" | "concluida";

export type LeituraDoCaminhoHemorragico = {
  readonly ativo: boolean;
  /** ⚠️ AC-15 bloco D (E9): «hsa» quando a hemorragia vista é HSA confirmada — o caminho ⛔ se chama «HIC». */
  readonly nome?: "hic" | "hsa";
  readonly desde?: number;
  readonly tipo?: string;
  readonly anticoagulante?: { readonly campo: "anticoagulante_em_uso"; readonly itens: readonly string[] };
  readonly bloqueio?: { readonly ivt: true; readonly evt: true; readonly motivo: string };
  readonly infusao: InfusaoNoCaminho;
  readonly interrompidaEm?: number;
  /** AC-13 reaberto, item 3: o estado documental da hora da interrupção. Sem hora clínica, não há hora. */
  readonly horarioDaInterrupcao?: "conhecido" | "desconhecido" | "nao_informado";
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

function infusao(estado: EstadoAvc): {
  estado: InfusaoNoCaminho;
  instancia?: string;
  interrompidaEm?: number;
  horarioDaInterrupcao?: "conhecido" | "desconhecido" | "nao_informado";
} {
  const x = exposicaoAoTrombolitico(estado);
  if (x.estado !== "exposta") return { estado: certezaDaInstancia(x) === "desconhecida" ? "desconhecida" : "sem_trombolise" };
  if (x.fase === "iniciada") return { estado: "em_curso", instancia: x.instancia };
  if (x.fase === "interrompida") {
    const doCampo = fatosDaInstancia(estado, x.instancia).filter((y) => y.campo === "ivt_estado");
    const invalidados = idsInvalidadosPorCorrecao(doCampo);
    const f = [...doCampo].reverse().find((y) => y.valor === "Interrompida" && !invalidados.has(y.id));
    /**
     * AC-13 reaberto, item 3: a hora da interrupção é só a clínica. Ausente ou desconhecida, fica assim; o horário do
     * registro continua na trilha, para auditoria.
     */
    const h = f === undefined ? ({ tipo: "nao_informado" } as const) : horarioClinicoDaTransicao(estado, f);
    return {
      estado: "interrompida",
      instancia: x.instancia,
      interrompidaEm: h.tipo === "conhecido" ? h.ms : undefined,
      horarioDaInterrupcao: h.tipo === "conhecido" ? "conhecido" : h.tipo === "desconhecido_declarado" ? "desconhecido" : "nao_informado",
    };
  }
  return { estado: "concluida", instancia: x.instancia };
}

/**
 * ⚠️⚠️ ARQ-APOIO-01 F2 · AP-5 (autor, 2026-09-15): a ORDEM entre a administração do trombolítico e a hemorragia.
 *
 * > *"«Apesar de bloqueio» só cabe se o bloqueio já existia no momento da administração."*
 *
 * ⚠️ Só o que os horários registrados PROVAM:
 *  · `apesar_de_bloqueio` — o resultado com hemorragia já estava registrado quando alguma administração começou;
 *  · `hemorragia_posterior` — toda imagem com hemorragia foi adquirida depois do início de toda administração (a
 *    hemorragia não pode ter sido vista antes de a imagem existir);
 *  · `indeterminada` — qualquer outro caso, inclusive início ou aquisição sem horário. ⛔ Nunca se escolhe um lado.
 * ⛔ `undefined` sem hemorragia ⛔ ou sem administração com exposição.
 */
export type SequenciaDaAdministracao = "apesar_de_bloqueio" | "hemorragia_posterior" | "indeterminada";

export function sequenciaDaAdministracaoComHemorragia(estado: EstadoAvc): SequenciaDaAdministracao | undefined {
  const com = estudos(estado).filter((e) => e.resultado !== undefined && RESULTADOS_COM_HEMORRAGIA.includes(e.resultado));
  const expostas = exposicoesPorInstancia(estado).flatMap((x) => (x.estado === "exposta" ? [x] : []));
  if (com.length === 0 || expostas.length === 0) return undefined;
  const inicios = expostas.map((x) => (x.inicio.tipo === "conhecido" ? x.inicio.ms : undefined));
  const registros = com.map((e) => e.resultadoRegistradoEm).filter((h): h is number => typeof h === "number");
  if (registros.length > 0) {
    const achadoRegistrado = Math.min(...registros);
    if (inicios.some((i) => i !== undefined && i >= achadoRegistrado)) return "apesar_de_bloqueio";
  }
  const aquisicoes = com.map((e) => e.hora);
  if (inicios.every((i): i is number => i !== undefined) && aquisicoes.every((h): h is number => h !== undefined)) {
    if (Math.min(...(aquisicoes as number[])) > Math.max(...(inicios as number[]))) return "hemorragia_posterior";
  }
  return "indeterminada";
}

export function caminhoHemorragico(estado: EstadoAvc): LeituraDoCaminhoHemorragico {
  const com = estudos(estado).filter((e) => e.resultado !== undefined && RESULTADOS_COM_HEMORRAGIA.includes(e.resultado));
  const inf = infusao(estado);
  if (com.length === 0) return { ativo: false, infusao: inf.estado, pendencias: [], pendenciasNoCaminho: [] };

  const horas = com.map((e) => e.hora).filter((h): h is number => h !== undefined);
  const ehHsa = destinoDaImagem(estado)?.saida === "hsa_confirmada";
  const t = valorAtual(estado, "hem_tipo")?.valor;
  const registrado = typeof t === "string" && t !== "nao_perguntado" ? ROTULO_DO_TIPO[t] ?? t : undefined;
  const tipo = ehHsa ? TIPO_LEGADO_SUBARACNOIDEA : registrado;
  const bruto = valorAtual(estado, "anticoagulante_em_uso")?.valor;
  const itens = typeof bruto === "string" && bruto !== "nao_perguntado" ? itensSelecionados(bruto) : [];

  const pendencias: Pendencia[] = [];
  if (inf.estado === "em_curso") {
    pendencias.push({ id: "registrar_interrupcao_da_infusao", rotulo: "Hemorragia com trombólise em curso: registrar a interrupção da infusão", dono: "destino", campo: "ivt_estado", resolvePor: "Registrar a interrupção da infusão" });
  }
  if (itens.length === 0) {
    pendencias.push({ id: "hem_anticoagulante", rotulo: ehHsa ? "Hemorragia subaracnóidea (HSA): registrar o anticoagulante em uso" : "Hemorragia intracraniana (HIC): registrar o anticoagulante em uso", dono: "paciente", campo: "anticoagulante_em_uso", resolvePor: "Registrar o anticoagulante em uso no Paciente" });
  }
  if (tipo === undefined) {
    pendencias.push({ id: "hem_tipo", rotulo: "Hemorragia intracraniana (HIC): registrar o tipo de hemorragia", dono: "destino", campo: "hem_tipo", resolvePor: "Registrar o tipo de hemorragia" });
  }

  return {
    ativo: true,
    nome: ehHsa ? "hsa" : "hic",
    desde: horas.length > 0 ? Math.min(...horas) : undefined,
    tipo,
    anticoagulante: itens.length === 0 ? undefined : { campo: "anticoagulante_em_uso", itens },
    bloqueio: { ivt: true, evt: true, motivo: "Hemorragia intracraniana identificada na imagem: trombólise e trombectomia isquêmicas bloqueadas neste caminho" },
    infusao: inf.estado,
    interrompidaEm: inf.interrompidaEm,
    horarioDaInterrupcao: inf.horarioDaInterrupcao,
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
