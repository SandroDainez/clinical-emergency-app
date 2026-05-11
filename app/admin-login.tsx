import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_ADMIN_PIN = "123456";

export default function AdminLoginScreen() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const expectedPin = useMemo(() => {
    return process.env.EXPO_PUBLIC_ADMIN_PIN?.trim() || DEFAULT_ADMIN_PIN;
  }, []);

  function handleLogin() {
    const normalizedPin = pin.trim();
    if (!normalizedPin) {
      setError("Digite o PIN administrativo.");
      return;
    }

    if (normalizedPin !== expectedPin) {
      setError("PIN inválido.");
      return;
    }

    setError(null);
    router.replace("/session-history");
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Acesso administrativo</Text>
        <Text style={styles.title}>Login admin</Text>
        <Text style={styles.description}>
          Informe o PIN para abrir o histórico operacional e os dados de sessão.
        </Text>

        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={(value) => {
            setPin(value);
            if (error) setError(null);
          }}
          placeholder="PIN administrativo"
          placeholderTextColor="#7b8ba5"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </Pressable>
        </View>

        <Text style={styles.helper}>
          Dica: defina `EXPO_PUBLIC_ADMIN_PIN` no `.env.local` para trocar o PIN padrão.
        </Text>
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
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(123,176,255,0.34)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "700",
  },
  error: {
    fontSize: 13,
    color: "#fca5a5",
    fontWeight: "700",
  },
  actions: {
    marginTop: 4,
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#5c8dff",
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    flex: 1,
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
  helper: {
    marginTop: 6,
    color: "#91a0b5",
    fontSize: 12,
    lineHeight: 17,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
