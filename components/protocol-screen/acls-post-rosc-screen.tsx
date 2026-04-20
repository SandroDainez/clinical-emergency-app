import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppDesign } from "../../constants/app-design";
import { ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type DomainItem = {
  label: string;
  value: string;
  alert?: boolean;
};

type Domain = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  items: DomainItem[];
  note?: string;
};

// ── Dados clínicos ─────────────────────────────────────────────────────────────

const DOMAINS: Domain[] = [
  {
    id: "estabilizacao",
    icon: "⚡",
    title: "Estabilização Inicial",
    subtitle: "Primeiros minutos após ROSC confirmado",
    accentColor: "#7c2d12",
    accentBg: "#fff7ed",
    accentBorder: "#fed7aa",
    items: [
      { label: "Confirmar ROSC", value: "Pulso central palpável + ritmo organizado no monitor" },
      { label: "Via aérea", value: "Confirmar posição do tubo (capnografia contínua). Intubar se ainda não realizado" },
      { label: "ECG 12 derivações", value: "Imediato após ROSC — pesquisar IAMCSST ou equivalente" },
      { label: "IAMCSST identificado?", value: "Acionar hemodinâmica urgente — intervenção coronária é prioridade mesmo em comatoso", alert: true },
      { label: "Acesso venoso/IO", value: "Manter dois acessos calibrosos. Trocar IO por acesso venoso assim que possível" },
      { label: "Monitorização", value: "ECG contínuo, SpO₂, ETCO₂, PA invasiva se disponível" },
    ],
    note: "Evite mover o paciente prematuramente. Estabilize hemodinâmica e ventilação antes do transporte.",
  },
  {
    id: "ventilacao",
    icon: "💨",
    title: "Ventilação e Oxigenação",
    subtitle: "Metas: normoventilação e oxigenação controlada",
    accentColor: "#0369a1",
    accentBg: "#f0f9ff",
    accentBorder: "#bae6fd",
    items: [
      { label: "SpO₂ alvo", value: "92–98% — titular FiO₂ para atingir a meta. Evitar hiperoxia", alert: true },
      { label: "PaCO₂ alvo", value: "35–45 mmHg (normocarbia) — hipocapnia causa vasoconstrição cerebral", alert: true },
      { label: "Volume corrente (VT)", value: "6–8 mL/kg de peso ideal" },
      { label: "FR inicial", value: "10–12 rpm — ajustar pela capnografia ou gasometria" },
      { label: "PEEP", value: "5–8 cmH₂O como ponto de partida" },
      { label: "Capnografia (ETCO₂)", value: "Confirmar intubação + guia de ventilação. ETCO₂ > 40 mmHg = hipoventilação" },
    ],
    note: "Hiperventilação é uma armadilha frequente no pós-PCR — reduz PaCO₂, provoca hipocapnia e piora o prognóstico neurológico.",
  },
  {
    id: "hemodinamica",
    icon: "🫀",
    title: "Hemodinâmica",
    subtitle: "Suporte circulatório e perfusão de órgãos",
    accentColor: "#dc2626",
    accentBg: "#fff1f2",
    accentBorder: "#fecdd3",
    items: [
      { label: "PAM alvo", value: "≥ 65 mmHg (considerar ≥ 80 mmHg em contexto de choque pós-PCR)", alert: true },
      { label: "PAS mínima", value: "≥ 90 mmHg — hipotensão pós-ROSC é preditor independente de morte", alert: true },
      { label: "Vasopressor de 1ª escolha", value: "Noradrenalina 0,1–1 mcg/kg/min IV — titular pela PAM" },
      { label: "Inotrópico (baixo DC)", value: "Dobutamina 2–20 mcg/kg/min se IC baixo com PAM adequada" },
      { label: "Reposição volêmica", value: "SF 250–500 mL se hipovolemia evidente. Evitar sobrecarga hídrica" },
      { label: "Glicemia", value: "Alvo: 140–180 mg/dL. Hipoglicemia é tão prejudicial quanto hiperglicemia", alert: true },
    ],
    note: "Ecocardiografia à beira leito (POCUS) auxilia na avaliação de função ventricular, tamponamento e volemia.",
  },
  {
    id: "neurologia",
    icon: "🧠",
    title: "Avaliação Neurológica",
    subtitle: "Proteção cerebral e estratificação prognóstica",
    accentColor: "#4c1d95",
    accentBg: "#f5f3ff",
    accentBorder: "#c4b5fd",
    items: [
      { label: "Glasgow inicial", value: "Registrar assim que possível pós-ROSC. Sedação prévia interfere na avaliação" },
      { label: "Pupilas", value: "Fotorreatividade bilateral. Midríase fixa pode ser transitória logo após PCR" },
      { label: "Controle de temperatura", value: "Prevenir febre (T > 37,7°C) — monitorar temperatura central continuamente", alert: true },
      { label: "TTM 32–36°C", value: "Considerar em comatosos por 24 h se benefício esperado. AHA 2023: prevenir febre é o mínimo aceitável" },
      { label: "Status epiléptico", value: "Suspeitar em movimentos faciais subtis ou alteração pupilar sem causa — EEG contínuo se disponível" },
      { label: "Prognóstico neurológico", value: "Não concluir antes de 72 h após normotermia — exames precoces são pouco confiáveis", alert: true },
    ],
    note: "Sedação excessiva impede a avaliação neurológica. Use a menor dose eficaz e faça janelas de sedação conforme protocolo da UTI.",
  },
];

