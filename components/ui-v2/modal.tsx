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
import { Button } from "./button";

export type ModalProps = {
  visivel: boolean;
  onFechar: () => void;
  titulo?: string;
  children?: React.ReactNode;
  /** Ação principal do rodapé. Sem ela, o modal é só informativo. */
  acao?: { label: string; onPress: () => void; critico?: boolean };
  /** Rótulo do botão de dispensar. Padrão: "Fechar". */
  labelFechar?: string;
  testID?: string;
};

/**
 * Diálogo centralizado.
 *
 * Usa o `Modal` do React Native, que já resolve foco, camada e botão voltar do
 * Android nas três plataformas — em vez de portal do DOM, que não existe aqui.
 *
 * Regra de uso: modal interrompe. Em tela de emergência, só para confirmação
 * irreversível ou erro que impede seguir. Conteúdo de apoio vai em BottomSheet.
 */
export function Modal({
  visivel,
  onFechar,
  titulo,
  children,
  acao,
  labelFechar = "Fechar",
  testID,
}: ModalProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <ModalRN
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={onFechar}
      testID={testID}
    >
      <View style={e.fundo}>
        {/* Toque fora fecha — mas só quando não há ação obrigatória. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel={labelFechar}
          onPress={acao ? undefined : onFechar}
        />
        <View style={e.caixa} accessibilityViewIsModal>
          {titulo ? <Text style={e.titulo}>{titulo}</Text> : null}
          <ScrollView style={e.corpo} contentContainerStyle={e.corpoConteudo}>
            {children}
          </ScrollView>
          <View style={e.rodape}>
            <Button label={labelFechar} variant="ghost" onPress={onFechar} />
            {acao ? (
              <Button
                label={acao.label}
                variant={acao.critico ? "danger" : "primary"}
                onPress={acao.onPress}
              />
            ) : null}
          </View>
        </View>
      </View>
    </ModalRN>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    fundo: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      alignItems: "center",
      justifyContent: "center",
      padding: ESPACO.lg,
    },
    caixa: {
      width: "100%",
      maxWidth: 480,
      maxHeight: "80%",
      backgroundColor: t.cores.bg,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: t.cores.border,
      padding: ESPACO.md,
      gap: ESPACO.md,
    },
    titulo: { ...TIPOGRAFIA.step, color: t.cores.text },
    corpo: { flexGrow: 0 },
    corpoConteudo: { gap: ESPACO.sm },
    rodape: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: ESPACO.sm,
      minHeight: TOQUE.minimo,
    },
  });
