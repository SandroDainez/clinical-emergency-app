#!/usr/bin/env node
/**
 * COMO CADA VETOR NASCEU — `desenhado` ou `derivado` (AM-5 §5).
 *
 * PROMETE: que todo asset vetorial do repositório — arquivo `.svg` ou SVG
 *   embutido em código — tenha entrada em `auditoria/origem-dos-vetores.json`
 *   declarando a origem; que `derivado` traga a procedência e a LICENÇA da
 *   imagem de base; e que `terceiro` traga quem desenhou e sob que licença.
 *
 * NÃO PROMETE: que a declaração seja VERDADEIRA — e isto é o ponto inteiro.
 *   Nenhum script distingue um SVG desenhado de um SVG traçado sobre uma
 *   fotografia; a diferença está na intenção de quem o produziu, não nos bytes.
 *   **A veracidade é do autor.**
 *
 *   O que a declaração muda não é a verificabilidade — é o CUSTO DE VIOLAR.
 *   Antes, decalcar um ECG real e chamá-lo de ícone era SILÊNCIO: nada no
 *   repositório dizia o contrário. Agora exige uma AFIRMAÇÃO FALSA, escrita,
 *   assinada e datada num arquivo versionado — e afirmação escrita alguém
 *   confere depois. É a mesma conversão do `contextoDaFonte`: o que não se mede,
 *   se declara; o que se declara, alguém confere.
 *
 * UNIVERSO: `assets/**\/*.svg` mais os arquivos de código com SVG embutido.
 */
const fs = require("fs");
const path = require("path");

const app = path.resolve(__dirname, "..");
const REGISTRO = path.join(app, "auditoria", "origem-dos-vetores.json");
const ORIGENS = ["desenhado", "derivado"];
const falhas = [];

if (!fs.existsSync(REGISTRO)) {
  console.log("\n❌ auditoria/origem-dos-vetores.json não existe — nenhum vetor declara como nasceu.\n");
  process.exit(1);
}
const registro = JSON.parse(fs.readFileSync(REGISTRO, "utf8"));
const declarados = new Map((registro.assets ?? []).map((a) => [a.asset, a]));

// ── O UNIVERSO: arquivos .svg + SVG embutido em código ─────────────────────
function varrer(dir, aceita, achados = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git" || e.name === "dist") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varrer(p, aceita, achados);
    else if (aceita(p)) achados.push(path.relative(app, p));
  }
  return achados;
}
const arquivosSvg = varrer(app, (p) => p.endsWith(".svg"));
const codigoComSvg = varrer(app, (p) =>
  /\.(ts|tsx)$/.test(p) && !p.includes(`${path.sep}scripts${path.sep}`) &&
  /<svg[\s"\\]/.test(fs.readFileSync(p, "utf8")));
const universo = [...arquivosSvg, ...codigoComSvg].sort();

if (!universo.length) {
  console.log("\n❌ nenhum vetor encontrado — o varredor quebrou. Isto é \"não consegui olhar\", não \"não há\".\n");
  process.exit(1);
}

// ── 1 · ASSET SEM DECLARAÇÃO — o que a trava existe para reprovar ──────────
for (const asset of universo) {
  const d = declarados.get(asset);
  if (!d) {
    falhas.push(
      `${asset} não declara COMO NASCEU.\n` +
      `      ⚠️ Todo vetor declara \`origem\`: "desenhado" (a partir de descrição, sem imagem de base)\n` +
      `      ou "derivado" (traçado/vetorizado/decalcado sobre imagem — e aí exige a procedência e a\n` +
      `      LICENÇA da base). Sem a declaração, violar a AM-5 §2 custa silêncio; com ela, custa uma\n` +
      `      afirmação falsa escrita no repositório. (AM-5 §5)`
    );
    continue;
  }
  if (!ORIGENS.includes(d.origem)) {
    falhas.push(`${asset}: origem "${d.origem}" não existe — só "desenhado" ou "derivado".`);
  }
  if (d.origem === "derivado" && (!d.base || !d.base.procedencia || !d.base.licenca)) {
    falhas.push(
      `${asset}: declarado "derivado" e SEM \`base.procedencia\` + \`base.licenca\`.\n` +
      `      ⚠️ Derivado é traçado SOBRE alguma coisa — e essa coisa tem dono. Se a base for imagem\n` +
      `      clínica, a AM-5 §2 já proíbe o traçado; se não for, a licença dela ainda manda.`
    );
  }
  // ── ⚠️ AUTORIA DO ARQUIVO × PROCEDÊNCIA DA ARTE (AM-6 · PD-12) ────────────
  //
  //   origem        COMO nasceu                 desenhado | derivado
  //   autoria       quem criou o ARQUIVO aqui   propria | terceiro
  //   procedencia   origem do CONTEÚDO VISUAL   propria | terceiro  ← obriga a licença
  //   quem          de quem é esse conteúdo
  //   licenca       o direito que autoriza usá-lo
  //
  // Um arquivo PODE ser nosso e conter arte de terceiro — `desenho-do-modulo.ts`
  // é exatamente isso, e é ele que o app RENDERIZA. Nesse caso atribuição e
  // licença continuam OBRIGATÓRIAS.
  //
  // ⚠️ O BURACO QUE ISTO FECHA, MEDIDO EM 2026-08-21: a exigência pendurava na
  // AUTORIA do arquivo. Autoria própria + arte de terceiro + licença VAZIA
  // passava VERDE — e quem lesse "autoria: propria" daqui a um ano concluiria
  // que não há atribuição a preservar, quando a Apache 2.0 exige reter o aviso.
  //
  // ⚠️ E `procedencia` É ENUM, NÃO PROSA: adivinhar pelo nome escrito em `quem`
  // se a arte é de fora mediria a REDAÇÃO em vez do fato (R-87).
  if (!["propria", "terceiro"].includes(d.procedencia)) {
    falhas.push(
      `${asset}: \`procedencia\` ausente ou inválida ("${d.procedencia}") — só "propria" ou "terceiro".\n` +
      `      ⚠️ Ela NÃO se deduz de \`autoria\`: arquivo nosso pode conter arte de fora.`
    );
  } else if (d.procedencia === "terceiro" && (!d.quem || !d.licenca)) {
    falhas.push(
      `${asset}: conteúdo de TERCEIRO sem ${!d.quem ? "`quem`" : ""}${!d.quem && !d.licenca ? " e " : ""}${!d.licenca ? "`licenca`" : ""}.\n` +
      `      ⚠️ A licença acompanha o CONTEÚDO, não o arquivo. Aqui \`autoria\` é "${d.autoria}" — e isso NÃO isenta:\n` +
      `      arquivo nosso com arte de terceiro é COMPILAÇÃO, e a atribuição continua devida.\n` +
      `      ⚠️ E \`declarado_por\` não entra nesta conta: assinatura não substitui conformidade.`
    );
  }
  if (!["propria", "terceiro"].includes(d.autoria)) {
    falhas.push(`${asset}: \`autoria\` ausente ou inválida ("${d.autoria}") — só "propria" ou "terceiro".`);
  }
  if (d.autoria === "terceiro" && d.procedencia === "propria") {
    falhas.push(`${asset}: arquivo feito por terceiro contendo arte declarada como NOSSA — ou um, ou outro.`);
  }
  if (!d.porque) falhas.push(`${asset}: sem \`porque\` — a declaração não diz em que se apoia.`);
}

// ── 2 · DECLARAÇÃO ÓRFÃ ────────────────────────────────────────────────────
for (const asset of declarados.keys()) {
  if (!universo.includes(asset)) {
    falhas.push(`entrada "${asset}" declarada, mas o arquivo não existe — registro que descola vira ficção.`);
  }
}

const porOrigem = {};
for (const a of declarados.values()) porOrigem[a.origem] = (porOrigem[a.origem] ?? 0) + 1;

console.log("\nComo cada vetor nasceu — desenhado ou derivado (AM-5 §5)\n");
console.log(`   vetores no repositório: ${universo.length} (${arquivosSvg.length} arquivos .svg · ${codigoComSvg.length} embutidos em código)`);
console.log(`   declarados: ${declarados.size} · desenhado ${porOrigem.desenhado ?? 0} · derivado ${porOrigem.derivado ?? 0}`);
console.log("   ⚠️ A TRAVA NÃO JULGA SE A DECLARAÇÃO É VERDADEIRA — a veracidade é do autor.");
console.log("      Ela reprova asset SEM declaração: violar a AM-5 passa a exigir afirmação falsa, não silêncio.");
if (registro._meta?.pendencia) console.log(`\n   ℹ️  ${registro._meta.pendencia}`);

if (falhas.length) {
  console.log(`\n❌ ${falhas.length} falha(s):\n`);
  for (const f of falhas) console.log("   " + f);
  console.log("");
  process.exit(1);
}
console.log("\n✅ todo vetor do repositório declara como nasceu\n");
