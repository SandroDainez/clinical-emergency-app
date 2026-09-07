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

/**
 * ⚠️ F importa de E **apenas o vocabulário de estado da ação** — ⛔ e ⛔ nenhuma
 * regra clínica. Reescrevê-lo aqui daria duas listas que divergem (I6).
 */
import type { CampoDeclarado } from "./campo";
import { OPCOES_ESTADO_DA_ACAO } from "./superficie-e";
import type { Territorio } from "./superficie-c";


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

/**
 * ⚠️⚠️⚠️ OS CRITÉRIOS — ⛔ **a regra virou dado**.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ⛔ NÃO FICAM DENTRO DO MOTOR ──────────────────────────
 *
 * ⚠️ Regra do autor, 2026-09-07: *"⛔ Não codificar os cortes diretamente dentro
 * de `vereditoDaTrombectomia()`. ⛔ Não inferir critério pelo `id`. ⛔ Não usar
 * busca textual. A regra deve virar dado."*
 *
 * ⛔ ⛔ Um `if (rec.id === "evt_ant_1" && nihss >= 6)` esconderia o corte da
 * conferência contra o PDF ⛔ e o deixaria envelhecer calado. ⚠️ Aqui o número
 * fica **ao lado do verbatim de onde saiu** (**E-31**).
 *
 * ── ⚠️⚠️ ⛔ E ⛔ NÃO EXISTE MOLDE GERAL ────────────────────────────────────
 *
 * ⛔ ⛔ ⛔ **⛔ Nenhum `CRITERIOS_EVT_GERAIS`** sobrescrito por recomendação:
 * ⚠️ ⛔ isso repetiria, na seleção de paciente, ⛔ exatamente o erro que as duas
 * notas de generalização fundidas cometeriam. ⛔ Cada recomendação carrega o
 * seu conjunto, inteiro.
 */

/**
 * ⚠️ Faixa numérica. ⛔ `min`/`max` são **inclusivos**; os `…Exclusivo` existem
 * porque a fonte escreve `<80`, ⛔ e ⛔ `≤79` ⛔ não é a mesma frase.
 */
export type CriterioDeFaixa = {
  readonly min?: number;
  readonly max?: number;
  readonly minExclusivo?: number;
  readonly maxExclusivo?: number;
};

/** ⚠️ Territórios que **esta** recomendação alcança. ⛔ Nenhum outro. */
export type CriterioDeSitio = { readonly in: readonly Territorio[] };

/**
 * ⚠️⚠️ ⛔ A EXIGÊNCIA DE **AUSÊNCIA** — ⛔ e ⛔ ela ⛔ não é *"⛔ não perguntei"*.
 *
 * ⛔ A fonte pede *"without significant mass effect on imaging"*: ⛔ o achado
 * **negado** satisfaz; o achado **afirmado** contradiz; ⛔ o silêncio ⛔ não
 * resolve (**E-23**, **E-37**).
 */
export type CriterioDeAusencia = { readonly exigeAusencia: true };

/**
 * ⚠️⚠️ ⛔ A JANELA APONTA PARA A PRÓPRIA `janelas` DA RECOMENDAÇÃO — ⛔ e ⛔ NÃO
 * repete as horas.
 *
 * ⛔ ⛔ Repetir `{ min: 0, max: 6 }` aqui criaria **duas fontes do mesmo
 * número**, livres para divergir (**I6**). ⚠️ Este critério ⛔ só diz *"a janela
 * desta recomendação é critério"*; ⛔ as horas continuam ⛔ onde sempre
 * estiveram.
 */
export type CriterioDeJanela = { readonly usaJanelasDaRecomendacao: true };