const QUICK_GOALS = [
  { label: "SpO₂", value: "92–98%", color: "#0369a1" },
  { label: "PaCO₂", value: "35–45 mmHg", color: "#0369a1" },
  { label: "PAM", value: "≥ 65 mmHg", color: "#dc2626" },
  { label: "Glicemia", value: "140–180 mg/dL", color: "#d97706" },
  { label: "Temperatura", value: "≤ 37,7°C", color: "#7c3aed" },
];

const POST_ROSC_SECTIONS = [
  { id: "overview", icon: "🧭", label: "Metas", hint: "Primeiros minutos após ROSC", step: "1", accent: "#0f766e" },
  { id: "estabilizacao", icon: "⚡", label: "Estabilização", hint: "Confirmar ROSC e organizar suporte", step: "2", accent: "#7c2d12" },
  { id: "ventilacao", icon: "💨", label: "Ventilação", hint: "Oxigenação e normocarbia", step: "3", accent: "#0369a1" },
  { id: "hemodinamica", icon: "🫀", label: "Hemodinâmica", hint: "Perfusão e vasopressores", step: "4", accent: "#dc2626" },
  { id: "neurologia", icon: "🧠", label: "Neurologia", hint: "Proteção cerebral e prognóstico", step: "5", accent: "#4c1d95" },
] as const;

// ── Componentes ───────────────────────────────────────────────────────────────

