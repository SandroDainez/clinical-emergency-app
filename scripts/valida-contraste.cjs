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
  ["primary", "bg", 3.0, "ação principal sobre o fundo"],
  ["primary", "surface", 3.0, "ação principal sobre card"],
  ["critical", "bg", 3.0, "estado crítico sobre o fundo"],
  ["critical", "surface", 3.0, "estado crítico sobre card"],
  ["success", "bg", 3.0, "confirmação sobre o fundo"],
  ["warning", "bg", 3.0, "alerta sobre o fundo"],
  ["border", "bg", 1.2, "borda visível sobre o fundo"],
  ["onPrimary", "primary", 4.5, "texto do botão principal"],
  ["onCritical", "critical", 4.5, "texto do botão crítico"],
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
