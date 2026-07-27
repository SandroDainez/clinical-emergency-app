import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {getCopy } from "../../acls/microcopy";
import {
  filterReplayBlocks,
  type AclsDebrief,
  type AclsReplayFilter,
} from "../../acls/debrief";
import { useTr } from "../../lib/use-tr";

type DebriefCardProps = {
  debrief: AclsDebrief;
  onCopyText: () => void;
};

function getLatencyTone(ms?: number) {
  if (ms === undefined) {
    return { backgroundColor: "#262a32", borderColor: "#3a404a", textColor: "#64748b" };
  }
  if (ms < 100) {
    return { backgroundColor: "#052e16", borderColor: "#166534", textColor: "#4ade80" };
  }
  if (ms <= 200) {
    return { backgroundColor: "#451a03", borderColor: "#92400e", textColor: "#fbbf24" };
  }
  return { backgroundColor: "#450a0a", borderColor: "#991b1b", textColor: "#f87171" };
}

function DebriefCard({ debrief, onCopyText }: DebriefCardProps) {
  const tr = useTr();
  const ACLS_COPY = getCopy();
  const [replayFilter, setReplayFilter] = useState<AclsReplayFilter>("all");
  const replayBlocks = filterReplayBlocks(debrief.replayBlocks, replayFilter);
  const replayFilters: { id: AclsReplayFilter; label: string }[] = [
    { id: "all", label: tr("Tudo") },
    { id: "drugs", label: tr("Drogas") },
    { id: "shocks", label: "Choques" },
    { id: "rhythm", label: tr("Ritmo") },
    { id: "voice", label: tr("Voz") },
    { id: "causes", label: tr("Hs/Ts") },
  ];

  return (
    <View style={s.card}>
      <Text style={s.sectionTitle}>{ACLS_COPY.analytical.sections.debrief}</Text>

      <View style={s.debriefActions}>
        <Pressable
          style={({ pressed }) => [s.exportButton, pressed && { opacity: 0.85 }]}
          onPress={onCopyText}>
          <Text style={s.exportButtonText}>{ACLS_COPY.analytical.labels.copy}</Text>
        </Pressable>
      </View>

      {/* Metric chips */}
      <View style={s.debriefGrid}>
        <View style={s.debriefMetricCard}>
          <Text style={s.debriefMetricLabel}>{tr("Duração")}</Text>
          <Text style={s.debriefMetricValue}>{debrief.summary.durationLabel}</Text>
        </View>
        <View style={s.debriefMetricCard}>
          <Text style={s.debriefMetricLabel}>{tr("Ciclos")}</Text>
          <Text style={s.debriefMetricValue}>{debrief.summary.cyclesCompleted}</Text>
        </View>
        <View style={s.debriefMetricCard}>
          <Text style={s.debriefMetricLabel}>{tr("Choques")}</Text>
          <Text style={s.debriefMetricValue}>{debrief.summary.shocksDelivered}</Text>
        </View>
        <View style={s.debriefMetricCard}>
          <Text style={s.debriefMetricLabel}>ROSC</Text>
          <Text style={s.debriefMetricValue}>
            {debrief.summary.roscOccurred ? tr("Sim") : tr("Não")}
          </Text>
        </View>
      </View>

      {/* Clinical analysis */}
      <View style={s.debriefSection}>
        <Text style={s.debriefSectionTitle}>
          {ACLS_COPY.analytical.sections.clinicalAnalysis}
        </Text>
        <Text style={s.summaryText}>{debrief.clinicalAnalysis.summary}</Text>
        <Text style={s.debriefListTitle}>{ACLS_COPY.analytical.sections.strengths}</Text>
        {debrief.clinicalAnalysis.strengths.length === 0 ? (
          <Text style={s.debriefListText}>{tr("Nenhum destaque.")}</Text>
        ) : (
          debrief.clinicalAnalysis.strengths.map((item) => (
            <Text key={item} style={s.debriefListText}>
              • {item}
            </Text>
          ))
        )}
        <Text style={s.debriefListTitle}>{ACLS_COPY.analytical.sections.delays}</Text>
        {debrief.clinicalAnalysis.delaysOrDeviations.length === 0 ? (
          <Text style={s.debriefListText}>{tr("Nenhum atraso relevante.")}</Text>
        ) : (
          debrief.clinicalAnalysis.delaysOrDeviations.map((item) => (
            <Text key={item} style={s.debriefListText}>
              • {item}
            </Text>
          ))
        )}
        <Text style={s.debriefListTitle}>{ACLS_COPY.analytical.sections.improvements}</Text>
        {debrief.clinicalAnalysis.improvementSuggestions.length === 0 ? (
          <Text style={s.debriefListText}>{tr("Nenhuma sugestão adicional.")}</Text>
        ) : (
          debrief.clinicalAnalysis.improvementSuggestions.map((item) => (
            <Text key={item} style={s.debriefListText}>
              • {item}
            </Text>
          ))
        )}
      </View>

      {/* Drug & airway summary */}
      <View style={s.debriefSection}>
        <Text style={s.debriefSectionTitle}>{ACLS_COPY.analytical.sections.summary}</Text>
        <Text style={s.summaryText}>
          Epinefrina: {debrief.summary.epinephrineAdministered}
        </Text>
        <Text style={s.summaryText}>
          Antiarrítmico: {debrief.summary.antiarrhythmicsAdministered}
        </Text>
        <Text style={s.summaryText}>
          {ACLS_COPY.analytical.labels.advancedAirway}:{" "}
          {debrief.summary.advancedAirwaySecured ? tr("Registrada") : tr("Não registrada")}
        </Text>
        <Text style={s.summaryText}>
          {ACLS_COPY.analytical.labels.branchTransitions}:{" "}
          {debrief.summary.branchTransitions.length > 0
            ? debrief.summary.branchTransitions.join(" • ")
            : tr("Nenhuma registrada")}
        </Text>
        <Text style={s.summaryText}>
          Voz: {debrief.summary.voiceSummary.headline.join(" • ")}
        </Text>
        {debrief.summary.voiceSummary.primaryFriction ? (
          <Text style={s.summaryText}>
            {ACLS_COPY.analytical.labels.primaryFriction}:{" "}
            {debrief.summary.voiceSummary.primaryFriction}
          </Text>
        ) : null}
      </View>

      {/* Performance metrics */}
      <View style={s.debriefSection}>
        <Text style={s.debriefSectionTitle}>{ACLS_COPY.analytical.sections.metrics}</Text>
        <Text style={s.summaryText}>
          {ACLS_COPY.analytical.labels.timeToFirstShock}:{" "}
          {debrief.summary.indicators.timeToFirstShockLabel ??
            ACLS_COPY.analytical.labels.unavailable}
        </Text>
        <Text style={s.summaryText}>
          {ACLS_COPY.analytical.labels.timeToFirstEpinephrine}:{" "}
          {debrief.summary.indicators.timeToFirstEpinephrineLabel ??
            ACLS_COPY.analytical.labels.unavailable}
        </Text>
        <Text style={s.summaryText}>
          {ACLS_COPY.analytical.labels.totalTime}:{" "}
          {debrief.summary.indicators.totalCaseTimeLabel}
        </Text>
        <Text style={s.summaryText}>
          Atritos de voz: {debrief.summary.indicators.voiceRejectedCount} rejeições •{" "}
          {debrief.summary.indicators.voiceTimeoutCount} timeout •{" "}
          {debrief.summary.indicators.voiceLowConfidenceCount} baixa confiança
        </Text>
        {debrief.summary.indicators.pendingOrDelayedItems.length > 0 ? (
          <Text style={s.summaryText}>
            {ACLS_COPY.analytical.labels.pendingDelays}:{" "}
            {debrief.summary.indicators.pendingOrDelayedItems.join(" • ")}
          </Text>
        ) : null}
      </View>

      {/* Reversible causes */}
      <View style={s.debriefSection}>
        <Text style={s.debriefSectionTitle}>{ACLS_COPY.analytical.sections.causes}</Text>
        {debrief.summary.topCauseSummaries.length === 0 ? (
          <Text style={s.emptyText}>{ACLS_COPY.analytical.labels.noRecordedCauses}</Text>
        ) : (
          debrief.summary.topCauseSummaries.map((cause) => (
            <View key={cause.causeId} style={s.debriefListItem}>
              <Text style={s.debriefListTitle}>
                {cause.label}
                {cause.firstPriorityLabel ? ` • ${cause.firstPriorityLabel}` : ""}
              </Text>
              <Text style={s.debriefListText}>
                Priorizada {cause.timesPrioritized}x
              </Text>
              {cause.supportingSignals.length > 0 ? (
                <Text style={s.debriefListText}>
                  {ACLS_COPY.analytical.labels.supportingSignals}:{" "}
                  {cause.supportingSignals.slice(0, 2).join(" • ")}
                </Text>
              ) : null}
              {cause.relatedActions.length > 0 ? (
                <Text style={s.debriefListText}>
                  {ACLS_COPY.analytical.labels.relatedActions}:{" "}
                  {cause.relatedActions.slice(0, 2).join(" • ")}
                </Text>
              ) : null}
            </View>
          ))
        )}
        {debrief.summary.highlightedMissingData.length > 0 ? (
          <Text style={s.debriefHint}>
            {ACLS_COPY.analytical.labels.missingData}:{" "}
            {debrief.summary.highlightedMissingData.join(" • ")}
          </Text>
        ) : null}
      </View>

      {/* Timeline */}
      <View style={s.debriefSection}>
        <Text style={s.debriefSectionTitle}>{ACLS_COPY.analytical.sections.timeline}</Text>
        {debrief.timeline.slice(0, 8).map((item, index) => (
          <View key={`${item.timestamp}-${index}`} style={s.debriefTimelineItem}>
            <Text style={s.debriefTimelineTime}>{item.timeLabel}</Text>
            <View style={s.debriefTimelineContent}>
              <Text style={s.debriefListTitle}>{item.title}</Text>
              <Text style={s.debriefListText}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Replay */}
      <View style={s.debriefSection}>
        <Text style={s.debriefSectionTitle}>{ACLS_COPY.analytical.sections.replay}</Text>
        <View style={s.replayFilterRow}>
          {replayFilters.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                s.replayFilterButton,
                replayFilter === filter.id && s.replayFilterButtonActive,
              ]}
              onPress={() => setReplayFilter(filter.id)}>
              <Text
                style={[
                  s.replayFilterButtonText,
                  replayFilter === filter.id && s.replayFilterButtonTextActive,
                ]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {replayBlocks.slice(0, 5).map((block) => (
          <View key={block.id} style={s.debriefSection}>
            <Text style={s.debriefBlockTitle}>{block.label}</Text>
            {block.steps.map((step, index) => (
              <View
                key={`${step.timestamp}-${index}`}
                style={[s.debriefListItem, step.isCritical && s.debriefListItemCritical]}>
                <Text style={s.debriefListTitle}>
                  {step.timeLabel} • {step.event}
                </Text>
                <Text style={s.debriefListText}>
                  {ACLS_COPY.analytical.labels.context}: {step.context} •{" "}
                  {ACLS_COPY.analytical.labels.action}: {step.actionTaken}
                </Text>
                {step.observations ? (
                  <Text style={s.debriefListText}>{step.observations}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Deviations */}
      {debrief.summary.operationalDeviations.length > 0 ? (
        <View style={s.debriefSection}>
          <Text style={s.debriefSectionTitle}>
            {ACLS_COPY.analytical.sections.deviations}
          </Text>
          {debrief.summary.operationalDeviations.map((item) => (
            <Text key={item} style={s.debriefListText}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      {/* Latency debug */}
      {debrief.latencyDebug?.enabled ? (
        <View style={s.debriefSection}>
          <Text style={s.debriefSectionTitle}>
            {ACLS_COPY.analytical.sections.latency}
          </Text>
          {debrief.latencyDebug.events.length === 0 ? (
            <Text style={s.emptyText}>{ACLS_COPY.analytical.labels.noLatency}</Text>
          ) : (
            debrief.latencyDebug.events.map((item) => {
              const totalTone = getLatencyTone(item.latencies.totalEndToEndMs);
              const isCritical =
                item.eventCategory === "shock" || item.eventCategory === "rhythm";
              return (
                <View
                  key={item.id}
                  style={[
                    s.debriefListItem,
                    {
                      backgroundColor: totalTone.backgroundColor,
                      borderColor: totalTone.borderColor,
                      borderWidth: 1,
                    },
                    isCritical && s.debriefListItemCritical,
                  ]}>
                  <Text style={s.debriefListTitle}>
                    {item.eventType} • {item.eventCategory}
                    {isCritical ? " • crítico" : ""}
                  </Text>
                  <Text style={[s.debriefListText, { color: totalTone.textColor }]}>
                    event→state: {item.latencies.eventToStateMs ?? "n/a"} ms •
                    state→enqueue: {item.latencies.stateToEnqueueSpeakMs ?? "n/a"} ms
                  </Text>
                  <Text style={[s.debriefListText, { color: totalTone.textColor }]}>
                    enqueue→play: {item.latencies.enqueueToPlayMs ?? "n/a"} ms • total:{" "}
                    {item.latencies.totalEndToEndMs ?? "n/a"} ms
                  </Text>
                  <Text style={s.debriefListText}>
                    {ACLS_COPY.analytical.labels.latencyState}:{" "}
                    {item.stateIdAfter ?? item.stateIdBefore} •{" "}
                    {ACLS_COPY.analytical.labels.latencyIntent}:{" "}
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

const s = StyleSheet.create({
  card: {
    backgroundColor: "#262a32",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#3a404a",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    gap: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f1f5f9",
    marginBottom: 4,
    letterSpacing: -0.3,
  },

  /* Export button */
  debriefActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  exportButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e6fd9",
    paddingHorizontal: 16,
  },
  exportButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },

  /* Summary metric chips */
  debriefGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  debriefMetricCard: {
    width: "48%",
    backgroundColor: "#262a32",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#3a404a",
    gap: 4,
  },
  debriefMetricLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#94a3b8",
  },
  debriefMetricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4d9aff",
  },

  /* Sections */
  debriefSection: {
    marginTop: 18,
    gap: 8,
  },
  debriefSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
  },

  summaryText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#94a3b8",
  },

  /* List items */
  debriefListItem: {
    backgroundColor: "#262a32",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3a404a",
    padding: 12,
    gap: 4,
  },
  debriefListItemCritical: {
    borderColor: "#991b1b",
    backgroundColor: "#450a0a",
  },
  debriefListTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#e2e8f0",
  },
  debriefListText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#94a3b8",
  },
  debriefHint: {
    fontSize: 13,
    lineHeight: 19,
    color: "#94a3b8",
    fontWeight: "700",
  },

  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    paddingVertical: 4,
  },

  /* Timeline */
  debriefTimelineItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  debriefTimelineTime: {
    width: 52,
    fontSize: 12,
    fontWeight: "800",
    color: "#4d9aff",
  },
  debriefTimelineContent: {
    flex: 1,
    gap: 2,
  },

  /* Replay filters */
  replayFilterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  replayFilterButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3a404a",
    backgroundColor: "#262a32",
    alignItems: "center",
    justifyContent: "center",
  },
  replayFilterButtonActive: {
    backgroundColor: "#1e6fd9",
    borderColor: "#4d9aff",
  },
  replayFilterButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  replayFilterButtonTextActive: {
    color: "#ffffff",
  },
  debriefBlockTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
