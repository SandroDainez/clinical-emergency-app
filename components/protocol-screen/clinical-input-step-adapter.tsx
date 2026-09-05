import type { InputField } from "../../core/decision-tree/types";
import type { FrontendTreeStep } from "../../core/decision-tree/types";
import { faixaDeEntradaDe } from "../../lib/faixas-de-entrada";
import { useTr } from "../../lib/use-tr";
import CalculadoraEmbutida from "./calculadora-embutida";
import { ClinicalInputStepCard } from "./clinical-input-step-card";
import type { ClinicalInputRange } from "./clinical-input-field";

export type ClinicalInputStepAdapterProps = {
  step: Extract<FrontendTreeStep, { kind: "input" }>;
  onSetValue: (fieldId: string, value: string) => void;
  onAdvance: () => void;
  inheritedFieldIds?: ReadonlySet<string>;
};

/**
 * Adaptador único entre o FrontendTreeStep e a apresentação extraída do InputStep.
 *
 * Não altera conteúdo nem decisão clínica. Mantém neste ponto apenas as duas
 * responsabilidades que já pertenciam ao InputStep antigo:
 *  1) resolver a faixa de entrada do campo numérico;
 *  2) montar a calculadora declarada pelo próprio InputField.
 *
 * `canContinue`, valores e IDs continuam vindo diretamente do engine/step.
 */
export function ClinicalInputStepAdapter({
  step,
  onSetValue,
  onAdvance,
  inheritedFieldIds,
}: ClinicalInputStepAdapterProps) {
  const tr = useTr();

  return (
    <ClinicalInputStepCard
      title={step.title}
      intro={step.intro}
      fields={step.fields}
      values={step.values}
      inheritedFieldIds={inheritedFieldIds}
      canContinue={step.canContinue}
      onAdvance={onAdvance}
      onSetValue={onSetValue}
      rangeForField={faixaNumerica}
      renderCalculator={(field, value) =>
        field.calculadora ? (
          <CalculadoraEmbutida
            calculadoraId={field.calculadora}
            valorAtual={value}
            onTotal={(total) => onSetValue(field.id, String(total))}
          />
        ) : null
      }
      tr={tr}
      testID="passo-de-entrada"
    />
  );
}

/**
 * Campo clínico numérico só ganha barra quando sua faixa de ENTRADA foi
 * declarada na fonte canônica. Presets são exemplos/atalhos históricos e não
 * podem virar limites por inferência: isso fabricaria um contrato numérico que
 * o domínio nunca declarou. Sem faixa explícita, ClinicalInputField falha
 * fechado e mostra erro de configuração em vez de oferecer digitação livre.
 */
function faixaNumerica(field: InputField): ClinicalInputRange | undefined {
  if (field.customKeyboard !== "numeric") return undefined;

  const declarada = faixaDeEntradaDe(field.id);
  if (!declarada) return undefined;

  return {
    min: declarada.min,
    max: declarada.max,
    passo: declarada.passo,
  };
}

export { faixaNumerica as faixaNumericaDoInputStep };
