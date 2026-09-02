import { anaphylaxisDecisionTree } from "../anaphylaxis-decision-tree";
import { avcDecisionTree } from "../avc-decision-tree";
import { rsiDecisionTree } from "../rsi-decision-tree";
import {
  assertClinicalTrajectory,
  runClinicalTrajectory,
  type ClinicalRunnerInstruction,
} from "../lib/clinical-safety-runner";

export type ExecutableClinicalSafetyCase = {
  id: string;
  title: string;
  run: () => string[];
};

const avcIsquemicoInicial: readonly ClinicalRunnerInstruction[] = [
  { type: "advance" }, // entry -> tempo
  { type: "set", field: "janela", value: "< 3 h" },
  { type: "advance" }, // tempo -> tc
  { type: "advance" }, // tc -> tc_resultado
  { type: "choose", optionId: "isquemico" },
];

const anafilaxiaGrau2: readonly ClinicalRunnerInstruction[] = [
  { type: "choose", optionId: "criteria_met" },
  { type: "choose", optionId: "grade2" },
];

const isrSemPreditorDificuldade: readonly ClinicalRunnerInstruction[] = [
  { type: "advance" }, // entry -> dados
  { type: "set", field: "peso", value: "70" },
  { type: "set", field: "pas", value: "110" },
  { type: "advance" }, // dados -> via_dificil
  { type: "choose", optionId: "nao" }, // via_dificil -> preoxigenacao
];

/**
 * Primeiros testes executáveis de trajetória do Emergências 2.0.
 *
 * Deliberadamente curtos: provam que o runner percorre as árvores REAIS e que
 * etapas estruturais indispensáveis não desaparecem durante refatorações.
 * Não substituem os testes clínicos específicos de dose/limiar de cada módulo.
 */
export const EXECUTABLE_CLINICAL_SAFETY_CASES: readonly ExecutableClinicalSafetyCase[] = [
  {
    id: "avc-isquemico-inicial",
    title: "AVC: reconhecimento deve passar por tempo e TC antes do ramo isquêmico",
    run: () => {
      const result = runClinicalTrajectory(avcDecisionTree, avcIsquemicoInicial);
      return assertClinicalTrajectory(result, {
        mustVisit: ["tempo", "tc", "tc_resultado", "isq_dados"],
        mustNotVisit: ["hic_inicial", "hsa_inicial"],
        finalNodeId: "isq_dados",
      });
    },
  },
  {
    id: "anafilaxia-grau2-adrenalina",
    title: "Anafilaxia sistêmica classificada como Grau II deve chegar à adrenalina IM",
    run: () => {
      const result = runClinicalTrajectory(anaphylaxisDecisionTree, anafilaxiaGrau2);
      return assertClinicalTrajectory(result, {
        mustVisit: ["severity_grade", "immediate_im_epinephrine"],
        mustNotVisit: ["grade1_treatment", "not_anaphylaxis_exit"],
        finalNodeId: "immediate_im_epinephrine",
      });
    },
  },
  {
    id: "isr-preoxigenacao",
    title: "ISR: avaliação de via aérea deve preceder pré-oxigenação quando sem preditores",
    run: () => {
      const result = runClinicalTrajectory(rsiDecisionTree, isrSemPreditorDificuldade);
      return assertClinicalTrajectory(result, {
        mustVisit: ["dados", "via_dificil", "preoxigenacao"],
        finalNodeId: "preoxigenacao",
      });
    },
  },
];

export function runExecutableClinicalSafetyCases(): string[] {
  const issues: string[] = [];
  for (const testCase of EXECUTABLE_CLINICAL_SAFETY_CASES) {
    for (const issue of testCase.run()) {
      issues.push(`${testCase.id}: ${issue}`);
    }
  }
  return issues;
}
