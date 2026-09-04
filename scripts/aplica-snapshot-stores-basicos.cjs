#!/usr/bin/env node
const fs = require('node:fs');

function replaceOnce(path, before, after) {
  const src = fs.readFileSync(path, 'utf8');
  if (!src.includes(before)) throw new Error(`${path}: trecho esperado não encontrado`);
  fs.writeFileSync(path, src.replace(before, after));
}

replaceOnce(
  'lib/clinical-event-log.ts',
`export function clearClinicalEventLog(): void {\n  events.length = 0;\n}`,
`export function exportClinicalEventLogSnapshot(): ClinicalEvent[] {\n  return listClinicalEvents();\n}\n\nexport function restoreClinicalEventLogSnapshot(snapshot: ClinicalEvent[]): void {\n  clearClinicalEventLog();\n  for (const event of snapshot) appendClinicalEvent(event);\n}\n\nexport function clearClinicalEventLog(): void {\n  events.length = 0;\n}`
);

replaceOnce(
  'lib/clinical-observations.ts',
`/** Novo paciente: nenhum sinal vital/exame pode sobreviver. */\nexport function clearClinicalObservations(): void {\n  observations.clear();\n}`,
`export function exportClinicalObservationsSnapshot(): ClinicalObservation[] {\n  return getAllClinicalObservations();\n}\n\nexport function restoreClinicalObservationsSnapshot(snapshot: ClinicalObservation[]): void {\n  clearClinicalObservations();\n  for (const observation of snapshot) recordClinicalObservation(observation);\n}\n\n/** Novo paciente: nenhum sinal vital/exame pode sobreviver. */\nexport function clearClinicalObservations(): void {\n  observations.clear();\n}`
);

replaceOnce(
  'lib/clinical-handoff-runtime.ts',
`export function clearClinicalHandoffs(): void {\n  pending.length = 0;\n}`,
`export function exportClinicalHandoffsSnapshot(): ClinicalHandoffPayload[] {\n  return listPendingClinicalHandoffs();\n}\n\nexport function restoreClinicalHandoffsSnapshot(snapshot: ClinicalHandoffPayload[]): void {\n  clearClinicalHandoffs();\n  for (const payload of snapshot) publishClinicalHandoff(payload);\n}\n\nexport function clearClinicalHandoffs(): void {\n  pending.length = 0;\n}`
);

replaceOnce(
  'lib/clinical-interruption-session.ts',
`export function clearClinicalInterruptions(): void {\n  stack.length = 0;\n}`,
`export function exportClinicalInterruptionsSnapshot(): ClinicalInterruptionFrame[] {\n  return listClinicalInterruptions();\n}\n\nexport function restoreClinicalInterruptionsSnapshot(snapshot: ClinicalInterruptionFrame[]): void {\n  clearClinicalInterruptions();\n  for (const frame of snapshot) {\n    if (!frame.id.trim() || !frame.transitionId.trim() || !frame.fromModule.trim() || !frame.toModule.trim()) {\n      throw new Error("Snapshot de interrupção clínica inválido");\n    }\n    stack.push({ ...frame });\n  }\n}\n\nexport function clearClinicalInterruptions(): void {\n  stack.length = 0;\n}`
);

replaceOnce(
  'lib/clinical-reassessment-runtime.ts',
`export function clearPendingClinicalReassessments(): void {\n  pending.clear();\n}`,
`export function exportPendingClinicalReassessmentsSnapshot(): PendingClinicalReassessment[] {\n  return listPendingClinicalReassessments();\n}\n\nexport function restorePendingClinicalReassessmentsSnapshot(snapshot: PendingClinicalReassessment[]): void {\n  clearPendingClinicalReassessments();\n  sequence = 0;\n  for (const item of snapshot) {\n    if (!item.id.trim() || !item.therapyId.trim() || !Number.isFinite(item.startedAt)) {\n      throw new Error("Snapshot de reavaliação clínica inválido");\n    }\n    pending.set(item.id, { ...item });\n    sequence += 1;\n  }\n}\n\nexport function clearPendingClinicalReassessments(): void {\n  pending.clear();\n}`
);

replaceOnce(
  'lib/contexto-do-paciente.ts',
`/** Novo paciente: esquece tudo. */\nexport function limparContextoDoPaciente(): void {\n  contexto.clear();\n}`,
`export type ContextoPacienteSnapshotEntry = {\n  campo: CampoCompartilhado;\n  valor: string;\n  origem: string;\n  salvoEm: number;\n};\n\nexport function exportContextoDoPacienteSnapshot(): ContextoPacienteSnapshotEntry[] {\n  return [...contexto.entries()].map(([campo, registro]) => ({\n    campo: campo as CampoCompartilhado,\n    valor: registro.valor,\n    origem: registro.origem,\n    salvoEm: registro.salvoEm,\n  }));\n}\n\nexport function restoreContextoDoPacienteSnapshot(snapshot: ContextoPacienteSnapshotEntry[]): void {\n  limparContextoDoPaciente();\n  for (const entry of snapshot) {\n    if (!ehCampoCompartilhado(entry.campo)) continue;\n    if (!entry.valor.trim() || !entry.origem.trim() || !Number.isFinite(entry.salvoEm)) continue;\n    contexto.set(entry.campo, { valor: entry.valor.trim(), origem: entry.origem.trim(), salvoEm: entry.salvoEm });\n  }\n}\n\n/** Novo paciente: esquece tudo. */\nexport function limparContextoDoPaciente(): void {\n  contexto.clear();\n}`
);

replaceOnce(
  'lib/module-ui-state.ts',
`function clearProtocolUiState(protocolId: string) {\n  protocolUiState.delete(protocolId);\n}\n\nexport { clearProtocolUiState, getProtocolUiState, updateProtocolUiState };`,
`type ProtocolUiStateSnapshotEntry = { protocolId: string; state: ProtocolUiState };\n\nfunction exportProtocolUiStateSnapshot(): ProtocolUiStateSnapshotEntry[] {\n  return [...protocolUiState.entries()].map(([protocolId, state]) => ({\n    protocolId,\n    state: { ...state },\n  }));\n}\n\nfunction restoreProtocolUiStateSnapshot(snapshot: ProtocolUiStateSnapshotEntry[]) {\n  protocolUiState.clear();\n  for (const entry of snapshot) {\n    if (!entry.protocolId.trim()) continue;\n    protocolUiState.set(entry.protocolId, { ...entry.state });\n  }\n}\n\nfunction clearProtocolUiState(protocolId: string) {\n  protocolUiState.delete(protocolId);\n}\n\nexport {\n  clearProtocolUiState,\n  exportProtocolUiStateSnapshot,\n  getProtocolUiState,\n  restoreProtocolUiStateSnapshot,\n  updateProtocolUiState,\n};`
);

console.log('✅ HND-02b wave 1: adapters export/restore adicionados aos stores básicos');
