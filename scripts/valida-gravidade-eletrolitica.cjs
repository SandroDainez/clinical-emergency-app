#!/usr/bin/env node
/**
 * PROMETE: que os 12 distúrbios eletrolíticos tenham a classificação de
 *   gravidade COMO DADO, cada degrau com procedência de ALVO NOMEADO; que
 *   nenhum distúrbio fique sem degrau de base; que `getSeveritySummary` não
 *   volte a comparar contra o valor do paciente; e que um distúrbio existente
 *   SÓ no dado seja classificado sem tocar no componente.
 * NÃO PROMETE: que os 12 cortes estejam clínicos certos — nenhum tem fonte
 *   ainda, e é exatamente isso que o campo `alvo` declara. Também não cobre o
 *   resto da tela: imprime, a cada rodada, quantas comparações contra o valor
 *   do paciente continuam no componente (D-84).
 * UNIVERSO: `lib/eletrolitos/gravidade.ts`, compilado, com piso no retrato de
 *   2026-08-23 (12 distúrbios, 24 degraus).
 *
 * A GRAVIDADE ELETROLÍTICA CONTINUA SENDO DADO — e o componente continua sem
 * classificar.
 *
 * ⚠️ O QUE ESTA TRAVA IMPEDE: que o próximo corte volte para dentro do JSX. A
 * extração é barata de fazer e barata de desfazer — basta alguém escrever
 * `current < 3` numa condição de tela e o conteúdo clínico volta a morar onde
 * nenhum instrumento o vê.
 *
 * ⚠️ E ELA CONFERE O QUE FOI EXTRAÍDO, não se a extração aconteceu: conta os
 * degraus, exige procedência com ALVO nomeado em cada um, e prova que um
 * distúrbio que existe SÓ no dado é classificado sem ninguém tocar no
 * componente.
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");
const { conferirUniverso } = require("./lib/universo.cjs");

const RAIZ = path.resolve(__dirname, "..");
const TELA = path.join(RAIZ, "components", "protocol-screen", "electrolyte-calculator-screen.tsx");
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "grav-"));
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(RAIZ, "lib", "eletrolitos", "gravidade.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
const G = require(path.join(tmp, "eletrolitos", "gravidade.js"));

// ── 1. UNIVERSO ANTES DO RESULTADO
const disturbios = Object.keys(G.GRAVIDADE_POR_DISTURBIO);
const degraus = disturbios.flatMap((d) => G.GRAVIDADE_POR_DISTURBIO[d]);
const cortesNumericos = degraus.flatMap((d) => d.cortes).filter((c) => "valor" in c);
console.log(`\nUNIVERSO: ${disturbios.length} distúrbios · ${degraus.length} degraus · ${cortesNumericos.length} cortes numéricos`);
let ok = conferirUniverso("gravidade-eletrolitica", "disturbios", disturbios.length);
ok = conferirUniverso("gravidade-eletrolitica", "degraus", degraus.length) && ok;
if (!ok) falhas++;

// ── 2. TODO DEGRAU DECLARA PROCEDÊNCIA COM ALVO NOMEADO
for (const d of disturbios)
  for (const g of G.GRAVIDADE_POR_DISTURBIO[d]) {
    if (!g.procedencia) erro(`${d} · "${g.rotulo}" sem procedência`);
    else if (!g.procedencia.alvo || g.procedencia.alvo.trim().length < 20)
      erro(`${d} · "${g.rotulo}" com alvo vazio ou genérico — pendência sem alvo é campo em branco com outro nome`);
  }

// ── 3. TODO DISTÚRBIO TERMINA EM `restante`
for (const d of disturbios) {
  const lista = G.GRAVIDADE_POR_DISTURBIO[d];
  const ultimo = lista[lista.length - 1];
  if (!ultimo.cortes.some((c) => c.tipo === "restante"))
    erro(`${d} não termina em degrau "restante" — valor fora de todos os cortes ficaria SEM classificação`);
  for (let i = 0; i < lista.length - 1; i++)
    if (lista[i].cortes.some((c) => c.tipo === "restante"))
      erro(`${d} tem "restante" no degrau ${i + 1} de ${lista.length} — ele engole os seguintes`);
}

// ── 4. O COMPONENTE NÃO CLASSIFICA MAIS
// ⚠️ Procura COMPARAÇÃO CONTRA O VALOR ATUAL, que é a forma que a classificação
// tinha. Não é busca por número: a tela tem números legítimos (faixas de
// entrada, conversões de unidade) e acusá-los seria ruído.
const tela = fs.readFileSync(TELA, "utf8");
const corpo = tela.slice(tela.indexOf("function getSeveritySummary("));
const fim = corpo.indexOf("\n}\n");
const comparacoes = [...corpo.slice(0, fim).matchAll(/\bcurrent\s*(?:<|>|<=|>=|===|!==)\s*-?\d/g)].map((m) => m[0]);
if (comparacoes.length) erro(`getSeveritySummary voltou a classificar por número: ${comparacoes.join(" · ")}`);

// ⚠️ O QUE AINDA NÃO SAIU, CONTADO E NÃO ESCONDIDO (D-84). A extração desta
// rodada foi a CAMADA DE GRAVIDADE. O resto da tela — detecção do distúrbio,
// meta automática, e o `calculateResult` de 1.300 linhas — continua comparando
// contra o valor do paciente dentro do componente. Imprimir o número é a
// diferença entre "extraído" e "extraída uma camada".
const restantes = [...tela.matchAll(/\bcurrent\s*(?:<|>|<=|>=|===|!==)\s*-?\d/g)].length;
console.log(`⚠️ Comparações contra o valor do paciente AINDA no componente, fora da gravidade: ${restantes} (D-84)`);

// ── 5. O DISTÚRBIO FICTÍCIO — só no dado, sem tocar no componente
const FICTICIO = "sandroemia";
G.GRAVIDADE_POR_DISTURBIO[FICTICIO] = [
  { rotulo: "Grave (fictício)", sinais: "linha de teste", cortes: [{ tipo: "abaixoDe", valor: 42 }], procedencia: { fonte: null, alvo: "teste — não é afirmação clínica" } },
  { rotulo: "Moderada (fictício)", sinais: "linha de teste", cortes: [{ tipo: "restante" }], procedencia: { fonte: null, alvo: "teste — não é afirmação clínica" } },
];
const grave = G.degrauDeGravidade(FICTICIO, 10);
const moderada = G.degrauDeGravidade(FICTICIO, 99);
if (grave?.rotulo !== "Grave (fictício)" || moderada?.rotulo !== "Moderada (fictício)")
  erro(`distúrbio que existe só no dado não foi classificado — a tela ainda depende de código por distúrbio`);
if (G.degrauDeGravidade("nao-existe-este", 10) !== null)
  erro(`distúrbio desconhecido recebeu degrau por omissão — deveria ser null`);

console.log(falhas ? `\n❌ ${falhas} falha(s)` : `\n✅ ${degraus.length} degraus, ${cortesNumericos.length} cortes, todos com alvo de fonte nomeado · o componente não classifica · distúrbio só-no-dado classifica`);
process.exit(falhas ? 1 : 0);
