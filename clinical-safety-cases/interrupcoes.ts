import {
  beginClinicalInterruption,
  clearClinicalInterruptions,
  completeClinicalInterruption,
  listClinicalInterruptions,
} from "../lib/clinical-interruption-session";
import type { ClinicalTransitionContract } from "../lib/clinical-transitions";

const AVC_PARA_ISR: ClinicalTransitionContract = {
  id: "avc-para-isr",
  from: "avc",
  to: "isr-rapida",
  trigger: "deterioracao-respiratoria",
  mode: "returnable",
  returnLabel: "Retornar ao AVC",
  preserves: ["peso", "idade"],
};

const ISR_PARA_PCR: ClinicalTransitionContract = {
  id: "isr-para-pcr",
  from: "isr-rapida",
  to: "pcr-adulto",
  trigger: "perda-de-pulso",
  mode: "returnable",
  returnLabel: "Retornar à ISR",
  preserves: ["peso"],
};

export type NestedInterruptionRegressionResult = {
  afterTwoInterruptions: string[];
  firstReturn?: string;
  secondReturn?: string;
  remaining: number;
};

/**
 * Cenário estrutural de regressão:
 * AVC -> ISR -> PCR -> ISR -> AVC.
 *
 * Não afirma quando uma transição deve ocorrer; testa somente a propriedade de
 * pilha: a interrupção mais recente retorna primeiro e nenhum nível é pulado.
 */
export function runNestedInterruptionRegression(): NestedInterruptionRegressionResult {
  clearClinicalInterruptions();
  beginClinicalInterruption(AVC_PARA_ISR, 1_000);
  beginClinicalInterruption(ISR_PARA_PCR, 2_000);

  const afterTwoInterruptions = listClinicalInterruptions().map((frame) => frame.toModule);
  const fromPcr = completeClinicalInterruption("pcr-adulto");
  const fromIsr = completeClinicalInterruption("isr-rapida");

  return {
    afterTwoInterruptions,
    firstReturn: fromPcr?.returnModule,
    secondReturn: fromIsr?.returnModule,
    remaining: listClinicalInterruptions().length,
  };
}
