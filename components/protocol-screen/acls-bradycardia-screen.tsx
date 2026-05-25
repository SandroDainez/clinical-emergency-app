import { ScrollView, StyleSheet, Text, View } from "react-native";

// ── Dados clínicos ─────────────────────────────────────────────────────────────

const INSTABILITY_SIGNS = [
  { label: "Hipotensão", detail: "PAS < 90 mmHg ou queda > 30 mmHg da basal" },
  { label: "Rebaixamento do nível de consciência", detail: "Confusão, síncope ou pré-síncope" },
  { label: "Dor precordial isquêmica", detail: "Angina em contexto de FC baixa" },
  { label: "Insuficiência cardíaca aguda", detail: "Congestão, dispneia, B3 ou EAP" },
  { label: "Sinais de choque", detail: "Palidez, sudorese, hipoperfusão periférica" },
];

type FlowStep = {
  step: number;
  title: string;
  body: string;
  tag?: string;
  tagColor?: string;
  tagBg?: string;
  highlight?: string;
  highlightColor?: string;
};

const FLOW_STEPS: FlowStep[] = [
  {
    step: 1,
    title: "Confirmar e monitorar",
    body: "Identificar bradicardia no monitor (FC < 60 bpm). Obter acesso venoso. Monitorar PA, SpO₂ e ECG de 12 derivações se possível. Administrar O₂ se SpO₂ < 94%.",
    tag: "Sempre",
    tagColor: "#2dd4bf",
    tagBg: "#042f2e",
  },
  {
    step: 2,
    title: "O paciente é instável?",
    body: "Procurar sinais de hipotensão, alteração do nível de consciência, dor precordial, ICC aguda ou choque. Se INSTÁVEL → seguir para Passo 3. Se ESTÁVEL → investigar causa, monitorar e acionar especialista.",
    tag: "Decisão",
    tagColor: "#60a5fa",
    tagBg: "#1e3a5f",
    highlight: "A instabilidade deve ser atribuível à FC baixa — não à doença de base.",
    highlightColor: "#60a5fa",
  },
  {
    step: 3,
    title: "Atropina 0,5 mg IV",
    body: "Droga de primeira linha para bradicardia sintomática. Repetir 0,5 mg IV a cada 3–5 min. Dose máxima: 3 mg (efeito vagolítico completo). Resposta em 1–2 min.",
    tag: "1ª linha",
    tagColor: "#4ade80",
    tagBg: "#052e16",
    highlight: "Ineficaz em bloqueio AV de alto grau (Mobitz II / BAV total) — não atrasar o MP.",
    highlightColor: "#fb923c",
  },
  {
    step: 4,
    title: "Marcapasso transcutâneo (MP-TC)",
    body: "Indicado quando a atropina é ineficaz, está contraindicada ou o bloqueio é de alto grau. Iniciar IMEDIATAMENTE em Mobitz II e BAV total. Frequência inicial: 60–80 bpm · Analgesia/sedação para conforto do paciente.",
    tag: "2ª linha",
    tagColor: "#f97316",
    tagBg: "#431407",
    highlight: "Confirmar captura elétrica (espículas seguidas de QRS) e mecânica (pulso palpável).",
    highlightColor: "#fb923c",
  },
  {
    step: 5,
    title: "Drogas de suporte enquanto aguarda MP",
    body: "Se MP-TC não disponível imediatamente ou ineficaz:\n· Dopamina 2–10 mcg/kg/min IV (cronotropismo + inotropismo)\n· Epinefrina 2–10 mcg/min IV em infusão contínua\n· Isoproterenol 2–10 mcg/min IV (casos selecionados)",
    tag: "Ponte",
    tagColor: "#a78bfa",
    tagBg: "#2e1065",
  },
  {
    step: 6,
    title: "Avaliação especializada + MP definitivo",
    body: "Acionar cardiologia para avaliação de MP transvenoso ou definitivo. Investigar e tratar causas reversíveis enquanto o suporte hemodinâmico é mantido.",
    tag: "Destino",
    tagColor: "#94a3b8",
    tagBg: "#1e293b",
  },
];

type AvBlock = {
  name: string;
  description: string;
  ecg: string;
  risk: "baixo" | "moderado" | "alto";
  action: string;
};

