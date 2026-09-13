#!/usr/bin/env node
/**
 * PROVA — NIHSS: item NÃO TESTÁVEL (UN) no módulo AVC · AC-01 de
 * `docs/avc/auditoria-vs-spec.md`.
 *
 * PROMETE: que (a) o item 10 não pontua intubação como 2; (b) 5a, 5b, 6a, 6b e 7
 * aceitam UN por amputação ou fusão articular, e 10 aceita UN por intubação ou
 * outra barreira física, cada UN com justificativa escrita; (c) o UN não entra na
 * soma, o total é dito como "X, com N itens não testáveis", e nenhuma regra
 * recebe esse número como total completo; (d) a nota sobre itens não testáveis
 * mora no campo do AVC.
 * NÃO PROMETE: que a pontuação de cada item esteja certa para o paciente, nem
 * que a decisão sobre usar um total com UN em critério de trombectomia esteja
 * tomada — ela é do autor (pendente).
 * UNIVERSO: `avc/conteudo/nihss.ts`, `lib/nihss.ts`, `avc/nucleo/derivacoes-b.ts`,
 * `components/avc/campo-de-escala.tsx`, `clinical-calculators-engine.ts` (item 10).
 * FONTE: `protocols/fontes-verbatim/nih-nihss-2024.md` (NINDS, fev. 2024).
 * DECISÃO DO AUTOR (2026-09-13): UN fora da soma e a forma do texto do total.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nihss-un-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "derivacoes-b.ts"),
    path.join(appDir, "avc", "nucleo", "estado.ts"),
    path.join(appDir, "avc", "nucleo", "relogio.ts"),
    path.join(appDir, "avc", "conteudo", "nihss.ts"),
    path.join(appDir, "lib", "nihss.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const DB = emT("avc", "nucleo", "derivacoes-b.js");
const C = emT("avc", "conteudo", "nihss.js");
const L = emT("lib", "nihss.js");
const ler = (...p) => fs.readFileSync(path.join(appDir, ...p), "utf8");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
/** ⚠️ API ainda inexistente ⇒ falha nomeada, e a prova segue. */
function tentar(nome, fn) {
  try { return fn(); } catch (e) {
    conf(nome, false, `⛔ ${String(e && e.message).slice(0, 160)}`);
    return undefined;
  }
}

const ACEITAM_UN = ["5a", "5b", "6a", "6b", "7", "10"];
const IDS = C.ITENS_NIHSS.map((v) => v.id);
const NAO_ACEITAM_UN = IDS.filter((id) => !ACEITAM_UN.includes(id));
const UN = C.NAO_TESTAVEL ?? "nao_testavel";

/* ══ (a) ITEM 10: intubação ⛔ não é 2 ══════════════════════════════════════ */

const item10 = C.ITENS_NIHSS.find((v) => v.id === "10");
conf("(a) nenhuma opção pontuada do item 10 nomeia intubação",
  item10 && item10.options.every((o) => !/intubad|intubaç/i.test(o.label)),
  `⛔ ${JSON.stringify(item10 && item10.options)} — NIH p.6: intubação é UN, e o 2 é "Severe dysarthria… or is mute/anarthric"`);
conf("(a) o conteúdo do AVC cita a fonte NIH transcrita",
  /nih-nihss-2024\.md/.test(ler("avc", "conteudo", "nihss.ts")),
  "⛔ avc/conteudo/nihss.ts não aponta para protocols/fontes-verbatim/nih-nihss-2024.md");

/* ══ (b) QUEM ACEITA UN, e UN exige justificativa ═══════════════════════════ */

const aceita = C.ITENS_QUE_ACEITAM_NAO_TESTAVEL;
conf("(b) 5a, 5b, 6a, 6b, 7 e 10 aceitam UN",
  aceita !== undefined && ACEITAM_UN.every((id) => typeof aceita[id] === "string" && aceita[id].length > 0),
  `⛔ ${JSON.stringify(aceita)}`);
conf("(b) 1a, 1b, 1c, 2, 3, 4, 8, 9 e 11 ⛔ não aceitam UN",
  aceita !== undefined && NAO_ACEITAM_UN.every((id) => aceita[id] === undefined),
  `⛔ ${JSON.stringify(aceita)} — NIH: 11 "is never untestable"; 1a "must choose a response"`);
conf("(b) o motivo dos membros nomeia amputação e fusão articular",
  aceita !== undefined && ["5a", "5b", "6a", "6b", "7"].every((id) => /amputa/i.test(aceita[id]) && /fus[ãa]o/i.test(aceita[id])),
  `⛔ ${JSON.stringify(aceita)}`);
conf("(b) o motivo do item 10 nomeia intubação e outra barreira física",
  aceita !== undefined && /intuba/i.test(aceita["10"] ?? "") && /barreira/i.test(aceita["10"] ?? ""),
  `⛔ ${JSON.stringify(aceita && aceita["10"])}`);

const tudo = (v) => Object.fromEntries(IDS.map((id) => [id, v]));
const soma = (r, j) => tentar("(b/c) somaDoNihss existe", () => C.somaDoNihss(r, j));

const semJust = soma({ ...tudo(0), "10": UN }, {});
conf("(b) UN ⛔ sem justificativa ⛔ não completa a escala",
  semJust !== undefined && semJust.completa === false && semJust.faltamJustificar.includes("10"),
  `⛔ ${JSON.stringify(semJust)}`);
const brancos = soma({ ...tudo(0), "5a": UN }, { "5a": "   " });
conf("(b) justificativa só com espaços ⛔ não vale",
  brancos !== undefined && brancos.completa === false && brancos.faltamJustificar.includes("5a"),
  `⛔ ${JSON.stringify(brancos)}`);
