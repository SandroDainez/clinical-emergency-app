#!/usr/bin/env node
/**
 * PROVA · 18ª RODADA DO AVC — documentos oficiais no lugar dos dossiês: bula profissional Actilyse
 * (I23-01), AHA/ASA 2023 HSA integral, Linha de Cuidados em AVC (MS); errata e Table 8 da AHA/ASA 2026.
 * Decisões do autor, 2026-09-14 (`docs/decisoes.md`, 18ª rodada).
 *
 * PROMETE:
 *  · A · D-PEND-25 com fonte de bula: 0,9 mg/kg, máx. 90 mg, 10% em bolus, restante em 60 min, 1 mg/mL,
 *    com página; a duração do bolus é DITA pelas duas fontes, rotuladas (diretriz 1 min × bula sem duração
 *    na posologia do AVC) — ⛔ uma só.
 *  · A · tabela de dose por peso da bula (40 a 100+ kg), transcrita, como CONFERÊNCIA: 70 kg → 63,0 · 6,3 ·
 *    56,7; peso sem linha na tabela ⛔ é interpolado; acima de 100 kg, a linha 100+; só mg, rotulada.
 *  · A · D-PEND-23 com fonte nominal de bula (p. 4), frase literal no ⓘ.
 *  · A · janela: onde bula e diretriz divergem (janela estendida), o card mostra as duas posições rotuladas.
 *  · A · critérios de bula ⛔ entram no núcleo como regra: só informação e pacote `bula-x-diretriz.md`.
 *  · B · `aha-asa-2023-hsa.md` S-00 conferido no PDF integral; opção E de `hsa-resolucao.md` com a regra
 *    real; decisão em branco.
 *  · C · `pcdt-brasil.md` existe, sem decisão e sem implementação.
 *  · Errata · `errata-2026.md` confere os 34 itens; Table 8 · puerpério sem janela em dias registrado no
 *    AC-03r; §5.2 localizada na procedência da deglutição.
 * NÃO PROMETE: o gesto a 375 px (isso é `e2e/avc-rodada18.spec.ts`); ⛔ valida conteúdo clínico — ⛔ decide
 *   divergência entre bula e diretriz.
 * FONTE: `docs/decisoes.md` — 18ª rodada; bula Actilyse I23-01 p. 4, 6, 7, 8, 9.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada18-"));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
const arq = (...p) => path.join(appDir, ...p);
const existe = (...p) => fs.existsSync(arq(...p));
const ler = (...p) => (existe(...p) ? fs.readFileSync(arq(...p), "utf8") : "");
const fontes = [arq("avc", "nucleo", "estado.ts"), arq("avc", "nucleo", "relogio.ts"), arq("avc", "nucleo", "derivacoes-f.ts"),
  arq("avc", "nucleo", "derivacoes-c.ts"), arq("avc", "conteudo", "superficie-f.ts"), arq("avc", "conteudo", "plano-48h.ts")];
if (existe("avc", "conteudo", "bula-actilyse.ts")) fontes.push(arq("avc", "conteudo", "bula-actilyse.ts"));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop", "--jsx", "react-jsx",
    "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
const DF = emT("avc", "nucleo", "derivacoes-f.js");
const DC = emT("avc", "nucleo", "derivacoes-c.js");
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const CP = emT("avc", "conteudo", "plano-48h.js");
const B = emT("avc", "conteudo", "bula-actilyse.js");

const tenta = (fn, padrao) => { try { return fn(); } catch (err) { return padrao === undefined ? `⛔ ${err.message}` : padrao; } };
const telaF = lerFonte(arq("components", "avc", "superficie-f.tsx"));

/* ══ A1 · POSOLOGIA DA BULA (D-PEND-25) ═══════════════════════════════════ */
{
  const P = B?.POSOLOGIA_AVC_BULA;
  conf("existe a posologia do AVC da bula, com versão I23-01 e página", P !== undefined && /I23-01/.test(B?.FONTE_BULA_ACTILYSE ?? "") && P.pagina === 8, `⛔ ${JSON.stringify(P)}`);
  conf("… 0,9 mg/kg, máx. 90 mg, 10% em bolus, restante em 60 min", P?.mgPorKg === 0.9 && P?.maximoMg === 90 && P?.fracaoBolus === 0.1 && P?.minutosInfusao === 60, "⛔");
  conf("… concentração 1 mg/mL com página própria (p. 7)", P?.concentracaoMgPorMl === 1 && P?.paginaConcentracao === 7, "⛔");
  conf("⚠️ … a posologia do AVC da bula ⛔ dá duração do bolus (1–2 min é da embolia pulmonar; 1 min é da descrição do NINDS)",
    P !== undefined && P.minutosBolus === undefined && /embolia pulmonar/i.test(P.notaDoBolus ?? "") && /NINDS/.test(P.notaDoBolus ?? ""), `⛔ ${P?.minutosBolus} · ${P?.notaDoBolus}`);
  conf("a duração do bolus aparece nas DUAS posições rotuladas (diretriz × bula brasileira)",
    /avc-f-dose-bolus-diretriz/.test(telaF) && /avc-f-dose-bolus-bula/.test(telaF) && /tr\("Bula brasileira"\)/.test(telaF) && /tr\("Diretriz AHA\/ASA 2026"\)/.test(telaF), "⛔ uma posição só");
}

