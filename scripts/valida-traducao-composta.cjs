#!/usr/bin/env node
/**
 * PROMETE
 *   Que o texto que CHEGA À TELA — já composto, com interpolação e
 *   concatenação resolvidas — tenha tradução em espanhol. Percorre as árvores
 *   de decisão COMPILADAS e pergunta a `tr(texto, "es-419")`: se ela devolve o
 *   próprio texto, o usuário em espanhol lê português.
 *
 * NÃO PROMETE
 *   Que a tradução esteja correta, nem cobre telas fora das árvores de decisão
 *   (componentes, motores, calculadoras). É a mesma limitação de universo das
 *   outras travas, e está declarada.
 *
 * UNIVERSO
 *   Todos os `*-decision-tree.ts` da raiz, com `actions`, `exitCriteria` e
 *   `evidence` de cada nó.
 *
 * ── O DEFEITO QUE ORIGINOU (D-35) ───────────────────────────────────────────
 *
 * A varredura de tradução (`varredura-pt.cjs`) extrai LITERAIS do código-fonte.
 * A tela mostra a FRASE. Entre um e outro existem duas rotas de fuga:
 *
 *   1. INTERPOLAÇÃO — `` `Metas: PaCO₂ ${ALVOS_TCE.paco2}…` `` (D-19, pulada
 *      por desenho, porque só existe em runtime);
 *   2. COMPOSIÇÃO — `"2ª linha — " + VASOPRESSINA_DOSE`. Aqui é pior: as DUAS
 *      peças passam pela varredura, cada uma com a sua tradução. A soma não
 *      tem chave nenhuma, e `tr()` devolve português.
 *
 * Medido: 45 textos compostos sem tradução em 13 dos 17 módulos, com a
 * varredura marcando "SEM TRADUÇÃO: 0" o tempo todo.
 *
 * ⚠️ E QUATRO DELES NASCERAM DESTA AUDITORIA — o padrão "criar lib de fonte
 * única e compor no consumo" é exatamente o que a auditoria vem recomendando,
 * e ele carrega este custo. A consequência prática está no METODO: ao criar
 * fonte única de TEXTO, a constante é a FRASE INTEIRA; compor no consumo é o
 * padrão certo para NÚMERO e errado para FRASE.
 *
 * ── POR QUE A LISTA DE EXCEÇÕES TEM MOTIVO EM CADA LINHA ────────────────────
 *
 * Há texto que é legitimamente idêntico nos dois idiomas — tabela de números,
 * placeholder que o motor substitui, sigla. Sem exceção declarada, a trava
 * acusaria inocente, e verificador que acusa inocente é desligado no primeiro
 * aperto (R-55). Sem MOTIVO em cada exceção, a lista vira gaveta.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

/**
 * Só acusa texto com PROSA: 3 ou mais palavras de 4+ letras, ignorando
 * placeholders `{...}`. "FiO₂ 0,40 → PEEP 5–8 cmH₂O" não é frase a traduzir.
 */
const temProsa = (t) =>
  (t.replace(/\{[^}]*\}/g, "").match(/[A-Za-zÀ-ÿ]{4,}/g) || []).length >= 3;

/**
 * Idênticos POR DESENHO — cada um com o motivo, e conferidos um a um.
 * Chave: início do texto (prefixo), para não colar a lista a uma vírgula.
 */
const IDENTICOS_POR_DESENHO = [
  ["Leve 13–15 · Moderado 9–12 · Grave 3–8.", "as três palavras são iguais em espanhol"],
  ["Fonte: ARDSNet (ARMA). N Engl J Med. 2000", "referência bibliográfica — não se traduz"],
  ["Etiologias: LSD, MDMA, quetamina", "lista de nomes de substâncias, iguais nos dois idiomas"],
];

/**
 * Dívida herdada: os módulos abaixo já tinham texto composto sem tradução
 * ANTES desta trava existir. Cada um fecha na auditoria do seu módulo — e a
 * trava impede que o número CRESÇA, que é o que importa agora.
 *
 * ⚠️ Este teto é o oposto de uma exceção silenciosa: ele está aqui para ser
 * baixado, e baixá-lo é parte da auditoria de cada módulo. Se algum módulo
 * passar do seu número, a trava acusa.
 */
