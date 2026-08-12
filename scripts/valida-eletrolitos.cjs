/**
 * Correções eletrolíticas: a aritmética fecha e os dois lados têm o mesmo cuidado.
 *
 * ── O QUE ESTE SCRIPT COBRA ──────────────────────────────────────────────────
 *
 * 1. AS CONSTANTES das soluções, contra a massa molar. NaCl 3% = 513 mEq/L,
 *    20% = 3,42 mEq/mL, SF = 154, 0,45% = 77 — e a fração de mistura que
 *    transforma SF + NaCl 20% em 3%. São os números de onde sai todo o resto;
 *    errar um deles erra o módulo inteiro sem que nada mais denuncie.
 *
 * 2. PARIDADE HIPO × HIPER no sódio. O limite de 8 mEq/24 h da hipernatremia
 *    estava NO CÓDIGO e nunca era dito: "edema cerebral" 0×, "sobrecorreção"
 *    0×, limite explícito 0× — contra 4× de sobrecorreção e o nome do dano do
 *    lado da hiponatremia, na MESMA tela. O erro simétrico é o esquecido.
 *
 * 3. OS DOIS SAIS DE CÁLCIO, com o fator. O módulo só oferecia gluconato,
 *    enquanto o app usa CLORETO em politrauma, choque e PCR na gestante — quem
 *    viu a droga lá lê os dois como intercambiáveis. 1 g de cloreto ≈ 3 g de
 *    gluconato em cálcio elementar.
 *
 * Este script FALHA O BUILD. Escrito com a lista do R-15.
 */

const fs = require("node:fs");
const path = require("node:path");
const appDir = path.resolve(__dirname, "..");

const falhas = [];
let ok = 0;

const TELA = "components/protocol-screen/electrolyte-calculator-screen.tsx";
const bruto = fs.readFileSync(path.join(appDir, TELA), "utf8");
// R-15 item 1: comentários fora — este arquivo passou a documentar os próprios
// defeitos, e a documentação cita os números que as regras procuram.
const src = bruto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** Extrai o bloco de um `case` do switch de estratégia. */
function bloco(nome) {
  const linhas = src.split("\n");
  const i = linhas.findIndex((l) => l.includes(`case "${nome}": {`));
  if (i < 0) return null;
  const ordem = ["hyponatremia","hypernatremia","hypokalemia","hyperkalemia","hypocalcemia",
    "hypercalcemia","hypomagnesemia","hypermagnesemia","hypophosphatemia","hyperphosphatemia",
    "hypochloremia","hyperchloremia"];
  const proximo = ordem[ordem.indexOf(nome) + 1];
  const j = proximo
    ? linhas.findIndex((l, k) => k > i && l.includes(`case "${proximo}": {`))
    : linhas.length;
  return linhas.slice(i, j < 0 ? linhas.length : j).join("\n");
}

