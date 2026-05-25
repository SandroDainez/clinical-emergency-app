import { ScrollView, StyleSheet, Text, View } from "react-native";

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
    accentColor: "#3b82f6",
    accentBg: "#1e3a5f",
    accentBorder: "#2563eb",
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
    accentColor: "#0ea5e9",
    accentBg: "#0c2d48",
    accentBorder: "#0369a1",
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
    accentColor: "#f97316",
    accentBg: "#3a1a0a",
    accentBorder: "#c2410c",
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
    accentColor: "#f43f5e",
    accentBg: "#3b0a1a",
    accentBorder: "#be123c",
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
  { rhythm: "FA (QRS estreito, irregular)", energy: "120–200 J", mode: "Sincronizado", color: "#0ea5e9" },
  { rhythm: "Flutter atrial / TSV regular", energy: "50–100 J", mode: "Sincronizado", color: "#3b82f6" },
  { rhythm: "TV monomórfica (QRS largo)", energy: "100 J", mode: "Sincronizado", color: "#f97316" },
  { rhythm: "TV polimórfica / FV", energy: "200 J (defib.)", mode: "NÃO sincronizado", color: "#f43f5e" },
];

// ── Componentes ───────────────────────────────────────────────────────────────

function RhythmBlock({ card }: { card: RhythmCard }) {
  const qrsBg  = card.qrs === "estreito" ? "#0c2d48" : "#3a1a0a";
  const qrsCol = card.qrs === "estreito" ? "#0ea5e9" : "#f97316";
  const regBg  = card.rhythm === "regular" ? "#0a2e1a" : "#2e2006";
  const regCol = card.rhythm === "regular" ? "#4ade80" : "#fbbf24";

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
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>ACLS · Referência</Text>
        <Text style={s.introTitle}>Taquicardia no ACLS</Text>
        <View style={s.definitionBlock}>
          <Text style={s.definitionLabel}>Definição operacional</Text>
          <Text style={s.definitionText}>
            <Text style={s.bold}>FC &gt; 100 bpm</Text> com sintomas ou instabilidade hemodinâmica.
            O tratamento depende de dois fatores: o paciente está{" "}
            <Text style={s.bold}>instável?</Text> e o QRS é{" "}
            <Text style={s.bold}>estreito ou largo?</Text>
          </Text>
        </View>
      </View>

      {/* Sinais de instabilidade */}
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

      {/* Decisão principal */}
      <View style={s.decisionCard}>
        {/* Instável */}
        <View style={s.decisionBranch}>
          <View style={[s.decisionBranchHeader, { backgroundColor: "#3b0a1a", borderColor: "#be123c" }]}>
            <Text style={[s.decisionBranchLabel, { color: "#fda4af" }]}>INSTÁVEL</Text>
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

        {/* Estável */}
        <View style={s.decisionBranch}>
          <View style={[s.decisionBranchHeader, { backgroundColor: "#0a2e1a", borderColor: "#166534" }]}>
            <Text style={[s.decisionBranchLabel, { color: "#4ade80" }]}>ESTÁVEL</Text>
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

      {/* Classificação dos ritmos */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Conduta por tipo de ritmo</Text>
        <Text style={s.sectionSubtitle}>Paciente estável — identifique o padrão e siga o fluxo</Text>
      </View>

      {RHYTHM_CARDS.map((card) => (
        <RhythmBlock key={card.id} card={card} />
      ))}

      {/* Referência de energias */}
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

      {/* Rodapé */}
      <View style={s.footerCard}>
        <Text style={s.footerTitle}>Regra prática — QRS largo na emergência</Text>
        <Text style={s.footerBody}>
          Taquicardia de QRS largo em contexto de emergência deve ser tratada como{" "}
          <Text style={{ fontWeight: "800" }}>TV até prova em contrário</Text>. Não use
          verapamil ou diltiazem sem diagnóstico de SVT confirmado — o risco de colapso
          hemodinâmico em TV é real.
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>Baseado em AHA ACLS 2020 + atualizações focadas 2022–2023</Text>
      </View>
    </ScrollView>
  );
}

// ── Estilos do componente RhythmBlock ────────────────────────────────────────

const rbc = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
    borderLeftWidth: 5,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    color: "#64748b",
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
    color: "#64748b",
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
    color: "#f1f5f9",
    lineHeight: 19,
  },
  stepDetail: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
    lineHeight: 17,
  },
  cautionBlock: {
    backgroundColor: "#2d1f08",
    borderRadius: 10,
    padding: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: "#78350f",
  },
  cautionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fbbf24",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cautionText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#fde68a",
    fontWeight: "500",
  },
});

// ── Estilos principais ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 40,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },

  // ── Intro ──
  introCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  introEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#22d3ee",
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  definitionBlock: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  definitionLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#64748b",
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#94a3b8",
    fontWeight: "500",
  },
  bold: {
    fontWeight: "800",
    color: "#f1f5f9",
  },

  // ── Instabilidade ──
  instabilityCard: {
    backgroundColor: "#3b0a1a",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#be123c",
    gap: 12,
  },
  instabilityTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fda4af",
    letterSpacing: -0.2,
  },
  instabilitySubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fb7185",
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
    backgroundColor: "#f43f5e",
    marginTop: 5,
    flexShrink: 0,
  },
  signLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fda4af",
    lineHeight: 20,
  },
  signDetail: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fb7185",
    lineHeight: 17,
  },

  // ── Decisão principal ──
  decisionCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    color: "#f1f5f9",
    letterSpacing: -0.1,
  },
  decisionBranchText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#94a3b8",
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
    backgroundColor: "#334155",
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Cabeçalho de seção ──
  sectionHeader: {
    gap: 3,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(248,250,252,0.7)",
  },

  // ── Energias ──
  energyCard: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    borderBottomColor: "#334155",
  },
  energyRhythm: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f1f5f9",
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
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 10,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#22d3ee",
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#94a3b8",
    fontWeight: "500",
  },
  footerRule: {
    height: 1,
    backgroundColor: "#1e293b",
  },
  footerSource: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 0.2,
  },
});
