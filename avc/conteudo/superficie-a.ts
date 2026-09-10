/**
 * CONTEÚDO DA SUPERFÍCIE A — Entrada e estabilização.
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma cor, ⛔ nenhuma decisão de tela.
 * A medicina mora aqui e a superfície apenas a renderiza (E-29).
 *
 * ⚠️ Todo campo declara `bloqueiaTerapia: false`. Isso ⛔ não é decoração: é a
 * aplicação de **E-49** — nenhum campo obrigatório novo pode ser criado sem
 * checagem contra as doze marcas 🚫, e a Superfície A ⛔ não cria nenhum.
 */

import type { SuperficieId } from "../nucleo/tipos";
import type { Campo, CampoDeclarado, Grupo, GrupoDeclarado } from "./campo";
import { CAMPO_DO_PACIENTE } from "./paciente";

/**
 * ⚠️ A FORMA DO CAMPO SAIU DAQUI (2026-08-28) e mora em `./campo`.
 *
 * Enquanto existia uma superfície só, tipo e conteúdo podiam morar juntos. Com
 * a Superfície B, `valorDaOpcao` nasceria em duas cópias — e o comentário dela
 * descreve o que acontece quando divergem: rótulo cru no estado, lido como
 * "não". ⛔ Não trazer de volta.
 *
 * ⚠️ O NOME `CampoA` PERMANECE porque é o vocabulário desta superfície e do que
 * a lê. É apelido do tipo único, ⛔ não um segundo tipo.
 */
/**
 * ⚠️ O que se ESCREVE aqui — a **casa** ⛔ não entra: ela é carimbada por
 * `comCasa()` no fim do arquivo, uma vez, para todos os campos do módulo.
 */
export type CampoA = CampoDeclarado;
export type { Faixa, TipoDeCampo } from "./campo";
export {
  EXCLUSIVAS_PADRAO,
  NAO_SEI,
  SEM_ACHADOS,
  SIM_NAO_INCERTO,
  SIM_NAO_NAO_SEI,
  opcaoDoValor,
  valorDaOpcao,
} from "./campo";

import { camposDoGrupo, comCasa, EXCLUSIVAS_PADRAO, NAO_SEI, SEM_ACHADOS, SIM_NAO_INCERTO, SIM_NAO_NAO_SEI } from "./campo";


/**
 * VIA AÉREA E OXIGENAÇÃO — o primeiro bloco depois dos relógios (§7.3).
 *
 * ⚠️ ORDEM DELIBERADA: os dois gatilhos clínicos vêm ANTES da SpO₂. A fonte
 * indica oxigênio pela **presença de hipoxemia**, e a SpO₂ é acompanhamento —
 * pôr o número primeiro convidaria a derivar hipoxemia dele, que é o erro que
 * `oxigenio()` existe para não cometer.
 */
