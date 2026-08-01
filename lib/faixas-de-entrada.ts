/**
 * Faixas de ENTRADA dos campos numéricos dos fluxos.
 *
 * ── O PROBLEMA QUE ISTO RESOLVE ──────────────────────────────────────────────
 *
 * A barra de arrastar dos campos numéricos derivava o mínimo e o máximo dos
 * PRESETS do próprio campo. Como os presets são valores curados pelo protocolo
 * — peso 50, 60, 70, 80, 90, 100 —, o slider ia de 50 a 100 kg e nada além.
 *
 * Na prática isso deixava fora do alcance do controle rápido:
 *   • a senhora de 45 kg e o paciente de 120 kg (peso comanda dose em 8 módulos)
 *   • a sepse com PAS 60, porque o slider começava em 70
 *   • a SpO₂ de 100%, porque o slider parava em 98
 *   • a hipoglicemia de 30 mg/dL, porque o slider começava em 50
 *   • o NIHSS acima de 25, numa escala que vai a 42
 *
 * O campo "Outro…" sempre existiu e permitia digitar qualquer valor, então
 * nenhum número era realmente inatingível — mas o caminho rápido, que é o que
 * se usa de luva e com o paciente na maca, não chegava lá. O slider foi pedido
 * justamente para não ter que digitar.
 *
 * ── O QUE ESTES NÚMEROS SÃO E O QUE NÃO SÃO ──────────────────────────────────
 *
 * São LIMITES DE ENTRADA: existem para que o médico consiga alcançar qualquer
 * valor plausível arrastando, e para barrar digitação absurda (peso 7000).
 *
 * NÃO são limites clínicos, não são faixas de normalidade e não são critérios
 * de gravidade. Nenhum destes números deve ser lido como recomendação. Um valor
 * dentro da faixa não é "normal"; é apenas digitável.
 *
 * Por isso são deliberadamente generosos: sempre mais largos que o extremo
 * clínico plausível no adulto, porque o custo de uma faixa larga demais é zero
 * e o de uma faixa estreita demais é o médico não conseguir registrar o
 * paciente que tem na frente.
 *
 * Os PRESETS continuam sendo o toque mais rápido e não mudam — a barra é para
 * o que está entre eles e fora deles.
 */

export type FaixaDeEntrada = {
  min: number;
  max: number;
  /** Incremento do slider e dos botões −/+. */
  passo: number;
  /** Unidade esperada — serve de conferência contra o campo do fluxo. */
  unidade: string;
};

/**
 * Indexada pelo `id` do campo nas árvores de decisão. O app é de ADULTO — as
 * faixas refletem isso e não servem para pediatria.
 */
export const FAIXA_DE_ENTRADA: Record<string, FaixaDeEntrada> = {
  // Cobre da caquexia grave à obesidade extrema no adulto. O limite inferior
  // anterior (50 kg) excluía idosas e pacientes desnutridos, que são
  // justamente os de maior risco de sobredose por peso.
  peso: {
    min: 30,
    max: 250,
    passo: 1,
    unidade: "kg",
  },
  // Cobre baixa estatura e estatura muito alta. Altura entra no peso predito,
  // que define o volume corrente — um erro aqui vira volutrauma.
  altura: {
    min: 120,
    max: 220,
    passo: 1,
    unidade: "cm",
  },
  // Do choque profundo à emergência hipertensiva. O piso anterior (70 na
  // sepse) não alcançava a hipotensão grave, que é exatamente o cenário do
  // módulo. O teto de 260 foi elevado a 300 a pedido do autor: PAS acima de 260
  // aparece na crise hipertensiva e na dissecção, e o app é de emergência.
  pas: {
    min: 40,
    max: 300,
    passo: 1,
    unidade: "mmHg",
  },
  // Acompanha a faixa da sistólica, com teto compatível com crise
  // hipertensiva.
  pad: {
    min: 20,
    max: 160,
    passo: 1,
    unidade: "mmHg",
  },
  // Da bradicardia extrema à taquiarritmia de alta frequência. A faixa
  // anterior (50–150) não alcançava nem a bradicardia que indica marca-passo
  // nem a TV rápida.
  fc: {
    min: 20,
    max: 250,
    passo: 1,
    unidade: "bpm",
  },
  // Chega a 100% (antes parava em 98) e desce ao território da hipoxemia
  // crítica, que é onde a decisão de intubar é tomada.
  spo2: {
    min: 50,
    max: 100,
    passo: 1,
    unidade: "%",
  },
  // Do coma hipoglicêmico ao estado hiperosmolar. O piso anterior (50) não
  // alcançava a hipoglicemia grave, que é causa reversível de rebaixamento e a
  // primeira coisa a descartar.
  glicemia: {
    min: 20,
    max: 1200,
    passo: 1,
    unidade: "mg/dL",
  },
  // Cobre acidemia e alcalemia extremas compatíveis com vida.
  ph: {
    min: 6.6,
    max: 7.8,
    passo: 0.01,
    unidade: "",
  },
  // Da hipocalemia grave à hipercalemia com risco de parada.
  potassio: {
    min: 1.5,
    max: 9,
    passo: 0.1,
    unidade: "mEq/L",
  },
  // Do normal ao choque com hiperlactatemia extrema.
  lactato: {
    min: 0.5,
    max: 20,
    passo: 0.1,
    unidade: "mmol/L",
  },
  // Faixa DEFINICIONAL da escala, conferida item a item contra a versão
  // traduzida e adaptada para o Brasil: 15 itens somando no máximo 42. O teto
  // anterior de 25 truncava o AVC grave.
  nihss: {
    min: 0,
    max: 42,
    passo: 1,
    unidade: "",
  },
  // Relação PaO₂/FiO₂, da SDRA grave ao pulmão normal.
  pf: {
    min: 40,
    max: 500,
    passo: 1,
    unidade: "",
  },
};

/** Faixa de entrada de um campo, se houver. */
export function faixaDeEntradaDe(fieldId: string): FaixaDeEntrada | undefined {
  return FAIXA_DE_ENTRADA[fieldId];
}
