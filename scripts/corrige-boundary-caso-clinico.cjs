#!/usr/bin/env node
const fs = require('node:fs');

function replaceOnce(path, before, after) {
  const src = fs.readFileSync(path, 'utf8');
  if (!src.includes(before)) throw new Error(`${path}: trecho esperado não encontrado`);
  fs.writeFileSync(path, src.replace(before, after));
}

replaceOnce(
  'lib/clinical-session-runtime.ts',
`let currentCaseId: string | undefined;
let currentCaseStartedAt: number | undefined;`,
`let currentCaseId: string | undefined;
let currentCaseStartedAt: number | undefined;
let generatedCaseSequence = 0;`
);
replaceOnce(
  'lib/clinical-session-runtime.ts',
`export function getClinicalSessionRuntime(): ClinicalSessionRuntime {
  return {
    caseId: currentCaseId,
    startedAt: currentCaseStartedAt,
  };
}`,
`export function getClinicalSessionRuntime(): ClinicalSessionRuntime {
  return {
    caseId: currentCaseId,
    startedAt: currentCaseStartedAt,
  };
}

export function createClinicalCaseId(protocolId?: string, now: number = Date.now()): string {
  generatedCaseSequence += 1;
  const prefix = protocolId?.trim() || "clinical-case";
  return `${prefix}:${now}:${generatedCaseSequence}`;
}`
);

replaceOnce(
  'lib/module-session-navigation.ts',
`const preservedProtocolSessions = new Set<string>();`,
`import { getClinicalSessionRuntime } from "./clinical-session-runtime";

const RESUME_TTL_MS = 30 * 60 * 1000;
type ResumeMarker = { caseId: string; markedAt: number };
const preservedProtocolSessions = new Map<string, ResumeMarker>();`
);
replaceOnce(
  'lib/module-session-navigation.ts',
`const preMarcacaoDeCausas = new Map<string, string[]>();`,
`const preMarcacaoDeCausas = new Map<string, { caseId: string; markedAt: number; causas: string[] }>();

function currentCaseId(): string | undefined {
  return getClinicalSessionRuntime().caseId;
}

function markerIsValid(marker: ResumeMarker | undefined, now: number = Date.now()): marker is ResumeMarker {
  if (!marker) return false;
  const activeCaseId = currentCaseId();
  return Boolean(activeCaseId && marker.caseId === activeCaseId && now - marker.markedAt <= RESUME_TTL_MS);
}`
);
replaceOnce(
  'lib/module-session-navigation.ts',
`function markProtocolSessionForResume(protocolId: string, causasSuspeitas?: string[]) {
  if (!protocolId) {
    return;
  }
  preservedProtocolSessions.add(protocolId);
  if (causasSuspeitas?.length) {
    preMarcacaoDeCausas.set(protocolId, [...causasSuspeitas]);
  }
}`,
`function markProtocolSessionForResume(protocolId: string, causasSuspeitas?: string[]) {
  if (!protocolId) return;
  const caseId = currentCaseId();
  if (!caseId) return;
  const markedAt = Date.now();
  preservedProtocolSessions.set(protocolId, { caseId, markedAt });
  if (causasSuspeitas?.length) {
    preMarcacaoDeCausas.set(protocolId, { caseId, markedAt, causas: [...causasSuspeitas] });
  }
}`
);
replaceOnce(
  'lib/module-session-navigation.ts',
`function consumeCausasPreMarcadas(protocolId: string): string[] {
  const causas = preMarcacaoDeCausas.get(protocolId) ?? [];
  if (causas.length) {
    preMarcacaoDeCausas.delete(protocolId);
  }
  return causas;
}

function isProtocolSessionMarkedForResume(protocolId: string) {
  return preservedProtocolSessions.has(protocolId);
}

function consumeProtocolSessionResume(protocolId: string) {
  const marked = preservedProtocolSessions.has(protocolId);
  if (marked) {
    preservedProtocolSessions.delete(protocolId);
  }
  return marked;
}`,
`function consumeCausasPreMarcadas(protocolId: string): string[] {
  const marker = preMarcacaoDeCausas.get(protocolId);
  preMarcacaoDeCausas.delete(protocolId);
  if (!marker) return [];
  if (!markerIsValid({ caseId: marker.caseId, markedAt: marker.markedAt })) return [];
  return marker.causas;
}

function isProtocolSessionMarkedForResume(protocolId: string) {
  const marker = preservedProtocolSessions.get(protocolId);
  if (markerIsValid(marker)) return true;
  preservedProtocolSessions.delete(protocolId);
  preMarcacaoDeCausas.delete(protocolId);
  return false;
}

function consumeProtocolSessionResume(protocolId: string) {
  const marker = preservedProtocolSessions.get(protocolId);
  preservedProtocolSessions.delete(protocolId);
  if (!markerIsValid(marker)) {
    preMarcacaoDeCausas.delete(protocolId);
    return false;
  }
  return true;
}`
);

