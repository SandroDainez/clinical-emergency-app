import { Redirect, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthRole, getAuthRole } from "../lib/auth-session";
import { loadAdminUsers, type AdminUserRecord } from "../lib/admin-users";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  return DATE_TIME_FORMATTER.format(new Date(value));
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const role = getAuthRole();
  const [status, setStatus] = useState<"loading" | "idle">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);

  if (role !== "admin") {
    return <Redirect href="/admin-login" />;
  }

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");

    loadAdminUsers().then(({ data, errorMessage: loadError }) => {
      if (!isMounted) return;
      setUsers(data);
      setErrorMessage(loadError);
      setStatus("idle");
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => {
    if (status === "loading") {
      return <Text style={styles.infoText}>Carregando usuários do Supabase...</Text>;
    }

    if (errorMessage) {
      return <Text style={styles.errorText}>{errorMessage}</Text>;
    }

    if (users.length === 0) {
      return <Text style={styles.infoText}>Nenhum usuário encontrado no Supabase.</Text>;
    }

    return users.map((user) => (
      <View key={user.id} style={styles.userRow}>
        <View>
          <Text style={styles.userName}>{user.email ?? "Sem e-mail"}</Text>
          <Text style={styles.userMeta}>Criado em: {formatTimestamp(user.created_at)}</Text>
          <Text style={styles.userMeta}>Último login: {formatTimestamp(user.last_sign_in_at)}</Text>
        </View>
        <View style={[styles.statusBadge, user.is_confirmed ? styles.confirmedBadge : styles.pendingBadge]}>
          <Text style={[styles.statusText, user.is_confirmed ? styles.confirmedText : styles.pendingText]}>
            {user.is_confirmed ? "confirmado" : "pendente"}
          </Text>
        </View>
      </View>
    ));
  }, [status, errorMessage, users]);

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
          <Text style={styles.cardTitle}>Usuários no Supabase</Text>
          {content}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próximo passo</Text>
          <Text style={styles.infoText}>
            Evoluir para controle de autorização por perfil (admin/user) usando claims e sessão real do Supabase Auth.
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
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  confirmedBadge: {
    backgroundColor: "#dcfce7",
  },
  pendingBadge: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  confirmedText: {
    color: "#166534",
  },
  pendingText: {
    color: "#991b1b",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#334155",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#991b1b",
    fontWeight: "700",
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
