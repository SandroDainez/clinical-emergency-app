#!/usr/bin/env node
/**
 * PROMETE: que os DOIS FATOS QUE MUDAM CONDUTA na crise da gestante e da puérpera
 *   estejam presentes nos QUATRO estágios do fluxo de Convulsões —
 *   `estabilizacao`, `primeira_linha`, `terceira_linha` e `pos_ictal`:
 *     (a) gestante **OU PUÉRPERA**, porque é a puérpera que escapa;
 *     (b) o benzodiazepínico ABORTA e o magnésio TRATA A CAUSA.
 * NÃO PROMETE: que o TEXTO seja o mesmo nos quatro, nem que seja longo. ⚠️ Esta
 *   distinção é o ponto inteiro da trava: ENCURTAR é permitido, ESVAZIAR não é.
 *   Também não promete nada sobre o módulo de Pré-eclâmpsia — ele é o dono da
 *   conduta (R-12); aqui só se confere que o fluxo de Convulsões não perde o
 *   gatilho.
 * UNIVERSO: os quatro nós nomeados de `seizure-decision-tree.ts`, compilado por
 *   `tsc` e lido do artefato — o texto que a tela recebe, não o literal do fonte
 *   (R-82).
 *
 * ── A DECISÃO QUE ELA PROTEGE, NÃO O DEFEITO QUE ELA CORRIGE (R-80) ─────────
 *
 * O aviso da eclâmpsia vivia INTEIRO nos quatro nós: 964 caracteres × 4. Uma
 * varredura de repetição mediu isso e quase propôs cortá-lo — a medição estava
 * certa e a conclusão seria errada, porque não são quatro cópias: **é o mesmo erro
 * possível em quatro estágios**, e o pior deles é o pós-ictal, quando o paciente já
 * não convulsiona e a pessoa já não está grávida.
 *
 * A saída foi o texto completo UMA vez (na estabilização, onde a decisão do
 * magnésio se abre) e o gatilho nos outros três. ⚠️ E gatilho é onde o R-50 mora:
 * encurtar aviso clínico é como se esvazia um aviso sem que ninguém veja. Esta
 * trava é a fronteira — os dois fatos, sempre; o resto, livre.
 *
 * ── POR QUE OS DOIS FATOS, E NÃO OUTROS ────────────────────────────────────
 *
 * (a) sem "puérpera", o aviso não pega o cenário que mais escapa — a eclâmpsia
 *     pós-parto tardia está descrita além das 48 h, até semanas depois do parto.
 * (b) sem os dois papéis, alguém troca o benzodiazepínico pelo magnésio e deixa de
 *     abortar uma crise ativa. É o erro que a própria constante foi escrita para
 *     impedir, e ele reaparece a cada encurtamento descuidado.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const { textosDoNo } = require("./lib/textos-do-no.cjs");

const NOS = ["estabilizacao", "primeira_linha", "terceira_linha", "pos_ictal"];

/** (a) o gatilho alcança a puérpera, não só a gestante. */
const FATO_PUERPERA = /pu[ée]rpera/i;

/**
 * (b) os DOIS papéis, e a trava exige os dois lados na mesma frase-conceito:
 * quem aborta e quem trata a causa. Aceita variação de redação — o que não
 * aceita é faltar um dos dois.
 */
const FATO_ABORTA = /benzodiazep[íi]nico[^.]{0,80}\bABORT/i;
const FATO_MAGNESIO = /magn[ée]sio[^.]{0,120}(trata a causa|TRATA A CAUSA|impede a pr[óo]xima)/i;

const falhas = [];
let ok = 0;

// ── o universo: o artefato compilado ───────────────────────────────────────
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "eclampsia-crise-"));
try {
  execFileSync("npx", [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    "seizure-decision-tree.ts",
  ], { cwd: appDir, stdio: "pipe" });
} catch {
  // `tsc` reclama de tipos e ainda emite — só é falha se o .js não existir.
}

const js = path.join(tempDir, "seizure-decision-tree.js");
if (!fs.existsSync(js)) {
  console.log("\n❌ `seizure-decision-tree.ts` não compilou — a trava não tem universo.\n");
  process.exit(1);
}
const mod = require(js);
const arvore = Object.values(mod).find((v) => v && v.nodes);
if (!arvore) {
  console.log("\n❌ árvore de Convulsões não encontrada no artefato.\n");
  process.exit(1);
}

// ⚠️ VACUIDADE: nó que não existe mais faz a conferência passar calada.
for (const id of NOS) {
  if (!arvore.nodes[id]) {
    falhas.push(
      `o nó \`${id}\` NÃO EXISTE mais na árvore de Convulsões.\n` +
      `      ⚠️ Se o fluxo foi reorganizado, decida onde o gatilho da eclâmpsia passa a viver\n` +
      `      ANTES de tirar o nome daqui — a lista é o que impede o aviso de sumir num renome.`
    );
  }
}
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
ok++;

for (const id of NOS) {
  const texto = textosDoNo(arvore.nodes[id]).join("\n");

  if (texto.length < 200) {
    falhas.push(`\`${id}\`: só ${texto.length} caracteres de texto — a leitura do nó pode ter quebrado.`);
    continue;
  }

  const faltando = [];
  if (!FATO_PUERPERA.test(texto)) faltando.push("(a) a PUÉRPERA — o cenário que mais escapa");
  if (!FATO_ABORTA.test(texto)) faltando.push("(b1) que o BENZODIAZEPÍNICO **aborta** a crise");
  if (!FATO_MAGNESIO.test(texto)) faltando.push("(b2) que o MAGNÉSIO **trata a causa** / impede a próxima");

  if (faltando.length) {
    falhas.push(
      `\`${id}\` perdeu ${faltando.length} dos dois fatos que mudam conduta:\n` +
      faltando.map((f) => `        · ${f}`).join("\n") + "\n" +
      `      ⚠️ ENCURTAR É PERMITIDO, ESVAZIAR NÃO É. Se o texto foi reduzido, use\n` +
      `      \`CRISE_GESTANTE_PUERPERA_GATILHO\` (ou a variante do pós-ictal) — elas carregam\n` +
      `      os dois fatos por construção. A razão das quatro colocações está em\n` +
      `      \`lib/crise-na-gestante-e-puerpera.ts\`.`
    );
  } else {
    ok++;
  }
}

console.log("\nEclâmpsia na crise — os dois fatos, nos quatro estágios\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(
  `✅ ${ok} conferências — os ${NOS.length} nós (${NOS.join(", ")}) carregam a puérpera, ` +
  `o papel do benzodiazepínico e o papel do magnésio\n`
);
process.exit(0);
