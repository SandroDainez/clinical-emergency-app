import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ClinicalSessionDebrief from "../../components/clinical-session-debrief";
import { loadClinicalSessionById, type ClinicalSessionRecord } from "../../lib/clinical-session-history";
import { palette, spacing, typography } from "../../components/protocol-screen/design-tokens";
import { useEffect, useState } from "react";

function formatTimestamp(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SessionHistoryDetailScreen() {
  const { sessionId } = useLocalSearchParams();
  const id = typeof sessionId === "string" ? sessionId : null;
  const [session, setSession] = useState<ClinicalSessionRecord | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;
    setStatus("loading");

    loadClinicalSessionById(id).then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Falha ao carregar sessão", error);
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }

      setSession(data);
      setStatus("idle");
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const subtitle = session
    ? `Status ${session.status} • ${formatTimestamp(session.created_at)}`
    : "Carregando sessão...";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Detalhes da sessão</Text>
          <Text style={styles.title}>{session ? session.module_key : "Sessão clínica"}</Text>
          <Text style={styles.description}>{subtitle}</Text>
        </View>
        {status === "loading" ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.loadingText}>Carregando dados da sessão...</Text>
          </View>
        ) : status === "error" ? (
          <Text style={styles.errorText}>{errorMessage ?? "Não foi possível carregar a sessão."}</Text>
        ) : null}
        {session ? (
          <ClinicalSessionDebrief session={session} />
        ) : null}
      </ScrollView>
    </View>
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
    padding: 24,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#7c2d12",
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: "#111827",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
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
