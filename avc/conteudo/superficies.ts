/**
 * Q-02 · O CONTEÚDO DAS SUPERFÍCIES — dados puros, ⛔ nenhum React.
 *
 * ⚠️ Este arquivo existe para que a medicina NÃO more no componente (E-29).
 * A tela lê daqui; ⛔ nunca o contrário.
 *
 * ⚠️ ESQUELETO: rótulos e estrutura. ⛔ Nenhum corte, nenhuma dose, nenhuma
 * regra de elegibilidade — essas entram depois, cada uma com o seu slot de fonte.
 *
 * ⚠️ Os textos estão em PT-BR e são traduzidos NO RENDER por `tr()` (Q-03).
 * ⛔ Nenhum deles é verbatim de fonte: verbatim não se traduz (§6.14).
 */

import type { Pendencia, SuperficieId } from "../nucleo/tipos";
import { TODOS_OS_CAMPOS_A } from "./superficie-a";
import { TODOS_OS_CAMPOS_B } from "./superficie-b";
import { TODOS_OS_CAMPOS_C } from "./superficie-c";
import { TODOS_OS_CAMPOS_P } from "./paciente";
import { TODOS_OS_CAMPOS_L } from "./laboratorio";

export type Superficie = {
  /** ⚠️ Identidade ESTÁVEL. ⛔ Não muda quando a ordem ou a letra mudam. */
  readonly id: SuperficieId;
  /**
   * ⚠️⚠️ PAINEL TRANSVERSAL — ⛔ **não é etapa do fluxo**.
   *
   * **Paciente** e **Laboratório** são contexto consultável de qualquer lugar;
   * as demais são etapas. A distinção sobrevive à remoção das letras, porque ela
   * ⛔ nunca foi sobre a letra: é sobre **ser ou não ser passo do atendimento**.
   */
  readonly painel?: true;
  /**
   * ⚠️⚠️ DESTINO — ⛔ **não é etapa do fluxo isquêmico** (PD-36).
   *
   * `hic` e `hsa` são alcançadas a partir de Destino quando a Imagem identifica
   * hemorragia ou suspeita de HSA. Elas existem em `SUPERFICIES` para que
   * `superficie(id)` as encontre e a tela as renderize — ⛔ mas ⛔ **não** entram
   * na barra de passos, porque o paciente hemorrágico ⛔ não segue o fluxo de
   * trombólise. A navegação de passos filtra `!destino`.
   */
  readonly destino?: true;
  readonly titulo: string;
  readonly resumo: string;
  /** Slots de fonte que governam esta superfície. */
  readonly fontes: readonly string[];
};

/** Uma superfície como ela é DECLARADA. */
type DeclaracaoDeSuperficie = Superficie;

/**
 * As sete superfícies (§7.15), NA ORDEM EM QUE APARECEM.
 *
 * ⚠️⚠️ A ORDEM É DE APRESENTAÇÃO, ⛔ NÃO DE FLUXO. Qualquer uma abre a qualquer
 * momento, em qualquer ordem — ⛔ não há árvore linear, ⛔ não há pré-requisito
 * de navegação, e ⛔ nenhuma superfície declara "próxima" ou "anterior" (§7.2,
 * E-11). Reordenar este arranjo muda o que o médico VÊ primeiro; ⛔ não muda o
 * que ele PODE fazer.
 *
 * ── POR QUE CORREÇÕES VEM ANTES DE REPERFUSÃO (decisão do autor, 2026-08-28) ─
 *
 * Pressão arterial e glicemia são o que se resolve **enquanto** a reperfusão é
 * decidida, e frequentemente são pré-condição prática dela. Pôr Reperfusão
 * antes sugeria uma sequência que ⛔ não existe. ⚠️ Isto continua sendo ordem de
 * leitura: ⛔ ninguém é obrigado a passar por Correções para chegar a Reperfusão.
 */
