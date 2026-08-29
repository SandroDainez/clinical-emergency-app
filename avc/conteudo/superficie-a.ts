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
import type { Campo } from "./campo";

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
export type CampoA = Campo;
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

import { EXCLUSIVAS_PADRAO, NAO_SEI, SEM_ACHADOS, SIM_NAO_INCERTO, SIM_NAO_NAO_SEI } from "./campo";

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
 */
export const RELOGIOS_A: readonly CampoA[] = [
  {
    id: "hora_chegada",
    rotulo: "Chegada ao pronto-socorro",
    tipo: "hora",
    relogio: "t0_operacional",
    fonte: "F-11",
    bloqueiaTerapia: false,
    nota: "Referência de porta. Não substitui nenhum relógio clínico.",
  },
  {
    id: "hora_ultima_vez_bem",
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
    rotulo: "Reconhecimento dos sintomas",
    tipo: "hora",
    relogio: "reconhecimento",
    fonte: "F-03",
    bloqueiaTerapia: false,
    nota: "A fonte conta uma janela a partir deste marco, e ele não é o início.",
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
  {
    id: "hipoxia",
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
export const PESO_A: readonly CampoA[] = [
  {
    id: "peso",
    rotulo: "Peso",
    tipo: "grandeza",
    unidade: "kg",
    faixa: { min: 30, max: 250, passo: 1 },
    fonte: "F-09",
    bloqueiaTerapia: false,
    nota: "Não atrasa terapia tempo-dependente.",
  },
  {
    id: "peso_origem",
    rotulo: "Origem do peso",
    tipo: "escolha",
    /**
     * ⚠️ "Informado" virou "Referido" em 2026-08-28: "informado" era ambíguo —
     * todo campo desta tela é informado por alguém. O que muda a confiança é
     * QUEM disse (E-14), e é isso que a `ajuda` agora explicita.
     */
    /**
     * ⚠️ "BALANÇA" SAIU em 2026-08-28, a pedido do autor: *"não faz sentido"*.
     * E ⛔ não é preciosismo — é o cenário: ⛔ ninguém pesa em balança um paciente
     * de AVC agudo na porta do pronto-socorro, e uma opção que ⛔ não acontece
     * ocupa alvo de toque e sugere um caminho que ⛔ não existe.
     */
    opcoes: ["Referido", "Estimado", "Não sei"],
    ajuda: "Referido: dito pelo paciente ou pela família. Estimado: avaliado pela equipe.",
    fonte: "F-09",
    bloqueiaTerapia: false,
    nota: "Com peso estimado, a fonte diz que a banda fina não é necessariamente mais segura.",
  },
] as const;

/** CRISE NO INÍCIO — ⚠️ contexto, ⛔ nunca exclusão. */
export const CRISE_A: readonly CampoA[] = [
  {
    id: "crise_no_inicio",
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
export const GRUPOS_A: readonly {
  /** Endereço estável do bloco. ⚠️ O título é texto traduzível e ⛔ não serve de chave. */
  id: string;
  titulo: string;
  campos: readonly CampoA[];
}[] = [
  { id: "relogios", titulo: "Relógios", campos: RELOGIOS_A },
  { id: "via-aerea", titulo: "Via aérea e oxigenação", campos: VIA_AEREA_A },
  { id: "pressao", titulo: "Pressão arterial", campos: PRESSAO_A },
  { id: "glicemia", titulo: "Glicemia", campos: GLICEMIA_A },
  { id: "peso", titulo: "Peso", campos: PESO_A },
  { id: "crise", titulo: "Crise no início", campos: CRISE_A },
] as const;

export const TODOS_OS_CAMPOS_A: readonly CampoA[] = GRUPOS_A.flatMap((g) => [...g.campos]);

export const SUPERFICIE_A: SuperficieId = "estabilizacao";
