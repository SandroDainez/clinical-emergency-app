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
      <View style={e.headingRow}>
        <Text style={e.title}>{title}</Text>
        {when ? <Text style={e.when}>{when}</Text> : null}
      </View>

      <View style={e.items}>
        {items.slice(0, 6).map((item) => (
          <Text key={item} style={e.item}>• {item}</Text>
        ))}
      </View>

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
          </Pressable>
        ))}
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
      borderColor: t.cores.border,
      padding: ESPACO.lg,
      gap: ESPACO.md,
    },
    headingRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: ESPACO.md,
    },
    title: { ...TIPOGRAFIA.step, color: t.cores.text, fontWeight: "800", flex: 1 },
    when: { ...TIPOGRAFIA.micro, color: t.cores.primary, fontWeight: "800" },
    items: { gap: ESPACO.xs },
    item: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "500" },
    outcomes: { gap: ESPACO.sm },
    outcome: {
      minHeight: TOQUE.minimo,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    outcomeCritical: {
      backgroundColor: t.cores.critical,
      borderColor: t.cores.critical,
    },
    outcomeLabel: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800", textAlign: "center" },
    outcomeCriticalLabel: { color: t.cores.onCritical },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
