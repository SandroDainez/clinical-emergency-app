/**
 * Osmolaridade calculada: uma fórmula só, com o divisor da UREIA, e o critério
 * de EHH pela EFETIVA.
 *
 * ── O DEFEITO QUE ORIGINOU ESTE SCRIPT ───────────────────────────────────────
 *
 * `dka-hhs-engine` calculava `2×Na + glic/18 + ureia/2,8` e comparava o
 * resultado contra o limiar de 320 do EHH. Dois erros somando na mesma direção:
 *
 *   · 2,8 é o divisor do BUN (nitrogênio ureico). O campo pede UREIA — rótulo,
 *     faixa do helper (~10–50 contra 7–20 do BUN), conversão ×6 e presets, tudo
 *     diz ureia. Ureia ÷ 2,8 infla esse termo em 6 ÷ 2,8 = 2,14×.
 *   · O limiar de 320 é de osmolalidade EFETIVA, que EXCLUI a ureia (osmol
 *     ineficaz). Comparar a TOTAL contra ele infla de novo.
 *
 * Resultado medido: +8 a +23 mOsm, e em Na 138 / glic 500 / ureia 60 a
 * classificação MUDAVA — o app dizia EHH onde os dois critérios corretos
 * diziam que não. E CAD rotulada como EHH recebe insulina menor e hidratação
 * mais longa enquanto a cetoacidose corre.
 *
 * ── O QUE ESTE SCRIPT COBRA (R-17: RECALCULA, não compara) ──────────────────
 *
 * Os divisores são DERIVADOS da massa molar — glicose 180 (÷18 para mg/dL →
 * mmol/L) e ureia 60 (÷6). O script não pergunta ao app quanto dá: ele calcula.
 * É a única forma que um erro CONSISTENTE não atravessa.
 *
 * Este script FALHA O BUILD.
 */

const fs = require("node:fs");
const path = require("node:path");
const appDir = path.resolve(__dirname, "..");

const falhas = [];
let ok = 0;

// ── A. Os divisores, derivados da massa molar ───────────────────────────────
//
// mg/dL → mmol/L: (mg/dL × 10) ÷ MM = mg/dL ÷ (MM/10).
const MM = { glicose: 180.16, ureia: 60.06, nitrogenioUreico: 28.01 };
const DIVISORES = {
  glicose: MM.glicose / 10,           // ≈ 18,0
  ureia: MM.ureia / 10,               // ≈ 6,0
  nitrogenioUreico: MM.nitrogenioUreico / 10, // ≈ 2,8  ← o do BUN
};
for (const [nome, esperado, usado] of [
  ["glicose", 18, DIVISORES.glicose],
  ["ureia", 6, DIVISORES.ureia],
  ["BUN", 2.8, DIVISORES.nitrogenioUreico],
]) {
  if (Math.abs(esperado - usado) > 0.05) {
    falhas.push(`a derivação de referência falhou para ${nome}: massa molar dá ${usado.toFixed(2)}, e a trava esperava ${esperado}.`);
  } else ok++;
}
// E a razão entre eles é o tamanho do erro que este script existe para impedir.
const razao = DIVISORES.ureia / DIVISORES.nitrogenioUreico;
if (Math.abs(razao - 2.14) > 0.02) {
  falhas.push(`a razão ureia/BUN deu ${razao.toFixed(3)}, e o app documenta ~2,14×.`);
} else ok++;

// ── B. Quem CALCULA osmolaridade usa o divisor da UREIA ─────────────────────
//
// R-15 item 1: comentários fora. Este repositório passou a documentar o próprio
// defeito, e os comentários citam "2,8" e "BUN" de propósito.
const limpar = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

