import { Pressable, StyleSheet, Text } from "react-native";

import { TOQUE } from "../design-system/tokens";
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
    backgroundColor: "rgba(77,154,255,0.15)",
    paddingHorizontal: 14,
    // 44 px é o mínimo do plano UI 2.0; antes eram 37 px de altura.
    minHeight: TOQUE.minimo,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#7fb3ff",
  },
  btnPressed: {
    opacity: 0.88,
  },
  txt: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7fb3ff",
  },
});
