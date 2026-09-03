#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const goals = fs.readFileSync(path.join(root, "lib/clinical-temporal-goals.ts"), "utf8");
const debrief = fs.readFileSync(path.join(root, "lib/clinical-temporal-debrief.ts"), "utf8");

const issues = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) issues.push(message);
};
const forbid = (source, pattern, message) => {
  if (pattern.test(source)) issues.push(message);
};

for (const status of ["met", "missed", "pending", "not_evaluable"]) {
  requireText(goals, `"${status}"`, `Evaluator não declara estado ${status}`);
}
requireText(
  goals,
  'kind: "event_data_timestamp"',
  "Metas temporais não aceitam deadline publicado pelo runtime"
);
requireText(
  goals,
  'kind: "elapsed_ms"',
  "Metas temporais não aceitam prazo explícito revisado"
);
requireText(
  goals,
  'throw new Error("Meta temporal numérica sem fonte declarada")',
  "Prazo numérico pode existir sem fonte auditável"
);
requireText(
  goals,
  'status: "not_evaluable"',
  "Ausência de prazo não cai em not_evaluable"
);
requireText(
  debrief,
  "evaluateClinicalTemporalGoals(listClinicalEvents(), goals, now)",
  "Debrief temporal não é derivado do Event Log canônico"
);
requireText(
  debrief,
  "notEvaluable",
  "Resumo do debrief não expõe metas não avaliáveis"
);

// A camada genérica não pode introduzir limiares clínicos por conta própria.
forbid(
  goals + "\n" + debrief,
  /\b(?:3|5)\s*\*\s*60\s*\*\s*1000\b/,
  "Debrief genérico contém limiar clínico ACLS embutido"
);

if (issues.length) {
  console.error("❌ Temporal debrief com regressões:\n");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log("✅ Temporal debrief declarativo, auditável e sem limiares clínicos órfãos.");