const DIVIDA_POR_MODULO = {
  avc: 1,
  // ⚠️ ZERO desde 2026-08-17: as duas pendentes (Wellens e OMI/NOMI) foram
  // traduzidas quando o ramo-ponteiro do ECG DOBROU a contagem — a mesma
  // constante em duas superfícies. Pagar a dívida custou menos que subir o teto.
  coronary: 0,
  eap: 1,
  politrauma: 3,
  sepsis: 2,
  shock: 1,
  ventilation: 4,
};

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-trad-"));
const arvores = fs.readdirSync(appDir).filter((f) => f.endsWith("-decision-tree.ts"));

try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      ...arvores.map((f) => path.join(appDir, f)),
      path.join(appDir, "lib/i18n/index.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
} catch (erro) {
  falhas.push(`as árvores não compilaram — a conferência NÃO RODOU: ${String(erro).slice(0, 200)}`);
}

let tr;
try {
  ({ tr } = require(path.join(tempDir, "lib/i18n/index.js")));
} catch (erro) {
  falhas.push(`não consegui carregar o i18n compilado: ${String(erro).slice(0, 160)}`);
}

const semTraducao = {};
let percorridos = 0;

if (typeof tr === "function") {
  for (const arquivo of arvores) {
    const compilado = path.join(tempDir, arquivo.replace(/\.ts$/, ".js"));
    if (!fs.existsSync(compilado)) continue;
    const modulo = arquivo.replace("-decision-tree.ts", "");
    const arvore = Object.values(require(compilado)).find((v) => v && v.nodes);
    if (!arvore) continue;

    for (const no of Object.values(arvore.nodes)) {
      // `porque` entra aqui desde que nasceu (2026-08-18): é texto de tela como
      // qualquer outro, e ficar de fora significaria sair em português com o
      // app em espanhol — sem nada avisar, porque a ausência parece vazio.
      const textos = [...(no.actions ?? []), ...(no.exitCriteria ?? []), ...(no.evidence ?? []), ...(no.porque ?? [])].filter(
        (t) => typeof t === "string"
      );
      for (const texto of textos) {
        percorridos++;
        if (tr(texto, "es-419") !== texto) continue;
        if (!temProsa(texto)) continue;
        if (IDENTICOS_POR_DESENHO.some(([prefixo]) => texto.startsWith(prefixo))) continue;
        (semTraducao[modulo] ??= []).push(texto);
      }
    }
  }

  // ⚠️ Conferência de VACUIDADE: trava que não percorreu nada aprova tudo.
  if (percorridos < 500) {
    falhas.push(
      `só ${percorridos} textos percorridos — esperado mais de 500. As árvores mudaram de forma e esta ` +
      `trava deixou de exercitar o que promete. Reescrever a trava, não removê-la (R-15 item 9).`
    );
  } else ok++;

  for (const [modulo, textos] of Object.entries(semTraducao)) {
    const teto = DIVIDA_POR_MODULO[modulo] ?? 0;
    if (textos.length > teto) {
      falhas.push(
        `${modulo}: ${textos.length} frase(s) compostas SEM tradução em espanhol (teto herdado: ${teto}).\n` +
        textos.slice(0, 3).map((t) => `      « ${t.slice(0, 110)}… »`).join("\n") +
        `\n   ⚠️ O texto chega à tela COMPOSTO, e a varredura de literais não o vê. Se você criou uma\n` +
        `      constante e a concatenou no consumo ("prefixo — " + CONSTANTE), a soma não tem chave.\n` +
        `      Fonte única de TEXTO = a constante é a FRASE INTEIRA.`
      );
    } else ok++;
  }
  for (const [modulo, teto] of Object.entries(DIVIDA_POR_MODULO)) {
    const atual = (semTraducao[modulo] ?? []).length;
    if (atual < teto) {
      console.log(
        `ℹ️  ${modulo}: ${atual} pendente(s), teto ${teto} — a dívida diminuiu. Baixe o teto em ` +
        `DIVIDA_POR_MODULO para travar o ganho.`
      );
    }
  }
}

console.log("\nTradução do texto COMPOSTO — o que chega à tela, não o literal do código\n");
console.log(`   ${percorridos} textos percorridos em ${arvores.length} árvores`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — nenhum módulo acima da dívida declarada\n`);
process.exit(0);
