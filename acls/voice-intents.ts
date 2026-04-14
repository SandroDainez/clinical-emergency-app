type AclsVoiceIntent =
  | "confirm_cpr_started"
  | "confirm_cpr_continuing"
  | "confirm_rhythm_prepared"
  | "confirm_shock_delivered"
  | "confirm_epinephrine_administered"
  | "confirm_antiarrhythmic_administered"
  | "select_shockable_rhythm"
  | "select_non_shockable_rhythm"
  | "select_biphasic_defibrillator"
  | "select_monophasic_defibrillator"
  | "confirm_rosc"
  | "confirm_no_rosc"
  | "confirm_pulse_present"
  | "end_current_flow"
  | "confirm_pending_voice_action"
  | "cancel_pending_voice_action"
  | "repeat_instruction"
  | "open_reversible_causes"
  | "go_to_next_step"
  | "confirm_action"
  | "silence_audio";

type AclsVoiceIntentDefinition = {
  id: AclsVoiceIntent;
  phrases: string[];
  requiresConfirmation?: boolean;
  panelLabel: string;
  confirmationPrompt?: string;
  panelPriority?: number;
};

const ACLS_VOICE_INTENT_DEFINITIONS: Record<AclsVoiceIntent, AclsVoiceIntentDefinition> = {
  confirm_cpr_started: {
    id: "confirm_cpr_started",
    panelLabel: "iniciar RCP",
    panelPriority: 1,
    phrases: [
      "iniciar",
      "confirmar",
      "confirmado",
      // "iniciar rcp" é a forma canônica (normalizador converte variantes)
      "iniciar rcp",
      "iniciar compressões",
      "iniciar compressoes",
      "compressões iniciadas",
      "compressoes iniciadas",
      "rcp iniciada",
      "reanimação iniciada",
      "reanimacao iniciada",
      "confirmar rcp",
      "próximo",
      "proximo",
      "seguir",
    ],
  },
  confirm_cpr_continuing: {
    id: "confirm_cpr_continuing",
    panelLabel: "retomar reanimação",
    panelPriority: 1,
    phrases: [
      // "retomar rcp" é a forma canônica após normalização
      "retomar rcp",
      "retomar reanimação",
      "retomar reanimacao",
      "reiniciar reanimação",
      "reiniciar reanimacao",
      "reiniciar rcp",
      "compressões em andamento",
      "compressoes em andamento",
      "rcp em andamento",
      "continuando rcp",
      "continuando reanimação",
      "confirmado",
      "confirmar",
      "continuar",
    ],
  },
  confirm_rhythm_prepared: {
    id: "confirm_rhythm_prepared",
    panelLabel: "ver ritmo",
    panelPriority: 1,
    phrases: [
      "ver ritmo",
      "avaliar ritmo",
      "checar ritmo",
      "seguir para ritmo",
      "preparado",
      "pronto",
      "confirmar",
      "confirmado",
      "monitor pronto",
      "desfibrilador pronto",
      "ritmo preparado",
      "preparado para ritmo",
      "próximo",
      "proximo",
      "seguir",
    ],
  },
  confirm_shock_delivered: {
    id: "confirm_shock_delivered",
    panelLabel: "choque aplicado",
    confirmationPrompt: "Confirmar choque aplicado?",
    panelPriority: 1,
    phrases: [
      "confirmar",
      "confirmado",
      "choque aplicado",
      "choque realizado",
      "choque dado",
      "choque feito",
      "choque entregue",
      "desfibrilação realizada",
      "desfibrilação aplicada",
      "desfibrilacao realizada",
      "desfibrilacao aplicada",
      "confirmar choque",
      "próximo",
      "proximo",
      "seguir",
    ],
  },
  confirm_epinephrine_administered: {
    id: "confirm_epinephrine_administered",
    panelLabel: "epinefrina administrada",
    confirmationPrompt: "Confirmar epinefrina administrada?",
    panelPriority: 1,
    phrases: [
      "administrado",
      "medicacao administrada",
      "medicação administrada",
      "epinefrina administrada",
      "adrenalina administrada",
      "epi administrada",
      "epi feita",
      "epinefrina feita",
      "adrenalina feita",
      "epi",
      "confirmar epinefrina",
      "confirmar adrenalina",
    ],
  },
  confirm_antiarrhythmic_administered: {
    id: "confirm_antiarrhythmic_administered",
    panelLabel: "antiarrítmico administrado",
    confirmationPrompt: "Confirmar antiarrítmico administrado?",
    panelPriority: 1,
    phrases: [
      "antiarrítmico administrado",
      "antiarritmico administrado",
      "amiodarona administrada",
      "lidocaína administrada",
      "lidocaina administrada",
      "amiodarona feita",
      "lidocaína feita",
      "confirmar antiarrítmico",
      "confirmar antiarritmico",
    ],
  },
  select_shockable_rhythm: {
    id: "select_shockable_rhythm",
    panelLabel: "ritmo chocável",
    confirmationPrompt: "Confirmar ritmo chocável?",
    panelPriority: 1,
    phrases: [
      "ritmo chocável",
      "ritmo chocavel",
      "chocável",
      "chocavel",
      "ritmo fibrilacao ventricular",
      "ritmo taquicardia ventricular sem pulso",
      "ritmo de choque",
      "fibrilação ventricular",
      "fibrilacao ventricular",
      "fv",
      "tv sem pulso",
      "taquicardia ventricular sem pulso",
    ],
  },
  select_non_shockable_rhythm: {
    id: "select_non_shockable_rhythm",
    panelLabel: "ritmo não chocável",
    confirmationPrompt: "Confirmar ritmo não chocável?",
    panelPriority: 2,
    phrases: [
      "ritmo não chocável",
      "ritmo nao chocavel",
      "não chocável",
      "nao chocavel",
      "ritmo assistolia",
      "ritmo atividade eletrica sem pulso",
      "ritmo sem choque",
      "assistolia",
      "aesp",
      "atividade elétrica sem pulso",
      "atividade eletrica sem pulso",
    ],
  },
  select_biphasic_defibrillator: {
    id: "select_biphasic_defibrillator",
    panelLabel: "bifásico",
    confirmationPrompt: "Confirmar desfibrilador bifásico?",
    panelPriority: 1,
    phrases: [
      "bifásico",
      "bifasico",
      "desfibrilador bifásico",
      "desfibrilador bifasico",
      "usar bifásico",
      "usar bifasico",
      "escolher bifásico",
      "escolher bifasico",
    ],
  },
  select_monophasic_defibrillator: {
    id: "select_monophasic_defibrillator",
    panelLabel: "monofásico",
    confirmationPrompt: "Confirmar desfibrilador monofásico?",
    panelPriority: 2,
    phrases: [
      "monofásico",
      "monofasico",
      "desfibrilador monofásico",
      "desfibrilador monofasico",
      "usar monofásico",
      "usar monofasico",
      "escolher monofásico",
      "escolher monofasico",
    ],
  },
  confirm_rosc: {
    id: "confirm_rosc",
    requiresConfirmation: true,
    panelLabel: "retorno da circulação espontânea",
    confirmationPrompt: "Confirmar retorno da circulação espontânea?",
    panelPriority: 3,
    phrases: [
      "rosc",
      "retorno da circulação espontânea",
      "retorno da circulacao espontanea",
      "retorno da circulação",
      "retorno da circulacao",
      "tem pulso",
      "pulso presente",
      "tem pulso agora",
      "retornou circulação",
      "retornou circulacao",
    ],
  },
  confirm_no_rosc: {
    id: "confirm_no_rosc",
    panelLabel: "sem pulso",
    panelPriority: 2,
    phrases: [
      "não respira e sem pulso",
      "nao respira e sem pulso",
      "gasping e sem pulso",
      "apneia e sem pulso",
      "sem pulso",
      "não tem pulso",
      "nao tem pulso",
      "continua sem pulso",
      "segue sem pulso",
      "sem circulação",
      "sem circulacao",
      "sem rosc",
    ],
  },
  confirm_pulse_present: {
    id: "confirm_pulse_present",
    panelLabel: "com pulso",
    panelPriority: 2,
    phrases: [
      "respira e tem pulso",
      "tem pulso e respira",
      "tem pulso e está respirando",
      "tem pulso e esta respirando",
      "com pulso",
      "tem pulso",
      "pulso presente",
      "paciente com pulso",
      "há pulso",
      "ha pulso",
    ],
  },
  end_current_flow: {
    id: "end_current_flow",
    requiresConfirmation: true,
    panelLabel: "encerrar atendimento",
    confirmationPrompt: "Confirmar encerramento do atendimento?",
    panelPriority: 3,
    phrases: [
      "encerrar atendimento",
      "encerrar",
      "finalizar atendimento",
      "finalizar",
      "encerrar fluxo",
      "terminar atendimento",
      "terminar",
      "pode encerrar",
      "decisão de encerrar",
    ],
  },
  confirm_pending_voice_action: {
    id: "confirm_pending_voice_action",
    panelLabel: "confirmar",
    panelPriority: 1,
    phrases: ["confirmar", "confirmo", "pode confirmar", "sim confirmar"],
  },
  cancel_pending_voice_action: {
    id: "cancel_pending_voice_action",
    panelLabel: "cancelar",
    panelPriority: 2,
    phrases: ["cancelar", "cancela", "não confirmar", "nao confirmar"],
  },
  repeat_instruction: {
    id: "repeat_instruction",
    panelLabel: "repetir",
    panelPriority: 5,
    phrases: ["repetir instrução", "repetir instrucao", "repita", "repetir", "fale de novo"],
  },
  open_reversible_causes: {
    id: "open_reversible_causes",
    panelLabel: "abrir causas reversíveis",
    panelPriority: 4,
    phrases: [
      "abrir causas reversíveis",
      "abrir causas reversiveis",
      "ver hs e ts",
      "mostrar hs e ts",
      "mostrar causas reversíveis",
      "mostrar causas reversiveis",
    ],
  },
  go_to_next_step: {
    id: "go_to_next_step",
    panelLabel: "próximo / seguir",
    panelPriority: 2,
    phrases: [
      "próximo",
      "proximo",
      "seguir",
      "seguir fase",
      "seguir fluxo",
      "proxima fase",
      "próxima fase",
      "próximo passo",
      "proximo passo",
      "avançar etapa",
      "avancar etapa",
      "avançar fase",
      "avancar fase",
      "continuar",
    ],
  },
  confirm_action: {
    id: "confirm_action",
    panelLabel: "confirmar",
    panelPriority: 1,
    phrases: [
      "confirmar",
      "confirmado",
      "confirmar fase",
      "confirmar fluxo",
      "confirmar etapa",
      "confirmar conduta",
      "confirmar ação",
      "confirmar passo",
      "confirmar este passo",
      "confirmar essa conduta",
      "confirmar a conduta",
    ],
  },
  silence_audio: {
    id: "silence_audio",
    panelLabel: "silenciar áudio",
    panelPriority: 7,
    phrases: ["silenciar áudio", "silenciar audio", "parar áudio", "parar audio", "silêncio", "silencio"],
  },
};

function getVoiceIntentDefinition(intent: AclsVoiceIntent) {
  return ACLS_VOICE_INTENT_DEFINITIONS[intent];
}

export type { AclsVoiceIntent, AclsVoiceIntentDefinition };
export { ACLS_VOICE_INTENT_DEFINITIONS, getVoiceIntentDefinition };
