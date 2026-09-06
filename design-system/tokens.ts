import type { TextStyle, ViewStyle } from "react-native";

/**
 * Design tokens da UI 2.0 — Clinical Emergency Suite.
 *
 * Fonte única de cor, tipografia, espaçamento e forma. Componente nenhum deve
 * escrever hex, tamanho de fonte ou espaçamento na mão: se um valor não está
 * aqui, ele não existe.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Duas adaptações em relação ao texto do plano, ambas porque este app é React
 * Native (decisão registrada em MAPA-APP.md §1: manter padrão iOS/Android).
 *
 * 1. NÃO são CSS variables. Elas não existem em RN. São objetos TypeScript, e o
 *    tema ativo se escolhe com `useTheme()` (design-system/theme.ts).
 *
 * 2. Tipografia NÃO usa rem. Em RN, `fontSize` é em dp e JÁ escala com o ajuste
 *    de tamanho de fonte do sistema (`allowFontScaling` vem ligado por padrão) —
 *    é o equivalente nativo do que o rem dá na web, e o caminho correto para a
 *    plataforma escolhida. Os números abaixo são os mesmos do plano, convertidos
 *    de rem para dp na base 16 (1.125rem = 18).
 *
 *    Limitação conhecida na web: react-native-web emite esses valores em px, que
 *    respeitam o zoom do navegador mas não a preferência de "tamanho de fonte
 *    padrão". Se isso virar requisito, o ponto de mudança é só aqui — trocar os
 *    números por `Platform.select({ web: "1.125rem", default: 18 })`.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Contraste é verificado por `npm run test:contraste` nos dois temas. Alterou
 * cor? Rode antes de commitar.
 */

// ── Cor ──────────────────────────────────────────────────────────────────────

