#!/usr/bin/env node
/**
 * PROMETE
 *   Que os QUATRO GRUPOS de padrão sem supra continuem SEPARADOS, com as quatro
 *   condutas distintas; que os prazos digam de ONDE contam; que a fibrinólise
 *   tenha absolutas E relativas com a conduta do meio; e que o TNK e a
 *   enoxaparina digam a apresentação onde a dose é administrada.
 *
 * NÃO PROMETE
 *   Que os critérios de ECG estejam completos — auditoria de conteúdo com fonte
 *   aberta já foi feita, e novos padrões podem entrar. A trava protege as
 *   distinções que, fundidas, produzem erro.
 *
 * UNIVERSO
 *   A árvore coronariana e as três libs que ela passou a consumir.
 *
 * ── POR QUE ELA EXISTE ──────────────────────────────────────────────────────
 *
 * D-25: `test:coronary` validava `coronary-syndromes-engine.ts`, órfão de
 * render — duas entradas verdes no test:all davam sensação de cobertura sobre
 * dois módulos que a Fase 1 nunca auditou. Os scripts foram removidos na
 * deleção da D-22, e o módulo ficou com ZERO cobertura de conteúdo.
 *
 * ⚠️ ESTA TRAVA NASCEU DEPOIS DA AUDITORIA, NÃO ANTES (R-21). Escrita antes,
 * ela teria fotografado o app como estava — sem De Winter, sem Wellens, sem
 * posterior, sem VD — e chamado isso de contrato.
 *
 * ── O QUE ELA IMPEDE ────────────────────────────────────────────────────────
 *
 * 1. A FUSÃO DOS QUATRO GRUPOS. Se alguém "simplificar" para uma lista de
 *    equivalentes de STEMI, o app passa a mandar trombolisar um Wellens sem dor
 *    e a não contraindicar nitrato no VD. Os dois erros matam, por mecanismos
 *    OPOSTOS — e nenhuma trava de número os pega, porque os números continuam
 *    certos.
 *
 * 2. A PERDA DO LIMIAR PRÓPRIO DE V7–V9. 0,5 mm é metade do critério padrão;
 *    sem ele, quem faz as derivações posteriores aplica o ≥ 1 mm que acabou de
 *    ler e DESCARTA o infarto que foi procurar.
 *
 * 3. O PRAZO SEM MARCO (D-17). "Porta-balão ≤ 120 min" sem dizer que o relógio
 *    começa no PRIMEIRO CONTATO MÉDICO faz contar do lugar errado — e o erro
 *    ENCURTA o prazo percebido, empurrando para ICP quem já devia lisar.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const ARVORE = "coronary-decision-tree.ts";
const LIB = "lib/oclusao-sem-supra.ts";

const falhas = [];
let ok = 0;

const limpo = (rel) =>
  fs
    .readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

const arvore = limpo(ARVORE);
const lib = limpo(LIB);

// ── A. OS QUATRO GRUPOS, E O QUE OS SEPARA ────────────────────────────────
{
  const GRUPOS = [
    ["1 · De Winter (oclusão)", /DE WINTER — OCLUSÃO AGUDA/, /1[–-]3 mm/],
    ["1 · posterior (oclusão)", /POSTERIOR ISOLADO — OCLUSÃO AGUDA/, /R\/S > 1 em V2/],
    ["1 · T hiperaguda (oclusão)", /T HIPERAGUDA/, /REPETIR O ECG É PARTE DA CONDUTA/],
    ["2 · aVR (tronco)", /SUPRA EM aVR/, /NÃO É INDICAÇÃO DE FIBRINÓLISE/],
    ["3 · Wellens (NÃO é oclusão)", /NÃO É OCLUSÃO EM CURSO/, /NUNCA TESTE ERGOMÉTRICO/],
    ["4 · VD (contraindicação)", /INFARTO DE VD/, /NITRATO E MORFINA ESTÃO CONTRAINDICADOS/],
  ];
  for (const [nome, presente, oQueOSepara] of GRUPOS) {
    if (!presente.test(lib)) {
      falhas.push(`${LIB}: o grupo "${nome}" sumiu.`);
    } else ok++;
    if (!oQueOSepara.test(lib)) {
      falhas.push(
        `${LIB}: o grupo "${nome}" perdeu o que o distingue dos outros. Os quatro têm CONDUTAS ` +
        `diferentes — fundi-los faz trombolisar Wellens e nitratar VD, e nenhum número fica errado ` +
        `no caminho.`
      );
    } else ok++;
  }

  // A abertura que impede a leitura de "lista de sinônimos".
  if (!/NÃO SÃO SINÔNIMOS|QUATRO GRUPOS COM QUATRO CONDUTAS/.test(lib)) {
    falhas.push(
      `${LIB}: sumiu a abertura que diz que estes NÃO são sinônimos de STEMI. Sem ela, a lista se lê ` +
      `como equivalentes e a distinção morre na primeira leitura apressada.`
    );
  } else ok++;

  // A razão da proibição do ergométrico — sem ela a regra se esquece.
  if (!/APARÊNCIA DE ESTABILIDADE/.test(lib)) {
    falhas.push(
      `${LIB}: a proibição do ergométrico no Wellens perdeu a RAZÃO. O paciente está sem dor e com ` +
      `marcadores normais — é essa aparência de estabilidade que faz alguém pedir o teste, e é ela ` +
      `que precisa estar escrita.`
    );
  } else ok++;
}

// ── B. O limiar próprio das derivações posteriores ────────────────────────
{
  if (!/0,5 mm em V7[–-]V9|apenas 0,5 mm/.test(lib)) {
    falhas.push(
      `${LIB}: sumiu o limiar de 0,5 mm de V7–V9. É METADE do critério padrão: quem faz as ` +
      `derivações posteriores e aplica o ≥ 1 mm descarta o diagnóstico que foi procurar.`
    );
  } else ok++;

  for (const [nome, padrao] of [
    ["a técnica de V7–V9", /plano horizontal de V6|MESMO PLANO HORIZONTAL DE V6/i],
    ["a técnica de V3R–V4R", /5º espaço intercostal DIREITO/],
    ["o critério do VD", /≥ 1 mm em V3R[–-]V6R/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(`${LIB}: ${nome} sumiu — é superfície de AÇÃO, e quem nunca fez não deriva do nome.`);
    } else ok++;
  }
}

// ── C. Prazos com MARCO declarado (D-17) ──────────────────────────────────
{
  for (const [nome, padrao] of [
    ["o marco do porta-balão", /PRIMEIRO CONTATO MÉDICO/],
    ["o marco do ECG", /10 min da chegada/],
    ["o marco da agulha", /entre o diagnóstico e a agulha/],
  ]) {
    if (!padrao.test(arvore)) {
      falhas.push(
        `${ARVORE}: ${nome} sumiu. Prazo sem marco é o defeito mais comum do app (D-17) — e no ` +
        `porta-balão contar do lugar errado ENCURTA o prazo percebido.`
      );
    } else ok++;
  }
}

// ── D. Fibrinólise: absolutas, relativas e a conduta do meio ──────────────
{
  for (const [nome, padrao] of [
    ["as contraindicações RELATIVAS", /CONTRAINDICAÇÕES RELATIVAS/],
    ["a conduta com relativa e sem absoluta", /COM RELATIVA E SEM ABSOLUTA/],
    ["o critério que decide (tempo até ICP)", /dentro de 120 min do primeiro contato/],
    ["os rótulos das opções falando de ABSOLUTA", /Sem contraindicação ABSOLUTA/],
  ]) {
    if (!padrao.test(arvore)) {
      falhas.push(
        `${ARVORE}: ${nome} sumiu. Perguntar só por absolutas e rotular a saída como "sem ` +
        `contraindicação" faz o médico responder "não" tendo uma relativa na frente.`
      );
    } else ok++;
  }
}

// ── E. R-48: apresentação onde a dose é administrada ──────────────────────
{
  for (const [rel, nome] of [
    ["lib/tenecteplase.ts", "TENECTEPLASE_APRESENTACAO"],
    ["lib/enoxaparina.ts", "ENOXAPARINA_APRESENTACAO"],
  ]) {
    if (!new RegExp(`\\b${nome}\\b`).test(semImports(ARVORE))) {
      falhas.push(`${ARVORE}: não consome ${nome} — a dose é administrada aqui e a forma do fármaco vive noutro lugar (R-48).`);
    } else ok++;
  }

  // A confusão mg × U do TNK é o que torna o erro catastrófico.
  if (!/1 mg = 200 U/.test(limpo("lib/tenecteplase.ts"))) {
    falhas.push(
      `lib/tenecteplase.ts: sumiu a equivalência 1 mg = 200 U. O frasco traz as DUAS escalas, a dose ` +
      `se prescreve em mg, e confundi-las erra por um fator de 200 num bolus ÚNICO.`
    );
  } else ok++;
}

// ── F. O enquadramento OMI declarado como em consolidação ─────────────────
{
  if (!/MANTÉM STEMI\/NSTEMI/.test(lib)) {
    falhas.push(
      `${LIB}: o enquadramento OMI perdeu a ressalva de que a ACC/AHA 2025 MANTÉM STEMI/NSTEMI. ` +
      `Trocar a nomenclatura sem avisar deixa o médico com um vocabulário que a equipe ao lado não usa.`
    );
  } else ok++;
}

console.log("\nSíndromes coronarianas — quatro grupos, quatro condutas, e os prazos com marco\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — os grupos separados, o limiar de V7–V9 e a conduta do meio\n`);
process.exit(0);
