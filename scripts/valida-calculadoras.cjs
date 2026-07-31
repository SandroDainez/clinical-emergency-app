/**
 * Validação estrutural das calculadoras clínicas.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * --------------------------
 * Cada calculadora do app cita, no próprio código, a publicação primária que a
 * define. Nenhuma estava conferida contra ela — a citação existia, a verificação
 * não. Conferir 15 artigos inteiros é caro e, na prática, não acontece.
 *
 * Mas quase toda publicação de escore declara um INVARIANTE verificável: a faixa
 * que o escore pode assumir. E o invariante é sensível — a faixa só fecha se
 * todos os pesos estiverem certos.
 *
 * Exemplo real: o APACHE II vai de 0 a 71 (Knaus 1985). Se a creatinina não
 * dobrasse na insuficiência renal aguda, o máximo daria 67. Se o Glasgow fosse
 * pontuado como as demais variáveis (teto 4 em vez de 12), daria 63. Se a idade
 * parasse em 5 pontos, daria 70. Um único peso errado quebra o teste.
 *
 * O QUE ELE PROVA E O QUE NÃO PROVA
 * ---------------------------------
 * Prova que o conjunto de pesos fecha na faixa publicada. NÃO prova que cada
 * faixa individual de cada variável está no ponto certo — para isso é preciso o
 * texto completo com as tabelas. É bem mais do que "a citação está no
 * comentário", e bem menos do que uma auditoria completa. O relatório diz
 * exatamente qual das duas coisas cada calculadora recebeu.
 *
 * COMO ESTENDER
 * -------------
 * Acrescente uma entrada em INVARIANTES com a faixa e a fonte. Se a publicação
 * não declarar faixa, registre `faixa: null` com o motivo: o script conta como
 * PENDENTE em vez de fingir cobertura.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-calc-"));

function loadModule(sourcePath, outputName) {
  execFileSync(
    "npx",
    ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
     "--esModuleInterop", "--moduleResolution", "node", "--outDir", tempDir, sourcePath],
    { cwd: appDir, stdio: "inherit" }
  );
  return require(path.join(tempDir, outputName));
}

const { CALC_TOOLS } = loadModule(
  path.join(appDir, "clinical-calculators-engine.ts"),
  "clinical-calculators-engine.js"
);
assert.ok(Array.isArray(CALC_TOOLS), "CALC_TOOLS não foi exportado");

// ── Invariantes declarados pelas publicações primárias ────────────────────────
//
// Cada entrada precisa citar ONDE a faixa foi lida. Faixa sem procedência não
// entra: seria trocar uma suposição por outra.
const INVARIANTES = {
  apache2: {
    faixa: [0, 71],
    fonte: "Knaus WA, Draper EA, Wagner DP, Zimmerman JE. Crit Care Med 1985;13(10):818-829 (PMID 3928249). O abstract declara textualmente pontuação variando de 0 a 71.",
  },
  glasgow: {
    faixa: [3, 15],
    fonte: "Teasdale G, Jennett B. Lancet 1974. A escala vai de 3 (nenhuma resposta em nenhum domínio) a 15.",
  },
  qsofa: {
    faixa: [0, 3],
    fonte: "Seymour CW et al. JAMA 2016;315(8):762-774. Três critérios, 1 ponto cada — a faixa decorre da definição.",
  },
  "curb-65": {
    faixa: [0, 5],
    fonte: "Lim WS et al. Thorax 2003;58(5):377-382. Cinco critérios, 1 ponto cada; o acrônimo é a definição.",
  },
  sofa: {
    faixa: [0, 24],
    fonte: "Vincent JL et al. Intensive Care Med 1996; reafirmado em Singer M et al. JAMA 2016. Seis sistemas orgânicos, 0-4 pontos cada.",
  },
  saps3: {
    faixa: null,
    fonte: "Moreno RP et al. Intensive Care Med 2005;31(9):1186-1196. O abstract declara 20 variáveis no modelo final e coorte de 16.784 pacientes em 303 UTIs, mas NÃO declara a faixa do escore. Invariante indisponível sem o texto completo.",
  },
};

// ── Extremos por tipo de ferramenta ───────────────────────────────────────────

/** Escore por opções: mínimo e máximo são a soma dos extremos de cada variável. */
function extremosDeScore(calc) {
  let min = 0;
  let max = 0;
  for (const v of calc.vars) {
    const pontos = v.options.map((o) => o.points);
    min += Math.min(...pontos);
    max += Math.max(...pontos);
  }
  return [min, max];
}

