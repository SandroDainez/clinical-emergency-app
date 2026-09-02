const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const arquivos = [
  "components/protocol-screen/ventilator-configurator-card.tsx",
  "components/protocol-screen/sedation-calculator-screen.tsx",
  "components/protocol-screen/vasoactive-calculator-screen.tsx",
];

const falhas = [];
for (const rel of arquivos) {
  const fonte = fs.readFileSync(path.join(raiz, rel), "utf8");

  if (/valor=\{Number\([^\n]+\)\s*\|\|\s*(70|170)\}/.test(fonte)) {
    falhas.push(`${rel}: NumericStepper ainda possui fallback clínico 70/170.`);
  }

  if (/barra parte de 70 kg/i.test(fonte)) {
    falhas.push(`${rel}: texto ainda normaliza 70 kg como ponto de partida visual.`);
  }
}

const vm = fs.readFileSync(path.join(raiz, arquivos[0]), "utf8");
if (!/placeholder=\{tr\("Informe a altura"\)\}/.test(vm)) {
  falhas.push("VM: falta entrada explicitamente vazia para altura.");
}
if (!/alturaValida \? \(/.test(vm)) {
  falhas.push("VM: slider de altura não está condicionado a valor válido.");
}

for (const rel of arquivos.slice(1)) {
  const fonte = fs.readFileSync(path.join(raiz, rel), "utf8");
  if (!/placeholder=\{tr\("Informe o peso"\)\}/.test(fonte)) {
    falhas.push(`${rel}: falta entrada explicitamente vazia para peso.`);
  }
}

if (falhas.length) {
  console.error("\n❌ Regressão de valores clínicos fictícios:\n" + falhas.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}

console.log("✅ Sem fallbacks fictícios de altura/peso nas calculadoras especiais.");
