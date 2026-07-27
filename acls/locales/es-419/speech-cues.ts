/**
 * Textos canônicos de áudio do ACLS em espanhol (es-419).
 * Fonte de verdade para o fallback TTS em espanhol E para os 26 MP3 que o
 * usuário vai gravar (ver acls/AUDIO_SCRIPT_ES.md). Chave = cueId (SpeechMapKey).
 * Números por extenso para leitura natural do TTS, como na versão PT.
 */
export const ES_SPEECH_CUES: Record<string, string> = {
  initial_recognition:
    "Verificar la respuesta. Pedir ayuda. Activar emergencia y traer el desfibrilador.",
  assess_patient:
    "Verificar pulso y respiración al mismo tiempo. Máximo diez segundos.",
  pulse_present_monitoring: "Pulso presente. Monitorizar y reevaluar.",
  start_cpr:
    "Iniciar RCP de alta calidad. Cien a ciento veinte compresiones por minuto. Cinco a seis centímetros de profundidad. Permitir el retorno total del tórax. Treinta compresiones por dos ventilaciones. Minimizar las interrupciones.",
  resume_cpr:
    "Reanudar la RCP de inmediato. Dos minutos. No verificar el pulso ahora.",
  start_cpr_nonshockable:
    "Ritmo no desfibrilable. Iniciar RCP y administrar adrenalina un miligramo, lo más rápido posible.",
  prepare_rhythm:
    "Pausar la RCP para evaluar el ritmo. Pausa mínima, menos de diez segundos.",
  prepare_shock:
    "Cargar el desfibrilador durante las compresiones. Alejar a todos.",
  prepare_epinephrine: "Preparar adrenalina, un miligramo.",
  analyze_rhythm: "¿Cuál es el ritmo? ¿Desfibrilable, no desfibrilable o retorno de la circulación?",
  defibrillator_type:
    "Mantener la RCP. ¿El desfibrilador es bifásico o monofásico?",
  shock_biphasic_initial:
    "Ritmo desfibrilable. Bifásico: dosis del fabricante, en general ciento veinte a doscientos julios. Si se desconoce, usar la carga máxima. Alejar a todos. Aplicar la descarga.",
  shock_monophasic_initial:
    "Ritmo desfibrilable. Monofásico, trescientos sesenta julios. Alejar a todos. Aplicar la descarga.",
  shock_escalated:
    "Nueva descarga. Misma carga o mayor. Alejar a todos. Aplicar la descarga.",
  epinephrine_now:
    "Adrenalina, un miligramo, intravenosa o intraósea. Ahora.",
  epinephrine_repeat:
    "Repetir adrenalina, un miligramo. Mantener cada tres a cinco minutos.",
  antiarrhythmic_now:
    "Antiarrítmico ahora. Amiodarona, trescientos miligramos. O lidocaína, uno a uno coma cinco miligramos por kilo.",
  antiarrhythmic_repeat:
    "Segunda dosis de antiarrítmico. Amiodarona, ciento cincuenta miligramos. O lidocaína, media dosis.",
  consider_airway:
    "Vía aérea avanzada. Oxígeno para saturación entre noventa y noventa y ocho por ciento. Evitar la hiperventilación.",
  review_hs_ts: "Revisar las causas reversibles. Cinco haches y cinco tes.",
  confirm_rosc:
    "Retorno de la circulación confirmado. Pulso presente. Iniciar los cuidados posparo de inmediato.",
  post_rosc_care: "Cuidados posparo. Monitorización continua.",
  post_rosc_hemodynamics:
    "Hemodinámica. Mantener la presión arterial media por encima de sesenta y cinco. Líquidos y vasopresores si es necesario.",
  post_rosc_ecg:
    "Electrocardiograma de doce derivaciones. El supradesnivel del ST indica cateterismo de urgencia. Considerar tomografía y ecografía.",
  post_rosc_neuro:
    "Evaluación neurológica. Si no obedece órdenes, controlar la temperatura entre treinta y dos y treinta y siete y medio grados por al menos treinta y seis horas.",
  end_protocol: "Atención finalizada. Documentar las conductas y la decisión médica.",
  switch_compressor: "Cambiar al reanimador. Evitar la fatiga.",
  advanced_airway_confirmed: "Vía aérea avanzada confirmada. Ventilar una vez cada seis segundos. Compresiones continuas, sin pausar para ventilar.",
  rearrest: "Perdió el pulso. Reiniciar RCP de inmediato. Reevaluar el ritmo.",
};
