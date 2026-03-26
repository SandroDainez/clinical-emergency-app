import { Pressable, Text, View } from "react-native";
import { ACLS_COPY } from "../../acls/microcopy";
import type { PersistedAclsCase } from "../../acls/case-history";
import { styles } from "./protocol-screen-styles";

type CaseHistoryCardProps = {
  cases: PersistedAclsCase[];
  selectedCaseId: string | null;
  onOpenCase: (caseId: string) => void;
  onShowCurrentCase: () => void;
};

function CaseHistoryCard({
  cases,
  selectedCaseId,
  onOpenCase,
  onShowCurrentCase,
}: CaseHistoryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{ACLS_COPY.analytical.sections.history}</Text>
      <Pressable style={styles.reportButton} onPress={onShowCurrentCase}>
        <Text style={styles.reportButtonText}>{ACLS_COPY.analytical.sections.currentCase}</Text>
      </Pressable>

      {cases.length === 0 ? (
        <Text style={styles.emptyText}>{ACLS_COPY.analytical.labels.noSavedCases}</Text>
      ) : (
        cases.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.debriefListItem,
              selectedCaseId === item.id && styles.debriefListItemCritical,
            ]}
            onPress={() => onOpenCase(item.id)}>
            <Text style={styles.debriefListTitle}>
              {new Date(item.savedAt).toLocaleString("pt-BR")}
            </Text>
            <Text style={styles.debriefListText}>
              {item.summary.currentStateText} • {item.summary.durationLabel}
            </Text>
            <Text style={styles.debriefListText}>
              Choques {item.summary.shockCount} • ciclos {item.summary.cyclesCompleted} • ROSC{" "}
              {item.summary.roscOccurred ? "sim" : "não"}
            </Text>
            {item.summary.topCauseLabels.length > 0 ? (
              <Text style={styles.debriefListText}>
                Hs/Ts: {item.summary.topCauseLabels.slice(0, 2).join(" • ")}
              </Text>
            ) : null}
          </Pressable>
        ))
      )}
    </View>
  );
}

export default CaseHistoryCard;
