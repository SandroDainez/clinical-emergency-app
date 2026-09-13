#!/usr/bin/env node
/**
 * PROVA — NIHSS nos CRITÉRIOS de trombectomia (D-PEND-13), NIHSS de outro serviço
 * (D-PEND-14) e a regra UN compartilhada com a calculadora avulsa (AC-29).
 *
 * PROMETE: que, com item não testável, a soma é limite inferior — satisfaz piso
 * (≥ 6, ≥ 10) quando parcial ≥ k, fica "inconclusiva" quando parcial < k (⛔ nunca
 * "não atendido"), ⛔ nunca satisfaz teto (6–9); que o NIHSS de outro serviço ⛔ não
 * alimenta critério nem reavaliação, só contexto quando "Não, escala completa"; e
 * que a calculadora avulsa usa a MESMA regra UN de `lib/nihss.ts`.
 * NÃO PROMETE: que os limiares da fonte estejam certos — eles ⛔ não foram mexidos.
 * UNIVERSO: `avc/nucleo/{derivacoes-f,derivacoes-b,derivacoes,apresentacao-f,
 * veredito-da-trombectomia,sintese-do-caso}.ts`, `avc/conteudo/{nihss,superficie-b}.ts`,
 * `lib/nihss.ts`, `components/protocol-screen/clinical-calculators-screen.tsx`.
 * FONTE: `docs/decisoes.md` D-PEND-13 e D-PEND-14 (decisões do autor, 2026-09-13;
 * a fonte NIH ⛔ não define soma com UN) · `protocols/fontes-verbatim/nih-nihss-2024.md`.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nihss-criterios-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    ...[
      ["avc", "nucleo", "derivacoes-f.ts"], ["avc", "nucleo", "derivacoes-b.ts"],
      ["avc", "nucleo", "derivacoes.ts"], ["avc", "nucleo", "apresentacao-f.ts"],
      ["avc", "nucleo", "veredito-da-trombectomia.ts"], ["avc", "nucleo", "sintese-do-caso.ts"],
      ["avc", "nucleo", "estado.ts"], ["avc", "nucleo", "relogio.ts"],
      ["avc", "conteudo", "nihss.ts"], ["avc", "conteudo", "superficie-f.ts"],
      ["avc", "conteudo", "superficie-b.ts"], ["avc", "conteudo", "campo.ts"],
      ["lib", "nihss.ts"],
    ].map((p) => path.join(appDir, ...p)),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const ler = (...p) => fs.readFileSync(path.join(appDir, ...p), "utf8");
const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const DF = emT("avc", "nucleo", "derivacoes-f.js");
const DB = emT("avc", "nucleo", "derivacoes-b.js");
const D = emT("avc", "nucleo", "derivacoes.js");
const APF = emT("avc", "nucleo", "apresentacao-f.js");
const SIN = emT("avc", "nucleo", "sintese-do-caso.js");
const C = emT("avc", "conteudo", "nihss.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const SB = emT("avc", "conteudo", "superficie-b.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const L = emT("lib", "nihss.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
function tentar(nome, fn) {
  try { return fn(); } catch (e) {
    conf(nome, false, `⛔ ${String(e && e.message).slice(0, 160)}`);
    return undefined;
  }
}

/* ── fixtures ─────────────────────────────────────────────────────────── */
const AGORA = 1_800_000_000_000;
const rel = R.relogioControlado(AGORA);
const vazio = E.abrirAtendimento(rel);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
const regEm = (e, campo, valor, t) => E.registrarFato(e, { campo, valor }, R.relogioControlado(t));
const UN = C.NAO_TESTAVEL ?? "nao_testavel";
const maximo = (item) => Math.max(...item.options.map((o) => o.points));

/** Escala preenchida item a item com soma `k`; `comUn` marca o item 10 como UN justificado. */
function escala(k, comUn) {
  let e = vazio;
  let resta = k;
  for (const item of C.ITENS_NIHSS) {
    if (comUn && item.id === "10") {
      e = reg(e, C.CAMPO_DE_ITEM(item.id), UN);
      e = reg(e, "nihss_10_justificativa", "Intubação orotraqueal");
      continue;
    }
    const p = Math.min(maximo(item), resta);
    resta -= p;
    e = reg(e, C.CAMPO_DE_ITEM(item.id), p);
  }
  if (resta !== 0) throw new Error(`soma ${k} impossível`);
  return reg(e, "nihss_calculado", k);
}

const rec = (id) => SF.RECOMENDACOES.find((r) => r.id === id);
const nihssEm = (e, id) => DF.valorDoInsumoNaRecomendacao(e, rec(id), "nihss", AGORA);

