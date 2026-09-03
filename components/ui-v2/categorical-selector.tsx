import { StyleSheet, Text, View } from "react-native";

import { ESPACO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import {
  HorizontalChoiceSelector,
  type HorizontalChoiceTone,
} from "./horizontal-choice-selector";

export type CategoricalSelectorTone = HorizontalChoiceTone;

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
 * Todas as escolhas categóricas compartilham a mesma assinatura visual global:
 * faixa horizontal rolável, barra de rolagem visível e estado de seleção claro.
 * Não interpreta valores nem cria opções clínicas automaticamente.
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
    <View style={e.wrapper}>
      {label ? <Text style={e.label}>{label}</Text> : null}

      <HorizontalChoiceSelector
        value={value}
        options={options}
        onChange={onChange}
        disabled={disabled}
        accessibilityLabel={label ?? "Selecionar uma opção"}
        testID={testID}
      />

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
    helper: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
  });
