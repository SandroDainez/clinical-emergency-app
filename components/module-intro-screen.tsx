import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { AppDesign } from "../constants/app-design";

type FeatureItem = {
  icon: string;
  text: string;
};

type ModuleIntroScreenProps = {
  badge: string;
  title: string;
  subtitle: string;
  features?: FeatureItem[];
  disclaimer: string;
  actionLabel: string;
  actionHint: string;
  onAccept: () => void;
};

export default function ModuleIntroScreen({
  badge,
  title,
  subtitle,
  features = [],
  disclaimer,
  actionLabel,
  actionHint,
  onAccept,
}: ModuleIntroScreenProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 560;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <View style={[styles.hero, isCompact && styles.heroCompact]}>
            <View style={styles.heroGlow} pointerEvents="none" />
            <Text style={styles.badge}>{badge}</Text>
            <Text style={[styles.title, isCompact && styles.titleCompact]}>{title}</Text>
            <Text style={[styles.subtitle, isCompact && styles.subtitleCompact]}>{subtitle}</Text>

            {features.length ? (
              <View style={[styles.featureList, styles.featureListInsideHero]}>
                {features.map((feature, index) => (
                  <View key={`${feature.icon}-${feature.text}`} style={[styles.featureRow, isCompact && styles.featureRowCompact]}>
                    <View style={[styles.featureIndex, isCompact && styles.featureIndexCompact]}>
                      <Text style={styles.featureIndexText}>{String(index + 1).padStart(2, "0")}</Text>
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureKicker}>{feature.icon} Benefício</Text>
                      <Text style={[styles.featureText, isCompact && styles.featureTextCompact]}>{feature.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={[styles.disclaimerCard, styles.disclaimerCardInsideHero]}>
              <Text style={styles.disclaimerLabel}>Aviso de uso</Text>
              <Text style={styles.disclaimer}>{disclaimer}</Text>
            </View>

            <Pressable style={({ pressed }) => [styles.button, styles.buttonInsideHero, pressed && { opacity: 0.92 }]} onPress={onAccept}>
              <Text style={styles.buttonText}>{actionLabel}</Text>
              <Text style={styles.buttonHint}>{actionHint}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppDesign.canvas.tealBackdrop,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 30,
  },
  shell: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 18,
  },
  hero: {
    minHeight: 320,
    backgroundColor: AppDesign.accent.limeSoft,
    borderRadius: 36,
    padding: 30,
    gap: 18,
    justifyContent: "flex-start",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(16,33,40,0.08)",
    ...AppDesign.shadow.hero,
  },
  heroCompact: {
    minHeight: 240,
    padding: 24,
    borderRadius: 28,
  },
  heroGlow: {
    position: "absolute",
    right: -36,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  badge: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: AppDesign.accent.limeDark,
    backgroundColor: "rgba(16,33,40,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  title: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
    color: AppDesign.text.primary,
    letterSpacing: -0.9,
    maxWidth: 540,
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 25,
    color: "#22363b",
    maxWidth: 560,
    fontWeight: "600",
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 21,
  },
  featureList: {
    gap: 14,
  },
  featureListInsideHero: {
    marginTop: 6,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#f2eee5",
    borderWidth: 1,
    borderColor: "rgba(75,135,217,0.18)",
  },
  featureRowCompact: {
    gap: 10,
    padding: 12,
    borderRadius: 18,
  },
  featureIndex: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#102128",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIndexCompact: {
    width: 38,
    height: 38,
    borderRadius: 14,
  },
  featureIndexText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    color: AppDesign.accent.lime,
  },
  featureContent: {
    flex: 1,
    gap: 4,
  },
  featureKicker: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: AppDesign.accent.teal,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 23,
    color: AppDesign.text.secondary,
    fontWeight: "700",
  },
  featureTextCompact: {
    fontSize: 15,
    lineHeight: 21,
  },
  disclaimerCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: AppDesign.surface.shellMint,
    borderWidth: 1,
    borderColor: "rgba(75,135,217,0.24)",
    gap: 6,
  },
  disclaimerCardInsideHero: {
    marginTop: 2,
  },
  disclaimerLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: AppDesign.accent.teal,
  },
  disclaimer: {
    fontSize: 14,
    lineHeight: 21,
    color: AppDesign.text.secondary,
  },
  button: {
    minHeight: 78,
    borderRadius: 999,
    justifyContent: "center",
    backgroundColor: "#102128",
    paddingHorizontal: 22,
    paddingVertical: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  buttonInsideHero: {
    marginTop: 2,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  buttonHint: {
    color: "#8ca0aa",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