/* ══ A2 · TABELA DE DOSE POR PESO DA BULA ═════════════════════════════════ */
{
  const T = B?.TABELA_DE_DOSE_AVC_BULA ?? [];
  conf("a tabela da bula tem 31 linhas: 40 a 98 kg de 2 em 2, ⛔ a linha 100+", T.length === 31 && T[0]?.pesoKg === 40 && T[29]?.pesoKg === 98 && T[30]?.rotulo === "100+", `⛔ ${T.length}`);
  const linha = (kg) => T.find((x) => x.pesoKg === kg);
  const literal = [[40, 36.0, 3.6, 32.4], [42, 37.8, 3.8, 34.0], [56, 50.4, 5.0, 45.4], [66, 59.4, 5.9, 53.5], [70, 63.0, 6.3, 56.7], [88, 79.2, 7.9, 71.3], [98, 88.2, 8.8, 79.4], [100, 90.0, 9.0, 81.0]];
  conf("… linhas conferidas contra o PDF (p. 9): 40, 42, 56, 66, 70, 88, 98 ⛔ 100+",
    literal.every(([kg, t, b, i]) => linha(kg)?.totalMg === t && linha(kg)?.bolusMg === b && linha(kg)?.infusaoMg === i),
    `⛔ ${JSON.stringify(literal.filter(([kg, t, b, i]) => !(linha(kg)?.totalMg === t && linha(kg)?.bolusMg === b && linha(kg)?.infusaoMg === i)))}`);
  conf("… consistência interna de toda linha: total = 0,9 × kg; bolus = 10% com uma casa; infusão = total − bolus",
    T.length > 0 && T.every((x) => x.totalMg === Math.round(Math.min(x.pesoKg * 0.9, 90) * 10) / 10
      && x.bolusMg === Math.round(Number((x.totalMg * 0.1).toFixed(6)) * 10) / 10
      && x.infusaoMg === Math.round(Number((x.totalMg - x.bolusMg).toFixed(6)) * 10) / 10),
    "⛔ linha inconsistente");

  const dose = (kg) => tenta(() => DF.doseDerivada("alteplase", kg, "estimado"), undefined);
  const c70 = dose(70)?.conferenciaBula;
  conf("⚠️ 70 kg → conferência da bula 63,0 mg · bolus 6,3 · infusão 56,7 (p. 9)", c70?.totalMg === 63 && c70?.bolusMg === 6.3 && c70?.infusaoMg === 56.7 && /p\. 9/.test(c70?.fonte ?? ""), `⛔ ${JSON.stringify(c70)}`);
  const c71 = dose(71)?.conferenciaBula;
  conf("… 71 kg: a tabela ⛔ traz a linha, ⛔ nada é interpolado", c71?.semLinha === true && c71?.totalMg === undefined, `⛔ ${JSON.stringify(c71)}`);
  const c120 = dose(120)?.conferenciaBula;
  conf("… 120 kg: linha 100+ (90,0 · 9,0 · 81,0)", c120?.rotulo === "100+" && c120?.totalMg === 90, `⛔ ${JSON.stringify(c120)}`);
  conf("… 39 kg: abaixo da tabela, sem linha", dose(39)?.conferenciaBula?.semLinha === true, "⛔");
  conf("… tenecteplase ⛔ recebe a tabela da alteplase", tenta(() => DF.doseDerivada("tenecteplase", 70, "estimado")?.conferenciaBula, "erro") === undefined, "⛔");
  conf("… a dose exibida continua a exata (70 kg = 63 mg; 71 kg = 63,9 mg)", dose(70)?.totalMg === 63 && dose(71)?.totalMg === 63.9, `⛔ ${dose(71)?.totalMg}`);
  const bloco = telaF.slice(telaF.indexOf("avc-f-dose-bula"), telaF.indexOf("avc-f-dose-bula") + 1600);
  conf("a tela rotula «tabela da bula, para conferência — não é a dose a preparar», só em mg",
    /tr\("tabela da bula, para conferência — não é a dose a preparar"\)/.test(telaF) && bloco.length > 0 && !/tr\("mL"\)/.test(bloco.slice(0, bloco.indexOf("InfoDoCard") > 0 ? bloco.indexOf("InfoDoCard") : bloco.length)),
    "⛔ sem rótulo ou com mL");
}

