import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, TIPOGRAFIA } from "../../design-system/tokens";
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
 *
 * No cockpit 2.0 ela funciona como `eyebrow`, não como um segundo card. Isso
 * mantém "Decisão clínica" / "Conduta — fazer agora" visíveis sem competir com
 * o título e com a ação que o médico precisa executar.
 */
export function Tag({ label, style, testID }: TagProps) {
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={[e.base, style]} testID={testID}>
      <View style={e.marca} />
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
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      minHeight: 20,
    },
    marca: {
      width: 4,
      height: 4,
      borderRadius: 999,
      backgroundColor: t.cores.primary,
    },
    texto: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontWeight: "800",
    },
  });
