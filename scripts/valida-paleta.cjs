#!/usr/bin/env node
/**
 * PROMETE: que nenhuma cor hexadecimal NOVA entre em `components/` ou `app/` fora do
 *   design system. Arquivo novo nasce com zero hex; arquivo do legado tem um
 *   TETO congelado que só pode descer.
 *
 * NÃO PROMETE: que a cor usada seja a CERTA para o papel (um `critical` onde cabia
 *   `warning` passa), nem que o par frente/fundo seja legível — isso é do
 *   `e2e/contraste-renderizado.spec.ts`, que mede o que foi renderizado.
 *   Também não vê cor vinda de variável, de `rgba(...)` ou de string montada.
 *
 * UNIVERSO: todos os `.ts`/`.tsx` sob `components/` e `app/`, DERIVADOS do diretório
 *   (D-15: universo se deriva do artefato, nunca se lista). `design-system/`
 *   fica de fora por definição — é onde a paleta mora.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O usuário relatou quatro sintomas de interface — caixas em vez de barras,
 * eletrólitos sem distinção visual, rail de Vasoativas apagado, módulos fora do
 * padrão. O levantamento mostrou que os quatro têm UMA causa: o app tem um
 * sistema de design (`design-system/tokens`, `ui-v2`, `FAIXA_DE_ENTRADA`) que a
 * maior parte das telas não consulta.
 *
 * ⚠️ E O NÚMERO QUE IMPORTA NÃO É "QUANTAS CORES ERRADAS": é que **1.222 das
 * 1.977 ocorrências JÁ SÃO CORES DA PALETA, copiadas em vez de importadas**.
 * Não é divergência de gosto, é duplicação — a mesma classe do R-48 e da D-34,
 * aplicada a cor: quando o tema mudar, muda num lugar e não nos outros.
 *
 * ── POR QUE TETO, E NÃO PROIBIÇÃO ───────────────────────────────────────────
 *
 * Proibir hoje exigiria migrar 55 arquivos num commit — e migração grande em
 * app clínico é exatamente o que não se faz por causa de uma trava. O teto por
 * arquivo transforma a dívida num número que **só pode cair**, e cada bloco de
 * convergência aperta o próprio teto (mesmo molde da D-35, das 24 traduções
 * pendentes).
 *
 * O que a trava garante desde hoje: **a próxima tela nasce certa.**
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const RAIZES = ["components", "app"];
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

const LEGADO_PATH = path.join(appDir, "design-system", "legado-de-cor.json");

/** Universo derivado do diretório — não há lista para esquecer de atualizar. */
function arquivos(dir, saida = []) {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      if (entrada.name === "node_modules") continue;
      arquivos(p, saida);
    } else if (/\.tsx?$/.test(entrada.name)) {
      saida.push(path.relative(appDir, p));
    }
  }
  return saida;
}

/**
 * ⚠️ COMENTÁRIO NÃO PINTA NADA — e contar hex dentro dele cobra pedágio por
 * documentar o defeito.
 *
 * Encontrado na prática: ao corrigir o rail de Vasoativas, os comentários que
 * explicavam a correção CITAVAM as cores erradas ("#aab6c6 sobre #1e6fd9 dá
 * 2,36:1"), e a trava contou cada citação como cor nova. Ou seja: escrever por
 * que a cor saiu fazia o teto subir.
 *
 * É a mesma família do R-15 item 13, em que uma trava casava com o comentário
 * que NARRAVA o defeito em vez de com o defeito. O instrumento tem de olhar
 * para o código que executa.
 */
function semComentarios(texto) {
  return texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

function contaHex(rel) {
  const texto = fs.readFileSync(path.join(appDir, rel), "utf8");
  return (semComentarios(texto).match(HEX) ?? []).length;
}

const falhas = [];
const avisos = [];
let ok = 0;

if (!fs.existsSync(LEGADO_PATH)) {
  console.log(`\n❌ ${LEGADO_PATH} não existe — sem o legado congelado esta trava não tem teto.\n`);
  process.exit(1);
}
const legado = JSON.parse(fs.readFileSync(LEGADO_PATH, "utf8"));

const universo = RAIZES.flatMap((r) => arquivos(path.join(appDir, r)));

// ── Vacuidade: universo vazio passa calado, e passar calado é o defeito ─────
if (universo.length < 30) {
  console.log(`\n❌ só ${universo.length} arquivos no universo — a varredura pode ter rodado sobre nada (R-15 item 9).\n`);
  process.exit(1);
}

const atual = {};
for (const rel of universo) {
  const n = contaHex(rel);
  if (n > 0) atual[rel] = n;
}

// ── 1. Arquivo FORA do legado não pode ter hex nenhum ──────────────────────
for (const [rel, n] of Object.entries(atual)) {
  if (rel in legado) continue;
  falhas.push(
    `\`${rel}\` tem ${n} cor(es) em hexadecimal e NÃO está no legado.\n` +
    `      ⚠️ Arquivo novo nasce usando o design system: importe de ` +
    `\`design-system/tokens\` (ou \`useEstilosDoTema\`) em vez de escrever a cor.\n` +
    `      Se a cor não existe na paleta, ela é uma DECISÃO DE TEMA — entra em ` +
    `design-system/, onde a trava de contraste a enxerga.`
  );
}

// ── 2. Arquivo DO legado não pode piorar ───────────────────────────────────
for (const [rel, teto] of Object.entries(legado)) {
  if (!fs.existsSync(path.join(appDir, rel))) {
    avisos.push(`\`${rel}\` sumiu do repositório — remova a linha do legado.`);
    continue;
  }
  const n = atual[rel] ?? 0;
  if (n > teto) {
    falhas.push(
      `\`${rel}\` subiu de ${teto} para ${n} cores em hexadecimal.\n` +
      `      ⚠️ O teto do legado SÓ DESCE. Use o token; se você corrigiu parte do ` +
      `arquivo, baixe o número em design-system/legado-de-cor.json.`
    );
  } else {
    ok++;
    if (n < teto) {
      avisos.push(
        `\`${rel}\` caiu de ${teto} para ${n} — atualize o legado para travar o ganho` +
        (n === 0 ? " (chegou a zero: remova a linha e ele passa a ser guardado como arquivo novo)." : ".")
      );
    }
  }
}

const totalAtual = Object.values(atual).reduce((s, n) => s + n, 0);
const totalTeto = Object.values(legado).reduce((s, n) => s + n, 0);

console.log("\nPaleta — nenhuma cor nova fora do design system\n");
for (const a of avisos) console.log(`ℹ️  ${a}`);
if (avisos.length) console.log("");

if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}

console.log(
  `✅ ${ok} arquivo(s) do legado dentro do teto · ${universo.length} arquivos varridos · ` +
  `dívida ${totalAtual}/${totalTeto}\n`
);
process.exit(0);
