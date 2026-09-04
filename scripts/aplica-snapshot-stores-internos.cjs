#!/usr/bin/env node
const fs = require('node:fs');

function replaceOnce(path, before, after) {
  const src = fs.readFileSync(path, 'utf8');
  if (!src.includes(before)) throw new Error(`${path}: trecho esperado não encontrado`);
  fs.writeFileSync(path, src.replace(before, after));
}

replaceOnce(
  'lib/clinical-observation-decision-gate.ts',
`/** Novo atendimento: nenhuma confirmação anterior pode sobreviver. */\nexport function clearObservationDecisionConfirmations(): void {\n  confirmations.clear();\n}`,
`export type ObservationDecisionConfirmationSnapshot = StaleConfirmation[];\n\nexport function exportObservationDecisionConfirmationsSnapshot(): ObservationDecisionConfirmationSnapshot {\n  return [...confirmations.values()].map((item) => ({ ...item }));\n}\n\nexport function restoreObservationDecisionConfirmationsSnapshot(snapshot: ObservationDecisionConfirmationSnapshot): void {\n  clearObservationDecisionConfirmations();\n  for (const item of snapshot) {\n    if (!item.decisionId.trim() || !item.observationId.trim()) {\n      throw new Error("Snapshot de confirmação de observação inválido");\n    }\n    if (!Number.isFinite(item.observationRecordedAt) || !Number.isFinite(item.confirmedAt)) {\n      throw new Error("Snapshot de confirmação de observação com timestamp inválido");\n    }\n    confirmations.set(confirmationKey(item.decisionId, item.observationId), { ...item });\n  }\n}\n\n/** Novo atendimento: nenhuma confirmação anterior pode sobreviver. */\nexport function clearObservationDecisionConfirmations(): void {\n  confirmations.clear();\n}`
);

replaceOnce(
  'lib/clinical-vasopressor-reassessment.ts',
`export function clearVasopressorReassessmentState(): void {\n  pendingByModule.clear();\n}`,
`export type VasopressorReassessmentSnapshot = Array<{ moduleId: string; reassessmentId: string }>;\n\nexport function exportVasopressorReassessmentSnapshot(): VasopressorReassessmentSnapshot {\n  return [...pendingByModule.entries()].map(([moduleId, reassessmentId]) => ({ moduleId, reassessmentId }));\n}\n\nexport function restoreVasopressorReassessmentSnapshot(snapshot: VasopressorReassessmentSnapshot): void {\n  clearVasopressorReassessmentState();\n  for (const item of snapshot) {\n    if (!item.moduleId.trim() || !item.reassessmentId.trim()) {\n      throw new Error("Snapshot de reavaliação de vasopressor inválido");\n    }\n    pendingByModule.set(item.moduleId, item.reassessmentId);\n  }\n}\n\nexport function clearVasopressorReassessmentState(): void {\n  pendingByModule.clear();\n}`
);

replaceOnce(
  'lib/clinical-reassessment-node-runtime.ts',
`export function clearClinicalReassessmentNodeRuntime(): void {\n  pendingByBinding.clear();\n}`,
`export type ClinicalReassessmentNodeRuntimeSnapshot = Array<{ bindingKey: string; reassessmentId: string }>;\n\nexport function exportClinicalReassessmentNodeRuntimeSnapshot(): ClinicalReassessmentNodeRuntimeSnapshot {\n  return [...pendingByBinding.entries()].map(([bindingKey, reassessmentId]) => ({ bindingKey, reassessmentId }));\n}\n\nexport function restoreClinicalReassessmentNodeRuntimeSnapshot(snapshot: ClinicalReassessmentNodeRuntimeSnapshot): void {\n  clearClinicalReassessmentNodeRuntime();\n  for (const item of snapshot) {\n    if (!item.bindingKey.trim() || !item.reassessmentId.trim()) {\n      throw new Error("Snapshot do vínculo de reavaliação clínica inválido");\n    }\n    pendingByBinding.set(item.bindingKey, item.reassessmentId);\n  }\n}\n\nexport function clearClinicalReassessmentNodeRuntime(): void {\n  pendingByBinding.clear();\n}`
);

console.log('✅ HND-02b wave 2: adapters internos de confirmação e reavaliação preparados');

// workflow trigger: HND-02b wave 2
