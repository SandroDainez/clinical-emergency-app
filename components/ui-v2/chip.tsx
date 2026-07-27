import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type ChipProps = {
  label: string;
  selecionado?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Opção selecionável — sintomas, achados, condutas.
 *
 * É o controle mais usado nos módulos de fluxo, onde o médico marca vários
 * itens. Por isso respeita o alvo de 44 px mesmo com rótulo curto: errar o chip
 * ao lado durante o atendimento troca dado clínico.
 */
export function Chip({
  label,
  selecionado = false,
  onPress,
  disabled = false,
  style,
  testID,
}: ChipProps) {
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selecionado, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        e.base,
        selecionado && e.selecionado,
        pressed && !disabled && e.pressionado,
        disabled && e.inativo,
        style,
      ]}
    >
      <Text style={[e.texto, selecionado && e.textoSelecionado]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    base: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.badge,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.surface,
    },
    selecionado: { backgroundColor: t.cores.primary, borderColor: t.cores.primary },
    pressionado: { opacity: 0.85, transform: [{ scale: 0.97 }] },
    inativo: { opacity: 0.4 },
    texto: { ...TIPOGRAFIA.caption, color: t.cores.text },
    textoSelecionado: { color: t.cores.onPrimary, fontWeight: "700" },
  });
