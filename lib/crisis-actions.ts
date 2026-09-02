export type CrisisActionDefinition = {
  id: "pcr" | "airway" | "ventilation" | "shock" | "bradycardia" | "tachycardia";
  label: string;
  moduleSlug: string;
  critical?: boolean;
};

/**
 * Registro canônico das portas de deterioração disponíveis durante um fluxo.
 *
 * Este arquivo não diagnostica e não muda prioridade clínica por conta própria.
 * Ele apenas centraliza os atalhos que hoje aparecem dispersos em componentes,
 * para que o shell, a barra de crise e o card de estabilização usem a mesma fonte.
 */
export const CRISIS_ACTIONS: readonly CrisisActionDefinition[] = [
  { id: "pcr", label: "PCR", moduleSlug: "pcr-adulto", critical: true },
  { id: "airway", label: "Via aérea", moduleSlug: "isr-rapida" },
  { id: "ventilation", label: "Ventilação", moduleSlug: "ventilacao-mecanica" },
  { id: "shock", label: "Choque", moduleSlug: "drogas-vasoativas" },
  { id: "bradycardia", label: "Bradicardia", moduleSlug: "bradicardia-acls" },
  { id: "tachycardia", label: "Taquicardia", moduleSlug: "taquicardia-acls" },
] as const;

/**
 * Exceções em que oferecer um atalho genérico no topo pode inverter a ordem
 * correta do tratamento do módulo. Preserva as exceções que já existiam no app.
 */
export const CRISIS_ACTIONS_HIDDEN_BY_MODULE: Readonly<Record<string, readonly string[]>> = {
  "pre-eclampsia": ["drogas-vasoativas"],
  "cetoacidose-hiperosmolar": ["drogas-vasoativas"],
};

export function crisisActionsForModule(currentModuleSlug?: string): CrisisActionDefinition[] {
  const hidden = CRISIS_ACTIONS_HIDDEN_BY_MODULE[currentModuleSlug ?? ""] ?? [];
  return CRISIS_ACTIONS.filter(
    (action) => action.moduleSlug !== currentModuleSlug && !hidden.includes(action.moduleSlug)
  );
}
