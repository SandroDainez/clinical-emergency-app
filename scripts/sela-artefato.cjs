#!/usr/bin/env node
/**
 * SELO DO ARTEFATO — ⚠️ **o `dist` passa a dizer ⛔ como nasceu**.
 *
 * PROMETE: que ⛔ todo `dist/` produzido pelos scripts de build ⛔ carregue
 *   `artefato.json` ⛔ declarando script, modo ⛔ e ⛔ se o backend está
 *   embutido; ⛔ e que ⛔ o selo ⛔ **⛔ não** seja aceito ⛔ na palavra: ⛔ ele é
 *   ⛔ **⛔ conferido contra o próprio artefato** ⛔ antes de ser escrito.
 *
 * NÃO PROMETE: que ⛔ o build esteja ⛔ **⛔ certo** para o que se quer fazer com
 *   ele — ⛔ isso ⛔ quem decide ⛔ é ⛔ quem consome (a suíte, o deploy). ⛔ Aqui
 *   ⛔ só ⛔ se ⛔ **⛔ declara a verdade**, ⛔ conferida.
 *
 * UNIVERSO: `dist/` ⛔ (ou o diretório passado como 2º argumento).
 *
 * ── ⚠️⚠️ ⛔ POR QUE ⛔ O SELO ⛔ É ⛔ MEDIDO, ⛔ E ⛔ NÃO ⛔ ANOTADO ───────────
 *
 * ⛔ Um selo ⛔ que ⛔ apenas copiasse ⛔ o argumento ⛔ da linha de comando
 * ⛔ seria ⛔ **⛔ um papel dizendo o que a gente quis** — ⛔ e ⛔ o dia em que o
 * ⛔ script mudasse ⛔ sem o argumento mudar, ⛔ ele ⛔ mentiria ⛔ com ⛔ toda a
 * autoridade ⛔ de ⛔ um metadado. ⚠️ ⛔ Por isso ⛔ ele ⛔ **⛔ recusa** ⛔ selar
 * ⛔ quando ⛔ o que se declara ⛔ contradiz ⛔ o que se mede.
 *
 * Uso:  node scripts/sela-artefato.cjs <teste|producao> [dist]
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const {
  ArtefatoIlegivel,
  MODOS,
  NOME_DO_SELO,
  VERSAO_DO_CONTRATO,
  medirArtefato,
} = require("./lib/artefato.cjs");

const appDir = path.resolve(__dirname, "..");
const modo = process.argv[2];
const dist = path.resolve(process.argv[3] ?? path.join(appDir, "dist"));

function reprovar(mensagem) {
  console.error(`\n❌ SELO DO ARTEFATO\n\n   ${mensagem}\n`);
  process.exit(1);
}

if (!MODOS[modo]) {
  reprovar(
    `modo « ${modo ?? "(nenhum)"} » desconhecido. Modos: ${Object.keys(MODOS).join(", ")}.\n` +
      `   Uso: node scripts/sela-artefato.cjs <teste|producao> [dist]`
  );
}

let medida;
try {
  medida = medirArtefato(dist);
} catch (erro) {
  if (erro instanceof ArtefatoIlegivel) {
    reprovar(`${erro.message}\n\n   Um artefato que não se deixa medir não recebe selo.`);
  }
  throw erro;
}

if (!medida.coerente) {
  reprovar(
    `o artefato tem DUAS VERDADES: o pré-render ${medida.backendNoPreRender ? "VIU" : "não viu"} ` +
      `backend e o bundle do cliente ${medida.backendNoCliente ? "VIU" : "não viu"}.\n` +
      `   Isto é o defeito de cache do Metro (ver prova-ambiente-coerente.cjs).\n` +
      `   Refaça o export com --clear. Nenhum selo é escrito sobre um artefato incoerente.`
  );
}

const esperado = MODOS[modo].backendEmbutido;
if (medida.backendEmbutido !== esperado) {
  reprovar(
    `contradição entre o que se DECLARA e o que se MEDE.\n\n` +
      `   declarado ....... modo « ${modo} » (${MODOS[modo].script}), ` +
      `backend embutido = ${esperado}\n` +
      `   medido .......... backend embutido = ${medida.backendEmbutido}\n\n` +
      `   O selo diz como o artefato nasceu; ele não inventa. Confira se o build\n` +
      `   rodou com o script certo (\`build:web:teste\` usa EXPO_NO_DOTENV=1).`
  );
}

let commit = null;
try {
  commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: appDir })
    .toString()
    .trim();
} catch {
  /** ⚠️ Sem git ⛔ o selo continua válido: ⛔ o commit é ⛔ rastro, ⛔ não contrato. */
}

const selo = {
  versaoDoContrato: VERSAO_DO_CONTRATO,
  script: MODOS[modo].script,
  modo,
  backendEmbutido: medida.backendEmbutido,
  geradoEm: new Date().toISOString(),
  commit,
};

fs.writeFileSync(path.join(dist, NOME_DO_SELO), `${JSON.stringify(selo, null, 2)}\n`);
console.log(
  `\n✅ SELO DO ARTEFATO — modo « ${modo} » · ${MODOS[modo].script} · ` +
    `backend embutido = ${medida.backendEmbutido} · ${dist}/${NOME_DO_SELO}\n`
);
