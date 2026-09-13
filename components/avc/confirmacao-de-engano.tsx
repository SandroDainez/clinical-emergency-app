/**
 * CONFIRMAÇÃO DE CORREÇÃO "REGISTRADO POR ENGANO" — 11ª rodada (autor, 2026-09-13).
 *
 * ⚠️ O mesmo padrão da D-PEND-26/27: o registro ⛔ some, ganha correção auditada; ⛔ o
 * destaque visual fica no caminho seguro («Manter o registro»). Usada pela piora
 * (AC-67) ⛔ e por cada marco da transferência.
 */
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

export function ConfirmacaoDeEngano({
  aberto,
  titulo,
  texto,
  onManter,
  onCorrigir,
}: {
  aberto: boolean;
  titulo: string;
  texto: string;
  onManter: () => void;
  onCorrigir: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Modal visible={aberto} transparent animationType="none" onRequestClose={onManter}>
      <View style={e.fundo}>
        {aberto ? (
          <View style={e.caixa} testID="avc-confirmar-engano" accessibilityViewIsModal>
            <Text style={e.titulo}>{tr(titulo)}</Text>
            <Text style={e.texto}>{tr(texto)}</Text>
            <View style={e.linha}>
              <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-confirmar-engano-sim" onPress={onCorrigir}>
                <Text style={e.botaoSecundarioTexto}>{tr("Foi engano — corrigir")}</Text>
              </Pressable>
              <Pressable style={e.botaoPrincipal} accessibilityRole="button" testID="avc-confirmar-engano-manter" onPress={onManter}>
                <Text style={e.botaoPrincipalTexto}>{tr("Manter o registro")}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    fundo: { flex: 1, justifyContent: "center", padding: ESPACO.md, backgroundColor: "rgba(0,0,0,0.6)" },
    caixa: {
      gap: ESPACO.sm,
      padding: ESPACO.md,
      borderRadius: RAIO.card,
      borderWidth: 1.5,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.surface,
    },
    titulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    texto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    linha: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm, justifyContent: "flex-end" },
    botaoSecundario: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    botaoSecundarioTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    botaoPrincipal: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.primaryFill,
      backgroundColor: tema.cores.primaryFill,
    },
    botaoPrincipalTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill },
  });
