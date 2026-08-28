/**
 * PROVA NEGATIVA · a varredura de PT e a mensagem de invariante numa linha só.
 *
 * ── POR QUE ESTA PROVA EXISTE ──────────────────────────────────────────────
 *
 * `isInvariantMessage` olhava apenas as 8 linhas ANTERIORES ao literal
 * (`j < i`). Reconhecia o lançamento quebrado em várias linhas e ⛔ NÃO
 * reconhecia a forma de uma linha só — que é a mais comum:
 *
 *     if (x) throw new Error("mensagem");
 *
 * O efeito era cobrar tradução de mensagem de exceção. Quem a lê está
 * depurando, e ela precisa casar com o que está escrito no código.
 *
 * ⚠️ O SINTOMA QUE DENUNCIOU A FALHA: ao escrever a guarda de
 * `avc/nucleo/relogio.ts`, a saída só ficou verde depois de eu QUEBRAR o throw
 * em três linhas. Contornar uma trava mudando o código é o sinal de que a trava
 * é que estava errada — não o código.
 *
 * ── O QUE ESTA PROVA MEDE ──────────────────────────────────────────────────
 *
 * Aplica a MESMA função do validador a três casos, incluindo o negativo que
 * importa: um literal em português que NÃO está num throw ⛔ continua sendo
 * cobrado. Uma correção que passasse a excluir tudo seria pior que o defeito.
 */
const fs = require("node:fs");
const path = require("node:path");

const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

// ── A função REAL do validador, extraída do arquivo ────────────────────────
//
// `varredura-pt.cjs` executa ao ser requerido (não tem module.exports nem
// guarda de require.main). Requerê-lo aqui rodaria a varredura inteira e
// mediria o repositório, não a regra. Então a função é lida do próprio arquivo
// e avaliada — assim a prova mede O CÓDIGO QUE ESTÁ EM PRODUÇÃO, e quebra se
// alguém a renomear ou apagar.
const fonte = fs.readFileSync(path.resolve(__dirname, "varredura-pt.cjs"), "utf8");
const trecho = fonte.match(/function isInvariantMessage\(lines, lit\) \{[\s\S]*?\n\}/);
if (!trecho) {
  console.error("❌ `isInvariantMessage` não foi encontrada em varredura-pt.cjs");
  process.exit(1);
}
// eslint-disable-next-line no-eval
const isInvariantMessage = eval(`(${trecho[0]})`);

const linhas = (s) => s.split("\n");

// ── Caso 1 · o que a correção conserta: throw de UMA LINHA ─────────────────
const umaLinha = linhas(`
export function avancar(ms) {
  if (ms < 0) throw new Error("o tempo não anda para trás");
}
`);
confere(
  "throw new Error na MESMA linha do literal é reconhecido",
  isInvariantMessage(umaLinha, "o tempo não anda para trás") === true,
  "era o defeito: a forma de uma linha caía na lista de pendências de tradução"
);

// ── Caso 2 · o que já funcionava, e não pode regredir ──────────────────────
const multiLinha = linhas(`
export function guarda(x) {
  if (!x) {
    throw new Error(
      "estado impossível na guarda"
    );
  }
}
`);
confere(
  "throw quebrado em várias linhas continua reconhecido",
  isInvariantMessage(multiLinha, "estado impossível na guarda") === true,
  "a correção não pode perder o caso que já era coberto"
);

// ── Caso 3 · A PROVA NEGATIVA — o que NÃO pode ser excluído ────────────────
//
// ⚠️ É o caso que dá sentido aos outros dois. Uma "correção" que devolvesse
// `true` para tudo faria os casos 1 e 2 passarem e destruiria a varredura.
const textoDeTela = linhas(`
export function Cabecalho() {
  return <Text>Pressão arterial do paciente</Text>;
}
`);
confere(
  "literal de TELA, fora de qualquer throw, NÃO é excluído",
  isInvariantMessage(textoDeTela, "Pressão arterial do paciente") === false,
  "excluir texto de tela apagaria a razão de a varredura existir"
);

// ── Caso 4 · negativo de distância — throw longe demais não vale ───────────
const longe = linhas(`
throw new Error("outra coisa");
${Array.from({ length: 12 }, (_, i) => `const linha${i} = 1;`).join("\n")}
const rotulo = "Texto visível ao médico";
`);
confere(
  "throw a mais de 8 linhas de distância NÃO exclui o literal",
  isInvariantMessage(longe, "Texto visível ao médico") === false,
  "a janela de 8 linhas é o que impede a exclusão de virar coringa"
);

if (falhas.length) {
  console.error(`\n❌ PROVA DA VARREDURA — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DA VARREDURA (throw de uma linha) — ${ok}/${ok} conferências`);
