/**
 * valida-escopo-pediatrico.cjs — PD-2
 *
 * PROMETE: que nenhum arquivo de conteúdo VIVO introduza dose/conduta
 *   pediátrica nova (padrão: número + mg/kg, mcg/kg ou mL/kg perto de
 *   "criança"/"pediátric"/"infantil"/"lactente"/"recém-nascido"; ou EpiPen Jr,
 *   dispositivo exclusivamente pediátrico) sem que a infraestrutura pediátrica
 *   (peso, faixas de sinais vitais, calculadoras próprias) exista.
 * NÃO PROMETE: que o app tenha ou não deva ter escopo pediátrico algum dia —
 *   só que, enquanto não tiver a infraestrutura, nenhum fragmento avulso novo
 *   nasce. Não julga se um achado que dispare esta trava é clinicamente
 *   correto — só que ele não pertence aqui sem a trilha por trás.
 * UNIVERSO: toda a árvore de conteúdo (.ts/.tsx) fora scripts, e2e, locales e
 *   i18n — EXCETO os três engines mortos (D-22, ainda não resolvida) e
 *   `lib/escopo-pediatrico.ts` (a fonte do próprio ponteiro).
 *
 * ── O DEFEITO ───────────────────────────────────────────────────────────────
 *
 * Sete fragmentos pediátricos avulsos (Anafilaxia 5, ISR 1, Convulsões 1 —
 * mais um oitavo achado só ao ESCREVER esta trava, em `sedation-engine.ts`)
 * chegaram ao app do mesmo jeito: uma fonte clínica citava as duas
 * populações, e o número pediátrico foi copiado junto, sem virar trilha.
 * PD-2 (`auditoria/DECISOES-DE-PRODUTO.md`) decidiu: população ADULTA,
 * ausência DECLARADA (ponteiro `FORA_DE_ESCOPO_PEDIATRICO`), reversível — mas
 * só com infraestrutura própria, não fragmento por fragmento outra vez.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const DOSE_PEDIATRICA_RE =
  /\d+(?:[.,]\d+)?\s*(?:mg|mcg|mL)\/kg.{0,60}?(criança|pediátric|infantil|lactente|recém-nascido)|(criança|pediátric|infantil|lactente|recém-nascido).{0,60}?\d+(?:[.,]\d+)?\s*(?:mg|mcg|mL)\/kg/i;
const EPIPEN_JR_RE = /EpiPen\s*Jr/i;

function detectaDosePediatrica(linha) {
  return DOSE_PEDIATRICA_RE.test(linha) || EPIPEN_JR_RE.test(linha);
}

// ── R-10 — mutação antes de usar ────────────────────────────────────────────
{
  const POSITIVO_1 = '        "Bradicardia vagal em criança < 5 anos: pré-medicar atropina 0,02 mg/kg (mín 0,1 mg).",';
  const POSITIVO_2 = '        "Autoinjector: EpiPen 0,3 mg (≥ 30 kg) / EpiPen Jr 0,15 mg (15–30 kg).",';
  const NEGATIVO_PONTEIRO = "        FORA_DE_ESCOPO_PEDIATRICO,";
  const NEGATIVO_ADULTO = '        "Dose adulta: 0,3–0,5 mg IM na face anterolateral da coxa.",';

  if (!detectaDosePediatrica(POSITIVO_1)) {
    falhas.push("R-10: a trava não pegou o cenário POSITIVO_1 (mg/kg + criança) — o achado real de sedation-engine.ts passaria despercebido de novo.");
  } else ok++;
  if (!detectaDosePediatrica(POSITIVO_2)) {
    falhas.push("R-10: a trava não pegou EpiPen Jr — dispositivo exclusivamente pediátrico sem número mg/kg.");
  } else ok++;
  if (detectaDosePediatrica(NEGATIVO_PONTEIRO)) {
    falhas.push("R-10: a trava acusou o PRÓPRIO ponteiro — falso positivo no caminho certo.");
  } else ok++;
  if (detectaDosePediatrica(NEGATIVO_ADULTO)) {
    falhas.push("R-10: a trava acusou uma dose adulta comum — falso positivo por coincidência de palavra.");
  } else ok++;
}

const EXCECOES_ARQUIVO = new Set([
  "lib/escopo-pediatrico.ts",
]);

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}

{
  let vistos = 0;
  for (const arquivo of fontes(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (EXCECOES_ARQUIVO.has(rel)) continue;
    const texto = fs.readFileSync(arquivo, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    vistos++;
    texto.split("\n").forEach((linha, i) => {
      if (/^\s*\/\//.test(linha)) return;
      if (!detectaDosePediatrica(linha)) return;
      falhas.push(
        `${rel}:${i + 1} — dose/conduta pediátrica nova fora do ponteiro: «${linha.trim().slice(0, 100)}».\n` +
        `    PD-2 (auditoria/DECISOES-DE-PRODUTO.md): população ADULTA. Use FORA_DE_ESCOPO_PEDIATRICO ` +
        `(lib/escopo-pediatrico.ts) em vez de um fragmento novo — a infraestrutura pediátrica não existe ainda.`
      );
    });
  }
  if (vistos < 100) falhas.push(`a varredura leu só ${vistos} arquivos — universo pequeno demais para valer como trava.`);
  else ok++;
}

console.log(`\nEscopo pediátrico — nenhuma dose nova sem infraestrutura (PD-2)\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} verificações — população adulta declarada, ausência pediátrica sem fragmento novo\n`);