const ORDEM_DE_APRESENTACAO: readonly DeclaracaoDeSuperficie[] = [
  /**
   * ⚠️⚠️ OS DOIS PAINÉIS VÊM PRIMEIRO NA LEITURA, e ⛔ **não** no fluxo.
   *
   * ⚠️ Aparecer primeiro ⛔ não é ser passo 1: com Paciente **inteiramente vazio**,
   * todas as superfícies abrem, ⛔ nenhuma some e ⛔ nenhum bloqueio nasce. É a
   * condição que o autor impôs ao aprová-la, e a prova a mede.
   */
  {
    id: "paciente",
    /**
     * ⚠️⚠️ ⛔ DEIXOU DE SER PAINEL EM 2026-09-06 — decisão **C3** do autor.
     *
     * ⛔ Paciente vivia num bloco de *"acesso rápido"* ao lado da barra: ⛔ um
     * **caminho concorrente**, ⛔ e é ⛔ exatamente isso que a §61 do briefing
     * proíbe — *"se houver qualquer outro caminho concorrente visível, a
     * refatoração ⛔ ainda ⛔ não está concluída"*.
     *
     * ⚠️ ⛔ E ⛔ ela é a **primeira** fase do atendimento: peso, idade, mRS ⛔ e
     * anticoagulante são o contexto que todas as decisões seguintes leem.
     */
    titulo: "Paciente",
    resumo: "Identificação, dados basais, alergias, medicações e antecedentes.",
    fontes: ["F-07", "F-08", "F-09", "F-10", "F-16", "F-27"],
  },
  {
    id: "laboratorio",
    painel: true,
    titulo: "Laboratório",
    resumo: "Resultados do episódio, com horário e possibilidade de nova coleta.",
    fontes: ["F-10"],
  },
  {
    id: "estabilizacao",
    titulo: "Entrada e estabilização",
    resumo: "Chegada, relógios, via aérea, sinais vitais, glicemia.",
    fontes: ["F-23", "F-06", "F-13"],
  },
  {
    id: "neurologico",
    /**
     * ⚠️ *"Avaliação AVC"* — nome da fase no fluxo oficial (**C3**). ⛔ O slug
     * ⛔ não muda: **slug é identidade, título é apresentação**.
     */
    titulo: "Avaliação AVC",
    resumo: "Déficit, NIHSS, incapacitância, funcionalidade prévia.",
    fontes: ["F-17", "F-14"],
  },
  {
    id: "imagem",
    /**
     * ⚠️⚠️ *"Investigação"* — ⛔ e ⛔ o nome mudou porque o **conteúdo** mudou:
     * ⛔ a fase passa a carregar imagem **e** laboratório, que o briefing
     * (**§16**) trata como dois blocos de uma investigação só.
     *
     * ⛔ O slug segue `imagem` — ⛔ ele é a **casa** de dezesseis campos, ⛔ e
     * renomeá-lo moveria fato clínico de lugar ⛔ sem necessidade ⛔ nenhuma.
     */
    titulo: "Investigação",
    resumo: "TC, exclusão de hemorragia, imagem vascular.",
    /**
     * ⚠️ QUATRO SLOTS, e ⛔ não um: a exclusão de hemorragia e a imagem vascular
     * são **F-16**; os fatos que a frente endovascular usa — sítio, ASPECTS,
     * efeito de massa — são **F-08**; o horário do exame responde a **F-11**; e o
     * registro dos exames avançados aponta para **F-03**, onde a regra que os lê
     * vai morar; a **hipodensidade clara** é **F-07**, que a define; e **F-28** e
     * **F-29** estão **abertos** — o médico que abrir a lista vê que o ASPECTS
     * clicável e o critério de efeito de massa dependem de fonte que ainda ⛔ não
     * existe. Listar só um faria a rastreabilidade da tela mentir por omissão.
     */
    fontes: ["F-16", "F-08", "F-11", "F-03", "F-07", "F-28", "F-29"],
  },
  {
    id: "seguranca",
    /**
     * ⚠️⚠️ **⛔ NÃO "elegibilidade"** — renomeada em 2026-08-30, por decisão do autor:
     *
     * > *"'Segurança e elegibilidade' promete uma resposta que D deliberadamente
     * > ⛔ não fornece."*
     *
     * ⚠️ E **"para trombólise"**, e ⛔ não "da reperfusão": ⛔ toda a interpretação
     * desta superfície é da **trombólise intravenosa**. F-08, que é
     * trombectomia, ⛔ não entra aqui. Se um dia entrar, o nome amplia junto.
     */
    titulo: "Segurança para trombólise",
    resumo: "Anticoagulante, sangramento, procedimentos, exames.",
    fontes: ["F-07", "F-10"],
  },
  {
    id: "correcoes",
    titulo: "Correções",
    resumo: "Pressão arterial e glicemia, sem sair do atendimento.",
    fontes: ["F-04", "F-05", "F-18", "F-19"],
  },
  {
    id: "reperfusao",
    titulo: "Reperfusão",
    resumo: "Trombólise IV e trombectomia — frentes paralelas.",
    fontes: ["F-02", "F-03", "F-08", "F-09"],
  },
  {
    id: "destino",
    titulo: "Destino",
    resumo: "Transferência, unidade de AVC, saídas do fluxo.",
    fontes: ["F-15"],
  },
  /**
   * ⚠️⚠️ OS DOIS DESTINOS HEMORRÁGICOS (PD-36). Catálogos de recomendação,
   * alcançados a partir de Destino/Imagem. ⛔ Não são passos do fluxo isquêmico.
   */
  {
    id: "hic",
    destino: true,
    titulo: "AVC hemorrágico (HIC)",
    resumo: "Recomendações da diretriz de hemorragia intracerebral espontânea.",
    fontes: [
      "H-01", "H-02", "H-03", "H-04", "H-05", "H-06", "H-07", "H-08",
      "H-09", "H-10", "H-11", "H-12", "H-13", "H-14", "H-15",
    ],
  },
  {
    id: "hsa",
    destino: true,
    titulo: "Hemorragia subaracnóidea (HSA)",
    resumo: "Recomendações da diretriz de HSA aneurismática.",
    fontes: ["S-01", "S-02", "S-03", "S-04", "S-05", "S-06", "S-07", "S-08"],
  },
] as const;



