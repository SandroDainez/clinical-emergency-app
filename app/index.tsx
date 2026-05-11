import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthRole, setAuthRole } from "../lib/auth-session";
import { supabase } from "../lib/supabase";

const DEFAULT_ADMIN_PIN = "123456";
type LoginMode = "user" | "admin";

export default function Index() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearAuthRole();
  }, []);

  function resetError() {
    if (error) setError(null);
  }

  async function handleUserLogin() {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError("Informe e-mail e senha.");
      return;
    }

    if (!supabase) {
      setError("Supabase não configurado neste ambiente.");
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    const userId = signInData.user?.id;
    if (!userId) {
      setError("Não foi possível identificar o usuário autenticado.");
      return;
    }

    const { data: appUser, error: appUserError } = await supabase
      .from("app_users")
      .select("role,status")
      .eq("id", userId)
      .single();

    if (appUserError || !appUser) {
      setError("Usuário sem perfil cadastrado no app.");
      return;
    }

    if (appUser.status !== "ativo") {
      setError("Seu acesso está pendente ou bloqueado. Fale com o administrador.");
      return;
    }

    const role = appUser.role === "admin" ? "admin" : "user";
    setAuthRole(role);

    if (role === "admin") {
      router.replace("/session-history");
      return;
    }

    router.replace("/(tabs)");
  }

  function handleAdminLogin() {
    const expectedPin = process.env.EXPO_PUBLIC_ADMIN_PIN?.trim() || DEFAULT_ADMIN_PIN;
    if (!adminPin.trim()) {
      setError("Digite o PIN administrativo.");
      return;
    }

    if (adminPin.trim() !== expectedPin) {
      setError("PIN inválido.");
      return;
    }

    setAuthRole("admin");
    router.replace("/session-history");
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      if (mode === "admin") {
        handleAdminLogin();
        return;
      }
      await handleUserLogin();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Clinical Emergency Suite</Text>
        <Text style={styles.title}>Entrar na plataforma</Text>
        <Text style={styles.description}>Faça login para acessar protocolos e painel administrativo.</Text>

        <View style={styles.segment}>
          <Pressable style={[styles.segmentButton, mode === "user" && styles.segmentButtonActive]} onPress={() => setMode("user")}>
            <Text style={[styles.segmentLabel, mode === "user" && styles.segmentLabelActive]}>Usuário</Text>
          </Pressable>
          <Pressable style={[styles.segmentButton, mode === "admin" && styles.segmentButtonActive]} onPress={() => setMode("admin")}>
            <Text style={[styles.segmentLabel, mode === "admin" && styles.segmentLabelActive]}>Admin</Text>
          </Pressable>
        </View>

        {mode === "user" ? (
          <>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                resetError();
              }}
              placeholder="E-mail"
              placeholderTextColor="#7b8ba5"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                resetError();
              }}
              placeholder="Senha"
              placeholderTextColor="#7b8ba5"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => {
                void handleSubmit();
              }}
            />
          </>
        ) : (
          <TextInput
            style={styles.input}
            value={adminPin}
            onChangeText={(value) => {
              setAdminPin(value);
              resetError();
            }}
            placeholder="PIN administrativo"
            placeholderTextColor="#7b8ba5"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={() => {
              void handleSubmit();
            }}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, isSubmitting && styles.buttonDisabled]}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
        </Pressable>

        <Text style={styles.helper}>
          {mode === "user"
            ? "Login de usuário usa e-mail/senha do Supabase Auth."
            : "Login admin usa PIN definido em EXPO_PUBLIC_ADMIN_PIN."}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0a0f1d",
    padding: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.24)",
    backgroundColor: "rgba(13,16,24,0.9)",
    padding: 24,
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
  segment: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(123,176,255,0.34)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#5c8dff",
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#c8d2e1",
  },
  segmentLabelActive: {
    color: "#ffffff",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(123,176,255,0.34)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  error: {
    fontSize: 13,
    color: "#fca5a5",
    fontWeight: "700",
  },
  primaryButton: {
    borderRadius: 14,
    backgroundColor: "#5c8dff",
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
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
  buttonDisabled: {
    opacity: 0.75,
  },
});
