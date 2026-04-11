import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppDesign } from "../constants/app-design";

type EapConsentScreenProps = {
  onAccept: () => void;
};

export default function EapConsentScreen({ onAccept }: EapConsentScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Edema agudo de pulmão</Text>
          <Text style={styles.title}>Roteiro resumido</Text>
          <Text style={styles.subtitle}>
            Atendimento de ciclo curto: quadro clínico, tratamento imediato (O₂, VMNI, vasodilatador, diurético) e destino.
            PAM e SpO₂/FiO₂ calculados automaticamente.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.featureList}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🫁</Text>
              <Text style={styles.featureText}>Formulário enxuto com barra lateral (4 etapas)</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Cálculo de PAM e relação SpO₂/FiO₂</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>💡</Text>
              <Text style={styles.featureText}>Sugestões de conduta conforme pressão e oxigenação</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            Ferramenta de apoio à decisão clínica. Não substitui protocolo institucional nem julgamento médico.
          </Text>

          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.92 }]} onPress={onAccept}>
            <Text style={styles.buttonText}>Iniciar atendimento</Text>
            <Text style={styles.buttonHint}>Abrir roteiro de EAP</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppDesign.canvas.tealBackdrop,
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
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: AppDesign.accent.limeDark,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: AppDesign.text.primary,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: "#1e293b",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 22,
    gap: 16,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    ...AppDesign.shadow.card,
  },
  featureList: { gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  featureIcon: { fontSize: 22 },
  featureText: { flex: 1, fontSize: 15, color: AppDesign.text.secondary, lineHeight: 22 },
  disclaimer: {
    fontSize: 12,
    color: AppDesign.text.muted,
    lineHeight: 18,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#0f172a",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  buttonText: { fontSize: 16, fontWeight: "800", color: "#ffffff" },
  buttonHint: { fontSize: 12, fontWeight: "600", color: "#94a3b8" },
});
