import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ClinicalSessionRecord } from "../lib/clinical-session-history";
import ClinicalSessionSummary from "./clinical-session-summary";
import ClinicalSessionTimeline from "./clinical-session-timeline";
import { palette, spacing, typography } from "./protocol-screen/design-tokens";

type SessionDebriefProps = {
  session: ClinicalSessionRecord;
};

export default function ClinicalSessionDebrief({ session }: SessionDebriefProps) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.sessionInfo}>
        <Text style={styles.label}>Protocolo</Text>
        <Text style={styles.value}>{session.module_key}</Text>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{session.status}</Text>
        <View style={styles.lineRow}>
          <View>
            <Text style={styles.label}>Iniciado em</Text>
            <Text style={styles.value}>{formatTimestamp(session.created_at)}</Text>
          </View>
          <View>
            <Text style={styles.label}>Encerrado em</Text>
            <Text style={styles.value}>{formatTimestamp(session.ended_at)}</Text>
          </View>
        </View>
      </View>
      <ClinicalSessionSummary sessionOverrideId={session.id} />
      <ClinicalSessionTimeline sessionOverrideId={session.id} />
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  sessionInfo: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: {
    ...typography.small,
    color: palette.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    ...typography.body,
    color: palette.text,
    fontWeight: "700",
  },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
