import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthRole, setAuthRole } from "../lib/auth-session";

const DEFAULT_USER_NAME = "usuario";
const DEFAULT_USER_PASSWORD = "123456";

export default function UserLoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const expectedUsername = useMemo(() => {
    return process.env.EXPO_PUBLIC_USER_LOGIN?.trim() || DEFAULT_USER_NAME;
  }, []);
  const expectedPassword = useMemo(() => {
    return process.env.EXPO_PUBLIC_USER_PASSWORD?.trim() || DEFAULT_USER_PASSWORD;
  }, []);

  function handleUserEnter() {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedExpectedUsername = expectedUsername.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedPassword) {
      setError("Informe usuário e senha.");
      return;
    }

    if (normalizedUsername !== normalizedExpectedUsername || normalizedPassword !== expectedPassword) {
      setError("Usuário ou senha inválidos.");
      return;
    }

    setAuthRole("user");
    setError(null);
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Acesso assistencial</Text>
        <Text style={styles.title}>Login de usuário</Text>
        <Text style={styles.description}>
          Entre no modo assistencial para acessar módulos e protocolos clínicos.
        </Text>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            if (error) setError(null);
          }}
          placeholder="Usuário"
          placeholderTextColor="#7b8ba5"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (error) setError(null);
          }}
          placeholder="Senha"
          placeholderTextColor="#7b8ba5"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleUserEnter}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => {
              clearAuthRole();
              router.replace("/");
            }}>
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} onPress={handleUserEnter}>
            <Text style={styles.primaryButtonText}>Entrar como usuário</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace("/admin-login")} style={({ pressed }) => [styles.adminLink, pressed && styles.buttonPressed]}>
          <Text style={styles.adminLinkText}>Sou admin</Text>
        </Pressable>

        <Text style={styles.helper}>
          Dica: use `EXPO_PUBLIC_USER_LOGIN` e `EXPO_PUBLIC_USER_PASSWORD` no `.env.local` para trocar as credenciais
          padrão.
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
    marginTop: 6,
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
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(123,176,255,0.34)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#c8d2e1",
    fontSize: 14,
    fontWeight: "800",
  },
  adminLink: {
    marginTop: 2,
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  adminLinkText: {
    color: "#95bbff",
    fontSize: 13,
    fontWeight: "700",
  },
  helper: {
    marginTop: 2,
    color: "#91a0b5",
    fontSize: 12,
    lineHeight: 17,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
