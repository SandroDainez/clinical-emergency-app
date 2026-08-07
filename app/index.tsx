import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthRole, setAuthRole } from "../lib/auth-session";
import { supabase } from "../lib/supabase";
import { loadCurrentAppUser } from "../lib/app-user";
import { signUpAppUser } from "../lib/admin-users";
import PasswordInput from "../components/password-input";
import IntroLanding from "../components/intro-landing";
import LanguageSelector from "../components/language-selector";
import { tr as trBase } from "../lib/i18n";
import { useLanguage } from "../lib/language-context";

export default function Index() {
  // `locale` do render passado a cada tr(): impede o minificador de congelar
  // chamadas tr("literal") na build (idioma ficava preso em PT em produção).
  const { locale } = useLanguage();
  const tr = (pt: string) => trBase(pt, locale);
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [screen, setScreen] = useState<"login" | "signup">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
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
      const msg = (signInError.message || "").toLowerCase();
      if (msg.includes("not confirmed") || msg.includes("confirm")) {
        setError("E-mail ainda não confirmado. Confirme pelo link enviado por e-mail ou peça ao administrador.");
      } else {
        setError("E-mail ou senha inválidos.");
      }
      return;
    }

    const userId = signInData.user?.id;
    if (!userId) {
      setError("Não foi possível identificar o usuário autenticado.");
      return;
    }

    const { data: appUser, errorMessage } = await loadCurrentAppUser();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    if (!appUser) {
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
      router.replace("/admin-users");
      return;
    }

    router.replace("/(tabs)");
  }

  async function handleSignup() {
    if (!nome.trim()) { setError("Informe seu nome."); return; }
    const { errorMessage } = await signUpAppUser({ nome, email, password });
    if (errorMessage) { setError(errorMessage); return; }
    setInfo("Conta criada! Aguarde a aprovação do administrador para acessar.");
    setScreen("login");
    setPassword("");
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      if (screen === "signup") {
        await handleSignup();
      } else {
        await handleUserLogin();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleScreen() {
    setScreen((s) => (s === "login" ? "signup" : "login"));
    setError(null);
    setInfo(null);
  }

  if (showIntro) {
    return <IntroLanding onEnter={() => setShowIntro(false)} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.card}>
        <View style={styles.langRow}>
          <LanguageSelector compact />
        </View>
        <Text style={styles.eyebrow}>Clinical Emergency Suite</Text>
        <Text style={styles.title}>
          {screen === "signup" ? tr("Criar conta") : tr("Entrar na plataforma")}
        </Text>
        <Text style={styles.description}>
          {screen === "signup"
            ? tr("Crie sua conta. O acesso é liberado após aprovação do administrador.")
            : tr("Faça login para acessar os guias e o painel administrativo.")}
        </Text>

        {screen === "signup" ? (
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={(value) => { setNome(value); resetError(); }}
            placeholder={tr("Nome completo")}
            placeholderTextColor="#7b8ba5"
            autoCapitalize="words"
            returnKeyType="next"
          />
        ) : null}

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(value) => { setEmail(value); resetError(); }}
          placeholder={tr("E-mail")}
          placeholderTextColor="#7b8ba5"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
        />
        <PasswordInput
          inputStyle={styles.input}
          value={password}
          onChangeText={(value) => { setPassword(value); resetError(); }}
          placeholder={tr("Senha")}
          placeholderTextColor="#7b8ba5"
          returnKeyType="done"
          onSubmitEditing={() => { void handleSubmit(); }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, isSubmitting && styles.buttonDisabled]}
          onPress={() => { void handleSubmit(); }}
          disabled={isSubmitting}>
          {isSubmitting
            ? <ActivityIndicator color="#ffffff" />
            : <Text style={styles.primaryButtonText}>{screen === "signup" ? tr("Criar conta") : tr("Entrar")}</Text>}
        </Pressable>

        <Pressable onPress={toggleScreen} style={({ pressed }) => [styles.toggleLink, pressed && styles.buttonPressed]}>
          <Text style={styles.toggleLinkText}>
            {screen === "signup" ? tr("Já tenho conta — entrar") : tr("Não tem conta? Criar conta")}
          </Text>
        </Pressable>

        <Text style={styles.helper}>
          {tr("Acesse com seu e-mail e senha. O acesso de administrador é reconhecido automaticamente.")}
        </Text>

        <Pressable onPress={() => router.push("/privacidade" as never)} style={styles.privacyLink}>
          <Text style={styles.privacyLinkText}>{tr("Política de privacidade")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  langRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
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
  info: {
    fontSize: 13,
    color: "#86efac",
    fontWeight: "700",
  },
  toggleLink: {
    alignItems: "center",
    paddingVertical: 6,
   minHeight: 44, justifyContent: "center" },
  toggleLinkText: {
    color: "#7eb0ff",
    fontSize: 13.5,
    fontWeight: "800",
  },
  primaryButton: {
    borderRadius: 14,
    backgroundColor: "#1e6fd9",
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
  privacyLink: {
    alignItems: "center",
    paddingVertical: 6,
    marginTop: 2,
  },
  privacyLinkText: {
    color: "#7eb0ff",
    fontSize: 12.5,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.75 },
});
