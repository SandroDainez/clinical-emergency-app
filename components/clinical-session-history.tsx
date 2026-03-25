import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { loadClinicalSessions, type ClinicalSessionRecord } from "../lib/clinical-session-history";
import { palette, spacing, typography } from "./protocol-screen/design-tokens";

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
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      );
    }

    if (status === "error") {
      return <Text style={styles.errorText}>{errorMessage ?? "Não foi possível carregar o histórico."}</Text>;
    }

    if (sessions.length === 0) {
      return <Text style={styles.placeholder}>Nenhuma sessão registrada ainda.</Text>;
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
          <Text style={styles.rowLabel}>Iniciado</Text>
          <Text style={styles.rowValue}>{formatTimestamp(session.created_at)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Encerrado</Text>
          <Text style={styles.rowValue}>{formatTimestamp(session.ended_at)}</Text>
        </View>
      </Pressable>
    ));
  }, [sessions, status, errorMessage, onSelect, router]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Histórico de sessões</Text>
      <View style={styles.content}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: palette.text,
  },
  content: {
    gap: spacing.sm,
  },
  sessionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: spacing.sm,
    backgroundColor: palette.surfaceAlt,
    gap: spacing.xs,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionModule: {
    ...typography.body,
    fontWeight: "700",
    color: palette.text,
  },
  statusBadge: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    ...typography.small,
    color: palette.primary,
  },
  sessionSubtitle: {
    ...typography.small,
    color: palette.textSecondary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    ...typography.small,
    color: palette.textSecondary,
  },
  rowValue: {
    ...typography.small,
    color: palette.text,
    fontWeight: "700",
  },
  placeholder: {
    ...typography.body,
    color: palette.textSecondary,
  },
  rowCentered: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.small,
    color: palette.textSecondary,
  },
  errorText: {
    ...typography.small,
    color: palette.critical,
  },
});
