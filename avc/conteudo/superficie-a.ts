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

/** Como o campo é preenchido. ⛔ Nunca caixa de texto para valor clínico (§0.3). */
export type TipoDeCampo =
  /** Grandeza: barra + ajuste fino. `0` = não informado até a interação (§0.2). */
  | "grandeza"
  /** Escolha tocável. `0` não se aplica; ⛔ sem texto livre (§7.6). */
  | "escolha"
  /** Hora e minuto. ⛔ Nunca barra deslizante (§7.5). */
  | "hora";

/**
 * A faixa de uma grandeza — ⚠️ é limite **de controle**, ⛔ NÃO é limite clínico.
 *
 * ⚠️⚠️ LEIA ANTES DE MEXER: estes números existem só para a barra ter começo e
 * fim. ⛔ Nenhum deles significa "normal", "seguro" ou "tratável". As faixas são
 * deliberadamente MAIS LARGAS que o plausível, porque uma barra que não alcança
 * o valor real do paciente é pior que uma barra larga: ela obriga o médico a
 * registrar um número falso.
 *
 * `partida` é apenas onde o cursor descansa antes do primeiro toque — e enquanto
 * ninguém tocou, a tela mostra **não informado**, ⛔ nunca este número (§0.2).
 */
export type Faixa = {
  readonly min: number;
  readonly max: number;
  /** Incremento de −/+. ⚠️ Fino de propósito: a barra faz o grosso. */
  readonly passo: number;
  /** Posição de descanso da barra. ⛔ Não é valor, não é medida, não é padrão. */
  readonly partida: number;
};

export type CampoA = {
  readonly id: string;
  readonly rotulo: string;
  readonly tipo: TipoDeCampo;
  /** Para `escolha`: as opções, em PT. ⚠️ Sempre com saída para quem não sabe. */
  readonly opcoes?: readonly string[];
  readonly unidade?: string;
  /** Para `grandeza`: os limites da barra. ⛔ Nunca limites clínicos (ver `Faixa`). */
  readonly faixa?: Faixa;
  /**
   * Frase curta e **permanente** sob o rótulo, quando a pergunta sozinha é
   * ambígua o bastante para gerar resposta errada.
   *
   * ⚠️ USAR COM PARCIMÔNIA. Texto explicativo permanente rouba a leitura de
   * relance que a porta do pronto-socorro exige (§7.3). O que é fidelidade à
   * fonte vai em `nota`, atrás do ⓘ; aqui só entra o que muda a RESPOSTA.
   */
  readonly ajuda?: string;
  /** Qual relógio clínico este campo alimenta — ⛔ nunca um genérico (E-36). */
  readonly relogio?: string;
  /** O slot que sustenta a existência clínica do campo (E-30). */
  readonly fonte: string;
  /**
   * ⚠️ SEMPRE `false` nesta superfície.
   *
   * Se algum dia alguém puser `true`, o campo tem de ser conferido contra as
   * doze marcas de `CONSOLIDACAO-CLINICA-AVC.md` — e `prova-avc-superficie-a`
   * reprova o arquivo se aparecer um `true` sem passar por lá.
   */
  readonly bloqueiaTerapia: false;
  /** Nota de fidelidade quando a fonte exige cuidado de leitura. */
  readonly nota?: string;
};

/** ⚠️ As três respostas que nunca colapsam (E-23, §7.7). */
export const SIM_NAO_NAO_SEI = ["Sim", "Não", "Não sei"] as const;

/**
 * A mesma tríade, com a saída chamada **Incerto**.
 *
 * ⚠️ POR QUE UM SEGUNDO CONJUNTO EM VEZ DE TRADUZIR "Não sei": em achado que o
 * médico está **examinando agora**, "não sei" soa a falha de anamnese e empurra
 * para um "Não" apressado. "Incerto" é a resposta honesta de quem olhou e não
 * concluiu — e é justamente ela que ⛔ não pode virar "Não" (E-23).
 */
export const SIM_NAO_INCERTO = ["Sim", "Não", "Incerto"] as const;

/**
 * Rótulo de opção → valor gravado na trilha.
 *
 * ⚠️ MORA AQUI, ⛔ NÃO NA TELA. A tela fazia este de-para inline; se alguém
 * acrescentasse uma opção lá, ela cairia crua no estado e `ternario()` — que só
 * conhece `sim`, `nao_perguntado` e `nao_sei` — a leria como **não**. Um rótulo
 * novo viraria negativa silenciosa, que é exatamente o que E-23 proíbe.
 *
 * ⚠️ `Incerto` e `Não sei` gravam o MESMO valor de propósito: para o motor as
 * duas são a ausência de conclusão. A diferença é de linguagem na tela, e é a
 * tela que a desfaz de volta em `opcaoDoValor`.
 */
