import { ESPACO, RAIO, SOMBRA, TEMAS, TIPOGRAFIA } from "../../design-system/tokens";

/**
 * Contrato visual das calculadoras clínicas.
 *
 * Calculadora pode ter estrutura própria, mas não identidade paralela.
 * Estes tokens derivam exclusivamente do design system da UI v2 para manter
 * tipografia, superfícies, bordas e espaçamento iguais ao cockpit clínico.
 */
const cores = TEMAS.escuro.cores;

export const CALCULATOR_VISUAL = {
  cores: {
    bg: cores.bg,
    surface: cores.surface,
    border: cores.border,
    text: cores.text,
    textSecondary: cores.textSecondary,
    primary: cores.primary,
    onPrimary: cores.onPrimary,
    critical: cores.critical,
    onCritical: cores.onCritical,
    warning: cores.warning,
    success: cores.success,
  },
  tipo: {
    title: TIPOGRAFIA.title,
    section: TIPOGRAFIA.step,
    body: TIPOGRAFIA.body,
    label: TIPOGRAFIA.caption,
    micro: TIPOGRAFIA.micro,
  },
  espaco: ESPACO,
  raio: RAIO,
  sombra: SOMBRA,
} as const;
