import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";

import { useAuth } from "@/components/auth-provider";
import { AppDesign } from "@/constants/app-design";
import { createAdminUser, listAdminUsers, updateAdminUser } from "@/lib/admin-users";
import type { AppUserPaymentStatus, AppUserProfile, AppUserRole, AppUserStatus } from "@/lib/auth";

type DashboardStats = {
  total: number;
  ativos: number;
  pendentes: number;
  bloqueados: number;
};

const EMPTY_STATS: DashboardStats = {
  total: 0,
  ativos: 0,
  pendentes: 0,
  bloqueados: 0,
};

export default function AdminScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<AppUserProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createStatus, setCreateStatus] = useState<AppUserStatus>("ativo");
  const [createPayment, setCreatePayment] = useState<AppUserPaymentStatus>("nao_pago");
  const [createRole, setCreateRole] = useState<AppUserRole>("user");

  const paidCount = useMemo(() => users.filter((user) => user.pagamento === "pago").length, [users]);

  async function loadDashboard() {
    setLoading(true);
    setErrorText(null);
    try {
      const result = await listAdminUsers();
      setUsers(result.users);
      setStats(result.stats);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Falha ao carregar painel administrativo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    void loadDashboard();
  }, [isAdmin]);

  async function mutateUser(userId: string, patch: { status?: AppUserStatus; pagamento?: AppUserPaymentStatus }) {
    setBusyUserId(userId);
    setErrorText(null);
    setSuccessText(null);
    try {
      await updateAdminUser({ userId, ...patch });
      await loadDashboard();
      setSuccessText("Usuário atualizado com sucesso.");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Falha ao atualizar usuário.");
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleCreateUser() {
    setLoading(true);
    setErrorText(null);
    setSuccessText(null);
    try {
      await createAdminUser({
        nome: createName,
        email: createEmail,
        password: createPassword,
        status: createStatus,
        pagamento: createPayment,
        role: createRole,
      });
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateStatus("ativo");
      setCreatePayment("nao_pago");
      setCreateRole("user");
      await loadDashboard();
      setSuccessText("Usuário criado manualmente.");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Falha ao criar usuário.");
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return <Redirect href="/(tabs)/explore" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>Admin Dashboard</Text>
          <Text style={styles.title}>Controle administrativo</Text>
          <Text style={styles.subtitle}>
            Aprove, bloqueie ou libere usuários, acompanhe pagamento e crie contas manualmente.
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.replace("/(tabs)/explore")}>
            <Text style={styles.backButtonText}>Voltar para Mais</Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Total" value={stats.total} accent="#0f172a" />
          <StatCard label="Ativos" value={stats.ativos} accent="#166534" />
          <StatCard label="Pendentes" value={stats.pendentes} accent="#b45309" />
          <StatCard label="Bloqueados" value={stats.bloqueados} accent="#b91c1c" />
          <StatCard label="Pagos" value={paidCount} accent="#1d4ed8" />
        </View>

        {errorText ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Falha administrativa</Text>
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        ) : null}

        {successText ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Operação concluída</Text>
            <Text style={styles.successText}>{successText}</Text>
          </View>
        ) : null}

        <View style={styles.createCard}>
          <Text style={styles.sectionTitle}>Criar usuário manualmente</Text>
          <TextInput value={createName} onChangeText={setCreateName} placeholder="Nome completo" placeholderTextColor="#7b8798" style={styles.input} />
          <TextInput value={createEmail} onChangeText={setCreateEmail} placeholder="email@hospital.org" placeholderTextColor="#7b8798" autoCapitalize="none" style={styles.input} />
          <TextInput value={createPassword} onChangeText={setCreatePassword} placeholder="Senha inicial" placeholderTextColor="#7b8798" secureTextEntry style={styles.input} />
          <View style={styles.inlineGroup}>
            <SelectPill active={createStatus === "ativo"} label="Ativo" onPress={() => setCreateStatus("ativo")} />
            <SelectPill active={createStatus === "pendente"} label="Pendente" onPress={() => setCreateStatus("pendente")} />
            <SelectPill active={createStatus === "bloqueado"} label="Bloqueado" onPress={() => setCreateStatus("bloqueado")} />
          </View>
          <View style={styles.inlineGroup}>
            <SelectPill active={createPayment === "pago"} label="Pago" onPress={() => setCreatePayment("pago")} />
            <SelectPill active={createPayment === "nao_pago"} label="Não pago" onPress={() => setCreatePayment("nao_pago")} />
            <SelectPill active={createRole === "admin"} label="Admin" onPress={() => setCreateRole("admin")} />
            <SelectPill active={createRole === "user"} label="User" onPress={() => setCreateRole("user")} />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => void handleCreateUser()}>
            <Text style={styles.primaryButtonText}>{loading ? "Salvando..." : "Criar usuário"}</Text>
          </Pressable>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Gestão de usuários</Text>
          {loading ? <Text style={styles.mutedText}>Carregando usuários...</Text> : null}
          {users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userHeaderText}>
                  <Text style={styles.userName}>{user.nome || "Sem nome"}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    user.status === "ativo" && styles.statusBadgeActive,
                    user.status === "pendente" && styles.statusBadgePending,
                    user.status === "bloqueado" && styles.statusBadgeBlocked,
                  ]}>
                  <Text style={styles.statusBadgeText}>{user.status}</Text>
                </View>
              </View>

              <Text style={styles.userMeta}>Pagamento: {user.pagamento} • Role: {user.role}</Text>
              <Text style={styles.userMeta}>Criado em: {new Date(user.data_criacao).toLocaleString("pt-BR")}</Text>

              <View style={styles.actionRow}>
                {user.status === "pendente" ? (
                  <ActionButton label="Aprovar" tone="success" onPress={() => void mutateUser(user.id, { status: "ativo" })} busy={busyUserId === user.id} />
                ) : null}
                {user.status === "ativo" ? (
                  <ActionButton label="Bloquear" tone="danger" onPress={() => void mutateUser(user.id, { status: "bloqueado" })} busy={busyUserId === user.id} />
                ) : null}
                {user.status === "bloqueado" ? (
                  <ActionButton label="Liberar" tone="success" onPress={() => void mutateUser(user.id, { status: "ativo" })} busy={busyUserId === user.id} />
                ) : null}
                <ActionButton
                  label={user.pagamento === "pago" ? "Marcar não pago" : "Marcar pago"}
                  tone="neutral"
                  onPress={() => void mutateUser(user.id, { pagamento: user.pagamento === "pago" ? "nao_pago" : "pago" })}
                  busy={busyUserId === user.id}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SelectPill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.selectPill, active && styles.selectPillActive]} onPress={onPress}>
      <Text style={[styles.selectPillText, active && styles.selectPillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  tone,
  onPress,
  busy,
}: {
  label: string;
  tone: "success" | "danger" | "neutral";
  onPress: () => void;
  busy: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        tone === "success" && styles.actionSuccess,
        tone === "danger" && styles.actionDanger,
      ]}
      onPress={onPress}
      disabled={busy}>
      <Text style={styles.actionButtonText}>{busy ? "..." : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppDesign.canvas.tealBackdrop,
  },
  content: {
    padding: 18,
    gap: 16,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  headerCard: {
    borderRadius: 28,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#dbeafe",
    padding: 24,
    gap: 8,
    ...AppDesign.shadow.hero,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#1d4ed8",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    minWidth: 140,
    flexGrow: 1,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    padding: 18,
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  errorBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    padding: 14,
    gap: 4,
  },
  errorTitle: {
    color: "#991b1b",
    fontWeight: "900",
  },
  errorText: {
    color: "#991b1b",
    lineHeight: 20,
  },
  successBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
    padding: 14,
    gap: 4,
  },
  successTitle: {
    color: "#166534",
    fontWeight: "900",
  },
  successText: {
    color: "#166534",
    lineHeight: 20,
  },
  createCard: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    padding: 18,
    gap: 12,
  },
  listCard: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  inlineGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectPillActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#60a5fa",
  },
  selectPillText: {
    color: "#475569",
    fontWeight: "800",
  },
  selectPillTextActive: {
    color: "#1d4ed8",
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  mutedText: {
    color: "#64748b",
  },
  userCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 14,
    gap: 8,
  },
  userHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  userHeaderText: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
  },
  userEmail: {
    fontSize: 13,
    color: "#475569",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#e2e8f0",
  },
  statusBadgeActive: {
    backgroundColor: "#dcfce7",
  },
  statusBadgePending: {
    backgroundColor: "#fef3c7",
  },
  statusBadgeBlocked: {
    backgroundColor: "#fee2e2",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    color: "#334155",
  },
  userMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionSuccess: {
    backgroundColor: "#dcfce7",
  },
  actionDanger: {
    backgroundColor: "#fee2e2",
  },
  actionButtonText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 12,
  },
});
