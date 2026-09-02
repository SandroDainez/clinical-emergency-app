import { StyleSheet, Text, View } from "react-native";

import { ESPACO, TIPOGRAFIA } from "../../design-system/tokens";
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
  /** Mantido no contrato para compatibilidade do shell; o Header já exibe o protocolo. */
  protocol: string;
  phase?: string;
  elapsed?: string;
  metrics?: CockpitMetric[];
};

/**
 * Faixa persistente do atendimento.
 *
 * O Header já é a fonte visual de identidade do protocolo. Esta faixa mostra
 * apenas o contexto complementar que precisa permanecer visível sem rolar a
 * tela: fase, tempo e até quatro métricas resumidas. Repetir o nome do protocolo
 * aqui criava duas faixas consecutivas dizendo a mesma coisa.
 *
 * Informação não usa linguagem visual de botão. Fase, cronômetro e métricas são
 * deliberadamente planos, sem cápsula/borda fechada, para não competir com os
 * controles realmente clicáveis do atendimento.
 */
export function ClinicalCockpitBar({
  protocol: _protocol,
  phase,
  elapsed,
  metrics = [],
}: ClinicalCockpitBarProps) {
  const e = useEstilosDoTema(criarEstilos);
  const visibleMetrics = metrics.slice(0, 4);
  const temFaixaSuperior = Boolean(phase || elapsed);

  if (!temFaixaSuperior && visibleMetrics.length === 0) return null;

  return (
    <View style={e.wrapper} accessibilityRole="summary">
      {temFaixaSuperior ? (
        <View style={e.topRow}>
          <View style={e.phaseBlock}>
            {phase ? <Text style={e.phase} numberOfLines={2}>{phase}</Text> : null}
          </View>
          {elapsed ? (
            <View style={e.elapsedPill} accessibilityLabel={`Tempo de atendimento ${elapsed}`}>
              <Text style={e.elapsedLabel}>TEMPO</Text>
              <Text style={e.elapsed}>{elapsed}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

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
    phaseBlock: {
      flex: 1,
      minWidth: 0,
    },
    phase: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "700",
      lineHeight: 15,
    },
    elapsedPill: {
      minWidth: 64,
      alignItems: "flex-end",
      justifyContent: "center",
      paddingHorizontal: ESPACO.xs,
      paddingVertical: 2,
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
      gap: ESPACO.md,
    },
    metric: {
      minWidth: 76,
      flexGrow: 1,
      borderLeftWidth: 2,
      borderLeftColor: t.cores.border,
      paddingLeft: ESPACO.sm,
      paddingVertical: 2,
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
