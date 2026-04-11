/**
 * Engine mínimo para o módulo ISR (intubação em sequência rápida).
 * A UI é autônoma; o engine só expõe a interface ClinicalEngine para roteamento e resumos.
 */

import raw from "./protocols/isr_rapida.json";
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

type ProtocolJson = {
  id: string;
  initialState: string;
  states: Record<string, ProtocolState>;
};

const protocolData = raw as ProtocolJson;

type Session = {
  protocolId: string;
  currentStateId: string;
  protocolStartedAt: number;
  history: { timestamp: number; type: string }[];
};

let session: Session = createSession();

function createSession(): Session {
  return {
    protocolId: protocolData.id,
    currentStateId: protocolData.initialState,
    protocolStartedAt: Date.now(),
    history: [{ timestamp: Date.now(), type: "MODULE_OPENED" }],
  };
}

function formatElapsed(now: number) {
  const s = Math.max(0, Math.floor((now - session.protocolStartedAt) / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function getStateTemplate(stateId: string): ProtocolState {
  const st = protocolData.states[stateId];
  if (!st) throw new Error(`Estado ISR inválido: ${stateId}`);
  return st;
}

function consumeEffects(): EngineEffect[] {
  return [];
}

function getClinicalLog(): ClinicalLogEntry[] {
  return session.history.map((e) => ({
    timestamp: e.timestamp,
    kind: "action_executed",
    title: e.type === "MODULE_OPENED" ? "Módulo ISR aberto" : "Evento",
    details: e.type,
  }));
}

function getCurrentState(): ProtocolState {
  return getStateTemplate(session.currentStateId);
}

function getCurrentStateId(): string {
  return session.currentStateId;
}

function getDocumentationActions(): DocumentationAction[] {
  return [];
}

function getEncounterSummary(): EncounterSummary {
  return {
    protocolId: session.protocolId,
    durationLabel: formatElapsed(Date.now()),
    currentStateId: session.currentStateId,
    currentStateText: getCurrentState().text,
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: ["ISR — fluxo clínico"],
    metrics: [
      { label: "Módulo", value: "Intubação em sequência rápida" },
      { label: "Modo", value: "Referência + checklist" },
    ],
  };
}

function getEncounterSummaryText(): string {
  const s = getEncounterSummary();
  const lines = [
    "Módulo: Intubação em sequência rápida (ISR)",
    `Tempo: ${s.durationLabel}`,
    s.currentStateText,
    "",
    "Este módulo é suporte à decisão. Registre condutas no prontuário conforme protocolo local.",
  ];
  return lines.join("\n");
}

function escapeHtml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getEncounterReportHtml(): string {
  const s = getEncounterSummary();
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"/><title>ISR — Resumo</title>
<style>body{font-family:system-ui;margin:32px;color:#111827}</style></head>
<body>
<h1>Intubação em sequência rápida</h1>
<p>Tempo: ${escapeHtml(s.durationLabel)}</p>
<p>${escapeHtml(s.currentStateText)}</p>
<p><em>Conteúdo detalhado consulte no aplicativo; registrar decisões no prontuário.</em></p>
</body></html>`;
}

function getReversibleCauses(): ReversibleCause[] {
  return [];
}

function getTimers(): TimerState[] {
  return [];
}

function next(): ProtocolState {
  return getCurrentState();
}

function registerExecution(): ClinicalLogEntry[] {
  return getClinicalLog();
}

function resetSession(): ProtocolState {
  session = createSession();
  return getCurrentState();
}

function tick(): ProtocolState {
  return getCurrentState();
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

export type { ClinicalEngine };
