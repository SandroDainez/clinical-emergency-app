import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LanguageSelector from "./language-selector";
import { tr as trBase } from "../lib/i18n";
import { useLanguage } from "../lib/language-context";

type Props = { onEnter: () => void };

/** Números da vitrine — conferidos contra constants/module-groups.ts. */
const STATS: { value: string; label: string }[] = [
  { value: "22", label: "módulos clínicos" },
  { value: "15", label: "calculadoras e escores" },
  { value: "PT / ES", label: "português e espanhol" },
];

/** O que o app entrega, por área. Espelha os grupos reais do hub. */
const AREAS: { icon: string; title: string; text: string }[] = [
  {
    icon: "🫀",
    title: "Reanimação (PCR/ACLS)",
    text: "Conduzido por voz e cronômetro, ritmos de parada, farmacologia, bradi e taquiarritmias, Hs e Ts e cuidados pós-PCR.",
  },
  {
    icon: "💧",
    title: "Choque & hemodinâmica",
    text: "Sepse com bundle da 1ª hora, diagnóstico diferencial do choque, drogas vasoativas e correções eletrolíticas.",
  },
  {
    icon: "🫁",
    title: "Via aérea & ventilação",
    text: "Intubação em sequência rápida, ventilação mecânica protetora, sedoanalgesia/BNM e edema agudo de pulmão.",
  },
  {
    icon: "🚑",
    title: "Politrauma & emergências",
    text: "ATLS, TCE, crises convulsivas, intoxicações exógenas, insuficiência respiratória e abdome agudo.",
  },
  {
    icon: "🧠",
    title: "Neuro, cardio e metabólico",
    text: "AVC com janela de reperfusão, síndromes coronarianas, TEP, CAD/EHH, anafilaxia e pré-eclâmpsia/eclâmpsia.",
  },
  {
    icon: "🧮",
    title: "Calculadoras & escores",
    text: "Peso predito, TFG, ânion gap, osmolalidade, Glasgow, qSOFA, SOFA, Wells, CURB-65, HEART, NIHSS, RASS, APACHE II, SAPS 3 e dose de antibiótico por função renal.",
  },
];

/** Diferenciais — o "por que usar". */
const REASONS: string[] = [
  "Feito por médico intensivista e anestesiologista, para quem está no plantão",
  "Cada conduta com a fonte da literatura à vista (AHA, SSC, ATLS, ACOG e outras)",
  "Doses calculadas por peso e altura — sem conta de cabeça no meio da emergência",
  "Registro do caso e debrief automático com tempos, doses e desvios",
  "Português e espanhol, incluindo o áudio e os comandos de voz",
];

/** Como usar — três passos, na ordem em que o app é usado à beira-leito. */
const STEPS: { n: string; title: string; text: string }[] = [
  {
    n: "1",
    title: "Escolha o módulo",
    text: "O hub agrupa os módulos por área. Cada card abre o guia já no início do fluxo.",
  },
  {
    n: "2",
    title: "Responda ao que o app pergunta",
    text: "O guia avança por perguntas objetivas e mostra a conduta do passo — com dose, tempo e alvo. Informe peso e altura quando pedido: as doses são calculadas.",
  },
  {
    n: "3",
    title: "Registre e revise",
    text: "As ações ficam no registro clínico do caso. Ao final, o debrief resume tempos, doses e desvios para discussão da equipe.",
  },
];

