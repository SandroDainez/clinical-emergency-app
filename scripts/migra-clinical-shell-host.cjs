#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const target = path.resolve(
  __dirname,
  "../components/protocol-screen/acls-decision-flow-screen.tsx"
);

if (!fs.existsSync(target)) {
  throw new Error(`Shell compartilhado não encontrado: ${target}`);
}

let source = fs.readFileSync(target, "utf8");
const original = source;

const oldImport =
  'import { Card, Header, InstrucaoResumida, NumericStepper, Tag } from "../ui-v2";';
const newImport =
  'import { Card, ClinicalShellHost, InstrucaoResumida, NumericStepper, Tag } from "../ui-v2";';

const oldHeader = `      {emV2 ? (\n        <Header\n          // Nome do MÓDULO, não o rótulo curto de contexto.\n          //\n          // Antes eu usava \`headerTitle\` (\"TEP · Emergência\", \"SCA · Emergência\")\n          // e, na falta dele, o default \"ACLS · Emergência\" — que é simplesmente\n          // errado num módulo de TEP ou de EAP. O que identifica onde o médico\n          // está é o nome que ele tocou no hub.\n          titulo={tr(protocolLabel)}\n          etapa={\`${'${tr("Passo")} ${stepCount}'}\`}\n          onVoltar={() => router.back()}\n        />\n      ) : null}`;

const newHeader = `      {emV2 ? (\n        <ClinicalShellHost\n          protocol={tr(protocolLabel)}\n          phase={step.title ? tr(step.title) : undefined}\n          step={stepCount}\n          moduleSlug={currentModuleSlug}\n          onBack={() => router.back()}\n          onPush={(href) => router.push(href)}\n        />\n      ) : null}`;

function replaceExactlyOnce(label, from, to) {
  const first = source.indexOf(from);
  if (first < 0) {
    if (source.includes(to)) return; // idempotente
    throw new Error(`${label}: contexto esperado não encontrado; abortando sem alterar arquivo.`);
  }
  if (source.indexOf(from, first + from.length) >= 0) {
    throw new Error(`${label}: contexto apareceu mais de uma vez; abortando.`);
  }
  source = source.replace(from, to);
}

replaceExactlyOnce("import UI V2", oldImport, newImport);
replaceExactlyOnce("header V2", oldHeader, newHeader);

if (source === original) {
  console.log("ClinicalShellHost já estava integrado; nenhuma alteração necessária.");
  process.exit(0);
}

// Invariantes de segurança: o fallback legado continua existindo e o host só
// entra quando emV2=true. O script não toca engine, handlers, timers nem árvore.
const required = [
  "{emV2 ? (",
  "<ClinicalShellHost",
  "{emV2 ? null : (",
  "<StepHeaderBar",
  "const handleChoose",
  "const handleAdvance",
  "const handleSetValue",
  "const prazos =",
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Invariante ausente após migração: ${token}`);
}

if (source.includes("<Header\n")) {
  throw new Error("Header V2 antigo ainda presente após migração.");
}

fs.writeFileSync(target, source, "utf8");
console.log("ClinicalShellHost integrado ao shell compartilhado com fallback legado preservado.");
