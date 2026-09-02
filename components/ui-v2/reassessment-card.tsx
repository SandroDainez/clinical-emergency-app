import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type ReassessmentOutcome = {
  id: string;
  label: string;
  onPress: () => void;
  critical?: boolean;
};

export type ReassessmentCardProps = {
  title?: string;
  when?: string;
  items: string[];
  outcomes: ReassessmentOutcome[];
};

/**
 * Reavaliação explícita após terapia crítica.
 *
 * Não fecha o raciocínio em "tratou e avançou". Mostra o que deve ser reavaliado
 * e obriga uma saída observável: respondeu, parcial, não respondeu, piorou ou
 * não foi possível avaliar.
 */
export function ReassessmentCard({
  title = "Reavaliar agora",
  when,
  items,
  outcomes,
}: ReassessmentCardProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={e.wrapper} accessibilityRole="summary">
      <Text style={e.eyebrow}>REAVALIAÇÃO OBRIGATÓRIA</Text>

      <View style={e.headingRow}>
        <Text style={e.title}>{title}</Text>
        {when ? (
          <View style={e.whenPill}>
            <Text style={e.when}>{when}</Text>
          </View>
        ) : null}
      </View>

      <View style={e.section}>
        <Text style={e.sectionLabel}>CONFIRA AGORA</Text>
        <View style={e.items}>
          {items.slice(0, 6).map((item) => (
            <View key={item} style={e.itemRow}>
              <View style={e.itemDot} />
              <Text style={e.item}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={e.section}>
        <Text style={e.sectionLabel}>REGISTRAR RESPOSTA À CONDUTA</Text>
        <View style={e.outcomes}>
          {outcomes.map((outcome) => (
            <Pressable
              key={outcome.id}
              accessibilityRole="button"
              accessibilityLabel={outcome.label}
              onPress={outcome.onPress}
              style={({ pressed }) => [
                e.outcome,
                outcome.critical && e.outcomeCritical,
                pressed && e.pressed,
              ]}
            >
              <Text style={[e.outcomeLabel, outcome.critical && e.outcomeCriticalLabel]}>
                {outcome.label}
              </Text>
              <Text style={[e.chevron, outcome.critical && e.outcomeCriticalLabel]}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: t.cores.surface,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderLeftWidth: 6,
      borderColor: t.cores.primary,
      padding: ESPACO.lg,
      gap: ESPACO.md,
    },
    eyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.primary,
      fontWeight: "900",
      letterSpacing: 0.8,
    },
    headingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.md,
    },
    title: { ...TIPOGRAFIA.step, color: t.cores.text, fontWeight: "800", flex: 1 },
    whenPill: {
      borderRadius: RAIO.badge,
      borderWidth: 1,
      borderColor: t.cores.primary,
      backgroundColor: t.cores.bg,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: 4,
    },
    when: { ...TIPOGRAFIA.micro, color: t.cores.primary, fontWeight: "800" },
    section: { gap: ESPACO.sm },
    sectionLabel: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "800",
      letterSpacing: 0.6,
    },
    items: { gap: ESPACO.sm },
    itemRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: ESPACO.sm,
    },
    itemDot: {
      width: 7,
      height: 7,
      borderRadius: RAIO.badge,
      backgroundColor: t.cores.primary,
      marginTop: 6,
    },
    item: { flex: 1, ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "600" },
    outcomes: { gap: ESPACO.sm },
    outcome: {
      minHeight: TOQUE.critico,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.md,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    outcomeCritical: {
      backgroundColor: t.cores.critical,
      borderColor: t.cores.critical,
    },
    outcomeLabel: { flex: 1, ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    outcomeCriticalLabel: { color: t.cores.onCritical },
    chevron: {
      ...TIPOGRAFIA.body,
      color: t.cores.textSecondary,
      fontWeight: "900",
    },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
