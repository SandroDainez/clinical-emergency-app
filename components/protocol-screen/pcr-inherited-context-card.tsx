import { StyleSheet, Text, View } from "react-native";
import type { PcrInheritedContextViewModel } from "../../lib/pcr-handoff-context-adapter";

export type PcrInheritedContextCardProps = {
  model: PcrInheritedContextViewModel;
  now?: number;
};

function formatAge(recordedAt: number | undefined, now: number): string {
  if (!recordedAt) return "não registrado";
  const seconds = Math.max(0, Math.floor((now - recordedAt) / 1000));
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h atrás`;
}

/**
 * Contexto herdado é informativo. Este card não executa ação, não cria botão e
 * não interfere no algoritmo/temporizadores da PCR.
 */
export default function PcrInheritedContextCard({
  model,
  now = Date.now(),
}: PcrInheritedContextCardProps) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.eyebrow}>CONTEXTO HERDADO · {model.sourceLabel}</Text>
      <Text style={styles.title}>{model.title}</Text>
      <Text style={styles.note}>
        Use como contexto do que ocorreu antes da perda do pulso. A reanimação não deve ser atrasada para completar dados ausentes.
      </Text>

      <View style={styles.list}>
        {model.items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.main}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={item.missing ? styles.missingValue : styles.value}>{item.value}</Text>
            </View>
            <Text style={styles.age}>{formatAge(item.recordedAt, now)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#D8E0EA",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#53657A",
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#10233F",
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: "#53657A",
  },
  list: {
    gap: 8,
    marginTop: 4,
  },
  row: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F6",
  },
  main: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#53657A",
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10233F",
  },
  missingValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9A5B13",
  },
  age: {
    fontSize: 12,
    color: "#53657A",
    textAlign: "right",
  },
});
