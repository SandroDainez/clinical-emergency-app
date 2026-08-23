#!/usr/bin/env node
/**
 * O MOTOR NÃO SABE CLÍNICA — nome de fármaco no código reprova.
 *
 * PROMETE: que o motor da calculadora de antimicrobianos e a tela que a desenha
 *   NÃO contenham nome de fármaco, id de fármaco, dose nem limiar de ClCr do
 *   catálogo. A renderização é dirigida pelo DADO.
 * NÃO PROMETE: que o dado esteja certo — isso é a `test:antimicrobianos` e a
 *   leitura de label. Aqui só se garante que o código não sabe clínica.
 * UNIVERSO: a ferramenta `dose-antibiotico` em `clinical-calculators-engine.ts` e
 *   a tela `components/protocol-screen/clinical-calculators-screen.tsx`.
 *
 * ── ⚠️ POR QUE ISTO É TRAVA, E NÃO ESTILO ──────────────────────────────────
 *
 * Enquanto havia um `if` por fármaco, o bloco do próximo seria COPIADO do
 * anterior — e é exatamente aí que a divergência nasce. Com 28 fármacos seriam 28
 * cópias, cada uma com a chance de errar a linha que o vizinho acertou.
 *
 * **Se o nome do remédio aparece na tela, a tela sabe clínica** — e clínica mora
 * no catálogo, onde tem fonte por linha, trava de fronteira e varredura.
 *
 * ⚠️ E ESTA CALCULADORA É O ENSAIO DO MOTOR: é o mesmo padrão que o app inteiro
 * precisa ter — dado declarativo + renderização dirigida pelo dado. Sete
 * fármacos, quatro formas de tabela, escopo pequeno e verificável.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");
const { conferirUniverso } = require("./lib/universo.cjs");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "motor-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(app, "lib/antimicrobianos/catalogo.ts"),
], { cwd: app, stdio: ["ignore", "ignore", "inherit"] });
const { CATALOGO_DE_ANTIMICROBIANOS: CAT } = require(path.join(tmp, "catalogo.js"));
fs.rmSync(tmp, { recursive: true, force: true });

const falhas = [];

// ── O universo: a ferramenta e a tela ──────────────────────────────────────
const motor = lerFonte(path.join(app, "clinical-calculators-engine.ts"));
const i = motor.indexOf('id: "dose-antibiotico"');
const j = motor.indexOf('id: "', motor.indexOf("alert:", i));
const regiao = i < 0 ? "" : motor.slice(i, j < 0 ? motor.length : j);
const tela = lerFonte(path.join(app, "components/protocol-screen/clinical-calculators-screen.tsx"));

if (!regiao) {
  console.log("\n❌ a ferramenta `dose-antibiotico` não foi encontrada — isto é \"não consegui olhar\".\n");
  process.exit(1);
}

// ⚠️ O QUE SE PROCURA VEM DO CATÁLOGO, não de uma lista escrita à mão: fármaco
// novo passa a ser vigiado sozinho, sem ninguém lembrar de acrescentá-lo aqui.
const nomes = CAT.flatMap((a) => [a.nome, a.id]);
const doses = CAT.flatMap((a) =>
  (a.eixo ? a.eixo.valores.flatMap((v) => v.linhas) : a.linhas)
    .map((l) => l.doseConcreta?.texto ?? l.dose)
    .filter(Boolean)
);

for (const [onde, texto] of [["motor (dose-antibiotico)", regiao], ["tela (clinical-calculators-screen)", tela]]) {
  for (const nome of nomes) {
    if (new RegExp(`\\b${nome.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i").test(texto)) {
      falhas.push(
        `${onde}: contém o nome/id de fármaco « ${nome} ».\n` +
        `      ⚠️ Se o nome do remédio aparece no código, o código sabe clínica — e clínica mora no\n` +
        `      catálogo, onde tem fonte por linha, trava de fronteira e varredura. Um \`if\` por fármaco\n` +
        `      vira 28 cópias, cada uma com a chance de errar a linha que a vizinha acertou.`
      );
    }
  }
}
// Dose literal no código é o mesmo defeito com outra roupa.
for (const d of new Set(doses)) {
  if (d.length > 3 && regiao.includes(d)) {
    falhas.push(`motor: contém a dose « ${d} » literalmente — dose é dado, não código.`);
  }
}
// Limiar de ClCr no código idem.
if (/\btfg\s*[<>]=?\s*\d/.test(regiao) || /\bclcr\s*[<>]=?\s*\d/i.test(regiao)) {
  falhas.push("motor: compara ClCr com número literal — a fronteira vive no catálogo (R-102).");
}

console.log("\nO motor não sabe clínica — nome de fármaco no código reprova\n");
console.log(`   universo: ${regiao.split("\n").length} linhas da ferramenta · ${tela.split("\n").length} linhas da tela`);
console.log(`   procurados: ${nomes.length} nomes/ids e ${new Set(doses).size} doses, TODOS vindos do catálogo`);
const ok = conferirUniverso("valida-motor-antibiotico", "nomes_procurados", nomes.length);

if (falhas.length) {
  console.log(`\n❌ ${falhas.length} ocorrência(s):\n`);
  for (const f of falhas) console.log("   " + f);
  console.log("");
  process.exit(1);
}
if (!ok) { console.log("❌ universo abaixo do piso.\n"); process.exit(1); }
console.log("\n✅ a renderização é dirigida pelo catálogo — nenhum fármaco nomeado no código\n");
