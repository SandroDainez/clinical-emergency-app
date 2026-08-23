/**
 * OS NÚMEROS QUE ESTAVAM DENTRO DA FRASE — E POR ISSO TINHAM DUAS DONAS.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O DEFEITO (R-107, medido em 2026-08-23)
 *
 * `154 mEq/L`, `0,465 mEq/mL`, `8–10 mEq/L em 24 h` estavam escritos DENTRO de
 * frases traduzíveis. Cada uma dessas frases tem uma segunda cópia em espanhol,
 * escrita noutro momento — e a medição PT × ES daquele dia achou duas linhas em
 * que o espanhol dizia OUTRO critério clínico (D-80). Enquanto o número mora na
 * frase, ele tem duas donas e nada entre elas.
 *
 * Aqui o número vive UMA VEZ. A frase traduzível vira MOLDURA com `{0}`, e os
 * dois idiomas mostram o mesmo número por construção — não por revisão.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DUAS ESPÉCIES, E ELAS NÃO SE MISTURAM
 *
 *   `definicao`  — o que a solução CONTÉM. É química: 154 mEq/L de sódio no SF
 *                  0,9% não é conduta de ninguém, é o que está no frasco.
 *   `pendente`   — limite, velocidade e dose de referência. São CONDUTA, e
 *                  precisam de fonte como qualquer dose. Nenhuma tem hoje, e é
 *                  isso que o `alvo` declara.
 *
 * ⚠️ NENHUM NÚMERO MUDOU NA EXTRAÇÃO.
 */
export type ProcedenciaDeReferencia = {
  fonte: string | null;
  forca: "definicao" | "pendente";
  alvo: string;
};

const QUIMICA = (o: string): ProcedenciaDeReferencia => ({
  fonte: null,
  forca: "definicao",
  alvo: `composição declarada do produto — ${o}. Não é conduta: é o que está no frasco, e se conferir com a bula fecha`,
});
const PENDENTE = (alvo: string): ProcedenciaDeReferencia => ({ fonte: null, forca: "pendente", alvo });

export type ReferenciaNumerica = {
  /** Valor único, ou piso da faixa. */
  valor: number;
  /** Teto, quando é faixa. */
  ate?: number;
  unidade: string;
  procedencia: ProcedenciaDeReferencia;
};

/** "8–10 mEq/L" · "154 mEq/L" — a MESMA função para os dois idiomas. */
export function texto(r: ReferenciaNumerica): string {
  const n = (v: number) => String(v).replace(".", ",");
  return r.ate != null ? `${n(r.valor)}–${n(r.ate)} ${r.unidade}` : `${n(r.valor)} ${r.unidade}`;
}
/** Só o número, para a moldura que já traz a unidade escrita. */
export function numero(r: ReferenciaNumerica): string {
  const n = (v: number) => String(v).replace(".", ",");
  return r.ate != null ? `${n(r.valor)}–${n(r.ate)}` : n(r.valor);
}

// ── O QUE ESTÁ NO FRASCO ────────────────────────────────────────────────────
export const NACL_09_SODIO: ReferenciaNumerica = { valor: 154, unidade: "mEq/L", procedencia: QUIMICA("NaCl 0,9%") };
export const NACL_09_CLORETO: ReferenciaNumerica = { valor: 154, unidade: "mEq/L", procedencia: QUIMICA("NaCl 0,9% — o cloreto acompanha o sódio, 1:1") };
export const NACL_20_SODIO: ReferenciaNumerica = { valor: 3.42, unidade: "mEq/mL", procedencia: QUIMICA("NaCl 20%") };
export const GLUCONATO_10_CALCIO: ReferenciaNumerica = { valor: 0.465, unidade: "mEq/mL", procedencia: QUIMICA("gluconato de cálcio 10% — cálcio elementar") };
export const CLORETO_10_CALCIO: ReferenciaNumerica = { valor: 1.36, unidade: "mEq/mL", procedencia: QUIMICA("cloreto de cálcio 10% — cálcio elementar") };

