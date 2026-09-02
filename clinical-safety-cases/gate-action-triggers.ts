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

  const stemiUnknown = evaluateClinicalActionGates({
    protocolId: "sca",
    nodeId: "stemi_reperfusao",
    actionId: "definir_estrategia_reperfusao",
    context: { tempo_operacional_icp: "desconhecido" },
  });
  expect(stemiUnknown.length === 1, "STEMI: tempo de ICP desconhecido deve ativar exatamente um gate", issues);
  expect(stemiUnknown[0]?.policy.level === "soft_stop", "STEMI: gate deve ser soft_stop", issues);
  expect(stemiUnknown[0]?.needsOverrideReason === true, "STEMI: soft stop deve exigir motivo para override", issues);

  const stemiKnown = evaluateClinicalActionGates({
    protocolId: "sca",
    nodeId: "stemi_reperfusao",
    actionId: "definir_estrategia_reperfusao",
    context: { tempo_operacional_icp: "confirmado" },
  });
  expect(stemiKnown.length === 0, "STEMI: tempo confirmado não deve manter gate de incerteza", issues);

  const tachyNoSedation = evaluateClinicalActionGates({
    protocolId: "taquicardia-acls",
    nodeId: "unstable_cardioversion",
    actionId: "cardioversao_sincronizada",
    context: { sedacao: "nao_realizada" },
  });
  expect(tachyNoSedation.length === 1, "Taquicardia: cardioversão sem sedação deve ativar advisory", issues);
  expect(tachyNoSedation[0]?.policy.level === "advisory", "Taquicardia: gate deve ser advisory", issues);
  expect(tachyNoSedation[0]?.blocks === false, "Taquicardia: advisory não pode bloquear cardioversão", issues);

  const tachySedated = evaluateClinicalActionGates({
    protocolId: "taquicardia-acls",
    nodeId: "unstable_cardioversion",
    actionId: "cardioversao_sincronizada",
    context: { sedacao: "realizada" },
  });
  expect(tachySedated.length === 0, "Taquicardia: sedação realizada deve resolver o advisory", issues);

  return issues;
}
