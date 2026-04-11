/**
 * Design tokens — combinação dos referenciais "green-site" (teal/cyan, cartão claro, sombras suaves)
 * e "condor" (acento lima, cantos amplos, tipografia limpa). Usar em layouts sem mudar comportamento.
 */
export const AppDesign = {
  canvas: {
    /** Fundo geral — teal bem claro (atmosfera green-site) */
    background: "#f0fdfa",
    /** Fundo “full bleed” igual à landing (cartão teal escuro) */
    tealBackdrop: "#0f766e",
  },
  surface: {
    /** Cartões principais */
    card: "#ffffff",
    /** Hero claro sobre canvas */
    hero: "#ffffff",
    /** Painel mint entre teal e cartões brancos (continuidade landing ↔ app) */
    shellMint: "#ecfdf5",
  },
  border: {
    subtle: "#e2e8f0",
    mint: "#a7f3d0",
  },
  accent: {
    /** CTA / links — cyan (green-site) */
    primary: "#0891b2",
    primaryMuted: "#cffafe",
    /** Destaque Condor — lima */
    lime: "#ccf32f",
    limeDark: "#4d7c0f",
    limeSoft: "#ecfccb",
    teal: "#0f766e",
  },
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    onDark: "#f8fafc",
    muted: "#94a3b8",
  },
  radius: {
    xl: 20,
    xxl: 28,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: "#0f172a",
      shadowOpacity: 0.07,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 5,
    },
    hero: {
      shadowColor: "#0f766e",
      shadowOpacity: 0.12,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 14 },
      elevation: 8,
    },
  },
  /** Barra inferior (tabs) */
  tabBar: {
    background: "#ffffff",
    border: "#e2e8f0",
    inactive: "#94a3b8",
  },
} as const;