export const VIA_AEREA_A: readonly CampoA[] = [
  {
    id: "consciencia_rebaixada",
    temporalidade: "afericao",
    rotulo: "Nível de consciência rebaixado",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    /**
     * ⚠️⚠️ POR QUE ⛔ NÃO É UMA CALCULADORA DE GLASGOW — pergunta do autor,
     * 2026-08-28.
     *
     * 1 · **A fonte ⛔ não menciona Glasgow uma única vez.** Varredura no
     *     verbatim inteiro da AHA/ASA 2026: zero ocorrências. O instrumento que
     *     ela recomenda é outro — *"a stroke severity rating scale, preferably
     *     the NIHSS"* (F-13, COR 1 · B-NR);
     * 2 · **o nível de consciência já é medido pelo NIHSS**, itens 1a/1b/1c, e
     *     esses itens são coletados na Superfície B. Uma segunda escala aqui
     *     mediria a mesma coisa com outro número, e duas medidas do mesmo achado
     *     divergem — é a I6 aplicada a escore em vez de dose;
     * 3 · **o que a fonte usa aqui ⛔ não é escore, é gatilho**: §4.1 rec. 1 diz
     *     *"decreased consciousness or bulbar dysfunction"* e ⛔ **não define
     *     corte nenhum**. Transformar em número exigiria escolher o ponto de
     *     corte — que seria meu, ⛔ não da fonte (E-31).
     *
     * ⚠️ O Glasgow segue existindo no app para o contexto em que ele é o
     * instrumento (TCE). ⛔ Trazê-lo para o AVC seria importar a escala errada
     * para a doença errada.
     */
    /**
     * ⚠️ ⛔ SEM `ajuda` — retirada a pedido do autor em 2026-08-29. A frase
     * explicava por que ⛔ não há Glasgow aqui, e explicação de PROJETO ⛔ não é
     * conteúdo de atendimento: `ajuda` existe só para o que muda a RESPOSTA
     * (§7.3). A pergunta é clara sozinha, e o porquê ficou onde se consulta —
     * na nota do ⓘ e no comentário acima.
     */
    fonte: "F-23",
    bloqueiaTerapia: false,
    nota: "A escala recomendada no AVC é o NIHSS, e o nível de consciência entra nela pelos itens 1a, 1b e 1c. A fonte não define corte e não usa Glasgow no AVC isquêmico.",
  },
  {
    id: "disfuncao_bulbar",
    temporalidade: "afericao",
    /**
     * ⚠️⚠️ O NOME TÉCNICO SAIU DA PERGUNTA — pedido do autor, 2026-08-28:
     * *"disfunção bulbar não poderia tirar esse nome e colocar algo de fácil
     * entendimento e para clicar em disfunções que podem ter?"*.
     *
     * "Disfunção bulbar" é termo de neurologista, e I1 já dizia a regra:
     * **pergunte o que se vê, ⛔ não a classificação**. Quem ⛔ não domina o termo
     * PARA NA PALAVRA e ⛔ não chega aos sinais que vinham logo depois — que era
     * exatamente o que estava escondido dentro da `ajuda`.
     *
     * ⚠️⚠️ E É SELEÇÃO MÚLTIPLA porque os achados COEXISTEM (§7.6): o mesmo
     * paciente engasga, acumula saliva e tosse fraco. Escolha única obrigaria a
     * eleger um entre os que ele está vendo ao mesmo tempo.
     *
     * ⛔⛔ ISTO ⛔ NÃO É ALGORITMO DIAGNÓSTICO, e ⛔ não existe contagem: **um
     * único achado já justifica proteger a via aérea**, e ⛔ nenhum deles exclui
     * nada. A fonte nomeia o gatilho (*"bulbar dysfunction"*) e ⛔ não lista
     * sinais nem cortes — a lista é exemplificação para o médico reconhecer do
     * que se trata, e a conclusão continua sendo dele.
     */
    rotulo: "Dificuldade para proteger a via aérea",
    tipo: "multipla",
    opcoes: [
      "Dificuldade para engolir",
      "Acúmulo de saliva ou secreção",
      "Tosse fraca ou ineficaz",
      "Voz ou fala arrastada",
      "Engasgo com saliva ou água",
      SEM_ACHADOS,
      NAO_SEI,
    ],
    exclusivas: EXCLUSIVAS_PADRAO,
    ajuda: "Marque tudo o que estiver presente. Um único achado já pesa, e a lista não é uma pontuação.",
    fonte: "F-23",
    bloqueiaTerapia: false,
    nota: "A fonte nomeia disfunção bulbar como um dos dois gatilhos para suporte de via aérea, junto com o rebaixamento de consciência. Ela não lista sinais nem define corte.",
  },
] as const;

/**
 * ⚠️⚠️ **B · RESPIRAÇÃO E OXIGENAÇÃO** — separado da via aérea em 2026-08-30, com
 * a moldura ABCDE.
 *
 * ⚠️ Os quatro campos moravam num bloco só, *"Via aérea e oxigenação"*. ⛔ Eles ⛔ não
 * são a mesma pergunta: **via aérea** é se ela está protegida; **respiração** é
 * se a troca está acontecendo. ⚠️ Na mnemônica são **letras diferentes**, e é
 * justamente por isso que ela existe.
 *
 * ⛔ ⛔ NENHUM campo foi criado, removido ou reescrito. ⛔ Só mudou o bloco em que
 * cada um aparece.
 */
