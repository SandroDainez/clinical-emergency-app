import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type ItemNavegacao = {
  id: string;
  label: string;
  /** Ícone opcional acima do rótulo. */
  icone?: React.ReactNode;
  /** Contador de pendências. 0 ou ausente não desenha nada. */
  contador?: number;
};

export type BottomNavigationProps = {
  itens: ItemNavegacao[];
  ativo: string;
  onSelecionar: (id: string) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Navegação inferior.
 *
 * APRESENTAÇÃO APENAS: recebe `ativo` e devolve o id tocado. Não navega, não
 * conhece rota, não guarda estado — quem decide para onde ir é a tela que a usa.
 * Essa separação é o que permite trocar a aparência sem tocar no roteamento.
 */
export function BottomNavigation({
  itens,
  ativo,
  onSelecionar,
  style,
  testID,
}: BottomNavigationProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={[e.barra, style]} accessibilityRole="tablist" testID={testID}>
      {itens.map((item) => {
        const selecionado = item.id === ativo;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: selecionado }}
            accessibilityLabel={item.label}
            onPress={() => onSelecionar(item.id)}
            style={({ pressed }) => [e.item, pressed && e.pressionado]}
          >
            {item.icone ? <View style={e.icone}>{item.icone}</View> : null}
            <Text style={[e.rotulo, selecionado && e.rotuloAtivo]} numberOfLines={1}>
              {item.label}
            </Text>
            {item.contador ? (
              <View style={e.contador}>
                <Text style={e.contadorTexto}>{item.contador > 99 ? "99+" : item.contador}</Text>
              </View>
            ) : null}
            {selecionado ? <View style={e.marcador} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    barra: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: t.cores.border,
      backgroundColor: t.cores.bg,
    },
    item: {
      flex: 1,
      minHeight: TOQUE.critico,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      paddingVertical: ESPACO.sm,
    },
    pressionado: { opacity: 0.7 },
    icone: { alignItems: "center", justifyContent: "center" },
    rotulo: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary },
    rotuloAtivo: { color: t.cores.primary, fontWeight: "800" },
    marcador: {
      position: "absolute",
      top: 0,
      height: 3,
      width: "45%",
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
      backgroundColor: t.cores.primary,
    },
    contador: {
      position: "absolute",
      top: ESPACO.xs,
      right: "24%",
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.cores.critical,
    },
    contadorTexto: { ...TIPOGRAFIA.micro, fontSize: 11, color: t.cores.onCritical },
  });
