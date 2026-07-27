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
  /** Fundo da tela. */
  bg: string;
  /** Cards e superfícies elevadas. */
  surface: string;
  /** Bordas sutis. */
  border: string;
  /** Texto principal. */
  text: string;
  /** Texto secundário, legendas. */
  textSecondary: string;
};

const CORES_CLARO: Cores = {
  primary: "#1E6FD9",
  onPrimary: "#FFFFFF",
  critical: "#DC2626",
  onCritical: "#FFFFFF",
  success: "#16A34A",
  warning: "#D97706",
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  textSecondary: "#64748B",
};

const CORES_ESCURO: Cores = {
  primary: "#4D9AFF",
  // No tema escuro o primary é claro: texto branco em cima dele daria ~2.3:1.
  // O texto do botão precisa ser escuro para passar em AA.
  onPrimary: "#0B1220",
  critical: "#F87171",
  onCritical: "#0B1220",
  success: "#4ADE80",
  warning: "#FBBF24",
  // Clareados em relação ao valor original do plano (#121417 / #1C1F24 /
  // #2A2E35), que na tela cheia ficava quase preto e sem separação entre card e
  // fundo. Revalidado: todo o texto segue passando em AA sobre estes fundos, e a
  // borda ficou mais visível (1,35:1 → 1,62:1).
  bg: "#1A1D23",
  surface: "#262A32",
  border: "#3A404A",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
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
