#!/usr/bin/env node
/**
 * PROMETE: que nenhuma constante de conteúdo clínico de `lib/*.ts` fique SEM
 *   consumidor — porque a segunda redação que ninguém lê é a que pode divergir
 *   da primeira em silêncio.
 * NÃO PROMETE: que a constante consumida CHEGUE à tela — isso depende do campo
 *   em que ela é usada (`evidence` recolhe a partir do 3º item), e é a outra
 *   metade do problema, coberta por `valida-prazo-visivel` e pelas travas de
 *   módulo. Nem que o texto esteja clinicamente certo.
 * UNIVERSO: `lib/*.ts` derivado do diretório (não uma lista à mão), e todo
 *   `.ts`/`.tsx` do app como possíveis consumidores.
 *
 * ── O DEFEITO QUE ORIGINOU, E A HIPÓTESE QUE ERA FALSA (2026-08-17) ─────────
 *
 * A varredura do item 13 achou 10 constantes de `lib/` sem NENHUM consumidor, e
 * a hipótese era "conteúdo clínico invisível" — texto escrito, revisado,
 * traduzido, e que nunca chegou ao médico.
 *
 * ⚠️ A HIPÓTESE ERA FALSA, e o resultado foi ZERO DE DEZ. Verificadas uma a uma
 * contra o que já está na tela:
 *
 *   · 5 eram SEGUNDA REDAÇÃO de conteúdo que já chega por outra via — a
 *     advertência da atropina em bloqueio infranodal já está no nó da
 *     bradicardia; a procedência dos alvos do TCE já está no módulo; as faixas
 *     da dobutamina já aparecem com a bula;
 *   · 4 eram infraestrutura (locale, preços, flag de UI, sessão);
 *   · 1 era ESTRUTURA — `[...CAUSAS_5H, ...CAUSAS_5T]`, com as duas partes
 *     consumidas separadamente.
 *
 * Nenhuma era conteúdo perdido. **O enquadramento certo da classe é: fonte
 * única que virou fonte DUPLA, e a segunda morreu.**
 *
 * ── POR QUE ISSO MERECE TRAVA, SE NADA ESTAVA PERDIDO ──────────────────────
 *
 * ⚠️ PORQUE A SEGUNDA REDAÇÃO PODE DIVERGIR DA PRIMEIRA — e ninguém percebe,
 * porque uma delas não é lida por ninguém.
 *
 * O app tem o caso provado: a dose de ataque de vancomicina vivia em dois
 * lugares, a calculadora aplicava o teto de 3 g e a sepse não. A 130 kg um dizia
 * 3.000 mg e o outro 3.575 — e o que PRESCREVIA era o errado. A diferença é que
 * lá as duas eram consumidas; aqui uma está dormindo, esperando alguém a
 * "reativar" numa revisão futura sem saber que ela ficou para trás.
 *
 * A trava força a decisão no momento em que o autor ainda sabe qual é a fonte:
 * ou consome, ou apaga com a razão escrita.
 */

const fs = require("node:fs");
const path = require("node:path");
const { semComentarios, semImports } = require("./lib/consumo.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const avisos = [];
let ok = 0;

// ── UNIVERSO DERIVADO — lib/*.ts, sem descer em lib/i18n ───────────────────
const libs = fs.readdirSync(path.join(appDir, "lib"))
  .filter((f) => /\.ts$/.test(f))
  .sort();

if (libs.length < 50) {
  falhas.push(`só ${libs.length} arquivos em lib/ — esperado 85+. A varredura pode ter rodado sobre nada (R-15 item 9).`);
} else ok++;

// ── Consumidores: todo .ts/.tsx do app, fora de scripts/, e2e/ e lib/i18n ──
// ⚠️ `scripts/` CONTA COMO CONSUMIDOR — e excluí-lo me fez apagar conteúdo vivo.
//
// `DOBUTAMINA_MCG_KG_MIN` foi acusada de órfã e removida; `test:dobutamina`
// reprovou em três conferências. Quem a consome é a TRAVA: ela compara os números
// com a bula (referência externa) e depois confere que o TEXTO exibe os mesmos
// valores.
//
// "Consumidor" não é só quem RENDERIZA. Uma constante numérica pode existir
// exatamente para ser CONFERIDA — e isso é a forma mais forte de proteger um
// número clínico, não uma sobra. Excluir `scripts/` do universo transformava o
// padrão correto em suspeito.
//
// `e2e/` fica fora: um teste de tela consome o TEXTO renderizado, não a constante.
const SKIP = new Set(["node_modules", "dist", ".git", ".expo", "test-results", "playwright-report", "coverage", "ios", "android", "e2e"]);
const fontes = [];
const anda = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith(".") || SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (p.includes(path.join("lib", "i18n"))) continue;
      anda(p);
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      fontes.push({ rel: path.relative(appDir, p), texto: semImports(semComentarios(fs.readFileSync(p, "utf8"))) });
    }
  }
};
anda(appDir);