export type Cores = {
  /** Identidade e ações principais. */
  primary: string;
  /** Texto/ícone sobre `primary` — muda por tema porque no escuro o primary é claro. */
  onPrimary: string;
  /** PCR, ações críticas, perigo. */
  critical: string;
  /** Texto/ícone sobre `critical`. */
  onCritical: string;
  /** Confirmações. */
  success: string;
  /** Alertas. */
  warning: string;
  /**
   * ⚠️⚠️ DÍVIDA DE FONTE — a diretriz ⛔ não fecha o critério.
   *
   * ⛔ Cor PRÓPRIA, ⛔ e ⛔ não `warning`: "o app ⛔ não consegue avaliar" ⛔ não é
   * "falta um dado do paciente". Uma é limite da fonte, a outra é trabalho do
   * médico — se as duas ficarem âmbar, a tela apaga a distinção que a
   * Superfície F inteira existe para manter. ⛔ Também ⛔ não é `critical`:
   * ⛔ não há nada de errado acontecendo.
   */
  debt: string;
  /** Fundo da tela. */
  bg: string;
  /** Cards — o primeiro degrau acima do fundo. */
  surface: string;
  /**
   * ⚠️⚠️ O SEGUNDO DEGRAU — para conteúdo **dentro** de um card.
   *
   * ⚠️ Nasceu em 2026-09-05 para acabar com o *card dentro de card*: quando um
   * bloco precisa se separar do card que o contém, ele muda de **degrau**, ⛔ e
   * ⛔ não ganha mais uma borda. ⛔ Três molduras aninhadas é o que dá aparência
   * de protótipo.
   */
  surfaceElevated: string;
  /** Bordas sutis. */
  border: string;
  /** Texto principal. ⚠️ É o `textPrimary` do design system — o nome é histórico. */
  text: string;
  /** Texto secundário, legendas. */
  textSecondary: string;
  /**
   * ⚠️⚠️ INFORMATIVO — ⛔ e ⛔ **não** `primary`.
   *
   * ⛔ `primary` é **ação**: o que o dedo aperta. `info` é **contexto**: o que a
   * tela explica ⛔ sem pedir nada. Usar a cor de ação para informar treina o
   * médico a tocar no que ⛔ não é tocável (e vice-versa, que é pior).
   */
  info: string;
  /**
   * ⚠️⚠️ O PREENCHIMENTO DO BOTÃO — ⛔ e ⛔ **não** o `primary` de texto.
   *
   * ⛔ No tema escuro `primary` é CLARO (ele precisa ser legível como texto
   * sobre o fundo quase preto). ⚠️ Um botão pintado com ele ficaria claro, ⛔ e
   * exigiria texto escuro em cima — o oposto das referências, onde a ação é um
   * bloco **saturado com texto branco**.
   *
   * ⚠️ Por isso são dois tokens, ⛔ e ⛔ não um: `primary` **escreve**,
   * `primaryFill` **preenche**. ⛔ Confundi-los foi o que produziu botões
   * pálidos onde a referência tem ação sólida.
   */
  primaryFill: string;
  /** ⚠️ O verde do "Sim" — ⛔ preenchido, ⛔ e ⛔ não contornado. */
  successFill: string;
  /** ⚠️ O vermelho do "Não". ⛔ Decisão negativa ⛔ não é erro: ⛔ é resposta. */
  criticalFill: string;
  /** ⚠️ Texto ⛔ e ícone sobre QUALQUER preenchimento acima. ⛔ Um só, de propósito. */
  onFill: string;

  /**
   * ⚠️⚠️ A SUPERFÍCIE DO **CONTROLE** — ⛔ e ⛔ ela ⛔ não é `surfaceElevated`.
   *
   * ⛔ Nasceu de um defeito medido em 2026-09-06: o chip de opção usava
   * `surfaceElevated` sobre um card `surface` (**1,14:1**) com borda `border`
   * (**1,19:1** sobre o próprio chip). ⚠️ Os dois sinais que dizem *"isto é um
   * botão"* estavam, ⛔ ambos, ⛔ abaixo do limiar de percepção.
   *
   * ⛔ Relato do autor: *"botões todos iguais, parecem textos"*. ⛔ Ele ⛔ não
   * estava descrevendo gosto — ⛔ estava descrevendo **1,14:1**.
   *
   * ⚠️ `surfaceElevated` continua sendo o **degrau de conteúdo** (um bloco
   * dentro de um card). `controlSurface` é o degrau do **que se aperta** — ⛔ e
   * separá-los é o que permite ao segundo ser mais forte ⛔ sem inflar o
   * primeiro.
   */
  controlSurface: string;
  /** ⚠️ A borda do controle — ⛔ visível, ⛔ e ⛔ não o filete de `border`. */
  controlBorder: string;

  /**
   * ⚠️⚠️ OS TINGIMENTOS — o fundo levemente colorido do bloco de estado.
   *
   * ⚠️ É o que dá ao card de alerta ⛔ e ao card da decisão a **presença** que
   * as referências têm ⛔ sem recorrer a borda grossa: um fundo que já pertence
   * à família da cor, ⛔ e o acento por cima.
   *
   * ⛔ Eles ⛔ não são `surface` com opacidade: opacidade sobre fundo variável dá
   * cor imprevisível, ⛔ e o contraste deixa de ser calculável.
   */
  primaryTint: string;
  successTint: string;
  warningTint: string;
  criticalTint: string;
  /**
   * ⚠️ DESABILITADO — ⛔ e ⛔ nunca o único sinal de que algo ⛔ não está
   * disponível. ⚠️ Cor sozinha ⛔ não comunica estado (E-15): quem depende dela
   * ⛔ não enxerga a diferença. Vem sempre com texto ⛔ ou ícone.
   *
   * ⛔ Fora do piso de 4,5:1 de propósito — WCAG isenta controle desabilitado, ⛔ e
   * forçar contraste alto faria o desabilitado competir com o ativo.
   */
  disabled: string;
};

