import { evaluateClinicalActionAttempt } from "../lib/clinical-action-gate";
import { assembleClinicalGateContextFromObservations } from "../lib/clinical-gate-context-adapter";
import { validateClinicalDecisionObservationBindings } from "../lib/clinical-decision-observation-bindings";
import { clearClinicalEventLog, listClinicalEvents } from "../lib/clinical-event-log";
import { clearClinicalObservations, getClinicalObservation } from "../lib/clinical-observations";
import { recordFlowDecision } from "../lib/clinical-runtime-bridge";

function expect(condition: boolean, message: string, issues: string[]) {
  if (!condition) issues.push(message);
}

export function runExecutableDecisionObservationBindingCases(): string[] {
  const issues = [...validateClinicalDecisionObservationBindings()];
  const now = 1_700_000_100_000;

  const assertTcOption = (optionId: "isquemico" | "hic" | "hsa", expected: "sim" | "nao") => {
    clearClinicalObservations();
    clearClinicalEventLog();
    recordFlowDecision({
      module: "avc",
      nodeId: "tc_resultado",
      optionId,
      now,
    });
    const observation = getClinicalObservation("hemorragia_intracraniana_aguda");
    expect(observation?.value === expected, `Binding TC ${optionId}: esperado hemorragia=${expected}`, issues);
    expect(observation?.recordedAt === now, `Binding TC ${optionId}: timestamp deve ser o da decisão`, issues);
    expect(observation?.originModule === "avc", `Binding TC ${optionId}: origem deve ser avc`, issues);
    const events = listClinicalEvents();
    expect(events.some((event) => event.type === "decision_made"), `Binding TC ${optionId}: decisão deve continuar no event log`, issues);
    expect(events.some((event) => event.type === "observation_recorded"), `Binding TC ${optionId}: observação derivada deve ser auditável`, issues);
  };

  assertTcOption("isquemico", "nao");
  assertTcOption("hic", "sim");
  assertTcOption("hsa", "sim");

  clearClinicalObservations();
  clearClinicalEventLog();
  recordFlowDecision({
    module: "avc",
    nodeId: "isq_contraindicacoes",
    optionId: "nao",
    now,
  });
  expect(getClinicalObservation("hemorragia_intracraniana_aguda") === undefined, "Decisão sem binding não pode criar observação por convenção", issues);
  expect(listClinicalEvents().filter((event) => event.type === "observation_recorded").length === 0, "Decisão sem binding não pode gerar observation_recorded", issues);

  clearClinicalObservations();
  clearClinicalEventLog();
  recordFlowDecision({ module: "avc", nodeId: "tc_resultado", optionId: "hic", now });
  const gateContext = assembleClinicalGateContextFromObservations([
    {
      fact: "hemorragia_intracraniana_aguda",
      observationId: "hemorragia_intracraniana_aguda",
      values: { sim: true, nao: false },
    },
  ], now);
  const attempt = evaluateClinicalActionAttempt({
    protocolId: "avc",
    nodeId: "trombolise",
    actionId: "administrar_trombolise_iv",
    context: gateContext.context,
  });
  expect(attempt.hardStops.length === 1, "Binding TC HIC: decisão→observação→contexto deve ativar hard stop no nó real de trombólise", issues);

  // STEMI: declarar "não sei" cria estado operacional desconhecido. Tentar fechar
  // estratégia enquanto este estado permanece deve ativar o soft stop.
  clearClinicalObservations();
  clearClinicalEventLog();
  recordFlowDecision({
    module: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    optionId: "nao_sei",
    now,
  });
  expect(
    getClinicalObservation("tempo_operacional_icp")?.value === "desconhecido",
    "STEMI: opção não sei deve registrar tempo operacional da ICP como desconhecido",
    issues
  );
  const stemiUnknownContext = assembleClinicalGateContextFromObservations([
    {
      fact: "tempo_operacional_icp",
      observationId: "tempo_operacional_icp",
      values: { desconhecido: "desconhecido", confirmado: "confirmado" },
    },
  ], now);
  const stemiUnknownAttempt = evaluateClinicalActionAttempt({
    protocolId: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    actionId: "definir_estrategia_reperfusao",
    context: stemiUnknownContext.context,
  });
  expect(stemiUnknownAttempt.softStops.length === 1, "STEMI: incerteza declarada deve ativar soft stop ao tentar definir estratégia", issues);
  expect(stemiUnknownAttempt.canProceedWithoutOverride === false, "STEMI: incerteza declarada não pode prosseguir silenciosamente", issues);

  // Uma escolha posteriormente assumida como confirmada substitui a observação
  // desconhecida por confirmado e resolve o gate para a próxima avaliação.
  recordFlowDecision({
    module: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    optionId: "icp",
    now: now + 1,
  });
  expect(
    getClinicalObservation("tempo_operacional_icp")?.value === "confirmado",
    "STEMI: escolha ICP deve registrar tempo operacional como confirmado",
    issues
  );
  const stemiConfirmedContext = assembleClinicalGateContextFromObservations([
    {
      fact: "tempo_operacional_icp",
      observationId: "tempo_operacional_icp",
      values: { desconhecido: "desconhecido", confirmado: "confirmado" },
    },
  ], now + 1);
  const stemiConfirmedAttempt = evaluateClinicalActionAttempt({
    protocolId: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    actionId: "definir_estrategia_reperfusao",
    context: stemiConfirmedContext.context,
  });
  expect(stemiConfirmedAttempt.softStops.length === 0, "STEMI: dado confirmado deve resolver soft stop", issues);
  expect(stemiConfirmedAttempt.canProceedWithoutOverride === true, "STEMI: dado confirmado deve permitir estratégia sem override", issues);

  clearClinicalObservations();
  clearClinicalEventLog();
  return issues;
}
