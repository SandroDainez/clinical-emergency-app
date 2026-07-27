import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ClinicalLogEntry, EncounterSummary } from "../../clinical-engine";
import { useTr } from "../../lib/use-tr";

type ClinicalLogCardProps = {
  clinicalLog: ClinicalLogEntry[];
  encounterSummary: EncounterSummary;
  onExport: () => void;
  onPrint: () => void;
};

function ClinicalLogCard({
  clinicalLog,
  encounterSummary,
  onExport,
  onPrint,
}: ClinicalLogCardProps) {
  const tr = useTr();
  const fallbackMetrics = [
    { label: tr("Choques aplicados"), value: String(encounterSummary.shockCount) },
    {
      label: tr("Epinefrina"),
      value: `${encounterSummary.adrenalineAdministeredCount}/${encounterSummary.adrenalineSuggestedCount}`,
    },
    {
      label: tr("Antiarrítmico"),
      value: `${encounterSummary.antiarrhythmicAdministeredCount}/${encounterSummary.antiarrhythmicSuggestedCount}`,
    },
  ];

  const metrics = encounterSummary.metrics ?? fallbackMetrics;

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>{tr("LOG CLÍNICO")}</Text>
        </View>
        <View style={s.completedBadge}>
          <Text style={s.completedText}>{tr("✓ Episódio encerrado")}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={s.summaryCard}>
        <Text style={s.summaryTitle}>{tr("Resumo operacional")}</Text>
        <View style={s.metricsGrid}>
          <View style={s.metricChip}>
            <Text style={s.metricLabel}>{tr("Duração")}</Text>
            <Text style={s.metricValue}>{encounterSummary.durationLabel}</Text>
          </View>
          {metrics.map((metric) => (
            <View key={metric.label} style={s.metricChip}>
              <Text style={s.metricLabel}>{metric.label}</Text>
              <Text style={s.metricValue}>{metric.value || "—"}</Text>
            </View>
          ))}
        </View>
        <Text style={s.stateText} numberOfLines={2}>
          Estado: {encounterSummary.currentStateText}
        </Text>

        <View style={s.btnRow}>
          <Pressable
            style={({ pressed }) => [s.exportBtn, pressed && { opacity: 0.85 }]}
            onPress={onExport}>
            <Text style={s.exportBtnText}>{tr("Exportar resumo")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.printBtn, pressed && { opacity: 0.85 }]}
            onPress={onPrint}>
            <Text style={s.printBtnText}>{tr("Imprimir relatório")}</Text>
          </Pressable>
        </View>
      </View>

      {/* Log entries */}
      {clinicalLog.length === 0 ? (
        <Text style={s.emptyText}>{tr("Nenhum evento clínico registrado.")}</Text>
      ) : null}

      {clinicalLog
        .slice()
        .reverse()
        .map((entry, index) => (
          <View key={`${entry.timestamp}-${entry.kind}-${index}`} style={s.logEntry}>
            <View style={s.logDot} />
            <View style={s.logBody}>
              <Text style={s.logTitle}>{entry.title}</Text>
              {entry.details ? (
                <Text style={s.logDetails}>{entry.details}</Text>
              ) : null}
              <Text style={s.logTime}>
                {new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Text>
            </View>
          </View>
        ))}
    </View>
  );
}

export default ClinicalLogCard;

const s = StyleSheet.create({
  card: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#565e6c",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBadge: {
    backgroundColor: "#1e6fd9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#ffffff",
  },
  completedBadge: {
    backgroundColor: "#052e16",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#166534",
  },
  completedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4ade80",
  },

  summaryCard: {
    backgroundColor: "#383e4a",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#565e6c",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metricChip: {
    backgroundColor: "#383e4a",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 1,
    borderWidth: 1,
    borderColor: "#565e6c",
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: "#aab6c6",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#e2e8f0",
  },
  stateText: {
    fontSize: 12,
    color: "#aab6c6",
    lineHeight: 18,
  },

  btnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  exportBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e6fd9",
  },
  exportBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  printBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#383e4a",
    borderWidth: 1,
    borderColor: "#565e6c",
  },
  printBtnText: {
    color: "#aab6c6",
    fontSize: 13,
    fontWeight: "700",
  },

  emptyText: {
    fontSize: 14,
    color: "#aab6c6",
    textAlign: "center",
    paddingVertical: 8,
  },

  logEntry: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#565e6c",
    alignItems: "flex-start",
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1e6fd9",
    marginTop: 5,
    flexShrink: 0,
  },
  logBody: {
    flex: 1,
    gap: 3,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#e2e8f0",
  },
  logDetails: {
    fontSize: 13,
    lineHeight: 19,
    color: "#aab6c6",
  },
  logTime: {
    fontSize: 11,
    color: "#aab6c6",
    fontWeight: "600",
  },
});
