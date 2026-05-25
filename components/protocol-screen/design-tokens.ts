import type { TextStyle, ViewStyle } from "react-native";

/** Tokens de apresentação — tema escuro premium. */
const palette = {
  background: "#0a0f1a",
  surface: "#0f172a",
  surfaceAlt: "rgba(14,116,144,0.15)",
  border: "#334155",
  borderStrong: "#1e293b",
  primary: "#0e7490",
  primaryDark: "#0e7490",
  primaryLight: "#22d3ee",
  heroGradientStart: "#0f766e",
  heroGradientEnd: "#115e59",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  critical: "#f87171",
  success: "#0e7490",
  muted: "#64748b",
};

const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
};

const typography = {
  headline: { fontSize: 28, fontWeight: "800", lineHeight: 36 } satisfies TextStyle,
  heroTitle: { fontSize: 30, fontWeight: "800", lineHeight: 38 } satisfies TextStyle,
  heroTag: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  } satisfies TextStyle,
  title: { fontSize: 18, fontWeight: "700" } satisfies TextStyle,
  body: { fontSize: 16, fontWeight: "500" } satisfies TextStyle,
  small: { fontSize: 12, fontWeight: "600" } satisfies TextStyle,
};

const elevation = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  } satisfies ViewStyle,
  footer: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  } satisfies ViewStyle,
};

export { palette, spacing, typography, elevation };