export const RESPIRACAO_A: readonly CampoA[] = [
  {
    id: "hipoxia",
    temporalidade: "afericao",
    /**
     * ⚠️⚠️ A PERGUNTA MUDOU, E A MUDANÇA É CLÍNICA. "Há hipóxia?" é vaga: hipóxia
     * tecidual não se responde à beira do leito. O que o médico consegue afirmar
     * — e o que a recomendação usa — é **hipoxemia** ou a **necessidade clínica
     * de oxigênio**.
     */
    rotulo: "Há hipoxemia ou necessidade clínica de oxigênio?",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    /**
     * ⚠️⚠️ ⛔ NÃO DERIVAR HIPOXEMIA DE `SpO₂ <94%`. O `>94%` da fonte é **meta de
     * tratamento para quem já tem hipóxia**, e a fonte ⛔ não define corte
     * numérico nenhum para caracterizá-la (§6.1, F-23). Transformar a meta em
     * corte inventaria um limite que o documento não escreve — e é por isso que
     * esta pergunta é do médico e não do sistema.
     */
    ajuda:
      "Considere avaliação clínica e oximetria. A AHA/ASA recomenda O₂ quando há hipóxia visando SpO₂ >94%, mas não define um corte numérico único para caracterizar hipóxia.",
    fonte: "F-23",
    bloqueiaTerapia: false,
    nota: "É a presença de hipóxia que indica oxigênio — não o número isolado.",
  },
  {
    id: "spo2",
    temporalidade: "afericao",
    rotulo: "SpO₂",
    tipo: "grandeza",
    unidade: "%",
    // ⚠️ 50 como piso da barra ⛔ não é "SpO₂ mínima compatível com a vida": é só
    // onde a trilha começa. Partida em 96 = posição de descanso, ⛔ não normal.
    faixa: { min: 50, max: 100, passo: 1 },
    fonte: "F-23",
    bloqueiaTerapia: false,
    nota: "A meta de 94% vale para quem tem hipóxia. A fonte não define corte numérico de hipóxia.",
  },
] as const;

/** PRESSÃO ARTERIAL — registrada aqui; ⛔ nenhuma meta nasce nesta superfície. */
export const PRESSAO_A: readonly CampoA[] = [
  {
    id: "pas",
    temporalidade: "afericao",
    /**
     * ⚠️⚠️ AS DUAS METADES DE **UMA** AFERIÇÃO (D-120). Sem a instância, a
     * trilha guardava quatro números para duas medidas e ⛔ nenhuma indicação
     * de quais dois foram medidos juntos — e a leitura podia compor uma PA que
     * ⛔ nunca existiu.
     */
    instanciaDe: "pa",
    rotulo: "Pressão sistólica",
    tipo: "grandeza",
    unidade: "mmHg",
    // ⚠️ Teto 300: emergência hipertensiva passa de 260 com frequência, e barra
    // curta demais obrigaria a registrar um número menor que o real.
    faixa: { min: 60, max: 300, passo: 1 },
    fonte: "F-04",
    bloqueiaTerapia: false,
    nota: "Registrada aqui. A meta depende do contexto de reperfusão, que esta superfície não define.",
  },
  {
    id: "pad",
    temporalidade: "afericao",
    /**
     * ⚠️⚠️ AS DUAS METADES DE **UMA** AFERIÇÃO (D-120). Sem a instância, a
     * trilha guardava quatro números para duas medidas e ⛔ nenhuma indicação
     * de quais dois foram medidos juntos — e a leitura podia compor uma PA que
     * ⛔ nunca existiu.
     */
    instanciaDe: "pa",
    rotulo: "Pressão diastólica",
    tipo: "grandeza",
    unidade: "mmHg",
    faixa: { min: 30, max: 200, passo: 1 },
    fonte: "F-04",
    bloqueiaTerapia: false,
  },
] as const;

