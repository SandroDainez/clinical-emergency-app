import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { setAuthRole } from "../lib/auth-session";
import { supabase } from "../lib/supabase";

export default function AdminLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError("Preencha e-mail e senha.");
      return;
    }

    if (!supabase) {
      setError(
        "Supabase não configurado.\nVerifique o arquivo .env.local com:\n  EXPO_PUBLIC_SUPABASE_URL\n  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPass,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos."
            : authError.message
        );
        return;
      }

      if (!authData.user) {
        setError("Falha na autenticação. Tente novamente.");
        return;
      }

      // 2. Check admin role in app_users
      const { data: profileData, error: profileError } = await supabase.rpc("get_current_app_user");

      if (profileError || !profileData || profileData.length === 0) {
        await supabase.auth.signOut();
        setError("Perfil não encontrado. Contacte o suporte.");
        return;
      }

      const profile = Array.isArray(profileData) ? profileData[0] : profileData;

      if (profile.role !== "admin") {
        await supabase.auth.signOut();
        setError("Esta conta não tem permissão de administrador.");
        return;
      }

      if (profile.status === "bloqueado") {
        await supabase.auth.signOut();
        setError("Conta de administrador bloqueada.");
        return;
      }

      // 3. Grant admin access
      setAuthRole("admin");
      router.replace("/admin-users");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>Acesso restrito</Text>
            </View>
            <Text style={s.title}>Admin</Text>
            <Text style={s.subtitle}>
              Entre com a conta Supabase que tem{" "}
              <Text style={s.subtitleBold}>role = admin</Text>.
            </Text>
          </View>

          {/* Form card */}
          <View style={s.card}>
            <View style={s.field}>
              <Text style={s.label}>E-mail</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={(v) => { setEmail(v); setError(null); }}
                placeholder="admin@exemplo.com"
                placeholderTextColor="#334155"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!loading}
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Senha</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={(v) => { setPassword(v); setError(null); }}
                placeholder="••••••••"
                placeholderTextColor="#334155"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />
            </View>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [s.loginBtn, pressed && { opacity: 0.88 }, loading && s.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={s.loginBtnText}>Entrar como admin</Text>
              )}
            </Pressable>
          </View>

          {/* Back link */}
          <Pressable
            style={({ pressed }) => [s.backLink, pressed && { opacity: 0.7 }]}
            onPress={() => router.replace("/")}>
            <Text style={s.backLinkText}>← Voltar ao app</Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 32,
    gap: 16,
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
  },

  header: {
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#fca5a5",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#f1f5f9",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  subtitleBold: {
    color: "#94a3b8",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  field: { gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0a0f1a",
    color: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: "600",
  },

  errorBox: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#fca5a5",
    fontWeight: "600",
    lineHeight: 19,
  },

  loginBtn: {
    backgroundColor: "#0e7490",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
    shadowColor: "#22d3ee",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  backLink: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backLinkText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
});
