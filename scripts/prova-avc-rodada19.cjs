#!/usr/bin/env node
/**
 * PROVA · 19ª RODADA DO AVC — Lote 1 das decisões do dossiê de revisão (autor, 2026-09-14;
 * `docs/decisoes.md`, 19ª rodada e complemento D1/D3/D8). Cada seção nasce vermelha antes da
 * alteração que ela mede, e entra num commit próprio.
 *
 * PROMETE:
 *  · D-139-4 (opção C): nas rotas de janela estendida, «não incapacitante» registrado impede;
 *    «Incerto» ⛔ não perguntado ⛔ viram incapacitante ⛔ nem liberam a IVT — a saída nomeia o
 *    déficit que falta; «Incapacitante» continua sustentando.
 *  · AC-06 (C5): a tenecteplase ⛔ exibe volume ⛔ nem concentração sem documento regulatório brasileiro;
 *    dose em mg; Table 7 como conferência em mg; alteplase mantém 1 mg/mL da bula.
 * NÃO PROMETE: que a conduta esteja clinicamente validada; nenhum limiar novo; a tela é medida
 *   pelos e2e existentes.
 * UNIVERSO: `avc/nucleo/{veredito-da-trombolise,portao-ivt,derivacoes-f}.ts`, `avc/conteudo/{campos,superficie-f}.ts`,
 *   `components/avc/superficie-f.tsx`.
 * FONTE: `docs/decisoes.md` — 19ª rodada (§6 D-139-4) e complemento; pacote
 *   `docs/avc/revisao/D-139-4-deficit-incapacitante.md`.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada19-"));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "portao-ivt.ts"), path.join(appDir, "avc", "conteudo", "campos.ts"), path.join(appDir, "avc", "nucleo", "derivacoes-f.ts")],
  { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const I = emT("avc", "nucleo", "instancia.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const V = emT("avc", "nucleo", "veredito-da-trombolise.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const SC = emT("avc", "conteudo", "superficie-c.js");

const H = 3_600_000;
const AGORA = 1_800_000_000_000;
const rel = R.relogioControlado(AGORA);
const vazio = E.abrirAtendimento(rel);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
const regI = (e, inst, campo, valor) => CAMPOS.registrarComInstancia(e, { campo, valor }, rel, inst);
const est = (n) => I.nomeDaInstancia(SC.ESTUDO, n);
const tcSem = (e, n, horaMs) => {
  let x = regI(e, est(n), "estudo_modalidade", SC.MODALIDADE.tcSemContraste);
  x = regI(x, est(n), "estudo_hora", horaMs);
  return regI(x, est(n), "estudo_resultado", SC.RESULTADO_TC.semHemorragia);
};
const ivt = (e) => ({ v: V.vereditoDaTrombolise(e, AGORA), p: P.estadoDoPortaoIVT(e, AGORA) });

/* ══ D-139-4 · déficit incapacitante nas rotas estendidas (opção C) ═══════ */
{
  /** Rota estendida que de fato sustenta hoje: RM com início desconhecido (§4.6.3 rec. 1). */
  let rm = tcSem(vazio, 1, AGORA - 1 * H);
  rm = regI(rm, est(2), "estudo_modalidade", SC.MODALIDADE.rm);
  rm = regI(rm, est(2), "dwi_menor_que_um_terco", "sim");
  rm = regI(rm, est(2), "flair_sem_alteracao_marcada", "sim");
  rm = reg(rm, "motivo_para_suspeitar_alteracao_coagulacao", "nao");
  rm = reg(rm, "hora_reconhecimento", AGORA - 2 * H);
  rm = reg(rm, "hora_inicio_observado", "nao_sei");

  const naoPerguntado = ivt(rm);
  conf("D-139-4 · déficit NÃO perguntado + rota estendida completa → ⛔ «indicada»", naoPerguntado.v.tipo !== "indicada", `⛔ ${naoPerguntado.v.tipo}`);
  conf("… ⛔ e o portão ⛔ libera", naoPerguntado.p.liberado === false, `⛔ ${naoPerguntado.p.estado}`);
  conf("… a saída nomeia o déficit incapacitante como o que falta", (naoPerguntado.v.faltam ?? []).includes("deficit_incapacitante"), `⛔ ${JSON.stringify(naoPerguntado.v.faltam)}`);

  const incerto = ivt(reg(rm, "incapacitante_assumido", "Incerto"));
  conf("D-139-4 · «Incerto» + rota estendida completa → ⛔ «indicada» (⛔ vira incapacitante)", incerto.v.tipo !== "indicada", `⛔ ${incerto.v.tipo}`);
  conf("… ⛔ e o portão ⛔ libera", incerto.p.liberado === false, `⛔ ${incerto.p.estado}`);
  conf("… a saída nomeia o déficit incapacitante", (incerto.v.faltam ?? []).includes("deficit_incapacitante"), `⛔ ${JSON.stringify(incerto.v.faltam)}`);

  const naoIncap = ivt(reg(rm, "incapacitante_assumido", "Não incapacitante"));
  conf("D-139-4 · «Não incapacitante» registrado → sem indicação neste caminho (AC-47 preservado)",
    naoIncap.v.tipo === "nao_sustentada" && /não incapacitante/i.test(naoIncap.v.frase ?? "") && naoIncap.p.liberado === false, `⛔ ${naoIncap.v.tipo} · ${naoIncap.v.frase}`);

  const incap = ivt(reg(rm, "incapacitante_assumido", "Incapacitante"));
  conf("D-139-4 · «Incapacitante» + rota estendida completa → indicada pela rota estendida",
    incap.v.tipo === "indicada" && incap.v.sustentam.some((m) => m.id === "ivt_inicio_desconhecido"), `⛔ ${incap.v.tipo}`);

  conf("D-139-4 · desconhecido, negativo ⛔ não avaliado ⛔ se confundem: três saídas distintas",
    new Set([naoPerguntado.v.tipo + (naoPerguntado.v.faltam ?? []).join(), naoIncap.v.tipo, incap.v.tipo]).size === 3
      && E.valorAtual(reg(rm, "incapacitante_assumido", "Incerto"), "incapacitante_assumido")?.valor !== "Incapacitante",
    "⛔ saídas colapsadas");
}

