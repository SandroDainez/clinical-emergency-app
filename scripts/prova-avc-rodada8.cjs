#!/usr/bin/env node
/**
 * PROVA · 8ª RODADA (autor, 2026-09-13) — HSA sem atalho, procedência fora do card,
 * card de dose com uma dose só, D-PEND-25 (alteplase exata).
 *
 * PROMETE:
 *   HSA — depois de «Sim», registrar «Não» ⛔ ou «Incerto» ⛔ SEM fato novo ⛔ desfaz a
 *   retenção; o texto de resolução ⛔ manda «responder Não» ⛔ e diz "Requer
 *   investigação antes de reperfundir — conteúdo pendente de validação"; o motivo do
 *   portão ⛔ oferece gesto que leve a trocar a resposta (sem `leva`); o pacote
 *   `docs/avc/revisao/hsa-resolucao.md` existe, com a decisão humana em branco.
 *   D-PEND-25 — alteplase 0,9 mg/kg exata, teto 90 mg, sem arredondar mg: 70 kg =
 *   63 mg (bolus 6,3 mg / 6,3 mL em 1 min; restante 56,7 mg / 56,7 mL em 60 min;
 *   volume 63 mL a 1 mg/mL); 100 kg = 90 mg (bolus 9 · restante 81); 120 kg = 90 mg;
 *   99 kg = 89,1 mg (⛔ sem lixo de ponto flutuante).
 *   Card de dose — a faixa da Table 7 aparece ⛔ só em mg, rotulada "faixa da diretriz,
 *   para conferência — não é a dose a preparar"; a divergência diz "em vez de", ⛔ nunca
 *   "×"; os contadores de Reperfusão ⛔ usam "aplicáveis/potenciais/sem critério na
 *   fonte"; a nota do agente ⛔ afirma "mesma força" sem a frase literal e a página,
 *   que ficam no ⓘ.
 *   Procedência — os textos da HSA e do portão de população ⛔ carregam "repositório",
 *   "spec §", "transcrito", "D-PEND" ⛔ ou "a confirmar" no que vai para o card.
 * NÃO PROMETE: a aparência (isso são os três e2e da rodada); ⛔ nem o conteúdo clínico
 *   do que resolve a suspeita de HSA — ⛔ ele ⛔ não existe no repositório (pacote).
 * UNIVERSO: `avc/nucleo/{derivacoes-f,derivacoes-c,portao-ivt,estado}.ts`,
 *   `avc/conteudo/{superficie-f,paciente}.ts`, `components/avc/{superficie-f,
 *   portao-de-populacao}.tsx`, `docs/avc/revisao/hsa-resolucao.md`.
 * FONTE: pedido do autor de 2026-09-13 (8ª rodada) e `docs/decisoes.md` D-PEND-25.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada8-"));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp,
    ...[["avc", "nucleo", "derivacoes-f.ts"], ["avc", "nucleo", "derivacoes-c.ts"], ["avc", "nucleo", "estado.ts"],
      ["avc", "nucleo", "relogio.ts"], ["avc", "conteudo", "superficie-f.ts"], ["avc", "conteudo", "paciente.ts"]].map((p) => path.join(appDir, ...p))],
    { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => require(path.join(tmp, ...p));

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

const DF = emT("avc", "nucleo", "derivacoes-f.js");
const DC = emT("avc", "nucleo", "derivacoes-c.js");
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const PAC = emT("avc", "conteudo", "paciente.js");
const PROIBIDAS = /repositório|spec §|transcrit|D-PEND|a confirmar/i;

/* ══ Entrega 1 · HSA sem atalho ════════════════════════════════════════════ */
const rel = R.relogioControlado(1_800_000_000_000);
const sim = E.registrarFato(E.abrirAtendimento(rel), { campo: "suspeita_hsa", valor: "sim" }, rel);
const simNao = E.registrarFato(sim, { campo: "suspeita_hsa", valor: "nao" }, rel);
const simIncerto = E.registrarFato(sim, { campo: "suspeita_hsa", valor: "nao_sei" }, rel);
conf("HSA · Sim → retida", DC.retencaoDiagnostica(sim).estado === "retida", `⛔ ${DC.retencaoDiagnostica(sim).estado}`);
conf("HSA · Sim → «Não» SEM fato novo → ⛔ continua retida", DC.retencaoDiagnostica(simNao).estado === "retida", `⛔ ${DC.retencaoDiagnostica(simNao).estado}`);
conf("HSA · Sim → «Incerto» SEM fato novo → ⛔ continua retida", DC.retencaoDiagnostica(simIncerto).estado === "retida", `⛔ ${DC.retencaoDiagnostica(simIncerto).estado}`);
const ret = DC.retencaoDiagnostica(sim);
conf("HSA · o texto de resolução ⛔ manda responder «Não»",
  ret.estado === "retida" && !/«Não»|responder/i.test(`${ret.oQueFalta} ${ret.rotulo}`), `⛔ ${ret.oQueFalta}`);
