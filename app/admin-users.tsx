import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  loadAdminUsers,
  updateAdminUserPagamento,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUserRecord,
} from "../lib/admin-users";
import { clearAuthRole, getAuthRole } from "../lib/auth-session";
import { supabase } from "../lib/supabase";
import { useTr } from "../lib/use-tr";

// ─── helpers ────────────────────────────────────────────────────────────────

const DT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function fmt(v: string | null) {
  if (!v) return "—";
  return DT.format(new Date(v));
}

type Filter = "todos" | "ativo" | "pendente" | "bloqueado";

// ─── component ──────────────────────────────────────────────────────────────

export default function AdminUsersScreen() {
  const tr = useTr();
  const router = useRouter();
  const role = getAuthRole();

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("todos");

  if (role !== "admin") return <Redirect href="/" />;

  // ── data loading ──
  const fetchUsers = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setInitialLoading(true);
    setLoadError(null);

    const { data, errorMessage } = await loadAdminUsers();
    setUsers(data);
    setLoadError(errorMessage);

    if (showRefresh) setRefreshing(false);
    else setInitialLoading(false);
  }, []);

  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  // ── actions ──
  async function doAction(
    userId: string,
    fn: () => Promise<{ errorMessage: string | null }>
  ) {
    setBusyId(userId);
    setActionError(null);
    const { errorMessage } = await fn();
    if (errorMessage) setActionError(errorMessage);
    else await fetchUsers();
    setBusyId(null);
  }

  // ── derived ──
  const stats = useMemo(() => ({
    total: users.length,
    ativos: users.filter((u) => u.status === "ativo").length,
    pendentes: users.filter((u) => u.status === "pendente").length,
    bloqueados: users.filter((u) => u.status === "bloqueado").length,
    pagos: users.filter((u) => u.pagamento === "pago").length,
  }), [users]);

  const visible = useMemo(
    () => (filter === "todos" ? users : users.filter((u) => u.status === filter)),
    [users, filter]
  );

  // ── logout ──
  function handleLogout() {
    void supabase?.auth.signOut();
    clearAuthRole();
    router.replace("/");
  }

  // ── render ──
  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void fetchUsers(true)}
            tintColor="#22d3ee"
          />
        }>

        {/* ── header ── */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.eyebrow}>{tr("Painel de administração")}</Text>
              <Text style={s.title}>{tr("Utilizadores")}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [s.logoutBtn, pressed && { opacity: 0.7 }]}
              onPress={handleLogout}>
              <Text style={s.logoutText}>{tr("Sair")}</Text>
            </Pressable>
          </View>

          {/* stats strip */}
          <View style={s.statsRow}>
            <StatPill label={tr("Total")} value={stats.total} color="#94a3b8" />
            <StatPill label={tr("Ativos")} value={stats.ativos} color="#4ade80" />
            <StatPill label={tr("Pendentes")} value={stats.pendentes} color="#fbbf24" />
            <StatPill label={tr("Bloqueados")} value={stats.bloqueados} color="#f87171" />
            <StatPill label={tr("Pagos")} value={stats.pagos} color="#22d3ee" />
          </View>
        </View>

        {/* ── filter tabs ── */}
        <View style={s.filterRow}>
          {(["todos", "ativo", "pendente", "bloqueado"] as Filter[]).map((f) => (
            <Pressable
              key={f}
              style={[s.filterTab, filter === f && s.filterTabActive]}
              onPress={() => setFilter(f)}>
              <Text style={[s.filterTabText, filter === f && s.filterTabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── global action error ── */}
        {actionError ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{actionError}</Text>
            <Pressable onPress={() => setActionError(null)}>
              <Text style={s.errorDismiss}>{tr("Fechar")}</Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── body ── */}
        {initialLoading ? (
          <View style={s.centred}>
            <ActivityIndicator color="#22d3ee" size="large" />
            <Text style={s.loadingText}>{tr("A carregar utilizadores…")}</Text>
          </View>
        ) : loadError ? (
          <View style={s.errorCard}>
            <Text style={s.errorCardTitle}>{tr("Erro ao carregar")}</Text>
            <Text style={s.errorCardBody}>{loadError}</Text>
            <Pressable style={s.retryBtn} onPress={() => void fetchUsers()}>
              <Text style={s.retryBtnText}>{tr("Tentar novamente")}</Text>
            </Pressable>
          </View>
        ) : visible.length === 0 ? (
          <View style={s.centred}>
            <Text style={s.emptyText}>
              {filter === "todos" ? "Nenhum utilizador encontrado." : `Sem utilizadores com status "${filter}".`}
            </Text>
          </View>
        ) : (
          visible.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              busy={busyId === user.id}
              onStatus={(st) => doAction(user.id, () => updateAdminUserStatus(user.id, st))}
              onRole={(r) => doAction(user.id, () => updateAdminUserRole(user.id, r))}
              onPagamento={(p) => doAction(user.id, () => updateAdminUserPagamento(user.id, p))}
            />
          ))
        )}

        {/* spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── UserRow ─────────────────────────────────────────────────────────────────

type UserRowProps = {
  user: AdminUserRecord;
  busy: boolean;
  onStatus: (s: AdminUserRecord["status"]) => void;
  onRole: (r: AdminUserRecord["role"]) => void;
  onPagamento: (p: AdminUserRecord["pagamento"]) => void;
};

function UserRow({ user, busy, onStatus, onRole, onPagamento }: UserRowProps) {
  const tr = useTr();
  const statusColor =
    user.status === "ativo" ? "#4ade80"
    : user.status === "bloqueado" ? "#f87171"
    : "#fbbf24";

  const statusBg =
    user.status === "ativo" ? "rgba(74,222,128,0.12)"
    : user.status === "bloqueado" ? "rgba(248,113,113,0.12)"
    : "rgba(251,191,36,0.12)";

  return (
    <View style={s.row}>
      {/* top: email + status badge */}
      <View style={s.rowHead}>
        <View style={{ flex: 1 }}>
          <Text style={s.rowEmail} numberOfLines={1}>{user.email ?? "—"}</Text>
          {user.nome ? <Text style={s.rowNome}>{user.nome}</Text> : null}
        </View>
        <View style={[s.statusBadge, { backgroundColor: statusBg, borderColor: statusColor + "44" }]}>
          <View style={[s.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[s.statusBadgeText, { color: statusColor }]}>{user.status}</Text>
        </View>
      </View>

      {/* meta row */}
      <View style={s.metaRow}>
        <MetaChip
          label={tr("Perfil")}
          value={user.role}
          color={user.role === "admin" ? "#c4b5fd" : "#94a3b8"}
        />
        <MetaChip
          label={tr("Pagamento")}
          value={user.pagamento === "pago" ? "Pago ✓" : "Não pago"}
          color={user.pagamento === "pago" ? "#4ade80" : "#64748b"}
        />
        <MetaChip label={tr("Criado")} value={fmtShort(user.data_criacao)} color="#64748b" />
        <MetaChip label={tr("Último acesso")} value={fmtShort(user.ultimo_acesso)} color="#64748b" />
      </View>

      {/* actions */}
      {busy ? (
        <View style={s.busyRow}>
          <ActivityIndicator color="#22d3ee" size="small" />
          <Text style={s.busyText}>{tr("A atualizar…")}</Text>
        </View>
      ) : (
        <View style={s.actionsGrid}>
          {/* Status */}
          {user.status !== "ativo" && (
            <ActionBtn label={tr("✓ Liberar")} color="#4ade80" bg="rgba(74,222,128,0.12)" onPress={() => onStatus("ativo")} />
          )}
          {user.status !== "pendente" && (
            <ActionBtn label={tr("⏸ Pendente")} color="#fbbf24" bg="rgba(251,191,36,0.12)" onPress={() => onStatus("pendente")} />
          )}
          {user.status !== "bloqueado" && (
            <ActionBtn label={tr("✕ Bloquear")} color="#f87171" bg="rgba(248,113,113,0.12)" onPress={() => onStatus("bloqueado")} />
          )}

          {/* Role */}
          {user.role === "user" ? (
            <ActionBtn label={tr("↑ Tornar admin")} color="#c4b5fd" bg="rgba(196,181,253,0.12)" onPress={() => onRole("admin")} />
          ) : (
            <ActionBtn label={tr("↓ Remover admin")} color="#94a3b8" bg="rgba(148,163,184,0.12)" onPress={() => onRole("user")} />
          )}

          {/* Payment */}
          {user.pagamento === "nao_pago" ? (
            <ActionBtn label={tr("$ Marcar pago")} color="#22d3ee" bg="rgba(34,211,238,0.12)" onPress={() => onPagamento("pago")} />
          ) : (
            <ActionBtn label={tr("$ Marcar não pago")} color="#64748b" bg="rgba(100,116,139,0.12)" onPress={() => onPagamento("nao_pago")} />
          )}
        </View>
      )}
    </View>
  );
}

// ─── small helpers ────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[s.statPill, { borderColor: color + "33" }]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function MetaChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={s.metaChip}>
      <Text style={s.metaChipLabel}>{label}</Text>
      <Text style={[s.metaChipValue, { color }]}>{value}</Text>
    </View>
  );
}

