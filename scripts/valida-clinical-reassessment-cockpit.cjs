#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const adapter = read("lib/clinical-shell-adapter.ts");
const chrome = read("components/ui-v2/clinical-shell-chrome.tsx");
const host = read("components/ui-v2/clinical-shell-host.tsx");
const cockpit = read("components/ui-v2/clinical-cockpit-bar.tsx");

const failures = [];
if (!/listPendingClinicalReassessments/.test(adapter)) failures.push("shell adapter não lê reavaliações pendentes");
if (!/getCriticalTherapyReassessmentRule/.test(adapter)) failures.push("shell adapter não deriva sinais da política canônica");
if (!/reassessmentAlert/.test(adapter)) failures.push("snapshot não expõe reassessmentAlert");
if (!/REAVALIAÇÃO PENDENTE/.test(chrome)) failures.push("chrome não exibe reavaliação pendente");
if (!/REAVALIAÇÃO ATRASADA/.test(chrome)) failures.push("chrome não diferencia reavaliação atrasada");
if (!/reassessmentAlert=\{snapshot\.reassessmentAlert\}/.test(host)) failures.push("host não encaminha alerta do snapshot ao chrome");
if (/há \{metric\.age\}/.test(cockpit)) failures.push("cockpit pode renderizar 'há agora'");
if (!/metric\.age === "agora"/.test(cockpit)) failures.push("cockpit não trata idade 'agora' explicitamente");
if (/DecisionTreeEngine|router\.|router\.push|fetch\(|Math\.random/.test(adapter)) failures.push("adapter ganhou responsabilidade proibida");

if (failures.length) {
  console.error("Falhas — reavaliação no cockpit:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("OK — reavaliação pendente permanece visível no Clinical Cockpit sem acoplamento ao engine/router.");
