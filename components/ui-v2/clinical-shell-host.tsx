import { useEffect, useRef, useState } from "react";
import type { Href } from "expo-router";

import { buildClinicalShellSnapshot } from "../../lib/clinical-shell-adapter";
import { buildCrisisRoutes, instrumentCrisisRoute } from "../../lib/clinical-crisis-routing";
import { resolveClinicalResume } from "../../lib/clinical-resume-runtime";
import { recordProtocolStarted } from "../../lib/clinical-runtime-bridge";
import { MODULES_HUB_HREF } from "../../lib/modules-hub-route";
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
 * O corpo do passo já exibe `step.title`. O cockpit só deve repetir uma fase
 * quando ela acrescenta contexto diferente do título do card; caso contrário,
 * a mesma frase aparece duas vezes em sequência e compete com a ação clínica.
 *
 * No piloto do AVC existem alguns rótulos complementares deliberados. Fora
 * deles, devolvemos string vazia para manter uma única hierarquia visual.
 */
function presentationPhase(moduleSlug: string | undefined, phase: string | undefined): string {
  const base = phase ?? "";
  if (!base || moduleSlug !== "avc") return "";

  // Superfície A do AVC: estes rótulos são somente uma tradução visual dos
  // títulos que já existem na árvore. Não criam dados, não classificam janela,
  // não mudam transição e não promovem nenhuma opção clínica.
  if (base.startsWith("Reconhecimento — suspeita de AVC")) {
    return "Reconhecimento inicial · FAST / Código AVC";
  }
  if (base.startsWith("Tempo desde o início")) {
    return "Último momento visto bem (LKW)";
  }
  if (base.startsWith("TC de crânio SEM contraste")) {
    return "Neuroimagem urgente · TC sem contraste";
  }
  if (base.startsWith("Resultado da TC de crânio")) {
    return "Classificar pela neuroimagem";
  }

  return "";
}

/**
 * Host de integração entre o shell legado e o novo cromado clínico.
 *
 * Mantém toda a composição fora do `acls-decision-flow-screen.tsx`: o shell
 * hospedeiro passa somente identidade, etapa e callbacks de navegação. O host
 * lê observações/interrupções/reavaliações pelo adapter, cria portas de crise,
 * registra o primeiro ingresso no protocolo pela Event Log bridge e instrumenta
 * a passagem antes de delegar ao router existente.
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

  useEffect(() => {
    if (!moduleSlug) return;
    recordProtocolStarted({ module: moduleSlug, label: protocol });
  }, [moduleSlug, protocol]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    setNow(startedAtRef.current);

    const needsSecondTick = moduleSlug === "avc" && !elapsed;
    const intervalMs = needsSecondTick ? 1000 : 60_000;
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [moduleSlug, elapsed]);

  const pilotElapsed = moduleSlug === "avc" && !elapsed
    ? formatUiElapsed(startedAtRef.current, now)
    : undefined;

  const snapshot = buildClinicalShellSnapshot({
    protocol,
    phase: presentationPhase(moduleSlug, phase),
    step,
    moduleSlug,
    now,
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

  const returnToContext = snapshot.returnContext && moduleSlug
    ? () => {
        const target = resolveClinicalResume(moduleSlug);
        if (target) onPush(`/modulos/${target.moduleSlug}` as Href);
      }
    : undefined;

  return (
    <ClinicalShellChrome
      protocol={snapshot.protocol}
      phase={snapshot.phase}
      stepLabel={`Passo ${snapshot.step}`}
      elapsed={elapsed ?? pilotElapsed}
      metrics={snapshot.metrics}
      returnContext={snapshot.returnContext}
      onReturnToContext={returnToContext}
      reassessmentAlert={snapshot.reassessmentAlert}
      onBack={onBack}
      onExit={() => onPush(MODULES_HUB_HREF as Href)}
      crisisActions={crisisActions}
    />
  );
}
