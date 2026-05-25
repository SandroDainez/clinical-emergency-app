import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams, type Href } from "expo-router";
import type {
  AuxiliaryPanel,
  ClinicalLogEntry,
  EncounterSummary,
  ProtocolState,
} from "../../clinical-engine";
import ClinicalLogCard from "./clinical-log-card";
import SepsisFormTabs from "./sepsis-form-tabs";
import DecisionGrid from "./template/DecisionGrid";
import { formatOptionLabel, formatReviewDate, getOptionSublabel } from "./protocol-screen-utils";
import { setSessionFlowType, applyReturnAction } from "../../sepsis-engine";
import {
  getAppGuidelinesStatus,
  fetchRemoteMetadata,
  type AppGuidelinesStatus,
} from "../../lib/guidelines-version";
import { getProtocolUiState, updateProtocolUiState } from "../../lib/module-ui-state";
import { styles } from "./protocol-screen-styles";

type FlowType = "emergencia" | "uti_internado";

type SepsisProtocolScreenProps = {
  auxiliaryPanel: AuxiliaryPanel | null;
  auxiliaryFieldSections: [string, AuxiliaryPanel["fields"]][];
  canGoBack: boolean;
  clinicalLog: ClinicalLogEntry[];
  encounterSummary: EncounterSummary;
  options: string[];
  state: ProtocolState;
  isCurrentStateTimerRunning: boolean;
  actionButtonLabel: string;
  onFieldChange: (fieldId: string, value: string) => void;
  onPresetApply: (fieldId: string, value: string) => void;
  onUnitChange: (fieldId: string, unit: string) => void;
  onActionRun: (actionId: string, requiresConfirmation?: boolean) => void;
  onStatusChange: (
    itemId: string,
    status: "pendente" | "solicitado" | "realizado",
    requiresConfirmation?: boolean
  ) => void;
  onGoBack: () => void;
  onConfirmAction: () => void;
  onRunTransition: (input?: string) => void;
  onExportSummary: () => void;
  onPrintReport: () => void;
};

// ── Severity derivation ──────────────────────────────────────────────────────
type Severity = "choque" | "sepse" | "suspeita";

function deriveSeverity(panelTitle: string | undefined): Severity {
  const t = (panelTitle ?? "").toLowerCase();
  if (t.includes("choque séptico") || t.includes("choque septico")) return "choque";
  if (t.includes("suspeita") || t.includes("possível") || t.includes("possivel")) return "suspeita";
  if (t.includes("sepse")) return "sepse";
  return "suspeita";
}

// ── Flow selector ────────────────────────────────────────────────────────────
function FlowSelector({ onSelect }: { onSelect: (ft: FlowType) => void }) {
  return (
    <View style={fs.overlay}>
      <View style={fs.card}>
        <View style={fs.badge}>
          <Text style={fs.badgeText}>MÓDULO SEPSE</Text>
        </View>
        <Text style={fs.title}>Qual é o contexto clínico?</Text>
        <Text style={fs.subtitle}>
          O protocolo e as condutas serão adaptados ao seu cenário.
        </Text>

        <Pressable
          style={({ pressed }) => [fs.option, fs.optionEmergency, pressed && fs.optionPressed]}
          onPress={() => onSelect("emergencia")}>
          <View style={[fs.optionIconBox, fs.optionIconBoxEmergency]}>
            <Text style={fs.optionIconText}>🚑</Text>
          </View>
          <View style={fs.optionBody}>
            <Text style={fs.optionTitle}>Primeiro Atendimento</Text>
            <Text style={fs.optionDesc}>
              PS · UPA · Emergência — triagem, diagnóstico, estabilização e ATB inicial
            </Text>
          </View>
          <Text style={fs.optionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [fs.option, fs.optionICU, pressed && fs.optionPressed]}
          onPress={() => onSelect("uti_internado")}>
          <View style={[fs.optionIconBox, fs.optionIconBoxICU]}>
            <Text style={fs.optionIconText}>🏥</Text>
          </View>
          <View style={fs.optionBody}>
            <Text style={fs.optionTitle}>Paciente Internado na UTI</Text>
            <Text style={fs.optionDesc}>
              Piora clínica · Choque · Escalada de ATB · Drogas vasoativas
            </Text>
          </View>
          <Text style={fs.optionArrow}>›</Text>
        </Pressable>

        <Text style={fs.footnote}>SSC 2021 · Sepsis-3</Text>
      </View>
    </View>
  );
}

