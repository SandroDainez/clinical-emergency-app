#!/usr/bin/env node
/**
 * PROMETE
 *   Que nenhuma trava leia um arquivo-fonte `.ts`/`.tsx` COM comentários para
 *   medir o que a tela mostra. Toda leitura passa por `lib/fonte.cjs` — `lerFonte`
 *   quando se mede o que o médico lê, `lerCru` quando o comentário É o objeto.
 *
 * NÃO PROMETE
 *   Que o termo procurado seja o certo, nem que a busca esteja bem escrita. Só
 *   que o comentário não conte como se fosse tela.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-18) ────────────────────────────────────
 *
 * A conferência nova do tranexâmico em `valida-politrauma.cjs` passou VERDE com
 * a mutação aplicada — a linha havia sido removida da tela, e o que satisfazia a
 * busca era o comentário escrito ali para explicar a própria conferência.
 *
 * ⚠️ E `valida-paleta.cjs` JÁ DOCUMENTAVA esse defeito, com todas as letras, há
 * meses: «COMENTÁRIO NÃO PINTA NADA». Documentar não impediu repetir — é o R-92
 * numa forma nova: documentação que ninguém é obrigado a consultar tem o mesmo
 * efeito de um aviso que não reprova. Por isso a correção é ESTA TRAVA, e não um
 * terceiro parágrafo dizendo a mesma coisa.
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname);
const falhas = [];
let lidos = 0, leituras = 0;

// ⚠️ A TRAVA NÃO SE MEDE. A primeira versão se reprovou: o próprio padrão de
// busca, escrito como literal aqui dentro, casa com ele mesmo. Instrumento que
// aparece no próprio universo mede a si e não ao objeto.
const EU = path.basename(__filename);

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".cjs") && x !== EU).sort()) {
  const texto = fs.readFileSync(path.join(dir, f), "utf8");
  lidos++;
  // `fs.readFileSync(... ".ts")` cru — o que esta trava proíbe.
  for (const m of texto.matchAll(/fs\.readFileSync\(([^;]{0,120}?)\)/g)) {
    if (!/\.tsx?["'`]/.test(m[1])) continue;
    leituras++;
    falhas.push(
      `${f}: lê fonte .ts com \`fs.readFileSync\` — use \`lerFonte\` de lib/fonte.cjs.\n` +
      `      ⚠️ Comentário não renderiza nada. Uma busca satisfeita por comentário passa\n` +
      `      verde sobre defeito real, e foi assim que a conferência do tranexâmico\n` +
      `      aprovou uma tela sem a linha. Se o comentário FOR o objeto, use \`lerCru\`.`
    );
  }
}

// ⚠️ VACUIDADE: varredura que não leu nada aprova tudo (R-15 item 9).
if (lidos < 50) {
  console.log(`\n❌ só ${lidos} scripts varridos — a leitura quebrou\n`);
  process.exit(1);
}

console.log("\nToda trava lê fonte sem comentário\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} leitura(s) crua(s)\n`);
  process.exit(1);
}
console.log(`✅ ${lidos} scripts varridos — nenhuma leitura crua de .ts fora de lib/fonte.cjs\n`);
process.exit(0);
