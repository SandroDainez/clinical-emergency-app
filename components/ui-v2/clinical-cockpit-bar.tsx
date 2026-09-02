import { StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type CockpitMetric = {
  label: string;
  value: string;
  /** Idade do dado, ex.: "agora" ou "4 min". Dado volátil reutilizado nunca fica sem idade. */
  age?: string;
  /** Procedência exibida ao lado da métrica, ex.: "medido aqui" ou "importado · avc". */
  origin?: string;
  /** Quando verdadeiro, destaca o valor como atenção clínica sem transformá-lo em alerta crítico. */
  attention?: boolean;
};

export type ClinicalCockpitBarProps = {
  protocol: string;
  phase?: string;
  elapsed?: string;
  metrics?: CockpitMetric[];
};

/**
 * Faixa persistente do atendimento.
 *
 * Mostra somente contexto que precisa permanecer visível sem rolar a tela:
 * protocolo, fase, tempo e até quatro métricas resumidas. Não recebe decisões,
 * condutas ou texto explicativo — isso pertence ao corpo do fluxo.
 */
export function ClinicalCockpitBar({
  protocol,
  phase,
  elapsed,
  metrics = [],
}: ClinicalCockpitBarProps) {
  const e = useEstilosDoTema(criarEstilos);
  const visibleMetrics = metrics.slice(0, 4);

  return (
    <View style={e.wrapper} accessibilityRole="summary">
      <View style={e.topRow}>
        <View style={e.titleBlock}>
          <Text style={e.protocol} numberOfLines={1}>{protocol}</Text>
          {phase ? (
            <View style={e.phasePill}>
              <Text style={e.phase} numberOfLines={1}>{phase}</Text>
            </View>
          ) : null}
        </View>
        {elapsed ? (
          <View style={e.elapsedPill} accessibilityLabel={`Tempo de atendimento ${elapsed}`}>
            <Text style={e.elapsedLabel}>TEMPO</Text>
            <Text style={e.elapsed}>{elapsed}</Text>
          </View>
        ) : null}
      </View>

      {visibleMetrics.length ? (
        <View style={e.metricsRow}>
          {visibleMetrics.map((metric) => (
            <View key={`${metric.label}-${metric.value}`} style={e.metric}>
              <View style={e.metricTopRow}>
                <Text style={e.metricLabel}>{metric.label}</Text>
                {metric.age ? (
                  <Text style={e.metricAge}>
                    {metric.age === "agora" ? "agora" : `há ${metric.age}`}
                  </Text>
                ) : null}
              </View>
              <Text style={[e.metricValue, metric.attention && e.metricAttention]}>
                {metric.value}
              </Text>
              {metric.origin ? (
                <Text style={e.metricOrigin} numberOfLines={1}>
                  {metric.origin}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: t.cores.surface,
      borderBottomWidth: 1,
      borderBottomColor: t.cores.border,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      gap: ESPACO.sm,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.md,
    },
    titleBlock: {
      flex: 1,
      minWidth: 0,
      gap: 5,
    },
    protocol: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "900",
      letterSpacing: 0.1,
    },
    phasePill: {
      alignSelf: "flex-start",
      maxWidth: "100%",
      borderRadius: RAIO.pill,
      backgroundColor: t.cores.bg,
      borderWidth: 1,
      borderColor: t.cores.border,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: 3,
    },
    phase: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "700",
    },
    elapsedPill: {
      minWidth: 72,
      alignItems: "flex-end",
      justifyContent: "center",
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderColor: t.cores.primary,
      backgroundColor: t.cores.bg,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.xs,
      gap: 1,
    },
    elapsedLabel: {
      fontSize: 9,
      lineHeight: 11,
      color: t.cores.textSecondary,
      fontWeight: "800",
      letterSpacing: 0.7,
    },
    elapsed: {
      ...TIPOGRAFIA.caption,
      color: t.cores.primary,
      fontWeight: "900",
      fontVariant: ["tabular-nums"],
    },
    metricsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: ESPACO.sm,
    },
    metric: {
      minWidth: 76,
      flexGrow: 1,
      backgroundColor: t.cores.bg,
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderColor: t.cores.border,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.xs,
      gap: 2,
    },
    metricTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.xs,
    },
    metricLabel: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary },
    metricAge: { fontSize: 10, lineHeight: 13, color: t.cores.textSecondary, fontWeight: "600" },
    metricValue: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    metricOrigin: {
      fontSize: 9,
      lineHeight: 12,
      color: t.cores.textSecondary,
      fontWeight: "600",
      letterSpacing: 0.1,
    },
    metricAttention: { color: t.cores.warning },
  });