const fs = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0f766e",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dc2626",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  optionEmergency: {
    borderColor: "#1d4ed8",
    backgroundColor: "#0a1628",
  },
  optionICU: {
    borderColor: "#6d28d9",
    backgroundColor: "#120a28",
  },
  optionPressed: { opacity: 0.75 },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconBoxEmergency: { backgroundColor: "#1e3a8a" },
  optionIconBoxICU: { backgroundColor: "#3b0764" },
  optionIconText: { fontSize: 22 },
  optionBody: { flex: 1, gap: 3 },
  optionTitle: { fontSize: 15, fontWeight: "700", color: "#f1f5f9" },
  optionDesc: { fontSize: 11, color: "#64748b", lineHeight: 16 },
  optionArrow: { fontSize: 20, color: "#334155", fontWeight: "700" },
  footnote: {
    fontSize: 10,
    color: "#334155",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

// ── Severity header ──────────────────────────────────────────────────────────
function SepsisHeader({
  severity,
  flowType,
  isICU,
  state,
  guidelinesStatus,
  onChangeFlow,
}: {
  severity: Severity;
  flowType: FlowType;
  isICU: boolean;
  state: ProtocolState;
  guidelinesStatus: AppGuidelinesStatus;
  onChangeFlow: () => void;
}) {
  const severityConfig = {
    choque: { label: "CHOQUE SÉPTICO", bg: "#dc2626", text: "#ffffff", border: "#b91c1c" },
    sepse:  { label: "SEPSE",          bg: "#d97706", text: "#ffffff", border: "#b45309" },
    suspeita:{ label: "SEPSE POSSÍVEL", bg: "#0891b2", text: "#ffffff", border: "#0e7490" },
  }[severity];

  return (
    <View style={sh.container}>
      {/* Top row: severity + flow chip */}
      <View style={sh.topRow}>
        <View style={[sh.severityPill, { backgroundColor: severityConfig.bg, borderColor: severityConfig.border }]}>
          <Text style={[sh.severityText, { color: severityConfig.text }]}>{severityConfig.label}</Text>
        </View>
        <Pressable onPress={onChangeFlow} style={sh.flowChip}>
          <Text style={sh.flowChipText}>
            {isICU ? "🏥 UTI" : "🚑 Emergência"} · alterar
          </Text>
        </Pressable>
      </View>

      {/* Phase progress */}
      {state.phaseLabel && state.phaseStep && state.phaseTotal ? (
        <View style={sh.phaseRow}>
          <View style={sh.phaseBar}>
            {Array.from({ length: state.phaseTotal }).map((_, i) => (
              <View
                key={i}
                style={[sh.phaseSeg, i < state.phaseStep! ? sh.phaseSegActive : sh.phaseSegInactive]}
              />
            ))}
          </View>
          <Text style={sh.phaseLabel}>
            Fase {state.phaseStep}/{state.phaseTotal} — {state.phaseLabel}
          </Text>
        </View>
      ) : null}

      {/* Current step text */}
      <View style={sh.stepBlock}>
        <Text style={sh.stepText} numberOfLines={2}>{state.text}</Text>
        {state.details?.[0] ? (
          <Text style={sh.stepHint} numberOfLines={3}>{state.details[0]}</Text>
        ) : null}
      </View>

      {/* Guidelines badge */}
      <View style={[
        sh.guidelinesBadge,
        guidelinesStatus.overallColor === "green" ? sh.guidelinesBadgeGreen
          : guidelinesStatus.overallColor === "yellow" ? sh.guidelinesBadgeYellow
          : sh.guidelinesBadgeRed,
      ]}>
        <Text style={[
          sh.guidelinesText,
          guidelinesStatus.overallColor === "green" ? sh.guidelinesTextGreen
            : guidelinesStatus.overallColor === "yellow" ? sh.guidelinesTextYellow
            : sh.guidelinesTextRed,
        ]}>
          {guidelinesStatus.overallColor === "green" ? "✓" : "⚠"}{" "}
          SSC · Revisado {formatReviewDate(guidelinesStatus.lastFullReview)} · {guidelinesStatus.overallStatus}
        </Text>
      </View>
    </View>
  );
}

const sh = StyleSheet.create({
  container: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  severityPill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  flowChip: {
    backgroundColor: "#1e293b",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  flowChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
  },
  phaseRow: { gap: 4 },
  phaseBar: { flexDirection: "row", gap: 3 },
  phaseSeg: { flex: 1, height: 3, borderRadius: 2 },
  phaseSegActive: { backgroundColor: "#0891b2" },
  phaseSegInactive: { backgroundColor: "#1e293b" },
  phaseLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0891b2",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  stepBlock: { gap: 4 },
  stepText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f1f5f9",
    lineHeight: 21,
  },
  stepHint: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
    fontWeight: "500",
  },
  guidelinesBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
  },
  guidelinesBadgeGreen: { backgroundColor: "#052e16", borderColor: "#166534" },
  guidelinesBadgeYellow: { backgroundColor: "#451a03", borderColor: "#92400e" },
  guidelinesBadgeRed: { backgroundColor: "#450a0a", borderColor: "#991b1b" },
  guidelinesText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.2 },
  guidelinesTextGreen: { color: "#4ade80" },
  guidelinesTextYellow: { color: "#fbbf24" },
  guidelinesTextRed: { color: "#f87171" },
});

