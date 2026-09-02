import { consumeClinicalHandoff } from "./clinical-handoff-runtime";
import { buildPcrInheritedContextViewModel, type PcrInheritedContextViewModel } from "./pcr-handoff-context-adapter";
import { PCR_TERMINAL_HANDOFF_CONTEXTS } from "./pcr-terminal-handoff-context";

/**
 * Consome, no máximo uma vez, um handoff terminal destinado ao PCR e devolve
 * somente um view model informativo. Ausência de payload retorna undefined e
 * jamais impede a abertura do algoritmo de parada.
 *
 * `expectedFacts` inclui obrigatórios + opcionais porque "opcional para permitir
 * a transferência" NÃO significa "dispensável na apresentação". Se um fato
 * preservável não foi registrado, o card deve mostrá-lo como "Não registrado"
 * em vez de simplesmente apagá-lo.
 */
export function consumePcrInheritedContext(): PcrInheritedContextViewModel | undefined {
  for (const contract of PCR_TERMINAL_HANDOFF_CONTEXTS) {
    const payload = consumeClinicalHandoff("pcr-adulto", contract.transitionId);
    if (!payload) continue;
    const expectedFacts = [
      ...contract.requiredFacts,
      ...(contract.optionalFacts ?? []).filter((id) => !contract.requiredFacts.includes(id)),
    ];
    return buildPcrInheritedContextViewModel({
      payload,
      expectedFacts,
    });
  }
  return undefined;
}
