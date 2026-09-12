#!/usr/bin/env node
/**
 * TRAVA DA TRAVA — a varredura de i18n cobra português SEM ACENTO? (D-138)
 *
 * PROMETE: que `varredura-pt.cjs` **reprove** uma frase clínica em português,
 *   em campo de tela, escrita **sem um único acento e sem palavra-pista** do
 *   português. É mutação fiel: insere a frase, roda a varredura real, confere
 *   que ela morde, e desfaz.
 *
 * NÃO PROMETE: que o classificador `isProse` esteja correto em geral. Ele
 *   continua descartando por heurística de idioma **fora** de campo de tela
 *   reconhecido, e essa parte da **D-138 segue aberta**. Esta trava fecha
 *   **um** buraco, o de campo de tela, e ⛔ não declara o auditor confiável.
 *
 * UNIVERSO: `avc/conteudo/fontes.ts` (campo `assunto:`) e
 *   `scripts/varredura-pt.cjs`.
 *
 * ── ⚠️⚠️⚠️ O DEFEITO QUE ELA FECHA ────────────────────────────────────────
 *
 * O assunto do **F-36** entrou no registro de fontes sem par PT/ES e a
 * varredura devolveu **SEM TRADUÇÃO: 0**. A frase era
 *
 *   "Anafilaxia geral — broncodilatador, adrenalina EV e volume"
 *
 * e ela **não tem um único acento**. Em `isProse`, fora de campo de tela
 * reconhecido, vale `if (!PT_HINT.test(s)) return false;` — a frase sai da
 * rede em silêncio, e iria para a tela do médico hispanofalante em português.
 *
 * ⚠️ O zero da varredura significava *"não olhei para esta frase"*, ⛔ e não
 * *"está traduzida"*. É a **R-CONTROLE** aplicada a uma trava.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const REGISTRO = path.join(appDir, "avc", "conteudo", "fontes.ts");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

/**
 * ⚠️ A frase da mutação é clínica, é português, vai para a tela — e **não tem
 * acento nem palavra-pista**. É exatamente o formato que escapou.
 */
const FRASE_SEM_ACENTO = "Anafilaxia grave, broncoespasmo e hipotensao";

/**
 * ⚠️⚠️ POR QUE ESTA FRASE, E NÃO OUTRA — a primeira tentativa foi INFIEL.
 *
 * Usei *"Choque distributivo por anafilaxia, com broncoespasmo e hipotensao"*
 * e a varredura MORDEU — mas pelo motivo errado: a palavra **"com"** está na
 * lista `PT_HINT`. A mutação passou a testar um caminho que já funcionava, e
 * ⛔ não o caminho que falha.
 *
 * A frase atual foi conferida token a token contra as 123 palavras-pista:
 * `anafilaxia`, `grave`, `broncoespasmo`, `hipotensao` — **nenhuma casa**, e
 * **não há acento**. É a mesma assinatura do assunto do F-36 que escapou.
 */

function rodarVarredura() {
  try {
    execFileSync("node", [path.join(appDir, "scripts", "varredura-pt.cjs")], {
      cwd: appDir,
      stdio: "pipe",
    });
    return { reprovou: false, saida: "" };
  } catch (e) {
    return { reprovou: true, saida: String(e.stdout || "") };
  }
}

const original = fs.readFileSync(REGISTRO, "utf8");

// ── controle positivo: a árvore limpa passa ────────────────────────────────
const limpo = rodarVarredura();
confere(
  "controle positivo — a árvore SEM a mutação passa na varredura",
  !limpo.reprovou,
  "a varredura já reprova antes da mutação. Conserte o que está pendente de tradução " +
    "antes de usar esta trava: com a base vermelha, ela não consegue distinguir " +
    "a mordida da mutação do vermelho preexistente."
);

// ── a mutação ──────────────────────────────────────────────────────────────
/**
 * ⚠️⚠️⚠️ A POSIÇÃO DA MUTAÇÃO É PARTE DA FIDELIDADE.
 *
 * A primeira versão inseria `export const X = "frase"` — prefixo `= `, que
 * ⛔ NÃO é campo de tela. A mutação testava um caminho que o defeito nunca
 * percorreu, e por isso não mordia mesmo com a correção aplicada.
 *
 * O defeito real estava em `assunto:`, dentro de uma entrada de `SLOTS`. A
 * mutação agora insere **uma entrada de slot de verdade**, no mesmo formato
 * das outras.
 */
const ancora = '] as const;';
let mordeu = null;
if (!original.includes(ancora)) {
  confere(
    "a âncora da mutação existe no registro de fontes",
    false,
    `\`${ancora}\` não foi encontrada em avc/conteudo/fontes.ts — a mutação não pôde ser aplicada, ` +
      "e uma mutação que não muta não prova nada."
  );
} else {
  const entrada =
    `  { id: "F-MUT", assunto: ${JSON.stringify(FRASE_SEM_ACENTO)}, estado: "aberto", arquivo: CHOQUE_ABERTAS },\n`;
  const mutado = original.replace(ancora, `${entrada}${ancora}`);
  fs.writeFileSync(REGISTRO, mutado);
  try {
    const r = rodarVarredura();
    mordeu = r;
    confere(
      "⚠️⚠️ MUTAÇÃO FIEL — a varredura MORDE uma frase clínica em português sem acento",
      r.reprovou && r.saida.includes(FRASE_SEM_ACENTO),
      "a varredura NÃO reprovou, ou reprovou sem citar a frase. É a D-138 viva: uma frase " +
        "de tela em português, sem par PT/ES, passando pela rede porque não tem acento " +
        "nem palavra-pista. Ela chegaria ao médico hispanofalante em português."
    );
  } finally {
    fs.writeFileSync(REGISTRO, original);
  }
}

// ── a árvore volta ao que era ──────────────────────────────────────────────
confere(
  "o registro de fontes foi restaurado byte a byte",
  fs.readFileSync(REGISTRO, "utf8") === original,
  "a mutação não foi desfeita — o arquivo ficou diferente do original."
);

const depois = rodarVarredura();
confere(
  "depois de desfeita a mutação, a varredura volta a passar",
  !depois.reprovou,
  "a árvore ficou vermelha depois da trava rodar."
);

console.log(
  `\n${falhas.length ? "❌" : "✅"} A VARREDURA MORDE SEM ACENTO (D-138) — ` +
    `${ok}/${ok + falhas.length} conferências\n`
);
if (falhas.length) {
  falhas.forEach((f) => console.log(`   ❌ ${f}\n`));
  if (mordeu && !mordeu.reprovou) {
    console.log("   ── o que a varredura devolveu na mutação ──");
    console.log(
      "   " + (mordeu.saida.trim().split("\n").slice(-3).join("\n   ") || "(sem saída)")
    );
  }
  process.exit(1);
}
