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

  // ── Grandezas das calculadoras clínicas ────────────────────────────────────
  //
  // Entraram quando as calculadoras saíram da caixa de digitação para a barra.
  // Mesmo princípio do resto da tabela: são limites de ENTRADA, não de
  // normalidade — largos o bastante para o paciente extremo caber, porque
  // faixa apertada é o defeito que impede registrar quem está na frente.
  // Um escore que não aceita a creatinina de 12 do paciente dialítico é um
  // escore que não pode ser calculado.
  idade: { min: 0, max: 120, passo: 1, unidade: "anos" },
  // Campo LOCAL do politrauma, que existe para escolher a meta de PAS no TCE
  // por faixa etária (BTF). É idade como qualquer outra — aponta para a mesma
  // faixa de propósito, para que as duas não possam divergir se um dia o
  // limite mudar.
  idadeParaMetaDePas: { min: 0, max: 120, passo: 1, unidade: "anos" },
  // ── Os dois relógios da eclâmpsia (D-16) ────────────────────────────────
  //
  // A janela da sulfatação é de 24 h, e a paciente pode chegar transferida em
  // qualquer ponto dela — daí 1.440 min de teto. Passo de 5 min porque é a
  // granularidade com que se lembra de um horário ("faz mais ou menos meia
  // hora"), não a de cronômetro.
  tempoDeSulfatacao: { min: 0, max: 1440, passo: 5, unidade: "min" },
  // O repique do Pritchard é 4/4 h; 8 h de teto cobre o atraso que se quer
  // justamente enxergar.
  tempoDaUltimaDose: { min: 0, max: 480, passo: 5, unidade: "min" },
  na: { min: 100, max: 190, passo: 1, unidade: "mEq/L" },
  cl: { min: 60, max: 150, passo: 1, unidade: "mEq/L" },
  k: { min: 1.5, max: 9, passo: 0.1, unidade: "mEq/L" },
  cr: { min: 0.1, max: 20, passo: 0.1, unidade: "mg/dL" },
  ureia: { min: 5, max: 300, passo: 1, unidade: "mg/dL" },
  alb: { min: 0.5, max: 6, passo: 0.1, unidade: "g/dL" },
  bili: { min: 0.1, max: 40, passo: 0.1, unidade: "mg/dL" },
  ht: { min: 10, max: 65, passo: 1, unidade: "%" },
  leuco: { min: 0.1, max: 100, passo: 0.1, unidade: "×10³/mm³" },
  plaq: { min: 1, max: 800, passo: 1, unidade: "×10³/mm³" },
  fr: { min: 4, max: 60, passo: 1, unidade: "rpm" },
  pam: { min: 20, max: 200, passo: 1, unidade: "mmHg" },
  temp: { min: 28, max: 43, passo: 0.1, unidade: "°C" },
  gcs: { min: 3, max: 15, passo: 1, unidade: "" },
  tfg: { min: 0, max: 200, passo: 1, unidade: "mL/min" },
  losDias: { min: 0, max: 90, passo: 1, unidade: "dias" },
  medida: { min: 200, max: 400, passo: 1, unidade: "mOsm/kg" },
  hco3: { min: 2, max: 50, passo: 0.5, unidade: "mEq/L" },
  pao2: { min: 20, max: 600, passo: 1, unidade: "mmHg" },
  aado2: { min: 0, max: 600, passo: 1, unidade: "mmHg" },
  fio2: { min: 0.21, max: 1, passo: 0.01, unidade: "" },
  // ── Injúria renal aguda (§5 · estadiamento KDIGO) ─────────────────────────
  // `creatinina` e `basal` são a MESMA grandeza medida em dois momentos — atual
  // e de base — e por isso partilham a faixa de `cr`. Chaves separadas porque a
  // tabela é indexada pelo `id` do campo, e os dois convivem na mesma tela.
  creatinina: { min: 0.1, max: 20, passo: 0.1, unidade: "mg/dL" },
  basal: { min: 0.1, max: 20, passo: 0.1, unidade: "mg/dL" },
  // Diurese HORÁRIA, não do dia. O piso é 0 porque anúria é um valor real e é
  // justamente o que fecha estágio 3; o passo é 1 porque a fronteira de 0,5
  // mL/kg/h cai perto de 35 mL/h no adulto de 70 kg, e um passo grosso saltaria
  // por cima dela.
  diurese_ml_h: { min: 0, max: 500, passo: 1, unidade: "mL/h" },
  // Horas de oligúria acumuladas. Vai além das 24 h do critério porque quem
  // chega tarde chega com mais, e o número precisa caber para ser registrado.
  horas_oliguria: { min: 0, max: 72, passo: 1, unidade: "h" },
};

