/**
 * F-19 · ANTI-HIPERTENSIVOS IV NO AVC — ⛔ dados puros, ⛔ nenhuma decisão de tela.
 *
 * ── ⚠️⚠️ DE ONDE VEM CADA COISA ────────────────────────────────────────────
 *
 * ⛔ **A AHA/ASA 2026 ⛔ não nomeia fármaco algum.** Varredura do documento
 * inteiro: labetalol, nicardipino, clevidipino, nitroprussiato, esmolol,
 * hidralazina, metoprolol ⛔ e enalapril — **zero ocorrências**. ⚠️ Ela dá
 * **alvos**, ⛔ e ⛔ não terapêutica.
 *
 * ⚠️ Por isso cada agente aqui carrega a **sua própria** procedência, ⛔ e ⛔ não
 * uma etiqueta genérica *"AHA/ASA"*: o trio preferencial é da edição de **2019**;
 * esmolol ⛔ e nicardipino têm **bula**; metoprolol ⛔ e nitroprussiato vêm de um
 * **manual brasileiro de 2013**.
 *
 * ⚠️⚠️ ⛔ ISSO ⛔ NÃO É PEDANTISMO DE REFERÊNCIA: *"a AHA recomenda labetalol"* ⛔ e
 * *"a AHA de 2019 listava labetalol, ⛔ e a de 2026 ⛔ não lista fármaco algum"*
 * são afirmações **diferentes**, ⛔ e o médico decide diferente com cada uma.
 *
 * ── ⚠️⚠️ ⛔ E O QUE ESTE ARQUIVO ⛔ NÃO FAZ ─────────────────────────────────
 *
 * ⛔ **⛔ Não escolhe agente.** ⚠️ ⛔ Não há evidência de alta qualidade de
 * superioridade entre eles em mortalidade, independência funcional ⛔ ou mRS em
 * 90 dias — ⛔ e um app que ordena *"use labetalol"* inventa uma hierarquia que a
 * literatura ⛔ não dá.
 *
 * ⛔ **⛔ Não prescreve.** ⛔ Nenhuma via de administração, ⛔ nenhum preparo,
 * ⛔ nenhuma diluição, ⛔ nenhuma bomba. ⚠️ Dose ⛔ e titulação ⛔ não são receita.
 */

/** ⚠️ O papel do agente — ⛔ e ⛔ ele ⛔ não é ordem de preferência clínica. */
export type PapelDoAgente =
  /** ⚠️ Está na tabela de opções pré-reperfusão da AHA/ASA **2019**. */
  | "preferencial_2019"
  /** ⚠️ Plausível ⛔ e disponível, ⛔ mas fora daquela tabela. */
  | "alternativa"
  /** ⚠️ Prática histórica brasileira — ⛔ e ⛔ não escolha contemporânea. */
  | "historico_br"
  /** ⚠️ Reservado a hipertensão grave ⛔ ou refratária. */
  | "reserva";

export type AgenteAntiHipertensivo = {
  readonly id: string;
  readonly nome: string;
  readonly papel: PapelDoAgente;
  /**
   * ⚠️ A dose, ⛔ **como a fonte a escreve**. ⛔ Vazia quando a fonte ⛔ não dá
   * dose — ⛔ e ⛔ nesse caso ⛔ nenhuma é inventada.
   */
  readonly dose?: string;
  readonly titulacao?: string;
  readonly maximo?: string;
  /** ⚠️ Quando pensar nele — ⛔ e ⛔ nunca "é o melhor". */
  readonly quando?: string;
  /** ⚠️ Cautela ⛔ ou contraindicação **do próprio agente**. */
  readonly cautela?: string;
  /** ⚠️ De onde vem a dose — ⛔ e ⛔ ela ⛔ nunca vem de "AHA/ASA" sem ano. */
  readonly procedencia: string;
};

