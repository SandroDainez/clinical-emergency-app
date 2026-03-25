import type { ReversibleCauseAssessment } from "../../acls/reversible-cause-assistant";
import { Pressable, Text, TextInput, View } from "react-native";
import type { EncounterSummary, ReversibleCause } from "../../clinical-engine";
import ReversibleCauseAssistantCard from "./reversible-cause-assistant-card";
import { styles } from "./protocol-screen-styles";

type ReversibleCausesCardProps = {
  assistantTopThree: ReversibleCauseAssessment[];
  causes: ReversibleCause[];
  encounterSummary: EncounterSummary;
  title: string;
  onNotesChange: (
    causeId: string,
    field: "evidence" | "actionsTaken" | "responseObserved",
    value: string
  ) => void;
  onStatusChange: (causeId: string, status: "suspeita" | "abordada") => void;
};

function ReversibleCausesCard({
  assistantTopThree,
  causes,
  encounterSummary,
  title,
  onNotesChange,
  onStatusChange,
}: ReversibleCausesCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.emptyText}>
        Marque só as causas que realmente entraram no raciocínio do caso.
      </Text>
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
                ? "Em avaliação"
                : cause.status === "abordada"
                  ? "Já checada"
                  : "Não revisada"}
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
            <Text style={styles.causeNoteLabel}>O que faz pensar nisso?</Text>
            <TextInput
              value={(cause.evidence ?? []).join(", ")}
              onChangeText={(text) => onNotesChange(cause.id, "evidence", text)}
              placeholder="ECG, capnografia, contexto, achados clínicos"
              placeholderTextColor="#94a3b8"
              style={styles.causeNoteInput}
            />

            <Text style={styles.causeNoteLabel}>O que foi feito?</Text>
            <TextInput
              value={(cause.actionsTaken ?? []).join(", ")}
              onChangeText={(text) => onNotesChange(cause.id, "actionsTaken", text)}
              placeholder="Punção, volume, ultrassom, descompressão"
              placeholderTextColor="#94a3b8"
              style={styles.causeNoteInput}
            />

            <Text style={styles.causeNoteLabel}>O que aconteceu depois?</Text>
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
                {encounterSummary.protocolId === "sepse_adulto" ? "Pedir revisão" : "Revisar agora"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.causeButton}
              onPress={() => onStatusChange(cause.id, "abordada")}>
              <Text style={styles.causeButtonText}>
                {encounterSummary.protocolId === "sepse_adulto" ? "Já checado" : "Marcar checada"}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

export default ReversibleCausesCard;
