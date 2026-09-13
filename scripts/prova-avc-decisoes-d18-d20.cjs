#!/usr/bin/env node
/**
 * PROVA · DECISÕES D-PEND-18, D-PEND-19 E D-PEND-20 (autor, 2026-09-13).
 *
 * PROMETE: (D-PEND-18 · AC-44) que a temperatura voltou ao caminho isquêmico — o
 * campo existe na Estabilização com fonte F-38, o eixo E · Exposição existe, e
 * temperatura medida fica «medida» ⛔ sem virar ameaça, porque a §4.4 ⛔ não traz
 * corte na recomendação —, e que a §4.4 (p. e352) está transcrita verbatim, com as
 * três recomendações e seus graus; (D-PEND-19 · AC-45) que o segundo toque numa
 * opção já marcada ⛔ desfaz nada — nem na escolha, nem em «Sem essa informação» — e
 * que existe o gesto «limpar» nos dois; (D-PEND-20 · AC-50) que o texto «10 dias
 * pós-parto», sem fonte, ⛔ existe mais no código.
 * NÃO PROMETE: que o toque na tela se comporte assim (isso é o e2e
 * `e2e/avc-decisoes-d18-d20.spec.ts`); a seleção múltipla, cujo toque marca e
 * desmarca item por natureza, ⛔ não é tocada pela D-PEND-19; nenhum corte de
 * hipertermia é provado, porque ⛔ nenhum foi criado.
 * UNIVERSO: `avc/conteudo/{superficie-a,fontes,campos}.ts`,
 * `avc/nucleo/ameacas-imediatas.ts`, `components/avc/campos-clinicos.tsx`,
 * `lib/i18n/modules/avc-nihss-elegibilidade.ts`,
 * `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md`.
 * FONTE: `docs/decisoes.md` D-PEND-18, D-PEND-19, D-PEND-20; AHA/ASA 2026 §4.4 p. e352.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "d18-d20-"));
execFileSync(
  "npx",
  ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "ameacas-imediatas.ts"),
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "conteudo", "fontes.ts"),
    path.join(appDir, "avc", "conteudo", "superficie-a.ts")],
  { cwd: appDir, stdio: "inherit" }
);
const emT = (...p) => require(path.join(tmp, ...p));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const A = emT("avc", "nucleo", "ameacas-imediatas.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const FONTES = emT("avc", "conteudo", "fontes.js");
const SA = emT("avc", "conteudo", "superficie-a.js");

const rel = R.relogioControlado(1_800_000_000_000);
const vazio = E.abrirAtendimento(rel);

/* ══ D-PEND-18 · AC-44 · temperatura no caminho isquêmico ════════════════ */
{
  const campo = CAMPOS.campoDoModulo("temperatura");
  conf("AC-44 · o campo `temperatura` existe no módulo", campo !== undefined, "⛔ campo ausente");
  const grupos = (SA.GRUPOS_A ?? []).filter((g) => (g.campos ?? []).some((c) => c.id === "temperatura"));
  conf("AC-44 · a temperatura está num grupo da Estabilização (caminho isquêmico)", grupos.length === 1, `⛔ ${grupos.map((g) => g.id).join(",")}`);
  conf("AC-44 · o campo aponta a fonte F-38, ⛔ e ⛔ não fonte vazia", campo !== undefined && campo.fonte === "F-38", `⛔ fonte=${campo && JSON.stringify(campo.fonte)}`);
  conf("AC-44 · unidade °C", campo !== undefined && campo.unidade === "°C", `⛔ ${campo && campo.unidade}`);

  const slot = (FONTES.SLOTS ?? FONTES.FONTES ?? []).find?.((s) => s.id === "F-38")
    ?? Object.values(FONTES).flatMap((v) => (Array.isArray(v) ? v : [])).find((s) => s && s.id === "F-38");
  conf("AC-44 · o slot F-38 está TRANSCRITO", slot !== undefined && slot.estado === "transcrito", `⛔ ${JSON.stringify(slot)}`);

  const transcricao = fs.readFileSync(path.join(appDir, "protocols", "fontes-verbatim", "aha-asa-2026-avc-isquemico.md"), "utf8");
  const bloco = transcricao.split(/\n### /).find((b) => b.startsWith("F-38")) ?? "";
  conf("AC-44 · a transcrição tem o slot F-38 com a §4.4 e a página e352", /4\.4/.test(bloco) && /e352/.test(bloco), "⛔ slot F-38 ausente na transcrição");
  for (const [rec, grau, verbatim] of [
    ["1", /COR 1[^\n]*B-R/, "targeting normothermia, including using nurse-initiated protocols for managing fever, is recommended"],
    ["2", /COR 1[^\n]*C-EO/, "sources of hyperthermia, such as infection, should be identified and treated"],
    ["3", /COR 3[^\n]*B-R/, "treatment with induced hypothermia or prophylactic fever prevention is not recommended"],
  ]) {
    /** ⚠️ O verbatim é citação Markdown quebrada em linhas: os marcadores `> ` saem antes de comparar. */
    const corrido = bloco.replace(/\n>\s?/g, " ").replace(/\s+/g, " ");
    conf(`AC-44 · §4.4 rec. ${rec} verbatim, com o grau`, corrido.includes(verbatim) && grau.test(bloco), `⛔ rec. ${rec}`);
  }

  const eixos = A.ameacasImediatas(vazio);
  conf("AC-44 · o eixo E · Exposição voltou, depois da glicemia", eixos.map((a) => a.letra).join("") === "ABCDE" && eixos[4].id === "exposicao", `⛔ ${eixos.map((a) => a.letra).join("")}`);
  const quente = E.registrarFato(vazio, { campo: "temperatura", valor: 39 }, rel);
  const e = A.ameacasImediatas(quente).find((a) => a.id === "exposicao");
  conf("AC-44 · 39 °C fica MEDIDA ⛔ e ⛔ não vira ameaça: a recomendação ⛔ não traz corte, ⛔ nenhum foi criado",
    e !== undefined && e.estado === "medido" && e.valor === "39" && e.achado === undefined, `⛔ ${JSON.stringify(e)}`);
}

/* ══ D-PEND-19 · AC-45 · segundo toque em opção marcada é ignorado ═══════ */
{
  const tela = lerFonte(path.join(appDir, "components", "avc", "campos-clinicos.tsx"));
  conf("AC-45 · a opção marcada ⛔ não alterna para desfazer (`ativa ? onDesfazer`)", !/ativa\s*\?\s*onDesfazer/.test(tela), "⛔ o segundo toque ainda desfaz a escolha");
  conf("AC-45 · «Sem essa informação» marcada ⛔ não alterna para desfazer", !/desconhecido\s*\?\s*onDesfazer/.test(tela), "⛔ o segundo toque ainda desfaz «Sem essa informação»");
  /**
   * ⚠️ Instrumento ampliado em 2026-09-13: a 1ª versão só olhava `campos-clinicos.tsx`
   * ⛔ e ficou verde enquanto o e2e mostrava a opção de `ui/index.tsx` ainda
   * desmarcando. TODO desenhador de opção (`avc-opcao-`) entra aqui.
   */
  for (const arqTela of [["ui", "index.tsx"], ["superficie-g.tsx"], ["superficie-c.tsx"]]) {
    const fonteTela = lerFonte(path.join(appDir, "components", "avc", ...arqTela));
    const alternancias = fonteTela.match(/(marcad[ao]|ativ[ao]|selecionad[ao]|desconhecid[ao])\s*\?\s*onDesfazer\w*\(/g) ?? [];
    conf(`AC-45 · ${arqTela.join("/")}: nenhuma opção marcada alterna para desfazer`, alternancias.length === 0, `⛔ ${alternancias.length} alternância(s)`);
  }
  const blocoEscolha = tela.slice(tela.indexOf("export function CampoDeEscolha"), tela.indexOf("function CaixaDeOutros"));
  conf("AC-45 · a escolha tem o gesto «limpar»", /avc-limpar-/.test(blocoEscolha) && /onDesfazer\(/.test(blocoEscolha), "⛔ sem «limpar» na escolha");
  const blocoHora = tela.slice(tela.indexOf("export function CampoDeHora"), tela.indexOf("export function CampoDeHora") + 12000);
  conf("AC-45 · o horário com «Sem essa informação» tem o gesto «limpar»", /avc-limpar-/.test(blocoHora), "⛔ sem «limpar» no horário");
}

/* ══ D-PEND-20 · AC-50 · «10 dias pós-parto» sai ═════════════════════════ */
{
  const i18n = lerFonte(path.join(appDir, "lib", "i18n", "modules", "avc-nihss-elegibilidade.ts"));
  conf("AC-50 · o texto «10 dias pós-parto» ⛔ existe mais", !/10 dias pós-parto/.test(i18n), "⛔ texto sem fonte ainda presente");
  conf("AC-50 · ⛔ nem a tradução «10 días tras el parto»", !/10 días tras el parto/.test(i18n), "⛔ tradução ainda presente");
}

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · DECISÕES D-PEND-18/19/20 — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
