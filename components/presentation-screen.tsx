import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getClinicalModules } from "../clinical-modules";
import * as DS from "@/constants/app-design";
import {
  assertModuleGroupsCoverage,
  getModuleAreaLabel,
  MODULE_GRID_TWO_COL_MIN,
  MODULE_GROUPS,
} from "@/constants/module-area-labels";
import { ModuleGridCard } from "./module-grid-card";
import { openClinicalModule } from "../lib/open-clinical-module";

/** Namespace evita ReferenceError em alguns bundles web com import nomeado. */
const AppDesign = DS.AppDesign;

/** Referência ao símbolo no âmbito do módulo (bundles/HMR antigos). */
void MODULE_GROUPS;

/** Chips alinhados ao hub (áreas clínicas). */
const FILTER_CHIPS: { id: string; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "ACLS", label: "ACLS" },
  { id: "Sepse", label: "Sepse" },
  { id: "Vasoativos", label: "Vasoativos" },
  { id: "ISR", label: "ISR" },
  { id: "EAP", label: "EAP" },
  { id: "CAD / EHH", label: "CAD / EHH" },
  { id: "VM", label: "VM" },
  { id: "Anafilaxia", label: "Anafilaxia" },
];

const FEATURE_ITEMS: { title: string; body: string; glyph: string }[] = [
  {
    glyph: "◇",
    title: "Protocolos guiados",
    body: "Passo a passo por estado clínico, com decisões e checklists onde faz sentido.",
  },
  {
    glyph: "◎",
    title: "Voz no ACLS",
    body: "Comandos de voz quando o módulo suporta — mãos livres durante a reanimação.",
  },
  {
    glyph: "▣",
    title: "Documentação e tempo",
    body: "Registo de ações, tempos e fases para rever depois ou exportar quando configurado.",
  },
  {
    glyph: "◆",
    title: "Calculadoras e doses",
    body: "Vasoativos, VM, sepse e mais — preparo e taxas com o peso e o cenário do doente.",
  },
  {
    glyph: "◇",
    title: "Referência rápida",
    body: "ISR, EAP, CAD/EHH, anafilaxia: roteiros densos em formato de bolso.",
  },
  {
    glyph: "◎",
    title: "Histórico clínico",
    body: "Na área Mais, aceda a sessões anteriores quando a funcionalidade estiver ativa.",
  },
];

const STEPS: { n: string; title: string; text: string }[] = [
  {
    n: "1",
    title: "Entre na aplicação",
    text: "Toque em “Entrar na aplicação” para abrir a área principal (Protocolos, Mais e atalhos).",
  },
  {
    n: "2",
    title: "Escolha um módulo",
    text: "Use a lista abaixo para pré-visualizar ou abra um fluxo diretamente a partir da lista na app.",
  },
  {
    n: "3",
    title: "Siga o fluxo",
    text: "Responda às etapas, use voz ou toque, e registe o que foi feito conforme o seu serviço.",
  },
];

