#!/usr/bin/env node
/**
 * PROMETE
 *   Que a PCR na gestação mantenha o deslocamento uterino MANUAL com hierarquia
 *   sobre a inclinação, a janela 4→5 min com a distinção decidir × concluir, e
 *   o cálcio em fonte única com os dois sais PAREADOS.
 *
 * NÃO PROMETE
 *   Que a conduta obstétrica esteja completa — o módulo é o que MUDA em relação
 *   ao ACLS do adulto, não um tratado de emergência obstétrica.
 *
 * UNIVERSO
 *   O módulo da gestação, as duas libs que ele consome, e — para o R-54 — todo
 *   .ts/.tsx do app onde os dois sais de cálcio apareçam juntos.
 *
 * ── R-54 · DOSES PAREADAS SE MOVEM JUNTAS ───────────────────────────────────
 *
 * O defeito que originou: o card tinha cloreto FIXO em 10 mL e gluconato na
 * FAIXA 15–30, quando o par da fonte é 5–10 ↔ 15–30.
 *
 * NENHUM NÚMERO ESTAVA ERRADO. A correspondência é que quebrou — e quem só
 * tinha acesso periférico escolhia 15 mL achando ser o equivalente do 1 g de
 * cloreto que acabara de ler, dando metade.
 *
 * A regra: ou os dois em PONTO, ou os dois em FAIXA com os extremos pareados.
 * Assimetria de FORMA entre agentes equivalentes produz erro de dose sem que
 * nenhum número esteja errado — e é por isso que nenhuma trava de valor pegaria.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const MODULO = "components/protocol-screen/acls-pregnancy-screen.tsx";
const LIB_CALCIO = "lib/calcio-na-parada.ts";
const LIB_DESLOC = "lib/deslocamento-uterino.ts";

const falhas = [];
let ok = 0;

const limpo = (rel) =>
  fs
    .readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

const modulo = limpo(MODULO);
const calcio = limpo(LIB_CALCIO);
const desloc = limpo(LIB_DESLOC);

// ── A. R-54: SIMETRIA DE FORMA entre os dois sais, em universo aberto ──────
{
  const raiz = (d, saida = []) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales/.test(p)) raiz(p, saida);
      } else if (/\.tsx?$/.test(f.name)) saida.push(p);
    }
    return saida;
  };

  // Uma FAIXA é "a–b"; um PONTO é um número só. Se os dois sais aparecem na
  // mesma frase, têm de ter a MESMA forma.
  const FAIXA = /\d+\s*[–-]\s*\d+\s*mL/;
  const assimetricos = [];

  for (const arquivo of raiz(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (rel.startsWith("lib/i18n/")) continue;
    for (const linha of limpo(rel).split("\n")) {
      if (!/cloreto de cálcio/i.test(linha) || !/gluconato de cálcio/i.test(linha)) continue;
      const iCl = linha.search(/cloreto de cálcio/i);
      const iGl = linha.search(/gluconato de cálcio/i);
      const [ini, fim] = iCl < iGl ? [iCl, iGl] : [iGl, iCl];
      const trechoA = linha.slice(ini, fim);
      const trechoB = linha.slice(fim);
      const formaA = FAIXA.test(trechoA) ? "faixa" : "ponto";
      const formaB = FAIXA.test(trechoB) ? "faixa" : "ponto";
      if (formaA !== formaB) {
        assimetricos.push({ rel, linha: linha.trim().slice(0, 120), formaA, formaB });
      }
    }
  }

  for (const a of assimetricos) {
    falhas.push(
      `${a.rel}: os dois sais de cálcio aparecem com FORMAS diferentes (${a.formaA} × ${a.formaB}) — ` +
      `«${a.linha}». R-54: ou os dois em ponto, ou os dois em faixa com os extremos pareados. ` +
      `Assimetria de forma faz o leitor assumir que qualquer valor da faixa corresponde ao ponto do ` +
      `outro lado, e o piso SUBDOSA.`
    );
  }
  if (assimetricos.length === 0) ok++;

  // E o par, no dono, com os valores da fonte.
  for (const [nome, padrao] of [
    ["cloreto 10 mL (1 g)", /cloreto de cálcio 10%:\s*10 mL \(1 g\)/],
    ["gluconato 30 mL (3 g)", /gluconato de cálcio 10%:\s*30 mL \(3 g\)/],
    ["o aviso de por que 30 e não 15", /30 mL e não 15/],
  ]) {
    if (!padrao.test(calcio)) {
      falhas.push(`${LIB_CALCIO}: ${nome} mudou ou sumiu — é o par que a fonte dá para a parada.`);
    } else ok++;
  }
}

// ── B. A equivalência tem UMA redação, e é a que dá a conversão pronta ─────
{
  if (!/1 g de cloreto de cálcio ≈ 3 g de gluconato/.test(calcio)) {
    falhas.push(
      `${LIB_CALCIO}: a equivalência mudou de redação. Ela é "1 g de cloreto ≈ 3 g de gluconato" e ` +
      `não "⅓ tão potente por grama": a primeira entrega a conversão PRONTA, a segunda exige a ` +
      `inversão mental durante uma parada.`
    );
  } else ok++;

  // O "⅓ por grama" não pode voltar em lugar nenhum.
  const raizLibs = fs.readdirSync(path.join(appDir, "lib")).filter((f) => f.endsWith(".ts"));
  for (const f of raizLibs) {
    if (/⅓ tão potente/.test(limpo(path.join("lib", f)))) {
      falhas.push(`lib/${f}: voltou a segunda redação da equivalência ("⅓ tão potente por grama").`);
    }
  }
  ok++;

  if (!/CALCIO_EQUIVALENCIA/.test(semImports("lib/causas-na-parada.ts"))) {
    falhas.push(
      `lib/causas-na-parada.ts: parou de consumir CALCIO_EQUIVALENCIA — a equivalência volta a ` +
      `existir em duas redações que divergem na primeira correção que só um lado receber.`
    );
  } else ok++;
}

// ── C. Deslocamento uterino: manual, com hierarquia e com o COMO ──────────
{
  for (const [nome, padrao] of [
    ["as duas técnicas (uma mão / duas mãos)", /UMA MÃO[\s\S]{0,200}DUAS MÃOS/],
    ["o lado de quem executa", /DE PÉ À DIREITA[\s\S]{0,200}DE PÉ À ESQUERDA/],
    ["o alerta de nunca empurrar para baixo", /NUNCA empurrar para BAIXO/],
    ["a pessoa dedicada", /OCUPA UMA PESSOA/],
    ["por que não inclinar, com as três coisas", /NÃO INCLINAR A MACA[\s\S]{0,260}via aérea/],
  ]) {
    if (!padrao.test(desloc)) {
      falhas.push(
        `${LIB_DESLOC}: ${nome} sumiu. É superfície de AÇÃO — sem o COMO, "deslocar o útero para a ` +
        `esquerda" não é executável por quem nunca fez, e a manobra tem um jeito errado que PIORA ` +
        `a compressão aortocava.`
      );
    } else ok++;
  }

  if (!/DESLOCAMENTO_UTERINO_COMO/.test(semImports(MODULO))) {
    falhas.push(`${MODULO}: não consome DESLOCAMENTO_UTERINO_COMO.`);
  } else ok++;
}

// ── D. A janela 4→5: DECIDIR não é CONCLUIR ───────────────────────────────
{
  for (const [nome, padrao] of [
    ["o marco de ~4 min (iniciar)", /~4 min/],
    ["o marco de 5 min (concluído)", /5 min/],
    ["a preparação no minuto zero", /0 min/],
    ["quem decide, sem esperar o obstetra", /NÃO depende da chegada do obstetra/],
    ["acionada no zero, não consultada aos quatro", /acionada no minuto ZERO, não consultada aos quatro/],
    ["RCP durante E DEPOIS", /DURANTE e DEPOIS do procedimento/],
    ["não transportar", /NÃO transportar/],
    ["o parto é pela MÃE", /pela MÃE/],
    ["a indicação pelo tamanho do útero", /INDICAÇÃO: útero clinicamente grande/],
  ]) {
    if (!padrao.test(modulo)) {
      falhas.push(
        `${MODULO}: ${nome} sumiu da janela do parto ressuscitativo. O que importa é QUANDO SE ` +
        `DECIDE, não quando se termina — e sem "quem decide" alguém adia por achar que a decisão ` +
        `é obstétrica.`
      );
    } else ok++;
  }
}

console.log("\nPCR na gestação — deslocamento manual, janela 4→5 e o par do cálcio\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — o par se move junto, o COMO está na ação, e a decisão não espera\n`);
process.exit(0);
