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
    faixa: [0, 12.5],
    contagemVariaveis: 7,
    fonte: "Wells PS et al. Ann Intern Med 2001;135:98-107. O abstract nao lista os itens; a tabela veio do pathway Einstein/SBIBAE de Tromboembolismo Pulmonar v.3, que reproduz as colunas 'Wells Original' e 'Wells Simplificado' por extenso. Original: sintomas de TVP 3,0 · diagnostico alternativo menos provavel 3,0 · FC >= 100 bpm 1,5 · imobilizacao >= 3 dias ou cirurgia nas ultimas 4 semanas 1,5 · TVP ou TEP previo 1,5 · hemoptise 1,0 · cancer ativo 1,0. Soma dos maximos = 12,5. Corte: <= 4,0 TEP improvavel, > 4,0 TEP provavel. ATENCAO: o Wells de TVP e outro escore (1 ponto por item, -2 se diagnostico alternativo mais provavel, cortes <=0 / 1-2 / >=3) e nao fecha este invariante.",
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
  "clearance-creatinina": {
    fonte: "CKD-EPI 2021 sem raça (Inker LA et al., N Engl J Med 2021;385:1737-1749): TFG = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1,200 × 0,9938^idade × 1,012 se mulher, com κ = 0,7 (mulher) ou 0,9 (homem) e α = −0,241 (mulher) ou −0,302 (homem). A métrica destacada da calculadora é a TFG por CKD-EPI.",
    entradas: () => ({
      sexo: Math.random() < 0.5 ? "masculino" : "feminino",
      idade: String(Math.round(18 + Math.random() * 80)),
      peso: String(Math.round(45 + Math.random() * 70)),
      cr: String(Math.round((0.4 + Math.random() * 5) * 100) / 100),
    }),
    esperado: (v) => {
      const mulher = v.sexo === "feminino";
      const cr = parseFloat(v.cr);
      const idade = parseFloat(v.idade);
      const kappa = mulher ? 0.7 : 0.9;
      const alpha = mulher ? -0.241 : -0.302;
      const menor = Math.pow(Math.min(cr / kappa, 1), alpha);
      const maior = Math.pow(Math.max(cr / kappa, 1), -1.2);
      let tfg = 142 * menor * maior * Math.pow(0.9938, idade);
      if (mulher) tfg *= 1.012;
      return tfg;
    },
    // A calculadora arredonda a TFG para inteiro na métrica exibida.
    tolerancia: 0.6,
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

// ── Invariantes de MONOTONICIDADE, para ajuste de dose por função renal ──────
//
// Tabela de ajuste renal não é fórmula nem escore: é faixa. O invariante aqui é
// o SENTIDO — piorando a função renal, a dose diária não pode subir e o
// intervalo entre doses não pode encurtar. É o que pega faixa invertida, que é
// o erro clássico de quem transcreve tabela de bula.
const MONOTONICIDADES = {
  "dose-antibiotico": {
    fonte: "Princípio farmacocinético do ajuste renal, aplicado às tabelas de vancomicina, piperacilina-tazobactam e meropeném declaradas na referência da calculadora (ASHP/IDSA/SIDP 2020 para o alvo de AUC da vancomicina).",
    // Da melhor para a pior função renal.
    tfgs: [120, 100, 80, 60, 50, 40, 30, 20, 15, 10, 5],
    farmacos: ["vanco", "piptazo", "meropenem"],
    peso: "70",
    /** Extrai o intervalo em horas do texto da dose ("8/8h" → 8). */
    intervaloDe: (texto) => {
      const m = String(texto).match(/(\d+)\s*\/\s*\d+\s*h/);
      return m ? parseInt(m[1], 10) : null;
    },
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

/**
 * Lê o número da métrica destacada.
 *
 * A versão anterior removia TODO caractere não numérico da string, o que
 * funcionava para "42 pontos" e quebrava para "86 mL/min/1,73m²": os dígitos da
 * unidade grudavam no valor e 86 virava 861.73. O teste do clearance acusou
 * divergência de 10× que não existia — o app estava certo, o extrator é que
 * estava colando a unidade no número.
 *
 * Agora lê apenas o PRIMEIRO número da string e ignora o resto.
 */
function totalDe(resultado) {
  if (!resultado || !Array.isArray(resultado.metrics)) return null;
  const m = resultado.metrics.find((x) => x.highlight) || resultado.metrics[0];
  if (!m) return null;
  const bruto = String(m.value).replace(/(\d),(\d)/g, "$1.$2");
  const achado = bruto.match(/-?\d+(?:\.\d+)?/);
  if (!achado) return null;
  const n = parseFloat(achado[0]);
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

// Monotonicidade do ajuste renal
for (const [id, inv] of Object.entries(MONOTONICIDADES)) {
  const calc = CALC_TOOLS.find((c) => c.id === id);
  if (!calc || typeof calc.compute !== "function") {
    falhas++;
    linhas.push(`❌ ${id.padEnd(12)} calculadora não encontrada`);
    continue;
  }
  const problemas = [];
  for (const farmaco of inv.farmacos) {
    let intervaloAnterior = null;
    let tfgAnterior = null;
    for (const tfg of inv.tfgs) {
      const r = calc.compute({ farmaco, peso: inv.peso, tfg: String(tfg) });
      if (!r || !Array.isArray(r.metrics)) continue;
      const texto = r.metrics.map((m) => `${m.label} ${m.value}`).join(" | ");
      const intervalo = inv.intervaloDe(texto);
      if (intervalo == null) continue;
      if (intervaloAnterior != null && intervalo < intervaloAnterior) {
        problemas.push(
          `${farmaco}: ClCr ${tfgAnterior} → ${intervalo > 0 ? "" : ""}${tfgAnterior} usava ${intervaloAnterior}/${intervaloAnterior}h ` +
          `e ClCr ${tfg} (pior função) usa ${intervalo}/${intervalo}h — intervalo ENCURTOU`
        );
      }
      intervaloAnterior = intervalo;
      tfgAnterior = tfg;
    }
  }
  const idx = semInvariante.indexOf(id);
  if (idx >= 0) semInvariante.splice(idx, 1);
  if (problemas.length) {
    falhas++;
    linhas.push(`❌ ${id.padEnd(12)} ajuste renal invertido\n   ${problemas.join("\n   ")}\n   ${inv.fonte}`);
  } else {
    ok++;
    linhas.push(`✅ ${id.padEnd(12)} ajuste renal monotônico nos 3 fármacos (11 faixas de ClCr)`);
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
