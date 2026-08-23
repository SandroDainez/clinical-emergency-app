/**
 * A CLASSIFICAÇÃO DE GRAVIDADE DOS DISTÚRBIOS ELETROLÍTICOS — COMO DADO.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE SAIU DO COMPONENTE
 *
 * Isto era um `switch` de 168 linhas dentro de
 * `components/protocol-screen/electrolyte-calculator-screen.tsx`, com 25 cortes
 * numéricos escritos no meio de JSX. Cada corte (`current < 120`, `>= 160`,
 * `< 2,5`) é uma AFIRMAÇÃO CLÍNICA: diz onde começa "grave". Enquanto morava no
 * componente, não tinha onde declarar procedência, nenhum instrumento a
 * enxergava, e mudá-la era editar código de tela.
 *
 * ⚠️ NENHUM NÚMERO MUDOU NA EXTRAÇÃO. Mover conteúdo não decide conteúdo — os 25
 * cortes estão aqui exatamente como estavam lá, e a trava
 * `valida-gravidade-eletrolitica.cjs` compara os dois estados.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A PROCEDÊNCIA
 *
 * ⚠️ AS 24 AFIRMAÇÕES ESTÃO PENDENTES DE FONTE, e é isso que o campo diz. Elas
 * nunca passaram por fonte enquanto eram código de tela; passar a ser dado não
 * as confere — só cria O LUGAR onde a conferência vai caber. Pendência nomeada
 * é diferente de campo em branco: em branco ninguém sabe que falta.
 */
import { K_GRAVE } from "../hipercalemia";

export type DisturbioEletrolitico =
  | "hyponatremia" | "hypernatremia" | "hypokalemia" | "hyperkalemia"
  | "hypocalcemia" | "hypercalcemia" | "hypomagnesemia" | "hypermagnesemia"
  | "hypophosphatemia" | "hyperphosphatemia" | "hypochloremia" | "hyperchloremia";

export type ProcedenciaDeGravidade = {
  /** Documento que sustenta o corte. `null` enquanto a pendência estiver aberta. */
  fonte: string | null;
  /** ⚠️ Alvo NOMEADO da pendência — nunca vazio, nunca "a conferir". */
  alvo: string;
};

export type CorteDeGravidade =
  | { tipo: "abaixoDe"; valor: number }
  | { tipo: "aPartirDe"; valor: number }
  | { tipo: "acimaDe"; valor: number }
  /** O ECG alterado sozinho sobe o degrau, sem número. */
  | { tipo: "ecgAlterado" }
  /** Degrau de base: vale quando nenhum corte acima casou. */
  | { tipo: "restante" };

export type DegrauDeGravidade = {
  rotulo: string;
  sinais: string;
  /** Vários cortes = qualquer um deles basta (OU). */
  cortes: CorteDeGravidade[];
  procedencia: ProcedenciaDeGravidade;
};

const PENDENTE = (alvo: string): ProcedenciaDeGravidade => ({ fonte: null, alvo });

const P_NA = PENDENTE("limiar de hiponatremia grave — alvo: diretriz europeia de hiponatremia (ESICM/ESE/ERA-EDTA 2014), verbatim em protocols/fontes-verbatim/");
const P_NA_ALTA = PENDENTE("limiar de hipernatremia grave — alvo: fonte primária a nomear pelo autor");
const P_K_BAIXO = PENDENTE("limiar de hipocalemia grave — alvo: fonte primária a nomear pelo autor");
const P_K_ALTO = PENDENTE("limiar já vem de lib/hipercalemia.ts (K_GRAVE); a procedência do NÚMERO segue lá, esta linha só o consome");
const P_CA = PENDENTE("limiares de cálcio — alvo: fonte primária a nomear pelo autor");
const P_MG = PENDENTE("limiares de magnésio — alvo: fonte primária a nomear pelo autor");
const P_P = PENDENTE("limiares de fósforo — alvo: fonte primária a nomear pelo autor");
const P_CL = PENDENTE("limiares de cloro — alvo: fonte primária a nomear pelo autor");

export const AGUARDANDO_VALOR = {
  rotulo: "Aguardando valor",
  sinais: "Preencha o valor atual para classificar gravidade e destacar sinais principais.",
};

