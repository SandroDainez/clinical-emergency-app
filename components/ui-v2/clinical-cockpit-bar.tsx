import { StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type CockpitMetric = {
  label: string;
  value: string;
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
          {phase ? <Text style={e.phase} numberOfLines={1}>{phase}</Text> : null}
        </View>
        {elapsed ? <Text style={e.elapsed}>{elapsed}</Text> : null}
      </View>

      {visibleMetrics.length ? (
        <View style={e.metricsRow}>
          {visibleMetrics.map((metric) => (
            <View key={`${metric.label}-${metric.value}`} style={e.metric}>
              <Text style={e.metricLabel}>{metric.label}</Text>
              <Text style={[e.metricValue, metric.attention && e.metricAttention]}>
                {metric.value}
              </Text>
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
    titleBlock: { flex: 1, minWidth: 0 },
    protocol: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    phase: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, marginTop: 2 },
    elapsed: {
      ...TIPOGRAFIA.caption,
      color: t.cores.primary,
      fontWeight: "800",
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
    },
    metricLabel: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary },
    metricValue: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    metricAttention: { color: t.cores.warning },
  });
