#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const debts = fs.readFileSync(path.join(root, "clinical-safety-cases/gate-surface-debts.ts"), "utf8");
const candidates = fs.readFileSync(path.join(root, "clinical-safety-cases/gate-candidate-debts.ts"), "utf8");
const activeTriggers = fs.readFileSync(path.join(root, "lib/clinical-gate-trigger-registry.ts"), "utf8");
const tep = fs.readFileSync(path.join(root, "tep-decision-tree.ts"), "utf8");
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(debts.includes('id: "tep-isr-sedation-surface"'), "dívida de superfície TEP→ISR ausente");
expect(debts.includes('candidateId: "tep-high-risk-deep-sedation-ventilation"'), "surface debt não aponta para candidato TEP revisado");
expect(candidates.includes('id: "tep-high-risk-deep-sedation-ventilation"'), "candidato TEP referido pela surface debt não existe");
expect(debts.includes('destinationModuleId: "isr-rapida"'), "destino pretendido TEP→ISR não está declarado");
expect(debts.includes('preferredSurface: "destination_action"'), "gate TEP deve permanecer planejado na ação de destino, não no botão genérico do TEP");

const supportBlock = tep.match(/ar_suporte:\s*\{[\s\S]*?\n\s*},\n\n\s*ar_diagnostico:/m)?.[0] ?? "";
expect(supportBlock !== "", "nó ar_suporte não localizado");
expect(supportBlock.includes("IOT se insuficiência respiratória grave"), "texto de indicação de IOT mudou; reauditar dívida de superfície");
expect(supportBlock.includes("EVITAR sedação profunda e ventilação mecânica sempre que possível"), "texto AHA/ACC 2026 de sedação/VM mudou; reauditar dívida");
expect(!supportBlock.includes("clinicalActionId:"), "ar_suporte ganhou ação canônica: surface debt deve ser reavaliada antes de permanecer aberta");
expect(!activeTriggers.includes('actionId: "iniciar_sedacao_profunda_ou_isr"'), "ação TEP/ISR apareceu em trigger ativo antes de a superfície real existir");

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log("✅ SafetyGate surface debt TEP→ISR permanece explícita: regra revisada, superfície ainda não ativável.");
