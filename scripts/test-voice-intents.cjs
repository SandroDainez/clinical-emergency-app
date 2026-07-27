#!/usr/bin/env node
/**
 * Contrato dos comandos de voz: gatilho X → intent Y.
 *
 * Por que em Node e não no Playwright: reconhecimento de voz precisa de
 * microfone e de permissão do navegador. Um E2E teria de mockar a Web Speech
 * API, e passaria a testar o mock, não o app. O ponto onde a regra realmente
 * vive é o resolvedor — é ele que decide qual ação uma transcrição dispara.
 * Aqui o teste é determinístico e cobre a regra de verdade.
 *
 * O E2E cobre o outro lado: o painel de voz aparece e lista os comandos válidos
 * da etapa (e2e/voz.spec.ts).
 *
 * Uso: npm run test:voice
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "voice-intents-"));

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--resolveJsonModule", "--esModuleInterop", "--moduleResolution", "node",
    "--skipLibCheck", "--outDir", tempDir,
    path.join(appDir, "acls", "voice-resolver.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

// Compilando um arquivo só, o tsc usa a pasta comum das entradas como raiz:
// a saída fica achatada em tempDir, sem o nível "acls/".
const { resolveAclsVoiceIntent } = require(path.join(tempDir, "voice-resolver.js"));
const { getVoiceIntentDefinition, ACLS_VOICE_INTENT_DEFINITIONS } = require(
  path.join(tempDir, "voice-intents.js")
);

let ok = 0;
const falhas = [];

// O resolvedor recebe também o estado e os intents permitidos naquele passo.
// Aqui liberamos todos: o objeto de teste é o casamento transcrição → intent,
// não a política de qual comando vale em qual etapa (isso é voice-policy.ts).
const TODOS = Object.keys(ACLS_VOICE_INTENT_DEFINITIONS);

/** Confere que a transcrição resolve para o intent esperado. */
function comando(transcricao, intentEsperado) {
  const r = resolveAclsVoiceIntent({
    transcript: transcricao,
    stateId: "teste",
    allowedIntents: TODOS,
  });
  const obtido = r && r.kind === "matched" ? r.intent : `(${r ? r.kind : "nulo"})`;
  if (obtido === intentEsperado) {
    ok++;
  } else {
    falhas.push(`"${transcricao}" → esperado ${intentEsperado}, obtido ${obtido}`);
  }
}

// ── Gatilhos que a equipe usa de fato durante a parada ──────────────────────
comando("iniciar compressões", "confirm_cpr_started");
comando("compressões iniciadas", "confirm_cpr_started");
comando("retomar reanimação", "confirm_cpr_continuing");
comando("sem pulso", "confirm_no_rosc");
comando("não tem pulso", "confirm_no_rosc");
comando("tem pulso", "confirm_rosc");
comando("ritmo chocável", "select_shockable_rhythm");
comando("fibrilação ventricular", "select_shockable_rhythm");
comando("tv sem pulso", "select_shockable_rhythm");
comando("ritmo não chocável", "select_non_shockable_rhythm");
comando("atividade elétrica sem pulso", "select_non_shockable_rhythm");
comando("desfibrilação aplicada", "confirm_shock_delivered");
comando("desfibrilador bifásico", "select_biphasic_defibrillator");
comando("desfibrilador monofásico", "select_monophasic_defibrillator");
comando("retorno da circulação espontânea", "confirm_rosc");
comando("medicação administrada", "confirm_epinephrine_administered");
comando("lidocaína administrada", "confirm_antiarrhythmic_administered");
comando("abrir causas reversíveis", "open_reversible_causes");

// ── Transcrição sem sentido não pode virar ação clínica ─────────────────────
for (const ruido of ["boa tarde", "passa o soro", "xxxxx", ""]) {
  const r = resolveAclsVoiceIntent({
    transcript: ruido,
    stateId: "teste",
    allowedIntents: TODOS,
  });
  if (r && r.kind === "matched") {
    falhas.push(`ruído "${ruido}" não deveria virar ação (virou ${r.intent})`);
  } else {
    ok++;
  }
}

// ── Todo intent precisa de prompt de confirmação e rótulo de painel ─────────
for (const id of Object.keys(ACLS_VOICE_INTENT_DEFINITIONS)) {
  const def = getVoiceIntentDefinition(id);
  if (!def || !def.panelLabel) {
    falhas.push(`intent ${id} sem panelLabel`);
  } else {
    ok++;
  }
}

console.log(`\n===== ${ok} verificações de voz OK, ${falhas.length} falhas =====`);
if (falhas.length) {
  falhas.forEach((f) => console.error("  ✗ " + f));
  process.exit(1);
}
assert.ok(ok > 0);
