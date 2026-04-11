import { Pressable, StyleSheet, Text, View } from "react-native";

import * as DS from "@/constants/app-design";

const AppDesign = DS.AppDesign;

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
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 10,
    ...AppDesign.shadow.card,
    borderLeftWidth: 4,
    borderLeftColor: AppDesign.accent.lime,
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
    backgroundColor: AppDesign.accent.limeSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#bef264",
  },
  areaBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: AppDesign.accent.limeDark,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: AppDesign.text.secondary,
    minHeight: 52,
  },
  cardFooter: {
    marginTop: 2,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppDesign.border.subtle,
  },
  cardCta: {
    fontSize: 13,
    fontWeight: "800",
    color: AppDesign.accent.primary,
  },
});
