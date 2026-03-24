import { Pressable, Text, View } from "react-native";
import type { ClinicalLogEntry, EncounterSummary } from "../../clinical-engine";
import { styles } from "./protocol-screen-styles";

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
  const fallbackMetrics = [
    { label: "Choques aplicados", value: String(encounterSummary.shockCount) },
    {
      label: "Epinefrina",
      value: `${encounterSummary.adrenalineAdministeredCount}/${encounterSummary.adrenalineSuggestedCount}`,
    },
    {
      label: "Antiarrítmico",
      value: `${encounterSummary.antiarrhythmicAdministeredCount}/${encounterSummary.antiarrhythmicSuggestedCount}`,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Log clínico</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo operacional</Text>
        <Text style={styles.summaryText}>Duração: {encounterSummary.durationLabel}</Text>
        <Text style={styles.summaryText}>Estado atual: {encounterSummary.currentStateText}</Text>
        {(encounterSummary.metrics ?? fallbackMetrics).map((metric) => (
          <Text key={metric.label} style={styles.summaryText}>
            {metric.label}: {metric.value}
          </Text>
        ))}
        <Pressable style={styles.exportButton} onPress={onExport}>
          <Text style={styles.exportButtonText}>Exportar resumo clínico</Text>
        </Pressable>
        <Pressable style={styles.reportButton} onPress={onPrint}>
          <Text style={styles.reportButtonText}>Imprimir relatório clínico</Text>
        </Pressable>
      </View>

      {clinicalLog.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum evento clínico registrado.</Text>
      ) : null}

      {clinicalLog
        .slice()
        .reverse()
        .map((entry, index) => (
          <View key={`${entry.timestamp}-${entry.kind}-${index}`} style={styles.logEntry}>
            <Text style={styles.logTitle}>{entry.title}</Text>
            {entry.details ? <Text style={styles.logDetails}>{entry.details}</Text> : null}
          </View>
        ))}
    </View>
  );
}

export default ClinicalLogCard;
