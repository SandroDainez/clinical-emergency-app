import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscription } from "../lib/subscription-context";
import { PRODUCT_IDS, getProductPrices } from "../lib/subscription";
import { useTr } from "../lib/use-tr";
import { useLanguage } from "../lib/language-context";

const FEATURES_FREE = [
  "Guia ACLS completo",
  "Ritmos, fármacos e causas reversíveis",
  "Bradiarritmias e taquiarritmias",
  "Pós-PCR",
  "Log clínico e resumo operacional",
];

const FEATURES_PRO = [
  "Tudo do plano gratuito",
  "Sepse & antibioticoterapia (SSC 2021)",
  "Drogas vasoativas — cálculo de dose",
  "ISR — intubação sequência rápida",
  "Ventilação mecânica (ARDSnet · PADIS)",
  "Edema agudo de pulmão (ESC 2021)",
  "CAD / EHH — cetoacidose diabética",
  "Anafilaxia (WAO 2021)",
  "Síndrome coronariana aguda",
  "AVC isquêmico · hemorrágico",
  "Atualizações de diretrizes incluídas",
];

export default function PaywallScreen() {
  const tr = useTr();
  // Preço ligado ao locale do render: fora dele o valor congela no idioma do build.
  const { locale } = useLanguage();
  const prices = getProductPrices(locale);
  const { purchase, restore, isLoading } = useSubscription();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handlePurchase() {
    const productId =
      selected === "annual" ? PRODUCT_IDS.annual : PRODUCT_IDS.monthly;
    const ok = await purchase(productId);
    if (ok) {
      router.back();
    } else {
      setFeedback("Compra não concluída. Tente novamente.");
    }
  }

  async function handleRestore() {
    const found = await restore();
    if (found) {
      router.back();
    } else {
      setFeedback("Nenhuma compra anterior encontrada.");
    }
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollInner, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}>

        {/* Close button */}
        <Pressable style={s.closeBtn} onPress={() => router.back()} hitSlop={16}>
          <Text style={s.closeBtnText}>✕</Text>
        </Pressable>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>{tr("EMERGÊNCIA CLÍNICA PRO")}</Text>
          </View>
          <Text style={s.heroTitle}>{tr("Guia completo à beira do leito")}</Text>
          <Text style={s.heroSub}>
            {tr("Acesso a todos os módulos clínicos, fármacos, doses e calculadoras — baseados nas principais diretrizes mundiais.")}
          </Text>
        </View>

        {/* Plan selector */}
        <View style={s.planRow}>
          <Pressable
            style={[s.planCard, selected === "annual" && s.planCardSelected]}
            onPress={() => setSelected("annual")}>
            {selected === "annual" && (
              <View style={s.planBestBadge}>
                <Text style={s.planBestBadgeText}>{tr("MELHOR OFERTA")}</Text>
              </View>
            )}
            <Text style={s.planPeriod}>{tr("Anual")}</Text>
            <Text style={s.planPrice}>{prices.annualMonthly}</Text>
            <Text style={s.planSub}>
              {prices.annual} · {prices.annualSaving}
            </Text>
          </Pressable>

          <Pressable
            style={[s.planCard, selected === "monthly" && s.planCardSelected]}
            onPress={() => setSelected("monthly")}>
            <Text style={s.planPeriod}>{tr("Mensal")}</Text>
            <Text style={s.planPrice}>{prices.monthly}</Text>
            <Text style={s.planSub}>{tr("Cancele quando quiser")}</Text>
          </Pressable>
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.88 }]}
          onPress={handlePurchase}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={s.ctaBtnText}>
                {selected === "annual"
                  ? tr("Assinar plano anual")
                  : tr("Assinar plano mensal")}
              </Text>
              <Text style={s.ctaBtnSub}>
                {selected === "annual" ? prices.annual : prices.monthly}
                {" · "}
                {tr("Cancele a qualquer momento")}
              </Text>
            </>
          )}
        </Pressable>

        {feedback ? <Text style={s.feedbackText}>{feedback}</Text> : null}

        {/* Feature comparison */}
        <View style={s.comparisonRow}>
          {/* Free column */}
          <View style={s.comparisonCol}>
            <View style={s.comparisonHeader}>
              <Text style={s.comparisonHeaderLabel}>{tr("GRATUITO")}</Text>
              <Text style={s.comparisonHeaderTitle}>{tr("ACLS")}</Text>
            </View>
            {FEATURES_FREE.map((f) => (
              <View key={f} style={s.featureRow}>
                <Text style={s.featureCheck}>✓</Text>
                <Text style={s.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* Pro column */}
          <View style={[s.comparisonCol, s.comparisonColPro]}>
            <View style={[s.comparisonHeader, s.comparisonHeaderPro]}>
              <Text style={[s.comparisonHeaderLabel, { color: "#4d9aff" }]}>
                {tr("PRO")}
              </Text>
              <Text style={[s.comparisonHeaderTitle, { color: "#f1f5f9" }]}>
                {tr("Todos os módulos")}
              </Text>
            </View>
            {FEATURES_PRO.map((f) => (
              <View key={f} style={s.featureRow}>
                <Text style={[s.featureCheck, s.featureCheckPro]}>✓</Text>
                <Text style={[s.featureText, s.featureTextPro]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Guidelines strip */}
        <View style={s.guidelinesStrip}>
          {["AHA 2020", "SSC 2021", "ESC 2021", "ADA 2022", "WAO 2021", "ARDSnet"].map(
            (g) => (
              <View key={g} style={s.guidelineChip}>
                <Text style={s.guidelineChipText}>{g}</Text>
              </View>
            )
          )}
        </View>

        {/* Restore + legal */}
        <Pressable
          style={({ pressed }) => [s.restoreBtn, pressed && { opacity: 0.7 }]}
          onPress={handleRestore}
          disabled={isLoading}>
          <Text style={s.restoreBtnText}>{tr("Restaurar compras anteriores")}</Text>
        </Pressable>

        <Text style={s.legalText}>
          {tr("A assinatura é cobrada automaticamente no período escolhido. Você pode cancelar a qualquer momento pela loja de aplicativos. Os preços podem variar de acordo com sua região.")}
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1a1d23",
  },
  scroll: { flex: 1 },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },

  /* Close */
  closeBtn: {
    alignSelf: "flex-end",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#262a32",
    borderWidth: 1,
    borderColor: "#3a404a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  closeBtnText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "700",
    lineHeight: 18,
  },

  /* Hero */
  hero: {
    backgroundColor: "#262a32",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#3a404a",
    borderLeftWidth: 4,
    borderLeftColor: "#4d9aff",
    gap: 10,
    shadowColor: "#4d9aff",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1e6fd9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#ffffff",
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f1f5f9",
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 21,
    color: "#94a3b8",
  },

  /* Plan selector */
  planRow: {
    flexDirection: "row",
    gap: 10,
  },
  planCard: {
    flex: 1,
    backgroundColor: "#262a32",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#3a404a",
    padding: 14,
    gap: 4,
    position: "relative",
    overflow: "hidden",
  },
  planCardSelected: {
    borderColor: "#4d9aff",
    backgroundColor: "#0d2a2d",
    shadowColor: "#4d9aff",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  planBestBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#1e6fd9",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  planBestBadgeText: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#ffffff",
    textTransform: "uppercase",
  },
  planPeriod: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#94a3b8",
    marginBottom: 2,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.3,
  },
  planSub: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 16,
  },

  /* CTA */
  ctaBtn: {
    minHeight: 62,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e6fd9",
    gap: 3,
    shadowColor: "#4d9aff",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaBtnText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  ctaBtnSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },

  feedbackText: {
    textAlign: "center",
    fontSize: 13,
    color: "#f87171",
  },

  /* Feature comparison */
  comparisonRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  comparisonCol: {
    flex: 1,
    backgroundColor: "#262a32",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3a404a",
    overflow: "hidden",
  },
  comparisonColPro: {
    borderColor: "#4d9aff",
    shadowColor: "#4d9aff",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  comparisonHeader: {
    backgroundColor: "#262a32",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3a404a",
    gap: 2,
  },
  comparisonHeaderPro: {
    backgroundColor: "#0d2a2d",
    borderBottomColor: "#4d9aff",
  },
  comparisonHeaderLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#94a3b8",
  },
  comparisonHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#94a3b8",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#3a404a",
  },
  featureCheck: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    marginTop: 2,
    width: 14,
  },
  featureCheckPro: {
    color: "#4d9aff",
  },
  featureText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#94a3b8",
  },
  featureTextPro: {
    color: "#94a3b8",
  },

  /* Guidelines strip */
  guidelinesStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 4,
  },
  guidelineChip: {
    backgroundColor: "#262a32",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3a404a",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  guidelineChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.3,
  },

  /* Restore & legal */
  restoreBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  restoreBtnText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  legalText: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 17,
  },
});
