import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import type {
  AuxiliaryPanel,
  EncounterSummary,
  ProtocolState,
} from "../../clinical-engine";
import SepsisFormTabs from "./sepsis-form-tabs";
import { styles } from "./protocol-screen-styles";
import DecisionGrid from "./template/DecisionGrid";
import { formatOptionLabel, formatReviewDate, getOptionSublabel } from "./protocol-screen-utils";
import {
  getAppGuidelinesStatus,
  fetchRemoteMetadata,
  type AppGuidelinesStatus,
} from "../../lib/guidelines-version";
import { ANAFILAXIA_TABS } from "./anafilaxia-tab-config";
import { getProtocolUiState, updateProtocolUiState } from "../../lib/module-ui-state";

type Props = {
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

const TOTAL_TABS = 4;

export default function AnafilaxiaProtocolScreen(props: Props) {
  const {
    auxiliaryPanel,
    auxiliaryFieldSections,
    canGoBack,
    encounterSummary,
    options,
    state,
    isCurrentStateTimerRunning,
    onFieldChange,
    onPresetApply,
    onUnitChange,
    onActionRun,
    onStatusChange,
    onGoBack,
    onRunTransition,
    onExportSummary,
  } = props;

  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";
  const [activeTab, setActiveTab] = useState(
    () => getProtocolUiState(encounterSummary.protocolId)?.activeTab ?? 0
  );
  const [guidelinesStatus, setGuidelinesStatus] = useState<AppGuidelinesStatus>(() =>
    getAppGuidelinesStatus()
  );

  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, { activeTab });
  }, [activeTab, encounterSummary.protocolId]);

  const isLastTab = activeTab === TOTAL_TABS - 1;
  const tabMeta = ANAFILAXIA_TABS[activeTab];
  const nextTabLabel = ANAFILAXIA_TABS[activeTab + 1]?.label;

  // ── Airway status banner ──────────────────────────────────────────────────
  const airwayField = auxiliaryPanel?.fields.find((f) => f.id === "treatmentAirway");
  const airwayValue = airwayField?.value ?? "";

  // Advanced-airway procedures — marked as "realizada/posicionada" (persist across tabs).
  // matchKey is a unique substring used for precise matching (avoids false positives).
  const AIRWAY_ADVANCED = [
    { label: "IOT realizada", value: "Intubação orotraqueal realizada", matchKey: "orotraqueal realizada", icon: "🫁", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
    { label: "Máscara laríngea", value: "Máscara laríngea posicionada com ventilação efetiva", matchKey: "laríngea posicionada", icon: "😮‍💨", color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
    { label: "BVM", value: "Ventilação com bolsa-válvula-máscara mantida", matchKey: "bolsa-válvula-máscara mantida", icon: "💨", color: "#0369a1", bg: "#eff6ff", border: "#93c5fd" },
    { label: "Cricotireoidostomia", value: "Cricotireoidostomia realizada", matchKey: "Cricotireoidostomia realizada", icon: "✂️", color: "#7c3aed", bg: "#faf5ff", border: "#c4b5fd" },
  ];

  // Basic O2 devices — chips for quick selection in the banner panel.
  const AIRWAY_O2 = [
    { label: "Cateter nasal", value: "Cateter nasal 2–5 L/min", matchKey: "Cateter nasal", icon: "💛", detail: "2–5 L/min", color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
    { label: "Máscara simples", value: "Máscara simples 5–10 L/min", matchKey: "Máscara simples", icon: "🟢", detail: "5–10 L/min", color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
    { label: "Máscara c/ reserv.", value: "Máscara com reservatório 10–15 L/min", matchKey: "Máscara com reservatório", icon: "🟡", detail: "10–15 L/min; SpO₂ 94–98%", color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
    { label: "Alto fluxo", value: "Cânula nasal de alto fluxo 40–60 L/min", matchKey: "alto fluxo", icon: "🔵", detail: "40–60 L/min", color: "#0369a1", bg: "#eff6ff", border: "#93c5fd" },
  ];

  const matchedAdvanced = AIRWAY_ADVANCED.find((q) =>
    airwayValue.toLowerCase().includes(q.matchKey.toLowerCase())
  );
  const matchedO2 = !matchedAdvanced
    ? AIRWAY_O2.find((q) => airwayValue.toLowerCase().includes(q.matchKey.toLowerCase()))
    : undefined;
  const isAdvancedAirway = !!matchedAdvanced;
  const hasResolvedAdvancedAirway =
    isAdvancedAirway ||
    airwayValue.toLowerCase().includes("intubação orotraqueal realizada") ||
    airwayValue.toLowerCase().includes("máscara laríngea posicionada") ||
    airwayValue.toLowerCase().includes("cricotireoidostomia realizada") ||
    airwayValue.toLowerCase().includes("bolsa-válvula-máscara mantida");
  const [airwayExpanded, setAirwayExpanded] = useState(false);

  function handleNextStep() {
    if (!isLastTab) setActiveTab((t) => t + 1);
    else onGoBack(); // last tab → return to modules (summary + export already on tab 3)
  }

  return (
    <>
      <View style={styles.sepsisTopBar}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
            backgroundColor:
              guidelinesStatus.overallColor === "green"
                ? "#f0fdf4"
                : guidelinesStatus.overallColor === "yellow"
                  ? "#fefce8"
                  : "#fef2f2",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderWidth: 1,
            borderColor:
              guidelinesStatus.overallColor === "green"
                ? "#bbf7d0"
                : guidelinesStatus.overallColor === "yellow"
                  ? "#fde68a"
                  : "#fecaca",
            alignSelf: "flex-start",
          }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color:
                guidelinesStatus.overallColor === "green"
                  ? "#166534"
                  : guidelinesStatus.overallColor === "yellow"
                    ? "#92400e"
                    : "#991b1b",
            }}>
            {guidelinesStatus.overallColor === "green" ? "✓" : "⚠"} WAO Anafilaxia · Revisado {formatReviewDate(guidelinesStatus.lastFullReview)} · {guidelinesStatus.overallStatus}
          </Text>
        </View>
        <View style={styles.sepsisTopBarPhase}>
          <View style={styles.phaseProgressBar}>
            {Array.from({ length: TOTAL_TABS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.phaseSegment,
                  i < activeTab + 1 ? styles.phaseSegmentActive : styles.phaseSegmentInactive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.phaseLabel}>
            Etapa {activeTab + 1} de {TOTAL_TABS} — {tabMeta?.phaseTitle ?? ""}
          </Text>
        </View>
        <View style={styles.sepsisTopBarInfo}>
          <Text style={styles.sepsisTopBarStep} numberOfLines={1}>
            Anafilaxia e choque anafilático
          </Text>
        </View>
      </View>

      {/* ── Airway status banner — apenas na aba Evolução (tab 3) ── */}
      {!isEnd && activeTab === 3 && (
        <View style={airwayBanner.wrap}>
          <Pressable
            style={[
              airwayBanner.row,
              matchedAdvanced && { backgroundColor: matchedAdvanced.bg, borderColor: matchedAdvanced.border },
              !matchedAdvanced && matchedO2 && { backgroundColor: matchedO2.bg, borderColor: matchedO2.border },
            ]}
            onPress={() => setAirwayExpanded((v) => !v)}>
            <Text style={airwayBanner.icon}>
              {matchedAdvanced ? matchedAdvanced.icon : matchedO2 ? matchedO2.icon : "🫁"}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[
                airwayBanner.label,
                matchedAdvanced && { color: matchedAdvanced.color },
                !matchedAdvanced && matchedO2 && { color: matchedO2.color },
              ]}>
                {matchedAdvanced
                  ? `Via aérea — ${matchedAdvanced.label}`
                  : matchedO2
                    ? `O₂ — ${matchedO2.label}`
                    : "O₂ / via aérea — marcar aqui"}
              </Text>
              {(matchedAdvanced || matchedO2) && (
                <Text
                  style={[airwayBanner.sub, { color: (matchedAdvanced ?? matchedO2)!.color }]}
                  numberOfLines={1}>
                  {matchedO2 ? matchedO2.detail : airwayValue}
                </Text>
              )}
            </View>
            <Text style={[
              airwayBanner.chev,
              matchedAdvanced && { color: matchedAdvanced.color },
              !matchedAdvanced && matchedO2 && { color: matchedO2.color },
            ]}>
              {airwayExpanded ? "▲" : "▼"}
            </Text>
          </Pressable>

          {airwayExpanded && (
            <View style={airwayBanner.panel}>
              {/* O2 básico */}
              <Text style={airwayBanner.panelLabel}>O₂ em uso:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={airwayBanner.chips}>
                {AIRWAY_O2.map((q) => {
                  const active = !!matchedO2 && matchedO2.matchKey === q.matchKey;
                  return (
                    <Pressable
                      key={q.value}
                      style={[airwayBanner.chip, { borderColor: q.border }, active && { backgroundColor: q.bg }]}
                      onPress={() => {
                        onPresetApply("treatmentAirway", active ? "" : q.value);
                        setAirwayExpanded(false);
                      }}>
                      <Text style={[airwayBanner.chipTxt, { color: q.color }]}>
                        {q.icon} {q.label}
                      </Text>
                      {active && <Text style={[airwayBanner.chipCheck, { color: q.color }]}>✓</Text>}
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Via aérea avançada */}
              <Text style={[airwayBanner.panelLabel, { marginTop: 8 }]}>Via aérea avançada realizada:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={airwayBanner.chips}>
                {AIRWAY_ADVANCED.map((q) => {
                  const active = !!matchedAdvanced && matchedAdvanced.matchKey === q.matchKey;
                  return (
                    <Pressable
                      key={q.value}
                      style={[airwayBanner.chip, { borderColor: q.border }, active && { backgroundColor: q.bg }]}
                      onPress={() => {
                        onPresetApply("treatmentAirway", active ? "Sem indicação imediata de intubação" : q.value);
                        setAirwayExpanded(false);
                      }}>
                      <Text style={[airwayBanner.chipTxt, { color: q.color }]}>
                        {q.icon} {q.label}
                      </Text>
                      {active && <Text style={[airwayBanner.chipCheck, { color: q.color }]}>✓</Text>}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* ── O₂ / via aérea — card de status no tab Tratamento ── */}
      {auxiliaryPanel && activeTab === 2 && !isEnd && (() => {
        const airwayFieldDef = auxiliaryPanel.fields.find((f) => f.id === "treatmentAirway");
        const airwaySuggested = airwayFieldDef?.suggestedValue ?? "";
        const hasIsrAction = auxiliaryPanel.actions.some((a) => a.id === "open_rsi_module");
        const hasVentAction = auxiliaryPanel.actions.some((a) => a.id === "open_ventilation_module");
        const shouldShowIsrAction = hasIsrAction && !hasResolvedAdvancedAirway;

        // Estado 1: Via aérea avançada confirmada (pós-ISR ou marcada manualmente)
        if (isAdvancedAirway && matchedAdvanced) {
          return (
            <View style={airwayStatusCard.wrap}>
              <View style={[airwayStatusCard.row, { backgroundColor: matchedAdvanced.bg, borderColor: matchedAdvanced.border }]}>
                <Text style={airwayStatusCard.icon}>{matchedAdvanced.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={airwayStatusCard.statusLabel}>Via aérea avançada</Text>
                  <Text style={[airwayStatusCard.statusValue, { color: matchedAdvanced.color }]}>
                    {matchedAdvanced.label}
                  </Text>
                </View>
                <View style={[airwayStatusCard.badge, { backgroundColor: matchedAdvanced.color }]}>
                  <Text style={airwayStatusCard.badgeTxt}>✓ Confirmado</Text>
                </View>
              </View>
              {hasVentAction ? (
                <Pressable
                  style={({ pressed }) => [vmCard.btn, { marginTop: 10, marginHorizontal: 0 }, pressed && { opacity: 0.9 }]}
                  onPress={() => onActionRun("open_ventilation_module")}>
                  <View style={vmCard.btnLeft}>
                    <Text style={vmCard.btnIcon}>💨</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={vmCard.btnTitle}>Ventilação mecânica</Text>
                      <Text style={vmCard.btnSub}>Abrir módulo — parâmetros, Vt, PEEP e passo a passo no ventilador</Text>
                    </View>
                  </View>
                  <Text style={vmCard.btnArrow}>›</Text>
                </Pressable>
              ) : null}
            </View>
          );
        }

        // Estado 2: O₂ básico em uso
        if (matchedO2) {
          return (
            <View style={airwayStatusCard.wrap}>
              <View style={[airwayStatusCard.row, { backgroundColor: matchedO2.bg, borderColor: matchedO2.border }]}>
                <Text style={airwayStatusCard.icon}>{matchedO2.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={airwayStatusCard.statusLabel}>O₂ em uso</Text>
                  <Text style={[airwayStatusCard.statusValue, { color: matchedO2.color }]}>
                    {matchedO2.label} — {matchedO2.detail}
                  </Text>
                </View>
                <Pressable
                  style={[airwayStatusCard.badge, { backgroundColor: matchedO2.color }]}
                  onPress={() => onPresetApply("treatmentAirway", "")}>
                  <Text style={airwayStatusCard.badgeTxt}>Alterar</Text>
                </Pressable>
              </View>
              {/* Botão ISR se airway também indicado */}
              {shouldShowIsrAction && (
                <Pressable
                  style={({ pressed }) => [isrCard.btn, { marginTop: 8, marginHorizontal: 0 }, pressed && { opacity: 0.88 }]}
                  onPress={() => onActionRun("open_rsi_module")}>
                  <View style={isrCard.btnLeft}>
                    <Text style={isrCard.btnIcon}>🫁</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={isrCard.btnTitle}>Via aérea avançada indicada</Text>
                      <Text style={isrCard.btnSub}>Abrir módulo ISR — Intubação de Sequência Rápida</Text>
                    </View>
                  </View>
                  <Text style={isrCard.btnArrow}>›</Text>
                </Pressable>
              )}
            </View>
          );
        }

        // Estado 3: Sem seleção — mostrar conduta recomendada
        // Map suggestion text → the closest real preset value so matchedO2/matchedAdvanced fires on accept
        const acceptAirway = () => {
          const s = airwaySuggested.toLowerCase();
          // For advanced airway suggestions add both the O2 device + the airway action token
          if (s.includes("orotraqueal") || s.includes("intubação")) {
            onPresetApply("treatmentAirway", "Máscara com reservatório 10–15 L/min");
            onPresetApply("treatmentAirway", "Preparar sequência rápida para IOT");
          } else if (s.includes("prontidão")) {
            onPresetApply("treatmentAirway", "Máscara com reservatório 10–15 L/min");
            onPresetApply("treatmentAirway", "Via aérea de prontidão; monitorar evolução");
          } else if (s.includes("laríngea")) {
            onPresetApply("treatmentAirway", "Máscara laríngea posicionada com ventilação efetiva");
          } else if (s.includes("alto fluxo")) {
            onPresetApply("treatmentAirway", "Cânula nasal de alto fluxo 40–60 L/min");
          } else if (s.includes("reservatório")) {
            onPresetApply("treatmentAirway", "Máscara com reservatório 10–15 L/min");
          } else if (s.includes("máscara simples")) {
            onPresetApply("treatmentAirway", "Máscara simples 5–10 L/min");
          } else if (s.includes("cateter")) {
            onPresetApply("treatmentAirway", "Cateter nasal 2–5 L/min");
          } else {
            onPresetApply("treatmentAirway", airwaySuggested);
          }
        };

        return (
          <View style={airwayStatusCard.wrap}>
            <View style={airwayStatusCard.recommendRow}>
              <View style={airwayStatusCard.recommendLeft}>
                <Text style={airwayStatusCard.recommendTag}>Conduta inicial recomendada</Text>
                <Text style={airwayStatusCard.recommendValue} numberOfLines={3}>
                  {airwaySuggested || "Preencher dados clínicos para sugestão"}
                </Text>
              </View>
              {airwaySuggested ? (
                <Pressable
                  style={airwayStatusCard.recommendBtn}
                  onPress={acceptAirway}>
                  <Text style={airwayStatusCard.recommendBtnTxt}>Aceitar</Text>
                </Pressable>
              ) : null}
            </View>
            {/* Botão ISR quando indicado */}
            {shouldShowIsrAction && (
              <Pressable
                style={({ pressed }) => [isrCard.btn, { marginTop: 8, marginHorizontal: 0 }, pressed && { opacity: 0.88 }]}
                onPress={() => onActionRun("open_rsi_module")}>
                <View style={isrCard.btnLeft}>
                  <Text style={isrCard.btnIcon}>🫁</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={isrCard.btnTitle}>Via aérea avançada indicada</Text>
                    <Text style={isrCard.btnSub}>Abrir módulo ISR — Intubação de Sequência Rápida</Text>
                  </View>
                </View>
                <Text style={isrCard.btnArrow}>›</Text>
              </Pressable>
            )}
          </View>
        );
      })()}

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
          moduleMode="anafilaxia"
        />
      ) : null}

      {/* ── Resumo do caso + exportação — tab 3 (Evolução) ── */}
      {auxiliaryPanel && activeTab === 3 && !isEnd && (() => {
        const fv = (id: string) => auxiliaryPanel.fields.find(f => f.id === id)?.value ?? "";
        const grade = auxiliaryPanel.metrics.find(m => m.label === "Classificação")?.value ?? "";
        const conduct = auxiliaryPanel.metrics.find(m => m.label === "Conduta imediata")?.value ?? "";

        const summaryLines = [
          { label: "Gatilho", value: [fv("exposureType"), fv("exposureDetail")].filter(Boolean).join(" — ") || "—" },
          { label: "Início", value: fv("timeOnsetMin") ? fv("timeOnsetMin") + " min" : "—" },
          { label: "Classificação", value: grade || "—" },
          { label: "Conduta inicial", value: conduct || "—" },
          { label: "Manifestações", value: fv("symptoms") || "—" },
          { label: "PA", value: fv("systolicPressure") && fv("diastolicPressure") ? `${fv("systolicPressure")}/${fv("diastolicPressure")} mmHg` : "—" },
          { label: "SpO₂ / FC", value: [fv("spo2") ? fv("spo2") + "%" : "", fv("heartRate") ? fv("heartRate") + " bpm" : ""].filter(Boolean).join("  ") || "—" },
          { label: "Adrenalina", value: fv("treatmentAdrenaline") || "—" },
          { label: "O₂ / via aérea", value: fv("treatmentAirway") || fv("treatmentO2") || "—" },
          { label: "Volume", value: fv("treatmentFluids") || "—" },
          { label: "Resposta", value: fv("clinicalResponse") || "—" },
          { label: "Observação", value: fv("observationPlan") || "—" },
          { label: "Destino", value: fv("destination") || "—" },
          { label: "Alta / autoinjetor", value: fv("dischargePlan") || "—" },
        ].filter(row => row.value !== "—");

        const isComplete = summaryLines.length >= 6;
        const destinationVal = fv("destination");
        const destColor =
          destinationVal.includes("UTI") ? "#dc2626" :
          destinationVal.includes("observação") || destinationVal.includes("emergência") ? "#d97706" :
          destinationVal.includes("Alta") ? "#15803d" : "#475569";

        const handleWhatsApp = () => {
          const text = [`RESUMO CLÍNICO — ANAFILAXIA\n${new Date().toLocaleString("pt-BR")}`, ...summaryLines.map(r => `${r.label}: ${r.value}`)].join("\n");
          if (typeof window !== "undefined") window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
        };
        const handleEmail = () => {
          const text = summaryLines.map(r => `${r.label}: ${r.value}`).join("\n");
          if (typeof window !== "undefined") window.open(`mailto:?subject=Resumo%20Anafilaxia&body=${encodeURIComponent("RESUMO CLÍNICO — ANAFILAXIA\n" + new Date().toLocaleString("pt-BR") + "\n\n" + text)}`, "_blank");
        };

        return (
          <View style={summaryCard.wrap}>
            {/* Header */}
            <View style={summaryCard.header}>
              <Text style={summaryCard.headerTitle}>Resumo do atendimento</Text>
              {destinationVal ? (
                <View style={[summaryCard.destBadge, { backgroundColor: destColor }]}>
                  <Text style={summaryCard.destBadgeTxt}>{destinationVal}</Text>
                </View>
              ) : null}
            </View>

            {!isComplete ? (
              <View style={summaryCard.incomplete}>
                <Text style={summaryCard.incompleteIcon}>📋</Text>
                <Text style={summaryCard.incompleteTxt}>Preencha os campos das abas anteriores para gerar o resumo completo.</Text>
              </View>
            ) : (
              <>
                {/* Rows */}
                <View style={summaryCard.rows}>
                  {summaryLines.map((row) => (
                    <View key={row.label} style={summaryCard.row}>
                      <Text style={summaryCard.rowLabel}>{row.label}</Text>
                      <Text style={summaryCard.rowValue} numberOfLines={3}>{row.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Export buttons */}
                <View style={summaryCard.actions}>
                  <Text style={summaryCard.actionsTitle}>Salvar e exportar</Text>
                  <View style={summaryCard.actionsRow}>
                    <Pressable
                      style={({ pressed }) => [summaryCard.actionBtn, summaryCard.actionBtnDownload, pressed && { opacity: 0.85 }]}
                      onPress={onExportSummary}>
                      <Text style={summaryCard.actionBtnIcon}>💾</Text>
                      <Text style={summaryCard.actionBtnTxt}>Salvar / baixar</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [summaryCard.actionBtn, summaryCard.actionBtnWhatsApp, pressed && { opacity: 0.85 }]}
                      onPress={handleWhatsApp}>
                      <Text style={summaryCard.actionBtnIcon}>💬</Text>
                      <Text style={summaryCard.actionBtnTxt}>WhatsApp</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [summaryCard.actionBtn, summaryCard.actionBtnEmail, pressed && { opacity: 0.85 }]}
                      onPress={handleEmail}>
                      <Text style={summaryCard.actionBtnIcon}>✉️</Text>
                      <Text style={summaryCard.actionBtnTxt}>E-mail</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </View>
        );
      })()}

      {/* isEnd state suppressed — summary + export live on tab 3 */}

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

      {!isQuestion && !isCurrentStateTimerRunning ? (
        <View style={styles.primaryActions}>
          {activeTab === 0 ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>← Módulos</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.backButton} onPress={() => setActiveTab((t) => t - 1)}>
              <Text style={styles.backButtonText}>← Anterior</Text>
            </Pressable>
          )}
          <Pressable style={styles.primaryButton} onPress={handleNextStep}>
            <Text style={styles.primaryButtonText}>
              {isLastTab ? "Finalizar" : `Próximo: ${nextTabLabel ?? "…"}`}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* end text suppressed */}
    </>
  );
}

const summaryCard = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
  destBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  destBadgeTxt: { fontSize: 11, fontWeight: "800", color: "#ffffff" },
  rows: { padding: 16, gap: 10 },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowLabel: { width: 110, fontSize: 12, fontWeight: "700", color: "#64748b" },
  rowValue: { flex: 1, fontSize: 13, fontWeight: "600", color: "#1e293b", lineHeight: 18 },
  incomplete: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 20,
  },
  incompleteIcon: { fontSize: 24 },
  incompleteTxt: { flex: 1, fontSize: 13, color: "#64748b", lineHeight: 18 },
  actions: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    padding: 16,
    gap: 10,
  },
  actionsTitle: { fontSize: 12, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 },
  actionsRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  actionBtnDownload: { backgroundColor: "#1e293b" },
  actionBtnWhatsApp: { backgroundColor: "#16a34a" },
  actionBtnEmail:    { backgroundColor: "#0369a1" },
  actionBtnIcon: { fontSize: 18 },
  actionBtnTxt: { fontSize: 11, fontWeight: "800", color: "#ffffff" },
});

const airwayStatusCard = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginBottom: 10,
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  icon: { fontSize: 24 },
  statusLabel: { fontSize: 10, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  statusValue: { fontSize: 14, fontWeight: "800", lineHeight: 19, marginTop: 2 },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTxt: { fontSize: 11, fontWeight: "800", color: "#ffffff" },
  recommendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#7dd3fc",
    padding: 14,
  },
  recommendLeft: { flex: 1, gap: 3 },
  recommendTag: { fontSize: 10, fontWeight: "800", color: "#0369a1", textTransform: "uppercase", letterSpacing: 0.5 },
  recommendValue: { fontSize: 13, fontWeight: "700", color: "#0c4a6e", lineHeight: 18 },
  recommendBtn: {
    backgroundColor: "#0369a1",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  recommendBtnTxt: { fontSize: 12, fontWeight: "800", color: "#ffffff" },
});

/** Botão encaminhamento VM (pós-IOT confirmada) — paleta teal, distinta do ISR */
const vmCard = StyleSheet.create({
  btn: {
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#0f766e",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#0d9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#14b8a6",
  },
  btnLeft:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  btnIcon:  { fontSize: 28 },
  btnTitle: { fontSize: 15, fontWeight: "800", color: "#ffffff", lineHeight: 20 },
  btnSub:   { fontSize: 12, fontWeight: "500", color: "#99f6e4", marginTop: 2 },
  btnArrow: { fontSize: 22, color: "#99f6e4", fontWeight: "800" },
});

const isrCard = StyleSheet.create({
  btn: {
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#7f1d1d",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  btnLeft:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  btnIcon:  { fontSize: 28 },
  btnTitle: { fontSize: 15, fontWeight: "800", color: "#ffffff", lineHeight: 20 },
  btnSub:   { fontSize: 12, fontWeight: "500", color: "#fca5a5", marginTop: 2 },
  btnArrow: { fontSize: 22, color: "#fca5a5", fontWeight: "800" },
  confirmed: {
    marginHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#86efac",
    padding: 14,
  },
  confirmedIcon:    { fontSize: 22 },
  confirmedTitle:   { fontSize: 14, fontWeight: "800" },
  confirmedSub:     { fontSize: 11, fontWeight: "500", marginTop: 1, opacity: 0.8 },
  confirmedBadge:   { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  confirmedBadgeTxt:{ fontSize: 11, fontWeight: "800" },
});

const airwayBanner = StyleSheet.create({
  wrap:       { marginHorizontal: 12, marginBottom: 6 },
  row:        { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f8fafc",
                borderRadius: 10, borderWidth: 1.5, borderColor: "#e2e8f0",
                paddingHorizontal: 12, paddingVertical: 10 },
  icon:       { fontSize: 18 },
  label:      { fontSize: 12, fontWeight: "800", color: "#475569" },
  sub:        { fontSize: 11, fontWeight: "500", marginTop: 1 },
  chev:       { fontSize: 11, color: "#94a3b8" },
  panel:      { backgroundColor: "#ffffff", borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0",
                padding: 12, gap: 8, marginTop: 4 },
  panelLabel: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  chips:      { gap: 8, paddingVertical: 2 },
  chip:       { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 9,
                borderRadius: 20, borderWidth: 1.5, backgroundColor: "#f8fafc" },
  chipTxt:    { fontSize: 13, fontWeight: "700" },
  chipCheck:  { fontSize: 13, fontWeight: "800", marginLeft: 2 },
});
