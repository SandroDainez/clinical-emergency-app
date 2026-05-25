import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEATURE_ITEMS: { title: string; body: string; icon: string; accent: string }[] = [
  {
    icon: "🗺️",
    accent: "#22d3ee",
    title: "Protocolos guiados",
    body: "Passo a passo baseado em estado clínico, decisões e checklists onde faz sentido.",
  },
  {
    icon: "🎙️",
    accent: "#4ade80",
    title: "Voz no ACLS",
    body: "Comandos de voz durante a reanimação — mãos livres quando mais importa.",
  },
  {
    icon: "⏱️",
    accent: "#fbbf24",
    title: "Registro e tempo",
    body: "Ações, tempos e fases registradas para revisar ou exportar conforme seu serviço.",
  },
  {
    icon: "⚖️",
    accent: "#f472b6",
    title: "Calculadoras clínicas",
    body: "Vasoativos, VM, sepse e mais — doses e taxas com o peso e o cenário do paciente.",
  },
  {
    icon: "📋",
    accent: "#a78bfa",
    title: "Referência rápida",
    body: "ISR, EAP, CAD/EHH, anafilaxia: roteiros densos e baseados em evidências.",
  },
  {
    icon: "📊",
    accent: "#fb923c",
    title: "Histórico de sessões",
    body: "Acesse sessões anteriores para revisão e aprendizado contínuo.",
  },
];

const STEPS: { n: string; title: string; text: string }[] = [
  {
    n: "1",
    title: "Abra um módulo",
    text: "Selecione o protocolo correto para o cenário — ACLS, Sepse, AVC, ISR, EAP, VM e mais.",
  },
  {
    n: "2",
    title: "Siga o fluxo clínico",
    text: "Responda às etapas, use voz ou toque — cada decisão guia a próxima conduta.",
  },
  {
    n: "3",
    title: "Registre e exporte",
    text: "Horários, ações e fases ficam documentados. Exporte ao final para o prontuário.",
  },
];

const GUIDELINES = ["AHA 2020", "ESC 2021", "ADA 2022", "WAO 2021", "ARDSnet", "ACEP"];

