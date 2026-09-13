#!/usr/bin/env node
/**
 * PROVA · AS MUTAÇÕES NUNCA TOCAM A ÁRVORE DE TRABALHO (2026-09-13).
 *
 * O DEFEITO QUE ISTO FECHA: `scripts/mutacoes/lib.cjs` gravava cada mutação no
 * arquivo REAL da árvore e só restaurava no `finally`. Às 11:55:25 de 2026-09-13,
 * `test:mutacoes` escreveu "a ação de F sai do registro do módulo" em
 * `avc/conteudo/campos.ts` enquanto um `build:web:teste` empacotava (até 11:55:34):
 * o `dist` saiu com o registro da trombólise sem instância, e 4 e2e caíram. Prova
 * vermelha do mecanismo: com só essa mutação aplicada, o fato de `ivt_estado` é
 * gravado sem instância; restaurado o arquivo, grava em `trombolise_iv_1`.
 *
 * PROMETE: que, enquanto a trava de uma mutação roda, o arquivo REAL da árvore
 * continua com o conteúdo original; que a mutação foi de fato aplicada — numa cópia
 * isolada, onde a trava roda —; e que, ao fim, a árvore real está idêntica ao
 * começo.
 * NÃO PROMETE: que as mutações do AVC continuem reprovando (isso é `test:mutacoes`);
 * nem proteção contra outro processo que escreva na árvore por conta própria.
 * UNIVERSO: `scripts/mutacoes/lib.cjs` (`rodarConjunto`), com uma mutação-sonda em
 * `avc/conteudo/campos.ts` e uma trava-sonda.
 * FONTE: diagnóstico de 2026-09-13 (registro da trombólise sem instância no `dist`).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");

const appDir = path.resolve(__dirname, "..");
const { rodarConjunto } = require("./mutacoes/lib.cjs");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

const ALVO = "avc/conteudo/campos.ts";
const real = path.join(appDir, ALVO);
const hash = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const antes = hash(real);
const ancora = "export function campoDoModulo(";
conf("controle: a âncora da sonda existe no arquivo real", fs.readFileSync(real, "utf8").includes(ancora), "⛔ âncora ausente");

const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "sonda-mutacao-"));
const observacao = path.join(pasta, "observacao.json");
const trava = path.join(pasta, "trava-sonda.cjs");
const MARCA = "/* SONDA-DE-MUTACAO */";
fs.writeFileSync(trava, `
const fs = require("fs"); const path = require("path");
const realConteudo = fs.readFileSync(${JSON.stringify(real)}, "utf8");
const localConteudo = fs.readFileSync(path.join(process.cwd(), ${JSON.stringify(ALVO)}), "utf8");
fs.writeFileSync(${JSON.stringify(observacao)}, JSON.stringify({
  cwd: process.cwd(),
  realMutado: realConteudo.includes(${JSON.stringify(MARCA)}),
  localMutado: localConteudo.includes(${JSON.stringify(MARCA)}),
}));
process.exit(1);
`);

const saida = console.log;
console.log = () => {};
let r;
try {
  r = rodarConjunto({
    nome: "sonda de isolamento",
    trava,
    mutacoes: [{ arquivo: ALVO, nome: "sonda", de: ancora, para: `${MARCA}${ancora}` }],
  });
} finally {
  console.log = saida;
}

const obs = fs.existsSync(observacao) ? JSON.parse(fs.readFileSync(observacao, "utf8")) : undefined;
conf("a trava-sonda rodou", obs !== undefined, "⛔ sem observação");
conf("controle: a mutação foi aplicada onde a trava roda (⛔ prova vazia sem isto)", obs !== undefined && obs.localMutado === true, `⛔ ${JSON.stringify(obs)}`);
conf("⛔ durante a trava, o arquivo REAL da árvore ⛔ está mutado", obs !== undefined && obs.realMutado === false, `⛔ árvore real mutada durante a trava: ${JSON.stringify(obs)}`);
conf("a trava roda numa cópia isolada, ⛔ e ⛔ não na árvore de trabalho", obs !== undefined && path.resolve(obs.cwd) !== appDir, `⛔ cwd=${obs && obs.cwd}`);
conf("controle: a sonda conta como reprovada (a trava saiu com 1)", r !== undefined && r.reprovadas === 1 && r.ancorasQuebradas.length === 0, `⛔ ${JSON.stringify(r)}`);
conf("ao fim, a árvore real está idêntica ao começo", hash(real) === antes, "⛔ campos.ts mudou");

fs.rmSync(pasta, { recursive: true, force: true });
console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · MUTAÇÕES ISOLADAS — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