function ActionBtn({
  label,
  color,
  bg,
  onPress,
}: {
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.actionBtn, { backgroundColor: bg, borderColor: color + "44" }, pressed && { opacity: 0.75 }]}
      onPress={onPress}>
      <Text style={[s.actionBtnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const SHORT_DT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

function fmtShort(v: string | null) {
  if (!v) return "—";
  return SHORT_DT.format(new Date(v));
}

// ─── styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#121417" },
  content: {
    padding: 16,
    paddingTop: 12,
    gap: 12,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },

  // header
  header: {
    backgroundColor: "#1c1f24",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2a2e35",
    gap: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#4d9aff",
    marginBottom: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#f1f5f9",
    letterSpacing: -0.4,
  },
  logoutBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2e35",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#1c1f24",
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
  },

  // stats
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statPill: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 60,
    backgroundColor: "#121417",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
  },

  // filter
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterTab: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#2a2e35",
    backgroundColor: "#1c1f24",
  },
  filterTabActive: {
    backgroundColor: "rgba(14,116,144,0.2)",
    borderColor: "#4d9aff",
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
  },
  filterTabTextActive: {
    color: "#4d9aff",
  },

  // error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(248,113,113,0.1)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: "#fca5a5", fontWeight: "600" },
  errorDismiss: { fontSize: 12, color: "#f87171", fontWeight: "800" },

  errorCard: {
    backgroundColor: "#1c1f24",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
    padding: 20,
    gap: 10,
    alignItems: "flex-start",
  },
  errorCardTitle: { fontSize: 15, fontWeight: "800", color: "#f87171" },
  errorCardBody: { fontSize: 13, color: "#94a3b8", lineHeight: 19 },
  retryBtn: {
    marginTop: 4,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(248,113,113,0.12)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
  },
  retryBtnText: { fontSize: 13, fontWeight: "800", color: "#f87171" },

  // empty / loading
  centred: { paddingVertical: 40, alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#94a3b8" },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center" },

  // user row
  row: {
    backgroundColor: "#1c1f24",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2a2e35",
    padding: 16,
    gap: 12,
  },
  rowHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  rowEmail: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
  },
  rowNome: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // meta chips
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2a2e35",
    backgroundColor: "#121417",
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  metaChipLabel: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#94a3b8",
  },
  metaChipValue: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 1,
  },

  // busy
  busyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  busyText: { fontSize: 13, color: "#94a3b8" },

  // action buttons
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
