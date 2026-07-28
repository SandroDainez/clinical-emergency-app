#!/usr/bin/env node
/**
 * AUDITORIA do fluxo ACLS contra as normas — chocável refratário.
 *
 * Não lê o código: DIRIGE o engine e registra o que ele manda fazer, choque a
 * choque. É a única forma de afirmar se a sincronia das drogas está certa.
 *
 * Regras conferidas (AHA — algoritmo de PCR no adulto):
 *  1. Epinefrina NÃO antes de 2 choques no ramo chocável.
 *  2. Epinefrina 1 mg a cada 3–5 min a partir daí.
 *  3. Antiarrítmico: 1ª dose (amiodarona 300 mg) após o 3º choque.
 *  4. 2ª e última dose (150 mg) em ciclo POSTERIOR, não consecutivo.
 *  5. Máximo de 2 doses de antiarrítmico.
 *
 * ⚠️ O app declara seguir "AHA ACLS 2025". Números de dose e a regra de 2 doses
 * são estáveis entre as edições recentes, mas QUALQUER divergência apontada aqui
 * deve ser conferida contra o texto vigente antes de virar mudança de conduta.
 *
 * Uso: node scripts/auditoria-acls.cjs
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "auditoria-acls-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
  "--esModuleInterop", "--moduleResolution", "node", "--outDir", tempDir,
  path.join(appDir, "engine.ts"),
], { cwd: appDir, stdio: "inherit" });
fs.copyFileSync(path.join(appDir, "protocol.json"), path.join(tempDir, "protocol.json"));
const engine = require(path.join(tempDir, "engine.js"));

const realNow = Date.now;
let now = 0;
Date.now = () => now;

const linhaDoTempo = [];
function drenar(rotulo) {
  const fx = engine.consumeEffects();
  const cues = fx.filter((e) => e.type === "play_audio_cue").map((e) => e.cueId);
  const resumo = engine.getEncounterSummary();
  for (const c of cues) {
    if (c === "epinephrine_now" || c === "antiarrhythmic_now" || c === "antiarrhythmic_repeat") {
      linhaDoTempo.push({
        cue: c,
        minuto: +(now / 60000).toFixed(2),
        choques: resumo.shockCount,
        epiDadas: resumo.adrenalineAdministeredCount,
        antiarrDadas: resumo.antiarrhythmicAdministeredCount,
        rotulo,
      });
    }
  }
  return cues;
}

now = 0;
engine.resetSession();
engine.consumeEffects();

// Abertura → FV → 1º choque
engine.next(); drenar("inicio");
engine.next("sem_pulso"); drenar("sem pulso");
engine.next(); drenar("preparo");
engine.next("chocavel"); drenar("chocável");
engine.next("bifasico"); drenar("bifásico");
engine.registerExecution("shock"); drenar("CHOQUE 1");
engine.next(); drenar("entra rcp_1");

// Oito ciclos de FV refratária, confirmando toda droga oferecida.
for (let ciclo = 1; ciclo <= 8; ciclo += 1) {
  // Corre o ciclo de 2 min em passos de 20 s, confirmando o que vencer.
  for (let t = 0; t < 6; t += 1) {
    now += 20000;
    engine.tick();
    drenar(`ciclo ${ciclo} +${(t + 1) * 20}s`);
    const acoes = engine.getDocumentationActions?.() ?? [];
    for (const acao of acoes) {
      if (acao.id === "adrenaline" || acao.id === "antiarrhythmic") {
        engine.registerExecution(acao.id);
        drenar(`ciclo ${ciclo}: CONFIRMOU ${acao.id}`);
      }
    }
  }
  now += 5000; engine.tick(); drenar(`ciclo ${ciclo} fim`);
  engine.next(); drenar(`ciclo ${ciclo} -> ritmo`);
  engine.next("chocavel"); drenar(`ciclo ${ciclo} chocável`);
  engine.registerExecution("shock"); drenar(`CHOQUE ${ciclo + 1}`);
  engine.next(); drenar(`entra rcp pós-choque ${ciclo + 1}`);
}

Date.now = realNow;

console.log("\n===== LINHA DO TEMPO DAS DROGAS =====\n");
console.log("min\tchoques\tcue\t\t\tepi\tantiarr");
for (const e of linhaDoTempo) {
  console.log(`${e.minuto}\t${e.choques}\t${e.cue.padEnd(20)}\t${e.epiDadas}\t${e.antiarrDadas}`);
}

const resumo = engine.getEncounterSummary();
console.log("\n===== FINAL =====");
console.log(`choques: ${resumo.shockCount} · epinefrina: ${resumo.adrenalineAdministeredCount} · antiarrítmico: ${resumo.antiarrhythmicAdministeredCount}`);

// ── Regras ────────────────────────────────────────────────────────────────
const falhas = [];
const ok = [];
const primeiraEpi = linhaDoTempo.find((e) => e.cue === "epinephrine_now");
const antiarr = linhaDoTempo.filter((e) => e.cue.startsWith("antiarrhythmic"));

if (!primeiraEpi) falhas.push("epinefrina nunca foi recomendada");
else if (primeiraEpi.choques < 2) falhas.push(`1ª epinefrina com apenas ${primeiraEpi.choques} choque(s) — AHA exige 2 antes`);
else ok.push(`1ª epinefrina após ${primeiraEpi.choques} choques`);

const epis = linhaDoTempo.filter((e) => e.cue === "epinephrine_now");
for (let i = 1; i < epis.length; i += 1) {
  const dif = epis[i].minuto - epis[i - 1].minuto;
  if (dif < 2.9) falhas.push(`epinefrina repetida em ${dif.toFixed(2)} min (mínimo 3)`);
  else if (dif > 5.5) falhas.push(`intervalo de epinefrina de ${dif.toFixed(2)} min (máximo 5)`);
}
if (epis.length > 1) ok.push(`${epis.length} doses de epinefrina, intervalos dentro de 3–5 min`);

if (antiarr.length === 0) falhas.push("antiarrítmico NUNCA foi recomendado em FV refratária");
else {
  if (antiarr[0].choques < 3) falhas.push(`1º antiarrítmico com ${antiarr[0].choques} choque(s) — AHA indica após o 3º`);
  else ok.push(`1º antiarrítmico após ${antiarr[0].choques} choques`);

  if (antiarr.length < 2) falhas.push(`apenas ${antiarr.length} dose(s) de antiarrítmico recomendada(s) em 9 choques — a 2ª dose não apareceu`);
  else {
    ok.push(`2ª dose de antiarrítmico recomendada (${antiarr[1].choques} choques, min ${antiarr[1].minuto})`);
    if (antiarr[1].choques === antiarr[0].choques) falhas.push("as duas doses de antiarrítmico caíram no MESMO ciclo");
  }
  if (antiarr.length > 2) falhas.push(`${antiarr.length} recomendações de antiarrítmico — máximo é 2`);
}
if (resumo.antiarrhythmicAdministeredCount > 2) falhas.push("mais de 2 doses de antiarrítmico ADMINISTRADAS");

console.log("\n===== CONFERÊNCIA =====");
ok.forEach((o) => console.log("  ✓ " + o));
falhas.forEach((f) => console.log("  ✗ " + f));
console.log(`\n${ok.length} conforme · ${falhas.length} divergências\n`);
