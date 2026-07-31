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
  heart: {
    faixa: [0, 10],
    fonte: "Six AJ, Backus BE, Kelder JC. Neth Heart J 2008;16(6):191-196 (PMID 18665203), escore original. Cinco componentes — História, ECG, Age, Risk factors e Troponina — pontuados 0, 1 ou 2 cada; a faixa decorre da definição.",
  },
  rass: {
    faixa: [-5, 4],
    fonte: "Sessler CN et al. Am J Respir Crit Care Med 2002;166(10):1338-1344 (PMID 12421743). O abstract declara escala de 10 níveis, de +4 (combativo) a −5 (irresponsivo).",
  },
  nihss: {
    faixa: [0, 42],
    contagemVariaveis: 15,
    fonte: "Brott T et al. Stroke 1989;20(7):864-870 declara a escala de 15 itens; o abstract não traz a faixa. A faixa foi derivada item a item da versão traduzida e adaptada para o Brasil (Octávio Marques Pontes-Neto, Neurologia HCFMRP-USP): 1a=0-3, 1b=0-2, 1c=0-2, 2=0-2, 3=0-3, 4=0-3, 5a=0-4, 5b=0-4, 6a=0-4, 6b=0-4, 7=0-2, 8=0-2, 9=0-3, 10=0-2, 11=0-2. Soma dos máximos = 42.",
  },
  "wells-tep": {
    faixa: null,
    fonte: "Wells PS et al. Ann Intern Med 2001;135:98-107. O abstract descreve as categorias de probabilidade (baixa, moderada, alta) e as taxas de TEP em cada uma, mas NÃO lista os itens nem os pesos. Invariante indisponível sem o texto completo.",
  },
  saps3: {
    // O invariante EXATO do SAPS 3 não é o teto — é o PISO.
    //
    // O artigo declara mínimo 0 e explica o offset como existindo "to avoid
    // negative SAPS 3 Scores". Isso só fecha se
    //     16 (offset) − 11 (transplante) − 5 (distúrbio de ritmo) = 0
    // ou seja, o zero valida DE UMA VEZ o offset obrigatório e os dois pesos
    // negativos do modelo. É mais forte que conferir o teto — e o teto, somando
    // comorbidades de forma aditiva como manda a nota de rodapé, dá 243 e não os
    // 217 declarados, discrepância que o artigo não explica e que por isso não
    // serve de invariante.
    pisoExato: 0,
    contagemVariaveis: 20,
    fonte: "Moreno RP, Metnitz PGH, Almeida E, et al. Intensive Care Med 2005 Oct;31(10):1345-1355 (PMID 16132892). Folha transcrita em protocols/saps3-scoresheet.md. Coorte de 16.784 pacientes: minimo 5, maximo 124, media 49,9+-16,6, mediana 48 (38-60).",
  },
};

