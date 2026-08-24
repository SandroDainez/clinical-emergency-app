#!/usr/bin/env node
/**
 * PROMETE: que, em toda faixa numérica real que alimenta `NumericStepper`,
 *   `(max - min)` seja múltiplo de `passo` — dentro de tolerância de ponto
 *   flutuante. É a condição sob a qual `max` é alcançável pela função `limitar`
 *   do componente (ela ancora os degraus em `min` e nunca corrige `max` que
 *   caia fora da grade — só o descarta em silêncio).
 * NÃO PROMETE: que `passo` seja a granularidade certa, nem que o arredondamento
 *   do componente esteja correto. Não altera o `NumericStepper`, não muda
 *   granularidade, não cria regra clínica — só confere a aritmética.
 * UNIVERSO: as fontes reais de faixa numérica do app, listadas e contadas antes
 *   do resultado — não uma amostra.
 * ORIGEM DO CRITÉRIO: instrução direta do usuário, 2026-08-24.
 *
 * ── POR QUE ISTO IMPORTA, MEDIDO ANTES DE CORRIGIR NADA ──────────────────────
 *
 * `NumericStepper.limitar()`:
 *   const preso = clamp(n, min, max);
 *   const emPassos = round((preso - min) / passo) * passo + min;
 *
 * Os degraus são ancorados em `min`. Se `(max - min)` não for múltiplo de
 * `passo`, `max` nunca é um desses degraus — o botão "+" fica HABILITADO perto
 * do topo (porque `noMaximo = valor >= max` nunca vira verdadeiro) e PARA DE
 * FAZER EFEITO, sem avisar.
 *
 * Medição de 2026-08-24: **hoje não há instância viva do defeito** — 71 de 71
 * conjuntos conhecidos alcançam min e max. O risco não é o presente, é o
 * futuro: `faixaDaBarra()` (sedoanalgesia) CALCULA o teto em runtime e o
 * arredonda com `toFixed(2)` sem checar se o resultado é múltiplo do passo — a
 * compatibilidade de hoje é CONTINGENTE aos números de dose atuais, não
 * garantida pela função. Um modo novo, ou uma dose alterada, pode quebrar sem
 * que nada avise. Esta trava existe para essa hora.
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const RAIZ = path.resolve(__dirname, "..");
let falhas = 0, universo = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

/** A MESMA fórmula de `limitar()` no componente — reproduzida para medir o que ele mede, não uma suposição sobre ele. */
function inteiroDentroDaTolerancia(max, min, passo) {
  if (!(passo > 0)) return false;
  const passos = (max - min) / passo;
  return Math.abs(passos - Math.round(passos)) < 1e-6;
}

function conferir(origem, nome, min, max, passo) {
  universo++;
  if (!inteiroDentroDaTolerancia(max, min, passo)) {
    const passos = (max - min) / passo;
    erro(`${origem} · ${nome}: min=${min} max=${max} passo=${passo} → (max-min)/passo=${passos} NÃO é inteiro — max fica fora da grade ancorada em min, o botão "+" para perto do topo sem avisar`);
  }
}

// ── 1 · lib/faixas-de-entrada.ts — fonte única consumida pelas árvores e por
// três telas de calculadora. ESTÁTICA: compilada e lida real.
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fx-stepper-"));
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
    path.join(RAIZ, "lib", "faixas-de-entrada.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
  const { FAIXA_DE_ENTRADA } = require(path.join(tmp, "faixas-de-entrada.js"));
  for (const [campo, f] of Object.entries(FAIXA_DE_ENTRADA))
    conferir("lib/faixas-de-entrada.ts", campo, f.min, f.max, f.passo);
}

// ── 2 · vasoactive-engine.ts → `faixaDeDose` por droga.
//
// ⚠️ LIDO POR REGEX ANCORADO NO OBJETO LITERAL EXATO, não por compilação: o
// arquivo importa `./protocols/drogas_vasoativas.json`, que o `tsc` isolado não
// resolve para um `outDir` só com este entry point. O regex lê a MESMA
// declaração `faixaDeDose: { min: …, max: …, passo: … }` que o componente
// consome — não é proxy, é o dado.
{
  const src = lerFonte(path.join(RAIZ, "vasoactive-engine.ts"));
  const acha = [...src.matchAll(/faixaDeDose:\s*\{\s*min:\s*([\d.]+),\s*max:\s*([\d.]+),\s*passo:\s*([\d.]+)\s*\}/g)];
  if (acha.length === 0) erro("vasoactive-engine.ts: nenhuma `faixaDeDose` encontrada — o padrão de leitura pode ter ficado obsoleto (a droga mudou de forma sem a trava acompanhar)");
  acha.forEach((m, i) => conferir("vasoactive-engine.ts", `faixaDeDose #${i + 1}`, Number(m[1]), Number(m[2]), Number(m[3])));
}

