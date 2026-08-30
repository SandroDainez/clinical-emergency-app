/**
 * PROMETE: que ⛔ nenhuma cópia de conflito de sincronização sobreviva no
 *   repositório — em especial em `supabase/migrations/`, onde uma duplicata
 *   seria **aplicada duas vezes**.
 * NÃO PROMETE: impedir que o iCloud as crie. Ela mede o resultado, ⛔ não a causa.
 * UNIVERSO: a árvore do repositório, menos `node_modules` e `.git`.
 *
 * ── ⚠️⚠️ POR QUE ISTO É UMA TRAVA, E ⛔ NÃO UMA LEMBRANÇA ──────────────────
 *
 * ⚠️ O repositório vive em `~/Documents`, sincronizado pelo iCloud. Rodadas
 * rápidas de escrita — testes de mutação salvam e restauram o mesmo arquivo em
 * sequência — fazem o iCloud criar **cópias de conflito** `arquivo 2.ext`,
 * ⛔ em silêncio e ⛔ sem erro.
 *
 * ⚠️⚠️ E o pior: como o conteúdo é **idêntico**, `git diff` do arquivo original
 * ⛔ não mostra ⛔ nada. ⛔ Só `git status` acusa, como arquivo ⛔ não rastreado — e
 * ⛔ ninguém lê `git status` com atenção no fim de uma rodada longa.
 *
 * ⚠️ Aconteceu **duas vezes** em 2026-08-30, e nas duas havia uma **migration**
 * duplicada. ⛔ Confiar em eu lembrar de rodar o `find` ⛔ não é medição.
 */
const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const IGNORAR = new Set(["node_modules", ".git", ".expo", "dist", "web-build", "ios", "android"]);

/** ⚠️ Os padrões que iCloud, Dropbox e OneDrive usam para cópia de conflito. */
const SUSPEITO = /( \d+\.[^.]+$|conflicted copy|\(\d+\)\.[^.]+$|~\$)/i;

const achados = [];
let varridos = 0;
const pilha = [appDir];
while (pilha.length) {
  const atual = pilha.pop();
  for (const nome of fs.readdirSync(atual)) {
    if (IGNORAR.has(nome)) continue;
    const p = path.join(atual, nome);
    let st;
    try { st = fs.statSync(p); } catch { continue; }
    if (st.isDirectory()) { pilha.push(p); continue; }
    varridos++;
    if (SUSPEITO.test(nome)) achados.push(path.relative(appDir, p));
  }
}

/** ⚠️ R-1: piso. Uma varredura que ⛔ não viu arquivo ⛔ nenhum ⛔ não prova ⛔ nada. */
if (varridos < 300) {
  console.log(`\n❌ DUPLICATAS DE SINCRONIZAÇÃO — varredura vazia (${varridos} arquivos)\n`);
  process.exit(1);
}

if (achados.length) {
  const migrations = achados.filter((a) => a.includes("supabase/migrations/"));
  console.log(`\n❌ DUPLICATAS DE SINCRONIZAÇÃO — ${achados.length} arquivo(s)\n`);
  achados.forEach((a) => console.log(`   ${migrations.includes(a) ? "⛔⛔ MIGRATION" : "  "} ${a}`));
  if (migrations.length) {
    console.log(`\n  ⚠️⚠️ ⛔ Migration duplicada seria APLICADA DUAS VEZES no próximo \`db push\`.`);
  }
  console.log(`\n  ⚠️ Confira com \`diff\` se a cópia difere do original ANTES de apagar.\n`);
  process.exit(1);
}
console.log(`\n✅ DUPLICATAS DE SINCRONIZAÇÃO — nenhuma · ${varridos} arquivos varridos\n`);
