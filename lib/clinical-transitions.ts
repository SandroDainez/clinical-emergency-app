export type ClinicalTransitionMode = "returnable" | "terminal";
export type ClinicalTransitionDestinationKind = "module" | "external_service";

export type ClinicalTransitionContract = {
  id: string;
  from: string;
  /** Module slug quando destinationKind=module; chave estável do serviço quando external_service. */
  to: string;
  trigger: string;
  mode: ClinicalTransitionMode;
  destinationKind?: ClinicalTransitionDestinationKind;
  /** Nome clínico legível do destino externo, quando não existe módulo do app. */
  externalLabel?: string;
  /** Campos estáveis ou observações que o destino pode receber explicitamente. */
  preserves?: string[];
  /** Rótulo clínico mostrado ao retornar, quando aplicável. */
  returnLabel?: string;
};

/**
 * Contrato de arestas clínicas.
 *
 * A passagem pode apontar para outro módulo do app ou para um serviço externo
 * definitivo (por exemplo centro cirúrgico/hemodinâmica). O router continua
 * responsável pela navegação; este contrato descreve o significado clínico.
 */
const registry = new Map<string, ClinicalTransitionContract>();

export function registerClinicalTransition(contract: ClinicalTransitionContract): void {
  if (!contract.id.trim()) throw new Error("Transição clínica sem id");
  if (!contract.from.trim() || !contract.to.trim()) {
    throw new Error(`Transição ${contract.id} sem origem ou destino`);
  }
  if (!contract.trigger.trim()) throw new Error(`Transição ${contract.id} sem gatilho clínico`);

  const destinationKind = contract.destinationKind ?? "module";

  if (contract.mode === "returnable" && !contract.returnLabel?.trim()) {
    throw new Error(`Transição ${contract.id} retornável sem returnLabel`);
  }
  if (contract.mode === "terminal" && contract.returnLabel?.trim()) {
    throw new Error(`Transição ${contract.id} terminal não deve declarar retorno`);
  }
  if (destinationKind === "external_service" && !contract.externalLabel?.trim()) {
    throw new Error(`Transição ${contract.id} para serviço externo sem externalLabel`);
  }
  if (destinationKind === "external_service" && contract.mode !== "terminal") {
    throw new Error(`Transição ${contract.id} para serviço externo deve ser terminal neste contrato`);
  }

  registry.set(contract.id, {
    ...contract,
    destinationKind,
    preserves: [...(contract.preserves ?? [])],
  });
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
