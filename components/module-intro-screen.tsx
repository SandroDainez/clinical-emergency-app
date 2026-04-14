import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.badge}>{badge}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.card}>
          {features.length ? (
            <View style={styles.featureList}>
              {features.map((feature) => (
                <View key={`${feature.icon}-${feature.text}`} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={styles.disclaimer}>{disclaimer}</Text>

          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.92 }]} onPress={onAccept}>
            <Text style={styles.buttonText}>{actionLabel}</Text>
            <Text style={styles.buttonHint}>{actionHint}</Text>
          </Pressable>
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
    padding: 18,
    paddingVertical: 28,
    gap: 16,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    backgroundColor: AppDesign.accent.lime,
    borderRadius: 32,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.2)",
    ...AppDesign.shadow.hero,
  },
  badge: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: AppDesign.accent.limeDark,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1e293b",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    gap: 18,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    ...AppDesign.shadow.card,
  },
  featureList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 28,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 19,
    color: AppDesign.text.muted,
    borderTopWidth: 1,
    borderTopColor: AppDesign.border.subtle,
    paddingTop: 16,
  },
  button: {
    minHeight: 72,
    borderRadius: 999,
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  buttonHint: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
