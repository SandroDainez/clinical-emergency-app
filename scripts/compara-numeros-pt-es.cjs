#!/usr/bin/env node
/**
 * MEDIÇÃO — não é trava, não corrige nada, não reprova nada.
 *
 * ⚠️ O QUE ELE PERGUNTA: toda dose deste app tem uma SEGUNDA CÓPIA em espanhol,
 * escrita noutro momento, e nada nunca comparou as duas. No catálogo de
 * antimicrobianos, cinco de sete doses em prosa divergiam da estrutura — e
 * aquelas eram duas cópias no MESMO arquivo, da mesma pessoa, na mesma semana.
 * Aqui são dois idiomas. A pergunta não é se divergiram: é quantas.
 *
 * ⚠️ O PAREAMENTO É POR CONSTRUÇÃO: o dicionário é `{ [texto PT]: texto ES }`.
 * Não existe chave órfã — o que pode existir é chave PT sem número, chave cuja
 * tradução repete o português, e chave cujos números não batem.
 *
 * ⚠️ CLASSIFICAÇÃO, em ordem de gravidade:
 *   NUMÉRICA   — os números não batem depois de normalizar. É a lista que importa.
 *   OMISSÃO    — um lado tem número que o outro não tem (dose sumida na tradução
 *                é tão grave quanto dose trocada).
 *   FORMATAÇÃO — mesmos números, grafias diferentes (0,5 × 0.5).
 */
const fs = require("fs"), path = require("path");
const DIR = path.resolve(__dirname, "..", "lib", "i18n", "modules");
const args = process.argv.slice(2);

