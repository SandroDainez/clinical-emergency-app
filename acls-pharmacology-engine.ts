/**
 * Engine mínimo para o módulo "Farmacologia no ACLS".
 * A UI é autônoma (tela de referência estática); este engine apenas expõe
 * a interface ClinicalEngine para roteamento e registro correto no hub.
 */

import type {
  ClinicalEngine,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "./clinical-engine";

const PROTOCOL_ID = "farmacologia_acls";

const STATIC_STATE: ProtocolState = {
  type: "action",
  text: "Referência farmacológica no ACLS",
};

let _startedAt = Date.now();

function consumeEffects(): EngineEffect[] { return []; }
function getClinicalLog(): ClinicalLogEntry[] { return []; }
function getCurrentState(): ProtocolState { return STATIC_STATE; }
function getCurrentStateId(): string { return "farmacologia_acls_inicio"; }
function getDocumentationActions(): DocumentationAction[] { return []; }
function getEncounterReportHtml(): string { return ""; }

function getEncounterSummary(): EncounterSummary {
  const now = Date.now();
  const elapsed = Math.max(0, Math.floor((now - _startedAt) / 1000));
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return {
    protocolId: PROTOCOL_ID,
    durationLabel: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
    currentStateId: "farmacologia_acls_inicio",
    currentStateText: "Referência farmacológica no ACLS",
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

function getEncounterSummaryText(): string { return "Módulo de referência estática — Farmacologia no ACLS"; }
function getReversibleCauses(): ReversibleCause[] { return []; }
function getTimers(): TimerState[] { return []; }
function next(): ProtocolState { return STATIC_STATE; }
function registerExecution(): ClinicalLogEntry[] { return []; }
function resetSession(): ProtocolState { _startedAt = Date.now(); return STATIC_STATE; }
function tick(): ProtocolState { return STATIC_STATE; }
function updateReversibleCauseStatus(): ReversibleCause[] { return []; }

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
} satisfies Partial<ClinicalEngine>;