export const AGENTES_ANTI_HIPERTENSIVOS: readonly AgenteAntiHipertensivo[] = [
  {
    id: "labetalol",
    nome: "Labetalol",
    papel: "preferencial_2019",
    dose: "10 a 20 mg por via endovenosa, em 1 a 2 minutos",
    titulacao: "Pode repetir uma vez",
    quando: "Pressão moderadamente acima do limite, ou taquicardia associada",
    cautela:
      "Bradicardia importante, bloqueio atrioventricular avançado, insuficiência cardíaca descompensada, choque cardiogênico ou broncoespasmo importante",
    procedencia: "AHA/ASA 2019, tabela de opções pré-reperfusão",
  },
  {
    id: "nicardipino",
    nome: "Nicardipino",
    papel: "preferencial_2019",
    dose: "5 mg por hora, por via endovenosa",
    titulacao: "Aumentar 2,5 mg por hora a cada 5 a 15 minutos",
    maximo: "15 mg por hora",
    quando: "Quando se deseja controle contínuo e titulação progressiva",
    cautela: "A bula contraindica em estenose aórtica avançada",
    procedencia: "AHA/ASA 2019, e coincide com a bula contemporânea",
  },
  {
    id: "clevidipino",
    nome: "Clevidipino",
    papel: "preferencial_2019",
    dose: "1 a 2 mg por hora, por via endovenosa",
    titulacao: "Pode duplicar a cada 2 a 5 minutos, e depois usar incrementos menores",
    /**
     * ⚠️⚠️ **TETO DO PROTOCOLO**, ⛔ e ⛔ não limite farmacológico absoluto do
     * fármaco em todo contexto — a distinção é do próprio documento de origem.
     */
    maximo: "21 mg por hora, que é o teto do protocolo neurovascular",
    quando: "Quando se deseja titulação muito rápida e reversibilidade rápida",
    procedencia: "AHA/ASA 2019, tabela de opções pré-reperfusão",
  },
  {
    id: "esmolol",
    nome: "Esmolol",
    papel: "alternativa",
    dose: "Ataque opcional de 500 microgramas por quilo em 1 minuto, seguido de 50 microgramas por quilo por minuto",
    titulacao: "Ajustar conforme a resposta",
    /**
     * ⚠️⚠️ O TETO É **DA BULA**, ⛔ e ele existe aqui para sustentar o alerta do
     * valor histórico — ⛔ ver `ALERTA_DO_ESMOLOL`.
     */
    maximo:
      "A bula descreve 250 a 300 microgramas por quilo por minuto para hipertensão, e declara que a segurança acima de 300 não foi estudada",
    quando:
      "Taquicardia significativa, hiperatividade simpática, ou indisponibilidade dos preferenciais",
    procedencia: "Bula (DailyMed). Não faz parte da tabela de 2019",
  },
  {
    id: "metoprolol",
    nome: "Metoprolol",
    papel: "historico_br",
    dose: "5 mg por via endovenosa, lentamente, cerca de 1 mg por minuto",
    titulacao: "Pode repetir a cada 10 minutos",
    maximo: "20 mg",
    cautela:
      "Ação mais longa, menos reversível e sem bloqueio alfa. Não é escolha preferencial quando há acesso a agentes tituláveis",
    procedencia: "Manual de Rotinas do Ministério da Saúde, 2013",
  },
  {
    id: "enalaprilato",
    nome: "Enalaprilato",
    papel: "alternativa",
    /** ⛔ ⛔ SEM DOSE: a fonte deste slot ⛔ não dá dose para este agente. */
    quando: "Conforme protocolo institucional",
    cautela:
      "Menos titulável. Analisar hipovolemia, insuficiência renal, estenose bilateral de artérias renais e risco de hipotensão prolongada",
    procedencia: "Sem dose neste slot",
  },
  {
    id: "hidralazina",
    nome: "Hidralazina",
    papel: "alternativa",
    quando: "Conforme protocolo institucional",
    cautela:
      "Resposta individual variável, duração longa, possibilidade de taquicardia reflexa e de redução pressórica excessiva",
    procedencia: "Sem dose neste slot",
  },
  {
    id: "nitroprussiato",
    nome: "Nitroprussiato de sódio",
    papel: "reserva",
    dose: "0,5 a 8 microgramas por quilo por minuto",
    quando:
      "Hipertensão grave ou refratária, quando os agentes mais apropriados não estão disponíveis ou foram insuficientes",
    cautela:
      "Queda pressórica muito rápida, maior variabilidade hemodinâmica, possibilidade de elevar a pressão intracraniana e toxicidade por cianeto ou tiocianato",
    procedencia: "Manual de Rotinas do Ministério da Saúde, 2013",
  },
];

