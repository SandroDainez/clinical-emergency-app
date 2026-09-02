import type { ReactNode } from "react";
import { View } from "react-native";

import type { InputField, TreeValues } from "../../core/decision-tree/types";
import { ESPACO } from "../../design-system/tokens";
import { ClinicalInputField, type ClinicalInputRange } from "./clinical-input-field";

export type ClinicalInputFieldsProps = {
  fields: readonly InputField[];
  values: TreeValues;
  inheritedFieldIds?: ReadonlySet<string>;
  rangeForField: (field: InputField) => ClinicalInputRange | undefined;
  onSetValue: (fieldId: string, value: string) => void;
  renderCalculator?: (field: InputField, value: string | undefined) => ReactNode;
  tr?: (text: string) => string;
  testIDPrefix?: string;
};

/**
 * Camada de composição dos campos de um InputStep.
 *
 * Não calcula faixa, não decide obrigatoriedade, não valida continuidade e não
 * conhece roteamento. Recebe todas essas decisões prontas do chamador e apenas
 * conecta cada InputField ao componente de apresentação isolado.
 */
export function ClinicalInputFields({
  fields,
  values,
  inheritedFieldIds,
  rangeForField,
  onSetValue,
  renderCalculator,
  tr,
  testIDPrefix = "campo-clinico",
}: ClinicalInputFieldsProps) {
  return (
    <View style={{ gap: ESPACO.sm }}>
      {fields.map((field) => {
        const value = values[field.id];
        return (
          <ClinicalInputField
            key={field.id}
            field={field}
            value={value}
            inherited={inheritedFieldIds?.has(field.id) ?? false}
            numericRange={rangeForField(field)}
            onChange={(next) => onSetValue(field.id, next)}
            renderCalculator={renderCalculator?.(field, value)}
            tr={tr}
            testID={`${testIDPrefix}-${field.id}`}
          />
        );
      })}
    </View>
  );
}
