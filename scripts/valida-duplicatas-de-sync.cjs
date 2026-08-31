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
/**
 * ⚠️⚠️ ARQUIVO **E DIRETÓRIO**.
 *
 * ⛔ A primeira versão exigia extensão (` 2.ext`), então uma **pasta** duplicada
 * — `test-results 4/` — passava batido. ⚠️ E pasta duplicada é pior: ela ⛔ não
 * casa com o `.gitignore` do nome original, então entra no commit ⛔ inteira.
 */
const SUSPEITO = /( \d+(\.[^.]+)?$|conflicted copy|\(\d+\)(\.[^.]+)?$|~\$)/i;

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
    varridos++;
    if (SUSPEITO.test(nome)) {
      achados.push(path.relative(appDir, p) + (st.isDirectory() ? "/" : ""));
      /** ⛔ ⛔ ⛔ Não desce numa pasta já acusada: o achado é ela, ⛔ não o conteúdo. */
      continue;
    }
    if (st.isDirectory()) { pilha.push(p); continue; }
  }
}

/** ⚠️ R-1: piso. Uma varredura que ⛔ não viu arquivo ⛔ nenhum ⛔ não prova ⛔ nada. */
if (varridos < 300) {
  console.log(`\n❌ DUPLICATAS DE SINCRONIZAÇÃO — varredura vazia (${varridos} arquivos)\n`);
  process.exit(1);
}

/**
 * ⚠️⚠️ E A ORIGEM TEM DE ESTAR FECHADA, ⛔ não só o sintoma limpo.
 *
 * ⛔ O Playwright escrevia em `test-results/` dentro da árvore sincronizada, e o
 * iCloud fabricava uma cópia de conflito **a cada execução** — inclusive
 * durante a própria suíte. ⚠️ Apagar depois é enxugar gelo.
 */
const pw = path.join(appDir, "playwright.config.ts");
if (fs.existsSync(pw)) {
  const cfg = fs.readFileSync(pw, "utf8");
  const fora = /outputDir:\s*["'](?!\.)[^"']+["']/.test(cfg);
  if (!fora) {
    console.log("\n❌ DUPLICATAS — o Playwright escreve DENTRO da árvore sincronizada\n");
    console.log("   ⚠️ `outputDir` precisa apontar para fora do repositório: o iCloud");
    console.log("      cria cópia de conflito a cada execução, e pasta duplicada ⛔ não");
    console.log("      casa com o `.gitignore` do nome original.\n");
    process.exit(1);
  }
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
