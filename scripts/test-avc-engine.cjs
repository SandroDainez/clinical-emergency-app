const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "avc-engine-test-"));

function compileModule(sourcePath, outputName) {
  execFileSync(
    "npx",
    [
      "tsc",
      "--module",
      "commonjs",
      "--target",
      "es2020",
      "--resolveJsonModule",
      "--esModuleInterop",
      "--moduleResolution",
      "node",
      "--outDir",
      tempDir,
      sourcePath,
    ],
    { cwd: appDir, stdio: "inherit" }
  );

  return require(path.join(tempDir, outputName));
}

function copyProtocolJson(relativePath) {
  const source = path.join(appDir, relativePath);
  const target = path.join(tempDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

copyProtocolJson(path.join("protocols", "acidente_vascular_cerebral.json"));

const avcEngine = compileModule(path.join(appDir, "avc-engine.ts"), "avc-engine.js");
const eligibility = compileModule(path.join(appDir, "avc", "eligibility.ts"), path.join("avc", "eligibility.js"));
const calculators = compileModule(path.join(appDir, "avc", "calculators.ts"), path.join("avc", "calculators.js"));

function setField(id, value) {
  avcEngine.updateAuxiliaryField(id, value);
}

function setNihssComplete(totalSide = "left") {
  setField("nihss1a", "0");
  setField("nihss1b", "0");
  setField("nihss1c", "0");
  setField("nihss2", "1");
  setField("nihss3", "1");
  setField("nihss4", "1");
  setField("nihss5a", totalSide === "left" ? "2" : "0");
  setField("nihss5b", totalSide === "right" ? "2" : "0");
  setField("nihss6a", totalSide === "left" ? "2" : "0");
  setField("nihss6b", totalSide === "right" ? "2" : "0");
  setField("nihss7", "0");
  setField("nihss8", "1");
  setField("nihss9", "1");
  setField("nihss10", "1");
  setField("nihss11", "0");
}

function buildEligibleIschemicCase() {
  avcEngine.resetSession();
  setField("responsibleClinician", "Dra. Teste");
  setField("patientName", "Paciente AVC");
  setField("age", "68");
  setField("sex", "Masculino");
  setField("weightKg", "82");
  setField("heightCm", "176");
  setField("glucoseInitial", "118");
  setField("arrivalDayContext", "today");
  setField("arrivalTime", "09:05");
  setField("lastKnownWellDayContext", "today");
  setField("lastKnownWellTime", "08:10");
  setField("symptomOnsetDayContext", "today");
  setField("symptomOnsetTime", "08:15");
  setField("timePrecision", "exact");
  setField("origin", "SAMU");
  setField("symptoms", "hemiparesia súbita e afasia");
  setField("laterality", "Esquerda");
  setField("disablingDeficit", "yes");
  setField("systolicPressure", "178");
  setField("diastolicPressure", "96");
  setField("glucoseCurrent", "118");
  setField("ctRequestedAt", "09:12");
  setField("ctPerformedAt", "09:22");
  setField("ctReadAt", "09:28");
  setField("ctResult", "sem_sangramento");
  setField("ctaPerformed", "yes");
  setField("ctaResult", "oclusao_grande_vaso");
  setField("lvoSuspicion", "yes");
  setField("platelets", "210");
  setField("inr", "1.0");
  setField("aptt", "29");
  setField("selectedThrombolyticId", "alteplase");
  setNihssComplete("left");
}

buildEligibleIschemicCase();

let panel = avcEngine.getAuxiliaryPanel();
assert.ok(panel, "painel auxiliar deve existir no fluxo AVC");
assert.ok(panel.metrics.some((metric) => metric.label === "NIHSS" && metric.value.includes("AVC")), "deve expor métrica NIHSS");
assert.ok(panel.recommendations.some((rec) => rec.title.includes("Pode trombolisar")), "caso elegível deve sugerir trombólise");
assert.ok(panel.recommendations.some((rec) => rec.title.includes("Calculadora")), "deve exibir calculadora do trombolítico");

let summary = avcEngine.getEncounterSummaryText();
assert.match(summary, /Reperfusão IV: Pode trombolisar/, "resumo deve refletir elegibilidade IV");
assert.match(summary, /Trombectomia: Transferir \/ acionar trombectomia/, "resumo deve refletir trombectomia");

const alteplaseDose = calculators.calculateThrombolyticDose("alteplase", 82, false);
assert.equal(alteplaseDose.totalDoseMg, 73.8, "alteplase deve calcular dose total por peso");
assert.equal(alteplaseDose.bolusDoseMg, 7.4, "alteplase deve discriminar bolus");
assert.equal(alteplaseDose.infusionDoseMg, 66.4, "alteplase deve discriminar infusão");

avcEngine.resetSession();
setField("responsibleClinician", "Dr. Hemorragia");
setField("patientName", "Paciente HIC");
setField("weightKg", "70");
setField("arrivalDayContext", "today");
setField("arrivalTime", "12:05");
setField("lastKnownWellDayContext", "today");
setField("lastKnownWellTime", "11:40");
setField("timePrecision", "exact");
setField("ctResult", "hemorragia");
setField("systolicPressure", "214");
setField("diastolicPressure", "118");
setField("glucoseCurrent", "132");
setNihssComplete("right");

panel = avcEngine.getAuxiliaryPanel();
assert.ok(panel.recommendations.some((rec) => rec.title.includes("Hemorragia: trombólise proibida")), "hemorragia deve bloquear trombólise");
summary = avcEngine.getEncounterSummaryText();
assert.match(summary, /Síndrome: AVC hemorrágico confirmado/, "deve reconhecer AVC hemorrágico");
assert.match(summary, /Destino sugerido: UTI \/ neurointensivismo/, "hemorragia deve sugerir destino intensivo");

avcEngine.resetSession();
setField("responsibleClinician", "Dr. Janela");
setField("patientName", "Paciente tempo incerto");
setField("weightKg", "75");
setField("arrivalDayContext", "today");
setField("arrivalTime", "14:00");
setField("timePrecision", "unknown");
setField("ctResult", "sem_sangramento");
setField("glucoseCurrent", "110");
setField("systolicPressure", "160");
setField("diastolicPressure", "90");
setNihssComplete("left");

panel = avcEngine.getAuxiliaryPanel();
assert.ok(
  panel.recommendations.some((rec) => rec.lines.some((line) => line.includes("Horário de início/LKW desconhecido"))),
  "tempo desconhecido deve bloquear decisão automática"
);

avcEngine.resetSession();
avcEngine.updateAuxiliaryUnit("glucoseInitial", "mmol/L");
setField("glucoseInitial", "18");
panel = avcEngine.getAuxiliaryPanel();
let field = panel.fields.find((item) => item.id === "glucoseInitial");
assert.equal(field.unit, "mmol/L");
assert.equal(field.value, "18");
avcEngine.updateAuxiliaryUnit("glucoseInitial", "mg/dL");
field = avcEngine.getAuxiliaryPanel().fields.find((item) => item.id === "glucoseInitial");
assert.equal(field.value, "324");

setField("creatinine", "2,0");
avcEngine.updateAuxiliaryUnit("creatinine", "µmol/L");
field = avcEngine.getAuxiliaryPanel().fields.find((item) => item.id === "creatinine");
assert.equal(field.unit, "µmol/L");
assert.equal(field.value, "177");

buildEligibleIschemicCase();
setField("destinationOverride", "Alta com seguimento em ambulatório de AVC");
panel = avcEngine.getAuxiliaryPanel();
assert.ok(
  panel.recommendations.some((rec) => rec.title.includes("alta com plano estruturado")),
  "prescrição deve estruturar plano quando destino final for alta"
);

const mockSnapshot = {
  patient: {
    responsibleClinician: "Teste",
    patientName: "Caso",
    patientId: "",
    age: 65,
    sex: "Masculino",
    weightKg: 80,
    heightCm: 170,
    allergies: "",
    comorbidities: "",
    antithrombotics: "",
    renalFunction: "",
    glucoseInitial: 100,
    origin: "SAMU",
  },
  timing: {
    arrivalDayContext: "today",
    arrivalTime: "10:00",
    symptomOnsetDayContext: "today",
    symptomOnsetTime: "09:00",
    lastKnownWellDayContext: "today",
    lastKnownWellTime: "09:00",
    timePrecision: "exact",
  },
  symptoms: {
    symptoms: "déficit focal",
    laterality: "Direita",
    strokeMimicConcern: "no",
    abcInstability: "no",
    airwayProtection: "no",
    disablingDeficit: "yes",
  },
  vitals: {
    systolicPressure: 170,
    diastolicPressure: 95,
    meanArterialPressure: 120,
    heartRate: 88,
    respiratoryRate: 18,
    temperature: 36.5,
    oxygenSaturation: 97,
    glucoseCurrent: 100,
    consciousnessLevel: "Alerta",
    stabilizationActions: "",
    pressureControlActions: "",
    glucoseCorrectionActions: "",
    seizureManagement: "",
    venousAccess: "",
    monitoring: "",
  },
  imaging: {
    ctRequestedAt: "10:05",
    ctPerformedAt: "10:15",
    ctReadAt: "10:20",
    ctResult: "sem_sangramento",
    earlyIschemiaSigns: "",
    ctaPerformed: "yes",
    ctaResult: "sem_lvo",
    lvoSuspicion: "no",
    lvoSite: "",
    imageDelayReason: "",
  },
  labs: { platelets: 220, inr: 1, aptt: 28, creatinine: 1.1 },
  contraindications: {},
  nihss: {
    scores: {
      nihss1a: 0, nihss1b: 0, nihss1c: 0, nihss2: 0, nihss3: 1, nihss4: 1, nihss5a: 2, nihss5b: 0, nihss6a: 2, nihss6b: 0, nihss7: 0, nihss8: 1, nihss9: 1, nihss10: 1, nihss11: 0,
    },
    total: 8,
    complete: true,
    severity: "AVC leve a moderado",
  },
  decision: {
    pathway: "undetermined",
    syndromeLabel: "",
    ivThrombolysis: { gate: "needs_review", label: "", rationale: [], blockers: [], correctableItems: [] },
    thrombectomy: { gate: "needs_review", label: "", rationale: [], blockers: [], correctableItems: [] },
    hemorrhagePlan: { gate: "needs_review", label: "", rationale: [], blockers: [], correctableItems: [] },
    destination: { recommended: "observacao", rationale: [] },
    selectedThrombolyticId: "tenecteplase",
    finalMedicalDecision: "",
    doubleCheckStatus: "",
  },
  dose: { thrombolyticId: "tenecteplase", totalDoseMg: null, bolusDoseMg: null, infusionDoseMg: null, infusionMinutes: null, caution: [] },
};

const decision = eligibility.evaluateAvcDecision(mockSnapshot);
assert.equal(decision.ivThrombolysis.gate, "eligible", "caso controlado deve ser elegível IV");
assert.equal(decision.thrombectomy.gate, "blocked", "sem LVO não deve indicar trombectomia");

console.log("AVC engine tests passed");