// ── Metrics strip ────────────────────────────────────────────────────────────
function MetricsStrip({ metrics }: { metrics: AuxiliaryPanel["metrics"] }) {
  if (!metrics || metrics.length === 0) return null;
  return (
    <View style={ms.row}>
      {metrics.slice(0, 6).map((m) => (
        <View key={m.label} style={ms.chip}>
          <Text style={ms.chipLabel}>{m.label}</Text>
          <Text style={ms.chipValue}>{m.value || "—"}</Text>
        </View>
      ))}
    </View>
  );
}

const ms = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  chipLabel: {
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#94a3b8",
  },
  chipValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
});

// ── Clinical actions links ───────────────────────────────────────────────────
type ClinicalActionLink = {
  route: Href;
  icon: string;
  label: string;
  sublabel: string;
  indication: string;
  urgent?: boolean;
};

const SEPSIS_ACTION_LINKS: ClinicalActionLink[] = [
  {
    route: "/modulos/isr-rapida?from_module=sepse-adulto" as Href,
    icon: "IOT",
    label: "ISR / Intubação",
    sublabel: "Via aérea difícil · Sequência rápida",
    indication: "intubation",
    urgent: true,
  },
  {
    route: "/modulos/drogas-vasoativas?from_module=sepse-adulto" as Href,
    icon: "VA",
    label: "Drogas Vasoativas",
    sublabel: "Noradrena · Vasopressina · Dobuta",
    indication: "vasopressor",
    urgent: true,
  },
  {
    route: "/modulos/ventilacao-mecanica?from_module=sepse-adulto" as Href,
    icon: "VM",
    label: "Ventilação Mecânica",
    sublabel: "Setup inicial · PEEP · Modos",
    indication: "ventilation",
  },
];

function hasIndication(panel: AuxiliaryPanel, indication: string): boolean {
  const fields = panel.fields ?? [];
  const getVal = (id: string) =>
    fields.find((f) => f.id === id)?.value?.toString().toLowerCase() ?? "";

  switch (indication) {
    case "intubation": {
      const iot = getVal("intubationDecision");
      const diag = getVal("diagnosticHypothesis");
      const spo2 = parseFloat(getVal("oxygenSaturation").replace(",", "."));
      const ph = parseFloat(getVal("ph").replace(",", "."));
      return (
        /iot|intub|vm|ventilação/i.test(iot) ||
        /choque/i.test(diag) ||
        (!isNaN(spo2) && spo2 < 88) ||
        (!isNaN(ph) && ph < 7.2)
      );
    }
    case "vasopressor": {
      const vaso = getVal("vasopressorUse");
      const diag = getVal("diagnosticHypothesis");
      const map = (() => {
        const pas = parseFloat(getVal("systolicPressure").replace(",", "."));
        const pad = parseFloat(getVal("diastolicPressure").replace(",", "."));
        return !isNaN(pas) && !isNaN(pad) ? (pas + 2 * pad) / 3 : NaN;
      })();
      return (
        /noradrena|vasopres|dopamina|dobutamina/i.test(vaso) ||
        /choque/i.test(diag) ||
        (!isNaN(map) && map < 65)
      );
    }
    case "ventilation": {
      const iot = getVal("intubationDecision");
      const ventMode = getVal("ventilationMode");
      return /iot|intub|vm|ventila/i.test(iot) || ventMode.length > 0;
    }
    default:
      return false;
  }
}

