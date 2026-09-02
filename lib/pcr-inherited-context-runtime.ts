import { consumeClinicalHandoff } from "./clinical-handoff-runtime";
import { buildPcrInheritedContextViewModel, type PcrInheritedContextViewModel } from "./pcr-handoff-context-adapter";
import { PCR_TERMINAL_HANDOFF_CONTEXTS } from "./pcr-terminal-handoff-context";

/**
 * Consome, no máximo uma vez, um handoff terminal destinado ao PCR e devolve
 * somente um view model informativo. Ausência de payload retorna undefined e
 * jamais impede a abertura do algoritmo de parada.
 */
export function consumePcrInheritedContext(): PcrInheritedContextViewModel | undefined {
  for (const contract of PCR_TERMINAL_HANDOFF_CONTEXTS) {
    const payload = consumeClinicalHandoff("pcr-adulto", contract.transitionId);
    if (!payload) continue;
    return buildPcrInheritedContextViewModel({
      payload,
      expectedFacts: contract.requiredFacts,
    });
  }
  return undefined;
}
