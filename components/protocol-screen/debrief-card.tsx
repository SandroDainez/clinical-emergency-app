import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ACLS_COPY } from "../../acls/microcopy";
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

function getLatencyTone(ms?: number) {
  if (ms === undefined) {
    return { backgroundColor: "#f8fafc", borderColor: "#e5e7eb", textColor: "#475569" };
  }

  if (ms < 100) {
    return { backgroundColor: "#ecfdf5", borderColor: "#86efac", textColor: "#166534" };
  }

  if (ms <= 200) {
    return { backgroundColor: "#fefce8", borderColor: "#fde68a", textColor: "#854d0e" };
  }

  return { backgroundColor: "#fef2f2", borderColor: "#fca5a5", textColor: "#991b1b" };
}

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
      <Text style={styles.sectionTitle}>{ACLS_COPY.analytical.sections.debrief}</Text>
      <View style={styles.debriefActions}>
        <Pressable style={styles.exportButton} onPress={onCopyText}>
          <Text style={styles.exportButtonText}>{ACLS_COPY.analytical.labels.copy}</Text>
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
        <Text style={styles.debriefSectionTitle}>
          {ACLS_COPY.analytical.sections.clinicalAnalysis}
        </Text>
        <Text style={styles.summaryText}>{debrief.clinicalAnalysis.summary}</Text>
        <Text style={styles.debriefListTitle}>{ACLS_COPY.analytical.sections.strengths}</Text>
        {debrief.clinicalAnalysis.strengths.length === 0 ? (
          <Text style={styles.debriefListText}>Nenhum destaque.</Text>
        ) : (
          debrief.clinicalAnalysis.strengths.map((item) => (
            <Text key={item} style={styles.debriefListText}>
              • {item}
            </Text>
          ))
        )}
        <Text style={styles.debriefListTitle}>{ACLS_COPY.analytical.sections.delays}</Text>
        {debrief.clinicalAnalysis.delaysOrDeviations.length === 0 ? (
          <Text style={styles.debriefListText}>Nenhum atraso relevante.</Text>
        ) : (
          debrief.clinicalAnalysis.delaysOrDeviations.map((item) => (
            <Text key={item} style={styles.debriefListText}>
              • {item}
            </Text>
          ))
        )}
        <Text style={styles.debriefListTitle}>{ACLS_COPY.analytical.sections.improvements}</Text>
        {debrief.clinicalAnalysis.improvementSuggestions.length === 0 ? (
          <Text style={styles.debriefListText}>Nenhuma sugestão adicional.</Text>
        ) : (
          debrief.clinicalAnalysis.improvementSuggestions.map((item) => (
            <Text key={item} style={styles.debriefListText}>
              • {item}
            </Text>
          ))
        )}
      </View>

      <View style={styles.debriefSection}>
        <Text style={styles.debriefSectionTitle}>{ACLS_COPY.analytical.sections.summary}</Text>
        <Text style={styles.summaryText}>
          Epinefrina: {debrief.summary.epinephrineAdministered}
        </Text>
        <Text style={styles.summaryText}>
          Antiarrítmico: {debrief.summary.antiarrhythmicsAdministered}
        </Text>
        <Text style={styles.summaryText}>
          {ACLS_COPY.analytical.labels.advancedAirway}: {debrief.summary.advancedAirwaySecured ? "Registrada" : "Não registrada"}
        </Text>
        <Text style={styles.summaryText}>
          {ACLS_COPY.analytical.labels.branchTransitions}:{" "}
          {debrief.summary.branchTransitions.length > 0
            ? debrief.summary.branchTransitions.join(" • ")
            : "Nenhuma registrada"}
        </Text>
        <Text style={styles.summaryText}>
          Voz: {debrief.summary.voiceSummary.headline.join(" • ")}
        </Text>
        {debrief.summary.voiceSummary.primaryFriction ? (
          <Text style={styles.summaryText}>
            {ACLS_COPY.analytical.labels.primaryFriction}: {debrief.summary.voiceSummary.primaryFriction}
          </Text>
        ) : null}
      </View>

      <View style={styles.debriefSection}>
        <Text style={styles.debriefSectionTitle}>{ACLS_COPY.analytical.sections.metrics}</Text>
        <Text style={styles.summaryText}>
          {ACLS_COPY.analytical.labels.timeToFirstShock}:{" "}
          {debrief.summary.indicators.timeToFirstShockLabel ?? ACLS_COPY.analytical.labels.unavailable}
        </Text>
        <Text style={styles.summaryText}>
          {ACLS_COPY.analytical.labels.timeToFirstEpinephrine}:{" "}
          {debrief.summary.indicators.timeToFirstEpinephrineLabel ?? ACLS_COPY.analytical.labels.unavailable}
        </Text>
        <Text style={styles.summaryText}>
          {ACLS_COPY.analytical.labels.totalTime}: {debrief.summary.indicators.totalCaseTimeLabel}
        </Text>
        <Text style={styles.summaryText}>
          Atritos de voz: {debrief.summary.indicators.voiceRejectedCount} rejeições •{" "}
          {debrief.summary.indicators.voiceTimeoutCount} timeout •{" "}
          {debrief.summary.indicators.voiceLowConfidenceCount} baixa confiança
        </Text>
        {debrief.summary.indicators.pendingOrDelayedItems.length > 0 ? (
          <Text style={styles.summaryText}>
            {ACLS_COPY.analytical.labels.pendingDelays}:{" "}
            {debrief.summary.indicators.pendingOrDelayedItems.join(" • ")}
          </Text>
        ) : null}
      </View>

      <View style={styles.debriefSection}>
        <Text style={styles.debriefSectionTitle}>{ACLS_COPY.analytical.sections.causes}</Text>
        {debrief.summary.topCauseSummaries.length === 0 ? (
          <Text style={styles.emptyText}>{ACLS_COPY.analytical.labels.noRecordedCauses}</Text>
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
                  {ACLS_COPY.analytical.labels.supportingSignals}: {cause.supportingSignals.slice(0, 2).join(" • ")}
                </Text>
              ) : null}
              {cause.relatedActions.length > 0 ? (
                <Text style={styles.debriefListText}>
                  {ACLS_COPY.analytical.labels.relatedActions}: {cause.relatedActions.slice(0, 2).join(" • ")}
                </Text>
              ) : null}
            </View>
          ))
        )}
        {debrief.summary.highlightedMissingData.length > 0 ? (
          <Text style={styles.debriefHint}>
            {ACLS_COPY.analytical.labels.missingData}:{" "}
            {debrief.summary.highlightedMissingData.join(" • ")}
          </Text>
        ) : null}
      </View>

      <View style={styles.debriefSection}>
        <Text style={styles.debriefSectionTitle}>{ACLS_COPY.analytical.sections.timeline}</Text>
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
        <Text style={styles.debriefSectionTitle}>{ACLS_COPY.analytical.sections.replay}</Text>
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
                  {ACLS_COPY.analytical.labels.context}: {step.context} • {ACLS_COPY.analytical.labels.action}: {step.actionTaken}
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
          <Text style={styles.debriefSectionTitle}>{ACLS_COPY.analytical.sections.deviations}</Text>
          {debrief.summary.operationalDeviations.map((item) => (
            <Text key={item} style={styles.debriefListText}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      {debrief.latencyDebug?.enabled ? (
        <View style={styles.debriefSection}>
          <Text style={styles.debriefSectionTitle}>{ACLS_COPY.analytical.sections.latency}</Text>
          {debrief.latencyDebug.events.length === 0 ? (
            <Text style={styles.emptyText}>{ACLS_COPY.analytical.labels.noLatency}</Text>
          ) : (
            debrief.latencyDebug.events.map((item) => {
              const totalTone = getLatencyTone(item.latencies.totalEndToEndMs);
              const isCritical =
                item.eventCategory === "shock" || item.eventCategory === "rhythm";

              return (
                <View
                  key={item.id}
                  style={[
                    styles.debriefListItem,
                    {
                      backgroundColor: totalTone.backgroundColor,
                      borderColor: totalTone.borderColor,
                      borderWidth: 1,
                    },
                    isCritical && styles.debriefListItemCritical,
                  ]}>
                  <Text style={styles.debriefListTitle}>
                    {item.eventType} • {item.eventCategory}
                    {isCritical ? " • crítico" : ""}
                  </Text>
                  <Text style={[styles.debriefListText, { color: totalTone.textColor }]}>
                    event→state: {item.latencies.eventToStateMs ?? "n/a"} ms • state→enqueue:{" "}
                    {item.latencies.stateToEnqueueSpeakMs ?? "n/a"} ms
                  </Text>
                  <Text style={[styles.debriefListText, { color: totalTone.textColor }]}>
                    enqueue→play: {item.latencies.enqueueToPlayMs ?? "n/a"} ms • total:{" "}
                    {item.latencies.totalEndToEndMs ?? "n/a"} ms
                  </Text>
                  <Text style={styles.debriefListText}>
                    {ACLS_COPY.analytical.labels.latencyState}: {item.stateIdAfter ?? item.stateIdBefore} • {ACLS_COPY.analytical.labels.latencyIntent}:{" "}
                    {item.clinicalIntentAfter ?? "n/a"}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      ) : null}
    </View>
  );
}

export default DebriefCard;
