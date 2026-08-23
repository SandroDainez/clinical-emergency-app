#!/usr/bin/env node
/**
 * O MÉTODO DA TFG QUE A LINHA PRESSUPÕE × O QUE A TELA PEDE.
 *
 * PROMETE: que nenhuma linha do catálogo pressuponha uma equação de clearance
 *   diferente da que o campo de entrada da calculadora pede — e, se pressupuser,
 *   que isso apareça declarado, nunca em silêncio.
 * NÃO PROMETE: que a equação declarada seja a certa para o fármaco. Isso é
 *   leitura de label, e está no verbatim de cada um.
 * UNIVERSO: as linhas contínuas do catálogo (as de modalidade não pedem
 *   clearance), com piso no retrato.
 *
 * ── ⚠️ ESTA TRAVA NASCE VERDE, DE PROPÓSITO ────────────────────────────────
 *
 * Hoje todas as linhas contínuas declaram `cockcroft_gault`, e é o que a tela
 * pede. **É o instrumento que existe antes de precisar dele** — foi assim que o
 * `deInclusivo` salvou o ponto 25 do meropeném, escrito quando ainda não havia
 * divergência nenhuma para achar.
 *
 * ⚠️ E O DEFEITO QUE ELA IMPEDE É CARO: bula de aminoglicosídeo pressupõe ClCr
 * ABSOLUTO (Cockcroft-Gault); corte de diretriz renal pressupõe TFG INDEXADA
 * (CKD-EPI). No obeso e no caquético as duas se separam bastante — usar uma no
 * lugar da outra é transpor calibração, a mesma família do pH < 7,0 vindo da
 * cetoacidose.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");
const { conferirUniverso } = require("./lib/universo.cjs");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mtfg-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(app, "lib/antimicrobianos/catalogo.ts"),
], { cwd: app, stdio: ["ignore", "ignore", "inherit"] });
const { CATALOGO_DE_ANTIMICROBIANOS: CAT } = require(path.join(tmp, "catalogo.js"));
fs.rmSync(tmp, { recursive: true, force: true });

/**
 * O que a tela pede — lido do RÓTULO DO CAMPO, não do arquivo inteiro.
 *
 * ⚠️ A PRIMEIRA VERSÃO PROCURAVA "Cockcroft-Gault" NO ARQUIVO TODO, e passou
 * VERDE quando o rótulo do campo perdeu a menção: a expressão continuava
 * existindo no texto de ajuda, algumas linhas abaixo. **Casar substring em
 * arquivo inteiro é medir a vizinhança, não o objeto** — o mesmo defeito que o
 * invariante do pip-tazo teve ao achar "8/8h" no texto da hemodiálise (R-87).
 */
const motor = lerFonte(path.join(app, "clinical-calculators-engine.ts"));
const campo = motor.match(/\{\s*id:\s*"tfg",\s*label:\s*"([^"]*)"/);
const pedido = campo && /Cockcroft-Gault/i.test(campo[1]) ? "cockcroft_gault" : null;

const falhas = [];
if (!pedido) {
  falhas.push(
    `o RÓTULO do campo de ClCr não diz mais qual equação pede — hoje ele é « ${campo ? campo[1] : "(campo não encontrado)"} ».\n` +
    "      ⚠️ Sem isso, `metodoDaTFG` volta a ser campo verdadeiro SEM CONSEQUÊNCIA — e campo\n" +
    "      sem consequência é o começo de campo mentiroso: ninguém o mantém, porque nada quebra."
  );
}

let continuas = 0;
const divergentes = [];
for (const f of CAT) {
  const todas = f.eixo ? f.eixo.valores.flatMap((v) => v.linhas) : f.linhas;
  for (const l of todas) {
    if (l.modalidade) continue;
    continuas += 1;
    if (pedido && l.metodoDaTFG !== pedido) {
      divergentes.push(`${f.id} · faixa ${l.de}–${l.ate ?? "∞"}: pressupõe ${l.metodoDaTFG}, e a tela pede ${pedido}`);
    }
  }
}

console.log("\nO método da TFG que a linha pressupõe × o que a tela pede\n");
console.log(`   a tela pede: ${pedido ?? "(não declarado)"}`);
console.log(`   linhas contínuas conferidas: ${continuas} · divergentes: ${divergentes.length}`);
const ok = conferirUniverso("valida-metodo-da-tfg", "linhas_continuas", continuas);
if (divergentes.length) {
  console.log("\n   ⚠️ Divergência NÃO é erro automático — é o caso em que a tela precisa dizer, e a linha\n   precisa aparecer com o alerta. O que não pode é ficar em silêncio no dado:");
  for (const d of divergentes) console.log("      " + d);
}

if (falhas.length || divergentes.length) {
  for (const f of falhas) console.log("\n   ❌ " + f);
  console.log(`\n❌ ${falhas.length + divergentes.length} problema(s).\n`);
  process.exit(1);
}
if (!ok) { console.log("❌ universo abaixo do piso.\n"); process.exit(1); }
console.log("\n✅ toda linha contínua pressupõe a equação que a tela pede\n");
