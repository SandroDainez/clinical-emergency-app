import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { DecisionTreeEngine } from "../../core/decision-tree/engine";
import type { DecisionTreeDefinition, FrontendTreeStep } from "../../core/decision-tree/types";
import StepHeaderBar from "./template/StepHeaderBar";
import DecisionGrid from "./template/DecisionGrid";

type AclsDecisionFlowScreenProps = {
  tree: DecisionTreeDefinition;
  /** Rótulo curto exibido no topo (ex.: "Bradicardia ACLS"). */
  protocolLabel: string;
  /** Subtítulo opcional sob o título. */
  intro?: string;
  /** Fonte/rodapé (ex.: "Baseado em AHA ACLS 2025"). */
  source?: string;
};

const DISPOSITION_META: Record<
  FrontendTreeStep extends { kind: "transition" } ? string : string,
  { label: string; color: string; bg: string; border: string }
> = {
  discharge: { label: "Alta / observação domiciliar", color: "#86efac", bg: "#052e16", border: "#166534" },
  observation: { label: "Observação monitorizada", color: "#fdba74", bg: "#431407", border: "#c2410c" },
  icu: { label: "UTI / cuidado intensivo", color: "#c4b5fd", bg: "#2e1065", border: "#6d28d9" },
  other_module: { label: "Transição de protocolo", color: "#93c5fd", bg: "#1e3a5f", border: "#2563eb" },
};

