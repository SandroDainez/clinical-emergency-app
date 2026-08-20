#!/usr/bin/env node
/**
 * TAMANHO DE ITEM — a §7.4 da arquitetura-mãe, virada trava.
 *
 * PROMETE: que nenhuma tela de CONDUTA passe de 7 ações visíveis, e que nenhum
 *   item de ação passe de 200 caracteres — nas árvores listadas em ARVORES.
 * NÃO PROMETE: que o item caiba na tela do aparelho (isso é medição de layout,
 *   e o teto de caracteres é proxy dela), nem que o texto seja bom. Também não
 *   julga os campos RECOLHIDOS (`porque`, `evidence`): eles são contados e
 *   exibidos, sem reprovar — quem lê o porquê já parou para ler.
 * UNIVERSO: as árvores de ARVORES, compiladas. Hoje o módulo renal; cada uma
 *   entra quando migra para o formato novo.
 *
 * ── ⚠️ POR QUE ESTA TRAVA NASCEU TARDE (2026-08-20) ────────────────────────
 *
 * A §7.4 define o limite desde que a arquitetura-mãe foi escrita, e **ele nunca
 * existiu como trava**. Os números que eu reportei no bloco das 6 — "0 itens
 * acima de 200, maior 125" — vieram de um crawler que eu escrevi na sessão e que
 * morreu com ela. Número de sessão apresentado ao lado de critério de aceite:
 * quem lê não distingue, e eu não distingui.
 *
 * ── ⚠️ PISO DE UNIVERSO ────────────────────────────────────────────────────
 *
 * Se o universo vier menor que o esperado, isto NÃO é "não há item grande" — é
 * "não consegui olhar", e reprova. É a lição das três travas que passaram verde
 * com o universo vazio nesta mesma varredura.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tamanho-item-"));

/** Árvores auditadas, e o mínimo de nós que cada uma tem de ter. */
const ARVORES = [{ arquivo: "ira-decision-tree.ts", minimoDeNos: 40 }];

/** §7.4 — os dois limites. */
const MAX_ACOES_VISIVEIS = 7;
const MAX_CARACTERES = 200;

execFileSync(
  "npx",
  ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule", "--esModuleInterop",
   "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
   ...ARVORES.map((a) => path.join(app, a.arquivo))],
  { cwd: app, stdio: ["ignore", "ignore", "inherit"] }
);

const falhas = [];
let acoes = 0;
let maiorAcao = 0;
let telasDeAcao = 0;
const recolhidosGrandes = [];
let maiorRecolhido = 0;

for (const { arquivo, minimoDeNos } of ARVORES) {
  const mod = require(path.join(tmp, arquivo.replace(/\.ts$/, ".js")));
  for (const arv of Object.values(mod)) {
    if (!arv || typeof arv !== "object" || !arv.nodes) continue;
    const nos = Object.values(arv.nodes);

    // ── Piso de universo: menos nós que o declarado é "não enxerguei" ───────
    if (nos.length < minimoDeNos) {
      falhas.push(
        `${arquivo}: só ${nos.length} nó(s) lidos, mínimo declarado ${minimoDeNos} — ` +
        `NADA foi conferido. Isto é "não consegui olhar", não "não há item grande".`
      );
      continue;
    }

    for (const n of nos) {
      const visiveis = n.actions ?? [];
      if (n.type === "action") telasDeAcao += 1;

      if (visiveis.length > MAX_ACOES_VISIVEIS) {
        falhas.push(
          `${arquivo} · ${n.id}: ${visiveis.length} ações visíveis (teto ${MAX_ACOES_VISIVEIS}).\n` +
          `        ⚠️ Um passo mostra só o que precisa ser feito ANTES da próxima decisão.`
        );
      }

      for (const item of visiveis) {
        acoes += 1;
        maiorAcao = Math.max(maiorAcao, item.length);
        if (item.length > MAX_CARACTERES) {
          falhas.push(
            `${arquivo} · ${n.id}: item de ${item.length} caracteres (teto ${MAX_CARACTERES}).\n` +
            `        « ${item.slice(0, 120)}… »`
          );
        }
      }

      // Recolhidos: contados e exibidos, sem reprovar.
      for (const item of [...(n.porque ?? []), ...(n.evidence ?? [])]) {
        maiorRecolhido = Math.max(maiorRecolhido, item.length);
        if (item.length > MAX_CARACTERES) recolhidosGrandes.push({ no: n.id, n: item.length });
      }
    }
  }
}

fs.rmSync(tmp, { recursive: true, force: true });

console.log("\nTamanho de item — §7.4 da arquitetura-mãe\n");
console.log(`   telas de ação: ${telasDeAcao} · itens de ação: ${acoes}`);
console.log(`   maior item VISÍVEL: ${maiorAcao} caracteres (teto ${MAX_CARACTERES})`);
console.log(`   maior item RECOLHIDO: ${maiorRecolhido} caracteres · acima do teto: ${recolhidosGrandes.length} (não reprova)`);

if (recolhidosGrandes.length) {
  console.log("\n   ℹ️  recolhidos acima de 200 — informação, não falha:");
  for (const r of recolhidosGrandes.slice(0, 12)) console.log(`      ${r.no}: ${r.n} caracteres`);
  if (recolhidosGrandes.length > 12) console.log(`      … e mais ${recolhidosGrandes.length - 12}`);
}

if (falhas.length) {
  console.log(`\n❌ ${falhas.length} violação(ões) da §7.4:\n`);
  for (const f of falhas) console.log("   " + f);
  console.log("");
  process.exit(1);
}
console.log("\n✅ nenhuma tela de conduta acima do teto\n");