/**
 * ⚠️⚠️ O ALERTA DE SEGURANÇA — o achado clínico mais forte deste slot.
 *
 * ⛔ O *Manual de Rotinas* do MS (2013) descreve manutenção de esmolol até
 * **3,0 mg/kg/min**. ⚠️ Isso equivale a **3.000 mcg/kg/min** — ⛔ **dez vezes**
 * o teto contemporâneo de 300 mcg/kg/min, acima do qual a bula declara que a
 * segurança ⛔ **não foi estudada**.
 *
 * ⚠️ ⛔ Não é preciso decidir se o valor histórico é erro de impressão, de
 * transcrição ⛔ ou outra interpretação — ⛔ e ⛔ é justamente por ⛔ não ser
 * possível decidir que ele ⛔ **não pode ser reproduzido**.
 */
export const ALERTA_DO_ESMOLOL = {
  id: "esmolol_dose_historica",
  titulo: "Não utilizar esmolol a 3 mg por quilo por minuto",
  texto:
    "Um manual brasileiro de 2013 descreve manutenção até 3 mg por quilo por minuto. Isso equivale a 3.000 microgramas por quilo por minuto, cerca de dez vezes o teto contemporâneo de 300, acima do qual a bula declara que a segurança não foi estudada.",
  fonte: "F-19",
} as const;

/**
 * ⚠️⚠️ OS ALVOS PRESSÓRICOS — cada um com o **seu** contexto ⛔ e a **sua** força.
 *
 * ⛔ ⛔ **NÃO COLAPSAR.** ⚠️ 185/110 é **porta de entrada** da ação; 180/105 é
 * **manutenção** depois dela. ⛔ E `<140` aparece três vezes, com três
 * estatutos diferentes — ⛔ inclusive um de **dano declarado**.
 */
export type Alvo = {
  readonly id: string;
  readonly valor: string;
  readonly contexto: string;
  readonly cor: string;
  readonly loe: string;
  readonly fonte: string;
  /**
   * ⚠️⚠️ ⛔ SEM COR/LOE — vem de *Supportive Text*, ⛔ e ⛔ não de recomendação
   * graduada. ⛔ A tela é obrigada a dizer isso (**E-45**).
   */
  readonly apoioSemGrau?: true;
};

/**
 * ── ⚠️⚠️ **U-01 FECHADO** — ⛔ o mesmo número, ⛔ duas semânticas ─────────
 *
 * ⚠️ A revisão transversal registrou, ⛔ e ⛔ a Fase 8 executa:
 *
 * > *"🔁 **U-01 · Duplicação de limiar pressórico:** `>180/105` aparece em
 * >  §4.3 rec. 7 (**alvo pós-IVT**) ⛔ e na Table 7 (**gatilho de aumentar
 * >  frequência de medida**). Mesmo número, funções diferentes. ⛔ **Fonte
 * >  única de verdade, dois consumidores.**"*
 *
 * ⛔ Antes eram **duas constantes independentes**: `gatilhoPressorico` em
 * `superficie-g.ts` ⛔ e o texto de `apos_ivt` aqui. ⚠️ Corrigir uma ⛔ e ⛔ não
 * a outra deixaria as duas discordando ⛔ em silêncio.
 *
 * ── ⚠️⚠️ ⛔ E ⛔ CADA CONSUMIDOR CARREGA A **SUA** SEMÂNTICA ────────────────
 *
 * ⛔ ⛔ Um ⛔ não pode usar a frase do outro: *"aumentar a frequência das
 * medidas"* ⛔ não é *"o alvo terapêutico é"*, ⛔ e trocar as duas faria a tela
 * prometer conduta onde a fonte pede vigilância — ⛔ ou o inverso.
 */
