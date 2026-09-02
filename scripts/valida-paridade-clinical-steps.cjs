const { spawnSync } = require("child_process");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const travas = [
  "valida-paridade-decision-step.cjs",
  "valida-paridade-action-step.cjs",
  "valida-paridade-input-step.cjs",
  "valida-paridade-transition-step.cjs",
];

for (const trava of travas) {
  const arquivo = path.join(__dirname, trava);
  const resultado = spawnSync(process.execPath, [arquivo], {
    cwd: raiz,
    stdio: "inherit",
  });

  if (resultado.error) {
    console.error(`\n❌ Não foi possível executar ${trava}: ${resultado.error.message}`);
    process.exit(1);
  }

  if (resultado.status !== 0) {
    console.error(`\n❌ Paridade agregada falhou em ${trava}.`);
    process.exit(resultado.status ?? 1);
  }
}

console.log("\n✅ Paridade agregada dos passos clínicos preservada.");
console.log("   • decision: apresentação sem alterar ids/opções");
console.log("   • action: gates/discovery permanecem no shell");
console.log("   • input: valores, faixas e callbacks permanecem canônicos");
console.log("   • transition: handoff e navegação permanecem no shell");