// O RECORTE é por arquivo, porque a forma do cálculo difere: o motor da CAD usa
// funções nomeadas; as Calculadoras computam inline dentro do bloco da
// ferramenta `id: "osmolalidade"`. Recortar errado faz a regra não achar nada e
// — na primeira versão — acusar o arquivo certo por engano.
const CALCULAM = [
  ["dka-hhs-engine.ts", /2 \* na \+ gluMgDl \/ 18/, /function\s+\w*[Oo]sm\w*\s*\([\s\S]*?\n\}/g],
  ["clinical-calculators-engine.ts", /2 \* na \+ glic \/ 18/, /id: "osmolalidade"[\s\S]*?\n  \},/g],
];
for (const [rel, reBase, reRecorte] of CALCULAM) {
  const t = limpar(fs.readFileSync(path.join(appDir, rel), "utf8"));
  if (!reBase.test(t)) {
    falhas.push(`${rel}: a base da osmolaridade (2×Na + glicose/18) mudou de forma — a conferência cegou.`);
    continue;
  }
  ok++;
  // O divisor do BUN não pode aparecer DENTRO das funções de osmolaridade.
  //
  // A primeira versão filtrava LINHAS que contivessem "2 * na" ou "osm" — e a
  // linha do defeito original é `o += ureiaMgDl / 2.8;`, que não contém nem um
  // nem outro. A mutação que reintroduzia o defeito passava verde. Agora o
  // recorte é o CORPO DA FUNÇÃO inteira, não uma heurística de linha.
  const trechos = [...t.matchAll(reRecorte)].map((m) => m[0]);
  if (!trechos.length) {
    falhas.push(`${rel}: o trecho que calcula osmolaridade não foi encontrado — a conferência do divisor não rodou.`);
  } else ok++;
  for (const fn of trechos) {
    if (/\/\s*2\.8\b/.test(fn)) {
      const linha = fn.split("\n").find((l) => /\/\s*2\.8\b/.test(l)) || "";
      falhas.push(
        `${rel}: uma função de osmolaridade usa o divisor 2,8 (BUN) — «${linha.trim().slice(0, 70)}». ` +
        `O campo do app pede UREIA, e o divisor da ureia é 6. Erro de ~2,14× nesse termo.`
      );
    } else ok++;
  }
  if (!/\/\s*6\b/.test(t)) {
    falhas.push(`${rel}: não usa o divisor 6 (ureia) em lugar nenhum — a osmolaridade total perdeu o termo da ureia.`);
  } else ok++;
}

// ── C. O critério de EHH usa a EFETIVA, nunca a total ───────────────────────
{
  const t = limpar(fs.readFileSync(path.join(appDir, "dka-hhs-engine.ts"), "utf8"));
  const linha = t.split("\n").find((l) => /hiperOsmHhs\s*=/.test(l));
  if (!linha) {
    falhas.push("dka-hhs-engine: o critério de osmolaridade do EHH (hiperOsmHhs) não foi encontrado.");
  } else if (!/osmEfetiva/.test(linha)) {
    falhas.push(
      `dka-hhs-engine: o critério de EHH voltou a usar a osmolaridade TOTAL — «${linha.trim().slice(0, 70)}». ` +
      `O limiar de 320 é de osmolalidade EFETIVA, que exclui a ureia; usar a total SUPERDIAGNOSTICA EHH, e ` +
      `CAD rotulada como EHH recebe insulina menor enquanto a cetoacidose corre.`
    );
  } else ok++;
  if (!/function estimateEffectiveOsm/.test(t)) {
    falhas.push("dka-hhs-engine: a função da osmolalidade efetiva sumiu.");
  } else ok++;
  // A efetiva NÃO pode conter ureia — é o que a define.
  const bloco = t.match(/function estimateEffectiveOsm[\s\S]*?\n\}/);
  if (bloco && /ureia|bun/i.test(bloco[0])) {
    falhas.push("dka-hhs-engine: a osmolalidade EFETIVA passou a incluir ureia — deixa de ser efetiva.");
  } else if (bloco) ok++;
}

// ── D. O rótulo do campo diz UREIA, não BUN ─────────────────────────────────
{
  const t = fs.readFileSync(path.join(appDir, "dka-hhs-engine.ts"), "utf8");
  if (!/Ureia — não BUN/.test(t)) {
    falhas.push(
      "dka-hhs-engine: o rótulo do campo não distingue UREIA de BUN. Foi a confusão entre os dois que " +
      "produziu o erro de 2,14× — e quem informar BUN ali reintroduz o mesmo defeito pelo lado do usuário."
    );
  } else ok++;
}

// ── E. Os módulos que ENSINAM a fórmula continuam ensinando a certa ─────────
//
// Quatro lugares já estavam certos quando o motor estava errado (R-18). Se um
// deles regredir, some o indício que levou ao achado.
const ENSINAM = [
  ["tce-decision-tree.ts", /ureia\/6/, "o gap osmolar do manitol"],
  ["poisoning-decision-tree.ts", /ureia\/6/, "o gap osmolar do álcool tóxico"],
  ["dka-hhs-decision-tree.ts", /osmolalidade efetiva = 2 × Na/, "o critério de EHH"],
];
for (const [rel, re, oque] of ENSINAM) {
  const t = limpar(fs.readFileSync(path.join(appDir, rel), "utf8"));
  if (!re.test(t)) {
    falhas.push(`${rel}: ${oque} deixou de ensinar a fórmula correta.`);
  } else ok++;
}

console.log("\nOsmolaridade calculada — divisor da ureia e critério pela efetiva\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log("");
} else {
  console.log(`✅ ${ok} verificações — divisores derivados da massa molar, EHH pela efetiva, rótulo distinguindo ureia de BUN\n`);
}
process.exit(falhas.length ? 1 : 0);