export default function IntroLanding({ onEnter }: Props) {
  // `locale` vem do render e é passado a cada tr(): evita que o minificador
  // congele chamadas tr("literal") na build (bug já visto no app de PCR — o
  // seletor trocava, o React re-renderizava, mas o texto ficava preso em PT).
  const { locale } = useLanguage();
  const tr = (pt: string) => trBase(pt, locale);

  const { width } = useWindowDimensions();
  const isWide = width >= 860;
  const cardBasis = isWide ? "48%" : "100%";

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.page}>
        {/* ── Barra de navegação ─────────────────────────────────────────── */}
        <View style={s.navOuter}>
          <View style={s.navInner}>
            <View style={s.brand}>
              <View style={s.brandMark}>
                <Text style={s.brandMarkText}>🩺</Text>
              </View>
              <Text style={s.brandName}>Clinical Emergency Suite</Text>
            </View>
            <View style={s.navRight}>
              <LanguageSelector compact />
              <Pressable
                onPress={onEnter}
                style={({ pressed }) => [s.navCta, pressed && s.pressed]}>
                <Text style={s.navCtaText}>{tr("Entrar")}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <View style={s.heroOuter}>
          <View style={[s.section, s.heroInner]}>
            <View style={s.badge}>
              <Text style={s.badgeText}>{tr("Apoio à decisão clínica na emergência e na UTI")}</Text>
            </View>
            <Text style={[s.heroTitle, isWide && s.heroTitleWide]}>
              {tr("A conduta certa, no tempo certo")}
            </Text>
            <Text style={[s.heroSubtitle, isWide && s.heroSubtitleWide]}>
              {tr("Guias interativos passo a passo, calculadoras, escores de gravidade e doses calculadas por peso — sempre com a fonte da literatura à vista.")}
            </Text>
            <Pressable
              onPress={onEnter}
              style={({ pressed }) => [s.heroCta, pressed && s.pressed]}>
              <Text style={s.heroCtaText}>{tr("Começar agora")}  →</Text>
            </Pressable>

            <View style={[s.statsRow, !isWide && s.statsRowNarrow]}>
              {STATS.map((st) => (
                <View key={st.label} style={s.statCard}>
                  <Text style={s.statValue}>{st.value}</Text>
                  <Text style={s.statLabel}>{tr(st.label)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Funcionalidades ────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {tr("Tudo o que a emergência exige")}
            <Text style={s.sectionTitleAccent}>{tr(", em um só lugar")}</Text>
          </Text>
          <Text style={s.sectionLead}>
            {tr("Vinte e dois módulos clínicos organizados por área, do ACLS ao abdome agudo, mais seis telas de referência do ACLS.")}
          </Text>
          <View style={s.cardGrid}>
            {AREAS.map((f) => (
              <View key={f.title} style={[s.featureCard, { flexBasis: cardBasis }]}>
                <View style={s.featureIconTile}>
                  <Text style={s.featureIcon}>{f.icon}</Text>
                </View>
                <Text style={s.featureTitle}>{tr(f.title)}</Text>
                <Text style={s.featureText}>{tr(f.text)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Por que usar ───────────────────────────────────────────────── */}
        <View style={s.bandSubtle}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              {tr("Por que usar o")}
              <Text style={s.sectionTitleAccent}> Clinical Emergency Suite?</Text>
            </Text>
            <Text style={s.sectionLead}>
              {tr("Feito para o plantão: quando a conduta precisa sair em segundos e a memória não pode ser a única referência. O app conduz o raciocínio, calcula as doses e mantém o registro do caso — sem tirar a decisão de quem está à beira do leito.")}
            </Text>
            <View style={s.reasonList}>
              {REASONS.map((r) => (
                <View key={r} style={s.reasonRow}>
                  <View style={s.checkDot}>
                    <Text style={s.checkDotText}>✓</Text>
                  </View>
                  <Text style={s.reasonText}>{tr(r)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Como usar ──────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {tr("Como usar")}
            <Text style={s.sectionTitleAccent}>{tr(" em três passos")}</Text>
          </Text>
          <View style={[s.cardGrid, s.stepGrid]}>
            {STEPS.map((st) => (
              <View key={st.n} style={[s.stepCard, { flexBasis: isWide ? "31%" : "100%" }]}>
                <View style={s.stepBadge}>
                  <Text style={s.stepBadgeText}>{st.n}</Text>
                </View>
                <Text style={s.stepTitle}>{tr(st.title)}</Text>
                <Text style={s.stepText}>{tr(st.text)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Faixa de chamada ───────────────────────────────────────────── */}
        <View style={s.ctaBand}>
          <View style={s.section}>
            <Text style={s.ctaBandTitle}>{tr("Pronto para começar?")}</Text>
            <Text style={s.ctaBandText}>
              {tr("Abra o hub e tenha o guia do próximo caso conduzido do começo ao fim.")}
            </Text>
            <Pressable
              onPress={onEnter}
              style={({ pressed }) => [s.ctaBandButton, pressed && s.pressed]}>
              <Text style={s.ctaBandButtonText}>{tr("Entrar na plataforma")}  →</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Aviso de segurança + rodapé ────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.principleCard}>
            <Text style={s.principleTitle}>⚠️ {tr("Estabilização primeiro")}</Text>
            <Text style={s.principleText}>
              {tr("Todo módulo prioriza a estabilização (ABCDE) antes do guia específico. Este é um material de referência de uso privado — não é protocolo institucional e não substitui o julgamento clínico. A decisão final é sempre do médico que assiste o paciente. Destinado a profissionais de saúde.")}
            </Text>
          </View>
          <Text style={s.footer}>Dr. Sandro Rogério Dainez · CRM 76907 · Santos/SP</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MAX = 1080;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#1a1d23" },
  page: { paddingBottom: 32 },
  pressed: { opacity: 0.88 },

  section: { width: "100%", maxWidth: MAX, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 34, gap: 14 },

  // Navegação
  navOuter: { borderBottomWidth: 1, borderBottomColor: "rgba(148,163,184,0.16)", backgroundColor: "rgba(10,15,29,0.96)" },
  navInner: {
    width: "100%", maxWidth: MAX, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(92,141,255,0.16)", borderWidth: 1, borderColor: "rgba(92,141,255,0.45)",
  },
  brandMarkText: { fontSize: 19 },
  brandName: { fontSize: 15, fontWeight: "900", color: "#f5f7fb", letterSpacing: -0.2 },
  navRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  navCta: { backgroundColor: "#1e6fd9", borderRadius: 999, paddingHorizontal: 20, paddingVertical: 9 },
  navCtaText: { fontSize: 13.5, fontWeight: "900", color: "#ffffff" },

  // Hero
  heroOuter: { backgroundColor: "rgba(92,141,255,0.06)", borderBottomWidth: 1, borderBottomColor: "rgba(148,163,184,0.14)" },
  heroInner: { alignItems: "center", gap: 16, paddingTop: 44, paddingBottom: 40 },
  badge: {
    borderRadius: 999, borderWidth: 1, borderColor: "rgba(92,141,255,0.45)",
    backgroundColor: "rgba(92,141,255,0.12)", paddingHorizontal: 14, paddingVertical: 7,
  },
  badgeText: { fontSize: 11.5, fontWeight: "800", color: "#c7d8ff", textAlign: "center" },
  heroTitle: { fontSize: 34, lineHeight: 40, fontWeight: "900", color: "#f5f7fb", textAlign: "center", letterSpacing: -0.8 },
  heroTitleWide: { fontSize: 52, lineHeight: 58 },
  heroSubtitle: { fontSize: 15, lineHeight: 23, color: "#a9b6c9", textAlign: "center", maxWidth: 660 },
  heroSubtitleWide: { fontSize: 17, lineHeight: 26 },
  heroCta: {
    marginTop: 6, backgroundColor: "#1e6fd9", borderRadius: 999, paddingHorizontal: 30, paddingVertical: 15,
    shadowColor: "#1e6fd9", shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  heroCtaText: { fontSize: 15.5, fontWeight: "900", color: "#ffffff", letterSpacing: 0.2 },

  statsRow: { flexDirection: "row", gap: 12, marginTop: 22, width: "100%", maxWidth: 720 },
  statsRowNarrow: { flexWrap: "wrap" },
  statCard: {
    flex: 1, minWidth: 96, backgroundColor: "rgba(92,141,255,0.09)", borderRadius: 16, borderWidth: 1,
    borderColor: "rgba(92,141,255,0.3)", paddingVertical: 16, paddingHorizontal: 10, gap: 3, alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "900", color: "#c7d8ff", letterSpacing: -0.6 },
  statLabel: { fontSize: 11, lineHeight: 15, color: "#8fa3c4", textAlign: "center", fontWeight: "600" },

  // Seções
  sectionTitle: { fontSize: 26, lineHeight: 33, fontWeight: "900", color: "#f5f7fb", textAlign: "center", letterSpacing: -0.5 },
  sectionTitleAccent: { color: "#7ea6ff" },
  sectionLead: { fontSize: 14.5, lineHeight: 22, color: "#a9b6c9", textAlign: "center", maxWidth: 720, alignSelf: "center" },

  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 8 },
  stepGrid: { alignItems: "stretch" },

  featureCard: {
    flexGrow: 1, backgroundColor: "rgba(15,20,34,0.9)", borderRadius: 18, borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)", padding: 18, gap: 8,
  },
  featureIconTile: {
    width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(92,141,255,0.14)", borderWidth: 1, borderColor: "rgba(92,141,255,0.32)",
  },
  featureIcon: { fontSize: 21 },
  featureTitle: { fontSize: 16, fontWeight: "800", color: "#f5f7fb" },
  featureText: { fontSize: 13, lineHeight: 19.5, color: "#91a0b5" },

  // Por que usar
  bandSubtle: { backgroundColor: "rgba(15,20,34,0.72)", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(148,163,184,0.14)" },
  reasonList: { gap: 12, marginTop: 8, alignSelf: "center", maxWidth: 720, width: "100%" },
  reasonRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  checkDot: {
    width: 24, height: 24, borderRadius: 999, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(92,141,255,0.18)", borderWidth: 1, borderColor: "#4d9aff", marginTop: 1,
  },
  checkDotText: { fontSize: 12, fontWeight: "900", color: "#c7d8ff" },
  reasonText: { flex: 1, fontSize: 14, lineHeight: 21, color: "#c8d2e1" },

  // Passos
  stepCard: {
    flexGrow: 1, backgroundColor: "rgba(15,20,34,0.9)", borderRadius: 18, borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)", padding: 18, gap: 8,
  },
  stepBadge: {
    width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center",
    backgroundColor: "#1e6fd9",
  },
  stepBadgeText: { fontSize: 15, fontWeight: "900", color: "#ffffff" },
  stepTitle: { fontSize: 15.5, fontWeight: "800", color: "#f5f7fb" },
  stepText: { fontSize: 13, lineHeight: 19.5, color: "#91a0b5" },

  // Faixa de chamada
  ctaBand: { backgroundColor: "#1e6fd9" },
  ctaBandTitle: { fontSize: 27, lineHeight: 34, fontWeight: "900", color: "#ffffff", textAlign: "center", letterSpacing: -0.5 },
  ctaBandText: { fontSize: 15, lineHeight: 22, color: "rgba(255,255,255,0.92)", textAlign: "center", maxWidth: 620, alignSelf: "center" },
  ctaBandButton: {
    alignSelf: "center", marginTop: 8, backgroundColor: "#1a1d23", borderRadius: 999,
    paddingHorizontal: 30, paddingVertical: 15,
  },
  ctaBandButtonText: { fontSize: 15.5, fontWeight: "900", color: "#ffffff" },

  // Segurança e rodapé
  principleCard: {
    backgroundColor: "rgba(127,29,29,0.18)", borderRadius: 18, borderWidth: 1.5,
    borderColor: "#7f1d1d", padding: 16, gap: 6, maxWidth: 760, alignSelf: "center", width: "100%",
  },
  principleTitle: { fontSize: 14, fontWeight: "900", color: "#fecaca" },
  principleText: { fontSize: 12.5, lineHeight: 19, color: "#fca5a5" },
  footer: { fontSize: 11.5, color: "#94a3b8", textAlign: "center", marginTop: 10 },
});
