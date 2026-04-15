/**
 * Tokens globais do produto.
 * Direção visual: shell escuro sofisticado, superfícies quentes e acentos vivos.
 */
export const AppDesign = {
  canvas: {
    background: "#081f3f",
    tealBackdrop: "#0d3768",
  },
  surface: {
    card: "#f8f5ef",
    hero: "#f7f2e8",
    shellMint: "#dce7f6",
  },
  border: {
    subtle: "#bccde4",
    mint: "#4b87d9",
  },
  accent: {
    primary: "#2f7df6",
    primaryMuted: "#d8e7ff",
    lime: "#7db7ff",
    limeDark: "#103a75",
    limeSoft: "#dceaff",
    teal: "#1a4f9c",
  },
  text: {
    primary: "#102128",
    secondary: "#496067",
    onDark: "#f5f7f4",
    muted: "#698087",
  },
  radius: {
    xl: 24,
    xxl: 34,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: "#03181a",
      shadowOpacity: 0.16,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 14 },
      elevation: 8,
    },
    hero: {
      shadowColor: "#021113",
      shadowOpacity: 0.22,
      shadowRadius: 36,
      shadowOffset: { width: 0, height: 18 },
      elevation: 12,
    },
  },
  tabBar: {
    background: "#f6f2e8",
    border: "#c7d5cf",
    inactive: "#7b8f96",
  },
} as const;
