/**
 * valida-osmolaridade.cjs — o divisor da ureia e a efetiva × total
 *
 * PROMETE: que a ÚNICA implementação viva do cálculo de osmolaridade — a
 *   calculadora `osmolalidade` em clinical-calculators-engine.ts — use o
 *   divisor 6 (ureia total) e não 2,8 (BUN); que separe osmolalidade TOTAL de
 *   EFETIVA; e que os avisos de texto sobre as duas armadilhas continuem na
 *   árvore viva do CAD/EHH.
 * NÃO PROMETE: que as FAIXAS de interpretação da calculadora estejam alinhadas
 *   ao consenso 2024 (ver ⚠️ abaixo — há divergência aberta), nem que a árvore
 *   do CAD/EHH calcule osmolaridade: ela NÃO calcula, por decisão declarada
 *   (PD-3), e escreve a fórmula para o médico aplicar.
 * UNIVERSO: clinical-calculators-engine.ts e dka-hhs-decision-tree.ts.
 *
 * ── POR QUE ESTA TRAVA MUDOU DE ALVO (14/ago) ───────────────────────────────
 *
 * Ela travava `dka-hhs-engine.ts` — que é CÓDIGO MORTO desde 07/jun (D-22).
 * Protegia um cálculo que a tela nunca executou, e do lado vivo só conferia
 * que a FRASE da fórmula existia. Terceira trava da auditoria validando código
 * inalcançável, junto com test:avc e test:coronary (D-25).
 *
 * Agora aponta para onde o cálculo vive de verdade: a calculadora clínica. A
 * proteção passa a cobrir código que chega ao usuário — que era o ponto.
 *
 * ⚠️ DIVERGÊNCIA ABERTA, NÃO TRAVADA: as faixas de interpretação da
 * calculadora tratam efetiva ≤ 320 como "hiperosmolalidade leve" e só sugerem
 * EHH acima de 320. O consenso ADA/EASD 2024 (Diabetes Care 47:1257, Fig. 2B)
 * usa efetiva > 300 como critério de EHH — 320 é o limiar da TOTAL. É o mesmo
 * defeito corrigido na árvore em 14/ago, sobrevivendo aqui. Não travado ainda
 * porque mudar faixa de interpretação é mudança de recomendação e precisa de
 * decisão registrada.
 */


const fs = require("node:fs");
const path = require("node:path");
const appDir = path.resolve(__dirname, "..");

const falhas = [];
let ok = 0;

// ── A. Os divisores, derivados da massa molar ───────────────────────────────
//
// mg/dL → mmol/L: (mg/dL × 10) ÷ MM = mg/dL ÷ (MM/10).
const MM = { glicose: 180.16, ureia: 60.06, nitrogenioUreico: 28.01 };
const DIVISORES = {
  glicose: MM.glicose / 10,           // ≈ 18,0
  ureia: MM.ureia / 10,               // ≈ 6,0
  nitrogenioUreico: MM.nitrogenioUreico / 10, // ≈ 2,8  ← o do BUN
};
for (const [nome, esperado, usado] of [
  ["glicose", 18, DIVISORES.glicose],
  ["ureia", 6, DIVISORES.ureia],
  ["BUN", 2.8, DIVISORES.nitrogenioUreico],
]) {
  if (Math.abs(esperado - usado) > 0.05) {
    falhas.push(`a derivação de referência falhou para ${nome}: massa molar dá ${usado.toFixed(2)}, e a trava esperava ${esperado}.`);
  } else ok++;
}
// E a razão entre eles é o tamanho do erro que este script existe para impedir.
const razao = DIVISORES.ureia / DIVISORES.nitrogenioUreico;
if (Math.abs(razao - 2.14) > 0.02) {
  falhas.push(`a razão ureia/BUN deu ${razao.toFixed(3)}, e o app documenta ~2,14×.`);
} else ok++;

// ── B. Quem CALCULA osmolaridade usa o divisor da UREIA ─────────────────────
//
// R-15 item 1: comentários fora. Este repositório passou a documentar o próprio
// defeito, e os comentários citam "2,8" e "BUN" de propósito.
const limpar = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

