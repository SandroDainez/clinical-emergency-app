import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, RAIO, SOMBRA, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type FloatingButtonProps = {
  label: string;
  onPress: () => void;
  /** Ícone ou símbolo à esquerda. */
  antes?: React.ReactNode;
  critico?: boolean;
  disabled?: boolean;
  /** Canto onde flutua. Padrão: direita. */
  lado?: "direita" | "esquerda" | "centro";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Ação sempre à mão, sobreposta ao conteúdo.
 *
 * Reservado para a ação mais provável da tela (ativar voz, registrar conduta).
 * Só um por tela: dois botões flutuantes competindo é escolha errada na pressa.
 */
export function FloatingButton({
  label,
  onPress,
  antes,
  critico = false,
  disabled = false,
  lado = "direita",
  style,
  testID,
}: FloatingButtonProps) {
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        e.base,
        e.lado[lado],
        critico ? e.critico : e.normal,
        SOMBRA,
        pressed && !disabled && e.pressionado,
        disabled && e.inativo,
        style,
      ]}
    >
      {antes}
      <Text style={[e.texto, critico ? e.textoCritico : e.textoNormal]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const criarEstilos = (t: Tema) => ({
  ...StyleSheet.create({
    base: {
      position: "absolute",
      bottom: ESPACO.lg,
      minHeight: TOQUE.critico,
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      paddingHorizontal: ESPACO.lg,
      borderRadius: RAIO.badge,
    },
    normal: { backgroundColor: t.cores.primary },
    critico: { backgroundColor: t.cores.critical },
    pressionado: { opacity: 0.9, transform: [{ scale: 0.97 }] },
    inativo: { opacity: 0.45 },
    texto: { ...TIPOGRAFIA.caption, fontWeight: "800" },
    textoNormal: { color: t.cores.onPrimary },
    textoCritico: { color: t.cores.onCritical },
  }),
  lado: StyleSheet.create({
    direita: { right: ESPACO.md },
    esquerda: { left: ESPACO.md },
    centro: { alignSelf: "center" },
  }),
});
