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
const chooseIndex = shell.indexOf("const handleChoose = (optionId: string) =>");
const gateIndex = shell.indexOf("evaluateClinicalActionAttemptFromPatientState", chooseIndex);
const commitIndex = shell.indexOf("commitDecision(optionId)", chooseIndex);
expect(chooseIndex >= 0 && gateIndex > chooseIndex && commitIndex > gateIndex, "Shell deve avaliar gate antes de commitar escolha gated");
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
