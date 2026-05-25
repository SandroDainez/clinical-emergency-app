const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "coronary-engine-test-"));

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

copyProtocolJson(path.join("protocols", "sindromes_coronarianas.json"));

const coronaryEngine = compileModule(path.join(appDir, "coronary-syndromes-engine.ts"), "coronary-syndromes-engine.js");
const calculators = compileModule(path.join(appDir, "coronary", "calculators.ts"), path.join("coronary", "calculators.js"));
const classification = compileModule(path.join(appDir, "coronary", "classification.ts"), path.join("coronary", "classification.js"));

function setField(id, value) {
  coronaryEngine.updateAuxiliaryField(id, value);
}

function buildStemiPciCase() {
  coronaryEngine.resetSession();
  setField("responsibleClinician", "Dr. Cardio");
  setField("patientName", "STEMI PCI");
  setField("age", "62");
  setField("sex", "Masculino");
  setField("weightKg", "84");
  setField("onsetTime", "07:40");
  setField("arrivalTime", "08:10");
  setField("firstEcgTime", "08:14");
  setField("diagnosisTime", "08:16");
  setField("decisionTime", "08:20");
  setField("stElevation", "yes");
  setField("territory", "anterior");
  setField("painOngoing", "yes");
  setField("restPain", "yes");
  setField("subjectiveClassification", "típica");
  setField("systolicPressure", "132");
  setField("diastolicPressure", "84");
  setField("heartRate", "92");
  setField("oxygenSaturation", "97");
  setField("killip", "1");
  setField("cathLabAvailable", "yes");
  setField("expectedPciDelayMin", "45");
  setField("fibrinolysisAvailable", "yes");
}

buildStemiPciCase();
let panel = coronaryEngine.getAuxiliaryPanel();
assert.ok(panel, "painel auxiliar deve existir no fluxo coronariano");
assert.ok(panel.recommendations.some((rec) => rec.title.includes("angioplastia primária")), "STEMI com hemodinâmica deve priorizar PCI");
let summary = coronaryEngine.getEncounterSummaryText();
assert.match(summary, /Categoria sugerida: stemi/, "resumo deve classificar STEMI");
assert.match(summary, /Reperfusão: STEMI: reperfusão imediata com angioplastia primária/, "resumo deve refletir estratégia de PCI");

coronaryEngine.resetSession();
setField("responsibleClinician", "Dra. Lise");
setField("patientName", "STEMI lítico");
setField("age", "58");
setField("weightKg", "70");
setField("onsetTime", "10:00");
setField("arrivalTime", "11:00");
setField("firstEcgTime", "11:05");
setField("stElevation", "yes");
setField("restPain", "yes");
setField("subjectiveClassification", "típica");
setField("cathLabAvailable", "no");
setField("fibrinolysisAvailable", "yes");
panel = coronaryEngine.getAuxiliaryPanel();
assert.ok(panel.recommendations.some((rec) => rec.title.includes("considerar trombólise")), "sem PCI imediata e com lítico disponível deve considerar trombólise");

setField("contra_prior_intracranial_hemorrhage_status", "present");
panel = coronaryEngine.getAuxiliaryPanel();
assert.ok(panel.recommendations.some((rec) => rec.title.includes("Trombólise contraindicada")), "contraindicação absoluta deve bloquear trombólise");

coronaryEngine.resetSession();
setField("responsibleClinician", "Dr. NSTEMI");
setField("patientName", "NSTEMI risco");
setField("age", "77");
setField("weightKg", "72");
setField("arrivalTime", "14:00");
setField("firstEcgTime", "14:08");
setField("restPain", "yes");
setField("recurrence", "yes");
setField("stDepression", "yes");
setField("troponin1Value", "160");
setField("labReference", "34");
setField("systolicPressure", "118");
setField("diastolicPressure", "72");
setField("heartRate", "104");
setField("killip", "2");
panel = coronaryEngine.getAuxiliaryPanel();
assert.ok(panel.recommendations.some((rec) => rec.title.includes("NSTEMI de alto risco")), "NSTEMI com alto risco deve sugerir estratégia precoce");

coronaryEngine.resetSession();
setField("responsibleClinician", "Dra. Ambu");
setField("patientName", "Angina estável");
setField("age", "66");
setField("weightKg", "80");
setField("effortRelated", "yes");
setField("restPain", "no");
setField("recurrence", "no");
setField("progressionRecent", "no");
setField("subjectiveClassification", "típica");
setField("troponin1Value", "5");
setField("labReference", "34");
setField("stElevation", "no");
setField("stDepression", "no");
setField("inconclusive", "no");
summary = coronaryEngine.getEncounterSummaryText();
assert.match(summary, /Categoria sugerida: stable_angina/, "quadro ambulatorial deve sugerir angina estável");

