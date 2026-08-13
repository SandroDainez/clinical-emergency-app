/**
 * valida-dobutamina.cjs — D-11
 *
 * PROMETE: que nenhum sítio escreva faixa de dobutamina própria; que os textos
 *   do regime venham de lib/dobutamina.ts; que as três ressalvas do teto estejam
 *   na constante; e que a força FRACA da recomendação de 2026 esteja escrita
 *   onde a indicação aparece.
 * NÃO PROMETE: que as doses estejam clinicamente certas — o lastro é a bula
 *   (dose) e a SSC 2026 (indicação), e a trava confere coerência interna e
 *   procedência, não julgamento. Também não cobre as demais drogas vasoativas.
 * UNIVERSO: toda a árvore de conteúdo (.ts/.tsx), fora scripts, e2e, locales e
 *   i18n.
 *
 * ── O DEFEITO ───────────────────────────────────────────────────────────────
 *
 * Seis afirmações de dose para a mesma droga, com a SEPSE limitando abaixo da
 * própria fonte de três jeitos diferentes (nenhum teto, 5 e 10) enquanto a bula
 * registra que até 20 são frequentemente necessários.
 *
 * ── DUAS FONTES QUE NÃO PODEM SER FUNDIDAS ──────────────────────────────────
 *
 * A DOSE vem da BULA; a INDICAÇÃO vem da SSC 2026, que NÃO especifica dose. Uma
 * citação única cobrindo as duas seria citar diretriz para o que ela não diz —
 * o erro do ART (D-6). A trava confere que as duas atribuições existem e estão
 * separadas.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const fonteTexto = fs.readFileSync(path.join(appDir, "lib/dobutamina.ts"), "utf8");

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}

// ── 1. Os números do regime, e o texto derivando deles ─────────────────────
//
// Referência EXTERNA (bula do cloridrato de dobutamina 12,5 mg/mL): início 2,5 ·
// usual 2,5–10 · até 20 quando necessário. Escrita aqui de propósito — se viesse
// do app, a conferência giraria em falso (R-21).
{
  const ESPERADO = { inicio: "2.5", usualMin: "2.5", usualMax: "10", teto: "20" };
  for (const [campo, valor] of Object.entries(ESPERADO)) {
    if (!new RegExp(`${campo}:\\s*${valor.replace(".", "\\.")}\\b`).test(fonteTexto)) {
      falhas.push(`lib/dobutamina.ts: ${campo} não é ${valor} — a referência é a bula, não o app.`);
    } else ok++;
  }
  // O texto tem de mostrar os mesmos números que a camada numérica declara.
  for (const [trecho, onde] of [["2,5 mcg/kg/min", "DOBUTAMINA_INICIO"], ["2,5–10 mcg/kg/min", "DOBUTAMINA_FAIXA_USUAL"], ["20 mcg/kg/min", "DOBUTAMINA_ATE_20"]]) {
    if (!fonteTexto.includes(trecho)) {
      falhas.push(`lib/dobutamina.ts: ${onde} não exibe "${trecho}" — texto e número divergiram.`);
    } else ok++;
  }
}

// ── 2. As TRÊS ressalvas do teto ───────────────────────────────────────────
//
// Declarar "até 20" sem elas convida a subir até 20. Cada uma existe por um
// motivo distinto, e faltar UMA já muda o que o leitor faz.
{
  const RESSALVAS = [
    [/taquiarritmia/i, "taquiarritmia e consumo miocárdico de O₂"],
    [/vasodilata[çc][ãa]o beta-?2|PIORA DA HIPOTENS/i, "piora da hipotensão por vasodilatação beta-2"],
    [/MARCADORES DE PERFUS|lactato, débito urinário/i, "titulação por marcadores de perfusão, não por número da faixa"],
  ];
  for (const [re, nome] of RESSALVAS) {
    if (!re.test(fonteTexto)) {
      falhas.push(`lib/dobutamina.ts: a ressalva do teto perdeu "${nome}". As três são necessárias — faltar uma muda o que o leitor faz.`);
    } else ok++;
  }
}

// ── 3. As duas fontes, separadas ───────────────────────────────────────────
{
  const temBula = /bula do cloridrato de dobutamina|bula \(cloridrato/i.test(fonteTexto) || /\(bula/i.test(fonteTexto);
  const temDiretriz = /SSC 2026/.test(fonteTexto);
  if (!temBula) falhas.push("lib/dobutamina.ts: a DOSE perdeu a atribuição à bula.");
  else ok++;
  if (!temDiretriz) falhas.push("lib/dobutamina.ts: a INDICAÇÃO perdeu a atribuição à SSC 2026.");
  else ok++;
  // A dose NÃO pode ser atribuída à diretriz: ela não especifica dose nenhuma.
  const linhaDose = fonteTexto.split("\n").find((l) => /FAIXA USUAL:/.test(l)) || "";
  if (/SSC/.test(linhaDose)) {
    falhas.push("lib/dobutamina.ts: a faixa de dose foi atribuída à SSC, que NÃO especifica dose. É o erro do ART (D-6).");
  } else ok++;
}

// ── 4. A força FRACA da recomendação, escrita ──────────────────────────────
{
  if (!/RECOMENDA[ÇC][ÃA]O FRACA/i.test(fonteTexto)) {
    falhas.push(
      "lib/dobutamina.ts: a força da recomendação sumiu. A SSC 2026 REBAIXOU a escolha do agente, e o app " +
      "apresentava a dobutamina como A resposta — dizer o que a evidência sustenta é o mesmo princípio do SOFA."
    );
  } else ok++;
  if (!/milrinona/i.test(fonteTexto)) {
    falhas.push("lib/dobutamina.ts: sumiu o registro de que os dados são insuficientes para decidir entre dobutamina e milrinona.");
  } else ok++;
}

// ── 5. Nenhum sítio escreve faixa própria ──────────────────────────────────
//
// A regra é de EFEITO, não de grafia: qualquer intervalo de dobutamina escrito
// fora da fonte é uma sétima afirmação nascendo.
{
  const FAIXA_PROPRIA = /dobutamina[^"]{0,60}?\d+(?:[.,]\d+)?\s*[–-]\s*\d+(?:[.,]\d+)?\s*mcg\/kg\/min/i;
  let vistos = 0;
  for (const arquivo of fontes(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (rel === "lib/dobutamina.ts") continue;
    const texto = fs.readFileSync(arquivo, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    vistos++;
    texto.split("\n").forEach((linha, i) => {
      if (/^\s*\/\//.test(linha)) return;
      if (!FAIXA_PROPRIA.test(linha)) return;
      // Exceção NOMEADA: a tabela de associações das Vasoativas mostra a faixa
      // em coluna curta, onde o texto dos três eixos não cabe. Ela repete os
      // números da fonte e é conferida logo abaixo — contrato vigiado (R-25),
      // declarado, não silencioso.
      if (rel.endsWith("vasoactive-calculator-screen.tsx") && /início 2,5; até 20 se necessário/.test(linha)) return;
      falhas.push(
        `${rel}:${i + 1} — faixa de dobutamina escrita fora da fonte única: «${linha.trim().slice(0, 95)}».\n` +
        `    O regime vive em lib/dobutamina.ts (D-11). Escrever aqui é a sétima afirmação nascendo.`
      );
    });
  }
  if (vistos < 100) falhas.push(`a varredura leu só ${vistos} arquivos — universo pequeno demais para valer como trava.`);
  else ok++;
}

// ── 6. A exceção da tabela repete os números CERTOS ────────────────────────
{
  const tela = fs.readFileSync(path.join(appDir, "components/protocol-screen/vasoactive-calculator-screen.tsx"), "utf8");
  const linhas = tela.split("\n").filter((l) => /drug: "Dobutamina"/.test(l));
  if (!linhas.length) {
    falhas.push("vasoactive-calculator-screen: nenhuma entrada de dobutamina — a conferência da exceção não rodou.");
  } else {
    for (const l of linhas) {
      if (!/2,5–10 mcg\/kg\/min \(início 2,5; até 20 se necessário\)/.test(l)) {
        falhas.push(`vasoactive-calculator-screen: a linha curta da dobutamina divergiu da fonte — «${l.trim().slice(0, 95)}».`);
      } else ok++;
    }
  }
}

// ── 7. Os sítios consomem a fonte ──────────────────────────────────────────
{
  const CONSOMEM = [
    ["sepsis-engine.ts", ["DOBUTAMINA_INICIO", "DOBUTAMINA_FAIXA_USUAL", "DOBUTAMINA_ATE_20", "DOBUTAMINA_INDICACAO_SEPSE_FRACA"]],
    ["tep-decision-tree.ts", ["DOBUTAMINA_INICIO", "DOBUTAMINA_FAIXA_USUAL", "DOBUTAMINA_ATE_20"]],
    ["eap-decision-tree.ts", ["DOBUTAMINA_INICIO", "DOBUTAMINA_FAIXA_USUAL", "DOBUTAMINA_ATE_20"]],
    ["sepsis-decision-tree.ts", ["DOBUTAMINA_INICIO", "DOBUTAMINA_FAIXA_USUAL", "DOBUTAMINA_ATE_20", "DOBUTAMINA_INDICACAO_SEPSE_FRACA"]],
    ["components/protocol-screen/acls-post-rosc-screen.tsx", ["DOBUTAMINA_INICIO", "DOBUTAMINA_FAIXA_USUAL", "DOBUTAMINA_ATE_20"]],
  ];
  for (const [rel, nomes] of CONSOMEM) {
    const texto = fs.readFileSync(path.join(appDir, rel), "utf8");
    for (const nome of nomes) {
      if (!new RegExp(`\\b${nome}\\b`).test(texto)) {
        falhas.push(`${rel}: não consome ${nome} — a fonte única existe e este sítio não a usa (R-25).`);
      } else ok++;
    }
  }
}

console.log(`\nDobutamina — regime em fonte única, com a dose da bula e a indicação da diretriz (D-11)\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} verificações — um regime só, duas fontes separadas, três ressalvas e a força declarada\n`);
