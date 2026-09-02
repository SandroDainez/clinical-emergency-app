import { clearClinicalEventLog } from "./clinical-event-log";
import { clearClinicalInterruptions } from "./clinical-interruption-session";
import { clearClinicalObservations } from "./clinical-observations";
import { clearClinicalReassessmentNodeRuntime } from "./clinical-reassessment-node-runtime";
import { clearPendingClinicalReassessments } from "./clinical-reassessment-runtime";
import { clearVasopressorReassessmentState } from "./clinical-vasopressor-reassessment";
import { limparContextoDoPaciente } from "./contexto-do-paciente";

let currentCaseId: string | undefined;
let currentCaseStartedAt: number | undefined;

export type ClinicalSessionRuntime = {
  caseId?: string;
  startedAt?: number;
};

/**
 * Inicia um novo atendimento e limpa TODO estado transitório do paciente.
 *
 * A regra é deliberadamente central: adicionar um novo store clínico no futuro
 * exige adicioná-lo aqui, em vez de confiar que cada tela lembrará de limpar.
 */
export function startClinicalCase(caseId: string, now: number = Date.now()): ClinicalSessionRuntime {
  const id = caseId.trim();
  if (!id) throw new Error("Não é possível iniciar atendimento sem caseId");

  clearClinicalEventLog();
  clearClinicalInterruptions();
  clearClinicalObservations();
  clearClinicalReassessmentNodeRuntime();
  clearPendingClinicalReassessments();
  clearVasopressorReassessmentState();
  limparContextoDoPaciente();

  currentCaseId = id;
  currentCaseStartedAt = now;
  return { caseId: currentCaseId, startedAt: currentCaseStartedAt };
}

export function getClinicalSessionRuntime(): ClinicalSessionRuntime {
  return {
    caseId: currentCaseId,
    startedAt: currentCaseStartedAt,
  };
}

/**
 * Encerra o vínculo do runtime. Os dados permanecem disponíveis para debrief
 * até que um novo caso seja iniciado; novo caso sempre limpa tudo primeiro.
 */
export function closeClinicalCase(): void {
  currentCaseId = undefined;
  currentCaseStartedAt = undefined;
}