/* ══ D-PEND-13 · corte ≥ 6 (evt_ant_1) ═════════════════════════════════════ */

conf("controle ≥ 6: escala completa 6 → satisfaz", nihssEm(escala(6, false), "evt_ant_1") === "satisfaz", `⛔ ${nihssEm(escala(6, false), "evt_ant_1")}`);
conf("controle ≥ 6: escala completa 5 → contradiz", nihssEm(escala(5, false), "evt_ant_1") === "contradiz", `⛔ ${nihssEm(escala(5, false), "evt_ant_1")}`);
conf("≥ 6 com UN: parcial 6 → satisfaz (limite inferior)", nihssEm(escala(6, true), "evt_ant_1") === "satisfaz", `⛔ ${nihssEm(escala(6, true), "evt_ant_1")}`);
conf("≥ 6 com UN: parcial 5 → inconclusivo, ⛔ nunca «não atendido»", nihssEm(escala(5, true), "evt_ant_1") === "inconclusivo", `⛔ ${nihssEm(escala(5, true), "evt_ant_1")}`);

/* ══ D-PEND-13 · corte ≥ 10 (evt_basilar_1) ════════════════════════════════ */

conf("controle ≥ 10: escala completa 9 → contradiz", nihssEm(escala(9, false), "evt_basilar_1") === "contradiz", `⛔ ${nihssEm(escala(9, false), "evt_basilar_1")}`);
conf("≥ 10 com UN: parcial 10 → satisfaz", nihssEm(escala(10, true), "evt_basilar_1") === "satisfaz", `⛔ ${nihssEm(escala(10, true), "evt_basilar_1")}`);
conf("≥ 10 com UN: parcial 9 → inconclusivo", nihssEm(escala(9, true), "evt_basilar_1") === "inconclusivo", `⛔ ${nihssEm(escala(9, true), "evt_basilar_1")}`);

/* ══ D-PEND-13 · faixa 6–9 (evt_basilar_2): teto ⛔ nunca satisfeito com UN ══ */

conf("controle 6–9: escala completa 7 → satisfaz", nihssEm(escala(7, false), "evt_basilar_2") === "satisfaz", `⛔ ${nihssEm(escala(7, false), "evt_basilar_2")}`);
conf("controle 6–9: escala completa 10 → contradiz", nihssEm(escala(10, false), "evt_basilar_2") === "contradiz", `⛔ ${nihssEm(escala(10, false), "evt_basilar_2")}`);
conf("6–9 com UN: parcial 7 → inconclusivo (⛔ teto nunca satisfeito)", nihssEm(escala(7, true), "evt_basilar_2") === "inconclusivo", `⛔ ${nihssEm(escala(7, true), "evt_basilar_2")}`);
conf("6–9 com UN: parcial 5 → inconclusivo", nihssEm(escala(5, true), "evt_basilar_2") === "inconclusivo", `⛔ ${nihssEm(escala(5, true), "evt_basilar_2")}`);
conf("6–9 com UN: parcial 10 → contradiz (o limite inferior já passa do teto)", nihssEm(escala(10, true), "evt_basilar_2") === "contradiz", `⛔ ${nihssEm(escala(10, true), "evt_basilar_2")}`);

const corr = tentar("correspondenciaDe aceita «inconclusivo»", () => DF.correspondenciaDe(["nihss"], () => "inconclusivo"));
conf("inconclusivo ⛔ não é «falta dado» nem «fora»: vira potencial, nomeado à parte",
  corr !== undefined && corr.correspondencia === "potencialmente_aplicavel"
  && Array.isArray(corr.inconclusivos) && corr.inconclusivos.includes("nihss") && !corr.faltam.includes("nihss"),
  `⛔ ${JSON.stringify(corr)}`);
conf("o veredito da trombectomia diz «inconclusivo por item não testável»",
  /inconclusivo por item não testável/i.test(ler("avc", "nucleo", "veredito-da-trombectomia.ts")),
  "⛔ avc/nucleo/veredito-da-trombectomia.ts não nomeia o inconclusivo");

/* ══ D-PEND-14 · escore de fora: contexto, ⛔ nunca critério ════════════════ */

