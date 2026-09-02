export type ClinicalCaseInput = {
  field: string;
  value: string | number | boolean;
};

export type ClinicalCaseExpectation = {
  /** Nó/estado que obrigatoriamente deve aparecer no caminho. */
  mustVisit?: readonly string[];
  /** Nó/estado que não pode ser alcançado neste cenário. */
  mustNotVisit?: readonly string[];
  /** Destino final esperado quando o caso pretende chegar até disposição. */
  disposition?: string;
  /** Ações críticas que não podem ser omitidas. */
  requiredActions?: readonly string[];
};

export type ClinicalSafetyCase = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  inputs: readonly ClinicalCaseInput[];
  expectation: ClinicalCaseExpectation;
  /** Fonte clínica usada para justificar a expectativa do teste. */
  evidence?: string;
};

export function validateClinicalSafetyCase(testCase: ClinicalSafetyCase): string[] {
  const issues: string[] = [];
  if (!testCase.id.trim()) issues.push("caso sem id");
  if (!testCase.moduleId.trim()) issues.push(`${testCase.id}: moduleId ausente`);
  if (!testCase.title.trim()) issues.push(`${testCase.id}: título ausente`);
  if (!testCase.description.trim()) issues.push(`${testCase.id}: descrição ausente`);

  const expectation = testCase.expectation;
  const hasExpectation = Boolean(
    expectation.disposition ||
      expectation.mustVisit?.length ||
      expectation.mustNotVisit?.length ||
      expectation.requiredActions?.length
  );
  if (!hasExpectation) issues.push(`${testCase.id}: caso não testa nenhum resultado`);
  return issues;
}