// ── A. As constantes, contra a massa molar do NaCl (58,44) ──────────────────
const MM = 58.44;
const CONSTANTES = [
  ["NaCl 3% = 513 mEq/L", /\(513 - /, Math.round((30 / MM) * 1000), 513],
  ["NaCl 20% = 3,42 mEq/mL", /3\.42/, Math.round((200 / MM) * 100) / 100, 3.42],
  ["SF 0,9% = 154 mEq/L", /154/, Math.round((9 / MM) * 1000), 154],
  ["NaCl 0,45% = 77 mEq/L", /\(77 - /, Math.round((4.5 / MM) * 1000), 77],
];
for (const [rotulo, re, calculado, declarado] of CONSTANTES) {
  if (calculado !== declarado) {
    falhas.push(`a referência desta trava está errada em "${rotulo}": massa molar dá ${calculado}.`);
  } else ok++;
  if (!re.test(src)) {
    falhas.push(`${TELA} não usa mais a constante de ${rotulo} — a aritmética do sódio mudou de base.`);
  } else ok++;
}
// A fração da mistura SF + NaCl 20% → 3% precisa produzir 0,513 mEq/mL.
{
  const m = src.match(/\((0\.\d+) - (0\.\d+)\) \/ \((\d\.\d+) - (0\.\d+)\)/);
  if (!m) {
    falhas.push("a fração de mistura (SF 0,9% + NaCl 20% → 3%) não foi encontrada — a leitura cegou.");
  } else {
    const [, alvo, base, forte, base2] = m.map(Number);
    const frac = (alvo - base) / (forte - base2);
    const conc = frac * forte + (1 - frac) * base;
    if (Math.abs(conc - 0.513) > 1e-4) {
      falhas.push(
        `a mistura SF + NaCl 20% produz ${conc.toFixed(4)} mEq/mL, não 0,513 (NaCl 3%). ` +
        `A alternativa oferecida ao NaCl 3% pronto não é equivalente a ele.`
      );
    } else ok++;
  }
}

// ── B. PARIDADE hipo × hiper no sódio ───────────────────────────────────────
{
  const hipo = bloco("hyponatremia");
  const hiper = bloco("hypernatremia");
  if (!hipo || !hiper) {
    falhas.push("blocos de hipo/hipernatremia não encontrados — a conferência de paridade não rodou.");
  } else {
    // Cada lado nomeia o SEU dano, e nenhum dos dois fica sem limite escrito.
    const EXIGE = [
      [hipo, /desmielin/i, "hiponatremia", "o nome do dano da correção rápida (desmielinização osmótica)"],
      [hipo, /8–10 mEq|8-10 mEq/, "hiponatremia", "o teto de 8–10 mEq/L em 24 h"],
      [hiper, /edema cerebral/i, "hipernatremia", "o nome do dano da correção rápida (EDEMA CEREBRAL)"],
      [hiper, /8–10 mEq|8-10 mEq/, "hipernatremia", "o teto de 8–10 mEq/L em 24 h"],
      [hiper, /0,5 mEq\/L\/h/, "hipernatremia", "a velocidade horária equivalente (0,5 mEq/L/h)"],
      [hiper, /agud/i, "hipernatremia", "a distinção agudo × crônico, que vem antes da escolha da velocidade"],
    ];
    for (const [texto, re, lado, oque] of EXIGE) {
      if (!re.test(texto)) {
        falhas.push(
          `${lado}: falta ${oque}. O limite pode estar no CÓDIGO e não no texto — foi exatamente ` +
          `o caso da hipernatremia, que trazia goal = max(Na − 8, 145) e nunca dizia o porquê.`
        );
      } else ok++;
    }
    // E o teto continua implementado, não só escrito.
    if (!/Math\.max\(current - 8, 145\)/.test(src)) {
      falhas.push("o teto de 8 mEq/24 h saiu da meta automática da hipernatremia — o texto ficaria sem lastro no cálculo.");
    } else ok++;
  }
}

// ── C. Os dois sais de cálcio, com o fator na mesma linha ───────────────────
{
  const hipo = bloco("hypocalcemia");
  if (!hipo) {
    falhas.push("bloco da hipocalcemia não encontrado.");
  } else {
    if (!/gluconato de cálcio 10%/i.test(hipo)) {
      falhas.push("hipocalcemia: perdeu o gluconato de cálcio.");
    } else ok++;
    if (!/CLORETO de cálcio|cloreto de cálcio/i.test(hipo)) {
      falhas.push(
        "hipocalcemia: o CLORETO de cálcio sumiu. O app usa cloreto em politrauma, choque e PCR na " +
        "gestante — oferecer só gluconato aqui faz os dois parecerem intercambiáveis, e 1 g de " +
        "cloreto ≈ 3 g de gluconato em cálcio elementar (R-6)."
      );
    } else ok++;
    // O FATOR e o elementar precisam estar escritos, não deduzíveis.
    if (!/1,36 mEq/.test(hipo) || !/0,465 mEq/.test(hipo)) {
      falhas.push("hipocalcemia: o cálcio ELEMENTAR de cada sal (1,36 × 0,465 mEq/mL) não está escrito lado a lado.");
    } else ok++;
    if (!/3×|~3 ×|três vezes/i.test(hipo)) {
      falhas.push("hipocalcemia: o FATOR entre os dois sais não está declarado — é o número que evita a troca 1:1.");
    } else ok++;
    // E a escolha é por contexto, não por disponibilidade.
    if (!/esclerosante/i.test(hipo) || !/PCR|hipercalemia/i.test(hipo)) {
      falhas.push(
        "hipocalcemia: falta a razão CLÍNICA da escolha entre os sais (cloreto na PCR/hipercalemia com " +
        "ECG alterado, mais esclerosante e de preferência central; gluconato em acesso periférico)."
      );
    } else ok++;
  }
}

// A aritmética do cálcio elementar, contra a massa molar.
{
  const glu = (100 * (40.08 / 430.4)) / 20.04;
  const clo = (100 * (40.08 / 147.0)) / 20.04;
  if (Math.abs(glu - 0.465) > 0.001) falhas.push(`gluconato 10%: o cálculo dá ${glu.toFixed(4)} mEq/mL, e o app declara 0,465.`);
  else ok++;
  if (Math.abs(clo / glu - 2.93) > 0.02) falhas.push(`a razão cloreto/gluconato dá ${(clo / glu).toFixed(2)}×, e o app declara ~3×.`);
  else ok++;
}

console.log("\nCorreções eletrolíticas — constantes, paridade e os dois sais de cálcio\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log("");
} else {
  console.log(`✅ ${ok} verificações — constantes contra massa molar, hipo e hiper com o mesmo cuidado, cálcio com o fator escrito\n`);
}
process.exit(falhas.length ? 1 : 0);
