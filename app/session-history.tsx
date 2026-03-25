import { StyleSheet, Text, View } from "react-native";
import ClinicalSessionHistory from "../components/clinical-session-history";

export default function SessionHistoryScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Revisão operacional</Text>
        <Text style={styles.title}>Histórico de sessões</Text>
        <Text style={styles.description}>
          Acompanhe desfechos operacionais passados. Os dados são primeiro carregados da base Supabase com
          timestamps e status de cada sessão.
        </Text>
      </View>
      <View style={{ padding: 20, gap: 14 }}>
        <ClinicalSessionHistory />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f5f7",
  },
  hero: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    marginBottom: 0,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#7c2d12",
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: "#111827",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },
});