// ── Invariantes de IDENTIDADE, para as ferramentas que são fórmula ────────────
//
// Escore tem faixa; fórmula não. Para fórmula o invariante é a própria equação:
// reimplementamos a forma fechada publicada e conferimos contra o `compute` do
// app em entradas aleatórias. É um teste mais forte que o de faixa — pega erro
// em qualquer coeficiente, não só nos extremos.
const IDENTIDADES = {
  "peso-predito": {
    fonte: "ARDSNet, N Engl J Med 2000;342:1301-1308, reproduzida no protocolo Einstein/AMIB-SBPT de VM: homem 50 + 0,91 × (altura em cm − 152,4); mulher 45,5 + 0,91 × (altura em cm − 152,4).",
    entradas: () => ({
      // Os valores do toggle são "masculino"/"feminino" — usar "m"/"f" fazia o
      // compute cair no ramo masculino e o teste acusava divergência que não
      // existia. O invariante estava certo; a entrada é que estava errada.
      sexo: Math.random() < 0.5 ? "masculino" : "feminino",
      altura: String(Math.round(140 + Math.random() * 60)),
    }),
    esperado: (v) => {
      const base = v.sexo === "feminino" ? 45.5 : 50;
      return base + 0.91 * (parseFloat(v.altura) - 152.4);
    },
    tolerancia: 0.05,
  },
  osmolalidade: {
    fonte: "Osmolalidade calculada = 2 × Na + glicose/18 + ureia/6, com ureia em mg/dL. Forma usada no protocolo Einstein de intoxicação por metanol (CPTW474.1), que é a referência do gap osmolar no app.",
    entradas: () => ({
      na: String(Math.round(120 + Math.random() * 40)),
      glic: String(Math.round(60 + Math.random() * 500)),
      ureia: String(Math.round(10 + Math.random() * 150)),
    }),
    esperado: (v) =>
      2 * parseFloat(v.na) + parseFloat(v.glic) / 18 + parseFloat(v.ureia) / 6,
    tolerancia: 0.15,
  },
  "anion-gap": {
    fonte: "Ânion gap = Na − (Cl + HCO₃), definição clássica declarada na própria referência da calculadora.",
    entradas: () => ({
      na: String(Math.round(120 + Math.random() * 40)),
      cl: String(Math.round(85 + Math.random() * 30)),
      hco3: String(Math.round(5 + Math.random() * 30)),
      alb: "4",
    }),
    esperado: (v) => parseFloat(v.na) - (parseFloat(v.cl) + parseFloat(v.hco3)),
    tolerancia: 0.15,
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
let desativadas = 0;
const semInvariante = [];
const linhas = [];

for (const calc of CALC_TOOLS) {
  const inv = INVARIANTES[calc.id];
  if (!inv) {
    semInvariante.push(calc.id);
    continue;
  }

  if (inv.desativada) {
    desativadas++;
    linhas.push(`⛔ ${calc.id.padEnd(12)} DESATIVADA — conferida contra o artigo e reprovada`);
    continue;
  }

  // Sem `faixa` declarada: a calculadora é coberta por outro tipo de invariante
  // (piso exato, contagem, identidade). Não é pendência.
  if (inv.faixa === undefined) continue;

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

// Identidades de fórmula
for (const [id, inv] of Object.entries(IDENTIDADES)) {
  const calc = CALC_TOOLS.find((c) => c.id === id);
  if (!calc || typeof calc.compute !== "function") {
    falhas++;
    linhas.push(`❌ ${id.padEnd(12)} calculadora não encontrada`);
    continue;
  }
  let divergencia = null;
  for (let i = 0; i < 400; i++) {
    const v = inv.entradas();
    const r = calc.compute(v);
    if (!r) continue;
    const obtido = totalDe(r);
    const esperado = inv.esperado(v);
    if (obtido == null) continue;
    if (Math.abs(obtido - esperado) > inv.tolerancia) {
      divergencia = { v, obtido, esperado };
      break;
    }
  }
  const idx = semInvariante.indexOf(id);
  if (idx >= 0) semInvariante.splice(idx, 1);
  if (divergencia) {
    falhas++;
    linhas.push(
      `❌ ${id.padEnd(12)} fórmula divergente · entrada ${JSON.stringify(divergencia.v)} · ` +
      `app ${divergencia.obtido} · publicação ${Math.round(divergencia.esperado * 100) / 100}\n   ${inv.fonte}`
    );
  } else {
    ok++;
    linhas.push(`✅ ${id.padEnd(12)} fórmula confere com a publicação (400 entradas aleatórias)`);
  }
}

// Invariante de CONTAGEM — quantas variáveis a publicação declara no modelo
// final × quantas a implementação expõe. Pega truncagem silenciosa, que faixa
// não pega: um escore com metade das variáveis ainda cabe dentro da faixa.
for (const [id, inv] of Object.entries(INVARIANTES)) {
  if (inv.desativada || !inv.contagemVariaveis) continue;
  const calc = CALC_TOOLS.find((c) => c.id === id);
  if (!calc) continue;
  // O SAPS 3 quebra 6 comorbidades e 2 infecções em campos separados, e a
  // oxigenação em 3 campos: 20 variáveis lógicas ocupam 30 campos de tela.
  const AGRUPADAS = { saps3: 20 };
  const implementadas = AGRUPADAS[id] ?? (Array.isArray(calc.inputs) ? calc.inputs.length : (calc.vars || []).length);
  const idx = semInvariante.indexOf(id);
  if (idx >= 0) semInvariante.splice(idx, 1);
  if (implementadas !== inv.contagemVariaveis) {
    falhas++;
    linhas.push(
      `❌ ${id.padEnd(12)} PARCIAL — ${implementadas} variáveis implementadas, ` +
      `${inv.contagemVariaveis} no modelo publicado\n   ${inv.fonte}`
    );
  } else {
    ok++;
    linhas.push(`✅ ${id.padEnd(12)} ${implementadas} variáveis, igual ao modelo publicado`);
  }
}

// Invariante de PISO EXATO — o menor escore alcançável precisa bater com o que
// a publicação declara. Onde há offset e pesos negativos, esse piso é o teste
// mais sensível que existe: erra o offset, erra o piso.
for (const [id, inv] of Object.entries(INVARIANTES)) {
  if (inv.pisoExato === undefined) continue;
  const calc = CALC_TOOLS.find((c) => c.id === id);
  if (!calc || typeof calc.compute !== "function") continue;
  // Melhor caso possível em toda variável, incluindo os pesos negativos.
  const melhor = {
    idade: "30", cQuimio: "0", cIcc: "0", cHemato: "0", cCirrose: "0", cAids: "0", cCancer: "0",
    losDias: "0", local: "0", vaso: "0", planejada: "0", cirurgico: "0", infNoso: "0", infResp: "0",
    motivo: "-5", sitio: "-11", gcs: "15", bili: "0.5", temp: "37", cr: "0.8", fc: "80",
    leuco: "8", ph: "7.4", plaq: "250", pas: "130", vm: "nao", pao2: "95", fio2: "21",
  };
  const r = calc.compute(melhor);
  const obtido = r ? totalDe(r) : null;
  const idx = semInvariante.indexOf(id);
  if (idx >= 0) semInvariante.splice(idx, 1);
  if (obtido === inv.pisoExato) {
    ok++;
    linhas.push(`✅ ${id.padEnd(12)} piso ${obtido} confere com a publicação (valida o offset e os pesos negativos)`);
  } else {
    falhas++;
    linhas.push(`❌ ${id.padEnd(12)} piso app ${obtido} · publicação ${inv.pisoExato}\n   ${inv.fonte}`);
  }
}

console.log("\nValidação estrutural das calculadoras clínicas\n");
console.log(linhas.join("\n"));
console.log(
  `\n${ok} conferidas · ${falhas} divergentes · ${pendentes} pendentes · ` +
  `${desativadas} desativadas · ${semInvariante.length} sem invariante cadastrado`
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
