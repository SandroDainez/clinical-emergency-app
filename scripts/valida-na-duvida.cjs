#!/usr/bin/env node
/**
 * PROMETE: que as 16 regras de "na dúvida" estejam nos nós certos, que cada uma
 *   diga a CONSEQUÊNCIA (e não só a direção), e que a regra aponte para o MESMO
 *   destino que o critério objetivo do nó — regra que contradiz o ramo é um dos
 *   dois errado.
 * NÃO PROMETE: que a conduta esteja clinicamente certa (isso é das travas de
 *   cada módulo), nem cobre as saídas de dúvida em RAMO, que são outro bloco.
 * UNIVERSO: as 17 árvores compiladas; a lista de regras vem de lib/na-duvida.ts
 *   lida do próprio arquivo, não redigitada aqui.
 *
 * ── POR QUE ISTO EXISTE ─────────────────────────────────────────────────────
 *
 * O levantamento classificou os 106 pontos de decisão do app e achou 38 de
 * julgamento, dos quais 33 sem saída de dúvida. O critério de entrada é do
 * autor e é mais afiado que "consequência do erro":
 *
 *   ⚠️ ENTRA ONDE O DEFAULT SOB DÚVIDA É O LADO PERIGOSO.
 *
 * Quem hesita escolhe o caminho de menor resistência — "não há contraindicação",
 * "a crise cessou", "a via aérea parece fácil" —, e em 16 nós esse caminho é o
 * que machuca. Nesses, a dúvida JÁ DECIDE: não se abre ramo, escreve-se a regra.
 *
 * A regra vai no `summary`, que o app renderiza SEM precisar expandir — em
 * `evidence` ela ficaria atrás do "Ver critérios (N)", que é onde o conteúdo
 * morre (R-50).
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

/** Onde cada regra tem de estar. */
const ESPERADO = [
  ["rsi", "cico_check", "NA_DUVIDA_CICO"],
  ["rsi", "inducao", "NA_DUVIDA_INDUCAO"],
  ["rsi", "bloqueador", "NA_DUVIDA_BLOQUEADOR"],
  ["seizure", "reavaliar_1", "NA_DUVIDA_CRISE_CESSOU"],
  ["seizure", "reavaliar_2", "NA_DUVIDA_CRISE_CESSOU"],
  ["seizure", "pos_crise", "NA_DUVIDA_CONSCIENCIA"],
  ["anaphylaxis", "diagnostic_entry", "NA_DUVIDA_ANAFILAXIA_DIAGNOSTICO"],
  ["anaphylaxis", "grade1_reassessment", "NA_DUVIDA_ANAFILAXIA_RESPOSTA"],
  ["anaphylaxis", "severity_stratification", "NA_DUVIDA_ANAFILAXIA_RESPOSTA"],
  ["anaphylaxis", "reassessment_after_first_im", "NA_DUVIDA_ANAFILAXIA_RESPOSTA"],
  ["anaphylaxis", "reassessment_after_second_im", "NA_DUVIDA_ANAFILAXIA_RESPOSTA"],
  ["eap", "card_reaval", "NA_DUVIDA_EAP_RESPOSTA"],
  ["eclampsia", "classificacao", "NA_DUVIDA_ECLAMPSIA"],
  ["politrauma", "fonte", "NA_DUVIDA_POLITRAUMA_FONTE"],
  ["tep", "estratificacao", "NA_DUVIDA_TEP_RISCO"],
  ["acute-abdomen", "reavaliar", "NA_DUVIDA_ABDOME_REAVALIAR"],
];

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "na-duvida-"));
const arvores = {};
try {
  const arquivos = [...new Set(ESPERADO.map(([m]) => `${m}-decision-tree.ts`))];
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      ...arquivos.map((f) => path.join(appDir, f)),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  for (const f of arquivos) {
    const mod = require(path.join(tempDir, f.replace(/\.ts$/, ".js")));
    const arv = Object.values(mod).find((v) => v && v.nodes);
    arvores[f.replace("-decision-tree.ts", "")] = arv;
  }
} catch (erro) {
  falhas.push(`as árvores não compilaram — as conferências NÃO RODARAM: ${String(erro).slice(0, 200)}`);
}

/** O texto das regras, lido da fonte única — não redigitado aqui. */
const fonte = lerFonte(path.join(appDir, "lib", "na-duvida.ts"));
const textoDaRegra = {};
for (const m of fonte.matchAll(/export const (NA_DUVIDA_\w+) =\s*\n?\s*"((?:[^"\\]|\\.)*)";/g)) {
  textoDaRegra[m[1]] = m[2].replace(/\\"/g, '"');
}

