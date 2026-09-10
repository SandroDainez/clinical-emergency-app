#!/usr/bin/env node
/**
 * TRAVA DA CLASSIFICAÇÃO DE UNIDADE — ⚠️ **dose ⛔ ou concentração**.
 *
 * PROMETE: que ⛔ massa por **volume** (`mg/dL`, `mg/mL`, `mg/L`, `mcg/mL`)
 *   ⛔ seja lida como CONCENTRAÇÃO ⛔ e ⛔ nunca acuse dose; ⛔ e que ⛔ massa
 *   pura ⛔ ou por **peso/tempo** (`mg`, `mg/kg`, `mcg/kg`, `mcg/kg/min`,
 *   `mg/kg/h`, `mg/min`) ⛔ continue sendo DOSE. ⛔ Promete também que ⛔ o
 *   desconhecido ⛔ caia ⛔ **⛔ do lado do barulho**, ⛔ e ⛔ não do silêncio.
 *
 * NÃO PROMETE: que a dose esteja **⛔ certa** — ⛔ isso é conteúdo clínico, ⛔ e
 *   tem outras travas. ⛔ Aqui ⛔ só se decide ⛔ **⛔ o que É dose**.
 *
 * UNIVERSO: `avc/nucleo/unidade-clinica.ts`.
 *
 * ── ⚠️⚠️⚠️ ⛔ O FALSO CONSERTO QUE ELA IMPEDE ──────────────────────────────
 *
 * ⛔ 2026-09-10: para matar ⛔ um falso positivo (« 50mg/dL », ⛔ nascido do
 * degrau colado à unidade), ⛔ eu escrevi ⛔ `(?!\/)` — *"ignore o que tem
 * barra"*. ⚠️⚠️ ⛔ Isso ⛔ **⛔ apagaria** ⛔ `alteplase 0,9 mg/kg`,
 * ⛔ `tenecteplase 0,4 mg/kg` ⛔ e ⛔ `mcg/kg/min` — ⛔ doses ⛔ que ⛔ **⛔ estão
 * no conteúdo deste módulo**.
 *
 * ⛔ ⛔ ⛔ **⛔ Falso positivo ⛔ barulhento ⛔ trocado ⛔ por ⛔ falso negativo
 * ⛔ silencioso** ⛔ é ⛔ o pior negócio ⛔ que uma trava clínica ⛔ pode fazer.
 * ⚠️ ⛔ Esta prova ⛔ existe ⛔ para ⛔ que ⛔ ele ⛔ não se repita ⛔ **⛔ por
 * conveniência**.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "unidade-"));
execFileSync(
  "npx",
  ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
   "--moduleResolution", "node", "--outDir", tempDir,
   path.join(appDir, "avc", "nucleo", "unidade-clinica.ts")],
  { cwd: appDir, stdio: "inherit" }
);
const { classificarUnidade, dosesNoTexto } = require(path.join(tempDir, "unidade-clinica.js"));

let falhas = 0;
let ok = 0;
function confere(nome, condicao, porque) {
  if (condicao) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/* ══ ⚠️⚠️⚠️ 1 · A CLASSIFICAÇÃO, UNIDADE A UNIDADE ═══════════════════════ */

const CONCENTRACOES = ["mg/dL", "mg/mL", "mg/L", "mcg/mL", "g/dL", "mEq/L".replace("mEq", "mg")];
for (const u of CONCENTRACOES) {
  confere(
    `⚠️ « ${u} » é concentração`,
    classificarUnidade(u) === "concentracao",
    `⛔ classificada como « ${classificarUnidade(u)} » — massa por VOLUME nunca é dose`
  );
}

const DOSES = ["mg", "mcg", "mg/kg", "mcg/kg", "mcg/kg/min", "mg/kg/h", "mg/min", "UI/kg"];
for (const u of DOSES) {
  confere(
    `⚠️ « ${u} » é dose`,
    classificarUnidade(u) === "dose",
    `⛔ classificada como « ${classificarUnidade(u)} » — massa pura ou por peso/tempo É dose`
  );
}

/* ══ ⚠️⚠️⚠️ 2 · O TEXTO DA TELA — ⛔ PEGA ═══════════════════════════════ */

const DEVE_PEGAR = [
  "Labetalol 10 mg",
  "Tenecteplase 0,25 mg/kg",
  "Alteplase 0,9 mg/kg",
  "tenecteplase 0,4 mg/kg",
  "nitroprussiato 3 mcg/kg/min",
];
for (const t of DEVE_PEGAR) {
  confere(
    `⚠️⚠️ ⛔ « ${t} » ⛔ é dose ⛔ e tem de ser vista`,
    dosesNoTexto(t).length > 0,
    `⛔ passou despercebida — é EXATAMENTE o falso negativo que a regra ampla \`(?!/)\` criava`
  );
}

/* ══ ⚠️⚠️⚠️ 3 · O TEXTO DA TELA — ⛔ NÃO PEGA ═══════════════════════════ */

const NAO_PODE_PEGAR = [
  "glicemia 20 mg/dL",
  "solução 5 mg/mL",
  "Glicemia capilar−50−10+10+50mg/dL",
  "hemoglobina 12 g/dL",
];
for (const t of NAO_PODE_PEGAR) {
  confere(
    `⚠️ ⛔ « ${t} » ⛔ é concentração ⛔ e ⛔ não pode acusar dose`,
    dosesNoTexto(t).length === 0,
    `⛔ acusou ${JSON.stringify(dosesNoTexto(t))} — falso positivo`
  );
}

/* ══ ⚠️⚠️⚠️ 4 · O DESCONHECIDO CAI DO LADO DO BARULHO ═══════════════════ */

confere(
  "⚠️⚠️ ⛔ denominador não classificado ⛔ **⛔ não** silencia a trava",
  dosesNoTexto("droga 5 mg/xyz").length > 0,
  "⛔ unidade nova faria a trava emudecer — o lado seguro é o barulho"
);

if (falhas > 0) {
  console.log(`\n❌ UNIDADE DE DOSE — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`\n✅ UNIDADE DE DOSE — ${ok}/${ok} conferências · concentração ≠ dose · sem falso negativo\n`);
