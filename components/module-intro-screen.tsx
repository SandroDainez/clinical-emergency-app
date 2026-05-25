import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

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
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.shell}>

          {/* Hero */}
          <View style={[s.hero, isCompact && s.heroCompact]}>
            <View style={s.badgePill}>
              <Text style={s.badgeText}>{badge}</Text>
            </View>
            <Text style={[s.title, isCompact && s.titleCompact]}>{title}</Text>
            <Text style={[s.subtitle, isCompact && s.subtitleCompact]}>{subtitle}</Text>

            {features.length > 0 && (
              <View style={s.featureList}>
                {features.map((feature, index) => (
                  <View
                    key={`${feature.icon}-${feature.text}`}
                    style={[s.featureRow, isCompact && s.featureRowCompact]}>
                    <View style={[s.featureIndex, isCompact && s.featureIndexCompact]}>
                      <Text style={s.featureIndexText}>
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                    </View>
                    <View style={s.featureContent}>
                      <Text style={s.featureKicker}>{feature.icon} Benefício</Text>
                      <Text style={[s.featureText, isCompact && s.featureTextCompact]}>
                        {feature.text}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Disclaimer */}
            <View style={s.disclaimerCard}>
              <Text style={s.disclaimerLabel}>Aviso de uso</Text>
              <Text style={s.disclaimer}>{disclaimer}</Text>
            </View>

            {/* CTA */}
            <Pressable
              style={({ pressed }) => [s.button, pressed && { opacity: 0.88 }]}
              onPress={onAccept}>
              <Text style={s.buttonText}>{actionLabel}</Text>
              <Text style={s.buttonHint}>{actionHint}</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0a0f1a",
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

  /* Hero card */
  hero: {
    backgroundColor: "#0f172a",
    borderRadius: 28,
    padding: 26,
    gap: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderLeftWidth: 4,
    borderLeftColor: "#0e7490",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroCompact: {
    padding: 20,
    borderRadius: 22,
  },

  /* Badge */
  badgePill: {
    alignSelf: "flex-start",
    backgroundColor: "#0e7490",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#ffffff",
  },

  /* Title */
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    color: "#f1f5f9",
    letterSpacing: -0.8,
    maxWidth: 540,
  },
  titleCompact: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
  },

  /* Subtitle */
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#64748b",
    maxWidth: 560,
    fontWeight: "500",
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 21,
  },

  /* Features */
  featureList: {
    gap: 10,
    marginTop: 4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  featureRowCompact: {
    gap: 10,
    padding: 12,
    borderRadius: 14,
  },
  featureIndex: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0e7490",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureIndexCompact: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  featureIndexText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#ffffff",
  },
  featureContent: {
    flex: 1,
    gap: 3,
  },
  featureKicker: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#475569",
  },
  featureText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#e2e8f0",
    fontWeight: "600",
  },
  featureTextCompact: {
    fontSize: 14,
    lineHeight: 20,
  },

  /* Disclaimer */
  disclaimerCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 4,
  },
  disclaimerLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#475569",
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
  },

  /* CTA button */
  button: {
    minHeight: 72,
    borderRadius: 18,
    justifyContent: "center",
    backgroundColor: "#0e7490",
    paddingHorizontal: 22,
    paddingVertical: 16,
    gap: 4,
    shadowColor: "#22d3ee",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  buttonHint: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