/** GLICEMIA — ⚠️ desconhecida ⛔ NÃO é normal (E-23). */
export const GLICEMIA_A: readonly CampoA[] = [
  {
    id: "glicemia",
    temporalidade: "afericao",
    /**
     * ⚠️⚠️⚠️ INSTÂNCIA — ⛔ D-133, 2026-09-10. ⛔ E ⛔ **⛔ pelo motivo dela**,
     * ⛔ e ⛔ não ⛔ por simetria com a pressão.
     *
     * ⛔ ⛔ Na PA, a instância nasceu ⛔ para ⛔ amarrar ⛔ **⛔ duas metades**
     * (`pas` ⛔ e `pad`) ⛔ de ⛔ uma mesma aferição (**D-120**) — ⛔ a leitura
     * ⛔ podia compor ⛔ uma PA ⛔ que ⛔ nunca existiu. ⛔ A glicemia ⛔ é ⛔ **⛔ um
     * número só**: ⛔ esse defeito ⛔ ali ⛔ **⛔ não existe**.
     *
     * ⚠️⚠️ ⛔ O motivo aqui ⛔ é ⛔ **⛔ o ciclo da hipoglicemia**. ⛔ `F-06` manda
     * tratar abaixo de 60, ⛔ e `ACOES_DE_CORRECAO` ⛔ declara que o bloqueio cai
     * por ⛔ *"Uma nova glicemia"*. ⛔ Sem instância, ⛔ « nova glicemia » ⛔ e
     * ⛔ « corrigir a glicemia » ⛔ eram ⛔ **⛔ o mesmo gesto** — ⛔ reescrever o
     * campo —, ⛔ e ⛔ o app ⛔ destravaria ⛔ a trombólise ⛔ sobre ⛔ um número
     * ⛔ que ⛔ **⛔ apagou** ⛔ o 38 ⛔ que motivou ⛔ a correção.
     *
     * ⛔ ⛔ « Aquele valor ⛔ nunca foi verdade » (correção) ⛔ e ⛔ « o paciente
     * foi medido de novo » (nova aferição) ⛔ são ⛔ afirmações clínicas
     * ⛔ **⛔ diferentes**, ⛔ e ⛔ a trilha ⛔ tem de ⛔ saber ⛔ qual das duas
     * ⛔ aconteceu.
     *
     * ⚠️ ⛔ A hiperglicemia ⛔ **⛔ não** ganha ciclo ⛔ com isto: ⛔ ela ⛔ não
     * bloqueia ⛔ a trombólise (**F-06**). ⛔ Ela ⛔ apenas ⛔ passa a poder ⛔ ser
     * ⛔ **⛔ remedida** ⛔ sem ⛔ apagar ⛔ a medida ⛔ anterior.
     */
    instanciaDe: "glicemia",
    rotulo: "Glicemia capilar",
    tipo: "grandeza",
    unidade: "mg/dL",
    // ⚠️ PASSO 1, ⛔ NÃO 10. O limite de tratar é `<60`: com passo 10 o médico
    // não conseguiria registrar 55, e o valor real viraria 60 — atravessando a
    // fronteira da recomendação por limitação de controle. A barra faz o grosso.
    faixa: { min: 20, max: 800, passo: 1 },
    fonte: "F-06",
    bloqueiaTerapia: false,
    nota: "Desconhecida não é normal. A fonte manda tratar abaixo de 60 mg/dL, e define hiperglicemia grave tipicamente acima de 400 mg/dL, tratada como possível mimetizador.",
  },
] as const;

/** PESO — grandeza com **origem**, porque a origem muda a confiança (E-14). */
/**
 * PESO — ⚠️ **MUDOU DE CASA em 2026-08-29**, e ⛔ não saiu da tela.
 *
 * ⚠️⚠️ O peso ⛔ não é estado clínico: ele ⛔ não muda entre a chegada e a
 * trombólise. Ele morava aqui porque a **dose** por peso é do fluxo — que é
 * exatamente o escorregamento que o autor nomeou: *"o dado pertence à espécie
 * dele; a decisão apenas o consome."*
 *
 * ⚠️ A casa agora é **Paciente** (`avc/conteudo/paciente.ts`), e **A continua
 * preenchendo o mesmo fato**, com o mesmo id e a mesma trilha. ⛔ Nenhuma segunda
 * versão.
 */
