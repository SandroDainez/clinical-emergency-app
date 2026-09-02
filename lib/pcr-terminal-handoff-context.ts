import type { ClinicalHandoffPreservationContract } from "./clinical-handoff-contract";

export type PcrTerminalHandoffSource = "tachycardia" | "bradycardia";

export type PcrTerminalHandoffContextContract = ClinicalHandoffPreservationContract & {
  source: PcrTerminalHandoffSource;
  fromProtocolId: string;
  fromNodeId: string;
  targetModuleId: "pcr-adulto";
  rationale: string;
};

/**
 * Contexto mínimo que deve atravessar a passagem terminal para PCR.
 *
 * O destino recebe um `ClinicalHandoffPayload` genérico; ele não precisa importar
 * nem conhecer a árvore que originou a parada. Estes contratos apenas selecionam
 * quais fatos da origem devem compor esse payload.
 */
export const PCR_TERMINAL_HANDOFF_CONTEXTS: readonly PcrTerminalHandoffContextContract[] = [
  {
    id: "tachy-pulseless-context",
    transitionId: "taquicardia-sem-pulso-pcr-terminal",
    source: "tachycardia",
    fromProtocolId: "acls_tachycardia_2025",
    fromNodeId: "unstable_sem_pulso",
    fromModule: "acls_tachycardia_2025",
    toModule: "pcr-adulto",
    targetModuleId: "pcr-adulto",
    requiredFacts: [
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
    transitionId: "bradicardia-sem-pulso-pcr-terminal",
    source: "bradycardia",
    fromProtocolId: "acls_bradycardia_2025",
    fromNodeId: "bradi_sem_pulso",
    fromModule: "acls_bradycardia_2025",
    toModule: "pcr-adulto",
    targetModuleId: "pcr-adulto",
    requiredFacts: [
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