if (fontes.length < 200) {
  falhas.push(`só ${fontes.length} arquivos de consumo lidos — esperado 300+. O caminhamento pode ter quebrado.`);
} else ok++;

/**
 * ⚠️ SÓ CONSTANTES DE CONTEÚDO — string ou array de strings.
 *
 * O universo NÃO são todos os exports: funções, tipos e objetos de configuração
 * têm outras razões para existir sem consumidor externo (API pública, tipagem,
 * uso interno). O que esta trava vigia é TEXTO CLÍNICO, que só serve se chegar a
 * alguém.
 */
function constantesDeTexto(fonte) {
  const fora = [];
  const limpo = semComentarios(fonte);

  // ⚠️ DUAS VERSÕES ERRADAS ANTES DESTA, e cada uma errou para um lado.
  //
  // A 1ª casava `= ["` sem olhar o conteúdo, e acusou ESTRUTURA como conteúdo:
  // `CAMPOS_COMPARTILHADOS = ["peso", "altura"…]`, `ORIGENS_DE_PESO =
  // ["estimado", "real"]` — vocabulário do próprio código, várias sustentando um
  // `type X = (typeof X)[number]` no mesmo arquivo.
  //
  // A 2ª tentou consertar limitando o valor a 400 caracteres, e ficou CEGA: o
  // total extraído caiu de 200+ para 115, porque as constantes clínicas deste app
  // são longas — justamente as que mais importam. Corrigir a precisão custou a
  // cobertura, o que é pior.
  //
  // Esta lê por ÍNDICE, sem limite de tamanho, e decide pelo PRIMEIRO ITEM:
  //   · TEXTO      string longa, ou array cujo primeiro item é uma FRASE
  //   · ESTRUTURA  array de identificadores curtos, array tipado, objeto
  //
  // O corte é 25 caracteres: frase clínica deste app nunca tem menos, nome de
  // campo nunca tem mais.
  const MIN_FRASE = 25;

  for (const m of limpo.matchAll(/^export const ([A-Z][A-Z0-9_]*)\s*(:[^=]+)?=\s*/gm)) {
    const nome = m[1];
    const tipo = m[2] ?? "";
    if (/\[\]|Record<|Map</.test(tipo)) continue;           // array tipado / mapa
    let k = m.index + m[0].length;
    // pula até o primeiro delimitador de string, se o valor for array
    if (limpo[k] === "[") {
      while (k < limpo.length && !/["`\]]/.test(limpo[k])) k += 1;
      if (limpo[k] === "]") continue;                        // array vazio
    }
    const q = limpo[k];
    if (q !== '"' && q !== "`") continue;                    // nem string nem array de string
    // lê a string respeitando escape
    let t = "";
    k += 1;
    while (k < limpo.length && limpo[k] !== q) {
      if (limpo[k] === "\\") { t += limpo[k + 1] ?? ""; k += 2; continue; }
      t += limpo[k];
      k += 1;
    }
    if (t.trim().length < MIN_FRASE) continue;               // identificador, não frase
    fora.push(nome);
  }
  return fora;
}

// ── LEGADO CONGELADO — vazio de propósito, e o teto só desce ────────────────
//
// ⚠️ Nasceu VAZIO porque as 10 encontradas foram resolvidas no mesmo bloco: 9
// apagadas com a razão escrita, e 1 (`ADRENALINA_CHOQUE_QUANDO`) reescrita e
// consumida pela tela de vasoativos, que é onde a leitura errada acontecia.
// Se algum dia uma ficar, ela entra aqui NOMEADA e com a razão — nunca como
// número solto.
const LEGADO = {};

const orfas = [];
for (const arq of libs) {
  const fonte = fs.readFileSync(path.join(appDir, "lib", arq), "utf8");
  const interno = semImports(semComentarios(fonte));
  for (const nome of constantesDeTexto(fonte)) {
    const usosFora = fontes.filter((f) => f.rel !== path.join("lib", arq) && new RegExp(`\\b${nome}\\b`).test(f.texto)).length;

    // ⚠️ USO INTERNO CONTA — e esta trava me fez apagar conteúdo VIVO antes de
    // aprender isso.
    //
    // `PESO_AFERIDO` não tinha consumidor externo: quem a usa é
    // `avisoDePeso()`, no MESMO arquivo, que escolhe entre ela e
    // `PESO_NAO_AFERIDO` conforme a origem do peso. A trava a acusou de órfã, eu
    // a apaguei, e o `tsc` reprovou na linha seguinte — sorte, porque se a função
    // estivesse em outro arquivo do `lib/` a compilação passaria e a tela
    // mostraria vazio.
    //
    // A pergunta certa não é "alguém de FORA importa isto?" e sim "isto chega a
    // alguém por ALGUM caminho?". Constante que alimenta uma função exportada do
    // próprio arquivo chega — é fonte única funcionando como deve.
    const semDeclaracao = interno.replace(new RegExp(`export const ${nome}\\b`, "g"), "");
    const usosDentro = (semDeclaracao.match(new RegExp(`\\b${nome}\\b`, "g")) ?? []).length;

    if (usosFora === 0 && usosDentro === 0) orfas.push({ arq: `lib/${arq}`, nome });
  }
}

const naoPerdoadas = orfas.filter((o) => LEGADO[o.nome] === undefined);
if (naoPerdoadas.length) {
  falhas.push(
    `${naoPerdoadas.length} constante(s) de texto clínico em lib/ SEM consumidor:\n` +
    naoPerdoadas.map((o) => `        ${o.arq} → ${o.nome}`).join("\n") + "\n" +
    `      ⚠️ Decida agora, enquanto você ainda sabe qual é a fonte: CONSUMA (num nó, no campo\n` +
    `      visível certo) ou APAGUE com a razão escrita. O que não pode é ficar dormindo.\n` +
    `      A razão: segunda redação que ninguém lê é a que DIVERGE da primeira em silêncio — foi\n` +
    `      assim que a dose de vancomicina passou a divergir entre a calculadora e a sepse, e o lado\n` +
    `      que prescrevia estava errado a partir de 110 kg.\n` +
    `      ⚠️ E se você for apagar: confira se aquele era o ÚLTIMO consumo de alguma outra coisa —\n` +
    `      constante que sobra só no import é conteúdo APAGADO, não movido (R-15 item 12).`
  );
} else ok++;

for (const nome of Object.keys(LEGADO)) {
  if (!orfas.some((o) => o.nome === nome)) {
    avisos.push(`${nome} saiu do legado — foi consumida ou apagada. Remova a linha para travar o ganho.`);
  }
}

// ── Vacuidade: a trava achou constantes para conferir? ─────────────────────
const total = libs.reduce((a, arq) => a + constantesDeTexto(fs.readFileSync(path.join(appDir, "lib", arq), "utf8")).length, 0);
if (total < 200) {
  falhas.push(`só ${total} constantes de texto extraídas de ${libs.length} arquivos — o extrator pode ter quebrado.`);
} else ok++;

console.log("\nConteúdo de lib/ não fica dormindo\n");
for (const a of avisos) console.log(`ℹ️  ${a}`);
if (avisos.length) console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — ${total} constantes de texto em ${libs.length} arquivos de lib/, todas consumidas\n`);
process.exit(0);
