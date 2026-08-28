#!/usr/bin/env node
/**
 * PROMETE: dizer, para cada módulo com árvore de decisão, QUANTOS nós têm ao
 *   menos um texto conferido pela trava do módulo — e quantos estão dentro do
 *   universo dela e fora de toda asserção.
 * NÃO PROMETE: que os nós "cobertos" estejam bem cobertos (um padrão que casa
 *   com o título já conta), nem que os "mudos" estejam errados. É medida de
 *   ALCANCE, não de qualidade.
 * UNIVERSO: as árvores compiladas e os scripts `scripts/valida-*.cjs`,
 *   derivados do diretório — trava nova entra sozinha.
 *
 * ── POR QUE ISTO EXISTE (R-74) ──────────────────────────────────────────────
 *
 * `valida-choque` lê o arquivo inteiro, é verde, e não pergunta nada sobre 27
 * dos 31 nós do módulo. A conduta do `dx_distributivo_outro` ficou invisível
 * para mim e nenhuma trava me contradisse — porque nenhuma tinha opinião sobre
 * aquele nó.
 *
 * ⚠️ "TEM TRAVA" NÃO É INFORMAÇÃO. "Guarda 4 de 31" é.
 *
 * O índice de travas dizia o primeiro. Este script produz o segundo.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { textoDoNo } = require("./lib/textos-do-no.cjs");

const appDir = path.resolve(__dirname, "..");

/** Padrões que uma trava procura: literais de regex com 8+ caracteres. */
function padroesDe(arquivo) {
  const fonte = fs.readFileSync(arquivo, "utf8");
  // Comentário não confere nada (R-15 item 13) — fora antes de extrair.
  const semComentario = fonte
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  const achados = [];
  for (const m of semComentario.matchAll(/\/((?:[^/\\\n]|\\.){8,})\/[gimsuy]*/g)) {
    achados.push(m[1]);
  }
  // Strings literais longas também são asserção ("texto deve conter X").
  for (const m of semComentario.matchAll(/"((?:[^"\\]|\\.){20,})"/g)) {
    achados.push(m[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }
  return achados;
}

const arvores = fs
  .readdirSync(appDir)
  // ⚠️ REDIRECIONADO EM 2026-08-27 — `-decision-tree.ts` sumiu da raiz com a
  // arquitetura clínica antiga, e sem árvore nenhuma o `tsc` abortava com stack
  // trace em vez de dizer "não há o que cobrir". Restam as 2 do LEGACY_ACLS_RUNTIME.
  .filter((f) => /-tree\.ts$/.test(f))
  .sort();

if (arvores.length === 0) {
  console.log("\nNenhuma árvore na raiz — nada a cobrir. (Isto é ausência de UNIVERSO, não de achado.)\n");
  process.exit(0);
}
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cobertura-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    ...arvores.map((f) => path.join(appDir, f)),
  ],
  { cwd: appDir, stdio: "pipe" }
);

const travas = fs
  .readdirSync(path.join(appDir, "scripts"))
  .filter((f) => /^valida-.*\.cjs$/.test(f));

const linhas = [];
for (const arquivo of arvores) {
  const modulo = arquivo.replace("-decision-tree.ts", "");
  const mod = require(path.join(tempDir, arquivo.replace(/\.ts$/, ".js")));
  const arv = Object.values(mod).find((v) => v && v.nodes);
  if (!arv) continue;

  // Toda trava que MENCIONA o módulo (pelo nome do arquivo da árvore) conta:
  // um nó guardado por qualquer uma delas está guardado.
  const relevantes = travas.filter((t) =>
    lerFonte(path.join(appDir, "scripts", t)).includes(arquivo)
  );
  const padroes = relevantes.flatMap((t) => padroesDe(path.join(appDir, "scripts", t)));
  const compilados = [];
  for (const p of padroes) {
    try {
      compilados.push(new RegExp(p, "i"));
    } catch {
      /* padrão que não compila fora do contexto original — ignorado */
    }
  }

  const ids = Object.keys(arv.nodes);
  const mudos = ids.filter((id) => {
    const t = textoDoNo(arv.nodes[id]);
    return !compilados.some((re) => re.test(t));
  });

  linhas.push({
    modulo,
    total: ids.length,
    cobertos: ids.length - mudos.length,
    travas: relevantes.length,
    mudos,
  });
}

linhas.sort((a, b) => a.cobertos / a.total - b.cobertos / b.total);

console.log("\nCOBERTURA POR NÓ — quantos nós a trava do módulo realmente interroga\n");
console.log("  módulo                 nós   cobertos   %     travas");
for (const l of linhas) {
  const pct = Math.round((l.cobertos / l.total) * 100);
  console.log(
    `  ${l.modulo.padEnd(22)}${String(l.total).padStart(3)}   ${String(l.cobertos).padStart(6)}   ${String(pct).padStart(3)}%   ${l.travas}`
  );
}
const total = linhas.reduce((s, l) => s + l.total, 0);
const cob = linhas.reduce((s, l) => s + l.cobertos, 0);
console.log(`\n  TOTAL: ${cob} de ${total} nós interrogados (${Math.round((cob / total) * 100)}%)\n`);

if (process.argv.includes("--mudos")) {
  for (const l of linhas) {
    if (!l.mudos.length) continue;
    console.log(`\n${l.modulo} — ${l.mudos.length} mudos:`);
    console.log("   " + l.mudos.join(", "));
  }
}

fs.rmSync(tempDir, { recursive: true, force: true });
