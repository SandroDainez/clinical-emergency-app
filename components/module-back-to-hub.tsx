import { Pressable, StyleSheet, Text } from "react-native";

import * as DS from "@/constants/app-design";

const AppDesign = DS.AppDesign;

type Props = {
  onPress: () => void;
};

/** Volta à lista de módulos (hub Protocolos). */
export function ModuleBackToHubLink({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      accessibilityRole="button"
      accessibilityLabel="Voltar aos módulos">
      <Text style={styles.txt}>← Módulos</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    backgroundColor: AppDesign.accent.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#a5f3fc",
  },
  btnPressed: {
    opacity: 0.88,
  },
  txt: {
    fontSize: 13,
    fontWeight: "800",
    color: AppDesign.accent.teal,
  },
});
