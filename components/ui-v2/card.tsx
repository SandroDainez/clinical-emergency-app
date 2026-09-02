import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ESPACO, RAIO, SOMBRA, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type CardProps = {
  children?: React.ReactNode;
  titulo?: string;
  descricao?: string;
  tom?: "neutro" | "primary" | "critical" | "success" | "warning";
  onPress?: () => void;
  /**
   * Rótulo específico da ação quando o card é clicável.
   * Se omitido, usa uma chamada neutra que apenas deixa a affordance explícita.
   */
  acaoLabel?: string;
  elevado?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Superfície clínica padrão.
 *
 * Card informativo e card clicável NÃO compartilham a mesma assinatura visual.
 * Quando há `onPress`, o componente recebe borda mais presente e um rodapé de
 * ação explícito. Assim o médico identifica o alvo antes de tocar, sem depender
 * de hover, tentativa ou conhecimento prévio da tela.
 */
export function Card({
  children,
  titulo,
  descricao,
  tom = "neutro",
  onPress,
  acaoLabel = "TOQUE AQUI",
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
    onPress && e.clicavel,
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
      accessibilityHint={acaoLabel}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [base, pressed && e.pressionado]}
    >
      {corpo}
      <View style={e.acao}>
        <Text style={e.acaoTexto}>{acaoLabel}</Text>
        <Text style={e.acaoSeta}>›</Text>
      </View>
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
        borderLeftWidth: 6,
        paddingLeft: ESPACO.md,
      },
      clicavel: {
        minHeight: TOQUE.critico,
        borderWidth: 1.5,
        borderColor: cores.primary,
      },
      pressionado: {
        opacity: 0.88,
        transform: [{ scale: 0.988 }],
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
      acao: {
        alignSelf: "flex-start",
        minHeight: 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: ESPACO.xs,
        borderRadius: RAIO.pill,
        backgroundColor: cores.primary,
        paddingHorizontal: ESPACO.sm,
        paddingVertical: 4,
      },
      acaoTexto: {
        fontSize: 9,
        lineHeight: 11,
        color: cores.onPrimary,
        fontWeight: "900",
        letterSpacing: 0.5,
      },
      acaoSeta: {
        ...TIPOGRAFIA.body,
        color: cores.onPrimary,
        fontWeight: "900",
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
