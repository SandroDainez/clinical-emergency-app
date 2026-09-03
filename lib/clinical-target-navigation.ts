import {
  prepareRegisteredTargetHandoff,
  type ClinicalTargetHandoffAttempt,
} from "./clinical-target-handoff-runtime";

export type ClinicalTargetNavigationInput = {
  /** Slug de origem usado apenas para proveniência/retorno na rota. */
  fromModuleId?: string;
  targetModuleId: string;
  handoff?: {
    fromProtocolId: string;
    fromNodeId: string;
    targetModuleId: string;
  };
};

export type ClinicalTargetNavigationResult = {
  navigated: boolean;
  href?: string;
  handoffAttempt?: ClinicalTargetHandoffAttempt;
};

export function buildClinicalTargetHref(input: {
  targetModuleId: string;
  fromModuleId?: string;
}): string {
  const base = `/modulos/${input.targetModuleId}`;
  return input.fromModuleId
    ? `${base}?from_module=${encodeURIComponent(input.fromModuleId)}`
    : base;
}

/**
 * Executor canônico dos targets do shell de árvores.
 *
 * A tela não deve montar query string nem decidir se um handoff registrado está
 * pronto. O runtime de handoff continua sendo a fonte de prontidão; este módulo
 * apenas compõe essa checagem com a navegação final e preserva o comportamento
 * legado para targets sem contrato registrado.
 */
export function executeClinicalTargetNavigation(
  input: ClinicalTargetNavigationInput,
  navigate: (href: string) => void
): ClinicalTargetNavigationResult {
  const handoffAttempt = input.handoff
    ? prepareRegisteredTargetHandoff({
        fromProtocolId: input.handoff.fromProtocolId,
        fromNodeId: input.handoff.fromNodeId,
        targetModuleId: input.handoff.targetModuleId,
      })
    : undefined;

  if (handoffAttempt && !handoffAttempt.canProceedToDestination) {
    return { navigated: false, handoffAttempt };
  }

  const href = buildClinicalTargetHref({
    targetModuleId: input.targetModuleId,
    fromModuleId: input.fromModuleId,
  });
  navigate(href);
  return { navigated: true, href, handoffAttempt };
}