export function valorDaOpcao(opcao: string): string {
  switch (opcao) {
    case "Sim":
      return "sim";
    case "Não":
      return "nao";
    case "Não sei":
    case "Incerto":
      return "nao_sei";
    default:
      return opcao;
  }
}

/** O rótulo que este campo usa para um valor gravado — ⛔ nunca o valor cru. */
export function opcaoDoValor(campo: CampoA, valor: string): string | undefined {
  return campo.opcoes?.find((o) => valorDaOpcao(o) === valor);
}

/**
 * OS RELÓGIOS — coletados **separadamente**, ⛔ jamais fundidos.
 *
 * ⚠️ Decisão do autor em F-02: ⛔ não existe campo genérico de "hora do AVC".
 * A fonte usa seis formulações e conta janelas de quatro marcos distintos; um
 * campo único tornaria as recomendações de janela estendida incomputáveis.
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
    nota: "Desconhecido é resposta, e tem consequência própria.",
  },
  {
    id: "hora_inicio_observado",
    rotulo: "Início observado do déficit",
    tipo: "hora",
    relogio: "inicio_observado",
    fonte: "F-02",
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
  {
    id: "houve_sono",
    rotulo: "Houve sono entre a última vez bem e o achado",
    tipo: "escolha",
    opcoes: SIM_NAO_NAO_SEI,
    fonte: "F-03",
    bloqueiaTerapia: false,
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
    fonte: "F-23",
    bloqueiaTerapia: false,
  },
  {
    id: "disfuncao_bulbar",
    /**
     * ⚠️ O RÓTULO DIZ A CONSEQUÊNCIA, não só o nome do achado. "Disfunção
     * bulbar" sozinha é termo de neurologista; o que a fonte usa o achado para
     * decidir é **proteger a via aérea**, e é isso que precisa estar visível
     * para quem responde às 3h da manhã.
     */
    rotulo: "Disfunção bulbar / dificuldade para proteger a via aérea",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    /**
     * ⚠️⚠️ ISTO É EXEMPLIFICAÇÃO, ⛔ NÃO É ALGORITMO DIAGNÓSTICO. Nenhum destes
     * sinais isolados fecha nem exclui disfunção bulbar, e ⛔ não existe contagem
     * ("dois de quatro"). A frase existe para o médico reconhecer do que se
     * trata — a conclusão continua sendo dele.
     */
    ajuda:
      "Dificuldade importante para engolir, controlar saliva/secreções, tosse ineficaz ou outros sinais de comprometimento bulbar.",
    fonte: "F-23",
    bloqueiaTerapia: false,
    nota: "Junto com o rebaixamento, é um dos dois gatilhos que a fonte nomeia.",
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
    faixa: { min: 50, max: 100, passo: 1, partida: 96 },
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
    faixa: { min: 60, max: 300, passo: 1, partida: 140 },
    fonte: "F-04",
    bloqueiaTerapia: false,
    nota: "Registrada aqui. A meta depende do contexto de reperfusão, que esta superfície não define.",
  },
  {
    id: "pad",
    rotulo: "Pressão diastólica",
    tipo: "grandeza",
    unidade: "mmHg",
    faixa: { min: 30, max: 200, passo: 1, partida: 85 },
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
    faixa: { min: 20, max: 800, passo: 1, partida: 100 },
    fonte: "F-06",
    bloqueiaTerapia: false,
    nota: "Desconhecida não é normal.",
  },
] as const;

/** PESO — grandeza com **origem**, porque a origem muda a confiança (E-14). */
export const PESO_A: readonly CampoA[] = [
  {
    id: "peso",
    rotulo: "Peso",
    tipo: "grandeza",
    unidade: "kg",
    faixa: { min: 30, max: 250, passo: 1, partida: 70 },
    fonte: "F-09",
    bloqueiaTerapia: false,
    nota: "Não atrasa terapia tempo-dependente.",
  },
  {
    id: "peso_origem",
    rotulo: "Origem do peso",
    tipo: "escolha",
    opcoes: ["Balança", "Informado", "Estimado", "Não sei"],
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