export const PA_POS_REPERFUSAO = {
  pas: 180,
  pad: 105,
  /**
   * ⚠️⚠️ ⛔ **ESTRITAMENTE ABAIXO** — ⛔ `<`, ⛔ e ⛔ nunca `≤`. ⚠️ A fonte
   * escreve *"maintain BP **below** 180/105"*; ⛔ virar `≤` incluiria
   * ⛔ exatamente 180/105 no alvo, ⛔ e ⛔ há prova de fronteira para isso.
   */
  comparacao: "estritamente_abaixo",
  consumidores: {
    /** ⚠️ **F-04** · §4.3 rec. 7 — ⛔ o que se quer alcançar. */
    alvoTerapeuticoPosIvt: {
      fonte: "F-04",
      cor: "1",
      loe: "B-R",
      contexto: "Nas primeiras 24 horas após a trombólise",
      frase: "Manter abaixo de 180 por 105 mmHg",
    },
    /** ⚠️ **F-15** · Table 7 — ⛔ o que se faz quando ⛔ ele é ultrapassado. */
    gatilhoDeFrequencia: {
      fonte: "F-15",
      localizacao: "Table 7 · p. e358",
      contexto: "Acima destes níveis, durante a monitorização pós-trombólise",
      frase: "Aumentar a frequência das medidas e tratar para manter em ou abaixo desses níveis.",
    },
  },
} as const;

export const ALVOS_PRESSORICOS: readonly Alvo[] = [
  {
    id: "antes_ivt",
    valor: "Abaixo de 185 por 110 mmHg",
    contexto: "Antes de iniciar a trombólise intravenosa",
    cor: "1",
    loe: "B-NR",
    fonte: "F-04",
  },
  {
    id: "apos_ivt",
    valor: "Abaixo de 180 por 105 mmHg",
    contexto: "Nas primeiras 24 horas após a trombólise",
    cor: "1",
    loe: "B-R",
    fonte: "F-04",
  },
  {
    id: "antes_evt",
    valor: "Até 185 por 110 mmHg",
    contexto: "Antes da trombectomia, quando não houve trombólise",
    cor: "2a",
    loe: "B-NR",
    fonte: "F-04",
  },
  {
    id: "durante_evt",
    valor: "Até 180 por 105 mmHg",
    contexto: "Durante e nas 24 horas após a trombectomia",
    cor: "2a",
    loe: "B-NR",
    fonte: "F-04",
  },
  {
    /**
     * ⚠️⚠️ A ÚNICA **COR 3 · HARM** DA SÉRIE — ⛔ e ⛔ ela faltava no documento
     * de origem. ⚠️ É a mais forte de todas, ⛔ e pertence ao pós-trombectomia.
     */
    id: "harm_pos_recanalizacao",
    valor: "Não manter a sistólica abaixo de 140 mmHg por 72 horas",
    contexto: "Após recanalização bem-sucedida",
    cor: "3: Harm",
    loe: "A",
    fonte: "F-04",
  },
  {
    id: "sem_beneficio_pos_ivt",
    valor: "Não reduzir a sistólica abaixo de 140 mmHg de rotina",
    contexto: "Após a trombólise, em gravidade leve a moderada",
    cor: "3: No Benefit",
    loe: "B-R",
    fonte: "F-04",
  },
  {
    /**
     * ⚠️ Faixa **⛔ sem grau**: ela vive ⛔ só no *Supportive Text* 7. ⚠️ A
     * recomendação graduada dá ⛔ **apenas teto** (180/105), ⛔ sem piso.
     */
    id: "faixa_pos_trombolise",
    valor: "Sistólica aproximadamente entre 140 e 180 mmHg",
    contexto: "Após a trombólise, como faixa prática",
    cor: "—",
    loe: "—",
    fonte: "F-04",
    apoioSemGrau: true,
  },
];