const CORES_CLARO: Cores = {
  primary: "#1A6BD5",
  onPrimary: "#FFFFFF",
  critical: "#D82222",
  onCritical: "#FFFFFF",
  // Escurecidos em relação ao plano (#16A34A e #D97706), que como TEXTO davam
  // 3,15:1 e 3,04:1 sobre a superfície clara — reprova. O plano só garantia o
  // mínimo de 3:1 de elemento gráfico, mas estas cores são usadas em texto.
  success: "#15803D",
  warning: "#B45309",
  debt: "#6D28D9",
  /**
   * ⚠️⚠️ FUNDO CINZA, CARD BRANCO — invertido em 2026-09-05, ⛔ e ⛔ não por gosto.
   *
   * ⛔ Antes: fundo branco ⛔ e card cinza-claro. O card ficava **mais escuro** que
   * a tela, ⛔ o que lê como afundado, ⛔ e ⛔ não como elevado — e obrigava borda
   * em tudo para separar. ⚠️ Fundo cinza com card branco é o padrão das
   * referências ⛔ e o que deixa o card se destacar **sem moldura**.
   *
   * ⚠️ Trocar isto foi seguro porque o tema claro ⛔ ainda ⛔ não é usado: o app
   * está fixo no escuro (`theme.ts`) até a migração dos 52 arquivos com hex cru.
   */
  bg: "#F2F4F7",
  surface: "#FFFFFF",
  surfaceElevated: "#F8FAFC",
  border: "#DBE0E7",
  text: "#0F172A",
  /**
   * ⚠️ Escurecido junto com `controlSurface` (2026-09-06): o corpo do controle
   * ficou mais escuro, ⛔ e o texto secundário sobre ele caiu para **4,16:1**.
   * ⛔ Mexer numa cor ⛔ sem medir o par que ⛔ ela ⛔ não sabe que tem é como
   * nasce contraste ruim que passa na revisão.
   */
  textSecondary: "#515D6E",
  info: "#0E7490",
  primaryFill: "#1A6BD5",
  successFill: "#15803D",
  criticalFill: "#B3261E",
  onFill: "#FFFFFF",
  /**
   * ⚠️ Medidos: 1,28:1 sobre o card branco, ⛔ e a borda a 2,24:1 sobre o
   * preenchimento. ⛔ Os primeiros valores (`#EEF1F5` / `#C2CBD8`) davam 1,13 ⛔ e
   * 1,44 — ⛔ e reprovaram na mesma trava que pegou o tema escuro.
   */
  /**
   * ⚠️⚠️ ESCURECIDO EM 2026-09-06 — ⛔ e ⛔ isso é medida, ⛔ não gosto.
   *
   * ⛔ `#DDE4ED` sobre o fundo `#F2F4F7` media **1,16:1**: no tema claro, ⛔ o
   * corpo do botão ⛔ praticamente ⛔ não existia — ⛔ e sobrava ⛔ só a borda para
   * dizer que ali se toca. ⚠️ ⛔ É a mesma classe de defeito que o autor
   * relatou seis vezes: a regra estava no arquivo, ⛔ e ⛔ não na tela.
   */
  controlSurface: "#D2DBE6",
  controlBorder: "#8E9CB1",
  primaryTint: "#EAF2FE",
  successTint: "#E9F7EE",
  warningTint: "#FDF4E3",
  /**
   * ⚠️ `#FEF5F5` ⛔ e ⛔ não `#FDECEC`: no tom anterior o próprio vermelho
   * escrito em cima dava **4,41:1** — reprovado por 0,09. ⛔ Clarear o
   * tingimento foi o ajuste certo; escurecer o vermelho mexeria numa cor usada
   * em ⛔ outros ⛔ oito pares que já passavam.
   */
  criticalTint: "#FEF5F5",
  disabled: "#A3AEBF",
};

