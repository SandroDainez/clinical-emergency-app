const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const enginePath = path.join(appDir, "engine.ts");
const protocolSchemaPath = path.join(appDir, "acls", "protocol-schema.ts");
const presentationPath = path.join(appDir, "acls", "presentation.ts");
const screenModelPath = path.join(appDir, "acls", "screen-model.ts");
const debriefPath = path.join(appDir, "acls", "debrief.ts");
const caseLogEvaluationPath = path.join(appDir, "acls", "case-log-evaluation.ts");
const clinicalCaseAnalysisPath = path.join(appDir, "acls", "clinical-case-analysis.ts");
const caseHistoryPath = path.join(appDir, "acls", "case-history.ts");
const reversibleCauseAssistantPath = path.join(
  appDir,
  "acls",
  "reversible-cause-assistant.ts"
);
const voicePolicyPath = path.join(appDir, "acls", "voice-policy.ts");
const voiceResolverPath = path.join(appDir, "acls", "voice-resolver.ts");
const voiceRuntimePath = path.join(appDir, "acls", "voice-runtime.ts");
const voiceTelemetryPath = path.join(appDir, "acls", "voice-telemetry.ts");
const orchestratorPath = path.join(appDir, "acls", "orchestrator.ts");
const speechMapPath = path.join(appDir, "acls", "speech-map.ts");
const speechQueuePath = path.join(appDir, "acls", "speech-queue.ts");
const voiceSessionControllerPath = path.join(
  appDir,
  "acls",
  "voice-session-controller.ts"
);
const webVoiceProviderPath = path.join(
  appDir,
  "components",
  "voice",
  "web-voice-capture-provider.ts"
);
const sepsisEnginePath = path.join(appDir, "sepsis-engine.ts");
const vasoactiveEnginePath = path.join(appDir, "vasoactive-engine.ts");
const protocolPath = path.join(appDir, "protocol.json");
const sepsisProtocolPath = path.join(appDir, "protocols", "sepse_adulto.json");
const sepsisAntimicrobialPath = path.join(appDir, "protocols", "sepse_antimicrobianos.json");
const vasoactiveProtocolPath = path.join(appDir, "protocols", "drogas_vasoativas.json");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "engine-test-"));

function loadEngine(sourcePath, protocolSourcePath, outputName) {
  execFileSync(
    "npx",
    [
      "tsc",
      "--module",
      "commonjs",
      "--target",
      "es2020",
      "--resolveJsonModule",
      "--esModuleInterop",
      "--moduleResolution",
      "node",
      "--outDir",
      tempDir,
      sourcePath,
    ],
    {
      cwd: appDir,
      stdio: "inherit",
    }
  );

  const protocolTargetDir = path.dirname(path.join(tempDir, path.relative(appDir, protocolSourcePath)));
  fs.mkdirSync(protocolTargetDir, { recursive: true });
  fs.copyFileSync(protocolSourcePath, path.join(tempDir, path.relative(appDir, protocolSourcePath)));
  if (sourcePath === sepsisEnginePath) {
    const antimicrobialTargetDir = path.dirname(
      path.join(tempDir, path.relative(appDir, sepsisAntimicrobialPath))
    );
    fs.mkdirSync(antimicrobialTargetDir, { recursive: true });
    fs.copyFileSync(
      sepsisAntimicrobialPath,
      path.join(tempDir, path.relative(appDir, sepsisAntimicrobialPath))
    );
  }
  return require(path.join(tempDir, outputName));
}

function loadModule(sourcePath, outputName) {
  execFileSync(
    "npx",
    [
      "tsc",
      "--module",
      "commonjs",
      "--target",
      "es2020",
      "--resolveJsonModule",
      "--esModuleInterop",
      "--moduleResolution",
      "node",
      "--outDir",
      tempDir,
      sourcePath,
    ],
    {
      cwd: appDir,
      stdio: "inherit",
    }
  );

  return require(path.join(tempDir, outputName));
}

const engine = loadEngine(enginePath, protocolPath, "engine.js");
const protocolSchema = loadModule(protocolSchemaPath, "protocol-schema.js");
const presentation = loadModule(presentationPath, "presentation.js");
const screenModel = loadModule(screenModelPath, path.join("acls", "screen-model.js"));
const debrief = loadModule(debriefPath, path.join("acls", "debrief.js"));
const caseLogEvaluation = loadModule(
  caseLogEvaluationPath,
  path.join("acls", "case-log-evaluation.js")
);
const clinicalCaseAnalysis = loadModule(
  clinicalCaseAnalysisPath,
  path.join("acls", "clinical-case-analysis.js")
);
const caseHistory = loadModule(caseHistoryPath, path.join("acls", "case-history.js"));
const reversibleCauseAssistant = loadModule(
  reversibleCauseAssistantPath,
  path.join("acls", "reversible-cause-assistant.js")
);
const voicePolicy = loadModule(voicePolicyPath, path.join("acls", "voice-policy.js"));
const voiceResolver = loadModule(voiceResolverPath, "voice-resolver.js");
const voiceRuntime = loadModule(voiceRuntimePath, path.join("acls", "voice-runtime.js"));
const voiceTelemetry = loadModule(voiceTelemetryPath, path.join("acls", "voice-telemetry.js"));
const orchestrator = loadModule(orchestratorPath, path.join("acls", "orchestrator.js"));
const speechMap = loadModule(speechMapPath, "speech-map.js");
const speechQueue = loadModule(speechQueuePath, "speech-queue.js");
const voiceSessionController = loadModule(
  voiceSessionControllerPath,
  path.join("acls", "voice-session-controller.js")
);
const webVoiceProvider = loadModule(
  webVoiceProviderPath,
  "web-voice-capture-provider.js"
);
const sepsisEngine = loadEngine(sepsisEnginePath, sepsisProtocolPath, "sepsis-engine.js");
const vasoactiveEngine = loadEngine(
  vasoactiveEnginePath,
  vasoactiveProtocolPath,
  "vasoactive-engine.js"
);

const realDateNow = Date.now;
let now = 0;
Date.now = () => now;

function advance(ms) {
  now += ms;
}

function resetClock() {
  now = 0;
}

function snapshotAclsOrchestrator(instance) {
  const state = instance.getState();
  return {
    currentStateId: state.currentStateId,
    stateEntrySequence: state.stateEntrySequence,
    clinicalPhase: state.clinicalPhase,
    clinicalIntent: state.clinicalIntent,
    clinicalIntentConfidence: state.clinicalIntentConfidence,
    deliveredShockCount: state.deliveredShockCount,
    cycleCount: state.cycleCount,
    shockableFlowStep: state.shockableFlowStep,
    timerIds: state.timers.map((timer) => timer.id),
    documentedExecutionKeys: [...state.documentedExecutionKeys],
    medicationSnapshot: {
      adrenaline: {
        recommendedCount: state.medications.adrenaline.recommendedCount,
        administeredCount: state.medications.adrenaline.administeredCount,
        pendingConfirmation: state.medications.adrenaline.pendingConfirmation,
        nextDueAt: state.medications.adrenaline.nextDueAt,
      },
      antiarrhythmic: {
        recommendedCount: state.medications.antiarrhythmic.recommendedCount,
        administeredCount: state.medications.antiarrhythmic.administeredCount,
        pendingConfirmation: state.medications.antiarrhythmic.pendingConfirmation,
      },
    },
    timelineTail: state.timeline.map((event) => ({
      type: event.type,
      timestamp: event.timestamp,
      stateId: event.stateId,
      details: event.details,
    })),
    caseLog: instance.getCaseLog().map((entry) => ({
      timestamp: entry.timestamp,
      stateId: entry.stateId,
      eventType: entry.eventType,
      eventDetails: entry.eventDetails,
      speak: entry.speak,
    })),
    effects: instance.consumeEffects(),
  };
}

function runDeterministicShockableScenario() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();
  engine.registerExecution("adrenaline");
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();
  engine.registerExecution("antiarrhythmic");

  return {
    encounterSummary: engine.getEncounterSummary(),
    timeline: engine.getTimeline().map((event) => ({
      type: event.type,
      stateId: event.stateId,
      details: event.details,
      timestamp: event.timestamp,
    })),
    medicationSnapshot: engine.getMedicationSnapshot(),
  };
}

function createAclsSimulationRecorder(name) {
  resetClock();
  engine.resetSession();
  engine.consumeEffects();

  const stateLog = [];
  const speakLog = [];

  function recordState(step) {
    const entry = {
      step,
      timestamp: now,
      stateId: engine.getCurrentStateId(),
      clinicalIntent: engine.getClinicalIntent(),
    };
    const previous = stateLog.at(-1);

    if (
      previous &&
      previous.timestamp === entry.timestamp &&
      previous.stateId === entry.stateId &&
      previous.clinicalIntent === entry.clinicalIntent
    ) {
      return;
    }

    stateLog.push(entry);
  }

  function flushEffects(step) {
    const effects = engine.consumeEffects();

    for (const effect of effects) {
      if (effect.type !== "play_audio_cue" && effect.type !== "speak") {
        continue;
      }

      speakLog.push({
        step,
        timestamp: now,
        stateId: engine.getCurrentStateId(),
        clinicalIntent: engine.getClinicalIntent(),
        key:
          effect.type === "play_audio_cue"
            ? effect.cueId ?? effect.message
            : effect.message,
        message: effect.message,
      });
    }

    return effects;
  }

  function step(label, action) {
    action();
    recordState(label);
    flushEffects(label);
  }

  function tick(label, elapsedMs) {
    advance(elapsedMs);
    engine.tick();
    recordState(label);
    flushEffects(label);
  }

  function finish() {
    return {
      name,
      encounterSummary: engine.getEncounterSummary(),
      medicationSnapshot: engine.getMedicationSnapshot(),
      timeline: engine.getTimeline().map((event) => ({
        id: event.id,
        type: event.type,
        stateId: event.stateId,
        details: event.details,
        timestamp: event.timestamp,
      })),
      caseLog: engine.getCaseLog().map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        stateId: entry.stateId,
        eventType: entry.eventType,
        eventDetails: entry.eventDetails,
        speak: entry.speak,
        speakEffects: entry.speakEffects,
      })),
      stateLog,
      speakLog,
    };
  }

  recordState("initial");
  flushEffects("initial");

  return {
    finish,
    step,
    tick,
  };
}

function runDetailedShockableSimulation() {
  const simulation = createAclsSimulationRecorder("shockable_complete");

  simulation.step("recognition_confirmed", () => engine.next());
  simulation.step("pulse_absent", () => engine.next("sem_pulso"));
  simulation.step("start_cpr", () => engine.next());
  simulation.step("rhythm_shockable", () => engine.next("chocavel"));
  simulation.step("defibrillator_selected", () => engine.next("bifasico"));
  simulation.step("shock_1_documented", () => engine.registerExecution("shock"));
  simulation.step("transition_to_cpr_1", () => engine.next());
  simulation.step("start_cycle_1", () => engine.next());
  simulation.tick("cycle_1_pre_cue", 115000);
  simulation.tick("cycle_1_completed", 5000);
  simulation.step("rhythm_shockable_again", () => engine.next("chocavel"));
  simulation.step("shock_2_documented", () => engine.registerExecution("shock"));
  simulation.step("transition_to_cpr_2", () => engine.next());
  simulation.step("adrenaline_documented", () => engine.registerExecution("adrenaline"));
  simulation.step("start_cycle_2", () => engine.next());
  simulation.tick("cycle_2_pre_cue", 115000);
  simulation.tick("cycle_2_completed", 5000);
  simulation.step("rhythm_still_shockable", () => engine.next("chocavel"));
  simulation.step("shock_3_documented", () => engine.registerExecution("shock"));
  simulation.step("transition_to_cpr_3", () => engine.next());
  simulation.step("antiarrhythmic_documented", () => engine.registerExecution("antiarrhythmic"));

  return simulation.finish();
}

function runDetailedNonShockableSimulation() {
  const simulation = createAclsSimulationRecorder("nonshockable_complete");

  simulation.step("recognition_confirmed", () => engine.next());
  simulation.step("pulse_absent", () => engine.next("sem_pulso"));
  simulation.step("start_cpr", () => engine.next());
  simulation.tick("thirty_seconds_of_cpr", 30000);
  simulation.step("rhythm_nonshockable", () => engine.next("nao_chocavel"));
  simulation.step("adrenaline_documented", () => engine.registerExecution("adrenaline"));
  simulation.step("start_cycle_1", () => engine.next());
  simulation.tick("cycle_1_pre_cue", 85000);
  simulation.tick("cycle_1_completed", 5000);
  simulation.step("rhythm_still_nonshockable", () => engine.next("nao_chocavel"));
  simulation.step("transition_to_hs_ts", () => engine.next());
  simulation.step("start_cycle_2", () => engine.next());
  simulation.tick("cycle_2_pre_cue", 115000);
  simulation.tick("cycle_2_completed", 5000);
  simulation.step("rhythm_still_nonshockable_again", () => engine.next("nao_chocavel"));

  return simulation.finish();
}

function getTimerCycleDurations(simulation) {
  const starts = simulation.timeline.filter((event) => event.type === "timer_started");
  const completions = simulation.timeline.filter((event) => event.type === "timer_completed");

  return completions.map((completion, index) => ({
    stateId: completion.details?.stateId,
    durationMs: completion.timestamp - starts[index].timestamp,
  }));
}

function getRhythmCheckTimestamps(simulation) {
  return collapseConsecutiveValues(
    simulation.timeline
      .filter(
        (event) =>
          event.type === "state_transitioned" &&
          String(event.details?.to ?? "").includes("_preparo")
      )
      .map((event) => event.timestamp)
  );
}

function getEpinephrineDueTimestamps(simulation) {
  return simulation.timeline
    .filter(
      (event) =>
        event.type === "medication_due_now" && event.details?.medicationId === "adrenaline"
    )
    .map((event) => event.timestamp);
}

function assertNoAdjacentDuplicates(entries, selector) {
  for (let index = 1; index < entries.length; index += 1) {
    assert.notDeepEqual(selector(entries[index]), selector(entries[index - 1]));
  }
}

function collapseConsecutiveValues(values) {
  return values.filter((value, index) => value !== values[index - 1]);
}

function assertGuidelineTiming(simulation) {
  const cycleDurations = getTimerCycleDurations(simulation);
  const adrenalineDueTimestamps = getEpinephrineDueTimestamps(simulation);
  const rhythmCheckTimestamps = getRhythmCheckTimestamps(simulation);

  for (const cycle of cycleDurations) {
    assert.equal(cycle.durationMs, 120000);
  }

  for (let index = 1; index < adrenalineDueTimestamps.length; index += 1) {
    const delta = adrenalineDueTimestamps[index] - adrenalineDueTimestamps[index - 1];
    assert.equal(delta >= 180000, true);
    assert.equal(delta <= 300000, true);
  }

  for (let index = 1; index < rhythmCheckTimestamps.length; index += 1) {
    const delta = rhythmCheckTimestamps[index] - rhythmCheckTimestamps[index - 1];
    assert.equal(delta, 120000);
  }
}

function assertSimulationLoggingConsistency(simulation) {
  assert.equal(simulation.stateLog.length > 0, true);
  assert.equal(simulation.speakLog.every((entry) => typeof entry.timestamp === "number"), true);
  assert.equal(
    simulation.stateLog.every((entry) => typeof entry.clinicalIntent === "string"),
    true
  );

  assertNoAdjacentDuplicates(simulation.stateLog, (entry) => [
    entry.timestamp,
    entry.stateId,
    entry.clinicalIntent,
  ]);
  assertNoAdjacentDuplicates(simulation.speakLog, (entry) => [
    entry.timestamp,
    entry.stateId,
    entry.key,
  ]);
  assert.equal(
    new Set(simulation.timeline.map((event) => event.id)).size,
    simulation.timeline.length
  );
  assert.equal(
    new Set(
      simulation.speakLog.map((entry) => `${entry.timestamp}:${entry.stateId}:${entry.key}`)
    ).size,
    simulation.speakLog.length
  );
}

function testShockableFlow() {
  resetClock();
  engine.resetSession();

  assert.equal(engine.getCurrentStateId(), "reconhecimento_inicial");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "checar_respiracao_pulso");

  engine.next("sem_pulso");
  assert.equal(engine.getCurrentStateId(), "inicio");

  engine.next();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_preparo");

  engine.next("chocavel");
  assert.equal(engine.getCurrentStateId(), "tipo_desfibrilador");

  engine.next("bifasico");
  assert.equal(engine.getCurrentStateId(), "choque_bi_1");
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["shock"]);

  engine.registerExecution("shock");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "rcp_1");

  engine.next();
  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_2_preparo");

  engine.next("chocavel");
  assert.equal(engine.getCurrentStateId(), "choque_2");
  engine.registerExecution("shock");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "rcp_2");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  engine.registerExecution("adrenaline");
  assert.equal(engine.getEncounterSummary().adrenalineAdministeredCount, 1);

  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  assert.equal(engine.getCurrentStateId(), "choque_3");
  engine.registerExecution("shock");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "rcp_3");
  assert.equal(engine.getEncounterSummary().antiarrhythmicSuggestedCount, 1);

  engine.registerExecution("antiarrhythmic");
  assert.equal(engine.getEncounterSummary().antiarrhythmicAdministeredCount, 1);
  assert.match(engine.getEncounterSummaryText(), /Choques aplicados: 3/);
}

function testCompleteShockableFlowScenario() {
  const result = runDeterministicShockableScenario();

  assert.equal(result.encounterSummary.currentStateId, "rcp_3");
  assert.equal(result.encounterSummary.shockCount, 3);
  assert.equal(result.encounterSummary.adrenalineAdministeredCount, 1);
  assert.equal(result.encounterSummary.antiarrhythmicAdministeredCount, 1);
  assert.equal(
    result.timeline.filter((event) => event.type === "shock_applied").length,
    3
  );
  assert.equal(
    result.timeline.filter(
      (event) =>
        event.type === "medication_administered" &&
        event.details?.medicationId === "adrenaline"
    ).length,
    1
  );
  assert.equal(
    result.timeline.filter(
      (event) =>
        event.type === "medication_administered" &&
        event.details?.medicationId === "antiarrhythmic"
    ).length,
    1
  );
}

function testDetailedShockableSimulationLoggingAndGuidelines() {
  const simulation = runDetailedShockableSimulation();

  assert.equal(simulation.encounterSummary.currentStateId, "rcp_3");
  assert.deepEqual(
    collapseConsecutiveValues(
      simulation.stateLog
        .filter((entry) =>
          [
            "avaliar_ritmo_preparo",
            "choque_bi_1",
            "rcp_1",
            "avaliar_ritmo_2_preparo",
            "choque_2",
            "rcp_2",
            "avaliar_ritmo_3_preparo",
            "choque_3",
            "rcp_3",
          ].includes(entry.stateId)
        )
        .map((entry) => entry.stateId)
    ),
    [
      "avaliar_ritmo_preparo",
      "choque_bi_1",
      "rcp_1",
      "avaliar_ritmo_2_preparo",
      "choque_2",
      "rcp_2",
      "avaliar_ritmo_3_preparo",
      "choque_3",
      "rcp_3",
    ]
  );
  assert.equal(
    simulation.speakLog.some((entry) => entry.key === "prepare_shock"),
    true
  );
  assert.equal(
    simulation.speakLog.some((entry) => entry.key === "analyze_rhythm"),
    true
  );
  assertSimulationLoggingConsistency(simulation);
  assertGuidelineTiming(simulation);
}

function testProtocolSchemaValidation() {
  const protocol = JSON.parse(fs.readFileSync(protocolPath, "utf8"));
  const validation = protocolSchema.validateAclsProtocolDefinition(protocol);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);

  const invalid = {
    ...protocol,
    initialState: "estado_inexistente",
    states: {
      ...protocol.states,
      estado_invalido: {
        type: "question",
        text: "Pergunta inválida",
      },
    },
  };
  const invalidValidation = protocolSchema.validateAclsProtocolDefinition(invalid);
  assert.equal(invalidValidation.valid, false);
  assert.match(invalidValidation.errors.join("\n"), /initialState inválido/);
  assert.match(invalidValidation.errors.join("\n"), /question e precisa ter options/);
}

