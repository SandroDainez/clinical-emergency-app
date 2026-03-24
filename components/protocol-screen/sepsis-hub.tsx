import { Pressable, Text, View } from "react-native";
import type { ReversibleCause, SepsisHubData } from "../../clinical-engine";
import { styles } from "./protocol-screen-styles";

type SepsisHubProps = {
  data: SepsisHubData;
  onStatusUpdate: (itemId: string, status: "pendente" | "solicitado" | "realizado") => void;
};

function SepsisHub({ data, onStatusUpdate }: SepsisHubProps) {
  return (
    <View style={styles.sepsisHubContainer}>
      <View style={styles.sepsisHubHeader}>
        <View style={styles.sepsisPatientCard}>
          <Text style={styles.sepsisHubEyebrow}>Bundle da primeira hora</Text>
          <Text style={styles.sepsisHubTitle}>{data.scenarioLabel}</Text>
          <Text style={styles.sepsisHubSubText}>
            Tempo desde o reconhecimento: {data.recognitionElapsed}
          </Text>
          <Text style={styles.sepsisHubMetric}>Foco: {data.focusLabel}</Text>
          <Text style={styles.sepsisHubSummary}>{data.assessmentSummary}</Text>
          <View style={styles.sepsisHubPatientList}>
            {data.patientSummary.map((line, index) => (
              <Text key={`${line}-${index}`} style={styles.sepsisHubPatientText}>
                {line}
              </Text>
            ))}
          </View>
        </View>
        {data.antibioticTimer ? (
          <View
            style={[
              styles.sepsisTimerCard,
              data.pendingBundleCount > 0 && styles.sepsisTimerCardAlert,
            ]}>
            <Text style={styles.sepsisTimerLabel}>Cronômetro antimicrobiano</Text>
            <Text style={styles.sepsisTimerValue}>{data.antibioticTimer.remainingLabel}</Text>
            <Text style={styles.sepsisTimerHint}>Meta: até 1 hora</Text>
            {data.antibioticTimer.nextAlertLabel ? (
              <Text style={styles.sepsisTimerSubtext}>
                Próximo alerta em {data.antibioticTimer.nextAlertLabel}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.sepsisTimerCardDisabled}>
            <Text style={styles.sepsisTimerLabel}>Antimicrobiano registrado</Text>
          </View>
        )}
      </View>
      <View style={styles.sepsisBundleCard}>
        <View style={styles.sepsisBundleCardHeader}>
          <Text style={styles.sepsisBundleCardTitle}>Itens do bundle</Text>
          <Text style={styles.sepsisBundleCardSubtext}>
            {data.pendingBundleCount} pendente(s)
          </Text>
        </View>
        {data.bundleItems.map((item) => (
          <SepsisBundleRow key={item.id} item={item} onStatusUpdate={onStatusUpdate} />
        ))}
      </View>
    </View>
  );
}

type SepsisBundleRowProps = {
  item: SepsisHubData["bundleItems"][number];
  onStatusUpdate: (itemId: string, status: "pendente" | "solicitado" | "realizado") => void;
};

function SepsisBundleRow({ item, onStatusUpdate }: SepsisBundleRowProps) {
  return (
    <View style={styles.bundleRow}>
      <View style={styles.bundleRowHeader}>
        <Text style={styles.bundleRowTitle}>{item.label}</Text>
        <Text style={styles.bundleRowValue}>{item.value}</Text>
      </View>
      {item.helperText ? <Text style={styles.bundleRowHelper}>{item.helperText}</Text> : null}
      <View style={styles.bundleRowActions}>
        {item.options.map((option) => {
          const isActive = item.currentStatus === option.status;
          return (
            <Pressable
              key={`${item.id}-${option.status}`}
              style={[
                styles.bundleStatusButton,
                option.status === "pendente" && styles.bundleStatusButtonPending,
                option.status === "solicitado" && styles.bundleStatusButtonRequested,
                option.status === "realizado" && styles.bundleStatusButtonDone,
                isActive && styles.bundleStatusButtonActive,
              ]}
              onPress={() => onStatusUpdate(item.id, option.status)}>
              <Text
                style={[
                  styles.bundleStatusButtonText,
                  isActive && styles.bundleStatusButtonTextActive,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type SepsisFocusChecklistProps = {
  causes: ReversibleCause[];
  onUpdate: (causeId: string, status: "suspeita" | "abordada") => void;
};

function SepsisFocusChecklist({ causes, onUpdate }: SepsisFocusChecklistProps) {
  if (causes.length === 0) {
    return null;
  }

  return (
    <View style={styles.sepsisFocusCard}>
      <Text style={styles.sepsisFocusTitle}>Controle de foco infeccioso</Text>
      <Text style={styles.sepsisFocusHint}>
        Marque foco suspeito e acompanhe ações práticas sem sair do bundle.
      </Text>
      {causes.map((cause) => (
        <View key={cause.id} style={styles.sepsisFocusItem}>
          <View style={styles.sepsisFocusItemHeader}>
            <Text style={styles.sepsisFocusItemTitle}>{cause.label}</Text>
            <Text
              style={[
                styles.statusBadge,
                cause.status === "suspeita" && styles.statusSuspected,
                cause.status === "abordada" && styles.statusAddressed,
                cause.status === "pendente" && styles.statusPending,
              ]}>
              {cause.status === "suspeita"
                ? "Suspeita"
                : cause.status === "abordada"
                  ? "Abordado"
                  : "Pendente"}
            </Text>
          </View>
          <View style={styles.sepsisFocusActions}>
            {cause.actions.map((action) => (
              <Text key={action} style={styles.sepsisFocusActionText}>
                • {action}
              </Text>
            ))}
          </View>
          <View style={styles.sepsisFocusButtons}>
            <Pressable
              style={styles.sepsisFocusButton}
              onPress={() => onUpdate(cause.id, "suspeita")}>
              <Text style={styles.sepsisFocusButtonText}>Marcar suspeita</Text>
            </Pressable>
            <Pressable
              style={styles.sepsisFocusButtonAlt}
              onPress={() => onUpdate(cause.id, "abordada")}>
              <Text style={styles.sepsisFocusButtonText}>Marcar abordado</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

export { SepsisFocusChecklist };
export default SepsisHub;
