#!/usr/bin/env node
/**
 * Aplica a paleta da UI 2.0 no app inteiro.
 *
 * Por que um script e não substituição cega de hex: a MESMA cor significa
 * coisas diferentes conforme a propriedade. `#1e293b` é superfície em 76
 * lugares e borda em 107 — trocar os dois pelo mesmo valor novo apagaria as
 * bordas. O mapeamento aqui é por (propriedade, cor antiga) → cor nova.
 *
 * O ponto mais delicado é o azul. O teal atual (#0e7490) é ESCURO e convive com
 * texto branco por cima. O primary do tema escuro (#4D9AFF) é CLARO: usá-lo
 * como preenchimento deixaria os 25 botões existentes com texto branco em
 * 2,84:1 — ilegível. Por isso o preenchimento usa #1E6FD9 (o primary do tema
 * claro, que é da mesma paleta e mantém o texto branco em 4,85:1), e #4D9AFF
 * fica para texto, borda e ícone sobre fundo escuro, onde ele é o correto.
 *
 * Uso:
 *   node scripts/aplicar-paleta-v2.cjs --dry    (só relata)
 *   node scripts/aplicar-paleta-v2.cjs          (aplica)
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DRY = process.argv.includes("--dry");

const PASTAS = ["components", "app", "constants"];
const IGNORAR = [
  path.join("components", "ui-v2"), // já nasceu com os tokens novos
  path.join("app", "dev"), // vitrine
];

/** Propriedades que pintam FUNDO. */
const FUNDO = ["backgroundColor", "shadowColor"];
/** Propriedades que pintam TRAÇO (borda, divisória). */
const TRACO = [
  "borderColor", "borderTopColor", "borderBottomColor",
  "borderLeftColor", "borderRightColor", "borderStartColor", "borderEndColor",
];
/** Propriedades que pintam TEXTO ou ícone. */
const TEXTO = ["color", "tintColor", "placeholderTextColor"];

/**
 * (grupo, cor antiga) → cor nova.
 * Cores que já coincidem com a paleta nova (#f1f5f9, #94a3b8, #f87171,
 * #fbbf24) ficam de fora de propósito: trocar por elas mesmas só geraria ruído
 * no diff.
 */
const MAPA = {
  fundo: {
    "#0a0f1a": "#121417", // fundo da tela
    "#0f172a": "#1c1f24", // superfície
    "#1e293b": "#1c1f24", // superfície elevada
    "#334155": "#2a2e35", // superfície de divisória
    "#0e7490": "#1e6fd9", // preenchimento de ação — mantém texto claro legível
    "#115e59": "#1e6fd9",
    "#0f766e": "#1e6fd9",
    "#22d3ee": "#4d9aff",
    "#5c8dff": "#1e6fd9", // azul da landing → preenchimento da paleta
    "#164e63": "#1c1f24", // teal escuro de superfície
    "#1e3a5f": "#1c1f24",
  },
  traco: {
    "#334155": "#2a2e35",
    "#1e293b": "#2a2e35",
    "#475569": "#2a2e35",
    "#0e7490": "#4d9aff",
    "#22d3ee": "#4d9aff",
    "#0f766e": "#4d9aff",
    "#5c8dff": "#4d9aff",
    "#164e63": "#2a2e35",
    "#1e3a5f": "#2a2e35",
  },
  texto: {
    "#0e7490": "#4d9aff", // teal escuro sobre fundo escuro era pouco legível
    "#22d3ee": "#4d9aff",
    "#0f766e": "#4d9aff",
    "#5c8dff": "#4d9aff",
    // Cinzas escuros como TEXTO reprovavam em contraste sobre os fundos novos:
    // #64748b dá 3,47:1 na superfície, #475569 dá 2,18 e #334155 dá 1,60 — este
    // último é praticamente invisível. Todos passam a usar o textSecondary da
    // paleta (#94a3b8 = 6,44:1). Ganho de legibilidade, não só de identidade.
    "#64748b": "#94a3b8",
    "#475569": "#94a3b8",
    "#334155": "#94a3b8",
  },
};

const grupoDaPropriedade = (prop) =>
  FUNDO.includes(prop) ? "fundo" : TRACO.includes(prop) ? "traco" : TEXTO.includes(prop) ? "texto" : null;

function arquivos(dir, saida = []) {
  if (!fs.existsSync(dir)) return saida;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (IGNORAR.some((ig) => p.includes(ig))) continue;
    if (e.isDirectory()) arquivos(p, saida);
    else if (/\.tsx?$/.test(e.name)) saida.push(p);
  }
  return saida;
}

const PROPS = [...FUNDO, ...TRACO, ...TEXTO].join("|");
const RE = new RegExp(`(${PROPS})(\\s*:\\s*)(["'])(#[0-9a-fA-F]{6})\\3`, "g");

let totalTrocas = 0;
const porCor = {};
const porArquivo = {};

for (const pasta of PASTAS) {
  for (const arquivo of arquivos(path.join(ROOT, pasta))) {
    const original = fs.readFileSync(arquivo, "utf8");
    let trocasNoArquivo = 0;

    const novo = original.replace(RE, (todo, prop, sep, aspa, cor) => {
      const grupo = grupoDaPropriedade(prop);
      const destino = grupo && MAPA[grupo][cor.toLowerCase()];
      if (!destino) return todo;
      trocasNoArquivo++;
      const chave = `${grupo} ${cor.toLowerCase()} → ${destino}`;
      porCor[chave] = (porCor[chave] ?? 0) + 1;
      return `${prop}${sep}${aspa}${destino}${aspa}`;
    });

    if (trocasNoArquivo > 0) {
      totalTrocas += trocasNoArquivo;
      porArquivo[path.relative(ROOT, arquivo)] = trocasNoArquivo;
      if (!DRY) fs.writeFileSync(arquivo, novo);
    }
  }
}

console.log(DRY ? "── SIMULAÇÃO (nada foi escrito) ──\n" : "── APLICADO ──\n");
for (const [chave, n] of Object.entries(porCor).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${chave}`);
}
console.log(`\n  ${Object.keys(porArquivo).length} arquivos · ${totalTrocas} trocas`);
