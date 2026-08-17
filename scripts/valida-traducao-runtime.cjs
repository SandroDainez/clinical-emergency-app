#!/usr/bin/env node
/**
 * PROMETE: que toda string em português que o app MONTA EM TEMPO DE EXECUÇÃO
 *   tenha chave correspondente no dicionário PT→ES. O universo é o ARTEFATO
 *   COMPILADO — `lib/*.ts` e as árvores de decisão emitidas por `tsc` —, e as
 *   strings comparadas são as que a tela recebe, não as que alguém escreveu.
 * NÃO PROMETE: que exista texto novo sem tradução nenhuma. Isso é
 *   `npm run test:i18n` (`varredura-pt.cjs`), que lê o FONTE e pega o literal
 *   recém-escrito. Também não promete que a tradução esteja CORRETA — nenhuma
 *   trava sabe espanhol.
 * UNIVERSO: o ARTEFATO COMPILADO — todos os `lib/*.ts` e todas as árvores de
 *   decisão da raiz, emitidos por `tsc` num diretório temporário e carregados
 *   com `require`. Compara-se cada string de prosa portuguesa alcançável nos
 *   objetos exportados contra as chaves de `lib/i18n/**` e `acls/locales/**`.
 *   ⚠️ FORA do universo: `acls/reducer.ts` e `acls/presentation.ts` — dívida
 *   nomeada, porque o painel de adrenalina depende de teste que avança o
 *   cronômetro — e os componentes `.tsx`, cujo texto não vem de objeto
 *   exportado.
 *
 * ── A FRONTEIRA COM A VARREDURA DE FONTE (cobertura cruzada declarada) ──────
 *
 *   varredura-pt.cjs (fonte)   → TEXTO NOVO sem tradução. Vê o literal no
 *                                arquivo, no momento em que é escrito.
 *   esta trava (runtime)       → FRASE MONTADA cuja chave não corresponde ao
 *                                que a tela mostra.
 *
 * ⚠️ NENHUMA DAS DUAS COBRE A OUTRA, e as duas condições que a auditoria fixou
 * para aceitar cobertura cruzada estão satisfeitas: cada uma é provada por
 * MUTAÇÃO PRÓPRIA, e as duas chegam ao defeito por CAMINHOS DIFERENTES (uma lê
 * texto de arquivo, a outra objetos compilados).
 *
 * E A FRONTEIRA FOI MEDIDA, não deduzida. A mutação desta trava — acrescentar
 * um pedaço por concatenação a `AMIODARONA_COM_PULSO_CARGA`, que HOJE tem
 * chave — foi levada até o fim nos dois instrumentos:
 *
 *   1. mutação aplicada        → as duas reprovam, mas dizem coisas diferentes:
 *                                a de fonte aponta o PEDAÇO de 72 caracteres,
 *                                esta aponta a FRASE de 230 que a tela recebe.
 *   2. obedecendo a de fonte   → gravei a chave do PEDAÇO. `varredura-pt.cjs`
 *      ao pé da letra             passou com «SEM TRADUÇÃO: 0».
 *   3. e a tela                → esta trava seguiu reprovando em 3 contagens.
 *                                O médico continuaria vendo português.
 *
 * ⚠️ É POR ISSO QUE A DE FONTE NÃO SUBSTITUI ESTA: obedecê-la literalmente
 * produz um dicionário que passa e uma tela que não traduz. E o inverso também
 * vale — esta trava não vê literal recém-escrito que ninguém montou ainda.
 *
 * A mutação também mostrou o ALCANCE do mecanismo: UMA concatenação em `lib/`
 * derrubou TRÊS superfícies — a própria constante e dois nós de
 * `acls-tachycardia-tree.ts` que a consomem. Quem edita a constante não vê as
 * telas que ela alimenta.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ────────────────────────────────────
 *
 * O autor viu o app em espanhol mostrando conteúdo clínico em português. A
 * varredura de fonte dizia ZERO pendências — e estava certa do próprio ponto de
 * vista.
 *
 * O caso, medido:
 *
 *     lib/causas-na-parada.ts → HIPERCALEMIA_NA_PARADA
 *       string em RUNTIME  : 722 caracteres
 *       chave no dicionário: 287 caracteres
 *       divergem no caractere 287 — onde a concatenação continua
 *
 *     export const HIPERCALEMIA_NA_PARADA =
 *       "HIPERCALEMIA — a sequência tem TRÊS tempos…" +
 *       " " + CALCIO_EQUIVALENCIA + " (2) DESLOCAR o potássio…";
 *
 * A chave foi gravada quando a frase terminava no primeiro pedaço. Depois a
 * auditoria acrescentou a equivalência dos sais e o segundo tempo: a string
 * cresceu, a chave ficou, e `tr()` devolveu o original — em silêncio.
 *
 * ⚠️ E A VARREDURA DE FONTE NÃO PODIA VER: no arquivo existem TRÊS literais
 * curtos, cada um com a sua chave. Quem monta a frase de 722 caracteres é o
 * programa. R-82.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const avisos = [];
let ok = 0;

// ── 1 · O DICIONÁRIO — chaves derivadas dos arquivos, não listadas ─────────
const chaves = new Set();
function lerDicionarios(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { lerDicionarios(p); continue; }
    if (!/\.ts$/.test(e.name)) continue;
    const s = fs.readFileSync(p, "utf8");
    for (const m of s.matchAll(/^\s{2,}"((?:[^"\\]|\\.)*)":/gm)) {
      try { chaves.add(JSON.parse('"' + m[1] + '"')); } catch { /* chave malformada */ }
    }
  }
}
lerDicionarios(path.join(appDir, "lib", "i18n"));
lerDicionarios(path.join(appDir, "acls", "locales"));

