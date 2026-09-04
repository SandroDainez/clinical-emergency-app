#!/usr/bin/env node
const fs = require('node:fs');

function replaceOnce(path, before, after) {
  const src = fs.readFileSync(path, 'utf8');
  if (!src.includes(before)) throw new Error(`${path}: trecho esperado não encontrado`);
  fs.writeFileSync(path, src.replace(before, after));
}

replaceOnce(
  'lib/clinical-session-runtime.ts',
  'import { limparContextoDoPaciente } from "./contexto-do-paciente";',
  'import { limparContextoDoPaciente } from "./contexto-do-paciente";\nimport { clearActiveClinicalCaseMarker } from "./clinical-case-reload-marker";'
);

replaceOnce(
  'lib/clinical-session-runtime.ts',
`export function closeClinicalCase(): void {
  currentCaseId = undefined;
  currentCaseStartedAt = undefined;
}`,
`export function closeClinicalCase(): void {
  currentCaseId = undefined;
  currentCaseStartedAt = undefined;
  clearActiveClinicalCaseMarker();
}`
);

replaceOnce(
  'components/clinical-app.tsx',
  'import { createClinicalCaseId, getClinicalSessionRuntime, startClinicalCase } from "../lib/clinical-session-runtime";',
`import { createClinicalCaseId, getClinicalSessionRuntime, startClinicalCase } from "../lib/clinical-session-runtime";
import ClinicalCaseRecoveryGate from "./clinical-case-recovery-gate";
import {
  clearActiveClinicalCaseMarker,
  detectInterruptedClinicalCase,
  writeActiveClinicalCaseMarker,
  type PersistedClinicalCaseMarker,
} from "../lib/clinical-case-reload-marker";`
);

replaceOnce(
  'components/clinical-app.tsx',
`  const [resumeSession] = useState(() => consumeProtocolSessionResume(protocolId));
  const [caseBoundaryReady, setCaseBoundaryReady] = useState(false);`,
`  const [resumeSession] = useState(() => consumeProtocolSessionResume(protocolId));
  const [caseBoundaryReady, setCaseBoundaryReady] = useState(false);
  const [interruptedCase, setInterruptedCase] = useState<PersistedClinicalCaseMarker | undefined>(undefined);`
);

replaceOnce(
  'components/clinical-app.tsx',
`  useEffect(() => {
    const active = getClinicalSessionRuntime();
    const mayContinue = (continuingClinicalCase || resumeSession) && Boolean(active.caseId);
    if (!mayContinue) {
      startClinicalCase(createClinicalCaseId(protocolId));
    }
    setCaseBoundaryReady(true);
  }, [continuingClinicalCase, protocolId, resumeSession]);`,
`  useEffect(() => {
    const active = getClinicalSessionRuntime();
    const mayContinue = (continuingClinicalCase || resumeSession) && Boolean(active.caseId);
    if (!mayContinue) {
      const interrupted = detectInterruptedClinicalCase(active.caseId);
      if (interrupted) {
        setInterruptedCase(interrupted);
        setCaseBoundaryReady(false);
        return;
      }
      const next = startClinicalCase(createClinicalCaseId(protocolId));
      if (next.caseId && next.startedAt !== undefined) {
        writeActiveClinicalCaseMarker({
          caseId: next.caseId,
          protocolId,
          startedAt: next.startedAt,
          updatedAt: Date.now(),
        });
      }
    }
    setCaseBoundaryReady(true);
  }, [continuingClinicalCase, protocolId, resumeSession]);`
);

replaceOnce(
  'components/clinical-app.tsx',
`  if (!caseBoundaryReady) return null;`,
`  if (interruptedCase) {
    return (
      <ClinicalCaseRecoveryGate
        caseId={interruptedCase.caseId}
        protocolId={interruptedCase.protocolId}
        startedAt={interruptedCase.startedAt}
        onDiscardAndStartNew={() => {
          clearActiveClinicalCaseMarker();
          const next = startClinicalCase(createClinicalCaseId(protocolId));
          engine.resetSession?.();
          clearProtocolUiState(protocolId);
          if (next.caseId && next.startedAt !== undefined) {
            writeActiveClinicalCaseMarker({
              caseId: next.caseId,
              protocolId,
              startedAt: next.startedAt,
              updatedAt: Date.now(),
            });
          }
          setInterruptedCase(undefined);
          setCaseBoundaryReady(true);
        }}
      />
    );
  }

  if (!caseBoundaryReady) return null;`
);

console.log('✅ HND-02a: reload com caso volátil perdido agora falha fechado antes de reiniciar o fluxo');
