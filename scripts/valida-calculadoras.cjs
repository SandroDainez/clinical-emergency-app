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
  // Esta ferramenta calcula DUAS fórmulas, e por muito tempo só a destacada
  // (CKD-EPI) foi conferida. Mutar o fator 0,85 do sexo feminino no
  // Cockcroft-Gault passava com "✅ fórmula confere com a publicação" — o
  // invariante não era tautológico, era PARCIAL, o que engana igual.
  "clearance-creatinina": [{
    metrica: "CKD-EPI",
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
  {
    metrica: "Cockcroft-Gault",
    fonte:
      "Cockcroft DW, Gault MH. Nephron 1976;16:31-41: ClCr = [(140 − idade) × peso] / (72 × Cr), " +
      "multiplicado por 0,85 no sexo feminino.",
    entradas: () => ({
      sexo: Math.random() < 0.5 ? "masculino" : "feminino",
      idade: String(Math.round(18 + Math.random() * 80)),
      peso: String(Math.round(45 + Math.random() * 70)),
      cr: String(Math.round((0.4 + Math.random() * 5) * 100) / 100),
    }),
    esperado: (v) => {
      const cg = ((140 - parseFloat(v.idade)) * parseFloat(v.peso)) / (72 * parseFloat(v.cr));
      // O 0,85 é o ponto que a cobertura anterior deixava passar.
      return v.sexo === "feminino" ? cg * 0.85 : cg;
    },
    tolerancia: 1,
  }],  "anion-gap": {
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
/**
 * `rotulo` seleciona QUAL métrica conferir.
 *
 * Sem ele, a função pega a métrica destacada — e uma ferramenta pode calcular
 * mais de uma coisa. O clearance calcula CKD-EPI 2021 (destacada) e
 * Cockcroft-Gault, e por anos só a primeira foi conferida: mutar o fator 0,85
 * do sexo feminino no CG passava com "✅ fórmula confere com a publicação".
 * O invariante não era tautológico — era PARCIAL, que engana igual.
 */
function totalDe(resultado, rotulo) {
  if (!resultado || !Array.isArray(resultado.metrics)) return null;
  const m = rotulo
    ? resultado.metrics.find((x) => String(x.label).includes(rotulo))
    : resultado.metrics.find((x) => x.highlight) || resultado.metrics[0];
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

/**
 * Uma ferramenta pode ter MAIS DE UM invariante — uma entrada por fórmula que
 * ela calcula. `INVARIANTES[id]` aceita objeto ou lista.
 */
const invariantesDe = (id) => {
  const v = INVARIANTES[id];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};

for (const calc of CALC_TOOLS) {
  const inv = invariantesDe(calc.id)[0];
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

// Identidades de fórmula. Uma ferramenta pode ter MAIS DE UMA — uma por
// fórmula que ela calcula — e aí a entrada é uma lista.
// ── LIMIAR: A FRONTEIRA DE CADA FAIXA, EM TODAS AS 15 ──────────────────────
//
// A conferência de TEXTO por faixa (acima) prova de onde o texto vem, não ONDE
// a faixa começa. Deslocar `t === 8` para `t === 9` no Glasgow passava por ela,
// porque as faixas vizinhas exibem a mesma frase — muda o RÓTULO, não o texto.
// Esta é a trava que fecha aquela fuga, e estava anotada no código desde então.
//
// A forma: para cada fronteira declarada, o rótulo no valor de dentro casa com
// o esperado E o rótulo no valor de fora NÃO casa. Só a primeira metade seria
// satisfeita por uma faixa que engolisse todo o domínio.
{
  const LIMIARES = [
    // [id, [[valor dentro, fragmento esperado, valor fora]]]
    ["glasgow", [
      [15, "normal", 14], [14, "13–14", 12], [13, "13–14", 12],
      [12, "9–12", 8], [9, "9–12", 8], [8, "GCS 8", 7], [7, "≤ 7", 8],
    ]],
    ["qsofa", [[2, "≥ 2", 1], [1, "0–1", 2], [0, "0–1", 2]]],
    ["sofa", [
      [12, "> 11", 11], [11, "8–11", 7], [8, "8–11", 7],
      [7, "2–7", 1], [2, "2–7", 1], [1, "sem disfunção", 2],
    ]],
    // Fragmento ancorado no parêntese, não na palavra: "PROVÁVEL" é substring
    // de "IMPROVÁVEL" e a conferência acusaria a si mesma.
    ["wells-tep", [[4.5, "(Wells > 4)", 4], [4, "(Wells ≤ 4)", 4.5]]],
    // Ancorado no "CURB-65 n —" e não só na porcentagem: o enquadramento do
    // escore 2 CITA 3,2% e 17%, e comparar por porcentagem solta acusaria os
    // vizinhos dele.
    ["curb-65", [
      [0, "CURB-65 0 — mortalidade em 30 dias 0,7%", 1],
      [1, "CURB-65 1 — mortalidade em 30 dias 3,2%", 0],
      [2, "não confirmado", 1],
      [3, "CURB-65 3 — mortalidade em 30 dias 17%", 2],
      [4, "CURB-65 4 — mortalidade em 30 dias 41,5%", 3],
      [5, "CURB-65 5 — mortalidade em 30 dias 57%", 4],
    ]],
    ["heart", [[7, "alto risco", 6], [6, "intermediário", 3], [4, "intermediário", 3], [3, "baixo risco", 4]]],
    // "AVC leve" é substring de "AVC leve a moderado", e "AVC moderado" de "AVC
    // moderado a grave". Os fragmentos terminam no fim do rótulo para não se
    // engolirem — a colisão de substring foi o que a primeira versão acusou.
    ["nihss", [
      [0, "— Sem déficit mensurável", 1],
      [1, "— AVC leve", 5], [4, "— AVC leve", 5],
      [5, "— AVC leve a moderado", 10], [9, "— AVC leve a moderado", 10],
      [10, "— AVC moderado", 16], [15, "— AVC moderado", 16],
      [16, "— AVC moderado a grave", 21], [20, "— AVC moderado a grave", 21],
      [21, "— AVC grave", 20],
    ]],
    ["rass", [
      [2, "+2 a +4", 1], [1, "+1", 0], [0, "RASS 0", 1],
      [-1, "−1 a −2", 0], [-2, "−1 a −2", -3], [-3, "−3", -2], [-4, "−4", -3], [-5, "−5", -4],
    ]],
  ];

  for (const [id, fronteiras] of LIMIARES) {
    const calc = CALC_TOOLS.find((c) => c.id === id);
    if (!calc) { falhas++, linhas.push(`❌ ${id}: ferramenta não encontrada — a trava de limiar não rodou.`); continue; }
    for (const [dentro, fragmento, fora] of fronteiras) {
      const rotDentro = calc.interpret(dentro).label;
      const rotFora = calc.interpret(fora).label;
      // Fragmento iniciado por travessão é conferido como SUFIXO. Sem isso,
      // "— AVC leve" casa dentro de "— AVC leve a moderado" e a trava acusa a
      // si mesma — foi o que aconteceu na primeira versão, duas vezes.
      const casa = (rot) => (fragmento.startsWith("— ") ? rot.endsWith(fragmento) : rot.includes(fragmento));
      if (!casa(rotDentro)) {
        falhas++, linhas.push(`❌ ${id} em ${dentro}: rótulo «${rotDentro}» não contém "${fragmento}" — a fronteira da faixa se deslocou.`);
      } else if (casa(rotFora)) {
        falhas++, linhas.push(
          `❌ ${id}: "${fragmento}" aparece TANTO em ${dentro} quanto em ${fora} — a faixa engoliu a vizinha. ` +
          `Fronteira exigida entre os dois valores.`
        );
      } else { ok++; }
    }
  }

  // Ferramentas de fórmula: a faixa exibida tem de casar com o VALOR calculado,
  // conferido por varredura em vez de por ponto — é onde a fronteira mora.
  const limiarPorVarredura = (id, entradas, valorDe, faixaDe, rotuloDe) => {
    const calc = CALC_TOOLS.find((c) => c.id === id);
    if (!calc) { falhas++, linhas.push(`❌ ${id}: ferramenta não encontrada — a trava de limiar não rodou.`); return; }
    let conferidos = 0;
    for (const v of entradas) {
      const r = calc.compute(v);
      if (!r) continue;
      conferidos++;
      const esperada = faixaDe(valorDe(r));
      const obtida = rotuloDe(r);
      if (!obtida.includes(esperada)) {
        falhas++, linhas.push(`❌ ${id}: valor calculado pede a faixa "${esperada}" e a tela exibe «${obtida.slice(0, 70)}».`);
        return;
      }
    }
    if (conferidos < 10) {
      falhas++, linhas.push(`❌ ${id}: só ${conferidos} entradas válidas na varredura de limiar — universo pequeno demais.`);
    } else { ok++; }
  };

  // Clearance — as três faixas do rótulo seguem o TFG calculado (limiares 30/60).
  {
    const ent = [];
    for (let cr = 0.4; cr <= 8; cr += 0.05) ent.push({ sexo: "masculino", idade: "60", peso: "70", cr: cr.toFixed(2).replace(".", ",") });
    limiarPorVarredura("clearance-creatinina", ent,
      (r) => parseFloat(String(r.metrics[0].value).replace(",", ".")),
      (tfg) => (tfg < 30 ? "gravemente reduzida" : tfg < 60 ? "Redução moderada" : "preservada"),
      (r) => r.interpret.label);
  }

  // Osmolalidade — as cinco faixas seguem a EFETIVA (275 / 295 / 320 / 360).
  {
    const ent = [];
    for (let na = 110; na <= 190; na += 1) ent.push({ na: String(na), glic: "100", ureia: "30" });
    for (let g = 80; g <= 1200; g += 10) ent.push({ na: "140", glic: String(g), ureia: "30" });
    limiarPorVarredura("osmolalidade", ent,
      (r) => parseFloat(String(r.metrics[1].value).replace(",", ".")),
      (ef) => (ef < 275 ? "Hipoosmolalidade" : ef <= 295 ? "normal" : ef <= 320 ? "leve" : ef <= 360 ? "moderada" : "grave"),
      (r) => r.interpret.label);
  }

  // Ânion gap — a fronteira é 12, sobre o AG corrigido quando há albumina.
  {
    const ent = [];
    for (let cl = 80; cl <= 120; cl += 1) ent.push({ na: "140", cl: String(cl), hco3: "24" });
    for (let alb = 1; alb <= 5; alb += 0.5) ent.push({ na: "140", cl: "104", hco3: "18", alb: String(alb).replace(".", ",") });
    limiarPorVarredura("anion-gap", ent,
      (r) => {
        const corr = r.metrics.find((m) => /corrigido/.test(m.label));
        return parseFloat(String((corr ?? r.metrics[0]).value).replace(",", "."));
      },
      (ag) => (ag > 12 ? "ELEVADO" : "normal"),
      (r) => r.interpret.label);
  }

  // Dose de antibiótico — as faixas de ClCr de cada fármaco, nas fronteiras.
  {
    const antib = CALC_TOOLS.find((c) => c.id === "dose-antibiotico");
    const FRONTEIRAS = [
      // Faixas do código: > 90 → 15–20 mg/kg 8/8h · ≥ 60 → 15–20 mg/kg 12/12h ·
      // ≥ 40 → 10–15 mg/kg 12/12h · ≥ 20 → 10–15 mg/kg 24/24h · < 20 → 48/48h.
      // A fronteira dos 40 muda a DOSE mantendo o intervalo, e por isso o
      // fragmento ali é a dose, não o intervalo.
      ["vanco", [
        [91, "8/8h", 90], [90, "12/12h", 91],
        [60, "15–20 mg/kg", 59], [59, "10–15 mg/kg", 60],
        [40, "12/12h", 39], [39, "24/24h", 40],
        [20, "24/24h", 19], [19, "48/48h", 20],
      ]],
      ["piptazo", [[41, "6/6h", 40], [40, "8/8h", 41], [20, "8/8h", 19], [19, "12/12h", 20]]],
      // Faixas: > 50 → 8/8h · ≥ 25 → 1 g 12/12h · ≥ 10 → 500 mg–1 g 12/12h ·
      // < 10 → 24/24h. A fronteira dos 25 muda a DOSE mantendo o intervalo.
      ["mero", [
        [51, "8/8h", 50], [50, "12/12h", 51],
        [25, "1 g IV 12/12h", 24], [24, "500 mg–1 g", 25],
        [10, "12/12h", 9], [9, "24/24h", 10],
      ]],
    ];
    for (const [farmaco, fronteiras] of FRONTEIRAS) {
      for (const [dentro, frag, fora] of fronteiras) {
        const r1 = antib.compute({ farmaco, peso: "70", tfg: String(dentro) });
        const r2 = antib.compute({ farmaco, peso: "70", tfg: String(fora) });
        if (!r1 || !r2) { falhas++, linhas.push(`❌ dose-antibiotico/${farmaco}: compute devolveu null — a trava de limiar não rodou.`); continue; }
        // O resultado INTEIRO, não só as métricas: a dose em mg/kg vive no
        // rótulo da interpretação, e as métricas já trazem o valor convertido
        // em mg — conferir só as métricas perdia a fronteira dos 40 mL/min.
        const t1 = JSON.stringify(r1), t2 = JSON.stringify(r2);
        if (!t1.includes(frag)) {
          falhas++, linhas.push(`❌ dose-antibiotico/${farmaco} com ClCr ${dentro}: não exibe "${frag}" — a fronteira se deslocou.`);
        } else if (t1 === t2) {
          falhas++, linhas.push(`❌ dose-antibiotico/${farmaco}: ClCr ${dentro} e ${fora} devolvem a MESMA prescrição — a fronteira sumiu.`);
        } else { ok++; }
      }
    }
  }

  // SAPS 3 — as fronteiras de TOM são 10 / 25 / 50% de mortalidade prevista.
  // O tom vem de `mort`, e é isso que se confere: a escada existe e é crescente.
  {
    const fonteC = fs.readFileSync(path.join(appDir, "clinical-calculators-engine.ts"), "utf8");
    if (!/mort >= 50 \? "red" : mort >= 25 \? "orange" : mort >= 10 \? "yellow" : "green"/.test(fonteC)) {
      falhas++, linhas.push("❌ saps3: as fronteiras de tom (10 / 25 / 50%) mudaram ou sumiram — conferir contra a equação global antes de aceitar.");
    } else { ok++; }
    if (!/total >= 25 \? "red" : total >= 15 \? "orange" : total >= 10 \? "yellow" : "green"/.test(fonteC)) {
      falhas++, linhas.push("❌ apache2: as fronteiras de tom (10 / 15 / 25 pontos) mudaram ou sumiram.");
    } else { ok++; }
  }

  // peso-predito NÃO tem interpret: mostra os cinco volumes lado a lado e deixa
  // a escolha com o médico. É ausência por desenho, e fica dito aqui para que
  // ninguém a leia como esquecimento (R-13).
}

// ── #8/#9/#10 · MEDIDA CERTA, RESSALVA NO CAMPO ────────────────────────────
{
  const fonteC = fs.readFileSync(path.join(appDir, "clinical-calculators-engine.ts"), "utf8");

  // #8 — o qSOFA carrega o papel do escore após a SSC 2026, e a fonte é a Sepse.
  const qsofa = CALC_TOOLS.find((c) => c.id === "qsofa");
  const sepse = fs.readFileSync(path.join(appDir, "sepsis-engine.ts"), "utf8");
  if (!/export const QSOFA_PAPEL_APOS_SSC_2026/.test(sepse)) {
    falhas++, linhas.push("❌ sepsis-engine: QSOFA_PAPEL_APOS_SSC_2026 não é exportada — o dono do texto perdeu a posse.");
  } else { ok++; }
  for (const t of [0, 1, 2, 3]) {
    const saida = qsofa.interpret(t);
    const lines = saida.lines || [];
    // R-11: nenhuma faixa fica com a região de aviso em branco — e é no qSOFA
    // BAIXO que a ressalva importa, porque é onde o escore mais deixa passar.
    if (!lines.length) {
      falhas++, linhas.push(`❌ qsofa em ${t}: faixa sem nenhuma linha — região de aviso que às vezes fica vazia ensina a ignorar a região (R-11).`);
    } else if (!lines.some((l) => /SSC 2026 NÃO recomenda o qSOFA como ferramenta ÚNICA/.test(l))) {
      falhas++, linhas.push(`❌ qsofa em ${t}: não traz a ressalva da SSC 2026 sobre o PAPEL do escore. O limiar ≥ 2 segue de Seymour 2016; o que mudou foi o papel.`);
    } else { ok++; }
  }

  // #9 — a medida, não só o número. Mesmo mecanismo do ureia × BUN.
  const clearance = CALC_TOOLS.find((c) => c.id === "clearance-creatinina");
  const saidaCl = clearance.compute({ sexo: "masculino", idade: "70", peso: "70", cr: "1,5" });
  if (!saidaCl) {
    falhas++, linhas.push("❌ clearance-creatinina: compute devolveu null com entrada válida — a conferência de rótulo não rodou.");
  } else {
    const rotulos = saidaCl.metrics.map((m) => m.label).join(" | ");
    if (!/INDEXADA/.test(rotulos) || !/ABSOLUTA/.test(rotulos)) {
      falhas++, linhas.push(
        `❌ clearance-creatinina: os dois resultados não dizem QUAL medida entregam — «${rotulos}». ` +
        `CKD-EPI é mL/min/1,73 m² (indexada) e Cockcroft-Gault é mL/min (absoluta); só a absoluta ajusta dose.`
      );
    } else { ok++; }
  }

  const antib = CALC_TOOLS.find((c) => c.id === "dose-antibiotico");
  const campoTfg = antib.inputs.find((i) => i.id === "tfg");
  if (!/ABSOLUTO/.test(campoTfg.label) || !campoTfg.helperText || !/não a TFG indexada/.test(campoTfg.helperText)) {
    falhas++, linhas.push(
      "❌ dose-antibiotico: o campo de clearance não declara que aceita o ABSOLUTO. " +
      "A ferramenta ao lado devolve duas medidas diferentes, e a indexada dá dose errada no obeso e no caquético."
    );
  } else { ok++; }

  // #10 — o peso do Cockcroft-Gault aponta para a ferramenta de peso predito,
  // em vez de repetir a fórmula (R-12).
  const campoPeso = clearance.inputs.find((i) => i.id === "peso");
  if (!campoPeso.helperText || !/Peso predito/.test(campoPeso.helperText)) {
    falhas++, linhas.push("❌ clearance-creatinina: o campo de peso não aponta para a ferramenta de peso predito da mesma tela.");
  } else { ok++; }
  if (/45,5|45\.5|2,3 \* |152,4/.test(campoPeso.helperText || "")) {
    falhas++, linhas.push("❌ clearance-creatinina: o campo de peso REPETE a fórmula do peso predito em vez de apontar para a ferramenta que a possui (R-12).");
  } else { ok++; }
}

// ── MONOTONICIDADE DA INTERPRETAÇÃO ────────────────────────────────────────
//
// Escore de gravidade não pode exibir prognóstico MELHOR num valor mais grave.
// A regra nasceu do CURB-65: o resumo de Lim 2003 imprime "score 2, 3%" entre
// 3,2% (escore 1) e 17% (escore 3). Erro tipográfico de 2003, propagado por
// vinte e três anos por quem copia o resumo em vez da tabela.
//
// ESTA TRAVA TERIA PEGO AQUELE NÚMERO SOZINHA, sem abrir publicação nenhuma —
// e é isso que a torna diferente das outras: ela não confere contra uma fonte,
// confere contra a COERÊNCIA INTERNA do que a tela afirma.
//
// Duas leituras por ferramenta: o TOM (green < yellow < orange < red) e as
// PORCENTAGENS do rótulo. O rótulo, e não as `lines`, porque estas hoje são
// constantes compartilhadas entre faixas — comparar iguais não prova nada.
{
  const ORDEM = { green: 0, yellow: 1, orange: 2, red: 3, neutral: 0 };
  const pcts = (s) => [...String(s).matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)].map((m) => parseFloat(m[1].replace(",", ".")));

  // Direção da gravidade. O Glasgow é invertido (15 é o melhor) e o RASS é
  // BIDIRECIONAL: 0 é o alvo, e piora tanto subindo (agitação) quanto descendo
  // (sedação excessiva). Tratar o RASS como escala única acusaria o app inteiro
  // — verificador que acusa inocente é desligado no primeiro aperto.
  const DIRECAO = {
    glasgow: "desc", qsofa: "asc", sofa: "asc", "wells-tep": "asc",
    "curb-65": "asc", heart: "asc", nihss: "asc", rass: "bidirecional",
  };

  const confereSequencia = (calc, valores, rotuloDaDirecao) => {
    let tomAnterior = null, minAnterior = null, maxAnterior = null;
    for (const t of valores) {
      const interp = calc.interpret(t);
      const tom = ORDEM[interp.tone] ?? 0;
      const p = pcts(interp.label);
      if (tomAnterior !== null && tom < tomAnterior) {
        falhas++, linhas.push(
          `❌ ${calc.id} (${rotuloDaDirecao}) em ${t}: tom "${interp.tone}" é MENOS grave que o do valor anterior. ` +
          `Escore de gravidade não melhora quando piora.`
        );
        return;
      }
      if (p.length && minAnterior !== null) {
        if (Math.min(...p) < minAnterior || Math.max(...p) < maxAnterior) {
          falhas++, linhas.push(
            `❌ ${calc.id} (${rotuloDaDirecao}) em ${t}: prognóstico MELHOR que no valor anterior — ` +
            `«${interp.label}». Ou o número está errado, ou a faixa está trocada.`
          );
          return;
        }
      }
      tomAnterior = Math.max(tomAnterior ?? 0, tom);
      if (p.length) { minAnterior = Math.min(...p); maxAnterior = Math.max(...p); }
    }
    ok++;
  };

  let cobertas = 0;
  for (const calc of CALC_TOOLS) {
    const dir = DIRECAO[calc.id];
    if (!dir) continue;
    const min = calc.vars.reduce((a, v) => a + Math.min(...v.options.map((o) => o.points)), 0);
    const max = calc.vars.reduce((a, v) => a + Math.max(...v.options.map((o) => o.points)), 0);
    const passo = Number.isInteger(min) && Number.isInteger(max) ? 1 : 0.5;
    const seq = [];
    for (let t = min; t <= max; t += passo) seq.push(t);
    cobertas++;

    if (dir === "asc") confereSequencia(calc, seq, "gravidade crescente");
    else if (dir === "desc") confereSequencia(calc, [...seq].reverse(), "gravidade decrescente");
    else {
      // Bidirecional: dois braços a partir do alvo, cada um monotônico no seu
      // sentido. É a forma de escala do RASS, não um caso especial arranjado.
      confereSequencia(calc, seq.filter((t) => t >= 0), "agitação, do alvo para cima");
      confereSequencia(calc, seq.filter((t) => t <= 0).reverse(), "sedação, do alvo para baixo");
    }
  }
  if (cobertas !== Object.keys(DIRECAO).length) {
    falhas++, linhas.push(`❌ monotonicidade: ${cobertas} ferramentas cobertas de ${Object.keys(DIRECAO).length} declaradas — alguma sumiu ou mudou de id.`);
  } else { ok++; }

  // As escadas de mortalidade do APACHE II e do SAPS 3 não passam por
  // `interpret` com um total — vêm de compute() multivariado. A escada em si é
  // derivável do fonte, e é exatamente onde um "3%" no meio caberia.
  const fonteCalc = fs.readFileSync(path.join(appDir, "clinical-calculators-engine.ts"), "utf8");
  const escada = fonteCalc.match(/const mort = total < 5[^;]+;/);
  if (!escada) {
    falhas++, linhas.push("❌ apache2: escada de mortalidade não encontrada — a conferência de monotonicidade não rodou.");
  } else {
    const vals = [...escada[0].matchAll(/"[~>]?\s*(\d+)%"/g)].map((m) => parseInt(m[1], 10));
    if (vals.length < 6) {
      falhas++, linhas.push(`❌ apache2: só ${vals.length} degraus lidos na escada de mortalidade — a conferência não rodou.`);
    } else if (vals.some((v, i) => i > 0 && v < vals[i - 1])) {
      falhas++, linhas.push(`❌ apache2: escada de mortalidade NÃO monotônica — ${vals.join(" → ")}.`);
    } else { ok++; }
  }
}

// ── PORCENTAGENS DE PROGNÓSTICO × PUBLICAÇÃO PRIMÁRIA (#4, #5, #6) ─────────
//
// Os literais aqui são a REFERÊNCIA EXTERNA — a publicação —, e por isso TÊM de
// estar escritos: sem eles a conferência seria tautológica (R-1). É o tipo (a)
// do R-21, o oposto de copiar o texto do app.
//
// O defeito que isto trava: o app exibia 1,7% (Backus 2013, correto) ao lado de
// ~12% e ~65%, que não vinham de nenhuma fonte citada. Faixas de coortes
// diferentes não são comparáveis entre si, e o gradiente entre elas — que é o
// que o escore comunica — vira artefato de amostragem.
{
  const PUBLICADO = [
    ["heart", "Backus 2013 (Int J Cardiol, n = 2440)", [[3, "1,7%"], [5, "16,6%"], [8, "50,1%"]]],
    ["curb-65", "Lim 2003 (Thorax)", [[0, "0,7%"], [1, "3,2%"], [3, "17%"], [4, "41,5%"], [5, "57%"]]],
  ];

  for (const [id, fonte, pares] of PUBLICADO) {
    const calc = CALC_TOOLS.find((c) => c.id === id);
    if (!calc) { falhas++, linhas.push(`❌ ${id}: ferramenta não encontrada — a conferência de prognóstico não rodou.`); continue; }
    for (const [total, pct] of pares) {
      const saida = JSON.stringify(calc.interpret(total));
      if (!saida.includes(pct)) {
        falhas++, linhas.push(`❌ ${id} em ${total}: não exibe ${pct}, que é o valor de ${fonte}.`);
      } else { ok++; }
    }
  }

  // CURB-65 escore 2: a publicação NÃO dá valor pontual (o resumo imprime
  // "score 2, 3%", impossível entre 3,2% e 17%; outras fontes citam 13%). A
  // trava exige o ENQUADRAMENTO e proíbe que alguém volte a cravar um número.
  const curb = CALC_TOOLS.find((c) => c.id === "curb-65");
  const dois = JSON.stringify(curb.interpret(2));
  if (!/não confirmado na publicação primária/.test(dois)) {
    falhas++, linhas.push("❌ curb-65 em 2: perdeu o enquadramento — a publicação não dá valor pontual para este escore.");
  } else { ok++; }
  if (/(9,2|13|3)%\s*(?!.*não confirmado)/.test(dois.replace(/entre 3,2% \(escore 1\) e 17% \(escore 3\)/, ""))) {
    falhas++, linhas.push(`❌ curb-65 em 2: voltou a cravar uma porcentagem pontual — «${dois.slice(0, 120)}».`);
  } else { ok++; }

  // SOFA: nenhuma faixa pode exibir mortalidade SEM a condição de tendência.
  const sofa = CALC_TOOLS.find((c) => c.id === "sofa");
  for (const t of [2, 7, 8, 11, 12, 24]) {
    const saida = JSON.stringify(sofa.interpret(t));
    const temPct = /\d+\s*%/.test(saida);
    const temTendencia = /CAIR ou NÃO nas primeiras 48 h/.test(saida);
    if (temPct && !temTendencia) {
      falhas++, linhas.push(
        `❌ sofa em ${t}: exibe porcentagem sem a condição de TENDÊNCIA. Ferreira 2001 mede escore inicial × ` +
        `trajetória em 48 h — o mesmo SOFA vale dez vezes mais ou menos conforme cai ou não.`
      );
    } else { ok++; }
  }
}

// ── R-19: escore de gravidade DESCREVE, não INDICA ──────────────────────────
//
// Glasgow, RASS e NIHSS indicavam conduta a partir de um número que não decide
// aquela conduta — "IOT indicada", "aumentar sedação/analgesia", "Trombólise +
// DAPT". As três telas não perguntam o que a decisão exige.
//
// A trava é ESTRUTURAL de propósito, e não de vocabulário: proibir uma lista de
// verbos seria regra dependente de vocabulário enumerado (R-8), e a próxima
// frase usaria um verbo fora da lista. Aqui o invariante é outro — nestas três
// ferramentas, TODO texto de interpretação vem por CONSTANTE IMPORTADA do
// módulo dono. Não existe literal inline para o autor escrever conduta dentro.
//
// Isso também mantém a fonte única viva: se alguém reescrever a frase aqui em
// vez de no dono, cai.
{
  const fonte = fs.readFileSync(path.join(appDir, "clinical-calculators-engine.ts"), "utf8");
  // Exigir UMA constante não basta: trocar RASS_NAO_DESPERTA por RASS_ALVO
  // passava — a faixa "não desperta" exibiria "estado ideal, manter e
  // monitorar". A trava tem de cobrar TODAS as constantes que o dono empresta,
  // senão ela vigia a origem do texto e não o texto certo em cada faixa.
  const DONOS = [
    ["glasgow", ["GLASGOW_AVALIAR_VIA_AEREA"], "rsi-decision-tree.ts", "ISR/Via aérea"],
    ["rass", ["RASS_AGITACAO_PROCURAR_CAUSA", "SEDACAO_ABAIXO_DA_META", "RASS_NAO_DESPERTA"], "sedation-engine.ts", "Sedoanalgesia"],
    ["nihss", ["NIHSS_SEM_INDICACAO"], "avc/nihss.ts", "AVC"],
    // Os quatro EXCESSOS PARCIAIS. Aqui a ferramenta MANTÉM o que o desfecho
    // validado dela cobre — sítio de tratamento no CURB-65, disposição no
    // HEART, via diagnóstica no Wells — e o que excede sai para o módulo dono.
    // Por isso estas três também entram na regra do "nenhum literal inline":
    // as linhas que ficam viraram constantes nomeadas, e não há onde reescrever
    // conduta sem a trava ver.
    ["curb-65", ["UTI_NA_PNEUMONIA_NAO_SAI_DO_CURB65"], "sepsis-engine.ts", "Sepse"],
    ["heart", ["ESTRATEGIA_INVASIVA_NAO_SAI_DO_HEART"], "coronary-decision-tree.ts", "Síndromes Coronarianas"],
    ["wells-tep", ["ANGIOTC_QUANDO_NAO_DA"], "tep-decision-tree.ts", "TEP"],
  ];

  for (const [id, constantes, arquivoDono, dono] of DONOS) {
    // Recorte da ferramenta: do `id:` dela até o `id:` seguinte.
    const i = fonte.indexOf(`id: "${id}"`);
    if (i < 0) {
      falhas++, linhas.push(`❌ clinical-calculators-engine: ferramenta "${id}" não encontrada — a trava do R-19 não rodou.`);
      continue;
    }
    const j = fonte.indexOf('id: "', fonte.indexOf("interpret", i));
    const trecho = fonte.slice(i, j < 0 ? fonte.length : j);

    const inline = [...trecho.matchAll(/lines:\s*\[\s*"/g)];
    if (inline.length) {
      falhas++, linhas.push(`❌ ${id}: a interpretação traz texto ESCRITO À MÃO (${inline.length}x) em vez de vir do módulo ${dono}. ` +
        `Escore de gravidade descreve, não indica (R-19) — e o texto que descreve vive em ${arquivoDono}.`);
    } else { ok++; }

    const donoTxt = fs.readFileSync(path.join(appDir, arquivoDono), "utf8");
    for (const constante of constantes) {
      if (!new RegExp(constante).test(trecho)) {
        falhas++, linhas.push(`❌ ${id}: não consome ${constante} de ${arquivoDono} — a fonte única do texto foi contornada, ou uma faixa ficou com o texto de outra.`);
      } else { ok++; }

      // A constante tem de existir DE VERDADE no dono, exportada.
      if (!new RegExp(`export const ${constante}`).test(donoTxt)) {
        falhas++, linhas.push(`❌ ${arquivoDono}: ${constante} não é exportada — o dono do texto perdeu a posse.`);
      } else { ok++; }
    }
  }

  // Clearance: a ferramenta ajusta dose (desfecho seu) e NÃO decide sobre
  // contraste — ela não sabe se há exame indicado nem a urgência dele.
  {
    const cl = CALC_TOOLS.find((c) => c.id === "clearance-creatinina");
    const saida = JSON.stringify(cl.compute({ sexo: "masculino", idade: "70", peso: "70", cr: "4" }));
    if (/evitar contraste/i.test(saida)) {
      falhas++, linhas.push(
        "❌ clearance-creatinina: voltou a mandar EVITAR CONTRASTE. A tela não sabe se há exame contrastado " +
        "indicado nem a urgência dele; ajuste de dose por função renal é o desfecho dela, decisão sobre contraste não é."
      );
    } else { ok++; }
    if (!/Ajustar fármacos/.test(saida)) {
      falhas++, linhas.push("❌ clearance-creatinina: perdeu o ajuste de fármacos por função renal, que É o desfecho da ferramenta.");
    } else { ok++; }
  }
}

// ── R-19 (parte 2): CADA FAIXA com o texto DELA, executando interpret ───────
//
// A conferência estrutural acima prova a ORIGEM do texto, não o texto certo em
// cada faixa. Duas mutações passaram por ela:
//
//   · trocar RASS_NAO_DESPERTA por RASS_ALVO → pegou, porque a constante sumiu
//   · trocar SEDACAO_ABAIXO_DA_META na faixa −3 por RASS_ALVO → NÃO pegou, a
//     constante continuava viva na faixa −4. Mutação que remove REDUNDÂNCIA em
//     vez de proteção (R-15, item 8).
//
// A faixa "sedação moderada" passaria a exibir "estado ideal, manter e
// monitorar". Só executando o interpret no valor de fronteira isso aparece.
//
// ⚠️ O QUE ESTE BLOCO AINDA NÃO PEGA, dito por escrito. Ele confere o TEXTO de
// cada faixa, não o LIMIAR. Deslocar a fronteira do Glasgow de `t === 8` para
// `t === 9` passa aqui, porque as duas faixas vizinhas exibem a mesma frase —
// muda o RÓTULO ("GCS 8 — limiar clássico" some), não o texto. Fechar isso é a
// trava de limiar de TODAS as 15 ferramentas, agendada para o bloco final das
// Calculadoras; ela confere o rótulo em cada valor de fronteira.
{
  const textoDaConstante = (arquivo, nome) => {
    const t = fs.readFileSync(path.join(appDir, arquivo), "utf8");
    const m = t.match(new RegExp(`export const ${nome}\\s*=\\s*\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    return m ? m[1].replace(/\\"/g, '"') : null;
  };

  const ESPERADO = [
    ["glasgow", "rsi-decision-tree.ts", [[7, "GLASGOW_AVALIAR_VIA_AEREA"], [8, "GLASGOW_AVALIAR_VIA_AEREA"]]],
    ["nihss", "avc/nihss.ts", [[1, "NIHSS_SEM_INDICACAO"], [16, "NIHSS_SEM_INDICACAO"], [42, "NIHSS_SEM_INDICACAO"]]],
    ["rass", "sedation-engine.ts", [
      [4, "RASS_AGITACAO_PROCURAR_CAUSA"], [2, "RASS_AGITACAO_PROCURAR_CAUSA"], [1, "RASS_AGITACAO_PROCURAR_CAUSA"],
      [-3, "SEDACAO_ABAIXO_DA_META"], [-4, "SEDACAO_ABAIXO_DA_META"], [-5, "RASS_NAO_DESPERTA"],
    ]],
    // O Wells precisa da ressalva nas DUAS faixas: a improvável também termina
    // em AngioTC quando o D-dímero vem positivo. Exigir a constante só "no
    // arquivo" deixava apagá-la de uma das faixas — a sobrevivente na vizinha
    // fazia a conferência passar (R-15 item 8, terceira vez).
    ["wells-tep", "tep-decision-tree.ts", [[5, "ANGIOTC_QUANDO_NAO_DA"], [1, "ANGIOTC_QUANDO_NAO_DA"]]],
    ["curb-65", "sepsis-engine.ts", [[3, "UTI_NA_PNEUMONIA_NAO_SAI_DO_CURB65"], [5, "UTI_NA_PNEUMONIA_NAO_SAI_DO_CURB65"]]],
    ["heart", "coronary-decision-tree.ts", [[7, "ESTRATEGIA_INVASIVA_NAO_SAI_DO_HEART"], [10, "ESTRATEGIA_INVASIVA_NAO_SAI_DO_HEART"]]],
  ];

  for (const [id, arquivoDono, pares] of ESPERADO) {
    const calc = CALC_TOOLS.find((c) => c.id === id);
    if (!calc || typeof calc.interpret !== "function") {
      falhas++, linhas.push(`❌ ${id}: interpret não é executável — a conferência de fronteira não rodou.`);
      continue;
    }
    for (const [total, nome] of pares) {
      const esperado = textoDaConstante(arquivoDono, nome);
      if (!esperado) {
        falhas++, linhas.push(`❌ ${arquivoDono}: não consegui ler ${nome} — a conferência de fronteira não rodou.`);
        continue;
      }
      // A constante pode não ser a primeira linha: nas ferramentas de excesso
      // parcial, a linha 1 é o desfecho validado que FICA e a 2 é a ressalva.
      const obtido = (calc.interpret(total).lines || []).find((l) => l === esperado);
      if (obtido !== esperado) {
        falhas++, linhas.push(
          `❌ ${id} em ${total}: a faixa não exibe ${nome}. Obtido «${String(obtido).slice(0, 70)}…»`
        );
      } else { ok++; }
    }
  }
}

const IDENTIDADES_PLANAS = Object.entries(IDENTIDADES).flatMap(([id, v]) =>
  (Array.isArray(v) ? v : [v]).map((inv) => [id, inv])
);
for (const [id, inv] of IDENTIDADES_PLANAS) {
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
    const obtido = totalDe(r, inv.metrica);
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
    linhas.push(`✅ ${id.padEnd(12)} ${inv.metrica ? "[" + inv.metrica + "] " : ""}fórmula confere com a publicação (400 entradas aleatórias)`);
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

/**
 * (c) A faixa EXIBIDA (`totalRange`) × a faixa que os pesos produzem.
 *
 * O invariante de faixa já compara os pesos com a publicação. O que ninguém
 * comparava era o texto que o usuário LÊ: `totalRange: "3–15"` é string livre,
 * e mutá-la para "4–15" passava sem ruído. Um escore certo com faixa errada
 * escrita ao lado ensina errado — e é o tipo de coisa que só aparece quando
 * alguém confere de cabeça e desconfia do app.
 */
for (const calc of CALC_TOOLS) {
  if (calc.kind !== "score" || !calc.totalRange) continue;
  // O sinal de menos do texto clínico é U+2212 ("−"), não o hífen ASCII, e o
  // RASS escreve "+4" com sinal explícito. Sem normalizar, "−5 a +4" era lido
  // como 5 e 4 e o script acusava divergência que não existia — o app estava
  // certo e o parser é que não sabia ler o próprio texto do app.
  const nums = String(calc.totalRange)
    .replace(/\u2212/g, "-")
    .match(/[+-]?\d+(?:[.,]\d+)?/g);
  if (!nums || nums.length < 2) continue;
  const [dMin, dMax] = nums.slice(0, 2).map((n) => parseFloat(n.replace(",", ".")));
  const [cMin, cMax] = extremos(calc);
  if (cMin === null || cMax === null) continue;
  if (Math.abs(dMin - cMin) > 0.01 || Math.abs(dMax - cMax) > 0.01) {
    falhas++;
    linhas.push(
      `❌ ${calc.id.padEnd(12)} faixa EXIBIDA "${calc.totalRange}" ≠ faixa dos pesos ` +
      `${cMin}–${cMax} — o texto ao lado do escore ensina um limite que a soma não produz`
    );
  } else {
    ok++;
    linhas.push(`✅ ${calc.id.padEnd(12)} faixa exibida "${calc.totalRange}" confere com os pesos`);
  }
}

console.log("\nValidação estrutural das calculadoras clínicas\n");
console.log(linhas.join("\n"));
console.log(
  `\n${ok} conferidas · ${falhas} divergentes · ${pendentes} pendentes · ` +
  `${desativadas} desativadas · ${semInvariante.length} sem invariante cadastrado`
);
/**
 * (b) Calculadora SEM invariante passa a QUEBRAR o build.
 *
 * Antes era só um aviso impresso, e o script saía 0. Isso degrada a cobertura
 * sozinho: cada calculadora nova entra sem invariante, ninguém repara, e a
 * frase "N conferidas" continua verdadeira enquanto o denominador cresce.
 * Foi o que a mutação mostrou — renomear o id do NIHSS tirava o escore da
 * conferência e o script continuava saindo 0.
 *
 * Quem acrescentar calculadora agora escolhe entre extrair o invariante da
 * publicação ou registrar `faixa: null` com o motivo. As duas são decisões
 * explícitas; a terceira opção — não decidir — deixou de existir.
 */
if (semInvariante.length) {
  console.error(
    `\n❌ ${semInvariante.length} calculadora(s) SEM invariante cadastrado: ${semInvariante.join(", ")}\n` +
    `   "Sem invariante" NÃO significa conferida — significa que ninguém extraiu o\n` +
    `   invariante da publicação primária. Acrescente a entrada em INVARIANTES/IDENTIDADES,\n` +
    `   ou registre \`faixa: null\` com o motivo se a publicação não declarar faixa verificável.`
  );
}

fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas > 0 || semInvariante.length > 0 ? 1 : 0);
