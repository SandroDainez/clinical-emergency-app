import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type CategoricalSelectorTone = "default" | "primary" | "warning" | "success" | "critical";

export type CategoricalSelectorOption = {
  value: string;
  label: string;
  /**
   * Tom apenas de apresentação. Não altera ordem, valor, seleção nem semântica
   * clínica da opção; serve para preservar estados já diferenciados pela tela.
   */
  tone?: CategoricalSelectorTone;
};

export type CategoricalSelectorProps = {
  label?: string;
  value?: string;
  options: readonly CategoricalSelectorOption[];
  onChange: (value: string) => void;
  /** Texto opcional abaixo do grupo. Não altera seleção nem validade. */
  helperText?: string;
  disabled?: boolean;
  testID?: string;
};

/**
 * Seletor categórico de escolha única para o cockpit clínico.
 *
 * Serve para domínios fechados (Sim/Não, sexo, janela temporal, categorias
 * clínicas). Não interpreta os valores, não ordena por gravidade e não cria
 * opção "não sei" automaticamente: todas as opções continuam sendo definidas
 * pela fonte clínica chamadora.
 */
export function CategoricalSelector({
  label,
  value,
  options,
  onChange,
  helperText,
  disabled = false,
  testID,
}: CategoricalSelectorProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={e.wrapper} testID={testID}>
      {label ? <Text style={e.label}>{label}</Text> : null}

      <View
        style={e.options}
        accessibilityRole="radiogroup"
        accessibilityLabel={label ?? "Selecionar uma opção"}
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
      </View>

      {helperText ? <Text style={e.helper}>{helperText}</Text> : null}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    wrapper: { gap: ESPACO.sm },
    label: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "800",
    },
    options: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: ESPACO.sm,
    },
    option: {
      minHeight: TOQUE.critico,
      minWidth: 104,
      flexGrow: 1,
      flexBasis: "45%",
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
      flex: 1,
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "700",
    },
    optionLabelSelected: {
      color: t.cores.primary,
      fontWeight: "900",
    },
    textPrimary: { color: t.cores.primary },
    textWarning: { color: t.cores.warning },
    textSuccess: { color: t.cores.success },
    textCritical: { color: t.cores.critical },
    helper: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
    disabled: { opacity: 0.45 },
  });
