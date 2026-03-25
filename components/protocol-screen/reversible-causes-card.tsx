import type { ReversibleCauseAssessment } from "../../acls/reversible-cause-assistant";
import { Pressable, Text, TextInput, View } from "react-native";
import type { EncounterSummary, ReversibleCause } from "../../clinical-engine";
import type { AclsAiInsight } from "../../lib/acls-ai";
import AclsAiAssistantCard from "./acls-ai-assistant-card";
import ReversibleCauseAssistantCard from "./reversible-cause-assistant-card";
import { styles } from "./protocol-screen-styles";

type ReversibleCausesCardProps = {
  aiInsight: AclsAiInsight | null;
  aiStatus: "idle" | "loading" | "ready" | "error";
  aiErrorMessage?: string;
  assistantTopThree: ReversibleCauseAssessment[];
  causes: ReversibleCause[];
  encounterSummary: EncounterSummary;
  title: string;
  onRefreshAi: () => void;
  onNotesChange: (
    causeId: string,
    field: "evidence" | "actionsTaken" | "responseObserved",
    value: string
  ) => void;
  onStatusChange: (causeId: string, status: "suspeita" | "abordada") => void;
};

function ReversibleCausesCard({
  aiInsight,
  aiStatus,
  aiErrorMessage,
  assistantTopThree,
  causes,
  encounterSummary,
  title,
  onRefreshAi,
  onNotesChange,
  onStatusChange,
}: ReversibleCausesCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <AclsAiAssistantCard
        insight={aiInsight}
        status={aiStatus}
        errorMessage={aiErrorMessage}
        onRefresh={onRefreshAi}
      />
      <ReversibleCauseAssistantCard topThree={assistantTopThree} />
      {causes.map((cause) => (
        <View key={cause.id} style={styles.causeCard}>
          <View style={styles.causeHeader}>
            <Text style={styles.causeTitle}>{cause.label}</Text>
            <Text
              style={[
                styles.statusBadge,
                cause.status === "suspeita" && styles.statusSuspected,
                cause.status === "abordada" && styles.statusAddressed,
              ]}>
              {cause.status === "suspeita"
                ? "Suspeita"
                : cause.status === "abordada"
                  ? "Abordada"
                  : "Pendente"}
            </Text>
          </View>

          <View style={styles.causeActions}>
            {cause.actions.map((action) => (
              <Text key={action} style={styles.causeActionText}>
                • {action}
              </Text>
            ))}
          </View>

          <View style={styles.causeNotesGroup}>
            <Text style={styles.causeNoteLabel}>Evidências</Text>
            <TextInput
              value={(cause.evidence ?? []).join(", ")}
              onChangeText={(text) => onNotesChange(cause.id, "evidence", text)}
              placeholder="ECG, contexto, achados clínicos"
              placeholderTextColor="#94a3b8"
              style={styles.causeNoteInput}
            />

            <Text style={styles.causeNoteLabel}>Ações realizadas</Text>
            <TextInput
              value={(cause.actionsTaken ?? []).join(", ")}
              onChangeText={(text) => onNotesChange(cause.id, "actionsTaken", text)}
              placeholder="Punção, volume, ultrassom, descompressão"
              placeholderTextColor="#94a3b8"
              style={styles.causeNoteInput}
            />

            <Text style={styles.causeNoteLabel}>Resposta observada</Text>
            <TextInput
              value={(cause.responseObserved ?? []).join(", ")}
              onChangeText={(text) => onNotesChange(cause.id, "responseObserved", text)}
              placeholder="Melhora, sem resposta, reavaliar"
              placeholderTextColor="#94a3b8"
              style={styles.causeNoteInput}
            />
          </View>

          <View style={styles.causeButtons}>
            <Pressable
              style={styles.causeButton}
              onPress={() => onStatusChange(cause.id, "suspeita")}>
              <Text style={styles.causeButtonText}>
                {encounterSummary.protocolId === "sepse_adulto" ? "Provável" : "Suspeita"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.causeButton}
              onPress={() => onStatusChange(cause.id, "abordada")}>
              <Text style={styles.causeButtonText}>
                {encounterSummary.protocolId === "sepse_adulto" ? "Abordado" : "Abordada"}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

export default ReversibleCausesCard;
