import { StyleSheet, Text, View } from "react-native";
import ClinicalSessionHistory from "../components/clinical-session-history";
import { useTr } from "../lib/use-tr";

export default function SessionHistoryScreen() {
  const tr = useTr();
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{tr("REVISÃO OPERACIONAL")}</Text>
        <Text style={styles.title}>{tr("Histórico de sessões")}</Text>
        <Text style={styles.description}>
          {tr("Revise sessões clínicas anteriores — desfechos, duração, medicações e registros por módulo.")}
        </Text>
      </View>
      <View style={{ padding: 16, gap: 14 }}>
        <ClinicalSessionHistory />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },
  hero: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderLeftWidth: 4,
    borderLeftColor: "#fb923c",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#fb923c",
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
  },
});