/**
 * ── ⛔⛔ AS LETRAS SAÍRAM DA APRESENTAÇÃO (autor, 2026-08-30) ─────────────────
 *
 * O módulo mostrava `A · Entrada e estabilização` … `G · Destino`, e o app tem
 * **outro** A–E, com significado oposto: o **ABCDE do atendimento**.
 *
 * ⚠️⚠️ O caso que decidiu: **D**. Aqui era *Segurança para trombólise*; no ABCDE é
 * **Disfunção neurológica** — e o paciente do AVC **tem** disfunção neurológica.
 * As duas leituras eram plausíveis na mesma tela.
 *
 * > *"'D' poder significar tanto Segurança para trombólise quanto Disfunção
 * > neurológica é um conflito ruim justamente no tipo de paciente em que as duas
 * > leituras são plausíveis."*
 *
 * ⚠️ **E ⛔ não entraram números no lugar**: seria trocar uma convenção arbitrária
 * por outra. O fluxo ⛔ não tem "próximo obrigatório" — os **nomes bastam**.
 *
 * ⛔ **Os slugs ⛔ não mudaram.** A letra sempre foi apresentação (`SUPERFICIE_D ===
 * "seguranca"`), e é por isso que removê-la ⛔ não tocou fato, derivação ⛔ nem
 * trilha. A trava que separou identidade de rótulo nasceu justamente para que
 * este dia fosse barato.
 */
export const SUPERFICIES: readonly Superficie[] = ORDEM_DE_APRESENTACAO.map((s) => ({ ...s }));

/**
 * ⚠️⚠️ AS SUPERFÍCIES QUE TÊM **ABA** — ⛔ e ⛔ não "as superfícies que existem".
 *
 * ⚠️ Nasceu em 2026-09-05 (PD-36) porque a distinção passou a existir: os
 * destinos hemorrágicos são superfícies de verdade, ⛔ mas ⛔ não têm aba —
 * chega-se a elas pelo Destino, ⛔ e ⛔ não pela barra.
 *
 * ⚠️ Ela mora aqui, ⛔ e ⛔ não repetida em cada tela e em cada teste: o filtro
 * `!destino` escrito em seis lugares vira seis verdades que divergem na
 * primeira mudança (**I6**). Quem pergunta *"quais superfícies o médico
 * alcança pela navegação?"* pergunta a esta lista.
 */
