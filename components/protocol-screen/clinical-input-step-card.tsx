import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { InputField, TreeValues } from "../../core/decision-tree/types";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ClinicalInputFields } from "./clinical-input-fields";
import type { ClinicalInputRange } from "./clinical-input-field";

export type ClinicalInputStepCardProps = {
  title: string;
  intro?: string;
  fields: readonly InputField[];
  values: TreeValues;
  inheritedFieldIds?: ReadonlySet<string>;
  canContinue: boolean;
  onAdvance: () => void;
  onSetValue: (fieldId: string, value: string) => void;
  rangeForField: (field: InputField) => ClinicalInputRange | undefined;
  renderCalculator?: (field: InputField, value: string | undefined) => ReactNode;
  tr?: (text: string) => string;
  testID?: string;
};

/**
 * Apresentação completa de um nó de entrada.
 *
 * A continuidade continua sendo decidida pelo engine e chega pronta em
 * `canContinue`. Este componente apenas explica visualmente o que falta, renderiza
 * os campos e dispara `onAdvance` quando o chamador autoriza.
 */
export function ClinicalInputStepCard({
  title,
  intro,
  fields,
  values,
  inheritedFieldIds,
  canContinue,
  onAdvance,
  onSetValue,
  rangeForField,
  renderCalculator,
  tr = (text) => text,
  testID = "passo-de-entrada",
}: ClinicalInputStepCardProps) {
  const e = useEstilosDoTema(criarEstilos);
  const missing = fields.filter((field) => !field.optional && values[field.id] === undefined);

  const blockedLabel =
    missing.length === 1
      ? `${tr("Falta informar")}: ${tr(missing[0].label)}`
      : missing.length > 1
        ? `${tr("Faltam informar")} ${missing.length} ${tr("campos obrigatórios")}`
        : tr("Revise os campos antes de continuar");

  return (
    <View style={e.stack}>
      <View style={e.card} testID={testID}>
        <Text style={e.eyebrow}>{tr("INFORMAR DADOS")}</Text>
        <Text style={e.title}>{tr(title)}</Text>
        {intro ? <Text style={e.intro}>{tr(intro)}</Text> : null}

        <ClinicalInputFields
          fields={fields}
          values={values}
          inheritedFieldIds={inheritedFieldIds}
          rangeForField={rangeForField}
          onSetValue={onSetValue}
          renderCalculator={renderCalculator}
          tr={tr}
          testIDPrefix="campo-clinico"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canContinue }}
        accessibilityLabel={
          canContinue ? tr("Confirmar e continuar") : blockedLabel
        }
        disabled={!canContinue}
        onPress={onAdvance}
        style={({ pressed }) => [
          e.advance,
          !canContinue && e.advanceDisabled,
          pressed && canContinue && e.pressed,
        ]}
      >
        <Text style={[e.advanceText, !canContinue && e.advanceTextDisabled]}>
          {canContinue ? tr("Confirmar — continuar ›") : blockedLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    stack: { gap: ESPACO.md },
    card: {
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.surface,
      padding: ESPACO.md,
      gap: ESPACO.md,
    },
    eyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.primary,
      fontWeight: "900",
      letterSpacing: 0.6,
    },
    title: {
      ...TIPOGRAFIA.step,
      color: t.cores.text,
      fontWeight: "900",
    },
    intro: {
      ...TIPOGRAFIA.caption,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
    advance: {
      minHeight: TOQUE.critico,
      borderRadius: RAIO.botao,
      backgroundColor: t.cores.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    advanceDisabled: {
      backgroundColor: t.cores.surface,
      borderWidth: 1,
      borderColor: t.cores.border,
    },
    advanceText: {
      ...TIPOGRAFIA.caption,
      color: t.cores.onPrimary,
      fontWeight: "900",
      textAlign: "center",
    },
    advanceTextDisabled: {
      color: t.cores.textSecondary,
      fontWeight: "700",
    },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
