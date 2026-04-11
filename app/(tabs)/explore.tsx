import { type Href, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppDesign } from "@/constants/app-design";
import { ModuleBackToHubLink } from "@/components/module-back-to-hub";

const BOTTOM_PAD = 28;

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: BOTTOM_PAD + insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.shellMint}>
          <View style={styles.backRow}>
            <ModuleBackToHubLink onPress={() => router.replace("/(tabs)" as Href)} />
          </View>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Recursos</Text>
            <Text style={styles.title}>Mais</Text>
            <Text style={styles.description}>
              Atalhos e informações. A lista de módulos está no ecrã inicial (Protocolos).
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push("/session-history" as Href)}>
            <View style={styles.cardTop}>
              <Text style={styles.cardEyebrow}>Sessões</Text>
              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>Ir</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Histórico clínico</Text>
            <Text style={styles.cardBody}>
              Rever evolução, duração, choques, medicações e debriefs guardados.
            </Text>
          </Pressable>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Sobre esta aplicação</Text>
            <Text style={styles.infoBody}>
              Fluxos para emergência e UTI com documentação estruturada. O separador Protocolos concentra os módulos
              assistenciais (ACLS, sepse, vasoativos, etc.).
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppDesign.canvas.tealBackdrop,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 18,
    paddingTop: 12,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    gap: 18,
  },
  backRow: {
    marginBottom: 4,
  },
  shellMint: {
    backgroundColor: AppDesign.surface.shellMint,
    borderRadius: 28,
    padding: 20,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  hero: {
    backgroundColor: AppDesign.surface.hero,
    borderRadius: AppDesign.radius.xxl,
    padding: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.mint,
    borderLeftWidth: 4,
    borderLeftColor: AppDesign.accent.lime,
    ...AppDesign.shadow.hero,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: AppDesign.accent.teal,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: AppDesign.text.secondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: AppDesign.surface.card,
    borderRadius: AppDesign.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 8,
    ...AppDesign.shadow.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: AppDesign.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardArrow: {
    borderRadius: AppDesign.radius.pill,
    backgroundColor: AppDesign.accent.primaryMuted,
    borderWidth: 1,
    borderColor: "#a5f3fc",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cardArrowText: {
    fontSize: 11,
    fontWeight: "800",
    color: AppDesign.accent.primary,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: AppDesign.text.primary,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: AppDesign.text.secondary,
  },
  infoCard: {
    backgroundColor: AppDesign.surface.card,
    borderRadius: AppDesign.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.mint,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: AppDesign.text.primary,
  },
  infoBody: {
    fontSize: 14,
    lineHeight: 21,
    color: AppDesign.text.secondary,
  },
});
