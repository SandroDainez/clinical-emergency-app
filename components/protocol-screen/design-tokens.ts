import type { TextStyle, ViewStyle } from "react-native";

import { AppDesign } from "../../constants/app-design";

/** Tokens alinhados ao design system (green-site + Condor) — só apresentação. */
const palette = {
  background: AppDesign.canvas.tealBackdrop,
  surface: AppDesign.surface.card,
  surfaceAlt: AppDesign.surface.shellMint,
  border: AppDesign.border.subtle,
  borderStrong: AppDesign.border.mint,
  primary: AppDesign.accent.primary,
  primaryDark: AppDesign.accent.teal,
  primaryLight: "#62d9c1",
  heroGradientStart: "#0a3b3d",
  heroGradientEnd: "#114e4b",
  text: AppDesign.text.primary,
  textSecondary: AppDesign.text.secondary,
  critical: "#dc2626",
  success: "#14926f",
  muted: AppDesign.text.muted,
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
