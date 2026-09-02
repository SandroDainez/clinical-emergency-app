import type { ClinicalTransition } from "./clinical-transitions";

export type ClinicalInterruptionFrame = {
  id: string;
  fromModule: string;
  toModule: string;
  trigger: string;
  returnTo?: string;
  terminal: boolean;
  startedAt: number;
};

/**
 * Pilha de interrupções clínicas do atendimento atual.
 *
 * Exemplo legítimo:
 * AVC -> ISR -> PCR -> ROSC -> ISR -> AVC.
 *
 * O mecanismo antigo de `from_module` continua existindo durante a migração.
 * Esta pilha apenas formaliza a relação de retorno para que interrupções
 * aninhadas não dependam da história do roteador.
 */
const stack: ClinicalInterruptionFrame[] = [];

export function beginClinicalInterruption(
  transition: ClinicalTransition,
  now: number = Date.now()
): ClinicalInterruptionFrame {
  const frame: ClinicalInterruptionFrame = {
    id: `${transition.from}:${transition.to}:${now}:${stack.length}`,
    fromModule: transition.from,
    toModule: transition.to,
    trigger: transition.trigger,
    returnTo: transition.returnTo,
    terminal: transition.terminal,
    startedAt: now,
  };
  stack.push(frame);
  return { ...frame };
}

export function peekClinicalInterruption(): ClinicalInterruptionFrame | undefined {
  const frame = stack[stack.length - 1];
  return frame ? { ...frame } : undefined;
}

export function completeClinicalInterruption(
  currentModule: string
): ClinicalInterruptionFrame | undefined {
  const frame = stack[stack.length - 1];
  if (!frame || frame.toModule !== currentModule) return undefined;
  stack.pop();
  return { ...frame };
}

export function listClinicalInterruptions(): ClinicalInterruptionFrame[] {
  return stack.map((frame) => ({ ...frame }));
}

export function clearClinicalInterruptions(): void {
  stack.length = 0;
}
