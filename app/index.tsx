import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthRole } from "../lib/auth-session";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Sempre inicia na escolha de perfil para evitar ficar preso no último papel salvo.
    clearAuthRole();
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Clinical Emergency Suite</Text>
        <Text style={styles.title}>Selecione seu acesso</Text>
        <Text style={styles.description}>Escolha o tipo de login para entrar no ambiente correto.</Text>

        <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} onPress={() => router.replace("/user-login")}>
          <Text style={styles.primaryButtonText}>Entrar como usuário</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => router.replace("/admin-login")}>
          <Text style={styles.secondaryButtonText}>Entrar como admin</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050505",
    padding: 18,
    justifyContent: "center",
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(123,176,255,0.34)",
    backgroundColor: "rgba(13,16,24,0.9)",
    padding: 22,
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#95bbff",
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: "#f5f7fb",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#c8d2e1",
    marginBottom: 4,
  },
  primaryButton: {
    borderRadius: 14,
    backgroundColor: "#5c8dff",
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(123,176,255,0.34)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#c8d2e1",
    fontSize: 15,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
