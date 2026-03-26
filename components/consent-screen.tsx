import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AclsMode } from "../clinical-engine";

type ConsentScreenProps = {
  onAccept: (mode?: AclsMode) => void;
};

export default function ConsentScreen({ onAccept }: ConsentScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.badge}>Apoio à decisão clínica</Text>
        <Text style={styles.title}>Consentimento de uso</Text>
        <Text style={styles.message}>
          Este aplicativo é uma ferramenta de apoio à decisão clínica. As
          recomendações não substituem o julgamento médico. A decisão final é do
          profissional assistente.
        </Text>

        <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={() => onAccept("training")}>
          <Text style={styles.secondaryButtonText}>Modo treinamento</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => onAccept("code")}>
          <Text style={styles.buttonText}>Aceito e continuar</Text>
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
    padding: 20,
    backgroundColor: "#f3f5f7",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 16,
  },
  badge: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#6b7280",
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#111827",
  },
  message: {
    fontSize: 17,
    lineHeight: 26,
    color: "#374151",
  },
  actions: {
    gap: 10,
  },
  button: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: "#3730a3",
    fontSize: 16,
    fontWeight: "800",
  },
});
