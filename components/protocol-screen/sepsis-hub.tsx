import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import type { ReversibleCause, SepsisHubData } from "../../clinical-engine";

type SepsisHubProps = {
  data: SepsisHubData;
  onStatusUpdate: (itemId: string, status: "pendente" | "solicitado" | "realizado") => void;
};

function SepsisHub({ data, onStatusUpdate }: SepsisHubProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isUrgent = data.pendingBundleCount > 0 && !!data.antibioticTimer;

  useEffect(() => {
    if (!isUrgent) {
      pulseAnim.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isUrgent, pulseAnim]);

  return (
    <View style={hub.container}>
      {/* ── Bundle 1h timer ───────────────────────────────────── */}
      {data.antibioticTimer ? (
        <Animated.View
          style={[hub.timerCard, isUrgent && hub.timerCardUrgent, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={hub.timerEyebrow}>Bundle 1 hora — Antimicrobiano</Text>
          <Text style={[hub.timerValue, isUrgent && hub.timerValueUrgent]}>
            {data.antibioticTimer.remainingLabel}
          </Text>
          <Text style={hub.timerGoal}>Meta: ATB em até 60 min do reconhecimento</Text>
          {data.antibioticTimer.nextAlertLabel ? (
            <View style={hub.timerAlertRow}>
              <Text style={hub.timerAlertDot}>⏰</Text>
              <Text style={hub.timerAlertText}>
                Próximo alerta em {data.antibioticTimer.nextAlertLabel}
              </Text>
            </View>
          ) : null}
        </Animated.View>
      ) : (
        <View style={hub.timerCardDone}>
          <Text style={hub.timerDoneIcon}>✓</Text>
          <Text style={hub.timerDoneText}>Antimicrobiano administrado</Text>
        </View>
      )}

      {/* ── Contexto clínico ──────────────────────────────────── */}
      <View style={hub.contextCard}>
        <Text style={hub.contextTitle}>Contexto Clínico</Text>
        <View style={hub.contextGrid}>
          <ContextCell label="Cenário" value={data.scenarioLabel} />
          <ContextCell label="Foco suspeito" value={data.focusLabel} />
          <ContextCell label="Tempo reconhecido" value={data.recognitionElapsed} />
        </View>
        {data.assessmentSummary ? (
          <Text style={hub.contextSummary}>{data.assessmentSummary}</Text>
        ) : null}
        {data.patientSummary.length > 0 ? (
          <View style={hub.summaryBlock}>
            {data.patientSummary.map((line, i) => (
              <Text key={`${line}-${i}`} style={hub.summaryLine}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      {/* ── Bundle items ──────────────────────────────────────── */}
      <View style={hub.bundleCard}>
        <View style={hub.bundleHeader}>
          <Text style={hub.bundleTitle}>Itens do Bundle</Text>
          <View style={[hub.bundlePill, data.pendingBundleCount === 0 && hub.bundlePillDone]}>
            <Text style={[hub.bundlePillText, data.pendingBundleCount === 0 && hub.bundlePillTextDone]}>
              {data.pendingBundleCount === 0
                ? "Todos completos"
                : `${data.pendingBundleCount} pendente${data.pendingBundleCount > 1 ? "s" : ""}`}
            </Text>
          </View>
        </View>
        <View style={hub.bundleList}>
          {data.bundleItems.map((item) => (
            <SepsisBundleRow key={item.id} item={item} onStatusUpdate={onStatusUpdate} />
          ))}
        </View>
      </View>
    </View>
  );
}

function ContextCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={hub.contextCell}>
      <Text style={hub.contextCellLabel}>{label}</Text>
      <Text style={hub.contextCellValue}>{value}</Text>
    </View>
  );
}

type SepsisBundleRowProps = {
  item: SepsisHubData["bundleItems"][number];
  onStatusUpdate: (itemId: string, status: "pendente" | "solicitado" | "realizado") => void;
};

function SepsisBundleRow({ item, onStatusUpdate }: SepsisBundleRowProps) {
  const isDone = item.currentStatus === "realizado";
  const isRequested = item.currentStatus === "solicitado";

  return (
    <View style={[hub.bundleRow, isDone && hub.bundleRowDone, isRequested && hub.bundleRowRequested]}>
      <View style={hub.bundleRowLeft}>
        <View style={[
          hub.bundleStatusDot,
          isDone && hub.bundleStatusDotDone,
          isRequested && hub.bundleStatusDotRequested,
        ]} />
        <View style={hub.bundleRowContent}>
          <Text style={[hub.bundleRowLabel, isDone && hub.bundleRowLabelDone]}>{item.label}</Text>
          {item.value ? (
            <Text style={hub.bundleRowValue}>{item.value}</Text>
          ) : null}
          {item.helperText ? (
            <Text style={hub.bundleRowHelper}>{item.helperText}</Text>
          ) : null}
        </View>
      </View>
      <View style={hub.bundleRowActions}>
        {item.options.map((option) => {
          const isActive = item.currentStatus === option.status;
          return (
            <Pressable
              key={`${item.id}-${option.status}`}
              onPress={() => onStatusUpdate(item.id, option.status)}
              style={({ pressed }) => [
                hub.bundleBtn,
                option.status === "solicitado" && hub.bundleBtnRequested,
                option.status === "realizado" && hub.bundleBtnDone,
                isActive && hub.bundleBtnActive,
                pressed && hub.bundleBtnPressed,
              ]}>
              <Text style={[hub.bundleBtnText, isActive && hub.bundleBtnTextActive]}>
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
  if (causes.length === 0) return null;

  return (
    <View style={focus.container}>
      <Text style={focus.title}>Controle de Foco Infeccioso</Text>
      <Text style={focus.hint}>
        Identifique e acompanhe o foco. Controle precoce reduz mortalidade.
      </Text>
      {causes.map((cause) => (
        <View key={cause.id} style={focus.item}>
          <View style={focus.itemHeader}>
            <Text style={focus.itemTitle}>{cause.label}</Text>
            <View style={[
              focus.statusPill,
              cause.status === "suspeita" && focus.pillSuspected,
              cause.status === "abordada" && focus.pillAddressed,
            ]}>
              <Text style={[
                focus.statusPillText,
                cause.status === "suspeita" && focus.pillTextSuspected,
                cause.status === "abordada" && focus.pillTextAddressed,
              ]}>
                {cause.status === "suspeita" ? "Suspeita" : cause.status === "abordada" ? "Abordado" : "Pendente"}
              </Text>
            </View>
          </View>
          {cause.actions.length > 0 ? (
            <View style={focus.actionsList}>
              {cause.actions.map((action) => (
                <Text key={action} style={focus.actionItem}>• {action}</Text>
              ))}
            </View>
          ) : null}
          <View style={focus.buttons}>
            <Pressable style={focus.btnSuspect} onPress={() => onUpdate(cause.id, "suspeita")}>
              <Text style={focus.btnText}>Marcar suspeita</Text>
            </Pressable>
            <Pressable style={focus.btnAddress} onPress={() => onUpdate(cause.id, "abordada")}>
              <Text style={focus.btnText}>Marcar abordado</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const hub = StyleSheet.create({
  container: { gap: 10 },

  // Timer
  timerCard: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  timerCardUrgent: {
    borderColor: "#dc2626",
    backgroundColor: "#1a0a0a",
  },
  timerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#64748b",
  },
  timerValue: {
    fontSize: 52,
    fontWeight: "800",
    color: "#22c55e",
    lineHeight: 60,
    letterSpacing: -1,
  },
  timerValueUrgent: {
    color: "#ef4444",
  },
  timerGoal: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
    textAlign: "center",
  },
  timerAlertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  timerAlertDot: { fontSize: 12 },
  timerAlertText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f59e0b",
  },
  timerCardDone: {
    backgroundColor: "#052e16",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#166534",
  },
  timerDoneIcon: { fontSize: 16, color: "#22c55e" },
  timerDoneText: { fontSize: 14, fontWeight: "700", color: "#22c55e" },

  // Context card
  contextCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  contextTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#94a3b8",
  },
  contextGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  contextCell: {
    flex: 1,
    minWidth: 100,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 8,
    gap: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  contextCellLabel: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#94a3b8",
  },
  contextCellValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 16,
  },
  contextSummary: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    fontStyle: "italic",
  },
  summaryBlock: {
    gap: 3,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  summaryLine: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 17,
    fontWeight: "500",
  },

  // Bundle
  bundleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bundleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bundleTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  bundlePill: {
    backgroundColor: "#fef3c7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  bundlePillDone: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  bundlePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#92400e",
  },
  bundlePillTextDone: {
    color: "#166534",
  },
  bundleList: { gap: 8 },

  bundleRow: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  bundleRowDone: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  bundleRowRequested: {
    backgroundColor: "#fefce8",
    borderColor: "#fde68a",
  },
  bundleRowLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bundleStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginTop: 4,
  },
  bundleStatusDotDone: { backgroundColor: "#22c55e" },
  bundleStatusDotRequested: { backgroundColor: "#eab308" },
  bundleRowContent: { flex: 1, gap: 2 },
  bundleRowLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 18,
  },
  bundleRowLabelDone: { color: "#166534" },
  bundleRowValue: { fontSize: 11, color: "#64748b", fontWeight: "500" },
  bundleRowHelper: { fontSize: 11, color: "#64748b", fontStyle: "italic", lineHeight: 15 },
  bundleRowActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingLeft: 16,
  },
  bundleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  bundleBtnRequested: { backgroundColor: "#fefce8", borderColor: "#fde047" },
  bundleBtnDone: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  bundleBtnActive: { borderWidth: 2 },
  bundleBtnPressed: { opacity: 0.7 },
  bundleBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  bundleBtnTextActive: { color: "#0f172a" },
});

const focus = StyleSheet.create({
  container: {
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9a3412",
    letterSpacing: 0.2,
  },
  hint: { fontSize: 11, color: "#c2410c", lineHeight: 16 },
  item: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: { flex: 1, fontSize: 13, fontWeight: "700", color: "#0f172a" },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pillSuspected: { backgroundColor: "#fef3c7", borderColor: "#fde68a" },
  pillAddressed: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  statusPillText: { fontSize: 10, fontWeight: "700", color: "#64748b" },
  pillTextSuspected: { color: "#92400e" },
  pillTextAddressed: { color: "#166534" },
  actionsList: { gap: 3, paddingLeft: 4 },
  actionItem: { fontSize: 11, color: "#475569", lineHeight: 16 },
  buttons: { flexDirection: "row", gap: 8 },
  btnSuspect: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde068",
    alignItems: "center",
  },
  btnAddress: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#86efac",
    alignItems: "center",
  },
  btnText: { fontSize: 11, fontWeight: "700", color: "#0f172a" },
});

export { SepsisFocusChecklist };
export default SepsisHub;
