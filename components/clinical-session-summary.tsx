import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { getCurrentClinicalSessionId } from "../lib/clinical-session-store";
import {
  buildClinicalSessionSummary,
  loadClinicalSessionEvents,
  type ClinicalSessionSummary as ClinicalSessionSummaryModel,
} from "../lib/clinical-session-summary";
import { palette, spacing, typography } from "./protocol-screen/design-tokens";

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatTimestamp(value?: string) {
  if (!value) {
    return "";
  }

  return TIME_FORMATTER.format(new Date(value));
}

function formatMedications(medications: Record<string, number>) {
  const entries = Object.entries(medications);
  if (entries.length === 0) {
    return "—";
  }

  return entries
    .map(([medication, count]) => `${medication === "epinephrine" ? "Adrenalina" : "Amiodarona"}: ${count}`)
    .join(" • ");
}

export default function ClinicalSessionSummary({
  sessionOverrideId,
}: {
  sessionOverrideId?: string;
}) {
  const [summary, setSummary] = useState<ClinicalSessionSummaryModel | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentSessionId = getCurrentClinicalSessionId();
  const sessionId = sessionOverrideId ?? currentSessionId;

  useEffect(() => {
    if (!sessionId) {
      setSummary(null);
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
        console.error("Não foi possível carregar resumo clínico", error);
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }

      setSummary(buildClinicalSessionSummary(data));
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
        <View style={styles.loadingRow}>
          <ActivityIndicator color={palette.primary} size="small" />
          <Text style={styles.loadingText}>Gerando resumo...</Text>
        </View>
      );
    }

    if (status === "error") {
      return <Text style={styles.errorText}>{errorMessage ?? "Falha ao gerar resumo"}</Text>;
    }

    if (!summary) {
      return <Text style={styles.placeholder}>Nenhum evento registrado ainda.</Text>;
    }

    const rhythmText = summary.rhythms.length
      ? summary.rhythms
          .map((rhythm) => (rhythm.includes("shockable") ? "Chocável" : "Não chocável"))
          .join(" • ")
      : "—";

    const rows = [
      {
        label: "Protocolo aberto",
        value: summary.protocolOpenedAt ? formatTimestamp(summary.protocolOpenedAt) : "—",
      },
      { label: "Ritmos selecionados", value: rhythmText },
      { label: "Choques aplicados", value: String(summary.shockCount) },
      { label: "Medicações", value: formatMedications(summary.medications) },
      { label: "Passos confirmados", value: String(summary.stepsConfirmed) },
      { label: "Protocolo encerrado", value: summary.completed ? "Sim" : "Não" },
    ];

    return rows.map((row) => (
      <View key={row.label} style={styles.row}>
        <Text style={styles.rowLabel}>{row.label}</Text>
        <Text style={styles.rowValue}>{row.value}</Text>
      </View>
    ));
  }, [summary, sessionId, status, errorMessage]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Resumo da sessão</Text>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  rowLabel: {
    ...typography.small,
    color: palette.textSecondary,
  },
  rowValue: {
    ...typography.body,
    color: palette.text,
    fontWeight: "700",
  },
  placeholder: {
    ...typography.body,
    color: palette.textSecondary,
  },
  loadingRow: {
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
