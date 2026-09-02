import { crisisActionsForModule } from "./crisis-actions";
import { beginClinicalInterruption } from "./clinical-interruption-session";
import { recordProtocolTransition } from "./clinical-runtime-bridge";
import type { ClinicalTransitionContract } from "./clinical-transitions";

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

/**
 * Instrumenta uma porta de crise SEM navegar.
 *
 * O caller continua responsável por `router.push(route.href)`, portanto o
 * mecanismo legado permanece exatamente o mesmo. Esta função apenas espelha a
 * passagem no Clinical Orchestrator novo: empilha a interrupção e grava o evento
 * temporal correspondente.
 *
 * Sem origem não há protocolo para retomar, então a rota continua válida mas
 * não cria frame de interrupção.
 */
export function instrumentCrisisRoute(
  route: CrisisRoute,
  currentModuleSlug?: string,
  now: number = Date.now()
): void {
  if (!currentModuleSlug) return;

  const transition: ClinicalTransitionContract = {
    id: `crisis:${currentModuleSlug}:${route.moduleSlug}`,
    from: currentModuleSlug,
    to: route.moduleSlug,
    trigger: `porta de crise: ${route.label}`,
    mode: "returnable",
    returnLabel: `Retornar a ${currentModuleSlug}`,
  };

  beginClinicalInterruption(transition, now);
  recordProtocolTransition({
    from: currentModuleSlug,
    to: route.moduleSlug,
    trigger: transition.trigger,
    now,
  });
}
