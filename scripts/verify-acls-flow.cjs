// Verificação ABRANGENTE do fluxo ACLS: clínica + cobertura de áudio.
// Compila engine.ts, roda chocável refratário / não-chocável / ROSC,
// e cruza cada cue emitido contra MP3 (PT+ES) e texto (PT+ES).
const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-acls-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020",
  "--resolveJsonModule", "--esModuleInterop", "--moduleResolution", "node",
  "--outDir", tempDir, path.join(appDir, "engine.ts"),
], { cwd: appDir, stdio: "inherit" });
fs.copyFileSync(path.join(appDir, "protocol.json"), path.join(tempDir, "protocol.json"));
const engine = require(path.join(tempDir, "engine.js"));

const realNow = Date.now;
let now = 0;
Date.now = () => now;
const advance = (ms) => { now += ms; };

const emitted = new Set();   // todos os cueIds emitidos (qualquer cenário)
function step(fn, label, collect) {
  fn();
  const fx = engine.consumeEffects();
  const cues = fx.filter((e) => e.type === "play_audio_cue").map((e) => e.cueId);
  cues.forEach((c) => emitted.add(c));
  if (collect) collect.push(...cues);
  return cues;
}
function tickStep(ms, collect) { return step(() => { advance(ms); engine.tick(); }, `tick+${ms}`, collect); }

let pass = 0;
function check(name, cond) {
  if (cond) { pass += 1; console.log(`  ✓ ${name}`); }
  else { console.log(`  ✗ FALHA: ${name}`); process.exitCode = 1; }
}

// ---------- Cenário 1: CHOCÁVEL REFRATÁRIO (8 ciclos) ----------
console.log("\n[1] Chocável refratário");
now = 0; engine.resetSession(); engine.consumeEffects();
const s1 = [];
step(() => engine.next(), "", s1);
step(() => engine.next("sem_pulso"), "", s1);
step(() => engine.next(), "", s1);
step(() => engine.next("chocavel"), "", s1);
step(() => engine.next("bifasico"), "", s1);
step(() => engine.registerExecution("shock"), "", s1);
step(() => engine.next(), "", s1);  // rcp_1
const rcp1 = [...s1];
check("nenhuma epinefrina no rcp_1 (1º ciclo)", !rcp1.includes("epinephrine_now"));
check("nenhum switch_compressor no rcp_1", !rcp1.includes("switch_compressor"));

const cycleCues = [];
// ciclo 1->2  (tick completa rcp_1 -> avaliar_ritmo_2_preparo)
tickStep(121000, cycleCues);
step(() => engine.next(), "", cycleCues);              // preparo -> avaliar_ritmo_2 (question)
step(() => engine.next("chocavel"), "", cycleCues);    // -> choque_2
const rcp2 = step(() => engine.registerExecution("shock"), "", cycleCues);  // shock -> entra rcp_2 (emite cues)
step(() => engine.next(), "", cycleCues);  // permanece rcp_2
check("epinefrina indicada no rcp_2", rcp2.includes("epinephrine_now"));
check("switch_compressor no rcp_2", rcp2.includes("switch_compressor"));
step(() => engine.registerExecution("adrenaline"), "", cycleCues);  // epi #1

let switchCount = 0, epiCount = 0, antiarrCount = 0;
let admAdr = 1, admAnti = 0;
for (let c = 0; c < 8; c += 1) {
  const cues = [];
  tickStep(121000, cues);                       // completa ciclo -> avaliar preparo
  step(() => engine.next(), "", cues);           // -> avaliar_ritmo_3
  step(() => engine.next("chocavel"), "", cues); // -> choque_3
  step(() => engine.registerExecution("shock"), "", cues);
  step(() => engine.next(), "", cues);           // -> rcp_3
  // administra o que for recomendado (alternância epi/amio)
  const snap = engine.getMedicationSnapshot();
  if (snap.adrenaline.pendingConfirmation) { step(() => engine.registerExecution("adrenaline"), "", cues); admAdr += 1; }
  if (snap.antiarrhythmic.pendingConfirmation) { step(() => engine.registerExecution("antiarrhythmic"), "", cues); admAnti += 1; }
  switchCount += cues.filter((x) => x === "switch_compressor").length;
  epiCount += cues.filter((x) => x === "epinephrine_now").length;
  antiarrCount += cues.filter((x) => x === "antiarrhythmic_now" || x === "antiarrhythmic_repeat").length;
}
const finalSnap = engine.getMedicationSnapshot();
check("switch_compressor em todos os ciclos refratários (>=6)", switchCount >= 6);
check("epinefrina repetida ao longo do loop (>=2)", epiCount >= 2);
check("antiarrítmico administrado no máx 2 doses", finalSnap.antiarrhythmic.administeredCount <= 2);
check("antiarrítmico recomendado no máx 2 doses", finalSnap.antiarrhythmic.recommendedCount <= 2);
check("shocks escalados emitidos no loop", cycleCues.includes("shock_escalated"));

