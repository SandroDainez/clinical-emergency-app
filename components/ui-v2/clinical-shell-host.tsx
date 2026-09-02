import type { Href } from "expo-router";

import { buildClinicalShellSnapshot } from "../../lib/clinical-shell-adapter";
import { buildCrisisRoutes, instrumentCrisisRoute } from "../../lib/clinical-crisis-routing";
import { ClinicalShellChrome } from "./clinical-shell-chrome";

export type ClinicalShellHostProps = {
  protocol: string;
  phase?: string;
  step: number;
  moduleSlug?: string;
  elapsed?: string;
  onBack: () => void;
  onPush: (href: Href) => void;
};

/**
 * Host de integração entre o shell legado e o novo cromado clínico.
 *
 * Mantém toda a composição fora do `acls-decision-flow-screen.tsx`: o shell
 * hospedeiro passa somente identidade, etapa e callbacks de navegação. O host
 * lê observações/interrupções/reavaliações pelo adapter, cria portas de crise
 * pela fonte canônica e instrumenta a passagem antes de delegar ao router
 * existente.
 *
 * Não conhece DecisionTreeEngine e não altera fluxo clínico.
 */
export function ClinicalShellHost({
  protocol,
  phase,
  step,
  moduleSlug,
  elapsed,
  onBack,
  onPush,
}: ClinicalShellHostProps) {
  const snapshot = buildClinicalShellSnapshot({
    protocol,
    phase: phase ?? "",
    step,
    moduleSlug,
  });

  const crisisActions = buildCrisisRoutes(moduleSlug).map((route) => ({
    id: route.id,
    label: route.label,
    critical: route.critical,
    onPress: () => {
      instrumentCrisisRoute(route, moduleSlug);
      onPush(route.href as Href);
    },
  }));

  return (
    <ClinicalShellChrome
      protocol={snapshot.protocol}
      phase={snapshot.phase}
      stepLabel={`Passo ${snapshot.step}`}
      elapsed={elapsed}
      metrics={snapshot.metrics}
      returnContext={snapshot.returnContext}
      reassessmentAlert={snapshot.reassessmentAlert}
      onBack={onBack}
      crisisActions={crisisActions}
    />
  );
}
