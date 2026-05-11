import { Redirect, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthRole, getAuthRole } from "../lib/auth-session";
import { loadAdminUsers, type AdminUserRecord, updateAdminUserStatus } from "../lib/admin-users";
import { supabase } from "../lib/supabase";

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
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  if (role !== "admin") {
    return <Redirect href="/admin-login" />;
  }

  async function refreshUsers() {
    setStatus("loading");
    const { data, errorMessage: loadError } = await loadAdminUsers();
    setUsers(data);
    setErrorMessage(loadError);
    setStatus("idle");
  }

  useEffect(() => {
    void refreshUsers();
  }, []);

  async function handleUserStatusChange(userId: string, nextStatus: AdminUserRecord["status"]) {
    setBusyUserId(userId);
    const { errorMessage: updateError } = await updateAdminUserStatus(userId, nextStatus);
    if (updateError) {
      setErrorMessage(updateError);
      setBusyUserId(null);
      return;
    }
    await refreshUsers();
    setBusyUserId(null);
  }

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
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.email ?? "Sem e-mail"}</Text>
          <Text style={styles.userMeta}>Nome: {user.nome || "—"}</Text>
          <Text style={styles.userMeta}>Perfil: {user.role}</Text>
          <Text style={styles.userMeta}>Pagamento: {user.pagamento}</Text>
          <Text style={styles.userMeta}>Criado em: {formatTimestamp(user.data_criacao)}</Text>
        </View>
        <View style={styles.userActions}>
          <View
            style={[
              styles.statusBadge,
              user.status === "ativo"
                ? styles.confirmedBadge
                : user.status === "bloqueado"
                  ? styles.blockedBadge
                  : styles.pendingBadge,
            ]}>
            <Text
              style={[
                styles.statusText,
                user.status === "ativo"
                  ? styles.confirmedText
                  : user.status === "bloqueado"
                    ? styles.blockedText
                    : styles.pendingText,
              ]}>
              {user.status}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              void handleUserStatusChange(user.id, "ativo");
            }}
            disabled={busyUserId === user.id}
            style={({ pressed }) => [styles.actionButton, styles.allowButton, pressed && styles.buttonPressed, busyUserId === user.id && styles.disabledButton]}>
            <Text style={styles.allowButtonText}>Liberar</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void handleUserStatusChange(user.id, "bloqueado");
            }}
            disabled={busyUserId === user.id}
            style={({ pressed }) => [styles.actionButton, styles.blockButton, pressed && styles.buttonPressed, busyUserId === user.id && styles.disabledButton]}>
            <Text style={styles.blockButtonText}>Bloquear</Text>
          </Pressable>
          <Text style={styles.busyHint}>{busyUserId === user.id ? "Atualizando..." : " "}</Text>
        </View>
      </View>
    ));
  }, [status, errorMessage, users, busyUserId]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Administração</Text>
          <Text style={styles.title}>Usuários e autorização</Text>
          <Text style={styles.description}>Aqui você aprova, bloqueia e revisa o perfil de cada usuário.</Text>
          <View style={styles.actions}>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} onPress={() => void refreshUsers()}>
              <Text style={styles.secondaryButtonText}>Atualizar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => {
                void supabase?.auth.signOut();
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
          <Text style={styles.cardTitle}>Regras de liberação</Text>
          <Text style={styles.infoText}>
            Usuários com status `ativo` entram no app; `pendente` e `bloqueado` ficam sem acesso.
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  userInfo: {
    gap: 2,
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
    alignSelf: "flex-start",
  },
  confirmedBadge: {
    backgroundColor: "#dcfce7",
  },
  pendingBadge: {
    backgroundColor: "#fee2e2",
  },
  blockedBadge: {
    backgroundColor: "#fecaca",
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
  blockedText: {
    color: "#7f1d1d",
  },
  userActions: {
    gap: 8,
    marginTop: 2,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  allowButton: {
    backgroundColor: "#16a34a",
  },
  allowButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  blockButton: {
    backgroundColor: "#dc2626",
  },
  blockButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  busyHint: {
    fontSize: 11,
    color: "#64748b",
    minHeight: 14,
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
  disabledButton: {
    opacity: 0.65,
  },
});
