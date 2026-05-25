import type { ThrombolysisContraDefinition } from "./domain";

export const CORONARY_TABS = [
  { id: 0, icon: "🧑", label: "Paciente", step: "1", phaseTitle: "Identificação, antecedentes e tempos", accent: "#0f766e" },
  { id: 1, icon: "❤️", label: "Dor", step: "2", phaseTitle: "Caracterização da dor e equivalentes isquêmicos", accent: "#be123c" },
  { id: 2, icon: "📈", label: "ECG/Troponina", step: "3", phaseTitle: "ECG estruturado, biomarcadores e alertas", accent: "#0369a1" },
  { id: 3, icon: "📊", label: "Risco", step: "4", phaseTitle: "Scores, instabilidade e classificação clínica", accent: "#7c3aed" },
  { id: 4, icon: "💉", label: "Estratégia", step: "5", phaseTitle: "Reperfusão, medicações e contraindicações", accent: "#b45309" },
  { id: 5, icon: "🏥", label: "Destino", step: "6", phaseTitle: "Destino, checklist, prescrição e auditoria", accent: "#1d4ed8" },
] as const;

export const CORONARY_SECTION_TO_TAB: Record<string, number> = {
  "Responsável e identificação": 0,
  "Fatores de risco e antecedentes": 0,
  "Medicações e tempos críticos": 0,
  "Caracterização da dor": 1,
  "Equivalentes isquêmicos e diagnósticos alternativos": 1,
  "Exame clínico e vitais": 1,
  "ECG estruturado": 2,
  "Troponina e biomarcadores": 2,
  "Logística de reperfusão": 2,
  "Scores e estratificação": 3,
  "Classificação clínica": 3,
  "Contraindicações à trombólise": 4,
  "Estratégia terapêutica e medicações": 4,
  "Destino, checklist e auditoria": 5,
};

export const CORONARY_WINDOWS = {
  firstEcgTargetMin: 10,
  firstTroponinTargetMin: 60,
  primaryPciTargetMin: 90,
  doorNeedleTargetMin: 30,
  fibrinolysisWindowHours: 12,
  rescueWindowMinutes: 90,
};

export const DESTINATION_LABELS: Record<string, string> = {
  cath_lab: "Hemodinâmica",
  icu_ccu: "UTI / unidade coronariana",
  emergency_bay: "Sala de emergência",
  monitored_ward: "Enfermaria monitorizada",
  observation_chest_pain: "Observação com protocolo de dor torácica",
  discharge_followup: "Alta com seguimento e investigação ambulatorial",
  transfer_reference: "Transferência para centro de referência",
};

export const THROMBOLYSIS_CONTRAS: ThrombolysisContraDefinition[] = [
  {
    id: "prior_intracranial_hemorrhage",
    category: "absolute",
    name: "História de hemorragia intracraniana",
    description: "Antecedente de HIC é contraindicação absoluta clássica à trombólise.",
    impact: "Bloqueia trombólise.",
    correctable: false,
  },
  {
    id: "ischemic_stroke_recent",
    category: "absolute",
    name: "AVC isquêmico recente",
    description: "AVC recente dentro da janela considerada incompatível com trombólise.",
    impact: "Bloqueia trombólise.",
    correctable: false,
  },
  {
    id: "aortic_dissection_suspected",
    category: "absolute",
    name: "Suspeita de dissecção de aorta",
    description: "Dor torácica com sinais de dissecção contraindica trombólise.",
    impact: "Bloqueia trombólise e exige revisão diagnóstica imediata.",
    correctable: false,
  },
  {
    id: "active_bleeding",
    category: "absolute",
    name: "Sangramento ativo",
    description: "Sangramento maior ativo em qualquer território.",
    impact: "Bloqueia trombólise.",
    correctable: false,
  },
  {
    id: "severe_uncontrolled_htn",
    category: "relative",
    name: "Hipertensão grave não controlada",
    description: "PA muito elevada antes da fibrinólise aumenta risco hemorrágico.",
    impact: "Pode bloquear até correção.",
    correctable: true,
    correctionGuidance: "Controlar PA e reavaliar elegibilidade.",
  },
  {
    id: "anticoagulation_unknown",
    category: "diagnostic_pending",
    name: "Anticoagulação / coagulopatia não esclarecida",
    description: "Sem confirmar anticoagulante, INR ou coagulopatia relevante.",
    impact: "Mantém trombólise em revisão.",
    correctable: true,
    correctionGuidance: "Confirmar fármacos e laboratórios.",
  },
  {
    id: "ecg_not_confirmed",
    category: "diagnostic_pending",
    name: "ECG inconclusivo para STEMI",
    description: "Sem confirmação adequada de supra persistente ou equivalente aceito localmente.",
    impact: "Bloqueia trombólise automática.",
    correctable: true,
    correctionGuidance: "Repetir ECG, derivações adicionais e revisão médica.",
  },
  {
    id: "hemodynamic_uncertain",
    category: "hemodynamic_pending",
    name: "Instabilidade hemodinâmica não caracterizada",
    description: "Sem definição adequada de choque, Killip ou estabilidade para estratégia.",
    impact: "Impede automatismo de estratégia invasiva/lytics.",
    correctable: true,
    correctionGuidance: "Estabilizar, reavaliar perfusão e definir o fenótipo clínico.",
  },
];

export const LYTIC_REGIMENS = [
  {
    id: "tenecteplase_stemi",
    label: "Tenecteplase",
    note: "Faixas de peso para STEMI; ajustar ao protocolo institucional.",
    weightBands: [
      { maxKg: 60, doseMg: 30 },
      { maxKg: 70, doseMg: 35 },
      { maxKg: 80, doseMg: 40 },
      { maxKg: 90, doseMg: 45 },
      { maxKg: Infinity, doseMg: 50 },
    ],
  },
  {
    id: "alteplase_stemi",
    label: "Alteplase",
    note: "Esquema acelerado clássico: bolus 15 mg, depois 0,75 mg/kg e 0,5 mg/kg com teto total.",
    maxDoseMg: 100,
  },
] as const;

export const ANTICOAG_REGIMENS = [
  {
    id: "ufh_stemi",
    label: "Heparina não fracionada",
    note: "60 U/kg bolus (máx 4000 U), depois 12 U/kg/h (máx 1000 U/h).",
    bolusPerKg: 60,
    bolusMax: 4000,
    infusionPerKgHour: 12,
    infusionMaxHour: 1000,
  },
  {
    id: "enoxaparin_stemi",
    label: "Enoxaparina",
    note: "Ajuste por idade e função renal conforme protocolo configurado.",
  },
] as const;

export const MEDICATION_LABELS = {
  asa: "AAS",
  p2y12: "Segundo antiagregante",
  anticoag: "Anticoagulante",
  nitrate: "Nitrato",
  analgesia: "Analgesia",
  betaBlocker: "Betabloqueador",
  statin: "Estatina de alta intensidade",
  aceiArb: "IECA/BRA",
};
