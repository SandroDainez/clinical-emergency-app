import type { ClinicalHandoffPreservationContract } from "./clinical-handoff-contract";
import { handoffPreservationFromTransition } from "./clinical-transition-handoff-adapter";

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
 * Os fatos são derivados de `ClinicalTransitionContract.preserves[]`, que é a
 * fonte de verdade da aresta clínica. Assim o contrato de handoff não mantém
 * uma segunda lista capaz de divergir silenciosamente.
 *
 * A ausência de parte desse contexto NUNCA pode atrasar a entrada no algoritmo
 * de parada. Por isso ambos os contratos usam `do_not_delay_destination`:
 * o déficit permanece explícito para auditoria, mas compressões/PCR têm prioridade.
 */
export const PCR_TERMINAL_HANDOFF_CONTEXTS: readonly PcrTerminalHandoffContextContract[] = [
  {
    ...handoffPreservationFromTransition({
      id: "tachy-pulseless-context",
      transitionId: "taquicardia-sem-pulso-pcr-terminal",
      transferPolicy: "do_not_delay_destination",
    }),
    source: "tachycardia",
    fromProtocolId: "acls_tachycardia_2025",
    fromNodeId: "unstable_sem_pulso",
    targetModuleId: "pcr-adulto",
    rationale:
      "A PCR sucede uma taquiarritmia tratada; ritmo, choques sincronizados e antiarrítmico imediatamente prévios mudam a leitura do evento e não podem desaparecer ao abrir o algoritmo de parada.",
  },
  {
    ...handoffPreservationFromTransition({
      id: "brady-pulseless-context",
      transitionId: "bradicardia-sem-pulso-pcr-terminal",
      transferPolicy: "do_not_delay_destination",
    }),
    source: "bradycardia",
    fromProtocolId: "acls_bradycardia_2025",
    fromNodeId: "bradi_sem_pulso",
    targetModuleId: "pcr-adulto",
    rationale:
      "A PCR sucede bradicardia grave; atropina, estimulação, captura e infusão cronotrópica são contexto essencial para não reiniciar o raciocínio como se nada tivesse ocorrido antes da parada.",
  },
] as const;