// O RECORTE é por arquivo, porque a forma do cálculo difere: o motor da CAD usa
// funções nomeadas; as Calculadoras computam inline dentro do bloco da
// ferramenta `id: "osmolalidade"`. Recortar errado faz a regra não achar nada e
// — na primeira versão — acusar o arquivo certo por engano.
const CALCULAM = [
  ["clinical-calculators-engine.ts", /2 \* na \+ glic \/ 18/, /id: "osmolalidade"[\s\S]*?\n  \},/g],
  ["clinical-calculators-engine.ts", /2 \* na \+ glic \/ 18/, /id: "osmolalidade"[\s\S]*?\n  \},/g],
];
for (const [rel, reBase, reRecorte] of CALCULAM) {
  const t = limpar(fs.readFileSync(path.join(appDir, rel), "utf8"));
  if (!reBase.test(t)) {
    falhas.push(`${rel}: a base da osmolaridade (2×Na + glicose/18) mudou de forma — a conferência cegou.`);
    continue;
  }
  ok++;
  // O divisor do BUN não pode aparecer DENTRO das funções de osmolaridade.
  //
  // A primeira versão filtrava LINHAS que contivessem "2 * na" ou "osm" — e a
  // linha do defeito original é `o += ureiaMgDl / 2.8;`, que não contém nem um
  // nem outro. A mutação que reintroduzia o defeito passava verde. Agora o
  // recorte é o CORPO DA FUNÇÃO inteira, não uma heurística de linha.
  const trechos = [...t.matchAll(reRecorte)].map((m) => m[0]);
  if (!trechos.length) {
    falhas.push(`${rel}: o trecho que calcula osmolaridade não foi encontrado — a conferência do divisor não rodou.`);
  } else ok++;
  for (const fn of trechos) {
    if (/\/\s*2\.8\b/.test(fn)) {
      const linha = fn.split("\n").find((l) => /\/\s*2\.8\b/.test(l)) || "";
      falhas.push(
        `${rel}: uma função de osmolaridade usa o divisor 2,8 (BUN) — «${linha.trim().slice(0, 70)}». ` +
        `O campo do app pede UREIA, e o divisor da ureia é 6. Erro de ~2,14× nesse termo.`
      );
    } else ok++;
  }
  if (!/\/\s*6\b/.test(t)) {
    falhas.push(`${rel}: não usa o divisor 6 (ureia) em lugar nenhum — a osmolaridade total perdeu o termo da ureia.`);
  } else ok++;
}

// ── C. TOTAL e EFETIVA existem e são DIFERENTES ─────────────────────────────
//
// A efetiva é definida por EXCLUIR a ureia — é o que a torna tonicidade. Se as
// duas linhas ficarem iguais, a distinção some sem erro de compilação.
{
  const t = fs.readFileSync(path.join(appDir, "clinical-calculators-engine.ts"), "utf8");
  const bloco = t.match(/id: "osmolalidade"[\s\S]*?\n  \},/);
  if (!bloco) {
    falhas.push("clinical-calculators-engine: a calculadora de osmolalidade sumiu — é a ÚNICA implementação viva do cálculo.");
  } else {
    ok++;
    const total = bloco[0].match(/const calc\s*=\s*([^;]+);/);
    const efet = bloco[0].match(/const efetiva\s*=\s*([^;]+);/);
    if (!total || !efet) {
      falhas.push("clinical-calculators-engine: sumiu a osmolalidade TOTAL ou a EFETIVA — as duas precisam existir e ser distintas.");
    } else if (total[1].trim() === efet[1].trim()) {
      falhas.push("clinical-calculators-engine: TOTAL e EFETIVA ficaram idênticas — a distinção que evita superdiagnóstico de EHH desapareceu.");
    } else if (/ureia/i.test(efet[1])) {
      falhas.push(
        `clinical-calculators-engine: a osmolalidade EFETIVA voltou a incluir ureia — «${efet[1].trim()}». ` +
        `A ureia é osmol ineficaz: incluí-la deixa de medir tonicidade e SUPERDIAGNOSTICA EHH.`
      );
    } else if (!/ureia/i.test(total[1])) {
      falhas.push(`clinical-calculators-engine: a osmolalidade TOTAL deixou de incluir ureia — «${total[1].trim()}».`);
    } else ok++;
  }
}

// ── D. O rótulo do campo diz UREIA, não BUN ─────────────────────────────────
//
// A confusão ureia × BUN produziu o erro de 2,14×. A desambiguação existia
// APENAS no engine morto até 14/ago — ou seja, nunca chegou a quem digita o
// número. Agora está na calculadora, que é onde o valor entra.
{
  const t = fs.readFileSync(path.join(appDir, "clinical-calculators-engine.ts"), "utf8");
  if (!/Ureia — não BUN/.test(t)) {
    falhas.push(
      "clinical-calculators-engine: o campo de ureia não distingue UREIA de BUN. Quem informar BUN reintroduz " +
      "o erro de 2,14× pelo lado do usuário — e a trava do código não vê, porque o cálculo está certo."
    );
  } else ok++;
}

