#!/usr/bin/env node
/**
 * SONDA — não é trava, não entra no test:all. Mede o que o médico lê ANTES de
 * poder decidir, e separa duas coisas que parecem uma:
 *
 *   COMPRIMENTO · quantos caracteres ele atravessa (summary + actions + intro
 *                 + exitCriteria + o texto das opções)
 *   ESCOLHA     · quantas opções ele compara
 *
 * ⚠️ `evidence` FICA DE FORA por construção: renderiza RECOLHIDO atrás do "Ver
 * critérios (N)", e por isso não é lido antes de decidir. Quem quiser medir o
 * que está escondido usa a outra medição, a que produziu o R-75.
 *
 * ⚠️ E OS CAMPOS SÃO DERIVADOS DO NÓ, não listados à mão — é o helper
 * `textos-do-no.cjs`, escrito depois de uma sonda ler 6 de 11 campos e produzir
 * uma conclusão errada (R-65). Aqui a lista de campos VISÍVEIS é a lista real
 * do nó menos `evidence`, e o script IMPRIME os campos que encontrou, para que
 * um campo novo apareça em vez de sumir.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { textosDoNo, camposDeTextoDoNo } = require("./lib/textos-do-no.cjs");

const appDir = path.resolve(__dirname, "..");
const arquivos = fs.readdirSync(appDir).filter((f) => /-decision-tree\.ts$/.test(f)).sort();
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "densidade-"));
const arvores = {};
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  ...arquivos.map((f) => path.join(appDir, f)),
], { cwd: appDir, stdio: "pipe" });
for (const f of arquivos) {
  const mod = require(path.join(tempDir, f.replace(/\.ts$/, ".js")));
  const arv = Object.values(mod).find((v) => v && v.nodes);
  if (arv) arvores[f.replace("-decision-tree.ts", "")] = arv;
}

/** Tudo que o nó mostra sem exigir um toque a mais. */
function visivel(no) {
  const { evidence, ...semEvidence } = no;
  return textosDoNo(semEvidence).join("\n");
}

const percentil = (xs, p) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};

const todos = [];
const camposVistos = new Set();
for (const [modulo, arv] of Object.entries(arvores)) {
  for (const [id, n] of Object.entries(arv.nodes)) {
    for (const c of camposDeTextoDoNo(n)) camposVistos.add(c);
    const texto = visivel(n);
    todos.push({
      modulo, id, tipo: n.type ?? "?",
      chars: texto.length,
      opcoes: (n.options ?? []).length,
      // ⚠️ O texto DENTRO das opções conta: o médico lê os rótulos para
      // escolher. Separado para mostrar quanto do comprimento é escolha.
      charsOpcoes: textosDoNo(n.options ?? []).join("\n").length,
    });
  }
}

console.log(`\nDENSIDADE — ${todos.length} nós em ${Object.keys(arvores).length} árvores`);
console.log(`Campos de texto encontrados (derivados, evidence excluído do cálculo):`);
console.log(`  ${[...camposVistos].sort().join(" · ")}\n`);

// ── Distribuição por MÓDULO ────────────────────────────────────────────────
console.log("POR MÓDULO — caracteres visíveis por nó\n");
console.log("  módulo            nós   mediana    p90    máx  | opções: mediana  máx");
const porModulo = {};
for (const t of todos) (porModulo[t.modulo] ??= []).push(t);
const linhas = Object.entries(porModulo)
  .map(([m, ns]) => ({
    m, n: ns.length,
    med: percentil(ns.map((x) => x.chars), 50),
    p90: percentil(ns.map((x) => x.chars), 90),
    max: Math.max(...ns.map((x) => x.chars)),
    opMed: percentil(ns.map((x) => x.opcoes), 50),
    opMax: Math.max(...ns.map((x) => x.opcoes)),
  }))
  .sort((a, b) => b.p90 - a.p90);