const AV_BLOCKS: AvBlock[] = [
  {
    name: "Bloqueio AV 1º grau",
    description: "Retardo na condução AV sem bloqueio real",
    ecg: "PR prolongado (> 200 ms), cada P conduz para QRS",
    risk: "baixo",
    action: "Nenhuma intervenção. Monitorar e investigar causa.",
  },
  {
    name: "Bloqueio AV 2º grau — Mobitz I (Wenckebach)",
    description: "Falha intermitente com PR progressivamente longo",
    ecg: "PR progressivo → P bloqueada → ciclo reinicia. QRS estreito.",
    risk: "moderado",
    action: "Geralmente benigno. Atropina se sintomático e instável.",
  },
  {
    name: "Bloqueio AV 2º grau — Mobitz II",
    description: "Falha intermitente sem variação do PR — risco de progressão",
    ecg: "PR fixo → P bloqueada de forma súbita. QRS geralmente largo.",
    risk: "alto",
    action: "MP transcutâneo imediato + avaliação para MP definitivo.",
  },
  {
    name: "Bloqueio AV 3º grau (completo)",
    description: "Dissociação total entre átrios e ventrículos",
    ecg: "P e QRS independentes, FC ventricular baixa (< 40 bpm), QRS largo.",
    risk: "alto",
    action: "MP transcutâneo urgente + suporte vasoativo + MP definitivo.",
  },
];

const RISK_CONFIG = {
  baixo:    { label: "Baixo risco",    color: "#4ade80", bg: "#052e16", border: "#166534" },
  moderado: { label: "Risco moderado", color: "#fb923c", bg: "#431407", border: "#9a3412" },
  alto:     { label: "Alto risco",     color: "#f87171", bg: "#450a0a", border: "#991b1b" },
};

const CAUSES = [
  { group: "Cardíacas", items: ["Doença do nó sinusal", "Bloqueios AV", "Infarto inferior (ramo direito)"] },
  { group: "Fármacos", items: ["Betabloqueadores", "Bloqueadores de canal de cálcio", "Digoxina", "Amiodarona"] },
  { group: "Sistêmicas", items: ["Hipotireoidismo", "Hipotermia", "Hipercalemia", "Aumento do tônus vagal"] },
];

// ── Componentes ───────────────────────────────────────────────────────────────

function StepCard({ step }: { step: FlowStep }) {
  return (
    <View style={s.stepCard}>
      <View style={s.stepHeader}>
        <View style={s.stepNumber}>
          <Text style={s.stepNumberText}>{step.step}</Text>
        </View>
        <Text style={s.stepTitle}>{step.title}</Text>
        {step.tag ? (
          <View style={[s.stepTag, { backgroundColor: step.tagBg, borderColor: step.tagColor + "44" }]}>
            <Text style={[s.stepTagText, { color: step.tagColor }]}>{step.tag}</Text>
          </View>
        ) : null}
      </View>
      <Text style={s.stepBody}>{step.body}</Text>
      {step.highlight ? (
        <View style={[s.highlightBlock, { borderLeftColor: step.highlightColor }]}>
          <Text style={[s.highlightText, { color: step.highlightColor }]}>{step.highlight}</Text>
        </View>
      ) : null}
    </View>
  );
}

