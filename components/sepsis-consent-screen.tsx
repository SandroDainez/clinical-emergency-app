import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppDesign } from "../constants/app-design";

type SepsisConsentScreenProps = {
  onAccept: () => void;
};

export default function SepsisConsentScreen({ onAccept }: SepsisConsentScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Módulo Sepse</Text>
          <Text style={styles.title}>Roteiro de atendimento</Text>
          <Text style={styles.subtitle}>
            Guia clínico completo para atendimento de suspeita de sepse no adulto. Preencha conforme examina o paciente —
            cálculos automáticos, ATB por toque.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.featureList}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🩺</Text>
              <Text style={styles.featureText}>Anamnese, exame físico e sinais vitais por toque</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>PAM, IMC e qSOFA calculados automaticamente</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>💊</Text>
              <Text style={styles.featureText}>Sugestão de ATB empírico com dose ajustada ao perfil</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🏥</Text>
              <Text style={styles.featureText}>Encaminhamento: UTI, semi-intensiva, enfermaria</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            Ferramenta de apoio à decisão clínica. Não substitui o julgamento médico. A decisão final é do profissional
            assistente.
          </Text>

          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.92 }]} onPress={onAccept}>
            <Text style={styles.buttonText}>Iniciar atendimento</Text>
            <Text style={styles.buttonHint}>Abrir roteiro de sepse</Text>
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1e293b",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    ...AppDesign.shadow.card,
  },
  featureList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 28,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 19,
    color: AppDesign.text.muted,
    borderTopWidth: 1,
    borderTopColor: AppDesign.border.subtle,
    paddingTop: 16,
  },
  button: {
    minHeight: 72,
    borderRadius: 999,
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  buttonHint: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