/* ══ A3 · D-PEND-23 · HSA COM FONTE NOMINAL DE BULA ═══════════════════════ */
{
  const LIT = "histórico, evidência ou suspeita de hemorragia intracraniana, incluindo hemorragia subaracnóidea";
  conf("a frase literal da bula (p. 4) está no conteúdo", B?.LITERAL_HSA_BULA?.texto === LIT && B?.LITERAL_HSA_BULA?.pagina === 4, `⛔ ${JSON.stringify(B?.LITERAL_HSA_BULA)}`);
  const rel = R?.relogioControlado?.(1_800_000_000_000);
  const e = tenta(() => E.registrarFato(E.abrirAtendimento(rel), { campo: "suspeita_hsa", valor: "sim" }, rel), undefined);
  const r = tenta(() => DC.retencaoDiagnostica(e), {});
  conf("⚠️ a retenção da HSA cita a bula nominalmente (⛔ «trecho não transcrito»)",
    r.estado === "retida" && /Actilyse/.test(r.procedencia ?? "") && /p\. 4/.test(r.procedencia ?? "") && !/não transcrito/.test(r.procedencia ?? ""), `⛔ ${r.procedencia}`);
  conf("… a classificação continua «avaliação especializada», ⛔ impedimento (D-PEND-23)", r.classificacao === "avaliacao_especializada", `⛔ ${r.classificacao}`);
  conf("… a frase literal aparece no ⓘ das duas retenções (IVT ⛔ EVT)", (telaF.match(/LITERAL_HSA_BULA/g) ?? []).length >= 2, "⛔ literal fora do ⓘ");
}

/* ══ A4 · JANELA: DUAS POSIÇÕES ROTULADAS ═════════════════════════════════ */
{
  const D = B?.DIVERGENCIAS_DE_CARD ?? {};
  conf("as recomendações de janela estendida têm a posição da bula registrada (p. 4, p. 6)",
    ["ivt_inicio_desconhecido", "ivt_wakeup_ou_45_9", "ivt_lvo_sem_evt"].every((id) => /4,5 h/.test(D[id]?.bula ?? "") && D[id]?.paginas?.includes(4)), `⛔ ${JSON.stringify(D)}`);
  conf("… o cartão da recomendação mostra as duas posições, rotuladas", /avc-f-rec-bula-/.test(telaF) && /DIVERGENCIAS_DE_CARD/.test(telaF), "⛔ cartão com uma posição só");
}

/* ══ A5 · CRITÉRIO DE BULA ⛔ É REGRA ══════════════════════════════════════ */
{
  const nucleo = fs.readdirSync(arq("avc", "nucleo")).filter((f) => f.endsWith(".ts")).filter((f) => /bula-actilyse/.test(lerFonte(arq("avc", "nucleo", f))));
  conf("⚠️ nenhum arquivo do núcleo lê os critérios da bula (⛔ regra determinística)",
    nucleo.every((f) => !/CRITERIOS_DE_BULA/.test(lerFonte(arq("avc", "nucleo", f)))), `⛔ ${nucleo.join(", ")}`);
  const pacote = ler("docs", "avc", "revisao", "bula-x-diretriz.md");
  conf("o pacote bula × diretriz existe, com decisão em branco", /Decisão humana:\*\* ___/.test(pacote) && /NIHSS >25/.test(pacote) && /plaquetas/i.test(pacote) && /I23-01/.test(pacote), "⛔ pacote ausente ou decidido");
  conf("… lista a duração do bolus ⛔ o puerpério como divergência", /duração do bolus/.test(pacote) && /parto nos últimos 10 dias/.test(pacote), "⛔");
}

