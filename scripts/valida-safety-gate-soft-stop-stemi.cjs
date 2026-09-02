#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const types = read("core/decision-tree/types.ts");
const engine = read("core/decision-tree/engine.ts");
const tree = read("coronary-decision-tree.ts");
const shell = read("components/protocol-screen/acls-decision-flow-screen.tsx");
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(types.includes("clinicalActionId?: string;"), "DecisionOption/Frontend não expõem clinicalActionId");
expect(engine.includes("clinicalActionId: option.clinicalActionId"), "Engine não carrega clinicalActionId das opções");
expect(/id: "icp"[^\n]*clinicalActionId: "definir_estrategia_reperfusao"/.test(tree), "STEMI ICP não declara ação canônica");
expect(/id: "fibrino"[^\n]*clinicalActionId: "definir_estrategia_reperfusao"/.test(tree), "STEMI fibrinólise não declara ação canônica");
expect(!/id: "nao_sei"[^\n]*clinicalActionId/.test(tree.match(/stemi_reperfusao:[\s\S]*?stemi_reperfusao_descoberta:/)?.[0] ?? ""), "STEMI não-sei não pode ser gated");
expect(shell.includes("const commitDecision = (optionId: string) =>"), "Shell não separa commit da avaliação prévia");

const gatedBranch = shell.match(/const handleChoose = \(optionId: string\) => \{[\s\S]*?setPendingSoftStop\(\{[\s\S]*?\n  \};/)?.[0] ?? "";
expect(Boolean(gatedBranch), "Shell não contém ramo gated completo de handleChoose");
const evaluateAt = gatedBranch.indexOf("evaluateClinicalActionAttemptFromPatientState");
const pendingAt = gatedBranch.indexOf("setPendingSoftStop({");
const gatedCommitAt = gatedBranch.indexOf("if (!gate) {\n      commitDecision(optionId);");
expect(evaluateAt >= 0, "Ramo gated não avalia SafetyGate");
expect(gatedCommitAt > evaluateAt, "Opção gated só pode ser commitada sem bloqueio depois da avaliação");
expect(pendingAt > evaluateAt, "Soft stop pendente precisa ser criado depois da avaliação");

expect(shell.includes("recordClinicalSafetyOverride"), "Override do soft stop não é auditado");
expect(shell.includes("disabled={!softStopReason.trim()}"), "Override não exige justificativa não vazia");
expect(shell.includes('commitDecision("nao_sei")'), "Ação segura não retorna à descoberta guiada");
expect(shell.includes("commitDecision(pending.optionId)"), "Override registrado não conclui a opção pendente");
expect(shell.includes("pendingSoftStop ? ("), "UI não substitui a grade de decisão durante soft stop");

if (issues.length) {
  issues.forEach((i) => console.error(`❌ ${i}`));
  process.exit(1);
}
console.log("✅ STEMI soft stop: gate pré-escolha, descoberta segura e override com justificativa auditável.");
