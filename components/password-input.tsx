import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from "react-native";

type Props = Omit<TextInputProps, "secureTextEntry"> & {
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function PasswordInput({ inputStyle, containerStyle, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={[styles.wrap, containerStyle]}>
      <TextInput
        {...rest}
        style={[inputStyle, styles.input]}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        style={({ pressed }) => [styles.eyeBtn, pressed && { opacity: 0.6 }]}
        onPress={() => setVisible((v) => !v)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={22} color="#9fb2cc" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative", justifyContent: "center" },
  input: { paddingRight: 46 },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,
    width: 38,
    alignItems: "center",
    justifyContent: "center",
  },
});
