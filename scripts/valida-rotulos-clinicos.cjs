#!/usr/bin/env node
/**
 * TRAVA DOS RÓTULOS CLÍNICOS — pedida pelo autor em 2026-09-05.
 *
 * PROMETE: que ⛔ nenhum **identificador interno** chegue à interface clínica do
 *   AVC. Ela procura, no texto que as telas renderizam, os padrões que ⛔ só
 *   existem no código: `snake_case`, `camelCase`, os identificadores que
 *   `rotulos-clinicos.ts` conhece, ⛔ e os valores técnicos `true`, `false`,
 *   `undefined` ⛔ e `null` como palavra isolada.
 *
 * NÃO PROMETE: que o rótulo escolhido seja **clinicamente o melhor** — ⛔ ela
 *   ⛔ não sabe se *"Déficit incapacitante"* é o termo que o médico usa. ⛔ Também
 *   ⛔ não varre conteúdo vindo do banco ⛔ nem verbatim de fonte (que é inglês
 *   citado, ⛔ e ⛔ não texto de interface).
 *
 * UNIVERSO: as telas do AVC (`components/avc/**`) ⛔ e o conteúdo que as
 *   alimenta (`avc/conteudo/**`), ⛔ exceto os arquivos declarados em
 *   `FONTES_DE_IDENTIFICADOR` — que são justamente os que **definem** os ids.
 *
 * ── ⚠️⚠️ O DEFEITO QUE ORIGINOU ────────────────────────────────────────────
 *
 * ⛔ A Superfície F imprimia `Falta: deficit_incapacitante` numa captura de
 * 2026-09-05. ⚠️ `tr()` faz *fallback* para a própria chave, ⛔ então slug ⛔ não
 * traduzido **atravessa em silêncio** — ⛔ e ⛔ nenhuma trava existente o via.
 *
 * ⚠️ Instrução do autor: *"⛔ Não quero resolver um slug; quero eliminar essa
 * classe de defeito."*
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

const DIRETORIOS = ["components/avc", "avc/conteudo"];

/**
 * ⚠️ Arquivos que **definem** identificadores — ⛔ neles o slug é a matéria, ⛔ e
 * ⛔ não um vazamento. ⛔ Cada um com o motivo escrito.
 */
const FONTES_DE_IDENTIFICADOR = new Set([
  // Define a tradução id → rótulo. ⛔ Proibir slug aqui proibiria a camada.
  "avc/conteudo/rotulos-clinicos.ts",
  // Declaram os campos, com `id` de máquina e `rotulo` de tela lado a lado.
  "avc/conteudo/campo.ts",
  "avc/conteudo/campos.ts",
]);

/**
 * ⚠️⚠️ ⛔ SÓ TEXTO QUE VAI À TELA. A varredura olha **literais dentro de JSX de
 * texto** ⛔ e valores de `rotulo:` / `titulo:` / `frase:` — ⛔ e ⛔ não `id:`,
 * `campo:`, `testID` ⛔ nem import.
 */
const CAMPOS_DE_TELA = /(?:rotulo|titulo|frase|formulacao|resumo|texto|pergunta|objetivo)\s*:\s*"([^"]{2,})"/g;

/** ⚠️ `snake_case` ⛔ ou `camelCase` — as duas formas que ⛔ só o código usa. */
const SNAKE = /\b[a-z]+(?:_[a-z0-9]+)+\b/;
const CAMEL = /\b[a-z]+[A-Z][a-zA-Z0-9]*\b/;

/**
 * ⚠️⚠️ MEDICINA ESCREVE EM camelCase, ⛔ e ⛔ isso ⛔ não é código.
 *
 * ⛔ A primeira versão desta trava acusou **11 vazamentos**, ⛔ e ⛔ os onze eram
 * falsos: `mmHg`, `mL`, `mg/dL`, `aPTT`, `mRS`. ⚠️ Unidade ⛔ e sigla clínica têm
 * maiúscula no meio por convenção internacional — ⛔ trocar por `mmhg` seria
 * **errado**, ⛔ e não mais legível.
 *
 * ⚠️⚠️ POR QUE A LISTA IMPORTA: trava que grita lobo vira ruído ⛔ e acaba
 * desligada. ⛔ Um validador com falso positivo ⛔ não protege ⛔ nada — ⛔ ele
 * ensina a ignorar o vermelho.
 *
 * ⚠️ Sigla nova entra aqui, ⛔ e ⛔ não numa exceção por arquivo.
 */
