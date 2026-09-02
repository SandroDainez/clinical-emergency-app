import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, SOMBRA, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type HeaderProps = {
  titulo: string;
  etapa?: string;
  onVoltar?: () => void;
  labelVoltar?: string;
  direita?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Cabeçalho compacto do cockpit clínico. */
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
          <Text style={e.seta}>‹</Text>
        </Pressable>
      ) : null}

      <View style={e.identidade}>
        <Text style={e.titulo} numberOfLines={1}>
          {titulo}
        </Text>
        {etapa ? <Text style={e.etapa} numberOfLines={1}>{etapa}</Text> : null}
      </View>

      {direita ? <View style={e.direita}>{direita}</View> : null}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    barra: {
      minHeight: 60,
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      borderBottomWidth: 1,
      borderBottomColor: t.cores.border,
      backgroundColor: t.cores.surface,
      ...SOMBRA,
      shadowOpacity: 0.04,
    },
    voltar: {
      width: TOQUE.minimo,
      height: TOQUE.minimo,
      borderRadius: TOQUE.minimo / 2,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: -ESPACO.xs,
    },
    pressionado: { opacity: 0.55, transform: [{ scale: 0.96 }] },
    seta: { fontSize: 36, lineHeight: 38, color: t.cores.text, fontWeight: "400" },
    identidade: { flex: 1, minWidth: 0, justifyContent: "center", gap: 1 },
    titulo: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    etapa: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "500" },
    direita: { justifyContent: "center", alignItems: "flex-end" },
  });
