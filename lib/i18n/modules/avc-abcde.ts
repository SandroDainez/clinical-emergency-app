/**
 * ES — AVC · o ABCDE clássico da estabilização (Fase 3, decisão C1).
 *
 * ⚠️ Os sinais vitais aqui são REGISTRO, e não afirmação clínica: nenhuma fonte
 * do AVC lhes dá corte. ⛔ A tradução das notas precisa preservar exatamente
 * isso — em espanhol também.
 */
export const avcAbcdeEs: Record<string, string> = {
  "A · Via aérea": "A · Vía aérea",
  "B · Respiração": "B · Respiración",
  "C · Circulação": "C · Circulación",
  "Circulação": "Circulación",
  "D · Neurológico": "D · Neurológico",
  "E · Exposição": "E · Exposición",
  "Monitorização e acessos": "Monitorización y accesos",
  /** ⚠️ O cockpit: progresso da avaliação, ⛔ e ⛔ nunca estado clínico. */
  "Avaliação concluída": "Evaluación concluida",
  "Sem dados clínicos registrados": "Sin datos clínicos registrados",
  "A avaliar": "Por evaluar",
  "Concluir": "Concluir",
  "Reabrir": "Reabrir",
  "Próximo": "Siguiente",
  "marcar avaliação como concluída": "marcar la evaluación como concluida",
  "reabrir avaliação": "reabrir la evaluación",
  "Monitorização instalada": "Monitorización instalada",
  "Acessos obtidos": "Accesos obtenidos",
  "ECG contínuo": "ECG continuo",
  "Oximetria": "Oximetría",
  "Pressão arterial": "Presión arterial",
  "Temperatura": "Temperatura",
  "Periférico": "Periférico",
  "Central": "Central",
  "Intraósseo": "Intraóseo",
  "Frequência respiratória": "Frecuencia respiratoria",
  "Frequência cardíaca": "Frecuencia cardíaca",
  "Escala de coma de Glasgow": "Escala de coma de Glasgow",
  "Pressão arterial média": "Presión arterial media",
  "calculada de PAS e PAD": "calculada de PAS y PAD",
  "Registro de sinal vital. Nenhuma recomendação deste módulo é calculada a partir dele.":
    "Registro de signo vital. Ninguna recomendación de este módulo se calcula a partir de él.",
  "Registro do nível de consciência. A pergunta que decide suporte de via aérea é a do bloco A.":
    "Registro del nivel de conciencia. La pregunta que decide el soporte de vía aérea es la del bloque A.",
  "Registro operacional do atendimento. Não interfere em nenhuma recomendação.":
    "Registro operativo de la atención. No interfiere en ninguna recomendación.",
};
