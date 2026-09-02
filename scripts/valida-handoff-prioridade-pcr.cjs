#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = fs.readFileSync(path.join(root, "lib", "clinical-handoff-contract.ts"), "utf8");
const orchestrator = fs.readFileSync(path.join(root, "lib", "clinical-handoff-orchestrator.ts"), "utf8");
const pcr = fs.readFileSync(path.join(root, "lib", "pcr-terminal-handoff-context.ts"), "utf8");
const testCase = fs.readFileSync(path.join(root, "clinical-safety-cases", "handoff-prioridade-pcr.ts"), "utf8");

const errors = [];
for (const token of [
  '"require_complete_context" | "do_not_delay_destination"',
  "transferPolicy?: ClinicalHandoffTransferPolicy",
]) if (!contract.includes(token)) errors.push(`contrato perdeu ${token}`);

if ((pcr.match(/transferPolicy: "do_not_delay_destination"/g) || []).length !== 2) {
  errors.push("os dois handoffs terminais para PCR devem ser não bloqueantes");
}

for (const token of [
  "prepareClinicalHandoffTransfer",
  "canProceedToDestination",
  "contextPublished",
  'input.contract.transferPolicy === "do_not_delay_destination"',
]) if (!orchestrator.includes(token)) errors.push(`orquestrador perdeu ${token}`);

for (const token of [
  "PCR foi bloqueado por contexto incompleto",
  "payload incompleto foi publicado",
  'missingFacts.includes("atropina_administrada")',
  'missingFacts.includes("marcapasso_em_uso")',
]) if (!testCase.includes(token)) errors.push(`caso de prioridade perdeu ${token}`);

if (errors.length) {
  console.error("\n❌ prioridade do handoff para PCR inválida\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("\n✅ PCR permanece não bloqueante mesmo com contexto de handoff incompleto.\n");
