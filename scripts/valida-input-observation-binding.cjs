#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shell = fs.readFileSync(
  path.join(root, "components/protocol-screen/acls-decision-flow-screen.tsx"),
  "utf8"
);

const start = shell.indexOf("const handleSetValue =");
const end = shell.indexOf("const herdadosRef", start);
if (start < 0 || end < 0) throw new Error("handleSetValue não localizado no shell compartilhado.");
const handler = shell.slice(start, end);

for (const token of [
  "recordFlowObservation({",
  "module: tree.id",
  "fieldId",
  "value",
  "unit: field?.unit",
]) {
  if (!handler.includes(token)) throw new Error(`Binding imediato de input incompleto: ${token}`);
}

const advanceStart = shell.indexOf("const handleAdvance =");
const advanceEnd = shell.indexOf("const handleGateResolution", advanceStart);
const advance = shell.slice(advanceStart, advanceEnd);
if (advance.includes("recordFlowObservation({")) {
  throw new Error("handleAdvance voltou a regravar observações e adulterar a idade do dado.");
}

console.log("✅ Inputs compartilhados registram observação no momento da confirmação, sem duplicação ao avançar.");