function testNonShockableFlow() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  advance(30000);
  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_epinefrina");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["adrenaline"]);
  assert.equal(engine.getTimers()[0].remaining, 90);

  engine.registerExecution("adrenaline");
  assert.equal(engine.getEncounterSummary().adrenalineAdministeredCount, 1);
}

function testCompleteNonShockableFlowScenario() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  advance(30000);
  engine.next("nao_chocavel");
  engine.registerExecution("adrenaline");
  engine.next();
  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");

  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_hs_ts");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  engine.next();
  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");

  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_hs_ts");
  assert.equal(engine.getEncounterSummary().adrenalineAdministeredCount, 1);
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), []);
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 2);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["adrenaline"]);
}

function testShockableInitialEpinephrineSpeaksAfterSecondShock() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();

  const effects = engine.consumeEffects();
  assert.equal(
    effects.some((effect) => effect.type === "play_audio_cue" && effect.cueId === "epinephrine_now"),
    true
  );
}

function testShockableEpinephrineDoesNotRepeatEveryCycle() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();
  engine.registerExecution("adrenaline");
  engine.consumeEffects();

  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();

  assert.equal(engine.getCurrentStateId(), "rcp_3");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["antiarrhythmic"]);
}

function testShockableEpinephrineFollowsFormalTimingAcrossCycles() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();

  assert.equal(engine.getCurrentStateId(), "rcp_2");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["adrenaline"]);

  engine.registerExecution("adrenaline");
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();

  assert.equal(engine.getCurrentStateId(), "rcp_3");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["antiarrhythmic"]);

  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();

  assert.equal(engine.getCurrentStateId(), "rcp_3");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 2);
  assert.ok(engine.getDocumentationActions().some((item) => item.id === "adrenaline"));
}

function testAntiarrhythmicDoesNotRepeatAfterSecondDose() {
  const instance = orchestrator.createAclsOrchestrator();
  const seededState = structuredClone(instance.getState());
  seededState.currentStateId = "rcp_3";
  seededState.algorithmBranch = "shockable";
  seededState.clinicalPhase = "CPR";
  seededState.shockableFlowStep = "cpr_3_with_antiarrhythmic";
  seededState.medications.antiarrhythmic.recommendedCount = 2;
  seededState.medications.antiarrhythmic.administeredCount = 2;
  seededState.medications.antiarrhythmic.pendingConfirmation = true;
  seededState.medications.antiarrhythmic.status = "completed";
  instance.restore(seededState);

  assert.throws(
    () => instance.dispatch({ type: "execution_recorded", at: 0, actionId: "antiarrhythmic" }),
    /máximo de duas doses|Registro não disponível/
  );
}

function testNonShockableEpinephrineDoesNotRepeatEveryCycle() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  advance(30000);
  engine.next("nao_chocavel");
  engine.registerExecution("adrenaline");
  engine.next();

  advance(120000);
  engine.tick();
  engine.next("nao_chocavel");
  engine.next();

  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), []);
}

function testNonShockablePendingEpinephrineDoesNotResuggestAcrossCycles() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  advance(30000);
  engine.next("nao_chocavel");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["adrenaline"]);

  engine.next();
  advance(120000);
  engine.tick();
  engine.next("nao_chocavel");
  engine.next();
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("nao_chocavel");
  engine.next();

  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["adrenaline"]);
}

function testDetailedNonShockableSimulationLoggingAndGuidelines() {
  const simulation = runDetailedNonShockableSimulation();

  assert.equal(simulation.encounterSummary.currentStateId, "nao_chocavel_hs_ts");
  assert.equal(
    simulation.stateLog.some(
      (entry) =>
        entry.stateId === "nao_chocavel_epinefrina" &&
        entry.clinicalIntent === "perform_cpr"
    ),
    true
  );
  assert.equal(
    simulation.stateLog.filter((entry) => entry.clinicalIntent === "analyze_rhythm").length >= 2,
    true
  );
  assert.equal(
    simulation.speakLog.some((entry) => entry.key === "prepare_rhythm"),
    true
  );
  assertSimulationLoggingConsistency(simulation);
  assertGuidelineTiming(simulation);
}

function testTwoMinuteTimerWindowIsDeterministic() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  advance(30000);
  engine.next("nao_chocavel");

  assert.equal(engine.getTimers()[0].remaining, 90);

  advance(89999);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_epinefrina");
  assert.equal(engine.getTimers()[0].remaining, 1);

  advance(1);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");
}

function testEpinephrineIntervalWindow() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  advance(30000);
  engine.next("nao_chocavel");
  assert.equal(engine.getMedicationSnapshot().adrenaline.pendingConfirmation, true);
  assert.equal(engine.getOperationalMetrics().nextAdrenalineDueInMs, undefined);
  engine.registerExecution("adrenaline");

  assert.equal(engine.getMedicationSnapshot().adrenaline.administeredCount, 1);
  assert.equal(engine.getOperationalMetrics().nextAdrenalineDueInMs, 240000);

  engine.next();
  advance(90000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");
  engine.next("nao_chocavel");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");

  advance(119999);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  advance(1);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");
  engine.next("nao_chocavel");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");

  advance(29999);
  engine.tick();
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  advance(1);
  engine.tick();
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 2);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["adrenaline"]);
}

function testEngineDeterminismForRepeatedScenario() {
  const first = runDeterministicShockableScenario();
  const second = runDeterministicShockableScenario();

  assert.deepEqual(second.encounterSummary, first.encounterSummary);
  assert.deepEqual(second.timeline, first.timeline);
  assert.deepEqual(second.medicationSnapshot, first.medicationSnapshot);
}

function testEngineSubscriptionDrivesTemporalEventsWithoutUiLoop() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  engine.consumeEffects();

  advance(115000);

  const realSetInterval = global.setInterval;
  const realClearInterval = global.clearInterval;
  let scheduledMs;
  let scheduledCallback;
  let clearedScheduler = false;

  global.setInterval = (callback, ms) => {
    scheduledCallback = callback;
    scheduledMs = ms;
    return 1;
  };

  global.clearInterval = () => {
    clearedScheduler = true;
  };

  let notifications = 0;
  const unsubscribe = engine.subscribe(() => {
    notifications += 1;
  });

  assert.equal(scheduledMs, 100);
  assert.equal(typeof scheduledCallback, "function");
  assert.equal(notifications >= 1, true);

  scheduledCallback();
  const preCueEffects = engine.consumeEffects();
  assert.equal(
    preCueEffects.some(
      (effect) => effect.type === "play_audio_cue" && effect.message === "prepare_rhythm"
    ),
    true
  );

  advance(10000);
  scheduledCallback();
  const cycleCompleteEffects = engine.consumeEffects();
  assert.equal(
    cycleCompleteEffects.some(
      (effect) => effect.type === "play_audio_cue" && effect.cueId === "prepare_rhythm"
    ),
    true
  );
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_2_preparo");

  unsubscribe();
  assert.equal(clearedScheduler, true);

  global.setInterval = realSetInterval;
  global.clearInterval = realClearInterval;
}

function testLatencyMetricsCaptureDispatchCommitAndSpeakStages() {
  resetClock();
  engine.setDebugLatencyEnabled(true);
  engine.clearLatencyMetrics();
  engine.resetSession();
  engine.consumeEffects();

  engine.next();
  engine.markLatencyStateCommitted();
  engine.consumeEffects();

  advance(5);
  engine.next("sem_pulso");
  engine.markLatencyStateCommitted();
  engine.consumeEffects();

  advance(5);
  engine.next();
  engine.markLatencyStateCommitted();
  engine.consumeEffects();

  advance(5);
  engine.next("chocavel");
  engine.markLatencyStateCommitted();
  engine.consumeEffects();

  advance(5);
  engine.next("bifasico");
  engine.markLatencyStateCommitted();

  const effects = engine.consumeEffects();
  const speakEffect = effects.find(
    (effect) => effect.type === "play_audio_cue" && effect.latencyTraceId
  );

  assert.ok(speakEffect, "expected latency trace on emitted SPEAK effect");

  advance(12);
  engine.recordLatencySpeakEnqueued(
    speakEffect.latencyTraceId,
    speakEffect.cueId ?? speakEffect.message
  );
  advance(18);
  engine.recordLatencyPlaybackStarted(
    speakEffect.latencyTraceId,
    speakEffect.cueId ?? speakEffect.message
  );

  const traces = engine.getLatencyMetrics();
  const trace = traces.find((entry) => entry.id === speakEffect.latencyTraceId);

  assert.ok(trace, "expected latency trace to be persisted");
  assert.equal(trace.eventCategory, "shock");
  assert.equal(trace.stateIdAfter, "choque_bi_1");
  assert.equal(trace.stateCommittedAt, 20);
  assert.equal(trace.speakEnqueuedAt, 32);
  assert.equal(trace.speakPlayStartedAt, 50);
  assert.equal(trace.latencies.eventToStateMs, 0);
  assert.equal(trace.latencies.stateToEnqueueSpeakMs, 12);
  assert.equal(trace.latencies.enqueueToPlayMs, 18);
  assert.equal(trace.latencies.totalEndToEndMs, 30);
  assert.match(engine.getLatencyMetricsExport(), /choque_bi_1/);

  engine.setDebugLatencyEnabled(false);
}

function testOrchestratorAppliesStateBeforeHandlingEffects() {
  resetClock();
  const appliedStates = [];
  const handledEffects = [];
  let verifyFinalTransition = false;
  const instance = orchestrator.createAclsOrchestrator(undefined, {
    onStateApplied: (state) => {
      appliedStates.push(state.currentStateId);
      if (verifyFinalTransition) {
        assert.equal(state.currentStateId, "nao_chocavel_epinefrina");
      }
    },
    onEffectsHandled: (effects) => {
      handledEffects.push(...effects);
      if (verifyFinalTransition) {
        assert.equal(instance.getState().currentStateId, "nao_chocavel_epinefrina");
      }
    },
  });

  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "question_answered", at: 0, input: "sem_pulso" });
  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "action_confirmed", at: 30000 });
  verifyFinalTransition = true;
  const nextState = instance.dispatch({
    type: "question_answered",
    at: 30000,
    input: "nao_chocavel",
  });

  assert.equal(nextState.currentStateId, "nao_chocavel_epinefrina");
  assert.equal(instance.getState().currentStateId, "nao_chocavel_epinefrina");
  assert.equal(appliedStates.at(-1), "nao_chocavel_epinefrina");
  assert.equal(
    handledEffects.some((effect) => effect.type === "SPEAK" && effect.key === "epinephrine_now"),
    true
  );

  const queuedEffects = instance.consumeEffects();
  assert.equal(instance.getState().currentStateId, "nao_chocavel_epinefrina");
  assert.equal(
    queuedEffects.some(
      (effect) =>
        effect.type === "play_audio_cue" && effect.cueId === "epinephrine_now"
    ),
    true
  );
}

function testSpeechMapCanonicalKeys() {
  assert.equal(speechMap.getSpeechText("start_cpr"), "Iniciar reanimação cardiopulmonar");
  assert.equal(speechMap.getSpeechText("prepare_rhythm"), "Preparar para ver ritmo");
  assert.equal(speechMap.getSpeechText("prepare_shock"), "Preparar choque");
  assert.equal(speechMap.getSpeechText("prepare_epinephrine"), "Preparar epinefrina");
  assert.equal(speechMap.getSpeechText("analyze_rhythm"), "Verificar ritmo");
  assert.equal(
    speechMap.getSpeechText("shock_biphasic_initial"),
    "Aplicar choque bifásico de duzentos joules ou carga máxima"
  );
  assert.equal(speechMap.getSpeechText("epinephrine_now"), "Dar epinefrina, um miligrama");
  assert.equal(
    speechMap.getSpeechText("antiarrhythmic_now"),
    "Dar antiarrítmico. Amiodarona, trezentos miligramas, ou lidocaína, um a um vírgula cinco miligrama por quilo"
  );
  assert.equal(
    speechMap.getSpeechText("antiarrhythmic_repeat"),
    "Repetir antiarrítmico com metade da dose anterior"
  );
}

function testSpeechMapAliasesAndPriority() {
  assert.equal(speechMap.resolveSpeechKey("inicio"), "start_cpr");
  assert.equal(speechMap.resolveSpeechKey("avaliar_ritmo_3"), "analyze_rhythm");
  assert.equal(speechMap.resolveSpeechKey("choque_3_bifasico"), "shock_escalated");
  assert.equal(speechMap.resolveSpeechKey("reminder_epinefrina"), "epinephrine_now");
  assert.equal(speechMap.resolveSpeechKey("reminder_antiarritmico_1"), "antiarrhythmic_now");
  assert.equal(speechMap.resolveSpeechKey("reminder_antiarritmico_2"), "antiarrhythmic_repeat");
  assert.equal(speechMap.getClinicalSpeakPriority("inicio"), "main");
  assert.equal(speechMap.getClinicalSpeakPriority("avaliar_ritmo"), "critical");
  assert.equal(speechMap.getClinicalSpeakPriority("prepare_rhythm"), "precue");
  assert.equal(speechMap.getClinicalSpeakPriority("reminder_epinefrina"), "main");
  assert.equal(speechMap.getClinicalSpeakPriority("antiarrhythmic_repeat"), "secondary");
  assert.equal(speechMap.getSpeechPriority("inicio"), "normal");
  assert.equal(speechMap.getSpeechPriority("avaliar_ritmo"), "critical");
  assert.equal(speechMap.getSpeechPriority("choque_bi_1"), "critical");
  assert.equal(speechMap.getSpeechPriority("reminder_epinefrina"), "normal");
  assert.equal(speechMap.getSpeechPriority("antiarrhythmic_now"), "normal");
  assert.equal(speechMap.getSpeechInterruptPolicy("shock"), "always");
  assert.equal(speechMap.getSpeechInterruptPolicy("analyze_rhythm"), "always");
  assert.equal(speechMap.getSpeechInterruptPolicy("prepare_rhythm"), "if_lower_priority");
  assert.equal(speechMap.getSpeechInterruptPolicy("prepare_shock"), "if_lower_priority");
  assert.equal(speechMap.getSpeechInterruptPolicy("prepare_epinephrine"), "if_lower_priority");
  assert.equal(speechMap.getSpeechInterruptPolicy("qualquer", "Confirmar ação?"), "never");
  assert.equal(speechMap.isPreCueKey("prepare_rhythm"), true);
  assert.equal(speechMap.isPreCueKey("prepare_shock"), true);
  assert.equal(speechMap.isPreCueKey("prepare_epinephrine"), true);
  assert.equal(speechMap.getSpeechIntensity("inicio"), "low");
  assert.equal(speechMap.getSpeechIntensity("avaliar_ritmo"), "medium");
  assert.equal(speechMap.getSpeechIntensity("choque_bi_1"), "high");
  assert.equal(speechMap.getSpeechIntensity("reminder_epinefrina"), "high");
  assert.equal(speechMap.getSpeechIntensity("prepare_epinephrine"), "medium");
}

function testAclsCaseLogTracksEventStateAndSpeak() {
  resetClock();
  const instance = orchestrator.createAclsOrchestrator();

  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "question_answered", at: 0, input: "sem_pulso" });
  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "action_confirmed", at: 30000 });
  instance.dispatch({
    type: "question_answered",
    at: 30000,
    input: "nao_chocavel",
  });

  const caseLog = instance.getCaseLog();
  const finalEntry = caseLog.at(-1);

  assert.equal(caseLog.length, 5);
  assert.equal(finalEntry.eventType, "question_answered");
  assert.equal(finalEntry.timestamp, 30000);
  assert.equal(finalEntry.stateId, "nao_chocavel_epinefrina");
  assert.equal(finalEntry.eventDetails.input, "nao_chocavel");
  assert.equal(finalEntry.speak?.key, "epinephrine_now");
  assert.equal(finalEntry.speakEffects[0]?.key, "epinephrine_now");
}