/** Faixa de entrada de um campo, se houver. */
export function faixaDeEntradaDe(fieldId: string): FaixaDeEntrada | undefined {
  return FAIXA_DE_ENTRADA[fieldId];
}

/**
 * A MESMA grandeza com dois nomes.
 *
 * As árvores de decisão chamam a glicemia de `glicemia`; a calculadora de
 * gravidade chama de `glic`. É o mesmo número, com a mesma unidade, e a
 * tentação seria escrever a faixa duas vezes.
 *
 * Duas cópias de um limite divergem — foi o que aconteceu neste app com dose de
 * fármaco, e é o que os verificadores de consistência existem para pegar. Aqui
 * o apelido aponta para o MESMO objeto: alterar um altera o outro porque são um
 * só. Apelido novo entra aqui, nunca como entrada duplicada acima.
 */
FAIXA_DE_ENTRADA.glic = FAIXA_DE_ENTRADA.glicemia;

/**
 * ── ELETRÓLITOS COM FAIXA POR UNIDADE ───────────────────────────────────────
 *
 * Cálcio, magnésio e fósforo são medidos em mg/dL, mmol/L OU mEq/L conforme o
 * laboratório, e a mesma grandeza tem números completamente diferentes em cada
 * uma: cálcio 9 mg/dL é 2,25 mmol/L é 4,5 mEq/L.
 *
 * ⚠️ POR QUE ISTO ENTRA NA FONTE ÚNICA EM VEZ DE VIRAR EXCEÇÃO. A calculadora
 * de eletrólitos mantinha essas faixas escritas à mão, e a conversão de unidade
 * é justamente a maior fonte de erro do módulo — abrir exceção aqui seria abrir
 * exceção no pior lugar possível. Decisão do autor, 2026-08-16.
 *
 * O eixo de unidade é opcional: a esmagadora maioria das grandezas tem uma
 * unidade só e continua indexada direto por `FAIXA_DE_ENTRADA[id]`.
 */
export type FaixaPorUnidade = Record<string, FaixaDeEntrada>;

export const FAIXA_POR_UNIDADE: Record<string, FaixaPorUnidade> = {
  ca: {
    "mg/dL": { min: 4, max: 20, passo: 0.1, unidade: "mg/dL" },
    "mmol/L": { min: 1, max: 5, passo: 0.01, unidade: "mmol/L" },
    "mEq/L": { min: 2, max: 10, passo: 0.05, unidade: "mEq/L" },
  },
  mg: {
    "mg/dL": { min: 0.4, max: 10, passo: 0.1, unidade: "mg/dL" },
    "mmol/L": { min: 0.15, max: 4.1, passo: 0.01, unidade: "mmol/L" },
    "mEq/L": { min: 0.3, max: 8.2, passo: 0.05, unidade: "mEq/L" },
  },
  p: {
    "mg/dL": { min: 0.3, max: 15, passo: 0.1, unidade: "mg/dL" },
    "mmol/L": { min: 0.1, max: 4.8, passo: 0.01, unidade: "mmol/L" },
    "mEq/L": { min: 0.2, max: 8.7, passo: 0.05, unidade: "mEq/L" },
  },
};

/**
 * Faixa de uma grandeza que depende da unidade escolhida.
 *
 * Devolve `undefined` quando a grandeza não tem eixo de unidade — quem chama
 * decide se cai em `FAIXA_DE_ENTRADA[id]` ou se é erro de configuração.
 */
export function faixaPorUnidadeDe(id: string, unidade: string): FaixaDeEntrada | undefined {
  return FAIXA_POR_UNIDADE[id]?.[unidade];
}

/**
 * Campos da calculadora de eletrólitos que não são dosagem laboratorial —
 * volume da bolsa e tempo de infusão. Ficam aqui pela mesma razão dos demais:
 * um número que decide diluição não pode viver em dois lugares.
 */
FAIXA_DE_ENTRADA.volumeDaBolsa = { min: 50, max: 2000, passo: 10, unidade: "mL" };
FAIXA_DE_ENTRADA.horasDeInfusao = { min: 1, max: 24, passo: 1, unidade: "h" };
