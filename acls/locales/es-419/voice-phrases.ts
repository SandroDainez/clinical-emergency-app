/**
 * Frases de comando de voz em espanhol (es-419) por intent.
 * Usadas quando o idioma ativo é es-419 (voice-intents.getVoiceIntentDefinition).
 * O normalizador (voice-resolver) remove acentos, então variantes com/sem
 * acento convergem; ainda assim listamos formas naturais.
 * panelLabel = rótulo curto exibido no painel de comandos.
 */
export type VoicePhraseEntry = { panelLabel: string; phrases: string[] };

export const ES_VOICE_PHRASES: Record<string, VoicePhraseEntry> = {
  confirm_cpr_started: {
    panelLabel: "iniciar RCP",
    phrases: [
      "iniciar", "confirmar", "confirmado", "ok", "correcto", "puede seguir",
      "puede iniciar", "iniciar rcp", "iniciar compresiones", "compresiones iniciadas",
      "rcp iniciada", "reanimacion iniciada", "confirmar rcp", "siguiente", "seguir",
    ],
  },
  confirm_cpr_continuing: {
    panelLabel: "reanudar reanimación",
    phrases: [
      "reanudar rcp", "reanudar reanimacion", "reiniciar reanimacion", "reiniciar rcp",
      "compresiones en curso", "rcp en curso", "continuando rcp", "continuando reanimacion",
      "confirmado", "confirmar", "continuar", "ok continuar", "puede continuar", "sigue rcp",
    ],
  },
  confirm_rhythm_prepared: {
    panelLabel: "ver ritmo",
    phrases: [
      "ver ritmo", "evaluar ritmo", "verificar ritmo", "seguir al ritmo", "preparado",
      "listo", "confirmar", "confirmado", "monitor listo", "desfibrilador listo",
      "ritmo preparado", "siguiente", "seguir", "puede ver el ritmo", "vamos a ver el ritmo",
    ],
  },
  confirm_shock_delivered: {
    panelLabel: "descarga aplicada",
    phrases: [
      "confirmar", "confirmado", "descarga aplicada", "descarga realizada", "descarga dada",
      "descarga hecha", "desfibrilacion realizada", "desfibrilacion aplicada", "confirmar descarga",
      "siguiente", "seguir", "descarga ok", "descarga confirmada", "choque aplicado",
    ],
  },
  confirm_epinephrine_administered: {
    panelLabel: "adrenalina administrada",
    phrases: [
      "administrado", "medicacion administrada", "adrenalina administrada", "epinefrina administrada",
      "adrenalina hecha", "epinefrina hecha", "adrenalina", "epinefrina", "confirmar adrenalina",
      "confirmar epinefrina", "adrenalina ok", "epinefrina ok", "medicacion hecha",
    ],
  },
  confirm_antiarrhythmic_administered: {
    panelLabel: "antiarrítmico administrado",
    phrases: [
      "antiarritmico administrado", "amiodarona administrada", "lidocaina administrada",
      "amiodarona hecha", "lidocaina hecha", "confirmar antiarritmico", "amiodarona ok",
      "antiarritmico ok",
    ],
  },
  select_shockable_rhythm: {
    panelLabel: "ritmo desfibrilable",
    phrases: [
      "ritmo desfibrilable", "desfibrilable", "ritmo fibrilacion ventricular",
      "ritmo taquicardia ventricular sin pulso", "ritmo de descarga", "fibrilacion ventricular",
      "fv", "tv sin pulso", "taquicardia ventricular sin pulso", "desfibrilable si", "ritmo chocable",
    ],
  },
  select_non_shockable_rhythm: {
    panelLabel: "ritmo no desfibrilable",
    phrases: [
      "ritmo no desfibrilable", "no desfibrilable", "ritmo asistolia",
      "ritmo actividad electrica sin pulso", "ritmo sin descarga", "asistolia", "aesp",
      "actividad electrica sin pulso", "no desfibrilable si", "ritmo no chocable",
    ],
  },
  select_biphasic_defibrillator: {
    panelLabel: "bifásico",
    phrases: [
      "bifasico", "desfibrilador bifasico", "usar bifasico", "elegir bifasico",
    ],
  },
  select_monophasic_defibrillator: {
    panelLabel: "monofásico",
    phrases: [
      "monofasico", "desfibrilador monofasico", "usar monofasico", "elegir monofasico",
    ],
  },
  confirm_rosc: {
    panelLabel: "retorno de la circulación espontánea",
    phrases: [
      "rce", "rosc", "retorno de la circulacion espontanea", "retorno de la circulacion",
      "tiene pulso", "pulso presente", "tiene pulso ahora", "retorno la circulacion",
      "volvio el pulso", "volvio la circulacion", "hay pulso",
    ],
  },
  confirm_no_rosc: {
    panelLabel: "sin pulso",
    phrases: [
      "no respira y sin pulso", "gasping y sin pulso", "apnea y sin pulso", "sin pulso",
      "no tiene pulso", "sigue sin pulso", "continua sin pulso", "sin circulacion", "sin rce",
      "sin rosc",
    ],
  },
  confirm_pulse_present: {
    panelLabel: "con pulso",
    phrases: [
      "respira y tiene pulso", "tiene pulso y respira", "tiene pulso y esta respirando",
      "con pulso", "tiene pulso", "pulso presente", "paciente con pulso", "hay pulso",
      "el paciente tiene pulso", "volvio el pulso",
    ],
  },
  end_current_flow: {
    panelLabel: "finalizar atención",
    phrases: [
      "finalizar atencion", "finalizar", "terminar atencion", "terminar", "finalizar flujo",
      "puede finalizar", "decision de finalizar", "encerrar", "cerrar atencion",
    ],
  },
  confirm_pending_voice_action: {
    panelLabel: "confirmar",
    phrases: ["confirmar", "confirmo", "puede confirmar", "si confirmar"],
  },
  cancel_pending_voice_action: {
    panelLabel: "cancelar",
    phrases: ["cancelar", "cancela", "no confirmar"],
  },
  repeat_instruction: {
    panelLabel: "repetir",
    phrases: ["repetir instruccion", "repita", "repetir", "dilo de nuevo", "otra vez"],
  },
  open_reversible_causes: {
    panelLabel: "abrir causas reversibles",
    phrases: [
      "abrir causas reversibles", "ver h y t", "mostrar h y t", "mostrar causas reversibles",
      "ver causas reversibles",
    ],
  },
  go_to_next_step: {
    panelLabel: "siguiente / seguir",
    phrases: [
      "siguiente", "seguir", "seguir fase", "seguir flujo", "proxima fase", "siguiente paso",
      "puede seguir", "sigue", "vamos a seguir", "avanzar etapa", "avanzar fase", "continuar",
    ],
  },
  confirm_action: {
    panelLabel: "confirmar",
    phrases: [
      "confirmar", "confirmado", "confirmar fase", "confirmar flujo", "confirmar etapa",
      "confirmar conducta", "confirmar accion", "confirmar paso", "confirmar este paso",
      "ok", "correcto", "puede seguir", "eso",
    ],
  },
  silence_audio: {
    panelLabel: "silenciar audio",
    phrases: ["silenciar audio", "parar audio", "silencio", "callar audio"],
  },
};
