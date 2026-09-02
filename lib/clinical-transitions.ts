export type ClinicalTransitionMode = "returnable" | "terminal";

export type ClinicalTransitionContract = {
  id: string;
  from: string;
  to: string;
  trigger: string;
  mode: ClinicalTransitionMode;
  /** Campos estáveis ou observações que o destino pode receber explicitamente. */
  preserves?: string[];
  /** Rótulo clínico mostrado ao retornar, quando aplicável. */
  returnLabel?: string;
};

/**
 * Contrato de arestas entre módulos.
 *
 * O objetivo é substituir gradualmente navegações improvisadas por transições
 * declaradas e auditáveis. A rota continua sendo responsabilidade do router;
 * este arquivo descreve o significado clínico da passagem.
 */
const registry = new Map<string, ClinicalTransitionContract>();

export function registerClinicalTransition(contract: ClinicalTransitionContract): void {
  if (!contract.id.trim()) throw new Error("Transição clínica sem id");
  if (!contract.from.trim() || !contract.to.trim()) {
    throw new Error(`Transição ${contract.id} sem origem ou destino`);
  }
  if (!contract.trigger.trim()) throw new Error(`Transição ${contract.id} sem gatilho clínico`);
  if (contract.mode === "returnable" && !contract.returnLabel?.trim()) {
    throw new Error(`Transição ${contract.id} retornável sem returnLabel`);
  }
  registry.set(contract.id, { ...contract, preserves: [...(contract.preserves ?? [])] });
}

export function getClinicalTransition(id: string): ClinicalTransitionContract | undefined {
  return registry.get(id);
}

export function listClinicalTransitions(): ClinicalTransitionContract[] {
  return [...registry.values()];
}

export function clearClinicalTransitionRegistry(): void {
  registry.clear();
}