/**
 * ── ⚠️⚠️ OS CAMPOS DA FASE 3 — briefing **item 14** ───────────────────────
 *
 * ⚠️ Decisão do autor, 2026-09-07: *"Se inicialmente forem apenas fatos
 * registrados, usar estado `· medido` quando apropriado."*
 *
 * ⚠️⚠️ ⛔ E ⛔ ISSO É O ESSENCIAL DESTES QUATRO: ⛔ **⛔ nenhum tem consumidor
 * clínico neste módulo**. ⛔ Nenhuma fonte transcrita do AVC dá corte para FC,
 * FR, temperatura ⛔ ou Glasgow — ⛔ e inventar um seria conduta nascendo na
 * tela (**E-31**).
 *
 * ⚠️ ⛔ Eles são **registrados ⛔ e exibidos**, ⛔ e ⛔ o app ⛔ não os classifica.
 * ⛔ Intocados são `undefined`; ⛔ preenchidos aparecem como `· medido`, ⛔ que é
 * ⛔ exatamente a recusa a emitir juízo ⛔ sem fonte.
 *
 * ⛔ ⛔ Quando houver fonte — sepse, choque, TCE —, ⛔ o consumidor entra em
 * `CONSUMIDORES` **antes** do código que o lê.
 */
export const RESPIRACAO_EXTRA_A: readonly CampoA[] = [
  {
    id: "fr",
    temporalidade: "afericao",
    rotulo: "Frequência respiratória",
    tipo: "grandeza",
    unidade: "irpm",
    faixa: { min: 4, max: 60, passo: 1 },
    natureza: "administrativo",
    fonte: "",
    bloqueiaTerapia: false,
    nota: "Registro de sinal vital. Nenhuma recomendação deste módulo é calculada a partir dele.",
  },
];

export const CIRCULACAO_EXTRA_A: readonly CampoA[] = [
  {
    id: "fc",
    temporalidade: "afericao",
    rotulo: "Frequência cardíaca",
    tipo: "grandeza",
    unidade: "bpm",
    faixa: { min: 20, max: 220, passo: 1 },
    natureza: "administrativo",
    fonte: "",
    bloqueiaTerapia: false,
    nota: "Registro de sinal vital. Nenhuma recomendação deste módulo é calculada a partir dele.",
  },
];

/**
 * ⚠️⚠️ GLASGOW **QUANTIFICA**, ⛔ e `consciencia_rebaixada` **decide via aérea**.
 *
 * ⛔ ⛔ Eles ⛔ não são o mesmo fato ⛔ e ⛔ não se substituem: a pergunta de A é
 * *"há rebaixamento que ameace a via aérea?"* — ⛔ e ⛔ é ela que
 * `suporteDeViaAerea` lê. ⚠️ Glasgow é a escala, ⛔ e ⛔ **⛔ nenhuma fonte deste
 * módulo lhe dá corte**.
 *
 * ⛔ ⛔ Fundir os dois faria a via aérea depender de um número ⛔ sem
 * recomendação transcrita — ⛔ e quebraria a leitura que já existe.
 */
export const NEUROLOGICO_A: readonly CampoA[] = [
  {
    id: "glasgow",
    temporalidade: "afericao",
    rotulo: "Escala de coma de Glasgow",
    tipo: "grandeza",
    unidade: "3–15",
    faixa: { min: 3, max: 15, passo: 1 },
    ajuda: "Registro do nível de consciência. A pergunta que decide suporte de via aérea é a do bloco A.",
    natureza: "administrativo",
    fonte: "",
    bloqueiaTerapia: false,
    nota: "Registro de sinal vital. Nenhuma recomendação deste módulo é calculada a partir dele.",
  },
];

export const EXPOSICAO_A: readonly CampoA[] = [
  {
    id: "temperatura",
    temporalidade: "afericao",
    rotulo: "Temperatura",
    tipo: "grandeza",
    unidade: "°C",
    faixa: { min: 30, max: 43, passo: 1 },
    natureza: "administrativo",
    fonte: "",
    bloqueiaTerapia: false,
    nota: "Registro de sinal vital. Nenhuma recomendação deste módulo é calculada a partir dele.",
  },
];

