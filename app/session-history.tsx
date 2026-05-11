import { Redirect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ClinicalSessionHistory from "../components/clinical-session-history";
import { AppDesign } from "../constants/app-design";
import { clearAuthRole, getAuthRole } from "../lib/auth-session";

export default function SessionHistoryScreen() {
  const router = useRouter();
  const role = getAuthRole();

  if (role !== "admin") {
    return <Redirect href="/admin-login" />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Área administrativa</Text>
          <Text style={styles.title}>Histórico de sessões</Text>
          <Text style={styles.description}>
            Acompanhe desfechos operacionais passados. Os dados são carregados da base Supabase com timestamps e status
            de cada sessão.
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push("/admin-users")}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.primaryButtonText}>Gerenciar usuários</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                clearAuthRole();
                router.replace("/");
              }}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.secondaryButtonText}>Sair</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ gap: 14 }}>
          <ClinicalSessionHistory />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppDesign.canvas.background,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  hero: {
    backgroundColor: AppDesign.surface.hero,
    borderRadius: AppDesign.radius.xxl,
    padding: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.mint,
    borderLeftWidth: 4,
    borderLeftColor: AppDesign.accent.lime,
    ...AppDesign.shadow.hero,
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: AppDesign.accent.teal,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: AppDesign.text.secondary,
  },
  actions: {
    marginTop: 6,
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: "#0f766e",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#94a3b8",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
