import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type SepsisConsentScreenProps = {
  onAccept: () => void;
};

export default function SepsisConsentScreen({ onAccept }: SepsisConsentScreenProps) {
  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>Módulo Sepse</Text>
          </View>
          <Text style={s.title}>Roteiro de atendimento</Text>
          <Text style={s.subtitle}>
            Guia clínico completo para atendimento de suspeita de sepse no adulto. Preencha
            conforme examina o paciente — cálculos automáticos, ATB por toque.
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.featureList}>
            {[
              { icon: "🩺", text: "Anamnese, exame físico e sinais vitais por toque" },
              { icon: "📊", text: "PAM, IMC e qSOFA calculados automaticamente" },
              { icon: "💊", text: "Sugestão de ATB empírico com dose ajustada ao perfil" },
              { icon: "🏥", text: "Encaminhamento: UTI, semi-intensiva, enfermaria" },
            ].map((f) => (
              <View key={f.text} style={s.featureRow}>
                <Text style={s.featureIcon}>{f.icon}</Text>
                <Text style={s.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <Text style={s.disclaimer}>
            Ferramenta de apoio à decisão clínica. Não substitui o julgamento médico.
            A decisão final é do profissional assistente.
          </Text>

          <Pressable
            style={({ pressed }) => [s.button, pressed && { opacity: 0.88 }]}
            onPress={onAccept}>
            <Text style={s.buttonText}>Iniciar atendimento</Text>
            <Text style={s.buttonHint}>Abrir roteiro de sepse</Text>
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
    borderLeftColor: "#fbbf24",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#451a03",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#fcd34d",
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748b",
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    gap: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  featureList: { gap: 12 },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  featureIcon: { fontSize: 18, width: 26 },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#94a3b8",
    fontWeight: "500",
  },

  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 14,
    fontStyle: "italic",
  },

  button: {
    minHeight: 66,
    borderRadius: 16,
    justifyContent: "center",
    backgroundColor: "#0e7490",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 3,
    shadowColor: "#22d3ee",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  buttonHint: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
