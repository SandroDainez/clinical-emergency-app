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
  textSecondary: "#5A6678",
  info: "#0E7490",
  disabled: "#A3AEBF",
};

const CORES_ESCURO: Cores = {
  // Clareados junto com o fundo: no degrau anterior, #4D9AFF dava 4,27:1 e
  // #F87171 dava 4,39:1 como texto pequeno sobre a superfície — abaixo de 4,5.
  // Quem pegou foi e2e/contraste-renderizado.spec.ts; o validador de tokens
  // exigia só 3:1 para eles e passava batido.
  primary: "#7FB3FF",
  // O primary do tema escuro é claro: texto branco em cima daria ~2:1, então o
  // texto do botão é escuro.
  onPrimary: "#0B1220",
  critical: "#FCA5A5",
  onCritical: "#0B1220",
  success: "#4ADE80",
  warning: "#FBBF24",
  debt: "#C4B5FD",
  // Três degraus mais claros que o valor original do plano (#121417 / #1C1F24 /
  // #2A2E35), que na tela cheia ficava quase preto e sem separação entre card e
  // fundo.
  //
  // Regra que este arquivo aprendeu na prática: clarear o fundo obriga a clarear
  // JUNTO o texto secundário e os acentos. Eles são usados como texto pequeno, e
  // o piso é 4,5:1 — não os 3:1 de elemento gráfico. Mexer só no fundo derruba a
  // legibilidade sem aviso.
  bg: "#292E38",
  surface: "#383E4A",
  /**
   * ⚠️ O segundo degrau no escuro. ⛔ Clarear mais aproximaria de `border` ⛔ e a
   * separação sumiria; ⛔ escurecer o faria voltar para o `bg`.
   */
  surfaceElevated: "#3F4654",
  border: "#565E6C",
  text: "#F1F5F9",
  // Clareado junto com o fundo: #94A3B8 dava 4,19:1 na superfície nova.
  textSecondary: "#AAB6C6",
  /** ⚠️ Ciano, ⛔ e ⛔ não o azul de `primary`: informar ⛔ não é convidar a tocar. */
  info: "#67E8F9",
  disabled: "#7A8496",
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
