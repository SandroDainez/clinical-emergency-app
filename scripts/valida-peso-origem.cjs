/**
 *
 * PROMETE: todo módulo com dose peso-dependente exibe a ressalva quando o peso é estimado, e a ressalva mede EFEITO e não grafia (R-10).
 * NÃO PROMETE: que o peso informado esteja certo — só que a incerteza dele seja declarada onde a dose depende dela.
 * UNIVERSO: os 9 módulos que recebem peso pelo contexto do paciente.

 * Peso estimado: quem pergunta de onde veio o peso tem de usar a resposta.
 *
 * ── O DEFEITO QUE ORIGINOU ESTE SCRIPT ───────────────────────────────────────
 *
 * `pesoOrigem` era perguntado em NOVE módulos e lido por NENHUM. Nove perguntas
 * ao médico, em emergência, para um dado que nenhuma linha de código consumia —
 * atrito puro no exato lugar onde o app promete reduzir atrito.
 *
 * E os nove calculam dose por peso: alteplase, tenecteplase, insulina,
 * heparina, manitol, salina hipertônica, cristaloide, sedativos, bloqueadores.
 * O erro do peso passa integralmente para a dose, e em vários há teto absoluto.
 *
 * ── O QUE ESTE SCRIPT COBRA ──────────────────────────────────────────────────
 *
 *   A. Árvore que coleta `peso` também coleta `pesoOrigem`. Dose por peso sem
 *      saber a procedência do peso é dose sem ressalva possível.
 *   B. `pesoOrigem` só oferece valores do domínio fechado (estimado/real).
 *   C. O shell renderiza a ressalva — sem isso, os nove voltam a perguntar por
 *      nada.
 *   D. Os quatro módulos com TETO de dose repetem a ressalva na linha da dose.
 *
 * Este script FALHA O BUILD.
 */

const fs = require("node:fs");
const path = require("node:path");
const appDir = path.resolve(__dirname, "..");

const falhas = [];
let ok = 0;

const ORIGENS = ["estimado", "real"];
const arvores = fs.readdirSync(appDir).filter((f) => /-decision-tree\.ts$/.test(f));

let comPeso = 0;
for (const f of arvores) {
  const texto = fs.readFileSync(path.join(appDir, f), "utf8");
  const coletaPeso = /id:\s*"peso"/.test(texto);
  if (!coletaPeso) continue;
  comPeso++;

  // ── A. quem coleta peso coleta a procedência ──────────────────────────────
  if (!/id:\s*"pesoOrigem"/.test(texto)) {
    falhas.push(
      `${f} coleta "peso" e NÃO coleta "pesoOrigem" — a dose por peso fica sem ressalva ` +
      `possível, e o app não tem como avisar que o número repousa sobre peso não aferido.`
    );
    continue;
  }
  ok++;

  // ── B. domínio fechado ────────────────────────────────────────────────────
  const bloco = texto.match(/id:\s*"pesoOrigem"[\s\S]{0,1200}?presets:\s*\[([\s\S]{0,400}?)\]/);
  if (!bloco) {
    falhas.push(`${f}: campo "pesoOrigem" sem presets legíveis — a conferência do domínio não rodou.`);
    continue;
  }
  const valores = [...bloco[1].matchAll(/value:\s*"([^"]*)"/g)].map((m) => m[1]);
  const fora = valores.filter((v) => !ORIGENS.includes(v));
  if (fora.length) {
    falhas.push(`${f}: "pesoOrigem" oferece ${fora.map((v) => `"${v}"`).join(", ")} — fora do domínio ${ORIGENS.join("/")}.`);
  } else if (!valores.length) {
    falhas.push(`${f}: "pesoOrigem" sem nenhum valor.`);
  } else ok++;
}

// Zero achados significaria varredura cega, não app limpo.
if (comPeso < 8) {
  falhas.push(`só ${comPeso} árvore(s) coletam "peso" — a varredura provavelmente parou de enxergar os arquivos (são 9).`);
} else ok++;

// ── C. o shell renderiza a ressalva ─────────────────────────────────────────
const SHELL = path.join(appDir, "components/protocol-screen/acls-decision-flow-screen.tsx");
const shell = fs.readFileSync(SHELL, "utf8");
if (!/PESO_NAO_AFERIDO/.test(shell) || !/normalizarOrigemDePeso/.test(shell)) {
  falhas.push(
    `acls-decision-flow-screen.tsx não renderiza a ressalva de peso não aferido — ` +
    `sem ela, os nove módulos voltam a perguntar "pesoOrigem" para nada.`
  );
} else ok++;

// ── D. os quatro com TETO repetem na linha da dose ──────────────────────────
const COM_TETO = {
  "avc-decision-tree.ts": "alteplase 90 mg / TNK 25 mg",
  "coronary-decision-tree.ts": "enoxaparina 100 mg nas 2 primeiras doses",
  "tep-decision-tree.ts": "HNF 10.000 U no bólus",
  "dka-hhs-decision-tree.ts": "insulina titulada por kg",
};
for (const [arq, teto] of Object.entries(COM_TETO)) {
  const t = fs.readFileSync(path.join(appDir, arq), "utf8");
  if (!/\{avisoPeso\}/.test(t)) {
    falhas.push(`${arq} tem dose com teto (${teto}) e não repete a ressalva na linha da dose.`);
  } else if (!/avisoDePeso\(values\.pesoOrigem\)/.test(t)) {
    falhas.push(`${arq} usa {avisoPeso} sem derivá-lo de \`avisoDePeso(values.pesoOrigem)\` — token que nunca é preenchido.`);
  } else ok++;
}

console.log("\nPeso não aferido — a procedência do peso qualifica a dose\n");
console.log(`   ${comPeso} árvore(s) coletam peso · ${Object.keys(COM_TETO).length} com teto de dose reforçam na linha\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log("");
} else {
  console.log(`✅ ${ok} verificações — nenhuma pergunta órfã, domínio fechado, ressalva renderizada\n`);
}
process.exit(falhas.length ? 1 : 0);