function DomainCard({ domain }: { domain: Domain }) {
  return (
    <View style={[dc.card, { borderTopColor: domain.accentColor }]}>
      {/* Cabeçalho */}
      <View style={[dc.header, { backgroundColor: domain.accentBg, borderBottomColor: domain.accentBorder }]}>
        <Text style={dc.icon}>{domain.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[dc.title, { color: domain.accentColor }]}>{domain.title}</Text>
          <Text style={[dc.subtitle, { color: domain.accentColor }]}>{domain.subtitle}</Text>
        </View>
      </View>

      {/* Itens */}
      <View style={dc.itemsBlock}>
        {domain.items.map((item) => (
          <View
            key={item.label}
            style={[
              dc.itemRow,
              item.alert && { backgroundColor: domain.accentBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginHorizontal: -2 },
            ]}>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={dc.itemLabelRow}>
                {item.alert ? (
                  <View style={[dc.alertDot, { backgroundColor: domain.accentColor }]} />
                ) : null}
                <Text style={[dc.itemLabel, item.alert && { color: domain.accentColor }]}>
                  {item.label}
                </Text>
              </View>
              <Text style={[dc.itemValue, item.alert && { fontWeight: "700", color: AppDesign.text.primary }]}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Nota */}
      {domain.note ? (
        <View style={[dc.noteBlock, { borderLeftColor: domain.accentColor }]}>
          <Text style={dc.noteText}>{domain.note}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsPostRoscScreen() {
  const [activeSection, setActiveSection] = useState<(typeof POST_ROSC_SECTIONS)[number]["id"]>("overview");

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
          eyebrow="ACLS · Referência"
          title="Pós-PCR organizado por metas e domínios críticos"
          subtitle="Os cuidados pós-ROSC foram mantidos e separados por estabilização, ventilação, hemodinâmica e neurologia."
          badgeText="AHA ACLS 2020 · TTM focused update 2023"
          metrics={[
            { label: "SpO₂ alvo", value: "92–98%", accent: "#0369a1" },
            { label: "PAM alvo", value: "≥ 65 mmHg", accent: "#dc2626" },
            { label: "Temperatura", value: "Evitar febre", accent: "#7c3aed" },
          ]}
          progressLabel={POST_ROSC_SECTIONS.find((section) => section.id === activeSection)?.label ?? "Metas"}
          stepTitle={POST_ROSC_SECTIONS.find((section) => section.id === activeSection)?.hint ?? "Primeiras horas determinam sobrevida e desfecho neurológico"}
          hint="Após ROSC, estabilizar ventilação e perfusão antes do transporte e comunicar dados essenciais à UTI."
          compactMobile
        />
      }
      items={POST_ROSC_SECTIONS as unknown as { id: string; icon?: string; label: string; hint?: string; step?: string; accent?: string }[]}
      activeId={activeSection}
      onSelect={(id) => setActiveSection(String(id) as (typeof POST_ROSC_SECTIONS)[number]["id"])}
      sidebarEyebrow="Navegação ACLS"
      sidebarTitle="Cuidados pós-PCR">
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {activeSection === "overview" ? (
          <>
            <View style={s.introCard}>
              <Text style={s.introEyebrow}>ACLS · Referência</Text>
              <Text style={s.introTitle}>Cuidados Pós-PCR</Text>
              <Text style={s.introBody}>
                Após o ROSC, a conduta sistemática nos primeiros minutos e horas é determinante para
                a sobrevida com boa função neurológica. Estabilize, monitore metas e transfira para UTI.
              </Text>
            </View>

            <View style={s.goalsCard}>
              <Text style={s.goalsTitle}>Metas imediatas</Text>
              <View style={s.goalsRow}>
                {QUICK_GOALS.map((goal) => (
                  <View key={goal.label} style={[s.goalItem, { borderColor: goal.color + "44" }]}>
                    <Text style={[s.goalLabel, { color: goal.color }]}>{goal.label}</Text>
                    <Text style={[s.goalValue, { color: goal.color }]}>{goal.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}

        {DOMAINS.filter((domain) => activeSection === "overview" || domain.id === activeSection).map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}

        <View style={s.footerCard}>
          <Text style={s.footerTitle}>Destino: UTI o mais rápido possível</Text>
          <Text style={s.footerBody}>
            O paciente pós-PCR reanimado com sucesso precisa de monitorização contínua e suporte
            multi-orgânico. Comunique ao intensivista: ritmo da PCR, tempo de colapso, tempo de
            RCP, doses de epinefrina, cardioversões e causa presumida.
          </Text>
          <View style={s.footerRule} />
          <Text style={s.footerSource}>
            Baseado em AHA ACLS 2020 + Focused Update TTM 2023
          </Text>
        </View>
      </ScrollView>
    </ModuleFlowLayout>
  );
}

// ── Estilos do DomainCard ────────────────────────────────────────────────────

const dc = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    borderTopWidth: 4,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  icon: {
    fontSize: 24,
    lineHeight: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
    opacity: 0.8,
  },
  itemsBlock: {
    padding: 18,
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  itemLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: AppDesign.text.muted,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: "500",
    color: AppDesign.text.secondary,
    lineHeight: 19,
  },
  noteBlock: {
    borderLeftWidth: 3,
    marginHorizontal: 14,
    marginBottom: 14,
    paddingLeft: 10,
    paddingVertical: 4,
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
    color: AppDesign.text.secondary,
    lineHeight: 18,
    fontStyle: "italic",
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
    gap: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  introEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: AppDesign.accent.teal,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  introBody: {
    fontSize: 14,
    lineHeight: 21,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },

  // ── Metas ──
  goalsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  goalsTitle: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: AppDesign.text.muted,
  },
  goalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  goalItem: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
    minWidth: 90,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  goalValue: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.1,
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
    fontSize: 13,
    fontWeight: "800",
    color: AppDesign.text.primary,
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: AppDesign.text.secondary,
    fontWeight: "500",
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