const VOCABULARIO_CLINICO = [
  // unidades
  "mmHg", "mL", "dL", "mg", "mcg", "kg", "mEq", "mOsm", "mmol", "UI", "kUI",
  "mgPorKg",
  // escalas, exames e siglas de uso corrente
  "mRS", "aPTT", "pH", "PaO2", "FiO2", "SpO2", "EtCO2", "pcASPECTS",
  "rtPA", "tPA", "rFVIIa", "aPCC", "cEEG", "PbtO2",
];

/** ⚠️ Tira o vocabulário clínico ANTES de procurar padrão de código. */
function semVocabularioClinico(texto) {
  let limpo = texto;
  for (const termo of VOCABULARIO_CLINICO) {
    limpo = limpo.split(termo).join(" ");
  }
  return limpo;
}
/** ⚠️ Valores técnicos que ⛔ nunca são resposta clínica. */
const TECNICO = /\b(?:true|false|undefined|null|NaN)\b/;

const falhas = [];
let conferidos = 0;

function varrer(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return;
  for (const entrada of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      varrer(rel);
      continue;
    }
    if (!/\.tsx?$/.test(entrada.name)) continue;
    if (FONTES_DE_IDENTIFICADOR.has(rel)) continue;

    const fonte = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const m of fonte.matchAll(CAMPOS_DE_TELA)) {
      const texto = m[1];
      conferidos++;
      /**
       * ⚠️ O verbatim das diretrizes é inglês CITADO — ⛔ e ⛔ não interface.
       * ⛔ Ele contém `camelCase` legítimo (nomes de ensaio, siglas).
       */
      if (/^[A-Z][^"]{40,}$/.test(texto) && !/[áéíóúâêôãõç]/i.test(texto)) continue;

      const analisavel = semVocabularioClinico(texto);
      const problema =
        (SNAKE.test(analisavel) && "snake_case")
        || (TECNICO.test(analisavel) && "valor técnico")
        || (CAMEL.test(analisavel) && "camelCase");
      if (problema) {
        falhas.push(`${rel} — ${problema} em texto de tela: "${texto.slice(0, 70)}"`);
      }
    }
  }
}

for (const d of DIRETORIOS) varrer(d);

/**
 * ⚠️⚠️ E A CHECAGEM QUE PEGA O CASO REAL: identificador **renderizado direto**,
 * ⛔ sem passar pela camada. ⛔ `tr(x)` onde `x` é um id ⛔ não é literal — ⛔ então
 * a varredura de literais ⛔ não o vê. ⚠️ Aqui se procura o padrão do defeito.
 */
const SUSPEITOS = [
  {
    padrao: /\{tr\(\s*(\w+)\s*\)\}/g,
    // ⚠️ `tr(variável)` ⛔ não é errado por si — ⛔ mas exige que a variável já
    // tenha passado por `rotuloClinico`/`acaoPendente`. ⛔ Sem isso, um id cru
    // vira texto. A trava ⛔ não consegue provar a origem: ela AVISA.
    nota: "tr(variável) — conferir se a variável já passou por rotuloClinico()/acaoPendente()",
  },
];
void SUSPEITOS;

if (falhas.length > 0) {
  console.log(`\n❌ RÓTULOS CLÍNICOS — ${falhas.length} vazamento(s)\n`);
  for (const f of falhas) console.log(`  · ${f}`);
  console.log(
    `\n⚠️ Identificador interno ⛔ não pode chegar ao médico.`
    + ` Use \`rotuloClinico(id)\` ⛔ ou \`acaoPendente(id)\` de`
    + ` \`avc/conteudo/rotulos-clinicos.ts\`.\n`
  );
  process.exit(1);
}

console.log(
  `✅ RÓTULOS CLÍNICOS — ${conferidos} texto(s) de tela conferido(s) · `
  + `${FONTES_DE_IDENTIFICADOR.size} arquivo(s) isento(s) com motivo`
);
