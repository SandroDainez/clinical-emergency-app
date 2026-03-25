import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  filterReplayBlocks,
  type AclsDebrief,
  type AclsReplayFilter,
} from "../../acls/debrief";
import { styles } from "./protocol-screen-styles";

type DebriefCardProps = {
  debrief: AclsDebrief;
  onCopyText: () => void;
};

function DebriefCard({ debrief, onCopyText }: DebriefCardProps) {
  const [replayFilter, setReplayFilter] = useState<AclsReplayFilter>("all");
  const replayBlocks = filterReplayBlocks(debrief.replayBlocks, replayFilter);
  const replayFilters: { id: AclsReplayFilter; label: string }[] = [
    { id: "all", label: "Tudo" },
    { id: "drugs", label: "Drogas" },
    { id: "shocks", label: "Choques" },
    { id: "rhythm", label: "Ritmo" },
    { id: "voice", label: "Voz" },
    { id: "causes", label: "Hs/Ts" },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Debrief pós-caso</Text>
      <View style={styles.debriefActions}>
        <Pressable style={styles.exportButton} onPress={onCopyText}>
          <Text style={styles.exportButtonText}>Copiar resumo</Text>
        </Pressable>
      </View>

      <View style={styles.debriefGrid}>
        <View style={styles.debriefMetricCard}>
          <Text style={styles.debriefMetricLabel}>Duração</Text>
          <Text style={styles.debriefMetricValue}>{debrief.summary.durationLabel}</Text>
        </View>
        <View style={styles.debriefMetricCard}>
          <Text style={styles.debriefMetricLabel}>Ciclos</Text>
          <Text style={styles.debriefMetricValue}>{debrief.summary.cyclesCompleted}</Text>
        </View>
        <View style={styles.debriefMetricCard}>
          <Text style={styles.debriefMetricLabel}>Choques</Text>
          <Text style={styles.debriefMetricValue}>{debrief.summary.shocksDelivered}</Text>
        </View>
        <View style={styles.debriefMetricCard}>
          <Text style={styles.debriefMetricLabel}>ROSC</Text>
          <Text style={styles.debriefMetricValue}>
            {debrief.summary.roscOccurred ? "Sim" : "Não"}
          </Text>
        </View>
      </View>

      <View style={styles.debriefSection}>
        <Text style={styles.debriefSectionTitle}>Resumo operacional</Text>
        <Text style={styles.summaryText}>
          Epinefrina administrada: {debrief.summary.epinephrineAdministered}
        </Text>
        <Text style={styles.summaryText}>
          Antiarrítmicos administrados: {debrief.summary.antiarrhythmicsAdministered}
        </Text>
        <Text style={styles.summaryText}>
          Via aérea avançada: {debrief.summary.advancedAirwaySecured ? "Registrada" : "Não registrada"}
        </Text>
        <Text style={styles.summaryText}>
          Transições de ramo:{" "}
          {debrief.summary.branchTransitions.length > 0
            ? debrief.summary.branchTransitions.join(" • ")
            : "Nenhuma registrada"}
        </Text>
        <Text style={styles.summaryText}>
          Voz: {debrief.summary.voiceSummary.headline.join(" • ")}
        </Text>
        {debrief.summary.voiceSummary.primaryFriction ? (
          <Text style={styles.summaryText}>
            Principal atrito: {debrief.summary.voiceSummary.primaryFriction}
          </Text>
        ) : null}
      </View>

      <View style={styles.debriefSection}>
        <Text style={styles.debriefSectionTitle}>Indicadores operacionais</Text>
        <Text style={styles.summaryText}>
          Tempo até primeiro choque:{" "}
          {debrief.summary.indicators.timeToFirstShockLabel ?? "Indisponível"}
        </Text>
        <Text style={styles.summaryText}>
          Tempo até primeira epinefrina:{" "}
          {debrief.summary.indicators.timeToFirstEpinephrineLabel ?? "Indisponível"}
        </Text>
        <Text style={styles.summaryText}>
          Tempo total do caso: {debrief.summary.indicators.totalCaseTimeLabel}
        </Text>
        <Text style={styles.summaryText}>
          Atritos de voz: {debrief.summary.indicators.voiceRejectedCount} rejeições •{" "}
          {debrief.summary.indicators.voiceTimeoutCount} timeout •{" "}
          {debrief.summary.indicators.voiceLowConfidenceCount} baixa confiança
        </Text>
        {debrief.summary.indicators.pendingOrDelayedItems.length > 0 ? (
          <Text style={styles.summaryText}>
            Pendências/atrasos:{" "}
            {debrief.summary.indicators.pendingOrDelayedItems.join(" • ")}
          </Text>
        ) : null}
      </View>

      <View style={styles.debriefSection}>
        <Text style={styles.debriefSectionTitle}>Hs e Ts registradas</Text>
        {debrief.summary.topCauseSummaries.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma H ou T foi registrada manualmente no caso.</Text>
        ) : (
          debrief.summary.topCauseSummaries.map((cause) => (
            <View key={cause.causeId} style={styles.debriefListItem}>
              <Text style={styles.debriefListTitle}>
                {cause.label}
                {cause.firstPriorityLabel ? ` • ${cause.firstPriorityLabel}` : ""}
              </Text>
              <Text style={styles.debriefListText}>
                Priorizada {cause.timesPrioritized}x
              </Text>
              {cause.supportingSignals.length > 0 ? (
                <Text style={styles.debriefListText}>
                  Sustentação: {cause.supportingSignals.slice(0, 2).join(" • ")}
                </Text>
              ) : null}
              {cause.relatedActions.length > 0 ? (
                <Text style={styles.debriefListText}>
                  Ações relacionadas: {cause.relatedActions.slice(0, 2).join(" • ")}
                </Text>
              ) : null}
            </View>
          ))
        )}
        {debrief.summary.highlightedMissingData.length > 0 ? (
          <Text style={styles.debriefHint}>
            Dados faltantes mais frequentes:{" "}
            {debrief.summary.highlightedMissingData.join(" • ")}
          </Text>
        ) : null}
      </View>

      <View style={styles.debriefSection}>
        <Text style={styles.debriefSectionTitle}>Linha do tempo resumida</Text>
        {debrief.timeline.slice(0, 8).map((item, index) => (
          <View key={`${item.timestamp}-${index}`} style={styles.debriefTimelineItem}>
            <Text style={styles.debriefTimelineTime}>{item.timeLabel}</Text>
            <View style={styles.debriefTimelineContent}>
              <Text style={styles.debriefListTitle}>{item.title}</Text>
              <Text style={styles.debriefListText}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.debriefSection}>
        <Text style={styles.debriefSectionTitle}>Replay assistivo</Text>
        <View style={styles.replayFilterRow}>
          {replayFilters.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                styles.replayFilterButton,
                replayFilter === filter.id && styles.replayFilterButtonActive,
              ]}
              onPress={() => setReplayFilter(filter.id)}>
              <Text
                style={[
                  styles.replayFilterButtonText,
                  replayFilter === filter.id && styles.replayFilterButtonTextActive,
                ]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {replayBlocks.slice(0, 5).map((block) => (
          <View key={block.id} style={styles.debriefSection}>
            <Text style={styles.debriefBlockTitle}>{block.label}</Text>
            {block.steps.map((step, index) => (
              <View
                key={`${step.timestamp}-${index}`}
                style={[
                  styles.debriefListItem,
                  step.isCritical && styles.debriefListItemCritical,
                ]}>
                <Text style={styles.debriefListTitle}>
                  {step.timeLabel} • {step.event}
                </Text>
                <Text style={styles.debriefListText}>
                  Contexto: {step.context} • Ação: {step.actionTaken}
                </Text>
                {step.observations ? (
                  <Text style={styles.debriefListText}>{step.observations}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </View>

      {debrief.summary.operationalDeviations.length > 0 ? (
        <View style={styles.debriefSection}>
          <Text style={styles.debriefSectionTitle}>Desvios operacionais</Text>
          {debrief.summary.operationalDeviations.map((item) => (
            <Text key={item} style={styles.debriefListText}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default DebriefCard;
