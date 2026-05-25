import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = { onAccept: () => void };

export default function VentilationConsentScreen({ onAccept }: Props) {
  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>Ventilação mecânica</Text>
          </View>
          <Text style={s.title}>Regulagem com explicação passo a passo</Text>
          <Text style={s.subtitle}>
            Informe cenário clínico, peso, altura e parâmetros do ventilador. O app calcula
            metas (ex.: volume por kg de peso predito) e explica o que ajustar na máquina.
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.featureList}>
            {[
              { icon: "🧮", text: "Peso predito (PBW) e relação Vt/kg para estratégia protetora" },
              { icon: "🎯", text: "Cenários: ARDS, obstrutivo, pós-operatório, neuro, acidose metabólica" },
              { icon: "📟", text: "Passo a passo no monitor do ventilador (menu, FR, PEEP, alarmes)" },
            ].map((f) => (
              <View key={f.text} style={s.featureRow}>
                <Text style={s.featureIcon}>{f.icon}</Text>
                <Text style={s.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <Text style={s.disclaimer}>
            Conteúdo educativo; não substitui prescrição médica, fisioterapia
            especializada nem protocolo da unidade.
          </Text>

          <Pressable
            style={({ pressed }) => [s.button, pressed && { opacity: 0.88 }]}
            onPress={onAccept}>
            <Text style={s.buttonText}>Iniciar</Text>
            <Text style={s.buttonHint}>Abrir assistente de VM</Text>
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
    borderLeftColor: "#818cf8",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1e1b4b",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#a5b4fc",
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
  featureList: { gap: 10 },
  featureRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  featureIcon: { fontSize: 18 },
  featureText: { flex: 1, fontSize: 14, color: "#94a3b8", lineHeight: 20 },

  disclaimer: { fontSize: 12, color: "#475569", lineHeight: 18, fontStyle: "italic" },

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
