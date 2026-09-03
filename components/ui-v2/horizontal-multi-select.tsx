import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type HorizontalMultiSelectOption = {
  value: string;
  label: string;
  selected: boolean;
};

export type HorizontalMultiSelectProps = {
  options: readonly HorizontalMultiSelectOption[];
  onToggle: (value: string) => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  testID?: string;
};

/**
 * Multisseleção canônica da UI clínica.
 *
 * Mantém semântica de CHECKBOX — não finge que uma seleção múltipla é rádio.
 * A apresentação, porém, segue o mesmo contrato global dos seletores clínicos:
 * uma faixa horizontal, rolagem visível, superfície clicável inequívoca e
 * estado selecionado explícito.
 */
export function HorizontalMultiSelect({
  options,
  onToggle,
  accessibilityLabel = "Selecionar uma ou mais opções",
  disabled = false,
  testID,
}: HorizontalMultiSelectProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View accessibilityLabel={accessibilityLabel} testID={testID} style={e.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        persistentScrollbar
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={e.content}
        style={e.scroll}
      >
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="checkbox"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: option.selected, disabled }}
            accessibilityHint={option.selected ? "Remover esta opção" : "Adicionar esta opção"}
            disabled={disabled}
            onPress={() => onToggle(option.value)}
            style={({ pressed }) => [
              e.option,
              option.selected && e.optionSelected,
              pressed && !disabled && e.pressed,
              disabled && e.disabled,
            ]}
          >
            <View style={[e.indicator, option.selected && e.indicatorSelected]}>
              {option.selected ? <Text style={e.check}>✓</Text> : null}
            </View>
            <Text style={[e.label, option.selected && e.labelSelected]} numberOfLines={2}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    wrapper: { width: "100%" },
    scroll: { width: "100%", paddingBottom: ESPACO.xs },
    content: {
      flexDirection: "row",
      gap: ESPACO.sm,
      paddingBottom: ESPACO.sm,
      paddingRight: ESPACO.md,
    },
    option: {
      minHeight: TOQUE.critico,
      minWidth: 132,
      maxWidth: 280,
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    optionSelected: {
      borderWidth: 2,
      borderColor: t.cores.primary,
      backgroundColor: t.cores.surface,
    },
    indicator: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: t.cores.border,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    indicatorSelected: {
      backgroundColor: t.cores.primary,
      borderColor: t.cores.primary,
    },
    check: {
      ...TIPOGRAFIA.micro,
      color: t.cores.onPrimary,
      fontWeight: "900",
    },
    label: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "700",
      flexShrink: 1,
    },
    labelSelected: {
      color: t.cores.primary,
      fontWeight: "900",
    },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
    disabled: { opacity: 0.45 },
  });