function ClinicalActionsPanel({
  panel,
  links,
  onNavigate,
}: {
  panel: AuxiliaryPanel;
  links: ClinicalActionLink[];
  onNavigate: (route: Href) => void;
}) {
  const visibleLinks = links.filter((l) => hasIndication(panel, l.indication));
  if (visibleLinks.length === 0) return null;

  return (
    <View style={cap.container}>
      <View style={cap.dividerRow}>
        <View style={cap.dividerLine} />
        <Text style={cap.dividerLabel}>AÇÕES INDICADAS</Text>
        <View style={cap.dividerLine} />
      </View>
      <View style={cap.grid}>
        {visibleLinks.map((link) => (
          <Pressable
            key={link.label}
            onPress={() => onNavigate(link.route)}
            style={({ pressed }) => [cap.card, link.urgent && cap.cardUrgent, pressed && cap.cardPressed]}>
            <View style={[cap.iconBox, link.urgent && cap.iconBoxUrgent]}>
              <Text style={[cap.iconText, link.urgent && cap.iconTextUrgent]}>{link.icon}</Text>
            </View>
            <View style={cap.cardBody}>
              <Text style={[cap.cardLabel, link.urgent && cap.cardLabelUrgent]}>{link.label}</Text>
              <Text style={cap.cardSub}>{link.sublabel}</Text>
            </View>
            <Text style={cap.arrow}>›</Text>
          </Pressable>
        ))}
      </View>
      <Text style={cap.hint}>Voltar retorna ao protocolo Sepse</Text>
    </View>
  );
}

