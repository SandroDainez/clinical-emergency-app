#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const drug = fs.readFileSync(path.join(root, "lib", "drug-knowledge", "alteplase.ts"), "utf8");
const legacy = fs.readFileSync(path.join(root, "avc-decision-tree.ts"), "utf8");
const evidence = fs.readFileSync(path.join(root, "protocol-evidence", "avc.ts"), "utf8");
const failures = [];

for (const required of ["0,9 mg/kg", "90 mg", "10%", "60 min", "avc_isquemico_ivt"]) {
  if (!drug.includes(required)) failures.push(`alteplase canônica sem ${required}`);
}

// A Drug KB é canônica POR FÁRMACO e hoje pode conter várias indicações. O que
// precisa permanecer isolado é cada instrução: a entrada do AVC não pode herdar
// regime de TEP/IAM, e vice-versa. O teste antigo proibia a palavra "TEP" no
// arquivo inteiro e passou a falhar quando a centralização por indicação ficou
// correta.
const avcBlock = drug.match(/\{\s*indicationId:\s*"avc_isquemico_ivt"[\s\S]*?\n\s*\},/m)?.[0] ?? "";
if (!avcBlock) failures.push("entrada canônica de AVC não localizada");
for (const required of ["0,9 mg/kg", "90 mg", "10%", "60 min"]) {
  if (avcBlock && !avcBlock.includes(required)) failures.push(`entrada AVC sem ${required}`);
}
for (const forbidden of ["TEP", "IAM", "100 mg", "2 h", "50 mg em bolus"]) {
  if (avcBlock.includes(forbidden)) failures.push(`entrada AVC misturou outro contexto: ${forbidden}`);
}

const tepBlock = drug.match(/\{\s*indicationId:\s*"tep_agudo_trombolise_sistemica"[\s\S]*?\n\s*\},/m)?.[0] ?? "";
if (!tepBlock) failures.push("entrada canônica de TEP não localizada");
if (tepBlock && tepBlock.includes("0,9 mg/kg")) failures.push("entrada TEP herdou regime de AVC");

for (const legacyToken of ["0,9 mg/kg", "90", "alteplaseBolus", "alteplaseInfusao"]) {
  if (!legacy.includes(legacyToken)) failures.push(`fonte legada do AVC não contém ${legacyToken}`);
}

if (!evidence.includes("avc_alteplase_09_max90")) failures.push("registry do AVC sem recomendação canônica de alteplase");
if (!evidence.includes('nodeId: "isq_janela"')) failures.push("alteplase não está vinculada ao nó de reperfusão do AVC");

if (failures.length) {
  console.error("\n❌ Alteplase canônica — paridade e isolamento por indicação\n");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("✅ Alteplase preserva regimes separados por indicação: AVC e TEP não contaminam um ao outro.");
