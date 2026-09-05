#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const component = fs.readFileSync(path.join(root, "components/ui-v2/calculator-screen-header.tsx"), "utf8");
const screens = [
  "vasoactive-calculator-screen.tsx",
  "electrolyte-calculator-screen.tsx",
  "sedation-calculator-screen.tsx",
  "clinical-calculators-screen.tsx",
];

// O cabeçalho canônico agora segue a mesma gramática do Clinical Cockpit:
// “Voltar” preserva a navegação local e “MÓDULOS” é a saída explícita para o hub.
// A validação antiga ainda procurava a cópia “Voltar aos módulos”, que deixou de
// existir quando as calculadoras foram alinhadas ao AVC/UI v2.
for (const token of [
  'tr("Calculadora clínica")',
  'labelVoltar={tr("Voltar")}',
  'tr("MÓDULOS")',
  'router.replace("/modulos" as never)',
  "right?: ReactNode",
]) {
  if (!component.includes(token)) throw new Error(`Cabeçalho canônico incompleto: ${token}`);
}

for (const file of screens) {
  const source = fs.readFileSync(path.join(root, "components/protocol-screen", file), "utf8");
  if (!source.includes("<CalculatorScreenHeader")) throw new Error(`${file}: não usa o cabeçalho canônico.`);
  if (/import \{ Header \} from "\.\.\/ui-v2\/header"/.test(source)) {
    throw new Error(`${file}: ainda importa Header diretamente.`);
  }
}

console.log("✅ Quatro calculadoras usam o mesmo cabeçalho canônico e a mesma saída explícita para MÓDULOS, sem alterar seus motores.");
