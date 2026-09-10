/**
 * ⚠️⚠️⚠️ DOSE ⛔ OU CONCENTRAÇÃO — ⛔ e ⛔ « tem barra » ⛔ **⛔ não** decide.
 *
 * ── ⛔ O FALSO CONSERTO QUE ISTO DESFAZ — 2026-09-10 ────────────────────────
 *
 * ⛔ ⛔ Uma trava de tela ⛔ proibia dose inventada ⛔ com `\b\d+\s*mg\b`.
 * ⛔ Quando o degrau `+50` ⛔ passou a ficar colado ⛔ à unidade da glicemia,
 * ⛔ o texto ⛔ « 50mg/dL » ⛔ virou ⛔ falso positivo. ⛔ A correção que ⛔ eu
 * ⛔ tinha feito ⛔ foi ⛔ `(?!\/)` — ⛔ *"ignore o que tem barra"*.
 *
 * ⛔ ⛔ ⛔ **⛔ E ⛔ isso ⛔ apagaria ⛔ as doses ⛔ que ⛔ mais importam ⛔ neste
 * módulo**: ⛔ `alteplase 0,9 mg/kg`, ⛔ `tenecteplase 0,4 mg/kg`,
 * ⛔ `nitroprussiato mcg/kg/min`. ⚠️ ⛔ Um falso positivo ⛔ barulhento ⛔ trocado
 * ⛔ por ⛔ **⛔ um falso negativo ⛔ silencioso** — ⛔ que é ⛔ sempre ⛔ o pior
 * dos dois.
 *
 * ⚠️⚠️ ⛔ O que separa ⛔ os dois ⛔ é ⛔ **⛔ o denominador**:
 *
 *   ⛔ `mg/dL`, `mg/mL`, `mg/L`, `mcg/mL` ⛔ → ⛔ massa ⛔ por ⛔ **⛔ volume**
 *     ⛔ = ⛔ CONCENTRAÇÃO. ⛔ Nunca ⛔ é ⛔ dose.
 *   ⛔ `mg`, `mg/kg`, `mcg/kg`, `mcg/kg/min`, `mg/kg/h`, `mg/min` ⛔ → ⛔ massa
 *     ⛔ pura ⛔ ou ⛔ por ⛔ **⛔ peso/tempo** ⛔ = ⛔ DOSE.
 *
 * ⛔ ⛔ Por isso ⛔ isto é ⛔ **⛔ tabela**, ⛔ e ⛔ não regex empilhada: ⛔ quem
 * acrescentar ⛔ uma unidade ⛔ nova ⛔ acrescenta ⛔ **⛔ numa lista nomeada**,
 * ⛔ e ⛔ a classificação ⛔ segue ⛔ dizendo ⛔ o que quer dizer.
 */

/** ⚠️ Massas que podem abrir uma dose. */
export const UNIDADES_DE_MASSA = ["mg", "mcg", "µg", "g", "UI"] as const;

/**
 * ⚠️⚠️ ⛔ DENOMINADOR DE **VOLUME** ⛔ — ⛔ é o que faz de uma massa ⛔ uma
 * concentração. ⛔ `dL` de glicemia, ⛔ `mL` de solução, ⛔ `L` de gasometria.
 */
export const DENOMINADORES_DE_CONCENTRACAO = ["dl", "ml", "l", "cl"] as const;

/**
 * ⚠️⚠️ ⛔ DENOMINADOR DE **PESO OU TEMPO** ⛔ — ⛔ a dose continua dose ⛔ depois
 * dele. ⛔ `kg` normaliza por paciente; ⛔ `min`, `h`, `dia` ⛔ por tempo.
 */
export const DENOMINADORES_DE_DOSE = ["kg", "min", "h", "hora", "dia", "d", "m2"] as const;

export type ClasseDaUnidade = "dose" | "concentracao" | "desconhecida";

/**
 * ⚠️ Classifica ⛔ uma unidade escrita ⛔ como o médico a lê: `mg`, `mg/kg`,
 * `mcg/kg/min`, `mg/dL`.
 *
 * ⛔ ⛔ `desconhecida` ⛔ **⛔ não** é ⛔ « ignore »: ⛔ é ⛔ *"⛔ ninguém decidiu
 * ainda"*, ⛔ e ⛔ quem consome ⛔ escolhe ⛔ o lado seguro. ⛔ Aqui ⛔ o lado
 * seguro ⛔ é ⛔ **⛔ tratar como dose** — ⛔ uma trava que ⛔ erra ⛔ para o
 * ⛔ barulho ⛔ é ⛔ recuperável; ⛔ para o silêncio, ⛔ não.
 */
export function classificarUnidade(unidade: string): ClasseDaUnidade {
  const limpa = unidade.trim().toLowerCase().replace(/\s+/g, "");
  const [massa, ...denominadores] = limpa.split("/");
  if (!UNIDADES_DE_MASSA.some((m) => m.toLowerCase() === massa)) {
    return "desconhecida";
  }
  if (denominadores.length === 0) {
    return "dose";
  }
  /** ⚠️ ⛔ Quem manda é o PRIMEIRO denominador: `mcg/kg/min` é dose por peso. */
  const primeiro = denominadores[0];
  if (DENOMINADORES_DE_CONCENTRACAO.some((d) => d === primeiro)) {
    return "concentracao";
  }
  if (DENOMINADORES_DE_DOSE.some((d) => d === primeiro)) {
    return "dose";
  }
  return "desconhecida";
}

const MASSAS = UNIDADES_DE_MASSA.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
const DENOMINADOR = "[a-zµ²0-9]+";

/**
 * ⚠️⚠️ ⛔ A EXPRESSÃO É **⛔ DERIVADA DAS TABELAS**, ⛔ e ⛔ não redigitada.
 *
 * ⛔ Ela acha ⛔ *"número + massa (+ denominadores)"*; ⛔ quem decide ⛔ se
 * aquilo ⛔ é dose ⛔ é ⛔ `classificarUnidade`, ⛔ em `dosesNoTexto`.
 */
const RE_QUANTIDADE = new RegExp(
  `(\\d+(?:[.,]\\d+)?)\\s*((?:${MASSAS})(?:\\s*/\\s*${DENOMINADOR})*)`,
  "gi"
);

/**
 * ⚠️ Devolve ⛔ as DOSES ⛔ encontradas num texto — ⛔ e ⛔ **⛔ só** elas.
 * ⛔ Concentração ⛔ fica de fora ⛔ por classificação, ⛔ e ⛔ não ⛔ por
 * ⛔ « tem barra ».
 */
export function dosesNoTexto(texto: string): string[] {
  const achadas: string[] = [];
  for (const m of texto.matchAll(RE_QUANTIDADE)) {
    if (classificarUnidade(m[2]) !== "concentracao") {
      achadas.push(`${m[1]} ${m[2].replace(/\s+/g, "")}`);
    }
  }
  return achadas;
}