export const GRAVIDADE_POR_DISTURBIO: Record<DisturbioEletrolitico, DegrauDeGravidade[]> = {
  hyponatremia: [
    { rotulo: "Grave", sinais: "Maior risco de confusão, sonolência, convulsão e herniação iminente se queda for aguda.", cortes: [{ tipo: "abaixoDe", valor: 120 }], procedencia: P_NA },
    { rotulo: "Leve a moderada", sinais: "Costuma cursar com náusea, cefaleia, mal-estar e alteração neurológica mais discreta.", cortes: [{ tipo: "restante" }], procedencia: P_NA },
  ],
  hypernatremia: [
    { rotulo: "Grave", sinais: "Sede intensa, letargia, irritabilidade, mioclonia e convulsão; monitorização próxima.", cortes: [{ tipo: "aPartirDe", valor: 160 }], procedencia: P_NA_ALTA },
    { rotulo: "Leve a moderada", sinais: "Sede, fraqueza, irritabilidade e desidratação são os achados mais comuns.", cortes: [{ tipo: "restante" }], procedencia: P_NA_ALTA },
  ],
  hypokalemia: [
    { rotulo: "Grave", sinais: "Fraqueza importante, íleo, paralisia, rabdomiólise e arritmia.", cortes: [{ tipo: "abaixoDe", valor: 2.5 }], procedencia: P_K_BAIXO },
    { rotulo: "Leve a moderada", sinais: "Cãibras, fraqueza, poliúria e palpitação são mais prováveis.", cortes: [{ tipo: "restante" }], procedencia: P_K_BAIXO },
  ],
  hyperkalemia: [
    // ⚠️ DOIS GATILHOS, E O SEGUNDO NÃO É NÚMERO: o ECG alterado sozinho sobe o
    // degrau para emergência, com qualquer valor de potássio.
    { rotulo: "Emergência", sinais: "Bradicardia, QRS alargado, bloqueios e risco de parada elétrica.", cortes: [{ tipo: "aPartirDe", valor: K_GRAVE }, { tipo: "ecgAlterado" }], procedencia: P_K_ALTO },
    { rotulo: "Moderada", sinais: "Fraqueza, parestesias e progressão elétrica se o potássio continuar subindo.", cortes: [{ tipo: "restante" }], procedencia: P_K_ALTO },
  ],
  hypocalcemia: [
    { rotulo: "Grave", sinais: "Tetania, broncoespasmo, convulsão e QT longo.", cortes: [{ tipo: "abaixoDe", valor: 7 }], procedencia: P_CA },
    { rotulo: "Leve a moderada", sinais: "Parestesia perioral, câimbras e desconforto neuromuscular.", cortes: [{ tipo: "restante" }], procedencia: P_CA },
  ],
  hypercalcemia: [
    { rotulo: "Grave", sinais: "Encefalopatia, desidratação importante, disfunção renal e maior chance de UTI.", cortes: [{ tipo: "aPartirDe", valor: 14 }], procedencia: P_CA },
    { rotulo: "Leve a moderada", sinais: "Náusea, constipação, poliúria e fadiga predominam.", cortes: [{ tipo: "restante" }], procedencia: P_CA },
  ],
  hypomagnesemia: [
    { rotulo: "Grave", sinais: "QT longo, torsades, tremor, tetania e convulsão.", cortes: [{ tipo: "abaixoDe", valor: 1.2 }], procedencia: P_MG },
    { rotulo: "Leve a moderada", sinais: "Tremor, fraqueza e piora de hipocalemia refratária.", cortes: [{ tipo: "restante" }], procedencia: P_MG },
  ],
  hypermagnesemia: [
    { rotulo: "Grave", sinais: "Hiporreflexia, sonolência, hipotensão e depressão respiratória.", cortes: [{ tipo: "aPartirDe", valor: 4.9 }], procedencia: P_MG },
    { rotulo: "Moderada", sinais: "Rubor, letargia e reflexos diminuídos podem aparecer.", cortes: [{ tipo: "restante" }], procedencia: P_MG },
  ],
  hypophosphatemia: [
    { rotulo: "Grave", sinais: "Fraqueza diafragmática, insuficiência respiratória, rabdomiólise e hemólise.", cortes: [{ tipo: "abaixoDe", valor: 1 }], procedencia: P_P },
    { rotulo: "Leve a moderada", sinais: "Fraqueza e queda de performance muscular são os sinais mais prováveis.", cortes: [{ tipo: "restante" }], procedencia: P_P },
  ],
  hyperphosphatemia: [
    // ⚠️ AQUI OS SINAIS SÃO OS MESMOS NOS DOIS DEGRAUS — era assim no componente,
    // e continuou. Só o rótulo muda com o corte.
    { rotulo: "Importante", sinais: "Muitas vezes o quadro aparece como hipocalcemia associada: parestesia, tetania e QT longo.", cortes: [{ tipo: "acimaDe", valor: 6 }], procedencia: P_P },
    { rotulo: "Moderada", sinais: "Muitas vezes o quadro aparece como hipocalcemia associada: parestesia, tetania e QT longo.", cortes: [{ tipo: "restante" }], procedencia: P_P },
  ],
  hypochloremia: [
    { rotulo: "Importante", sinais: "Pistas de alcalose metabólica: hipoventilação, fraqueza, parestesia e hipocalemia associada.", cortes: [{ tipo: "abaixoDe", valor: 95 }], procedencia: P_CL },
    { rotulo: "Moderada", sinais: "Pistas de alcalose metabólica: hipoventilação, fraqueza, parestesia e hipocalemia associada.", cortes: [{ tipo: "restante" }], procedencia: P_CL },
  ],
  hyperchloremia: [
    { rotulo: "Importante", sinais: "Taquipneia compensatória, acidose metabólica e piora renal se a carga de cloro persistir.", cortes: [{ tipo: "aPartirDe", valor: 115 }], procedencia: P_CL },
    { rotulo: "Moderada", sinais: "Taquipneia compensatória, acidose metabólica e piora renal se a carga de cloro persistir.", cortes: [{ tipo: "restante" }], procedencia: P_CL },
  ],
};

function casa(corte: CorteDeGravidade, valor: number, ecgAlterado: boolean): boolean {
  switch (corte.tipo) {
    case "abaixoDe": return valor < corte.valor;
    case "aPartirDe": return valor >= corte.valor;
    case "acimaDe": return valor > corte.valor;
    case "ecgAlterado": return ecgAlterado;
    case "restante": return true;
  }
}

/**
 * O degrau que vale — PRIMEIRO que casa, e é por isso que a ordem da lista
 * importa: o mais grave vem primeiro, o `restante` por último.
 *
 * ⚠️ Distúrbio sem entrada devolve `null` em vez de chutar um degrau. Um
 * eletrólito novo que ninguém classificou não é "moderado" por omissão.
 */
export function degrauDeGravidade(
  disturbio: string,
  valorAtual: number | null,
  ecgAlterado = false
): DegrauDeGravidade | null {
  if (valorAtual == null) return null;
  const degraus = GRAVIDADE_POR_DISTURBIO[disturbio as DisturbioEletrolitico];
  if (!degraus) return null;
  return degraus.find((d) => d.cortes.some((c) => casa(c, valorAtual, ecgAlterado))) ?? null;
}
