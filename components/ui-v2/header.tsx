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
          accessibilityHint="Navegar para a tela anterior"
          onPress={onVoltar}
          hitSlop={ESPACO.sm}
          style={({ pressed }) => [e.voltar, pressed && e.pressionado]}
        >
          <Text style={e.seta}>‹</Text>
          <Text style={e.voltarTexto} numberOfLines={1}>{labelVoltar}</Text>
        </Pressable>
      ) : null}

      <View style={e.identidade}>
        <Text style={e.titulo} numberOfLines={1}>
          {titulo}
        </Text>
        {etapa ? (
          <View style={e.etapaLinha}>
            <Text style={e.etapaRotulo}>ETAPA ATUAL</Text>
            <Text style={e.etapa} numberOfLines={1}>{etapa}</Text>
          </View>
        ) : null}
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
      minHeight: TOQUE.minimo,
      minWidth: TOQUE.minimo,
      maxWidth: 92,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      borderRadius: TOQUE.minimo / 2,
      paddingHorizontal: ESPACO.xs,
      marginLeft: -ESPACO.xs,
    },
    pressionado: { opacity: 0.55, transform: [{ scale: 0.96 }] },
    seta: { fontSize: 30, lineHeight: 32, color: t.cores.textSecondary, fontWeight: "400" },
    voltarTexto: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "700" },
    identidade: { flex: 1, minWidth: 0, justifyContent: "center", gap: 3 },
    titulo: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    etapaLinha: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      minWidth: 0,
    },
    etapaRotulo: {
      fontSize: 9,
      lineHeight: 11,
      color: t.cores.primary,
      fontWeight: "900",
      letterSpacing: 0.6,
    },
    etapa: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "600", flexShrink: 1 },
    direita: { justifyContent: "center", alignItems: "flex-end" },
  });
