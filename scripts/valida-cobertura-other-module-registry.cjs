#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const registryPath = path.join(raiz, "lib/clinical-transition-contracts.ts");
const registry = fs.readFileSync(registryPath, "utf8");

const esperadoPorArvore = new Map();
const arquivosPorId = new Map();

for (const entrada of fs.readdirSync(raiz, { withFileTypes: true })) {
  if (!entrada.isFile() || !/-decision-tree\.ts$/.test(entrada.name)) continue;

  const texto = fs.readFileSync(path.join(raiz, entrada.name), "utf8");
  const quantidade = [...texto.matchAll(/disposition\s*:\s*["']other_module["']/g)].length;
  if (!quantidade) continue;

  const inicioArvore = texto.match(/export\s+const\s+\w+\s*:\s*DecisionTreeDefinition\s*=\s*\{[\s\S]{0,1200}?\bid\s*:\s*["']([^"']+)["']/);
  if (!inicioArvore) {
    console.error(`❌ ${entrada.name}: não foi possível derivar o id canônico da árvore.`);
    process.exit(1);
  }

  const id = inicioArvore[1];
  esperadoPorArvore.set(id, quantidade);
  arquivosPorId.set(id, entrada.name);
}

const contratosPorOrigem = new Map();
for (const match of registry.matchAll(/\{[\s\S]*?\bfrom\s*:\s*["']([^"']+)["'][\s\S]*?\bto\s*:\s*["']([^"']+)["'][\s\S]*?\bmode\s*:\s*["'](returnable|terminal)["'][\s\S]*?\}/g)) {
  const from = match[1];
  contratosPorOrigem.set(from, (contratosPorOrigem.get(from) ?? 0) + 1);
}

const falhas = [];
let totalArvores = 0;
let totalRegistry = 0;

for (const [id, esperado] of esperadoPorArvore) {
  const registrado = contratosPorOrigem.get(id) ?? 0;
  totalArvores += esperado;
  totalRegistry += registrado;
  if (registrado !== esperado) {
    falhas.push(`${arquivosPorId.get(id)} (${id}): árvore=${esperado} other_module, registry=${registrado}`);
  }
}

for (const [origem, quantidade] of contratosPorOrigem) {
  if (!esperadoPorArvore.has(origem)) {
    falhas.push(`registry possui ${quantidade} contrato(s) com from=${origem}, mas nenhuma árvore raiz com disposition=other_module foi encontrada`);
  }
}

if (falhas.length) {
  console.error("\n❌ Cobertura do registry divergiu das árvores:\n");
  for (const falha of falhas) console.error(`- ${falha}`);
  process.exit(1);
}

if (totalArvores !== totalRegistry) {
  console.error(`\n❌ Totais divergentes: árvores=${totalArvores}; registry=${totalRegistry}.\n`);
  process.exit(1);
}

console.log(`\n✅ Cobertura completa dos handoffs explícitos: ${totalArvores} disposition=other_module nas árvores e ${totalRegistry} contratos correspondentes no registry.`);
for (const [id, quantidade] of [...esperadoPorArvore.entries()].sort()) {
  console.log(`   - ${id}: ${quantidade}`);
}
console.log();