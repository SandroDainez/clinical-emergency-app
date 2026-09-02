import { appendClinicalEvent, clearClinicalEventLog } from "../lib/clinical-event-log";
import {
  clearClinicalHandoffs,
  consumeClinicalHandoff,
  listPendingClinicalHandoffs,
} from "../lib/clinical-handoff-runtime";
import { prepareAndPublishClinicalHandoff } from "../lib/clinical-handoff-orchestrator";
import { clearClinicalObservations, recordClinicalObservation } from "../lib/clinical-observations";
import { PCR_TERMINAL_HANDOFF_CONTEXTS } from "../lib/pcr-terminal-handoff-context";

export type ExecutableClinicalHandoffCase = {
  id: string;
  run: () => string[];
};

function resetHandoffState(): void {
  clearClinicalEventLog();
  clearClinicalObservations();
  clearClinicalHandoffs();
}

function getPcrContract(source: "tachycardia" | "bradycardia") {
  const contract = PCR_TERMINAL_HANDOFF_CONTEXTS.find((item) => item.source === source)?.handoffContract;
  if (!contract) throw new Error(`Contrato de PCR ausente para ${source}`);
  return contract;
}

export const EXECUTABLE_CLINICAL_HANDOFF_CASES: readonly ExecutableClinicalHandoffCase[] = [
  {
    id: "tachy-pulseless-handoff-complete-consume-once",
    run: () => {
      resetHandoffState();
      const contract = getPcrContract("tachycardia");
      const now = 1_800_000_000_000;

      recordClinicalObservation({ id: "ritmo_pre_parada", value: "TV monomórfica", recordedAt: now - 30_000, source: "manual", originModule: contract.fromModule });
      recordClinicalObservation({ id: "energia_ultima_cardioversao", value: "150 J", recordedAt: now - 20_000, source: "manual", originModule: contract.fromModule });
      recordClinicalObservation({ id: "numero_cardioversoes", value: "2", recordedAt: now - 15_000, source: "derived", originModule: contract.fromModule });
      appendClinicalEvent({ id: "evt-antiarr", type: "medication_given", occurredAt: now - 10_000, module: contract.fromModule, label: "Antiarrítmico em curso", data: { antiarritmico_em_curso: "amiodarona" } });
      appendClinicalEvent({ id: "evt-pulso", type: "decision_made", occurredAt: now - 5_000, module: contract.fromModule, label: "Perda de pulso", data: { tempo_perda_pulso: now - 5_000 } });
      appendClinicalEvent({ id: "evt-causa", type: "decision_made", occurredAt: now - 4_000, module: contract.fromModule, label: "Causa reversível suspeita", data: { suspeita_causa_reversivel: "isquemia" } });

      const result = prepareAndPublishClinicalHandoff({ contract, now });
      const issues: string[] = [];
      if (result.status !== "complete") issues.push(`esperado complete, recebido ${result.status}`);
      if (listPendingClinicalHandoffs().length !== 1) issues.push("handoff completo não foi publicado exatamente uma vez");

      const consumed = consumeClinicalHandoff("pcr-adulto", contract.transitionId);
      if (!consumed) issues.push("PCR não consumiu o payload publicado");
      else {
        if (consumed.facts.length !== contract.requiredFacts.length) issues.push("payload consumido perdeu fatos obrigatórios");
        const rhythm = consumed.facts.find((fact) => fact.id === "ritmo_pre_parada");
        if (rhythm?.value !== "TV monomórfica") issues.push("ritmo pré-parada não foi preservado");
        if (rhythm?.recordedAt !== now - 30_000) issues.push("timestamp do ritmo não foi preservado");
      }
      if (consumeClinicalHandoff("pcr-adulto", contract.transitionId)) issues.push("payload foi consumido mais de uma vez");
      return issues;
    },
  },
  {
    id: "brady-pulseless-handoff-incomplete-not-published",
    run: () => {
      resetHandoffState();
      const contract = getPcrContract("bradycardia");
      const now = 1_800_000_100_000;

      recordClinicalObservation({ id: "ritmo_pre_parada", value: "BAV total", recordedAt: now - 30_000, source: "manual", originModule: contract.fromModule });
      appendClinicalEvent({ id: "evt-atropina", type: "medication_given", occurredAt: now - 20_000, module: contract.fromModule, label: "Atropina", data: { atropina_administrada: true } });
      appendClinicalEvent({ id: "evt-pulso-bradi", type: "decision_made", occurredAt: now - 5_000, module: contract.fromModule, label: "Perda de pulso", data: { tempo_perda_pulso: now - 5_000 } });

      const result = prepareAndPublishClinicalHandoff({ contract, now });
      const issues: string[] = [];
      if (result.status !== "incomplete") issues.push(`esperado incomplete, recebido ${result.status}`);
      if (result.missingFacts.length === 0) issues.push("handoff incompleto não declarou fatos faltantes");
      if (!result.missingFacts.includes("marcapasso_em_uso")) issues.push("falta de marcapasso_em_uso não foi declarada");
      if (listPendingClinicalHandoffs().length !== 0) issues.push("handoff incompleto foi publicado indevidamente");
      return issues;
    },
  },
  {
    id: "tachy-handoff-observation-wins-over-event",
    run: () => {
      resetHandoffState();
      const contract = getPcrContract("tachycardia");
      const now = 1_800_000_200_000;

      for (const factId of contract.requiredFacts) {
        recordClinicalObservation({ id: factId, value: `obs:${factId}`, recordedAt: now - 10_000, source: "manual", originModule: contract.fromModule });
        appendClinicalEvent({ id: `evt:${factId}`, type: "observation_recorded", occurredAt: now - 1_000, module: contract.fromModule, label: factId, data: { [factId]: `event:${factId}` } });
      }

      const result = prepareAndPublishClinicalHandoff({ contract, now });
      const issues: string[] = [];
      if (result.status !== "complete") return [`esperado complete, recebido ${result.status}`];
      const consumed = consumeClinicalHandoff("pcr-adulto", contract.transitionId);
      if (!consumed) return ["payload não disponível para consumo"];
      for (const fact of consumed.facts) {
        if (fact.value !== `obs:${fact.id}`) issues.push(`observação não teve prioridade para ${fact.id}`);
      }
      return issues;
    },
  },
];

export function runExecutableClinicalHandoffCases(): string[] {
  const issues: string[] = [];
  for (const testCase of EXECUTABLE_CLINICAL_HANDOFF_CASES) {
    for (const issue of testCase.run()) issues.push(`${testCase.id}: ${issue}`);
  }
  return issues;
}