conf("HSA · o texto diz «Requer investigação antes de reperfundir — conteúdo pendente de validação»",
  ret.estado === "retida" && /Requer investigação antes de reperfundir — conteúdo pendente de validação/.test(ret.oQueFalta), `⛔ ${ret.oQueFalta}`);
conf("HSA · rótulo e texto do card ⛔ carregam procedência interna",
  ret.estado === "retida" && !PROIBIDAS.test(`${ret.rotulo} ${ret.oQueFalta} ${ret.curto}`), `⛔ ${ret.rotulo} | ${ret.oQueFalta}`);
conf("controle · nunca registrada → livre", DC.retencaoDiagnostica(E.abrirAtendimento(rel)).estado === "livre", "⛔");
conf("controle · só «Não» desde o início → livre", DC.retencaoDiagnostica(E.registrarFato(E.abrirAtendimento(rel), { campo: "suspeita_hsa", valor: "nao" }, rel)).estado === "livre", "⛔");
const portao = lerFonte(path.join(appDir, "avc", "nucleo", "portao-ivt.ts"));
const blocoHsa = (portao.match(/id:\s*"suspeita_hsa",[\s\S]*?\}\);/) || [""])[0];
conf("HSA · o motivo do portão ⛔ oferece «Resolver» (sem `leva`)", blocoHsa !== "" && !/\bleva:/.test(blocoHsa), `⛔ ${blocoHsa.slice(0, 200)}`);
const pacote = path.join(appDir, "docs", "avc", "revisao", "hsa-resolucao.md");
const textoPacote = fs.existsSync(pacote) ? fs.readFileSync(pacote, "utf8") : "";
conf("HSA · pacote docs/avc/revisao/hsa-resolucao.md existe, com decisão humana em branco",
  /\*{0,2}Decisão humana:\*{0,2}\s*___/.test(textoPacote), "⛔ pacote ausente ou decisão preenchida");

/* ══ Entrega 3 · D-PEND-25 alteplase ══════════════════════════════════════ */
const alt = (kg) => DF.doseDerivada("alteplase", kg, "medido");
const a70 = alt(70);
conf("D-PEND-25 · 70 kg → 63 mg", a70.totalMg === 63, `⛔ ${a70.totalMg}`);
conf("D-PEND-25 · 70 kg → volume 63 mL a 1 mg/mL", a70.volumeMl === 63 && a70.concentracaoMgPorMl === 1, `⛔ ${JSON.stringify(a70)}`);
conf("D-PEND-25 · 70 kg → bolus 6,3 mg · 6,3 mL em 1 min", a70.bolus !== undefined && a70.bolus.mg === 6.3 && a70.bolus.ml === 6.3 && a70.bolus.minutos === 1, `⛔ ${JSON.stringify(a70.bolus)}`);
conf("D-PEND-25 · 70 kg → restante 56,7 mg · 56,7 mL em 60 min", a70.infusao !== undefined && a70.infusao.mg === 56.7 && a70.infusao.ml === 56.7 && a70.infusao.minutos === 60, `⛔ ${JSON.stringify(a70.infusao)}`);
conf("D-PEND-25 · 100 kg → 90 mg · bolus 9 · restante 81", alt(100).totalMg === 90 && alt(100).bolus?.mg === 9 && alt(100).infusao?.mg === 81, `⛔ ${JSON.stringify(alt(100))}`);
conf("D-PEND-25 · 120 kg → 90 mg (teto)", alt(120).totalMg === 90 && alt(120).volumeMl === 90, `⛔ ${JSON.stringify(alt(120))}`);
conf("D-PEND-25 · 99 kg → 89,1 mg (exato, ⛔ sem arredondar ⛔ nem lixo)", alt(99).totalMg === 89.1, `⛔ ${alt(99).totalMg}`);
conf("D-PEND-25 · 71 kg → 63,9 mg; bolus 6,39 mg (6,4 mL); restante 57,51 mg (57,5 mL)",
  alt(71).totalMg === 63.9 && alt(71).bolus?.mg === 6.39 && alt(71).bolus?.ml === 6.4 && alt(71).infusao?.mg === 57.51 && alt(71).infusao?.ml === 57.5,
  `⛔ ${JSON.stringify(alt(71))}`);
