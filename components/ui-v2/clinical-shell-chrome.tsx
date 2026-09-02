import { StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { Header } from "./header";
import { ClinicalCockpitBar, type CockpitMetric } from "./clinical-cockpit-bar";
import { CrisisActionBar, type CrisisAction } from "./crisis-action-bar";

export type ClinicalShellReassessmentAlert = {
  id: string;
  title: string;
  signals: string[];
  elapsedLabel: string;
  overdue: boolean;
  pendingCount: number;
};

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
  reassessmentAlert?: ClinicalShellReassessmentAlert;
};

/**
 * Cromado persistente do atendimento clínico.
 *
 * Mantém em um único componente as regiões que devem permanecer estáveis entre
 * protocolos: navegação/identidade, contexto temporal, obrigação de reavaliação,
 * origem de uma interrupção e portas de crise. Não conhece engine nem roteador;
 * recebe dados/callbacks do shell hospedeiro.
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
  reassessmentAlert,
}: ClinicalShellChromeProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View>
      <Header titulo={protocol} etapa={stepLabel} onVoltar={onBack} />
      <ClinicalCockpitBar
        protocol={protocol}
        phase={phase}
        elapsed={elapsed}
        metrics={metrics}
      />

      {returnContext ? (
        <View style={e.returnBanner} accessibilityRole="summary">
          <View style={e.returnTopRow}>
            <Text style={e.returnEyebrow}>INTERCORRÊNCIA · CONTEXTO PRESERVADO</Text>
            <Text style={e.returnStatus}>RETORNAR DEPOIS</Text>
          </View>
          <Text style={e.returnText} numberOfLines={2}>
            Após estabilizar aqui, retomar: <Text style={e.returnTarget}>{returnContext}</Text>
          </Text>
        </View>
      ) : null}

      {reassessmentAlert ? (
        <View
          style={[
            e.reassessmentBanner,
            reassessmentAlert.overdue ? e.reassessmentBannerOverdue : e.reassessmentBannerPending,
          ]}
          accessibilityRole="alert"
        >
          <View style={e.reassessmentTopRow}>
            <Text style={[e.reassessmentEyebrow, reassessmentAlert.overdue && e.reassessmentEyebrowOverdue]}>
              {reassessmentAlert.overdue ? "REAVALIAÇÃO ATRASADA" : "REAVALIAÇÃO PENDENTE"}
            </Text>
            <Text style={e.reassessmentTime}>
              {reassessmentAlert.elapsedLabel === "agora"
                ? "agora"
                : `há ${reassessmentAlert.elapsedLabel}`}
            </Text>
          </View>
          <Text style={e.reassessmentTitle}>{reassessmentAlert.title}</Text>
          {reassessmentAlert.signals.length ? (
            <Text style={e.reassessmentSignals} numberOfLines={reassessmentAlert.overdue ? 2 : 1}>
              Verificar: {reassessmentAlert.signals.join(" · ")}
            </Text>
          ) : null}
          {reassessmentAlert.pendingCount > 1 ? (
            <Text style={[e.reassessmentCount, reassessmentAlert.overdue && e.reassessmentCountOverdue]}>
              + {reassessmentAlert.pendingCount - 1} reavaliação(ões) pendente(s)
            </Text>
          ) : null}
        </View>
      ) : null}

      <CrisisActionBar actions={crisisActions} />
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    returnBanner: {
      marginHorizontal: ESPACO.md,
      marginTop: ESPACO.xs,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.xs,
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderLeftWidth: 3,
      borderColor: t.cores.primary,
      backgroundColor: t.cores.surface,
      gap: 2,
    },
    returnTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    },
    returnEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.primary,
      fontWeight: "800",
      letterSpacing: 0.35,
      flex: 1,
    },
    returnStatus: {
      fontSize: 9,
      lineHeight: 11,
      color: t.cores.textSecondary,
      fontWeight: "800",
      letterSpacing: 0.35,
    },
    returnText: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
    returnTarget: {
      color: t.cores.text,
      fontWeight: "800",
    },
    reassessmentBanner: {
      marginHorizontal: ESPACO.md,
      marginTop: ESPACO.xs,
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderLeftWidth: 4,
      backgroundColor: t.cores.surface,
      gap: 2,
    },
    reassessmentBannerPending: {
      paddingVertical: ESPACO.xs,
      borderColor: t.cores.warning,
    },
    reassessmentBannerOverdue: {
      paddingVertical: ESPACO.sm,
      borderColor: t.cores.critical,
    },
    reassessmentTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    },
    reassessmentEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.warning,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    reassessmentEyebrowOverdue: {
      color: t.cores.critical,
    },
    reassessmentTime: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "700",
    },
    reassessmentTitle: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "800",
    },
    reassessmentSignals: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "600",
    },
    reassessmentCount: {
      ...TIPOGRAFIA.micro,
      color: t.cores.warning,
      fontWeight: "700",
    },
    reassessmentCountOverdue: {
      color: t.cores.critical,
    },
  });