export default function AclsDecisionFlowScreen({
  tree,
  protocolLabel,
  intro,
  source,
}: AclsDecisionFlowScreenProps) {
  const router = useRouter();
  const engineRef = useRef<DecisionTreeEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new DecisionTreeEngine(tree);
  }
  const engine = engineRef.current;

  const [step, setStep] = useState<FrontendTreeStep>(() => engine.toFrontendStep());
  const [canGoBack, setCanGoBack] = useState<boolean>(() => engine.canGoBack());
  const [trail, setTrail] = useState<string[]>(() => [engine.toFrontendStep().title]);

  const sync = (pushTitle?: string, replaceTrail?: string[]) => {
    const next = engine.toFrontendStep();
    setStep(next);
    setCanGoBack(engine.canGoBack());
    if (replaceTrail) {
      setTrail(replaceTrail);
    } else if (pushTitle !== undefined) {
      setTrail((current) => [...current, pushTitle]);
    }
  };

  const handleChoose = (optionId: string) => {
    const next = engine.choose(optionId);
    sync(next.title);
  };

  const handleAdvance = () => {
    const next = engine.advance();
    sync(next.title);
  };

  const handleSetValue = (fieldId: string, value: string) => {
    engine.setValue(fieldId, value);
    // Re-renderiza o passo atual (sem alterar a trilha) para refletir o valor.
    setStep(engine.toFrontendStep());
  };

  const handleBack = () => {
    if (!engine.canGoBack()) return;
    engine.goBack();
    setTrail((current) => (current.length > 1 ? current.slice(0, -1) : current));
    setStep(engine.toFrontendStep());
    setCanGoBack(engine.canGoBack());
  };

  const handleReset = () => {
    engine.reset();
    sync(undefined, [engine.toFrontendStep().title]);
  };

  const stepCount = trail.length;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeaderBar protocolLabel={protocolLabel} onBack={() => router.back()} />

        {intro && stepCount === 1 ? (
          <View style={styles.introCard}>
            <Text style={styles.introText}>{intro}</Text>
          </View>
        ) : null}

        {/* Trilha de progresso */}
        <View style={styles.trailRow}>
          <View style={styles.trailBadge}>
            <Text style={styles.trailBadgeText}>Passo {stepCount}</Text>
          </View>
          <Text style={styles.trailText} numberOfLines={1}>
            {trail[trail.length - 1]}
          </Text>
        </View>

        {step.kind === "decision" ? (
          <DecisionStep step={step} onChoose={handleChoose} />
        ) : step.kind === "action" ? (
          <ActionStep step={step} onAdvance={handleAdvance} />
        ) : step.kind === "input" ? (
          <InputStep step={step} onSetValue={handleSetValue} onAdvance={handleAdvance} />
        ) : (
          <TransitionStep
            step={step}
            onOpenModule={(moduleId) => {
              const slug = moduleId.replace(/_/g, "-");
              router.push(`/modulos/${slug}` as never);
            }}
          />
        )}

        {/* Controles */}
        <View style={styles.controlsRow}>
          <Pressable
            style={[styles.controlButton, !canGoBack && styles.controlButtonDisabled]}
            onPress={handleBack}
            disabled={!canGoBack}>
            <Text style={[styles.controlButtonText, !canGoBack && styles.controlButtonTextDisabled]}>
              ‹ Voltar
            </Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={handleReset}>
            <Text style={styles.controlButtonText}>↺ Recomeçar</Text>
          </Pressable>
        </View>

        {source ? <Text style={styles.sourceText}>{source}</Text> : null}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function DecisionStep({
  step,
  onChoose,
}: {
  step: Extract<FrontendTreeStep, { kind: "decision" }>;
  onChoose: (id: string) => void;
}) {
  return (
    <View style={styles.stepStack}>
      <View style={styles.questionCard}>
        <Text style={styles.questionEyebrow}>Decisão clínica</Text>
        <Text style={styles.questionTitle}>{step.title}</Text>
        <Text style={styles.questionText}>{step.question}</Text>
        {step.summary ? <Text style={styles.questionSummary}>{step.summary}</Text> : null}
        {step.evidence.length > 0 ? (
          <View style={styles.evidenceList}>
            {step.evidence.map((item, index) => (
              <View key={index} style={styles.evidenceRow}>
                <View style={styles.evidenceDot} />
                <Text style={styles.evidenceText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <DecisionGrid
        options={step.options.map((o) => ({ id: o.id, label: o.label }))}
        onSelect={onChoose}
        title="Toque para decidir"
      />
    </View>
  );
}

function ActionStep({
  step,
  onAdvance,
}: {
  step: Extract<FrontendTreeStep, { kind: "action" }>;
  onAdvance: () => void;
}) {
  return (
    <View style={styles.stepStack}>
      <View style={styles.actionCard}>
        <Text style={styles.actionEyebrow}>Conduta — fazer agora</Text>
        <Text style={styles.actionTitle}>{step.title}</Text>
        {step.summary ? <Text style={styles.actionSummary}>{step.summary}</Text> : null}
        <View style={styles.actionList}>
          {step.actions.map((item, index) => (
            <View key={index} style={styles.actionItemRow}>
              <View style={styles.actionCheck}>
                <Text style={styles.actionCheckText}>{index + 1}</Text>
              </View>
              <Text style={styles.actionItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.advanceButton, pressed && styles.advanceButtonPressed]}
        onPress={onAdvance}>
        <Text style={styles.advanceButtonText}>Feito — continuar ›</Text>
      </Pressable>
    </View>
  );
}

function InputStep({
  step,
  onSetValue,
  onAdvance,
}: {
  step: Extract<FrontendTreeStep, { kind: "input" }>;
  onSetValue: (fieldId: string, value: string) => void;
  onAdvance: () => void;
}) {
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>({});
  const [customText, setCustomText] = useState<Record<string, string>>({});

  return (
    <View style={styles.stepStack}>
      <View style={styles.inputCard}>
        <Text style={styles.inputEyebrow}>Informar — toque no valor</Text>
        <Text style={styles.inputTitle}>{step.title}</Text>
        {step.intro ? <Text style={styles.inputIntro}>{step.intro}</Text> : null}

        {step.fields.map((field) => {
          const current = step.values[field.id];
          const isPreset = field.presets.some((p) => p.value === current);
          const showingCustom = customOpen[field.id] || (current !== undefined && !isPreset);
          return (
            <View key={field.id} style={styles.inputField}>
              <View style={styles.inputFieldHeader}>
                <Text style={styles.inputFieldLabel}>
                  {field.label}
                  {field.unit ? <Text style={styles.inputUnit}> ({field.unit})</Text> : null}
                </Text>
                {current !== undefined ? (
                  <Text style={styles.inputFieldValue}>
                    {current}
                    {field.unit ? ` ${field.unit}` : ""}
                  </Text>
                ) : null}
              </View>

              <View style={styles.presetWrap}>
                {field.presets.map((preset) => {
                  const active = current === preset.value;
                  return (
                    <Pressable
                      key={preset.value}
                      onPress={() => {
                        onSetValue(field.id, preset.value);
                        setCustomOpen((s) => ({ ...s, [field.id]: false }));
                      }}
                      style={({ pressed }) => [
                        styles.presetChip,
                        active && styles.presetChipActive,
                        pressed && styles.presetChipPressed,
                      ]}>
                      <Text style={[styles.presetChipText, active && styles.presetChipTextActive]}>
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
                {field.allowCustom ? (
                  <Pressable
                    onPress={() => setCustomOpen((s) => ({ ...s, [field.id]: !showingCustom }))}
                    style={({ pressed }) => [
                      styles.presetChip,
                      styles.presetChipOther,
                      showingCustom && styles.presetChipActive,
                      pressed && styles.presetChipPressed,
                    ]}>
                    <Text style={[styles.presetChipText, showingCustom && styles.presetChipTextActive]}>
                      Outro…
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {field.allowCustom && showingCustom ? (
                <View style={styles.customRow}>
                  <TextInput
                    value={customText[field.id] ?? (isPreset ? "" : current ?? "")}
                    onChangeText={(t) => setCustomText((s) => ({ ...s, [field.id]: t }))}
                    placeholder={field.customLabel ?? "Digitar valor"}
                    placeholderTextColor="#64748b"
                    keyboardType={field.customKeyboard === "numeric" ? "numeric" : "default"}
                    style={styles.customInput}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      const v = (customText[field.id] ?? "").trim();
                      if (v) onSetValue(field.id, v);
                    }}
                  />
                  <Pressable
                    onPress={() => {
                      const v = (customText[field.id] ?? "").trim();
                      if (v) onSetValue(field.id, v);
                    }}
                    style={({ pressed }) => [styles.customAdd, pressed && { opacity: 0.85 }]}>
                    <Text style={styles.customAddText}>OK</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <Pressable
        disabled={!step.canContinue}
        style={({ pressed }) => [
          styles.advanceButton,
          !step.canContinue && styles.advanceButtonDisabled,
          pressed && step.canContinue && styles.advanceButtonPressed,
        ]}
        onPress={onAdvance}>
        <Text style={[styles.advanceButtonText, !step.canContinue && styles.advanceButtonTextDisabled]}>
          {step.canContinue ? "Confirmar — continuar ›" : "Preencha os campos"}
        </Text>
      </Pressable>
    </View>
  );
}

function TransitionStep({
  step,
  onOpenModule,
}: {
  step: Extract<FrontendTreeStep, { kind: "transition" }>;
  onOpenModule: (moduleId: string) => void;
}) {
  const meta = DISPOSITION_META[step.disposition] ?? DISPOSITION_META.observation;
  return (
    <View style={styles.stepStack}>
      <View style={[styles.transitionCard, { backgroundColor: meta.bg, borderColor: meta.border }]}>
        <View style={[styles.dispositionBadge, { borderColor: meta.border }]}>
          <Text style={[styles.dispositionBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={styles.transitionTitle}>{step.title}</Text>
        {step.summary ? <Text style={styles.transitionSummary}>{step.summary}</Text> : null}
        {step.exitCriteria.length > 0 ? (
          <View style={styles.evidenceList}>
            {step.exitCriteria.map((item, index) => (
              <View key={index} style={styles.evidenceRow}>
                <View style={[styles.evidenceDot, { backgroundColor: meta.color }]} />
                <Text style={styles.evidenceText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      {step.targets.map((target) => (
        <Pressable
          key={target.moduleId}
          style={({ pressed }) => [styles.targetCard, pressed && styles.targetCardPressed]}
          onPress={() => onOpenModule(target.moduleId)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.targetLabel}>{target.label}</Text>
            <Text style={styles.targetReason}>{target.reason}</Text>
          </View>
          <Text style={styles.targetChevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0f1a" },
  content: { padding: 16, gap: 14 },
  introCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 16,
  },
  introText: { fontSize: 14, lineHeight: 20, color: "#94a3b8" },
  trailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trailBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(14,116,144,0.18)",
    borderWidth: 1,
    borderColor: "#0e7490",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  trailBadgeText: { fontSize: 12, fontWeight: "800", color: "#22d3ee" },
  trailText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#64748b" },
  stepStack: { gap: 14 },

  questionCard: {
    backgroundColor: "#0f172a",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 18,
    gap: 8,
  },
  questionEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  questionTitle: { fontSize: 22, fontWeight: "800", color: "#f1f5f9", lineHeight: 28, letterSpacing: -0.3 },
  questionText: { fontSize: 15, lineHeight: 21, color: "#cbd5e1", fontWeight: "500" },
  questionSummary: { fontSize: 13, lineHeight: 19, color: "#64748b" },
  evidenceList: { gap: 8, marginTop: 4 },
  evidenceRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  evidenceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22d3ee", marginTop: 7, flexShrink: 0 },
  evidenceText: { flex: 1, fontSize: 13, lineHeight: 19, color: "#94a3b8" },

  actionCard: {
    backgroundColor: "#1e3a5f",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#2563eb",
    padding: 18,
    gap: 10,
  },
  actionEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#93c5fd",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  actionTitle: { fontSize: 22, fontWeight: "800", color: "#ffffff", lineHeight: 28, letterSpacing: -0.3 },
  actionSummary: { fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.78)" },
  actionList: { gap: 10, marginTop: 4 },
  actionItemRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  actionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actionCheckText: { fontSize: 12, fontWeight: "800", color: "#ffffff" },
  actionItemText: { flex: 1, fontSize: 14.5, lineHeight: 21, color: "#e2e8f0", fontWeight: "500" },
  advanceButton: {
    minHeight: 64,
    borderRadius: 18,
    backgroundColor: "#1d4ed8",
    borderWidth: 2,
    borderColor: "#93c5fd",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  advanceButtonPressed: { backgroundColor: "#1e40af", shadowOpacity: 0 },
  advanceButtonText: { fontSize: 18, fontWeight: "800", color: "#ffffff", letterSpacing: -0.2 },
  advanceButtonDisabled: { backgroundColor: "#1e293b", borderColor: "#334155", shadowOpacity: 0, elevation: 0 },
  advanceButtonTextDisabled: { color: "#64748b" },

  // ── Input (valor por toque) ───────────────────────────────────────────────
  inputCard: {
    backgroundColor: "#0f172a",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 18,
    gap: 14,
  },
  inputEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  inputTitle: { fontSize: 21, fontWeight: "800", color: "#f1f5f9", lineHeight: 27, letterSpacing: -0.3 },
  inputIntro: { fontSize: 13.5, lineHeight: 19, color: "#94a3b8", marginTop: -6 },
  inputField: { gap: 8, borderTopWidth: 1, borderTopColor: "#1e293b", paddingTop: 12 },
  inputFieldHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  inputFieldLabel: { fontSize: 14, fontWeight: "700", color: "#cbd5e1" },
  inputUnit: { fontSize: 12, fontWeight: "500", color: "#64748b" },
  inputFieldValue: { fontSize: 14, fontWeight: "800", color: "#22d3ee" },
  presetWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  presetChip: {
    minWidth: 52,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    borderWidth: 1.5,
    borderColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  presetChipActive: { backgroundColor: "#0e7490", borderColor: "#22d3ee" },
  presetChipPressed: { opacity: 0.8 },
  presetChipOther: { borderStyle: "dashed", borderColor: "#475569" },
  presetChipText: { fontSize: 14, fontWeight: "700", color: "#cbd5e1" },
  presetChipTextActive: { color: "#ffffff" },
  customRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  customInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#0a0f1a",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    color: "#f1f5f9",
    fontSize: 15,
  },
  customAdd: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#0e7490",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  customAddText: { fontSize: 14, fontWeight: "800", color: "#ffffff" },

  transitionCard: { borderRadius: 22, borderWidth: 1.5, padding: 18, gap: 10 },
  dispositionBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  dispositionBadgeText: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  transitionTitle: { fontSize: 21, fontWeight: "800", color: "#f8fafc", lineHeight: 27 },
  transitionSummary: { fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.78)" },
  targetCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  targetCardPressed: { backgroundColor: "#1e293b", borderColor: "#0e7490" },
  targetLabel: { fontSize: 15, fontWeight: "700", color: "#e2e8f0" },
  targetReason: { fontSize: 12, fontWeight: "500", color: "#64748b", marginTop: 2, lineHeight: 16 },
  targetChevron: { fontSize: 22, fontWeight: "700", color: "#22d3ee" },

  controlsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  controlButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonDisabled: { opacity: 0.4 },
  controlButtonText: { fontSize: 14, fontWeight: "700", color: "#cbd5e1" },
  controlButtonTextDisabled: { color: "#64748b" },
  sourceText: { fontSize: 11, color: "#475569", textAlign: "center", marginTop: 8, fontWeight: "500" },
});
