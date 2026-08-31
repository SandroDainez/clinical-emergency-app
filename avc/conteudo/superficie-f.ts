/**
 * SUPERFÍCIE F · Reperfusão — o **catálogo de recomendações**, ⛔ não um algoritmo.
 *
 * ── ⚠️⚠️ O QUE ESTE ARQUIVO ⛔ NÃO É ───────────────────────────────────────
 *
 * ⛔ ⛔ ⛔ Ele ⛔ NÃO é um calculador de elegibilidade. A própria fonte adverte, em
 * F-08: *"`EVT elegível = sim/não` ⛔ **NÃO** é fato armazenado"*.
 *
 * ⚠️ A diretriz de 2026 ⛔ não é uma árvore de decisão. É um **conjunto de
 * recomendações sobrepostas**, com populações diferentes, relógios diferentes e
 * forças diferentes — e um mesmo paciente corresponde a **várias**. Achatar isso
 * num veredito agregado inverteria o sentido da fonte em pelo menos três pontos
 * que já conhecemos (M2 dominante × ⛔ não dominante; TNK 0,25 × 0,4; déficit
 * incapacitante × leve ⛔ não incapacitante).
 *
 * ── ⚠️⚠️ ⛔ NÃO EXISTE "A JANELA" ─────────────────────────────────────────
 *
 * A fonte usa **cinco relógios**, e ⛔ não os converte entre si:
 *
 *   · `symptom_onset` · `last_known_well` · `onset_ou_lkw` (⚠️ **disjunção**, um
 *     construto próprio) · `symptom_recognition` · `midpoint_of_sleep`.
 *
 * ⚠️ E §4.6.3 rec. 2 carrega **dois marcos alternativos com durações
 * diferentes** na mesma recomendação. ⛔ Por isso cada recomendação carrega uma
 * **lista** de janelas, e ⛔ não há `dentro_da_janela` global.
 *
 * ⚠️⚠️ ⛔ Duas tensões internas da fonte ficam **registradas, ⛔ não harmonizadas**:
 * a janela padrão de IVT aparece com três formulações; e a trombectomia conta de
 * `onset` enquanto a imagem que a sustenta conta de `last known well`.
 */

/** ⚠️ Os cinco relógios. ⛔ `onset_ou_lkw` ⛔ NÃO é a soma dos dois primeiros. */
export type Marco =
  | "symptom_onset"
  | "last_known_well"
  | "onset_ou_lkw"
  | "symptom_recognition"
  | "midpoint_of_sleep";

export type JanelaDaRecomendacao = {
  readonly marco: Marco;
  readonly deHoras?: number;
  readonly ateHoras: number;
  /** ⚠️ A frase da fonte. ⛔ **E-31**: ⛔ nenhum número clínico sem verbatim. */
  readonly verbatim: string;
};

/** ⚠️ Insumos que uma recomendação pode exigir. ⛔ Nomes, ⛔ não valores. */
export type Insumo =
  | "deficit_incapacitante"
  /**
   * ⚠️⚠️ **DUAS propriedades, ⛔ não uma negação.** A fonte escreve *"mild
   * **non-disabling** stroke deficits"* — leve **E** ⛔ não incapacitante.
   *
   * ⛔ `incapacitante_assumido = "Não incapacitante"` ⛔ NÃO basta: ⛔ ele ⛔ não diz
   * ⛔ nada sobre **leve**. ⚠️ B ⛔ ainda ⛔ não representa "leve", então este insumo
   * fica `undefined` — e a recomendação fica **potencial**, nomeando a falta.
   */
  | "deficit_leve_nao_incapacitante"
  | "nihss"
  | "mrs_previo"
  | "idade"
  | "sitio_da_oclusao"
  | "aspects"
  | "pc_aspects"
  | "efeito_de_massa_ausente"
  | "penumbra_salvavel"
  | "penumbra_por_perfusao_automatizada"
  | "dwi_menor_que_um_terco"
  | "flair_sem_alteracao_marcada"
  | "peso"
  | "nao_elegivel_a_evt"
  /**
   * ⚠️⚠️ **Decisão médica**, ⛔ não achado. Qual agente está em consideração.
   *
   * ⛔ Sem ele, a recomendação sobre **TNK 0,4 mg/kg** apareceria para todo
   * paciente — inclusive para quem vai receber alteplase. ⚠️ Uma recomendação
   * sobre **dose de um fármaco** só informa quando aquele fármaco está em jogo.
   */
  /**
   * ⚠️⚠️ O NOME CARREGA A POLARIDADE, ⛔ e ⛔ não só o assunto.
   *
   * ⚠️ Chamado de `agente_em_consideracao`, ele soava genérico ⛔ e a sua
   * derivação era específica de TNK — o convite exato para a próxima
   * recomendação o reutilizar ⛔ e alcançar a população errada. A rec. F-09 é
   * sobre **tenecteplase 0,4 mg/kg**: alteplase ⛔ não é "⛔ ainda ⛔ não sei",
   * é **outra terapia**, ⛔ e por isso CONTRADIZ.
   */
  | "agente_e_tenecteplase";