// ── 3 · sedation-engine.ts → `faixaDaBarra(mode)` — ⚠️ A CRÍTICA: CALCULADA EM
// RUNTIME, não uma tabela. Roda a função REAL contra os modos REAIS de infusão
// declarados em `SED_DRUGS` — é o único jeito de medir o que ela realmente
// devolve, porque o teto é derivado de `defaultDose`/`ranges` e arredondado com
// `toFixed(2)` sem checar o passo.
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sed-stepper-"));
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
    path.join(RAIZ, "sedation-engine.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
  const M = require(path.join(tmp, "sedation-engine.js"));
  const modos = [];
  for (const droga of M.SED_DRUGS ?? [])
    for (const modo of droga.modes ?? [])
      if (modo.kind === "infusion") modos.push({ droga: droga.name ?? droga.id, modo });
  if (modos.length === 0) erro("sedation-engine.ts: nenhum modo de infusão encontrado em SED_DRUGS — a leitura pode ter ficado obsoleta");
  for (const { droga, modo } of modos) {
    const f = M.faixaDaBarra(modo);
    conferir("sedation-engine.ts · faixaDaBarra()", `${droga} · ${modo.id} (${modo.unit})`, f.min, f.max, f.passo);
  }
}

// ── 4 · Literais de min/max/passo escritos direto na chamada de NumericStepper
// nas telas — varredura genérica, para pegar hoje E qualquer novo hardcode
// futuro que ninguém ligou a uma fonte de dado.
{
  const arqs = ["components/protocol-screen/sedation-calculator-screen.tsx",
    "components/protocol-screen/vasoactive-calculator-screen.tsx",
    "app/dev/ui-v2.tsx"];
  for (const rel of arqs) {
    const caminho = path.join(RAIZ, rel);
    if (!fs.existsSync(caminho)) continue;
    const src = lerFonte(caminho);
    for (const bloco of src.matchAll(/<NumericStepper\b[\s\S]{0,500}?\/>/g)) {
      const t = bloco[0];
      const min = t.match(/\bmin=\{(-?[\d.]+)\}/);
      const max = t.match(/\bmax=\{(-?[\d.]+)\}/);
      const passo = t.match(/\bpasso=\{([\d.]+)\}/);
      // ⚠️ `passo` AUSENTE NÃO É "SEM PASSO" — o componente tem default 1
      // (`passo = 1` na assinatura). A primeira versão exigia o literal
      // presente e PULAVA o PEEP (min=0 max=24, sem `passo=`), perdendo 1 dos
      // 71 conjuntos sem avisar — o próprio instrumento caindo no R-87 que ele
      // existe para evitar em outro lugar.
      //
      // ⚠️ SÓ QUANDO min/max SÃO LITERAIS NUMÉRICOS. Quando vêm de expressão
      // (`FAIXA_DE_ENTRADA.x`, `faixaDeDose`, `faixaNumerica(...)`), a fonte já
      // foi conferida nos blocos 1–3 — reprocessar aqui mediria o mesmo
      // conjunto duas vezes.
      if (min && max)
        conferir(rel, `NumericStepper literal (linha ~${src.slice(0, bloco.index).split("\n").length})`, Number(min[1]), Number(max[1]), passo ? Number(passo[1]) : 1);
    }
  }
}

console.log(`\nUNIVERSO: ${universo} conjunto(s) min/max/passo conferidos, de 4 fontes (FAIXA_DE_ENTRADA · vasoactive faixaDeDose · sedation faixaDaBarra() · literais em tela)`);
console.log(falhas
  ? `\n❌ ${falhas} falha(s)`
  : `\n✅ todos os conjuntos alcançam min e max — (max-min)/passo é inteiro em ${universo}/${universo}`);
process.exit(falhas ? 1 : 0);