replaceOnce(
  'components/clinical-app.tsx',
`import { clearProtocolUiState } from "../lib/module-ui-state";`,
`import { clearProtocolUiState } from "../lib/module-ui-state";
import { createClinicalCaseId, getClinicalSessionRuntime, startClinicalCase } from "../lib/clinical-session-runtime";`
);
replaceOnce(
  'components/clinical-app.tsx',
`  initialReferralFields?: Record<string, string>;
};`,
`  initialReferralFields?: Record<string, string>;
  continuingClinicalCase?: boolean;
};`
);
replaceOnce(
  'components/clinical-app.tsx',
`  onRouteBack,
  initialReferralFields,
}: ClinicalAppProps) {`,
`  onRouteBack,
  initialReferralFields,
  continuingClinicalCase = false,
}: ClinicalAppProps) {`
);
replaceOnce(
  'components/clinical-app.tsx',
`  const [resumeSession] = useState(() => consumeProtocolSessionResume(protocolId));`,
`  const [resumeSession] = useState(() => consumeProtocolSessionResume(protocolId));
  const [caseBoundaryReady, setCaseBoundaryReady] = useState(false);`
);
replaceOnce(
  'components/clinical-app.tsx',
`  useEffect(() => {
    preloadWebAudio();
  }, []);`,
`  useEffect(() => {
    const active = getClinicalSessionRuntime();
    const mayContinue = (continuingClinicalCase || resumeSession) && Boolean(active.caseId);
    if (!mayContinue) {
      startClinicalCase(createClinicalCaseId(protocolId));
    }
    setCaseBoundaryReady(true);
  }, [continuingClinicalCase, protocolId, resumeSession]);

  useEffect(() => {
    preloadWebAudio();
  }, []);`
);
replaceOnce(
  'components/clinical-app.tsx',
`  // Raciocínio clínico (fluxos de referência) — sem consent gate, sem voz
  if (isShockFlowModule) {`,
`  if (!caseBoundaryReady) return null;

  // Raciocínio clínico (fluxos de referência) — sem consent gate, sem voz
  if (isShockFlowModule) {`
);

replaceOnce(
  'app/modulos/[id].tsx',
`import { MODULES_HUB_HREF } from "../../lib/modules-hub-route";`,
`import { MODULES_HUB_HREF } from "../../lib/modules-hub-route";
import { isProtocolSessionMarkedForResume } from "../../lib/module-session-navigation";`
);
replaceOnce(
  'app/modulos/[id].tsx',
`  const sourceModule = sourceModuleId ? getClinicalModuleById(sourceModuleId) : undefined;`,
`  const sourceModule = sourceModuleId ? getClinicalModuleById(sourceModuleId) : undefined;
  const protocolId = clinicalModule?.engine.getEncounterSummary().protocolId;
  const continuingClinicalCase = Boolean(
    sourceModuleId || (protocolId && isProtocolSessionMarkedForResume(protocolId))
  );`
);
replaceOnce(
  'app/modulos/[id].tsx',
`        <ClinicalApp engine={clinicalModule.engine} onRouteBack={goBackTarget} />`,
`        <ClinicalApp
          engine={clinicalModule.engine}
          onRouteBack={goBackTarget}
          continuingClinicalCase={continuingClinicalCase}
        />`
);

console.log('✅ STATE-01/HND-01: novo atendimento ganha boundary central; retomada exige mesmo caseId + TTL');