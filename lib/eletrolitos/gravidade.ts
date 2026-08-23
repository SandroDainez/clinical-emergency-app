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
  /** `definicao` = afirmação do autor sobre o que a clínica é, não corte de diretriz. */
  forca?: "definicao";
  /** ⚠️ Quem assina a afirmação. Assinatura não substitui conferência. */
  declaradoPor?: string;
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

/**
 * ⚠️ DISTÚRBIO SEM ESCALA DE APRESENTAÇÃO.
 *
 * Três distúrbios repetiam o mesmo texto de sinais nos dois degraus, e a leitura
 * do autor (2026-08-23) foi que isso não era preguiça de quem escreveu — é a
 * clínica: eles NÃO TÊM apresentação própria que se agrave em degraus.
 *
 *   • hipo e hipercloremia são quase sempre MARCADORES, não doenças: o que
 *     importa é o distúrbio ácido-base e a causa. O paciente não tem "sintoma de
 *     cloro".
 *   • hiperfosfatemia aguda manifesta-se pelo que ela CAUSA — hipocalcemia
 *     sintomática e precipitação — não por si.
 *
 * Então o texto igual nos dois degraus estava factualmente certo e A TELA é que
 * estava errada: dois degraus sugerem uma escala de sintomas que não existe.
 * Aqui eles passam a ter UM degrau só, que diz isso.
 *
 * ⚠️ E NÃO SE INVENTOU SINTOMA PARA PREENCHER O DEGRAU QUE SAIU. É o R-97 outra
 * vez: buraco pede número, degrau vazio pede sintoma.
 */
export const SEM_ESCALA_DE_APRESENTACAO =
  "A gravidade aqui não muda a apresentação. O que muda a conduta é a causa e a velocidade de instalação";
export const SEM_ESCALA_HIPERFOSFATEMIA =
  "A gravidade aqui não muda a apresentação. O que muda a conduta é a causa, a velocidade de instalação e o cálcio associado";

export type DegrauDeGravidade = {
  rotulo: string;
  sinais: string;
  /** Vários cortes = qualquer um deles basta (OU). */
  cortes: CorteDeGravidade[];
  procedencia: ProcedenciaDeGravidade;
};

const PENDENTE = (alvo: string): ProcedenciaDeGravidade => ({ fonte: null, alvo });

/**
 * ⚠️ FORÇA `definicao`, DECLARADA PELO AUTOR — e pendente de conferência dele.
 * Não é corte de diretriz: é a afirmação de que NÃO EXISTE escala de
 * apresentação nesses três. Quem afirma assina.
 */
const DEFINICAO_DO_AUTOR: ProcedenciaDeGravidade = {
  fonte: null,
  forca: "definicao",
  declaradoPor: "Dr. Sandro Dainez, 2026-08-23",
  alvo: "afirmação de que não há escala de apresentação nestes três — confirmação do autor pendente, e nenhum sintoma foi inventado para preencher o degrau que saiu",
};

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
    // ⚠️ UM DEGRAU SÓ, de propósito — ver SEM_ESCALA_DE_APRESENTACAO.
    { rotulo: "Sem escala de apresentação", sinais: SEM_ESCALA_HIPERFOSFATEMIA, cortes: [{ tipo: "restante" }], procedencia: DEFINICAO_DO_AUTOR },
  ],
  hypochloremia: [
    // ⚠️ UM DEGRAU SÓ, de propósito — ver SEM_ESCALA_DE_APRESENTACAO.
    { rotulo: "Sem escala de apresentação", sinais: SEM_ESCALA_DE_APRESENTACAO, cortes: [{ tipo: "restante" }], procedencia: DEFINICAO_DO_AUTOR },
  ],
  hyperchloremia: [
    // ⚠️ UM DEGRAU SÓ, de propósito — ver SEM_ESCALA_DE_APRESENTACAO.
    { rotulo: "Sem escala de apresentação", sinais: SEM_ESCALA_DE_APRESENTACAO, cortes: [{ tipo: "restante" }], procedencia: DEFINICAO_DO_AUTOR },
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
