import { Redirect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthRole, getAuthRole } from "../lib/auth-session";

const MOCK_USERS = [
  { name: "Administrador", role: "admin", status: "ativo" },
  { name: "Usuário assistencial", role: "user", status: "ativo" },
];

export default function AdminUsersScreen() {
  const router = useRouter();
  const role = getAuthRole();

  if (role !== "admin") {
    return <Redirect href="/admin-login" />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Administração</Text>
          <Text style={styles.title}>Usuários e autorização</Text>
          <Text style={styles.description}>
            Área inicial de administração. Aqui você separa perfis admin e usuário assistencial.
          </Text>
          <View style={styles.actions}>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => {
                clearAuthRole();
                router.replace("/");
              }}>
              <Text style={styles.secondaryButtonText}>Sair</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Perfis cadastrados</Text>
          {MOCK_USERS.map((user) => (
            <View key={`${user.name}-${user.role}`} style={styles.userRow}>
              <View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userMeta}>Perfil: {user.role}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próximo passo</Text>
          <Text style={styles.infoText}>
            Integrar este painel com Supabase Auth para cadastro real de usuários, troca de senha e permissões por
            perfil.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f5f7",
  },
  content: {
    padding: 20,
    gap: 14,
  },
  hero: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#dbe4f0",
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f766e",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    color: "#0f172a",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
  },
  actions: {
    marginTop: 4,
    flexDirection: "row",
    gap: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe4f0",
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  userMeta: {
    fontSize: 12,
    color: "#475569",
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    textTransform: "uppercase",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#334155",
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
