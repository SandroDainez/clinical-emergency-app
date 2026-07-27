import {
  Modal as ModalRN,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type BottomSheetProps = {
  visivel: boolean;
  onFechar: () => void;
  titulo?: string;
  children?: React.ReactNode;
  testID?: string;
};

/**
 * Painel que sobe pela base — o destino do "ver mais" do plano.
 *
 * Por que não `@gorhom/bottom-sheet` (nem Vaul, que é DOM-only): o gorhom exige
 * envolver a árvore num `GestureHandlerRootView` no layout raiz. Mexer no
 * `app/_layout.tsx` é justamente onde mora o risco de reintroduzir o L-001, e
 * este painel não precisa de arrasto com física para cumprir a função: mostrar
 * texto clínico que não coube na tela.
 *
 * Construído sobre o `Modal` do React Native — funciona igual em iOS, Android e
 * web, sem dependência nova e sem tocar na raiz do app.
 */
export function BottomSheet({
  visivel,
  onFechar,
  titulo,
  children,
  testID,
}: BottomSheetProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <ModalRN
      visible={visivel}
      transparent
      animationType="slide"
      onRequestClose={onFechar}
      testID={testID}
    >
      <View style={e.fundo}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Fechar"
          onPress={onFechar}
        />
        <View style={e.painel}>
          {/* Alça: sinaliza que o painel é dispensável. */}
          <View style={e.alca} />
          {titulo ? <Text style={e.titulo}>{titulo}</Text> : null}
          <ScrollView contentContainerStyle={e.conteudo}>{children}</ScrollView>
        </View>
      </View>
    </ModalRN>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    fundo: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
    painel: {
      maxHeight: "85%",
      backgroundColor: t.cores.bg,
      borderTopLeftRadius: RAIO.card,
      borderTopRightRadius: RAIO.card,
      borderTopWidth: 1,
      borderColor: t.cores.border,
      paddingHorizontal: ESPACO.md,
      paddingTop: ESPACO.sm,
      paddingBottom: ESPACO.xl,
      gap: ESPACO.sm,
    },
    alca: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: RAIO.badge,
      backgroundColor: t.cores.border,
      marginBottom: ESPACO.xs,
    },
    titulo: { ...TIPOGRAFIA.step, color: t.cores.text, minHeight: TOQUE.minimo - 12 },
    conteudo: { gap: ESPACO.sm, paddingBottom: ESPACO.md },
  });
