import type { AclsDebrief, AclsDebriefExport } from "./debrief";
import { buildAclsDebriefExport } from "./debrief";
import type { AclsCaseLogEntry } from "./domain";
import type { EncounterSummary } from "../clinical-engine";

type PersistedAclsCaseSummary = {
  durationLabel: string;
  currentStateText: string;
  shockCount: number;
  cyclesCompleted: number;
  roscOccurred: boolean;
  voiceCommands: number;
  topCauseLabels: string[];
};

type PersistedAclsCase = {
  id: string;
  savedAt: number;
  protocolId: string;
  encounterSummary: EncounterSummary;
  summary: PersistedAclsCaseSummary;
  indicators: AclsDebrief["summary"]["indicators"];
  debrief: AclsDebrief;
  exportModel: AclsDebriefExport;
  caseLog: AclsCaseLogEntry[];
};

type CaseHistoryStorageAdapter = {
  read: () => string | null;
  write: (value: string) => void;
};

const STORAGE_KEY = "medical-copilot:acls-case-history:v1";
let memoryStorageValue: string | null = null;

function getDefaultCaseHistoryStorageAdapter(): CaseHistoryStorageAdapter {
  if (typeof window !== "undefined" && window.localStorage) {
    return {
      read: () => window.localStorage.getItem(STORAGE_KEY),
      write: (value) => {
        window.localStorage.setItem(STORAGE_KEY, value);
      },
    };
  }

  return {
    read: () => memoryStorageValue,
    write: (value) => {
      memoryStorageValue = value;
    },
  };
}

function safeParseCases(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function listPersistedAclsCases(
  adapter: CaseHistoryStorageAdapter = getDefaultCaseHistoryStorageAdapter()
): PersistedAclsCase[] {
  return safeParseCases(adapter.read())
    .filter((item): item is PersistedAclsCase => Boolean(item?.id && item?.debrief))
    .sort((left, right) => right.savedAt - left.savedAt);
}

function getPersistedAclsCase(
  id: string,
  adapter: CaseHistoryStorageAdapter = getDefaultCaseHistoryStorageAdapter()
) {
  return listPersistedAclsCases(adapter).find((item) => item.id === id) ?? null;
}

function savePersistedAclsCase(
  persistedCase: PersistedAclsCase,
  adapter: CaseHistoryStorageAdapter = getDefaultCaseHistoryStorageAdapter(),
  limit = 30
) {
  const existing = listPersistedAclsCases(adapter).filter((item) => item.id !== persistedCase.id);
  const next = [persistedCase, ...existing].sort((left, right) => right.savedAt - left.savedAt);
  adapter.write(JSON.stringify(next.slice(0, limit)));
  return next.slice(0, limit);
}

function buildPersistedAclsCaseId(
  encounterSummary: EncounterSummary,
  debrief: AclsDebrief
) {
  const seedTimestamp = debrief.timeline[0]?.timestamp ?? Date.now();
  return `${encounterSummary.protocolId}:${seedTimestamp}`;
}

function buildPersistedAclsCase(
  encounterSummary: EncounterSummary,
  debrief: AclsDebrief,
  caseLog: AclsCaseLogEntry[] = []
): PersistedAclsCase {
  return {
    id: buildPersistedAclsCaseId(encounterSummary, debrief),
    savedAt: Date.now(),
    protocolId: encounterSummary.protocolId,
    encounterSummary,
    summary: {
      durationLabel: encounterSummary.durationLabel,
      currentStateText: encounterSummary.currentStateText,
      shockCount: encounterSummary.shockCount,
      cyclesCompleted: debrief.summary.cyclesCompleted,
      roscOccurred: debrief.summary.roscOccurred,
      voiceCommands: debrief.summary.voiceTelemetry.totalCommands,
      topCauseLabels: debrief.summary.topCauseSummaries.map((cause) => cause.label),
    },
    indicators: debrief.summary.indicators,
    debrief,
    exportModel: buildAclsDebriefExport(debrief, encounterSummary, caseLog),
    caseLog: [...caseLog],
  };
}

export type { CaseHistoryStorageAdapter, PersistedAclsCase, PersistedAclsCaseSummary };
export {
  buildPersistedAclsCase,
  buildPersistedAclsCaseId,
  getDefaultCaseHistoryStorageAdapter,
  getPersistedAclsCase,
  listPersistedAclsCases,
  savePersistedAclsCase,
};
