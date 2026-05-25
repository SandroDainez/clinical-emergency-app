import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = { onAccept: () => void };

export default function AnafilaxiaConsentScreen({ onAccept }: Props) {
  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>Emergência alérgica</Text>
          </View>
          <Text style={s.title}>Anafilaxia e choque anafilático</Text>
          <Text style={s.subtitle}>
            Registe o gatilho, manifestações e o que foi administrado. O assistente calcula
            a dose de adrenalina IM por peso e lembra a ordem correta do tratamento
            (adrenalina primeiro).
          </Text>
        </View>

        <View style={s.card}>
          <Pressable
            style={({ pressed }) => [s.button, pressed && { opacity: 0.88 }]}
            onPress={onAccept}>
            <Text style={s.buttonText}>Iniciar</Text>
            <Text style={s.buttonHint}>Abrir fluxo de anafilaxia</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0f1a" },
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
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderLeftWidth: 4,
    borderLeftColor: "#f472b6",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#500724",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#f9a8d4",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#f1f5f9", lineHeight: 30, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: "#64748b", lineHeight: 21 },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  button: {
    backgroundColor: "#0e7490",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 3,
    shadowColor: "#22d3ee",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  buttonHint: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
});