function AvBlockCard({ block }: { block: AvBlock }) {
  const risk = RISK_CONFIG[block.risk];
  return (
    <View style={[s.avCard, { borderLeftColor: risk.color }]}>
      <View style={s.avHeader}>
        <Text style={s.avName}>{block.name}</Text>
        <View style={[s.riskBadge, { backgroundColor: risk.bg, borderColor: risk.border }]}>
          <Text style={[s.riskText, { color: risk.color }]}>{risk.label}</Text>
        </View>
      </View>
      <Text style={s.avDesc}>{block.description}</Text>
      <View style={s.avEcgBlock}>
        <Text style={s.avEcgLabel}>No monitor</Text>
        <Text style={s.avEcgText}>{block.ecg}</Text>
      </View>
      <View style={[s.avActionBlock, { backgroundColor: risk.bg, borderColor: risk.border }]}>
        <Text style={[s.avActionLabel, { color: risk.color }]}>Conduta</Text>
        <Text style={[s.avActionText, { color: risk.color }]}>{block.action}</Text>
      </View>
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsBradycardiaScreen() {
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>ACLS · Referência</Text>
        <Text style={s.introTitle}>Bradicardia no ACLS</Text>
        <View style={s.definitionBlock}>
          <Text style={s.definitionLabel}>Definição operacional</Text>
          <Text style={s.definitionText}>
            <Text style={s.definitionBold}>FC &lt; 60 bpm</Text> com sintomas ou instabilidade
            hemodinâmica atribuíveis à frequência cardíaca baixa.
          </Text>
          <Text style={[s.definitionText, { marginTop: 6 }]}>
            Bradicardia isolada sem sintomas geralmente não requer tratamento — o contexto clínico
            é o que determina a urgência.
          </Text>
        </View>
      </View>

      {/* Sinais de instabilidade */}
      <View style={s.instabilityCard}>
        <Text style={s.instabilityTitle}>Sinais de instabilidade</Text>
        <Text style={s.instabilitySubtitle}>
          Presença de qualquer sinal abaixo indica necessidade de intervenção imediata
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

      {/* Fluxo de conduta */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Fluxo de conduta</Text>
        <Text style={s.sectionSubtitle}>Siga em sequência para bradicardia sintomática instável</Text>
      </View>

      <View style={s.flowContainer}>
        {FLOW_STEPS.map((step, index) => (
          <View key={step.step}>
            <StepCard step={step} />
            {index < FLOW_STEPS.length - 1 ? (
              <View style={s.flowConnector}>
                <View style={s.flowLine} />
                <Text style={s.flowArrow}>▼</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {/* Bloqueios AV */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Bloqueios AV — reconhecimento rápido</Text>
        <Text style={s.sectionSubtitle}>O tipo de bloqueio determina urgência e conduta</Text>
      </View>

      {AV_BLOCKS.map((block) => (
        <AvBlockCard key={block.name} block={block} />
      ))}

      {/* Causas reversíveis */}
      <View style={s.causesCard}>
        <Text style={s.causesTitle}>Causas comuns — investigar e tratar</Text>
        {CAUSES.map((group) => (
          <View key={group.group} style={s.causeGroup}>
            <Text style={s.causeGroupLabel}>{group.group}</Text>
            <View style={s.causeItems}>
              {group.items.map((item) => (
                <View key={item} style={s.causeItemRow}>
                  <View style={s.causeItemDot} />
                  <Text style={s.causeItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Rodapé */}
      <View style={s.footerCard}>
        <Text style={s.footerTitle}>Lembrete clínico</Text>
        <Text style={s.footerBody}>
          Atropina é ineficaz em bloqueios infranodais (Mobitz II e BAV total). Nesses casos,
          iniciar MP transcutâneo sem demora — a atropina não deve retardar a marcapasso.
          Sempre confirmar captura mecânica além da elétrica.
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>Baseado em AHA ACLS 2020 + atualizações focadas 2022–2023</Text>
      </View>
    </ScrollView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

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
  definitionBold: {
    fontWeight: "800",
    color: "#f1f5f9",
  },

  // ── Instabilidade ──
  instabilityCard: {
    backgroundColor: "#450a0a",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#991b1b",
    gap: 12,
  },
  instabilityTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fca5a5",
    letterSpacing: -0.2,
  },
  instabilitySubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f87171",
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
    backgroundColor: "#f87171",
    marginTop: 5,
    flexShrink: 0,
  },
  signLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fca5a5",
    lineHeight: 20,
  },
  signDetail: {
    fontSize: 12,
    fontWeight: "500",
    color: "#f87171",
    lineHeight: 17,
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

  // ── Fluxo ──
  flowContainer: {
    gap: 0,
  },
  flowConnector: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    gap: 0,
  },
  flowLine: {
    width: 2,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  flowArrow: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 14,
  },

  // ── Card de passo ──
  stepCard: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#22d3ee",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0a0f1a",
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f1f5f9",
    flex: 1,
    letterSpacing: -0.1,
  },
  stepTag: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    flexShrink: 0,
  },
  stepTagText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#94a3b8",
    fontWeight: "500",
  },
  highlightBlock: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 4,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },

  // ── Bloqueios AV ──
  avCard: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
    borderLeftWidth: 5,
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
    flex: 1,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  riskBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    flexShrink: 0,
  },
  riskText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  avDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94a3b8",
    lineHeight: 19,
    marginTop: -2,
  },
  avEcgBlock: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  avEcgLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#64748b",
  },
  avEcgText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#f1f5f9",
    lineHeight: 19,
  },
  avActionBlock: {
    borderRadius: 10,
    padding: 10,
    gap: 3,
    borderWidth: 1,
  },
  avActionLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  avActionText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },

  // ── Causas ──
  causesCard: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  causesTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
  },
  causeGroup: {
    gap: 6,
  },
  causeGroupLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#64748b",
  },
  causeItems: {
    gap: 5,
  },
  causeItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  causeItemDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#22d3ee",
    flexShrink: 0,
  },
  causeItemText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94a3b8",
    lineHeight: 19,
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
