export type PcrTerminalHandoffSource = "tachycardia" | "bradycardia";

export type PcrTerminalHandoffContextContract = {
  id: string;
  source: PcrTerminalHandoffSource;
  fromProtocolId: string;
  fromNodeId: string;
  targetModuleId: "pcr-adulto";
  preserves: readonly string[];
  rationale: string;
};

/**
 * Contexto mínimo que deve atravessar a passagem terminal para PCR.
 *
 * Este contrato é declarativo e ainda não altera navegação. Ele existe para
 * impedir que a futura promoção dos targets abra o algoritmo de parada como um
 * caso novo, apagando intervenções e achados imediatamente anteriores à perda
 * do pulso.
 */
export const PCR_TERMINAL_HANDOFF_CONTEXTS: readonly PcrTerminalHandoffContextContract[] = [
  {
    id: "tachy-pulseless-context",
    source: "tachycardia",
    fromProtocolId: "acls_tachycardia_2025",
    fromNodeId: "unstable_sem_pulso",
    targetModuleId: "pcr-adulto",
    preserves: [
      "ritmo_pre_parada",
      "energia_ultima_cardioversao",
      "numero_cardioversoes",
      "antiarritmico_em_curso",
      "tempo_perda_pulso",
      "suspeita_causa_reversivel",
    ],
    rationale:
      "A PCR sucede uma taquiarritmia tratada; ritmo, choques sincronizados e antiarrítmico imediatamente prévios mudam a leitura do evento e não podem desaparecer ao abrir o algoritmo de parada.",
  },
  {
    id: "brady-pulseless-context",
    source: "bradycardia",
    fromProtocolId: "acls_bradycardia_2025",
    fromNodeId: "bradi_sem_pulso",
    targetModuleId: "pcr-adulto",
    preserves: [
      "ritmo_pre_parada",
      "atropina_administrada",
      "marcapasso_em_uso",
      "captura_marcapasso",
      "cronotropico_em_curso",
      "tempo_perda_pulso",
      "suspeita_causa_reversivel",
    ],
    rationale:
      "A PCR sucede bradicardia grave; atropina, estimulação, captura e infusão cronotrópica são contexto essencial para não reiniciar o raciocínio como se nada tivesse ocorrido antes da parada.",
  },
] as const;