export type Recomendacao = {
  readonly id: string;
  readonly slot: string;
  readonly localizacao: string;
  readonly terapia: "ivt" | "evt";
  /** ⚠️ Verbatim. ⛔ **`COR 3: No Benefit` ⛔ NÃO é "contraindicado"** — a fonte
   * escreveu *not recommended*, e converter inventaria força que ela ⛔ não deu. */
  readonly cor: string;
  readonly loe: string;
  readonly verbo: string;
  readonly populacao: string;
  readonly janelas: readonly JanelaDaRecomendacao[];
  /**
   * ⚠️⚠️ ⛔ NUNCA VAZIO. Recomendação sem ⛔ nenhum insumo ⛔ não pode ser
   * avaliada contra paciente ⛔ nenhum — ela sai `aplicavel` no estado vazio,
   * que é afirmar correspondência sem ter olhado o caso. Quando a frase da
   * fonte ⛔ não traz critério de paciente, ela é `PrincipioGeral`.
   */
  readonly exige: readonly Insumo[];
  /** ⚠️ Dívida que impede concluir a correspondência. ⛔ Ver F-31, F-29. */
  readonly travadaPor?: string;
};

/**
 * ⚠️⚠️ PRINCÍPIO GERAL ⛔ NÃO É RECOMENDAÇÃO DE CORRESPONDÊNCIA.
 *
 * ⚠️ A §4.6.1 rec. 2 diz *"In adult patients with AIS **who are eligible for
 * IVT** within 4.5 hours ... treatment should be initiated as quickly as
 * possible"*. A **única** qualificação de população que ela traz é a própria
 * elegibilidade, ⛔ e o conteúdo é sobre a **condução** do tratamento —
 * *"avoiding potential delays associated with additional multimodal
 * neuroimaging"*. ⛔ Ela ⛔ não tem critério de paciente próprio.
 *
 * ⚠️⚠️ Modelada como recomendação, ela tinha `exige: []` ⛔ e por isso saía
 * `aplicavel` no paciente **vazio** — o app afirmaria "esta recomendação
 * corresponde a este caso" antes de saber qualquer coisa do caso. Isso mistura
 * *princípio geral* com *recomendação aplicável a este paciente*.
 *
 * ⚠️ A saída ⛔ não foi criar `elegivel_ivt: boolean` agregado — seria inventar
 * um veredito que a fonte ⛔ não sustenta (E-43). Foi **separar a categoria**.
 *
 * ⚠️ Note o campo `pressupoe`, ⛔ e ⛔ **não** `populacao`: o tipo ⛔ não tem
 * `exige`, logo é **impossível por construção** passá-lo a `correspondenciaDe`.
 * O princípio aparece quando F estiver discutindo IVT, com COR/LOE/verbatim,
 * ⛔ sem afirmar que corresponde ao paciente.
 */
export type PrincipioGeral = {
  readonly id: string;
  readonly slot: string;
  readonly localizacao: string;
  readonly terapia: "ivt" | "evt";
  readonly cor: string;
  readonly loe: string;
  readonly verbo: string;
  /** ⚠️ O que ele **pressupõe** ⛔ e ⛔ não avalia. */
  readonly pressupoe: string;
  readonly janelas: readonly JanelaDaRecomendacao[];
};

