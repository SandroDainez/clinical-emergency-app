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
 * OS RELÓGIOS — coletados **separadamente**, ⛔ jamais fundidos.
 *
 * ⚠️ Decisão do autor em F-02: ⛔ não existe campo genérico de "hora do AVC".
 * A fonte usa seis formulações e conta janelas de quatro marcos distintos; um
 * campo único tornaria as recomendações de janela estendida incomputáveis.
 */
/**
 * ⚠️ "HOUVE SONO ENTRE A ÚLTIMA VEZ BEM E O ACHADO" FOI REMOVIDO em 2026-08-28,
 * a pedido do autor usando o app. ⛔ Nenhuma derivação o consumia — ele existia
 * como preparação para o cenário de AVC ao acordar, que ⛔ não está construído.
 *
 * ⚠️ A CONSEQUÊNCIA FICA DECLARADA: quando a janela estendida entrar (F-03), o
 * cenário *wake-up* vai precisar de um marco próprio. ⛔ Ele ⛔ não volta como
 * este campo — volta com a regra temporal que o justifica, ou ⛔ não volta.
 *
 * ⚠️⚠️ **A REGRA CHEGOU** — 2026-08-31. A Superfície F passou a ler §4.6.3
 * rec. 2, que conta *"within 9 hours from the **midpoint of sleep**"*. O marco
 * volta como `hora_meio_do_sono`, ⛔ e ⛔ **não** como o campo removido: ⛔ não é
 * um sim/não sobre ter havido sono, é **um instante**, com relógio próprio.
 */

/**
 * ⚠️⚠️ A PROCEDÊNCIA DO MEIO DO SONO É **INFORMADA**, ⛔ e isto é DADO.
 *
 * ⛔ Hoje ⛔ não existem `hora_inicio_sono` ⛔ nem `hora_despertar`, ⛔ então
 * ⛔ nada aqui calcula o ponto médio: o médico informa o instante, ⛔ e a origem
 * é a resposta dele.
 *
 * ⚠️⚠️ SE UM DIA HOUVER CÁLCULO a partir do intervalo de sono, ele será **outro
 * fato**, com procedência própria — ⛔ e ⛔ **jamais** sobrescreverá em silêncio
 * o valor informado (PD-17). ⛔ Derivar do último-visto-bem é proibido: a fonte
 * usa os dois como marcos DISTINTOS, na MESMA recomendação.
 */
