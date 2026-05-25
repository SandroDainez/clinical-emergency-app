import { Pressable, StyleSheet, Text, View } from "react-native";

export type ModuleGridCardProps = {
  areaLabel: string;
  title: string;
  description: string;
  /** Duas colunas quando o ecrã é largo o suficiente. */
  twoColumns?: boolean;
  onPress: () => void;
};

export function ModuleGridCard({
  areaLabel,
  title,
  description,
  twoColumns,
  onPress,
}: ModuleGridCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [
        styles.card,
        twoColumns && styles.cardHalf,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.areaBadge}>
          <Text style={styles.areaBadgeText}>{areaLabel}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={3}>
        {title}
      </Text>
      <Text style={styles.cardDesc} numberOfLines={4}>
        {description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardCta}>Entrar no módulo →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#86efac",
  },
  cardHalf: {
    width: "48%",
    maxWidth: "48%",
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  areaBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#14532d",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4ade80",
  },
  areaBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#86efac",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: "#94a3b8",
    fontWeight: "600",
    minHeight: 60,
  },
  cardFooter: {
    marginTop: 2,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  cardCta: {
    fontSize: 14,
    fontWeight: "800",
    color: "#22d3ee",
  },
});