function totalDe(resultado) {
  if (!resultado || !Array.isArray(resultado.metrics)) return null;
  const m = resultado.metrics.find((x) => x.highlight) || resultado.metrics[0];
  if (!m) return null;
  const n = parseFloat(String(m.value).replace(",", ".").replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function candidatos(input) {
  if (input.kind === "toggle" && Array.isArray(input.options)) {
    return input.options.map((o) => String(o.value));
  }
  const vals = [];
  for (let x = -20; x <= 400; x += 1) vals.push(String(x));
  for (let x = 0; x <= 16; x += 0.05) vals.push(String(Math.round(x * 100) / 100));
  return vals;
}

/**
 * Fórmula: busca coordenada a coordenada. Estes escores são somas de componentes
 * independentes, então o ótimo por componente é o ótimo global — a varredura
 * fica linear em vez de combinatória. Duas passadas cobrem dependências entre
 * campos (ex.: creatinina e o toggle de insuficiência renal aguda).
 */
function extremoDeFormula(calc, direcao) {
  const inputs = calc.inputs || [];
  const atual = {};
  for (const i of inputs) {
    atual[i.id] = i.kind === "toggle" ? String(i.options[0].value) : "1";
  }
  // Semente: alguns campos exigem valor plausível para o compute não devolver null.
  for (const i of inputs) {
    if (i.kind === "toggle") continue;
    for (const cand of ["40", "10", "100", "7.4", "1"]) {
      atual[i.id] = cand;
      if (calc.compute(atual)) break;
    }
  }
  if (!calc.compute(atual)) return null;

  const melhorQue = (a, b) => (direcao === "max" ? a > b : a < b);
  for (let passada = 0; passada < 3; passada++) {
    for (const i of inputs) {
      let escolhido = atual[i.id];
      let melhorTotal = totalDe(calc.compute(atual));
      for (const cand of candidatos(i)) {
        const r = calc.compute({ ...atual, [i.id]: cand });
        if (!r) continue;
        const t = totalDe(r);
        if (t == null) continue;
        if (melhorTotal == null || melhorQue(t, melhorTotal)) {
          melhorTotal = t;
          escolhido = cand;
        }
      }
      atual[i.id] = escolhido;
    }
  }
  return totalDe(calc.compute(atual));
}

function extremos(calc) {
  if (calc.kind === "score") return extremosDeScore(calc);
  return [extremoDeFormula(calc, "min"), extremoDeFormula(calc, "max")];
}

// ── Execução ──────────────────────────────────────────────────────────────────
let ok = 0;
let falhas = 0;
let pendentes = 0;
const semInvariante = [];
const linhas = [];

for (const calc of CALC_TOOLS) {
  const inv = INVARIANTES[calc.id];
  if (!inv) {
    semInvariante.push(calc.id);
    continue;
  }

  if (inv.faixa === null) {
    pendentes++;
    linhas.push(`⏳ ${calc.id.padEnd(12)} PENDENTE — a publicação não declara faixa verificável`);
    continue;
  }

  const [min, max] = extremos(calc);
  const [eMin, eMax] = inv.faixa;

  if (min === eMin && max === eMax) {
    ok++;
    linhas.push(`✅ ${calc.id.padEnd(12)} faixa ${min}–${max} confere com a publicação`);
  } else {
    falhas++;
    linhas.push(
      `❌ ${calc.id.padEnd(12)} app ${min}–${max} · publicação ${eMin}–${eMax}\n   ${inv.fonte}`
    );
  }
}

console.log("\nValidação estrutural das calculadoras clínicas\n");
console.log(linhas.join("\n"));
console.log(
  `\n${ok} conferidas · ${falhas} divergentes · ${pendentes} pendentes · ` +
  `${semInvariante.length} sem invariante cadastrado`
);
if (semInvariante.length) {
  console.log(`\nSem invariante: ${semInvariante.join(", ")}`);
}
console.log(
  "\n\"Sem invariante\" NÃO significa conferida — significa que ninguém extraiu\n" +
  "ainda o invariante da publicação primária daquela calculadora.\n"
);

fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas > 0 ? 1 : 0);