function testAclsCaseLogExportAndPersistence() {
  const caseLog = [
    {
      id: "question_answered:1:1000",
      timestamp: 1000,
      stateId: "nao_chocavel_epinefrina",
      eventType: "question_answered",
      eventDetails: { input: "nao_chocavel" },
      speak: { key: "epinephrine_now", intensity: "high", message: "Dar epinefrina, um miligrama" },
      speakEffects: [{ key: "epinephrine_now", intensity: "high", message: "Dar epinefrina, um miligrama" }],
    },
  ];
  const built = debrief.buildAclsDebrief({
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:07",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 1,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 1,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    operationalMetrics: { cyclesCompleted: 1 },
    reversibleCauses: [],
    timeline: [
      { id: "1", timestamp: 1000, type: "protocol_started", stateId: "inicio", origin: "system" },
    ],
  });

  const exportModel = debrief.buildAclsDebriefExport(
    built,
    {
      protocolId: "pcr_adulto",
      durationLabel: "00:07",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 1,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 1,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    caseLog
  );
  const persisted = caseHistory.buildPersistedAclsCase(
    {
      protocolId: "pcr_adulto",
      durationLabel: "00:07",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 1,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 1,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    built,
    caseLog
  );

  assert.equal(exportModel.caseLog.length, 1);
  assert.equal(exportModel.caseLog[0].speak.key, "epinephrine_now");
  assert.equal(exportModel.caseLog[0].speak.intensity, "high");
  assert.equal(exportModel.caseLogEvaluation.metrics.timeToFirstEpinephrineMs, undefined);
  assert.equal(exportModel.caseLogEvaluation.alerts.length, 0);
  assert.equal(persisted.caseLog.length, 1);
  assert.equal(persisted.exportModel.caseLog[0].eventType, "question_answered");
}

function testCaseLogEvaluationComputesMetricsFromLogOnly() {
  const evaluation = caseLogEvaluation.evaluateAclsCaseLog([
    {
      id: "1",
      timestamp: 0,
      stateId: "inicio",
      eventType: "action_confirmed",
      speakEffects: [],
    },
    {
      id: "2",
      timestamp: 30000,
      stateId: "choque_bi_1",
      eventType: "execution_recorded",
      eventDetails: { actionId: "shock" },
      speakEffects: [],
    },
    {
      id: "3",
      timestamp: 120000,
      stateId: "avaliar_ritmo_2",
      eventType: "timer_elapsed",
      eventDetails: { timerId: "timer:rcp_1:0" },
      speakEffects: [],
    },
    {
      id: "4",
      timestamp: 240000,
      stateId: "avaliar_ritmo_3",
      eventType: "timer_elapsed",
      eventDetails: { timerId: "timer:rcp_2:120000" },
      speakEffects: [],
    },
    {
      id: "5",
      timestamp: 250000,
      stateId: "rcp_2",
      eventType: "execution_recorded",
      eventDetails: { actionId: "adrenaline" },
      speakEffects: [],
    },
  ]);

  assert.equal(evaluation.metrics.timeToFirstShockMs, 30000);
  assert.equal(evaluation.metrics.timeToFirstEpinephrineMs, 250000);
  assert.equal(evaluation.metrics.averageCycleDurationMs, 120000);
  assert.equal(evaluation.metrics.rhythmCheckCount, 2);
  assert.equal(
    evaluation.feedback.includes("Primeiro choque em 00:30."),
    true
  );
  assert.equal(evaluation.alerts.length, 0);
}

function testCaseLogEvaluationFlagsDelayAndCycleErrors() {
  const evaluation = caseLogEvaluation.evaluateAclsCaseLog([
    {
      id: "1",
      timestamp: 0,
      stateId: "inicio",
      eventType: "action_confirmed",
      speakEffects: [],
    },
    {
      id: "2",
      timestamp: 180001,
      stateId: "choque_bi_1",
      eventType: "execution_recorded",
      eventDetails: { actionId: "shock" },
      speakEffects: [],
    },
    {
      id: "3",
      timestamp: 360001,
      stateId: "rcp_2",
      eventType: "execution_recorded",
      eventDetails: { actionId: "adrenaline" },
      speakEffects: [],
    },
    {
      id: "4",
      timestamp: 140000,
      stateId: "avaliar_ritmo_2",
      eventType: "timer_elapsed",
      eventDetails: { timerId: "timer:rcp_1:0" },
      speakEffects: [],
    },
  ]);

  assert.deepEqual(
    evaluation.alerts.map((alert) => alert.code),
    [
      "delayed_first_shock",
      "delayed_first_epinephrine",
      "cycle_duration_out_of_range",
    ]
  );
}

function testClinicalCaseAnalysisSummarizesStrengthsAndDelays() {
  const analysis = clinicalCaseAnalysis.analyzeAclsCase({
    caseLog: [
      {
        id: "1",
        timestamp: 0,
        stateId: "inicio",
        eventType: "action_confirmed",
        speakEffects: [],
      },
      {
        id: "2",
        timestamp: 30000,
        stateId: "choque_bi_1",
        eventType: "execution_recorded",
        eventDetails: { actionId: "shock" },
        speakEffects: [],
      },
      {
        id: "3",
        timestamp: 120000,
        stateId: "avaliar_ritmo_2",
        eventType: "timer_elapsed",
        eventDetails: { timerId: "timer:rcp_1:0" },
        speakEffects: [],
      },
      {
        id: "4",
        timestamp: 250000,
        stateId: "rcp_2",
        eventType: "execution_recorded",
        eventDetails: { actionId: "adrenaline" },
        speakEffects: [],
      },
    ],
    timeline: [
      {
        id: "t1",
        timestamp: 0,
        type: "protocol_started",
        stateId: "inicio",
        origin: "system",
      },
    ],
    latencyMetrics: [
      {
        id: "lat-1",
        eventType: "shock_confirmed",
        eventCategory: "shock",
        stateIdBefore: "avaliar_ritmo_1",
        stateIdAfter: "choque_bi_1",
        clinicalIntentAfter: "deliver_shock",
        eventReceivedAt: 1000,
        reducerCompletedAt: 1010,
        stateAppliedAt: 1015,
        stateCommittedAt: 1020,
        speakEnqueuedAt: 1025,
        speakPlayStartedAt: 1060,
        speakKeys: ["shock"],
        latencies: {
          eventToStateMs: 15,
          stateToEnqueueSpeakMs: 10,
          enqueueToPlayMs: 35,
          totalEndToEndMs: 60,
        },
      },
    ],
  });

  assert.match(analysis.summary, /sem atrasos|sem desvios|consistente/i);
  assert.equal(
    analysis.strengths.includes("Primeiro choque dentro da janela de 2 minutos."),
    true
  );
  assert.equal(
    analysis.strengths.includes("Primeira epinefrina dentro da janela esperada."),
    true
  );
  assert.equal(
    analysis.strengths.includes("Eventos críticos com latência perceptiva abaixo de 100 ms."),
    true
  );
  assert.equal(analysis.delaysOrDeviations.length, 0);
}

function testClinicalCaseAnalysisFlagsDelaysAndSuggestions() {
  const analysis = clinicalCaseAnalysis.analyzeAclsCase({
    caseLog: [
      {
        id: "1",
        timestamp: 0,
        stateId: "inicio",
        eventType: "action_confirmed",
        speakEffects: [],
      },
      {
        id: "2",
        timestamp: 180001,
        stateId: "choque_bi_1",
        eventType: "execution_recorded",
        eventDetails: { actionId: "shock" },
        speakEffects: [],
      },
      {
        id: "3",
        timestamp: 140000,
        stateId: "avaliar_ritmo_2",
        eventType: "timer_elapsed",
        eventDetails: { timerId: "timer:rcp_1:0" },
        speakEffects: [],
      },
      {
        id: "4",
        timestamp: 360001,
        stateId: "rcp_2",
        eventType: "execution_recorded",
        eventDetails: { actionId: "adrenaline" },
        speakEffects: [],
      },
    ],
    timeline: [
      {
        id: "g1",
        timestamp: 200000,
        type: "guard_rail_triggered",
        stateId: "rcp_2",
        origin: "system",
        details: { issue: "Choque fora da fase de choque." },
      },
    ],
    latencyMetrics: [
      {
        id: "lat-2",
        eventType: "rhythm_due",
        eventCategory: "rhythm",
        stateIdBefore: "rcp_2",
        stateIdAfter: "avaliar_ritmo_3",
        clinicalIntentAfter: "analyze_rhythm",
        eventReceivedAt: 1000,
        reducerCompletedAt: 1010,
        stateAppliedAt: 1015,
        stateCommittedAt: 1020,
        speakEnqueuedAt: 1030,
        speakPlayStartedAt: 1200,
        speakKeys: ["analyze_rhythm"],
        latencies: {
          eventToStateMs: 15,
          stateToEnqueueSpeakMs: 15,
          enqueueToPlayMs: 170,
          totalEndToEndMs: 200,
        },
      },
    ],
  });

  assert.match(analysis.summary, /atraso\(s\)|desvio\(s\)/i);
  assert.equal(
    analysis.delaysOrDeviations.some((item) => item.includes("Primeiro choque ocorreu após 2 minutos")),
    true
  );
  assert.equal(
    analysis.delaysOrDeviations.some((item) => item.includes("Choque fora da fase de choque")),
    true
  );
  assert.equal(
    analysis.delaysOrDeviations.some((item) => item.includes("Latência perceptiva elevada em rhythm")),
    true
  );
  assert.equal(
    analysis.improvementSuggestions.includes("Antecipar desfibrilação no primeiro ritmo chocável."),
    true
  );
  assert.equal(
    analysis.improvementSuggestions.includes("Reduzir latência perceptiva em eventos críticos como ritmo e choque."),
    true
  );
}

async function testSpeechQueueSilencePolicy() {
  let currentTime = 0;
  let currentStateId = "rcp_2";
  const played = [];
  const queue = speechQueue.createSpeechQueue({
    getCurrentStateId: () => currentStateId,
    isOutputActive: () => false,
    play: async (message, cueId) => {
      played.push({ message, cueId, at: currentTime });
    },
    stop: () => {},
    now: () => currentTime,
    waitMs: async () => {},
  });

  await queue.enqueue({
    effect: { type: "SPEAK", key: "start_cpr", cueId: "start_cpr" },
    stateId: "rcp_2",
  });

  currentTime = 30000;
  currentStateId = "nao_chocavel_ciclo";
  await queue.enqueue({
    effect: { type: "SPEAK", key: "start_cpr", cueId: "start_cpr" },
    stateId: "nao_chocavel_ciclo",
  });

  currentTime = 31000;
  currentStateId = "avaliar_ritmo_nao_chocavel";
  await queue.enqueue({
    effect: { type: "SPEAK", key: "analyze_rhythm", cueId: "analyze_rhythm" },
    stateId: "avaliar_ritmo_nao_chocavel",
  });

  currentTime = 32000;
  await queue.enqueue({
    effect: { type: "SPEAK", key: "analyze_rhythm", cueId: "analyze_rhythm" },
    stateId: "avaliar_ritmo_nao_chocavel",
  });

  currentTime = 33000;
  currentStateId = "choque_2";
  await queue.enqueue({
    effect: { type: "SPEAK", key: "shock_escalated", cueId: "shock_escalated" },
    stateId: "choque_2",
    silent: true,
  });

  currentTime = 150000;
  currentStateId = "rcp_3";
  await queue.enqueue({
    effect: { type: "SPEAK", key: "start_cpr", cueId: "start_cpr" },
    stateId: "rcp_3",
  });

  assert.deepEqual(
    played.map((item) => item.cueId),
    ["start_cpr", "analyze_rhythm", "start_cpr"]
  );
}

async function testSpeechQueueInterruptPolicyRespectsClinicalContext() {
  let currentTime = 0;
  let currentStateId = "rcp_2";
  let outputActive = false;
  const played = [];
  let resolvePlayback = null;
  const queue = speechQueue.createSpeechQueue({
    getCurrentStateId: () => currentStateId,
    isOutputActive: () => outputActive,
    play: async (message, cueId) => {
      outputActive = true;
      played.push({ message, cueId, at: currentTime });
      await new Promise((resolve) => {
        resolvePlayback = () => {
          outputActive = false;
          resolve();
        };
      });
    },
    stop: () => {
      outputActive = false;
      resolvePlayback?.();
      resolvePlayback = null;
    },
    now: () => currentTime,
    waitMs: async () => {},
  });

  void queue.enqueue({
    effect: { type: "SPEAK", key: "antiarrhythmic_now", cueId: "antiarrhythmic_now" },
    stateId: "rcp_3",
  });
  await Promise.resolve();

  currentStateId = "avaliar_ritmo_2";
  currentTime = 1000;
  const preparePromise = queue.enqueue({
    effect: { type: "SPEAK", key: "prepare_rhythm", cueId: "prepare_rhythm" },
    stateId: "avaliar_ritmo_2",
  });

  currentStateId = "choque_2";
  const shockPromise = queue.enqueue({
    effect: { type: "SPEAK", key: "shock_escalated", cueId: "shock_escalated" },
    stateId: "choque_2",
  });

  currentStateId = "confirmacao";
  currentTime = 2000;
  const confirmationPromise = queue.enqueue({
    effect: { type: "SPEAK", key: "confirmacao_manual", message: "Confirmar ação?" },
    stateId: "confirmacao",
  });
  assert.equal(played.some((item) => item.message === "Confirmar ação?"), false);

  resolvePlayback?.();
  resolvePlayback = null;
  await preparePromise;
  await shockPromise;
  await confirmationPromise;
  assert.deepEqual(
    played.map((item) => item.cueId ?? item.message),
    ["antiarrhythmic_now", "prepare_rhythm", "shock_escalated", "Confirmar ação?"]
  );
  assert.equal(played.some((item) => item.message === "Confirmar ação?"), true);
}

async function testSpeechQueueHumanizedDelay() {
  const waits = [];
  const played = [];
  const queue = speechQueue.createSpeechQueue({
    getCurrentStateId: () => "rcp_2",
    isOutputActive: () => false,
    play: async (message, cueId) => {
      played.push({ message, cueId });
    },
    stop: () => {},
    now: () => 1000,
    waitMs: async (ms) => {
      waits.push(ms);
    },
  });

  await queue.enqueue({
    effect: { type: "SPEAK", key: "antiarrhythmic_now", cueId: "antiarrhythmic_now" },
    stateId: "rcp_3",
  });
  await queue.enqueue({
    effect: { type: "SPEAK", key: "shock_escalated", cueId: "shock_escalated" },
    stateId: "choque_2",
  });

  const humanizedWait = waits.find((ms) => ms >= 50 && ms <= 100);
  assert.equal(Boolean(humanizedWait), true);
  assert.equal(played.length, 2);
  assert.equal(played[0].cueId, "antiarrhythmic_now");
  assert.equal(played[1].cueId, "shock_escalated");
}

function testNonShockableToShockableFlowStartsAtFirstShock() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_epinefrina");

  engine.registerExecution("adrenaline");
  engine.next();
  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");

  engine.next("chocavel");
  assert.equal(engine.getCurrentStateId(), "tipo_desfibrilador");
  engine.next("bifasico");
  assert.equal(engine.getCurrentStateId(), "choque_bi_1");
}

function testVoiceIntentMatching() {
  const allowedIntents = [
    "confirm_epinephrine_administered",
    "confirm_rosc",
    "select_shockable_rhythm",
    "select_non_shockable_rhythm",
  ];
  const adrenaline = voiceResolver.resolveAclsVoiceIntent({
    transcript: "adrenalina feita",
    stateId: "rcp_2",
    allowedIntents,
  });
  assert.equal(adrenaline.kind, "matched");
  assert.equal(adrenaline.intent, "confirm_epinephrine_administered");

  const rosc = voiceResolver.resolveAclsVoiceIntent({
    transcript: "tem pulso",
    stateId: "avaliar_ritmo_3",
    allowedIntents,
  });
  assert.equal(rosc.kind, "matched");
  assert.equal(rosc.intent, "confirm_rosc");

  const epi = voiceResolver.resolveAclsVoiceIntent({
    transcript: "epi feita",
    stateId: "rcp_2",
    allowedIntents,
  });
  assert.equal(epi.kind, "matched");
  assert.equal(epi.intent, "confirm_epinephrine_administered");

  const shockable = voiceResolver.resolveAclsVoiceIntent({
    transcript: "ritmo fibrilação ventricular",
    stateId: "avaliar_ritmo",
    allowedIntents,
  });
  assert.equal(shockable.kind, "matched");
  assert.equal(shockable.intent, "select_shockable_rhythm");

  const nonShockable = voiceResolver.resolveAclsVoiceIntent({
    transcript: "ritmo assistolia",
    stateId: "avaliar_ritmo",
    allowedIntents,
  });
  assert.equal(nonShockable.kind, "matched");
  assert.equal(nonShockable.intent, "select_non_shockable_rhythm");
}

function testVoicePolicyRejectsInvalidStateIntent() {
  resetClock();
  engine.resetSession();
  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  assert.equal(engine.getCurrentStateId(), "choque_bi_1");

  const allowed = voicePolicy.getAllowedVoiceIntents({
    stateId: engine.getCurrentStateId(),
    stateType: engine.getCurrentState().type,
    documentationActions: engine.getDocumentationActions(),
    hasReversibleCauses: true,
  });

  assert.equal(allowed.includes("select_non_shockable_rhythm"), false);
  const resolution = voiceResolver.resolveAclsVoiceIntent({
    transcript: "assistolia",
    stateId: engine.getCurrentStateId(),
    allowedIntents: allowed,
  });
  assert.equal(resolution.kind, "unknown");
}

function testVoicePolicyDoesNotExposeStepAdvanceDuringContinuousCpr() {
  const allowed = voicePolicy.getAllowedVoiceIntents({
    stateId: "rcp_1",
    stateType: "action",
    documentationActions: [],
    hasReversibleCauses: true,
  });

  assert.equal(allowed.includes("go_to_next_step"), false);
  assert.equal(allowed.includes("confirm_action"), false);
  assert.equal(allowed.includes("open_reversible_causes"), true);
}

function testVoicePolicyRestrictsInitialRecognitionToConfirmOnly() {
  const allowed = voicePolicy.getAllowedVoiceIntents({
    stateId: "reconhecimento_inicial",
    stateType: "action",
    documentationActions: [],
    hasReversibleCauses: true,
  });

  assert.deepEqual(allowed, ["confirm_action"]);
}

function testVoicePolicyRestrictsInitialCprToConfirmOnly() {
  const allowed = voicePolicy.getAllowedVoiceIntents({
    stateId: "inicio",
    stateType: "action",
    documentationActions: [],
    hasReversibleCauses: true,
  });

  assert.deepEqual(allowed, ["confirm_cpr_started"]);
}

function testVoicePolicyRestrictsShockStatesToShockConfirmationOnly() {
  const allowed = voicePolicy.getAllowedVoiceIntents({
    stateId: "choque_bi_1",
    stateType: "action",
    documentationActions: [{ id: "shock", label: "Registrar choque" }],
    hasReversibleCauses: true,
  });

  assert.deepEqual(allowed, ["confirm_shock_delivered"]);
}

function testVoicePolicyMatchesPulseCheckOptions() {
  resetClock();
  engine.resetSession();
  engine.next();
  assert.equal(engine.getCurrentStateId(), "checar_respiracao_pulso");

  const allowed = voicePolicy.getAllowedVoiceIntents({
    stateId: engine.getCurrentStateId(),
    stateType: engine.getCurrentState().type,
    documentationActions: engine.getDocumentationActions(),
    hasReversibleCauses: false,
  });

  assert.equal(allowed.includes("confirm_no_rosc"), true);
  assert.equal(allowed.includes("confirm_pulse_present"), true);
  assert.equal(allowed.includes("end_current_flow"), true);
}

function testVoicePolicyRespectsQuestionOptions() {
  const allowed = voicePolicy.getAllowedVoiceIntents({
    stateId: "dummy_question",
    stateType: "question",
    documentationActions: [],
    hasReversibleCauses: false,
    stateOptions: {
      sem_pulso: "inicio",
      com_pulso: "monitorizar",
      encerrar: "encerrado",
    },
  });

  assert.ok(allowed.includes("confirm_no_rosc"));
  assert.ok(allowed.includes("confirm_pulse_present"));
  assert.ok(allowed.includes("end_current_flow"));
}

function testVoicePolicySupportsDefibrillatorSelection() {
  const allowed = voicePolicy.getAllowedVoiceIntents({
    stateId: "tipo_desfibrilador",
    stateType: "question",
    documentationActions: [],
    hasReversibleCauses: false,
    stateOptions: {
      bifasico: "choque_bi_1",
      monofasico: "choque_mono_1",
    },
  });

  assert.ok(allowed.includes("select_biphasic_defibrillator"));
  assert.ok(allowed.includes("select_monophasic_defibrillator"));
}

function testVoiceConfirmationPolicy() {
  const allowed = ["confirm_shock_delivered"];
  const resolution = voiceResolver.resolveAclsVoiceIntent({
    transcript: "choque aplicado",
    stateId: "choque_2",
    allowedIntents: allowed,
  });

  assert.equal(resolution.kind, "matched");
  assert.equal(resolution.requiresConfirmation, false);
  assert.equal(voiceRuntime.shouldRequireVoiceConfirmation(resolution), false);
}

function testVoiceSensitiveConfirmationPolicy() {
  const resolution = voiceResolver.resolveAclsVoiceIntent({
    transcript: "tem pulso",
    stateId: "avaliar_ritmo_3",
    allowedIntents: ["confirm_rosc"],
  });

  assert.equal(resolution.kind, "matched");
  assert.equal(voiceRuntime.shouldRequireVoiceConfirmation(resolution), true);
}

function testHighConfidenceRhythmVoiceSelectionDoesNotRequireConfirmation() {
  const shockable = voiceResolver.resolveAclsVoiceIntent({
    transcript: "ritmo chocável",
    stateId: "avaliar_ritmo",
    allowedIntents: ["select_shockable_rhythm"],
  });
  assert.equal(shockable.kind, "matched");
  assert.equal(voiceRuntime.shouldRequireVoiceConfirmation(shockable), false);

  const nonShockable = voiceResolver.resolveAclsVoiceIntent({
    transcript: "ritmo não chocável",
    stateId: "avaliar_ritmo",
    allowedIntents: ["select_non_shockable_rhythm"],
  });
  assert.equal(nonShockable.kind, "matched");
  assert.equal(voiceRuntime.shouldRequireVoiceConfirmation(nonShockable), false);
}

function testVoiceCommandExecutionMapping() {
  resetClock();
  engine.resetSession();
  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_epinefrina");

  const command = voiceRuntime.mapAclsVoiceIntentToCommand({
    intent: "confirm_epinephrine_administered",
    stateId: engine.getCurrentStateId(),
    stateType: engine.getCurrentState().type,
    documentationActions: engine.getDocumentationActions(),
  });

  assert.deepEqual(command, {
    kind: "register_execution",
    actionId: "adrenaline",
    actionTaken: "register_epinephrine",
  });
}

function testVoiceDefibrillatorCommandMapping() {
  const biphasicCommand = voiceRuntime.mapAclsVoiceIntentToCommand({
    intent: "select_biphasic_defibrillator",
    stateId: "tipo_desfibrilador",
    stateType: "question",
    documentationActions: [],
  });

  assert.deepEqual(biphasicCommand, {
    kind: "run_transition",
    input: "bifasico",
    actionTaken: "select_biphasic_defibrillator",
  });

  const monophasicCommand = voiceRuntime.mapAclsVoiceIntentToCommand({
    intent: "select_monophasic_defibrillator",
    stateId: "tipo_desfibrilador",
    stateType: "question",
    documentationActions: [],
  });

  assert.deepEqual(monophasicCommand, {
    kind: "run_transition",
    input: "monofasico",
    actionTaken: "select_monophasic_defibrillator",
  });
}

function testVoiceDefibrillatorIntentMatching() {
  const allowedIntents = [
    "select_biphasic_defibrillator",
    "select_monophasic_defibrillator",
  ];

  const biphasic = voiceResolver.resolveAclsVoiceIntent({
    transcript: "usar bifásico",
    stateId: "tipo_desfibrilador",
    allowedIntents,
  });
  assert.equal(biphasic.kind, "matched");
  assert.equal(biphasic.intent, "select_biphasic_defibrillator");

  const monophasic = voiceResolver.resolveAclsVoiceIntent({
    transcript: "usar monofásico",
    stateId: "tipo_desfibrilador",
    allowedIntents,
  });
  assert.equal(monophasic.kind, "matched");
  assert.equal(monophasic.intent, "select_monophasic_defibrillator");
}

function testVoicePulseCheckCommandMapping() {
  const pulseCommand = voiceRuntime.mapAclsVoiceIntentToCommand({
    intent: "confirm_pulse_present",
    stateId: "checar_respiracao_pulso",
    stateType: "question",
    documentationActions: [],
  });
  const endCommand = voiceRuntime.mapAclsVoiceIntentToCommand({
    intent: "end_current_flow",
    stateId: "checar_respiracao_pulso",
    stateType: "question",
    documentationActions: [],
  });

  assert.deepEqual(pulseCommand, {
    kind: "run_transition",
    input: "com_pulso",
    actionTaken: "confirm_pulse_present",
  });
  assert.deepEqual(endCommand, {
    kind: "run_transition",
    input: "encerrar",
    actionTaken: "end_current_flow",
  });
}

function testVoiceCommandLogging() {
  resetClock();
  engine.resetSession();
  engine.registerVoiceCommandEvent({
    transcript: "choque aplicado",
    intent: "confirm_shock_delivered",
    confidence: 1,
    outcome: "executed",
    actionTaken: "register_shock",
  });

  const timeline = engine.getTimeline();
  const voiceEvent = timeline.find((event) => event.type === "voice_command");
  assert.ok(voiceEvent);
  assert.equal(voiceEvent.details.intent, "confirm_shock_delivered");
  assert.equal(voiceEvent.details.actionTaken, "register_shock");

  const clinicalLog = engine.getClinicalLog();
  assert.match(clinicalLog[0].title, /Comando de voz/);
}

function testVoiceNormalization() {
  assert.equal(
    voiceResolver.normalizeVoiceTranscript("  EPI   feita "),
    "epinefrina feita"
  );
  assert.equal(
    voiceResolver.normalizeVoiceTranscript("FV"),
    "fibrilacao ventricular"
  );
  assert.equal(
    voiceResolver.normalizeVoiceTranscript("continua sem pulso"),
    "sem pulso"
  );
}

function testVoiceLowConfidenceCategory() {
  const resolution = voiceResolver.resolveAclsVoiceIntent({
    transcript: "causas reversiveis abrir",
    stateId: "rcp_2",
    allowedIntents: ["open_reversible_causes"],
  });

  assert.ok(
    resolution.kind === "low_confidence" || resolution.kind === "matched",
    "esperava low_confidence ou matched"
  );
  assert.equal(voiceRuntime.shouldRequireVoiceConfirmation(resolution), true);
}

function testVoiceTelemetrySummary() {
  const timeline = [
    {
      id: "0",
      timestamp: 0,
      type: "voice_command",
      stateId: "rcp_2",
      origin: "user",
      details: {
        outcome: "mode_enabled",
        actionTaken: "voice_mode_on",
        transcript: "",
        confidence: 1,
      },
    },
    {
      id: "1",
      timestamp: 1,
      type: "voice_command",
      stateId: "rcp_2",
      origin: "user",
      details: {
        intent: "confirm_epinephrine_administered",
        outcome: "executed",
        actionTaken: "register_epinephrine",
        transcript: "epinefrina administrada",
        confidence: 1,
      },
    },
    {
      id: "2",
      timestamp: 2,
      type: "voice_command",
      stateId: "avaliar_ritmo_3",
      origin: "user",
      details: {
        intent: "confirm_rosc",
        outcome: "confirmation_requested",
        actionTaken: "confirm_rosc",
        transcript: "tem pulso",
        confidence: 1,
      },
    },
    {
      id: "3",
      timestamp: 3,
      type: "voice_command",
      stateId: "avaliar_ritmo_3",
      origin: "user",
      details: {
        intent: "confirm_rosc",
        outcome: "confirmation_expired",
        actionTaken: "confirm_rosc",
        transcript: "tem pulso",
        confidence: 1,
        errorCategory: "confirmation_timeout",
      },
    },
    {
      id: "4",
      timestamp: 4,
      type: "voice_command",
      stateId: "choque_2",
      origin: "user",
      details: {
        outcome: "unknown",
        actionTaken: "none",
        transcript: "alguma coisa",
        confidence: 0,
        errorCategory: "unknown",
      },
    },
    {
      id: "5",
      timestamp: 10,
      type: "voice_command",
      stateId: "choque_2",
      origin: "user",
      details: {
        outcome: "mode_disabled",
        actionTaken: "voice_mode_off",
        transcript: "",
        confidence: 1,
      },
    },
  ];

  const telemetry = voiceTelemetry.deriveVoiceTelemetryFromTimeline(timeline);
  assert.equal(telemetry.totalCommands, 4);
  assert.equal(telemetry.acceptedCount, 1);
  assert.equal(telemetry.rejectedCount, 1);
  assert.equal(telemetry.confirmationRequestedCount, 1);
  assert.equal(telemetry.confirmationExpiredCount, 1);
  assert.equal(telemetry.topUsedIntents[0].intent, "confirm_rosc");
  assert.equal(telemetry.topTimeoutIntents[0].intent, "confirm_rosc");
  assert.deepEqual(telemetry.unknownTranscripts, ["alguma coisa"]);
  assert.equal(telemetry.modeEnabledCount, 1);
  assert.equal(telemetry.modeDisabledCount, 1);
  assert.equal(telemetry.modeActiveDurationMs, 10);
  assert.equal(telemetry.handsFreeActionCount, 1);

  const summary = voiceTelemetry.summarizeVoiceTelemetryForCase(telemetry);
  assert.match(summary.headline[0], /4 comandos de voz/);
  assert.equal(summary.primaryFriction, "timeout frequente em confirm_rosc");
}

function testVoiceContinuousModeToggle() {
  const initial = voiceRuntime.createAclsVoiceRuntimeState();
  const enabled = voiceRuntime.enableVoiceMode(initial);
  const disabled = voiceRuntime.disableVoiceMode(enabled);

  assert.equal(initial.modeEnabled, false);
  assert.equal(enabled.modeEnabled, true);
  assert.equal(enabled.feedback, "Modo voz ativo.");
  assert.equal(disabled.modeEnabled, false);
  assert.equal(disabled.status, "idle");
}

function testVoiceGenericConfirmWorksInRestrictedStates() {
  const recognition = voiceResolver.resolveAclsVoiceIntent({
    transcript: "confirmar",
    stateId: "reconhecimento_inicial",
    allowedIntents: ["confirm_action"],
  });
  assert.equal(recognition.kind, "matched");
  assert.equal(recognition.intent, "confirm_action");

  const cprStart = voiceResolver.resolveAclsVoiceIntent({
    transcript: "confirmar",
    stateId: "inicio",
    allowedIntents: ["confirm_cpr_started"],
  });
  assert.equal(cprStart.kind, "matched");
  assert.equal(cprStart.intent, "confirm_cpr_started");

  const shock = voiceResolver.resolveAclsVoiceIntent({
    transcript: "confirmar",
    stateId: "choque_bi_1",
    allowedIntents: ["confirm_shock_delivered"],
  });
  assert.equal(shock.kind, "matched");
  assert.equal(shock.intent, "confirm_shock_delivered");
}

function testVoiceModePersistsAfterExecution() {
  const enabled = voiceRuntime.enableVoiceMode(voiceRuntime.createAclsVoiceRuntimeState());
  const executed = voiceRuntime.markVoiceExecuted(enabled, "epinefrina administrada");

  assert.equal(executed.modeEnabled, true);
  assert.equal(executed.status, "executed");
}

function testVoicePolicyRecalculatesAfterStateChange() {
  resetClock();
  engine.resetSession();
  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");

  const firstStateAllowed = voicePolicy.getAllowedVoiceIntents({
    stateId: engine.getCurrentStateId(),
    stateType: engine.getCurrentState().type,
    documentationActions: engine.getDocumentationActions(),
    hasReversibleCauses: true,
  });

  engine.registerExecution("shock");
  engine.next();

  const secondStateAllowed = voicePolicy.getAllowedVoiceIntents({
    stateId: engine.getCurrentStateId(),
    stateType: engine.getCurrentState().type,
    documentationActions: engine.getDocumentationActions(),
    hasReversibleCauses: true,
  });

  assert.equal(firstStateAllowed.includes("confirm_shock_delivered"), true);
  assert.equal(firstStateAllowed.includes("confirm_epinephrine_administered"), false);
  assert.equal(secondStateAllowed.includes("confirm_shock_delivered"), false);
  assert.equal(secondStateAllowed.includes("go_to_next_step"), true);
}

function testVoicePendingConfirmationCreated() {
  const state = voiceRuntime.createAclsVoiceRuntimeState([
    { intent: "confirm_pending_voice_action", label: "confirmar" },
  ]);
  const pending = voiceRuntime.createPendingVoiceConfirmation(state, {
    transcript: "choque aplicado",
    resolution: {
      kind: "matched",
      transcript: "choque aplicado",
      normalizedTranscript: "choque aplicado",
      stateId: "choque_2",
      intent: "confirm_shock_delivered",
      confidence: 1,
      requiresConfirmation: true,
      matchedPhrase: "choque aplicado",
    },
    command: {
      kind: "register_execution",
      actionId: "shock",
      actionTaken: "register_shock",
    },
    expiresAt: 8000,
    prompt: "Confirmar choque aplicado?",
    hints: [
      { intent: "confirm_pending_voice_action", label: "confirmar" },
      { intent: "cancel_pending_voice_action", label: "cancelar" },
    ],
  });

  assert.equal(pending.status, "pending_confirmation");
  assert.equal(pending.pendingConfirmation.intent, "confirm_shock_delivered");
  assert.equal(pending.hints.map((hint) => hint.label).join("|"), "confirmar|cancelar");
}

function testVoicePendingConfirmationCancelled() {
  const state = voiceRuntime.markVoiceCancelled(
    voiceRuntime.createAclsVoiceRuntimeState(),
    "Comando cancelado."
  );
  assert.equal(state.status, "cancelled");
  assert.equal(state.feedback, "Comando cancelado.");
}

function testVoicePendingConfirmationTimeout() {
  const pending = voiceRuntime.createPendingVoiceConfirmation(
    voiceRuntime.createAclsVoiceRuntimeState(),
    {
      transcript: "ritmo chocável",
      resolution: {
        kind: "matched",
        transcript: "ritmo chocável",
        normalizedTranscript: "ritmo chocavel",
        stateId: "avaliar_ritmo_2",
        intent: "select_shockable_rhythm",
        confidence: 1,
        requiresConfirmation: true,
        matchedPhrase: "ritmo chocável",
      },
      command: {
        kind: "run_transition",
        input: "chocavel",
        actionTaken: "select_shockable_rhythm",
      },
      expiresAt: 5000,
      prompt: "Confirmar ritmo chocável?",
      hints: [
        { intent: "confirm_pending_voice_action", label: "confirmar" },
        { intent: "cancel_pending_voice_action", label: "cancelar" },
      ],
    }
  );

  assert.equal(voiceRuntime.isVoiceConfirmationExpired(pending, 5001), true);
  const timedOut = voiceRuntime.markVoiceTimeout(pending);
  assert.equal(timedOut.status, "timeout");
}

function testVoiceCommandHintsPanel() {
  const hints = voicePolicy.buildVoiceCommandHints(
    ["confirm_epinephrine_administered", "repeat_instruction", "open_reversible_causes"],
    4
  );
  assert.deepEqual(hints.map((hint) => hint.label), [
    "epinefrina administrada",
    "abrir causas reversíveis",
    "repetir",
  ]);
}

function testVoiceCommandHintsPendingPanel() {
  const hints = voicePolicy.buildVoiceCommandHints(
    ["confirm_pending_voice_action", "cancel_pending_voice_action"],
    2
  );
  assert.deepEqual(hints.map((hint) => hint.label), ["confirmar", "cancelar"]);
}

function testLowRiskVoiceCommandDoesNotRequireConfirmation() {
  const resolution = voiceResolver.resolveAclsVoiceIntent({
    transcript: "repetir",
    stateId: "rcp_2",
    allowedIntents: ["repeat_instruction"],
  });

  assert.equal(resolution.kind, "matched");
  assert.equal(resolution.requiresConfirmation, false);
  assert.equal(voiceRuntime.shouldRequireVoiceConfirmation(resolution), false);
}

function testLowConfidenceVoiceCommandRequiresConfirmation() {
  const resolution = voiceResolver.resolveAclsVoiceIntent({
    transcript: "causas reversiveis abrir",
    stateId: "rcp_2",
    allowedIntents: ["open_reversible_causes"],
  });

  assert.ok(
    resolution.kind === "low_confidence" || resolution.kind === "matched",
    "esperava low_confidence ou matched"
  );
  assert.equal(voiceRuntime.shouldRequireVoiceConfirmation(resolution), true);
}

function testWebVoiceAdapterCompatibility() {
  const originalWindow = global.window;

  class FakeRecognition {
    start() {}
    stop() {}
  }

  global.window = {
    SpeechRecognition: FakeRecognition,
  };

  const provider = webVoiceProvider.createWebVoiceCaptureProvider();
  assert.equal(provider.isAvailable(), true);
  assert.equal(
    typeof webVoiceProvider.getWebSpeechRecognitionConstructor(),
    "function"
  );

  global.window = originalWindow;
}

async function testVoiceSessionControllerHalfDuplexTurn() {
  const events = [];
  const runtimeStates = [];
  const executed = [];
  const captureQueue = [{ kind: "transcript", transcript: "sem pulso" }];
  const context = {
    stateId: "checar_respiracao_pulso",
    stateType: "question",
    documentationActions: [],
    allowedIntents: ["confirm_no_rosc"],
    baseHints: [{ intent: "confirm_no_rosc", label: "sem pulso" }],
    pendingConfirmationHints: [
      { intent: "confirm_pending_voice_action", label: "confirmar" },
      { intent: "cancel_pending_voice_action", label: "cancelar" },
    ],
    presentationMessage: "Checar pulso e respiracao",
    presentationCueId: "checar_respiracao_pulso",
  };

  const provider = {
    id: "fake",
    isAvailable: () => true,
    stop: () => {
      events.push("provider:stop");
    },
    captureOnce: async (options) => {
      events.push("listening:start");
      options.onStart?.();
      options.onEnd?.();
      return captureQueue.shift() ?? { kind: "error", error: "no_speech", message: "none" };
    },
  };

  const controller = voiceSessionController.createAclsVoiceSessionController({
    provider,
    getContext: () => context,
    onRuntimeStateChange: (state) => runtimeStates.push(state.status),
    onVoiceEvent: () => {},
    onExecuteCommand: async (command) => {
      executed.push(command.actionTaken);
      context.stateId = "inicio";
      context.stateType = "action";
      context.allowedIntents = [];
      context.baseHints = [];
      context.presentationMessage = "Iniciar reanimacao";
      context.presentationCueId = "inicio";
      return "state_changed";
    },
    playOutput: async () => {
      events.push("audio:play");
    },
    stopOutput: () => {
      events.push("audio:stop");
    },
    isOutputActive: () => false,
    waitMs: async () => {},
  });

  controller.enableMode();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(events.includes("audio:play"), true);
  assert.equal(events.includes("listening:start"), true);
  assert.ok(events.indexOf("audio:play") < events.indexOf("listening:start"));
  assert.equal(executed[0], "confirm_no_rosc");
  assert.equal(runtimeStates.includes("listening"), true);
  controller.disableMode();
  controller.dispose();
}

async function testVoiceSessionControllerDiscardsStaleTranscript() {
  const debugEvents = [];
  const context = {
    stateId: "checar_respiracao_pulso",
    stateType: "question",
    documentationActions: [],
    allowedIntents: ["confirm_no_rosc"],
    baseHints: [{ intent: "confirm_no_rosc", label: "sem pulso" }],
    pendingConfirmationHints: [
      { intent: "confirm_pending_voice_action", label: "confirmar" },
      { intent: "cancel_pending_voice_action", label: "cancelar" },
    ],
    presentationMessage: "Checar pulso e respiracao",
    presentationCueId: "checar_respiracao_pulso",
  };
  let releaseTranscript;
  const transcriptPromise = new Promise((resolve) => {
    releaseTranscript = resolve;
  });
  const provider = {
    id: "fake",
    isAvailable: () => true,
    stop: () => {},
    captureOnce: async (options) => {
      options.onStart?.();
      await transcriptPromise;
      options.onEnd?.();
      return { kind: "transcript", transcript: "sem pulso" };
    },
  };
  let executed = 0;
  const controller = voiceSessionController.createAclsVoiceSessionController({
    provider,
    getContext: () => context,
    onRuntimeStateChange: () => {},
    onVoiceEvent: () => {},
    onExecuteCommand: async () => {
      executed += 1;
      return "same_state";
    },
    playOutput: async () => {},
    stopOutput: () => {},
    isOutputActive: () => false,
    waitMs: async () => {},
    debug: (event) => debugEvents.push(event),
  });

  controller.enableMode();
  await new Promise((resolve) => setTimeout(resolve, 0));
  context.stateId = "inicio";
  context.stateType = "action";
  context.allowedIntents = [];
  context.baseHints = [];
  context.presentationMessage = "Iniciar reanimacao";
  context.presentationCueId = "inicio";
  await controller.syncTurn();
  releaseTranscript();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(executed, 0);
  assert.equal(debugEvents.includes("transcript_discarded"), true);
  controller.disableMode();
  controller.dispose();
}

async function testVoiceSessionControllerManualStateOrientation() {
  const played = [];
  const context = {
    stateId: "inicio",
    stateType: "action",
    documentationActions: [],
    allowedIntents: [],
    baseHints: [],
    pendingConfirmationHints: [],
    presentationMessage: "Iniciar reanimacao",
    presentationCueId: "inicio",
  };
  const controller = voiceSessionController.createAclsVoiceSessionController({
    provider: {
      id: "fake",
      isAvailable: () => true,
      stop: () => {},
      captureOnce: async () => ({ kind: "error", error: "no_speech", message: "none" }),
    },
    getContext: () => context,
    onRuntimeStateChange: () => {},
    onVoiceEvent: () => {},
    onExecuteCommand: async () => "same_state",
    playOutput: async (message, cueId) => {
      played.push(`${cueId}:${message}`);
    },
    stopOutput: () => {},
    isOutputActive: () => false,
    waitMs: async () => {},
  });

  await controller.syncTurn();
  context.stateId = "avaliar_ritmo";
  context.presentationMessage = "Avaliar ritmo";
  context.presentationCueId = "avaliar_ritmo";
  await controller.syncTurn();

  assert.deepEqual(played, [
    "inicio:Iniciar reanimacao",
    "avaliar_ritmo:Avaliar ritmo",
  ]);
  controller.dispose();
}

function testAdrenalineReminderDoesNotRepeatWithoutAdministration() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_epinefrina");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  engine.consumeEffects();
  engine.next();
  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_hs_ts");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  engine.next();
  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");

  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_hs_ts");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["adrenaline"]);
}

