import { useRouter } from "expo-router";
import { useState } from "react";
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

import * as DS from "@/constants/app-design";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    router.replace("/(tabs)" as const);
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
              Use suas credenciais para acessar os módulos clínicos, protocolos e calculadoras.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail institucional</Text>
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

            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>Entrar</Text>
              <Text style={styles.primaryButtonHint}>Acessar módulos e protocolos</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Voltar para a apresentação</Text>
            </Pressable>

            <Text style={styles.note}>
              A autenticação completa ainda pode ser conectada depois. Esta tela já prepara o ponto de entrada do app.
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
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Hybrid.border,
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Hybrid.text,
    fontSize: 14,
    fontWeight: "800",
  },
  note: {
    color: Hybrid.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    paddingTop: 4,
  },
  pressed: {
    opacity: 0.92,
  },
});
