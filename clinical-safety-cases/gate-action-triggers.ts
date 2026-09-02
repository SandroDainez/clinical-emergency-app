import {
  canProceedAfterRecordedOverrides,
  evaluateClinicalActionAttempt,
} from "../lib/clinical-action-gate";
import { evaluateClinicalActionGates } from "../lib/clinical-gate-runtime";
import { validateClinicalGateTriggerRegistry } from "../lib/clinical-gate-trigger-registry";

function expect(condition: boolean, message: string, issues: string[]) {
  if (!condition) issues.push(message);
}

export function runExecutableClinicalGateTriggerCases(): string[] {
  const issues = [...validateClinicalGateTriggerRegistry()];

  const avcBlocked = evaluateClinicalActionGates({
    protocolId: "avc",
    nodeId: "tc_resultado",
    actionId: "administrar_trombolise_iv",
    context: { hemorragia_intracraniana_aguda: true },
  });
  expect(avcBlocked.length === 1, "AVC: trombólise com hemorragia deve ativar exatamente um gate", issues);
  expect(avcBlocked[0]?.policy.level === "hard_stop", "AVC: gate deve ser hard_stop", issues);
  expect(avcBlocked[0]?.blocks === true, "AVC: hard stop deve bloquear a ação", issues);
  expect(avcBlocked[0]?.overrideAllowed === false, "AVC: hard stop não pode permitir override", issues);

  const avcAttempt = evaluateClinicalActionAttempt({
    protocolId: "avc",
    nodeId: "tc_resultado",
    actionId: "administrar_trombolise_iv",
    context: { hemorragia_intracraniana_aguda: true },
  });
  expect(avcAttempt.canProceedWithoutOverride === false, "AVC: hard stop deve impedir prosseguir sem override", issues);
  expect(canProceedAfterRecordedOverrides(avcAttempt, new Set(["avc-ivt-hemorragia-aguda"])) === false, "AVC: hard stop não pode ser liberado nem se gateId aparecer como overridden", issues);

  const avcCorrectBranch = evaluateClinicalActionGates({
    protocolId: "avc",
    nodeId: "tc_resultado",
    actionId: "seguir_ramo_hemorragico",
    context: { hemorragia_intracraniana_aguda: true },
  });
  expect(avcCorrectBranch.length === 0, "AVC: seguir ramo hemorrágico não pode ativar gate de trombólise", issues);

  const avcNoHemorrhage = evaluateClinicalActionGates({
    protocolId: "avc",
    nodeId: "tc_resultado",
    actionId: "administrar_trombolise_iv",
    context: { hemorragia_intracraniana_aguda: false },
  });
  expect(avcNoHemorrhage.length === 0, "AVC: sem hemorragia o gate específico não deve ativar", issues);

  const stemiUnknown = evaluateClinicalActionAttempt({
    protocolId: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    actionId: "definir_estrategia_reperfusao",
    context: { tempo_operacional_icp: "desconhecido" },
  });
  expect(stemiUnknown.softStops.length === 1, "STEMI: tempo de ICP desconhecido deve ativar exatamente um soft stop", issues);
  expect(stemiUnknown.softStops[0]?.needsOverrideReason === true, "STEMI: soft stop deve exigir motivo para override", issues);
  expect(stemiUnknown.canProceedWithoutOverride === false, "STEMI: soft stop não deve permitir prosseguir sem override", issues);
  expect(canProceedAfterRecordedOverrides(stemiUnknown, new Set()) === false, "STEMI: sem override registrado deve continuar bloqueado", issues);
  expect(canProceedAfterRecordedOverrides(stemiUnknown, new Set(["sca-tempo-icp-nao-confirmado"])) === true, "STEMI: soft stop pode ser liberado depois de override registrado", issues);

  const stemiKnown = evaluateClinicalActionAttempt({
    protocolId: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    actionId: "definir_estrategia_reperfusao",
    context: { tempo_operacional_icp: "confirmado" },
  });
  expect(stemiKnown.evaluations.length === 0, "STEMI: tempo confirmado não deve manter gate de incerteza", issues);
  expect(stemiKnown.canProceedWithoutOverride === true, "STEMI: tempo confirmado deve permitir prosseguir sem override", issues);

  const tachyNoSedation = evaluateClinicalActionAttempt({
    protocolId: "taquicardia-acls",
    nodeId: "unstable_cardioversion",
    actionId: "cardioversao_sincronizada",
    context: { sedacao: "nao_realizada" },
  });
  expect(tachyNoSedation.advisories.length === 1, "Taquicardia: cardioversão sem sedação deve ativar advisory", issues);
  expect(tachyNoSedation.canProceedWithoutOverride === true, "Taquicardia: advisory não pode bloquear cardioversão", issues);

  const tachySedationMissing = evaluateClinicalActionAttempt({
    protocolId: "taquicardia-acls",
    nodeId: "unstable_cardioversion",
    actionId: "cardioversao_sincronizada",
    context: {},
  });
  expect(tachySedationMissing.advisories.length === 1, "Taquicardia: sedação não registrada deve ativar advisory por trigger missing explícito", issues);
  expect(tachySedationMissing.canProceedWithoutOverride === true, "Taquicardia: sedação ausente não pode bloquear cardioversão", issues);

  const tachySedated = evaluateClinicalActionAttempt({
    protocolId: "taquicardia-acls",
    nodeId: "unstable_cardioversion",
    actionId: "cardioversao_sincronizada",
    context: { sedacao: "realizada" },
  });
  expect(tachySedated.evaluations.length === 0, "Taquicardia: sedação realizada deve resolver o advisory", issues);

  return issues;
}