/**
 * ── ⚠️ MONITORIZAÇÃO ⛔ E ACESSOS — briefing **item 13** ──────────────────
 *
 * ⚠️ *"Esses itens ⛔ não devem bloquear o restante do atendimento."* ⛔ São
 * **seleção múltipla** com saída declarada, ⛔ e ⛔ nenhum deles entra em
 * derivação ⛔ nenhuma.
 */
export const SUPORTE_A: readonly CampoA[] = [
  {
    id: "monitorizacao",
    temporalidade: "estado",
    rotulo: "Monitorização instalada",
    tipo: "multipla",
    opcoes: ["ECG contínuo", "Oximetria", "Pressão arterial", "Temperatura", "Nenhuma", NAO_SEI],
    exclusivas: ["Nenhuma", NAO_SEI],
    natureza: "administrativo",
    fonte: "",
    bloqueiaTerapia: false,
    nota: "Registro operacional do atendimento. Não interfere em nenhuma recomendação.",
  },
  {
    id: "acessos",
    temporalidade: "estado",
    rotulo: "Acessos obtidos",
    tipo: "multipla",
    opcoes: ["Periférico", "Central", "Intraósseo", "Nenhum", NAO_SEI],
    exclusivas: ["Nenhum", NAO_SEI],
    natureza: "administrativo",
    fonte: "",
    bloqueiaTerapia: false,
    nota: "Registro operacional do atendimento. Não interfere em nenhuma recomendação.",
  },
];

export const PESO_A: readonly CampoA[] = [];

/**
 * ── ⚠️⚠️⚠️ A CRISE MUDOU DE CASA — 2026-09-08 ─────────────────────────────
 *
 * ⛔ ⛔ `crise_no_inicio` morava ⛔ aqui, ⛔ e ⛔ agora mora em
 * `superficie-b.ts` (**Avaliação AVC**). ⚠️ Decisão do autor, na inspeção
 * clínica: *"crise no início pertence mais claramente à Avaliação AVC"*.
 *
 * ⚠️⚠️ ⛔ E ⛔ NÃO É MUDANÇA VISUAL: ⛔ mudou o **dono** da pendência, ⛔ o
 * destino do `Resolver ›` ⛔ e a lista de `fontes` das duas superfícies —
 * ⛔ F-24 entrou em `neurologico` ⛔ e ⛔ nunca tinha sido declarada ⛔ aqui.
 *
 * ⚠️ ⛔ O **id ⛔ não mudou**, ⛔ então a trilha do fato atravessa inteira.
 * ⛔ A derivação `criseNoInicio()` ⛔ também ⛔ não se moveu: ⛔ ela é núcleo,
 * ⛔ e ⛔ núcleo ⛔ não pertence a tela ⛔ nenhuma. ⛔ O que mudou de lista foi a
 * **leitura exibida**, de `leiturasDaSuperficieA` para a de B.
 */

/**
 * ⚠️ A ORDEM DESTE ARRANJO É A ORDEM DA TELA, e é clínica (§7.3).
 *
 * Relógio primeiro porque é o único dado que corre sozinho; depois via aérea e
 * oxigenação, que é o que mata em minutos; depois pressão, glicemia e peso; e a
 * crise por último, porque é contexto e ⛔ não muda conduta imediata.
 *
 * ⛔ Reordenar isto por conveniência de layout é mudar prioridade clínica.
 */
