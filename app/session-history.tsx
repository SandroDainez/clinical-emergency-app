import { StyleSheet, Text, View } from "react-native";
import ClinicalSessionHistory from "../components/clinical-session-history";
import { AppDesign } from "../constants/app-design";

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
    backgroundColor: AppDesign.canvas.background,
  },
  hero: {
    backgroundColor: AppDesign.surface.hero,
    borderRadius: AppDesign.radius.xxl,
    padding: 24,
    margin: 20,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: AppDesign.border.mint,
    borderLeftWidth: 4,
    borderLeftColor: AppDesign.accent.lime,
    ...AppDesign.shadow.hero,
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: AppDesign.accent.teal,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: AppDesign.text.secondary,
  },
});
