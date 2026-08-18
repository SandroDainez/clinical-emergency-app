#!/usr/bin/env node
/**
 * PROMETE: que `timerTopRow` (rótulo do cronômetro + chips de choque/epinefrina)
 *   tenha largura própria dentro do badge — não encolhida ao conteúdo.
 *
 * NÃO PROMETE: nenhuma outra propriedade do badge, nem o alinhamento vertical.
 *
 * UNIVERSO: components/protocol-screen/acls-protocol-screen.tsx (timerTopRow) e
 *   components/protocol-screen/protocol-screen-styles.ts (timerBadge, o pai).
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-18) ─────────────────────────────────────
 *
 * `timerBadge` (protocol-screen-styles.ts) tem `alignItems: "center"` — usado
 * para centralizar o valor grande ("43s"). Mas o mesmo alignItems faz TODO
 * filho direto do badge encolher para a largura do CONTEÚDO em vez de esticar
 * para a largura do badge. `timerTopRow`, que por dentro separa rótulo e chips
 * com `justify-content: space-between`, é filho direto — e sem largura própria
 * o space-between não tem o que distribuir: rótulo e chip ficam ENCOSTADOS,
 * centralizados no meio do badge. Medido: a linha caía de 298 px para 165 px, e
 * "Epi ×1" tocava/sobrepunha a última palavra de "PRÓXIMO RITMO".
 *
 * A CORREÇÃO é `alignSelf: "stretch"` só em `timerTopRow` — devolve a largura
 * cheia a ESTE filho, sem tirar a centralização dos outros (o valor, a troca de
 * compressor) que dependem do `alignItems: center` do badge.
 */
const path = require("path");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
const falhas = [];
let ok = 0;

const arq = path.join(appDir, "components/protocol-screen/acls-protocol-screen.tsx");
const fonte = lerFonte(arq);

// ⚠️ VACUIDADE (R-15 item 9): estilo não encontrado não pode aprovar por vazio.
const i = fonte.indexOf("timerTopRow: {");
if (i < 0) {
  console.log("\n❌ `timerTopRow` não foi encontrado em " + path.relative(appDir, arq) + "\n");
  process.exit(1);
}
const bloco = fonte.slice(i, fonte.indexOf("},", i));

if (!/alignSelf:\s*"stretch"/.test(bloco)) {
  falhas.push(
    "`timerTopRow` perdeu `alignSelf: \"stretch\"`.\n" +
    "      ⚠️ O pai (`timerBadge`) tem `alignItems: \"center\"`. Sem o stretch, este\n" +
    "      filho encolhe ao conteúdo, o space-between interno fica sem espaço para\n" +
    "      distribuir, e o chip de choque/epinefrina volta a encostar — ou sobrepor —\n" +
    "      o rótulo do cronômetro."
  );
} else ok++;

// ⚠️ Confere que o PAI continua com alignItems:center — se ele mudar, o stretch
// vira remendo desnecessário e o defeito pode ter voltado disfarçado de outro jeito.
const jPai = fonte.indexOf("timerBadge: {");
const arqPaiRel = "components/protocol-screen/protocol-screen-styles.ts";
const fontePai = lerFonte(path.join(appDir, arqPaiRel));
const iPai = fontePai.indexOf("timerBadge: {");
if (iPai < 0) {
  falhas.push(`\`timerBadge\` não foi encontrado em ${arqPaiRel} — a premissa do conserto não pôde ser conferida.`);
} else {
  const blocoPai = fontePai.slice(iPai, fontePai.indexOf("},", iPai));
  if (!/alignItems:\s*"center"/.test(blocoPai)) {
    falhas.push(
      `\`timerBadge\` deixou de ter `+ '`alignItems: "center"`' + ` em ${arqPaiRel}.\n` +
      `      Se isso foi intencional, o \`alignSelf: "stretch"\` de \`timerTopRow\` é\n` +
      `      redundante e pode sair — mas confira o valor central ("43s") antes.`
    );
  } else ok++;
}

console.log("\nA linha do cronômetro tem largura própria — o chip não sobrepõe o rótulo\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências\n`);
process.exit(0);
