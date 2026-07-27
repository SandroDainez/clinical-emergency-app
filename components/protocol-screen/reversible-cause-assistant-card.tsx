import { Text, View } from "react-native";
import type { ReversibleCauseAssessment } from "../../acls/reversible-cause-assistant";
import { styles } from "./protocol-screen-styles";
import { useTr } from "../../lib/use-tr";

type ReversibleCauseAssistantCardProps = {
  topThree: ReversibleCauseAssessment[];
};

function ReversibleCauseAssistantCard({
  topThree,
}: ReversibleCauseAssistantCardProps) {
  const tr = useTr();
  if (topThree.length === 0) {
    return null;
  }

  return (
    <View style={styles.assistantCard}>
      <Text style={styles.assistantCardEyebrow}>{tr("Sugestões para revisar")}</Text>
      <Text style={styles.assistantCardTitle}>{tr("Causas que podem valer nova checagem agora")}</Text>
      {topThree.map((cause) => (
        <View key={cause.causeId} style={styles.assistantCauseItem}>
          <View style={styles.assistantCauseHeader}>
            <Text style={styles.assistantCauseTitle}>{cause.label}</Text>
            <Text style={styles.assistantCauseBadge}>
              {cause.suspectedLevel === "high"
                ? tr("Mais forte")
                : cause.suspectedLevel === "medium"
                  ? tr("Intermediária")
                  : tr("Mais fraca")}
            </Text>
          </View>
          <Text style={styles.assistantCauseText}>{cause.explanation}</Text>
          {cause.missingData.length > 0 ? (
            <Text style={styles.assistantCauseHint}>
              Falta checar: {cause.missingData.slice(0, 2).join(", ")}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export default ReversibleCauseAssistantCard;