/* ══ B · HSA 2023 INTEGRAL ═════════════════════════════════════════════════ */
{
  const hsa = ler("protocols", "fontes-verbatim", "aha-asa-2023-hsa.md");
  conf("S-00 conferido no PDF integral, seis recomendações com COR/LOE e página", /S-00[\s\S]*PDF integral/.test(hsa) && /\| 6 \| 2a \| B-NR \|/.test(hsa) && /\| 2 \| 1 \| B-NR \|/.test(hsa), "⛔ S-00 sem conferência");
  const res = ler("docs", "avc", "revisao", "hsa-resolucao.md");
  conf("⚠️ opção E com a regra real: déficit novo ou >6 h → TC negativa ⛔ resolve, punção lombar; angio-TC depois de HSA demonstrada",
    /\*\*E\*\*[\s\S]*déficit neurológico novo ou mais de 6 h[\s\S]*punção lombar[\s\S]*HSA demonstrada/.test(res), "⛔ opção E sem a regra");
  conf("… a decisão continua em branco", /\*\*Decisão humana:\*\* ___/.test(res), "⛔");
}

/* ══ C · LINHA DE CUIDADOS (MS) ════════════════════════════════════════════ */
{
  const pcdt = ler("docs", "avc", "revisao", "pcdt-brasil.md");
  conf("pcdt-brasil.md existe: elegibilidade, fluxo, centros, cuidados ⛔ divergências, com decisão em branco",
    /Elegibilidade/.test(pcdt) && /Fluxo/.test(pcdt) && /Critérios de centro/.test(pcdt) && /Cuidados/.test(pcdt) && /Onde diverge/.test(pcdt) && /Decisão humana:\*\* ___/.test(pcdt), "⛔");
}

/* ══ ERRATA · TABLE 8 ══════════════════════════════════════════════════════ */
{
  const errata = ler("docs", "avc", "revisao", "errata-2026.md");
  conf("a errata é conferida item a item (1 a 34), com o deslocamento de página", /\+315/.test(errata) && /\| 18 \|/.test(errata) && /31–34/.test(errata), "⛔");
  const puerperio = ler("docs", "avc", "revisao", "AC-03r-puerperio.md");
  conf("⚠️ Table 8 conferida: gestação e puerpério sem janela em dias (p. e366), registrado no AC-03r", /e366/.test(puerperio) && /sem janela em dias/.test(puerperio), "⛔");
  const deg = (CP?.TAREFAS_TRANSVERSAIS ?? []).find((t) => t.id === "degluticao");
  conf("a deglutição cita a §5.2 rec. 1 (COR 1, C-EO), p. e389 — ⛔ «§ a localizar»", /§5\.2 rec\. 1/.test(deg?.fonte ?? "") && /e389/.test(deg?.fonte ?? "") && !/a localizar/.test(deg?.fonte ?? ""), `⛔ ${deg?.fonte}`);
  /**
   * ⚠️ Ajuste de instrumento (18ª rodada, depois de implementar): a primeira versão reprovava QUALQUER menção ao
   * dossiê, inclusive a nota que diz que o documento oficial o SUBSTITUI. ⚠️ Agora: reprova a linha que cita o
   * dossiê de conferência sem dizer que foi substituído.
   */
  const comDossie = ["docs", "protocols", "avc", "components"].flatMap((d) => {
    try { return execFileSync("grep", ["-rni", "dossiê de conferência", arq(d)], { encoding: "utf8" }).split("\n").filter(Boolean); } catch { return []; }
  }).filter((l) => !/decisoes\.md:|auditoria/.test(l) && !/substitu/i.test(l));
  conf("nenhuma procedência do app ou das fontes cita «dossiê de conferência»", comDossie.length === 0, `⛔ ${comDossie.join(", ")}`);
}

console.log(`\nprova-avc-rodada18: ${ok} ok · ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
