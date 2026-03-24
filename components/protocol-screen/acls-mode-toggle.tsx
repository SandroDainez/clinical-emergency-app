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
      <Text style={styles.modeSwitchTitle}>Modo de uso</Text>
      <Text style={styles.modeSwitchHint}>
        Training mostra mais contexto. Code reduz texto e destaca a ação imediata.
      </Text>
      <View style={styles.modeSwitchRow}>
        <Pressable
          style={[styles.modeSwitchButton, mode === "training" && styles.modeSwitchButtonActive]}
          onPress={() => onChange("training")}>
          <Text
            style={[
              styles.modeSwitchButtonText,
              mode === "training" && styles.modeSwitchButtonTextActive,
            ]}>
            Training
          </Text>
          <Text
            style={[
              styles.modeSwitchButtonSubtext,
              mode === "training" && styles.modeSwitchButtonSubtextActive,
            ]}>
            Mais explicação
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
            Code
          </Text>
          <Text
            style={[
              styles.modeSwitchButtonSubtext,
              mode === "code" && styles.modeSwitchButtonSubtextActive,
            ]}>
            Mais direto
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default AclsModeToggle;
