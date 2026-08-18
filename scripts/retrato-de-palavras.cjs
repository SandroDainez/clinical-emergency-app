#!/usr/bin/env node
/**
 * PROMETE: que uma edição que REORGANIZA texto — separar parágrafo em itens,
 *   baixar caixa alta, trocar pontuação, reordenar — não tenha PERDIDO conteúdo.
 *   Compara o multiconjunto de PALAVRAS de um trecho antes e depois, insensível a
 *   caixa, acento e pontuação. Palavra que perde ocorrência é sinalizada.
 *
 * NÃO PROMETE: que o texto continue dizendo a mesma coisa. Trocar «não use» por
 *   «use» mantém as palavras e inverte a conduta; reordenar frases mantém o
 *   conjunto e muda a sequência. ⚠️ Este instrumento NÃO substitui a leitura
 *   clínica, e não tem opinião sobre sentido — só sobre presença.
 *
 * UNIVERSO: o trecho de arquivo que se pede, delimitado por nomes de constante.
 *   Fora disso ele não vê nada.
 *
 * ── ⚠️ SÃO DOIS INSTRUMENTOS, COM PROMESSAS DIFERENTES ──────────────────────
 *
 *   `retrato-de-frases.cjs`   → para MOVER blocos de lugar. A frase é a unidade;
 *                               toda frase que sumir do conjunto tem de ser
 *                               localizada no estado novo. Quebra se a edição
 *                               mudar a pontuação, porque a fronteira da frase é
 *                               a pontuação.
 *
 *   `retrato-de-palavras.cjs` → para SEPARAR e REESCREVER. A palavra é a unidade,
 *                               e a fronteira da frase deixa de importar.
 *
 * O caso que obrigou a criar o segundo (2026-08-18, IRA): cinco parágrafos de até
 * 732 caracteres viraram 44 itens de uma instrução. O retrato de frases acusou
 * «23 sumiram, 37 novas» — todas falsas: eram as mesmas frases com outra
 * fronteira e outra caixa. Sobre a mesma edição, o retrato de PALAVRAS mostrou o
 * que interessava: zero palavras de conteúdo perdidas, e as 12 que caíram eram
 * conectivos («e», «pois bem», «mas», «então») — a cola que some quando o
 * parágrafo vira lista.
 *
 * Uso:
 *   node scripts/retrato-de-palavras.cjs <antes.ts> <depois.ts> [CONST_A,CONST_B]
 */
const fs = require("fs");

const [, , antes, depois, constantes] = process.argv;
if (!antes || !depois) {
  console.log("uso: retrato-de-palavras.cjs <antes> <depois> [CONST_A,CONST_B]");
  process.exit(1);
}

/** Conectivos: somem quando o parágrafo vira lista, e não são conteúdo. */
const COLA = new Set(["e", "que", "pois", "bem", "mas", "entao", "porque", "isto",
  "isso", "ou", "de", "da", "do", "a", "o", "as", "os", "um", "uma", "em", "no", "na"]);

const normaliza = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9≥%/,.]+/gu, " ")
    .split(" ").map((w) => w.replace(/^[.,]+|[.,]+$/g, ""))
    .filter((w) => w && !/^[.,]+$/.test(w));

function trecho(texto, nomes) {
  if (!nomes) return texto;
  let saida = "";
  for (const n of nomes.split(",")) {
    const i = texto.indexOf("export const " + n.trim());
    if (i < 0) continue;
    const j = texto.indexOf("export const", i + 10);
    saida += texto.slice(i, j < 0 ? texto.length : j);
  }
  return saida;
}

const A = normaliza(trecho(fs.readFileSync(antes, "utf8"), constantes));
const D = normaliza(trecho(fs.readFileSync(depois, "utf8"), constantes));

// ⚠️ VACUIDADE (R-15 item 9): trecho vazio aprovaria qualquer coisa.
if (A.length < 20) {
  console.log(`\n❌ só ${A.length} palavras lidas do ANTES — o recorte falhou, e nada foi conferido.\n`);
  process.exit(1);
}

const conta = (a) => a.reduce((m, w) => ((m[w] = (m[w] || 0) + 1), m), {});
const ca = conta(A), cd = conta(D);
const perdidas = Object.entries(ca)
  .filter(([w, n]) => (cd[w] || 0) < n)
  .map(([w, n]) => ({ w, n, agora: cd[w] || 0 }));
const conteudo = perdidas.filter((p) => !COLA.has(p.w));
const cola = perdidas.filter((p) => COLA.has(p.w));

console.log(`\nRetrato de palavras — ${A.length} → ${D.length}\n`);
if (cola.length) {
  console.log(`ℹ️  ${cola.length} conectivo(s) a menos: ` +
    cola.map((p) => `${p.w} ${p.n}→${p.agora}`).join(" · "));
}
if (conteudo.length) {
  console.log(`\n❌ ${conteudo.length} palavra(s) de CONTEÚDO perderam ocorrência:`);
  for (const p of conteudo) console.log(`     ${p.w}  ${p.n} → ${p.agora}`);
  console.log(`\n   ⚠️ Cada uma volta ao texto, ou vai para um lugar DECLARADO. ` +
    `Separar não é cortar.\n`);
  process.exit(1);
}
console.log(`\n✅ nenhuma palavra de conteúdo perdida — a edição reorganizou, não cortou\n`);
process.exit(0);