export type CriteriosDaRecomendacao = {
  readonly sitio_da_oclusao?: CriterioDeSitio;
  readonly nihss?: CriterioDeFaixa;
  readonly mrs_previo?: CriterioDeFaixa;
  readonly aspects?: CriterioDeFaixa;
  readonly pc_aspects?: CriterioDeFaixa;
  readonly idade?: CriterioDeFaixa;
  readonly efeito_de_massa_ausente?: CriterioDeAusencia;
  readonly janela?: CriterioDeJanela;
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
  | "agente_e_tenecteplase"
  /**
   * ⚠️⚠️⚠️ A JANELA COMO **INSUMO**, ⛔ e ⛔ não como enfeite.
   *
   * ── ⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA (2026-09-07) ────────────────────────
   *
   * ⛔ ⛔ `janelas` existia no catálogo ⛔ e ⛔ **ninguém a consultava** para
   * decidir: ⛔ só `apresentacao-f.ts` a lia, ⛔ para desenhar relógios. ⚠️ Um
   * paciente de **30 horas** fechava a rec. 1 (*"within 6 hours"*) do mesmo
   * jeito que um de duas.
   *
   * ⚠️⚠️ ⛔ E ⛔ ELA ⛔ NÃO TRAZ UM SEGUNDO RELÓGIO: o número continua ⛔ só em
   * `janelas`, ⛔ e a contagem continua ⛔ só em `ORIGEM_DO_MARCO`. ⛔ Este
   * insumo é o **nome** da exigência, ⛔ para que a falta possa ser dita.
   */
  | "janela";

/**
 * ⚠️⚠️ POR QUE CADA DADO IMPORTA — em linguagem clínica, ⛔ não de arquitetura.
 *
 * ⚠️ Decisão do autor, 2026-08-31: *"não usar «abre 11» como mensagem
 * principal"*. **Quantas** recomendações um dado destrava é informação sobre a
 * estrutura do catálogo; o médico precisa saber **para que** o dado serve.
 * O número continua na tela, ⛔ e fica em segundo plano.
 *
 * ⚠️ Estas frases ⛔ **não** são verbatim ⛔ e ⛔ não afirmam conduta — dizem o
 * papel do dado na leitura das recomendações, ⛔ e nada além disso.
 */
export const MOTIVO_CLINICO: Readonly<Record<Insumo, string>> = {
  sitio_da_oclusao: "Necessário para definir as opções endovasculares.",
  nihss: "Necessário para as recomendações que qualificam a gravidade do déficit.",
  mrs_previo: "Necessário para as recomendações que consideram a incapacidade prévia.",
  aspects: "Necessário para as recomendações de circulação anterior.",
  pc_aspects: "Necessário para as recomendações de oclusão basilar.",
  idade: "Necessário para as recomendações que delimitam faixa etária.",
  /**
   * ⚠️ ⛔ Ele ⛔ não pede *"a janela"*: pede o **marco** de onde ela conta.
   * ⛔ Cada recomendação tem a sua, ⛔ e ⛔ não existe janela do módulo.
   */
  janela: "Necessário para saber se o caso ainda está dentro da janela de cada recomendação.",
  efeito_de_massa_ausente: "Leitura da imagem exigida por parte das recomendações de janela estendida.",
  deficit_incapacitante: "Distingue a população para quem a rapidez do tratamento foi estudada.",
  deficit_leve_nao_incapacitante:
    "Duas propriedades juntas — leve e não incapacitante — delimitam a recomendação de não trombolisar.",
  peso: "Sem peso não há dose. O app não estima peso.",
  agente_e_tenecteplase: "A recomendação de dose de 0,4 mg/kg só alcança quem considera tenecteplase.",
  /**
   * ⚠️⚠️ AS DUAS FRASES SÃO DIFERENTES, ⛔ e ⛔ NÃO por estilo.
   *
   * ⛔ Com o mesmo texto, o agrupamento mostra DUAS linhas idênticas — e o
   * médico ⛔ não tem como saber que são perguntas distintas, ⛔ nem qual delas
   * já respondeu. Encontrado na revisão em largura de celular.
   */
  dwi_menor_que_um_terco:
    "Extensão da lesão em DWI, para a trombólise de início desconhecido.",
  flair_sem_alteracao_marcada:
    "Ausência de alteração marcada no FLAIR — o segundo critério da mesma recomendação.",
  penumbra_salvavel: "Critério de tecido viável para a janela de 4,5 a 24 horas.",
  penumbra_por_perfusao_automatizada:
    "Critério de tecido viável para wake-up e 4,5 a 9 horas, e a fonte exige perfusão automatizada.",
  nao_elegivel_a_evt:
    "A fonte não define este critério — ver slot F-31. Não é indisponibilidade de serviço.",
};

/* ────────────────────────────────────────────────────────────────────────────
 * A AÇÃO DE TROMBÓLISE — ⛔ DECISÃO ⛔ NÃO É AÇÃO
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ A CADEIA INTEIRA, ⛔ E ⛔ NENHUM ELO SUBSTITUI O OUTRO:
 *
 *   recomendação → **decisão do agente** → **ação iniciada** → **realizada**
 *   → monitorização (Superfície G)
 *
 * ⛔ ⛔ `agente_trombolitico = Tenecteplase` ⛔ **NÃO** significa
 * `trombolise_iv = iniciada`, ⛔ e muito menos `realizada`.
 *
 * ⚠️⚠️ **DOIS CAMPOS DE AGENTE, ⛔ E ⛔ NÃO É REDUNDÂNCIA.**
 *
 * ⛔ `agente_trombolitico` é o agente **em consideração** — decisão. O agente da
 * **ação** é o que foi **efetivamente utilizado**. Eles divergem legitimamente:
 * decide-se TNK, ⛔ e por disponibilidade inicia-se alteplase. ⚠️ Com um campo
 * só, o app teria de **sobrescrever a decisão anterior** — ⛔ e a trilha perderia
 * que houve uma decisão diferente antes (PD-17).
 */
export const TROMBOLISE_IV = "trombolise_iv";

/**
 * ⚠️⚠️ O VOCABULÁRIO DE ESTADO É **UM SÓ** NO MÓDULO.
 *
 * ⛔ Importado da Superfície E em vez de reescrito: duas listas de estados de
 * ação divergiriam na primeira mudança (I6). ⚠️ E a regra de E vale aqui
 * inteira — `cancelada` ⛔ **nunca** é desfecho favorável ⛔ e ⛔ **não** conta
 * como tratamento realizado.
 */
export const ACAO_DE_TROMBOLISE: readonly CampoDeclarado[] = [
  {
    /**
     * ⚠️⚠️ O AGENTE **EFETIVAMENTE UTILIZADO** — ⛔ e ⛔ não o considerado.
     *
     * ⛔ *"Indefinido"* ⛔ não é opção aqui: quem iniciou a infusão iniciou com
     * **algum** agente. ⚠️ ⛔ Não saber qual é ausência de resposta, ⛔ e ⛔ não
     * um terceiro agente.
     */
    id: "ivt_agente_administrado",
    temporalidade: "estavel",
    instanciaDe: TROMBOLISE_IV,
    rotulo: "Agente efetivamente utilizado",
    tipo: "escolha",
    opcoes: ["Alteplase", "Tenecteplase"],
    fonte: "F-09",
    bloqueiaTerapia: false,
    nota: "Pode ser diferente do agente que estava em consideração. A decisão anterior não é corrigida por este registro.",
  },
  {
    id: "ivt_estado",
    temporalidade: "estado",
    instanciaDe: TROMBOLISE_IV,
    rotulo: "Situação da trombólise",
    tipo: "escolha",
    opcoes: OPCOES_ESTADO_DA_ACAO,
    fonte: "F-15",
    bloqueiaTerapia: false,
    nota: "Registre em que pé a administração está. Se ela começou antes desta tela, registre direto.",
  },
  {
    /**
     * ⚠️⚠️ O RELÓGIO DA TABLE 7 — ⛔ e ⛔ NENHUM OUTRO SERVE.
     *
     * ⛔ A monitorização começa *"during and after the IVT"*. ⛔ A hora da
     * **escolha do agente**, a hora em que a recomendação ficou aplicável, a
     * chegada ⛔ e o "agora" ⛔ **não** substituem este marco: cada um deles
     * deslocaria a fase da tabela para uma hora que ⛔ ninguém observou (E-52).
     */
    id: "ivt_inicio",
    temporalidade: "estavel",
    instanciaDe: TROMBOLISE_IV,
    rotulo: "Início da administração",
    tipo: "hora",
    relogio: "inicio_ivt",
    fonte: "F-15",
    bloqueiaTerapia: false,
    /** ⚠️ E-02: ⛔ ninguém anotou a hora é resposta, ⛔ e ⛔ não ausência de ação. */
    aceitaDesconhecido: true,
    nota: "A monitorização da Table 7 é contada a partir daqui. Sem este horário, a fase não é calculada.",
  },
];

/**
 * ── ⚠️⚠️ ⛔ O DOMÍNIO — ⛔ E ⛔ ELE É **ESTRUTURAL** ────────────────────────
 *
 * ⚠️ Decisão do autor, 2026-09-07:
 *
 * > *"`vereditoDaTrombectomia()` ⛔ só consolida recomendações cuja dimensão
 * >  seja **elegibilidade/seleção do paciente**. Recomendações de técnica,
 * >  dispositivo, anestesia, estratégia procedural ⛔ ou tratamento adjunto
 * >  podem existir no catálogo, ⛔ mas ⛔ não podem alterar elegibilidade."*
 *
 * ⛔ ⛔ E ⛔ **não** se deduz do id ⛔ nem de busca textual: ⛔ um
 * `id.startsWith("evt_tecnica_")` ⛔ seria a quinta varredura de texto desta
 * sessão — ⛔ e a quarta passou verde sobre defeito real.
 *
 * ⚠️ ⛔ O caso que a separação protege: **§4.7.4 rec. 5** diz que *stent
 * retrievers* ⛔ não beneficiam em vaso médio/distal. ⛔ Deixá-la entrar no
 * veredito faria o app **negar candidatura por causa de um dispositivo**.
 */
export type DominioDaRecomendacao = "elegibilidade" | "tecnica" | "procedimento";

/**
 * ⚠️⚠️ ⛔ A NOTA DE GENERALIZAÇÃO — ⛔ e ⛔ ela é **da recomendação**, ⛔ e ⛔ não
 * do módulo.
 *
 * ⛔ A guideline traz **duas**, com marcadores diferentes ⛔ e conteúdos
 * diferentes: a `*` (rec. 3) fala de insuficiência renal ⛔ e expectativa de
 * vida **<3 meses**; a `†` (rec. 4) fala de tortuosidade vascular, crises no
 * início ⛔ e expectativa de vida **<6 meses**.
 *
 * ⚠️⚠️ ⛔ **⛔ NÃO É CONTRAINDICAÇÃO.** ⛔ *"Limited generalizability"* ⛔ não é
 * *"⛔ não elegível"*: ⛔ é julgamento clínico necessário, ⛔ e ⛔ o veredito
 * ⛔ não a usa para negar ⛔ nada.
 */
export type NotaDeGeneralizacao = {
  /** ⚠️ O marcador da fonte — ⛔ e ⛔ ele identifica **qual** nota é. */
  readonly marcador: "*" | "†";
  readonly verbatim: string;
};

export type Recomendacao = {
  readonly id: string;
  readonly slot: string;
  readonly localizacao: string;
  readonly terapia: "ivt" | "evt";
  /** ⚠️⚠️ ⛔ Obrigatório: ⛔ domínio ausente ⛔ não é *"elegibilidade"* — ⛔ é decisão ⛔ não tomada. */
  readonly dominio: DominioDaRecomendacao;
  /** ⚠️ ⛔ Só onde a fonte a escreve — ⛔ e ⛔ presa a **esta** recomendação. */
  readonly generalizacao?: NotaDeGeneralizacao;
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
  /**
   * ⚠️⚠️⚠️ O QUE CADA INSUMO EXIGIDO PRECISA **VALER** — ⛔ e ⛔ sem ⛔ isto o
   * motor conclui por **presença**.
   *
   * ⛔ ⛔ Ausente, a leitura cai na semântica antiga: *"o dado está lá?"*.
   * ⚠️ ⛔ Isso é de propósito, ⛔ e ⛔ é o **§50**: as recomendações de **IVT**
   * ⛔ não declaram `criterios`, ⛔ e ⛔ por isso ⛔ nenhuma delas muda de
   * comportamento. ⛔ A camada é a mesma; a exigência é ⛔ só de quem a assume.
   *
   * ⚠️ ⛔ Há **prova** de que toda recomendação de elegibilidade de EVT declara
   * os seus, ⛔ e de que ⛔ nenhum insumo exigido fica sem critério que o julgue.
   */
  readonly criterios?: CriteriosDaRecomendacao;
  /**
   * ⚠️⚠️ A FRASE INTEIRA DA FONTE — ⛔ e ⛔ ela é a **procedência dos números**.
   *
   * ⛔ **E-31**: ⛔ nenhum número clínico sem verbatim. ⛔ Com os cortes virando
   * dado, cada `min`/`max` precisa de uma frase ao lado de onde conferi-lo.
   */
  readonly verbatim?: string;
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
    dominio: "elegibilidade",
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
    dominio: "elegibilidade",
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
    dominio: "elegibilidade",
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
    dominio: "elegibilidade",
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
    dominio: "elegibilidade",
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
    dominio: "elegibilidade",
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
    dominio: "elegibilidade",
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
    dominio: "elegibilidade",
    cor: "1",
    loe: "A",
    verbo: "is recommended",
    populacao: "LVO proximal de ICA ou M1",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    verbatim:
      "In patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting within 6 hours from onset of symptoms, with NIHSS score \u22656, prestroke mRS score of 0 to 1, and ASPECTS 3 to 10, EVT is recommended to improve functional clinical outcomes and reduce mortality.",
    criterios: {
      sitio_da_oclusao: { in: ["ica", "m1"] },
      janela: { usaJanelasDaRecomendacao: true },
      nihss: { min: 6 },
      mrs_previo: { min: 0, max: 1 },
      aspects: { min: 3, max: 10 },
    },
    exige: ["sitio_da_oclusao", "janela", "nihss", "mrs_previo", "aspects"],
  },
  {
    id: "evt_ant_2",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 2 · p. e368",
    terapia: "evt",
    dominio: "elegibilidade",
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
    verbatim:
      "In patients with AIS from anterior circulation proximal LVO of the ICA or M1 presenting between 6 and 24 hours from onset of symptoms, with NIHSS score \u22656, prestroke mRS score 0 to 1 and ASPECTS \u22656, EVT is recommended to improve functional clinical outcomes and reduce mortality.",
    criterios: {
      sitio_da_oclusao: { in: ["ica", "m1"] },
      janela: { usaJanelasDaRecomendacao: true },
      nihss: { min: 6 },
      mrs_previo: { min: 0, max: 1 },
      aspects: { min: 6 },
    },
    exige: ["sitio_da_oclusao", "janela", "nihss", "mrs_previo", "aspects"],
  },
  {
    id: "evt_ant_3",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 3 · p. e368",
    terapia: "evt",
    dominio: "elegibilidade",
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
    /**
     * ── ⚠️⚠️ A NOTA `*` — ⛔ e ⛔ ela é **desta** recomendação ─────────────
     *
     * ⛔ Os ensaios que a sustentam (ANGEL-ASPECTS, SELECT2) **excluíram ⛔ ou
     * sub-representaram** grupos específicos. ⚠️ ⛔ Isso ⛔ **não** é
     * contraindicação: ⛔ é *"limited generalizability"*, ⛔ e a diferença é a
     * diferença entre *"⛔ não trate"* ⛔ e *"julgue com cuidado"*.
     *
     * ⚠️⚠️ ⛔ E ⛔ ELA ⛔ NÃO É A NOTA DA REC. 4: ⛔ aqui a expectativa de vida é
     * **<3 meses** ⛔ e há insuficiência renal ⛔ e hipertensão refratária;
     * ⛔ lá são **<6 meses**, tortuosidade ⛔ e estenose intracraniana.
     */
    generalizacao: {
      marcador: "*",
      verbatim:
        "Limited generalizability in specific subpopulations: Specific patient groups were underrepresented or excluded in the trials supporting this recommendation. Consequently, the applicability of these findings is limited in individuals >80 years, those with renal failure, patients with refractory hypertension (SBP \u2265185 mm Hg or DBP \u2265110 mm Hg), comorbid psychiatric or medical illnesses that confound neurological assessments, or patients with a life expectancy <3 months.",
    },
    verbatim:
      "In selected patients* with AIS from anterior circulation proximal LVO of the ICA or M1, presenting between 6 and 24 hours from onset of symptoms, with age <80 years, NIHSS score \u22656, prestroke mRS score 0 to 1, ASPECTS 3 to 5, and without significant mass effect on imaging, EVT is recommended to improve functional clinical outcomes and reduce mortality.",
    criterios: {
      sitio_da_oclusao: { in: ["ica", "m1"] },
      janela: { usaJanelasDaRecomendacao: true },
      /** ⚠️⚠️ *"age <80 years"* — ⛔ estrito, ⛔ e ⛔ `≤79` ⛔ não é a mesma frase. */
      idade: { maxExclusivo: 80 },
      nihss: { min: 6 },
      mrs_previo: { min: 0, max: 1 },
      aspects: { min: 3, max: 5 },
      efeito_de_massa_ausente: { exigeAusencia: true },
    },
    exige: ["sitio_da_oclusao", "janela", "idade", "nihss", "mrs_previo", "aspects", "efeito_de_massa_ausente"],
  },
  {
    id: "evt_ant_4",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 4 · p. e368",
    terapia: "evt",
    dominio: "elegibilidade",
    cor: "2a",
    loe: "B-R",
    verbo: "is reasonable",
    populacao: "selected patients† · LVO de ICA ou M1, idade <80",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    /**
     * ── ⚠️⚠️ A NOTA `†` — ⛔ e ⛔ ela vem do **LASTE** ────────────────────
     *
     * ⛔ O ensaio de ASPECTS 0–2 excluiu ⛔ **outros** grupos: tortuosidade de
     * vasos cervicais/cranianos, crises no início que impeçam NIHSS acurado,
     * suspeita forte de estenose intracraniana ⛔ e expectativa de vida
     * **<6 meses**.
     *
     * ⚠️⚠️ ⛔ Fundir com a nota `*` inventaria critério para as duas
     * populações — ⛔ e ⛔ há mutação que mata a troca.
     */
    generalizacao: {
      marcador: "†",
      verbatim:
        "Limited generalizability in specific subpopulations: Specific patient groups were underrepresented or excluded in the trials supporting this recommendation. Consequently, the applicability of these findings is limited in individuals >80 years, those with significant head and neck vessel tortuosity, comorbid psychiatric or medical conditions that confound neurological assessments, seizures at stroke onset that hinder accurate NIHSS evaluations, a strong suspicion of underlying intracranial stenosis, or a life expectancy <6 months.",
    },
    verbatim:
      "In selected patients\u2020 with AIS from anterior circulation proximal LVO of the ICA or M1 presenting within 6 hours from onset of symptoms, with age <80 years, NIHSS score \u22656, prestroke mRS 0 to 1, ASPECTS 0 to 2, and without significant mass effect on imaging, EVT is reasonable to improve functional clinical outcomes and reduce mortality.",
    criterios: {
      sitio_da_oclusao: { in: ["ica", "m1"] },
      janela: { usaJanelasDaRecomendacao: true },
      idade: { maxExclusivo: 80 },
      nihss: { min: 6 },
      mrs_previo: { min: 0, max: 1 },
      aspects: { min: 0, max: 2 },
      efeito_de_massa_ausente: { exigeAusencia: true },
    },
    exige: ["sitio_da_oclusao", "janela", "idade", "nihss", "mrs_previo", "aspects", "efeito_de_massa_ausente"],
  },
  {
    id: "evt_ant_5",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 5 · p. e368",
    terapia: "evt",
    dominio: "elegibilidade",
    cor: "2a",
    loe: "B-NR",
    verbo: "is reasonable",
    populacao: "LVO de ICA ou M1 com incapacidade prévia leve (mRS 2)",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    /**
     * ── ⚠️⚠️ ⛔ `aspects` FALTAVA, ⛔ E O VERBATIM O EXIGE ──────────────────
     *
     * > *"…with NIHSS score ≥6, **and ASPECTS ≥6**, who have a prestroke mRS
     * >  score of 2, EVT is reasonable…"*
     *
     * ⛔ ⛔ Sem ⛔ ele, um paciente com **ASPECTS 2** fecharia esta recomendação
     * — ⛔ um critério que a fonte ⛔ exige, ⛔ e que o motor ⛔ não cobrava.
     * ⚠️ Achado na conferência da Fase 9 contra o PDF da AHA/ASA 2026.
     */
    verbatim:
      "In patients with AIS from anterior circulation proximal LVO of the ICA or M1 presenting within 6 hours from onset of symptoms, with NIHSS score \u22656, and ASPECTS \u22656, who have a prestroke mRS score of 2, EVT is reasonable to improve functional clinical outcomes and reduce accumulated disability.",
    criterios: {
      sitio_da_oclusao: { in: ["ica", "m1"] },
      janela: { usaJanelasDaRecomendacao: true },
      nihss: { min: 6 },
      aspects: { min: 6 },
      /** ⚠️⚠️ *"a prestroke mRS score **of 2**"* — ⛔ exatamente 2. */
      mrs_previo: { min: 2, max: 2 },
    },
    exige: ["sitio_da_oclusao", "janela", "nihss", "mrs_previo", "aspects"],
  },
  {
    id: "evt_ant_6",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 6 · p. e369",
    terapia: "evt",
    dominio: "elegibilidade",
    cor: "2b",
    loe: "B-NR",
    verbo: "might be reasonable",
    populacao: "LVO de ICA ou M1 com incapacidade prévia moderada (mRS 3–4)",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    verbatim:
      "In patients with AIS from anterior circulation proximal LVO of the ICA or M1 presenting within 6 hours from onset of symptoms, with NIHSS score \u22656, and ASPECTS of \u22656, who have a prestroke mRS score of 3 to 4, EVT might be reasonable to improve functional clinical outcomes and reduce accumulated disability.",
    criterios: {
      sitio_da_oclusao: { in: ["ica", "m1"] },
      janela: { usaJanelasDaRecomendacao: true },
      nihss: { min: 6 },
      aspects: { min: 6 },
      mrs_previo: { min: 3, max: 4 },
    },
    exige: ["sitio_da_oclusao", "janela", "nihss", "mrs_previo", "aspects"],
  },
  {
    id: "evt_m2_dominante",
    slot: "F-08",
    localizacao: "§4.7.2 rec. 7 · p. e369",
    terapia: "evt",
    dominio: "elegibilidade",
    cor: "2a",
    loe: "B-NR",
    verbo: "is reasonable, but the benefits are uncertain",
    populacao: "oclusão da divisão M2 proximal DOMINANTE da ACM",
    janelas: [
      { marco: "symptom_onset", ateHoras: 6, verbatim: "within 6 hours from onset of symptoms" },
    ],
    verbatim:
      "In patients with AIS from occlusion of the dominant proximal M2 division of the MCA presenting within 6 hours from onset of symptoms with a prestroke mRS score of 0 to 1, NIHSS score of \u22656, and ASPECTS of \u22656, EVT is reasonable to improve functional outcomes, but the benefits are uncertain.",
    criterios: {
      /** ⚠️⚠️ **SÓ** M2 dominante — ⛔ a ⛔ não dominante é outra recomendação, ⛔ e COR 3. */
      sitio_da_oclusao: { in: ["m2_dominante"] },
      janela: { usaJanelasDaRecomendacao: true },
      mrs_previo: { min: 0, max: 1 },
      nihss: { min: 6 },
      aspects: { min: 6 },
    },
    exige: ["sitio_da_oclusao", "janela", "nihss", "mrs_previo", "aspects"],
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
    dominio: "elegibilidade",
    cor: "3: No Benefit",
    loe: "A",
    verbo: "is not recommended",
    populacao:
      "M2 proximal NÃO dominante ou codominante · ACM distal · ACA · ACP",
    /**
     * ⚠️⚠️⚠️ A JANELA VEM DO **CABEÇALHO DA TABELA**, ⛔ e ⛔ isso é fonte.
     *
     * ── ⚠️⚠️ ⛔ EU DEIXEI VAZIO, ⛔ E O AUTOR CORRIGIU (2026-09-07) ─────────
     *
     * ⛔ ⛔ A **frase** da rec. 8 ⛔ não repete a janela, ⛔ e eu tratei ⛔ isso
     * como ausência. ⚠️ ⛔ A linha ⛔ imediatamente acima dela na tabela é
     * explícita, ⛔ e ⛔ ela é parte da recomendação, ⛔ não decoração.
     *
     * ⚠️⚠️ ⛔ E a consequência clínica era grande: ⛔ sem janela, um M2 ⛔ não
     * dominante de **30 horas** recebia *"⛔ não recomendada para melhorar
     * desfecho"* de uma recomendação que a fonte limita às **primeiras seis**.
     */
    janelas: [
      {
        marco: "symptom_onset",
        ateHoras: 6,
        verbatim:
          "Thrombectomy 0 to 6 hours for nondominant proximal M2 division MCA, distal MCA, anterior cerebral artery, and posterior cerebral artery occlusions",
      },
    ],
    verbatim:
      "In patients with AIS from occlusion of the proximal nondominant or codominant division proximal M2 segment of the MCA, or distal MCA, anterior cerebral artery (ACA), or posterior cerebral artery (PCA), EVT is not recommended to improve functional outcomes.",
    criterios: {
      /**
       * ⚠️⚠️ OS QUATRO TERRITÓRIOS DA FRASE, ⛔ e ⛔ nenhum a mais.
       *
       * ⛔ ⛔ Sem ⛔ isto, ela alcançava **M1** ⛔ e **basilar** — ⛔ e um paciente
       * com ⛔ só o sítio anotado recebia veredito **negativo** por uma
       * recomendação escrita para outra anatomia.
       */
      sitio_da_oclusao: { in: ["m2_nao_dominante", "acm_distal", "aca", "acp"] },
      janela: { usaJanelasDaRecomendacao: true },
    },
    exige: ["sitio_da_oclusao", "janela"],
  },
  /**
   * ── ⚠️⚠️ ⛔ RECOMENDAÇÃO DE **TÉCNICA**, ⛔ E ⛔ NÃO DE ELEGIBILIDADE ──────
   *
   * ⚠️ §4.7.4 rec. 5 · e373 — ⛔ e ⛔ ela é sobre **dispositivo**:
   *
   * > *"In patients with AIS from occlusion of medium or distal vessels of the
   * >  anterior, middle (nondominant or codominant M2, M3), or posterior
   * >  cerebral arteries, EVT **with stent retrievers** is of no benefit for
   * >  improving functional outcomes."*
   *
   * ⚠️⚠️ ⛔ ELA ⛔ NÃO DUPLICA A REC. 8 DE §4.7.2, ⛔ e ⛔ a diferença é o
   * sujeito: ⛔ aquela diz que **a EVT** ⛔ não beneficia naqueles sítios;
   * ⛔ **esta** diz que **o stent retriever** ⛔ não beneficia. ⛔ Uma fala de
   * candidatura, ⛔ a outra de **como** se faria.
   *
   * ⛔ ⛔ E ⛔ por isso `dominio: "tecnica"`: ⛔ deixá-la entrar no veredito faria
   * o app **negar candidatura por causa de um dispositivo** — ⛔ e a fonte
   * ⛔ não escreve isso.
   */
  {
    id: "evt_tecnica_stent_retriever_distal",
    slot: "F-08",
    localizacao: "§4.7.4 rec. 5 · p. e373",
    terapia: "evt",
    dominio: "tecnica",
    cor: "3: No Benefit",
    loe: "A",
    verbo: "is of no benefit for improving functional outcomes",
    populacao:
      "oclusão de vaso médio ou distal — M2 não dominante ou codominante, M3, cerebral anterior ou posterior",
    janelas: [],
    verbatim:
      "In patients with AIS from occlusion of medium or distal vessels of the anterior, middle (nondominant or codominant M2, M3), or posterior cerebral arteries, EVT with stent retrievers is of no benefit for improving functional outcomes.",
    /**
     * ⚠️⚠️⚠️ ELA **TEM** POPULAÇÃO — ⛔ o que ⛔ ela ⛔ não tem é veredito.
     *
     * ── ⚠️⚠️ ⛔ EU ERREI ⛔ ANTES, ⛔ E A GUARDA ME PEGOU (2026-09-07) ────────
     *
     * ⛔ ⛔ Eu escrevi `exige: []` raciocinando que *"ela ⛔ não seleciona
     * paciente"*. ⚠️ ⛔ A prova da Superfície F derrubou isso, ⛔ e estava certa:
     * ⛔ recomendação **negativa** com zero insumos sai `aplicavel` no estado
     * **vazio** — ⛔ o app anunciaria *"stent retriever ⛔ não beneficia"* a
     * ⛔ todo paciente, ⛔ inclusive a um sobre quem ⛔ nada se sabe.
     *
     * ⚠️⚠️ ⛔ A frase da fonte **nomeia territórios**, ⛔ e são ⛔ exatamente os
     * quatro que o campo do laudo sabe descrever. ⛔ O `dominio: "tecnica"` a
     * mantém fora do **veredito**; ⛔ o critério anatômico a mantém fora dos
     * **pacientes de outra anatomia**. ⛔ São duas travas, ⛔ e ⛔ elas ⛔ não se
     * substituem.
     */
    criterios: {
      sitio_da_oclusao: { in: ["m2_nao_dominante", "acm_distal", "aca", "acp"] },
    },
    exige: ["sitio_da_oclusao"],
  },


  // ── EVT · circulação posterior ─────────────────────────────────────────
  {
    id: "evt_basilar_1",
    slot: "F-08",
    localizacao: "§4.7.3 rec. 1 · p. e372",
    terapia: "evt",
    dominio: "elegibilidade",
    cor: "1",
    loe: "A",
    verbo: "is recommended",
    populacao: "oclusão de artéria basilar",
    janelas: [
      { marco: "symptom_onset", ateHoras: 24, verbatim: "within 24 hours from onset of symptoms" },
    ],
    verbatim:
      "In patients with AIS, with basilar artery occlusion, a baseline mRS score of 0 to 1, NIHSS score \u226510 at presentation, and PC-ASPECTS \u22656 (mild ischemic damage), EVT within 24 hours from onset of symptoms is recommended to achieve better functional outcome and reduce mortality.",
    criterios: {
      sitio_da_oclusao: { in: ["basilar"] },
      janela: { usaJanelasDaRecomendacao: true },
      mrs_previo: { min: 0, max: 1 },
      /** ⚠️⚠️ **≥10** — ⛔ e ⛔ não o ≥6 da circulação anterior. */
      nihss: { min: 10 },
      pc_aspects: { min: 6 },
    },
    exige: ["sitio_da_oclusao", "janela", "nihss", "mrs_previo", "pc_aspects"],
  },
  {
    id: "evt_basilar_2",
    slot: "F-08",
    localizacao: "§4.7.3 rec. 2 · p. e372",
    terapia: "evt",
    dominio: "elegibilidade",
    cor: "2b",
    loe: "B-R",
    verbo: "is not well established",
    populacao: "oclusão de artéria basilar, NIHSS 6–9",
    janelas: [
      { marco: "symptom_onset", ateHoras: 24, verbatim: "within 24 hours" },
    ],
    verbatim:
      "In patients with AIS, with basilar artery occlusion, a baseline mRS score of 0 to 1, NIHSS score 6 to 9 at presentation, and PC-ASPECTS \u22656 (mild ischemic damage) the effectiveness of EVT within 24 hours to improve functional outcomes and reduce mortality is not well established.",
    criterios: {
      sitio_da_oclusao: { in: ["basilar"] },
      janela: { usaJanelasDaRecomendacao: true },
      mrs_previo: { min: 0, max: 1 },
      /** ⚠️⚠️ A FAIXA **6–9**, fechada dos dois lados — 10 é a COR 1. */
      nihss: { min: 6, max: 9 },
      pc_aspects: { min: 6 },
    },
    exige: ["sitio_da_oclusao", "janela", "nihss", "mrs_previo", "pc_aspects"],
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
  verbatim:
    "In patients with AIS who are eligible for both IVT and EVT, IVT should be administered as rapidly as possible, without observation, to assess clinical response or delay in initiating EVT, to improve treatment times and clinical outcomes.",
  /**
   * ⚠️⚠️ A FRASE QUE A TELA MOSTRA **QUANDO AS DUAS ESTÃO INDICADAS** — ⛔ e ⛔ é
   * ⛔ só aí que ela aparece.
   *
   * ⛔ ⛔ Permanente, ela viraria aviso de fundo ⛔ e pararia de ser lida.
   * ⚠️ ⛔ No momento em que o médico tem **duas** indicações na tela, ela é a
   * única coisa que impede o erro que a fonte nomeia: **esperar a resposta à
   * trombólise antes de chamar a sala de hemodinâmica**.
   */
  frase:
    "Não aguardar resposta clínica à trombólise para prosseguir com a trombectomia.",
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

/**
 * ── ⚠️⚠️ A DECISÃO DE PROSSEGUIR — ⛔ o degrau que faltava ────────────────
 *
 * ⚠️ Decisão do autor, 2026-09-07, ⛔ depois de um erro **meu** de arquitetura:
 *
 * > *"o sistema pode bloquear uma decisão **prospectiva**, ⛔ mas ⛔ não pode
 * >  bloquear o registro **retrospectivo** de um fato clínico já ocorrido."*
 *
 * ── ⚠️⚠️ ⛔ O ERRO QUE ISTO CORRIGE, ⛔ E ⛔ ELE ERA GRAVE ──────────────────
 *
 * ⛔ Eu pus o portão da IVT em `avc-nova-trombolise` — ⛔ que é o bloco
 * **"Trombólise administrada"**, ⛔ ou seja, ⛔ o **registro de que aconteceu**.
 * ⚠️ Seis e2e quebraram, ⛔ e ⛔ eles estavam certos: o app passava a **recusar
 * documentar** uma trombólise já dada.
 *
 * ⛔ ⛔ E o preço ⛔ ia além da trilha: a monitorização da **Table 7** (Superfície
 * G) nasce ⛔ **desse** registro. ⛔ Bloquear o registro parava a monitorização
 * ⛔ de um paciente ⛔ que ⛔ já tinha recebido o trombolítico.
 *
 * ── ⚠️ OS QUATRO MOMENTOS, ⛔ E ⛔ ELES SÃO INDEPENDENTES ──────────────────
 *
 * ⛔ `motor recomenda` ≠ `médico decidiu` ≠ `medicação foi administrada` ≠
 * `monitorização`. ⚠️ ⛔ Este campo é o **segundo**, ⛔ e ⛔ ele ⛔ nunca fala
 * pelos outros três.
 *
 * ⚠️⚠️ ⛔ E *"⛔ não prosseguir"* É DECISÃO, ⛔ e ⛔ não ausência: ⛔ silêncio aqui
 * ⛔ é *"⛔ ainda ⛔ não decidiu"*, ⛔ e ⛔ os dois ⛔ não podem colapsar
 * (**E-37**).
 */
export const DECISAO_DE_PROSSEGUIR: readonly CampoDeclarado[] = [
  {
    id: "ivt_indicacao_confirmada",
    temporalidade: "estado",
    rotulo: "Decisão sobre prosseguir com a trombólise",
    tipo: "escolha",
    opcoes: ["Prosseguir com a trombólise", "Não prosseguir"],
    /**
     * ⚠️ **F-02** sustenta a existência do gesto: ⛔ é ⛔ ela que manda tratar
     * ⛔ o mais rápido possível, ⛔ e ⛔ é ⛔ dela que a decisão é o passo
     * operacional. ⛔ O campo ⛔ não traz número ⛔ nem corte — ⛔ ele registra
     * **quem decidiu, ⛔ e quando**.
     */
    fonte: "F-02",
    /**
     * ⚠️⚠️ ⛔ `false`, ⛔ e ⛔ isso ⛔ não é contradição com o portão. ⛔ O portão
     * governa **este gesto**; ⛔ ele ⛔ não retém terapia ⛔ nenhuma, ⛔ e ⛔ o
     * registro do que foi administrado segue **sempre livre** (**E-49**).
     */
    bloqueiaTerapia: false,
    nota: "Registra a decisão clínica de prosseguir. Não é a administração, e não substitui o registro do que foi feito.",
  },
];


/** ⚠️ Doses sustentadas por F-09. ⛔ **Preparo e administração ⛔ NÃO entram aqui.** */
export const DOSES = {
  alteplase: { mgPorKg: 0.9, maximoMg: 90, slot: "F-09" },
  tenecteplase: { mgPorKg: 0.25, maximoMg: 25, slot: "F-09" },
} as const;
