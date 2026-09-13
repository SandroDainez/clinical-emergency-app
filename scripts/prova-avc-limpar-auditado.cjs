#!/usr/bin/env node
/**
 * PROVA · D-PEND-26 (AC-63) — «LIMPAR» AUDITADO SOBRE RESPOSTA QUE SUSTENTA RETENÇÃO OU
 * BLOQUEIO (autor, 2026-09-13).
 *
 * PROMETE: que a regra é GENÉRICA — uma resposta sustenta retenção ou bloqueio quando
 * limpá-la faria sumir algum motivo restritivo do portão (efeito ⛔ "condição
 * resolutiva"/"informa") —, medida em duas perguntas: suspeita clínica de HSA «Sim» ⛔ e
 * "há razão para suspeitar de coagulação alterada" «Sim» (sem exames). Que o «Limpar»
 * auditado grava correção com motivo "toque errado" apontando o fato corrigido, devolve a
 * pergunta a "não respondida" (⛔ nunca "Não") ⛔ e faz a retenção/o bloqueio cair; que com
 * «Sim» seguido de «Não» ele corrige as duas respostas; que «Sim»→«Não» direto, SEM limpar,
 * continua retendo (HSA); que respostas que ⛔ sustentam nada (coagulação «Não», hipóxia
 * «Sim», HSA nunca respondida) ⛔ exigem confirmação; ⛔ e que a tela passa por esta regra
 * antes de limpar.
 * NÃO PROMETE: a confirmação na tela (isso é `e2e/avc-limpar-auditado.spec.ts`); ⛔ nem o
 * autor do evento (carimbado pela persistência, AC-40).
 * UNIVERSO: `avc/nucleo/limpar-auditado.ts`, `avc/nucleo/{estado,portao-ivt,derivacoes-c}.ts`,
 * `components/avc/avc-modulo-screen.tsx`.
 * FONTE: `docs/decisoes.md` D-PEND-26 ⛔ e D-PEND-27 (destaque visual no caminho seguro).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const alvo = path.join(appDir, "avc", "nucleo", "limpar-auditado.ts");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "limpar-auditado-"));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

const fontes = [["avc", "nucleo", "estado.ts"], ["avc", "nucleo", "relogio.ts"], ["avc", "nucleo", "derivacoes-c.ts"], ["avc", "nucleo", "portao-ivt.ts"]]
  .map((p) => path.join(appDir, ...p));
if (fs.existsSync(alvo)) fontes.push(alvo);
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => require(path.join(tmp, ...p));
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const DC = emT("avc", "nucleo", "derivacoes-c.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const jsAlvo = path.join(tmp, "avc", "nucleo", "limpar-auditado.js");
const L = fs.existsSync(jsAlvo) ? require(jsAlvo) : undefined;

conf("o módulo existe e exporta a regra genérica e o «Limpar» auditado",
  L !== undefined && typeof L.campoSustentaRetencaoOuBloqueio === "function" && typeof L.limparComCorrecaoAuditada === "function" && L.MOTIVO_TOQUE_ERRADO === "toque errado",
  "⛔ avc/nucleo/limpar-auditado.ts ausente ou incompleto");

const rel = R.relogioControlado(1_800_000_000_000);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
const vazio = () => E.abrirAtendimento(rel);
const correcoesComMotivo = (antes, depois, campo) =>
  depois.fatos.slice(antes.fatos.length).filter((f) => f.campo === campo && f.corrigeFatoId && f.motivo === "toque errado");

if (L !== undefined) {
  /* ── HSA «Sim» ── */
  const hsa = reg(vazio(), "suspeita_hsa", "sim");
  conf("HSA «Sim» sustenta retenção", L.campoSustentaRetencaoOuBloqueio(hsa, "suspeita_hsa", rel) === true, "⛔ false");
  const hsaLimpa = L.limparComCorrecaoAuditada(hsa, "suspeita_hsa", rel);
  conf("HSA · «Limpar» auditado → a retenção cai", DC.retencaoDiagnostica(hsaLimpa).estado === "livre", `⛔ ${DC.retencaoDiagnostica(hsaLimpa).estado}`);
  conf("HSA · a pergunta volta a «não respondida», ⛔ nunca «Não»", String(E.valorAtual(hsaLimpa, "suspeita_hsa").valor) === "nao_perguntado", `⛔ ${E.valorAtual(hsaLimpa, "suspeita_hsa").valor}`);
  const ev = correcoesComMotivo(hsa, hsaLimpa, "suspeita_hsa");
  conf("HSA · correção com motivo «toque errado» apontando o «Sim»",
    ev.length === 1 && ev[0].corrigeFatoId === hsa.fatos[hsa.fatos.length - 1].id, `⛔ ${JSON.stringify(ev)}`);

  /* ── HSA «Sim» → «Não» ── */
  const simNao = reg(hsa, "suspeita_hsa", "nao");
  conf("HSA «Sim»→«Não» direto, sem limpar → ⛔ continua retida", DC.retencaoDiagnostica(simNao).estado === "retida", "⛔ liberou");
  conf("HSA «Sim»→«Não» ainda sustenta (o «Sim» vigente)", L.campoSustentaRetencaoOuBloqueio(simNao, "suspeita_hsa", rel) === true, "⛔ false");
  const simNaoLimpa = L.limparComCorrecaoAuditada(simNao, "suspeita_hsa", rel);
  conf("HSA «Sim»→«Não» → «Limpar» auditado corrige as duas respostas e a retenção cai",
    DC.retencaoDiagnostica(simNaoLimpa).estado === "livre" && correcoesComMotivo(simNao, simNaoLimpa, "suspeita_hsa").length === 2
      && String(E.valorAtual(simNaoLimpa, "suspeita_hsa").valor) === "nao_perguntado",
    `⛔ ${DC.retencaoDiagnostica(simNaoLimpa).estado} · ${correcoesComMotivo(simNao, simNaoLimpa, "suspeita_hsa").length} correção(ões)`);

  /* ── coagulação «Sim» (sem exames) ── */
  const agora = rel.agora();
  const COAG = "motivo_para_suspeitar_alteracao_coagulacao";
  const coag = reg(vazio(), COAG, "sim");
  const ids = (e) => P.estadoDoPortaoIVT(e, agora).motivos.map((m) => `${m.id}|${m.efeito ?? m.camada}`);
  conf("controle: coagulação «Sim» sem exames gera motivo restritivo «coagulograma»", ids(coag).some((k) => k.startsWith("coagulograma|")), `⛔ ${ids(coag)}`);
  conf("coagulação «Sim» sustenta bloqueio", L.campoSustentaRetencaoOuBloqueio(coag, COAG, rel) === true, "⛔ false");
  const coagLimpa = L.limparComCorrecaoAuditada(coag, COAG, rel);
  conf("coagulação · «Limpar» auditado → o motivo «coagulograma» cai; pergunta «não respondida»",
    !ids(coagLimpa).some((k) => k.startsWith("coagulograma|")) && String(E.valorAtual(coagLimpa, COAG).valor) === "nao_perguntado",
    `⛔ ${ids(coagLimpa)}`);
  conf("coagulação · correção com motivo «toque errado»", correcoesComMotivo(coag, coagLimpa, COAG).length === 1, "⛔");

  /* ── controles: ⛔ sustentam nada ── */
  conf("controle · coagulação «Não» ⛔ sustenta (limpar só aumenta a cautela)", L.campoSustentaRetencaoOuBloqueio(reg(vazio(), COAG, "nao"), COAG, rel) === false, "⛔ true");
  conf("controle · hipóxia «Sim» ⛔ sustenta retenção de reperfusão", L.campoSustentaRetencaoOuBloqueio(reg(vazio(), "hipoxia", "sim"), "hipoxia", rel) === false, "⛔ true");
  conf("controle · HSA nunca respondida ⛔ sustenta", L.campoSustentaRetencaoOuBloqueio(vazio(), "suspeita_hsa", rel) === false, "⛔ true");
}

