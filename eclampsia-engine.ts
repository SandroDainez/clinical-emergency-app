/**
 * Engine mínimo para o módulo "Pré-eclâmpsia e Eclâmpsia".
 * A UI é autônoma (tela de fluxo de decisão); este engine apenas expõe
 * a interface ClinicalEngine para roteamento e registro correto no hub.
 */

import type {
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "./clinical-engine";

const PROTOCOL_ID = "pre_eclampsia_eclampsia";

const STATIC_STATE: ProtocolState = {
  type: "action",
  text: "Pré-eclâmpsia e eclâmpsia",
};

let _startedAt = Date.now();

function consumeEffects(): EngineEffect[] {
  return [];
}

function getClinicalLog(): ClinicalLogEntry[] {
  return [];
}

function getCurrentState(): ProtocolState {
  return STATIC_STATE;
}

function getCurrentStateId(): string {
  return "eclampsia_inicio";
}

function getDocumentationActions(): DocumentationAction[] {
  return [];
}

function getEncounterReportHtml(): string {
  return "";
}

function getEncounterSummary(): EncounterSummary {
  const now = Date.now();
  const elapsed = Math.max(0, Math.floor((now - _startedAt) / 1000));
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return {
    protocolId: PROTOCOL_ID,
    durationLabel: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
    currentStateId: "eclampsia_inicio",
    currentStateText: "Pré-eclâmpsia e eclâmpsia",
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: [],
  };
}

function getEncounterSummaryText(): string {
  return "Módulo de fluxo — Pré-eclâmpsia e Eclâmpsia";
}

function getReversibleCauses(): ReversibleCause[] {
  return [];
}

function getTimers(): TimerState[] {
  return [];
}

function next(): ProtocolState {
  return STATIC_STATE;
}

function registerExecution(): ClinicalLogEntry[] {
  return [];
}

function resetSession(): ProtocolState {
  _startedAt = Date.now();
  return STATIC_STATE;
}

function tick(): ProtocolState {
  return STATIC_STATE;
}

function updateReversibleCauseStatus(): ReversibleCause[] {
  return [];
}

export {
  consumeEffects,
  getClinicalLog,
  getCurrentState,
  getCurrentStateId,
  getDocumentationActions,
  getEncounterReportHtml,
  getEncounterSummary,
  getEncounterSummaryText,
  getReversibleCauses,
  getTimers,
  next,
  registerExecution,
  resetSession,
  tick,
  updateReversibleCauseStatus,
};
