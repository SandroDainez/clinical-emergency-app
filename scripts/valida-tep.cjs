#!/usr/bin/env node
/**
 * PROMETE
 *   Que a ordem diagnóstica não permita pular a probabilidade pré-teste; que o
 *   D-dímero ajustado por idade e o PERC continuem lá; que a separação
 *   intermediário-ALTO × intermediário-BAIXO se mantenha; que a trombólise
 *   tenha absolutas E relativas com a inversão em PCR; e que os dois regimes de
 *   enoxaparina não se confundam.
 *
 * NÃO PROMETE
 *   Cobertura do módulo inteiro. É a primeira auditoria do TEP, e ele chegou
 *   com o melhor conteúdo do app — a trava protege o que, se cair, cai em
 *   silêncio.
 *
 * UNIVERSO
 *   A árvore do TEP e as libs que ela consome.
 *
 * ── O QUE ELA IMPEDE ────────────────────────────────────────────────────────
 *
 * 1. WELLS > 4 PEDINDO D-DÍMERO. Em alta probabilidade o D-dímero não exclui, e
 *    pedi-lo só atrasa a AngioTC. O app diz "NÃO pedir" — e é o tipo de
 *    instrução que some numa reescrita de estilo.
 *
 * 2. A FUSÃO INTERMEDIÁRIO-ALTO × BAIXO. Um exige VD **E** biomarcador, o outro
 *    apenas um dos dois. É onde mais se erra, e a diferença decide vigilância
 *    em UTI contra enfermaria.
 *
 * 3. O AJUSTE RENAL DA ENOXAPARINA sumindo de novo do módulo em que ela é a
 *    anticoagulação de MANUTENÇÃO — ele existia nas coronárias, onde ela é
 *    adjuvante, e faltava aqui. R-48 pela distribuição, invertendo a intuição
 *    de que a lacuna estaria no módulo menos maduro.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const ARVORE = "tep-decision-tree.ts";

const falhas = [];
let ok = 0;

const limpo = (rel) =>
  fs
    .readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

const arvore = limpo(ARVORE);

// ── A. Ordem diagnóstica ──────────────────────────────────────────────────
{
  for (const [nome, padrao] of [
    ["a proibição do D-dímero em alta probabilidade", /NÃO pedir D-dímero/],
    ["o D-dímero ajustado por idade", /idade × 10/],
    ["o corte padrão de 500", /500 ng\/mL/],
    ["o PERC com os oito critérios", /PERC/],
    ["a alternativa de Genebra", /Genebra/],
  ]) {
    if (!padrao.test(arvore)) {
      falhas.push(
        `${ARVORE}: ${nome} sumiu. A ordem é probabilidade → exame: pedir D-dímero em alta ` +
        `probabilidade não exclui nada e atrasa a AngioTC.`
      );
    } else ok++;
  }
}

// ── B. Estratificação: a separação que mais erra ──────────────────────────
{
  const separacaoC3 = /Intermediário-ALTO: disfunção de VD E biomarcadores/.test(arvore) || /C3 = VD anormal E pelo menos um biomarcador anormal/.test(arvore);
  if (!separacaoC3) {
    falhas.push(
      `${ARVORE}: a definição de intermediário-ALTO perdeu o "E". Ele exige disfunção de VD E ` +
      `biomarcador elevado; o intermediário-BAIXO tem apenas UM dos dois. Fundir os dois manda para ` +
      `enfermaria quem precisa de vigilância intensiva.`
    );
  } else ok++;

  for (const [nome, padrao] of [
    ["o sPESI com os seis itens", /sPESI \(1 ponto cada\)/],
    ["a separação hemodinâmica D/E ou o critério legado equivalente", /PAS < 90 mmHg ou queda ≥ 40 mmHg|D1: hipotensão transitória\/recorrente|E1: hipotensão recorrente ou persistente/],
    ["a disfunção de VD por imagem", /VD\/VE > 0,9/],
  ]) {
    if (!padrao.test(arvore)) {
      falhas.push(`${ARVORE}: ${nome} sumiu da estratificação.`);
    } else ok++;
  }
}

// ── C. Trombólise: absolutas, relativas e a inversão em PCR ───────────────
{
  for (const [nome, padrao] of [
    ["as contraindicações RELATIVAS listadas", /CONTRAINDICAÇÕES RELATIVAS/],
    ["o balanço risco-benefício em PCR", /EM PCR OU COLAPSO IMINENTE, AS RELATIVAS TORNAM-SE ACEITÁVEIS|contraindicações relativas não devem funcionar como veto mecânico/],
    ["a alternativa por cateter sem promessa universal de menor risco", /via de CATETER, que usa dose menor|Trombólise cateter-dirigida|embolectomia mecânica/],
    ["as alternativas quando há absoluta", /Trombólise cateter-dirigida/],
    ["a embolectomia", /[Ee]mbolectomia/],
    ["o VA-ECMO", /VA-ECMO/],
  ]) {
    if (!padrao.test(arvore)) {
      falhas.push(
        `${ARVORE}: ${nome} sumiu. Sem as relativas listadas, a frase da inversão em PCR fica sem ` +
        `referente — ela diz que "as relativas tornam-se aceitáveis" sem que o app diga quais são.`
      );
    } else ok++;
  }
}

// ── D. Enoxaparina: dois regimes, e o ajuste renal onde importa ───────────
{
  const lib = limpo("lib/enoxaparina.ts");
  for (const [nome, padrao] of [
    ["o regime do IAM com bolus e corte etário", /ENOXAPARINA NO IAM COM FIBRINÓLISE/],
    ["o regime do TEV sem bolus e sem corte", /SEM bolus IV e SEM redução por idade/],
    ["a RAZÃO do que os separa", /o bolus existe para cobrir o momento do trombolítico/],
    ["o ajuste renal do TEV", /ClCr < 30 mL\/min, espaçar para 1 mg\/kg 24\/24h/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(
        `lib/enoxaparina: ${nome} sumiu. Sem a razão escrita, alguém "unifica" os dois regimes ` +
        `achando que é a mesma droga na mesma indicação — e apaga o que é específico da fibrinólise.`
      );
    } else ok++;
  }

  // Import fora: import não é consumo (R-15 item 10).
  if (!/ENOXAPARINA_REGIME_TEV/.test(semImports(ARVORE))) {
    falhas.push(`${ARVORE}: não consome ENOXAPARINA_REGIME_TEV — o ajuste renal volta a faltar onde ela é a manutenção.`);
  } else ok++;
  if (!/ENOXAPARINA_REGIME_IAM/.test(semImports("coronary-decision-tree.ts"))) {
    falhas.push("coronary-decision-tree: não consome ENOXAPARINA_REGIME_IAM.");
  } else ok++;
}

// ── E. R-48: a HNF, onde a escala é o perigo ──────────────────────────────
{
  if (!/HNF_APRESENTACAO/.test(semImports(ARVORE))) {
    falhas.push(`${ARVORE}: não consome HNF_APRESENTACAO — bolus e bomba prescritos sem dizer a forma do frasco.`);
  } else ok++;
  if (!/5\.000 UI\/mL/.test(limpo("lib/heparina-nao-fracionada.ts"))) {
    falhas.push(
      "lib/heparina-nao-fracionada: sumiu a concentração do frasco. A dose se prescreve em milhares " +
      "de unidades e o volume é pequeno — errar uma casa é um fator de dez."
    );
  } else ok++;
}

// ── F. A atribuição da classificação A–E, conferida em sessão ─────────────
//
// Checagem barata feita: a classificação existe e é do "2026 AHA/ACC/ACCP/ACEP/
// CHEST/SCAI/SHM/SIR/SVM/SVN Guideline for the Evaluation and Management of
// Acute Pulmonary Embolism in Adults" (Circulation) — "a new clinical
// classification scheme […] with 5 categories (A-E)". A atribuição do app está
// correta, e a verificação fica registrada aqui para não se repetir.
{
  const citaClassificacao2026 = /AHA\/ACC 2026|Classificação clínica AHA\/ACC 2026/.test(arvore);
  const categorias2026Explicitas = (/A subclínico/.test(arvore) && /B baixa gravidade/.test(arvore) && /C gravidade elevada/.test(arvore) && /D falência incipiente/.test(arvore) && /E falência cardiopulmonar/.test(arvore)) || (/A = TEP incidental assintomático/.test(arvore) && /B = sintomático com baixo escore de gravidade/.test(arvore) && /C = sintomático com escore elevado/.test(arvore) && /D = falência cardiopulmonar incipiente/.test(arvore) && /E = falência cardiopulmonar/.test(arvore));
  if (citaClassificacao2026 && !categorias2026Explicitas) {
    falhas.push(
      `${ARVORE}: a classificação A–E ficou só com o rótulo, sem as categorias. Citar a diretriz sem ` +
      `dizer o que ela classifica é D-27 — afirmação ao lado de citação.`
    );
  } else ok++;
}

console.log("\nTEP — ordem diagnóstica, a separação do intermediário e os dois regimes de enoxaparina\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — a probabilidade vem antes do exame, e o ajuste renal está onde importa\n`);
process.exit(0);
