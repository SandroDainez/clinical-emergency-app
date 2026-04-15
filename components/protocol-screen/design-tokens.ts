import type { TextStyle, ViewStyle } from "react-native";

import { AppDesign } from "../../constants/app-design";

/** Tokens alinhados ao design system azul premium — só apresentação. */
const palette = {
  background: AppDesign.canvas.tealBackdrop,
  surface: "#fbf8f2",
  surfaceAlt: "#e8f0ff",
  border: "#bfd0ea",
  borderStrong: "#7aa7f7",
  primary: AppDesign.accent.primary,
  primaryDark: AppDesign.accent.teal,
  primaryLight: "#6ea8ff",
  heroGradientStart: "#0d3768",
  heroGradientEnd: "#164b88",
  text: AppDesign.text.primary,
  textSecondary: "#4d6178",
  critical: "#dc2626",
  success: "#14926f",
  muted: "#71859a",
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
  headline: { fontSize: 30, fontWeight: "900", lineHeight: 38 } satisfies TextStyle,
  heroTitle: { fontSize: 34, fontWeight: "900", lineHeight: 42 } satisfies TextStyle,
  heroTag: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  } satisfies TextStyle,
  title: { fontSize: 18, fontWeight: "800" } satisfies TextStyle,
  body: { fontSize: 16, fontWeight: "600" } satisfies TextStyle,
  small: { fontSize: 12, fontWeight: "700" } satisfies TextStyle,
};

const elevation = {
  card: {
    shadowColor: palette.text,
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
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