if (chaves.size < 5000) {
  falhas.push(`só ${chaves.size} chaves de tradução lidas — esperado 10.000+. O extrator pode ter quebrado.`);
} else ok++;

// ── 2 · O UNIVERSO: O ARTEFATO COMPILADO ──────────────────────────────────
//
// ⚠️ ESTE É O PONTO INTEIRO DA TRAVA. Ler o fonte devolveria os pedaços; só o
// artefato emitido devolve a frase que a tela recebe.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "trad-runtime-"));
const libs = fs.readdirSync(path.join(appDir, "lib"))
  .filter((f) => /\.ts$/.test(f))
  .map((f) => path.join("lib", f));
const arvores = fs.readdirSync(appDir).filter((f) => /-decision-tree\.ts$|-tree\.ts$/.test(f));

try {
  execFileSync("npx", [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule",
    "--outDir", tempDir, ...libs, ...arvores,
  ], { cwd: appDir, stdio: "pipe" });
} catch (erro) {
  // ⚠️ `tsc` pode reclamar de tipos e AINDA emitir. Só é falha se não emitiu.
  avisos.push("tsc emitiu com diagnósticos — o que importa é se os .js existem.");
}

/** Marca de português que um identificador nunca tem. */
const PT = /[ãõ]|ç[aãeoóú]|\b(não|você|então|após|até|deve|pelo|pela|para o|para a|com o|com a)\b/i;

const emRuntime = [];
function coletar(rel) {
  const js = path.join(tempDir, rel.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(js)) return false;
  let mod;
  try { mod = require(js); } catch { return false; }
  const anda = (v, nome) => {
    if (typeof v === "string") {
      if (v.length < 20 || !PT.test(v)) return;
      emRuntime.push({ rel, nome, t: v });
      return;
    }
    if (Array.isArray(v)) { v.forEach((x, i) => anda(x, `${nome}[${i}]`)); return; }
    if (v && typeof v === "object" && !(v instanceof Date)) {
      for (const [k, x] of Object.entries(v)) {
        if (typeof x === "function") continue;
        anda(x, `${nome}.${k}`);
      }
    }
  };
  for (const [k, v] of Object.entries(mod)) anda(v, k);
  return true;
}
const emitidos = [...libs, ...arvores].filter(coletar).length;

// ── Vacuidade: universo vazio PASSA CALADO, e passar calado é o defeito ────
if (emitidos < 60) {
  falhas.push(
    `só ${emitidos} de ${libs.length + arvores.length} arquivos compilaram e carregaram — a trava pode ter rodado sobre NADA (R-15 item 9).\n` +
    `      ⚠️ Sem artefato, esta conferência não tem universo: ela lê o programa MONTADO, não o fonte.`
  );
} else ok++;
if (emRuntime.length < 1500) {
  falhas.push(`só ${emRuntime.length} strings PT em runtime — esperado 2.500+. O caminhamento pode ter quebrado.`);
} else ok++;

// ── 3 · A CONFERÊNCIA ─────────────────────────────────────────────────────
//
// ── O LEGADO FOI A ZERO EM 2026-08-17, E O PISO É ZERO ────────────────────
//
// A medição encontrou 35 ocorrências / 27 frases distintas montadas sem chave —
// conteúdo clínico que saía em português com o app em espanhol. As 27 foram
// traduzidas em `lib/i18n/modules/frases-montadas-em-runtime.ts` no mesmo bloco.
//
// ⚠️ POR ISSO A TABELA ESTÁ VAZIA, E DEVE CONTINUAR: qualquer frase que apareça
// aqui é regressão, não legado. Não acrescente linha para "passar" — a linha
// significa "o médico lê português nesta tela", e é isso que ela vai dizer para
// quem a ler depois. Se houver mesmo um caso que não dá para traduzir agora,
// escreva o motivo junto e abra dívida nomeada.
const LEGADO = {};

// Zero frases distintas sem chave. Não é teto a descer: é piso a manter.
const TETO_UNICAS = 0;

