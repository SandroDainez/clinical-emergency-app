import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { getCurrentClinicalSessionId } from "../lib/clinical-session-store";
import { loadClinicalSessionEvents, type ClinicalSessionEvent } from "../lib/clinical-session-summary";
import { palette, spacing, typography } from "./protocol-screen/design-tokens";

const EVENT_BADGES: Record<string, { background: string; text: string }> = {
  protocol_opened: { background: "#e0f2fe", text: palette.primary },
  rhythm_selected: { background: "#ede9fe", text: palette.primaryDark },
  shock_performed: { background: "#fee2e2", text: palette.critical },
  medication_administered: { background: "#ecfdf5", text: palette.success },
  step_confirmed: { background: "#fef9c3", text: palette.text },
  protocol_completed: { background: "#d1fae5", text: palette.success },
};

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const METADATA_LABELS: Record<string, string> = {
  rhythm: "Ritmo",
  medication: "Medicamento",
  dose: "Dose",
  joules: "Joules",
  stateId: "Estado",
  step: "Passo",
  outcome: "Resultado",
  module_key: "Módulo",
  count: "Contagem",
};

function formatEventData(data?: Record<string, any>) {
  if (!data) {
    return "";
  }

  const summary = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${METADATA_LABELS[key] ?? key}: ${String(value)}`)
    .slice(0, 3);

  return summary.join(" • ");
}

function formatTimestamp(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return TIME_FORMATTER.format(date);
}

export default function ClinicalSessionTimeline({
  sessionOverrideId,
}: {
  sessionOverrideId?: string;
}) {
  const [events, setEvents] = useState<ClinicalSessionEvent[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentSessionId = getCurrentClinicalSessionId();
  const sessionId = sessionOverrideId ?? currentSessionId;

  useEffect(() => {
    if (!sessionId) {
      setEvents([]);
      setStatus("idle");
      setErrorMessage(null);
      return;
    }

    let isMounted = true;
    setStatus("loading");

    loadClinicalSessionEvents(sessionId).then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Não foi possível carregar eventos clínicos", error);
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }

      setEvents(data);
      setStatus("idle");
    });

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const content = useMemo(() => {
    if (!sessionId) {
      return <Text style={styles.placeholder}>Nenhuma sessão ativa no momento.</Text>;
    }

    if (status === "loading") {
    return (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator color={palette.primary} size="small" />
          <Text style={styles.loadingText}>Carregando eventos...</Text>
        </View>
      );
    }

    if (status === "error") {
      return <Text style={styles.errorText}>{errorMessage ?? "Falha ao carregar eventos"}</Text>;
    }

    if (events.length === 0) {
      return <Text style={styles.placeholder}>Nenhum evento registrado ainda.</Text>;
    }

    return events.map((event) => {
      const badge = EVENT_BADGES[event.event_type] ?? {
        background: palette.surfaceAlt,
        text: palette.text,
      };
      const metadata = formatEventData(event.event_data);

      return (
        <View key={event.id} style={styles.eventRow}>
          <View style={styles.eventHeader}>
            <View style={[styles.badge, { backgroundColor: badge.background }]}>
              <Text style={{ ...typography.small, color: badge.text, fontWeight: "700" }}>
                {event.event_type}
              </Text>
            </View>
            <Text style={styles.timestamp}>{formatTimestamp(event.created_at)}</Text>
          </View>
          <Text style={styles.eventLabel}>{event.event_label}</Text>
          {metadata ? <Text style={styles.eventMeta}>{metadata}</Text> : null}
        </View>
      );
    });
  }, [events, status, sessionId, errorMessage]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Linha do tempo clínica</Text>
      <ScrollView style={styles.timelineContent} contentContainerStyle={styles.timelineContainer}>{content}</ScrollView>
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
  timelineContent: {
    maxHeight: 260,
  },
  timelineContainer: {
    gap: spacing.sm,
  },
  eventRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: spacing.sm,
    backgroundColor: palette.surfaceAlt,
    gap: spacing.xs,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  timestamp: {
    ...typography.small,
    color: palette.muted,
  },
  eventLabel: {
    ...typography.body,
    color: palette.text,
    fontWeight: "600",
  },
  eventMeta: {
    ...typography.small,
    color: palette.textSecondary,
  },
  placeholder: {
    ...typography.body,
    color: palette.textSecondary,
  },
  loadingWrapper: {
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
