import { StyleSheet } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import type { Tema } from "../../design-system/theme";

/**
 * Subconjunto de estilos da UI v2 já usado pelo shell nos passos clínicos.
 * Extraído sem alterar os valores visuais para permitir composição fora do
 * arquivo principal.
 */
export const criarEstilosV2 = (t: Tema) => {
  const c = t.cores;

  return StyleSheet.create({
    stepStack: { gap: 14 },
    cartao: { gap: ESPACO.sm },
    titulo: { ...TIPOGRAFIA.step, color: c.text },
    texto: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "400" },
    resumo: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
    lista: { gap: ESPACO.xs, marginTop: ESPACO.xs },
    linha: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.sm },
    marcador: {
      width: 6,
      height: 6,
      borderRadius: RAIO.badge,
      backgroundColor: c.primary,
    },
    itemTexto: {
      flex: 1,
      ...TIPOGRAFIA.micro,
      color: c.textSecondary,
      fontWeight: "400",
    },
    alternarCriterios: {
      ...TIPOGRAFIA.caption,
      color: c.primary,
      fontWeight: "700",
    },
  });
};
