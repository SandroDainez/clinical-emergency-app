import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppDesign } from "../constants/app-design";

type Props = { onAccept: () => void };

export default function AnafilaxiaConsentScreen({ onAccept }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Emergência alérgica</Text>
          <Text style={styles.title}>Anafilaxia e choque anafilático</Text>
          <Text style={styles.subtitle}>
            Registe o gatilho, manifestações e o que foi administrado. O assistente calcula a dose de adrenalina IM por peso
            e lembra a ordem correta do tratamento (adrenalina primeiro).
          </Text>
        </View>

        <View style={styles.card}>
          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.92 }]} onPress={onAccept}>
            <Text style={styles.buttonText}>Iniciar</Text>
            <Text style={styles.buttonHint}>Abrir fluxo de anafilaxia</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppDesign.canvas.tealBackdrop },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 18,
    paddingVertical: 28,
    gap: 16,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    backgroundColor: AppDesign.accent.lime,
    borderRadius: 32,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.2)",
  },
  badge: {
    fontSize: 12,
    fontWeight: "800",
    color: AppDesign.accent.limeDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: { fontSize: 24, fontWeight: "800", color: AppDesign.text.primary, lineHeight: 30 },
  subtitle: { fontSize: 15, color: "#1e293b", lineHeight: 22 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 14,
    ...AppDesign.shadow.card,
  },
  button: {
    backgroundColor: "#0f172a",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  buttonHint: { color: "#94a3b8", fontSize: 12 },
});
