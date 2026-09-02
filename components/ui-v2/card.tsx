import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ESPACO, RAIO, SOMBRA, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type CardProps = {
  children?: React.ReactNode;
  titulo?: string;
  descricao?: string;
  tom?: "neutro" | "primary" | "critical" | "success" | "warning";
  onPress?: () => void;
  elevado?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Superfície clínica padrão.
 *
 * A hierarquia vem de espaço, borda e uma faixa semântica estreita. Vermelho,
 * verde e âmbar não são decoração: só aparecem quando carregam significado.
 */
export function Card({
  children,
  titulo,
  descricao,
  tom = "neutro",
  onPress,
  elevado = false,
  style,
  testID,
}: CardProps) {
  const e = useEstilosDoTema(criarEstilos);

  const corpo = (
    <>
      {titulo ? <Text style={e.titulo}>{titulo}</Text> : null}
      {descricao ? <Text style={e.descricao}>{descricao}</Text> : null}
      {children}
    </>
  );

  const base: StyleProp<ViewStyle> = [
    e.base,
    tom !== "neutro" && e.comFaixa,
    tom !== "neutro" && e.faixa[tom],
    elevado && SOMBRA,
    style,
  ];

  if (!onPress) {
    return (
      <View style={base} testID={testID}>
        {corpo}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [base, pressed && e.pressionado]}
    >
      {corpo}
    </Pressable>
  );
}

const criarEstilos = (t: Tema) => {
  const cores = t.cores;
  return {
    ...StyleSheet.create({
      base: {
        backgroundColor: cores.surface,
        borderRadius: RAIO.card,
        borderWidth: 1,
        borderColor: cores.border,
        paddingHorizontal: ESPACO.md,
        paddingVertical: ESPACO.md,
        gap: ESPACO.sm,
        overflow: "hidden",
      },
      comFaixa: {
        borderLeftWidth: 5,
        paddingLeft: ESPACO.md,
      },
      pressionado: {
        opacity: 0.94,
        transform: [{ scale: 0.992 }],
      },
      titulo: {
        ...TIPOGRAFIA.caption,
        color: cores.text,
        fontWeight: "800",
        letterSpacing: 0.1,
      },
      descricao: {
        ...TIPOGRAFIA.micro,
        color: cores.textSecondary,
        fontWeight: "500",
      },
    }),
    faixa: StyleSheet.create({
      primary: { borderLeftColor: cores.primary },
      critical: { borderLeftColor: cores.critical },
      success: { borderLeftColor: cores.success },
      warning: { borderLeftColor: cores.warning },
    }),
  };
};
