import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type SwitchProps = {
  valor: boolean;
  onChange: (valor: boolean) => void;
  rotulo?: string;
  descricao?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Alternador ligado/desligado.
 *
 * A linha inteira é tocável, não só o botão: alvo maior, menos erro. Sem
 * animação de mola — o retorno tem de ser imediato.
 */
export function Switch({
  valor,
  onChange,
  rotulo,
  descricao,
  disabled = false,
  style,
  testID,
}: SwitchProps) {
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: valor, disabled }}
      accessibilityLabel={rotulo}
      disabled={disabled}
      onPress={() => onChange(!valor)}
      testID={testID}
      style={({ pressed }) => [e.linha, pressed && !disabled && e.pressionada, disabled && e.inativo, style]}
    >
      <View style={e.textos}>
        {rotulo ? <Text style={e.rotulo}>{rotulo}</Text> : null}
        {descricao ? <Text style={e.descricao}>{descricao}</Text> : null}
      </View>
      <View style={[e.trilho, valor && e.trilhoLigado]}>
        <View style={[e.bolinha, valor && e.bolinhaLigada]} />
      </View>
    </Pressable>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    linha: {
      minHeight: TOQUE.minimo,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    pressionada: { opacity: 0.85 },
    inativo: { opacity: 0.4 },
    textos: { flex: 1, gap: 2 },
    rotulo: { ...TIPOGRAFIA.caption, color: t.cores.text },
    descricao: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "400" },
    trilho: {
      width: 52,
      height: 32,
      borderRadius: RAIO.badge,
      backgroundColor: t.cores.border,
      padding: 3,
      justifyContent: "center",
    },
    trilhoLigado: { backgroundColor: t.cores.primary },
    bolinha: {
      width: 26,
      height: 26,
      borderRadius: RAIO.badge,
      backgroundColor: t.cores.bg,
    },
    bolinhaLigada: { alignSelf: "flex-end", backgroundColor: t.cores.onPrimary },
  });
