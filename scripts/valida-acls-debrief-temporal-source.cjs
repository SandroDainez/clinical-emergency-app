#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const debrief = fs.readFileSync(path.join(root, "acls", "debrief.ts"), "utf8");
const reducer = fs.readFileSync(path.join(root, "acls", "reducer.ts"), "utf8");

if (/matchedAdmin\.timestamp\s*-\s*dueEvent\.timestamp\s*>\s*5\s*\*\s*60\s*\*\s*1000/.test(debrief)) {
  throw new Error("Debrief ACLS voltou a recalcular atraso de epinefrina com limiar próprio.");
}

if (!debrief.includes('event.details?.issue === "epinephrine_late_after_five_minutes"')) {
  throw new Error("Debrief ACLS não consome o guard rail temporal produzido pelo runtime.");
}

if (!reducer.includes('issue: "epinephrine_late_after_five_minutes"')) {
  throw new Error("Reducer ACLS deixou de produzir o guard rail temporal esperado pelo debrief.");
}

if (!reducer.includes("lateAfterTime,")) {
  throw new Error("Guard rail temporal perdeu o timestamp-limite calculado pelo runtime.");
}

console.log("✅ Debrief ACLS usa o runtime como fonte da janela temporal da epinefrina.");