/* ── a tela passa pela regra antes de limpar ── */
const tela = lerFonte(path.join(appDir, "components", "avc", "avc-modulo-screen.tsx"));
const desfazer = (tela.match(/function desfazer\(campo: string\)[\s\S]*?\n  \}/) || [""])[0];
conf("a tela: «Limpar» consulta a regra genérica antes de corrigir", /campoSustentaRetencaoOuBloqueio\(/.test(desfazer), `⛔ ${desfazer.slice(0, 200)}`);
conf("a tela: a confirmação grava pelo «Limpar» auditado", /limparComCorrecaoAuditada\(/.test(tela) && /avc-confirmar-limpar|ConfirmacaoDeLimpar/.test(tela), "⛔ sem confirmação");

/* ── D-PEND-27: o destaque no caminho seguro ── */
const dialogo = lerFonte(path.join(appDir, "components", "avc", "confirmacao-de-limpar.tsx"));
const estiloDe = (testID) => ((dialogo.match(new RegExp(`style=\\{e\\.(\\w+)\\}[^>]*testID="${testID}"`)) || [])[1]);
conf("D-PEND-27 · «Manter a resposta» usa o estilo da ação padrão (botaoPrincipal)", estiloDe("avc-confirmar-limpar-cancelar") === "botaoPrincipal", `⛔ ${estiloDe("avc-confirmar-limpar-cancelar")}`);
conf("D-PEND-27 · «Foi engano — limpar» usa o estilo secundário", estiloDe("avc-confirmar-limpar-sim") === "botaoSecundario", `⛔ ${estiloDe("avc-confirmar-limpar-sim")}`);

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · D-PEND-26 «LIMPAR» AUDITADO — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
