import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AclsMode } from "../clinical-engine";

type ConsentScreenProps = {
  onAccept: (mode?: AclsMode) => void;
};

export default function ConsentScreen({ onAccept }: ConsentScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.badge}>Módulo ACLS</Text>
        <Text style={styles.title}>Escolha como entrar</Text>
        <Text style={styles.subtitle}>
          Fluxo direto para atendimento real ou ambiente guiado para treino de ciclo.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Apoio à decisão clínica</Text>
        <Text style={styles.cardTitle}>Consentimento de uso</Text>
        <Text style={styles.message}>
          Este aplicativo é uma ferramenta de apoio à decisão clínica. As
          recomendações não substituem o julgamento médico. A decisão final é do
          profissional assistente.
        </Text>

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={() => onAccept("training")}>
            <Text style={styles.secondaryButtonEyebrow}>Guiado</Text>
            <Text style={styles.secondaryButtonText}>Modo treinamento</Text>
            <Text style={styles.secondaryButtonHint}>Treinar ciclos sem perder o fio do algoritmo</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => onAccept("code")}>
            <Text style={styles.buttonEyebrow}>Direto</Text>
            <Text style={styles.buttonText}>Entrar em código</Text>
            <Text style={styles.buttonHint}>Interface mais seca para uso operacional</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#edf2f7",
    gap: 16,
  },
  hero: {
    backgroundColor: "#0f172a",
    borderRadius: 28,
    padding: 28,
    gap: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#020617",
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 26,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 16,
  },
  badge: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#93c5fd",
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: "#f8fafc",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#cbd5e1",
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  cardTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#111827",
  },
  message: {
    fontSize: 16,
    lineHeight: 25,
    color: "#374151",
  },
  actions: {
    gap: 12,
  },
  button: {
    minHeight: 88,
    borderRadius: 20,
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  buttonEyebrow: {
    color: "#93c5fd",
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
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  secondaryButton: {
    minHeight: 88,
    borderRadius: 20,
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe4ee",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
  },
  secondaryButtonEyebrow: {
    color: "#0f766e",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
  },
  secondaryButtonHint: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
});
