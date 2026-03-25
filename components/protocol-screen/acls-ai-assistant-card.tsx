import { Pressable, Text, View } from "react-native";
import type { AclsAiInsight } from "../../lib/acls-ai";
import { styles } from "./protocol-screen-styles";

type AclsAiAssistantCardProps = {
  insight: AclsAiInsight | null;
  status: "idle" | "loading" | "ready" | "error";
  errorMessage?: string;
  onRefresh: () => void;
};

function AclsAiAssistantCard({
  insight,
  status,
  errorMessage,
  onRefresh,
}: AclsAiAssistantCardProps) {
  return (
    <View style={styles.aiAssistantCard}>
      <View style={styles.aiAssistantHeader}>
        <View style={styles.aiAssistantHeaderCopy}>
          <Text style={styles.aiAssistantEyebrow}>Assistente IA</Text>
          <Text style={styles.aiAssistantTitle}>Leitura operacional do caso</Text>
        </View>
        <Pressable style={styles.aiAssistantRefreshButton} onPress={onRefresh}>
          <Text style={styles.aiAssistantRefreshButtonText}>
            {status === "loading" ? "Atualizando..." : "Atualizar"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.aiAssistantNote}>
        IA assistiva. Não altera choque, drogas, ROSC ou o fluxo principal do ACLS.
      </Text>

      {status === "loading" ? (
        <Text style={styles.aiAssistantBody}>
          Atualizando leitura contextual do caso a partir do estado atual e da timeline.
        </Text>
      ) : null}

      {status === "error" ? (
        <Text style={styles.aiAssistantError}>
          {errorMessage || "Não foi possível consultar a IA neste momento."}
        </Text>
      ) : null}

      {insight ? (
        <View style={styles.aiAssistantContent}>
          <Text style={styles.aiAssistantBody}>{insight.summary}</Text>

          {insight.focusNow.length > 0 ? (
            <View style={styles.aiAssistantSection}>
              <Text style={styles.aiAssistantSectionTitle}>Foco agora</Text>
              {insight.focusNow.map((item) => (
                <Text key={item} style={styles.aiAssistantListItem}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}

          {insight.pendingActions.length > 0 ? (
            <View style={styles.aiAssistantSection}>
              <Text style={styles.aiAssistantSectionTitle}>Pendências visíveis</Text>
              {insight.pendingActions.map((item) => (
                <Text key={item} style={styles.aiAssistantListItem}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}

          {insight.attentionChecks.length > 0 ? (
            <View style={styles.aiAssistantSection}>
              <Text style={styles.aiAssistantSectionTitle}>Vale checar</Text>
              {insight.attentionChecks.map((item) => (
                <Text key={item} style={styles.aiAssistantListItem}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}

          <Text style={styles.aiAssistantRationale}>{insight.rationale}</Text>
          <Text style={styles.aiAssistantSafety}>{insight.safetyNote}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default AclsAiAssistantCard;