// ── A. Cada regra está no nó certo, e no summary (que a tela mostra) ────────
for (const [modulo, no, constante] of ESPERADO) {
  const arv = arvores[modulo];
  if (!arv) continue;
  const n = arv.nodes[no];
  if (!n) {
    falhas.push(`\`${modulo}/${no}\` não existe mais — a regra "na dúvida" ficou órfã.`);
    continue;
  }
  const texto = textoDaRegra[constante];
  if (!texto) {
    falhas.push(`\`${constante}\` sumiu de lib/na-duvida.ts.`);
    continue;
  }
  if (!(n.summary ?? "").includes(texto)) {
    falhas.push(
      `\`${modulo}/${no}\`: a regra de dúvida não está no SUMMARY.\n` +
      `      ⚠️ Em \`evidence\` ela fica atrás do "Ver critérios (N)", recolhido — e quem hesita ` +
      `não abre um acordeão para descobrir o que fazer com a hesitação (R-50).`
    );
  } else ok++;
}

// ── B. A regra diz a CONSEQUÊNCIA, não só a direção ────────────────────────
{
  const CONSEQUENCIA = /parada|morte|morre|neurônio|eclâmpsia|isquemia|hipotenso|exausto|descompensa|recaída|casa|não devolve|piora|EEG/i;
  for (const [constante, texto] of Object.entries(textoDaRegra)) {
    if (!CONSEQUENCIA.test(texto)) {
      falhas.push(
        `\`${constante}\` diz a direção e não a CONSEQUÊNCIA.\n` +
        `      ⚠️ "Na dúvida, rocurônio" é ordem; "na dúvida, rocurônio — succinilcolina em ` +
        `hipercalemia não suspeitada é parada" é o que faz alguém obedecer sob pressão.`
      );
    } else ok++;
    if (texto.length < 180) {
      falhas.push(`\`${constante}\` tem ${texto.length} caracteres — curta demais para caber a consequência.`);
    } else ok++;
  }
}

// ── C. A regra NÃO contradiz o ramo do próprio nó ──────────────────────────
//
// Cada par diz: a regra manda tratar como X; qual opção do nó é X. Se a opção
// deixar de existir, o destino da regra virou fumaça.
{
  const COERENCIA = [
    ["rsi", "cico_check", /N[ÃA]O — CICO|CICO \(n[ãa]o intuba/i, "tratar como CICO"],
    ["rsi", "inducao", /Inst[áa]vel|cetamina/i, "induzir como instável"],
    ["rsi", "bloqueador", /rocur[ôo]nio/i, "usar rocurônio"],
    ["seizure", "reavaliar_1", /crise persiste|N[ãa]o —/i, "tratar como persiste"],
    ["seizure", "reavaliar_2", /refrat[áa]rio|N[ãa]o —/i, "tratar como persiste"],
    ["seizure", "pos_crise", /n[ãa]o recuperada|N[ãa]o —/i, "tratar como não recuperou"],
    ["anaphylaxis", "diagnostic_entry", /Sim — crit[ée]rio/i, "tratar como anafilaxia"],
    ["anaphylaxis", "grade1_reassessment", /Progress[ãa]o/i, "tratar como progressão"],
    ["anaphylaxis", "severity_stratification", /Grau III/i, "tratar como o grau maior"],
    ["anaphylaxis", "reassessment_after_first_im", /Piora|persistentes/i, "tratar como piora"],
    ["anaphylaxis", "reassessment_after_second_im", /inst[áa]vel|refrat[áa]rio/i, "tratar como refratário"],
    ["eap", "card_reaval", /Refrat[áa]rio|piora/i, "tratar como refratário"],
    ["eclampsia", "classificacao", /crit[ée]rios de gravidade/i, "tratar como grave"],
    ["politrauma", "fonte", /N[ãa]o respondeu|transit[óo]ria/i, "tratar como não respondedor"],
    ["tep", "estratificacao", /Intermedi[áa]rio/i, "classificar como intermediário"],
    ["acute-abdomen", "reavaliar", /Sim — indica[çc][ãa]o cir[úu]rgica/i, "seguir por SIM"],
  ];
  for (const [modulo, no, padrao, oQue] of COERENCIA) {
    const arv = arvores[modulo];
    if (!arv) continue;
    const n = arv.nodes[no];
    if (!n?.options) continue;
    if (!n.options.some((o) => padrao.test(o.label ?? ""))) {
      falhas.push(
        `\`${modulo}/${no}\`: a regra manda ${oQue}, e nenhuma opção do nó corresponde a isso.\n` +
        `      ⚠️ Regra e ramo divergindo significa que UM DOS DOIS está errado — não que o ` +
        `usuário escolhe qual seguir.`
      );
    } else ok++;
  }
}

// ── D. Vacuidade ───────────────────────────────────────────────────────────
if (Object.keys(textoDaRegra).length < 12) {
  falhas.push(`só ${Object.keys(textoDaRegra).length} regras lidas de lib/na-duvida.ts — a varredura pode ter rodado sobre nada (R-15 item 9).`);
} else ok++;

console.log("\nNa dúvida — a regra onde a hesitação já decide\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — 16 regras no summary, com consequência, coerentes com o ramo\n`);
process.exit(0);
