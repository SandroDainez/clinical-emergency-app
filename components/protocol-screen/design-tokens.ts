const palette = {
  background: "#f5f7fb",
  surface: "#ffffff",
  surfaceAlt: "#f3f6ff",
  border: "#e2e8f0",
  borderStrong: "#cbd5f5",
  primary: "#2563eb",
  primaryDark: "#1e3a8a",
  primaryLight: "#4f7eff",
  heroGradientStart: "#0a1f44",
  heroGradientEnd: "#123070",
  text: "#0b1f40",
  textSecondary: "#475569",
  critical: "#dc2626",
  success: "#0ea5e9",
  muted: "#94a3b8",
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
  headline: { fontSize: 28, fontWeight: "800", lineHeight: 36 },
  heroTitle: { fontSize: 30, fontWeight: "800", lineHeight: 38 },
  heroTag: { fontSize: 12, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { fontSize: 18, fontWeight: "700" },
  body: { fontSize: 16, fontWeight: "500" },
  small: { fontSize: 12, fontWeight: "600" },
};

const elevation = {
  card: { shadowColor: palette.text, shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  footer: { shadowColor: palette.primaryDark, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
};

export { palette, spacing, typography, elevation };
