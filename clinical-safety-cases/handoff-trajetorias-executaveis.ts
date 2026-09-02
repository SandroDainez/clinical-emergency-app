import { bradycardiaDecisionTree } from "../acls-bradycardia-tree";
import { tachycardiaDecisionTree } from "../acls-tachycardia-tree";
import { appendClinicalEvent, clearClinicalEventLog } from "../lib/clinical-event-log";
import { prepareAndPublishClinicalHandoff } from "../lib/clinical-handoff-orchestrator";
import { clearClinicalHandoffs, consumeClinicalHandoff } from "../lib/clinical-handoff-runtime";
import { clearClinicalObservations, recordClinicalObservation } from "../lib/clinical-observations";
import { assertClinicalTrajectory, runClinicalTrajectory, type ClinicalRunnerInstruction } from "../lib/clinical-safety-runner";
import { PCR_TERMINAL_HANDOFF_CONTEXTS } from "../lib/pcr-terminal-handoff-context";

export type ExecutableTreeToHandoffCase = {
  id: string;
  run: () => string[];
};

function reset(): void {
  clearClinicalEventLog();
  clearClinicalObservations();
  clearClinicalHandoffs();
}

function pcrContract(source: "tachycardia" | "bradycardia") {
  const contract = PCR_TERMINAL_HANDOFF_CONTEXTS.find((item) => item.source === source)?.handoffContract;
  if (!contract) throw new Error(`Contrato PCR ausente para ${source}`);
  return contract;
}

const tachyToPulseless: readonly ClinicalRunnerInstruction[] = [
  { type: "advance" }, // entry -> assess_stability
  { type: "choose", optionId: "instavel" }, // -> unstable_cardioversion
  { type: "advance" }, // -> unstable_reavaliar
  { type: "choose", optionId: "sem_pulso" }, // -> unstable_sem_pulso
];

const bradyToPulseless: readonly ClinicalRunnerInstruction[] = [
  { type: "advance" }, // entry -> assess_stability
  { type: "choose", optionId: "instavel" }, // -> atropine
  { type: "advance" }, // -> after_atropine
  { type: "choose", optionId: "sem_pulso" }, // -> bradi_sem_pulso
];

export const EXECUTABLE_TREE_TO_HANDOFF_CASES: readonly ExecutableTreeToHandoffCase[] = [
  {
    id: "tachy-tree-cardioversion-pulseless-pcr-handoff",
    run: () => {
      reset();
      const issues: string[] = [];
      const trajectory = runClinicalTrajectory(tachycardiaDecisionTree, tachyToPulseless);
      issues.push(...assertClinicalTrajectory(trajectory, {
        mustVisit: ["assess_stability", "unstable_cardioversion", "unstable_reavaliar", "unstable_sem_pulso"],
        finalNodeId: "unstable_sem_pulso",
      }));
      if (issues.length) return issues;

      const contract = pcrContract("tachycardia");
      const now = 1_800_001_000_000;
      recordClinicalObservation({ id: "ritmo_pre_parada", value: "TV monomórfica", recordedAt: now - 40_000, source: "manual", originModule: contract.fromModule });
      appendClinicalEvent({ id: "tachy-cv", type: "action_completed", occurredAt: now - 30_000, module: contract.fromModule, label: "Cardioversão sincronizada", data: { energia_ultima_cardioversao: "100 J", numero_cardioversoes: 1 } });
      appendClinicalEvent({ id: "tachy-aa", type: "medication_given", occurredAt: now - 20_000, module: contract.fromModule, label: "Antiarrítmico", data: { antiarritmico_em_curso: "amiodarona" } });
      appendClinicalEvent({ id: "tachy-pulse", type: "decision_made", occurredAt: now - 5_000, module: contract.fromModule, label: "Perdeu o pulso", data: { tempo_perda_pulso: now - 5_000, suspeita_causa_reversivel: "isquemia" } });

      const prepared = prepareAndPublishClinicalHandoff(contract, now);
      if (prepared.status !== "complete") return [...issues, `handoff esperado complete; recebido ${prepared.status}`];
      const consumed = consumeClinicalHandoff("pcr-adulto", contract.transitionId);
      if (!consumed) return [...issues, "PCR não consumiu handoff da trajetória de taquicardia"];
      if (!consumed.facts.some((fact) => fact.id === "energia_ultima_cardioversao" && fact.value === "100 J")) {
        issues.push("energia da cardioversão não atravessou para PCR");
      }
      if (consumeClinicalHandoff("pcr-adulto", contract.transitionId)) issues.push("handoff de taquicardia foi consumido duas vezes");
      return issues;
    },
  },
  {
    id: "brady-tree-atropine-pulseless-pcr-handoff",
    run: () => {
      reset();
      const issues: string[] = [];
      const trajectory = runClinicalTrajectory(bradycardiaDecisionTree, bradyToPulseless);
      issues.push(...assertClinicalTrajectory(trajectory, {
        mustVisit: ["assess_stability", "atropine", "after_atropine", "bradi_sem_pulso"],
        finalNodeId: "bradi_sem_pulso",
      }));
      if (issues.length) return issues;

      const contract = pcrContract("bradycardia");
      const now = 1_800_001_100_000;
      recordClinicalObservation({ id: "ritmo_pre_parada", value: "BAV total", recordedAt: now - 40_000, source: "manual", originModule: contract.fromModule });
      appendClinicalEvent({ id: "brady-atrop", type: "medication_given", occurredAt: now - 30_000, module: contract.fromModule, label: "Atropina", data: { atropina_administrada: true } });
      appendClinicalEvent({ id: "brady-pace", type: "action_completed", occurredAt: now - 20_000, module: contract.fromModule, label: "Suporte de bradicardia", data: { marcapasso_em_uso: false, captura_marcapasso: false, cronotropico_em_curso: "nenhum" } });
      appendClinicalEvent({ id: "brady-pulse", type: "decision_made", occurredAt: now - 5_000, module: contract.fromModule, label: "Perdeu o pulso", data: { tempo_perda_pulso: now - 5_000, suspeita_causa_reversivel: "isquemia/hipóxia" } });

      const prepared = prepareAndPublishClinicalHandoff(contract, now);
      if (prepared.status !== "complete") return [...issues, `handoff esperado complete; recebido ${prepared.status}`];
      const consumed = consumeClinicalHandoff("pcr-adulto", contract.transitionId);
      if (!consumed) return [...issues, "PCR não consumiu handoff da trajetória de bradicardia"];
      if (!consumed.facts.some((fact) => fact.id === "atropina_administrada" && fact.value === true)) {
        issues.push("atropina pré-parada não atravessou para PCR");
      }
      if (consumeClinicalHandoff("pcr-adulto", contract.transitionId)) issues.push("handoff de bradicardia foi consumido duas vezes");
      return issues;
    },
  },
];

export function runExecutableTreeToHandoffCases(): string[] {
  const issues: string[] = [];
  for (const testCase of EXECUTABLE_TREE_TO_HANDOFF_CASES) {
    for (const issue of testCase.run()) issues.push(`${testCase.id}: ${issue}`);
  }
  return issues;
}