export const MEIO_DO_SONO_PROCEDENCIA = {
  campo: "hora_meio_do_sono",
  origem: "informado",
  calculadoPor: null,
  /**
   * ⚠️ IDENTIFICADORES, ⛔ e ⛔ não prosa: declaração interna ⛔ não é texto de
   * tela, ⛔ e frase em português dentro de dado entra na fila de tradução
   * ⛔ sem ⛔ nunca ser lida por ⛔ ninguém.
   */
  naoDerivarDe: [
    "hora_ultima_vez_bem",
    "hora_inicio_observado",
    "hora_reconhecimento",
    "hora_chegada",
  ],
  /** ⚠️⚠️ Um cálculo futuro ⛔ NÃO substitui o informado (PD-17). */
  calculoSubstituiOInformado: false,
} as const;
export const RELOGIOS_A: readonly CampoA[] = [
  {
    id: "hora_chegada",
    temporalidade: "estavel",
    rotulo: "Chegada ao pronto-socorro",
    tipo: "hora",
    relogio: "t0_operacional",
    fonte: "F-11",
    bloqueiaTerapia: false,
    nota: "Referência de porta. Não substitui nenhum relógio clínico.",
  },
  {
    id: "hora_ultima_vez_bem",
    temporalidade: "estavel",
    rotulo: "Última vez visto bem",
    tipo: "hora",
    relogio: "ultima_vez_bem",
    fonte: "F-02",
    bloqueiaTerapia: false,
    aceitaDesconhecido: true,
    nota: "Desconhecido é resposta, e tem consequência própria.",
  },
  {
    id: "hora_inicio_observado",
    temporalidade: "estavel",
    rotulo: "Início observado do déficit",
    tipo: "hora",
    relogio: "inicio_observado",
    fonte: "F-02",
    // ⚠️ Também aceita desconhecido: o déficit pode ter sido ACHADO sem ninguém
    // ter observado o início — e isso ⛔ não é a pergunta não ter sido feita.
    aceitaDesconhecido: true,
    bloqueiaTerapia: false,
  },
  {
    id: "hora_reconhecimento",
    temporalidade: "estavel",
    rotulo: "Reconhecimento dos sintomas",
    tipo: "hora",
    relogio: "reconhecimento",
    fonte: "F-03",
    bloqueiaTerapia: false,
    nota: "A fonte conta uma janela a partir deste marco, e ele não é o início.",
  },
  {
    /**
     * ⚠️⚠️ O QUINTO MARCO — semanticamente INDEPENDENTE dos outros quatro.
     *
     * ⛔ ⛔ Não é a última vez visto bem, ⛔ não é o início observado, ⛔ não é o
     * reconhecimento ⛔ e ⛔ não é a chegada. §4.6.3 rec. 2 cita *midpoint of
     * sleep* ⛔ **e** *last known well* na MESMA recomendação, com faixas
     * diferentes — reaproveitar qualquer um dos outros tornaria as duas
     * contagens uma só, que é o defeito que a Superfície F existe para impedir.
     *
     * ⚠️ APARECE SÓ quando o início ⛔ não foi observado. ⛔ Isto é filtro de
     * APRESENTAÇÃO — ⛔ não é a afirmação clínica de que início desconhecido
     * equivale a wake-up. É o recorte em que perguntar pelo sono faz sentido,
     * ⛔ e fora dele o campo seria ruído em quase todo atendimento.
     */
    id: "hora_meio_do_sono",
    temporalidade: "estavel",
    rotulo: "Meio do sono",
    tipo: "hora",
    relogio: "meio_do_sono",
    fonte: "F-03",
    bloqueiaTerapia: false,
    /** ⚠️ E-02: "ninguém sabe dizer" é resposta, ⛔ e ⛔ não ausência. */
    aceitaDesconhecido: true,
    apareceQuando: { campo: "hora_inicio_observado", valor: "nao_sei" },
    nota: "Informado por quem atende. O app não calcula este instante a partir de nenhum outro relógio.",
  },
] as const;

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
export const PESO_A: readonly CampoA[] = [];

/** CRISE NO INÍCIO — ⚠️ contexto, ⛔ nunca exclusão. */
export const CRISE_A: readonly CampoA[] = [
  {
    id: "crise_no_inicio",
    temporalidade: "estavel",
    rotulo: "Crise convulsiva no início do quadro",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-24",
    bloqueiaTerapia: false,
    nota: "Contexto e possível mimetizador. Não exclui AVC.",
  },
] as const;

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
  { id: "relogios", titulo: "Relógios", campos: RELOGIOS_A },
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
  { id: "via-aerea", titulo: "A · Via aérea", campos: VIA_AEREA_A },
  { id: "respiracao", titulo: "B · Respiração e oxigenação", campos: RESPIRACAO_A },
  { id: "pressao", titulo: "C · Circulação e pressão arterial", campos: PRESSAO_A },
  { id: "glicemia", titulo: "D · Glicemia", campos: GLICEMIA_A },
  {
    id: "peso",
    titulo: "Peso",
    campos: PESO_A,
    /**
     * ⚠️ O peso mora em **Paciente** e é preenchido aqui — porque é aqui que ele
     * costuma ser sabido, na chegada. Mesmo id, mesma trilha.
     */
    emprestados: [CAMPO_DO_PACIENTE("peso"), CAMPO_DO_PACIENTE("peso_origem")],
  },
  /** ⚠️ Também fora da mnemônica: é contexto, e ⛔ não ameaça imediata. */
  { id: "crise", titulo: "Crise no início", campos: CRISE_A },
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