const CORES_ESCURO: Cores = {
  /**
   * ⚠️⚠️ RETONALIZADO EM 2026-09-06 PARA AS REFERÊNCIAS DO AUTOR.
   *
   * ⛔ A paleta anterior (`bg #292E38`, `surface #383E4A`) era **cinza-ardósia
   * médio**: card ⛔ e fundo separados por dois degraus quase iguais, ⛔ e todo
   * acento tinha de ser pastel para não brigar. ⚠️ O resultado ⛔ não parecia um
   * produto — parecia um esqueleto bem organizado, ⛔ e foi exatamente essa a
   * crítica do autor ao ver a tela ao lado das referências que ele mandou.
   *
   * ⚠️ As referências são **quase-pretas com viés azul**, com o card apenas um
   * degrau acima ⛔ e os acentos **saturados**. ⛔ Fundo escuro ⛔ não é estética:
   * ele é o que permite ao verde do "Sim" ⛔ e ao vermelho do "Não" existirem
   * como blocos sólidos ⛔ sem ofuscar o texto ao redor.
   */
  bg: "#0B0E14",
  surface: "#151C27",
  /** ⚠️ O degrau de dentro do card — onde mora o tile de sinal vital. */
  surfaceElevated: "#1E2735",
  border: "#2A3442",
  text: "#FFFFFF",
  /**
   * ⚠️⚠️ `#A6B2C4` ⛔ e ⛔ não `#9BA8BA` — corrigido pela suíte em 2026-09-06.
   *
   * ⛔ O tom anterior passava com folga no AVC (8,01:1 sobre o fundo novo) ⛔ e
   * **reprovava em três módulos legados** — `calculadoras-clinicas`,
   * `drogas-vasoativas` ⛔ e `pcr-gestacao-acls` —, onde caía para **4,45:1**:
   * 0,05 abaixo do piso, em textos como *"mcg/kg/min"* ⛔ e *"mL/h"*.
   *
   * ⚠️⚠️ A CAUSA: esses módulos desenham sobre superfície de **hex cru**, mais
   * clara que a do AVC. ⛔ Escurecer o fundo do tema ⛔ não os alcançou — ⛔ e o
   * validador de tokens ⛔ também ⛔ não, porque ele mede a paleta contra ela
   * mesma. ⛔ Quem viu foi o teste **RENDERIZADO**, ⛔ e ⛔ só ele poderia ver.
   *
   * ⚠️ Registrado porque é a segunda vez que esta armadilha aparece neste
   * arquivo: token que passa na paleta ⛔ e reprova na tela.
   */
  textSecondary: "#A6B2C4",

  /**
   * ⚠️⚠️ OS ACENTOS SÃO DE **TEXTO**, ⛔ e por isso continuam claros.
   *
   * ⚠️ Todos medem ≥ 5,4:1 sobre `surface` — folga confortável acima do piso,
   * ⛔ e ⛔ não o mínimo raspado que a paleta anterior vivia negociando.
   */
  primary: "#5AA9FF",
  onPrimary: "#0B0E14",
  critical: "#FF6B75",
  onCritical: "#0B0E14",
  success: "#3DDC84",
  warning: "#FBBF24",
  debt: "#C58BFF",
  /** ⚠️ Ciano, ⛔ e ⛔ não o azul de `primary`: informar ⛔ não é convidar a tocar. */
  info: "#5CE1F2",

  /**
   * ⚠️⚠️ OS PREENCHIMENTOS SÃO **ESCUROS**, ⛔ e o texto em cima é branco.
   *
   * ⛔ É o inverso dos acentos acima, ⛔ e ⛔ isso ⛔ não é inconsistência: um
   * acento **escreve** sobre o fundo escuro (então precisa ser claro); um
   * preenchimento **é** o fundo (então precisa ser escuro o bastante para
   * sustentar o branco). ⚠️ Medidos: 5,11:1 · 4,83:1 · 6,54:1.
   */
  primaryFill: "#1A6BD5",
  successFill: "#12833F",
  criticalFill: "#B3261E",
  onFill: "#FFFFFF",

  /**
   * ⚠️ Medidos: `controlSurface` dá **1,42:1** sobre o card ⛔ e sustenta texto
   * branco a **12:1**; `controlBorder` dá **1,78:1** sobre o preenchimento.
   * ⛔ Os valores anteriores davam 1,14 ⛔ e 1,19.
   */
  controlSurface: "#2A374A",
  controlBorder: "#4E5C73",

  /** ⚠️ Tingimentos — a família da cor no fundo, ⛔ e o acento por cima. */
  primaryTint: "#0F1D30",
  successTint: "#0D2419",
  warningTint: "#2A2110",
  criticalTint: "#2A1419",

  disabled: "#5C6878",
};


// ── Tipografia ───────────────────────────────────────────────────────────────

/**
 * Família de fonte.
 *
 * O plano pede Inter. A fonte ainda NÃO é carregada: carregar exige mexer em
 * `app/_layout.tsx`, e gatilhar o render na conclusão do carregamento
 * reintroduziria exatamente o bug L-001 (HTML do build diferente do primeiro
 * render do cliente). Entra na Fase 2, junto com os componentes que a usam, com
 * o carregamento sem bloquear render.
 *
 * Até lá, `undefined` = fonte de sistema (San Francisco no iOS, Roboto no
 * Android), que é o padrão da plataforma e legível.
 */