/**
 * ⚠️ DERIVADOS, não escritos: meio-a-meio é metade do isotônico, e a razão
 * entre os dois sais de cálcio sai da divisão. Escrever "77" e "3×" à mão seria
 * criar a terceira cópia de um número que as duas primeiras já determinam.
 */
export const MEIO_A_MEIO_SODIO: ReferenciaNumerica = { valor: NACL_09_SODIO.valor / 2, unidade: "mEq/L", procedencia: QUIMICA("NaCl 0,45% — metade do isotônico") };
/**
 * ⚠️ DECLARADO, NÃO DERIVADO — e a diferença foi medida, não suposta.
 *
 * A divisão exata dá 1,36 / 0,465 ≈ **2,92**. O app dizia — e continua dizendo —
 * **3×**, que é o arredondamento clássico ("1 g de cloreto ≈ 3 g de gluconato").
 *
 * Na primeira versão desta extração eu derivei o número, e o texto da tela passou
 * de "~3×" para "~2,9×". `valida-eletrolitos` reprovou, e estava certa: derivar
 * ali não era mover conteúdo, era MUDAR conteúdo. O arredondamento é escolha do
 * autor e fica onde estava.
 *
 * A conferência de que os dois sais e o fator são coerentes continua sendo da
 * trava, contra a massa molar — não deste comentário.
 */
export const RAZAO_CLORETO_GLUCONATO = 3;
export const RAZAO_CLORETO_GLUCONATO_EXATA =
  Math.round((CLORETO_10_CALCIO.valor / GLUCONATO_10_CALCIO.valor) * 100) / 100;

// ── CONDUTA: TODAS PENDENTES DE FONTE ───────────────────────────────────────
export const LIMITE_CORRECAO_24H: ReferenciaNumerica = {
  valor: 8, ate: 10, unidade: "mEq/L",
  procedencia: PENDENTE("limite de variação do sódio em 24 h — alvo: diretriz europeia de hiponatremia (ESICM/ESE/ERA-EDTA 2014), verbatim em protocols/fontes-verbatim/"),
};
export const LIMITE_CORRECAO_HORA: ReferenciaNumerica = {
  valor: 0.5, unidade: "mEq/L/h",
  procedencia: PENDENTE("velocidade horária equivalente ao limite de 24 h — alvo: a MESMA fonte do limite de 24 h; ⚠️ e ela não é derivada dele (10/24 ≈ 0,42), então é número próprio e precisa de verbatim próprio"),
};
export const RESSUSCITACAO_CRISTALOIDE: ReferenciaNumerica = {
  valor: 500, ate: 1000, unidade: "mL",
  procedencia: PENDENTE("volume por etapa de ressuscitação com cristaloide — alvo: fonte primária a nomear pelo autor"),
};
export const UREIA_ORAL_SIADH: ReferenciaNumerica = {
  valor: 0.25, ate: 0.5, unidade: "g/kg/dia",
  procedencia: PENDENTE("ureia oral no SIADH — alvo: fonte primária a nomear pelo autor"),
};
export const VELOCIDADE_HIPOVOLEMICO: ReferenciaNumerica = {
  valor: 0.5, ate: 1, unidade: "mL/kg/h",
  procedencia: PENDENTE("velocidade de reposição no hipovolêmico sem neurogravidade — alvo: fonte primária a nomear pelo autor"),
};
export const D5W_AGUA_LIVRE: ReferenciaNumerica = {
  valor: 3, unidade: "mL/kg/h",
  procedencia: PENDENTE("D5W para repor água livre no resgate de sobrecorreção — alvo: fonte primária a nomear pelo autor"),
};

export const REFERENCIAS_DOS_ELETROLITOS: Record<string, ReferenciaNumerica> = {
  NACL_09_SODIO, NACL_09_CLORETO, NACL_20_SODIO, GLUCONATO_10_CALCIO, CLORETO_10_CALCIO,
  MEIO_A_MEIO_SODIO, LIMITE_CORRECAO_24H, LIMITE_CORRECAO_HORA, RESSUSCITACAO_CRISTALOIDE,
  UREIA_ORAL_SIADH, VELOCIDADE_HIPOVOLEMICO, D5W_AGUA_LIVRE,
};