function testNonShockableEpinephrineRepeatsOnlyOnDueWindowAcrossManyCycles() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  advance(30000);
  engine.next("nao_chocavel");
  engine.registerExecution("adrenaline");
  engine.next();

  advance(90000);
  engine.tick();
  engine.next("nao_chocavel");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");
  engine.next("nao_chocavel");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  advance(29999);
  engine.tick();
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  advance(1);
  engine.tick();
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 2);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), ["adrenaline"]);
  engine.registerExecution("adrenaline");

  advance(90000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");
  engine.next("nao_chocavel");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 2);

  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");
  engine.next("nao_chocavel");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 2);

  advance(29999);
  engine.tick();
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 2);

  advance(1);
  engine.tick();
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 3);
}

function testNonShockableEpinephrineRequiresTwoFullCyclesAfterAdministration() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_epinefrina");

  engine.registerExecution("adrenaline");
  assert.equal(engine.getMedicationSnapshot().adrenaline.lastAdministeredCycleCount, 0);

  engine.next();
  advance(120000);
  engine.tick();
  engine.next("nao_chocavel");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  advance(120000);
  engine.tick();
  engine.next("nao_chocavel");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 2);
}

function testShockableToNonShockableAtSecondRhythmCheckTriggersFirstEpinephrineOnlyOnce() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();

  advance(120000);
  engine.tick();
  engine.next("nao_chocavel");

  assert.equal(engine.getCurrentStateId(), "nao_chocavel_epinefrina");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.equal(engine.getEncounterSummary().adrenalineAdministeredCount, 0);
}

