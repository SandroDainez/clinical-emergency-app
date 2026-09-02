#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "lib", "clinical-crisis-routing.ts");
const text = fs.readFileSync(file, "utf8");
const failures = [];

if (!text.includes("crisisActionsForModule")) failures.push("roteamento de crise não usa registro canônico");
if (!text.includes("from_module")) failures.push("roteamento de crise perdeu origem clínica");
if (!text.includes("encodeURIComponent")) failures.push("origem clínica não é codificada na URL");
if (/DecisionTreeEngine|choose\(|advance\(/.test(text)) failures.push("roteamento de crise ganhou lógica de decisão clínica");

if (failures.length) {
  console.error("\n❌ Clinical crisis routing\n");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log("✅ Rotas de crise preservam origem sem incorporar decisão clínica.");
