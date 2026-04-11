import { Text, View } from "react-native";
import type { ProtocolState } from "../../clinical-engine";
import { styles } from "./protocol-screen-styles";

type SepsisHeaderCardProps = {
  state: ProtocolState;
};

function SepsisHeaderCard({ state }: SepsisHeaderCardProps) {
  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";

  const cardToneStyle = isQuestion
    ? styles.questionCard
    : isEnd
      ? styles.endCard
      : styles.actionCard;

  const titleToneStyle = isQuestion
    ? styles.questionTitle
    : isEnd
      ? styles.endTitle
      : styles.actionTitle;

  const badgeLabel = isQuestion ? "Decisão clínica" : isEnd ? "Concluído" : "Conduta";

  return (
    <View style={[styles.card, cardToneStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>Sepse — Roteiro de Atendimento</Text>
        <Text style={styles.stateBadge}>{badgeLabel}</Text>
      </View>

      <Text style={[styles.title, titleToneStyle]}>{state.text}</Text>

      {state.details && state.details.length > 0 ? (
        <View style={styles.focusSummaryBlock}>
          {state.details.slice(0, 3).map((detail) => (
            <View key={detail} style={styles.detailRow}>
              <View style={styles.detailBullet} />
              <Text style={styles.detailText}>{detail}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default SepsisHeaderCard;
