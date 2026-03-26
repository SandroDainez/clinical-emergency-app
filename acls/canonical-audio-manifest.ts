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
    key: "assess_patient",
    text: "Checar respiração e pulso",
    category: "recognition",
    notes: "Abertura do fluxo. Evita siglas e perguntas narrativas longas.",
  },
  {
    key: "start_cpr",
    text: "Iniciar reanimação cardiopulmonar",
    category: "cycle",
    notes: "Comando principal do início da reanimação.",
  },
  {
    key: "start_cpr_nonshockable",
    text: "Manter reanimação e dar epinefrina",
    category: "cycle",
    notes: "Comando principal do ramo não chocável.",
  },
  {
    key: "prepare_rhythm",
    text: "Preparar para ver ritmo",
    category: "pre_cue",
    notes: "Pre-cue temporal 5 segundos antes da checagem de ritmo.",
  },
  {
    key: "analyze_rhythm",
    text: "Verificar ritmo",
    category: "cycle",
    notes: "Checagem de ritmo. Comando crítico.",
  },
  {
    key: "defibrillator_type",
    text: "Escolher tipo de desfibrilador",
    category: "cycle",
    notes: "Etapa operacional antes do primeiro choque.",
  },
  {
    key: "shock_biphasic_initial",
    text: "Aplicar choque bifásico de duzentos joules ou carga máxima",
    category: "cycle",
    notes: "Primeiro choque com desfibrilador bifásico.",
  },
  {
    key: "shock_monophasic_initial",
    text: "Aplicar choque monofásico de trezentos e sessenta joules",
    category: "cycle",
    notes: "Primeiro choque com desfibrilador monofásico.",
  },
  {
    key: "prepare_shock",
    text: "Preparar choque",
    category: "pre_cue",
    notes: "Pre-cue de transição ao entrar na fase de choque.",
  },
  {
    key: "prepare_epinephrine",
    text: "Preparar epinefrina",
    category: "pre_cue",
    notes: "Pre-cue antes da epinefrina.",
  },
  {
    key: "shock_escalated",
    text: "Aplicar novo choque com carga maior ou máxima",
    category: "cycle",
    notes: "Choques subsequentes com escalonamento de carga.",
  },
  {
    key: "epinephrine_now",
    text: "Dar epinefrina, um miligrama",
    category: "medication",
    notes: "Dose de agora. Comando crítico.",
  },
  {
    key: "epinephrine_repeat",
    text: "Repetir epinefrina, um miligrama",
    category: "medication",
    notes: "Repetição da epinefrina.",
  },
  {
    key: "antiarrhythmic_now",
    text: "Dar antiarrítmico. Amiodarona, trezentos miligramas, ou lidocaína, um a um vírgula cinco miligrama por quilo",
    category: "medication",
    notes: "Primeira recomendação de antiarrítmico.",
  },
  {
    key: "antiarrhythmic_repeat",
    text: "Repetir antiarrítmico com metade da dose anterior",
    category: "medication",
    notes: "Repetição de antiarrítmico.",
  },
  {
    key: "consider_airway",
    text: "Considerar via aérea avançada",
    category: "cycle",
    notes: "Lembrete operacional durante reanimação.",
  },
  {
    key: "review_hs_ts",
    text: "Rever causas reversíveis, os Hs e Ts",
    category: "cycle",
    notes: "Reforço de revisão de causas reversíveis.",
  },
  {
    key: "confirm_rosc",
    text: "Confirmar retorno da circulação espontânea",
    category: "post_rosc",
    notes: "Confirmação de retorno da circulação.",
  },
  {
    key: "post_rosc_care",
    text: "Iniciar cuidados pós parada",
    category: "post_rosc",
    notes: "Entrada do pós-parada.",
  },
  {
    key: "post_rosc_hemodynamics",
    text: "Ajustar hemodinâmica com volume e drogas vasoativas",
    category: "post_rosc",
    notes: "Ajuste hemodinâmico operacional.",
  },
  {
    key: "post_rosc_ecg",
    text: "Realizar eletrocardiograma",
    category: "post_rosc",
    notes: "Investigação pós-parada.",
  },
  {
    key: "post_rosc_neuro",
    text: "Avaliar estado neurológico",
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
