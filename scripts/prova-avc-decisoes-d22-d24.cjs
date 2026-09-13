#!/usr/bin/env node
/**
 * PROVA · DECISÕES D-PEND-22, D-PEND-23 E D-PEND-24 (autor, 2026-09-13).
 *
 * PROMETE:
 *   D-PEND-22 — a dose de tenecteplase é 0,25 mg/kg EXATO, com teto de 25 mg e sem
 *   arredondar mg (70 kg = 17,5 mg; 100 kg = 25 mg; 120 kg = 25 mg); o volume sai a
 *   5 mg/mL com 0,1 mL (70 kg = 3,5 mL; 100 e 120 kg = 5 mL); a faixa da Table 7
 *   (p. e358) acompanha como conferência, com divergência explícita quando difere
 *   (70 kg: faixa 20 mg × exata 17,5 mg) e sem divergência quando coincide (100 kg);
 *   a situação regulatória no Brasil é campo separado "pendente de conferência",
 *   exibido na tela; nenhuma dose do regime de IAM (30–50 mg) é alcançável; e a
 *   alteplase ⛔ ganha a conferência de Table 7 (a faixa por peso é da tenecteplase).
 *   ⚠️ Desde a D-PEND-25 (2026-09-13) a alteplase também é exata (99 kg = 89,1 mg);
 *   o detalhe dela é de `prova-avc-rodada8.cjs`.
 *   D-PEND-23 — a suspeita clínica de HSA retém a reperfusão classificada como
 *   "requer avaliação especializada / corrigir e reavaliar" — ⛔ nunca como
 *   impedimento de segurança —, com o motivo nomeado e a procedência marcada como
 *   adaptação do projeto; «Não» ⛔ ou «Incerto» desde o início ⛔ retêm (controles).
 *   ⚠️ Desde a 8ª rodada, «Não» DEPOIS de «Sim» ⛔ libera (`prova-avc-rodada8.cjs`).
 *   D-PEND-24 — o portão de população declara a janela de 14 dias pós-parto, com a
 *   marcação "fonte AHA 2019, a confirmar na Table 8 de 2026"; «Puérpera» continua
 *   fora do escopo; «Não sei» mantém a pergunta; ⛔ nenhum "10 dias" volta.
 * NÃO PROMETE: a aparência na tela (isso é `e2e/avc-decisoes-d22-d24.spec.ts`); ⛔ nem
 *   que as fontes citadas pelo autor (bula na D-PEND-23, AHA 2019 na D-PEND-24)
 *   digam isso — elas ⛔ não estão transcritas no repositório, e a prova confere que a
 *   marcação diz exatamente isso.
 * UNIVERSO: `avc/nucleo/{derivacoes-f,derivacoes-c,portao-ivt,populacao}.ts`,
 *   `avc/conteudo/{superficie-f,superficie-c,paciente}.ts`, `components/avc/superficie-f.tsx`,
 *   `lib/i18n/modules/*.ts` e `avc/**` (varredura de "10 dias").
 * FONTE: `docs/decisoes.md` D-PEND-22, D-PEND-23, D-PEND-24.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "d22-d24-"));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp,
    ...[["avc", "nucleo", "derivacoes-f.ts"], ["avc", "nucleo", "derivacoes-c.ts"], ["avc", "nucleo", "populacao.ts"],
      ["avc", "nucleo", "estado.ts"], ["avc", "nucleo", "relogio.ts"], ["avc", "conteudo", "paciente.ts"],
      ["avc", "conteudo", "superficie-f.ts"], ["avc", "conteudo", "campo.ts"]].map((p) => path.join(appDir, ...p))],
    { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão; o que falta aparece como vermelho */ }
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
const P = emT("avc", "nucleo", "populacao.js");
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const PAC = emT("avc", "conteudo", "paciente.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const CAMPO = emT("avc", "conteudo", "campo.js");

/* ══ D-PEND-22 · dose de tenecteplase ══════════════════════════════════════ */
const tnk = (kg) => DF.doseDerivada("tenecteplase", kg, "medido");
conf("D-PEND-22 · 70 kg → 17,5 mg (exato, ⛔ sem arredondar)", tnk(70).totalMg === 17.5, `⛔ ${tnk(70).totalMg}`);
conf("D-PEND-22 · 100 kg → 25 mg (teto)", tnk(100).totalMg === 25, `⛔ ${tnk(100).totalMg}`);
conf("D-PEND-22 · 120 kg → 25 mg (teto)", tnk(120).totalMg === 25, `⛔ ${tnk(120).totalMg}`);
conf("D-PEND-22 · 71 kg → 17,75 mg (exato)", tnk(71).totalMg === 17.75, `⛔ ${tnk(71).totalMg}`);
conf("D-PEND-22 · volume a 5 mg/mL: 70 kg → 3,5 mL", tnk(70).volumeMl === 3.5, `⛔ ${JSON.stringify(tnk(70))}`);
conf("D-PEND-22 · volume: 100 kg e 120 kg → 5 mL", tnk(100).volumeMl === 5 && tnk(120).volumeMl === 5, `⛔ ${tnk(100).volumeMl} · ${tnk(120).volumeMl}`);
conf("D-PEND-22 · volume com 0,1 mL: 71 kg (17,75 mg) → 3,6 mL", tnk(71).volumeMl === 3.6, `⛔ ${tnk(71).volumeMl}`);
conf("D-PEND-22 · a concentração do volume é declarada (5 mg/mL)", tnk(70).concentracaoMgPorMl === 5, `⛔ ${tnk(70).concentracaoMgPorMl}`);
const faixa = (kg) => tnk(kg).conferenciaTable7;
conf("D-PEND-22 · Table 7 como conferência: 70 kg → faixa «70 kg to <80 kg», 20 mg · 4 mL, divergente",
  faixa(70) !== undefined && faixa(70).mg === 20 && faixa(70).ml === 4 && faixa(70).faixa === "70 kg to <80 kg" && faixa(70).divergente === true,
  `⛔ ${JSON.stringify(faixa(70))}`);
conf("D-PEND-22 · 100 kg → faixa «≥90 kg», 25 mg · 5 mL, ⛔ sem divergência",
  faixa(100) !== undefined && faixa(100).mg === 25 && faixa(100).divergente === false, `⛔ ${JSON.stringify(faixa(100))}`);
conf("D-PEND-22 · 55 kg → faixa «<60 kg», 15 mg · 3 mL", faixa(55) !== undefined && faixa(55).mg === 15 && faixa(55).ml === 3, `⛔ ${JSON.stringify(faixa(55))}`);
conf("D-PEND-22 · a conferência cita a Table 7, p. e358", faixa(70) !== undefined && /Table 7/.test(faixa(70).fonte) && /e358/.test(faixa(70).fonte), `⛔ ${JSON.stringify(faixa(70))}`);
conf("D-PEND-22 · situação regulatória no Brasil é campo separado, «pendente de conferência»",
  SF.SITUACAO_REGULATORIA_TNK !== undefined && /pendente de conferência/.test(SF.SITUACAO_REGULATORIA_TNK), `⛔ ${SF.SITUACAO_REGULATORIA_TNK}`);
const telaF = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
conf("D-PEND-22 · a tela exibe volume, conferência da Table 7 e situação regulatória",
  /avc-f-dose-volume/.test(telaF) && /avc-f-dose-table7/.test(telaF) && /avc-f-dose-regulatorio/.test(telaF) && /SITUACAO_REGULATORIA_TNK/.test(telaF),
  "⛔ testIDs ou texto ausentes na tela");
const iam = [];
for (let kg = 30; kg <= 200; kg++) if ([30, 35, 40, 45, 50].includes(tnk(kg).totalMg)) iam.push(kg);
conf("D-PEND-22 · E-50: ⛔ nenhuma dose de 30/35/40/45/50 mg alcançável (30–200 kg)", iam.length === 0, `⛔ ${iam.join(",")}`);
/** ⚠️ D-PEND-25 (2026-09-13) substituiu o controle "alteplase inteira": agora exata (99 kg = 89,1 mg), com volume. */
conf("controle · alteplase (D-PEND-25): 99 kg → 89,1 mg, 70 kg → 63 mg, teto 90",
  DF.doseDerivada("alteplase", 99, "medido").totalMg === 89.1 && DF.doseDerivada("alteplase", 70, "medido").totalMg === 63 && DF.doseDerivada("alteplase", 200, "medido").totalMg === 90,
  "⛔ D-PEND-25");
conf("controle · alteplase ⛔ ganha conferência de Table 7 (a faixa por peso é da tenecteplase)",
  DF.doseDerivada("alteplase", 70, "medido").conferenciaTable7 === undefined, "⛔");

/* ══ D-PEND-23 · suspeita clínica de HSA ═══════════════════════════════════ */
const rel = R.relogioControlado(1_800_000_000_000);
const hsa = E.registrarFato(E.abrirAtendimento(rel), { campo: "suspeita_hsa", valor: "sim" }, rel);
const ret = DC.retencaoDiagnostica(hsa);
conf("D-PEND-23 · HSA «Sim» retém", ret.estado === "retida", `⛔ ${JSON.stringify(ret)}`);
conf("D-PEND-23 · classificada como avaliação especializada / corrigir e reavaliar",
  ret.estado === "retida" && ret.classificacao === "avaliacao_especializada", `⛔ ${JSON.stringify(ret)}`);
conf("D-PEND-23 · o rótulo diz «Requer avaliação especializada» e «corrigir e reavaliar», ⛔ nunca «impede»/«contraindica»",
  ret.estado === "retida" && /Requer avaliação especializada/.test(ret.rotulo ?? "") && /corrigir e reavaliar/i.test(ret.rotulo ?? "")
    && !/impede|contraindica/i.test(`${ret.rotulo} ${ret.oQueFalta}`),
  `⛔ ${JSON.stringify(ret)}`);
conf("D-PEND-23 · o motivo nomeia a suspeita clínica de HSA com TC sem sangue",
  ret.estado === "retida" && /hemorragia subaracnóidea/.test(ret.rotulo ?? "") && /sem sangue|sem hemorragia/i.test(ret.rotulo ?? ""), `⛔ ${ret.rotulo}`);
conf("D-PEND-23 · procedência marcada como adaptação do projeto, com a bula não transcrita",
  ret.estado === "retida" && /adaptação do projeto/i.test(ret.procedencia ?? "") && /não transcrit/i.test(ret.procedencia ?? "") && /Table 8/.test(ret.procedencia ?? ""),
  `⛔ ${ret.procedencia}`);
/** ⚠️ 8ª rodada: «Não» DEPOIS de «Sim» ⛔ libera (sem fato novo); o controle passa a ser «Não» desde o início. */
conf("controle · «Não» desde o início ⛔ retém", DC.retencaoDiagnostica(E.registrarFato(E.abrirAtendimento(rel), { campo: "suspeita_hsa", valor: "nao" }, rel)).estado === "livre", "⛔");
conf("controle · «Incerto» ⛔ retém", DC.retencaoDiagnostica(E.registrarFato(E.abrirAtendimento(rel), { campo: "suspeita_hsa", valor: "nao_sei" }, rel)).estado === "livre", "⛔");
const portao = lerFonte(path.join(appDir, "avc", "nucleo", "portao-ivt.ts"));
conf("D-PEND-23 · no portão, o motivo da HSA ⛔ entra na camada de segurança e leva a classificação",
  /id:\s*"suspeita_hsa"[\s\S]{0,200}camada:\s*"destino"/.test(portao) && /retencao\.rotulo/.test(portao) && /retencao\.procedencia/.test(portao),
  "⛔ motivo do portão sem o rótulo ou a procedência da D-PEND-23");
conf("D-PEND-23 · o título do estado na tela diz «Requer avaliação especializada», ⛔ não «Saída diagnóstica armada»",
  /saida_diagnostica_pendente:\s*"Requer avaliação especializada/.test(telaF) && !/"Saída diagnóstica armada/.test(telaF),
  "⛔ título antigo");

/* ══ D-PEND-24 · puerpério ═════════════════════════════════════════════════ */
conf("D-PEND-24 · a janela é 14 dias pós-parto", PAC.JANELA_DO_PUERPERIO_DIAS === 14, `⛔ ${PAC.JANELA_DO_PUERPERIO_DIAS}`);
conf("D-PEND-24 · marcação «fonte AHA 2019, a confirmar na Table 8 de 2026»",
  PAC.PROCEDENCIA_DA_JANELA_DO_PUERPERIO === "fonte AHA 2019, a confirmar na Table 8 de 2026", `⛔ ${PAC.PROCEDENCIA_DA_JANELA_DO_PUERPERIO}`);
const gp = PAC.TODOS_OS_CAMPOS_P.find((c) => c.id === "gestacao_puerperio");
conf("D-PEND-24 · a pergunta do portão diz a janela e a marcação",
  gp !== undefined && /14 dias/.test(`${gp.rotulo} ${gp.nota}`) && /AHA 2019/.test(gp.nota) && /Table 8 de 2026/.test(gp.nota), `⛔ ${JSON.stringify(gp)}`);
const telaPortao = lerFonte(path.join(appDir, "components", "avc", "portao-de-populacao.tsx"));
conf("D-PEND-24 · o texto do portão pendente diz «até 14 dias após o parto»", /até 14 dias após o parto/.test(telaPortao), "⛔");
const caso = (g) => {
  let e = E.registrarFato(E.abrirAtendimento(rel), { campo: "faixa_etaria", valor: CAMPO.valorDaOpcao("18 anos ou mais") }, rel);
  return E.registrarFato(e, { campo: "gestacao_puerperio", valor: CAMPO.valorDaOpcao(g) }, rel);
};
conf("controle · «Puérpera» → fora do escopo", P.estadoDaPopulacao(caso("Puérpera")).estado === "fora_do_escopo", "⛔");
conf("controle · «Não sei» mantém a pergunta", P.estadoDaPopulacao(caso(CAMPO.NAO_SEI)).estado === "pergunta_pendente", "⛔");
const listar = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) =>
  x.isDirectory() ? listar(path.join(d, x.name)) : /\.tsx?$/.test(x.name) ? [path.join(d, x.name)] : []);
const dezDias = [...listar(path.join(appDir, "avc")), ...listar(path.join(appDir, "lib", "i18n", "modules"))]
  .filter((f) => /10 dias (pós-parto|após o parto)|primeiros 10 dias/i.test(lerFonte(f)))
  .map((f) => path.relative(appDir, f));
conf("D-PEND-24 · ⛔ nenhum «10 dias» pós-parto em avc/ nem nas traduções", dezDias.length === 0, `⛔ ${dezDias.join(", ")}`);

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · DECISÕES D-PEND-22/23/24 — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
