#!/usr/bin/env node
/**
 * IMAGEM CLÍNICA RASTER É AFIRMAÇÃO CLÍNICA (AM-5 §4 · PD-11).
 *
 * PROMETE: que toda imagem em `assets/clinico/` tenha entrada em
 *   `auditoria/imagens-clinicas.json` com fonte, procedência, licença e força; e
 *   que nenhuma entrada aponte para arquivo inexistente.
 * NÃO PROMETE: que a imagem seja a certa, nem que a licença seja válida — ler
 *   licença é trabalho humano. A trava garante que alguém DECLAROU.
 * UNIVERSO: hoje ZERO imagens. E é por isso que ela é FECHADA POR PADRÃO.
 *
 * ── ⚠️ POR QUE ELA NÃO DIZ "TUDO CERTO" ────────────────────────────────────
 *
 * Um instrumento com universo zero que imprime "✅ nenhuma irregularidade" é o
 * falso verde que este projeto já pagou três vezes (ver `scripts/lib/universo.cjs`).
 * Aqui o universo zero é o estado NORMAL — não há imagem clínica no app — e a
 * trava diz exatamente isso: "nada a conferir", não "está conforme". Ela existe
 * para reprovar a PRIMEIRA imagem que entrar sem declaração.
 *
 * ── ⚠️ E POR QUE ELA NÃO CONVERTE NADA ─────────────────────────────────────
 *
 * A outra metade da AM-5 — nunca vetorizar imagem clínica real — não é
 * verificável por script: nenhum programa distingue um SVG desenhado à mão de um
 * SVG traçado a partir de uma foto. Isso fica como REGRA ESCRITA e revisão
 * humana, declarado aqui para que a ausência não passe por cobertura.
 */
const fs = require("fs");
const path = require("path");

const app = path.resolve(__dirname, "..");
const PASTA = path.join(app, "assets", "clinico");
const REGISTRO = path.join(app, "auditoria", "imagens-clinicas.json");
const OBRIGATORIOS = ["arquivo", "o_que_mostra", "fonte", "procedencia", "licenca", "forca"];
const RASTER = /\.(png|jpe?g|webp|gif|tiff?|bmp)$/i;

const falhas = [];

if (!fs.existsSync(REGISTRO)) {
  console.log("\n❌ auditoria/imagens-clinicas.json não existe — sem registro, qualquer imagem entra sem procedência.\n");
  process.exit(1);
}
const registro = JSON.parse(fs.readFileSync(REGISTRO, "utf8"));
const declaradas = registro.imagens ?? [];

const noDisco = fs.existsSync(PASTA)
  ? fs.readdirSync(PASTA, { recursive: true, encoding: "utf8" }).filter((f) => RASTER.test(f))
  : [];

// 1 · Arquivo sem declaração — o caso que a trava existe para pegar.
for (const arq of noDisco) {
  if (!declaradas.some((d) => d.arquivo === arq)) {
    falhas.push(
      `assets/clinico/${arq} está no app e NÃO tem entrada em auditoria/imagens-clinicas.json.\n` +
      `      ⚠️ Imagem clínica raster é AFIRMAÇÃO CLÍNICA: um ECG real diz "é assim que se parece".\n` +
      `      Declare fonte, procedência, LICENÇA e força — imagem sem procedência não entra, pela\n` +
      `      mesma razão que dose sem fonte não entra. (AM-5 §4 · PD-11)`
    );
  }
}

// 2 · Declaração incompleta, ou apontando para o vazio.
for (const d of declaradas) {
  const faltando = OBRIGATORIOS.filter((c) => !d[c]);
  if (faltando.length) {
    falhas.push(`entrada "${d.arquivo ?? "(sem arquivo)"}" sem: ${faltando.join(", ")}.`);
  }
  if (d.arquivo && !noDisco.includes(d.arquivo)) {
    falhas.push(`entrada "${d.arquivo}" declarada, mas o arquivo não existe em assets/clinico/.`);
  }
}

console.log("\nImagem clínica raster — fonte, procedência, licença e força (AM-5 §4)\n");
console.log(`   imagens no disco: ${noDisco.length} · declaradas: ${declaradas.length}`);

if (!noDisco.length && !declaradas.length) {
  // ⚠️ A FRASE IMPORTA. "Nada a conferir" ≠ "está conforme".
  console.log("\n⚪ NADA A CONFERIR — não há imagem clínica raster no app.");
  console.log("   ⚠️ Isto NÃO é conformidade, é ausência. A trava é fechada por padrão:");
  console.log("   ela reprova a PRIMEIRA imagem que entrar sem declaração.");
  console.log("   ⚠️ E não confere a outra metade da AM-5 — 'nunca vetorizar imagem clínica' não é");
  console.log("   verificável por script: nenhum programa distingue desenho de traçado sobre foto.\n");
  process.exit(0);
}

if (falhas.length) {
  console.log(`\n❌ ${falhas.length} falha(s):\n`);
  for (const f of falhas) console.log("   " + f);
  console.log("");
  process.exit(1);
}
console.log("\n✅ toda imagem clínica do app declara fonte, procedência, licença e força\n");
