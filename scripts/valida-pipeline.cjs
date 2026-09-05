/**
 * PROMETE: toda trava test:* do package.json está alcançável pelo portão real
 * do npm (`pretest:all` + `test:all`), ou tem isenção com motivo registrado.
 * NÃO PROMETE: que as travas alcançadas funcionem — só que estejam ligadas.
 * UNIVERSO: os scripts do package.json.
 */
const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(appDir, "package.json"), "utf8"));
const scripts = pkg.scripts || {};

const ISENTOS = {
  "test:all": "é o agregador",
  "test:e2e:ui": "variante interativa do test:e2e — abre janela e aguarda o humano; a suíte roda em test:e2e",
};

if (!scripts["test:all"]) {
  console.error("❌ package.json não tem `test:all` — não existe pipeline para ligar as travas.");
  process.exit(1);
}

// O npm executa pretest:all automaticamente antes de test:all. Seguir apenas a
// string de test:all produz falso negativo para suites deliberadamente ligadas
// no pretest. A partir dos dois roots, percorremos npm run recursivamente.
const alcancados = new Set();
const fila = ["pretest:all", "test:all"].filter((nome) => typeof scripts[nome] === "string");
while (fila.length) {
  const nome = fila.shift();
  if (!nome || alcancados.has(nome)) continue;
  alcancados.add(nome);
  const comando = scripts[nome] ?? "";
  for (const m of comando.matchAll(/npm\s+run\s+([\w:.-]+)/g)) {
    const filho = m[1];
    if (scripts[filho] && !alcancados.has(filho)) fila.push(filho);
  }
}

const soltos = [];
let ok = 0;
for (const nome of Object.keys(scripts)) {
  if (!nome.startsWith("test:")) continue;
  if (ISENTOS[nome]) continue;
  if (alcancados.has(nome)) ok++;
  else soltos.push(nome);
}

console.log("\nPipeline — toda trava alcançável por pretest:all/test:all\n");
if (soltos.length) {
  for (const s of soltos) console.log(`❌ "${s}" não está alcançável pelo portão real — trava que existe, parece proteger e não protege.`);
  console.log(
    `\n   Ligue \`${soltos[0]}\` a pretest:all/test:all (direta ou indiretamente), ou registre a isenção com motivo.\n`
  );
  process.exit(1);
}

console.log(`✅ ${ok} travas alcançáveis · ${Object.keys(ISENTOS).length - 1} isenção(ões) com motivo registrado\n`);
process.exit(0);
