/**
 * QUAL CÁLCIO — o campo pergunta, e a tela usa o MESMO nos dois lugares.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O DEFEITO QUE ORIGINOU (medido em 2026-08-23)
 *
 * A tela pedia "Cálcio (mg/dL)", sem qualificar. E usava DOIS cálcios diferentes:
 *
 *   classificação de gravidade (< 7 → "Grave")  →  o valor BRUTO digitado
 *   cálculo da dose de gluconato                →  o AJUSTADO pela albumina
 *
 * As diretrizes que o autor adotou usam o **ajustado**. Ou seja: o corte da fonte
 * valia para um cálcio e a tela o aplicava no outro, dentro do mesmo card.
 *
 * ⚠️ E ISSO NÃO É SUTILEZA DE AUDITORIA — é erro clínico ativo na população do
 * app. Hipoalbuminemia é a regra em UTI (sepse, cirrose, desnutrição, terceiro
 * espaço), e nela o cálcio TOTAL cai sem que o cálcio biologicamente ativo caia:
 * é pseudo-hipocalcemia. Albumina 2,0 com cálcio total 7,0 dá ajustado ≈ 8,6 —
 * normal. A tela chamava esse paciente de "hipocalcemia grave" e o mandava para
 * gluconato EV, que tem risco próprio (necrose se extravasar, arritmia na
 * infusão rápida), num paciente já grave por outro motivo.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE PEDIR O IÔNICO É MELHOR QUE "CORRIGIR A FÓRMULA"
 *
 * A correção pela albumina é **notoriamente imprecisa no doente crítico** — que
 * é exatamente a população deste app. O iônico é padrão em UTI e **sai na
 * gasometria**, que o próprio módulo renal já manda colher: é sinergia, não
 * trabalho novo.
 *
 * ⚠️ MAS OS CORTES DO IÔNICO NÃO ESTÃO DECIDIDOS, e este arquivo não os inventa.
 * A escala é outra (mmol/L) e a decisão é do autor. Enquanto isso, escolher
 * iônico faz a tela DIZER que não classifica por número — em vez de aplicar
 * nele um corte que não é dele.
 */
export type TipoDeCalcio = "ionico" | "total" | "nao_sei";

export const CALCIO_PERGUNTA = "Qual cálcio você tem?";

export const CALCIO_OPCOES: { valor: TipoDeCalcio; rotulo: string }[] = [
  { valor: "ionico", rotulo: "Iônico" },
  { valor: "total", rotulo: "Total (com albumina)" },
  { valor: "nao_sei", rotulo: "Não sei — onde acho cada um?" },
];

/** O "não sei" ensina onde achar, em vez de escolher pelo médico. */
export const CALCIO_ONDE_ACHAR = [
  "IÔNICO: sai na GASOMETRIA — a mesma que este módulo já manda colher. Em UTI costuma ser padrão.",
  "TOTAL: sai na bioquímica de rotina. ⚠️ Para valer, precisa vir com a ALBUMINA da mesma coleta.",
  "Se tiver os dois, prefira o iônico: ele mede o cálcio biologicamente ativo, sem depender de correção.",
];

export const CALCIO_AJUSTE_E_APROXIMACAO =
  "⚠️ APROXIMAÇÃO: o cálcio total foi corrigido pela albumina. Essa correção é imprecisa no doente crítico — se houver cálcio iônico, ele decide.";

export const CALCIO_IONICO_SEM_CORTE =
  "⚠️ ESTE APP AINDA NÃO CLASSIFICA GRAVIDADE PELO CÁLCIO IÔNICO: a escala dele é outra (mmol/L) e os cortes não estão definidos aqui. Use o valor e o quadro clínico; a conduta abaixo não foi graduada por número.";

/**
 * O cálcio que a tela usa — UM SÓ, para gravidade e para dose.
 *
 * ⚠️ Devolve `null` quando não há valor utilizável para CLASSIFICAR: iônico
 * (sem cortes definidos) e total sem albumina informada. Null faz a tela dizer
 * o que falta, em vez de classificar com o número errado.
 */
export function calcioParaClassificar(args: {
  tipo: TipoDeCalcio;
  valor: number | null;
  albumina: number | null;
}): { valor: number | null; aviso: string | null } {
  const { tipo, valor, albumina } = args;
  if (valor == null) return { valor: null, aviso: null };
  if (tipo === "ionico") return { valor: null, aviso: CALCIO_IONICO_SEM_CORTE };
  // ⚠️ Sem albumina, o total NÃO vira ajustado por conta própria: o app usa o
  // total e diz que está usando o total. Fingir correção sem o dado dela é
  // pior que não corrigir, porque parece corrigido.
  if (albumina == null) {
    return { valor, aviso: "⚠️ CÁLCIO TOTAL SEM ALBUMINA: sem ela não há como corrigir, e o total isolado subestima ou superestima conforme a albuminemia. Informe a albumina da mesma coleta, ou use o iônico." };
  }
  return { valor: valor + 0.8 * (4 - albumina), aviso: CALCIO_AJUSTE_E_APROXIMACAO };
}
