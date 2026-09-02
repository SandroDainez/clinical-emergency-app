import { StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type ClinicalObservationChipProps = {
  label: string;
  value: string;
  unit?: string;
  ageLabel: string;
  freshness?: "fresh" | "aging" | "stale";
};

/**
 * Exibe dado clínico volátil SEM escondê-lo atrás da aparência de "valor atual".
 * A idade do dado é parte do componente, não texto opcional do chamador.
 */
export function ClinicalObservationChip({
  label,
  value,
  unit,
  ageLabel,
  freshness = "fresh",
}: ClinicalObservationChipProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={[e.base, e.tone[freshness]]} accessibilityRole="summary">
      <Text style={e.label}>{label}</Text>
      <Text style={e.value} numberOfLines={1}>
        {value}{unit ? ` ${unit}` : ""}
      </Text>
      <Text style={[e.age, freshness === "stale" && e.ageStale]} numberOfLines={1}>
        {ageLabel}
      </Text>
    </View>
  );
}

const criarEstilos = (t: Tema) => ({
  ...StyleSheet.create({
    base: {
      minWidth: 86,
      borderWidth: 1,
      borderRadius: RAIO.input,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.xs,
      backgroundColor: t.cores.bg,
      borderColor: t.cores.border,
      gap: 1,
    },
    label: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary },
    value: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    age: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "400" },
    ageStale: { color: t.cores.warning, fontWeight: "700" },
  }),
  tone: StyleSheet.create({
    fresh: { borderColor: t.cores.border },
    aging: { borderColor: t.cores.warning },
    stale: { borderColor: t.cores.warning, borderWidth: 2 },
  }),
});
