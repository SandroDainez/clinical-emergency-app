import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type HorizontalChoiceTone = "default" | "primary" | "warning" | "success" | "critical";

export type HorizontalChoiceOption = {
  value: string;
  label: string;
  tone?: HorizontalChoiceTone;
};

export type HorizontalChoiceSelectorProps = {
  value?: string;
  options: readonly HorizontalChoiceOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * Seletor canônico de escolha única da UI clínica.
 *
 * Regra global:
 * - opções ficam em UMA faixa horizontal;
 * - a faixa rola horizontalmente quando não couber;
 * - o indicador de rolagem permanece visível;
 * - toda opção tem superfície explícita de ação + rádio + estado selecionado.
 *
 * Não interpreta nem reordena valores clínicos. Apenas apresenta as opções
 * fornecidas pelo chamador e devolve o value escolhido.
 */
export function HorizontalChoiceSelector({
  value,
  options,
  onChange,
  disabled = false,
  accessibilityLabel = "Selecionar uma opção",
  testID,
}: HorizontalChoiceSelectorProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={e.wrapper}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        persistentScrollbar
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={e.content}
        style={e.scroll}
      >
        {options.map((option) => {
          const selected = option.value === value;
          const tone = option.tone ?? "default";
          const toneStyle =
            tone === "primary"
              ? e.tonePrimary
              : tone === "warning"
                ? e.toneWarning
                : tone === "success"
                  ? e.toneSuccess
                  : tone === "critical"
                    ? e.toneCritical
                    : undefined;
          const toneText =
            tone === "primary"
              ? e.textPrimary
              : tone === "warning"
                ? e.textWarning
                : tone === "success"
                  ? e.textSuccess
                  : tone === "critical"
                    ? e.textCritical
                    : undefined;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                e.option,
                toneStyle,
                selected && e.optionSelected,
                selected && toneStyle,
                pressed && !disabled && e.pressed,
                disabled && e.disabled,
              ]}
            >
              <View style={[e.indicator, selected && e.indicatorSelected]}>
                {selected ? <Text style={e.check}>✓</Text> : null}
              </View>
              <Text
                numberOfLines={2}
                style={[
                  e.optionLabel,
                  tone !== "default" && toneText,
                  selected && e.optionLabelSelected,
                  selected && tone !== "default" && toneText,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
    },
    scroll: {
      width: "100%",
      paddingBottom: ESPACO.xs,
    },
    content: {
      flexDirection: "row",
      gap: ESPACO.sm,
      paddingBottom: ESPACO.sm,
      paddingRight: ESPACO.md,
    },
    option: {
      minHeight: TOQUE.critico,
      minWidth: 132,
      maxWidth: 260,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
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
    tonePrimary: { borderColor: t.cores.primary },
    toneWarning: { borderColor: t.cores.warning },
    toneSuccess: { borderColor: t.cores.success },
    toneCritical: { borderColor: t.cores.critical },
    indicator: {
      width: 22,
      height: 22,
      borderRadius: 11,
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
    optionLabel: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "700",
      flexShrink: 1,
    },
    optionLabelSelected: {
      color: t.cores.primary,
      fontWeight: "900",
    },
    textPrimary: { color: t.cores.primary },
    textWarning: { color: t.cores.warning },
    textSuccess: { color: t.cores.success },
    textCritical: { color: t.cores.critical },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
    disabled: { opacity: 0.45 },
  });
