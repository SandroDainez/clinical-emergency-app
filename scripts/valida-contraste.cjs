#!/usr/bin/env node
/**
 * Validação de contraste WCAG AA dos design tokens (Fase 1 do plano UI 2.0).
 *
 * O plano permite ajustar o hex da paleta DESDE QUE o contraste se mantenha:
 * 4.5:1 para texto normal, 3:1 para texto grande e elementos de interface.
 * "Valide programaticamente" — é o que este script faz, nos dois temas.
 *
 * Contexto de uso: emergência, tela pequena, possivelmente com brilho ruim.
 * Contraste aqui não é preciosismo de acessibilidade, é legibilidade sob
 * pressão.
 *
 * Uso: npm run test:contraste
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "contraste-"));

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir, path.join(appDir, "design-system", "tokens.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const { TEMAS } = require(path.join(tempDir, "tokens.js"));

// ── Cálculo de contraste (WCAG 2.1) ────────────────────────────────────────

function paraRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

/** Luminância relativa conforme WCAG. */
function luminancia(hex) {
  const [r, g, b] = paraRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function razao(corA, corB) {
  const a = luminancia(corA);
  const b = luminancia(corB);
  const [claro, escuro] = a > b ? [a, b] : [b, a];
  return (claro + 0.05) / (escuro + 0.05);
}

// ── Pares que precisam passar ──────────────────────────────────────────────
// `min` 4.5 = texto normal; 3.0 = texto grande (≥ 24 px ou ≥ 18.66 px bold) e
// componentes de interface (bordas de campo, ícones significativos).

const PARES = [
  ["text", "bg", 4.5, "texto principal sobre o fundo"],
  ["text", "surface", 4.5, "texto principal sobre card"],
  ["textSecondary", "bg", 4.5, "texto secundário sobre o fundo"],
  ["textSecondary", "surface", 4.5, "texto secundário sobre card"],
  // 4.5, não 3.0: estas cores são usadas como TEXTO PEQUENO no app (rótulo de
  // dose, cronômetro, nome do estado clínico), não apenas como ícone ou faixa.
  // Com o piso de 3:1 o validador aprovava #4D9AFF em 4,27:1 e #F87171 em 4,39:1
  // — ilegíveis como texto, e só o teste renderizado percebeu.
  ["primary", "bg", 4.5, "ação principal como texto sobre o fundo"],
  ["primary", "surface", 4.5, "ação principal como texto sobre card"],
  ["critical", "bg", 4.5, "estado crítico como texto sobre o fundo"],
  ["critical", "surface", 4.5, "estado crítico como texto sobre card"],
  ["success", "bg", 4.5, "confirmação como texto sobre o fundo"],
  ["success", "surface", 4.5, "confirmação como texto sobre card"],
  ["warning", "bg", 4.5, "alerta como texto sobre o fundo"],
  ["warning", "surface", 4.5, "alerta como texto sobre card"],
  // ⚠️ A dívida de fonte é TEXTO PEQUENO (marcador curto + rótulo), então o piso
  // é 4,5 — o mesmo dos outros acentos, e não os 3:1 de elemento gráfico.
  ["debt", "bg", 4.5, "dívida de fonte como texto sobre o fundo"],
  ["debt", "surface", 4.5, "dívida de fonte como texto sobre card"],
  ["border", "bg", 1.2, "borda visível sobre o fundo"],
  ["onPrimary", "primary", 4.5, "texto do botão principal"],
  ["onCritical", "critical", 4.5, "texto do botão crítico"],
  /**
   * ⚠️⚠️ O SEGUNDO DEGRAU DE SUPERFÍCIE precisa sustentar TEXTO — ⛔ senão ele
   * ⛔ não serve para o que foi criado: substituir a moldura do card aninhado.
   * ⛔ Um degrau que só funciona vazio obrigaria a borda de volta.
   */
  ["text", "surfaceElevated", 4.5, "texto principal sobre o segundo degrau"],
  ["textSecondary", "surfaceElevated", 4.5, "texto secundário sobre o segundo degrau"],
  /** ⚠️ `info` é TEXTO pequeno (rótulo de contexto), ⛔ e ⛔ não elemento gráfico. */
  ["info", "bg", 4.5, "informativo como texto sobre o fundo"],
  ["info", "surface", 4.5, "informativo como texto sobre card"],
  /**
   * ⚠️⚠️ OS PREENCHIMENTOS — acrescentados em 2026-09-06 junto com os tokens.
   *
   * ⛔ Token de cor que ⛔ não é medido volta a apodrecer ⛔ sem ⛔ ninguém ver:
   * foi assim que `#4D9AFF` sobreviveu a 4,27:1 até um teste RENDERIZADO
   * reclamar. ⚠️ Preenchimento nasce aqui no mesmo commit em que nasce no tema.
   *
   * ⚠️ Piso 4,5 (⛔ e ⛔ não os 3:1 que WCAG permitiria a texto grande): o
   * rótulo do botão é curto ⛔ e lido sob pressão — ⛔ e as cores escolhidas
   * passam com folga, então ⛔ não há razão para negociar o piso para baixo.
   */
  /**
   * ⚠️⚠️ O CONTROLE PRECISA SER **VISTO** ⛔ e precisa sustentar TEXTO.
   *
   * ⛔ O piso de 1,25 na separação ⛔ não é WCAG: é o mínimo abaixo do qual o
   * autor relatou *"botões todos iguais, parecem textos"*. ⚠️ Medido: 1,14
   * reprovava na prática, ⛔ e 1,42 resolveu.
   */
  ["controlSurface", "surface", 1.25, "o controle se separa do card que o contém"],
  ["controlBorder", "controlSurface", 1.5, "a borda do controle é visível sobre ele"],
  ["text", "controlSurface", 4.5, "texto sobre o controle"],
  ["textSecondary", "controlSurface", 4.5, "texto secundário sobre o controle"],
  ["onFill", "primaryFill", 4.5, "texto do botão de ação preenchido"],
  ["onFill", "successFill", 4.5, "texto do botão \"Sim\""],
  ["onFill", "criticalFill", 4.5, "texto do botão \"Não\""],
  /**
   * ⚠️⚠️ O TINGIMENTO PRECISA SUSTENTAR **TEXTO** — ⛔ ele ⛔ não é papel de
   * parede. ⚠️ O card de alerta escreve título ⛔ e corpo em cima dele; ⛔ um
   * tingimento bonito ⛔ e ilegível ⛔ não serve para ⛔ nada.
   */
  ["text", "warningTint", 4.5, "texto principal sobre o tingimento de alerta"],
  ["textSecondary", "warningTint", 4.5, "texto secundário sobre o tingimento de alerta"],
  ["warning", "warningTint", 4.5, "o acento âmbar sobre o próprio tingimento"],
  ["text", "criticalTint", 4.5, "texto principal sobre o tingimento crítico"],
  ["textSecondary", "criticalTint", 4.5, "texto secundário sobre o tingimento crítico"],
  ["critical", "criticalTint", 4.5, "o acento vermelho sobre o próprio tingimento"],
  ["text", "primaryTint", 4.5, "texto principal sobre o tingimento de ação"],
  ["textSecondary", "primaryTint", 4.5, "texto secundário sobre o tingimento de ação"],
  ["text", "successTint", 4.5, "texto principal sobre o tingimento de confirmação"],
  ["success", "successTint", 4.5, "o acento verde sobre o próprio tingimento"],
  /**
   * ⛔ `disabled` ⛔ NÃO ENTRA AQUI, ⛔ e a ausência é deliberada: WCAG isenta
   * controle desabilitado do piso de contraste, ⛔ e forçá-lo a 4,5:1 faria o
   * desabilitado competir visualmente com o ativo — o oposto do que ele
   * comunica. ⚠️ A garantia de que ele ⛔ não é o único sinal está em E-15, ⛔ e é
   * medida na tela, ⛔ não na paleta.
   */
];

let falhas = 0;
let ok = 0;

for (const [nomeTema, tema] of Object.entries(TEMAS)) {
  console.log(`\n── tema ${nomeTema} ──────────────────────────────`);
  for (const [frente, fundo, min, descricao] of PARES) {
    const corFrente = tema.cores[frente];
    const corFundo = tema.cores[fundo];
    if (!corFrente || !corFundo) {
      console.error(`  ✗ token inexistente: ${frente} / ${fundo}`);
      falhas++;
      continue;
    }
    const r = razao(corFrente, corFundo);
    const passa = r >= min;
    if (passa) ok++;
    else falhas++;
    console.log(
      `  ${passa ? "✓" : "✗"} ${r.toFixed(2)}:1 (mín ${min}) — ${descricao}` +
        `  [${frente} ${corFrente} / ${fundo} ${corFundo}]`
    );
  }
}

console.log(`\n===== contraste: ${ok} OK, ${falhas} falhas =====`);
process.exit(falhas ? 1 : 0);
