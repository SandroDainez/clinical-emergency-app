// Confere se as traduções em espanhol chegaram ao bundle de produção.
//
// O minificador escapa acentos e travessões como \uXXXX de forma irregular, então
// a comparação normaliza os dois lados: desescapa e depois remove acentuação.
const fs = require("fs");
const { lerFonte } = require("./lib/fonte.cjs");
const path = require("path");
const DIST = process.argv[2] || "dist";

let src = "";
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|html|json)$/.test(e.name)) src += fs.readFileSync(p, "utf8");
  }
})(DIST);

// O Metro emite acentos ora como \uXXXX, ora como \xNN — decodificar os dois.
const norm = (s) =>
  s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‐-―]/g, "-");

const hay = norm(src);

// ⚠️ R-21 — AS AMOSTRAS NÃO PODEM CONTER VALOR CLÍNICO.
//
// Este arquivo prova que a tradução chegou ao bundle. Ele NÃO é o lugar de
// guardar medicina. Uma amostra com número vira uma cópia do valor, e quando o
// valor muda esta trava passa a EXIGIR o antigo: o build quebra na correção, com
// uma mensagem sobre bundle, e a leitura natural vira "reverta".
//
// Aconteceu: a amostra era "RASS −1 a −2 — sedación ligera" e sobreviveu à
// unificação do alvo de sedação em RASS −2 a 0.
//
// Escolha frases que DESCREVEM, não que QUANTIFICAM.
const amostra = [
  ["anafilaxia", "Alta solo con autoinyector, entrenamiento práctico"],
  ["anafilaxia", "adrenalina IM inmediata, dos accesos"],
  ["sepse", "escalamiento vasopresor"],
  ["sepse", "Hisopado rectal no indicado para la meningitis"],
  ["ventilação", "Estrategia protectora"],
  ["AVC prescrições", "dieta absoluta hasta el cribado de la deglución"],
  ["AVC NIHSS", "Ataxia clara en un miembro"],
  ["coronárias", "IAMCEST: reperfusión inmediata con angioplastia primaria"],
  ["coronárias", "Trombólisis elegible"],
  ["CAD/EHH", "Anión gap = Na"],
  ["ACLS causas rev.", "El paro cardiorrespiratorio persiste tras ciclos repetidos de RCP"],
  ["ACLS voz", "¿Confirmar el ritmo desfibrilable?"],
  ["ACLS áudio ES", "Reanudar la RCP de inmediato"],
  ["vasoativos", "ahorradora de noradrenalina"],
  ["sedação", "Anestésico disociativo"],
  ["EAP", "Edema agudo de pulmón — resumen"],
  ["eletrólitos", "bolsa preparada de"],
  ["calculadoras", "sedación ligera"],
  ["telas", "Función renal gravemente reducida"],
  ["telas", "Guía activada y compresiones iniciadas"],
  ["paywall", "Suscribir el plan anual"],
  ["paywall", "Guía completa a pie de cama"],
];

// Os preços NÃO são escritos aqui (R-21): são LIDOS de lib/subscription.ts, que
// é a config que os define. Assim esta trava continua provando o que importa —
// que o preço em espanhol chegou ao bundle e que o de português não foi
// atropelado — sem virar uma segunda cópia dos valores.
const subs = lerFonte(path.join(__dirname, "..", "lib", "subscription.ts"));
const bloco = (locale) => {
  const i = subs.indexOf(`"${locale}": {`);
  return i < 0 ? "" : subs.slice(i, subs.indexOf("},", i));
};
const precos = (locale) => [...bloco(locale).matchAll(/:\s*"([^"]+)"/g)].map((m) => m[1]);

const precosEs = precos("es-419");
const precosPt = precos("pt-BR");
if (precosEs.length < 4 || precosPt.length < 4) {
  console.error("\n❌ lib/subscription.ts: não foi possível ler os preços — a conferência de paywall não rodou.\n");
  process.exit(1);
}
for (const p of precosEs) amostra.push(["paywall (de lib/subscription.ts)", p]);
for (const p of precosPt) amostra.push(["preço PT preservado (de lib/subscription.ts)", p]);

let ok = 0;
for (const [mod, s] of amostra) {
  const found = hay.includes(norm(s));
  if (found) ok++;
  console.log(`${found ? "OK   " : "FALTA"}  [${mod}] ${s}`);
}
console.log(`\n${ok}/${amostra.length} presentes no bundle (${(src.length / 1e6).toFixed(1)} MB)`);
process.exit(ok === amostra.length ? 0 : 1);
