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

diretorios.forEach((d) => caminhar(path.join(raiz, d)));

const achados = [];
const rotaRe = /\/modulos\/([a-z0-9-]+)/g;
const fromRe = /from_module(?:=|["']?\s*:\s*["'])([a-z0-9-]+)/g;

for (const arquivo of arquivos) {
  const texto = fs.readFileSync(arquivo, "utf8");
  if (!texto.includes("/modulos/") && !texto.includes("from_module")) continue;
  const rotas = new Set();
  const origens = new Set();
  let m;
  while ((m = rotaRe.exec(texto))) rotas.add(m[1]);
  while ((m = fromRe.exec(texto))) origens.add(m[1]);
  achados.push({
    arquivo: path.relative(raiz, arquivo),
    rotas: [...rotas].sort(),
    origens: [...origens].sort(),
  });
}

console.log("\nInventário de transições clínicas\n");
for (const item of achados.sort((a, b) => a.arquivo.localeCompare(b.arquivo))) {
  console.log(`• ${item.arquivo}`);
  if (item.rotas.length) console.log(`  destinos: ${item.rotas.join(", ")}`);
  if (item.origens.length) console.log(`  from_module: ${item.origens.join(", ")}`);
}

if (!achados.length) {
  console.error("\n❌ nenhuma transição encontrada — universo provavelmente incorreto.\n");
  process.exit(1);
}

console.log(`\n✅ ${achados.length} arquivo(s) com navegação clínica encontrados.\n`);
