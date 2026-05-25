import protocol from "./protocols/correcoes_eletroliticas.json";
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

type StateType = "action" | "question" | "end";

type State = {
  type: StateType;
  text: string;
  speak?: string;
  details?: string[];
  next?: string;
  options?: Record<string, string>;
};

type Protocol = {
  id: string;
  initialState: string;
  states: Record<string, State>;
};

const protocolData = protocol as Protocol;

let currentStateId = protocolData.initialState;
let pendingEffects: EngineEffect[] = [];
const clinicalLog: ClinicalLogEntry[] = [];

function getState(id = currentStateId): ProtocolState {
  const state = protocolData.states[id];
  return {
    type: state.type,
    text: state.text,
    speak: state.speak,
    details: state.details,
    options: state.options,
  };
}

function pushLog(title: string, details?: string) {
  clinicalLog.push({
    timestamp: Date.now(),
    kind: "electrolyte_module",
    title,
    details,
  });
}

export function getCurrentState(): ProtocolState {
  return getState();
}

export function getCurrentStateId(): string {
  return currentStateId;
}

export function next(input?: string): ProtocolState {
  const state = protocolData.states[currentStateId];
  const nextStateId = (input && state.options?.[input]) || state.next || currentStateId;
  currentStateId = nextStateId;
  pushLog("Navegação no módulo", `${state.text} → ${protocolData.states[nextStateId]?.text ?? nextStateId}`);
  return getState();
}

export function resetSession(): ProtocolState {
  currentStateId = protocolData.initialState;
  pendingEffects = [];
  clinicalLog.length = 0;
  return getState();
}

export function tick(): ProtocolState {
  return getState();
}

export function consumeEffects(): EngineEffect[] {
  const effects = [...pendingEffects];
  pendingEffects = [];
  return effects;
}

export function getClinicalLog(): ClinicalLogEntry[] {
  return [...clinicalLog];
}

export function getDocumentationActions(): DocumentationAction[] {
  return [];
}

export function registerExecution(): ClinicalLogEntry[] {
  return [];
}

export function getReversibleCauses(): ReversibleCause[] {
  return [];
}

export function updateReversibleCauseStatus(): ReversibleCause[] {
  return [];
}

export function getTimers(): TimerState[] {
  return [];
}

export function getEncounterSummary(): EncounterSummary {
  return {
    protocolId: protocolData.id,
    durationLabel: "Calculadora",
    currentStateId,
    currentStateText: protocolData.states[currentStateId]?.text ?? "Correções eletrolíticas",
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: clinicalLog.slice(-3).map((entry) => entry.title),
    panelMetrics: [
      { label: "Módulo", value: "Eletrólitos" },
      { label: "Uso", value: "Calculadora" },
    ],
  };
}

export function getEncounterSummaryText(): string {
  return "Correções eletrolíticas com calculadoras práticas e orientação de preparo.";
}

export function getEncounterReportHtml(): string {
  return `
    <section>
      <h1>Correções eletrolíticas</h1>
      <p>Ferramenta de apoio para cálculo, preparo e velocidade de infusão.</p>
    </section>
  `;
}

export default {
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
} satisfies ClinicalEngine;
