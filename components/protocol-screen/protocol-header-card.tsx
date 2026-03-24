import { Text, View } from "react-native";
import type { AclsScreenModel } from "../../acls/screen-model";
import type { ProtocolState } from "../../clinical-engine";
import { styles } from "./protocol-screen-styles";
import { getStateBadgeLabel } from "./protocol-screen-utils";

type ProtocolHeaderCardProps = {
  screenModel: AclsScreenModel;
  stateType: ProtocolState["type"];
};

function ProtocolHeaderCard({ screenModel, stateType }: ProtocolHeaderCardProps) {
  const cardToneStyle =
    stateType === "question"
      ? styles.questionCard
      : stateType === "end"
        ? styles.endCard
        : styles.actionCard;
  const titleToneStyle =
    stateType === "question"
      ? styles.questionTitle
      : stateType === "end"
        ? styles.endTitle
        : styles.actionTitle;

  return (
    <View style={[styles.card, cardToneStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>Apoio à decisão clínica</Text>
        <Text style={styles.stateBadge}>{getStateBadgeLabel(stateType)}</Text>
      </View>

      {screenModel.bannerTitle && screenModel.bannerDetail ? (
        <View
          style={[
            styles.urgencyBanner,
            screenModel.bannerPriority === "critical_now" && styles.urgencyBannerDanger,
            screenModel.bannerPriority === "due_now" && styles.urgencyBannerWarning,
            screenModel.bannerPriority === "reassess" && styles.urgencyBannerInfo,
          ]}>
          <Text style={styles.urgencyBannerLabel}>{screenModel.bannerTitle}</Text>
          <Text style={styles.urgencyBannerDetail}>{screenModel.bannerDetail}</Text>
        </View>
      ) : null}

      <Text style={[styles.title, titleToneStyle]}>{screenModel.title}</Text>

      {screenModel.details.length > 0 ? (
        <View style={styles.detailsBlock}>
          <Text style={styles.detailsTitle}>Condutas práticas</Text>
          {screenModel.details.map((detail) => (
            <View key={detail} style={styles.detailRow}>
              <View style={styles.detailBullet} />
              <Text style={styles.detailText}>{detail}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {screenModel.timerVisible ? (
        <View style={styles.timerBadge}>
          <Text style={styles.timerLabel}>Timer ativo</Text>
          <Text style={styles.timerValue}>{screenModel.timerRemaining}s</Text>
          <Text style={styles.timerHint}>Reavaliar ao término do ciclo</Text>
          {screenModel.nextAdrenalineLabel ? (
            <Text style={styles.timerSubHint}>
              Próx. epinefrina em {screenModel.nextAdrenalineLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default ProtocolHeaderCard;