export const FONTE = {
  familia: undefined as string | undefined,
  /** Nome a usar quando a Inter for carregada na Fase 2. */
  familiaPlanejada: "Inter",
} as const;

/**
 * Escala tipográfica, em dp (ver nota 2 no topo).
 * Os nomes espelham os do plano.
 */
export const TIPOGRAFIA = {
  /** Título de módulo — 2.25rem */
  display: { fontSize: 36, lineHeight: 42, fontWeight: "800" } satisfies TextStyle,
  /** Subtítulo — 1.75rem */
  title: { fontSize: 28, lineHeight: 34, fontWeight: "800" } satisfies TextStyle,
  /** Etapa atual — 1.5rem */
  step: { fontSize: 24, lineHeight: 30, fontWeight: "700" } satisfies TextStyle,
  /** Texto padrão — 1.125rem */
  body: { fontSize: 18, lineHeight: 26, fontWeight: "400" } satisfies TextStyle,
  /** Legendas — 0.9375rem */
  caption: { fontSize: 15, lineHeight: 20, fontWeight: "500" } satisfies TextStyle,
  /** Info secundária — 0.8125rem */
  micro: { fontSize: 13, lineHeight: 18, fontWeight: "600" } satisfies TextStyle,
} as const;

/**
 * Dígitos de largura fixa — obrigatório em cronômetro e em qualquer número que
 * muda sozinho. Sem isto os dígitos "pulam" a cada segundo e a leitura durante a
 * parada fica pior.
 */
export const NUMERO_TABULAR = {
  fontVariant: ["tabular-nums"],
} satisfies TextStyle;

// ── Espaçamento ──────────────────────────────────────────────────────────────

/** Grade fixa do plano: 4 / 8 / 16 / 24 / 32. Nada fora disto. */
export const ESPACO = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// ── Forma ────────────────────────────────────────────────────────────────────

/** Um raio por tipo de elemento — sem variação livre. */
export const RAIO = {
  botao: 12,
  card: 16,
  input: 12,
  badge: 9999,
} as const;

/**
 * Sombra única e discreta (0 1px 3px rgba(0,0,0,0.08)), usada com parcimônia.
 * O respiro da interface vem de espaçamento, não de sombra.
 */
export const SOMBRA = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  // Android não usa shadow*; usa elevation.
  elevation: 2,
} satisfies ViewStyle;

// ── Largura de leitura ───────────────────────────────────────────────────────

/**
 * ⚠️⚠️ O TETO DA COLUNA DE LEITURA — nasceu de um defeito visto em produção
 * (2026-09-06).
 *
 * ⛔ O módulo foi construído ⛔ e validado inteiro em **375×812**, ⛔ e ⛔ nunca
 * olhado no desktop. ⚠️ Sem teto, numa janela de ~2000 px a linha estica de
 * ponta a ponta: o rótulo fica na extrema esquerda ⛔ e a ação na extrema
 * direita, com um vazio no meio — ⛔ e o olho perde o par.
 *
 * ⚠️ 720 px é largo o bastante para as fileiras de opção (Sim/Não/Incerto) ⛔ e
 * estreito o bastante para o par **rótulo → ação** continuar legível como par.
 *
 * ⛔ Em 375 px ⛔ ele ⛔ não faz efeito ⛔ nenhum — o layout aprovado ⛔ não muda.
 */
export const LARGURA = {
  leitura: 720,
} as const;

// ── Alvo de toque ────────────────────────────────────────────────────────────

/**
 * O app é usado com luva, mão trêmula e pressa. Estes mínimos não são sugestão.
 */
export const TOQUE = {
  /** Mínimo em qualquer elemento interativo. */
  minimo: 44,
  /** Botões críticos: choque, adrenalina, iniciar/pausar. */
  critico: 56,
} as const;

// ── Temas ────────────────────────────────────────────────────────────────────

export type Tema = {
  nome: "claro" | "escuro";
  cores: Cores;
};

export const TEMAS: Record<"claro" | "escuro", Tema> = {
  claro: { nome: "claro", cores: CORES_CLARO },
  escuro: { nome: "escuro", cores: CORES_ESCURO },
};
