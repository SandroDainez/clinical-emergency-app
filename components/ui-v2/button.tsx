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

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /**
   * Botão de ação crítica (choque, adrenalina, iniciar/pausar): sobe a altura
   * mínima de 44 para 56. O app é usado com luva e pressa.
   */
  critico?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Ocupa a largura disponível. */
  bloco?: boolean;
  /** Elemento à esquerda do rótulo (ícone). */
  antes?: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Botão da UI 2.0.
 *
 * Sem nenhuma dependência de hover: o alvo é o toque. O retorno visual vem de
 * `pressed` (o app roda em aparelho, e no plantão o dedo cobre o botão), e
 * `loading` mantém a altura para a tela não pular.
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
            numberOfLines={1}
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
        paddingVertical: ESPACO.sm,
        borderRadius: RAIO.botao,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "transparent",
      },
      critico: { minHeight: TOQUE.critico, paddingHorizontal: ESPACO.lg },
      bloco: { alignSelf: "stretch" },
      primary: { backgroundColor: cores.primary },
      secondary: { backgroundColor: cores.surface, borderColor: cores.border },
      danger: { backgroundColor: cores.critical },
      ghost: { backgroundColor: "transparent" },
      // Sem hover: o retorno é no toque. 0.97 é perceptível sem parecer lento.
      pressionado: { opacity: 0.88, transform: [{ scale: 0.97 }] },
      inativo: { opacity: 0.45 },
      conteudo: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
      antes: { justifyContent: "center" },
      rotulo: { ...TIPOGRAFIA.caption, textAlign: "center" },
      rotuloCritico: { ...TIPOGRAFIA.body, fontWeight: "800" },
    }),
    /** Cor do texto por variante — separada porque também alimenta o spinner. */
    corDoTexto: {
      primary: { color: cores.onPrimary },
      secondary: { color: cores.text },
      danger: { color: cores.onCritical },
      ghost: { color: cores.primary },
    } as const,
  };
};
