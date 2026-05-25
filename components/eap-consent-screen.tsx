import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type EapConsentScreenProps = {
  onAccept: () => void;
};

export default function EapConsentScreen({ onAccept }: EapConsentScreenProps) {
  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>Edema agudo de pulmão</Text>
          </View>
          <Text style={s.title}>Roteiro resumido</Text>
          <Text style={s.subtitle}>
            Atendimento de ciclo curto: quadro clínico, tratamento imediato (O₂, VMNI,
            vasodilatador, diurético) e destino. PAM e SpO₂/FiO₂ calculados automaticamente.
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.featureList}>
            {[
              { icon: "🫁", text: "Formulário enxuto com barra lateral (4 etapas)" },
              { icon: "📊", text: "Cálculo de PAM e relação SpO₂/FiO₂" },
              { icon: "💡", text: "Sugestões de conduta conforme pressão e oxigenação" },
            ].map((f) => (
              <View key={f.text} style={s.featureRow}>
                <Text style={s.featureIcon}>{f.icon}</Text>
                <Text style={s.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <Text style={s.disclaimer}>
            Ferramenta de apoio à decisão clínica. Não substitui protocolo institucional
            nem julgamento médico.
          </Text>

          <Pressable
            style={({ pressed }) => [s.button, pressed && { opacity: 0.88 }]}
            onPress={onAccept}>
            <Text style={s.buttonText}>Iniciar atendimento</Text>
            <Text style={s.buttonHint}>Abrir roteiro de EAP</Text>
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
    borderLeftColor: "#22d3ee",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#164e63",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#67e8f9",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#f1f5f9",
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 21,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    gap: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  featureList: { gap: 10 },
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
  featureIcon: { fontSize: 18 },
  featureText: { flex: 1, fontSize: 14, color: "#94a3b8", lineHeight: 21 },

  disclaimer: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    fontStyle: "italic",
  },

  button: {
    backgroundColor: "#0e7490",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 3,
    shadowColor: "#22d3ee",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: { fontSize: 16, fontWeight: "800", color: "#ffffff", letterSpacing: -0.2 },
  buttonHint: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
});
