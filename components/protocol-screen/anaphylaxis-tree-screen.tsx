import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { type Href, useRouter } from "expo-router";

import { AppDesign } from "../../constants/app-design";
import { getClinicalModuleById } from "../../clinical-modules";
import { openClinicalModule } from "../../lib/open-clinical-module";
import {
  anaphylaxisDecisionTree,
  createAnaphylaxisDecisionEngine,
} from "../../anaphylaxis-decision-tree";
import { ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
import DecisionGrid from "./template/DecisionGrid";

type Props = {
  onRouteBack?: () => void;
};

type PhaseId =
  | "entry"
  | "first_line"
  | "severity"
  | "reassessment"
  | "escalation"
  | "disposition";

const PHASES: Array<{ id: PhaseId; label: string; hint: string; accent: string }> = [
  { id: "entry", label: "Entrada", hint: "Critérios diagnósticos", accent: "#0f766e" },
  { id: "first_line", label: "Primeira linha", hint: "Adrenalina IM obrigatória", accent: "#1d4ed8" },
  { id: "severity", label: "Gravidade", hint: "Moderada vs grave", accent: "#7c3aed" },
  { id: "reassessment", label: "Reavaliação", hint: "Loops de resposta", accent: "#b45309" },
  { id: "escalation", label: "Escalonamento", hint: "IV, fluidos, via aérea", accent: "#dc2626" },
  { id: "disposition", label: "Saída", hint: "Alta, observação, UTI, transição", accent: "#15803d" },
];

const MODULE_ROUTE_BY_TARGET: Record<string, string> = {
  isr_rapida: "isr-rapida",
  ventilacao_mecanica: "ventilacao-mecanica",
  drogas_vasoativas: "drogas-vasoativas",
};

const LOG_EVENT_LABEL: Record<string, string> = {
  enter: "entrada",
  answer: "resposta",
  advance: "avanço",
  reset: "reinício",
};

const NODE_TYPE_LABEL: Record<string, string> = {
  decision: "decisão",
  action: "ação",
  transition: "transição",
};

type FindingState = "yes" | "no" | undefined;

const DIAGNOSTIC_INTERACTIVE_GROUPS = [
  {
    id: "systems",
    title: "Achados por sistema",
    items: [
      { id: "skin", label: "Pele / mucosa", hint: "urticária, prurido, flushing, angioedema" },
      { id: "resp", label: "Respiratório", hint: "dispneia, sibilância, estridor, hipoxemia" },
      { id: "circ", label: "Circulatório", hint: "hipotensão, síncope, colapso, má perfusão" },
      { id: "gi", label: "Gastrointestinal", hint: "dor abdominal intensa, vômitos repetidos, diarreia" },
    ],
  },
  {
    id: "severity",
    title: "Sinais de gravidade",
    items: [
      { id: "hypotension", label: "Hipotensão / choque", hint: "queda de PA, colapso, pele fria, má perfusão" },
      { id: "stridor", label: "Estridor / edema laríngeo", hint: "voz abafada, rouquidão, via aérea superior" },
      { id: "hypoxemia", label: "Hipoxemia / cianose", hint: "dessaturação, esforço respiratório importante" },
      { id: "neuro", label: "Rebaixamento / síncope", hint: "alteração do nível de consciência, desmaio" },
    ],
  },
] as const;

function phaseForNode(nodeId: string): PhaseId {
  switch (nodeId) {
    case "diagnostic_entry":
    case "not_anaphylaxis_exit":
      return "entry";
    case "immediate_im_epinephrine":
      return "first_line";
    case "severity_stratification":
    case "moderate_support_bundle":
    case "severe_resuscitation_bundle":
      return "severity";
    case "reassessment_after_first_im":
    case "repeat_im_epinephrine":
    case "reassessment_after_second_im":
    case "observation_phase":
      return "reassessment";
    case "critical_escalation_bundle":
    case "post_escalation_decision":
    case "transition_to_airway_module":
    case "transition_to_ventilation_module":
    case "transition_to_vasoactive_module":
      return "escalation";
    default:
      return "disposition";
  }
}

function renderDiagnosticSupport(
  nodeId: string,
  findingStates: Record<string, FindingState>,
  onSelectFinding: (findingId: string, value: Exclude<FindingState, undefined>) => void,
  suggestion: {
    title: string;
    text: string;
    tone: "neutral" | "caution" | "strong" | "danger";
    criteriaStatus: string;
    classification: string;
    nextStep: string;
    recommendedChoice: string;
  },
) {
  if (nodeId !== "diagnostic_entry") {
    return null;
  }

  return (
    <View style={styles.supportStack}>
      <View style={styles.supportIntroCard}>
        <Text style={styles.supportIntroTitle}>Como decidir neste ponto</Text>
        <Text style={styles.supportIntroText}>
          O objetivo aqui é reconhecer anafilaxia cedo. Se houver forte suspeita clínica com comprometimento de via aérea,
          respiração ou circulação, a conduta não deve esperar manifestação completa.
        </Text>
      </View>

      <View style={styles.interactiveSection}>
        {DIAGNOSTIC_INTERACTIVE_GROUPS.map((group) => (
          <View key={group.id} style={styles.interactiveGroup}>
            <Text style={styles.interactiveGroupTitle}>{group.title}</Text>
            <View style={styles.findingGrid}>
              {group.items.map((item) => {
                const state = findingStates[item.id];
                return (
                  <View key={item.id} style={styles.findingCard}>
                    <View style={styles.findingHeader}>
                      <Text style={styles.findingLabel}>{item.label}</Text>
                      <Text style={styles.findingHint}>{item.hint}</Text>
                    </View>
                    <View style={styles.findingActions}>
                      <Pressable
                        hitSlop={6}
                        style={({ pressed }) => [
                          styles.findingButton,
                          pressed && styles.findingButtonPressed,
                          state === "yes" && styles.findingButtonYesActive,
                        ]}
                        onPress={() => onSelectFinding(item.id, "yes")}>
                        <Text style={[styles.findingButtonText, state === "yes" && styles.findingButtonTextYesActive]}>
                          {state === "yes" ? "Sim selecionado" : "Sim"}
                        </Text>
                      </Pressable>
                      <Pressable
                        hitSlop={6}
                        style={({ pressed }) => [
                          styles.findingButton,
                          pressed && styles.findingButtonPressed,
                          state === "no" && styles.findingButtonNoActive,
                        ]}
                        onPress={() => onSelectFinding(item.id, "no")}>
                        <Text style={[styles.findingButtonText, state === "no" && styles.findingButtonTextNoActive]}>
                          {state === "no" ? "Não selecionado" : "Não"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.suggestionCard,
          suggestion.tone === "danger" && styles.suggestionCardDanger,
          suggestion.tone === "strong" && styles.suggestionCardStrong,
          suggestion.tone === "caution" && styles.suggestionCardCaution,
        ]}>
        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
        <Text style={styles.suggestionText}>{suggestion.text}</Text>
        <View style={styles.suggestionSummaryGrid}>
          <View style={styles.suggestionSummaryItem}>
            <Text style={styles.suggestionSummaryLabel}>Critérios</Text>
            <Text style={styles.suggestionSummaryValue}>{suggestion.criteriaStatus}</Text>
          </View>
          <View style={styles.suggestionSummaryItem}>
            <Text style={styles.suggestionSummaryLabel}>Classificação</Text>
            <Text style={styles.suggestionSummaryValue}>{suggestion.classification}</Text>
          </View>
        </View>
        <View style={styles.suggestionNextCard}>
          <Text style={styles.suggestionNextLabel}>Próximo passo sugerido</Text>
          <Text style={styles.suggestionNextText}>{suggestion.nextStep}</Text>
          <Text style={styles.suggestionChoiceText}>Escolha sugerida abaixo: {suggestion.recommendedChoice}</Text>
        </View>
      </View>

      <View style={styles.supportSourceCard}>
        <Text style={styles.supportSourceTitle}>Base clínica deste card</Text>
        <Text style={styles.supportSourceText}>
          Conteúdo alinhado aos critérios diagnósticos e sinais de gravidade descritos pela World Allergy Organization
          (WAO 2020) e pelo Resuscitation Council UK (guideline 2021).
        </Text>
      </View>
    </View>
  );
}

export default function AnaphylaxisTreeScreen({ onRouteBack }: Props) {
  const router = useRouter();
  const [engine] = useState(() => createAnaphylaxisDecisionEngine());
  const [findingStates, setFindingStates] = useState<Record<string, FindingState>>({});
  const [revision, setRevision] = useState(0);
  const step = engine.toFrontendStep();
  const currentNode = engine.getCurrentNode();
  const phaseId = phaseForNode(currentNode.id);
  const phaseIndex = PHASES.findIndex((phase) => phase.id === phaseId);
  const log = engine.getLog();

  const diagnosticSuggestion = useMemo(() => {
    const isYes = (id: string) => findingStates[id] === "yes";
    const positiveSystems = ["skin", "resp", "circ", "gi"].filter(isYes);
    const severeFlags = ["hypotension", "stridor", "hypoxemia", "neuro"].filter(isYes);
    const selectedCount = Object.values(findingStates).filter(Boolean).length;
    const hasAirwayBreathingCirculation = isYes("resp") || isYes("circ") || severeFlags.length > 0;
    const hasMultiSystemPattern = positiveSystems.length >= 2;

    if (severeFlags.length > 0 || isYes("circ") || isYes("resp")) {
      return {
        tone: "danger" as const,
        title: "O quadro sugere anafilaxia grave",
        text: "Comprometimento respiratório, circulatório ou sinais de choque tornam a suspeita forte e favorecem não atrasar adrenalina IM e preparação para escalonamento.",
        criteriaStatus: "Critérios preenchidos / alta suspeita clínica",
        classification: "Anafilaxia grave ou choque anafilático",
        nextStep: "Prosseguir como anafilaxia. Selecione a opção positiva e avance para adrenalina IM imediata, monitorização e estratificação de gravidade.",
        recommendedChoice: "Sim — critérios preenchidos / alta suspeita",
      };
    }

    if ((isYes("skin") && hasMultiSystemPattern) || (isYes("gi") && (isYes("skin") || isYes("resp")))) {
      return {
        tone: "strong" as const,
        title: "Anafilaxia provável",
        text: "Mais de um sistema acometido em contexto compatível reforça critério clínico para tratar como anafilaxia.",
        criteriaStatus: "Critérios clínicos provavelmente preenchidos",
        classification: "Anafilaxia sem sinais imediatos de choque",
        nextStep: "Tratar como anafilaxia e avançar para adrenalina IM de primeira linha sem esperar piora clínica.",
        recommendedChoice: "Sim — critérios preenchidos / alta suspeita",
      };
    }

    if ((isYes("skin") || isYes("gi")) && positiveSystems.length === 1) {
      return {
        tone: "caution" as const,
        title: "Achados ainda inespecíficos",
        text: "Um único sistema isolado pode representar reação alérgica sem anafilaxia neste momento, mas exige reavaliação se surgirem sinais respiratórios, circulatórios ou progressão rápida.",
        criteriaStatus: "Critérios ainda incompletos",
        classification: "Reação alérgica possível, sem confirmação de anafilaxia",
        nextStep: "Se o quadro permanecer limitado a um único sistema e sem comprometimento respiratório/circulatório, considere a opção negativa. Reavalie imediatamente se houver progressão.",
        recommendedChoice: "Não — reação localizada apenas, por enquanto",
      };
    }

    if (selectedCount > 0 && !hasAirwayBreathingCirculation && !hasMultiSystemPattern) {
      return {
        tone: "caution" as const,
        title: "Suspeita ainda baixa para anafilaxia",
        text: "Os achados selecionados não configuram até aqui padrão clássico de anafilaxia sistêmica.",
        criteriaStatus: "Critérios não preenchidos até o momento",
        classification: "Quadro ainda não classificável como anafilaxia",
        nextStep: "Se não houver evolução clínica, a escolha mais coerente abaixo tende a ser a negativa. Mude imediatamente se surgirem respiração, circulação ou progressão rápida.",
        recommendedChoice: "Não — reação localizada apenas",
      };
    }

    return {
      tone: "neutral" as const,
      title: "Selecione os principais achados do paciente",
      text: "A síntese automática ajuda a organizar a suspeita clínica, mas a decisão final continua baseada na apresentação global e no contexto da exposição.",
      criteriaStatus: "Aguardando seleção de achados",
      classification: "Ainda sem classificação",
      nextStep: "Marque os sistemas acometidos e os sinais de gravidade. O sistema então sugere se o quadro favorece ou não anafilaxia e qual opção escolher abaixo.",
      recommendedChoice: "Definir após os achados",
    };
  }, [findingStates]);

  const heroMetrics = useMemo(() => {
    const visitedNodes = new Set(log.filter((entry) => entry.event === "enter").map((entry) => entry.nodeId));
    const terminalCount = Object.values(anaphylaxisDecisionTree.nodes).filter((node) => node.type === "transition").length;

    return [
      {
        label: "Nó atual",
        value: currentNode.title,
        accent: "#1a4f9c",
      },
      {
        label: "Fase atual",
        value: PHASES[phaseIndex]?.label ?? "Fluxo",
        accent: PHASES[phaseIndex]?.accent ?? "#1d4ed8",
      },
      {
        label: "Nós visitados",
        value: `${visitedNodes.size}/${Object.keys(anaphylaxisDecisionTree.nodes).length}`,
        accent: "#7c3aed",
      },
      {
        label: "Saídas terminais",
        value: String(terminalCount),
        accent: "#15803d",
      },
    ];
  }, [currentNode.title, log, phaseIndex]);

  async function handleTransition(targetModuleId: string) {
    const moduleId = MODULE_ROUTE_BY_TARGET[targetModuleId];
    if (!moduleId) {
      return;
    }

    const module = getClinicalModuleById(moduleId);
    if (!module) {
      return;
    }

    await openClinicalModule(router, moduleId, module.route as Href);
  }

  function rerender() {
    setRevision((value) => value + 1);
  }

  function setFindingState(findingId: string, value: Exclude<FindingState, undefined>) {
    setFindingStates((current) => ({
      ...current,
      [findingId]: current[findingId] === value ? undefined : value,
    }));
  }

  return (
    <View style={styles.screen}>
      <ModuleFlowLayout
        key={revision}
        visualStyle="isr"
        hero={
          <ModuleFlowHero
            visualStyle="isr"
            eyebrow="Anafilaxia"
            title="Anafilaxia organizada como árvore decisória"
            subtitle="Diagnóstico, adrenalina IM obrigatória, estratificação, loops de reavaliação, escalonamento e saída terminal em um fluxo desacoplado."
            badgeText="Árvore decisória v2"
            metrics={heroMetrics}
            progressLabel={`Fase ${phaseIndex + 1} de ${PHASES.length}`}
            stepTitle={currentNode.title}
            hint={currentNode.summary}
            compactMobile
            compressed
            showStepCard={false}
          />
        }
        items={PHASES.map((phase, index) => ({
          id: phase.id,
          label: phase.label,
          hint: phase.hint,
          step: String(index + 1),
          accent: phase.accent,
        }))}
        activeId={phaseId}
        onSelect={() => {}}
        sidebarEyebrow="Árvore de decisão"
        sidebarTitle="Fases do módulo"
        contentEyebrow={`Etapa ${phaseIndex + 1} de ${PHASES.length}`}
        contentTitle={currentNode.title}
        contentHint={currentNode.summary}
        contentBadgeText={step.kind === "transition" ? "Saída terminal" : "Fluxo clínico"}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step.kind === "decision" ? (
            <View style={styles.block}>
              <View style={styles.textCard}>
                <Text style={styles.blockKicker}>Pergunta clínica</Text>
                <Text style={styles.blockTitle}>{step.question}</Text>
                {renderDiagnosticSupport(step.id, findingStates, setFindingState, diagnosticSuggestion)}
                {step.evidence.length ? (
                  <View style={styles.evidenceList}>
                    {step.evidence.map((line) => (
                      <View key={line} style={styles.evidenceRow}>
                        <View style={styles.evidenceDot} />
                        <Text style={styles.evidenceText}>{line}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              <DecisionGrid
                title="Escolha a próxima ramificação"
                options={step.options.map((option) => ({
                  id: option.id,
                  label: option.label,
                  sublabel: anaphylaxisDecisionTree.nodes[
                    (currentNode.type === "decision"
                      ? currentNode.options.find((item) => item.id === option.id)?.next
                      : currentNode.id) ?? currentNode.id
                  ]?.title,
                }))}
                onSelect={(optionId) => {
                  engine.choose(optionId);
                  rerender();
                }}
              />
            </View>
          ) : null}

          {step.kind === "action" ? (
            <View style={styles.block}>
              <View style={styles.actionCard}>
                <Text style={styles.blockKicker}>Ação obrigatória</Text>
                <Text style={styles.blockTitle}>{step.title}</Text>
                <View style={styles.actionList}>
                  {step.actions.map((action) => (
                    <View key={action} style={styles.actionRow}>
                      <View style={styles.actionIndex}>
                        <Text style={styles.actionIndexText}>•</Text>
                      </View>
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Pressable style={styles.primaryButton} onPress={() => {
                engine.advance();
                rerender();
              }}>
                <Text style={styles.primaryButtonText}>Concluir bloco e continuar</Text>
              </Pressable>
            </View>
          ) : null}

          {step.kind === "transition" ? (
            <View style={styles.block}>
              <View style={styles.transitionCard}>
                <Text style={styles.blockKicker}>Saída terminal</Text>
                <Text style={styles.blockTitle}>{step.title}</Text>
                <Text style={styles.transitionDisposition}>Destino: {step.disposition}</Text>
                <View style={styles.evidenceList}>
                  {step.exitCriteria.map((line) => (
                    <View key={line} style={styles.evidenceRow}>
                      <View style={styles.evidenceDot} />
                      <Text style={styles.evidenceText}>{line}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.targetGrid}>
                {step.targets.map((target) => {
                  const hasRoute = Boolean(MODULE_ROUTE_BY_TARGET[target.moduleId]);
                  return (
                    <View key={target.moduleId} style={styles.targetCard}>
                      <Text style={styles.targetLabel}>{target.label}</Text>
                      <Text style={styles.targetReason}>{target.reason}</Text>
                      {hasRoute ? (
                        <Pressable style={styles.secondaryButton} onPress={() => void handleTransition(target.moduleId)}>
                          <Text style={styles.secondaryButtonText}>Abrir módulo</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <View style={styles.footerActions}>
                <Pressable style={styles.secondaryButton} onPress={() => {
                  engine.reset();
                  rerender();
                }}>
                  <Text style={styles.secondaryButtonText}>Reiniciar árvore</Text>
                </Pressable>
                {onRouteBack ? (
                  <Pressable style={styles.ghostButton} onPress={onRouteBack}>
                    <Text style={styles.ghostButtonText}>Voltar aos módulos</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          <View style={styles.logCard}>
            <Text style={styles.logTitle}>Log do caminho decisório</Text>
            {log.map((entry, index) => (
              <Text key={`${entry.timestamp}-${index}`} style={styles.logLine}>
                {index + 1}. {LOG_EVENT_LABEL[entry.event] ?? entry.event} · {NODE_TYPE_LABEL[entry.nodeType] ?? entry.nodeType} · {anaphylaxisDecisionTree.nodes[entry.nodeId]?.title ?? entry.nodeId}
                {entry.optionLabel ? ` · ${entry.optionLabel}` : ""}
              </Text>
            ))}
          </View>
        </ScrollView>
      </ModuleFlowLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#dff7f3",
  },
  content: {
    gap: 16,
    paddingBottom: 28,
  },
  block: {
    gap: 14,
  },
  textCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 20,
    gap: 14,
    ...AppDesign.shadow.card,
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 20,
    gap: 16,
    ...AppDesign.shadow.card,
  },
  transitionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 20,
    gap: 12,
    ...AppDesign.shadow.card,
  },
  blockKicker: {
    fontSize: 11,
    fontWeight: "900",
    color: "#60758f",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  blockTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    color: "#13263c",
  },
  supportStack: {
    gap: 14,
  },
  supportIntroCard: {
    backgroundColor: "#eef6ff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#cfe0ff",
    padding: 16,
    gap: 8,
  },
  supportIntroTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#163457",
  },
  supportIntroText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#35506b",
    fontWeight: "700",
  },
  interactiveSection: {
    gap: 14,
  },
  interactiveGroup: {
    gap: 10,
  },
  interactiveGroupTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#163457",
  },
  findingGrid: {
    gap: 12,
  },
  findingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d8e6fb",
    padding: 14,
    gap: 12,
  },
  findingHeader: {
    gap: 4,
  },
  findingLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#13263c",
  },
  findingHint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#597088",
    fontWeight: "700",
  },
  findingActions: {
    flexDirection: "row",
    gap: 10,
  },
  findingButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d7e4f5",
    backgroundColor: "#f8fbff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  findingButtonPressed: {
    opacity: 0.82,
  },
  findingButtonYesActive: {
    backgroundColor: "#e8f7ef",
    borderColor: "#44a26d",
    borderWidth: 2,
  },
  findingButtonNoActive: {
    backgroundColor: "#fff3f3",
    borderColor: "#d86b6b",
    borderWidth: 2,
  },
  findingButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#4b6070",
  },
  findingButtonTextYesActive: {
    color: "#116149",
  },
  findingButtonTextNoActive: {
    color: "#9f2d2d",
  },
  suggestionCard: {
    backgroundColor: "#f8fbff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d8e6fb",
    padding: 16,
    gap: 8,
  },
  suggestionCardDanger: {
    backgroundColor: "#fff1f1",
    borderColor: "#f2b6b6",
  },
  suggestionCardStrong: {
    backgroundColor: "#eef8ff",
    borderColor: "#bfd8ff",
  },
  suggestionCardCaution: {
    backgroundColor: "#fff8ea",
    borderColor: "#f1d39b",
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#13263c",
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#42566f",
    fontWeight: "700",
  },
  suggestionSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionSummaryItem: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    padding: 12,
    gap: 4,
  },
  suggestionSummaryLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  suggestionSummaryValue: {
    fontSize: 14,
    lineHeight: 20,
    color: "#24384c",
    fontWeight: "800",
  },
  suggestionNextCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    padding: 12,
    gap: 6,
  },
  suggestionNextLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  suggestionNextText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#24384c",
    fontWeight: "700",
  },
  suggestionChoiceText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#1a4f9c",
    fontWeight: "900",
  },
  supportSourceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    padding: 14,
    gap: 6,
  },
  supportSourceTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  supportSourceText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#54687c",
    fontWeight: "700",
  },
  evidenceList: {
    gap: 10,
  },
  evidenceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  evidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#7db7ff",
    marginTop: 7,
  },
  evidenceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#42566f",
    fontWeight: "700",
  },
  actionList: {
    gap: 10,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  actionIndex: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#dceaff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  actionIndexText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1a4f9c",
    lineHeight: 18,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#22363b",
    fontWeight: "700",
  },
  transitionDisposition: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1a4f9c",
  },
  targetGrid: {
    gap: 12,
  },
  targetCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 16,
    gap: 8,
    ...AppDesign.shadow.card,
  },
  targetLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: "#13263c",
  },
  targetReason: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4b6070",
    fontWeight: "700",
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#102128",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ffffff",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eaf2ff",
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1a4f9c",
  },
  ghostButton: {
    minHeight: 48,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#c7d5cf",
    backgroundColor: "#ffffff",
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#334155",
  },
  footerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  logCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 18,
    gap: 8,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#13263c",
  },
  logLine: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
    fontWeight: "700",
  },
});
