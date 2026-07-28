// Pre-recorded ElevenLabs audio files — ACLS module.
// Each key maps to the require() of the corresponding MP3 in assets/audio/final-acls/.
// Used by audio-session.ts for both web (HTMLAudioElement) and native (expo-av).
// 26 files active — full coverage of all ACLS SPEAK events.

const WEB_AUDIO_CUES: Record<string, number> = {
  // ── Recognition ──────────────────────────────────────────────────────────────
  initial_recognition:      require("../assets/audio/final-acls/initial_recognition.mp3"),
  assess_patient:           require("../assets/audio/final-acls/assess_patient.mp3"),
  pulse_present_monitoring: require("../assets/audio/final-acls/pulse_present_monitoring.mp3"),

  // ── CPR cycles ───────────────────────────────────────────────────────────────
  start_cpr:                require("../assets/audio/final-acls/start_cpr.mp3"),
  resume_cpr:               require("../assets/audio/final-acls/resume_cpr.mp3"),
  start_cpr_nonshockable:   require("../assets/audio/final-acls/start_cpr_nonshockable.mp3"),

  // ── Pre-cues (fired ~10 s before the main event) ─────────────────────────────
  prepare_rhythm:           require("../assets/audio/final-acls/prepare_rhythm.mp3"),
  prepare_shock:            require("../assets/audio/final-acls/prepare_shock.mp3"),
  prepare_epinephrine:      require("../assets/audio/final-acls/prepare_epinephrine.mp3"),

  // ── Rhythm & defibrillator ───────────────────────────────────────────────────
  analyze_rhythm:           require("../assets/audio/final-acls/analyze_rhythm.mp3"),
  defibrillator_type:       require("../assets/audio/final-acls/defibrillator_type.mp3"),
  shock_biphasic_initial:   require("../assets/audio/final-acls/shock_biphasic_initial.mp3"),
  shock_monophasic_initial: require("../assets/audio/final-acls/shock_monophasic_initial.mp3"),
  shock_escalated:          require("../assets/audio/final-acls/shock_escalated.mp3"),

  // ── Medications ──────────────────────────────────────────────────────────────
  epinephrine_now:          require("../assets/audio/final-acls/epinephrine_now.mp3"),
  epinephrine_repeat:       require("../assets/audio/final-acls/epinephrine_repeat.mp3"),
  antiarrhythmic_now:       require("../assets/audio/final-acls/antiarrhythmic_now.mp3"),
  antiarrhythmic_repeat:    require("../assets/audio/final-acls/antiarrhythmic_repeat.mp3"),

  // ── Reversible causes & airway ───────────────────────────────────────────────
  consider_airway:          require("../assets/audio/final-acls/consider_airway.mp3"),
  review_hs_ts:             require("../assets/audio/final-acls/review_hs_ts.mp3"),

  // ── ROSC & post-cardiac-arrest care ─────────────────────────────────────────
  confirm_rosc:             require("../assets/audio/final-acls/confirm_rosc.mp3"),
  post_rosc_care:           require("../assets/audio/final-acls/post_rosc_care.mp3"),
  post_rosc_hemodynamics:   require("../assets/audio/final-acls/post_rosc_hemodynamics.mp3"),
  post_rosc_ecg:            require("../assets/audio/final-acls/post_rosc_ecg.mp3"),
  post_rosc_neuro:          require("../assets/audio/final-acls/post_rosc_neuro.mp3"),

  // ── End ──────────────────────────────────────────────────────────────────────
  end_protocol:             require("../assets/audio/final-acls/end_protocol.mp3"),

  // ── Ciclo / via aérea (novos) ────────────────────────────────────────────────
  switch_compressor:        require("../assets/audio/final-acls/switch_compressor.mp3"),
  advanced_airway_confirmed: require("../assets/audio/final-acls/advanced_airway_confirmed.mp3"),
  medication_given_keep_cpr: require("../assets/audio/final-acls/medication_given_keep_cpr.mp3"),
  rearrest:                 require("../assets/audio/final-acls/rearrest.mp3"),
};