export const PRINCIPIOS_GERAIS: readonly PrincipioGeral[] = [
  {
    id: "ivt_padrao",
    slot: "F-02",
    localizacao: "§4.6.1 rec. 2 · p. e353",
    terapia: "ivt",
    cor: "1",
    loe: "B-NR",
    verbo: "should be initiated as quickly as possible",
    pressupoe: "adulto elegível a IVT",
    janelas: [
      {
        marco: "symptom_onset",
        ateHoras: 4.5,
        verbatim: "within 4.5 hours of symptom onset",
      },
    ],
  },
];

/**
 * ⚠️⚠️ O CATÁLOGO — uma entrada por recomendação, ⛔ nenhuma consolidada.
 *
 * ⛔ Recomendações pediátricas foram excluídas **na origem** (E-17), ⛔ não aqui.
 */
export const RECOMENDACOES: readonly Recomendacao[] = [
  // ── IVT · janela padrão ────────────────────────────────────────────────
  {
    id: "ivt_rapidez",
    slot: "F-02",
    localizacao: "§4.6.1 rec. 1 · p. e353",
    terapia: "ivt",
    cor: "1",
    loe: "A",
    verbo: "faster treatment improves functional outcomes",
    populacao: "adulto com déficit incapacitante, elegível a IVT",
    /** ⚠️ ⛔ **Sem janela** — é afirmação sobre velocidade, ⛔ não sobre prazo. */
    janelas: [],
    exige: ["deficit_incapacitante"],
  },
  {
    id: "ivt_leve_nao_incapacitante",
    slot: "F-02 / F-17",
    localizacao: "§4.6.1 rec. 8 · p. e353",
    terapia: "ivt",
    cor: "3: No Benefit",
    loe: "B-R",
    verbo: "is not recommended",
    populacao: "déficit leve NÃO incapacitante",
    janelas: [
      {
        marco: "onset_ou_lkw",
        ateHoras: 4.5,
        verbatim: "within 4.5 hours of symptom onset or last known well",
      },
    ],
    exige: ["deficit_leve_nao_incapacitante"],
  },
  {
    id: "ivt_agente",
    slot: "F-09",
    localizacao: "§4.6.2 rec. 1 · p. e357",
    terapia: "ivt",
    cor: "1",
    loe: "A",
    verbo: "is recommended",
    populacao: "adulto elegível a IVT",
    janelas: [
      {
        marco: "onset_ou_lkw",
        ateHoras: 4.5,
        verbatim: "within 4.5 hours of symptom onset or last known well",
      },
    ],
    exige: ["peso"],
  },
  {
    id: "ivt_tnk_04",
    slot: "F-09",
    localizacao: "§4.6.2 rec. 2 · p. e357",
    terapia: "ivt",
    cor: "3: No Benefit",
    loe: "A",
    verbo: "is not recommended",
    populacao: "adulto elegível a IVT — dose de 0,4 mg/kg de tenecteplase",
    janelas: [
      {
        marco: "onset_ou_lkw",
        ateHoras: 4.5,
        verbatim: "within 4.5 hours of symptom onset or last known well",
      },
    ],
    exige: ["agente_e_tenecteplase"],
  },

  // ── IVT · janelas estendidas ───────────────────────────────────────────
  {
    id: "ivt_inicio_desconhecido",
    slot: "F-03",
    localizacao: "§4.6.3 rec. 1 · p. e359",
    terapia: "ivt",
    cor: "2a",
    loe: "B-R",
    verbo: "can be beneficial",
    populacao: "início desconhecido, com RM-DWI/FLAIR compatível",
    janelas: [
      {
        marco: "symptom_recognition",
        ateHoras: 4.5,
        verbatim: "within 4.5 hours from symptom recognition",
      },
    ],
    exige: ["dwi_menor_que_um_terco", "flair_sem_alteracao_marcada"],
  },
  {
    id: "ivt_wakeup_ou_45_9",
    slot: "F-03",
    localizacao: "§4.6.3 rec. 2 · p. e359",
    terapia: "ivt",
    cor: "2a",
    loe: "B-R",
    verbo: "can be beneficial",
    populacao: 'NÃO elegível a EVT, com penumbra salvável em perfusão automatizada',
    /** ⚠️⚠️ **DOIS marcos alternativos, durações diferentes.** ⛔ Não conversíveis. */
    janelas: [
      {
        marco: "midpoint_of_sleep",
        ateHoras: 9,
        verbatim: "awake with stroke symptoms within 9 hours from the midpoint of sleep",
      },
      {
        marco: "last_known_well",
        deHoras: 4.5,
        ateHoras: 9,
        verbatim: "4.5–9 hours from last known well",
      },
    ],
    exige: ["penumbra_por_perfusao_automatizada", "nao_elegivel_a_evt"],
    travadaPor: "F-31",
  },
  {
    id: "ivt_lvo_sem_evt",
    slot: "F-03",
    localizacao: "§4.6.3 rec. 3 · p. e359",
    terapia: "ivt",
    cor: "2b",
    loe: "B-R",
    verbo: "may be beneficial",
    populacao: "LVO com penumbra salvável, que \"cannot receive EVT\"",
    janelas: [
      {
        marco: "onset_ou_lkw",
        deHoras: 4.5,
        ateHoras: 24,
        verbatim: "within 4.5 to 24 hours from symptom onset or last known well",
      },
    ],
    exige: ["sitio_da_oclusao", "penumbra_salvavel", "nao_elegivel_a_evt"],
    travadaPor: "F-31",
  },

  // ── EVT · circulação anterior ──────────────────────────────────────────
  {
    id: "evt_ant_1",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 1 · p. e368",
    terapia: "evt",
    cor: "1",
    loe: "A",
    verbo: "is recommended",
    populacao: "LVO proximal de ICA ou M1",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    exige: ["sitio_da_oclusao", "nihss", "mrs_previo", "aspects"],
  },
  {
    id: "evt_ant_2",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 2 · p. e368",
    terapia: "evt",
    cor: "1",
    loe: "A",
    verbo: "is recommended",
    populacao: "LVO proximal de ICA ou M1",
    janelas: [
      {
        marco: "symptom_onset",
        deHoras: 6,
        ateHoras: 24,
        verbatim: "between 6 and 24 hours from onset of symptoms",
      },
    ],
    exige: ["sitio_da_oclusao", "nihss", "mrs_previo", "aspects"],
  },
  {
    id: "evt_ant_3",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 3 · p. e368",
    terapia: "evt",
    cor: "1",
    loe: "A",
    verbo: "is recommended",
    populacao: "selected patients* · LVO de ICA ou M1, idade <80",
    janelas: [
      {
        marco: "symptom_onset",
        deHoras: 6,
        ateHoras: 24,
        verbatim: "between 6 and 24 hours from onset of symptoms",
      },
    ],
    exige: [
      "sitio_da_oclusao",
      "nihss",
      "mrs_previo",
      "aspects",
      "idade",
      "efeito_de_massa_ausente",
    ],
  },
  {
    id: "evt_ant_4",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 4 · p. e368",
    terapia: "evt",
    cor: "2a",
    loe: "B-R",
    verbo: "is reasonable",
    populacao: "selected patients† · LVO de ICA ou M1, idade <80",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    exige: [
      "sitio_da_oclusao",
      "nihss",
      "mrs_previo",
      "aspects",
      "idade",
      "efeito_de_massa_ausente",
    ],
  },
  {
    id: "evt_ant_5",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 5 · p. e368",
    terapia: "evt",
    cor: "2a",
    loe: "B-NR",
    verbo: "is reasonable",
    populacao: "LVO de ICA ou M1 com incapacidade prévia leve (mRS 2)",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    exige: ["sitio_da_oclusao", "nihss", "mrs_previo"],
  },
  {
    id: "evt_ant_6",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 6 · p. e369",
    terapia: "evt",
    cor: "2b",
    loe: "B-NR",
    verbo: "might be reasonable",
    populacao: "LVO de ICA ou M1 com incapacidade prévia moderada (mRS 3–4)",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    exige: ["sitio_da_oclusao", "nihss", "mrs_previo", "aspects"],
  },
  {
    id: "evt_m2_dominante",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 7 · p. e369",
    terapia: "evt",
    cor: "2a",
    loe: "B-NR",
    verbo: "is reasonable, but the benefits are uncertain",
    populacao: "oclusão da divisão M2 proximal DOMINANTE da ACM",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    exige: ["sitio_da_oclusao", "nihss", "mrs_previo", "aspects"],
  },
  {
    /**
     * ⚠️⚠️ A distinção mais fina do slot: **dominante × ⛔ não dominante muda a
     * força de 2a para "No Benefit"**. ⛔ Achatar em "oclusão de M2" inverteria a
     * recomendação para metade dos pacientes.
     */
    id: "evt_m2_nao_dominante",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 8 · p. e369",
    terapia: "evt",
    cor: "3: No Benefit",
    loe: "A",
    verbo: "is not recommended",
    populacao:
      "M2 proximal NÃO dominante ou codominante · ACM distal · ACA · ACP",
    janelas: [],
    exige: ["sitio_da_oclusao"],
  },

  // ── EVT · circulação posterior ─────────────────────────────────────────
  {
    id: "evt_basilar_1",
    slot: "F-08",
    localizacao: "§4.7.3 rec. 1 · p. e372",
    terapia: "evt",
    cor: "1",
    loe: "A",
    verbo: "is recommended",
    populacao: "oclusão de artéria basilar",
    janelas: [
      { marco: "symptom_onset", ateHoras: 24, verbatim: "within 24 hours from onset of symptoms" },
    ],
    exige: ["sitio_da_oclusao", "nihss", "mrs_previo", "pc_aspects"],
  },
  {
    id: "evt_basilar_2",
    slot: "F-08",
    localizacao: "§4.7.3 rec. 2 · p. e372",
    terapia: "evt",
    cor: "2b",
    loe: "B-R",
    verbo: "is not well established",
    populacao: "oclusão de artéria basilar, NIHSS 6–9",
    janelas: [
      { marco: "symptom_onset", ateHoras: 24, verbatim: "within 24 hours" },
    ],
    exige: ["sitio_da_oclusao", "nihss", "mrs_previo", "pc_aspects"],
  },
] as const;

