import { Pressable, StyleSheet, Text } from "react-native";
import { useTr } from "../lib/use-tr";

type Props = {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
};

/** Volta à lista de módulos (hub Protocolos). */
export function ModuleBackToHubLink({
  onPress,
  label = "← Módulos",
  accessibilityLabel = "Voltar aos módulos",
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <Text style={styles.txt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(14,116,144,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4d9aff",
  },
  btnPressed: {
    opacity: 0.88,
  },
  txt: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4d9aff",
  },
});
