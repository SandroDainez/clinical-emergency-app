import type { TextStyle, ViewStyle } from "react-native";

import { TEMAS } from "../../design-system/tokens";

/**
 * Paleta das telas antigas — agora derivada dos tokens da UI 2.0.
 *
 * Este arquivo continua existindo porque 11 telas o consomem, mas deixou de ter
 * cor própria: os valores vêm de `design-system/tokens.ts`, que é a fonte única.
 * Assim as telas ainda não migradas já adotam a identidade nova, e não há duas
 * paletas concorrentes no app durante as Fases 3 a 7.
 *
 * Nota sobre `primary`: aqui ele é o AZUL DE PREENCHIMENTO (#1E6FD9), não o
 * `primary` do tema escuro (#4D9AFF). As telas antigas usam esta cor como fundo
 * de botão com texto claro por cima — e texto branco sobre #4D9AFF dá 2,84:1,
 * reprova em AA. Para texto e borda sobre fundo escuro existe `primaryLight`.
 */
const escuro = TEMAS.escuro.cores;

const palette = {
  background: escuro.bg,
  surface: escuro.surface,
  surfaceAlt: "rgba(77,154,255,0.15)",
  border: escuro.border,
  borderStrong: escuro.border,
  primary: TEMAS.claro.cores.primary,
  primaryDark: TEMAS.claro.cores.primary,
  primaryLight: escuro.primary,
  heroGradientStart: TEMAS.claro.cores.primary,
  heroGradientEnd: TEMAS.claro.cores.primary,
  text: escuro.text,
  textSecondary: escuro.textSecondary,
  critical: escuro.critical,
  success: escuro.success,
  // Era #64748b: 3,47:1 sobre a superfície, abaixo de AA. Passa a ser o mesmo
  // textSecondary da paleta (6,44:1).
  muted: escuro.textSecondary,
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