conf("D-PEND-25 · bolus + restante = dose total (70, 71, 99, 100, 120 kg)",
  [70, 71, 99, 100, 120].every((kg) => { const d = alt(kg); return d.bolus && d.infusao && Math.abs(d.bolus.mg + d.infusao.mg - d.totalMg) < 1e-9; }), "⛔");
conf("controle · tenecteplase ⛔ ganha bolus/infusão (push único)", DF.doseDerivada("tenecteplase", 70, "medido").bolus === undefined, "⛔");

/* ══ Entrega 3 · card de dose e Reperfusão ════════════════════════════════ */
const telaF = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
const blocoT7 = (telaF.match(/testID="avc-f-dose-table7"[\s\S]*?<\/View>/) || [""])[0];
conf("card · a faixa da Table 7 é rotulada «faixa da diretriz, para conferência — não é a dose a preparar»",
  /faixa da diretriz, para conferência — não é a dose a preparar/.test(telaF), "⛔ rótulo ausente");
conf("card · a conferência da Table 7 ⛔ mostra mL", blocoT7 !== "" && !/conferenciaTable7\.ml|"mL"/.test(blocoT7), `⛔ ${blocoT7.slice(0, 240)}`);
conf("card · a divergência diz «em vez de», ⛔ nunca «×»", /em vez de/.test(telaF) && !/\}\s*×\s*\{/.test(telaF), "⛔ «×» ainda na divergência");
conf("Reperfusão · contadores ⛔ usam «aplicáveis», «potenciais», «sem critério na fonte»",
  !/tr\("aplicáveis"\)|tr\("potenciais"\)|tr\("sem critério na fonte"\)/.test(telaF), "⛔ rótulos opacos");
const agente = SF.CAMPO_AGENTE;
conf("agente · a nota do card ⛔ afirma «mesma força» sem literal", agente && !/mesma força/.test(agente.nota), `⛔ ${agente && agente.nota}`);
conf("agente · o ⓘ traz a frase literal e a página (§4.6.2 rec. 1, p. e357)",
  agente && /or alteplase at a dose of 0\.9 mg\/kg body weight \(max 90 mg\)\s+is recommended/.test(agente.ajuda ?? "") && /e357/.test(agente.ajuda ?? ""),
  `⛔ ${agente && agente.ajuda}`);

/* ══ Entrega 2 · procedência fora do card (textos-fonte) ═══════════════════ */
const telaPortao = lerFonte(path.join(appDir, "components", "avc", "portao-de-populacao.tsx"));
const perguntaPortao = (telaPortao.match(/"Antes do protocolo:[^"]*"/) || [""])[0];
conf("portão · a pergunta do card ⛔ carrega procedência ⛔ nem «Não sei mantém a pergunta»",
  perguntaPortao !== "" && !PROIBIDAS.test(perguntaPortao) && !/Não sei mantém a pergunta/.test(perguntaPortao), `⛔ ${perguntaPortao}`);
const gp = PAC.TODOS_OS_CAMPOS_P.find((c) => c.id === "gestacao_puerperio");
/** ⚠️ Ajuste consciente (19ª rodada, AC-03r · C8): a marcação dos 14 dias passou a «regra local do projeto» — ⛔ «AHA 2019». */
conf("portão · a marcação dos 14 dias (regra local) segue no ⓘ (nota do campo)", gp && /regra local/.test(gp.nota) && !/AHA 2019/.test(gp.nota), `⛔ ${gp && gp.nota}`);

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · 8ª RODADA — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