// ── extração dos pares. Lê o texto: `"pt": "es",` com quebra de linha opcional.
const PAR = /"((?:[^"\\]|\\.)*)"\s*:\s*(?:\n\s*)?"((?:[^"\\]|\\.)*)"\s*,/g;
const pares = [];
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith(".ts"))) {
  const t = fs.readFileSync(path.join(DIR, f), "utf8");
  // fora comentários de bloco e de linha, para não colher exemplo em comentário
  const limpo = t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  for (const m of limpo.matchAll(PAR)) pares.push({ arquivo: f, pt: m[1], es: m[2] });
}

// ── números com unidade colada quando houver
const UNI = "(?:mg\\/kg\\/min|mcg\\/kg\\/min|µg\\/kg\\/min|mg\\/kg\\/h|mL\\/kg\\/h|mg\\/kg|mcg\\/kg|µg\\/kg|UI\\/kg|mL\\/kg|mEq\\/L|mmol\\/L|mL\\/min|mg\\/dL|mmHg|mg|mcg|µg|kg|UI|mL|mEq|mmol|min|h|dias|d|%|°C|g|L)?";
const NUM = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${UNI}`, "gi");
// grafias equivalentes entre os idiomas que NÃO são divergência de número
const SINONIMO = { dias: "d", días: "d", d: "d", h: "h", hs: "h", min: "min", "°c": "°c" };
/**
 * ⚠️ O QUE NÃO É QUANTIDADE, e por que sai da conta.
 *
 * A primeira rodada acusou 103 omissões, e as primeiras eram «SpO2 × SpO₂»:
 * o "2" de um rótulo de gás lido como número, e o subscrito do espanhol não
 * casando com o algarismo do português. Isso não é dose sumida — é o meu regex
 * vendo quantidade onde há NOME DE ANALITO. Ficam de fora os rótulos abaixo, e
 * o subscrito passa a valer como algarismo. Nenhum deles é dose, intervalo,
 * limiar ou tempo: se um dia virar, a linha some daqui.
 */
const ANALITOS = /\b(?:S(?:p|at|a)?O|ET ?CO|Pa?CO|Pa?O|FiO|HCO|H|N|CO|O)(?:\d|[₀-₉])\b/gi;
const SUBSCRITO = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
function numeros(s) {
  s = s.replace(/[₀-₉]/g, (c) => SUBSCRITO[c]).replace(ANALITOS, " ");
  // ⚠️ NOTAÇÃO DE INTERVALO: o português escreve «8/8h» (o algarismo duas vezes)
  // e o espanhol «cada 8 h» (uma). Sem isto, TODO antimicrobiano do app aparece
  // como "dose omitida na tradução" — 46 dos 88 achados da primeira rodada eram
  // isto. É a mesma espécie de «0,5 × 0.5»: convenção, não divergência.
  s = s.replace(/(\d+)\s*\/\s*\1\s*h/gi, "cada $1 h");
  const out = [];
  for (const m of s.matchAll(NUM)) {
    const v = parseFloat(m[1].replace(",", "."));
    let u = (m[2] ?? "").toLowerCase();
    u = SINONIMO[u] ?? u;
    out.push({ v, u, cru: m[0].trim() });
  }
  return out;
}
const chave = (n) => `${n.v}${n.u}`;
const multiset = (ns) => { const m = new Map(); for (const n of ns) m.set(chave(n), (m.get(chave(n)) ?? 0) + 1); return m; };
function compara(a, b) {
  const A = multiset(a), B = multiset(b);
  const soA = [], soB = [];
  for (const [k, q] of A) { const d = q - (B.get(k) ?? 0); for (let i = 0; i < d; i++) soA.push(k); }
  for (const [k, q] of B) { const d = q - (A.get(k) ?? 0); for (let i = 0; i < d; i++) soB.push(k); }
  return { soA, soB };
}

const comNumero = pares.filter((p) => numeros(p.pt).length || numeros(p.es).length);
const listas = { numerica: [], omissao: [], formatacao: [] };
for (const p of comNumero) {
  const a = numeros(p.pt), b = numeros(p.es);
  const { soA, soB } = compara(a, b);
  if (!soA.length && !soB.length) {
    // mesmos valores+unidades: só grafia pode diferir
    const cruA = a.map((x) => x.cru).join("|"), cruB = b.map((x) => x.cru).join("|");
    if (cruA !== cruB) listas.formatacao.push({ ...p, soA, soB, cruA, cruB });
    continue;
  }
  // ⚠️ SÓ DE UM LADO = OMISSÃO. Dos DOIS lados = valor trocado.
  (soA.length && soB.length ? listas.numerica : listas.omissao).push({ ...p, soA, soB });
}

const corta = (s, n = 96) => (s.length > n ? s.slice(0, n) + "…" : s);
console.log(`\nUNIVERSO (R-101): ${fs.readdirSync(DIR).filter((f) => f.endsWith(".ts")).length} dicionários · ${pares.length} pares PT→ES lidos · ${comNumero.length} com número em algum dos lados`);
console.log(`  ⚠️ O pareamento é por construção (a chave É o texto PT): 0 chaves órfãs, 0 só num idioma.\n`);
console.log(`RESULTADO: ${listas.numerica.length} numérica(s) · ${listas.omissao.length} omissão(ões) · ${listas.formatacao.length} formatação\n`);

for (const [rotulo, lista] of [["NUMÉRICA — os números não batem", listas.numerica], ["OMISSÃO — número só de um lado", listas.omissao], ["FORMATAÇÃO — mesmos números, outra grafia", listas.formatacao]]) {
  console.log(`\n════ ${rotulo} (${lista.length}) ════`);
  if (!lista.length) { console.log("   (vazia)"); continue; }
  const limite = args.includes("--tudo") ? lista.length : (rotulo.startsWith("NUMÉRICA") || rotulo.startsWith("OMISSÃO") ? lista.length : 12);
  for (const i of lista.slice(0, limite)) {
    console.log(`\n  ${i.arquivo}`);
    console.log(`    PT: ${corta(i.pt)}`);
    console.log(`    ES: ${corta(i.es)}`);
    if (i.soA.length || i.soB.length) console.log(`    → só no PT: [${i.soA.join(", ")}]   só no ES: [${i.soB.join(", ")}]`);
    else console.log(`    → grafia: PT «${i.cruA}» × ES «${i.cruB}»`);
  }
  if (limite < lista.length) console.log(`\n  … e mais ${lista.length - limite} (rode com --tudo)`);
}
console.log("\n⚠️ MEDIÇÃO: sem código de saída. Divergência de dose é decisão clínica do autor, não conserto de tradução.\n");
