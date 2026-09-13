#!/usr/bin/env node
/**
 * PROVA · LIMPEZA VISUAL (autor, 2026-09-13) — ⛔ nenhuma regra clínica muda.
 *
 * PROMETE: que o rodapé de pendências recebe, para bloqueio corrigível, um estado
 * CURTO ("PA ainda acima da meta" · "Nova aferição pendente") sem alterar o
 * `resolvePor` que o tratamento ⛔ e o portão usam; que a ameaça cuja conduta repete
 * o achado chega ao rodapé com o achado curto; que a tela usa esses textos no
 * rodapé, que o aviso "Atenção" do topo diz o estado curto em vez da frase da
 * recomendação, e que o cockpit ⛔ diz mais "Os quatro eixos avaliados".
 * NÃO PROMETE: a aparência na tela (isso é `e2e/avc-limpeza-visual.spec.ts`); ⛔ nem
 * que o bloqueio, o portão ou a recomendação mudem — a prova confere que ⛔ não.
 * UNIVERSO: `avc/nucleo/{problemas-ativos,derivacoes-d}.ts`,
 * `components/avc/{avc-modulo-screen,superficie-a}.tsx`.
 * FONTE: pedido do autor de 2026-09-13 (limpeza visual).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "limpeza-visual-"));
execFileSync(
  "npx",
  ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "problemas-ativos.ts"),
    path.join(appDir, "avc", "conteudo", "campos.ts")],
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
const PA = emT("avc", "nucleo", "problemas-ativos.js");
const DD = emT("avc", "nucleo", "derivacoes-d.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");

const rel = R.relogioControlado(1_800_000_000_000);
const vazio = E.abrirAtendimento(rel);
const medir = (e, campo, valor) => CAMPOS.registrarComInstancia(e, { campo, valor }, rel);

/* ══ PA alta: estado curto no rodapé, ⛔ sem mexer no que o tratamento usa ═══ */
{
  const e = medir(medir(vazio, "pas", 198), "pad", 112);
  const b = DD.bloqueiosCorrigiveis(e).find((x) => x.id === "pressao_acima_da_meta");
  conf("controle: PA 198/112 abre o bloqueio", b !== undefined, "⛔ sem bloqueio");
  conf("regra intacta: `resolvePor` do bloqueio continua o mesmo", b !== undefined && b.resolvePor === "Uma nova aferição de pressão arterial", `⛔ ${b && b.resolvePor}`);
  conf("regra intacta: a formulação da recomendação continua a mesma",
    b !== undefined && b.formulacao === "Recomendação: controlar a pressão arterial antes de iniciar a trombólise, para reduzir complicações hemorrágicas", "⛔ formulação mudou");
  const p = PA.problemasAtivos(e).find((x) => x.id === "pressao_acima_da_meta");
  conf("rodapé: estado curto «PA ainda acima da meta»", p !== undefined && p.rotuloCurto === "PA ainda acima da meta", `⛔ ${p && p.rotuloCurto}`);
  conf("rodapé: resolução curta «Nova aferição pendente»", p !== undefined && p.resolveCurto === "Nova aferição pendente", `⛔ ${p && p.resolveCurto}`);

  const g = CAMPOS.registrarComInstancia(vazio, { campo: "glicemia", valor: 48 }, rel);
  const pg = PA.problemasAtivos(g).find((x) => x.id === "glicemia_alterada");
  conf("rodapé: a glicemia segue o mesmo padrão curto", pg !== undefined && typeof pg.rotuloCurto === "string" && typeof pg.resolveCurto === "string", `⛔ ${JSON.stringify(pg)}`);
}

/* ══ Respiração: conduta que repete o achado chega curta ao rodapé ═══════ */
{
  const e = E.registrarFato(vazio, { campo: "hipoxia", valor: "sim" }, rel);
  const p = PA.problemasAtivos(e).find((x) => x.id === "respiracao");
  conf("controle: hipoxemia «sim» vira problema de respiração", p !== undefined, "⛔ sem problema");
  conf("regra intacta: `resolvePor` continua sendo a conduta da fonte", p !== undefined && /Oxigênio suplementar recomendado/.test(p.resolvePor), `⛔ ${p && p.resolvePor}`);
  conf("rodapé: a resolução curta é o achado, ⛔ e ⛔ não a conduta longa equivalente",
    p !== undefined && p.resolveCurto === "O₂ suplementar — meta SpO₂ acima de 94%", `⛔ ${p && p.resolveCurto}`);
}

/* ══ A tela usa os textos curtos ═════════════════════════════════════════ */
{
  const tela = lerFonte(path.join(appDir, "components", "avc", "avc-modulo-screen.tsx"));
  conf("rodapé usa o estado curto", /p\.rotuloCurto\s*\?\?\s*p\.rotulo/.test(tela) && /p\.resolveCurto\s*\?\?\s*p\.resolvePor/.test(tela), "⛔ rodapé ainda usa os textos longos");
  conf("aviso «Atenção» do topo diz o estado curto, ⛔ e ⛔ não a frase da recomendação", /titulo=\{b\.estadoCurto\}/.test(tela) && !/titulo=\{b\.formulacao\}/.test(tela), "⛔ aviso ainda repete a recomendação");
  conf("cockpit ⛔ diz mais «Os quatro eixos avaliados»", !/Os quatro eixos avaliados/.test(tela), "⛔ texto de quatro eixos com cinco eixos na tela");
  const a = lerFonte(path.join(appDir, "components", "avc", "superficie-a.tsx"));
  conf("bloco «Atenção» da Estabilização tira o eco do achado do card", /achadosDosCards|achadosNoCard/.test(a), "⛔ sem filtro de eco");
}

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · LIMPEZA VISUAL — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
