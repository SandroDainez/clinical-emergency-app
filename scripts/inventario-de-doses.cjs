/**
 * Inventário de TODA dose e todo volume escritos no app.
 *
 * O pedido foi claro: "tem que verificar tudo onde se fala em doses e volumes a
 * infundir, isso não pode ter erros, tem que seguir o que realmente existe em
 * protocolos e diretrizes reconhecidas".
 *
 * Isso é conferência humana contra fonte primária, uma a uma — não há script que
 * faça. O que o script faz é tornar a tarefa FINITA e rastreável: lista cada
 * número prescrito, com arquivo e linha, agrupado por fármaco. Sem a lista, a
 * verificação é infinita e ninguém sabe o que já foi olhado.
 *
 * A coluna que importa é a última: FONTE. Uma dose com diretriz e ano escritos
 * ao lado já foi conferida por alguém e é reconferível. Uma dose sem fonte pode
 * estar certa — mas ninguém consegue saber sem refazer a busca do zero.
 *
 * Foi assim que a CAD apareceu: o app trazia "15–20 mL/kg/h na 1ª hora", que é o
 * consenso ADA de 2009. O de 2024 mudou para 500–1.000 mL/h em 2–4 h,
 * explicitamente MAIS conservador. O número não estava inventado; estava velho.
 * Sem inventário, envelhecer em silêncio é o destino de qualquer dose.
 */
const fs = require("node:fs");
const path = require("node:path");
const appDir = path.resolve(__dirname, "..");

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|lib\/i18n|e2e|scripts|auditoria|locales/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name) && !/ \d\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}
function literais(t) {
  const out = []; let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (c === "/" && t[i+1] === "/") { i = t.indexOf("\n", i); if (i < 0) break; continue; }
    if (c === "/" && t[i+1] === "*") { const f = t.indexOf("*/", i+2); i = f < 0 ? t.length : f+2; continue; }
    if (c === '"' || c === "'" || c === "`") {
      let j = i+1, s = "";
      while (j < t.length) {
        if (t[j] === "\\") { s += t[j+1] === '"' ? '"' : t[j] + (t[j+1]||""); j += 2; continue; }
        if (t[j] === c) break;
        if (t[j] === "\n" && c !== "`") { j = -1; break; }
        s += t[j]; j++;
      }
      if (j < 0 || j >= t.length) { i++; continue; }
      if (s.length >= 15) out.push({ frase: s, pos: i });
      i = j+1; continue;
    }
    i++;
  }
  return out;
}

const FARMACOS = require("./_farmacos.json");
const RE_FARMACO = new RegExp(`\\b(${FARMACOS.join("|")})\\b`, "i");
const RE_DOSE = /\b\d+(?:[,.]\d+)?\s*(?:[–-]\s*\d+(?:[,.]\d+)?\s*)?(mg|g|mcg|µg|mL|L|U|UI|mEq|mmol|J)\b|\b\d+(?:[,.]\d+)?\s*(mg|mcg|mL|U|g)\/(kg|min|h|kg\/min|kg\/h)\b/i;
const RE_FONTE = /\b(AHA|ACLS|SSC|ADA|EASD|ERC|ESC|ACOG|FEBRASGO|ANZCOR|WAO|ATLS|SBC|AMIB|bula|VASST|Magpie|consenso|diretriz)\b|\b20\d\d\b/i;

const porFarmaco = new Map();
for (const arq of fontes(appDir)) {
  const texto = fs.readFileSync(arq, "utf8");
  const rel = path.relative(appDir, arq);
  for (const { frase, pos } of literais(texto)) {
    const mf = frase.match(RE_FARMACO);
    if (!mf || !RE_DOSE.test(frase)) continue;
    const nome = mf[1].toLowerCase();
    const linha = texto.slice(0, pos).split("\n").length;
    if (!porFarmaco.has(nome)) porFarmaco.set(nome, []);
    porFarmaco.get(nome).push({ rel, linha, frase, comFonte: RE_FONTE.test(frase) });
  }
}

const lista = [...porFarmaco].sort((a, b) => b[1].length - a[1].length);
let total = 0, semFonte = 0;
console.log("\n════ INVENTÁRIO DE DOSES ════\n");
console.log("fármaco".padEnd(22) + "doses".padStart(6) + "  sem fonte");
console.log("─".repeat(44));
for (const [nome, itens] of lista) {
  const sf = itens.filter((i) => !i.comFonte).length;
  total += itens.length; semFonte += sf;
  console.log(nome.padEnd(22) + String(itens.length).padStart(6) + "  " + (sf ? String(sf) : "—"));
}
console.log("─".repeat(44));
console.log(`${lista.length} fármacos · ${total} frases com dose · ${semFonte} sem fonte declarada\n`);
if (process.argv[2]) {
  const alvo = process.argv[2].toLowerCase();
  console.log(`── ${alvo} ──`);
  for (const i of porFarmaco.get(alvo) || []) {
    console.log(`${i.comFonte ? "✓" : "?"} ${i.rel}:${i.linha}\n   ${i.frase.slice(0, 160)}\n`);
  }
}
