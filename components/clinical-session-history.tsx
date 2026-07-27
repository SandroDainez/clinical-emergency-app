import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { loadClinicalSessions, type ClinicalSessionRecord } from "../lib/clinical-session-history";
import { useTr } from "../lib/use-tr";

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTimestamp(value?: string | null) {
  if (!value) {
    return "—";
  }
  return TIME_FORMATTER.format(new Date(value));
}

function buildSubtitle(session: ClinicalSessionRecord) {
  if (session.status === "completed" && session.ended_at) {
    return `Encerrado em ${formatTimestamp(session.ended_at)}`;
  }
  if (session.status === "started") {
    return "Em andamento";
  }
  return `Status: ${session.status}`;
}

export default function ClinicalSessionHistory({
  onSelect,
}: {
  onSelect?: (session: ClinicalSessionRecord) => void;
}) {
  const tr = useTr();
  const [sessions, setSessions] = useState<ClinicalSessionRecord[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");
    loadClinicalSessions().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }
      if (error) {
        console.error("Não foi possível carregar histórico de sessões", error);
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }
      setSessions(data);
      setStatus("idle");
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => {
    if (status === "loading") {
      return (
        <View style={styles.rowCentered}>
          <ActivityIndicator color="#22d3ee" />
          <Text style={styles.loadingText}>{tr("Carregando histórico...")}</Text>
        </View>
      );
    }

    if (status === "error") {
      return <Text style={styles.errorText}>{errorMessage ?? "Não foi possível carregar o histórico."}</Text>;
    }

    if (sessions.length === 0) {
      return <Text style={styles.placeholder}>{tr("Nenhuma sessão registrada ainda.")}</Text>;
    }

    return sessions.map((session) => (
      <Pressable
        key={session.id}
        style={styles.sessionCard}
        onPress={() => {
          onSelect?.(session);
          router.push(`/session-history/${session.id}`);
        }}
        android_ripple={{ color: "rgba(37,99,235,0.1)" }}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionModule}>{session.module_key}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{session.status}</Text>
          </View>
        </View>
        <Text style={styles.sessionSubtitle}>{buildSubtitle(session)}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{tr("Iniciado")}</Text>
          <Text style={styles.rowValue}>{formatTimestamp(session.created_at)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{tr("Encerrado")}</Text>
          <Text style={styles.rowValue}>{formatTimestamp(session.ended_at)}</Text>
        </View>
      </Pressable>
    ));
  }, [sessions, status, errorMessage, onSelect, router]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{tr("Histórico de sessões")}</Text>
      <View style={styles.content}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
  },
  content: { gap: 10 },
  sessionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 14,
    backgroundColor: "#0f172a",
    gap: 6,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionModule: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  statusBadge: {
    backgroundColor: "#164e63",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#0e7490",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#22d3ee",
  },
  sessionSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: { fontSize: 11, color: "#475569" },
  rowValue: { fontSize: 11, color: "#94a3b8", fontWeight: "700" },
  placeholder: { fontSize: 14, color: "#475569", textAlign: "center", paddingVertical: 16 },
  rowCentered: { flexDirection: "row", alignItems: "center", gap: 10 },
  loadingText: { fontSize: 13, color: "#64748b" },
  errorText: { fontSize: 13, color: "#f87171" },
});
