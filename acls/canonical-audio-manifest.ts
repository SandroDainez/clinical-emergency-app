type AclsCanonicalAudioCategory =
  | "recognition"
  | "cycle"
  | "pre_cue"
  | "medication"
  | "post_rosc"
  | "system";

type AclsCanonicalAudioEntry = {
  key: string;
  text: string;
  category: AclsCanonicalAudioCategory;
  notes?: string;
};

const ACLS_CANONICAL_AUDIO_MANIFEST: AclsCanonicalAudioEntry[] = [
  {
    key: "initial_recognition",
    text: "Verificar responsividade. Chamar ajuda. Acionar emergência.",
    category: "recognition",
    notes: "Primeira tela do fluxo, antes da checagem de respiração e pulso.",
  },
  {
    key: "assess_patient",
    text: "Checar pulso e respiração. Dez segundos.",
    category: "recognition",
    notes: "Abertura do fluxo. Evita siglas e perguntas narrativas longas.",
  },
  {
    key: "pulse_present_monitoring",
    text: "Pulso presente. Monitorar.",
    category: "recognition",
    notes: "Saída precoce quando há pulso presente e o fluxo de PCR não é iniciado.",
  },
  {
    key: "start_cpr",
    text: "Iniciar RCP. Cem a cento e vinte compressões por minuto.",
    category: "cycle",
    notes: "Comando principal do início da reanimação.",
  },
  {
    key: "start_cpr_nonshockable",
    text: "Não chocável. Epinefrina 1 mg IV ou IO agora. RCP dois minutos.",
    category: "cycle",
    notes: "Comando principal do ramo não chocável.",
  },
  {
    key: "resume_cpr",
    text: "Retomar RCP. Dois minutos.",
    category: "cycle",
    notes: "Retomada da RCP após choque ou checagem de ritmo.",
  },
  {
    key: "prepare_rhythm",
    text: "Preparar para avaliar ritmo.",
    category: "pre_cue",
    notes: "Pre-cue temporal 10 segundos antes da checagem de ritmo.",
  },
  {
    key: "analyze_rhythm",
    text: "Ritmo? Chocável, não chocável ou ROSC?",
    category: "cycle",
    notes: "Checagem de ritmo. Comando crítico.",
  },
  {
    key: "defibrillator_type",
    text: "Bifásico ou monofásico?",
    category: "cycle",
    notes: "Etapa operacional antes do primeiro choque.",
  },
  {
    key: "shock_biphasic_initial",
    text: "Chocável. Bifásico — dose do fabricante. Afastar todos. Aplicar choque.",
    category: "cycle",
    notes: "Primeiro choque com desfibrilador bifásico.",
  },
  {
    key: "shock_monophasic_initial",
    text: "Chocável. Monofásico, trezentos e sessenta joules. Afastar todos. Aplicar choque.",
    category: "cycle",
    notes: "Primeiro choque com desfibrilador monofásico.",
  },
  {
    key: "prepare_shock",
    text: "Carregar desfibrilador. Afastar todos.",
    category: "pre_cue",
    notes: "Pre-cue de transição ao entrar na fase de choque.",
  },
  {
    key: "prepare_epinephrine",
    text: "Preparar epinefrina 1 mg.",
    category: "pre_cue",
    notes: "Pre-cue antes da epinefrina.",
  },
  {
    key: "shock_escalated",
    text: "Novo choque. Carga máxima. Afastar todos. Aplicar choque.",
    category: "cycle",
    notes: "Choques subsequentes com escalonamento de carga.",
  },
  {
    key: "epinephrine_now",
    text: "Epinefrina 1 mg IV ou IO. Agora.",
    category: "medication",
    notes: "Dose de agora. Comando crítico.",
  },
  {
    key: "epinephrine_repeat",
    text: "Repetir epinefrina. 1 mg IV ou IO.",
    category: "medication",
    notes: "Repetição da epinefrina.",
  },
  {
    key: "antiarrhythmic_now",
    text: "Antiarrítmico agora. Amiodarona 300 mg IV ou IO. Ou lidocaína 1 a 1 vírgula 5 mg por kg.",
    category: "medication",
    notes: "Primeira recomendação de antiarrítmico.",
  },
  {
    key: "antiarrhythmic_repeat",
    text: "Segunda dose. Amiodarona 150 mg IV ou IO. Ou lidocaína 0 vírgula 5 a 0 vírgula 75 mg por kg.",
    category: "medication",
    notes: "Repetição de antiarrítmico.",
  },
  {
    key: "consider_airway",
    text: "Via aérea avançada. Avaliar.",
    category: "cycle",
    notes: "Lembrete operacional durante reanimação.",
  },
  {
    key: "review_hs_ts",
    text: "Rever causas reversíveis. Cinco Hs e cinco Ts.",
    category: "cycle",
    notes: "Reforço de revisão de causas reversíveis.",
  },
  {
    key: "confirm_rosc",
    text: "ROSC confirmado. Pulso presente. Iniciar cuidados pós-parada imediatamente.",
    category: "post_rosc",
    notes: "Confirmação de retorno da circulação.",
  },
  {
    key: "post_rosc_care",
    text: "Cuidados pós-parada.",
    category: "post_rosc",
    notes: "Entrada do pós-parada.",
  },
  {
    key: "post_rosc_hemodynamics",
    text: "Hemodinâmica. PAM acima de 65. Volume e vasopressores.",
    category: "post_rosc",
    notes: "Ajuste hemodinâmico operacional.",
  },
  {
    key: "post_rosc_ecg",
    text: "ECG de doze derivações. Considerar TC e ultrassom.",
    category: "post_rosc",
    notes: "Investigação pós-parada.",
  },
  {
    key: "post_rosc_neuro",
    text: "Avaliação neurológica. Controle de temperatura.",
    category: "post_rosc",
    notes: "Avaliação neurológica pós-parada.",
  },
  {
    key: "end_protocol",
    text: "Encerrar caso",
    category: "system",
    notes: "Encerramento final.",
  },
];

