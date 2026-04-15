import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as DS from "@/constants/app-design";

const AppDesign = DS.AppDesign;
const Hybrid = {
  bg: "#050505",
  panel: "rgba(13,16,24,0.84)",
  panelSoft: "rgba(255,255,255,0.05)",
  panelStrong: "rgba(10,13,20,0.92)",
  border: "rgba(124,145,255,0.18)",
  borderStrong: "rgba(123,176,255,0.34)",
  text: "#f5f7fb",
  muted: "#91a0b5",
  softText: "#c8d2e1",
  accent: "#95bbff",
  accentStrong: "#5c8dff",
  glowA: "rgba(92,141,255,0.26)",
  glowB: "rgba(0,204,255,0.12)",
};

const FEATURE_ITEMS: { title: string; body: string; glyph: string }[] = [
  {
    glyph: "◇",
    title: "Protocolos guiados",
    body: "Passo a passo por estado clínico, com decisões e checklists onde faz sentido.",
  },
  {
    glyph: "◎",
    title: "Voz no ACLS",
    body: "Comandos de voz quando o módulo suporta, para manter o fluxo mais livre durante a reanimação.",
  },
  {
    glyph: "▣",
    title: "Documentação e tempo",
    body: "Registo de ações, fases e tempos para revisão, continuidade e debriefing.",
  },
  {
    glyph: "◆",
    title: "Calculadoras e doses",
    body: "Vasoativos, ventilação e apoio terapêutico com cálculo rápido durante o atendimento.",
  },
  {
    glyph: "◇",
    title: "Referência rápida",
    body: "ISR, EAP, CAD/EHH, anafilaxia e outros roteiros clínicos numa navegação única.",
  },
  {
    glyph: "◎",
    title: "Continuidade do cuidado",
    body: "Apoio para seguir o fluxo, rever ações e manter contexto clínico ao longo do atendimento.",
  },
];

const STEPS: { n: string; title: string; text: string }[] = [
  {
    n: "1",
    title: "Abra a plataforma",
    text: "Entre direto na área principal com acesso a protocolos, módulos rápidos e ferramentas auxiliares.",
  },
  {
    n: "2",
    title: "Escolha o fluxo",
    text: "Navegue por uma grade com mais hierarquia visual, em vez de uma lista branca sem presença.",
  },
  {
    n: "3",
    title: "Conduza o atendimento",
    text: "Siga o passo a passo, documente o que importa e use apoio de voz ou cálculo quando houver.",
  },
];

