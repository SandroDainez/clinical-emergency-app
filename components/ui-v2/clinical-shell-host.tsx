import { useEffect, useRef, useState } from "react";
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

function formatUiElapsed(startedAt: number, now: number): string {
  const totalSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}:${String(remainder).padStart(2, "0")}`;
}

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
  const startedAtRef = useRef(Date.now());
  const [now, setNow] = useState(() => Date.now());

  // Piloto visual da Superfície A do AVC: o cronômetro mede somente o tempo
  // desde que este shell foi aberto. Ele NÃO participa de janela terapêutica,
  // elegibilidade, deadline ou qualquer derivação clínica. Mantemos o piloto
  // restrito ao AVC para não mudar silenciosamente os demais módulos enquanto
  // a nova superfície ainda está sendo validada.
  useEffect(() => {
    startedAtRef.current = Date.now();
    setNow(startedAtRef.current);
    if (moduleSlug !== "avc" || elapsed) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [moduleSlug, elapsed]);

  const pilotElapsed = moduleSlug === "avc" && !elapsed
    ? formatUiElapsed(startedAtRef.current, now)
    : undefined;

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
      elapsed={elapsed ?? pilotElapsed}
      metrics={snapshot.metrics}
      returnContext={snapshot.returnContext}
      reassessmentAlert={snapshot.reassessmentAlert}
      onBack={onBack}
      crisisActions={crisisActions}
    />
  );
}
