import { Pressable, Text, View } from "react-native";
import type { AclsMode } from "../../clinical-engine";
import { styles } from "./protocol-screen-styles";

type AclsModeToggleProps = {
  mode: AclsMode;
  onChange: (mode: AclsMode) => void;
};

function AclsModeToggle({ mode, onChange }: AclsModeToggleProps) {
  return (
    <View style={styles.modeSwitchSection}>
      <Text style={styles.modeSwitchTitle}>Modo</Text>
      <View style={styles.modeSwitchRow}>
        <Pressable
          style={[styles.modeSwitchButton, mode === "training" && styles.modeSwitchButtonActive]}
          onPress={() => onChange("training")}>
          <Text
            style={[
              styles.modeSwitchButtonText,
              mode === "training" && styles.modeSwitchButtonTextActive,
            ]}>
            Treinamento
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeSwitchButton, mode === "code" && styles.modeSwitchButtonActive]}
          onPress={() => onChange("code")}>
          <Text
            style={[
              styles.modeSwitchButtonText,
              mode === "code" && styles.modeSwitchButtonTextActive,
            ]}>
            Operacional
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default AclsModeToggle;
