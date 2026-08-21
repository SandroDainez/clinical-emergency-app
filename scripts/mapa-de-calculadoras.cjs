#!/usr/bin/env node
/**
 * AS CALCULADORAS — inventário de fórmula, limiar e fonte (§2 do adendo do autor).
 *
 * PROMETE: listar TODA ferramenta de `clinical-calculators-engine.ts` com a fonte
 *   que ela declara e os LIMIARES DE INTERPRETAÇÃO que o código usa — os números
 *   que decidem faixa, cor e rótulo do resultado.
 * NÃO PROMETE: dizer se a fórmula está certa, se o limiar é o da fonte, nem
 *   corrigir coisa alguma. É MEDIÇÃO — e ela não desliga calculadora nenhuma.
 * UNIVERSO: as ferramentas de CALC_TOOLS, compiladas, com piso no retrato.
 *
 * ── ⚠️ POR QUE ESTA CLASSE NUNCA FOI AUDITADA ──────────────────────────────
 *
 * O campo `forca` foi para as ÁRVORES. O `mapa:fontes` audita MÓDULOS. As
 * calculadoras ficaram entre as duas coisas e não foram vistas por nenhuma —
 * pela mesma razão que os presets: **ninguém audita o que parece
 * infraestrutura.**
 *
 * ⚠️ E ELAS SÃO MAIS PERIGOSAS QUE UM PRESET. Um preset SUGERE; uma calculadora
 * ENTREGA UM NÚMERO PRONTO com aparência de cálculo objetivo. O usuário sem
 * experiência — o alvo do app — não tem como saber que o corte que pinta o
 * resultado de vermelho foi escolhido por alguém, e não pela fonte.
 *
 * ── ⚠️ O QUE A MEDIÇÃO MOSTRA, E QUE É O ACHADO ────────────────────────────
 *
 * A fonte é declarada POR FERRAMENTA (`reference`), nunca POR LIMIAR. É o mesmo
 * defeito que a regra B corrigiu nas árvores: um selo por tela, quando a tela
 * afirma coisas de procedências diferentes. Aqui, uma referência por
 * calculadora, quando cada faixa é uma afirmação própria.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { conferirUniverso } = require("./lib/universo.cjs");
const { lerFonte } = require("./lib/fonte.cjs");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "calcs-"));
const ARQ = "clinical-calculators-engine.ts";

execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
  "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(app, ARQ),
], { cwd: app, stdio: ["ignore", "ignore", "inherit"] });

const { CALC_TOOLS } = require(path.join(tmp, ARQ.replace(/\.ts$/, ".js")));
fs.rmSync(tmp, { recursive: true, force: true });

if (!CALC_TOOLS || !CALC_TOOLS.length) {
  console.log("\n❌ CALC_TOOLS vazio ou não encontrado — o varredor quebrou. Isto é \"não consegui olhar\".\n");
  process.exit(1);
}

// ⚠️ OS LIMIARES VÊM DO CÓDIGO-FONTE, não do objeto: eles vivem DENTRO de
// `compute`, em comparações. `lerFonte` tira comentários — número citado em
// comentário não decide nada, e contá-lo inflaria a medição.
const fonte = lerFonte(path.join(app, ARQ));
const regiao = (id) => {
  const i = fonte.indexOf(`id: "${id}"`);
  if (i < 0) return "";
  const j = fonte.indexOf('    id: "', i + 10);
  return fonte.slice(i, j < 0 ? fonte.length : j);
};
const limiaresDe = (id) => {
  const txt = regiao(id);
  const achados = [...txt.matchAll(/([a-zA-Z_][\w.]*)\s*(>=|<=|>|<|===)\s*(-?\d+(?:\.\d+)?)/g)]
    .map((m) => `${m[1]} ${m[2]} ${m[3]}`);
  return [...new Set(achados)];
};

const linhas = CALC_TOOLS.map((c) => ({
  id: c.id,
  nome: c.name,
  kind: c.kind,
  referencia: (c.reference || "").trim(),
  entradas: (c.inputs || []).length,
  limiares: limiaresDe(c.id),
}));

const semReferencia = linhas.filter((l) => !l.referencia);
const totalLimiares = linhas.reduce((n, l) => n + l.limiares.length, 0);

// ⚠️ OS LIMIARES DE FUNÇÃO AUXILIAR FICAVAM FORA DA CONTA, e foi uma mutação que
// mostrou: mudar `tfg >= 60` — o corte que separa TFG normal de reduzida — NÃO
// aparecia, porque `faixaTFG` vive ANTES de `CALC_TOOLS` e não pertence à região
// de ferramenta nenhuma. É o mesmo defeito da trava da acidose: universo
// recortado no lugar errado (R-87). Eles entram na conta, como classe própria.
const TODAS = [...fonte.matchAll(/([a-zA-Z_][\w.]*)\s*(>=|<=|>|<|===)\s*(-?\d+(?:\.\d+)?)/g)]
  .map((m) => `${m[1]} ${m[2]} ${m[3]}`);
const dentroDeFerramenta = new Set(linhas.flatMap((l) => l.limiares));
const auxiliares = [...new Set(TODAS)].filter((x) => !dentroDeFerramenta.has(x));

console.log("\nAS CALCULADORAS — fórmula, limiar e fonte (medição, não correção)\n");
console.log(
  `   universo: ${linhas.length} ferramentas · ${linhas.reduce((n, l) => n + l.entradas, 0)} campos de entrada · ` +
  `${totalLimiares} limiares dentro das ferramentas + ${auxiliares.length} em funções AUXILIARES`
);
const okF = conferirUniverso("mapa-de-calculadoras", "ferramentas", linhas.length);
const okL = conferirUniverso("mapa-de-calculadoras", "limiares", totalLimiares + auxiliares.length);

for (const l of linhas) {
  console.log(`\n   ── ${l.nome}  (${l.kind} · ${l.id})`);
  console.log(`      fonte declarada: ${l.referencia ? l.referencia.slice(0, 100) : "⚠️ NENHUMA"}`);
  console.log(`      limiares no código (${l.limiares.length}): ${l.limiares.slice(0, 10).join(" · ") || "nenhum"}`);
  if (l.limiares.length > 10) console.log(`         … e mais ${l.limiares.length - 10}`);
}

console.log("\n── AS TRÊS COLUNAS ──");
console.log(`   fonte declarada NO NÍVEL DA FERRAMENTA ....... ${linhas.length - semReferencia.length} de ${linhas.length}`);
console.log(`   ferramenta SEM referência nenhuma ............ ${semReferencia.length}`);
for (const l of semReferencia) console.log(`      ⚠️ ${l.id}`);
console.log(`\n   ⚠️ LIMIARES EM FUNÇÃO AUXILIAR (fora de toda ferramenta): ${auxiliares.length}`);
console.log("      Eles decidem FAIXA e COR do resultado sem pertencer a nenhuma calculadora — e por isso");
console.log("      não herdam nem a referência do nível da ferramenta. Amostra:");
for (const x of auxiliares.slice(0, 12)) console.log(`      · ${x}`);
if (auxiliares.length > 12) console.log(`      … e mais ${auxiliares.length - 12}`);
console.log(`\n   ⚠️ LIMIARES com fonte declarada NO LIMIAR .... 0 de ${totalLimiares + auxiliares.length}`);
console.log("      ⚠️ ESTE É O ACHADO: a fonte é declarada POR FERRAMENTA, nunca POR LIMIAR.");
console.log("      É o mesmo defeito que a regra B corrigiu nas árvores — um selo por tela, quando a");
console.log("      tela afirma coisas de procedências diferentes. Aqui, uma referência por calculadora,");
console.log("      quando CADA FAIXA é uma afirmação própria. Nada foi corrigido: é inventário.\n");

if (!okF || !okL) {
  console.log("❌ universo abaixo do piso — as contagens acima NÃO significam cobertura.\n");
  process.exit(1);
}