const comJust = soma({ ...tudo(0), "5a": UN }, { "5a": "Amputação transumeral esquerda" });
conf("(b) UN com justificativa escrita completa a escala",
  comJust !== undefined && comJust.completa === true && comJust.faltamJustificar.length === 0,
  `⛔ ${JSON.stringify(comJust)}`);
const unNo9 = soma({ ...tudo(0), "9": UN }, { "9": "intubado" });
conf("(b) UN num item que ⛔ não aceita UN (9) ⛔ não completa",
  unNo9 !== undefined && unNo9.completa === false,
  `⛔ ${JSON.stringify(unNo9)} — NIH p.6: "The intubated patient should be asked to write"`);

/* ══ (c) UN fora da soma; o texto do total diz quantos; regra ⛔ não recebe ════ */

const c1 = soma({ ...tudo(1), "10": UN }, { "10": "Intubação orotraqueal" });
conf("(c) o UN ⛔ não entra na soma (14 itens × 1 = 14)",
  c1 !== undefined && c1.soma === 14 && JSON.stringify(c1.naoTestaveis) === JSON.stringify(["10"]),
  `⛔ ${JSON.stringify(c1)}`);

const texto = (s, n) => tentar("(c) textoDoTotalNihss existe", () => L.textoDoTotalNihss(s, n));
conf('(c) "14, com 1 item não testável"', texto(14, 1) === "14, com 1 item não testável", `⛔ ${JSON.stringify(texto(14, 1))}`);
conf('(c) "9, com 2 itens não testáveis"', texto(9, 2) === "9, com 2 itens não testáveis", `⛔ ${JSON.stringify(texto(9, 2))}`);
conf('(c) sem UN, o total é só o número', texto(14, 0) === "14", `⛔ ${JSON.stringify(texto(14, 0))}`);

/* A trilha como a tela grava: um fato por item, a justificativa, e a soma. */
const rel = R.relogioControlado(1_800_000_000_000);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
let comUn = E.abrirAtendimento(rel);
for (const id of IDS) comUn = reg(comUn, C.CAMPO_DE_ITEM(id), id === "10" ? UN : 1);
comUn = reg(comUn, "nihss_10_justificativa", "Intubação orotraqueal");
comUn = reg(comUn, "nihss_calculado", 14);

conf("(c) com UN, ⛔ nenhuma regra recebe um NIHSS calculado como total completo",
  DB.nihssCalculado(comUn) === undefined,
  `⛔ nihssCalculado = ${JSON.stringify(DB.nihssCalculado(comUn))} — o critério de trombectomia (NIHSS ≥ 6) leria este número como escore completo`);
conf("(c) ⛔ e o contexto da Table 4 ⛔ não se estabelece por soma com UN",
  DB.contextoDaTable4(comUn) === "nao_estabelecido",
  `⛔ ${DB.contextoDaTable4(comUn)}`);
const leitura = tentar("(c) leituraDoNihssCalculado existe", () => DB.leituraDoNihssCalculado(comUn));
conf("(c) a leitura para a tela devolve a soma ⛔ e os itens não testáveis",
  leitura !== undefined && leitura.soma === 14 && JSON.stringify(leitura.naoTestaveis) === JSON.stringify(["10"]),
  `⛔ ${JSON.stringify(leitura)}`);
conf("(c) a escala com UN justificado conta como preenchida",
  DB.escalaPreenchida(comUn) === true,
  `⛔ escalaPreenchida = ${DB.escalaPreenchida(comUn)}`);

let bracoUn = E.abrirAtendimento(rel);
for (const id of IDS) bracoUn = reg(bracoUn, C.CAMPO_DE_ITEM(id), id === "5a" ? UN : 0);
bracoUn = reg(bracoUn, "nihss_5a_justificativa", "Amputação transumeral esquerda");
conf("(c) braço UN ⛔ não deriva 'sem fraqueza contra a gravidade'",
  DB.achadoDerivado(bracoUn, "t4_fraqueza_contra_gravidade") === undefined,
  `⛔ ${DB.achadoDerivado(bracoUn, "t4_fraqueza_contra_gravidade")}`);
conf("(c) ⛔ nem lateralidade",
  DB.lateralidadeDerivada(bracoUn) === undefined,
  `⛔ ${DB.lateralidadeDerivada(bracoUn)}`);

let semUn = E.abrirAtendimento(rel);
for (const id of IDS) semUn = reg(semUn, C.CAMPO_DE_ITEM(id), 1);
conf("(c) controle: sem UN, o total completo continua chegando às regras",
  DB.nihssCalculado(semUn) === 15,
  `⛔ ${DB.nihssCalculado(semUn)}`);

/* ══ (d) A NOTA no campo do AVC ══════════════════════════════════════════════ */

conf("(d) a nota sobre itens não testáveis existe no conteúdo do AVC",
  typeof C.NOTA_NAO_TESTAVEL === "string" && /não testáve/i.test(C.NOTA_NAO_TESTAVEL),
  `⛔ ${JSON.stringify(C.NOTA_NAO_TESTAVEL)}`);
const campo = ler("components", "avc", "campo-de-escala.tsx");
conf("(d) o campo do AVC desenha a nota, com testID próprio",
  /NOTA_NAO_TESTAVEL/.test(campo) && /avc-escala-nota-nao-testavel/.test(campo),
  "⛔ components/avc/campo-de-escala.tsx não mostra a nota");

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA NIHSS NÃO TESTÁVEL — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
