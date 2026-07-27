// Confere se as traduções em espanhol chegaram ao bundle de produção.
//
// O minificador escapa acentos e travessões como \uXXXX de forma irregular, então
// a comparação normaliza os dois lados: desescapa e depois remove acentuação.
const fs = require("fs");
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

const amostra = [
  ["anafilaxia", "Alta solo con autoinyector, entrenamiento práctico"],
  ["anafilaxia", "adrenalina IM inmediata, dos accesos"],
  ["sepse", "escalamiento vasopresor"],
  ["sepse", "Hisopado rectal no indicado para la meningitis"],
  ["ventilação", "Estrategia protectora: volumen corriente de 6 mL/kg de peso predicho"],
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
  ["eletrólitos", "bolsa preparada de NaCl al 3%"],
  ["calculadoras", "RASS −1 a −2 — sedación ligera"],
  ["telas", "Función renal gravemente reducida"],
  ["telas", "Guía activada y compresiones iniciadas"],
  ["paywall", "Suscribir el plan anual"],
  ["paywall", "US$ 5,99/mes"],
  ["paywall", "US$ 39,99/año"],
  ["paywall", "US$ 3,33/mes"],
  ["paywall", "44% de descuento"],
  ["paywall", "Guía completa a pie de cama"],
  ["preço PT preservado", "R$ 29,90/mês"],
];

let ok = 0;
for (const [mod, s] of amostra) {
  const found = hay.includes(norm(s));
  if (found) ok++;
  console.log(`${found ? "OK   " : "FALTA"}  [${mod}] ${s}`);
}
console.log(`\n${ok}/${amostra.length} presentes no bundle (${(src.length / 1e6).toFixed(1)} MB)`);
process.exit(ok === amostra.length ? 0 : 1);
