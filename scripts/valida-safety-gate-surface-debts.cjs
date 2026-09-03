#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const debts = fs.readFileSync(path.join(root, "clinical-safety-cases/gate-surface-debts.ts"), "utf8");
const candidates = fs.readFileSync(path.join(root, "clinical-safety-cases/gate-candidate-debts.ts"), "utf8");
const activeTriggers = fs.readFileSync(path.join(root, "lib/clinical-gate-trigger-registry.ts"), "utf8");
const tep = fs.readFileSync(path.join(root, "tep-decision-tree.ts"), "utf8");
const tce = fs.readFileSync(path.join(root, "tce-decision-tree.ts"), "utf8");
const shock = fs.readFileSync(path.join(root, "shock-decision-tree.ts"), "utf8");
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

const expectedSurfaceIds = [
  "tep-isr-sedation-surface",
  "tce-hyperventilation-action-surface",
  "choque-cardiogenico-fluid-action-surface",
];
for (const id of expectedSurfaceIds) {
  expect(debts.includes(`id: "${id}"`), `dívida de superfície ausente: ${id}`);
}

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

expect(debts.includes('candidateId: "tce-prophylactic-severe-hyperventilation"'), "surface debt TCE não aponta para candidato revisado");
expect(candidates.includes('id: "tce-prophylactic-severe-hyperventilation"'), "candidato TCE referido pela surface debt não existe");
const tceGraveBlock = tce.match(/tce_grave:\s*\{[\s\S]*?\n\s*},\n\n\s*peso:/m)?.[0] ?? "";
expect(tceGraveBlock !== "", "nó tce_grave não localizado");
expect(tceGraveBlock.includes("TCE_HIPERVENTILACAO_PROIBIDA"), "TCE: proibição profilática mudou; reauditar superfície");
expect(!tceGraveBlock.includes("clinicalActionId:"), "tce_grave ganhou ação canônica: surface debt precisa ser reavaliada");
expect(!activeTriggers.includes('actionId: "iniciar_hiperventilacao_tce"'), "TCE: trigger de hiperventilação apareceu antes da ação real existir");
expect(debts.includes("finalidade (profilática versus resgate)"), "TCE: superfície futura precisa preservar finalidade profilaxia versus resgate");

expect(debts.includes('candidateId: "choque-cardiogenico-fluid-bolus-with-congestion"'), "surface debt de choque não aponta para candidato revisado");
expect(candidates.includes('id: "choque-cardiogenico-fluid-bolus-with-congestion"'), "candidato de choque referido pela surface debt não existe");
const cardioWetBlock = shock.match(/dx_cardio_frio_umido:\s*\{[\s\S]*?\n\s*},\n\n\s*dx_cardio_frio_seco:/m)?.[0] ?? "";
expect(cardioWetBlock !== "", "nó dx_cardio_frio_umido não localizado");
expect(cardioWetBlock.includes("evitar expansão volêmica"), "choque cardiogênico: orientação sobre volume mudou; reauditar superfície");
expect(!cardioWetBlock.includes("clinicalActionId:"), "choque cardiogênico ganhou ação canônica: surface debt precisa ser reavaliada");
expect(!activeTriggers.includes('actionId: "administrar_expansao_volemica_choque"'), "choque: trigger de fluido apareceu antes da ação real existir");
expect(debts.includes("pequena prova justificada e reavaliada"), "choque: surface debt não preserva exceção de pequena prova responsiva");

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log("✅ SafetyGate surface debts: TEP→ISR, TCE hiperventilação e choque cardiogênico permanecem explícitos sem gate em botão genérico.");