/**
 * ⚠️⚠️ ⛔ A SEQUÊNCIA OFICIAL — **⛔ a única resposta** para *"qual caminho o
 * médico percorre?"* (**§61** do briefing, decisão **C3**).
 *
 * ⛔ Ela existe aqui, ⛔ e ⛔ não como filtro escrito dentro do JSX, porque
 * **três** consumidores precisam da mesma lista: a barra de fases, a prova das
 * superfícies ⛔ e o e2e. ⚠️ Escrita três vezes, ⛔ bastaria uma delas aprender
 * uma fase nova para as três divergirem (**I6**).
 *
 * ── ⚠️ O QUE FICA DE FORA, ⛔ E ⛔ POR QUÊ ──────────────────────────────────
 *
 * ⛔ **destinos** (HIC, HSA) — ⛔ o paciente hemorrágico ⛔ não percorre o fluxo
 *    de trombólise; ⛔ eles são saídas, ⛔ e ⛔ não etapas.
 * ⛔ **painéis** (Laboratório) — ⛔ ele é **renderizado dentro** de Investigação
 *    (**§16**), ⛔ e ⛔ não alcançado por atalho.
 * ⛔ **Correções** — ⛔ ela é **condicional**: ⛔ só existe quando há o que
 *    corrigir, ⛔ e é alcançada **pelo problema que a exige** (**C3**). ⛔ Como
 *    fase fixa, ⛔ ficaria vazia na maioria dos atendimentos.
 */
export const SEQUENCIA_OFICIAL: readonly Superficie[] = SUPERFICIES.filter(
  (s) => !s.destino && !s.painel && s.id !== "correcoes"
);

/**
 * ⚠️⚠️ ⛔ **DEPRECIADO** — ⛔ e o nome passou a mentir em 2026-09-06.
 *
 * ⛔ Ele significava *"toda superfície com aba"*, ⛔ e incluía Laboratório ⛔ e
 * Correções — ⛔ que ⛔ **⛔ não têm mais aba ⛔ nenhuma**. ⚠️ Quem precisa da
 * navegação usa `SEQUENCIA_OFICIAL`; ⛔ quem precisa de *"tudo que ⛔ não é
 * destino"* — ⛔ e há usos legítimos, como varrer toda tela alcançável —
 * continua aqui, ⛔ com o nome corrigido.
 */
export const SUPERFICIES_ALCANCAVEIS: readonly Superficie[] = SUPERFICIES.filter(
  (s) => !s.destino
);

export function superficie(id: SuperficieId): Superficie {
  const achada = SUPERFICIES.find((s) => s.id === id);
  // ⚠️ Sem piso silencioso: id inválido é erro de programação, não estado clínico.
  if (!achada) throw new Error(`superficie: id desconhecido "${id}"`);
  return achada;
}

/**
 * Pendências do esqueleto — as mínimas para o módulo ser navegável e já mostrar
 * o comportamento de §5.5: **dono numa superfície, alcance global**.
 *
 * ⚠️ ESQUELETO. ⛔ Nenhuma delas bloqueia coisa alguma ainda, e ⛔ nenhuma está na
 * lista das doze marcas 🚫 (E-49) — foram escolhidas exatamente por isso.
 */
/**
 * ⚠️⚠️ A PENDÊNCIA DA TOMOGRAFIA SAIU DAQUI EM 2026-08-29, e a saída é uma
 * FORMATURA, ⛔ não um esquecimento.
 *
 * Ela vivia aqui como declaração invisível — campo inexistente, pendência
 * filtrada por `pendenciasVigentes()`. Com a Superfície C construída, ela passou
 * a ser **derivada** (`pendenciasDaImagem`), e a razão é **PD-22**: o filtro
 * daqui mede *campo vazio*, e *"realizada — resultado ainda ⛔ não disponível"* é
 * resposta **preenchida** que ⛔ **não** encerra a tarefa. Mantida aqui, ela
 * fecharia sozinha e a tela diria "resolvido" sobre a coisa mais importante do
 * atendimento.
 *
 * ⚠️ O MECANISMO CONTINUA VIVO para as superfícies que ainda ⛔ não nasceram — é
 * por isso que `camposQueExistem()` já conhece a C.
 */
