#!/usr/bin/env node
/**
 * PROMETE: que o ânion gap que a calculadora DEVOLVE seja exatamente o que a
 *   fórmula declarada em `lib/anion-gap.ts` diz — e que o rótulo mostrado na
 *   tela seja derivado dos MESMOS termos que fazem a conta.
 * NÃO PROMETE: que a fórmula escolhida seja a melhor, nem que os cortes estejam
 *   certos. A escolha entre AG com e sem potássio é decisão do autor (2026-08-23,
 *   SEM potássio); os cortes seguem herdados e pendentes (D-95).
 * UNIVERSO: a ferramenta `anion-gap` de `clinical-calculators-engine.ts`,
 *   compilada, varrida em combinações de Na, Cl e HCO₃ — o número sai impresso.
 * ORIGEM DO CRITÉRIO: decisão do autor datada (2026-08-23) — R-118.
 *
 * ── POR QUE ELA EXISTE ──────────────────────────────────────────────────────
 *
 * Existem duas fórmulas de ânion gap: com potássio (Na + K − Cl − HCO₃) e sem
 * (Na − Cl − HCO₃). **Elas dão números diferentes e têm intervalos de referência
 * diferentes.** Trocar uma pela outra sem trocar o intervalo desloca TODA a
 * classificação — e o rótulo na tela continua idêntico.
 *
 * ⚠️ Sem esta trava, a decisão se desfaz em silêncio na primeira edição, como
 * quase aconteceu com o `>= 14` da hipercalcemia.
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fag-"));
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule", "--outDir", tmp,
  path.join(RAIZ, "lib", "anion-gap.ts"),
  path.join(RAIZ, "clinical-calculators-engine.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
// ⚠️ O tsc espelha a árvore de diretórios quando há mais de uma raiz: com
// `lib/anion-gap.ts` e `clinical-calculators-engine.ts` juntos, o primeiro sai
// em `lib/`. Procurar nos dois lugares evita a trava quebrar por layout.
const acha = (nome) => {
  for (const c of [path.join(tmp, nome), path.join(tmp, "lib", nome)]) if (fs.existsSync(c)) return c;
  throw new Error(`artefato não encontrado: ${nome}`);
};
const A = require(acha("anion-gap.js"));
const { CALC_TOOLS } = require(acha("clinical-calculators-engine.js"));
const calc = CALC_TOOLS.find((c) => c.id === "anion-gap");

// ── 1. O QUE A CALCULADORA DEVOLVE É O QUE A FÓRMULA DIZ
//
// ⚠️ ESTE É O LADO QUE PEGA "somaram o K e mantiveram o rótulo": a conta de
// referência sai dos TERMOS declarados, não de uma cópia da fórmula escrita
// aqui — escrever a fórmula na trava seria a terceira cópia dela.
let conferidos = 0;
for (let na = 125; na <= 155; na += 5)
  for (let cl = 90; cl <= 115; cl += 5)
    for (let hco3 = 8; hco3 <= 30; hco3 += 2) {
      const r = calc.compute({ na: String(na), cl: String(cl), hco3: String(hco3), alb: "4" });
      if (!r) continue;
      const exibido = parseFloat(String(r.metrics[0].value).replace(",", ".").replace(/[^\d.-]/g, ""));
      const daFormula = A.calcularAG({ Na: na, Cl: cl, "HCO₃": hco3 });
      conferidos++;
      if (Math.abs(exibido - daFormula) > 0.05) {
        erro(`Na ${na} · Cl ${cl} · HCO₃ ${hco3}: a calculadora devolve ${exibido} e a fórmula declarada « ${A.textoDaFormula()} » dá ${daFormula}. Se o potássio entrou na conta, o intervalo de referência não é mais o desta fórmula — e o rótulo na tela não mudou.`);
        na = 999; cl = 999; hco3 = 999;
      }
    }

// ── 2. O RÓTULO E A CONTA SAEM DOS MESMOS TERMOS
//
// ⚠️ ESTE É O LADO QUE PEGA "mudaram o rótulo mantendo o cálculo": o texto é
// DERIVADO dos termos, então alterá-lo obriga a alterar a conta — e o item 1
// reprova. A conferência aqui é que a derivação não foi curto-circuitada por um
// literal.
{
  const esperado = `AG = ${A.FORMULA_DO_AG.positivos.join(" + ")} − (${A.FORMULA_DO_AG.negativos.join(" + ")})`;
  if (A.textoDaFormula() !== esperado)
    erro(`o rótulo « ${A.textoDaFormula()} » não é o que os termos declaram (« ${esperado} ») — rótulo escrito à mão ao lado da conta é a segunda cópia da fórmula`);
  if (A.FORMULA_DO_AG.positivos.includes("K") || A.FORMULA_DO_AG.negativos.includes("K"))
    erro(`o potássio entrou na fórmula declarada — a decisão do autor (2026-08-23) é AG SEM potássio, e mudá-la exige mudar os cortes junto`);
  const naTela = calc.compute({ na: "140", cl: "104", hco3: "24", alb: "4" })
    .metrics.some((m) => String(m.value) === A.textoDaFormula());
  if (!naTela) erro(`a fórmula não aparece junto do resultado — quem lê o número precisa saber qual das duas o app usou`);
}

console.log(`\nUNIVERSO: ${conferidos} combinação(ões) de Na × Cl × HCO₃ conferidas contra « ${A.textoDaFormula()} »`);
console.log(falhas ? `\n❌ ${falhas} falha(s)` : `\n✅ o cálculo bate com a fórmula declarada, o rótulo é derivado dos mesmos termos, e ela aparece na tela`);
process.exit(falhas ? 1 : 0);
