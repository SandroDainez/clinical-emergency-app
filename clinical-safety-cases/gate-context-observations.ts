import { evaluateClinicalActionAttempt } from "../lib/clinical-action-gate";
import {
  assembleClinicalGateContextFromObservations,
  type ClinicalGateFactBinding,
} from "../lib/clinical-gate-context-adapter";
import { clearClinicalObservations, recordClinicalObservation } from "../lib/clinical-observations";

function expect(condition: boolean, message: string, issues: string[]) {
  if (!condition) issues.push(message);
}

export function runExecutableClinicalGateContextCases(): string[] {
  const issues: string[] = [];
  const now = 1_700_000_000_000;

  clearClinicalObservations();
  const missingBinding: ClinicalGateFactBinding = {
    fact: "teste",
    observationId: "teste",
    values: { sim: true, nao: false },
  };
  const missing = assembleClinicalGateContextFromObservations([missingBinding], now);
  expect(missing.missingFacts.length === 1, "Contexto de gate: observação ausente deve ser declarada em missingFacts", issues);
  expect(Object.keys(missing.context).length === 0, "Contexto de gate: ausência não pode virar fato", issues);

  clearClinicalObservations();
  recordClinicalObservation({
    id: "teste",
    value: "sim",
    recordedAt: now - 1_000,
    source: "manual",
    originModule: "teste-modulo",
  });
  const fresh = assembleClinicalGateContextFromObservations([missingBinding], now);
  expect(fresh.context.teste === true, "Contexto de gate: valor literal reconhecido deve ser mapeado", issues);
  expect(fresh.missingFacts.length === 0 && fresh.unmappedFacts.length === 0, "Contexto de gate: fato válido não deve gerar problema", issues);

  const staleBinding: ClinicalGateFactBinding = {
    ...missingBinding,
    maxAgeMs: 500,
  };
  const stale = assembleClinicalGateContextFromObservations([staleBinding], now);
  expect(stale.staleFacts.length === 1, "Contexto de gate: observação além do limite deve ser stale", issues);
  expect(stale.context.teste === undefined, "Contexto de gate: observação stale não pode entrar como fato atual", issues);

  clearClinicalObservations();
  recordClinicalObservation({
    id: "teste",
    value: "talvez",
    recordedAt: now,
    source: "manual",
  });
  const unmapped = assembleClinicalGateContextFromObservations([missingBinding], now);
  expect(unmapped.unmappedFacts.length === 1, "Contexto de gate: valor não reconhecido deve ser explícito", issues);
  expect(unmapped.context.teste === undefined, "Contexto de gate: valor não reconhecido não pode ser inferido", issues);

  clearClinicalObservations();
  recordClinicalObservation({
    id: "hemorragia_intracraniana_aguda",
    value: "sim",
    recordedAt: now,
    source: "manual",
    originModule: "avc",
  });
  const avcContext = assembleClinicalGateContextFromObservations([
    {
      fact: "hemorragia_intracraniana_aguda",
      observationId: "hemorragia_intracraniana_aguda",
      values: { sim: true, nao: false },
    },
  ], now);
  const avcAttempt = evaluateClinicalActionAttempt({
    protocolId: "avc",
    nodeId: "tc_resultado",
    actionId: "administrar_trombolise_iv",
    context: avcContext.context,
  });
  expect(avcAttempt.hardStops.length === 1, "Contexto de gate: observação explícita deve conseguir ativar hard stop correspondente", issues);
  expect(avcAttempt.canProceedWithoutOverride === false, "Contexto de gate: hard stop derivado de observação deve impedir prosseguir", issues);

  clearClinicalObservations();
  return issues;
}