const cap = StyleSheet.create({
  container: { gap: 8 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1e293b" },
  dividerLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  grid: { gap: 7 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 11,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardUrgent: { borderColor: "#7f1d1d", backgroundColor: "#1a0a0a" },
  cardPressed: { opacity: 0.8 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxUrgent: { backgroundColor: "#450a0a", borderColor: "#7f1d1d" },
  iconText: { fontSize: 10, fontWeight: "800", color: "#64748b" },
  iconTextUrgent: { color: "#f87171" },
  cardBody: { flex: 1, gap: 2 },
  cardLabel: { fontSize: 13, fontWeight: "700", color: "#f1f5f9" },
  cardLabelUrgent: { color: "#fca5a5" },
  cardSub: { fontSize: 10, fontWeight: "500", color: "#475569", lineHeight: 14 },
  arrow: { fontSize: 18, color: "#334155", fontWeight: "700" },
  hint: { fontSize: 9, fontWeight: "600", color: "#334155", textAlign: "center", letterSpacing: 0.3 },
});

// ── Main component ───────────────────────────────────────────────────────────
function SepsisProtocolScreen({
  auxiliaryPanel,
  auxiliaryFieldSections,
  canGoBack,
  clinicalLog,
  encounterSummary,
  options,
  state,
  isCurrentStateTimerRunning,
  actionButtonLabel,
  onFieldChange,
  onPresetApply,
  onUnitChange,
  onActionRun,
  onStatusChange,
  onGoBack,
  onConfirmAction,
  onRunTransition,
  onExportSummary,
  onPrintReport,
}: SepsisProtocolScreenProps) {
  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";
  const router = useRouter();
  const params = useLocalSearchParams<{ return_action?: string }>();
  const [flowType, setFlowType] = useState<FlowType | null>(
    () => (getProtocolUiState(encounterSummary.protocolId)?.flowType as FlowType | undefined) ?? null
  );
  const [activeTab, setActiveTab] = useState(
    () => getProtocolUiState(encounterSummary.protocolId)?.activeTab ?? 0
  );
  const isICU = flowType === "uti_internado";
  const [guidelinesStatus, setGuidelinesStatus] = useState<AppGuidelinesStatus>(
    () => getAppGuidelinesStatus()
  );
  const severity = deriveSeverity(auxiliaryPanel?.title);

  useEffect(() => {
    if (params.return_action) {
      applyReturnAction(params.return_action);
    }
  }, [params.return_action]);

  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, {
      activeTab,
      flowType: flowType ?? undefined,
    });
  }, [activeTab, encounterSummary.protocolId, flowType]);

  function handleSelectFlow(ft: FlowType) {
    setSessionFlowType(ft);
    setFlowType(ft);
    setActiveTab(0);
  }

  const TOTAL_TABS = isICU ? 6 : 5;
  const isLastTab = activeTab === TOTAL_TABS - 1;
  const tabLabels = isICU
    ? ["Ex. Clínico", "Diagnóstico", "Estabilização", "Conduta", "UTI", ""]
    : ["Ex. Clínico", "Diagnóstico", "Estabilização", "Conduta", ""];

  function handleNextStep() {
    if (!isLastTab) {
      setActiveTab((t) => t + 1);
    } else {
      onConfirmAction();
    }
  }

  if (flowType === null) {
    return <FlowSelector onSelect={handleSelectFlow} />;
  }

  return (
    <>
      {/* ── Severity + phase header ──────────────────────────── */}
      <SepsisHeader
        severity={severity}
        flowType={flowType}
        isICU={isICU}
        state={state}
        guidelinesStatus={guidelinesStatus}
        onChangeFlow={() => setFlowType(null)}
      />

      {/* ── Key metrics strip ─────────────────────────────────── */}
      {auxiliaryPanel && auxiliaryPanel.metrics.length > 0 ? (
        <MetricsStrip metrics={auxiliaryPanel.metrics} />
      ) : null}

      {/* ── Formulário em abas ─────────────────────────────────── */}
      {auxiliaryPanel ? (
        <SepsisFormTabs
          auxiliaryPanel={auxiliaryPanel}
          fieldSections={auxiliaryFieldSections}
          metrics={auxiliaryPanel.metrics}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFieldChange={onFieldChange}
          onPresetApply={onPresetApply}
          onUnitChange={onUnitChange}
          onActionRun={onActionRun}
          onStatusChange={onStatusChange}
          flowType={flowType}
          onCtaAction={(actionId) => {
            if (actionId === "switch_to_emergencia") {
              handleSelectFlow("emergencia");
            }
          }}
        />
      ) : null}

      {/* ── Log clínico (ao finalizar) ────────────────────────── */}
      {isEnd ? (
        <ClinicalLogCard
          clinicalLog={clinicalLog}
          encounterSummary={encounterSummary}
          onExport={onExportSummary}
          onPrint={onPrintReport}
        />
      ) : null}

      {/* ── Decisão clínica ──────────────────────────────────── */}
      {isQuestion ? (
        <View style={{ gap: 10 }}>
          {canGoBack ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </Pressable>
          ) : null}
          <DecisionGrid
            options={options.map((opt) => ({
              id: opt,
              label: formatOptionLabel(opt),
              sublabel: getOptionSublabel(opt),
            }))}
            title={state.text}
            onSelect={(id) => onRunTransition(id)}
          />
        </View>
      ) : null}

      {/* ── Ações clínicas indicadas ─────────────────────────── */}
      {auxiliaryPanel && !isEnd ? (
        <ClinicalActionsPanel
          panel={auxiliaryPanel}
          links={SEPSIS_ACTION_LINKS}
          onNavigate={(route) => router.push(route)}
        />
      ) : null}

      {/* ── Navegação de etapas ───────────────────────────────── */}
      {!isQuestion && !isEnd && !isCurrentStateTimerRunning ? (
        <View style={styles.primaryActions}>
          {canGoBack && activeTab === 0 ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>
          ) : activeTab > 0 ? (
            <Pressable style={styles.backButton} onPress={() => setActiveTab((t) => t - 1)}>
              <Text style={styles.backButtonText}>← Anterior</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.primaryButton} onPress={handleNextStep}>
            <Text style={styles.primaryButtonText}>
              {isLastTab ? actionButtonLabel || "Finalizar" : `Próximo: ${tabLabels[activeTab]}`}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {isEnd ? (
        <Text style={styles.endText}>
          Atendimento finalizado. Reavaliar contexto clínico se necessário.
        </Text>
      ) : null}
    </>
  );
}

export default SepsisProtocolScreen;
