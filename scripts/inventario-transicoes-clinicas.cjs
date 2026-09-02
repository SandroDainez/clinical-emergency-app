#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const diretorios = ["app", "components", "lib"];
const extensoes = /\.(ts|tsx)$/;
const arquivos = [];

function caminhar(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entrada.name === "node_modules") continue;
    const p = path.join(dir, entrada.name);
    if (entrada.isDirectory()) caminhar(p);
    else if (extensoes.test(entrada.name)) arquivos.push(p);
  }
}

// Navegação de UI/runtime vive nestes diretórios.
diretorios.forEach((d) => caminhar(path.join(raiz, d)));

// As árvores clínicas vivem majoritariamente na RAIZ do repositório. O inventário
// anterior não as percorria e, portanto, podia perder justamente os
// `disposition: "other_module"` que queremos governar.
for (const entrada of fs.readdirSync(raiz, { withFileTypes: true })) {
  if (!entrada.isFile()) continue;
  if (!/-decision-tree\.ts$/.test(entrada.name)) continue;
  arquivos.push(path.join(raiz, entrada.name));
}

const achados = [];
const rotaRe = /\/modulos\/([a-z0-9-]+)/g;
const fromRe = /from_module(?:=|["']?\s*:\s*["'])([a-z0-9-]+)/g;
const otherModuleRe = /disposition\s*:\s*["']other_module["']/g;
const targetModuleRe = /moduleId\s*:\s*["']([a-z0-9_-]+)["']/g;

function coletar(re, texto) {
  const valores = new Set();
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(texto))) valores.add(m[1]);
  return [...valores].sort();
}

for (const arquivo of [...new Set(arquivos)]) {
  const texto = fs.readFileSync(arquivo, "utf8");
  const rotas = coletar(rotaRe, texto);
  const origens = coletar(fromRe, texto);
  const targets = coletar(targetModuleRe, texto);
  otherModuleRe.lastIndex = 0;
  const otherModuleCount = [...texto.matchAll(new RegExp(otherModuleRe.source, "g"))].length;

  if (!rotas.length && !origens.length && !targets.length && otherModuleCount === 0) continue;

  achados.push({
    arquivo: path.relative(raiz, arquivo),
    rotas,
    origens,
    targets,
    otherModuleCount,
  });
}

console.log("\nInventário de transições clínicas\n");
for (const item of achados.sort((a, b) => a.arquivo.localeCompare(b.arquivo))) {
  console.log(`• ${item.arquivo}`);
  if (item.rotas.length) console.log(`  rotas navegáveis: ${item.rotas.join(", ")}`);
  if (item.origens.length) console.log(`  from_module: ${item.origens.join(", ")}`);
  if (item.targets.length) console.log(`  links targets: ${item.targets.join(", ")}`);
  if (item.otherModuleCount) console.log(`  handoffs explícitos other_module: ${item.otherModuleCount}`);
}

const comOtherModule = achados.filter((item) => item.otherModuleCount > 0);
console.log(`\nResumo: ${comOtherModule.length} arquivo(s) possuem disposition=other_module.`);
for (const item of comOtherModule) {
  console.log(`  - ${item.arquivo}: ${item.otherModuleCount}`);
}

if (!achados.length) {
  console.error("\n❌ nenhuma transição encontrada — universo provavelmente incorreto.\n");
  process.exit(1);
}

console.log(`\n✅ ${achados.length} arquivo(s) com navegação, targets ou handoff clínico encontrados.\n`);