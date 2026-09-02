const fs = require("fs");

const path = "lib/clinical-resume-runtime.ts";
const src = fs.readFileSync(path, "utf8");
const failures = [];

for (const required of [
  "peekClinicalInterruption",
  "completeClinicalInterruption",
  "recordProtocolResume",
  "top.toModule !== currentModuleSlug",
  "top.terminal",
  "completed.returnModule",
]) {
  if (!src.includes(required)) failures.push(`clinical-resume-runtime perdeu: ${required}`);
}

if (/router\.|router\(|push\(|replace\(/.test(src)) {
  failures.push("clinical-resume-runtime não pode navegar; deve apenas resolver o alvo de retorno");
}

if (failures.length) {
  console.error("❌ Clinical resume runtime inválido:\n" + failures.map((f) => `- ${f}`).join("\n"));
  process.exit(1);
}

console.log("✅ Clinical resume runtime preserva retorno LIFO sem controlar o router.");
