import { ALTEPLASE_CANONICAL } from "./alteplase";
import { AMIODARONA_CANONICA } from "./amiodarona";
import { TENECTEPLASE_CANONICAL } from "./tenecteplase";
import type { CanonicalDrug, DrugInstruction, DrugKnowledgeBase } from "./types";

const DRUGS: readonly CanonicalDrug[] = [
  ALTEPLASE_CANONICAL,
  AMIODARONA_CANONICA,
  TENECTEPLASE_CANONICAL,
] as const;

export const DRUG_KNOWLEDGE_BASE: DrugKnowledgeBase = Object.freeze(
  Object.fromEntries(DRUGS.map((drug) => [drug.id, drug]))
);

export function getCanonicalDrug(id: string): CanonicalDrug | undefined {
  return DRUG_KNOWLEDGE_BASE[id];
}

export function findDrugInstruction(
  drugId: string,
  indicationId: string
): DrugInstruction | undefined {
  return getCanonicalDrug(drugId)?.instructions.find(
    (instruction) => instruction.indicationId === indicationId
  );
}

export function listCanonicalDrugs(): CanonicalDrug[] {
  return Object.values(DRUG_KNOWLEDGE_BASE);
}

/**
 * Validação estrutural da base canônica.
 * Não valida a veracidade clínica das doses; isso pertence às travas de paridade
 * específicas de cada fármaco e à governança de evidência.
 */
export function validateDrugKnowledgeBase(): string[] {
  const issues: string[] = [];
  const drugIds = new Set<string>();
  const indicationKeys = new Set<string>();

  for (const drug of DRUGS) {
    if (drugIds.has(drug.id)) issues.push(`drug id duplicado: ${drug.id}`);
    drugIds.add(drug.id);

    for (const instruction of drug.instructions) {
      const key = `${drug.id}:${instruction.indicationId}`;
      if (indicationKeys.has(key)) issues.push(`indicação duplicada: ${key}`);
      indicationKeys.add(key);
      if (!instruction.source.reference || !instruction.source.reviewedAt) {
        issues.push(`${key}: fonte/revisão incompleta`);
      }
    }
  }

  return issues;
}