const GRUPOS_A_DECLARADOS: readonly GrupoDeclarado[] = [
  /**
   * ⚠️ Fora da mnemônica **de propósito**: relógio ⛔ não é ameaça imediata, é o
   * dado que corre sozinho. O autor foi explícito — *"⛔ não force todo campo a
   * caber em ABCDE"*.
   */
  /**
   * ── ⚠️⚠️ A CRONOLOGIA SAIU DAQUI — 2026-09-07, **C7** ────────────────────
   *
   * ⛔ Os cinco marcos ⛔ e o contexto de wake-up passaram para
   * `superficie-b.ts`, ⛔ e ⛔ com ⛔ eles a **casa**: quem pergunta a hora do
   * início ⛔ não está estabilizando o paciente, ⛔ está avaliando o AVC.
   *
   * ⚠️⚠️ ⛔ E A CASA TINHA DE IR JUNTO, ⛔ não ⛔ só o desenho. ⛔ A pendência
   * `ultima_vez_bem` declara `dono:` ⛔ e é ⛔ ele que diz para ⛔ **onde**
   * mandar o médico. ⛔ Deixar a casa aqui ⛔ e o campo lá mandaria ⛔ ele a uma
   * tela que ⛔ já ⛔ não desenha o campo — pendência ⛔ sem mecanismo de
   * resolução (**E-26**, **I-7**).
   *
   * ⛔ ⛔ Nada do campo mudou: id, tipo, `relogio`, fonte ⛔ e notas seguem
   * ⛔ **idênticos**. ⚠️ O que mudou foi o endereço.
   */
  /**
   * ── ⚠️⚠️ A MOLDURA ABCDE (autor, 2026-08-30) ─────────────────────────────
   *
   * > *"toda emergência médica tem que partir disso"*
   *
   * ⚠️⚠️ **É MOLDURA DE LEITURA, e ⛔ NÃO conteúdo clínico novo.** ⛔ Nenhum campo
   * nasceu aqui, ⛔ nenhum texto de conduta entrou, e o card de ACLS — que tem
   * *"IOT se falha ou exaustão"*, *"PAM ≥ 65"* — ⛔ **não** foi importado: aquilo
   * é conduta ⛔ não transcrita para o AVC, e **E-31** a proíbe.
   *
   * ⛔ **E a letra só aparece onde a correspondência é REAL.** ⛔ Não há **E ·
   * Exposição** neste módulo, e inventar um bloco vazio para "completar a
   * mnemônica" seria fingir cobertura.
   *
   * ⛔⛔ E o **D** aqui é a glicemia, e ⛔ **não** uma segunda avaliação
   * neurológica: o exame do déficit mora na superfície Neurológico, é muito mais
   * rico, e duplicá-lo aqui criaria ruído — decisão explícita do autor.
   */
  /**
   * ── ⚠️⚠️ O ABCDE CLÁSSICO — decisão **C1** do autor, 2026-09-06 ──────────
   *
   * ⛔ O bloco acima dizia que ⛔ **não** havia **E** ⛔ e que o **D** era a
   * glicemia. ⚠️ O autor decidiu o contrário: **⛔ o ABCDE do atendimento é o
   * que o médico lê à beira do leito**, ⛔ e ⛔ a letra ⛔ não pode significar
   * uma coisa aqui ⛔ e outra no resto da medicina.
   *
   * ⚠️⚠️ ⛔ E A GLICEMIA **⛔ NÃO MUDOU DE FATO** — ⛔ ela mudou de **card**.
   * ⛔ Mesmo `id`, mesma casa, mesma trilha, mesma série temporal, mesmos
   * consumidores. ⛔ `prova-avc-independencia-da-ui` existe ⛔ exatamente para
   * garantir que mover a apresentação ⛔ não toca em conduta ⛔ nenhuma.
   *
   * ⚠️ ⛔ **D aqui ⛔ não é a Avaliação AVC.** ⛔ Ele responde *"há problema
   * neurológico ⛔ ou metabólico imediato a estabilizar?"*; ⛔ a caracterização
   * do AVC — NIHSS, mRS, déficit incapacitante — continua na fase própria.
   */
  { id: "monitorizacao", titulo: "Monitorização e acessos", campos: SUPORTE_A },
  { id: "via-aerea", titulo: "A · Via aérea", campos: VIA_AEREA_A },
  {
    id: "respiracao",
    titulo: "B · Respiração",
    campos: [...RESPIRACAO_A, ...RESPIRACAO_EXTRA_A],
  },
  {
    id: "pressao",
    titulo: "C · Circulação",
    campos: [...PRESSAO_A, ...CIRCULACAO_EXTRA_A],
  },
  {
    id: "neurologico-inicial",
    titulo: "D · Neurológico",
    /**
     * ⚠️⚠️ ⛔ GLASGOW **⛔ e** GLICEMIA — ⛔ e a glicemia vem de `GLICEMIA_A`,
     * ⛔ que é o mesmo array de sempre. ⛔ Nenhum campo foi recriado.
     */
    campos: [...NEUROLOGICO_A, ...GLICEMIA_A],
  },
  { id: "exposicao", titulo: "E · Exposição", campos: EXPOSICAO_A },
  /**
   * ── ⚠️⚠️⚠️ O PESO SAIU DA ESTABILIZAÇÃO — 2026-09-08 ────────────────────
   *
   * ⛔ ⛔ Ele **⛔ nunca foi daqui**: `PESO_A` sempre foi `[]`, ⛔ e o que a tela
   * desenhava eram dois campos **emprestados** de Paciente — ⛔ com a etiqueta
   * *"Do painel Paciente"* impressa duas vezes, ⛔ uma para cada campo.
   *
   * ⚠️ Decisão do autor, na inspeção clínica: *"peso e origem do peso ⛔ já
   * pertencem à tela Paciente"*. ⛔ Retirar o empréstimo ⛔ não apaga fato
   * ⛔ nenhum — ⛔ a casa ⛔ já era outra, ⛔ e o `Resolver ›` ⛔ já levava para lá.
   *
   * ⚠️ ⛔ `PESO_A` fica declarado ⛔ e vazio, ⛔ e ⛔ isso é de propósito: ⛔ ele é
   * a prova de que ⛔ nenhum campo próprio morreu ⛔ aqui.
   */
];

