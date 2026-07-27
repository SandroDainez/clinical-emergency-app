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
  /** Linha de apoio abaixo do título. */
  descricao?: string;
  /** Faixa colorida à esquerda — usar para gravidade, não para decoração. */
  tom?: "neutro" | "primary" | "critical" | "success" | "warning";
  /** Card inteiro tocável. Ganha retorno de toque e papel de botão. */
  onPress?: () => void;
  /** Sombra só quando o card precisa se destacar do fundo. Padrão: sem. */
  elevado?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Superfície padrão da UI 2.0. */
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
        padding: ESPACO.md,
        gap: ESPACO.sm,
      },
      comFaixa: { borderLeftWidth: 4 },
      pressionado: { opacity: 0.9, transform: [{ scale: 0.995 }] },
      titulo: { ...TIPOGRAFIA.caption, color: cores.text, fontWeight: "700" },
      descricao: { ...TIPOGRAFIA.micro, color: cores.textSecondary, fontWeight: "400" },
    }),
    faixa: StyleSheet.create({
      primary: { borderLeftColor: cores.primary },
      critical: { borderLeftColor: cores.critical },
      success: { borderLeftColor: cores.success },
      warning: { borderLeftColor: cores.warning },
    }),
  };
};
