import { appendClinicalEvent, clearClinicalEventLog } from "../lib/clinical-event-log";
import { prepareClinicalHandoffTransfer } from "../lib/clinical-handoff-orchestrator";
import { clearClinicalHandoffs, listPendingClinicalHandoffs } from "../lib/clinical-handoff-runtime";
import { clearClinicalObservations, recordClinicalObservation } from "../lib/clinical-observations";
import { PCR_TERMINAL_HANDOFF_CONTEXTS } from "../lib/pcr-terminal-handoff-context";

export function runPcrHandoffPriorityCase(): string[] {
  clearClinicalEventLog();
  clearClinicalObservations();
  clearClinicalHandoffs();

  const contract = PCR_TERMINAL_HANDOFF_CONTEXTS.find((item) => item.source === "bradycardia");
  if (!contract) return ["contrato de bradicardia → PCR ausente"];

  const now = 1_800_002_000_000;
  recordClinicalObservation({
    id: "ritmo_pre_parada",
    value: "BAV total",
    recordedAt: now - 20_000,
    source: "manual",
    originModule: contract.fromModule,
  });
  appendClinicalEvent({
    id: "priority-pulse-loss",
    type: "decision_made",
    occurredAt: now - 1_000,
    module: contract.fromModule,
    label: "Perdeu o pulso",
    data: { tempo_perda_pulso: now - 1_000 },
  });

  const readiness = prepareClinicalHandoffTransfer({ contract, now });
  const issues: string[] = [];
  if (readiness.assembly.status !== "incomplete") issues.push(`esperado incomplete; recebido ${readiness.assembly.status}`);
  if (!readiness.canProceedToDestination) issues.push("PCR foi bloqueado por contexto incompleto");
  if (readiness.contextPublished) issues.push("payload incompleto foi publicado como se estivesse completo");
  if (!readiness.missingFacts.includes("atropina_administrada")) issues.push("déficit de atropina não permaneceu explícito");
  if (!readiness.missingFacts.includes("marcapasso_em_uso")) issues.push("déficit de marcapasso não permaneceu explícito");
  if (listPendingClinicalHandoffs().length !== 0) issues.push("inbox recebeu contexto incompleto");
  return issues;
}