export default function PresentationScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;
  const isCompact = width < 560;
  const isWide = width >= 1040;
  const useTwoUpCards = width >= 360;

  function enterApp() {
    router.replace("/(tabs)" as const);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isNarrow && styles.scrollContentNarrow]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <View style={[styles.heroFrame, isCompact && styles.heroFrameCompact]}>
            <View style={styles.heroGlowA} pointerEvents="none" />
            <View style={styles.heroGlowB} pointerEvents="none" />
            <View style={[styles.hero, isWide && styles.heroWide, isCompact && styles.heroCompact]}>
              <View style={styles.heroTopline}>
                <View style={styles.kickerPill}>
                  <Text style={styles.kickerPillText}>Clinical Emergency Suite</Text>
                </View>
                <Text style={[styles.heroMeta, isCompact && styles.heroMetaCompact]}>
                  Protocolos, voz, cálculo e documentação clínica
                </Text>
              </View>

              <View style={[styles.heroSplit, isNarrow && styles.heroSplitNarrow]}>
                <View style={styles.heroMain}>
                  <Text style={[styles.heroTitle, isNarrow && styles.heroTitleNarrow, isCompact && styles.heroTitleCompact]}>
                    Apoio clínico para emergência e UTI num só ambiente.
                  </Text>
                  <Text style={[styles.heroSubtitle, isCompact && styles.heroSubtitleCompact]}>
                    O aplicativo reúne protocolos, referências rápidas, cálculo e documentação clínica para ajudar na
                    tomada de decisão durante o atendimento.
                  </Text>

                  <View style={[styles.heroActionBand, isCompact && styles.heroActionBandCompact]}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.ctaPrimary,
                        !isCompact && styles.ctaPrimaryDesktop,
                        isCompact && styles.ctaPrimaryCompact,
                        pressed && styles.ctaPrimaryPressed,
                      ]}
                      onPress={enterApp}>
                      <Text style={styles.ctaPrimaryText}>Abrir a plataforma</Text>
                      <Text style={styles.ctaPrimaryHint}>Entrar nos módulos e protocolos</Text>
                    </Pressable>

                    <View style={[styles.heroInfoStack, isCompact && styles.heroInfoStackCompact]}>
                      <View style={[styles.ctaInfoCard, isCompact && styles.ctaInfoCardCompact]}>
                        <Text style={styles.ctaInfoEyebrow}>Acesso imediato</Text>
                        <Text style={styles.ctaInfoTitle}>Módulos, protocolos e ferramentas no primeiro toque.</Text>
                        <Text style={styles.ctaInfoBody}>
                          Abre direto a área principal da aplicação, sem tela intermediária nem expansão do card.
                        </Text>
                      </View>

                      <View style={[styles.heroPanel, isCompact && styles.heroPanelCompact]}>
                        <Text style={styles.heroPanelEyebrow}>Visão geral</Text>
                        <View style={styles.heroStatStack}>
                          <View style={[styles.heroStatCard, useTwoUpCards && styles.heroStatCardHalf]}>
                            <Text style={styles.heroStatValue}>14+</Text>
                            <Text style={styles.heroStatLabel}>módulos clínicos e referências</Text>
                          </View>
                          <View style={[styles.heroStatCard, useTwoUpCards && styles.heroStatCardHalf]}>
                            <Text style={styles.heroStatValue}>1</Text>
                            <Text style={styles.heroStatLabel}>ambiente único de navegação</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.heroStatCardWide}>
                        <Text style={styles.heroPanelEyebrow}>Tempo</Text>
                        <Text style={styles.heroStatValueText}>Apoio rápido</Text>
                        <Text style={styles.heroStatLabel}>decisão, registo e revisão no mesmo fluxo</Text>
                      </View>
                    </View>
                  </View>
                </View>

              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>O que é</Text>
            </View>
            <Text style={styles.infoTitle}>Uma cockpit clínica para decisões de minutos, não uma página branca com botões.</Text>
            <Text style={styles.infoBody}>
              A aplicação reúne ACLS, sepse, vasoativos, via aérea, ventilação, metabólico, alergia e módulos de consulta
              rápida numa mesma camada visual. O foco é reduzir fricção e organizar o raciocínio clínico.
            </Text>
            <Text style={styles.infoBody}>
              Não substitui prescrição, bula ou protocolo local. Serve como apoio para timing, execução, documentação e
              continuidade do cuidado.
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Como a aplicação ajuda</Text>
            <Text style={styles.sectionHeadingSub}>Apoio prático para condução, cálculo, registo e consulta rápida</Text>
          </View>

          <View style={styles.featureGrid}>
            {FEATURE_ITEMS.map((item) => (
              <View key={item.title} style={[styles.featureItem, !useTwoUpCards && styles.featureItemFull]}>
                <View style={styles.featureGlyphWrap}>
                  <Text style={styles.featureGlyph}>{item.glyph}</Text>
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureBody}>{item.body}</Text>
              </View>
            ))}
          </View>

          <View style={styles.audienceCard}>
            <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Para quem é</Text>
          </View>
            <Text style={styles.audienceTitle}>Equipes de urgência, observação e UTI que precisam de apoio rápido à decisão.</Text>
            <Text style={styles.audienceLine}>Médicos e internos durante atendimento, discussão clínica e revisão de conduta.</Text>
            <Text style={styles.audienceLine}>Times que precisam navegar rápido entre protocolos, doses e referências associadas.</Text>
            <Text style={styles.audienceLine}>Simulação e debriefing quando o contexto institucional permitir esse uso.</Text>
          </View>

          <View style={styles.stepsCard}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>Como começar</Text>
            </View>
            {STEPS.map((step) => (
              <View key={step.n} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{step.n}</Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={({ pressed }) => [styles.ctaBottom, pressed && { opacity: 0.92 }]} onPress={enterApp}>
            <Text style={styles.ctaBottomText}>Entrar agora</Text>
            <Text style={styles.ctaBottomHint}>Abrir módulos, protocolos e ferramentas clínicas</Text>
          </Pressable>

          <Text style={styles.footerNote}>
            Ferramenta de apoio à decisão clínica. Valide sempre com prescrição, doses e normas locais. Uso conforme políticas
            do seu serviço.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Hybrid.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 44,
    maxWidth: 1160,
    alignSelf: "center",
    width: "100%",
  },
  scrollContentNarrow: {
    paddingHorizontal: 14,
  },
  shell: {
    gap: 16,
  },
  heroFrame: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 40,
  },
  heroFrameCompact: {
    borderRadius: 30,
  },
  heroGlowA: {
    position: "absolute",
    right: -64,
    top: -30,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: Hybrid.glowA,
  },
  heroGlowB: {
    position: "absolute",
    left: -48,
    bottom: -100,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: Hybrid.glowB,
  },
  hero: {
    backgroundColor: Hybrid.panel,
    borderRadius: 40,
    padding: 26,
    gap: 18,
    borderWidth: 1,
    borderColor: Hybrid.border,
    ...AppDesign.shadow.hero,
  },
  heroWide: {
    padding: 34,
  },
  heroCompact: {
    padding: 20,
    borderRadius: 30,
    gap: 14,
  },
  heroTopline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  kickerPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: Hybrid.border,
  },
  kickerPillText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: Hybrid.accent,
  },
  heroMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: Hybrid.muted,
  },
  heroMetaCompact: {
    width: "100%",
  },
  heroSplit: {
    flexDirection: "row",
    gap: 18,
    alignItems: "stretch",
  },
  heroSplitNarrow: {
    flexDirection: "column",
  },
  heroMain: {
    flex: 1,
    gap: 14,
  },
  heroPanel: {
    minWidth: 0,
    backgroundColor: Hybrid.panelSoft,
    borderRadius: 26,
    padding: 16,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: Hybrid.border,
    gap: 12,
  },
  heroPanelCompact: {
    minWidth: 0,
    width: "100%",
    borderRadius: 24,
    padding: 16,
  },
  heroTitle: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "900",
    color: Hybrid.text,
    letterSpacing: -1.2,
  },
  heroTitleNarrow: {
    fontSize: 30,
    lineHeight: 34,
  },
  heroTitleCompact: {
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: Hybrid.softText,
    fontWeight: "600",
    maxWidth: 720,
  },
  heroSubtitleCompact: {
    fontSize: 15,
    lineHeight: 23,
  },
  ctaPrimary: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: Hybrid.panelStrong,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: Hybrid.borderStrong,
    shadowColor: Hybrid.accentStrong,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  ctaPrimaryDesktop: {
    width: 260,
    minWidth: 260,
    minHeight: 82,
    justifyContent: "center",
  },
  ctaPrimaryCompact: {
    width: "100%",
    minWidth: 0,
    minHeight: 82,
  },
  ctaPrimaryPressed: {
    opacity: 0.9,
  },
  heroActionBand: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    maxWidth: 860,
  },
  heroActionBandCompact: {
    flexDirection: "column",
  },
  heroInfoStack: {
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
  heroInfoStackCompact: {
    width: "100%",
  },
  ctaInfoCard: {
    minWidth: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Hybrid.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: "center",
    gap: 4,
  },
  ctaInfoCardCompact: {
    borderRadius: 20,
  },
  ctaPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  ctaPrimaryHint: {
    color: Hybrid.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  ctaInfoEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: Hybrid.accent,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  ctaInfoTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    color: Hybrid.text,
  },
  ctaInfoBody: {
    fontSize: 13,
    lineHeight: 19,
    color: Hybrid.muted,
    fontWeight: "700",
  },
  heroPanelEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: Hybrid.accent,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroStatStack: {
    flexDirection: "row",
    gap: 10,
    alignItems: "stretch",
  },
  heroStatCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: Hybrid.border,
    gap: 4,
    flexGrow: 1,
    minWidth: 0,
  },
  heroStatCardHalf: {
    width: "48%",
  },
  heroStatCardWide: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 13,
    paddingBottom: 15,
    borderWidth: 1,
    borderColor: Hybrid.border,
    gap: 4,
  },
  heroStatValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    color: Hybrid.text,
  },
  heroStatValueText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    color: Hybrid.text,
  },
  heroStatLabel: {
    fontSize: 12,
    lineHeight: 17,
    color: Hybrid.muted,
    fontWeight: "700",
  },
  sectionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(149,187,255,0.12)",
    borderWidth: 1,
    borderColor: Hybrid.borderStrong,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: Hybrid.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: Hybrid.panel,
    borderRadius: 34,
    padding: 24,
    borderWidth: 1,
    borderColor: Hybrid.border,
    gap: 12,
    ...AppDesign.shadow.card,
  },
  infoTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: Hybrid.text,
    letterSpacing: -0.8,
  },
  infoBody: {
    fontSize: 16,
    lineHeight: 25,
    color: Hybrid.softText,
    maxWidth: 900,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionHeading: {
    fontSize: 28,
    fontWeight: "900",
    color: Hybrid.text,
    letterSpacing: -0.8,
  },
  sectionHeadingSub: {
    fontSize: 14,
    color: Hybrid.muted,
    fontWeight: "600",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  featureItem: {
    width: "48%",
    maxWidth: "100%",
    flexGrow: 1,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    borderColor: Hybrid.border,
    gap: 8,
    ...AppDesign.shadow.card,
  },
  featureItemFull: {
    width: "100%",
  },
  featureGlyphWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(149,187,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureGlyph: {
    fontSize: 18,
    color: Hybrid.accent,
    fontWeight: "900",
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: Hybrid.text,
    letterSpacing: -0.3,
  },
  featureBody: {
    fontSize: 14,
    lineHeight: 21,
    color: Hybrid.muted,
  },
  audienceCard: {
    backgroundColor: Hybrid.panel,
    borderRadius: 34,
    padding: 24,
    borderWidth: 1,
    borderColor: Hybrid.border,
    gap: 10,
    ...AppDesign.shadow.hero,
  },
  audienceTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    color: Hybrid.text,
  },
  audienceLine: {
    fontSize: 15,
    lineHeight: 23,
    color: Hybrid.softText,
  },
  stepsCard: {
    backgroundColor: Hybrid.panel,
    borderRadius: 34,
    padding: 22,
    borderWidth: 1,
    borderColor: Hybrid.border,
    gap: 16,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepBadge: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(149,187,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepBadgeText: {
    color: Hybrid.accent,
    fontSize: 14,
    fontWeight: "900",
  },
  stepCopy: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Hybrid.text,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 22,
    color: Hybrid.softText,
  },
  ctaBottom: {
    backgroundColor: Hybrid.panelStrong,
    borderRadius: 34,
    paddingVertical: 20,
    paddingHorizontal: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Hybrid.borderStrong,
    ...AppDesign.shadow.hero,
  },
  ctaBottomText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff",
  },
  ctaBottomHint: {
    marginTop: 4,
    fontSize: 13,
    color: Hybrid.muted,
    fontWeight: "700",
  },
  footerNote: {
    textAlign: "center",
    color: "rgba(200,210,225,0.72)",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 18,
    maxWidth: 820,
    alignSelf: "center",
  },
});
