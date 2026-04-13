/**
 * Engine mínimo para o módulo "Taquicardia no ACLS".
 * Tela de referência estática; engine apenas expõe ClinicalEngine para roteamento.
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

const PROTOCOL_ID = "taquicardia_acls";

const STATIC_STATE: ProtocolState = {
  type: "action",
  text: "Referência — Taquicardia no ACLS",
};

let _startedAt = Date.now();

function consumeEffects(): EngineEffect[] { return []; }
function getClinicalLog(): ClinicalLogEntry[] { return []; }
function getCurrentState(): ProtocolState { return STATIC_STATE; }
function getCurrentStateId(): string { return "taquicardia_acls_inicio"; }
function getDocumentationActions(): DocumentationAction[] { return []; }
function getEncounterReportHtml(): string { return ""; }

function getEncounterSummary(): EncounterSummary {
  const now = Date.now();
  const elapsed = Math.max(0, Math.floor((now - _startedAt) / 1000));
  const m = Math.floor(elapsed / 60);
  const sc = elapsed % 60;
  return {
    protocolId: PROTOCOL_ID,
    durationLabel: `${String(m).padStart(2, "0")}:${String(sc).padStart(2, "0")}`,
    currentStateId: "taquicardia_acls_inicio",
    currentStateText: "Referência — Taquicardia no ACLS",
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

function getEncounterSummaryText(): string { return "Módulo de referência estática — Taquicardia no ACLS"; }
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
};
