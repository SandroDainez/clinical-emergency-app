#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "components", "ui-v2", "clinical-shell-host.tsx");
const text = fs.readFileSync(file, "utf8");
const failures = [];

for (const required of [
  "buildClinicalShellSnapshot",
  "buildCrisisRoutes",
  "instrumentCrisisRoute(route, moduleSlug)",
  "onPush(route.href",
  "ClinicalShellChrome",
  "resolveClinicalResume(moduleSlug)",
  "onReturnToContext={returnToContext}",
]) {
  if (!text.includes(required)) failures.push(`host perdeu integração obrigatória: ${required}`);
}

if (text.indexOf("instrumentCrisisRoute(route, moduleSlug)") > text.indexOf("onPush(route.href")) {
  failures.push("host navega antes de registrar a interrupção clínica");
}

for (const forbidden of ["useRouter(", "router.push", "router.replace", ".choose(", ".advance("]) {
  if (text.includes(forbidden)) failures.push(`host ultrapassou a fronteira de integração: ${forbidden}`);
}
if (/^\s*import[^\n]*DecisionTreeEngine/m.test(text)) {
  failures.push("host ultrapassou a fronteira de integração: import de DecisionTreeEngine");
}

if (failures.length) {
  console.error("\n❌ Clinical shell host\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("✅ Clinical shell host permanece fino, instrumentado e sem lógica clínica.");
