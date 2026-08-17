#!/usr/bin/env node
/**
 * PROMETE: que a etiqueta de área não volte a ser depósito — nenhuma etiqueta
 *   cobre uma fatia grande demais do app, todo módulo tem etiqueta declarada,
 *   e toda etiqueta usada tem cor própria no hub.
 * NÃO PROMETE: que o nome seja o CERTO. Nenhuma trava sabe se "ARRITMIAS" lê
 *   melhor que "peri-parada" — isso é decisão de quem escreve.
 * UNIVERSO: os ids derivados de `clinical-modules.ts` (D-15), não uma lista à
 *   mão. Módulo novo entra no radar sozinho.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ─────────────────────────────────────
 *
 * "ACLS" cobria 9 dos 30 módulos; as outras 21 áreas tinham 1 cada. Não era uma
 * área entre outras — era o único agrupamento, e por isso recebeu tudo que
 * tocava parada, inclusive o Engasgo (OVACE), que trata paciente CONSCIENTE.
 *
 * ⚠️ E O DEFEITO É REINCIDENTE POR CONSTRUÇÃO. `MODULE_AREA_LABELS` é um
 * `Record` escrito à mão: quando o próximo módulo entrar, a etiqueta mais fácil
 * de digitar será a que já existe. O TETO abaixo é o que impede isso — ele
 * torna a acumulação uma falha de build, não uma escolha silenciosa.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const avisos = [];
let ok = 0;

const fonteModulos = fs.readFileSync(path.join(appDir, "clinical-modules.ts"), "utf8");
const modulos = [...fonteModulos.matchAll(/^\s{4}id: "([^"]+)",\n\s{4}title: "([^"]+)"/gm)]
  .map((m) => ({ id: m[1], title: m[2] }));

const fonteEtiquetas = fs.readFileSync(path.join(appDir, "constants/module-area-labels.ts"), "utf8");
const corpo = fonteEtiquetas.slice(
  fonteEtiquetas.indexOf("MODULE_AREA_LABELS: Record<string, string> = {"),
  fonteEtiquetas.indexOf("\n};")
);
const etiquetas = {};
for (const m of corpo.matchAll(/\n  "?([a-z0-9-]+)"?: "([^"]+)"/g)) etiquetas[m[1]] = m[2];

const fonteHub = fs.readFileSync(path.join(appDir, "components/module-hub.tsx"), "utf8");

if (modulos.length < 25) {
  falhas.push(`só ${modulos.length} módulos extraídos — a varredura pode ter rodado sobre nada (R-15 item 9).`);
} else ok++;
if (Object.keys(etiquetas).length < 25) {
  falhas.push(`só ${Object.keys(etiquetas).length} etiquetas lidas — o parser pode ter quebrado.`);
} else ok++;

// ── 1. COBERTURA: nenhum módulo cai no `?? "Módulo"` ───────────────────────
const semEtiqueta = modulos.filter((m) => !etiquetas[m.id]);
if (semEtiqueta.length) {
  falhas.push(
    `${semEtiqueta.length} módulo(s) sem etiqueta: ${semEtiqueta.map((m) => m.id).join(", ")}.\n` +
    `      ⚠️ Sem entrada, \`getModuleAreaLabel\` devolve "Módulo" — a etiqueta genérica ` +
    `cinza, que não diz cenário nenhum. É falha silenciosa: a tela renderiza e não avisa.`
  );
} else ok++;

const idsReais = new Set(modulos.map((m) => m.id));
const orfas = Object.keys(etiquetas).filter((id) => !idsReais.has(id));
if (orfas.length) {
  falhas.push(`etiqueta(s) para módulo inexistente: ${orfas.join(", ")}.`);
} else ok++;

// ── 2. O TETO DO DEPÓSITO — o núcleo desta trava ───────────────────────────
//
// ⚠️ O NÚMERO É MEDIDO, NÃO ARBITRADO. Depois da correção, a maior etiqueta
// ("PCR") cobre 3 módulos. O teto de 4 dá uma folga de um — cabe um módulo
// novo de parada sem discussão, e o quinto obriga a pergunta.
//
// O que ele impede é a volta do padrão: "ACLS" chegou a 9 de 30 (30% do app)
// sem que nada reclamasse.
const TETO_POR_ETIQUETA = 4;
const porEtiqueta = {};
for (const [id, e] of Object.entries(etiquetas)) (porEtiqueta[e] ??= []).push(id);

const inchadas = Object.entries(porEtiqueta).filter(([, ids]) => ids.length > TETO_POR_ETIQUETA);
if (inchadas.length) {
  falhas.push(
    `${inchadas.length} etiqueta(s) acima do teto de ${TETO_POR_ETIQUETA} módulos:\n` +
    inchadas.map(([e, ids]) => `        « ${e} » → ${ids.length}: ${ids.join(", ")}`).join("\n") + "\n" +
    `      ⚠️ Etiqueta que cobre muita coisa deixa de informar. Foi assim que "ACLS" ` +
    `chegou a 9 de 30 módulos e passou a dizer "parada" para um paciente de pé.\n` +
    `      A pergunta certa não é "qual nome dou ao grupo" — é "que CENÁRIO cada um destes ` +
    `módulos atende, e são mesmo o mesmo?".`
  );
} else ok++;

// ── 3. TODA ETIQUETA USADA TEM COR ─────────────────────────────────────────
//
// Sem isto, uma etiqueta nova cai no `?? CINZA_NEUTRO` do hub e fica idêntica à
// genérica — o médico vê um card cinza sem saber que a área existe. É o mesmo
// defeito da cobertura, uma camada abaixo, e igualmente silencioso.
const semCor = [];
for (const e of Object.keys(porEtiqueta)) {
  const comoChave = new RegExp(`^\\s*"?${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"?:`, "m");
  if (!comoChave.test(fonteHub)) semCor.push(e);
}
if (semCor.length) {
  falhas.push(
    `${semCor.length} etiqueta(s) sem entrada em AREA_PALETTE: ${semCor.map((e) => `« ${e} »`).join(", ")}.\n` +
    `      ⚠️ Cai no cinza genérico e fica indistinguível de "Módulo". Reuse uma paleta ` +
    `existente quando a família for a mesma — reuso de cor informa, cor nova só decora.`
  );
} else ok++;

// ── 4. A ETIQUETA NÃO REPETE O TÍTULO ──────────────────────────────────────
//
// Etiqueta que copia o título gasta a linha sem acrescentar. Aviso, não falha:
// há casos legítimos ("Anafilaxia", "Choque"), em que o título É o cenário e
// qualquer outra palavra seria pior.
for (const m of modulos) {
  const e = etiquetas[m.id];
  if (!e) continue;
  const norm = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (norm(m.title) === norm(e)) avisos.push(`« ${e} » repete o título de ${m.id} — confira se acrescenta algo.`);
}
ok++;

console.log("\nA etiqueta diz o cenário, e nenhuma vira depósito\n");
for (const a of avisos) console.log(`ℹ️  ${a}`);
if (avisos.length) console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
const maior = Object.entries(porEtiqueta).sort((a, b) => b[1].length - a[1].length)[0];
console.log(
  `✅ ${ok} conferências — ${modulos.length} módulos em ${Object.keys(porEtiqueta).length} áreas; ` +
  `a maior é « ${maior[0]} » com ${maior[1].length} (teto ${TETO_POR_ETIQUETA})\n`
);
process.exit(0);
