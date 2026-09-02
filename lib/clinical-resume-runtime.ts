import { completeClinicalInterruption, peekClinicalInterruption } from "./clinical-interruption-session";
import { recordProtocolResume } from "./clinical-runtime-bridge";

export type ClinicalResumeTarget = {
  moduleSlug: string;
  label?: string;
};

/**
 * Resolve a volta do módulo de interrupção SEM navegar.
 *
 * A função só conclui o frame que está no topo da pilha e cujo destino é o
 * módulo atual. Isso preserva interrupções aninhadas: PCR volta para ISR antes
 * de ISR voltar para AVC.
 */
export function resolveClinicalResume(
  currentModuleSlug: string,
  now: number = Date.now()
): ClinicalResumeTarget | undefined {
  const top = peekClinicalInterruption();
  if (!top || top.toModule !== currentModuleSlug || top.terminal || !top.returnModule) {
    return undefined;
  }

  const completed = completeClinicalInterruption(currentModuleSlug);
  if (!completed?.returnModule) return undefined;

  recordProtocolResume({
    from: currentModuleSlug,
    to: completed.returnModule,
    trigger: completed.trigger,
    now,
  });

  return {
    moduleSlug: completed.returnModule,
    label: completed.returnLabel,
  };
}
