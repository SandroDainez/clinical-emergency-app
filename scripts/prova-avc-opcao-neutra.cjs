#!/usr/bin/env node
/**
 * PROVA · D-PEND-21 — OPÇÃO NÃO MARCADA É NEUTRA (autor, 2026-09-13).
 *
 * Decisão, nos termos do autor: *"opção não marcada é neutra (contorno, sem
 * preenchimento de cor semântica); cor só após marcação, sempre acompanhada de ✓
 * e borda."*
 *
 * PROMETE: que a aparência de uma opção Sim/Não/Incerto nasce de UM lugar
 * (`design-system/opcao-de-decisao.ts`): não marcada → corpo neutro com contorno,
 * sem verde nem vermelho, sem ✓; marcada → borda de 2 px ⛔ e ✓, ⛔ e só então verde
 * (Sim) ou vermelho (Não) — "Incerto" marcado ganha borda e ✓, ⛔ nunca uma cor;
 * que isso vale nos dois temas; que os quatro desenhadores de decisão do AVC
 * consomem essa fonte; ⛔ e que ⛔ nenhum arquivo de `components/avc` pinta estilo
 * com `successFill`/`criticalFill` por conta própria (a varredura é genérica e tem
 * autoteste).
 * NÃO PROMETE: a aparência na tela (isso é `e2e/avc-opcao-neutra.spec.ts`, que
 * varre toda pergunta Sim/Não/Incerto das superfícies); ⛔ nem o contraste dos
 * tokens (isso é `test:contraste`).
 * UNIVERSO: `design-system/opcao-de-decisao.ts`; todo `.tsx` de `components/avc/**`.
 * FONTE: D-PEND-21 (`docs/decisoes.md`).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

/* ══ 1 · varredura genérica: estilo com cor semântica de opção fora da fonte única ══ */
const EXCECOES = new Map([
  ["components/avc/sistema/index.tsx:acaoCritica", "botão de AÇÃO crítica (preenchido de propósito), ⛔ não é opção de resposta"],
]);
function coresSemanticasEmEstilos(txt) {
  const achados = [];
  for (const m of txt.matchAll(/^\s*([A-Za-z0-9_]+):\s*\{([^{}]*)\}/gm)) {
    if (/tema\.cores\.(successFill|criticalFill)\b/.test(m[2])) achados.push(m[1]);
  }
  return achados;
}
conf(
  "autoteste: a varredura pega um estilo pintado com successFill",
  coresSemanticasEmEstilos('    x: { backgroundColor: tema.cores.successFill },\n    y: { color: tema.cores.text },').join() === "x",
  "⛔ a varredura ⛔ enxerga o caso mínimo"
);
const listar = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) =>
  x.isDirectory() ? listar(path.join(d, x.name)) : x.name.endsWith(".tsx") ? [path.join(d, x.name)] : []);
const arquivos = listar(path.join(appDir, "components", "avc"));
conf("controle: a varredura cobre os componentes do AVC", arquivos.length > 20, `⛔ ${arquivos.length} arquivos`);
const pintados = [];
for (const f of arquivos) {
  const rel = path.relative(appDir, f);
  for (const chave of coresSemanticasEmEstilos(lerFonte(f))) {
    if (!EXCECOES.has(`${rel}:${chave}`)) pintados.push(`${rel}:${chave}`);
  }
}
conf(
  "⛔ nenhum componente do AVC pinta estilo com verde/vermelho semântico por conta própria",
  pintados.length === 0,
  `⛔ ${pintados.length}: ${pintados.join(" · ")}`
);

/* ══ 2 · a fonte única ══ */
const alvo = path.join(appDir, "design-system", "opcao-de-decisao.ts");
conf("a fonte única existe (design-system/opcao-de-decisao.ts)", fs.existsSync(alvo), "⛔ arquivo ausente");
let OD;
let TEMAS;
if (fs.existsSync(alvo)) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "opcao-neutra-"));
  try {
    execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp,
      alvo, path.join(appDir, "design-system", "tokens.ts")], { cwd: appDir, stdio: "pipe" });
  } catch { /* erros de tipo de dependências ⛔ impedem a emissão; a existência do .js é conferida abaixo */ }
  const js = path.join(tmp, "design-system", "opcao-de-decisao.js");
  if (fs.existsSync(js)) { OD = require(js); TEMAS = require(path.join(tmp, "design-system", "tokens.js")).TEMAS; }
}
conf("a fonte única compila e exporta opcaoDeDecisao e vistaDaOpcaoDeDecisao",
  OD !== undefined && typeof OD.opcaoDeDecisao === "function" && typeof OD.vistaDaOpcaoDeDecisao === "function",
  "⛔ exportações ausentes");

