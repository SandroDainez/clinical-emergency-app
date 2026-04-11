import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppDesign } from "../constants/app-design";

type ConsentScreenProps = {
  onAccept: () => void;
};

export default function ConsentScreen({ onAccept }: ConsentScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Módulo ACLS</Text>
          <Text style={styles.title}>Apoio à decisão clínica</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>Consentimento de uso</Text>
          <Text style={styles.message}>
            Este aplicativo é uma ferramenta de apoio à decisão clínica. As recomendações não substituem o julgamento
            médico. A decisão final é do profissional assistente.
          </Text>

          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.92 }]} onPress={onAccept}>
            <Text style={styles.buttonEyebrow}>Atendimento</Text>
            <Text style={styles.buttonText}>Entrar no módulo</Text>
            <Text style={styles.buttonHint}>Interface para uso na emergência</Text>
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
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 16,
    ...AppDesign.shadow.card,
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: AppDesign.accent.teal,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  message: {
    fontSize: 16,
    lineHeight: 25,
    color: AppDesign.text.secondary,
  },
  button: {
    minHeight: 88,
    borderRadius: 999,
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  buttonEyebrow: {
    color: AppDesign.accent.primaryMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  buttonHint: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
});
