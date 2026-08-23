/**
 * A CONVERSÃO DE UNIDADE MORA AQUI — com o fator visível.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * COMO A DIVERGÊNCIA NASCEU (medida em 2026-08-23)
 *
 * Alguém leu "1,9 mmol/L" na diretriz, converteu de cabeça, arredondou para 7 e
 * digitou `< 7`. **A conta ficou fora do repositório** — e por isso ninguém a
 * conferiu por meses. O valor certo era ≈ 7,62 mg/dL, e a faixa 7,00–7,62 ficou
 * classificada como "leve a moderada" onde a fonte dizia GRAVE (D-90).
 *
 * A regra que saiu disso, e vale para os doze distúrbios:
 *
 *   **O valor é armazenado na unidade ORIGINAL DA FONTE e convertido
 *   programaticamente para exibição.**
 *
 * No dia em que a fonte mudar, muda-se **um número, na unidade em que ela
 * escreve** — e a conta continua no repositório, conferível.
 */
export type UnidadeDeConcentracao = "mg/dL" | "mmol/L" | "mEq/L";

/**
 * mg/dL por 1 mmol/L, e o fator é o PESO ATÔMICO ÷ 10.
 *
 * ⚠️ A VALÊNCIA NÃO ENTRA AQUI. Cálcio é 2+, e mesmo assim o fator é 40,08 ÷ 10:
 * a conversão é de MASSA para MASSA. A valência entraria em mEq/L, que não é a
 * unidade de nenhum destes cortes — e confundir as duas é como se dobra um
 * número de cálcio por engano.
 *
 * ⚠️ SÓ ENTRA O QUE É USADO. Fator declarado e não consumido é número solto à
 * espera de ser copiado para o lugar errado.
 */
export const MG_DL_POR_MMOL_L = {
  /** Cálcio — peso atômico 40,08 */
  calcio: 40.08 / 10,
  /**
   * Fósforo — peso atômico 30,97.
   *
   * ⚠️ Entrou em 2026-08-23 sem mudar UMA classificação: o app guardava
   * `< 1 mg/dL` e o consenso diz `< 0,32 mmol/L`, que dá 0,99 — a conversão já
   * estava certa. O que mudou foi a conta SAIR DA CABEÇA DE QUEM ESCREVEU e
   * entrar no repositório, para quem reler a fonte amanhã poder conferir.
   */
  fosforo: 30.97 / 10,
} as const;

export type Analito = keyof typeof MG_DL_POR_MMOL_L;

/**
 * ⚠️ Devolve `null` quando não sabe converter, em vez de devolver o número sem
 * converter. Número que atravessa a conversão intacto é indistinguível de número
 * convertido — e essa indistinção é exatamente o defeito da D-90.
 */
export function converter(
  valor: number,
  de: UnidadeDeConcentracao,
  para: UnidadeDeConcentracao,
  analito: Analito
): number | null {
  if (de === para) return valor;
  const fator = MG_DL_POR_MMOL_L[analito];
  if (fator == null) return null;
  if (de === "mmol/L" && para === "mg/dL") return valor * fator;
  if (de === "mg/dL" && para === "mmol/L") return valor / fator;
  return null;
}

/** "7,6 mg/dL" — o texto derivado, nunca escrito à mão. */
export function textoConvertido(
  valor: number,
  de: UnidadeDeConcentracao,
  para: UnidadeDeConcentracao,
  analito: Analito,
  casas = 1
): string | null {
  const v = converter(valor, de, para, analito);
  if (v == null) return null;
  return `${v.toFixed(casas).replace(".", ",")} ${para}`;
}