export default function PresentationScreen() {
  const router = useRouter();

  function enterApp() {
    router.replace("/(tabs)" as const);
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={s.shell}>

          {/* ── Hero ───────────────────────────────────────────── */}
          <View style={s.hero}>
            <View style={s.heroTopRow}>
              <View style={s.appBadge}>
                <Text style={s.appBadgeText}>EMERGÊNCIA CLÍNICA</Text>
              </View>
              <View style={s.guidelinesBadge}>
                <Text style={s.guidelinesText}>✓ Evidência atualizada</Text>
              </View>
            </View>

            <Text style={s.heroTitle}>Apoio à decisão{"\n"}na emergência e UTI.</Text>
            <Text style={s.heroSubtitle}>
              Uma app que estrutura o atendimento — ACLS, sepse, via aérea, ventilação, metabólico e alergia —
              com protocolos baseados nas principais diretrizes internacionais.
            </Text>

            <View style={s.guidelinesRow}>
              {GUIDELINES.map((g) => (
                <View key={g} style={s.guidelineChip}>
                  <Text style={s.guidelineChipText}>{g}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [s.ctaPrimary, pressed && s.ctaPressed]}
              onPress={enterApp}>
              <Text style={s.ctaPrimaryText}>Acessar protocolos</Text>
              <Text style={s.ctaPrimaryHint}>→</Text>
            </Pressable>
          </View>

          {/* ── Funcionalidades ─────────────────────────────────── */}
          <View style={s.section}>
            <Text style={s.sectionEyebrow}>FUNCIONALIDADES</Text>
            <Text style={s.sectionTitle}>O que você encontra aqui</Text>
          </View>
          <View style={s.featureGrid}>
            {FEATURE_ITEMS.map((item) => (
              <View key={item.title} style={s.featureItem}>
                <View style={[s.featureIconBox, { backgroundColor: item.accent + "22" }]}>
                  <Text style={s.featureIcon}>{item.icon}</Text>
                </View>
                <Text style={[s.featureTitle, { color: item.accent }]}>{item.title}</Text>
                <Text style={s.featureBody}>{item.body}</Text>
              </View>
            ))}
          </View>

          {/* ── Para quem ───────────────────────────────────────── */}
          <View style={s.audienceCard}>
            <Text style={s.cardEyebrow}>PARA QUEM É</Text>
            <Text style={s.cardTitle}>Equipes de urgência, observação e UTI</Text>
            <View style={s.audienceLines}>
              <Text style={s.audienceLine}>• Médicos e internos que precisam de um guia claro em cenários críticos.</Text>
              <Text style={s.audienceLine}>• Enfermeiros em contextos onde o app for usado conforme regras locais.</Text>
              <Text style={s.audienceLine}>• Simulação e debriefing com registro de sessão ativo.</Text>
            </View>
          </View>

          {/* ── Como começar ────────────────────────────────────── */}
          <View style={s.stepsCard}>
            <Text style={s.cardEyebrow}>COMO COMEÇAR</Text>
            {STEPS.map((step) => (
              <View key={step.n} style={s.stepRow}>
                <View style={s.stepBadge}>
                  <Text style={s.stepBadgeText}>{step.n}</Text>
                </View>
                <View style={s.stepCopy}>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepText}>{step.text}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── CTA bottom ──────────────────────────────────────── */}
          <Pressable style={({ pressed }) => [s.ctaBottom, pressed && { opacity: 0.9 }]} onPress={enterApp}>
            <Text style={s.ctaBottomText}>Começar agora</Text>
            <Text style={s.ctaBottomHint}>Abre os protocolos clínicos</Text>
          </Pressable>

          <Text style={s.footerNote}>
            Ferramenta de apoio à decisão. Não substitui prescrição, bula nem protocolo institucional.
            Valide sempre com as normas do seu serviço.
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0f1a" },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 48,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  shell: { gap: 16 },

  // ── Hero ───────────────────────────────────────────────────
  hero: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  appBadge: {
    backgroundColor: "#0e7490",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  appBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#ffffff",
  },
  guidelinesBadge: {
    backgroundColor: "#052e16",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#166534",
  },
  guidelinesText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#4ade80",
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
    fontWeight: "500",
  },
  guidelinesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  guidelineChip: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  guidelineChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.3,
  },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0e7490",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: 2,
    shadowColor: "#0e7490",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaPressed: { opacity: 0.88 },
  ctaPrimaryText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  ctaPrimaryHint: { color: "#a5f3fc", fontSize: 18, fontWeight: "700" },

  // ── Section header ─────────────────────────────────────────
  section: { gap: 3, paddingHorizontal: 2 },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0e7490",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.3,
  },

  // ── Feature grid ───────────────────────────────────────────
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureItem: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 8,
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: { fontSize: 20 },
  featureTitle: { fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },
  featureBody: { fontSize: 12, lineHeight: 18, color: "#64748b" },

  // ── Audience card ──────────────────────────────────────────
  audienceCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    borderLeftWidth: 4,
    borderLeftColor: "#22d3ee",
    gap: 10,
  },
  audienceLines: { gap: 6 },
  audienceLine: { fontSize: 14, lineHeight: 21, color: "#94a3b8" },

  // ── Steps card ─────────────────────────────────────────────
  stepsCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 16,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0e7490",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.3,
  },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#0e7490",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepBadgeText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  stepCopy: { flex: 1, gap: 3 },
  stepTitle: { fontSize: 15, fontWeight: "800", color: "#f1f5f9" },
  stepText: { fontSize: 13, lineHeight: 20, color: "#64748b" },

  // ── Bottom CTA ─────────────────────────────────────────────
  ctaBottom: {
    alignSelf: "stretch",
    backgroundColor: "#0e7490",
    borderRadius: 999,
    paddingVertical: 17,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 3,
    shadowColor: "#0e7490",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  ctaBottomText: { color: "#ffffff", fontSize: 17, fontWeight: "800" },
  ctaBottomHint: { color: "#a5f3fc", fontSize: 12, fontWeight: "600" },

  // ── Footer ─────────────────────────────────────────────────
  footerNote: {
    fontSize: 11,
    lineHeight: 17,
    color: "#334155",
    textAlign: "center",
    paddingHorizontal: 8,
    fontWeight: "500",
  },
});
