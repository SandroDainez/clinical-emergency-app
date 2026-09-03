#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const shell = read("components/protocol-screen/acls-decision-flow-screen.tsx");
const ui = read("components/protocol-screen/clinical-disposition-confirmation.tsx");
const runtime = read("lib/clinical-disposition-runtime.ts");
const contracts = read("lib/clinical-transition-contracts.ts");

const issues = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) issues.push(message);
};
const forbidText = (source, text, message) => {
  if (source.includes(text)) issues.push(message);
};

requireText(shell, 'import { ClinicalDispositionConfirmation } from "./clinical-disposition-confirmation";', "Shell não importa confirmação de disposition");
requireText(shell, "<ClinicalDispositionConfirmation", "Shell não renderiza confirmação de disposition");
requireText(shell, "protocolId={tree.id}", "Shell não passa protocolId canônico ao resolver destino");
requireText(shell, "sourceNodeId={step.id}", "Shell não passa nodeId real ao resolver destino");

requireText(ui, "getConfirmableExternalDisposition({ protocolId, sourceNodeId })", "UI não resolve destino pelo contrato canônico");
requireText(ui, "setConfirming(true)", "UI não possui primeiro passo de confirmação");
requireText(ui, "confirmExternalClinicalDisposition({ transitionId: disposition.transitionId })", "UI não registra destino apenas no segundo passo explícito");
requireText(ui, "if (!disposition) return null", "UI pode aparecer fora de destino terminal externo");
forbidText(ui, "Neurocirurgia imediata", "UI hardcodou destino neurocirúrgico");
forbidText(ui, "Centro cirúrgico / angioembolização", "UI hardcodou destino do politrauma");

requireText(runtime, "item.sourceNodeId === input.sourceNodeId", "Resolver não exige correspondência com o nó real");
requireText(runtime, 'transition.destinationKind === "external_service"', "Resolver perdeu restrição external_service");
requireText(runtime, 'transition.mode === "terminal"', "Resolver perdeu restrição terminal");
requireText(runtime, "event.data?.transitionId === transition.id", "Runtime não deduplica disposition por transitionId");
requireText(runtime, "if (existing)", "Runtime não reutiliza evento existente em toque duplicado");

for (const token of [
  'sourceNodeId: "damage_control"',
  'sourceNodeId: "neurocirurgia"',
]) {
  requireText(contracts, token, `Contrato externo sem binding de nó: ${token}`);
}

// A presença do componente no render não pode, por si só, gravar o evento.
const renderCall = shell.indexOf("<ClinicalDispositionConfirmation");
const directConfirmation = shell.indexOf("confirmExternalClinicalDisposition(");
if (renderCall < 0 || directConfirmation >= 0) {
  issues.push("Shell não pode confirmar disposition diretamente durante render/navegação");
}

if (issues.length) {
  console.error("❌ Confirmação explícita de disposition com regressões:\n");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log("✅ Disposition externo exige nó real + confirmação em dois tempos e é idempotente.");
