/**
 * reasoning-engines.ts
 * Stubs ClinicalEngine para os módulos de raciocínio clínico (telas de fluxo
 * autônomas). Cada um expõe a interface mínima para registro/roteamento no hub.
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

function makeStub(protocolId: string, text: string) {
  const STATIC_STATE: ProtocolState = { type: "action", text };
  return {
    consumeEffects: (): EngineEffect[] => [],
    getClinicalLog: (): ClinicalLogEntry[] => [],
    getCurrentState: (): ProtocolState => STATIC_STATE,
    getCurrentStateId: (): string => `${protocolId}_inicio`,
    getDocumentationActions: (): DocumentationAction[] => [],
    getEncounterReportHtml: (): string => "",
    getEncounterSummary: (): EncounterSummary => ({
      protocolId,
      durationLabel: "Fluxo",
      currentStateId: `${protocolId}_inicio`,
      currentStateText: text,
      shockCount: 0,
      adrenalineSuggestedCount: 0,
      adrenalineAdministeredCount: 0,
      antiarrhythmicSuggestedCount: 0,
      antiarrhythmicAdministeredCount: 0,
      suspectedCauses: [],
      addressedCauses: [],
      lastEvents: [],
    }),
    getEncounterSummaryText: (): string => text,
    getReversibleCauses: (): ReversibleCause[] => [],
    getTimers: (): TimerState[] => [],
    next: (): ProtocolState => STATIC_STATE,
    registerExecution: (): ClinicalLogEntry[] => [],
    resetSession: (): ProtocolState => STATIC_STATE,
    tick: (): ProtocolState => STATIC_STATE,
    updateReversibleCauseStatus: (): ReversibleCause[] => [],
  } satisfies ClinicalEngine;
}

// Politrauma & emergências
export const politraumaEngine = makeStub("politrauma", "Politrauma — atendimento inicial");
export const tceEngine = makeStub("tce", "Traumatismo cranioencefálico");
export const seizureEngine = makeStub("mal_epileptico", "Crises convulsivas e mal epiléptico");
export const poisoningEngine = makeStub("intoxicacoes_exogenas", "Intoxicações exógenas");
export const acuteAbdomenEngine = makeStub("abdome_agudo", "Abdome agudo");
// Reaproveitados dos antigos fluxogramas de raciocínio clínico
export const shockEngine = makeStub("choque", "Choque — diagnóstico e conduta");
export const dyspneaEngine = makeStub("insuficiencia_respiratoria", "Insuficiência respiratória");
