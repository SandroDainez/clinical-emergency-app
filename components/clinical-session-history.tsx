import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { loadClinicalSessions, type ClinicalSessionRecord } from "../lib/clinical-session-history";
import { TEMAS } from "../design-system/tokens";
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
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "indisponivel">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");
    loadClinicalSessions().then(({ data, error, indisponivel }) => {
      if (!isMounted) {
        return;
      }
      /**
       * ⚠️⚠️ ESTADO PRÓPRIO — ⛔ e ⛔ NÃO lista vazia.
       *
       * ⛔ "Nenhuma sessão registrada ainda" seria uma afirmação **falsa** sobre
       * o trabalho do médico. Indisponível ⛔ não é vazio, e ⛔ não é erro: é uma
       * decisão operacional que a tela precisa **declarar**.
       */
      if (indisponivel) {
        setStatus("indisponivel");
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

    if (status === "indisponivel") {
      return (
        <View style={styles.rowCentered}>
          <Text style={styles.indisponivelText}>
            {tr("Histórico temporariamente indisponível. Suas sessões estão preservadas — nada foi apagado.")}
          </Text>
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
    backgroundColor: "#383e4a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#565e6c",
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
    borderColor: "#565e6c",
    padding: 14,
    backgroundColor: "#383e4a",
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
    backgroundColor: "#383e4a",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#7fb3ff",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7fb3ff",
  },
  sessionSubtitle: {
    fontSize: 12,
    color: "#aab6c6",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: { fontSize: 11, color: "#aab6c6" },
  rowValue: { fontSize: 11, color: "#aab6c6", fontWeight: "700" },
  placeholder: { fontSize: 14, color: "#aab6c6", textAlign: "center", paddingVertical: 16 },
  rowCentered: { flexDirection: "row", alignItems: "center", gap: 10 },
  loadingText: { fontSize: 13, color: "#aab6c6" },
  errorText: { fontSize: 13, color: "#fca5a5" },
  /**
   * ⚠️ Cor de **aviso**, ⛔ e ⛔ não de erro: ⛔ nada quebrou, algo foi desligado.
   *
   * ⚠️ Vem do token, ⛔ e ⛔ não de um hex novo — este arquivo é legado de cor, e o
   * teto dele ⛔ só desce. A trava de paleta me pegou tentando subir para 17.
   */
  indisponivelText: {
    fontSize: 13,
    color: TEMAS.escuro.cores.warning,
    lineHeight: 19,
  },
});