if (OD !== undefined) {
  const v = OD.vistaDaOpcaoDeDecisao;
  for (const g of ["sim", "nao", "nao_sei"]) {
    const x = v(g, false);
    conf(`não marcada (${g}): corpo SÓ neutro, sem ✓, texto neutro`,
      JSON.stringify(x.corpo) === '["decisaoNeutra"]' && x.marca === "" && x.texto === "decisaoTextoNeutro",
      `⛔ ${JSON.stringify(x)}`);
  }
  const s = v("sim", true);
  conf("Sim marcado: neutro + borda + verde, ✓, texto sobre preenchimento",
    JSON.stringify(s.corpo) === '["decisaoNeutra","decisaoMarcada","decisaoSim"]' && s.marca === "✓ " && s.texto === "decisaoTextoPreenchido",
    `⛔ ${JSON.stringify(s)}`);
  const n = v("nao", true);
  conf("Não marcado: neutro + borda + vermelho, ✓, texto sobre preenchimento",
    JSON.stringify(n.corpo) === '["decisaoNeutra","decisaoMarcada","decisaoNao"]' && n.marca === "✓ " && n.texto === "decisaoTextoPreenchido",
    `⛔ ${JSON.stringify(n)}`);
  const i = v("nao_sei", true);
  conf("Incerto marcado: borda + ✓, ⛔ nenhuma cor semântica",
    JSON.stringify(i.corpo) === '["decisaoNeutra","decisaoMarcada"]' && i.marca === "✓ " && i.texto === "decisaoTextoNeutro",
    `⛔ ${JSON.stringify(i)}`);

  for (const [nomeTema, tema] of Object.entries(TEMAS)) {
    const o = OD.opcaoDeDecisao(tema);
    const c = tema.cores;
    conf(`tema ${nomeTema}: o corpo neutro ⛔ tem verde nem vermelho, e tem contorno`,
      o.decisaoNeutra.backgroundColor !== c.successFill && o.decisaoNeutra.backgroundColor !== c.criticalFill
        && o.decisaoNeutra.borderWidth >= 1 && o.decisaoNeutra.borderColor === c.controlBorder,
      `⛔ ${JSON.stringify(o.decisaoNeutra)}`);
    conf(`tema ${nomeTema}: marcada tem borda de 2 px ou mais, na cor do texto`,
      o.decisaoMarcada.borderWidth >= 2 && o.decisaoMarcada.borderColor === c.text, `⛔ ${JSON.stringify(o.decisaoMarcada)}`);
    conf(`tema ${nomeTema}: Sim marcado é verde e Não marcado é vermelho`,
      o.decisaoSim.backgroundColor === c.successFill && o.decisaoNao.backgroundColor === c.criticalFill,
      `⛔ ${JSON.stringify([o.decisaoSim, o.decisaoNao])}`);
    conf(`tema ${nomeTema}: texto neutro na cor do texto; texto sobre preenchimento em onFill`,
      o.decisaoTextoNeutro.color === c.text && o.decisaoTextoPreenchido.color === c.onFill,
      `⛔ ${JSON.stringify([o.decisaoTextoNeutro, o.decisaoTextoPreenchido])}`);
  }
}

/* ══ 3 · os desenhadores consomem a fonte única ══ */
const DESENHADORES = [
  ["components/avc/ui/index.tsx", 2, "Segmentado e LinhaDeAchado"],
  ["components/avc/campos-clinicos.tsx", 1, "CampoDeEscolha"],
  ["components/avc/sistema/blocos.tsx", 1, "RespostaAction"],
];
for (const [rel, minimo, quem] of DESENHADORES) {
  const t = lerFonte(path.join(appDir, rel));
  const usos = (t.match(/vistaDaOpcaoDeDecisao\(/g) || []).length;
  conf(`${rel} (${quem}) desenha a decisão pela fonte única`, usos >= minimo, `⛔ ${usos} uso(s), esperado ≥ ${minimo}`);
  conf(`${rel} (${quem}) põe o ✓ pela vista (marcada), ⛔ não por conta própria`,
    (t.match(/vista\w*\.marca\b/g) || []).length >= minimo, "⛔ ✓ fora da vista");
}

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · D-PEND-21 OPÇÃO NEUTRA — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