// ── Áudios por idioma ─────────────────────────────────────────────────────────
// Conjunto es-419 — 26 MP3 gravados (espanhol latino-americano) em
// assets/audio/final-acls-es/. Mesmas chaves/cueIds da versão PT.
const WEB_AUDIO_CUES_ES: Record<string, number> = {
  // ── Recognition ──────────────────────────────────────────────────────────────
  initial_recognition:      require("../assets/audio/final-acls-es/initial_recognition.mp3"),
  assess_patient:           require("../assets/audio/final-acls-es/assess_patient.mp3"),
  pulse_present_monitoring: require("../assets/audio/final-acls-es/pulse_present_monitoring.mp3"),

  // ── CPR cycles ───────────────────────────────────────────────────────────────
  start_cpr:                require("../assets/audio/final-acls-es/start_cpr.mp3"),
  resume_cpr:               require("../assets/audio/final-acls-es/resume_cpr.mp3"),
  start_cpr_nonshockable:   require("../assets/audio/final-acls-es/start_cpr_nonshockable.mp3"),

  // ── Pre-cues ─────────────────────────────────────────────────────────────────
  prepare_rhythm:           require("../assets/audio/final-acls-es/prepare_rhythm.mp3"),
  prepare_shock:            require("../assets/audio/final-acls-es/prepare_shock.mp3"),
  prepare_epinephrine:      require("../assets/audio/final-acls-es/prepare_epinephrine.mp3"),

  // ── Rhythm & defibrillator ───────────────────────────────────────────────────
  analyze_rhythm:           require("../assets/audio/final-acls-es/analyze_rhythm.mp3"),
  defibrillator_type:       require("../assets/audio/final-acls-es/defibrillator_type.mp3"),
  shock_biphasic_initial:   require("../assets/audio/final-acls-es/shock_biphasic_initial.mp3"),
  shock_monophasic_initial: require("../assets/audio/final-acls-es/shock_monophasic_initial.mp3"),
  shock_escalated:          require("../assets/audio/final-acls-es/shock_escalated.mp3"),

  // ── Medications ──────────────────────────────────────────────────────────────
  epinephrine_now:          require("../assets/audio/final-acls-es/epinephrine_now.mp3"),
  epinephrine_repeat:       require("../assets/audio/final-acls-es/epinephrine_repeat.mp3"),
  antiarrhythmic_now:       require("../assets/audio/final-acls-es/antiarrhythmic_now.mp3"),
  antiarrhythmic_repeat:    require("../assets/audio/final-acls-es/antiarrhythmic_repeat.mp3"),

  // ── Reversible causes & airway ───────────────────────────────────────────────
  consider_airway:          require("../assets/audio/final-acls-es/consider_airway.mp3"),
  review_hs_ts:             require("../assets/audio/final-acls-es/review_hs_ts.mp3"),

  // ── ROSC & post-cardiac-arrest care ─────────────────────────────────────────
  confirm_rosc:             require("../assets/audio/final-acls-es/confirm_rosc.mp3"),
  post_rosc_care:           require("../assets/audio/final-acls-es/post_rosc_care.mp3"),
  post_rosc_hemodynamics:   require("../assets/audio/final-acls-es/post_rosc_hemodynamics.mp3"),
  post_rosc_ecg:            require("../assets/audio/final-acls-es/post_rosc_ecg.mp3"),
  post_rosc_neuro:          require("../assets/audio/final-acls-es/post_rosc_neuro.mp3"),

  // ── End ──────────────────────────────────────────────────────────────────────
  end_protocol:             require("../assets/audio/final-acls-es/end_protocol.mp3"),

  // ── Ciclo / via aérea (novos) ────────────────────────────────────────────────
  switch_compressor:        require("../assets/audio/final-acls-es/switch_compressor.mp3"),
  advanced_airway_confirmed: require("../assets/audio/final-acls-es/advanced_airway_confirmed.mp3"),
  medication_given_keep_cpr: require("../assets/audio/final-acls-es/medication_given_keep_cpr.mp3"),
  rearrest:                 require("../assets/audio/final-acls-es/rearrest.mp3"),
};

const WEB_AUDIO_CUES_BY_LOCALE: Record<string, Record<string, number>> = {
  "pt-BR": WEB_AUDIO_CUES,
  "es-419": WEB_AUDIO_CUES_ES,
};

export { WEB_AUDIO_CUES, WEB_AUDIO_CUES_ES, WEB_AUDIO_CUES_BY_LOCALE };
