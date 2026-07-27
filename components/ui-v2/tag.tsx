import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type TagProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Etiqueta de categoria (área clínica, fonte da diretriz).
 *
 * Diferença para `Badge`: Badge comunica ESTADO e por isso tem cor semântica;
 * Tag apenas classifica, e é sempre neutra — se toda etiqueta tiver cor, a cor
 * deixa de significar alguma coisa.
 */
export function Tag({ label, style, testID }: TagProps) {
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={[e.base, style]} testID={testID}>
      <Text style={e.texto} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    base: {
      alignSelf: "flex-start",
      paddingHorizontal: ESPACO.sm,
      paddingVertical: 2,
      borderRadius: RAIO.badge,
      backgroundColor: t.cores.bg,
      borderWidth: 1,
      borderColor: t.cores.border,
    },
    texto: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
  });
