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

const DIAGNOSTIC_SUPPORT_CARDS = [
  {
    id: "criteria",
    title: "Quando pensar em anafilaxia",
    items: [
      "Instalação aguda, em minutos a poucas horas, após exposição conhecida ou provável a alérgeno.",
      "Pele ou mucosa acometida junto com respiração, circulação ou sintomas gastrointestinais intensos.",
      "Hipotensão, broncoespasmo ou edema laríngeo após alérgeno conhecido podem bastar, mesmo sem lesões cutâneas.",
    ],
  },
  {
    id: "systems",
    title: "Sinais e sintomas que ajudam no reconhecimento",
    items: [
      "Pele/mucosa: urticária difusa, prurido, flushing, angioedema de lábios, língua ou úvula.",
      "Respiratório: dispneia, sibilância, broncoespasmo, estridor, rouquidão, hipoxemia.",
      "Circulatório: hipotensão, síncope, colapso, pele fria, má perfusão.",
      "Gastrointestinal: dor abdominal intensa, vômitos repetidos, diarreia, especialmente após exposição não alimentar também.",
    ],
  },
  {
    id: "shock",
    title: "Sinais de gravidade e choque anafilático",
    items: [
      "Hipotensão persistente ou queda importante da pressão, alteração do nível de consciência, síncope ou colapso.",
      "Estridor, edema progressivo de via aérea, exaustão respiratória, cianose ou falha de oxigenação.",
      "Se houver comprometimento de via aérea, respiração ou circulação, tratar como anafilaxia sem esperar todos os critérios clássicos.",
      "Ausência de rash não exclui anafilaxia: manifestações cutâneas podem faltar em parte dos casos.",
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

function renderDiagnosticSupport(nodeId: string) {
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

      <View style={styles.supportGrid}>
        {DIAGNOSTIC_SUPPORT_CARDS.map((card) => (
          <View key={card.id} style={styles.supportCard}>
            <Text style={styles.supportCardTitle}>{card.title}</Text>
            <View style={styles.supportList}>
              {card.items.map((item) => (
                <View key={item} style={styles.supportRow}>
                  <View style={styles.supportDot} />
                  <Text style={styles.supportText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
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
  const [revision, setRevision] = useState(0);
  const step = engine.toFrontendStep();
  const currentNode = engine.getCurrentNode();
  const phaseId = phaseForNode(currentNode.id);
  const phaseIndex = PHASES.findIndex((phase) => phase.id === phaseId);
  const log = engine.getLog();

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
        contentEyebrow={`Nó ${log.filter((entry) => entry.event === "enter").length}`}
        contentTitle={currentNode.title}
        contentHint={currentNode.summary}
        contentBadgeText={step.kind === "transition" ? "Saída terminal" : "Fluxo clínico"}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step.kind === "decision" ? (
            <View style={styles.block}>
              <View style={styles.textCard}>
                <Text style={styles.blockKicker}>Pergunta clínica</Text>
                <Text style={styles.blockTitle}>{step.question}</Text>
                {renderDiagnosticSupport(step.id)}
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
  supportGrid: {
    gap: 12,
  },
  supportCard: {
    backgroundColor: "#f8fbff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d8e6fb",
    padding: 16,
    gap: 10,
  },
  supportCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#13263c",
  },
  supportList: {
    gap: 8,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  supportDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#7db7ff",
    marginTop: 7,
  },
  supportText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#35506b",
    fontWeight: "700",
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