const ACLS_LEGACY_AUDIO_FILES_TO_REPLACE = [
  "reconhecimento_inicial.mp3",
  "checar_respiracao_pulso.mp3",
  "monitorizar_com_pulso.mp3",
  "inicio.mp3",
  "preparar_monitorizacao.mp3",
  "avaliar_ritmo.mp3",
  "tipo_desfibrilador.mp3",
  "choque_bi_1.mp3",
  "choque_mono_1.mp3",
  "rcp_1.mp3",
  "avaliar_ritmo_2.mp3",
  "choque_2.mp3",
  "choque_2_bifasico.mp3",
  "choque_2_monofasico.mp3",
  "rcp_2.mp3",
  "avaliar_ritmo_3.mp3",
  "choque_3.mp3",
  "choque_3_bifasico.mp3",
  "choque_3_monofasico.mp3",
  "rcp_3.mp3",
  "nao_chocavel_epinefrina.mp3",
  "nao_chocavel_ciclo.mp3",
  "avaliar_ritmo_nao_chocavel.mp3",
  "nao_chocavel_hs_ts.mp3",
  "pos_rosc.mp3",
  "pos_rosc_via_aerea.mp3",
  "pos_rosc_hemodinamica.mp3",
  "pos_rosc_ecg.mp3",
  "pos_rosc_neurologico.mp3",
  "pos_rosc_destino.mp3",
  "pos_rosc_concluido.mp3",
  "encerrado.mp3",
  "reminder_reavaliar_ritmo.mp3",
  "reminder_epinefrina.mp3",
  "reminder_antiarritmico_1.mp3",
  "reminder_antiarritmico_2.mp3",
] as const;

export type { AclsCanonicalAudioCategory, AclsCanonicalAudioEntry };
export { ACLS_CANONICAL_AUDIO_MANIFEST, ACLS_LEGACY_AUDIO_FILES_TO_REPLACE };
