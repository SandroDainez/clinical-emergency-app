#!/usr/bin/env node
/**
 * PROMETE: que nenhum número escrito na PROSA da tela dos eletrólitos contradiga
 *   o corte declarado no dado para o mesmo analito. Se o texto diz "Ca < 7 mg/dL"
 *   e o corte é 1,9 mmol/L (≈ 7,62 mg/dL), reprova.
 * NÃO PROMETE: que o corte esteja clínico certo, nem que a prosa esteja completa.
 *   Ela confere COERÊNCIA entre as duas cópias, não a verdade de nenhuma.
 * UNIVERSO: os cortes com unidade declarada em `lib/eletrolitos/gravidade.ts`
 *   (impressos antes do resultado) × as strings da tela dos eletrólitos.
 *
 * ── R-95 NA SUA FORMA MAIS TEIMOSA ──────────────────────────────────────────
 *
 * O corte da hipocalcemia mudou de `< 7 mg/dL` para `< 1,9 mmol/L` (≈ 7,62) em
 * 2026-08-23 — e **a prosa ao lado continuou dizendo o número velho**. Ninguém
 * mente de propósito: o número saiu do lugar onde a trava olha e ficou onde ela
 * não olhava.
 *
 * ⚠️ A segunda cópia não está em outro campo. Está NA FRASE.
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const RAIZ = path.resolve(__dirname, "..");
const TELA = path.join(RAIZ, "components", "protocol-screen", "electrolyte-calculator-screen.tsx");
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "txt-"));
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(RAIZ, "lib", "eletrolitos", "gravidade.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
const G = require(path.join(tmp, "eletrolitos", "gravidade.js"));

/**
 * Como a prosa nomeia cada analito, e em que unidade a tela trabalha.
 * ⚠️ Lista DIGITADA: a cobertura é piso. O que não estiver aqui não é conferido,
 * e é por isso que o universo sai impresso.
 */
const ANALITOS = [
  { disturbio: "hypocalcemia", nomes: /\b(?:c[áa]lcio|\bCa\b)/i, unidade: "mg/dL" },
  { disturbio: "hypercalcemia", nomes: /\b(?:c[áa]lcio|\bCa\b)/i, unidade: "mg/dL" },
  { disturbio: "hypophosphatemia", nomes: /\bf[óo]sforo\b/i, unidade: "mg/dL" },
];

/** Os valores do corte, já na unidade da tela, arredondados como a tela mostra. */
function cortesDaTela(disturbio) {
  const out = [];
  const colher = (c) => {
    if (c.tipo === "combinado") { colher(c.faixa); colher(c.clinico); return; }
    const t = G.textoDoCorte(disturbio, c);
    if (!t) return;
    for (const m of t.matchAll(/≈\s*([\d,]+)/g)) out.push(parseFloat(m[1].replace(",", ".")));
  };
  for (const g of G.GRAVIDADE_POR_DISTURBIO[disturbio]) g.cortes.forEach(colher);
  return out;
}

const tela = lerFonte(TELA);
const literais = [...tela.matchAll(/"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2] ?? "");
let conferidos = 0, universo = 0;

for (const a of ANALITOS) {
  const cortes = cortesDaTela(a.disturbio);
  universo += cortes.length;
  if (!cortes.length) continue;
  for (const s of literais) {
    if (!a.nomes.test(s)) continue;
    // números com a unidade da tela colada, precedidos de comparação
    for (const m of s.matchAll(new RegExp(`[<>≤≥]\\s*([\\d,]+)\\s*${a.unidade.replace("/", "\\/")}`, "gi"))) {
      const v = parseFloat(m[1].replace(",", "."));
      conferidos++;
      // ⚠️ DUAS JANELAS, E A DE FORA É A QUE EVITA O RUÍDO.
      //
      //   |diferença| < 0,1  → é o MESMO corte, escrito com outras casas
      //                        (7,6 × 7,62). Passa.
      //   0,1 ≤ |dif| < 1,0  → o número da prosa QUERIA ser o corte e ficou para
      //                        trás (7 × 7,62). É o defeito. Reprova.
      //   |dif| ≥ 1,0        → é OUTRO número, com outro propósito clínico
      //                        ("fósforo > 2 mg/dL" não tenta ser o corte de
      //                        0,99). Não é assunto desta trava — trava que
      //                        grita por número legítimo é trava que se desliga.
      //
      // ⚠️ A primeira versão não tinha a janela de fora e acusou três números
      // legítimos, inclusive comparando o corte do cálcio com a prosa do fósforo.
      const bate = cortes.some((c) => Math.abs(c - v) < 0.1);
      const envelhecido = !bate && cortes.some((c) => Math.abs(c - v) < 1.0);
      if (envelhecido)
        erro(`${a.disturbio}: a prosa diz « ${m[0]} » e o corte declarado é ${cortes.map((c) => c.toFixed(2)).join(" / ")} ${a.unidade} — o número da frase envelheceu ao lado do dado (R-95). Se for histórico, escreva que é.\n     na frase: « ${s.slice(0, 100)} »`);
    }
  }
}

console.log(`\nUNIVERSO: ${ANALITOS.length} analito(s) na lista · ${universo} corte(s) com unidade declarada · ${literais.length} literais na tela · ${conferidos} número(s) de prosa conferido(s)`);
console.log(falhas ? `\n❌ ${falhas} divergência(s)` : `\n✅ nenhum número de prosa contradiz o corte declarado`);
process.exit(falhas ? 1 : 0);
