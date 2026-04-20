import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppDesign } from "../../constants/app-design";
import { ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type RhythmCard = {
  id: string;
  qrs: "estreito" | "largo";
  rhythm: "regular" | "irregular";
  label: string;
  examples: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  steps: { action: string; detail?: string }[];
  caution?: string;
};

// ── Dados clínicos ─────────────────────────────────────────────────────────────

const INSTABILITY_SIGNS = [
  { label: "Hipotensão", detail: "PAS < 90 mmHg ou declínio rápido" },
  { label: "Alteração do nível de consciência", detail: "Confusão, agitação ou síncope" },
  { label: "Dor precordial isquêmica", detail: "Angina por taquiarritmia" },
  { label: "Insuficiência cardíaca aguda", detail: "Congestão, EAP, B3 ou crepitações" },
  { label: "Sinais de choque", detail: "Hipoperfusão periférica, sudorese, palidez" },
];

const RHYTHM_CARDS: RhythmCard[] = [
  {
    id: "estreito_regular",
    qrs: "estreito",
    rhythm: "regular",
    label: "QRS estreito · Regular",
    examples: "TSV (TRNAV, TRAV), flutter atrial, taquicardia sinusal",
    accentColor: "#1d4ed8",
    accentBg: "#eff6ff",
    accentBorder: "#bfdbfe",
    steps: [
      { action: "Manobra vagal", detail: "Valsalva modificada ou massagem do seio carotídeo" },
      { action: "Adenosina 6 mg IV rápido + flush 20 mL", detail: "2ª dose: 12 mg · 3ª dose: 12 mg (se necessário)" },
      { action: "Sem resposta: controle de frequência", detail: "Diltiazem 15–20 mg IV lento ou metoprolol 5 mg IV" },
      { action: "Refratário ou instabilização", detail: "Cardioversão sincronizada: iniciar com 50–100 J" },
    ],
  },
  {
    id: "estreito_irregular",
    qrs: "estreito",
    rhythm: "irregular",
    label: "QRS estreito · Irregular",
    examples: "Fibrilação atrial, flutter com condução variável, taquicardia atrial multifocal",
    accentColor: "#0369a1",
    accentBg: "#f0f9ff",
    accentBorder: "#bae6fd",
    steps: [
      { action: "Controle de frequência (1ª escolha estável)", detail: "Diltiazem 15–20 mg IV ou metoprolol 5 mg IV" },
      { action: "Considerar anticoagulação", detail: "FA > 48 h ou duração desconhecida → risco de tromboembolismo" },
      { action: "Reversão química (se indicada)", detail: "Amiodarona IV em infusão contínua — avaliar com cardiologia" },
      { action: "Instabilização: cardioversão sincronizada", detail: "FA: 120–200 J bifásico · Flutter: 50–100 J" },
    ],
    caution: "Evitar adenosina, digoxina e bloqueadores do nó AV em FA com pré-excitação (WPW) — risco de FV.",
  },
  {
    id: "largo_regular",
    qrs: "largo",
    rhythm: "regular",
    label: "QRS largo · Regular",
    examples: "TV monomórfica, TSV com aberrância ou bloqueio de ramo",
    accentColor: "#c2410c",
    accentBg: "#fff7ed",
    accentBorder: "#fed7aa",
    steps: [
      { action: "Tratar como TV até prova em contrário", detail: "QRS largo + taquicardia = TV na emergência" },
      { action: "Amiodarona 150 mg IV em 10 min", detail: "Manutenção: 1 mg/min por 6 h → 0,5 mg/min por 18 h" },
      { action: "Se TSV com aberrância confirmada", detail: "Adenosina pode ser tentada com cautela" },
      { action: "Instabilização ou sem resposta", detail: "Cardioversão sincronizada: 100 J (monofásico equiv.)" },
    ],
    caution: "Não usar bloqueadores do nó AV (verapamil, diltiazem) em TV — pode causar colapso hemodinâmico.",
  },
  {
    id: "largo_irregular",
    qrs: "largo",
    rhythm: "irregular",
    label: "QRS largo · Irregular",
    examples: "TV polimórfica, Torsades de Pointes, FA com pré-excitação (WPW)",
    accentColor: "#7f1d1d",
    accentBg: "#fff1f2",
    accentBorder: "#fecdd3",
    steps: [
      { action: "Torsades de Pointes (QT longo)", detail: "Sulfato de magnésio 1–2 g IV em bolus lento" },
      { action: "FA com WPW (QRS pré-excitado)", detail: "Amiodarona IV ou cardioversão — evitar bloqueadores AV" },
      { action: "TV polimórfica instável", detail: "Desfibrilação NÃO sincronizada (como FV) se sem pulso" },
      { action: "Investigar e corrigir causa", detail: "QT longo, isquemia, eletrólitos, fármacos" },
    ],
    caution: "Se o paciente perder pulso durante Torsades ou TV polimórfica → algoritmo de PCR / FV.",
  },
];

const CARDIOVERSION_ENERGIES = [
  { rhythm: "FA (QRS estreito, irregular)", energy: "120–200 J", mode: "Sincronizado", color: "#0369a1" },
  { rhythm: "Flutter atrial / TSV regular", energy: "50–100 J", mode: "Sincronizado", color: "#1d4ed8" },
  { rhythm: "TV monomórfica (QRS largo)", energy: "100 J", mode: "Sincronizado", color: "#c2410c" },
  { rhythm: "TV polimórfica / FV", energy: "200 J (defib.)", mode: "NÃO sincronizado", color: "#7f1d1d" },
];

const TACHY_SECTIONS = [
  { id: "overview", icon: "🧭", label: "Visão geral", hint: "Definição e instabilidade", step: "1", accent: "#0f766e" },
  { id: "decision", icon: "⚖", label: "Decisão", hint: "Instável vs estável", step: "2", accent: "#dc2626" },
  { id: "rhythms", icon: "ECG", label: "Ritmos", hint: "QRS e regularidade", step: "3", accent: "#1d4ed8" },
  { id: "energy", icon: "J", label: "Energias", hint: "Cardioversão sincronizada", step: "4", accent: "#b45309" },
] as const;

// ── Componentes ───────────────────────────────────────────────────────────────

function RhythmBlock({ card }: { card: RhythmCard }) {
  const qrsBg  = card.qrs === "estreito" ? "#f0f9ff" : "#fff7ed";
  const qrsCol = card.qrs === "estreito" ? "#0369a1" : "#c2410c";
  const regBg  = card.rhythm === "regular" ? "#f0fdf4" : "#fef3c7";
  const regCol = card.rhythm === "regular" ? "#166534" : "#92400e";

  return (
    <View style={[rbc.card, { borderLeftColor: card.accentColor }]}>
      {/* Header */}
      <View style={rbc.header}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={rbc.badgeRow}>
            <View style={[rbc.badge, { backgroundColor: qrsBg }]}>
              <Text style={[rbc.badgeText, { color: qrsCol }]}>
                {card.qrs === "estreito" ? "QRS estreito" : "QRS largo"}
              </Text>
            </View>
            <View style={[rbc.badge, { backgroundColor: regBg }]}>
              <Text style={[rbc.badgeText, { color: regCol }]}>
                {card.rhythm === "regular" ? "Regular" : "Irregular"}
              </Text>
            </View>
          </View>
          <Text style={rbc.examples}>{card.examples}</Text>
        </View>
      </View>

      {/* Passos */}
      <View style={rbc.stepsBlock}>
        <Text style={rbc.stepsLabel}>Conduta</Text>
        {card.steps.map((step, i) => (
          <View key={i} style={rbc.stepRow}>
            <View style={[rbc.stepNum, { backgroundColor: card.accentColor }]}>
              <Text style={rbc.stepNumText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={rbc.stepAction}>{step.action}</Text>
              {step.detail ? <Text style={rbc.stepDetail}>{step.detail}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      {/* Atenção */}
      {card.caution ? (
        <View style={rbc.cautionBlock}>
          <Text style={rbc.cautionLabel}>⚠ Atenção</Text>
          <Text style={rbc.cautionText}>{card.caution}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsTachycardiaScreen() {
  const [activeSection, setActiveSection] = useState<(typeof TACHY_SECTIONS)[number]["id"]>("overview");

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
          eyebrow="ACLS · Referência"
          title="Taquicardia com navegação por estabilidade e padrão ECG"
          subtitle="A lógica clínica foi mantida: primeiro estabilidade, depois QRS e regularidade, por fim energia de cardioversão."
          badgeText="AHA ACLS 2020 · Taquiarritmias com pulso"
          metrics={[
            { label: "Gatilho", value: "FC > 100 bpm", accent: "#0f766e" },
            { label: "Instável", value: "Cardioversão imediata", accent: "#dc2626" },
            { label: "Estável", value: "Classificar ritmo", accent: "#1d4ed8" },
          ]}
          progressLabel={TACHY_SECTIONS.find((section) => section.id === activeSection)?.label ?? "Visão geral"}
          stepTitle={TACHY_SECTIONS.find((section) => section.id === activeSection)?.hint ?? "Definição operacional e instabilidade"}
          hint="Na emergência, taquicardia de QRS largo deve ser tratada como TV até prova em contrário."
          compactMobile
        />
      }
      items={TACHY_SECTIONS as unknown as { id: string; icon?: string; label: string; hint?: string; step?: string; accent?: string }[]}
      activeId={activeSection}
      onSelect={(id) => setActiveSection(String(id) as (typeof TACHY_SECTIONS)[number]["id"])}
      sidebarEyebrow="Navegação ACLS"
      sidebarTitle="Taquicardia">
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {activeSection === "overview" ? (
          <>
            <View style={s.introCard}>
              <Text style={s.introEyebrow}>ACLS · Referência</Text>
              <Text style={s.introTitle}>Taquicardia no ACLS</Text>
              <View style={s.definitionBlock}>
                <Text style={s.definitionLabel}>Definição operacional</Text>
                <Text style={s.definitionText}>
                  <Text style={s.bold}>FC &gt; 100 bpm</Text> com sintomas ou instabilidade hemodinâmica.
                  O tratamento depende de dois fatores: o paciente está <Text style={s.bold}>instável?</Text> e o QRS é{" "}
                  <Text style={s.bold}>estreito ou largo?</Text>
                </Text>
              </View>
            </View>

            <View style={s.instabilityCard}>
              <Text style={s.instabilityTitle}>Sinais de instabilidade</Text>
              <Text style={s.instabilitySubtitle}>
                Qualquer sinal abaixo indica cardioversão imediata — não espere resposta ao fármaco
              </Text>
              {INSTABILITY_SIGNS.map((sign) => (
                <View key={sign.label} style={s.signRow}>
                  <View style={s.signDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.signLabel}>{sign.label}</Text>
                    <Text style={s.signDetail}>{sign.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {activeSection === "decision" ? (
          <View style={s.decisionCard}>
            <View style={s.decisionBranch}>
              <View style={[s.decisionBranchHeader, { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }]}>
                <Text style={[s.decisionBranchLabel, { color: "#7f1d1d" }]}>INSTÁVEL</Text>
              </View>
              <View style={s.decisionBranchBody}>
                <Text style={s.decisionBranchTitle}>Cardioversão sincronizada imediata</Text>
                <Text style={s.decisionBranchText}>
                  Sedação rápida se o paciente estiver consciente. Não atrasar por aguardar acesso
                  venoso ou analgesia completa se houver risco imediato de vida.
                </Text>
              </View>
            </View>

            <View style={s.decisionDivider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>ou</Text>
              <View style={s.dividerLine} />
            </View>

            <View style={s.decisionBranch}>
              <View style={[s.decisionBranchHeader, { backgroundColor: "#dcfce7", borderColor: "#86efac" }]}>
                <Text style={[s.decisionBranchLabel, { color: "#166534" }]}>ESTÁVEL</Text>
              </View>
              <View style={s.decisionBranchBody}>
                <Text style={s.decisionBranchTitle}>Identificar ritmo → tratar com fármaco</Text>
                <Text style={s.decisionBranchText}>
                  Acesso venoso, ECG de 12 derivações e monitorização contínua. Classificar
                  pelo QRS (estreito / largo) e pela regularidade (regular / irregular).
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {activeSection === "rhythms" ? (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Conduta por tipo de ritmo</Text>
              <Text style={s.sectionSubtitle}>Paciente estável — identifique o padrão e siga o fluxo</Text>
            </View>
            {RHYTHM_CARDS.map((card) => (
              <RhythmBlock key={card.id} card={card} />
            ))}
          </>
        ) : null}

        {activeSection === "energy" ? (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Energias de cardioversão</Text>
              <Text style={s.sectionSubtitle}>Bifásico — ajustar conforme aparelho se necessário</Text>
            </View>
            <View style={s.energyCard}>
              {CARDIOVERSION_ENERGIES.map((row, i) => (
                <View
                  key={row.rhythm}
                  style={[
                    s.energyRow,
                    i < CARDIOVERSION_ENERGIES.length - 1 && s.energyRowBorder,
                  ]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.energyRhythm}>{row.rhythm}</Text>
                    <View style={[s.modeTag, { borderColor: row.color + "44" }]}>
                      <Text style={[s.modeText, { color: row.color }]}>{row.mode}</Text>
                    </View>
                  </View>
                  <Text style={[s.energyValue, { color: row.color }]}>{row.energy}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={s.footerCard}>
          <Text style={s.footerTitle}>Regra prática — QRS largo na emergência</Text>
          <Text style={s.footerBody}>
            Taquicardia de QRS largo em contexto de emergência deve ser tratada como <Text style={{ fontWeight: "800" }}>TV até prova em contrário</Text>.
            Não use verapamil ou diltiazem sem diagnóstico de SVT confirmado; o risco de colapso hemodinâmico em TV é real.
          </Text>
          <View style={s.footerRule} />
          <Text style={s.footerSource}>Baseado em AHA ACLS 2020 + atualizações focadas 2022–2023</Text>
        </View>
      </ScrollView>
    </ModuleFlowLayout>
  );
}

// ── Estilos do componente RhythmBlock ────────────────────────────────────────

const rbc = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    borderLeftWidth: 5,
    padding: 20,
    gap: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  examples: {
    fontSize: 12,
    fontWeight: "500",
    color: AppDesign.text.muted,
    lineHeight: 18,
  },
  stepsBlock: {
    gap: 10,
  },
  stepsLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: AppDesign.text.muted,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  stepAction: {
    fontSize: 13,
    fontWeight: "700",
    color: AppDesign.text.primary,
    lineHeight: 19,
  },
  stepDetail: {
    fontSize: 12,
    fontWeight: "500",
    color: AppDesign.text.secondary,
    lineHeight: 17,
  },
  cautionBlock: {
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    padding: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  cautionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#92400e",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cautionText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#78350f",
    fontWeight: "500",
  },
});

// ── Estilos principais ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: AppDesign.canvas.tealBackdrop,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 2,
    paddingTop: 4,
    paddingBottom: 28,
    maxWidth: 760,
    width: "100%",
    alignSelf: "stretch",
    gap: 18,
  },

  // ── Intro ──
  introCard: {
    backgroundColor: "#ffffff",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  introEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: AppDesign.accent.teal,
  },
  introTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: AppDesign.text.primary,
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  definitionBlock: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
  },
  definitionLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: AppDesign.text.muted,
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 14,
    lineHeight: 21,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },
  bold: {
    fontWeight: "800",
    color: AppDesign.text.primary,
  },

  // ── Instabilidade ──
  instabilityCard: {
    backgroundColor: "#fff1f2",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#fecdd3",
    gap: 12,
  },
  instabilityTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#7f1d1d",
    letterSpacing: -0.2,
  },
  instabilitySubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#b91c1c",
    lineHeight: 17,
    marginTop: -4,
  },
  signRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  signDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
    marginTop: 5,
    flexShrink: 0,
  },
  signLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7f1d1d",
    lineHeight: 20,
  },
  signDetail: {
    fontSize: 12,
    fontWeight: "500",
    color: "#b91c1c",
    lineHeight: 17,
  },

  // ── Decisão principal ──
  decisionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  decisionBranch: {
    gap: 0,
  },
  decisionBranchHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  decisionBranchLabel: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  decisionBranchBody: {
    padding: 16,
    gap: 6,
  },
  decisionBranchTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.1,
  },
  decisionBranchText: {
    fontSize: 13,
    lineHeight: 20,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },
  decisionDivider: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppDesign.border.subtle,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: AppDesign.text.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Cabeçalho de seção ──
  sectionHeader: {
    gap: 3,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: AppDesign.text.onDark,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(248,250,252,0.7)",
  },

  // ── Energias ──
  energyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  energyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  energyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: AppDesign.border.subtle,
  },
  energyRhythm: {
    fontSize: 13,
    fontWeight: "700",
    color: AppDesign.text.primary,
    lineHeight: 19,
  },
  modeTag: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    marginTop: 3,
  },
  modeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  energyValue: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
    flexShrink: 0,
  },

  // ── Rodapé ──
  footerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: AppDesign.text.primary,
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: AppDesign.text.secondary,
    fontWeight: "600",
  },
  footerRule: {
    height: 1,
    backgroundColor: AppDesign.border.subtle,
  },
  footerSource: {
    fontSize: 11,
    fontWeight: "600",
    color: AppDesign.text.muted,
    letterSpacing: 0.2,
  },
});