const TODAS_AS_PENDENCIAS: readonly Pendencia[] = [
  {
    id: "ultima_vez_bem",
    rotulo: "Última vez visto bem",
    /**
     * ⚠️⚠️ ⛔ `neurologico` DESDE 2026-09-07 (**C7**) — ⛔ e ⛔ isto ⛔ não é
     * cosmético: `dono` é para **onde a pendência manda o médico**, ⛔ e a
     * cronologia passou a ser desenhada na Avaliação AVC.
     *
     * ⛔ Deixá-lo em `estabilizacao` abriria uma pendência que leva a uma tela
     * ⛔ **sem o campo** — muro, ⛔ e ⛔ não tarefa (**E-26** ⛔ e a invariante
     * **I-7**: pendência ⛔ sem mecanismo de resolução REPROVA teste).
     */
    dono: "neurologico",
    campo: "hora_ultima_vez_bem",
    resolvePor: "Informar o horário, ou registrar que é desconhecido",
  },
  {
    id: "deficit_focal",
    rotulo: "Déficit neurológico",
    dono: "neurologico",
    campo: "deficit_focal",
    resolvePor: "Registrar o exame neurológico",
  },
] as const;

/**
 * AS PENDÊNCIAS QUE O MÓDULO REALMENTE MOSTRA.
 *
 * ⚠️⚠️ SÓ ENTRA A PENDÊNCIA CUJO CAMPO EXISTE — relato do autor, 2026-08-29:
 * *"no segundo print aparece como pendência mas não tem isso nessa tela"*.
 *
 * ── O DEFEITO QUE ISTO FECHA ──────────────────────────────────────────────
 *
 * "Tomografia de crânio" apontava para a Superfície de Imagem, que ⛔ não existe.
 * Tocar nela abria uma tela que diz "em construção": pendência **sem mecanismo
 * de resolução** — muro, ⛔ não tarefa (**E-26**, e a invariante I-7 fixada pelo
 * próprio autor: *"pendência sem mecanismo de resolução REPROVA teste, ⛔ não
 * fica aberta em silêncio"*).
 *
 * ⚠️⚠️ E O FILTRO É DERIVADO DOS CAMPOS QUE EXISTEM, ⛔ NÃO UMA LISTA À MÃO: no
 * dia em que a Superfície C nascer com o campo `tc_realizada`, a pendência
 * reaparece **sozinha**. Uma lista manual exigiria que alguém lembrasse — e é
 * exatamente esse "alguém lembra" que produz conteúdo esquecido no app.
 */
/**
 * ⚠️⚠️ É FUNÇÃO, E ⛔ NÃO CONSTANTE DERIVADA NO TOPO DO MÓDULO — e isso ⛔ não é
 * estilo: a primeira versão era `const` e QUEBROU O APP no navegador, com
 * `Cannot access 'TODAS_AS_PENDENCIAS' before initialization`.
 *
 * ⚠️ O `tsc` passou, as travas em node passaram e o e2e sobre o `dist` passou —
 * só o bundle de desenvolvimento reprovou, porque a ordem de inicialização de
 * módulo depende do bundler e ⛔ não do que está escrito no arquivo. Calculada na
 * CHAMADA, a ordem deixa de importar.
 *
 * ⚠️ E o efeito do defeito era o pior possível: tela branca com um toast, ⛔ não
 * um campo errado. Módulo clínico que ⛔ não abre ⛔ não tem como ser conferido.
 */
function camposQueExistem(): ReadonlySet<string> {
  return new Set(
    [
      ...TODOS_OS_CAMPOS_P,
      ...TODOS_OS_CAMPOS_L,
      ...TODOS_OS_CAMPOS_A,
      ...TODOS_OS_CAMPOS_B,
      ...TODOS_OS_CAMPOS_C,
    ].map(
      (c) => c.id
    )
  );
}

export function pendenciasVigentes(): readonly Pendencia[] {
  const campos = camposQueExistem();
  return TODAS_AS_PENDENCIAS.filter((p) => campos.has(p.campo));
}
