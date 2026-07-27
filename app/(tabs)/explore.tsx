import { type Href, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ModuleBackToHubLink } from "@/components/module-back-to-hub";
import { useSubscription } from "../../lib/subscription-context";
import { useTr } from "../../lib/use-tr";

const BOTTOM_PAD = 28;

export default function MoreScreen() {
  const tr = useTr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, _devUnlock } = useSubscription();

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollInner, { paddingBottom: BOTTOM_PAD + insets.bottom }]}
        showsVerticalScrollIndicator={false}>

        <View style={s.backRow}>
          <ModuleBackToHubLink onPress={() => router.replace("/(tabs)" as Href)} />
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroTopRow}>
            <Text style={s.eyebrow}>{tr("RECURSOS")}</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>{tr("EMERGÊNCIA CLÍNICA")}</Text>
            </View>
          </View>
          <Text style={s.title}>{tr("Mais recursos")}</Text>
          <Text style={s.description}>
            {tr("Acesse histórico de sessões e informações sobre o app. A lista de módulos está na tela principal.")}
          </Text>
        </View>

        {/* Subscription card */}
        {isPremium ? (
          <View style={[s.infoCard, s.proActiveCard]}>
            <View style={s.cardTop}>
              <View style={[s.cardIconBox, { backgroundColor: "#0d2a2d" }]}>
                <Text style={s.cardIcon}>⭐</Text>
              </View>
              <View style={s.proBadge}>
                <Text style={s.proBadgeText}>{tr("ATIVO")}</Text>
              </View>
            </View>
            <Text style={[s.infoTitle, { color: "#22d3ee" }]}>{tr("Plano Pro ativo")}</Text>
            <Text style={s.infoBody}>
              {tr("Você tem acesso a todos os 15 módulos clínicos, incluindo Sepse, ISR, Ventilação, CAD/EHH, Anafilaxia e mais.")}
            </Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [s.card, s.upgradeCard, pressed && { opacity: 0.9 }]}
            onPress={() => router.push("/paywall" as Href)}>
            <View style={s.cardTop}>
              <View style={[s.cardIconBox, { backgroundColor: "#0d2a2d" }]}>
                <Text style={s.cardIcon}>🔒</Text>
              </View>
              <View style={s.cardArrow}>
                <Text style={s.cardArrowText}>{tr("Ver planos →")}</Text>
              </View>
            </View>
            <Text style={s.cardTitle}>{tr("Desbloquear plano Pro")}</Text>
            <Text style={s.cardBody}>
              {tr("Acesse Sepse, ISR, Ventilação, CAD/EHH, Anafilaxia e mais 4 módulos premium. Baseados nas melhores diretrizes internacionais.")}
            </Text>
          </Pressable>
        )}

        {/* Histórico clínico */}
        <Pressable
          style={({ pressed }) => [s.card, pressed && s.cardPressed]}
          onPress={() => router.push("/session-history" as Href)}>
          <View style={s.cardTop}>
            <View style={s.cardIconBox}>
              <Text style={s.cardIcon}>📊</Text>
            </View>
            <View style={s.cardArrow}>
              <Text style={s.cardArrowText}>{tr("Abrir →")}</Text>
            </View>
          </View>
          <Text style={s.cardTitle}>{tr("Histórico clínico")}</Text>
          <Text style={s.cardBody}>
            {tr("Revise sessões anteriores — duração, desfechos, choques, medicações e registros.")}
          </Text>
        </Pressable>

        {/* Sobre */}
        <View style={s.infoCard}>
          <View style={s.infoIconBox}>
            <Text style={s.infoIcon}>ℹ️</Text>
          </View>
          <Text style={s.infoTitle}>{tr("Sobre este aplicativo")}</Text>
          <Text style={s.infoBody}>
            {tr("Fluxos para emergência e UTI com documentação estruturada, baseados em diretrizes AHA, ESC, ADA, WAO, ARDSnet e ACEP. Ferramenta de apoio à decisão — não substitui protocolo institucional nem julgamento clínico.")}
          </Text>
        </View>

        {/* Dev toggle — remove before production */}
        {__DEV__ && (
          <Pressable style={s.devBtn} onPress={_devUnlock}>
            <Text style={s.devBtnText}>
              [DEV] {isPremium ? "Revogar Pro" : "Simular Pro"}
            </Text>
          </Pressable>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0f1a" },
  scroll: { flex: 1 },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    gap: 12,
  },
  backRow: { marginBottom: 2 },

  hero: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderLeftWidth: 4,
    borderLeftColor: "#22d3ee",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#22d3ee",
  },
  badge: {
    backgroundColor: "#0e7490",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#ffffff",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748b",
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardPressed: { opacity: 0.88, backgroundColor: "#273448" },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIcon: { fontSize: 20 },
  cardArrow: {
    backgroundColor: "#0e7490",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cardArrowText: { fontSize: 12, fontWeight: "800", color: "#ffffff" },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#f1f5f9" },
  cardBody: { fontSize: 14, lineHeight: 21, color: "#64748b" },

  infoCard: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
  },
  proActiveCard: {
    borderColor: "#0e7490",
    backgroundColor: "#0d2a2d",
  },
  upgradeCard: {
    borderColor: "#0e7490",
    shadowColor: "#22d3ee",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  proBadge: {
    backgroundColor: "#0e7490",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#ffffff",
    textTransform: "uppercase",
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  infoIcon: { fontSize: 18 },
  infoTitle: { fontSize: 16, fontWeight: "800", color: "#f1f5f9" },
  infoBody: { fontSize: 13, lineHeight: 20, color: "#64748b" },

  devBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
  },
  devBtnText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
});
