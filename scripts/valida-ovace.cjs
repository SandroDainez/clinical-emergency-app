#!/usr/bin/env node
/**
 * OVACE: sequência 2025, exceções e ponte semântica para PCR.
 * A navegação atual não grava estado diretamente na tela: o contrato
 * `ovace-inconsciente-pcr` é o dono da rota e da pré-marcação de hipóxia.
 */
const fs = require("node:fs");
const path = require("node:path");
const appDir = path.resolve(__dirname, "..");
const MODULO = "components/protocol-screen/acls-choking-screen.tsx";
const LIB = "lib/ovace-na-pcr.ts";
const FLUXO = "components/protocol-screen/acls-protocol-screen.tsx";
const NAV = "lib/module-session-navigation.ts";
const CONTEXT_NAV = "lib/clinical-context-navigation.ts";

const falhas = [];
let ok = 0;
const limpo = (rel) => fs.readFileSync(path.join(appDir, rel), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");
const modulo = limpo(MODULO);
const lib = limpo(LIB);

// Sequência AHA 2025.
const iGolpes = modulo.indexOf("golpes nas costas");
const iCompressoes = modulo.indexOf("compressões abdominais");
if (iGolpes < 0 || iCompressoes < 0) falhas.push(`${MODULO}: sequência 5 golpes/5 compressões não localizada.`);
else if (iGolpes > iCompressoes) falhas.push(`${MODULO}: compressões abdominais aparecem antes dos golpes nas costas.`);
else ok++;
for (const [nome, re] of [
  ["Mudou em 2025", /Mudou em 2025/],
  ["conduta da obstrução leve", /INCENTIVE A TOSSE/],
  ["exceção torácica", /compressões são TORÁCICAS/],
  ["critério funcional do abdome", /circundar o abdome/],
  ["referência esternal", /METADE INFERIOR DO ESTERNO/],
  ["posição abdominal", /ACIMA DO UMBIGO/],
  ["pós-desobstrução", /NECESSÁRIA MESMO EM QUEM FICOU ASSINTOMÁTICO/],
]) {
  if (!re.test(modulo)) falhas.push(`${MODULO}: sumiu ${nome}.`); else ok++;
}
if ((modulo.match(/\{ sinal: "/g) || []).length < 5) falhas.push(`${MODULO}: sinais de obstrução grave caíram abaixo de cinco.`); else ok++;

// Particularidade da RCP precisa existir nos dois lados da rota.
for (const [nome, re] of [
  ["RCP padrão", /A RCP É A PADRÃO/],
  ["30 compressões", /APÓS CADA 30 COMPRESSÕES/],
  ["sem varredura às cegas", /NUNCA varredura digital às cegas/],
]) {
  if (!re.test(lib)) falhas.push(`${LIB}: sumiu ${nome}.`); else ok++;
}
for (const rel of [MODULO, FLUXO]) {
  if (!/OVACE_NA_PCR/.test(semImports(rel))) falhas.push(`${rel}: não consome OVACE_NA_PCR.`); else ok++;
}

// Ponte atual: tela escolhe o contrato; contrato prepara a sessão e a causa.
const contextNav = limpo(CONTEXT_NAV);
if (!/getClinicalContextNavigation\("ovace-inconsciente-pcr"\)/.test(modulo)) {
  falhas.push(`${MODULO}: não resolve o contrato ovace-inconsciente-pcr.`);
} else ok++;
if (!/executeClinicalContextNavigation\(pcrNavigation/.test(modulo)) {
  falhas.push(`${MODULO}: a ponte para PCR não passa pelo executor contextual canônico.`);
} else ok++;
const inicioContrato = contextNav.indexOf('id: "ovace-inconsciente-pcr"');
const fimContrato = inicioContrato >= 0 ? contextNav.indexOf("  },", inicioContrato) : -1;
const contrato = inicioContrato >= 0 ? contextNav.slice(inicioContrato, fimContrato > inicioContrato ? fimContrato : undefined) : "";
for (const [nome, token] of [
  ["destino PCR Adulto", 'toModuleId: "pcr-adulto"'],
  ["transição terminal", 'semantic: "terminal_transition"'],
  ["sessão PCR", 'protocolId: "pcr_adulto"'],
  ["pré-marcação de hipóxia", 'suspectedCauses: ["hipoxia"]'],
]) {
  if (!contrato.includes(token)) falhas.push(`${CONTEXT_NAV}: contrato OVACE→PCR perdeu ${nome}.`); else ok++;
}
if (!/markProtocolSessionForResume\(/.test(contextNav)) falhas.push(`${CONTEXT_NAV}: executor deixou de preparar retomada/causas.`); else ok++;
if (!/OVACE_CAUSA_JA_IDENTIFICADA/.test(semImports(MODULO))) falhas.push(`${MODULO}: sumiu o texto da causa já identificada.`); else ok++;
if (!/consumeCausasPreMarcadas/.test(semImports("components/clinical-app.tsx"))) falhas.push(`components/clinical-app.tsx: sumiu o consumo da pré-marcação.`); else ok++;
if (/"abordada"/.test(limpo(NAV))) falhas.push(`${NAV}: causa pré-marcada não pode nascer como abordada.`); else ok++;
if (!/updateReversibleCauseStatus\(causeId, "suspeita"\)/.test(limpo("components/clinical-app.tsx"))) falhas.push(`components/clinical-app.tsx: causa pré-marcada deixou de entrar como suspeita.`); else ok++;

console.log("\nEngasgo (OVACE) — sequência 2025 e ponte contextual para PCR\n");
if (falhas.length) {
  falhas.forEach((f) => console.log(`❌ ${f}`));
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — sequência, exceções, ensino e estado clínico da ponte preservados\n`);
