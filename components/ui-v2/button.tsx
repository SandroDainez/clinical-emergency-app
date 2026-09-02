import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ESPACO, RAIO, SOMBRA, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  critico?: boolean;
  disabled?: boolean;
  loading?: boolean;
  bloco?: boolean;
  antes?: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Botão de ação clínica.
 *
 * Ação primária tem presença suficiente para ser encontrada em um relance;
 * perigo usa vermelho apenas quando a ação é de fato crítica; secundários ficam
 * visuais sem competir com a conduta principal.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  critico = false,
  disabled = false,
  loading = false,
  bloco = false,
  antes,
  accessibilityLabel,
  style,
  testID,
}: ButtonProps) {
  const e = useEstilosDoTema(criarEstilos);
  const inativo = disabled || loading;

  const estiloPressionavel = useCallback(
    ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => [
      e.base,
      e[variant],
      (variant === "primary" || variant === "danger") && e.elevado,
      critico && e.critico,
      bloco && e.bloco,
      pressed && !inativo && e.pressionado,
      inativo && e.inativo,
      style,
    ],
    [e, variant, critico, bloco, inativo, style]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inativo, busy: loading }}
      disabled={inativo}
      onPress={onPress}
      style={estiloPressionavel}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={e.corDoTexto[variant].color} />
      ) : (
        <View style={e.conteudo}>
          {antes ? <View style={e.antes}>{antes}</View> : null}
          <Text
            style={[e.rotulo, e.corDoTexto[variant], critico && e.rotuloCritico]}
            numberOfLines={2}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const criarEstilos = (t: Tema) => {
  const cores = t.cores;
  return {
    ...StyleSheet.create({
      base: {
        minHeight: TOQUE.minimo,
        minWidth: TOQUE.minimo,
        paddingHorizontal: ESPACO.md,
        paddingVertical: 10,
        borderRadius: RAIO.botao,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "transparent",
      },
      elevado: SOMBRA,
      critico: {
        minHeight: TOQUE.critico,
        paddingHorizontal: ESPACO.lg,
        paddingVertical: 12,
      },
      bloco: { alignSelf: "stretch" },
      primary: { backgroundColor: cores.primary, borderColor: cores.primary },
      secondary: { backgroundColor: cores.surface, borderColor: cores.border },
      danger: { backgroundColor: cores.critical, borderColor: cores.critical },
      ghost: { backgroundColor: "transparent" },
      pressionado: { opacity: 0.9, transform: [{ scale: 0.985 }] },
      inativo: { opacity: 0.42 },
      conteudo: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: ESPACO.sm },
      antes: { justifyContent: "center" },
      rotulo: { ...TIPOGRAFIA.caption, textAlign: "center", fontWeight: "700" },
      rotuloCritico: { ...TIPOGRAFIA.body, fontWeight: "800" },
    }),
    corDoTexto: {
      primary: { color: cores.onPrimary },
      secondary: { color: cores.text },
      danger: { color: cores.onCritical },
      ghost: { color: cores.primary },
    } as const,
  };
};