/**
 * ⚠️⚠️ IVT e EVT ⛔ NÃO SÃO MUTUAMENTE EXCLUSIVAS — §4.7.1, COR 1 · LOE A.
 *
 * > *"…IVT should be administered as rapidly as possible, **without observation,
 * > to assess clinical response or delay in initiating EVT**…"*
 *
 * ⚠️ E o *Synopsis*: *"a strategy to forgo (or 'skip') IVT to facilitate EVT is
 * ⛔ not recommended"*. ⛔ As duas frentes correm **em paralelo**.
 */
export const IVT_E_EVT_EM_PARALELO = {
  slot: "F-08",
  localizacao: "§4.7.1 recs. 1 e 2 · p. e368",
  cor: "1",
  loe: "A",
} as const;

/**
 * ⚠️⚠️ A DECISÃO TERAPÊUTICA — e ela mora **em F**, ⛔ não em A–E.
 *
 * ⛔ ⛔ Escolher o agente ⛔ **NÃO** é administrar, ⛔ não é calcular dose e ⛔ não é
 * preparar. ⚠️ É a decisão que torna relevante a recomendação sobre a dose
 * daquele fármaco — e ⛔ nada além disso.
 *
 * ⚠️ A fonte oferece os dois com a **mesma força** (COR 1 · LOE A). ⛔ O app
 * ⛔ não escolhe.
 */
export const CAMPO_AGENTE = {
  id: "agente_trombolitico",
  rotulo: "Agente trombolítico em consideração",
  opcoes: ["Alteplase", "Tenecteplase", "Indefinido"],
  fonte: "F-09",
  nota: "A fonte recomenda os dois com a mesma força. Escolher não significa administrar.",
} as const;

/** ⚠️ Doses sustentadas por F-09. ⛔ **Preparo e administração ⛔ NÃO entram aqui.** */
export const DOSES = {
  alteplase: { mgPorKg: 0.9, maximoMg: 90, slot: "F-09" },
  tenecteplase: { mgPorKg: 0.25, maximoMg: 25, slot: "F-09" },
} as const;