export default function PresentationScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;
  const twoColumns = width >= MODULE_GRID_TWO_COL_MIN;
  const modules = getClinicalModules();

  const [filterId, setFilterId] = useState<string>("all");

  const visibleModules = useMemo(() => {
    if (filterId === "all") return modules;
    const label = FILTER_CHIPS.find((c) => c.id === filterId)?.label;
    if (!label) return modules;
    return modules.filter((m) => getModuleAreaLabel(m.id) === label);
  }, [filterId, modules]);

  useEffect(() => {
    assertModuleGroupsCoverage(modules.map((m) => m.id));
  }, [modules]);

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
          {/* Hero */}
          <View style={styles.heroLime}>
            <Text style={[styles.heroTitle, isNarrow && styles.heroTitleNarrow]}>
              Apoio à decisão na emergência e na UTI.
            </Text>
            <Text style={styles.heroSubtitle}>
              Uma única app para arrancar protocolos, voz (onde existir), registo de tempo e ferramentas de cálculo —
              sempre como auxiliar ao julgamento clínico e às normas da sua instituição.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.ctaPrimary, pressed && styles.ctaPressed]}
              onPress={enterApp}>
              <Text style={styles.ctaPrimaryText}>Entrar na aplicação</Text>
            </Pressable>
          </View>

          {/* O que é */}
          <View style={styles.propCard}>
            <Text style={styles.propEyebrow}>O que é</Text>
            <Text style={styles.propTitle}>Feita para o ritmo do doente grave</Text>
            <Text style={styles.propBody}>
              Esta aplicação junta fluxos assistenciais (ACLS, sepse, vasoativos, via aérea, ventilação, metabólico,
              alergia e outros) numa interface pensada para telemóvel: menos fricção, mais clareza no que fazer a seguir.
            </Text>
            <Text style={styles.propBody}>
              Não substitui prescrição, bula nem protocolo local — ajuda a estruturar o atendimento e a documentar o que
              importa no momento.
            </Text>
          </View>

          {/* Funcionalidades em grelha */}
          <Text style={styles.sectionHeading}>O que pode fazer aqui</Text>
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

          {/* Para quem */}
          <View style={styles.audienceCard}>
            <Text style={styles.audienceEyebrow}>Para quem é</Text>
            <Text style={styles.audienceTitle}>Equipes de urgência, observação e UTI</Text>
            <Text style={styles.audienceLine}>• Médicos e internos em formação que precisam de um fio condutor no caos.</Text>
            <Text style={styles.audienceLine}>• Enfermeiros e outros profissionais em contextos onde o app for usado conforme regras locais.</Text>
            <Text style={styles.audienceLine}>• Simulação e debriefing quando combinar com o modo de registo da sessão.</Text>
          </View>

          {/* Como começar */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsEyebrow}>Como começar</Text>
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

          {/* Catálogo — mesma grelha e cartões que o hub interno */}
          <View style={styles.catalogShell}>
            <View style={styles.catalogHeader}>
              <Text style={styles.catalogEyebrow}>Catálogo</Text>
              <Text style={styles.catalogTitle}>Módulos assistenciais</Text>
              <Text style={styles.catalogSubtitle}>
                Filtre por área ou toque num cartão para abrir o fluxo diretamente.
              </Text>
            </View>

            <Text style={styles.chipsLabel}>Filtrar por área</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
              style={styles.chipsScroll}>
              {FILTER_CHIPS.map((chip) => {
                const selected = filterId === chip.id;
                return (
                  <Pressable
                    key={chip.id}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setFilterId(chip.id)}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{chip.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.moduleGrid}>
              {visibleModules.length === 0 ? (
                <Text style={styles.emptyFilter}>Nenhum módulo nesta área.</Text>
              ) : (
                visibleModules.map((mod) => (
                  <ModuleGridCard
                    key={mod.id}
                    areaLabel={getModuleAreaLabel(mod.id)}
                    title={mod.title}
                    description={mod.description}
                    twoColumns={twoColumns}
                    onPress={() => {
                      void openClinicalModule(router, mod.id, mod.route as Href);
                    }}
                  />
                ))
              )}
            </View>
          </View>

          <Pressable style={({ pressed }) => [styles.ctaBottom, pressed && { opacity: 0.92 }]} onPress={enterApp}>
            <Text style={styles.ctaBottomText}>Começar a usar a aplicação</Text>
            <Text style={styles.ctaBottomHint}>Abre a área principal da aplicação</Text>
          </Pressable>

          <Text style={styles.footerNote}>
            Ferramenta de apoio à decisão clínica. Valide sempre com prescrição, doses e normas locais. Uso conforme
            políticas do seu serviço.
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
    paddingTop: 12,
    paddingBottom: 40,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  scrollContentNarrow: {
    paddingHorizontal: 14,
  },
  shell: {
    gap: 18,
  },
  heroLime: {
    backgroundColor: AppDesign.accent.lime,
    borderRadius: 32,
    padding: 22,
    gap: 12,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.8,
  },
  heroTitleNarrow: {
    fontSize: 24,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1e293b",
    fontWeight: "500",
  },
  ctaPrimary: {
    alignSelf: "stretch",
    backgroundColor: "#0f172a",
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 4,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  propCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 12,
    ...AppDesign.shadow.card,
  },
  propEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: AppDesign.accent.teal,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  propTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
  },
  propBody: {
    fontSize: 15,
    lineHeight: 23,
    color: AppDesign.text.secondary,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ecfdf5",
    letterSpacing: -0.2,
    marginBottom: -6,
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
    backgroundColor: AppDesign.surface.shellMint,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    gap: 8,
  },
  featureItemFull: {
    width: "100%",
  },
  featureGlyphWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: AppDesign.accent.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  featureGlyph: {
    fontSize: 18,
    color: AppDesign.accent.teal,
    fontWeight: "700",
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.2,
  },
  featureBody: {
    fontSize: 13,
    lineHeight: 19,
    color: AppDesign.text.secondary,
  },
  audienceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.mint,
    borderLeftWidth: 4,
    borderLeftColor: AppDesign.accent.lime,
    gap: 10,
    ...AppDesign.shadow.hero,
  },
  audienceEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: AppDesign.accent.teal,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  audienceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: AppDesign.text.primary,
    marginBottom: 4,
  },
  audienceLine: {
    fontSize: 14,
    lineHeight: 22,
    color: AppDesign.text.secondary,
  },
  stepsCard: {
    backgroundColor: AppDesign.surface.shellMint,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    gap: 16,
  },
  stepsEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: AppDesign.accent.teal,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  stepCopy: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: AppDesign.text.primary,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 21,
    color: AppDesign.text.secondary,
  },
  catalogShell: {
    backgroundColor: AppDesign.surface.shellMint,
    borderRadius: 28,
    padding: 16,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  catalogHeader: {
    gap: 6,
    paddingHorizontal: 2,
  },
  catalogEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: AppDesign.accent.teal,
  },
  catalogTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
  },
  catalogSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },
  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  chipsLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: AppDesign.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 4,
  },
  chipsScroll: {
    marginHorizontal: -4,
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: AppDesign.accent.limeSoft,
    borderWidth: 1,
    borderColor: "#bef264",
  },
  chipSelected: {
    backgroundColor: AppDesign.accent.teal,
    borderColor: "#0d9488",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: AppDesign.accent.limeDark,
  },
  chipTextSelected: {
    color: "#ecfdf5",
  },
  emptyFilter: {
    width: "100%",
    fontSize: 14,
    color: AppDesign.text.secondary,
    fontStyle: "italic",
    paddingVertical: 12,
    textAlign: "center",
  },
  ctaBottom: {
    alignSelf: "stretch",
    backgroundColor: "#0f172a",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  ctaBottomText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  ctaBottomHint: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 11,
    lineHeight: 16,
    color: "rgba(236, 253, 245, 0.85)",
    textAlign: "center",
    fontWeight: "600",
    paddingHorizontal: 8,
  },
});
