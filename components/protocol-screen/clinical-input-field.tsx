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
 * Regra de UX para campo numérico: a barra deve existir desde o primeiro
 * contato. O valor visual inicial é apenas um ponto de partida do controle e
 * NÃO é gravado no atendimento até o médico terminar a interação (soltar a
 * barra ou tocar −/+). Assim evitamos a sequência ruim "digitar → confirmar →
 * só então aparecer a barra" sem inventar um dado clínico silenciosamente.
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
  const [numericText, setNumericText] = useState("");
  const [numericDraft, setNumericDraft] = useState<number | undefined>(undefined);

  const preset = field.presets.find((item) => item.value === value);
  const isPreset = Boolean(preset);
  const showingCustom = customOpen || (value !== undefined && !isPreset && !numericRange);
  const numericValue = value !== undefined ? Number(value.replace(",", ".")) : undefined;
  const hasNumericValue = numericValue !== undefined && Number.isFinite(numericValue);

  const currentLabel = preset?.label ?? value;

  const numeroInicialDaBarra = () => {
    if (!numericRange) return 0;
    const bruto = numericRange.min + (numericRange.max - numericRange.min) / 2;
    const passos = Math.round((bruto - numericRange.min) / numericRange.passo);
    const alinhado = numericRange.min + passos * numericRange.passo;
    const casas = Number.isInteger(numericRange.passo)
      ? 0
      : (String(numericRange.passo).split(".")[1]?.length ?? 0);
    return Number(Math.min(numericRange.max, Math.max(numericRange.min, alinhado)).toFixed(casas));
  };

  const confirmarNumeroDigitado = () => {
    if (!numericRange) return;
    const texto = numericText.trim();
    if (!texto) return;

    const numero = Number(texto.replace(",", "."));
    if (!Number.isFinite(numero)) return;
    if (numero < numericRange.min || numero > numericRange.max) return;

    onChange(String(numero));
    setNumericDraft(numero);
    setNumericText("");
  };

  const confirmarNumeroDaBarra = (numero: number) => {
    setNumericDraft(numero);
    onChange(String(numero));
  };

  const valorDaBarra = hasNumericValue
    ? numericValue
    : numericDraft ?? numeroInicialDaBarra();

  return (
    <View style={e.wrapper} testID={testID}>
      <View style={e.header}>
        <Text style={e.label}>
          {tr(field.label)}
          {field.unit ? <Text style={e.unit}> ({field.unit})</Text> : null}
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
          {!hasNumericValue ? (
            <View style={e.numericPending} testID={testID ? `${testID}-numeric-pending` : undefined}>
              <Text style={e.numericPendingTitle}>{tr("Valor ainda não informado")}</Text>
              <Text style={e.numericPendingText}>
                {tr("A barra já está pronta para uso. Arraste ou use −/+; o valor só será registrado quando você concluir a interação.")}
              </Text>
            </View>
          ) : null}

          <NumericStepper
            valor={valorDaBarra}
            onChange={(next) => setNumericDraft(next)}
            onConfirmar={confirmarNumeroDaBarra}
            min={numericRange.min}
            max={numericRange.max}
            passo={numericRange.passo}
            unidade={field.unit}
            rotulo={tr(field.label)}
            testID={testID ? `${testID}-numeric` : undefined}
          />

          <View style={e.directInputBlock}>
            <Text style={e.directInputLabel}>{tr("Ou digite o valor exato")}</Text>
            <View style={e.customRow}>
              <TextInput
                value={numericText}
                onChangeText={setNumericText}
                placeholder={tr("Digitar valor")}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={confirmarNumeroDigitado}
                style={e.customInput}
                testID={testID ? `${testID}-numeric-input` : undefined}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr("Confirmar valor")}
                onPress={confirmarNumeroDigitado}
                style={({ pressed }) => [e.customConfirm, pressed && e.pressed]}
                testID={testID ? `${testID}-numeric-confirm` : undefined}
              >
                <Text style={e.customConfirmText}>OK</Text>
              </Pressable>
            </View>
            <Text style={e.numericRangeHint}>
              {tr("Faixa de entrada")}: {numericRange.min}–{numericRange.max}{field.unit ? ` ${field.unit}` : ""}
            </Text>
          </View>
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
      gap: ESPACO.sm,
    },
    numericPending: {
      borderLeftWidth: 3,
      borderLeftColor: t.cores.primary,
      paddingLeft: ESPACO.sm,
      gap: 2,
    },
    numericPendingTitle: {
      ...TIPOGRAFIA.caption,
      color: t.cores.textSecondary,
      fontWeight: "800",
    },
    numericPendingText: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
    directInputBlock: {
      gap: ESPACO.xs,
      paddingTop: ESPACO.xs,
    },
    directInputLabel: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "700",
    },
    numericRangeHint: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
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