/**
 * SUPERFÍCIE G · Destino — o conteúdo.
 *
 * ⚠️⚠️ G NASCE PEQUENA, ⛔ E ISSO É A DECISÃO — ⛔ não uma limitação.
 *
 * ⚠️ A auditoria de prontidão (2026-08-31) varreu o documento inteiro: **há duas
 * menções a internação em toda a fonte transcrita**, e só uma delas tem COR/LOE.
 * Transferência, regulação, destino pós-EVT e permanência no serviço ⛔ **não
 * existem** na fonte auditada.
 *
 * ⚠️⚠️ Decisão do autor: G V1 traz **⛔ só o sustentado**. Transferência e
 * regulação nascerão depois, em slots próprios, com fontes próprias — ⛔ e ⛔ não
 * por dedução a partir daqui.
 *
 * ── ⚠️⚠️ A FRONTEIRA QUE ESTA SUPERFÍCIE EXISTE PARA ⛔ NÃO ATRAVESSAR ────────
 *
 * ⛔ **"⛔ Não há recurso aqui" ⛔ NUNCA vira "terapia ⛔ não indicada".**
 *
 * F-03 §12 é a norma do módulo: disponibilidade é *"DISPONIBILIDADE /
 * LOCALIZAÇÃO, ⛔ nunca contraindicação clínica"*. ⚠️ A dívida **F-31** fica
 * exatamente em cima desta fronteira, ⛔ e G ⛔ **não a resolve**: se G registrar
 * *"⛔ não há centro EVT"* ⛔ e F ler isso como `cannot receive EVT`, o app passa
 * a recomendar trombólise estendida **por geografia**.
 */

import type { SuperficieId } from "../nucleo/tipos";
import { PA_POS_REPERFUSAO } from "./antihipertensivos";
import type { Campo, CampoDeclarado, Grupo, GrupoDeclarado } from "./campo";
import { comCasa } from "./campo";

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · OS DOIS TIPOS — E A DIFERENÇA ENTRE ELES É DE AUTORIDADE
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ RECOMENDAÇÃO GRADUADA — a fonte lhe atribuiu COR e LOE.
 *
 * ⚠️ `cor` e `loe` são **obrigatórios** aqui. ⛔ Um destino que ⛔ não tenha grau
 * ⛔ não é deste tipo: é `RegraOperacional`. ⚠️ A distinção é do TIPO, ⛔ e ⛔ não
 * de um campo opcional — ⛔ campo opcional se esquece de preencher, ⛔ e o
 * esquecimento fica com cara de "a fonte ⛔ não deu".
 */
export type DestinoRecomendado = {
  readonly id: string;
  readonly slot: string;
  readonly localizacao: string;
  /** ⚠️ Verbatim, em inglês. ⛔ Verbatim ⛔ não se traduz (§6.14). */
  readonly verbo: string;
  readonly cor: string;
  readonly loe: string;
  readonly populacao: string;
  /** ⚠️ O que a tela mostra em português — ⛔ e ⛔ não é o verbatim. */
  readonly rotulo: string;
  readonly nota?: string;
};

/**
 * ⚠️⚠️ CONDUTA DE TABELA — a fonte ⛔ NÃO lhe atribuiu grau.
 *
 * ⚠️ A **Table 7** é tabela operacional: **⛔ não carrega COR/LOE** (E-48). Ela é
 * conteúdo da fonte-mãe ⛔ e tem valor, ⛔ mas ⛔ **não tem autoridade de
 * recomendação** — e a tela ⛔ não pode fazê-la parecer que tem.
 *
 * ⚠️⚠️ `cor` e `loe` são `null` **explícitos**, ⛔ e ⛔ não ausentes: `null` é a
 * afirmação de que se olhou ⛔ e ⛔ não havia. ⛔ Campo ausente ⛔ não distingue
 * "a fonte ⛔ não deu" de "⛔ ninguém preencheu" (E-37, aplicado à procedência).
 */
export type RegraOperacional = {
  readonly id: string;
  readonly slot: string;
  readonly localizacao: string;
  readonly texto: string;
  /** ⚠️⚠️ ⛔ SEMPRE `null`. ⛔ Inventar grau para a Table 7 é falsificar a fonte. */
  readonly cor: null;
  readonly loe: null;
  /** ⚠️ A declaração de que a ausência foi CONFERIDA, ⛔ e ⛔ não esquecida. */
  readonly semGrauNaFonte: true;
  readonly populacao: string;
};

/* ────────────────────────────────────────────────────────────────────────────
 * 2 · O CATÁLOGO
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ UM ÚNICO DESTINO GRADUADO EM TODA A FONTE. ⛔ Isso ⛔ não é um começo
 * incompleto — é o que a diretriz sustenta.
 */
export const DESTINOS_RECOMENDADOS: readonly DestinoRecomendado[] = [
  {
    id: "unidade_de_avc",
    slot: "F-15",
    localizacao: "§5.1 Stroke Units · p. e389",
    verbo: "is recommended",
    cor: "1",
    loe: "B-R",
    /**
     * ⚠️ A fonte escreve *"of all ages"* — ⛔ e o V1 é adulto (E-17). A menção
     * fica **registrada**, ⛔ e ⛔ não transcrita como cobertura pediátrica.
     */
    populacao: "adulto com AVC isquêmico agudo",
    rotulo: "Unidade de AVC organizada, com equipe interdisciplinar treinada",
    nota: "A fonte descreve unidades de AVC agudo, de reabilitação, abrangentes e mistas, com conjuntos de ordens e protocolos padronizados.",
  },
];

/**
 * ⚠️⚠️ A REGRA DA TABLE 7 — ⛔ e o **"ou"** é da fonte.
 *
 * ⛔ *"Admit the patient to an **intensive care or stroke unit** for monitoring"*.
 * ⚠️ Decisão do autor, 2026-08-31: **preservar o "ou"**. ⛔ Transformar isto em
 * "UTI obrigatória" inventaria exigência que a fonte ⛔ não fez, ⛔ e faria o app
 * pedir um recurso mais escasso do que o enunciado pede.
 */
