import { Pressable, Text, View } from "react-native";
import { ACLS_COPY } from "../../acls/microcopy";
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
          <Text style={styles.aiAssistantEyebrow}>{ACLS_COPY.operational.sections.assistant}</Text>
          <Text style={styles.aiAssistantTitle}>{ACLS_COPY.operational.assistant.summary}</Text>
        </View>
        <Pressable style={styles.aiAssistantRefreshButton} onPress={onRefresh}>
          <Text style={styles.aiAssistantRefreshButtonText}>
            {status === "loading"
              ? ACLS_COPY.operational.assistant.refreshing
              : ACLS_COPY.operational.assistant.refresh}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.aiAssistantNote}>
        {ACLS_COPY.operational.assistant.supportNote}
      </Text>

      {status === "loading" ? (
        <Text style={styles.aiAssistantBody}>{ACLS_COPY.operational.assistant.readingCurrentCase}</Text>
      ) : null}

      {status === "error" ? (
        <Text style={styles.aiAssistantError}>
          {errorMessage || ACLS_COPY.operational.assistant.unavailable}
        </Text>
      ) : null}

      {insight ? (
        <View style={styles.aiAssistantContent}>
          <Text style={styles.aiAssistantBody}>{insight.summary}</Text>

          {insight.focusNow.length > 0 ? (
            <View style={styles.aiAssistantSection}>
              <Text style={styles.aiAssistantSectionTitle}>{ACLS_COPY.operational.sections.focusNow}</Text>
              {insight.focusNow.map((item) => (
                <Text key={item} style={styles.aiAssistantListItem}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}

          {insight.pendingActions.length > 0 ? (
            <View style={styles.aiAssistantSection}>
              <Text style={styles.aiAssistantSectionTitle}>{ACLS_COPY.operational.sections.pending}</Text>
              {insight.pendingActions.map((item) => (
                <Text key={item} style={styles.aiAssistantListItem}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}

          {insight.attentionChecks.length > 0 ? (
            <View style={styles.aiAssistantSection}>
              <Text style={styles.aiAssistantSectionTitle}>{ACLS_COPY.operational.sections.check}</Text>
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
