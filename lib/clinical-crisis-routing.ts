import { crisisActionsForModule } from "./crisis-actions";

export type CrisisRoute = {
  id: string;
  label: string;
  moduleSlug: string;
  href: string;
  critical?: boolean;
};

/**
 * Constrói as rotas das portas de crise preservando o módulo de origem.
 *
 * Continua usando o mecanismo já existente no app (`from_module`) até o
 * Clinical Orchestrator assumir a navegação. Centralizar aqui impede o footer,
 * o card de estabilização e atalhos futuros de montarem URLs diferentes.
 */
export function buildCrisisRoutes(currentModuleSlug?: string): CrisisRoute[] {
  return crisisActionsForModule(currentModuleSlug).map((action) => {
    const query = currentModuleSlug ? `?from_module=${encodeURIComponent(currentModuleSlug)}` : "";
    return {
      id: action.id,
      label: action.label,
      moduleSlug: action.moduleSlug,
      href: `/modulos/${action.moduleSlug}${query}`,
      critical: action.critical,
    };
  });
}
