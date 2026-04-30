import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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

import { useAuth } from "@/components/auth-provider";
import * as DS from "@/constants/app-design";
import { requestAccess } from "@/lib/auth";

const AppDesign = DS.AppDesign;

const Hybrid = {
  bg: "#eef3fb",
  panel: "rgba(255,255,255,0.9)",
  panelSoft: "rgba(255,255,255,0.76)",
  border: "rgba(44,71,121,0.16)",
  borderStrong: "rgba(44,71,121,0.28)",
  text: "#132033",
  muted: "#5d6c82",
  softText: "#425267",
  accent: "#2f5bd7",
  accentStrong: "#163fc0",
};

export default function LoginScreen() {
  const router = useRouter();
  const { canAccessApp, isAdmin, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requestMode, setRequestMode] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestPassword, setRequestPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  useEffect(() => {
    if (canAccessApp) {
      router.replace(isAdmin ? "/admin" : "/(tabs)");
    }
  }, [canAccessApp, isAdmin, router]);

  async function handleLogin() {
    if (loading) return;
    setLoading(true);
    setErrorText(null);
    setSuccessText(null);
    const result = await signIn(email, password);

    if (!result.ok) {
      setLoading(false);
      setErrorText(result.message);
      return;
    }

    router.replace(result.profile.role === "admin" ? "/admin" : "/(tabs)");
  }

  async function handleRequestAccess() {
    if (loading) return;
    setLoading(true);
    setErrorText(null);
    setSuccessText(null);

    const result = await requestAccess({
      nome: requestName,
      email: requestEmail,
      password: requestPassword,
    });

    setLoading(false);

    if (!result.ok) {
      setErrorText(result.message);
      return;
    }

    setRequestName("");
    setRequestEmail("");
    setRequestPassword("");
    setRequestMode(false);
    setSuccessText("Solicitação enviada. Aguarde aprovação do administrador.");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
          <View style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Acesso protegido</Text>
            </View>

            <Text style={styles.title}>Entrar na plataforma</Text>
            <Text style={styles.subtitle}>
              Apenas usuários aprovados pelo administrador conseguem acessar os módulos clínicos, protocolos e calculadoras.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail ou usuário</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="voce@hospital.org"
                placeholderTextColor="#7b8798"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="username"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                placeholderTextColor="#7b8798"
                secureTextEntry
                textContentType="password"
                style={styles.input}
              />
            </View>

            {errorText ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Atenção</Text>
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            ) : null}

            {successText ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Solicitação enviada</Text>
                <Text style={styles.successText}>{successText}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && !loading && styles.pressed, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}>
              <Text style={styles.primaryButtonText}>{loading ? "Entrando..." : "Entrar"}</Text>
              <Text style={styles.primaryButtonHint}>Acessar módulos e protocolos</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryActionButton, pressed && styles.pressed]}
              onPress={() => {
                setRequestMode((value) => !value);
                setErrorText(null);
                setSuccessText(null);
              }}>
              <Text style={styles.secondaryActionButtonText}>
                {requestMode ? "Fechar solicitação" : "Solicitar acesso"}
              </Text>
            </Pressable>

            {requestMode ? (
              <View style={styles.requestCard}>
                <Text style={styles.requestTitle}>Solicitar acesso</Text>
                <Text style={styles.requestBody}>
                  O cadastro será criado com status pendente. O login só será liberado depois da aprovação manual do administrador.
                </Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Nome completo</Text>
                  <TextInput
                    value={requestName}
                    onChangeText={setRequestName}
                    placeholder="Seu nome completo"
                    placeholderTextColor="#7b8798"
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    value={requestEmail}
                    onChangeText={setRequestEmail}
                    placeholder="voce@hospital.org"
                    placeholderTextColor="#7b8798"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Senha</Text>
                  <TextInput
                    value={requestPassword}
                    onChangeText={setRequestPassword}
                    placeholder="Crie uma senha"
                    placeholderTextColor="#7b8798"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [styles.requestButton, pressed && !loading && styles.pressed, loading && styles.buttonDisabled]}
                  onPress={handleRequestAccess}
                  disabled={loading}>
                  <Text style={styles.requestButtonText}>{loading ? "Enviando..." : "Enviar solicitação"}</Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Voltar para a apresentação</Text>
            </Pressable>

            <Text style={styles.note}>
              Login liberado apenas para perfis ativos. Solicitações novas ficam pendentes até aprovação manual.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Hybrid.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 620,
  },
  card: {
    backgroundColor: Hybrid.panel,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Hybrid.border,
    padding: 24,
    gap: 16,
    ...AppDesign.shadow.hero,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(47,91,215,0.1)",
    borderWidth: 1,
    borderColor: Hybrid.borderStrong,
  },
  badgeText: {
    color: Hybrid.accent,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    color: Hybrid.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Hybrid.softText,
    fontWeight: "600",
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: Hybrid.muted,
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Hybrid.border,
    backgroundColor: Hybrid.panelSoft,
    paddingHorizontal: 16,
    color: Hybrid.text,
    fontSize: 15,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "rgba(191, 38, 79, 0.1)",
    borderColor: "rgba(191, 38, 79, 0.2)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#8a2747",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#8a2747",
  },
  successBox: {
    backgroundColor: "rgba(22, 163, 74, 0.08)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(22, 163, 74, 0.18)",
    padding: 14,
    gap: 4,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#166534",
  },
  successText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#166534",
  },
  primaryButton: {
    borderRadius: 20,
    backgroundColor: Hybrid.accentStrong,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(22,63,192,0.28)",
    alignItems: "center",
    gap: 2,
    shadowColor: Hybrid.accentStrong,
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  primaryButtonHint: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
  },
  secondaryActionButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Hybrid.borderStrong,
    backgroundColor: "rgba(47,91,215,0.08)",
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryActionButtonText: {
    color: Hybrid.accentStrong,
    fontSize: 14,
    fontWeight: "900",
  },
  requestCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Hybrid.border,
    backgroundColor: "#f7fbff",
    padding: 18,
    gap: 14,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Hybrid.text,
  },
  requestBody: {
    fontSize: 14,
    lineHeight: 21,
    color: Hybrid.softText,
    fontWeight: "600",
  },
  requestButton: {
    borderRadius: 18,
    backgroundColor: "#0f766e",
    paddingVertical: 15,
    alignItems: "center",
  },
  requestButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Hybrid.border,
    backgroundColor: Hybrid.panelSoft,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Hybrid.text,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.997 }],
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  note: {
    textAlign: "center",
    color: Hybrid.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
});
