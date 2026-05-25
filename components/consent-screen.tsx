import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type ConsentScreenProps = {
  onAccept: () => void;
};

export default function ConsentScreen({ onAccept }: ConsentScreenProps) {
  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>Módulo ACLS</Text>
          </View>
          <Text style={s.title}>Apoio à decisão clínica</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardEyebrow}>Consentimento de uso</Text>
          <Text style={s.message}>
            Este aplicativo é uma ferramenta de apoio à decisão clínica. As recomendações
            não substituem o julgamento médico. A decisão final é do profissional assistente.
          </Text>

          <Pressable
            style={({ pressed }) => [s.button, pressed && { opacity: 0.88 }]}
            onPress={onAccept}>
            <Text style={s.buttonEyebrow}>Atendimento</Text>
            <Text style={s.buttonText}>Entrar no módulo</Text>
            <Text style={s.buttonHint}>Interface para uso na emergência</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },
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
    borderLeftColor: "#60a5fa",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1e3a5f",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#93c5fd",
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.4,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0e7490",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  message: {
    fontSize: 15,
    lineHeight: 24,
    color: "#94a3b8",
  },

  button: {
    minHeight: 82,
    borderRadius: 16,
    justifyContent: "center",
    backgroundColor: "#0e7490",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 3,
    shadowColor: "#22d3ee",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonEyebrow: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  buttonHint: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