// ---------- Cenário 2: NÃO-CHOCÁVEL ----------
console.log("\n[2] Não-chocável (AESP/assistolia)");
now = 0; engine.resetSession(); engine.consumeEffects();
const s2 = [];
step(() => engine.next(), "", s2);
step(() => engine.next("sem_pulso"), "", s2);
step(() => engine.next(), "", s2);
const ncEpi = step(() => engine.next("nao_chocavel"), "", s2);
check("epinefrina IMEDIATA no não-chocável (start_cpr_nonshockable)", ncEpi.includes("start_cpr_nonshockable"));
check("ALERT/recomendação de epinefrina no não-chocável", engine.getMedicationSnapshot().adrenaline.recommendedCount >= 1);
step(() => engine.registerExecution("adrenaline"), "", s2);
let ncSwitch = 0, ncEpiRep = 0;
for (let c = 0; c < 6; c += 1) {
  const cues = [];
  const sid = engine.getCurrentStateId();
  if (/ciclo|epinefrina/.test(sid)) tickStep(121000, cues);
  else if (/preparo/.test(sid)) step(() => engine.next(), "", cues);
  else if (/avaliar_ritmo/.test(sid)) step(() => engine.next("nao_chocavel"), "", cues);
  else step(() => engine.next(), "", cues);
  if (engine.getMedicationSnapshot().adrenaline.pendingConfirmation)
    step(() => engine.registerExecution("adrenaline"), "", cues);
  ncSwitch += cues.filter((x) => x === "switch_compressor").length;
  ncEpiRep += cues.filter((x) => x === "epinephrine_now").length;
}
check("switch_compressor no não-chocável (>=2)", ncSwitch >= 2);
check("epinefrina repetida no não-chocável (>=1)", ncEpiRep >= 1);
check("SEM antiarrítmico no não-chocável", engine.getMedicationSnapshot().antiarrhythmic.recommendedCount === 0);

// ---------- Cenário 3: ROSC ----------
console.log("\n[3] ROSC (epi suprimida pós-ROSC)");
now = 0; engine.resetSession(); engine.consumeEffects();
step(() => engine.next());
step(() => engine.next("sem_pulso"));
step(() => engine.next());
step(() => engine.next("chocavel"));
step(() => engine.next("bifasico"));
step(() => engine.registerExecution("shock"));
step(() => engine.next());            // rcp_1
tickStep(121000);
step(() => engine.next("rosc"));      // avaliar_ritmo_2 -> ROSC
const roscCues = step(() => engine.next());
const recBefore = engine.getMedicationSnapshot().adrenaline.recommendedCount;
const after = [];
for (let i = 0; i < 5; i += 1) { tickStep(121000, after); step(() => engine.next(), "", after); }
const recAfter = engine.getMedicationSnapshot().adrenaline.recommendedCount;
check("confirm_rosc emitido ao entrar em ROSC", engine.getTimeline().some((e) => e.type === "rosc"));
check("epinefrina NÃO recomendada após ROSC", recAfter === recBefore);
check("nenhum epinephrine_now após ROSC", !after.includes("epinephrine_now"));

// ---------- Cobertura de ÁUDIO: todo cue tem MP3 PT+ES e texto PT+ES ----------
console.log("\n[4] Cobertura de áudio (MP3 PT+ES + texto PT+ES) para cada cue emitido");
const ptDir = path.join(appDir, "assets/audio/final-acls");
const esDir = path.join(appDir, "assets/audio/final-acls-es");
const speechMapSrc = lerFonte(path.join(appDir, "acls/speech-map.ts"));
const esCuesPath = path.join(appDir, "acls/locales/es-419/speech-cues.ts");
const bilingual = fs.existsSync(esCuesPath) && fs.existsSync(esDir);
const esCuesSrc = bilingual ? fs.readFileSync(esCuesPath, "utf8") : "";
const webCuesSrc = lerFonte(path.join(appDir, "components/web-audio-cues.ts"));
console.log(bilingual ? "  (app bilíngue PT/ES)" : "  (app PT-only — checando só PT)");
// alguns cues emitidos são apenas LOG (não tocam): ignorar
const NON_AUDIO = new Set(["medication_scheduled", "timer_started", "pre_cue_emitted", "log_event"]);
let audioFail = 0;
for (const cue of [...emitted].sort()) {
  if (NON_AUDIO.has(cue)) continue;
  const ptMp3 = fs.existsSync(path.join(ptDir, `${cue}.mp3`));
  const esMp3 = bilingual ? fs.existsSync(path.join(esDir, `${cue}.mp3`)) : true;
  const ptText = new RegExp(`\\b${cue}\\s*:`).test(speechMapSrc);
  const esText = bilingual ? new RegExp(`\\b${cue}\\s*:`).test(esCuesSrc) : true;
  const minWeb = bilingual ? 2 : 1;
  const inWeb = (webCuesSrc.match(new RegExp(`\\b${cue}\\s*:`, "g")) || []).length >= minWeb;
  const ok = ptMp3 && esMp3 && ptText && esText && inWeb;
  if (!ok) {
    audioFail += 1;
    console.log(`  ✗ ${cue}: ptMp3=${ptMp3} esMp3=${esMp3} ptText=${ptText} esText=${esText} web=${inWeb}`);
  }
}
check(`todos os ${[...emitted].filter((c) => !NON_AUDIO.has(c)).length} cues de áudio resolvem (MP3+texto${bilingual ? " PT+ES" : " PT"})`, audioFail === 0);

console.log(`\n===== ${pass} verificações OK${process.exitCode ? " — COM FALHAS" : ", SEM FALHAS"} =====`);
console.log("Cues emitidos:", [...emitted].filter((c) => !NON_AUDIO.has(c)).sort().join(", "));
Date.now = realNow;
