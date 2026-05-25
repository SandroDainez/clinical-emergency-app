export const CORONARY_TABS = [
  { id: 0, icon: "🧑", label: "Paciente", step: "1", guide: "Identificação, fatores de risco, medicações e tempos críticos." },
  { id: 1, icon: "❤️", label: "Dor", step: "2", guide: "Caracterize a dor, equivalentes isquêmicos e sinais de diagnósticos alternativos." },
  { id: 2, icon: "📈", label: "ECG/Troponina", step: "3", guide: "Documente ECG estruturado, biomarcadores e logística de reperfusão." },
  { id: 3, icon: "📊", label: "Risco", step: "4", guide: "Valide scores, instabilidade e classificação clínica sugerida." },
  { id: 4, icon: "💉", label: "Estratégia", step: "5", guide: "Cheque contraindicações, reperfusão, antitrombóticos e dupla checagem." },
  { id: 5, icon: "🏥", label: "Destino", step: "6", guide: "Fechamento do caso, prescrição inicial, checklist e auditoria." },
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
