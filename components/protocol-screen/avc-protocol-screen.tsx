import { Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import type { AuxiliaryPanel, ClinicalLogEntry, EncounterSummary, ProtocolState } from "../../clinical-engine";
import ClinicalLogCard from "./clinical-log-card";
import SepsisFormTabs from "./sepsis-form-tabs";
import { styles } from "./protocol-screen-styles";
import DecisionGrid from "./template/DecisionGrid";
import { formatOptionLabel, getOptionSublabel } from "./protocol-screen-utils";
import { ModuleFinishPanel, ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
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
  onExitModule: () => void;
  onConfirmAction: () => void;
  onRunTransition: (input?: string) => void;
  onExportSummary: () => void;
  onPrintReport: () => void;
};

const TABS = [
  { id: 0, icon: "🧑", label: "Dados", step: "1", phaseTitle: "Tempo, dados mínimos e risco basal", accent: "#0f766e" },
  { id: 1, icon: "🧠", label: "Avaliação", step: "2", phaseTitle: "Déficit focal, gravidade e NIHSS", accent: "#0369a1" },
  { id: 2, icon: "🚨", label: "Estabilização", step: "3", phaseTitle: "ABC, glicemia, pressão e monitorização", accent: "#7c3aed" },
  { id: 3, icon: "🧪", label: "Exames", step: "4", phaseTitle: "TC sem contraste primeiro; CTA e labs como apoio", accent: "#b45309" },
  { id: 4, icon: "💉", label: "Reperfusão", step: "5", phaseTitle: "Elegibilidade real do caso e trombolítico", accent: "#be123c" },
  { id: 5, icon: "🏥", label: "Seguimento", step: "6", phaseTitle: "Destino, monitorização e checklist", accent: "#1d4ed8" },
];

function fieldValue(panel: AuxiliaryPanel | null, id: string) {
  return panel?.fields.find((field) => field.id === id)?.value ?? "";
}

function metricValue(summary: EncounterSummary, label: string) {
  return summary.panelMetrics?.find((metric) => metric.label === label)?.value ?? "";
}

function DecisionCard({
  title,
  lines,
  tone,
}: {
  title: string;
  lines: string[];
  tone?: "info" | "warning" | "danger";
}) {
  return (
    <View
      style={[
        avcStyles.decisionCard,
        tone === "warning" && avcStyles.decisionWarn,
        tone === "danger" && avcStyles.decisionDanger,
      ]}>
      <Text style={avcStyles.decisionTitle}>{title}</Text>
      {lines.map((line) => (
        <Text key={line} style={avcStyles.decisionLine}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

function ImagingPriorityCard() {
  return (
    <View style={avcStyles.imagingPriorityCard}>
      <Text style={avcStyles.imagingPriorityEyebrow}>Prioridade imediata</Text>
      <Text style={avcStyles.imagingPriorityTitle}>TC de crânio sem contraste urgente</Text>
      <Text style={avcStyles.imagingPriorityText}>
        Primeiro exclua hemorragia. A avaliação de trombólise IV não deve esperar AngioTC quando a TC sem contraste já responde essa pergunta.
      </Text>
    </View>
  );
}

function TimelineCard({ panel }: { panel: AuxiliaryPanel | null }) {
  const rows = [
    ["Última vez normal", fieldValue(panel, "lastKnownWellTime")],
    ["Chegada", fieldValue(panel, "arrivalTime")],
    ["TC solicitada", fieldValue(panel, "ctRequestedAt")],
    ["TC realizada", fieldValue(panel, "ctPerformedAt")],
    ["TC interpretada", fieldValue(panel, "ctReadAt")],
    ["Decisão médica", fieldValue(panel, "finalMedicalDecision")],
  ].filter(([, value]) => value);

  if (!rows.length) return null;

  return (
    <View style={avcStyles.timelineCard}>
      <Text style={avcStyles.timelineTitle}>Timeline crítica do caso</Text>
      {rows.map(([label, value]) => (
        <View key={label} style={avcStyles.timelineRow}>
          <Text style={avcStyles.timelineLabel}>{label}</Text>
          <Text style={avcStyles.timelineValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function DataPhaseBoard({ panel }: { panel: AuxiliaryPanel | null }) {
  const lkw = fieldValue(panel, "lastKnownWellTime");
  const arrival = fieldValue(panel, "arrivalTime");
  const glucose = fieldValue(panel, "glucoseInitial");
  const systolic = fieldValue(panel, "systolicPressure");
  const diastolic = fieldValue(panel, "diastolicPressure");
  const weight = fieldValue(panel, "weightKg");
  const missing = [
    !lkw && "Última vez normal",
    !arrival && "Hora de chegada",
    !glucose && "Glicemia inicial",
    !(systolic && diastolic) && "PA",
    !weight && "Peso",
  ].filter(Boolean) as string[];

  return (
    <View style={avcStyles.phaseBoard}>
      <DecisionCard
        title="Dados que sustentam a decisão"
        lines={[
          "Tempo, glicemia, pressão e peso mudam diretamente a elegibilidade para reperfusão.",
          "A coleta deve ser rápida e não pode competir com a imagem inicial.",
        ]}
        tone="info"
      />
      {missing.length > 0 ? (
        <DecisionCard
          title="Ainda faltam dados mínimos"
          lines={missing.map((item) => `${item} pendente`)}
          tone="warning"
        />
      ) : (
        <DecisionCard
          title="Base mínima preenchida"
          lines={[
            "Tempo, glicemia, pressão e peso já permitem seguir com avaliação e imagem.",
            "Se o horário for incerto, manter bloqueio automático para trombólise até revisão.",
          ]}
          tone="info"
        />
      )}
    </View>
  );
}

function EvaluationPhaseBoard({ panel, encounterSummary }: { panel: AuxiliaryPanel | null; encounterSummary: EncounterSummary }) {
  const symptoms = fieldValue(panel, "symptoms");
  const laterality = fieldValue(panel, "laterality");
  const nihss = metricValue(encounterSummary, "NIHSS");
  const disabling = fieldValue(panel, "disablingDeficit");
  const selectedDisabling =
    disabling === "yes" ? "Sim" : disabling === "no" ? "Não" : disabling === "unknown" ? "Indefinido" : disabling || "Indefinido";

  return (
    <View style={avcStyles.phaseBoard}>
      <DecisionCard
        title="Objetivo da avaliação"
        lines={[
          symptoms ? `Sintomas focais registrados: ${symptoms}` : "Registrar sintomas focais predominantes e lateralidade.",
          laterality ? `Lateralidade atual: ${laterality}` : "Definir lateralidade quando possível.",
          `NIHSS atual: ${nihss || "incompleto"}`,
          `Déficit incapacitante: ${selectedDisabling}`,
        ]}
        tone="info"
      />
      <DecisionCard
        title="Leitura clínica desta fase"
        lines={[
          "NIHSS baixo não exclui tratamento quando linguagem, visão ou função motora forem incapacitantes.",
          "Antes de seguir, deixar claro se há déficit focal persistente e se ele interfere de forma relevante na função.",
        ]}
        tone="warning"
      />
    </View>
  );
}

function StabilizationPhaseBoard({ panel }: { panel: AuxiliaryPanel | null }) {
  const abc = fieldValue(panel, "abcInstability");
  const airway = fieldValue(panel, "airwayProtection");
  const glucoseCurrent = fieldValue(panel, "glucoseCurrent");
  const control = fieldValue(panel, "pressureControlActions");

  return (
    <View style={avcStyles.phaseBoard}>
      <DecisionCard
        title="Primeiro estabilize"
        lines={[
          abc === "yes" ? "ABC ainda instável." : abc === "no" ? "ABC sem instabilidade marcada." : "ABC em revisão.",
          airway === "yes" ? "Há necessidade de proteção de via aérea." : airway === "no" ? "Sem indicação clara de proteção de via aérea." : "Via aérea ainda em revisão.",
          glucoseCurrent ? `Glicemia atual registrada: ${glucoseCurrent}` : "Registrar glicemia atual e corrigir extremos antes da decisão.",
          control ? `Controle pressórico registrado: ${control}` : "Documentar se foi necessário controlar a PA antes de reperfusão.",
        ]}
        tone={abc === "yes" || airway === "yes" ? "danger" : "warning"}
      />
    </View>
  );
}

function ExamsPhaseBoard({ panel }: { panel: AuxiliaryPanel | null }) {
  const ct = fieldValue(panel, "ctResult");
  const lvo = fieldValue(panel, "lvoSuspicion");
  const cta = fieldValue(panel, "ctaResult");

  return (
    <View style={avcStyles.phaseBoard}>
      <DecisionCard
        title="Pergunta-chave da imagem"
        lines={[
          ct ? `Resultado atual da TC: ${ct}` : "A TC ainda não definiu se há ou não hemorragia.",
          "A decisão de trombólise depende primeiro da TC sem contraste.",
          "A AngioTC entra para apoiar trombectomia quando houver suspeita de grande vaso.",
        ]}
        tone={ct ? "info" : "danger"}
      />
      {(lvo || cta) ? (
        <DecisionCard
          title="Apoio para grande vaso"
          lines={[
            lvo ? `Suspeita clínica de LVO: ${lvo}` : "Suspeita clínica de LVO não documentada.",
            cta ? `AngioTC: ${cta}` : "AngioTC ainda não documentada.",
          ]}
          tone="warning"
        />
      ) : null}
    </View>
  );
}

function extractRecommendationLines(lines: string[], prefix: string) {
  return lines
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.replace(prefix, "").trim())
    .filter(Boolean);
}

function ReperfusionCaseBoard({
  panel,
  encounterSummary,
}: {
  panel: AuxiliaryPanel | null;
  encounterSummary: EncounterSummary;
}) {
  const recommendations = panel?.recommendations ?? [];
  const ivCard = recommendations[0];
  const mtCard = recommendations[1];
  const doseCard = recommendations.find((item) => item.title.startsWith("Calculadora"));
  const blockers = ivCard ? extractRecommendationLines(ivCard.lines, "Bloqueio:") : [];
  const corrections = ivCard ? extractRecommendationLines(ivCard.lines, "Correção:") : [];
  const rationale = ivCard
    ? ivCard.lines.filter((line) => !line.startsWith("Bloqueio:") && !line.startsWith("Correção:"))
    : [];
  const thrombectomyNotes = mtCard
    ? mtCard.lines.filter((line) => !line.startsWith("Pendência:")).map((line) => line.replace(/^•\s*/, ""))
    : [];
  const thrombectomyPending = mtCard ? extractRecommendationLines(mtCard.lines, "Pendência:") : [];

  return (
    <View style={avcStyles.reperfusionBoard}>
      <View style={avcStyles.reperfusionHeader}>
        <Text style={avcStyles.reperfusionEyebrow}>Decisão do caso</Text>
        <Text style={avcStyles.reperfusionTitle}>{metricValue(encounterSummary, "Trombólise") || "Reperfusão em revisão"}</Text>
        <Text style={avcStyles.reperfusionSubtitle}>
          O foco aqui é decidir a trombólise neste paciente, com motivo explícito de bloqueio ou liberação.
        </Text>
      </View>

      {rationale.length > 0 ? <DecisionCard title="Leitura clínica atual" lines={rationale} tone="info" /> : null}
      {blockers.length > 0 ? <DecisionCard title="O que está bloqueando a trombólise agora" lines={blockers} tone="danger" /> : null}
      {corrections.length > 0 ? <DecisionCard title="O que precisa ser corrigido antes" lines={corrections} tone="warning" /> : null}
      {doseCard ? <DecisionCard title={doseCard.title} lines={doseCard.lines} tone="info" /> : null}
      {mtCard ? (
        <DecisionCard
          title={mtCard.title}
          lines={[
            ...thrombectomyNotes,
            ...thrombectomyPending.map((line) => `Pendência: ${line}`),
          ]}
          tone={mtCard.tone === "danger" ? "danger" : "warning"}
        />
      ) : null}
    </View>
  );
}

function FollowUpPhaseBoard({ encounterSummary }: { encounterSummary: EncounterSummary }) {
  return (
    <View style={avcStyles.phaseBoard}>
      <DecisionCard
        title="Fechamento assistencial"
        lines={[
          `Destino sugerido: ${metricValue(encounterSummary, "Destino") || "em definição"}`,
          `Trombólise: ${metricValue(encounterSummary, "Trombólise") || "em revisão"}`,
          `Trombectomia: ${metricValue(encounterSummary, "Trombectomia") || "em revisão"}`,
          "Registrar monitorização, checklist pós-conduta e decisão médica final separadamente.",
        ]}
        tone="info"
      />
    </View>
  );
}

function PhasePriorityCard({ activeTab }: { activeTab: number }) {
  const content = [
    {
      title: "Prioridade da fase",
      lines: [
        "Definir última vez normal, chegada, glicemia, PA e peso sem atrasar o fluxo.",
        "Se o tempo ou os dados mínimos estiverem faltando, a decisão automática deve permanecer bloqueada.",
      ],
      tone: "info" as const,
    },
    {
      title: "Objetivo da avaliação",
      lines: [
        "Confirmar déficit focal e lateralidade.",
        "Preencher NIHSS item a item e marcar se o déficit é incapacitante.",
        "NIHSS baixo não exclui reperfusão se o déficit for incapacitante.",
      ],
      tone: "info" as const,
    },
    {
      title: "O que estabilizar antes de decidir",
      lines: [
        "ABC primeiro: via aérea, oxigenação, circulação e monitorização.",
        "Corrigir hipoglicemia e reavaliar déficit antes de interpretar como AVC isquêmico.",
        "Se houver risco de via aérea ou instabilidade, estabilizar antes da reperfusão.",
      ],
      tone: "warning" as const,
    },
    {
      title: "Exame prioritário",
      lines: [
        "TC de crânio sem contraste vem antes de qualquer decisão de trombólise.",
        "AngioTC e exames laboratoriais entram como apoio, sem atrasar a TC inicial.",
      ],
      tone: "danger" as const,
    },
    {
      title: "Pergunta central da fase",
      lines: [
        "Pode trombolisar agora?",
        "Se não, o que está bloqueando e o que pode ser corrigido neste paciente?",
      ],
      tone: "warning" as const,
    },
    {
      title: "Fechamento do caso",
      lines: [
        "Definir destino monitorizado, checklist pós-conduta e plano de reavaliação.",
        "Separar a recomendação do sistema da decisão médica final documentada.",
      ],
      tone: "info" as const,
    },
  ][activeTab];

  return <DecisionCard title={content.title} lines={content.lines} tone={content.tone} />;
}

export default function AvcProtocolScreen({
  auxiliaryPanel,
  auxiliaryFieldSections,
  canGoBack,
  clinicalLog,
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
  onExitModule,
  onConfirmAction,
  onRunTransition,
  onExportSummary,
  onPrintReport,
}: Props) {
  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";
  const TOTAL_TABS = TABS.length;
  const [activeTab, setActiveTab] = useState(
    () => getProtocolUiState(encounterSummary.protocolId)?.activeTab ?? 0
  );
  const isLastTab = activeTab === TOTAL_TABS - 1;
  const nextTabLabel = TABS[activeTab + 1]?.label;

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, { activeTab });
  }, [activeTab, encounterSummary.protocolId]);

  function handleNextStep() {
    if (!isLastTab) {
      setActiveTab((tab) => tab + 1);
      return;
    }
    onConfirmAction();
  }

  const heroMetrics = useMemo(
    () =>
      [
        encounterSummary.panelMetrics?.find((metric) => metric.label === "NIHSS"),
        encounterSummary.panelMetrics?.find((metric) => metric.label === "Diagnóstico sindrômico"),
        encounterSummary.panelMetrics?.find((metric) => metric.label === "Trombólise"),
        encounterSummary.panelMetrics?.find((metric) => metric.label === "Destino"),
      ]
        .filter(Boolean)
        .map((metric, index) => ({
          label: metric!.label,
          value: metric!.value,
          accent: index === 0 ? "#7c3aed" : index === 1 ? "#0369a1" : index === 2 ? "#be123c" : "#1d4ed8",
        })),
    [encounterSummary.panelMetrics]
  );

  const finishSummaryLines = [
    { label: "Diagnóstico sindrômico", value: metricValue(encounterSummary, "Diagnóstico sindrômico") || "—" },
    { label: "NIHSS", value: metricValue(encounterSummary, "NIHSS") || "—" },
    { label: "Trombólise", value: metricValue(encounterSummary, "Trombólise") || "—" },
    { label: "Trombectomia", value: metricValue(encounterSummary, "Trombectomia") || "—" },
    { label: "Destino", value: metricValue(encounterSummary, "Destino") || "—" },
  ].filter((row) => row.value !== "—");

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
          eyebrow="Acidente vascular cerebral"
          title="AVC organizado por segurança clínica e tempos críticos"
          subtitle="Fluxo de avaliação e conduta com bloqueios explícitos de segurança."
          badgeText={metricValue(encounterSummary, "Diagnóstico sindrômico") || "Fluxo AVC"}
          metrics={heroMetrics}
          progressLabel={`Etapa ${activeTab + 1} de ${TABS.length}`}
          stepTitle={TABS[activeTab]?.label ?? state.text}
          hint={TABS[activeTab]?.phaseTitle ?? state.details?.[0]}
          compactMobile
          compressed
          showStepCard={false}
        />
      }
      items={TABS}
      activeId={activeTab}
      onSelect={(id) => setActiveTab(Number(id))}
      sidebarEyebrow="Navegação do AVC"
      sidebarTitle="Etapas do protocolo"
      showContentHeader={false}>
      {activeTab === 0 ? <TimelineCard panel={auxiliaryPanel} /> : null}
      {activeTab === 0 ? <DataPhaseBoard panel={auxiliaryPanel} /> : null}
      {activeTab === 1 ? <EvaluationPhaseBoard panel={auxiliaryPanel} encounterSummary={encounterSummary} /> : null}
      {activeTab === 2 ? <StabilizationPhaseBoard panel={auxiliaryPanel} /> : null}
      {activeTab === 3 ? <ExamsPhaseBoard panel={auxiliaryPanel} /> : null}
      {activeTab === 5 ? <FollowUpPhaseBoard encounterSummary={encounterSummary} /> : null}
      <PhasePriorityCard activeTab={activeTab} />
      {activeTab === 3 ? <ImagingPriorityCard /> : null}

      {activeTab === 4 ? <ReperfusionCaseBoard panel={auxiliaryPanel} encounterSummary={encounterSummary} /> : null}

      {auxiliaryPanel ? (
        <SepsisFormTabs
          auxiliaryPanel={auxiliaryPanel}
          fieldSections={auxiliaryFieldSections}
          metrics={auxiliaryPanel.metrics}
          activeTab={activeTab}
          externalNavigation
          onTabChange={setActiveTab}
          onFieldChange={onFieldChange}
          onPresetApply={onPresetApply}
          onUnitChange={onUnitChange}
          onActionRun={onActionRun}
          onStatusChange={onStatusChange}
          moduleMode="avc"
        />
      ) : null}

      {activeTab === 5 && !isQuestion && !isEnd ? (
        <ModuleFinishPanel
          summaryTitle="Fechamento do caso AVC"
          destination={metricValue(encounterSummary, "Destino")}
          summaryLines={finishSummaryLines}
          infoTitle="Pontos obrigatórios de segurança"
          infoLines={[
            "Nunca assumir dado ausente como normal: se imagem, janela, contraindicações ou NIHSS estiverem incompletos, a decisão deve permanecer em revisão.",
            "Trombólise só deve ser mantida quando hemorragia estiver excluída, janela validada e bloqueios resolvidos/documentados.",
            "Em hemorragia, o fluxo muda automaticamente para controle pressórico, reversão de anticoagulação e destino intensivo.",
            "Toda decisão final deve ser separada da recomendação do sistema e acompanhada de dupla checagem em condutas de alto risco.",
          ]}
          narrative={fieldValue(auxiliaryPanel, "auditComment")}
        />
      ) : null}

      {isQuestion ? (
        <View style={{ gap: 10 }}>
          {canGoBack ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </Pressable>
          ) : null}
          <DecisionGrid
            options={options.map((option) => ({
              id: option,
              label: formatOptionLabel(option),
              sublabel: getOptionSublabel(option),
            }))}
            title={state.text}
            onSelect={(id) => onRunTransition(id)}
          />
        </View>
      ) : null}

      {!isQuestion && !isEnd && !isCurrentStateTimerRunning ? (
        <View style={styles.primaryActions}>
          {activeTab === 0 ? (
            <Pressable style={styles.backButton} onPress={onExitModule}>
              <Text style={styles.backButtonText}>← Módulos</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.backButton} onPress={() => setActiveTab((tab) => tab - 1)}>
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

      {isEnd ? (
        <ClinicalLogCard
          clinicalLog={clinicalLog}
          encounterSummary={encounterSummary}
          onExport={onExportSummary}
          onPrint={onPrintReport}
        />
      ) : null}
    </ModuleFlowLayout>
  );
}

const avcStyles = StyleSheet.create({
  phaseBoard: {
    gap: 8,
    marginBottom: 8,
  },
  imagingPriorityCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#ef4444",
    backgroundColor: "#fff1f2",
    padding: 14,
    gap: 6,
    marginBottom: 8,
  },
  imagingPriorityEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: "#b91c1c",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  imagingPriorityTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    color: "#991b1b",
  },
  imagingPriorityText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#7f1d1d",
  },
  reperfusionBoard: {
    gap: 8,
    marginBottom: 8,
  },
  reperfusionHeader: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 4,
  },
  reperfusionEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  reperfusionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    color: "#0f172a",
  },
  reperfusionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#475569",
  },
  decisionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#f8fbff",
    padding: 12,
    gap: 4,
  },
  decisionWarn: {
    borderColor: "#f5d58f",
    backgroundColor: "#fff9eb",
  },
  decisionDanger: {
    borderColor: "#f3b0b0",
    backgroundColor: "#fff1f1",
  },
  decisionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  decisionLine: {
    fontSize: 12,
    lineHeight: 16,
    color: "#334155",
    fontWeight: "600",
  },
  timelineCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#ffffff",
    padding: 12,
    gap: 6,
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbe7f3",
    paddingBottom: 8,
  },
  timelineLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
  },
  timelineValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
});
