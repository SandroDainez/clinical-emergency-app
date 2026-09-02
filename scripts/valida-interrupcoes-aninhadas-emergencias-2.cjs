const fs = require("fs");

const session = fs.readFileSync("lib/clinical-interruption-session.ts", "utf8");
const scenario = fs.readFileSync("clinical-safety-cases/interrupcoes.ts", "utf8");
const bridge = fs.readFileSync("lib/clinical-runtime-bridge.ts", "utf8");
const runtime = fs.readFileSync("lib/clinical-session-runtime.ts", "utf8");

const falhas = [];

if (!session.includes("const stack: ClinicalInterruptionFrame[] = []")) {
  falhas.push("interrupções clínicas perderam a estrutura de pilha");
}
if (!session.includes("stack[stack.length - 1]")) {
  falhas.push("conclusão da interrupção não verifica o topo da pilha");
}
if (!scenario.includes("AVC -> ISR -> PCR -> ISR -> AVC")) {
  falhas.push("cenário de interrupção aninhada não documenta a ordem de retorno");
}
if (!scenario.includes('completeClinicalInterruption("pcr-adulto")') ||
    !scenario.includes('completeClinicalInterruption("isr-rapida")')) {
  falhas.push("cenário não testa retorno LIFO PCR -> ISR -> AVC");
}
if (!bridge.includes("recordProtocolResume")) {
  falhas.push("runtime bridge não registra retomada de protocolo");
}
if (!runtime.includes("clearClinicalInterruptions()")) {
  falhas.push("novo atendimento não limpa a pilha de interrupções");
}

if (falhas.length) {
  console.error("❌ Interrupções aninhadas Emergências 2:");
  for (const falha of falhas) console.error(`- ${falha}`);
  process.exit(1);
}

console.log("✅ Interrupções aninhadas Emergências 2 — contrato estrutural preservado.");
