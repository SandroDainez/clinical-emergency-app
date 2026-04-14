import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as DS from "@/constants/app-design";

const AppDesign = DS.AppDesign;

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

                  <Pressable
                    style={({ pressed }) => [styles.ctaPrimary, isCompact && styles.ctaPrimaryCompact, pressed && styles.ctaPressed]}
                    onPress={enterApp}>
                    <Text style={styles.ctaPrimaryText}>Abrir a plataforma</Text>
                    <Text style={styles.ctaPrimaryHint}>Entrar nos módulos e protocolos</Text>
                  </Pressable>
                </View>

                <View style={[styles.heroPanel, isCompact && styles.heroPanelCompact]}>
                  <Text style={styles.heroPanelEyebrow}>Visão geral</Text>
                  <View style={styles.heroStatStack}>
                    <View style={styles.heroStatCard}>
                      <Text style={styles.heroStatValue}>14+</Text>
                      <Text style={styles.heroStatLabel}>módulos clínicos e referências</Text>
                    </View>
                    <View style={styles.heroStatCard}>
                      <Text style={styles.heroStatValue}>1</Text>
                      <Text style={styles.heroStatLabel}>ambiente único de navegação</Text>
                    </View>
                    <View style={styles.heroStatCard}>
                      <Text style={styles.heroStatValue}>Tempo</Text>
                      <Text style={styles.heroStatLabel}>apoio à decisão, registo e revisão</Text>
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
              <View key={item.title} style={[styles.featureItem, isNarrow && styles.featureItemFull]}>
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
    backgroundColor: AppDesign.canvas.tealBackdrop,
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
    gap: 20,
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
    backgroundColor: "rgba(125,183,255,0.18)",
  },
  heroGlowB: {
    position: "absolute",
    left: -48,
    bottom: -100,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(47,125,246,0.16)",
  },
  hero: {
    backgroundColor: AppDesign.accent.limeSoft,
    borderRadius: 40,
    padding: 26,
    gap: 18,
    borderWidth: 1,
    borderColor: "rgba(16,33,40,0.08)",
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
    backgroundColor: "rgba(16,33,40,0.08)",
    borderWidth: 1,
    borderColor: "rgba(16,33,40,0.08)",
  },
  kickerPillText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: AppDesign.accent.teal,
  },
  heroMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(16,33,40,0.74)",
  },
  heroMetaCompact: {
    width: "100%",
  },
  heroSplit: {
    flexDirection: "row",
    gap: 18,
  },
  heroSplitNarrow: {
    flexDirection: "column",
  },
  heroMain: {
    flex: 1.5,
    gap: 14,
  },
  heroPanel: {
    flex: 0.9,
    minWidth: 260,
    backgroundColor: "rgba(248,245,239,0.7)",
    borderRadius: 30,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(16,33,40,0.08)",
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
    color: AppDesign.text.primary,
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
    color: "#21333a",
    fontWeight: "600",
    maxWidth: 720,
  },
  heroSubtitleCompact: {
    fontSize: 15,
    lineHeight: 23,
  },
  ctaPrimary: {
    alignSelf: "flex-start",
    minWidth: 280,
    borderRadius: 999,
    backgroundColor: "#102128",
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
    gap: 2,
  },
  ctaPrimaryCompact: {
    alignSelf: "stretch",
    minWidth: 0,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  ctaPrimaryHint: {
    color: "#8da2aa",
    fontSize: 12,
    fontWeight: "700",
  },
  heroPanelEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: AppDesign.accent.teal,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroStatStack: {
    gap: 10,
  },
  heroStatCard: {
    backgroundColor: "#f8f5ef",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(16,33,40,0.08)",
    gap: 4,
  },
  heroStatValue: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "900",
    color: AppDesign.text.primary,
  },
  heroStatLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: AppDesign.text.secondary,
    fontWeight: "700",
  },
  sectionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#dbe9e2",
    borderWidth: 1,
    borderColor: AppDesign.border.mint,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: AppDesign.accent.teal,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: AppDesign.surface.card,
    borderRadius: 34,
    padding: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 12,
    ...AppDesign.shadow.card,
  },
  infoTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: AppDesign.text.primary,
    letterSpacing: -0.8,
  },
  infoBody: {
    fontSize: 16,
    lineHeight: 25,
    color: AppDesign.text.secondary,
    maxWidth: 900,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionHeading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#edf4f0",
    letterSpacing: -0.8,
  },
  sectionHeadingSub: {
    fontSize: 14,
    color: "rgba(237,244,240,0.72)",
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
    backgroundColor: "rgba(248,245,239,0.97)",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(75,135,217,0.26)",
    gap: 10,
    ...AppDesign.shadow.card,
  },
  featureItemFull: {
    width: "100%",
  },
  featureGlyphWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: AppDesign.accent.limeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  featureGlyph: {
    fontSize: 18,
    color: AppDesign.accent.teal,
    fontWeight: "900",
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: AppDesign.text.primary,
    letterSpacing: -0.3,
  },
  featureBody: {
    fontSize: 14,
    lineHeight: 21,
    color: AppDesign.text.secondary,
  },
  audienceCard: {
    backgroundColor: "#f7f2e8",
    borderRadius: 34,
    padding: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.mint,
    gap: 10,
    ...AppDesign.shadow.hero,
  },
  audienceTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    color: AppDesign.text.primary,
  },
  audienceLine: {
    fontSize: 15,
    lineHeight: 23,
    color: AppDesign.text.secondary,
  },
  stepsCard: {
    backgroundColor: AppDesign.surface.shellMint,
    borderRadius: 34,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(75,135,217,0.24)",
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
    backgroundColor: "#102128",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepBadgeText: {
    color: AppDesign.accent.lime,
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
    color: AppDesign.text.primary,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 22,
    color: AppDesign.text.secondary,
  },
  ctaBottom: {
    backgroundColor: "#102128",
    borderRadius: 34,
    paddingVertical: 20,
    paddingHorizontal: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    color: "#8da2aa",
    fontWeight: "700",
  },
  footerNote: {
    textAlign: "center",
    color: "rgba(237,244,240,0.72)",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 18,
    maxWidth: 820,
    alignSelf: "center",
  },
});