/* ══ AC-06 · C5 · volume da tenecteplase sem documento regulatório brasileiro ═══ */
{
  const SF = emT("avc", "conteudo", "superficie-f.js");
  const DF = emT("avc", "nucleo", "derivacoes-f.js");
  const tnk = (kg) => DF?.doseDerivada?.("tenecteplase", kg, "estimado");
  const alt = (kg) => DF?.doseDerivada?.("alteplase", kg, "estimado");
  conf("AC-06 · C5 · a tenecteplase ⛔ declara concentração (bula brasileira de Metalyse 25 mg ⛔ arquivada)",
    SF?.DOSES?.tenecteplase !== undefined && SF.DOSES.tenecteplase.concentracaoMgPorMl === undefined, `⛔ ${JSON.stringify(SF?.DOSES?.tenecteplase)}`);
  conf("… 70 kg → 17,5 mg, ⛔ sem volume ⛔ nem concentração",
    tnk(70)?.totalMg === 17.5 && tnk(70)?.volumeMl === undefined && tnk(70)?.concentracaoMgPorMl === undefined, `⛔ ${JSON.stringify(tnk(70))}`);
  conf("… 100 kg e 120 kg → 25 mg (teto), ⛔ sem volume", tnk(100)?.totalMg === 25 && tnk(120)?.totalMg === 25 && tnk(120)?.volumeMl === undefined, "⛔");
  conf("… a Table 7 continua como conferência documental, só em mg", tnk(70)?.conferenciaTable7?.mg === 20 && /Table 7/.test(tnk(70)?.conferenciaTable7?.fonte ?? ""), `⛔ ${JSON.stringify(tnk(70)?.conferenciaTable7)}`);
  conf("… a alteplase mantém 1 mg/mL (bula Actilyse I23-01, p. 7): 70 kg → 63 mL", alt(70)?.volumeMl === 63 && alt(70)?.concentracaoMgPorMl === 1, `⛔ ${JSON.stringify(alt(70))}`);
  const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  conf("… a situação regulatória da tenecteplase continua visível", /avc-f-dose-regulatorio/.test(tela), "⛔");
}

console.log(`\nprova-avc-rodada19: ${ok} ok · ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