export const REGRAS_DE_DESTINO: readonly RegraOperacional[] = [
  {
    id: "internacao_para_monitorizacao",
    slot: "F-15",
    localizacao: "Table 7 · p. e358",
    texto: "Internar em unidade de terapia intensiva OU em unidade de AVC, para monitorização.",
    cor: null,
    loe: null,
    semGrauNaFonte: true,
    populacao: "após trombólise intravenosa",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * ⚠️⚠️⚠️ 2b · OS ANTITROMBÓTICOS PÓS-IVT — TRÊS REGRAS, ⛔ E ⛔ NÃO UMA
 *
 * ── ⚠️⚠️ ⛔ POR QUE ⛔ NÃO EXISTE *"antiagregante proibido por 24 h"* ────────
 *
 * ⚠️ Decisão do autor, 2026-09-07: *"⛔ não implementar a regra simplificada
 * `antiagregante proibido por 24 h`, ⛔ porque isso seria **mais forte que a
 * fonte**."*
 *
 * ⛔ ⛔ E ⛔ ele está certo ao pé da letra: §4.8 rec. 2 escreve *"the risk … **is
 * uncertain**"* ⛔ e *"use **might be considered**"*. ⚠️ ⛔ Isso ⛔ não é
 * proibição ⛔ nem liberação — ⛔ é **incerteza declarada**, ⛔ e a diferença
 * decide se um paciente com stent coronário recente fica ⛔ sem antiagregante
 * por um dia.
 *
 * ── ⚠️⚠️ ⛔ AS TRÊS ⛔ NÃO SE FUNDEM ────────────────────────────────────────
 *
 *   · **48 h do início do AVC** · COR 1 · A — o pano de fundo. ⛔ Conta do
 *     **AVC**, ⛔ e ⛔ não da trombólise.
 *   · **24 h da IVT** · COR 2b · B-NR — a exceção, ⛔ com risco incerto.
 *   · **90 min da IVT, aspirina IV** · COR 3: **Harm** · B-R — dano, ⛔ e
 *     ⛔ **⛔ não** *"No Benefit"*.
 *
 * ⛔ ⛔ Janelas diferentes, marcos diferentes, forças diferentes. ⚠️ Achatá-las
 * daria a uma delas a força da outra — ⛔ e a de 90 min é a única que a fonte
 * classifica como **dano**.
 *
 * ── ⚠️⚠️⚠️ ⛔ E A ANTICOAGULAÇÃO ⛔ NÃO ENTROU — DE PROPÓSITO ──────────────
 *
 * ⛔ ⛔ §4.9 tem **seis** recomendações, ⛔ com forças **opostas**: `2a · A`
 * para anticoagulação oral precoce em FA selecionada, ⛔ e `3: No Benefit · A`
 * para anticoagulação precoce em AVC indiferenciado.
 *
 * ⚠️⚠️ ⛔ Transcrever **metade** seria pior do que ⛔ nenhuma: a tela diria
 * *"⛔ não recomendada"* a um paciente com fibrilação atrial em quem a fonte
 * diz *"is reasonable"*. ⛔ A Table 7 sustenta a **ordem** em relação à
 * imagem — ⛔ e ⛔ não um esquema terapêutico.
 * ────────────────────────────────────────────────────────────────────────── */

/** ⚠️ De onde a janela conta. ⛔ Os dois marcos ⛔ **⛔ não** são o mesmo. */
export type MarcoAntitrombotico = "inicio_avc" | "inicio_ivt";

export type RecomendacaoAntitrombotica = {
  readonly id: string;
  readonly slot: string;
  readonly localizacao: string;
  readonly cor: string;
  readonly loe: string;
  /** ⚠️ A frase da fonte, inteira. ⛔ **E-31**. */
  readonly verbatim: string;
  /** ⚠️ O que a tela mostra. ⛔ ⛔ Nunca *"seguro"*, *"liberado"*, *"rotina"*. */
  readonly frase: string;
  readonly janela: { readonly marco: MarcoAntitrombotico; readonly minutos: number };
};

export const ANTITROMBOTICOS_POS_IVT = {
  slot: "F-15",
  recomendacoes: [
    {
      id: "aas_48h",
      slot: "F-15",
      localizacao: "§4.8 rec. 1 · p. e376",
      cor: "1",
      loe: "A",
      verbatim:
        "In patients with AIS, administration of aspirin is recommended within 48 hours after stroke onset to reduce risk of death and dependency.",
      /**
       * ⚠️⚠️ ⛔ *"do início do AVC"* está na frase ⛔ de propósito: ⛔ sem isso,
       * ⛔ ela seria lida como *"48 h da trombólise"* — ⛔ dois relógios
       * diferentes, ⛔ e o app tem os dois na tela.
       */
      frase: "Aspirina é recomendada nas primeiras 48 horas do início do AVC.",
      janela: { marco: "inicio_avc", minutos: 48 * 60 },
    },
    {
      /**
       * ⚠️⚠️⚠️ A EXCEÇÃO — ⛔ e o verbo dela é ***is uncertain***.
       *
       * ⛔ ⛔ *"⛔ Não chamar de: seguro; recomendado rotineiramente; liberado;
       * contraindicado."* — autor, 2026-09-07. ⚠️ A frase abaixo obedece às
       * quatro proibições ⛔ e ⛔ há trava que as mede.
       */
      id: "antiagregante_24h_pos_ivt",
      slot: "F-15",
      localizacao: "§4.8 rec. 2 · p. e378",
      cor: "2b",
      loe: "B-NR",
      verbatim:
        "In patients with AIS who have received IVT, the risk of antiplatelet therapy in the first 24 hours after IVT (with or without mechanical thrombectomy) is uncertain. Use might be considered in the presence of concomitant conditions for which such treatment given in the absence of IVT is known to provide substantial benefit or when withholding such treatment is known to cause substantial risk.",
      frase:
        "Uso de antiagregante nas primeiras 24 horas após a trombólise: risco incerto. Pode ser considerado em situação concomitante selecionada.",
      janela: { marco: "inicio_ivt", minutos: 24 * 60 },
    },
    {
      /**
       * ⚠️⚠️⚠️ **COR 3: Harm** — ⛔ e ⛔ a rec. 18, logo abaixo dela na fonte,
       * é `3: No Benefit`. ⛔ Achatar as duas em *"COR 3"* apagaria a diferença
       * entre **⛔ não ajuda** ⛔ e **faz mal**.
       *
       * ⚠️ ⛔ E ⛔ ela é de via **intravenosa**: ⛔ ela ⛔ não fala da aspirina
       * oral, ⛔ e ⛔ não é a regra das 24 h.
       */
      id: "aspirina_iv_90min",
      slot: "F-15",
      localizacao: "§4.8 rec. 17 · p. e380",
      cor: "3: Harm",
      loe: "B-R",
      verbatim:
        "In patients with AIS who are eligible for IVT, IV aspirin should not be administered concurrently or within 90 minutes after the start of IVT given the risk of hemorrhage.",
      frase:
        "Aspirina IV não deve ser administrada junto com a trombólise nem nos 90 minutos após o seu início, pelo risco de hemorragia.",
      janela: { marco: "inicio_ivt", minutos: 90 },
    },
  ] as readonly RecomendacaoAntitrombotica[],

  /**
   * ⚠️⚠️ A LACUNA DECLARADA — ⛔ e ⛔ ela ⛔ **⛔ não** é falta de fonte.
   *
   * ⛔ A fonte **existe** ⛔ e foi lida. ⚠️ O que houve foi **decisão de
   * escopo**: §4.9 entra inteira, ⛔ ou ⛔ não entra.
   */
  lacunaDaAnticoagulacao: {
    referencia: "§4.9 Anticoagulants · p. e384",
    ehLacunaDeFonte: false,
    texto:
      "A fonte traz seis recomendações sobre anticoagulantes, com forças opostas conforme o contexto. Nenhuma foi incorporada nesta fase, e o app não emite conduta anticoagulante.",
  },
} as const;

/* ────────────────────────────────────────────────────────────────────────────
 * ⚠️⚠️ 2c · O JULGAMENTO DA CONDIÇÃO CONCOMITANTE
 *
 * ⛔ ⛔ Ele ⛔ **⛔ NÃO** é `FatoOperacional`: aqueles são **disponibilidade do
 * serviço**, com barreira G → F. ⚠️ Este é julgamento **clínico** do episódio,
 * ⛔ e a fonte o deixa explicitamente para quem trata.
 *
 * ⚠️ ⛔ E ⛔ ele ⛔ não destrava ⛔ nada: responder *"Sim"* faz aparecer a
 * recomendação **COR 2b com risco incerto** — ⛔ e ⛔ não uma autorização.
 * ────────────────────────────────────────────────────────────────────────── */

const GRUPO_ANTITROMBOTICO: readonly Grupo[] = comCasa("destino", [
  {
    id: "antitromboticos_pos_ivt",
    titulo: "Antitrombóticos pós-trombólise",
    campos: [
    {
      id: "condicao_concomitante_antiagregante",
      temporalidade: "estado",
      /** ⚠️ O rótulo carrega **as duas metades** da frase da fonte. */
      rotulo:
        "Há condição concomitante em que o antiagregante traria benefício substancial, ou em que suspendê-lo traria risco substancial",
      tipo: "escolha",
      opcoes: ["Sim", "Não", "Incerto"],
      ajuda:
        "A fonte não lista quais condições são essas. A leitura é sua, e o app não a assume por você.",
      fonte: "F-15",
      /** ⚠️⚠️ ⛔ Responder *"Não"* ⛔ NÃO bloqueia ⛔ nada — ⛔ e ⛔ *"Sim"* ⛔ não libera. */
      bloqueiaTerapia: false,
      nota: "Marcar Sim faz aparecer a recomendação de risco incerto (COR 2b, LOE B-NR). Não é autorização para iniciar antiagregante, e a decisão continua sendo do médico.",
      } satisfies CampoDeclarado,
    ],
  },
]);

export const CAMPOS_ANTITROMBOTICOS: readonly Campo[] =
  GRUPO_ANTITROMBOTICO.flatMap((g) => [...g.campos]);

/* ────────────────────────────────────────────────────────────────────────────
 * 3 · A MONITORIZAÇÃO PÓS-IVT
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ REGRA OPERACIONAL, ⛔ E ⛔ NÃO CRITÉRIO DE DESTINO.
 *
 * ⛔ Esta sequência ⛔ **não** decide para onde o paciente vai ⛔ e ⛔ **não** é
 * requisito de elegibilidade. Ela descreve **o que se faz depois da IVT**, onde
 * quer que ele esteja. ⚠️ Modelada separada do destino de propósito: fundi-las
 * faria a monitorização parecer condição de internação, ⛔ ou a internação
 * parecer consequência da monitorização.
 *
 * ⚠️ **Table 7 ⛔ não tem COR/LOE** — o tipo abaixo repete a declaração.
 */
export type FaseDeMonitorizacao = {
  readonly deHoras: number;
  readonly ateHoras: number;
  readonly aCadaMin: number;
};

export const MONITORIZACAO_POS_IVT = {
  slot: "F-15",
  localizacao: "Table 7 · p. e358",
  cor: null,
  loe: null,
  semGrauNaFonte: true,
  /** ⚠️ O que se mede: PA **e** exame neurológico — os dois, ⛔ e ⛔ não um. */
  oQueSeMede: ["Pressão arterial", "Exame neurológico"],
  /**
   * ⚠️⚠️ A PRIMEIRA FASE COMEÇA **DURANTE** A INFUSÃO — *"during and after the
   * IVT for 2 h"*. ⛔ Começar a contar só no fim perderia duas horas de
   * vigilância que a fonte pede.
   */
  fases: [
    { deHoras: 0, ateHoras: 2, aCadaMin: 15 },
    { deHoras: 2, ateHoras: 8, aCadaMin: 30 },
    { deHoras: 8, ateHoras: 24, aCadaMin: 60 },
  ] as readonly FaseDeMonitorizacao[],
  /** ⚠️ Gatilho de deterioração — a fonte nomeia os sinais ⛔ e o que fazer. */
  deterioracao: {
    sinais: [
      "Cefaleia intensa",
      "Hipertensão aguda",
      "Náusea",
      "Vômito",
      "Piora do exame neurológico",
    ],
    /**
     * ⚠️⚠️ DUAS AÇÕES, ⛔ e ⛔ não uma frase — decisão do autor, 2026-08-31.
     *
     * ⛔ A fonte encadeia *"discontinue the infusion (if alteplase) **and** obtain
     * emergency head CT"*: são **dois** atos. ⚠️ Numa frase só, o olho passa por
     * cima do segundo — ⛔ e ⛔ este é conteúdo de resposta rápida.
     *
     * ⚠️ A condicional *"se for alteplase"* viaja com o ato a que pertence, ⛔ e
     * ⛔ não com o outro: a tomografia ⛔ não depende do agente.
     */
    condutas: [
      "Interromper a infusão de alteplase, se estiver em curso.",
      "Obter tomografia de crânio de emergência.",
    ],
  },
  /**
   * ⚠️ Gatilho pressórico — ⛔ a frequência AUMENTA; ⛔ ela ⛔ não muda de fase.
   * ⚠️ A conduta anti-hipertensiva **operacional** é de F-19, ⛔ e ⛔ não daqui.
   */
  /**
   * ⚠️⚠️ ⛔ OS NÚMEROS VÊM DE `PA_POS_REPERFUSAO` — **U-01 fechado**, 2026-09-07.
   *
   * ⛔ Eram literais aqui, ⛔ e o **mesmo** 180/105 vivia noutra constante como
   * alvo terapêutico. ⚠️ Uma verdade, ⛔ dois consumidores — ⛔ e ⛔ este é o
   * **gatilho de frequência**, ⛔ e ⛔ não o alvo.
   */
  /**
   * ⚠️⚠️ ⛔ **A REFERÊNCIA, ⛔ E ⛔ NÃO OS NÚMEROS** — ⛔ e ⛔ a diferença é o que
   * ⛔ uma prova consegue medir.
   *
   * ⛔ A primeira versão copiava `PA_POS_REPERFUSAO.pas` para um campo local.
   * ⚠️ A mutação que devolveu os literais `180` ⛔ e `105` **sobreviveu**: ⛔ o
   * valor batia (⛔ é o mesmo número) ⛔ e o nome ⛔ ainda aparecia no arquivo.
   *
   * ⚠️⚠️ ⛔ Guardando o **objeto**, a prova compara **identidade** — ⛔ e ⛔ um
   * literal ⛔ nunca é a mesma referência. ⛔ U-01 fica fechado por execução,
   * ⛔ e ⛔ não por varredura de texto.
   */
  gatilhoPressorico: {
    origem: PA_POS_REPERFUSAO,
    conduta: PA_POS_REPERFUSAO.consumidores.gatilhoDeFrequencia.frase,
  },
  /** ⚠️ Procedimentos a ADIAR — ⛔ e a fonte condiciona: *"if it can be safely"*. */
  adiar: {
    itens: ["Sonda nasogástrica", "Sonda vesical de demora", "Cateter arterial"],
    condicao: "Se o paciente puder ser manejado com segurança sem eles.",
  },
  /**
   * ⚠️⚠️ A IMAGEM DE CONTROLE TEM UMA **ORDEM**, ⛔ e ela é o conteúdo: o exame
   * vem **ANTES** do antitrombótico. ⛔ Dizer só "TC em 24 h" perderia a razão
   * de ser da regra.
   */
  imagemDeControle: {
    prazoHoras: 24,
    texto: "Tomografia ou ressonância de controle em 24 horas após a trombólise, ANTES de iniciar anticoagulante ou antiagregante.",
  },
} as const;

/* ────────────────────────────────────────────────────────────────────────────
 * 4 · A LACUNA PÓS-EVT
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ LACUNA DE FONTE — ⛔ e ⛔ NÃO dado faltante do paciente.
 *
 * ⚠️ A Table 7 é explicitamente **pós-IVT**. A fonte ⛔ **não** publica tabela
 * equivalente para pós-EVT, ⛔ e o arquivo de verbatim já registra que isso é
 * **achado, ⛔ não omissão do transcritor**.
 *
 * ⛔ ⛔ Copiar o esquema pós-IVT por analogia é exatamente o que **E-31** proíbe:
 * ⛔ nenhum conteúdo clínico sem verbatim que o sustente. ⚠️ A nota existe para
 * que a ausência seja **vista** — ⛔ e ⛔ não para virar um cartão de dívida
 * grande: ⛔ nada aqui espera por ação de ⛔ ninguém.
 */
export const LACUNA_POS_EVT = {
  id: "sem_monitorizacao_pos_evt",
  slot: "F-15",
  texto: "A fonte atual não publica tabela de monitorização pós-trombectomia equivalente à Table 7 pós-trombólise.",
  /** ⚠️ ⛔ NÃO é dívida a resolver por ⛔ ninguém aqui: é o estado da fonte. */
  ehLacunaDeFonte: true,
  ehDadoFaltanteDoPaciente: false,
} as const;

/* ────────────────────────────────────────────────────────────────────────────
 * 5 · A DÍVIDA DOCUMENTAL — §1.10
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ REFERÊNCIA QUEBRADA, DECLARADA — ⛔ e ⛔ NÃO reconstruída de memória.
 *
 * ⚠️ Dois arquivos de fonte remetem a *"§1.10 da spec"* para a lista de destinos,
 * ⛔ e essa spec ⛔ **não está no repositório auditado**. ⛔ Reconstruir a lista
 * seria inventar destinos com aparência de decisão antiga.
 *
 * ⚠️ G ⛔ **não depende** dela para nascer. Se §1.10 for recuperada, a
 * reconciliação é **explícita**: comparar esta lista com a de lá, ⛔ e ⛔ não
 * presumir que coincidem.
 */
export const DIVIDA_DOCUMENTAL = {
  referencia: "spec §1.10",
  /** ⚠️ Identificadores de slot, ⛔ e ⛔ não prosa: isto ⛔ nunca chega à tela. */
  citadaEm: ["F-15", "F-08"],
  estado: "nao_disponivel_no_repositorio",
  construidaApenasDeFontesAuditadas: true,
  aoRecuperar: "reconciliacao_explicita_contra_g",
} as const;

/* ────────────────────────────────────────────────────────────────────────────
 * 6 · OS FATOS OPERACIONAIS
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ CONTEXTO OPERACIONAL — ⛔ FORA DA AVALIAÇÃO CLÍNICA, POR CONSTRUÇÃO.
 *
 * ⚠️ Este tipo **morava em `derivacoes-f.ts`**, ⛔ sem campo ⛔ e ⛔ sem
 * consumidor. Mudou de casa em 2026-08-31: o tipo que descreve fatos de G ⛔ não
 * pode morar no módulo de derivação da F — a vizinhança é o primeiro convite.
 *
 * ⚠️⚠️ ⛔ ⛔ ⛔ **⛔ NENHUM destes fatos alcança `valorDoInsumo` da F.**
 *
 * ⛔ ⛔ Usar *"⛔ não há centro EVT aqui"* para satisfazer `cannot receive EVT`
 * transformaria **geografia em critério clínico**, ⛔ e faria o app recomendar
 * trombólise estendida por um motivo que a diretriz ⛔ nunca escreveu. **F-31
 * permanece aberta**, ⛔ e ⛔ não se fecha por aqui.
 *
 * ⚠️ G **pode** lê-los — para descrever a capacidade do serviço e, no futuro,
 * para logística. ⛔ O que ⛔ não pode é virar veredito clínico.
 */
export const CASA_DOS_FATOS_OPERACIONAIS: SuperficieId = "destino";

export type FatoOperacional = {
  readonly id: string;
  readonly rotulo: string;
  readonly opcoes: readonly string[];
  /** ⚠️ O que este fato PODE gerar. ⛔ Nunca exclusão de terapia. */
  readonly geraNoMaximo: "indisponibilidade_operacional";
  readonly nota: string;
};

/**
 * ⚠️ Estado inicial: **⛔ não informado**, sempre. ⛔ ⛔ Não se infere por
 * hospital, cidade, país, ⛔ nem por quais exames apareceram na Superfície C.
 * ⚠️ Ter feito uma perfusão ⛔ não prova que o serviço a tem disponível agora.
 */
export const FATOS_OPERACIONAIS: readonly FatoOperacional[] = [
  {
    id: "centro_evt_disponivel",
    rotulo: "Este serviço realiza trombectomia",
    opcoes: ["Sim", "Não", "Incerto"],
    geraNoMaximo: "indisponibilidade_operacional",
    nota: "Não realizar trombectomia aqui é indisponibilidade operacional. Não torna o paciente inelegível, e não satisfaz nenhum critério clínico.",
  },
  {
    id: "transferencia_possivel",
    rotulo: "Transferência é viável neste momento",
    opcoes: ["Sim", "Não", "Incerto"],
    geraNoMaximo: "indisponibilidade_operacional",
    nota: "A fonte auditada não traz recomendação de transferência. Este fato é contexto do serviço, e não decisão de encaminhamento.",
  },
  {
    id: "perfusao_automatizada_disponivel",
    rotulo: "Perfusão automatizada disponível neste serviço",
    opcoes: ["Sim", "Não", "Incerto"],
    geraNoMaximo: "indisponibilidade_operacional",
    nota: "Ausência de perfusão automatizada torna aquela via de seleção indisponível aqui. Não torna o paciente inelegível.",
  },
];

/**
 * ⚠️⚠️ A LISTA QUE A TRAVA LÊ — ⛔ e ⛔ não uma cópia à mão.
 *
 * ⛔ A barreira G → F confere que ⛔ nenhum destes ids aparece nas derivações de
 * correspondência da F. Derivar a lista do catálogo faz com que **um fato
 * operacional novo entre já protegido**, ⛔ e ⛔ não protegido só se alguém
 * lembrar de acrescentá-lo à trava (D-15).
 */
export const IDS_OPERACIONAIS: readonly string[] = FATOS_OPERACIONAIS.map((f) => f.id);
