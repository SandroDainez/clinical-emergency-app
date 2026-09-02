import { StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type ClinicalObservationChipProps = {
  label: string;
  value: string;
  unit?: string;
  ageLabel: string;
  /** Origem visual do dado, ex.: "medido agora" ou "herdado do atendimento". */
  originLabel?: string;
  freshness?: "fresh" | "aging" | "stale";
};

/**
 * Exibe dado clínico volátil SEM escondê-lo atrás da aparência de "valor atual".
 * A idade do dado é parte do componente, não texto opcional do chamador.
 *
 * `originLabel` é somente apresentação de procedência. Ele não decide se um dado
 * pode ou não ser reutilizado e não altera nenhuma política de freshness.
 */
export function ClinicalObservationChip({
  label,
  value,
  unit,
  ageLabel,
  originLabel,
  freshness = "fresh",
}: ClinicalObservationChipProps) {
  const e = useEstilosDoTema(criarEstilos);

  const freshnessLabel =
    freshness === "fresh"
      ? "ATUAL"
      : freshness === "aging"
        ? "RECONFIRA SE MUDOU"
        : "DADO ANTIGO";

  return (
    <View style={[e.base, e.tone[freshness]]} accessibilityRole="summary">
      <View style={e.topRow}>
        <Text style={e.label} numberOfLines={1}>{label}</Text>
        <Text style={[e.freshness, freshness !== "fresh" && e.freshnessAttention]} numberOfLines={1}>
          {freshnessLabel}
        </Text>
      </View>

      <Text style={e.value} numberOfLines={1}>
        {value}{unit ? ` ${unit}` : ""}
      </Text>

      <View style={e.meta}>
        <Text style={[e.age, freshness === "stale" && e.ageStale]} numberOfLines={1}>
          {ageLabel}
        </Text>
        {originLabel ? (
          <Text style={e.origin} numberOfLines={1}>
            {originLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) => ({
  ...StyleSheet.create({
    base: {
      minWidth: 96,
      borderWidth: 1,
      borderRadius: RAIO.input,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.sm,
      backgroundColor: t.cores.bg,
      borderColor: t.cores.border,
      gap: 3,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.xs,
    },
    label: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, flex: 1 },
    freshness: {
      fontSize: 9,
      lineHeight: 11,
      color: t.cores.textSecondary,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    freshnessAttention: { color: t.cores.warning },
    value: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "900" },
    meta: { gap: 1 },
    age: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "600" },
    ageStale: { color: t.cores.warning, fontWeight: "800" },
    origin: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "500" },
  }),
  tone: StyleSheet.create({
    fresh: { borderColor: t.cores.border },
    aging: { borderColor: t.cores.warning },
    stale: { borderColor: t.cores.warning, borderWidth: 2 },
  }),
});