/**
 * ⚠️⚠️ O CARD DE PRIORIDADE — e ele diz **⛔ só a prioridade**.
 *
 * > *"Se qualquer texto desse card implicar conduta específica, abrir fonte
 * > antes."* — autor, 2026-08-30
 *
 * ⛔ Por isso ⛔ nenhuma meta, ⛔ nenhum fármaco, ⛔ nenhum limiar, ⛔ nenhum "se… então".
 * ⚠️ A frase é conceitual, e é a que o próprio autor escreveu.
 */
export const PRIORIDADE_A = {
  titulo: "Estabilização primeiro",
  frase: "Avaliar e tratar ameaças imediatas antes de avançar no fluxo.",
  /**
   * ⚠️ Diz **por que** os blocos têm letra, e ⛔ que ela ⛔ não cobre tudo — ⛔ senão a
   * ausência de "E" leria como esquecimento.
   */
  nota: "Os blocos abaixo seguem a ordem do ABCDE onde há correspondência com o que esta tela registra. O que não corresponde fica em bloco próprio.",
} as const;

/**
 * ⚠️⚠️ A CASA É CARIMBADA AQUI, e ⛔ não escrita campo a campo (2026-08-29).
 *
 * ⚠️ Um campo que declarasse a própria casa poderia declarar a casa errada — e
 * casa errada é a duplicação de fatos voltando com outro nome. Carimbada pelo
 * módulo, ela ⛔ não tem como discordar do arquivo que a define.
 */
export const GRUPOS_A: readonly Grupo[] = comCasa("estabilizacao", GRUPOS_A_DECLARADOS);

export const TODOS_OS_CAMPOS_A: readonly Campo[] = GRUPOS_A.flatMap((g) => [...g.campos]);

/**
 * ⚠️⚠️ O QUE A TELA DESENHA — os campos **próprios** mais os **emprestados**.
 *
 * ⚠️ As duas listas existem porque respondem perguntas diferentes:
 *   · `TODOS_OS_CAMPOS_A` responde *"de quem é o fato"* — e é ela que as
 *     travas de fonte, de bloqueio e de propriedade única varrem;
 *   · `CAMPOS_NA_TELA_A` responde *"o que o médico vê aqui"* — e é ela que
 *     a tela e o e2e usam.
 *
 * ⛔ Confundi-las devolveria a duplicação: um campo emprestado contado como
 * próprio teria **duas casas**.
 */
export const CAMPOS_NA_TELA_A: readonly Campo[] = GRUPOS_A.flatMap((g) => camposDoGrupo(g));

export const SUPERFICIE_A: SuperficieId = "estabilizacao";
