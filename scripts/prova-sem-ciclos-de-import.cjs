#!/usr/bin/env node
/**
 * PROVA · SEM CICLO DE IMPORT (2026-09-13).
 *
 * Pedido do autor como trava de build: um ciclo de import deixa o valor de um
 * módulo depender da ORDEM de carga — e uma reordenação de imports reativaria um
 * defeito em silêncio. ⚠️ O diagnóstico daquele dia mostrou que o registro da
 * trombólise ⛔ não caiu por ciclo (causa real: mutação gravada na árvore durante o
 * build, ver `prova-mutacoes-isoladas.cjs`); esta trava fica como proteção.
 *
 * PROMETE: que nenhum import de VALOR forma ciclo entre os arquivos .ts/.tsx do
 * app, resolvendo caminhos relativos, os aliases de `tsconfig.json` (`paths`) e a
 * variante `.web.ts(x)` antes de `.ts(x)` (como o Metro faz para web); e que a
 * própria trava pega um ciclo, medida num projeto-fixture com dois arquivos que se
 * importam (um por alias).
 * NÃO PROMETE: ciclos que passem por pacotes de `node_modules`, por `require()`
 * dinâmico ou por variantes `.native`/`.ios`/`.android` (fora do grafo web); `import
 * type` é ignorado de propósito (some na compilação).
 * UNIVERSO: todos os .ts/.tsx do repositório, fora `node_modules`, `dist`, `.git`,
 * `.expo`, `ios`, `android` e declarações `.d.ts`.
 * FONTE: pedido do autor de 2026-09-13 (trava de ciclo no portão).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function ciclosEm(raiz) {
  const bruto = fs.readFileSync(path.join(raiz, "tsconfig.json"), "utf8");
  const ts = JSON.parse(bruto.replace(/\/\/.*$/gm, "").replace(/,(\s*[}\]])/g, "$1"));
  const paths = (ts.compilerOptions && ts.compilerOptions.paths) || {};
  const baseUrl = path.resolve(raiz, (ts.compilerOptions && ts.compilerOptions.baseUrl) || ".");
  const EXT = [".web.tsx", ".web.ts", ".tsx", ".ts", "/index.web.tsx", "/index.web.ts", "/index.tsx", "/index.ts"];
  const arquivo = (base) => {
    for (const e of ["", ...EXT]) {
      const p = base + e;
      if (fs.existsSync(p) && fs.statSync(p).isFile() && /\.tsx?$/.test(p)) return p;
    }
    return null;
  };
  const resolver = (de, esp) => {
    if (esp.startsWith(".")) return arquivo(path.resolve(path.dirname(de), esp));
    for (const [padrao, alvos] of Object.entries(paths)) {
      const pre = padrao.replace(/\*$/, "");
      const casa = padrao.endsWith("*") ? esp.startsWith(pre) : esp === padrao;
      if (!casa) continue;
      for (const alvo of alvos) {
        const r = arquivo(path.resolve(baseUrl, alvo.replace(/\*$/, "") + (padrao.endsWith("*") ? esp.slice(pre.length) : "")));
        if (r) return r;
      }
    }
    return null;
  };
  const IGNORAR = new Set(["node_modules", "dist", ".git", ".expo", "ios", "android"]);
  const listar = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) =>
    x.isDirectory()
      ? (IGNORAR.has(x.name) ? [] : listar(path.join(d, x.name)))
      : /\.tsx?$/.test(x.name) && !/\.d\.ts$/.test(x.name) && !/\.(native|ios|android)\.tsx?$/.test(x.name)
        ? [path.join(d, x.name)]
        : []);
  const grafo = new Map();
  for (const f of listar(raiz)) {
    const t = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    const especificadores = [
      ...[...t.matchAll(/^\s*import\s+(?!type\s)([\s\S]*?)\s+from\s+["']([^"']+)["']/gm)]
        .filter((m) => !/^\{\s*(type\s+[^,}]+\s*,?\s*)+\}$/.test(m[1].trim()))
        .map((m) => m[2]),
      ...[...t.matchAll(/^\s*import\s+["']([^"']+)["']/gm)].map((m) => m[1]),
      ...[...t.matchAll(/^\s*export\s+(?!type\s)[^;]*?\s+from\s+["']([^"']+)["']/gm)].map((m) => m[1]),
    ];
    grafo.set(f, [...new Set(especificadores.map((e) => resolver(f, e)).filter(Boolean))]);
  }
  let i = 0;
  const pilha = [], naPilha = new Set(), idx = new Map(), low = new Map(), componentes = [];
  const visitar = (v) => {
    idx.set(v, i); low.set(v, i); i++; pilha.push(v); naPilha.add(v);
    for (const w of grafo.get(v) || []) {
      if (!grafo.has(w)) continue;
      if (!idx.has(w)) { visitar(w); low.set(v, Math.min(low.get(v), low.get(w))); }
      else if (naPilha.has(w)) low.set(v, Math.min(low.get(v), idx.get(w)));
    }
    if (low.get(v) === idx.get(v)) {
      const c = [];
      let w;
      do { w = pilha.pop(); naPilha.delete(w); c.push(w); } while (w !== v);
      if (c.length > 1 || (grafo.get(v) || []).includes(v)) componentes.push(c.map((p) => path.relative(raiz, p)).sort());
    }
  };
  for (const v of grafo.keys()) if (!idx.has(v)) visitar(v);
  return { arquivos: grafo.size, ciclos: componentes };
}

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

/* ══ a trava pega ciclo — fixture com alias ══ */
{
  const fx = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-ciclo-"));
  fs.writeFileSync(path.join(fx, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: { "@/*": ["./*"] } } }));
  fs.mkdirSync(path.join(fx, "m"));
  fs.writeFileSync(path.join(fx, "m", "a.ts"), 'import { b } from "@/m/b";\nexport const a = () => b;\n');
  fs.writeFileSync(path.join(fx, "m", "b.ts"), 'import { a } from "./a";\nexport const b = 1;\nexport const usa = a;\n');
  fs.writeFileSync(path.join(fx, "m", "c.ts"), 'import type { a } from "./a";\nexport const c = 2;\n');
  const r = ciclosEm(fx);
  conf("fixture: a trava encontra o ciclo a ↔ b (um lado por alias)", r.ciclos.length === 1 && r.ciclos[0].join(",") === "m/a.ts,m/b.ts", `⛔ ${JSON.stringify(r)}`);
  fs.rmSync(fx, { recursive: true, force: true });
}

/* ══ o repositório ══ */
{
  const raiz = path.resolve(__dirname, "..");
  const r = ciclosEm(raiz);
  conf("controle: a varredura cobre o app (centenas de arquivos)", r.arquivos > 300, `⛔ ${r.arquivos} arquivos`);
  conf("nenhum ciclo de import de valor no app", r.ciclos.length === 0, `⛔ ${r.ciclos.map((c) => c.join(" ↔ ")).join(" | ")}`);
  console.log(`  · ${r.arquivos} arquivos varridos`);
}

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · SEM CICLO DE IMPORT — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
