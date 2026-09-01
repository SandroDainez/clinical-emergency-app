#!/usr/bin/env node
/**
 * PROMETE: que as travas do módulo AVC **reprovem** quando o código para de
 *   cumprir a promessa — ⛔ e ⛔ não apenas passem quando ele cumpre.
 *
 * NÃO PROMETE: cobertura completa. ⛔ Mutação prova as propriedades que alguém
 *   ANTECIPOU; revisão humana continua necessária para caminhos semanticamente
 *   equivalentes que ⛔ ninguém modelou. ⚠️ ⛔ Não é falha do método, é o limite dele.
 *
 * UNIVERSO: os conjuntos em `scripts/mutacoes/*.cjs`, DERIVADOS do diretório
 *   (D-15) — ⛔ não há lista à mão para esquecer de atualizar.
 *
 * ── ⚠️⚠️ POR QUE ISTO EXISTE ────────────────────────────────────────────────
 *
 * ⛔ Estes conjuntos viviam em `/tmp` ⛔ e sumiram quando o diretório foi limpo.
 * ⚠️ A suíte seguiu reproduzível; a evidência mais forte, ⛔ não. ⚠️⚠️ Uma trava
 * verde ⛔ não distingue *"o código está certo"* de *"⛔ ninguém está medindo"* —
 * ⛔ e só a mutação separa as duas coisas.
 */
const fs = require("node:fs");
const path = require("node:path");
const { rodarConjunto } = require("./mutacoes/lib.cjs");

const dir = path.join(__dirname, "mutacoes");
/** ⚠️ Universo derivado do diretório — ⛔ `lib.cjs` ⛔ não é conjunto. */
const conjuntos = fs.readdirSync(dir)
  .filter((f) => f.endsWith(".cjs") && f !== "lib.cjs")
  .sort()
  .map((f) => require(path.join(dir, f)));

/** ⚠️ R-1 · piso: ⛔ varredura sobre o vazio ⛔ não mede ⛔ nada. */
if (conjuntos.length < 3) {
  console.error("❌ menos de 3 conjuntos de mutação — a prova ficaria vazia");
  process.exit(1);
}

const resultados = conjuntos.map(rodarConjunto);

const sobreviventes = resultados.flatMap((r) => r.sobreviventes.map((s) => `${r.nome} · ${s}`));
const quebradas = resultados.flatMap((r) => r.ancorasQuebradas.map((s) => `${r.nome} · ${s}`));
const total = resultados.reduce((n, r) => n + r.total, 0);
const reprovadas = resultados.reduce((n, r) => n + r.reprovadas, 0);

console.log("");
if (quebradas.length > 0) {
  console.error(`❌ ${quebradas.length} ÂNCORA(S) QUEBRADA(S) — a mutação ⛔ não foi testada:\n`);
  quebradas.forEach((s) => console.error(`   · ${s}`));
  console.error("\n⚠️ Âncora que ⛔ não casa ⛔ não é aviso: é mutação que envelheceu ⛔ e");
  console.error("   parou de medir. Reescreva a âncora contra o código atual.\n");
}
if (sobreviventes.length > 0) {
  console.error(`❌ ${sobreviventes.length} MUTAÇÃO(ÕES) SOBREVIVERAM — a trava ⛔ não as pega:\n`);
  sobreviventes.forEach((s) => console.error(`   · ${s}`));
  console.error("");
}
if (quebradas.length > 0 || sobreviventes.length > 0) process.exit(1);

console.log(`✅ MUTAÇÕES DO AVC — ${reprovadas}/${total} reprovadas · ${conjuntos.length} conjuntos`);
