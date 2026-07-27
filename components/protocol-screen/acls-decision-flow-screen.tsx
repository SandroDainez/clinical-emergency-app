import { useRef, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { DecisionTreeEngine } from "../../core/decision-tree/engine";
import type { DecisionTreeDefinition, FrontendTreeStep } from "../../core/decision-tree/types";
import StepHeaderBar from "./template/StepHeaderBar";
import DecisionGrid from "./template/DecisionGrid";
import StabilizationFirstCard from "./stabilization-first-card";
import { useTr } from "../../lib/use-tr";

type AclsDecisionFlowScreenProps = {
  tree: DecisionTreeDefinition;
  /** Rótulo curto exibido no topo (ex.: "Bradicardia ACLS"). */
  protocolLabel: string;
  /** Subtítulo opcional sob o título. */
  intro?: string;
  /** Fonte/rodapé (ex.: "Baseado em AHA ACLS 2025"). */
  source?: string;
  /** Título grande do cabeçalho (default "ACLS · Emergência"). */
  headerTitle?: string;
  /** Slug do módulo atual — remove o atalho de auto-referência no card de estabilização. */
  currentModuleSlug?: string;
  /** Conteúdo opcional fixo no topo (ex.: configurador da VM), sempre visível. */
  topContent?: ReactNode;
};

const DISPOSITION_META: Record<
  FrontendTreeStep extends { kind: "transition" } ? string : string,
  { label: string; color: string; bg: string; border: string }
> = {
  discharge: { label: "Alta / observação domiciliar", color: "#86efac", bg: "#052e16", border: "#166534" },
  observation: { label: "Observação monitorizada", color: "#fdba74", bg: "#431407", border: "#c2410c" },
  icu: { label: "UTI / cuidado intensivo", color: "#c4b5fd", bg: "#2e1065", border: "#6d28d9" },
  other_module: { label: "Transição de guia", color: "#93c5fd", bg: "#1e3a5f", border: "#2563eb" },
};

export default function AclsDecisionFlowScreen({
  tree,
  protocolLabel,
  intro,
  source,
  headerTitle,
  currentModuleSlug,
  topContent,
}: AclsDecisionFlowScreenProps) {
  const tr = useTr();
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
        <StepHeaderBar protocolLabel={tr(protocolLabel)} onBack={() => router.back()} title={headerTitle ? tr(headerTitle) : undefined} />

        <StabilizationFirstCard
          defaultExpanded={stepCount === 1}
          currentModuleSlug={currentModuleSlug}
          onOpenModule={(slug) => router.push(`/modulos/${slug}` as never)}
        />

        {topContent}

        {intro && stepCount === 1 ? (
          <View style={styles.introCard}>
            <Text style={styles.introText}>{tr(intro)}</Text>
          </View>
        ) : null}

        {/* Trilha de progresso */}
        <View style={styles.trailRow}>
          <View style={styles.trailBadge}>
            <Text style={styles.trailBadgeText}>{tr("Passo")} {stepCount}</Text>
          </View>
          <Text style={styles.trailText} numberOfLines={1}>
            {tr(trail[trail.length - 1])}
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
              {tr("‹ Voltar")}
            </Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={handleReset}>
            <Text style={styles.controlButtonText}>{tr("↺ Recomeçar")}</Text>
          </Pressable>
        </View>

        {source ? <Text style={styles.sourceText}>{tr(source)}</Text> : null}
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
  const tr = useTr();
  return (
    <View style={styles.stepStack}>
      <View style={styles.questionCard}>
        <Text style={styles.questionEyebrow}>{tr("Decisão clínica")}</Text>
        <Text style={styles.questionTitle}>{tr(step.title)}</Text>
        <Text style={styles.questionText}>{tr(step.question)}</Text>
        {step.summary ? <Text style={styles.questionSummary}>{tr(step.summary)}</Text> : null}
        {step.evidence.length > 0 ? (
          <View style={styles.evidenceList}>
            {step.evidence.map((item, index) => (
              <View key={index} style={styles.evidenceRow}>
                <View style={styles.evidenceDot} />
                <Text style={styles.evidenceText}>{tr(item)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <DecisionGrid
        options={step.options.map((o) => ({ id: o.id, label: tr(o.label) }))}
        onSelect={onChoose}
        title={tr("Toque para decidir")}
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
  const tr = useTr();
  return (
    <View style={styles.stepStack}>
      <View style={styles.actionCard}>
        <Text style={styles.actionEyebrow}>{tr("Conduta — fazer agora")}</Text>
        <Text style={styles.actionTitle}>{tr(step.title)}</Text>
        {step.summary ? <Text style={styles.actionSummary}>{tr(step.summary)}</Text> : null}
        <View style={styles.actionList}>
          {step.actions.map((item, index) => (
            <View key={index} style={styles.actionItemRow}>
              <View style={styles.actionCheck}>
                <Text style={styles.actionCheckText}>{index + 1}</Text>
              </View>
              <Text style={styles.actionItemText}>{tr(item)}</Text>
            </View>
          ))}
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.advanceButton, pressed && styles.advanceButtonPressed]}
        onPress={onAdvance}>
        <Text style={styles.advanceButtonText}>{tr("Feito — continuar ›")}</Text>
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
  const tr = useTr();
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>({});
  const [customText, setCustomText] = useState<Record<string, string>>({});

  return (
    <View style={styles.stepStack}>
      <View style={styles.inputCard}>
        <Text style={styles.inputEyebrow}>{tr("Informar — toque no valor")}</Text>
        <Text style={styles.inputTitle}>{tr(step.title)}</Text>
        {step.intro ? <Text style={styles.inputIntro}>{tr(step.intro)}</Text> : null}

        {step.fields.map((field) => {
          const current = step.values[field.id];
          const isPreset = field.presets.some((p) => p.value === current);
          const showingCustom = customOpen[field.id] || (current !== undefined && !isPreset);
          return (
            <View key={field.id} style={styles.inputField}>
              <View style={styles.inputFieldHeader}>
                <Text style={styles.inputFieldLabel}>
                  {tr(field.label)}
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
                      {tr("Outro…")}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {field.allowCustom && showingCustom ? (
                <View style={styles.customRow}>
                  <TextInput
                    value={customText[field.id] ?? (isPreset ? "" : current ?? "")}
                    onChangeText={(t) => setCustomText((s) => ({ ...s, [field.id]: t }))}
                    placeholder={field.customLabel ? tr(field.customLabel) : tr("Digitar valor")}
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
          {step.canContinue ? tr("Confirmar — continuar ›") : tr("Preencha os campos")}
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
  const tr = useTr();
  const meta = DISPOSITION_META[step.disposition] ?? DISPOSITION_META.observation;
  return (
    <View style={styles.stepStack}>
      <View style={[styles.transitionCard, { backgroundColor: meta.bg, borderColor: meta.border }]}>
        <View style={[styles.dispositionBadge, { borderColor: meta.border }]}>
          <Text style={[styles.dispositionBadgeText, { color: meta.color }]}>{tr(meta.label)}</Text>
        </View>
        <Text style={styles.transitionTitle}>{tr(step.title)}</Text>
        {step.summary ? <Text style={styles.transitionSummary}>{tr(step.summary)}</Text> : null}
        {step.exitCriteria.length > 0 ? (
          <View style={styles.evidenceList}>
            {step.exitCriteria.map((item, index) => (
              <View key={index} style={styles.evidenceRow}>
                <View style={[styles.evidenceDot, { backgroundColor: meta.color }]} />
                <Text style={styles.evidenceText}>{tr(item)}</Text>
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
            <Text style={styles.targetLabel}>{tr(target.label)}</Text>
            <Text style={styles.targetReason}>{tr(target.reason)}</Text>
          </View>
          <Text style={styles.targetChevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#121417" },
  content: { padding: 16, gap: 14 },
  introCard: {
    backgroundColor: "#1c1f24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2e35",
    padding: 16,
  },
  introText: { fontSize: 14, lineHeight: 20, color: "#94a3b8" },
  trailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trailBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(14,116,144,0.18)",
    borderWidth: 1,
    borderColor: "#4d9aff",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  trailBadgeText: { fontSize: 12, fontWeight: "800", color: "#4d9aff" },
  trailText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#94a3b8" },
  stepStack: { gap: 14 },

  questionCard: {
    backgroundColor: "#1c1f24",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2a2e35",
    padding: 18,
    gap: 8,
  },
  questionEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  questionTitle: { fontSize: 22, fontWeight: "800", color: "#f1f5f9", lineHeight: 28, letterSpacing: -0.3 },
  questionText: { fontSize: 15, lineHeight: 21, color: "#cbd5e1", fontWeight: "500" },
  questionSummary: { fontSize: 13, lineHeight: 19, color: "#94a3b8" },
  evidenceList: { gap: 8, marginTop: 4 },
  evidenceRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  evidenceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4d9aff", marginTop: 7, flexShrink: 0 },
  evidenceText: { flex: 1, fontSize: 13, lineHeight: 19, color: "#94a3b8" },

  actionCard: {
    backgroundColor: "#1c1f24",
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
  advanceButtonDisabled: { backgroundColor: "#1c1f24", borderColor: "#2a2e35", shadowOpacity: 0, elevation: 0 },
  advanceButtonTextDisabled: { color: "#94a3b8" },

  // ── Input (valor por toque) ───────────────────────────────────────────────
  inputCard: {
    backgroundColor: "#1c1f24",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2a2e35",
    padding: 18,
    gap: 14,
  },
  inputEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  inputTitle: { fontSize: 21, fontWeight: "800", color: "#f1f5f9", lineHeight: 27, letterSpacing: -0.3 },
  inputIntro: { fontSize: 13.5, lineHeight: 19, color: "#94a3b8", marginTop: -6 },
  inputField: { gap: 8, borderTopWidth: 1, borderTopColor: "#2a2e35", paddingTop: 12 },
  inputFieldHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  inputFieldLabel: { fontSize: 14, fontWeight: "700", color: "#cbd5e1" },
  inputUnit: { fontSize: 12, fontWeight: "500", color: "#94a3b8" },
  inputFieldValue: { fontSize: 14, fontWeight: "800", color: "#4d9aff" },
  presetWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  presetChip: {
    minWidth: 52,
    borderRadius: 12,
    backgroundColor: "#1c1f24",
    borderWidth: 1.5,
    borderColor: "#2a2e35",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  presetChipActive: { backgroundColor: "#1e6fd9", borderColor: "#4d9aff" },
  presetChipPressed: { opacity: 0.8 },
  presetChipOther: { borderStyle: "dashed", borderColor: "#2a2e35" },
  presetChipText: { fontSize: 14, fontWeight: "700", color: "#cbd5e1" },
  presetChipTextActive: { color: "#ffffff" },
  customRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  customInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#121417",
    borderWidth: 1,
    borderColor: "#2a2e35",
    paddingHorizontal: 14,
    color: "#f1f5f9",
    fontSize: 15,
  },
  customAdd: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#1e6fd9",
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
    backgroundColor: "#1c1f24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2e35",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  targetCardPressed: { backgroundColor: "#1c1f24", borderColor: "#4d9aff" },
  targetLabel: { fontSize: 15, fontWeight: "700", color: "#e2e8f0" },
  targetReason: { fontSize: 12, fontWeight: "500", color: "#94a3b8", marginTop: 2, lineHeight: 16 },
  targetChevron: { fontSize: 22, fontWeight: "700", color: "#4d9aff" },

  controlsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  controlButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#1c1f24",
    borderWidth: 1,
    borderColor: "#2a2e35",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonDisabled: { opacity: 0.4 },
  controlButtonText: { fontSize: 14, fontWeight: "700", color: "#cbd5e1" },
  controlButtonTextDisabled: { color: "#94a3b8" },
  sourceText: { fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 8, fontWeight: "500" },
});