function testShockableToNonShockableAfterEpinephrineDoesNotCreateImmediateSecondDose() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();

  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();
  assert.equal(engine.getCurrentStateId(), "rcp_2");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  engine.registerExecution("adrenaline");
  assert.equal(engine.getEncounterSummary().adrenalineAdministeredCount, 1);

  advance(120000);
  engine.tick();
  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_hs_ts");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);

  engine.next();
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_ciclo");
  assert.equal(engine.getEncounterSummary().adrenalineSuggestedCount, 1);
  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), []);
}

function testEngineInvariants() {
  resetClock();
  engine.resetSession();

  assert.equal(engine.getDocumentationActions().some((item) => item.id === "shock"), false);

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_epinefrina");
  assert.equal(engine.getDocumentationActions().some((item) => item.id === "shock"), false);

  const meds = engine.getMedicationSnapshot();
  assert.equal(meds.adrenaline.pendingConfirmation, true);
  assert.equal(meds.antiarrhythmic.pendingConfirmation, false);
  assert.equal(engine.getOperationalMetrics().cyclesCompleted, 0);

  engine.next();
  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");
  assert.equal(engine.getOperationalMetrics().cyclesCompleted, 1);
}

function testPresentationModes() {
  const input = {
    mode: "training",
    clinicalIntent: "give_epinephrine",
    clinicalIntentConfidence: "high",
    stateId: "rcp_2",
    type: "action",
    state: {
      type: "action",
      text: "RCP por 2 minutos",
      speak: "Retomar RCP por dois minutos",
      details: [
        "Manter compressões de alta qualidade",
        "Administrar epinefrina",
        "Considerar via aérea avançada",
        "Tratar causas reversíveis",
      ],
    },
    cueId: "rcp_2",
    documentationActions: [{ id: "adrenaline", label: "Registrar epinefrina administrada" }],
    activeTimer: { duration: 120, remaining: 90 },
    medications: {
      adrenaline: {
        id: "adrenaline",
        status: "due_now",
        recommendedCount: 1,
        administeredCount: 0,
        pendingConfirmation: true,
        eligible: true,
      },
      antiarrhythmic: {
        id: "antiarrhythmic",
        status: "idle",
        recommendedCount: 0,
        administeredCount: 0,
        pendingConfirmation: false,
        eligible: false,
      },
    },
  };

  const training = presentation.deriveAclsPresentation(input);

  const code = presentation.deriveAclsPresentation({
    ...input,
    mode: "code",
  });

  assert.equal(training.banner.title, "Epinefrina Agora");
  assert.equal(training.clinicalIntent, "give_epinephrine");
  assert.equal(training.clinicalIntentConfidence, "high");
  assert.equal(training.speak, "Dar epinefrina, um miligrama");
  assert.equal(training.cueId, "epinephrine_now");
  assert.equal(code.details.length, 3);
  assert.equal(training.details.length, 4);
}

function testPresentationPrioritizesCprOverDrugPrompts() {
  const input = {
    mode: "training",
    clinicalIntent: "perform_cpr",
    clinicalIntentConfidence: "medium",
    stateId: "rcp_2",
    state: {
      type: "action",
      text: "RCP por 2 minutos",
      speak: "Retomar RCP por dois minutos",
      details: [
        "Manter compressões de alta qualidade",
        "Administrar epinefrina",
        "Considerar via aérea avançada",
        "Tratar causas reversíveis",
      ],
    },
    cueId: "rcp_2",
    documentationActions: [{ id: "adrenaline", label: "Registrar epinefrina administrada" }],
    activeTimer: { duration: 120, remaining: 90 },
    medications: {
      adrenaline: {
        id: "adrenaline",
        status: "due_now",
        recommendedCount: 1,
        administeredCount: 0,
        pendingConfirmation: true,
        eligible: true,
      },
      antiarrhythmic: {
        id: "antiarrhythmic",
        status: "idle",
        recommendedCount: 0,
        administeredCount: 0,
        pendingConfirmation: false,
        eligible: false,
      },
    },
  };

  const training = presentation.deriveAclsPresentation(input);
  const model = screenModel.buildAclsScreenModel({
    mode: "training",
    state: input.state,
    stateId: input.stateId,
    presentation: training,
    timers: [{ duration: 120, remaining: 90 }],
    documentationActions: input.documentationActions,
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:02",
      currentStateId: "rcp_2",
      currentStateText: "RCP por 2 minutos",
      shockCount: 2,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 0,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    operationalMetrics: {
      cyclesCompleted: 1,
      nextAdrenalineDueInMs: 90000,
    },
  });

  assert.equal(training.banner.title, "Manter RCP");
  assert.equal(training.banner.detail, "Comprimir até ritmo.");
  assert.equal(training.speak, "Iniciar reanimação cardiopulmonar");
  assert.equal(training.cueId, "start_cpr");
  assert.equal(
    training.details.some((detail) => /epinefrina/i.test(detail)),
    false
  );
  assert.equal(model.primaryActionType, "confirm_state");
  assert.equal(model.primaryDocumentationActionId, undefined);
  assert.equal(model.primaryActionLabel, "RCP por 2 minutos");
  assert.equal(model.showDocumentationActions, true);
}

function testNonShockableCprDoesNotRepeatEpinephrineAudioAfterAdministration() {
  const input = {
    mode: "training",
    clinicalIntent: "perform_cpr",
    clinicalIntentConfidence: "medium",
    stateId: "nao_chocavel_ciclo",
    state: {
      type: "action",
      text: "RCP por 2 minutos",
      speak: "Retomar RCP por dois minutos",
      details: [
        "Manter compressões de alta qualidade",
        "Tratar causas reversíveis",
      ],
    },
    cueId: "nao_chocavel_ciclo",
    documentationActions: [],
    activeTimer: { duration: 120, remaining: 113 },
    medications: {
      adrenaline: {
        id: "adrenaline",
        status: "administered",
        recommendedCount: 1,
        administeredCount: 1,
        pendingConfirmation: false,
        eligible: true,
        nextDueAt: 214000,
      },
      antiarrhythmic: {
        id: "antiarrhythmic",
        status: "idle",
        recommendedCount: 0,
        administeredCount: 0,
        pendingConfirmation: false,
        eligible: false,
      },
    },
  };

  const training = presentation.deriveAclsPresentation(input);

  assert.equal(training.cueId, "start_cpr");
  assert.equal(training.speak, "Iniciar reanimação cardiopulmonar");
}

function testClinicalIntentDerivesFromState() {
  resetClock();
  engine.resetSession();

  assert.equal(engine.getClinicalIntent(), "assess_patient");
  assert.equal(engine.getClinicalIntentConfidence(), "low");
  engine.next();
  engine.next("sem_pulso");
  engine.next();
  assert.equal(engine.getClinicalIntent(), "analyze_rhythm");
  assert.equal(engine.getClinicalIntentConfidence(), "high");

  engine.next("nao_chocavel");
  assert.equal(engine.getClinicalIntent(), "perform_cpr");
  assert.equal(engine.getClinicalIntentConfidence(), "medium");
  assert.equal(
    engine.getDocumentationActions().some((action) => action.id === "adrenaline"),
    true
  );

  engine.registerExecution("adrenaline");
  assert.equal(engine.getClinicalIntent(), "perform_cpr");
  assert.equal(engine.getClinicalIntentConfidence(), "medium");

  engine.next();
  advance(120000);
  engine.tick();
  assert.equal(engine.getClinicalIntent(), "analyze_rhythm");
  assert.equal(engine.getClinicalIntentConfidence(), "high");
}

function testCyclePreCueEmitsOnceBeforeRhythmCheck() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  engine.consumeEffects();

  advance(110000);
  engine.tick();
  const firstEffects = engine.consumeEffects();
  assert.equal(
    firstEffects.some(
      (effect) =>
        effect.type === "play_audio_cue" &&
        effect.message === "prepare_rhythm" &&
        effect.suppressStateSpeech !== true
    ),
    true
  );

  advance(10000);
  engine.tick();
  const secondEffects = engine.consumeEffects();
  assert.equal(
    secondEffects.some(
      (effect) => effect.type === "play_audio_cue" && effect.message === "prepare_rhythm"
    ),
    false
  );
}

function testShockPreCueSuppressesStateOrientation() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  const effectsAfterRhythm = engine.consumeEffects();
  assert.equal(effectsAfterRhythm.length > 0, true);

  engine.next("bifasico");
  const effects = engine.consumeEffects();
  assert.equal(
    effects.some(
      (effect) =>
        effect.type === "play_audio_cue" &&
        effect.message === "prepare_shock" &&
        effect.suppressStateSpeech === true
    ),
    true
  );
}

function testPreCueCancellationAfterStateChange() {
  resetClock();
  const instance = orchestrator.createAclsOrchestrator();

  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "question_answered", at: 0, input: "sem_pulso" });
  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "question_answered", at: 0, input: "nao_chocavel" });
  instance.consumeEffects();

  const timerId = instance.getState().timers[0]?.id;
  assert.equal(typeof timerId, "string");

  instance.dispatch({ type: "timer_elapsed", at: 120000, timerId });
  instance.consumeEffects();

  instance.dispatch({
    type: "pre_cue_due",
    at: 120001,
    kind: "prepare_rhythm",
    source: "time",
    timerId,
  });
  const staleEffects = instance.consumeEffects();
  assert.equal(
    staleEffects.some(
      (effect) => effect.type === "play_audio_cue" && effect.message === "prepare_rhythm"
    ),
    false
  );
}

function testIrrelevantPreCueDoesNotCreateNoise() {
  resetClock();
  const instance = orchestrator.createAclsOrchestrator();

  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "question_answered", at: 0, input: "sem_pulso" });
  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.consumeEffects();

  instance.dispatch({
    type: "pre_cue_due",
    at: 1000,
    kind: "prepare_rhythm",
    source: "action",
  });
  const effects = instance.consumeEffects();
  assert.equal(
    effects.some((effect) => effect.type === "play_audio_cue"),
    false
  );
}

function testScreenModelIntegration() {
  const model = screenModel.buildAclsScreenModel({
    mode: "code",
    state: {
      type: "action",
      text: "Aplicar choque",
      details: ["Aplicar choque agora", "Retomar RCP imediatamente"],
    },
    stateId: "choque_2",
    presentation: {
      mode: "code",
      clinicalIntent: "deliver_shock",
      clinicalIntentConfidence: "high",
      title: "Aplicar choque",
      instruction: "Aplicar choque",
      speak: "Aplicar choque agora",
      cueId: "choque_2_bifasico",
      banner: {
        priority: "critical_now",
        title: "Choque Agora",
        detail: "Aplicar desfibrilação e retomar RCP imediatamente.",
      },
      details: ["Aplicar choque agora", "Retomar RCP imediatamente"],
      conciseDetails: ["Aplicar choque agora", "Retomar RCP imediatamente"],
    },
    timers: [{ duration: 120, remaining: 98 }],
    documentationActions: [{ id: "shock", label: "Registrar choque aplicado" }],
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:02",
      currentStateId: "choque_2",
      currentStateText: "Aplicar choque",
      shockCount: 1,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 1,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    operationalMetrics: {
      cyclesCompleted: 1,
      nextAdrenalineDueInMs: 121000,
    },
  });

  assert.equal(model.title, "Aplicar choque");
  assert.equal(model.bannerTitle, "Choque Agora");
  assert.equal(model.bannerPriority, "critical_now");
  assert.equal(model.timerVisible, true);
  assert.equal(model.timerRemaining, 98);
  assert.equal(model.clinicalIntent, "deliver_shock");
  assert.equal(model.clinicalIntentConfidence, "high");
  assert.equal(model.showDocumentationActions, false);
  assert.equal(model.primaryActionType, "documentation");
  assert.equal(model.primaryDocumentationActionId, "shock");
  assert.equal(model.primaryActionLabel, "Registrar choque aplicado");
  assert.equal(model.nextAdrenalineLabel, "121s");
  assert.match(model.priorityConsistencyKey, /Choque Agora/);
  assert.match(model.priorityConsistencyKey, /high/);
}

function testTimerExpiresWithPendingAction() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  advance(120000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_2_preparo");
  assert.equal(engine.getDocumentationActions().length, 0);
}

function testTrainingAdvanceCycleUpdatesEncounterDuration() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();

  assert.equal(engine.getCurrentStateId(), "rcp_1");
  assert.equal(engine.getEncounterSummary().durationLabel, "00:00");

  engine.advanceTrainingCycle();

  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_2_preparo");
  assert.equal(engine.getEncounterSummary().durationLabel, "02:00");
}

function testLateMedicationConfirmationKeepsEngineStable() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("nao_chocavel");
  engine.next();
  advance(4 * 60 * 1000);
  engine.tick();
  assert.equal(engine.getMedicationSnapshot().adrenaline.pendingConfirmation, true);
  engine.registerExecution("adrenaline");
  assert.equal(engine.getMedicationSnapshot().adrenaline.administeredCount, 1);
  assert.equal(engine.getCurrentStateId(), "avaliar_ritmo_nao_chocavel_preparo");
}

function testParallelDocumentationActionsRemainVisibleUntilEachIsConfirmed() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();
  engine.registerExecution("adrenaline");
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  engine.registerExecution("shock");
  engine.next();

  assert.deepEqual(
    engine.getDocumentationActions().map((item) => item.id),
    ["antiarrhythmic"]
  );

  engine.registerExecution("antiarrhythmic");

  assert.deepEqual(engine.getDocumentationActions().map((item) => item.id), []);

  const antiarrhythmicEvent = engine
    .getTimeline()
    .find((event) => event.type === "medication_administered" && event.details?.medicationId === "antiarrhythmic");
  assert.equal(
    antiarrhythmicEvent.details?.doseLabel,
    "Amiodarona 300 mg IV/IO ou lidocaína 1 a 1,5 mg/kg IV/IO"
  );
}

function testAdvancedAirwayRegistrationIsTracked() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("nao_chocavel");

  assert.equal(engine.getDocumentationActions().some((item) => item.id === "advanced_airway"), false);

  engine.registerExecution("advanced_airway");

  assert.equal(engine.getDocumentationActions().some((item) => item.id === "advanced_airway"), false);

  const airwayEvent = engine
    .getTimeline()
    .find((event) => event.type === "advanced_airway_secured");
  assert.ok(airwayEvent);
  assert.equal(engine.getEncounterSummary().advancedAirwaySecured, true);
}

function testShockableToNonShockableBranchChange() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("bifasico");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("nao_chocavel");
  assert.equal(engine.getCurrentStateId(), "nao_chocavel_epinefrina");
}

function testRoscWithPendingReminderDoesNotLeakAlarm() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("nao_chocavel");
  assert.equal(engine.getMedicationSnapshot().adrenaline.pendingConfirmation, true);
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("rosc");
  assert.equal(engine.getCurrentStateId(), "pos_rosc");
  engine.consumeEffects();
  advance(10 * 60 * 1000);
  engine.tick();
  assert.equal(engine.consumeEffects().some((effect) => effect.type === "alert"), false);
}

function testDefibrillatorTypeChangeDuringFlow() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.next("chocavel");
  engine.next("monofasico");
  assert.equal(engine.getCurrentCueId(), "shock_monophasic_initial");
  engine.registerExecution("shock");
  engine.next();
  engine.next();
  advance(120000);
  engine.tick();
  engine.next("chocavel");
  assert.equal(engine.getCurrentCueId(), "shock_escalated");
}

function testOutOfOrderEventDoesNotBreakEngine() {
  resetClock();
  engine.resetSession();

  assert.throws(() => engine.registerExecution("adrenaline"), /Registro não disponível/);
  assert.equal(engine.getCurrentStateId(), "reconhecimento_inicial");
}

function testStaleTimerAndRepeatedTimerEventsDoNotCorruptState() {
  resetClock();
  const instance = orchestrator.createAclsOrchestrator();

  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "question_answered", at: 0, input: "sem_pulso" });
  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "question_answered", at: 0, input: "chocavel" });
  instance.dispatch({ type: "question_answered", at: 0, input: "bifasico" });
  instance.dispatch({ type: "execution_recorded", at: 0, actionId: "shock" });
  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.dispatch({ type: "action_confirmed", at: 0 });
  instance.consumeEffects();

  const activeTimerId = instance.getState().timers[0]?.id;
  assert.equal(typeof activeTimerId, "string");

  instance.dispatch({ type: "timer_elapsed", at: 120000, timerId: activeTimerId });
  const afterFirstElapsed = snapshotAclsOrchestrator(instance);

  assert.equal(afterFirstElapsed.currentStateId, "avaliar_ritmo_2_preparo");
  assert.equal(afterFirstElapsed.cycleCount, 1);

  instance.dispatch({ type: "timer_elapsed", at: 120000, timerId: activeTimerId });
  const afterDuplicateElapsed = snapshotAclsOrchestrator(instance);

  assert.deepEqual(afterDuplicateElapsed, {
    ...afterFirstElapsed,
    effects: [],
  });

  instance.dispatch({ type: "timer_elapsed", at: 120000, timerId: "timer:stale:0" });
  const afterStaleElapsed = snapshotAclsOrchestrator(instance);

  assert.deepEqual(afterStaleElapsed, {
    ...afterDuplicateElapsed,
    effects: [],
  });
}

function testRapidRepeatedInputsAreRejectedWithoutStateCorruption() {
  resetClock();
  const instance = orchestrator.createAclsOrchestrator();

  instance.dispatch({ type: "action_confirmed", at: 0 });
  const beforeAnswer = snapshotAclsOrchestrator(instance);

  instance.dispatch({ type: "question_answered", at: 0, input: "sem_pulso" });
  const afterFirstAnswer = snapshotAclsOrchestrator(instance);

  assert.equal(afterFirstAnswer.currentStateId, "inicio");

  assert.throws(
    () => instance.dispatch({ type: "question_answered", at: 0, input: "sem_pulso" }),
    /Resposta inválida para o estado atual/
  );

  const afterRepeatedAnswer = snapshotAclsOrchestrator(instance);

  assert.equal(beforeAnswer.currentStateId, "checar_respiracao_pulso");
  assert.deepEqual(afterRepeatedAnswer, {
    ...afterFirstAnswer,
    effects: [],
  });
}

