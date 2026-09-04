import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { InputField } from "../../core/decision-tree/types";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { CategoricalSelector } from "../ui-v2/categorical-selector";
import { NumericStepper } from "../ui-v2/numeric-stepper";

export type ClinicalInputRange = {
  min: number;
  max: number;
  passo: number;
};

export type ClinicalInputFieldProps = {
  field: InputField;
  value?: string;
  inherited?: boolean;
  numericRange?: ClinicalInputRange;
  onChange: (value: string) => void;
  renderCalculator?: ReactNode;
  tr?: (text: string) => string;
  testID?: string;
};

/**
 * Apresentação isolada de UM campo clínico do nó de entrada.
 *
 * Regra de UX para campo numérico: a barra aparece imediatamente, mas nenhum
 * número clínico é mostrado antes da primeira interação. O polegar fica na
 * origem visual da trilha; isso não representa valor do paciente e não é
 * gravado até o médico concluir a interação.
 */
export function ClinicalInputField({
  field,
  value,
  inherited = false,
  numericRange,
  onChange,
  renderCalculator,
  tr = (text) => text,
  testID,
}: ClinicalInputFieldProps) {
  const e = useEstilosDoTema(criarEstilos);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const [numericDraft, setNumericDraft] = useState<number | undefined>(undefined);

  const preset = field.presets.find((item) => item.value === value);
  const isPreset = Boolean(preset);
  const showingCustom = customOpen || (value !== undefined && !isPreset && !numericRange);
  const numericValue = value !== undefined ? Number(value.replace(",", ".")) : undefined;
  const hasNumericValue = numericValue !== undefined && Number.isFinite(numericValue);

  const currentLabel = preset?.label ?? value;
  const translatedLabel = tr(field.label);
  const unitAlreadyInLabel = field.unit
    ? translatedLabel.toLowerCase().includes(`(${field.unit.toLowerCase()})`)
    : false;

  const numeroInicialDaBarra = () => {
    if (!numericRange) return 0;
    return numericRange.min;
  };

  const confirmarNumeroDaBarra = (numero: number) => {
    setNumericDraft(numero);
    onChange(String(numero));
  };

  const valorDaBarra = hasNumericValue
    ? numericValue
    : numericDraft ?? numeroInicialDaBarra();
  const valorVisivel = hasNumericValue || numericDraft !== undefined;

  return (
    <View style={e.wrapper} testID={testID}>
      <View style={e.header}>
        <Text style={e.label}>
          {translatedLabel}
          {field.unit && !unitAlreadyInLabel ? <Text style={e.unit}> ({field.unit})</Text> : null}
        </Text>
        {value !== undefined ? (
          <Text style={e.currentValue} numberOfLines={1}>
            {currentLabel}{field.unit ? ` ${field.unit}` : ""}
          </Text>
        ) : null}
      </View>

      {inherited ? (
        <View style={e.inherited} accessibilityRole="summary">
          <Text style={e.inheritedEyebrow}>{tr("DADO HERDADO")}</Text>
          <Text style={e.inheritedText}>
            {tr("Aproveitado do que você já informou neste atendimento — confira e ajuste se mudou.")}
          </Text>
        </View>
      ) : null}

      {renderCalculator}

      {numericRange ? (
        <View style={e.numericBlock}>
          {!hasNumericValue && numericDraft === undefined ? (
            <Text style={e.numericPendingTitle} testID={testID ? `${testID}-numeric-pending` : undefined}>
              {tr("Valor ainda não informado — toque na barra para definir")}
            </Text>
          ) : null}

          <NumericStepper
            valor={valorDaBarra}
            valorVisivel={valorVisivel}
            onChange={(next) => setNumericDraft(next)}
            onConfirmar={confirmarNumeroDaBarra}
            min={numericRange.min}
            max={numericRange.max}
            passo={numericRange.passo}
            unidade={field.unit}
            testID={testID ? `${testID}-numeric` : undefined}
          />
        </View>
      ) : (
        <>
          <CategoricalSelector
            value={isPreset ? value : undefined}
            options={field.presets.map((item) => ({
              value: item.value,
              label: tr(item.label),
            }))}
            onChange={(next) => {
              onChange(next);
              setCustomOpen(false);
            }}
            testID={testID ? `${testID}-categorical` : undefined}
          />

          {field.allowCustom ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: showingCustom }}
                onPress={() => setCustomOpen((open) => !open)}
                style={({ pressed }) => [
                  e.otherButton,
                  showingCustom && e.otherButtonActive,
                  pressed && e.pressed,
                ]}
              >
                <Text style={[e.otherText, showingCustom && e.otherTextActive]}>{tr("Outro…")}</Text>
              </Pressable>

              {showingCustom ? (
                <View style={e.customRow}>
                  <TextInput
                    value={customText || (isPreset ? "" : value ?? "")}
                    onChangeText={setCustomText}
                    placeholder={field.customLabel ? tr(field.customLabel) : tr("Digitar valor")}
                    keyboardType={field.customKeyboard === "numeric" ? "numeric" : "default"}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      const next = customText.trim();
                      if (next) onChange(next);
                    }}
                    style={e.customInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={tr("Confirmar valor")}
                    onPress={() => {
                      const next = customText.trim();
                      if (next) onChange(next);
                    }}
                    style={({ pressed }) => [e.customConfirm, pressed && e.pressed]}
                  >
                    <Text style={e.customConfirmText}>OK</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    wrapper: {
      gap: ESPACO.sm,
      borderTopWidth: 1,
      borderTopColor: t.cores.border,
      paddingTop: ESPACO.md,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    },
    label: {
      flex: 1,
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "800",
    },
    unit: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "600",
    },
    currentValue: {
      maxWidth: "42%",
      ...TIPOGRAFIA.caption,
      color: t.cores.primary,
      fontWeight: "900",
      textAlign: "right",
    },
    inherited: {
      borderLeftWidth: 3,
      borderLeftColor: t.cores.primary,
      paddingLeft: ESPACO.sm,
      gap: 2,
    },
    inheritedEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.primary,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    inheritedText: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
    numericBlock: {
      gap: ESPACO.xs,
    },
    numericPendingTitle: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "700",
    },
    otherButton: {
      minHeight: TOQUE.minimo,
      alignSelf: "flex-start",
      justifyContent: "center",
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: t.cores.border,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.md,
      backgroundColor: t.cores.bg,
    },
    otherButtonActive: {
      borderStyle: "solid",
      borderColor: t.cores.primary,
      backgroundColor: t.cores.surface,
    },
    otherText: {
      ...TIPOGRAFIA.caption,
      color: t.cores.textSecondary,
      fontWeight: "700",
    },
    otherTextActive: {
      color: t.cores.primary,
      fontWeight: "900",
    },
    customRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
    },
    customInput: {
      flex: 1,
      minHeight: TOQUE.minimo,
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.surface,
      color: t.cores.text,
      paddingHorizontal: ESPACO.md,
      ...TIPOGRAFIA.caption,
    },
    customConfirm: {
      minWidth: TOQUE.critico,
      minHeight: TOQUE.critico,
      borderRadius: RAIO.botao,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.cores.primary,
      paddingHorizontal: ESPACO.md,
    },
    customConfirmText: {
      ...TIPOGRAFIA.caption,
      color: t.cores.onPrimary,
      fontWeight: "900",
    },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });