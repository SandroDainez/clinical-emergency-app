#!/usr/bin/env node
/**
 * PROMETE: que a avaliação de via aérea difícil da ISR cubra os QUATRO domínios
 *   (laringoscopia, ventilação com máscara, extraglótico e acesso frontal do
 *   pescoço); que a saída de dúvida exista e leve ao guia; que o eFONA tenha
 *   PRECEDÊNCIA com a razão escrita na tela; que cada saída diga em que base
 *   concluiu; e que nenhum sinal seja perguntado duas vezes.
 * NÃO PROMETE: que os preditores estejam clinicamente completos — os cinco
 *   fatores de eFONA vêm de fonte SECUNDÁRIA (SHORT/SMART), o que está dito na
 *   própria tela. Também não confere as doses da ISR (test:isr).
 * UNIVERSO: a árvore da ISR compilada e lib/via-aerea-quatro-dominios.ts.
 *
 * ── OS DEFEITOS QUE ORIGINARAM ──────────────────────────────────────────────
 *
 * 1. LEMON e MOANS FUNDIDOS numa pergunta só, com duas saídas. O nó escrevia a
 *    distinção na evidência e a apagava ao perguntar — e os planos de resgate
 *    são diferentes.
 * 2. DEFAULT SOB DÚVIDA NO LADO PERIGOSO: quem hesita responde "não" e induz
 *    sem plano de resgate. Caso puro do critério de entrada do bloco.
 * 3. O APP PREPARAVA O RESGATE SEM AVALIAR O RESGATE: mandava abrir o kit de
 *    cricotireoidostomia e preparar máscara laríngea, e nunca perguntava se
 *    aquele pescoço é abordável nem se o dispositivo é viável.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { textosDoNo, textoDoNo } = require("./lib/textos-do-no.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "via-aerea-"));
let arvore = null;
try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      path.join(appDir, "rsi-decision-tree.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  const mod = require(path.join(tempDir, "rsi-decision-tree.js"));
  arvore = Object.values(mod).find((v) => v && v.nodes);
} catch (erro) {
  falhas.push(`a árvore da ISR não compilou — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

const no = (id) => arvore?.nodes?.[id];

// ── A. A saída de dúvida existe e leva ao guia ─────────────────────────────
{
  const decisao = no("via_dificil");
  const duvida = (decisao?.options ?? []).find((o) => /não sei/i.test(o.label ?? ""));
  if (!duvida) {
    falhas.push(
      "o nó `via_dificil` voltou a ter só sim/não.\n" +
      "      ⚠️ É O CASO PURO do critério: quem hesita responde \"não\" porque é o caminho de " +
      "menor resistência, e o \"não\" leva à indução SEM plano de resgate."
    );
  } else {
    ok++;
    if (duvida.next !== "via_aerea_dados") {
      falhas.push(`a saída de dúvida aponta para "${duvida.next}" e não para o guia dos quatro domínios.`);
    } else ok++;
  }
}

// ── B. OS QUATRO DOMÍNIOS, e cada um com destino próprio ───────────────────
{
  const guia = no("via_aerea_dados");
  if (!guia) {
    falhas.push("o guia `via_aerea_dados` sumiu — a saída de dúvida ficou órfã.");
  } else {
    ok++;
    const destinos = guia.next?.possiveis ?? [];
    for (const [alvo, porque] of [
      ["via_aerea_efona", "acesso frontal do pescoço — o domínio que muda a decisão de INDUZIR"],
      ["via_aerea_ambas", "laringoscopia difícil COM resgate frágil"],
      ["via_aerea_ventilacao", "ventilação/extraglótico difícil — a rede é que está frágil"],
      ["via_dificil_plano", "laringoscopia difícil com rede de pé"],
      ["via_aerea_sem_preditor", "nenhum preditor — que não é o mesmo que via aérea fácil"],
    ]) {
      if (!destinos.includes(alvo)) falhas.push(`o guia perdeu a saída \`${alvo}\` (${porque}).`);
      else if (!no(alvo)) falhas.push(`a saída \`${alvo}\` aponta para um nó que não existe.`);
      else ok++;
    }
  }
}

// ── C. eFONA e RODS existem — eram os dois domínios que faltavam ───────────
{
  const tudo = arvore ? Object.keys(arvore.nodes).map((id) => textoDoNo(no(id))).join("\n") : "";
  for (const [nome, padrao, porque] of [
    ["o acesso frontal do pescoço", /acesso frontal do pesco[çc]o/i, "o app preparava o kit e nunca avaliava se o pescoço era abordável"],
    ["a palpação das cartilagens", /cartilagens/i, "é o sinal que se olha, e não um acrônimo para decorar"],
    ["o extraglótico", /extragl[óo]tico/i, "o app mandava preparar máscara laríngea sem avaliar se ela é viável"],
    ["a procedência secundária do SHORT/SMART", /fonte secund[áa]ria/i, "os dois acrônimos divergem no T, e isso está declarado na tela (R-52)"],
    ["o ultrassom quando a palpação falha", /ultrassom/i, "é o que se faz quando o dedo não encontra a membrana"],
  ]) {
    if (!padrao.test(tudo)) falhas.push(`${nome} sumiu do módulo — ${porque}.`);
    else ok++;
  }
}

// ── D. PRECEDÊNCIA do eFONA, com a razão NA TELA ───────────────────────────
{
  const efona = textoDoNo(no("via_aerea_efona"));
  if (!/muda a DECIS[ÃA]O DE INDUZIR/i.test(efona)) {
    falhas.push(
      "a razão da precedência do eFONA sumiu da tela.\n" +
      "      ⚠️ Os outros três domínios mudam o PLANO; este muda a DECISÃO DE INDUZIR. Sem a frase, " +
      "ele parece só mais uma saída entre quatro."
    );
  } else ok++;

  // E a precedência tem de estar no código também, não só no texto.
  const fonte = fs.readFileSync(path.join(appDir, "rsi-decision-tree.ts"), "utf8");
  const escolher = fonte.slice(fonte.indexOf("via_aerea_dados"), fonte.indexOf("via_aerea_efona: {"));
  const ordem = ["efona", "laringoscopia && (ventilacao"];
  const posEfona = escolher.indexOf('if (efona) return "via_aerea_efona"');
  const posOutros = escolher.indexOf('if (laringoscopia &&');
  if (posEfona < 0 || posOutros < 0 || posEfona > posOutros) {
    falhas.push("o eFONA deixou de ser avaliado ANTES dos outros domínios no `escolher` — a precedência é do código, não só do texto.");
  } else ok++;
  void ordem;
}

// ── E. Cada saída diz EM QUE BASE concluiu (R-13 aplicado ao veredito) ─────
{
  for (const alvo of ["via_aerea_efona", "via_aerea_ambas", "via_aerea_ventilacao", "via_aerea_sem_preditor"]) {
    const t = textoDoNo(no(alvo));
    if (!/TRIAGEM, n[ãa]o avalia[çc][ãa]o completa/i.test(t)) {
      falhas.push(
        `\`${alvo}\` não diz sobre o que concluiu.\n` +
        `      ⚠️ Cinco toques produzem uma conclusão com a MESMA APARÊNCIA de onze — e a rapidez ` +
        `que se ganha vira excesso de confiança se o app não disser em que se apoiou.`
      );
    } else ok++;
  }
}

// ── F. NENHUM SINAL PERGUNTADO DUAS VEZES ──────────────────────────────────
//
// Cada sinal conta para todos os domínios a que pertence, e é perguntado UMA
// vez. Perguntar o mesmo item três vezes é o ruído que faz abandonar o guia no
// meio — e a lógica pode estar certa com a tela repetindo.
{
  const campos = no("via_aerea_dados")?.fields ?? [];
  const rotulos = campos.map((c) => (c.label ?? "").toLowerCase());
  for (const termo of ["obes", "barriga", "obstru", "cartilagens", "abrir a boca"]) {
    const quantos = rotulos.filter((r) => r.includes(termo)).length;
    if (quantos > 1) {
      falhas.push(`o sinal "${termo}" aparece em ${quantos} perguntas — cada sinal é perguntado UMA vez e conta para todos os domínios a que pertence.`);
    } else ok++;
  }

  // ── Tamanho: obrigatórias e opcionais ────────────────────────────────────
  const obrig = campos.filter((c) => !c.optional);
  if (obrig.length > 5) {
    falhas.push(
      `${obrig.length} perguntas obrigatórias — acima das 5 que o desenho fixou.\n` +
      `      ⚠️ Guia com mais de oito perguntas é abandonado no meio antes de uma intubação, e quem ` +
      `abandona induz achando que avaliou. As de maior rendimento vêm primeiro e são as obrigatórias.`
    );
  } else ok++;
  if (campos.length < 8) {
    falhas.push(`só ${campos.length} sinais no guia — os quatro domínios não cabem nisso (R-15 item 9).`);
  } else ok++;
}

// ── G. Vacuidade ───────────────────────────────────────────────────────────
{
  const total = arvore ? Object.keys(arvore.nodes).flatMap((id) => textosDoNo(no(id))).length : 0;
  if (total < 80) falhas.push(`só ${total} textos no módulo — as conferências podem ter rodado sobre nada (R-15 item 9).`);
  else ok++;
}

console.log("\nVia aérea difícil — os quatro domínios, e o resgate que ninguém avaliava\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — quatro domínios, eFONA com precedência e a base da conclusão dita\n`);
process.exit(0);
