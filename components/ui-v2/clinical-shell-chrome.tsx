import { View } from "react-native";

import { Header } from "./header";
import { ClinicalCockpitBar, type CockpitMetric } from "./clinical-cockpit-bar";
import { CrisisActionBar, type CrisisAction } from "./crisis-action-bar";

export type ClinicalShellChromeProps = {
  protocol: string;
  phase?: string;
  stepLabel?: string;
  elapsed?: string;
  metrics?: CockpitMetric[];
  onBack?: () => void;
  crisisActions?: CrisisAction[];
};

/**
 * Cromado persistente do atendimento clínico.
 *
 * Mantém em um único componente as três regiões que devem permanecer estáveis
 * entre protocolos: navegação/identidade, contexto temporal e portas de crise.
 * Não conhece engine nem roteador; recebe callbacks do shell hospedeiro.
 */
export function ClinicalShellChrome({
  protocol,
  phase,
  stepLabel,
  elapsed,
  metrics = [],
  onBack,
  crisisActions = [],
}: ClinicalShellChromeProps) {
  return (
    <View>
      <Header
        titulo={protocol}
        etapa={stepLabel}
        onVoltar={onBack}
      />
      <ClinicalCockpitBar
        protocol={protocol}
        phase={phase}
        elapsed={elapsed}
        metrics={metrics}
      />
      <CrisisActionBar actions={crisisActions} />
    </View>
  );
}
