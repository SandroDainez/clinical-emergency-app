export type ClinicalHandoffFactValue = string | number | boolean | null;

export type ClinicalHandoffFact = {
  id: string;
  value: ClinicalHandoffFactValue;
  recordedAt: number;
  sourceModule: string;
  label?: string;
};

export type ClinicalHandoffPayload = {
  id: string;
  transitionId: string;
  fromModule: string;
  toModule: string;
  createdAt: number;
  facts: readonly ClinicalHandoffFact[];
};

/**
 * Snapshot clínico mínimo que atravessa uma transição entre módulos.
 *
 * O payload NÃO controla navegação e NÃO é um novo patient state. Ele transporta
 * somente fatos explicitamente selecionados pelo contrato da transição, com
 * origem e timestamp, para que o destino não precise conhecer a árvore que os
 * produziu.
 */
export function createClinicalHandoffPayload(input: {
  id: string;
  transitionId: string;
  fromModule: string;
  toModule: string;
  facts: readonly ClinicalHandoffFact[];
  createdAt?: number;
}): ClinicalHandoffPayload {
  if (!input.id.trim()) throw new Error("Handoff payload sem id");
  if (!input.transitionId.trim()) throw new Error("Handoff payload sem transitionId");
  if (!input.fromModule.trim() || !input.toModule.trim()) {
    throw new Error("Handoff payload sem origem ou destino");
  }

  const seen = new Set<string>();
  for (const fact of input.facts) {
    if (!fact.id.trim()) throw new Error(`Handoff ${input.id} contém fato sem id`);
    if (!fact.sourceModule.trim()) throw new Error(`Fato ${fact.id} sem sourceModule`);
    if (!Number.isFinite(fact.recordedAt) || fact.recordedAt <= 0) {
      throw new Error(`Fato ${fact.id} sem recordedAt válido`);
    }
    if (seen.has(fact.id)) throw new Error(`Handoff ${input.id} contém fato duplicado: ${fact.id}`);
    seen.add(fact.id);
  }

  return {
    id: input.id,
    transitionId: input.transitionId,
    fromModule: input.fromModule,
    toModule: input.toModule,
    createdAt: input.createdAt ?? Date.now(),
    facts: input.facts.map((fact) => ({ ...fact })),
  };
}

export function getClinicalHandoffFact(
  payload: ClinicalHandoffPayload,
  factId: string
): ClinicalHandoffFact | undefined {
  const fact = payload.facts.find((item) => item.id === factId);
  return fact ? { ...fact } : undefined;
}

export function projectClinicalHandoffFacts(
  payload: ClinicalHandoffPayload
): Record<string, ClinicalHandoffFactValue> {
  return Object.fromEntries(payload.facts.map((fact) => [fact.id, fact.value]));
}