for (const l of linhas) {
  console.log(
    `  ${l.m.padEnd(16)} ${String(l.n).padStart(4)} ${String(l.med).padStart(8)} ` +
    `${String(l.p90).padStart(6)} ${String(l.max).padStart(6)}  |` +
    `${String(l.opMed).padStart(12)} ${String(l.opMax).padStart(5)}`
  );
}
const geral = todos.map((t) => t.chars);
console.log(`\n  TODOS            ${String(todos.length).padStart(4)} ${String(percentil(geral,50)).padStart(8)} ` +
  `${String(percentil(geral,90)).padStart(6)} ${String(Math.max(...geral)).padStart(6)}`);

// ── Os dois eixos, separados ───────────────────────────────────────────────
console.log("\n\nOS 15 NÓS MAIS COMPRIDOS (muito texto)\n");
for (const t of [...todos].sort((a, b) => b.chars - a.chars).slice(0, 15)) {
  console.log(`  ${String(t.chars).padStart(5)} ch  ${t.opcoes} op  ${t.modulo}/${t.id}  (${t.tipo})`);
}

console.log("\n\nOS 15 NÓS COM MAIS OPÇÕES (muita escolha)\n");
for (const t of [...todos].sort((a, b) => b.opcoes - a.opcoes || b.chars - a.chars).slice(0, 15)) {
  console.log(`  ${String(t.opcoes).padStart(3)} op  ${String(t.chars).padStart(5)} ch  (${t.charsOpcoes} nos rótulos)  ${t.modulo}/${t.id}`);
}

// ⚠️ A sobreposição é a pergunta que separa "corrigir texto" de "partir o nó".
const compridos = new Set([...todos].sort((a, b) => b.chars - a.chars).slice(0, 15).map((t) => `${t.modulo}/${t.id}`));
const escolhosos = new Set([...todos].sort((a, b) => b.opcoes - a.opcoes).slice(0, 15).map((t) => `${t.modulo}/${t.id}`));
const ambos = [...compridos].filter((x) => escolhosos.has(x));
console.log(`\n\nNOS DOIS TOP-15 (comprido E com muitas opções): ${ambos.length}`);
for (const x of ambos) console.log(`  ${x}`);

// ── Os dois eixos, cada um na sua população ────────────────────────────────
//
// ⚠️ A mediana de opções deu 0 em TODOS os módulos, e isso não é achado — é
// artefato: `options` só existe em DecisionNode, e a maioria dos nós é action.
// Misturar as duas populações numa mediana só esconde as duas.
console.log("\n\nCADA EIXO NA SUA POPULAÇÃO\n");
const decisao = todos.filter((t) => t.opcoes > 0);
const acao = todos.filter((t) => t.opcoes === 0);
const cd = decisao.map((t) => t.chars), ca = acao.map((t) => t.chars);
console.log(`  nós COM opções (decisão): ${decisao.length}`);
console.log(`     caracteres  mediana ${percentil(cd,50)} · p90 ${percentil(cd,90)} · máx ${Math.max(...cd)}`);
const op = decisao.map((t) => t.opcoes);
console.log(`     opções      mediana ${percentil(op,50)} · p90 ${percentil(op,90)} · máx ${Math.max(...op)}`);
console.log(`  nós SEM opções (ação/transição): ${acao.length}`);
console.log(`     caracteres  mediana ${percentil(ca,50)} · p90 ${percentil(ca,90)} · máx ${Math.max(...ca)}`);

console.log("\n  por módulo, só os nós de DECISÃO:\n");
console.log("  módulo            nós  ch:mediana   p90   máx | op:mediana  máx");
for (const [m, ns] of Object.entries(porModulo)) {
  const d = ns.filter((x) => x.opcoes > 0);
  if (!d.length) { console.log(`  ${m.padEnd(16)}    0   (sem nós de decisão)`); continue; }
  const c = d.map((x) => x.chars), o = d.map((x) => x.opcoes);
  console.log(
    `  ${m.padEnd(16)} ${String(d.length).padStart(3)} ${String(percentil(c,50)).padStart(11)} ` +
    `${String(percentil(c,90)).padStart(5)} ${String(Math.max(...c)).padStart(5)} |` +
    `${String(percentil(o,50)).padStart(10)} ${String(Math.max(...o)).padStart(4)}`
  );
}
