import type { TextStyle, ViewStyle } from "react-native";

/**
 * Design tokens da UI 2.0 — Clinical Emergency Suite.
 *
 * Fonte única de cor, tipografia, espaçamento e forma. Componente nenhum deve
 * escrever hex, tamanho de fonte ou espaçamento na mão: se um valor não está
 * aqui, ele não existe.
 *
 * Direção visual 2026: "clinical cockpit".
 * - fundo discretamente azulado para reduzir brilho e separar superfícies;
 * - superfícies claras e limpas para leitura rápida;
 * - azul profundo como identidade e ação principal;
 * - vermelho reservado para perigo real;
 * - verde e âmbar apenas como semântica clínica;
 * - tema escuro em azul-grafite, evitando preto absoluto.
 */

export type Cores = {
  primary: string;
  onPrimary: string;
  critical: string;
  onCritical: string;
  success: string;
  warning: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
};

const CORES_CLARO: Cores = {
  primary: "#165DAD",
  onPrimary: "#FFFFFF",
  critical: "#B42318",
  onCritical: "#FFFFFF",
  success: "#137A45",
  warning: "#9A5B13",
  bg: "#F3F6FA",
  surface: "#FFFFFF",
  border: "#D8E0EA",
  text: "#10233F",
  textSecondary: "#53657A",
};

const CORES_ESCURO: Cores = {
  primary: "#86B7F4",
  onPrimary: "#0A1A2E",
  critical: "#FFB4AB",
  onCritical: "#3A0905",
  success: "#72D69A",
  warning: "#F6C46A",
  bg: "#101722",
  surface: "#192331",
  border: "#334155",
  text: "#F3F7FB",
  textSecondary: "#B3C0CF",
};

export const FONTE = {
  familia: undefined as string | undefined,
  familiaPlanejada: "Inter",
} as const;

export const TIPOGRAFIA = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: "800", letterSpacing: -0.5 } satisfies TextStyle,
  title: { fontSize: 27, lineHeight: 33, fontWeight: "800", letterSpacing: -0.3 } satisfies TextStyle,
  step: { fontSize: 23, lineHeight: 29, fontWeight: "700" } satisfies TextStyle,
  body: { fontSize: 18, lineHeight: 26, fontWeight: "400" } satisfies TextStyle,
  caption: { fontSize: 15, lineHeight: 20, fontWeight: "600" } satisfies TextStyle,
  micro: { fontSize: 13, lineHeight: 18, fontWeight: "600" } satisfies TextStyle,
} as const;

export const NUMERO_TABULAR = {
  fontVariant: ["tabular-nums"],
} satisfies TextStyle;

export const ESPACO = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const RAIO = {
  botao: 14,
  card: 18,
  input: 14,
  badge: 9999,
} as const;

export const SOMBRA = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 2,
} satisfies ViewStyle;

export const TOQUE = {
  minimo: 44,
  critico: 58,
} as const;

export type Tema = {
  nome: "claro" | "escuro";
  cores: Cores;
};

export const TEMAS: Record<"claro" | "escuro", Tema> = {
  claro: { nome: "claro", cores: CORES_CLARO },
  escuro: { nome: "escuro", cores: CORES_ESCURO },
};