const tenecteplase = calculators.calculateLyticDose("tenecteplase_stemi", 84);
assert.equal(tenecteplase.lines[0], "Dose em bolus único: 45 mg", "tenecteplase deve respeitar faixas de peso");
const ufh = calculators.calculateAnticoagulation("ufh_stemi", 84, 62, false);
assert.match(ufh.lines[0], /Bolus: 4000 U IV/, "UFH deve limitar bolus máximo");

const mockSnapshot = {
  patient: {
    responsibleClinician: "Teste",
    patientName: "Caso",
    patientId: "",
    age: 60,
    sex: "Masculino",
    weightKg: 80,
    estimatedWeight: false,
    heightCm: 175,
    allergies: "",
    diabetes: "yes",
    hypertension: "yes",
    dyslipidemia: "yes",
    smoking: "no",
    ckd: "no",
    heartFailure: "no",
    priorCad: "yes",
    priorPci: "no",
    priorCabg: "no",
    priorStroke: "no",
    atrialFibrillation: "no",
    anticoagulants: "",
    antiplatelets: "",
    medications: "",
    origin: "SAMU",
  },
  pain: {
    onsetTime: "08:00",
    lastPainFreeTime: "07:50",
    arrivalTime: "08:30",
    chestPainType: "opressiva",
    location: "retroesternal",
    radiation: "MSE",
    durationMinutes: 30,
    intensity: 9,
    triggers: "",
    reliefFactors: "",
    effortRelated: "no",
    restPain: "yes",
    recurrence: "yes",
    progressionRecent: "yes",
    dyspnea: "yes",
    diaphoresis: "yes",
    nauseaVomiting: "no",
    syncope: "no",
    palpitations: "no",
    ischemicEquivalent: "yes",
    pleuriticPain: "no",
    reproduciblePain: "no",
    alternativeDiagnosisSigns: "",
    subjectiveClassification: "típica",
    painOngoing: "yes",
  },
  exam: {
    systolicPressure: 110,
    diastolicPressure: 70,
    meanArterialPressure: 83,
    heartRate: 102,
    respiratoryRate: 20,
    oxygenSaturation: 96,
    temperature: 36.4,
    peripheralPerfusion: "preservada",
    congestion: "no",
    crackles: "no",
    murmur: "no",
    b3: "no",
    jugularDistension: "no",
    edema: "no",
    mentalStatus: "alerta",
    shockSigns: "no",
    killip: "1",
    abcInstability: "no",
    stabilizationActions: "",
  },
  ecg: {
    firstEcgTime: "08:35",
    serialEcg: "yes",
    comparedPrior: "no",
    stElevation: "no",
    stDepression: "yes",
    twaveInversion: "yes",
    newBundleBranchBlock: "no",
    rhythm: "sinusal",
    heartRate: 102,
    territory: "anterior",
    inferior: "no",
    anterior: "yes",
    lateral: "no",
    posterior: "no",
    rvInvolvement: "no",
    inconclusive: "no",
    additionalLeadsNeeded: "no",
    interpretationNotes: "",
  },
  biomarkers: {
    troponinType: "alta_sensibilidade",
    troponin1Time: "08:40",
    troponin1Value: 160,
    labReference: 34,
    troponin2Time: "10:40",
    troponin2Value: 220,
    troponin3Time: "",
    troponin3Value: null,
  },
  logistics: {
    cathLabAvailable: "yes",
    expectedPciDelayMin: 45,
    fibrinolysisAvailable: "yes",
    diagnosisTime: "08:45",
    decisionTime: "08:50",
    reperfusionStartTime: "",
    transferTime: "",
  },
  contraindications: {},
  classification: { category: "indeterminate", rationale: [] },
  scores: {
    heart: { label: "HEART", value: null, tier: "", rationale: [], missing: [], impact: "" },
    timi: { label: "TIMI", value: null, tier: "", rationale: [], missing: [], impact: "" },
    grace: { label: "GRACE", value: null, tier: "", rationale: [], missing: [], impact: "" },
    killip: { label: "Killip", value: null, tier: "", rationale: [], missing: [], impact: "" },
  },
  treatment: {
    reperfusion: { gate: "needs_review", label: "", rationale: [], blockers: [], correctableItems: [] },
    fibrinolysis: { gate: "needs_review", label: "", rationale: [], blockers: [], correctableItems: [] },
    invasiveStrategy: { gate: "needs_review", label: "", rationale: [], blockers: [], correctableItems: [] },
    medications: [],
    reperfusionStrategy: "no_reperfusion",
    selectedLyticId: "tenecteplase_stemi",
    selectedAnticoagId: "ufh_stemi",
    lyticDose: { regimenId: "", title: "", lines: [], caution: [] },
    anticoagDose: { regimenId: "", title: "", lines: [], caution: [] },
    finalMedicalDecision: "",
    doubleCheckStatus: "",
  },
  destination: {
    recommended: "observation_chest_pain",
    rationale: [],
  },
};

const evaluated = classification.evaluateCoronaryStrategies(mockSnapshot);
assert.equal(evaluated.classification.category, "nstemi", "troponina positiva com ECG isquêmico sem supra deve classificar NSTEMI");