function testSameTimestampBurstRemainsDeterministicAndConsistent() {
  function runBurstScenario() {
    resetClock();
    const instance = orchestrator.createAclsOrchestrator();

    instance.dispatch({ type: "action_confirmed", at: 0 });
    instance.dispatch({ type: "question_answered", at: 0, input: "sem_pulso" });
    instance.dispatch({ type: "action_confirmed", at: 0 });
    instance.dispatch({ type: "question_answered", at: 0, input: "nao_chocavel" });
    instance.dispatch({ type: "execution_recorded", at: 0, actionId: "adrenaline" });
    instance.dispatch({ type: "action_confirmed", at: 0 });

    const timerId = instance.getState().timers[0]?.id;
    instance.dispatch({ type: "medication_reminder_due", at: 240000, medicationId: "adrenaline" });
    if (timerId) {
      instance.dispatch({ type: "timer_elapsed", at: 240000, timerId });
      instance.dispatch({ type: "timer_elapsed", at: 240000, timerId });
    }

    return snapshotAclsOrchestrator(instance);
  }

  const first = runBurstScenario();
  const second = runBurstScenario();

  assert.deepEqual(second, first);
  assert.equal(first.currentStateId, "avaliar_ritmo_nao_chocavel_preparo");
  assert.equal(first.cycleCount, 1);
  assert.equal(first.medicationSnapshot.adrenaline.recommendedCount, 2);
  assert.equal(first.medicationSnapshot.adrenaline.administeredCount, 1);
}

function testTerminalStateDoesNotAutoAdvance() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("encerrar");
  assert.equal(engine.getCurrentStateId(), "encerrado");
  advance(10 * 60 * 1000);
  engine.tick();
  assert.equal(engine.getCurrentStateId(), "encerrado");
}

function testEffectsDoNotLeakBetweenStates() {
  resetClock();
  engine.resetSession();

  engine.next();
  engine.next("sem_pulso");
  engine.next();
  engine.consumeEffects();
  engine.next("nao_chocavel");
  const secondEffects = engine.consumeEffects();
  assert.equal(secondEffects.length > 0, true);
  const thirdEffects = engine.consumeEffects();
  assert.deepEqual(thirdEffects, []);
}

const assistantActionsByCause = reversibleCauseAssistant.buildCompatibleActionsByCause();
const assistantCauseLabels = {
  hipovolemia: "Hipovolemia",
  hipoxia: "Hipóxia",
  acidose: "Hidrogênio (acidose)",
  hipo_hipercalemia: "Hipo/hipercalemia",
  hipotermia: "Hipotermia",
  pneumotorax_hipertensivo: "Pneumotórax hipertensivo",
  tamponamento_cardiaco: "Tamponamento cardíaco",
  toxinas: "Toxinas",
  trombose_pulmonar: "Trombose pulmonar",
  trombose_coronaria: "Trombose coronariana",
};

function createAssistantEncounterSummary(stateId, shockCount = 0) {
  return {
    protocolId: "pcr_adulto",
    durationLabel: "00:06",
    currentStateId: stateId,
    currentStateText: "Ver 5 Hs e 5 Ts",
    shockCount,
    adrenalineSuggestedCount: 2,
    adrenalineAdministeredCount: 1,
    antiarrhythmicSuggestedCount: shockCount >= 3 ? 1 : 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: [],
  };
}

function createAssistantCause(id, overrides = {}) {
  return {
    id,
    label: assistantCauseLabels[id],
    actions: assistantActionsByCause[id] ?? [],
    status: "pendente",
    evidence: [],
    actionsTaken: [],
    responseObserved: [],
    ...overrides,
  };
}

function evaluateAssistantScenario({
  stateId = "nao_chocavel_hs_ts",
  shockCount = 0,
  cyclesCompleted = 2,
  causes,
  timeline = [],
}) {
  return reversibleCauseAssistant.evaluateReversibleCauseAssistant({
    stateId,
    reversibleCauses: causes,
    timeline,
    encounterSummary: createAssistantEncounterSummary(stateId, shockCount),
    operationalMetrics: {
      cyclesCompleted,
    },
  });
}

function deriveAssistantScenarioMetrics(results) {
  return {
    totalScenarios: results.length,
    expectedTopThreeHits: results.filter((result) => result.expectedInTopThree).length,
    emptyExplanations: results.filter((result) => !result.explanation).length,
    overlyGenericMissingData: results.filter((result) =>
      result.missingData.some((item) => item.length < 8)
    ).length,
    unstableRankings: results.filter((result) => !result.stable).length,
  };
}

function testReversibleCauseAssistantRanking() {
  const result = evaluateAssistantScenario({
    causes: [
      createAssistantCause("hipoxia", {
        status: "suspeita",
        evidence: ["dessaturação persistente", "dificuldade ventilatória", "via aérea difícil"],
        actionsTaken: ["ventilação com bolsa-válvula-máscara", "capnografia em revisão"],
      }),
      createAssistantCause("hipovolemia", {
        evidence: ["hemorragia digestiva prévia"],
      }),
      createAssistantCause("trombose_coronaria"),
    ],
  });

  assert.equal(result.topThree[0].causeId, "hipoxia");
  assert.equal(result.topThree[0].suspectedLevel, "high");
  assert.equal(result.topThree[0].supportingEvidence.length > 0, true);
  assert.equal(result.topThree[0].suggestedChecks.length > 0, true);
  assert.equal(result.topThree[0].explanation.length > 0, true);
}

function testReversibleCauseAssistantExplainsInsufficientData() {
  const result = evaluateAssistantScenario({
    causes: [
      createAssistantCause("tamponamento_cardiaco"),
      createAssistantCause("hipovolemia"),
      createAssistantCause("hipoxia"),
    ],
    cyclesCompleted: 1,
  });

  assert.equal(result.topThree[0].counterEvidence.length, 0);
  assert.equal(result.topThree[0].missingData.length > 0, true);
  assert.equal(result.summary.missingDataHighlights.length > 0, true);
}

function testReversibleCauseAssistantTopThreeStability() {
  const baseCauses = [
    createAssistantCause("trombose_coronaria", {
      status: "suspeita",
      evidence: ["IAM prévio", "contexto isquêmico", "ECG com supra de ST"],
    }),
    createAssistantCause("hipo_hipercalemia", {
      evidence: ["renal crônico", "hipercalemia"],
    }),
    createAssistantCause("toxinas", {
      evidence: ["overdose medicamentosa negada"],
    }),
  ];

  const first = evaluateAssistantScenario({
    stateId: "avaliar_ritmo_3",
    shockCount: 3,
    cyclesCompleted: 3,
    causes: baseCauses,
  });
  const second = evaluateAssistantScenario({
    stateId: "avaliar_ritmo_3",
    shockCount: 3,
    cyclesCompleted: 3,
    causes: [
      createAssistantCause("trombose_coronaria", {
        status: "suspeita",
        evidence: ["IAM prévio", "contexto isquêmico ", "  ECG com supra de ST"],
      }),
      createAssistantCause("hipo_hipercalemia", {
        evidence: ["renal crônico", "hipercalemia"],
      }),
      createAssistantCause("toxinas", {
        evidence: ["overdose medicamentosa negada"],
      }),
    ],
  });

  assert.deepEqual(
    first.topThree.map((item) => item.causeId),
    second.topThree.map((item) => item.causeId)
  );
}

function testReversibleCauseAssistantScenarioSuite() {
  const scenarios = [
    {
      expected: "hipoxia",
      stateId: "nao_chocavel_hs_ts",
      causes: [
        createAssistantCause("hipoxia", {
          status: "suspeita",
          evidence: ["dessaturação persistente", "dificuldade ventilatória", "via aérea difícil"],
          actionsTaken: ["capnografia em revisão"],
        }),
        createAssistantCause("acidose", { evidence: ["lactato alto"] }),
        createAssistantCause("hipovolemia"),
      ],
    },
    {
      expected: "hipovolemia",
      stateId: "nao_chocavel_hs_ts",
      causes: [
        createAssistantCause("hipovolemia", {
          status: "suspeita",
          evidence: ["hemorragia ativa", "perda volêmica importante"],
          actionsTaken: ["reposicao com cristaloide"],
        }),
        createAssistantCause("hipoxia"),
        createAssistantCause("tamponamento_cardiaco"),
      ],
    },
    {
      expected: "tamponamento_cardiaco",
      stateId: "nao_chocavel_hs_ts",
      causes: [
        createAssistantCause("tamponamento_cardiaco", {
          status: "suspeita",
          evidence: ["trauma recente", "ultrassom com derrame pericárdico"],
        }),
        createAssistantCause("pneumotorax_hipertensivo"),
        createAssistantCause("hipovolemia"),
      ],
    },
    {
      expected: "pneumotorax_hipertensivo",
      stateId: "nao_chocavel_hs_ts",
      causes: [
        createAssistantCause("pneumotorax_hipertensivo", {
          status: "suspeita",
          evidence: ["assimetria ventilatória", "expansibilidade reduzida"],
          actionsTaken: ["descompressao torácica considerada"],
        }),
        createAssistantCause("hipoxia"),
        createAssistantCause("tamponamento_cardiaco"),
      ],
    },
    {
      expected: "trombose_pulmonar",
      stateId: "nao_chocavel_hs_ts",
      causes: [
        createAssistantCause("trombose_pulmonar", {
          status: "suspeita",
          evidence: ["TEP maciço provável", "fator tromboembólico recente"],
        }),
        createAssistantCause("toxinas"),
        createAssistantCause("hipovolemia"),
      ],
    },
    {
      expected: "trombose_coronaria",
      stateId: "avaliar_ritmo_3",
      shockCount: 3,
      cyclesCompleted: 3,
      causes: [
        createAssistantCause("trombose_coronaria", {
          status: "suspeita",
          evidence: ["IAM prévio", "contexto isquêmico", "ECG com supra de ST"],
        }),
        createAssistantCause("hipo_hipercalemia", { evidence: ["potássio desconhecido"] }),
        createAssistantCause("toxinas"),
      ],
    },
    {
      expected: "acidose",
      stateId: "nao_chocavel_hs_ts",
      causes: [
        createAssistantCause("acidose", {
          status: "suspeita",
          evidence: ["acidose metabólica", "gasometria alterada", "hipoperfusão importante"],
        }),
        createAssistantCause("hipoxia"),
        createAssistantCause("hipo_hipercalemia"),
      ],
    },
    {
      expected: "hipo_hipercalemia",
      stateId: "avaliar_ritmo_3",
      shockCount: 3,
      cyclesCompleted: 3,
      causes: [
        createAssistantCause("hipo_hipercalemia", {
          status: "suspeita",
          evidence: ["hipercalemia", "renal crônico", "ECG alterado"],
          actionsTaken: ["cálcio considerado"],
        }),
        createAssistantCause("trombose_coronaria"),
        createAssistantCause("toxinas"),
      ],
    },
    {
      expected: "hipotermia",
      stateId: "nao_chocavel_hs_ts",
      causes: [
        createAssistantCause("hipotermia", {
          status: "suspeita",
          evidence: ["temperatura central baixa", "imersão em água fria"],
        }),
        createAssistantCause("hipoxia"),
        createAssistantCause("hipovolemia"),
      ],
    },
    {
      expected: "toxinas",
      stateId: "avaliar_ritmo_3",
      shockCount: 2,
      cyclesCompleted: 2,
      causes: [
        createAssistantCause("toxinas", {
          status: "suspeita",
          evidence: ["overdose medicamentosa", "antídoto em avaliação"],
        }),
        createAssistantCause("trombose_coronaria"),
        createAssistantCause("hipo_hipercalemia"),
      ],
    },
  ];

  const outcomes = scenarios.map((scenario) => {
    const baseline = evaluateAssistantScenario(scenario);
    const variant = evaluateAssistantScenario({
      ...scenario,
      causes: scenario.causes.map((cause, index) =>
        index === 0
          ? {
              ...cause,
              evidence: [...cause.evidence, "observação irrelevante"],
            }
          : cause
      ),
    });

    const topThreeIds = baseline.topThree.map((item) => item.causeId);
    const target = baseline.ranked.find((item) => item.causeId === scenario.expected);

    assert.ok(target);
    assert.equal(topThreeIds.includes(scenario.expected), true);
    assert.equal(target.explanation.length > 0, true);
    assert.equal(target.missingData.length <= 3, true);
    assert.equal(target.suggestedChecks.length > 0, true);
    assert.deepEqual(target.compatibleActions, assistantActionsByCause[scenario.expected]);

    return {
      expectedInTopThree: topThreeIds.includes(scenario.expected),
      explanation: target.explanation,
      missingData: target.missingData,
      stable:
        baseline.topThree[0].causeId === variant.topThree[0].causeId &&
        baseline.topThree.map((item) => item.causeId).join("|") ===
          variant.topThree.map((item) => item.causeId).join("|"),
    };
  });

  const metrics = deriveAssistantScenarioMetrics(outcomes);
  assert.equal(metrics.totalScenarios, 10);
  assert.equal(metrics.expectedTopThreeHits, 10);
  assert.equal(metrics.emptyExplanations, 0);
  assert.equal(metrics.unstableRankings, 0);
}

function testReversibleCauseAssistantRobustness() {
  const singleKeyword = evaluateAssistantScenario({
    causes: [
      createAssistantCause("toxinas", {
        evidence: ["medicamento"],
      }),
      createAssistantCause("hipoxia", {
        status: "suspeita",
        evidence: ["dessaturação persistente", "dificuldade ventilatória"],
      }),
      createAssistantCause("hipovolemia"),
    ],
  });
  assert.notEqual(singleKeyword.topThree[0].causeId, "toxinas");

  const addressedWithoutImprovement = evaluateAssistantScenario({
    causes: [
      createAssistantCause("hipovolemia", {
        status: "abordada",
        evidence: ["hemorragia ativa", "perda volêmica importante"],
        actionsTaken: ["reposicao com cristaloide"],
        responseObserved: ["sem resposta"],
      }),
      createAssistantCause("hipoxia"),
      createAssistantCause("tamponamento_cardiaco"),
    ],
  });
  const improvedAfterAction = evaluateAssistantScenario({
    causes: [
      createAssistantCause("hipovolemia", {
        status: "abordada",
        evidence: ["hemorragia ativa", "perda volêmica importante"],
        actionsTaken: ["reposicao com cristaloide"],
        responseObserved: ["melhora após volume"],
      }),
      createAssistantCause("hipoxia"),
      createAssistantCause("tamponamento_cardiaco"),
    ],
  });
  assert.equal(
    addressedWithoutImprovement.ranked[0].score > improvedAfterAction.ranked[0].score,
    true
  );

  const coexistence = evaluateAssistantScenario({
    stateId: "avaliar_ritmo_3",
    shockCount: 3,
    cyclesCompleted: 3,
    causes: [
      createAssistantCause("trombose_coronaria", {
        status: "suspeita",
        evidence: ["IAM prévio", "contexto isquêmico"],
      }),
      createAssistantCause("hipo_hipercalemia", {
        status: "suspeita",
        evidence: ["hipercalemia", "renal crônico"],
      }),
      createAssistantCause("toxinas"),
    ],
  });
  assert.equal(coexistence.topThree.length, 3);
  assert.equal(coexistence.topThree[0].supportingEvidence.length > 0, true);
  assert.equal(coexistence.topThree[1].supportingEvidence.length > 0, true);
}

function testReversibleCauseFeatureExtraction() {
  const input = {
    stateId: "nao_chocavel_hs_ts",
    reversibleCauses: [
      createAssistantCause("hipoxia", {
        status: "suspeita",
        evidence: ["via aérea difícil", "dessaturação persistente", "ETCO2 baixo"],
        actionsTaken: ["capnografia revisada"],
        responseObserved: ["sem resposta"],
      }),
      createAssistantCause("tamponamento_cardiaco", {
        evidence: ["trauma torácico recente", "ultrassom disponível"],
      }),
    ],
    timeline: [],
    encounterSummary: createAssistantEncounterSummary("nao_chocavel_hs_ts", 0),
    operationalMetrics: { cyclesCompleted: 2 },
  };

  const features = reversibleCauseAssistant.extractReversibleCauseFeatures(input);
  assert.equal(features.hasDifficultVentilation, true);
  assert.equal(features.hasOxygenationCompromise, true);
  assert.equal(features.hasLowEtco2, true);
  assert.equal(features.hasCapnographyMention, true);
  assert.equal(features.hasTraumaOrPericardialContext, true);
  assert.equal(features.manualSuspicionByCause.hipoxia, true);
  assert.equal(features.noImprovementObservedByCause.hipoxia, true);
  assert.equal(features.structuredEvidenceByCause.hipoxia.length > 0, true);
}

function testStructuredFeatureOutweighsWeakTextSignal() {
  const result = evaluateAssistantScenario({
    causes: [
      createAssistantCause("hipoxia", {
        evidence: ["via aérea difícil", "ETCO2 baixo"],
      }),
      createAssistantCause("toxinas", {
        evidence: ["medicamento"],
      }),
      createAssistantCause("hipovolemia"),
    ],
  });

  assert.equal(result.topThree[0].causeId, "hipoxia");
  assert.equal(
    result.ranked.find((item) => item.causeId === "hipoxia").supportingEvidence.some((item) =>
      /Ventilação difícil|ETCO2|Oxigenação/.test(item)
    ),
    true
  );
}

function testTextDoesNotDuplicateStructuredFeatureSignal() {
  const result = evaluateAssistantScenario({
    causes: [
      createAssistantCause("hipoxia", {
        evidence: ["via aérea difícil", "dificuldade ventilatória", "ventilação difícil"],
      }),
      createAssistantCause("hipovolemia"),
      createAssistantCause("toxinas"),
    ],
  });

  const hipoxia = result.ranked.find((item) => item.causeId === "hipoxia");
  const ventilationEvidence = hipoxia.supportingEvidence.filter((item) =>
    /Ventilação difícil|dificuldade ventilatória/i.test(item)
  );
  assert.equal(ventilationEvidence.length <= 2, true);
}

function testMissingDataShrinksWithStructuredSignals() {
  const withoutSignals = evaluateAssistantScenario({
    causes: [
      createAssistantCause("hipoxia"),
      createAssistantCause("hipovolemia"),
      createAssistantCause("toxinas"),
    ],
    cyclesCompleted: 1,
  });

  const withSignals = evaluateAssistantScenario({
    causes: [
      createAssistantCause("hipoxia", {
        evidence: ["via aérea difícil", "dessaturação persistente", "ETCO2 baixo"],
      }),
      createAssistantCause("hipovolemia"),
      createAssistantCause("toxinas"),
    ],
    cyclesCompleted: 1,
  });

  const base = withoutSignals.ranked.find((item) => item.causeId === "hipoxia");
  const enriched = withSignals.ranked.find((item) => item.causeId === "hipoxia");
  assert.equal(enriched.missingData.length < base.missingData.length, true);
}

function testStructuredContextKeepsPneumothoraxAndTamponadeDistinct() {
  const result = evaluateAssistantScenario({
    causes: [
      createAssistantCause("pneumotorax_hipertensivo", {
        evidence: ["assimetria ventilatória", "descompressao torácica considerada"],
      }),
      createAssistantCause("tamponamento_cardiaco", {
        evidence: ["trauma torácico", "ultrassom com derrame pericárdico"],
      }),
      createAssistantCause("hipoxia"),
    ],
  });

  assert.equal(result.topThree.some((item) => item.causeId === "pneumotorax_hipertensivo"), true);
  assert.equal(result.topThree.some((item) => item.causeId === "tamponamento_cardiaco"), true);
}

function testAssistantInsightLogging() {
  resetClock();
  engine.resetSession();

  engine.registerAssistantInsightEvent({
    kind: "ranking_generated",
    summary: "Top 3 agora: Hipóxia, Hipovolemia, Acidose",
    stateId: "nao_chocavel_hs_ts",
    details: {
      topThree: "hipoxia|hipovolemia|acidose",
    },
  });

  const insightEvent = engine.getTimeline().find((event) => event.type === "assistant_insight");
  assert.ok(insightEvent);
  assert.equal(insightEvent.details.kind, "ranking_generated");
  assert.equal(insightEvent.details.stateId, "nao_chocavel_hs_ts");
}

