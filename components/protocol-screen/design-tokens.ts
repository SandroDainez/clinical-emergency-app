import type { TextStyle, ViewStyle } from "react-native";

import { AppDesign } from "../../constants/app-design";

/** Tokens alinhados ao design system (green-site + Condor) — só apresentação. */
const palette = {
  background: AppDesign.canvas.tealBackdrop,
  surface: AppDesign.surface.card,
  surfaceAlt: AppDesign.accent.primaryMuted,
  border: AppDesign.border.subtle,
  borderStrong: AppDesign.border.mint,
  primary: AppDesign.accent.primary,
  primaryDark: AppDesign.accent.teal,
  primaryLight: "#22d3ee",
  heroGradientStart: "#0f766e",
  heroGradientEnd: "#115e59",
  text: AppDesign.text.primary,
  textSecondary: AppDesign.text.secondary,
  critical: "#dc2626",
  success: AppDesign.accent.primary,
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
    shadowColor: palette.text,
    shadowOpacity: 0.05,
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
