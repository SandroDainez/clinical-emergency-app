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
 * Mesma resolução usada pelo InputStep legado.
 *
 * Primeiro consulta a fonte canônica por grandeza. Se não houver uma faixa
 * declarada, mantém o fallback legado derivado dos presets numéricos. Esse
 * fallback é rede de segurança de apresentação; não cria limite clínico.
 */
function faixaNumerica(field: InputField): ClinicalInputRange | undefined {
  if (field.customKeyboard !== "numeric") return undefined;

  const declarada = faixaDeEntradaDe(field.id);
  if (declarada) {
    return {
      min: declarada.min,
      max: declarada.max,
      passo: declarada.passo,
    };
  }

  const numeros = field.presets
    .map((preset) => Number(preset.value.replace(",", ".")))
    .filter((numero) => Number.isFinite(numero));

  if (numeros.length < 2) return undefined;

  const min = Math.min(...numeros);
  const max = Math.max(...numeros);
  if (min === max) return undefined;

  const maisCasas = Math.max(
    ...field.presets.map((preset) => {
      const parteDecimal = preset.value.replace(",", ".").split(".")[1];
      return parteDecimal ? parteDecimal.length : 0;
    })
  );

  const passo =
    maisCasas === 0 ? 1 : Number((10 ** -maisCasas).toFixed(maisCasas));

  return { min, max, passo };
}

export { faixaNumerica as faixaNumericaDoInputStep };