function testAclsDebriefSummary() {
  const built = debrief.buildAclsDebrief({
    debugLatencyEnabled: true,
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:12",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 3,
      adrenalineSuggestedCount: 2,
      adrenalineAdministeredCount: 2,
      antiarrhythmicSuggestedCount: 1,
      antiarrhythmicAdministeredCount: 1,
      suspectedCauses: ["Hipóxia"],
      addressedCauses: ["Hipóxia"],
      lastEvents: [],
    },
    operationalMetrics: {
      cyclesCompleted: 3,
      totalPcrDurationMs: 12 * 60 * 1000,
    },
    latencyMetrics: [
      {
        id: "latency:1",
        eventType: "execution_recorded",
        eventCategory: "shock",
        stateIdBefore: "choque_bi_1",
        stateIdAfter: "rcp_1",
        clinicalIntentAfter: "perform_cpr",
        eventReceivedAt: 1900,
        reducerCompletedAt: 1901,
        stateAppliedAt: 1901,
        stateCommittedAt: 1902,
        speakEnqueuedAt: 1910,
        speakPlayStartedAt: 1930,
        speakKeys: ["shock"],
        latencies: {
          eventToStateMs: 2,
          stateToEnqueueSpeakMs: 8,
          enqueueToPlayMs: 20,
          totalEndToEndMs: 30,
        },
      },
    ],
    reversibleCauses: [
      {
        id: "hipoxia",
        label: "Hipóxia",
        actions: ["Garantir ventilação eficaz"],
        status: "abordada",
        evidence: ["via aérea difícil"],
        actionsTaken: ["ventilação com bolsa-válvula-máscara"],
        responseObserved: ["sem resposta"],
      },
    ],
    timeline: [
      { id: "1", timestamp: 0, type: "protocol_started", stateId: "inicio", origin: "system" },
      {
        id: "2",
        timestamp: 1000,
        type: "question_answered",
        stateId: "avaliar_ritmo",
        origin: "user",
        details: { answer: "chocavel" },
      },
      {
        id: "3",
        timestamp: 2000,
        type: "shock_applied",
        stateId: "choque_bi_1",
        origin: "user",
        details: { count: 1, defibrillatorType: "bifasico" },
      },
      {
        id: "4",
        timestamp: 3000,
        type: "medication_administered",
        stateId: "rcp_2",
        origin: "user",
        details: {
          medicationId: "adrenaline",
          count: 1,
          doseLabel: "Epinefrina 1 mg IV/IO",
        },
      },
      {
        id: "4b",
        timestamp: 3500,
        type: "advanced_airway_secured",
        stateId: "rcp_2",
        origin: "user",
      },
      {
        id: "5",
        timestamp: 4000,
        type: "assistant_insight",
        stateId: "nao_chocavel_hs_ts",
        origin: "system",
        details: {
          kind: "ranking_generated",
          summary: "Top 3 agora: Hipóxia, Hipovolemia, Acidose",
          topThree: "hipoxia|hipovolemia|acidose",
        },
      },
      {
        id: "6",
        timestamp: 5000,
        type: "assistant_insight",
        stateId: "nao_chocavel_hs_ts",
        origin: "system",
        details: {
          kind: "missing_data_highlighted",
          summary: "Dados faltantes: capnografia ou ETCO2",
          missingData: "capnografia ou ETCO2|expansibilidade torácica",
        },
      },
      {
        id: "7",
        timestamp: 6000,
        type: "voice_command",
        stateId: "rcp_2",
        origin: "user",
        details: {
          intent: "confirm_epinephrine_administered",
          outcome: "executed",
          actionTaken: "register_epinephrine",
          transcript: "epinefrina administrada",
          confidence: 1,
        },
      },
      {
        id: "8",
        timestamp: 7000,
        type: "guard_rail_triggered",
        stateId: "choque_2",
        origin: "user",
        details: { issue: "shock_not_available" },
      },
      {
        id: "9",
        timestamp: 8000,
        type: "rosc",
        stateId: "pos_rosc",
        origin: "system",
      },
    ],
  });

  assert.equal(built.summary.durationLabel, "00:12");
  assert.equal(built.summary.cyclesCompleted, 3);
  assert.equal(built.summary.shocksDelivered, 3);
  assert.equal(built.summary.epinephrineAdministered, 2);
  assert.equal(built.summary.antiarrhythmicsAdministered, 1);
  assert.equal(built.summary.advancedAirwaySecured, true);
  assert.equal(built.summary.roscOccurred, true);
  assert.equal(built.summary.branchTransitions.includes("Mudança para ramo chocável"), true);
  assert.equal(built.summary.topCauseSummaries[0].causeId, "hipoxia");
  assert.equal(built.summary.highlightedMissingData[0], "capnografia ou ETCO2");
  assert.equal(built.summary.operationalDeviations[0], "shock_not_available");
  assert.equal(built.summary.voiceTelemetry.totalCommands, 1);
  assert.equal(built.summary.indicators.timeToFirstShockLabel, "00:02");
  assert.equal(built.summary.indicators.timeToFirstEpinephrineLabel, "00:03");
  assert.equal(built.summary.indicators.totalCaseTimeLabel, "00:08");
  assert.equal(built.summary.indicators.branchTransitions, 1);
  assert.equal(built.latencyDebug?.enabled, true);
  assert.equal(built.latencyDebug?.events[0].eventCategory, "shock");
}

function testAclsDebriefTimelineAndReplay() {
  const timeline = [
    { id: "1", timestamp: 0, type: "protocol_started", stateId: "inicio", origin: "system" },
    {
      id: "2",
      timestamp: 1000,
      type: "shock_applied",
      stateId: "choque_bi_1",
      origin: "user",
      details: { count: 1, defibrillatorType: "bifasico" },
    },
    {
      id: "3",
      timestamp: 2000,
      type: "voice_command",
      stateId: "rcp_2",
      origin: "user",
      details: {
        intent: "confirm_epinephrine_administered",
        outcome: "executed",
        actionTaken: "register_epinephrine",
      },
    },
  ];

  const summaryTimeline = debrief.buildDebriefTimeline(timeline);
  const replay = debrief.buildReplaySteps(timeline);

  assert.equal(summaryTimeline.length, 3);
  assert.equal(summaryTimeline[0].title, "Início de RCP");
  assert.equal(summaryTimeline[1].title, "Choque 1");
  assert.equal(replay[2].context, "voice");
  assert.equal(replay[0].isCritical, true);
  assert.equal(replay[1].filter, "shocks");
}

function testAclsReplayBlocksAndFilters() {
  const timeline = [
    { id: "1", timestamp: 0, type: "protocol_started", stateId: "inicio", origin: "system" },
    {
      id: "2",
      timestamp: 1000,
      type: "shock_applied",
      stateId: "choque_bi_1",
      origin: "user",
      details: { count: 1, defibrillatorType: "bifasico" },
    },
    {
      id: "3",
      timestamp: 2000,
      type: "medication_administered",
      stateId: "rcp_2",
      origin: "user",
      details: {
        medicationId: "adrenaline",
        count: 1,
        doseLabel: "Epinefrina 1 mg IV/IO",
      },
    },
    {
      id: "4",
      timestamp: 3000,
      type: "assistant_insight",
      stateId: "nao_chocavel_hs_ts",
      origin: "system",
      details: { summary: "Top 3 agora: Hipóxia", kind: "ranking_generated" },
    },
    {
      id: "5",
      timestamp: 4000,
      type: "voice_command",
      stateId: "rcp_2",
      origin: "user",
      details: { outcome: "executed", actionTaken: "register_epinephrine" },
    },
  ];

  const steps = debrief.buildReplaySteps(timeline);
  const blocks = debrief.buildReplayBlocks(steps);
  const shockBlocks = debrief.filterReplayBlocks(blocks, "shocks");
  const drugSteps = debrief.filterReplaySteps(steps, "drugs");
  const causeSteps = debrief.filterReplaySteps(steps, "causes");

  assert.equal(blocks[0].label, "Início");
  assert.equal(blocks[1].label, "Choques");
  assert.equal(shockBlocks.length, 1);
  assert.equal(shockBlocks[0].steps[0].event, "Choque 1");
  assert.equal(drugSteps.length, 1);
  assert.equal(drugSteps[0].event, "Epinefrina administrada");
  assert.equal(causeSteps.length, 1);
  assert.equal(causeSteps[0].event, "Insight de Hs/Ts");
}

function testDebriefDoesNotPromoteUncheckedHsAndTs() {
  const built = debrief.buildAclsDebrief({
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:06",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 0,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 1,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    operationalMetrics: { cyclesCompleted: 1 },
    reversibleCauses: [
      {
        id: "hipoxia",
        label: "Hipóxia",
        actions: ["Garantir ventilação eficaz"],
        status: "pendente",
        evidence: [],
        actionsTaken: [],
        responseObserved: [],
      },
    ],
    timeline: [
      { id: "1", timestamp: 0, type: "protocol_started", stateId: "inicio", origin: "system" },
      {
        id: "2",
        timestamp: 1000,
        type: "assistant_insight",
        stateId: "nao_chocavel_hs_ts",
        origin: "system",
        details: {
          kind: "ranking_generated",
          summary: "Top 3 agora: Hipóxia",
          topThree: "hipoxia",
        },
      },
    ],
  });

  assert.equal(built.summary.topCauseSummaries.length, 0);
}

function testAclsDebriefHandlesSparseCase() {
  const built = debrief.buildAclsDebrief({
    debugLatencyEnabled: false,
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:01",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 0,
      adrenalineSuggestedCount: 0,
      adrenalineAdministeredCount: 0,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    operationalMetrics: {
      cyclesCompleted: 0,
    },
    reversibleCauses: [],
    timeline: [],
  });

  assert.equal(built.summary.voiceTelemetry.totalCommands, 0);
  assert.equal(built.timeline.length, 0);
  assert.equal(built.replaySteps.length, 0);
  assert.equal(built.summary.topCauseSummaries.length, 0);
  assert.equal(built.summary.indicators.timeToFirstShockLabel, undefined);
  assert.equal(built.summary.indicators.totalCaseTimeLabel, "00:01");
  assert.equal(built.latencyDebug, undefined);
}

function testAclsDebriefExportModelAndFormats() {
  const built = debrief.buildAclsDebrief({
    debugLatencyEnabled: true,
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:10",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 2,
      adrenalineSuggestedCount: 2,
      adrenalineAdministeredCount: 2,
      antiarrhythmicSuggestedCount: 1,
      antiarrhythmicAdministeredCount: 1,
      suspectedCauses: ["Hipóxia"],
      addressedCauses: ["Hipóxia"],
      lastEvents: [],
    },
    operationalMetrics: {
      cyclesCompleted: 2,
    },
    latencyMetrics: [
      {
        id: "latency:2",
        eventType: "question_answered",
        eventCategory: "rhythm",
        stateIdBefore: "rcp_1",
        stateIdAfter: "avaliar_ritmo_2",
        clinicalIntentAfter: "analyze_rhythm",
        eventReceivedAt: 2900,
        reducerCompletedAt: 2901,
        stateAppliedAt: 2901,
        stateCommittedAt: 2902,
        speakEnqueuedAt: 2910,
        speakPlayStartedAt: 2940,
        speakKeys: ["analyze_rhythm"],
        latencies: {
          eventToStateMs: 2,
          stateToEnqueueSpeakMs: 8,
          enqueueToPlayMs: 30,
          totalEndToEndMs: 40,
        },
      },
    ],
    reversibleCauses: [
      {
        id: "hipoxia",
        label: "Hipóxia",
        actions: ["Garantir ventilação eficaz"],
        status: "abordada",
        evidence: ["via aérea difícil"],
        actionsTaken: ["ventilação com bolsa-válvula-máscara"],
        responseObserved: [],
      },
    ],
    timeline: [
      { id: "1", timestamp: 1000, type: "protocol_started", stateId: "inicio", origin: "system" },
      {
        id: "2",
        timestamp: 3000,
        type: "shock_applied",
        stateId: "choque_bi_1",
        origin: "user",
        details: { count: 1, defibrillatorType: "bifasico" },
      },
      {
        id: "3",
        timestamp: 5000,
        type: "voice_command",
        stateId: "rcp_2",
        origin: "user",
        details: {
          intent: "confirm_epinephrine_administered",
          outcome: "executed",
          actionTaken: "register_epinephrine",
        },
      },
    ],
  });

  const exportModel = debrief.buildAclsDebriefExport(built, {
    protocolId: "pcr_adulto",
    durationLabel: "00:10",
    currentStateId: "encerrado",
    currentStateText: "Atendimento encerrado",
    shockCount: 2,
    adrenalineSuggestedCount: 2,
    adrenalineAdministeredCount: 2,
    antiarrhythmicSuggestedCount: 1,
    antiarrhythmicAdministeredCount: 1,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: [],
  });
  const text = debrief.buildAclsDebriefTextExport(built, exportModel.metadata);
  const json = debrief.buildAclsDebriefJsonExport(built, exportModel.metadata);

  assert.equal(exportModel.metadata.generatedFrom, "post_case_debrief");
  assert.equal(exportModel.operationalSummary.shocksDelivered, 2);
  assert.equal(exportModel.timeline[0].title, "Início de RCP");
  assert.equal(exportModel.replaySteps[1].event, "Choque 1");
  assert.equal(exportModel.latencyDebug?.enabled, true);
  assert.equal(exportModel.latencyDebug?.events[0].eventCategory, "rhythm");
  assert.match(text, /Debrief pós-caso ACLS/);
  assert.match(text, /Latência perceptiva/);
  assert.match(text, /Timeline resumida/);
  assert.match(text, /Telemetria de voz/);
  const parsed = JSON.parse(json);
  assert.equal(parsed.metadata.protocolId, "pcr_adulto");
  assert.equal(parsed.timeline.length, exportModel.timeline.length);
  assert.equal(parsed.latencyDebug.events[0].eventCategory, "rhythm");
}

function testAclsDebriefExportOrderStability() {
  const unsortedTimeline = [
    {
      id: "3",
      timestamp: 5000,
      type: "voice_command",
      stateId: "rcp_2",
      origin: "user",
      details: { outcome: "executed", actionTaken: "register_epinephrine" },
    },
    { id: "1", timestamp: 1000, type: "protocol_started", stateId: "inicio", origin: "system" },
    {
      id: "2",
      timestamp: 3000,
      type: "shock_applied",
      stateId: "choque_bi_1",
      origin: "user",
      details: { count: 1, defibrillatorType: "bifasico" },
    },
  ];

  const built = debrief.buildAclsDebrief({
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:10",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 1,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 1,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    operationalMetrics: { cyclesCompleted: 1 },
    reversibleCauses: [],
    timeline: unsortedTimeline,
  });

  assert.deepEqual(
    built.timeline.map((item) => item.title),
    ["Início de RCP", "Choque 1", "Evento de voz"]
  );
  assert.deepEqual(
    built.replaySteps.map((item) => item.event),
    ["Início de RCP", "Choque 1", "Evento de voz"]
  );
}

function testAclsOperationalIndicatorsPendingAndVoiceFriction() {
  const built = debrief.buildAclsDebrief({
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:09",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 1,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 0,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    operationalMetrics: { cyclesCompleted: 2 },
    reversibleCauses: [],
    timeline: [
      { id: "1", timestamp: 0, type: "protocol_started", stateId: "inicio", origin: "system" },
      {
        id: "2",
        timestamp: 1000,
        type: "medication_due_now",
        stateId: "rcp_2",
        origin: "system",
        details: { medicationId: "adrenaline", count: 1 },
      },
      {
        id: "3",
        timestamp: 2000,
        type: "voice_command",
        stateId: "rcp_2",
        origin: "user",
        details: {
          intent: "confirm_epinephrine_administered",
          outcome: "rejected",
          actionTaken: "invalid_for_state",
        },
      },
      {
        id: "4",
        timestamp: 3000,
        type: "voice_command",
        stateId: "rcp_2",
        origin: "user",
        details: {
          intent: "confirm_epinephrine_administered",
          outcome: "rejected",
          actionTaken: "low_confidence",
          errorCategory: "low_confidence",
        },
      },
      {
        id: "5",
        timestamp: 4000,
        type: "voice_command",
        stateId: "rcp_2",
        origin: "user",
        details: {
          intent: "confirm_epinephrine_administered",
          outcome: "confirmation_expired",
          actionTaken: "register_epinephrine",
          errorCategory: "confirmation_timeout",
        },
      },
    ],
  });

  assert.equal(
    built.summary.indicators.pendingOrDelayedItems.includes(
      "adrenaline sugerida sem registro de administração"
    ),
    true
  );
  assert.equal(built.summary.indicators.voiceRejectedCount, 2);
  assert.equal(built.summary.indicators.voiceTimeoutCount, 1);
  assert.equal(built.summary.indicators.voiceLowConfidenceCount, 1);
}

function testAclsCaseHistoryPersistence() {
  let storage = null;
  const adapter = {
    read: () => storage,
    write: (value) => {
      storage = value;
    },
  };

  const built = debrief.buildAclsDebrief({
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:07",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 2,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 1,
      antiarrhythmicSuggestedCount: 1,
      antiarrhythmicAdministeredCount: 1,
      suspectedCauses: ["Hipóxia"],
      addressedCauses: ["Hipóxia"],
      lastEvents: [],
    },
    operationalMetrics: { cyclesCompleted: 2 },
    reversibleCauses: [
      {
        id: "hipoxia",
        label: "Hipóxia",
        actions: ["Garantir ventilação eficaz"],
        status: "abordada",
        evidence: ["via aérea difícil"],
        actionsTaken: ["ventilação com bolsa-válvula-máscara"],
        responseObserved: [],
      },
    ],
    timeline: [
      { id: "1", timestamp: 1000, type: "protocol_started", stateId: "inicio", origin: "system" },
    ],
  });

  const persisted = caseHistory.buildPersistedAclsCase(
    {
      protocolId: "pcr_adulto",
      durationLabel: "00:07",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 2,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 1,
      antiarrhythmicSuggestedCount: 1,
      antiarrhythmicAdministeredCount: 1,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    built
  );

  caseHistory.savePersistedAclsCase(persisted, adapter);
  const list = caseHistory.listPersistedAclsCases(adapter);
  const opened = caseHistory.getPersistedAclsCase(persisted.id, adapter);

  assert.equal(list.length, 1);
  assert.equal(list[0].id, persisted.id);
  assert.equal(opened.id, persisted.id);
  assert.equal(opened.summary.shockCount, 2);
  assert.equal(opened.debrief.summary.cyclesCompleted, 2);
}

