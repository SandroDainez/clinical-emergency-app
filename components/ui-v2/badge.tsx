import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type TomSemantico = "neutro" | "primary" | "critical" | "success" | "warning";

export type BadgeProps = {
  label: string;
  tom?: TomSemantico;
  /** Versão preenchida — usar só quando o estado precisa saltar aos olhos. */
  solido?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Rótulo curto de estado (GRAVE, 2 doses, ROSC).
 *
 * Nunca é tocável: se o usuário precisa agir, é `Chip` ou `Button`.
 */
export function Badge({ label, tom = "neutro", solido = false, style, testID }: BadgeProps) {
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View
      style={[e.base, solido ? e.solido[tom] : e.suave[tom], style]}
      testID={testID}
    >
      <Text style={[e.texto, solido ? e.textoSolido[tom] : e.textoSuave[tom]]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const criarEstilos = (t: Tema) => {
  const c = t.cores;
  /** Fundo suave: a própria cor com opacidade, para não competir com o texto. */
  const suave = (cor: string) => ({ backgroundColor: `${cor}22`, borderColor: `${cor}55` });

  return {
    ...StyleSheet.create({
      base: {
        alignSelf: "flex-start",
        paddingHorizontal: ESPACO.sm,
        paddingVertical: ESPACO.xs,
        borderRadius: RAIO.badge,
        borderWidth: 1,
      },
      texto: { ...TIPOGRAFIA.micro, letterSpacing: 0.3 },
    }),
    suave: StyleSheet.create({
      neutro: { backgroundColor: c.surface, borderColor: c.border },
      primary: suave(c.primary),
      critical: suave(c.critical),
      success: suave(c.success),
      warning: suave(c.warning),
    }),
    solido: StyleSheet.create({
      neutro: { backgroundColor: c.border, borderColor: c.border },
      primary: { backgroundColor: c.primary, borderColor: c.primary },
      critical: { backgroundColor: c.critical, borderColor: c.critical },
      success: { backgroundColor: c.success, borderColor: c.success },
      warning: { backgroundColor: c.warning, borderColor: c.warning },
    }),
    textoSuave: StyleSheet.create({
      neutro: { color: c.textSecondary },
      primary: { color: c.primary },
      critical: { color: c.critical },
      success: { color: c.success },
      warning: { color: c.warning },
    }),
    // No sólido o texto vai sobre a cor cheia: no tema escuro essas cores são
    // claras, então o texto precisa ser escuro (mesma razão do onPrimary).
    textoSolido: StyleSheet.create({
      neutro: { color: c.text },
      primary: { color: c.onPrimary },
      critical: { color: c.onCritical },
      success: { color: c.onPrimary },
      warning: { color: c.onPrimary },
    }),
  };
};