const externo = reg(vazio, "nihss_informado", 14);
conf("controle: NIHSS calculado aqui 14 → satisfaz ≥ 6", nihssEm(escala(14, false), "evt_ant_1") === "satisfaz", "⛔ controle");
conf("NIHSS de fora 14, sozinho → ⛔ não alimenta critério", nihssEm(externo, "evt_ant_1") === undefined, `⛔ ${nihssEm(externo, "evt_ant_1")}`);
const externoCompleto = reg(externo, "nihss_informado_nao_testaveis", CAMPO.valorDaOpcao("Não, escala completa"));
conf("NIHSS de fora com «Não, escala completa» → ⛔ ainda não alimenta critério", nihssEm(externoCompleto, "evt_ant_1") === undefined, `⛔ ${nihssEm(externoCompleto, "evt_ant_1")}`);
conf("o campo que resolve o NIHSS de um critério é ⛔ só o calculado aqui",
  JSON.stringify(APF.CAMPOS_DO_INSUMO.nihss) === JSON.stringify(["nihss_calculado"]),
  `⛔ ${JSON.stringify(APF.CAMPOS_DO_INSUMO.nihss)}`);

const campoPergunta = SB.TODOS_OS_CAMPOS_B.find((c) => c.id === "nihss_informado_nao_testaveis");
conf("existe a pergunta «houve itens não testáveis?» junto do escore de fora",
  campoPergunta !== undefined
  && JSON.stringify(campoPergunta.opcoes) === JSON.stringify(["Não, escala completa", "Sim, houve itens não testáveis", CAMPO.NAO_SEI]),
  `⛔ ${JSON.stringify(campoPergunta)}`);

const fora = (e) => tentar("nihssExternoForaDaSintese existe", () => DB.nihssExternoForaDaSintese(e));
conf("sem resposta, o escore de fora fica ⛔ só na síntese", fora(externo) === false, `⛔ ${fora(externo)}`);
conf("«Sim, houve itens não testáveis» → só na síntese",
  fora(reg(externo, "nihss_informado_nao_testaveis", CAMPO.valorDaOpcao("Sim, houve itens não testáveis"))) === false, "⛔");
conf("«Não sei» → só na síntese",
  fora(reg(externo, "nihss_informado_nao_testaveis", CAMPO.valorDaOpcao(CAMPO.NAO_SEI))) === false, "⛔");
conf("«Não, escala completa» → pode aparecer como contexto", fora(externoCompleto) === true, `⛔ ${fora(externoCompleto)}`);

const corrigida = regEm(regEm(vazio, "glicemia", 48, 1_000_100), "glicemia", 110, 1_000_200);
conf("controle: NIHSS calculado aqui depois da correção → reavaliado",
  D.estadoDaReavaliacao(regEm(corrigida, "nihss_calculado", 3, 1_000_300)) === "reavaliado", "⛔ controle");
conf("NIHSS de fora registrado depois da correção ⛔ não é reexame neste atendimento",
  D.estadoDaReavaliacao(regEm(corrigida, "nihss_informado", 3, 1_000_300)) === "corrigida_sem_exame",
  `⛔ ${D.estadoDaReavaliacao(regEm(corrigida, "nihss_informado", 3, 1_000_300))}`);

const sintese = tentar("sinteseDoCaso roda", () => SIN.sinteseDoCaso(externo, rel, []));
conf("a síntese continua mostrando o escore de fora",
  sintese !== undefined && JSON.stringify(sintese).includes("14"),
  `⛔ ${JSON.stringify(sintese && sintese.situacao)}`);

/* ══ AC-29 · a calculadora avulsa usa a MESMA regra UN ══════════════════════ */

conf("lib/nihss.ts exporta a regra UN (lista, valor, nota e soma)",
  typeof L.somaDoNihssDe === "function" && L.ITENS_QUE_ACEITAM_NAO_TESTAVEL !== undefined
  && L.NAO_TESTAVEL === "nao_testavel" && typeof L.NOTA_NAO_TESTAVEL === "string",
  `⛔ ${Object.keys(L).join(", ")}`);
conf("o módulo AVC reusa o MESMO objeto da lib (⛔ nenhuma cópia)",
  L.ITENS_QUE_ACEITAM_NAO_TESTAVEL !== undefined && C.ITENS_QUE_ACEITAM_NAO_TESTAVEL === L.ITENS_QUE_ACEITAM_NAO_TESTAVEL,
  "⛔ avc/conteudo/nihss.ts tem a própria lista");
const tela = ler("components", "protocol-screen", "clinical-calculators-screen.tsx");
conf("a calculadora importa a regra de lib/nihss",
  /from "\.\.\/\.\.\/lib\/nihss"/.test(tela) && /somaDoNihssDe/.test(tela) && /textoDoTotalNihss/.test(tela) && /ITENS_QUE_ACEITAM_NAO_TESTAVEL/.test(tela),
  "⛔ clinical-calculators-screen.tsx não usa lib/nihss");
conf("a calculadora ⛔ não reescreve motivos de UN",
  !/Amputa|intuba/i.test(tela), "⛔ motivo de UN escrito na tela");

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA NIHSS NOS CRITÉRIOS — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