const semChave = emRuntime.filter((x) => !chaves.has(x.t));
const porArquivo = {};
for (const x of semChave) (porArquivo[x.rel] ??= []).push(x);

for (const [rel, itens] of Object.entries(porArquivo)) {
  const teto = LEGADO[rel];
  if (teto === undefined) {
    falhas.push(
      `\`${rel}\`: ${itens.length} frase(s) MONTADAS sem chave no dicionário — saem em PORTUGUÊS com o app em espanhol.\n` +
      itens.slice(0, 4).map((x) => `        ${x.nome}: « ${x.t.slice(0, 68)}… »`).join("\n") + "\n" +
      `      ⚠️ A varredura de FONTE não vê isto e está certa: no arquivo há literais curtos, cada um\n` +
      `      com a sua chave. Quem monta a frase inteira é o PROGRAMA (R-82).\n` +
      `      ➜ Grave a chave da string COMO ELA FICA EM RUNTIME. Se a frase é composta, a saída\n` +
      `      melhor é a constante viajar INTEIRA (D-35) — concatenação torna a chave perecível.`
    );
  } else if (itens.length > teto) {
    falhas.push(
      `\`${rel}\` piorou: ${itens.length} frases montadas sem chave, contra um teto de ${teto}.\n` +
      itens.slice(0, 3).map((x) => `        ${x.nome}: « ${x.t.slice(0, 68)}… »`).join("\n")
    );
  } else {
    ok++;
    if (itens.length < teto) {
      avisos.push(`${rel}: caiu de ${teto} para ${itens.length} — baixe o teto para travar o ganho.`);
    }
  }
}
for (const rel of Object.keys(LEGADO)) {
  if (!porArquivo[rel]) avisos.push(`${rel} zerou — remova a linha do legado.`);
}

const unicas = new Set(semChave.map((x) => x.t));
if (unicas.size > TETO_UNICAS) {
  falhas.push(
    `${unicas.size} FRASES DISTINTAS montadas sem chave, contra um piso de ${TETO_UNICAS}.\n` +
    `      ⚠️ O teto por arquivo pode ter passado: deduplicar uma repetição abre vaga para uma frase nova.`
  );
} else {
  ok++;
  if (unicas.size < TETO_UNICAS) {
    avisos.push(`frases distintas sem chave: ${unicas.size} contra piso ${TETO_UNICAS}.`);
  }
}

// ── 4 · A ASSINATURA DO DEFEITO, contada e relatada ───────────────────────
//
// Frase sem chave que COMEÇA com uma chave existente = a chave é de uma versão
// ANTERIOR. É o rastro exato de "a auditoria acrescentou texto a uma frase que
// já tinha tradução".
// ⚠️ NOS TRÊS SENTIDOS — prefixo, sufixo e meio.
//
// A primeira versão só testava `startsWith`, e por isso classificava como "sem
// chave nenhuma" duas frases da Sedoanalgesia cuja tradução JÁ EXISTIA: o render
// prefixava `"• "` ao texto, e o crescimento era no INÍCIO.
//
// O custo não é de precisão, é de TRABALHO: o relatório mandava escrever uma
// tradução que já estava no dicionário. Relatório que erra o mecanismo faz a
// pessoa consertar a coisa errada.
const grandes = [...chaves].filter((c) => c.length > 40);
const ondeCresceu = (frase) => {
  for (const c of grandes) {
    if (frase.startsWith(c)) return "fim";      // a chave é o começo → cresceu no fim
    if (frase.endsWith(c)) return "início";     // a chave é o fim    → cresceu no início
    if (frase.includes(c)) return "nas duas pontas";
  }
  return null;
};
const perecidas = [];
const porOnde = { fim: 0, "início": 0, "nas duas pontas": 0 };
for (const x of semChave) {
  const onde = ondeCresceu(x.t);
  if (onde) { perecidas.push(x); porOnde[onde] += 1; }
}
if (perecidas.length) {
  const detalhe = Object.entries(porOnde)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} no ${k}`)
    .join(" · ");
  avisos.push(
    `${perecidas.length} das ${semChave.length} frases sem chave CONTÊM uma chave existente ` +
    `(${detalhe}) — a tradução foi gravada antes de a frase crescer (D-35).\n` +
    `      ➜ Crescimento no INÍCIO costuma ser caractere de apresentação colado ao texto ` +
    `(bullet, seta, emoji): a tradução existe, o que quebrou foi a chave (D-51).`
  );
}

console.log("\nO que a tela recebe tem tradução — conferido no artefato COMPILADO\n");
for (const a of avisos) console.log(`ℹ️  ${a}`);
if (avisos.length) console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(
  `✅ ${ok} conferências — ${emRuntime.length} strings PT montadas em ${emitidos} artefatos, ` +
  `${emRuntime.length - semChave.length} com chave, ${semChave.length} sem — o piso é zero\n`
);
process.exit(0);
