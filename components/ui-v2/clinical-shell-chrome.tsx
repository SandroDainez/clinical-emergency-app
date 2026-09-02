import { StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
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
  /** Contexto clínico interrompido, ex.: "AVC em andamento". */
  returnContext?: string;
};

/**
 * Cromado persistente do atendimento clínico.
 *
 * Mantém em um único componente as regiões que devem permanecer estáveis entre
 * protocolos: navegação/identidade, contexto temporal, origem de uma interrupção
 * e portas de crise. Não conhece engine nem roteador; recebe dados/callbacks do
 * shell hospedeiro.
 */
export function ClinicalShellChrome({
  protocol,
  phase,
  stepLabel,
  elapsed,
  metrics = [],
  onBack,
  crisisActions = [],
  returnContext,
}: ClinicalShellChromeProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View>
      <Header titulo={protocol} etapa={stepLabel} onVoltar={onBack} />
      {returnContext ? (
        <View style={e.returnBanner} accessibilityRole="summary">
          <Text style={e.returnEyebrow}>ATENDIMENTO INTERROMPIDO</Text>
          <Text style={e.returnText} numberOfLines={2}>
            Após estabilizar aqui, retomar: {returnContext}
          </Text>
        </View>
      ) : null}
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

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    returnBanner: {
      marginHorizontal: ESPACO.md,
      marginTop: ESPACO.sm,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderColor: t.cores.primary,
      backgroundColor: t.cores.surface,
      gap: 2,
    },
    returnEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.primary,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    returnText: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "700",
    },
  });