function testAclsCaseHistoryOrderingAndStability() {
  let storage = null;
  const adapter = {
    read: () => storage,
    write: (value) => {
      storage = value;
    },
  };

  const first = {
    id: "case-1",
    savedAt: 1000,
    protocolId: "pcr_adulto",
    encounterSummary: {
      protocolId: "pcr_adulto",
      durationLabel: "00:03",
      currentStateId: "encerrado",
      currentStateText: "Atendimento encerrado",
      shockCount: 1,
      adrenalineSuggestedCount: 1,
      adrenalineAdministeredCount: 1,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    },
    summary: {
      durationLabel: "00:03",
      currentStateText: "Atendimento encerrado",
      shockCount: 1,
      cyclesCompleted: 1,
      roscOccurred: false,
      voiceCommands: 0,
      topCauseLabels: [],
    },
    indicators: {
      totalCaseTimeLabel: "00:03",
      cyclesCompleted: 1,
      shocksDelivered: 1,
      epinephrineAdministered: 1,
      antiarrhythmicsAdministered: 0,
      branchTransitions: 0,
      roscOccurred: false,
      pendingOrDelayedItems: [],
      operationalDeviations: [],
      voiceRejectedCount: 0,
      voiceTimeoutCount: 0,
      voiceLowConfidenceCount: 0,
      persistentPriorityCauses: [],
    },
    debrief: {
      summary: {
        durationLabel: "00:03",
        cyclesCompleted: 1,
        shocksDelivered: 1,
        epinephrineAdministered: 1,
        antiarrhythmicsAdministered: 0,
        branchTransitions: [],
        roscOccurred: false,
        topCauseSummaries: [],
        highlightedMissingData: [],
        operationalDeviations: [],
        voiceSummary: { headline: [], dominantIntents: [] },
        voiceTelemetry: {
          totalCommands: 0,
          acceptedCount: 0,
          rejectedCount: 0,
          confirmationRequestedCount: 0,
          confirmationAcceptedCount: 0,
          confirmationCancelledCount: 0,
          confirmationExpiredCount: 0,
          acceptanceRate: 0,
          rejectionRate: 0,
          confirmationRequestRate: 0,
          topUsedIntents: [],
          topRejectedIntents: [],
          topTimeoutIntents: [],
          unknownTranscripts: [],
          errorStates: [],
        },
        indicators: {
          totalCaseTimeLabel: "00:03",
          cyclesCompleted: 1,
          shocksDelivered: 1,
          epinephrineAdministered: 1,
          antiarrhythmicsAdministered: 0,
          branchTransitions: 0,
          roscOccurred: false,
          pendingOrDelayedItems: [],
          operationalDeviations: [],
          voiceRejectedCount: 0,
          voiceTimeoutCount: 0,
          voiceLowConfidenceCount: 0,
          persistentPriorityCauses: [],
        },
      },
      timeline: [],
      replaySteps: [],
      replayBlocks: [],
    },
    exportModel: {
      metadata: {
        protocolId: "pcr_adulto",
        durationLabel: "00:03",
        currentStateId: "encerrado",
        currentStateText: "Atendimento encerrado",
        generatedFrom: "post_case_debrief",
      },
      operationalSummary: {
        cyclesCompleted: 1,
        shocksDelivered: 1,
        epinephrineAdministered: 1,
        antiarrhythmicsAdministered: 0,
        branchTransitions: [],
        roscOccurred: false,
        operationalDeviations: [],
        highlightedMissingData: [],
        indicators: {
          totalCaseTimeLabel: "00:03",
          cyclesCompleted: 1,
          shocksDelivered: 1,
          epinephrineAdministered: 1,
          antiarrhythmicsAdministered: 0,
          branchTransitions: 0,
          roscOccurred: false,
          pendingOrDelayedItems: [],
          operationalDeviations: [],
          voiceRejectedCount: 0,
          voiceTimeoutCount: 0,
          voiceLowConfidenceCount: 0,
          persistentPriorityCauses: [],
        },
      },
      voiceSummary: {
        headline: [],
        dominantIntents: [],
        telemetry: {
          totalCommands: 0,
          acceptedCount: 0,
          rejectedCount: 0,
          confirmationRequestedCount: 0,
          confirmationAcceptedCount: 0,
          confirmationCancelledCount: 0,
          confirmationExpiredCount: 0,
          acceptanceRate: 0,
          rejectionRate: 0,
          confirmationRequestRate: 0,
          topUsedIntents: [],
          topRejectedIntents: [],
          topTimeoutIntents: [],
          unknownTranscripts: [],
          errorStates: [],
        },
      },
      causesSummary: [],
      timeline: [],
      replaySteps: [],
      replayBlocks: [],
    },
  };

  const second = { ...first, id: "case-2", savedAt: 2000 };

  caseHistory.savePersistedAclsCase(first, adapter);
  caseHistory.savePersistedAclsCase(second, adapter);
  const list = caseHistory.listPersistedAclsCases(adapter);

  assert.equal(list.length, 2);
  assert.equal(list[0].id, "case-2");
  assert.equal(list[1].id, "case-1");
}

function testSepsisFlow() {
  resetClock();
  sepsisEngine.resetSession();

  assert.equal(sepsisEngine.getCurrentStateId(), "dados_iniciais_paciente");
  let panel = sepsisEngine.getAuxiliaryPanel();
  assert.equal(panel.title, "Dados do paciente");
  sepsisEngine.applyAuxiliaryPreset("age", "70");
  sepsisEngine.applyAuxiliaryPreset("sex", "Masculino");
  sepsisEngine.applyAuxiliaryPreset("weightKg", "80");
  sepsisEngine.applyAuxiliaryPreset("suspectedSource", "Pulmonar");
  sepsisEngine.applyAuxiliaryPreset("symptomOnset", "< 6 horas");
  sepsisEngine.applyAuxiliaryPreset("comorbidities", "DM");
  sepsisEngine.applyAuxiliaryPreset("comorbidities", "DRC");
  sepsisEngine.applyAuxiliaryPreset("heartRate", "120");
  sepsisEngine.applyAuxiliaryPreset("oxygenSaturation", "92");
  sepsisEngine.applyAuxiliaryPreset("temperature", "39,0");
  sepsisEngine.applyAuxiliaryPreset("respiratoryRate", "30");
  sepsisEngine.applyAuxiliaryPreset("respiratoryPattern", "Taquipneico");
  sepsisEngine.applyAuxiliaryPreset("mentalStatus", "Confusão");
  sepsisEngine.applyAuxiliaryPreset("capillaryRefill", "> 3 s");
  sepsisEngine.applyAuxiliaryPreset("urineOutput", "Oligúria");
  sepsisEngine.applyAuxiliaryPreset("systolicPressure", "80");
  sepsisEngine.applyAuxiliaryPreset("diastolicPressure", "40");
  sepsisEngine.applyAuxiliaryPreset("hypoperfusionSigns", "Confusão");
  sepsisEngine.applyAuxiliaryPreset("hypoperfusionSigns", "Oligúria");

  sepsisEngine.next();
  assert.equal(sepsisEngine.getCurrentStateId(), "avaliacao_clinica_gravidade");
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Suspeita de sepse reconhecida/);
  assert.equal(sepsisEngine.getAuxiliaryPanel(), null);
  assert.match(JSON.stringify(sepsisEngine.getCurrentState()), /suspeita de choque séptico/i);
  sepsisEngine.next();
  assert.equal(sepsisEngine.getCurrentStateId(), "bundle_primeira_hora");
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Gravidade inicial definida/);
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Bundle da primeira hora ativado/);

  panel = sepsisEngine.getAuxiliaryPanel();
  assert.equal(panel.title, "Bundle da primeira hora");
  assert.match(JSON.stringify(panel.metrics), /Pulmonar/);
  assert.match(JSON.stringify(sepsisEngine.getCurrentState()), /Ceftriaxone|Piperacilina/);
  sepsisEngine.updateAuxiliaryStatus("lactato", "solicitado");
  sepsisEngine.updateAuxiliaryStatus("culturas", "solicitado");
  sepsisEngine.updateAuxiliaryStatus("antibiotico", "realizado");
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Lactato solicitado/);
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Culturas solicitadas/);
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Antimicrobiano iniciado/);
  sepsisEngine.consumeEffects();

  advance(60 * 60 * 1000);
  sepsisEngine.tick();
  assert.doesNotMatch(JSON.stringify(sepsisEngine.consumeEffects()), /Revisar antibiótico agora/);

  assert.deepEqual(sepsisEngine.getDocumentationActions(), []);

  sepsisEngine.next();
  assert.equal(sepsisEngine.getCurrentStateId(), "ressuscitacao_hemodinamica");
  sepsisEngine.updateAuxiliaryUnit("lactateValue", "mg/dL");
  sepsisEngine.updateAuxiliaryField("lactateValue", "36");
  let lactateField = sepsisEngine
    .getAuxiliaryPanel()
    .fields.find((field) => field.id === "lactateValue");
  assert.equal(lactateField.unit, "mg/dL");
  assert.equal(lactateField.value, "36");
  sepsisEngine.updateAuxiliaryUnit("lactateValue", "mmol/L");
  lactateField = sepsisEngine
    .getAuxiliaryPanel()
    .fields.find((field) => field.id === "lactateValue");
  assert.equal(lactateField.unit, "mmol/L");
  assert.equal(lactateField.value, "4,0");
  sepsisEngine.updateAuxiliaryField("creatinineValue", "2,0");
  let creatinineField = sepsisEngine
    .getAuxiliaryPanel()
    .fields.find((field) => field.id === "creatinineValue");
  assert.equal(creatinineField.unit, "mg/dL");
  sepsisEngine.updateAuxiliaryUnit("creatinineValue", "µmol/L");
  creatinineField = sepsisEngine
    .getAuxiliaryPanel()
    .fields.find((field) => field.id === "creatinineValue");
  assert.equal(creatinineField.unit, "µmol/L");
  assert.equal(creatinineField.value, "177");
  sepsisEngine.next();
  assert.equal(sepsisEngine.getCurrentStateId(), "choque_septico");
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Perfusão reavaliada/);

  sepsisEngine.updateAuxiliaryStatus("fluidos", "realizado");
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Fluidos iniciados|Cristaloide registrado/);

  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Choque séptico reconhecido/);
  sepsisEngine.updateAuxiliaryStatus("vasopressor", "realizado");
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Noradrenalina iniciada/);
  panel = sepsisEngine.getAuxiliaryPanel();
  assert.equal(panel.title, "Choque séptico");
  sepsisEngine.runAuxiliaryAction("suggest_vasopressin");
  sepsisEngine.runAuxiliaryAction("consider_inotrope");
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Vasopressina sugerida/);
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Inotrópico considerado/);

  sepsisEngine.next();
  assert.equal(sepsisEngine.getCurrentStateId(), "source_control");
  sepsisEngine.updateReversibleCauseStatus("foco_pulmonar", "suspeita");
  sepsisEngine.updateReversibleCauseStatus("dispositivo_vascular", "abordada");
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Foco infeccioso marcado/);

  sepsisEngine.next();
  assert.equal(sepsisEngine.getCurrentStateId(), "reavaliacao_continua");
  sepsisEngine.next();
  assert.equal(sepsisEngine.getCurrentStateId(), "definir_destino");
  sepsisEngine.next("uti");
  assert.equal(sepsisEngine.getCurrentStateId(), "concluido");
  assert.match(JSON.stringify(sepsisEngine.getClinicalLog()), /Destino definido/);
  assert.match(sepsisEngine.getEncounterSummaryText(), /Choque séptico: Reconhecido/);
  assert.match(sepsisEngine.getEncounterSummaryText(), /Vasopressina: Sugerida/);
  assert.match(sepsisEngine.getEncounterSummaryText(), /Inotrópico: Considerado/);
  assert.match(sepsisEngine.getEncounterSummaryText(), /Focos suspeitos: 1/);
  assert.match(sepsisEngine.getEncounterSummaryText(), /Focos abordados: 1/);
  assert.match(sepsisEngine.getEncounterSummaryText(), /PAM/);
  assert.match(JSON.stringify(sepsisEngine.getEncounterSummary().panelMetrics), /mmol\/L/);
}

function testVasoactiveFlow() {
  resetClock();
  vasoactiveEngine.resetSession();

  assert.equal(vasoactiveEngine.getCurrentStateId(), "introducao");
  vasoactiveEngine.next();
  assert.equal(vasoactiveEngine.getCurrentStateId(), "selecionar_droga");

  vasoactiveEngine.next("noradrenalina");
  assert.equal(vasoactiveEngine.getCurrentStateId(), "selecionar_preparo");
  assert.match(
    JSON.stringify(vasoactiveEngine.getClinicalLog()),
    /Droga selecionada/
  );

  vasoactiveEngine.next("solucao_padrao:padrao-64:64 mcg\\/mL • 16 mg em 250 mL final");
  assert.equal(vasoactiveEngine.getCurrentStateId(), "selecionar_modo");

  vasoactiveEngine.next("dose_para_velocidade");
  assert.equal(vasoactiveEngine.getCurrentStateId(), "configurar_infusao");

  let panel = vasoactiveEngine.getAuxiliaryPanel();
  assert.equal(panel.title.includes("Noradrenalina"), true);
  vasoactiveEngine.updateAuxiliaryField("weightKg", "80");
  vasoactiveEngine.updateAuxiliaryField("doseInput", "0,30");
  panel = vasoactiveEngine.getAuxiliaryPanel();
  assert.match(JSON.stringify(panel.metrics), /mL\/h/);

  assert.throws(
    () => vasoactiveEngine.next(),
    /Confirme o preparo/
  );

  vasoactiveEngine.runAuxiliaryAction("confirm_prepare");
  const effects = vasoactiveEngine.consumeEffects();
  assert.match(JSON.stringify(effects), /Iniciar noradrenalina/);
  assert.match(JSON.stringify(effects), /Considerar associação de vasopressina/);
  assert.match(
    JSON.stringify(vasoactiveEngine.getClinicalLog()),
    /Associação de vasopressina sugerida/
  );

  vasoactiveEngine.next();
  assert.equal(vasoactiveEngine.getCurrentStateId(), "revisar_infusao");
  assert.match(
    JSON.stringify(vasoactiveEngine.getCurrentState()),
    /Conduta confirmada/
  );

  vasoactiveEngine.next("concluir");
  assert.equal(vasoactiveEngine.getCurrentStateId(), "concluido");
  assert.match(vasoactiveEngine.getEncounterSummaryText(), /Noradrenalina/);
}

async function runAllTests() {
  testShockableFlow();
  testCompleteShockableFlowScenario();
  testDetailedShockableSimulationLoggingAndGuidelines();
  testShockableInitialEpinephrineSpeaksAfterSecondShock();
  testShockableEpinephrineDoesNotRepeatEveryCycle();
  testShockableEpinephrineFollowsFormalTimingAcrossCycles();
  testAntiarrhythmicDoesNotRepeatAfterSecondDose();
  testProtocolSchemaValidation();
  testNonShockableFlow();
  testCompleteNonShockableFlowScenario();
  testDetailedNonShockableSimulationLoggingAndGuidelines();
  testNonShockableEpinephrineDoesNotRepeatEveryCycle();
  testNonShockablePendingEpinephrineDoesNotResuggestAcrossCycles();
  testNonShockableToShockableFlowStartsAtFirstShock();
  testTwoMinuteTimerWindowIsDeterministic();
  testEpinephrineIntervalWindow();
  testEngineDeterminismForRepeatedScenario();
  testEngineSubscriptionDrivesTemporalEventsWithoutUiLoop();
  testLatencyMetricsCaptureDispatchCommitAndSpeakStages();
  testOrchestratorAppliesStateBeforeHandlingEffects();
  testSpeechMapCanonicalKeys();
  testSpeechMapAliasesAndPriority();
  testAclsCaseLogTracksEventStateAndSpeak();
  testAclsCaseLogExportAndPersistence();
  testCaseLogEvaluationComputesMetricsFromLogOnly();
  testCaseLogEvaluationFlagsDelayAndCycleErrors();
  testClinicalCaseAnalysisSummarizesStrengthsAndDelays();
  testClinicalCaseAnalysisFlagsDelaysAndSuggestions();
  await testSpeechQueueSilencePolicy();
  await testSpeechQueueInterruptPolicyRespectsClinicalContext();
  await testSpeechQueueHumanizedDelay();
  testVoiceIntentMatching();
  testVoicePolicyRejectsInvalidStateIntent();
  testVoicePolicyDoesNotExposeStepAdvanceDuringContinuousCpr();
  testVoicePolicyRestrictsInitialRecognitionToConfirmOnly();
  testVoicePolicyRestrictsInitialCprToConfirmOnly();
  testVoicePolicyMatchesPulseCheckOptions();
  testVoicePolicySupportsDefibrillatorSelection();
  testVoicePolicyRestrictsShockStatesToShockConfirmationOnly();
  testVoiceConfirmationPolicy();
  testVoiceSensitiveConfirmationPolicy();
  testHighConfidenceRhythmVoiceSelectionDoesNotRequireConfirmation();
  testVoiceCommandExecutionMapping();
  testVoiceDefibrillatorCommandMapping();
  testVoiceDefibrillatorIntentMatching();
  testVoicePulseCheckCommandMapping();
  testVoiceCommandLogging();
  testVoiceNormalization();
  testVoiceLowConfidenceCategory();
  testVoiceTelemetrySummary();
  testVoiceContinuousModeToggle();
  testVoiceGenericConfirmWorksInRestrictedStates();
  testVoiceModePersistsAfterExecution();
  testVoicePolicyRecalculatesAfterStateChange();
  testVoicePendingConfirmationCreated();
  testVoicePendingConfirmationCancelled();
  testVoicePendingConfirmationTimeout();
  testVoiceCommandHintsPanel();
  testVoiceCommandHintsPendingPanel();
  testLowRiskVoiceCommandDoesNotRequireConfirmation();
  testLowConfidenceVoiceCommandRequiresConfirmation();
  testWebVoiceAdapterCompatibility();
  await testVoiceSessionControllerHalfDuplexTurn();
  await testVoiceSessionControllerDiscardsStaleTranscript();
  await testVoiceSessionControllerManualStateOrientation();
  testAdrenalineReminderDoesNotRepeatWithoutAdministration();
  testNonShockableEpinephrineRepeatsOnlyOnDueWindowAcrossManyCycles();
  testNonShockableEpinephrineRequiresTwoFullCyclesAfterAdministration();
  testShockableToNonShockableAtSecondRhythmCheckTriggersFirstEpinephrineOnlyOnce();
  testShockableToNonShockableAfterEpinephrineDoesNotCreateImmediateSecondDose();
  testEngineInvariants();
  testClinicalIntentDerivesFromState();
  testCyclePreCueEmitsOnceBeforeRhythmCheck();
  testShockPreCueSuppressesStateOrientation();
  testPreCueCancellationAfterStateChange();
  testIrrelevantPreCueDoesNotCreateNoise();
  testPresentationModes();
  testPresentationPrioritizesCprOverDrugPrompts();
  testNonShockableCprDoesNotRepeatEpinephrineAudioAfterAdministration();
  testScreenModelIntegration();
  testTimerExpiresWithPendingAction();
  testTrainingAdvanceCycleUpdatesEncounterDuration();
  testLateMedicationConfirmationKeepsEngineStable();
  testParallelDocumentationActionsRemainVisibleUntilEachIsConfirmed();
  testAdvancedAirwayRegistrationIsTracked();
  testShockableToNonShockableBranchChange();
  testRoscWithPendingReminderDoesNotLeakAlarm();
  testDefibrillatorTypeChangeDuringFlow();
  testOutOfOrderEventDoesNotBreakEngine();
  testStaleTimerAndRepeatedTimerEventsDoNotCorruptState();
  testRapidRepeatedInputsAreRejectedWithoutStateCorruption();
  testSameTimestampBurstRemainsDeterministicAndConsistent();
  testTerminalStateDoesNotAutoAdvance();
  testEffectsDoNotLeakBetweenStates();
  testReversibleCauseAssistantRanking();
  testReversibleCauseAssistantExplainsInsufficientData();
  testReversibleCauseAssistantTopThreeStability();
  testReversibleCauseAssistantScenarioSuite();
  testReversibleCauseAssistantRobustness();
  testReversibleCauseFeatureExtraction();
  testStructuredFeatureOutweighsWeakTextSignal();
  testTextDoesNotDuplicateStructuredFeatureSignal();
  testMissingDataShrinksWithStructuredSignals();
  testStructuredContextKeepsPneumothoraxAndTamponadeDistinct();
  testAssistantInsightLogging();
  testAclsDebriefSummary();
  testAclsCaseHistoryPersistence();
  testAclsCaseHistoryOrderingAndStability();
  testAclsDebriefTimelineAndReplay();
  testAclsReplayBlocksAndFilters();
  testDebriefDoesNotPromoteUncheckedHsAndTs();
  testAclsDebriefHandlesSparseCase();
  testAclsDebriefExportModelAndFormats();
  testAclsDebriefExportOrderStability();
  testAclsOperationalIndicatorsPendingAndVoiceFriction();
  testSepsisFlow();
  testVasoactiveFlow();
  console.log("Engine checks passed.");
}

runAllTests()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    Date.now = realDateNow;
  });
