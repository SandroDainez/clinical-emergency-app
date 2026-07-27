import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type HeaderProps = {
  titulo: string;
  /** Aparece como "· Etapa 3" ao lado do título. */
  etapa?: string;
  onVoltar?: () => void;
  labelVoltar?: string;
  /** Elemento à direita (ação, indicador). */
  direita?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Cabeçalho compacto — UMA linha.
 *
 * É a correção do problema que o plano aponta: os cabeçalhos empilhados de hoje
 * ocupam quase metade da tela, espaço que na emergência pertence à conduta.
 * Voltar + módulo + etapa cabem numa linha só.
 */
export function Header({
  titulo,
  etapa,
  onVoltar,
  labelVoltar = "Voltar",
  direita,
  style,
  testID,
}: HeaderProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={[e.barra, style]} testID={testID}>
      {onVoltar ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={labelVoltar}
          onPress={onVoltar}
          hitSlop={ESPACO.sm}
          style={({ pressed }) => [e.voltar, pressed && e.pressionado]}
        >
          <Text style={e.seta}>←</Text>
        </Pressable>
      ) : null}

      <Text style={e.titulo} numberOfLines={1}>
        {titulo}
        {etapa ? <Text style={e.etapa}>{`  ·  ${etapa}`}</Text> : null}
      </Text>

      {direita ? <View style={e.direita}>{direita}</View> : null}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    barra: {
      minHeight: TOQUE.minimo,
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      borderBottomWidth: 1,
      borderBottomColor: t.cores.border,
      backgroundColor: t.cores.bg,
    },
    voltar: {
      width: TOQUE.minimo,
      height: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: -ESPACO.sm,
    },
    pressionado: { opacity: 0.6 },
    seta: { ...TIPOGRAFIA.step, color: t.cores.text },
    titulo: { flex: 1, ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    etapa: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "500" },
    direita: { justifyContent: "center" },
  });