// ── D2. Os DOIS limiares vêm da fonte única, e ninguém os escreve à mão ─────
//
// R-12: o par 300/320 vive em três lugares (árvore, calculadora, texto que
// ensina a fórmula). A divergência JÁ aconteceu — os dois primeiros usavam 320
// para a EFETIVA, que é o limiar da TOTAL. A trava agora vigia o par.
{
  const fonte = fs.readFileSync(path.join(appDir, "lib/osmolalidade.ts"), "utf8");
  // Referência EXTERNA (Diabetes Care 2024;47:1257, Fig. 2B), escrita aqui de
  // propósito: se viesse do app, a conferência giraria em falso (R-21).
  if (!/OSM_EFETIVA_EHH\s*=\s*300\b/.test(fonte)) {
    falhas.push("lib/osmolalidade.ts: o limiar da EFETIVA não é 300. O consenso 2024 (Fig. 2B) usa efetiva > 300; 320 é o da TOTAL.");
  } else ok++;
  if (!/OSM_TOTAL_EHH\s*=\s*320\b/.test(fonte)) {
    falhas.push("lib/osmolalidade.ts: o limiar da TOTAL não é 320.");
  } else ok++;

  // A calculadora NÃO pode reescrever o número: tem de consumir a constante.
  const calc = fs.readFileSync(path.join(appDir, "clinical-calculators-engine.ts"), "utf8");
  const bloco = (calc.match(/id: "osmolalidade"[\s\S]*?\n  \},/) || [""])[0];
  if (!/OSM_EFETIVA_EHH/.test(bloco)) {
    falhas.push(
      "clinical-calculators-engine: a faixa de osmolalidade não consome OSM_EFETIVA_EHH — número escrito à mão " +
      "é a divergência nascendo de novo (R-12). Foi exatamente assim que 320 virou limiar da EFETIVA."
    );
  } else ok++;
  if (/efetiva\s*<=\s*320/.test(bloco)) {
    falhas.push("clinical-calculators-engine: a faixa voltou a usar 320 sobre a EFETIVA — subdiagnostica EHH.");
  } else ok++;

  // A árvore consome o texto que explica os dois — não o reescreve.
  const arv = fs.readFileSync(path.join(appDir, "dka-hhs-decision-tree.ts"), "utf8");
  if (!/OSM_EFETIVA_VS_TOTAL/.test(arv)) {
    falhas.push("dka-hhs-decision-tree: parou de consumir OSM_EFETIVA_VS_TOTAL — a explicação dos dois limiares voltou a ser cópia.");
  } else ok++;
  // ⚠️ SÓ EM CÓDIGO, NÃO EM COMENTÁRIO: o comentário que DOCUMENTA o erro
  // corrigido cita "efetiva > 320" de propósito, e acusá-lo faria a trava
  // proibir a própria explicação do defeito (R-21/R-15).
  const arvSemComentario = arv.split("\n").filter((l) => !/^\s*(\/\/|\*)/.test(l)).join("\n");
  if (/efetiva\s*>\s*320|EFETIVA > 320/i.test(arvSemComentario)) {
    falhas.push("dka-hhs-decision-tree: reapareceu 'efetiva > 320' — é o limiar da TOTAL.");
  } else ok++;
}

// ── E. Os módulos que ENSINAM a fórmula continuam ensinando a certa ─────────
//
// Quatro lugares já estavam certos quando o motor estava errado (R-18). Se um
// deles regredir, some o indício que levou ao achado.
const ENSINAM = [
  ["tce-decision-tree.ts", /ureia\/6/, "o gap osmolar do manitol"],
  ["poisoning-decision-tree.ts", /ureia\/6/, "o gap osmolar do álcool tóxico"],
  ["dka-hhs-decision-tree.ts", /osmolalidade efetiva = 2 × Na/, "o critério de EHH"],
];
for (const [rel, re, oque] of ENSINAM) {
  const t = limpar(fs.readFileSync(path.join(appDir, rel), "utf8"));
  if (!re.test(t)) {
    falhas.push(`${rel}: ${oque} deixou de ensinar a fórmula correta.`);
  } else ok++;
}

console.log("\nOsmolaridade calculada — divisor da ureia e critério pela efetiva\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log("");
} else {
  console.log(`✅ ${ok} verificações — divisores derivados da massa molar, EHH pela efetiva, rótulo distinguindo ureia de BUN\n`);
}
process.exit(falhas.length ? 1 : 0);
