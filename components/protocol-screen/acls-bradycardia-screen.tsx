import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppDesign } from "../../constants/app-design";
import { ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";

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
    tagColor: "#0f766e",
    tagBg: "#ccfbf1",
  },
  {
    step: 2,
    title: "O paciente é instável?",
    body: "Procurar sinais de hipotensão, alteração do nível de consciência, dor precordial, ICC aguda ou choque. Se INSTÁVEL → seguir para Passo 3. Se ESTÁVEL → investigar causa, monitorar e acionar especialista.",
    tag: "Decisão",
    tagColor: "#1d4ed8",
    tagBg: "#dbeafe",
    highlight: "A instabilidade deve ser atribuível à FC baixa — não à doença de base.",
    highlightColor: "#1d4ed8",
  },
  {
    step: 3,
    title: "Atropina 0,5 mg IV",
    body: "Droga de primeira linha para bradicardia sintomática. Repetir 0,5 mg IV a cada 3–5 min. Dose máxima: 3 mg (efeito vagolítico completo). Resposta em 1–2 min.",
    tag: "1ª linha",
    tagColor: "#166534",
    tagBg: "#dcfce7",
    highlight: "Ineficaz em bloqueio AV de alto grau (Mobitz II / BAV total) — não atrasar o MP.",
    highlightColor: "#92400e",
  },
  {
    step: 4,
    title: "Marcapasso transcutâneo (MP-TC)",
    body: "Indicado quando a atropina é ineficaz, está contraindicada ou o bloqueio é de alto grau. Iniciar IMEDIATAMENTE em Mobitz II e BAV total. Frequência inicial: 60–80 bpm · Analgesia/sedação para conforto do paciente.",
    tag: "2ª linha",
    tagColor: "#c2410c",
    tagBg: "#fff7ed",
    highlight: "Confirmar captura elétrica (espículas seguidas de QRS) e mecânica (pulso palpável).",
    highlightColor: "#7c2d12",
  },
  {
    step: 5,
    title: "Drogas de suporte enquanto aguarda MP",
    body: "Se MP-TC não disponível imediatamente ou ineficaz:\n· Dopamina 2–10 mcg/kg/min IV (cronotropismo + inotropismo)\n· Epinefrina 2–10 mcg/min IV em infusão contínua\n· Isoproterenol 2–10 mcg/min IV (casos selecionados)",
    tag: "Ponte",
    tagColor: "#7c3aed",
    tagBg: "#f5f3ff",
  },
  {
    step: 6,
    title: "Avaliação especializada + MP definitivo",
    body: "Acionar cardiologia para avaliação de MP transvenoso ou definitivo. Investigar e tratar causas reversíveis enquanto o suporte hemodinâmico é mantido.",
    tag: "Destino",
    tagColor: "#0f172a",
    tagBg: "#f1f5f9",
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
  baixo:    { label: "Baixo risco",    color: "#166534", bg: "#dcfce7", border: "#bbf7d0" },
  moderado: { label: "Risco moderado", color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  alto:     { label: "Alto risco",     color: "#7f1d1d", bg: "#fee2e2", border: "#fecaca" },
};

const CAUSES = [
  { group: "Cardíacas", items: ["Doença do nó sinusal", "Bloqueios AV", "Infarto inferior (ramo direito)"] },
  { group: "Fármacos", items: ["Betabloqueadores", "Bloqueadores de canal de cálcio", "Digoxina", "Amiodarona"] },
  { group: "Sistêmicas", items: ["Hipotireoidismo", "Hipotermia", "Hipercalemia", "Aumento do tônus vagal"] },
];

const BRADY_SECTIONS = [
  { id: "overview", icon: "🧭", label: "Visão geral", hint: "Definição e sinais de instabilidade", step: "1", accent: "#0f766e" },
  { id: "flow", icon: "↓", label: "Fluxo", hint: "Sequência de tratamento", step: "2", accent: "#1d4ed8" },
  { id: "blocks", icon: "AV", label: "Bloqueios", hint: "Reconhecimento rápido", step: "3", accent: "#b45309" },
  { id: "causes", icon: "H", label: "Causas", hint: "Investigar e corrigir", step: "4", accent: "#7c3aed" },
] as const;

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
  const [activeSection, setActiveSection] = useState<(typeof BRADY_SECTIONS)[number]["id"]>("overview");

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
          eyebrow="ACLS · Referência"
          title="Bradicardia organizada por decisão, bloqueio e causa"
          subtitle="O algoritmo clínico foi preservado; a mudança é a navegação por seções para leitura mais rápida no plantão."
          badgeText="AHA ACLS 2020 · Bradicardia sintomática"
          metrics={[
            { label: "Gatilho", value: "FC < 60 bpm", accent: "#0f766e" },
            { label: "Primeira linha", value: "Atropina 0,5 mg IV", accent: "#1d4ed8" },
            { label: "Se refratário", value: "MP-TC ou vasoativo", accent: "#b45309" },
          ]}
          progressLabel={BRADY_SECTIONS.find((section) => section.id === activeSection)?.label ?? "Visão geral"}
          stepTitle={BRADY_SECTIONS.find((section) => section.id === activeSection)?.hint ?? "Definição operacional e instabilidade"}
          hint="A instabilidade precisa ser atribuível à bradicardia; se houver bloqueio de alto grau, não atrase marcapasso."
          compactMobile
        />
      }
      items={BRADY_SECTIONS as unknown as { id: string; icon?: string; label: string; hint?: string; step?: string; accent?: string }[]}
      activeId={activeSection}
      onSelect={(id) => setActiveSection(String(id) as (typeof BRADY_SECTIONS)[number]["id"])}
      sidebarEyebrow="Navegação ACLS"
      sidebarTitle="Bradicardia">
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {activeSection === "overview" ? (
          <>
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
                  Bradicardia isolada sem sintomas geralmente não requer tratamento; o contexto clínico
                  é o que determina a urgência.
                </Text>
              </View>
            </View>

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
          </>
        ) : null}

        {activeSection === "flow" ? (
          <>
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
          </>
        ) : null}

        {activeSection === "blocks" ? (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Bloqueios AV — reconhecimento rápido</Text>
              <Text style={s.sectionSubtitle}>O tipo de bloqueio determina urgência e conduta</Text>
            </View>
            {AV_BLOCKS.map((block) => (
              <AvBlockCard key={block.name} block={block} />
            ))}
          </>
        ) : null}

        {activeSection === "causes" ? (
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
        ) : null}

        <View style={s.footerCard}>
          <Text style={s.footerTitle}>Lembrete clínico</Text>
          <Text style={s.footerBody}>
            Atropina é ineficaz em bloqueios infranodais (Mobitz II e BAV total). Nesses casos,
            iniciar MP transcutâneo sem demora; a atropina não deve retardar o marcapasso.
            Sempre confirmar captura mecânica além da elétrica.
          </Text>
          <View style={s.footerRule} />
          <Text style={s.footerSource}>Baseado em AHA ACLS 2020 + atualizações focadas 2022–2023</Text>
        </View>
      </ScrollView>
    </ModuleFlowLayout>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

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
  definitionBold: {
    fontWeight: "800",
    color: AppDesign.text.primary,
  },

  // ── Instabilidade ──
  instabilityCard: {
    backgroundColor: "#fff1f2",
    borderRadius: 20,
    padding: 16,
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
    backgroundColor: "#f8f5ef",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
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
    backgroundColor: AppDesign.accent.teal,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: AppDesign.text.primary,
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
    color: AppDesign.text.secondary,
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
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    borderLeftWidth: 5,
    padding: 18,
    gap: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avName: {
    fontSize: 14,
    fontWeight: "800",
    color: AppDesign.text.primary,
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
    color: AppDesign.text.secondary,
    lineHeight: 19,
    marginTop: -2,
  },
  avEcgBlock: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
  },
  avEcgLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: AppDesign.text.muted,
  },
  avEcgText: {
    fontSize: 13,
    fontWeight: "500",
    color: AppDesign.text.primary,
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
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  causesTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: AppDesign.text.primary,
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
    color: AppDesign.text.muted,
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
    backgroundColor: AppDesign.accent.teal,
    flexShrink: 0,
  },
  causeItemText: {
    fontSize: 13,
    fontWeight: "500",
    color: AppDesign.text.secondary,
    lineHeight: 19,
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
