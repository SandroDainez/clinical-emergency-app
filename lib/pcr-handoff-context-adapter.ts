import type { ClinicalHandoffPayload } from "./clinical-handoff-payload";

export type PcrInheritedContextItem = {
  id: string;
  label: string;
  value: string;
  recordedAt?: number;
  missing: boolean;
};

export type PcrInheritedContextViewModel = {
  title: "Contexto imediatamente antes da PCR";
  sourceLabel: string;
  items: readonly PcrInheritedContextItem[];
};

const LABELS: Record<string, string> = {
  ritmo_pre_parada: "Ritmo pré-parada",
  energia_ultima_cardioversao: "Última cardioversão",
  numero_cardioversoes: "Cardioversões realizadas",
  antiarritmico_em_curso: "Antiarrítmico em curso",
  atropina_administrada: "Atropina administrada",
  marcapasso_em_uso: "Marcapasso em uso",
  captura_marcapasso: "Captura do marcapasso",
  cronotropico_em_curso: "Cronotrópico em curso",
  tempo_perda_pulso: "Perda do pulso",
  suspeita_causa_reversivel: "Causa reversível suspeita",
};

function formatValue(value: string | number | boolean | null): string {
  if (value === null) return "Não registrado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value);
}

function sourceLabel(fromModule: string): string {
  if (fromModule === "acls_tachycardia_2025") return "Taquicardia ACLS";
  if (fromModule === "acls_bradycardia_2025") return "Bradicardia ACLS";
  return fromModule;
}

/**
 * Converte o payload herdado em apresentação. Não toma decisão, não altera
 * algoritmo de PCR e não transforma ausência de dado em valor presumido.
 */
export function buildPcrInheritedContextViewModel(input: {
  payload?: ClinicalHandoffPayload;
  expectedFacts?: readonly string[];
}): PcrInheritedContextViewModel | undefined {
  if (!input.payload) return undefined;

  const byId = new Map(input.payload.facts.map((fact) => [fact.id, fact] as const));
  const factIds = input.expectedFacts?.length
    ? [...input.expectedFacts]
    : input.payload.facts.map((fact) => fact.id);

  return {
    title: "Contexto imediatamente antes da PCR",
    sourceLabel: sourceLabel(input.payload.fromModule),
    items: factIds.map((id) => {
      const fact = byId.get(id);
      return {
        id,
        label: LABELS[id] ?? id,
        value: fact ? formatValue(fact.value) : "Não registrado",
        recordedAt: fact?.recordedAt,
        missing: !fact,
      };
    }),
  };
}
