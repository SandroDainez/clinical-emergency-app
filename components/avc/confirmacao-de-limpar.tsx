/**
 * CONFIRMAÇÃO DO «LIMPAR» AUDITADO — D-PEND-26 (AC-63), decisão do autor, 2026-09-13.
 *
 * ⚠️ Aparece ⛔ só quando a resposta sustenta retenção ⛔ ou bloqueio
 * (`avc/nucleo/limpar-auditado.ts`). ⛔ Não é atalho: é o ato explícito de declarar que
 * a resposta foi um toque errado, ⛔ e ⛔ ele fica na trilha com esse motivo.
 * ⚠️ Três toques mais esta confirmação para desfazer um engano — "o custo certo" (autor).
 */
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

export type PedidoDeLimpar = {
  readonly campo: string;
  readonly rotulo: string;
  /** Rótulos das respostas vigentes — ⛔ o que será corrigido. */
  readonly respostas: readonly string[];
};

export function ConfirmacaoDeLimpar({
  pedido,
  onConfirmar,
  onCancelar,
}: {
  pedido: PedidoDeLimpar | undefined;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    /** ⚠️ Sem animação: confirmação de segurança ⛔ fica meio visível enquanto o dedo já pode tocar. */
    <Modal visible={pedido !== undefined} transparent animationType="none" onRequestClose={onCancelar}>
      <View style={e.fundo}>
        {pedido ? (
          <View style={e.caixa} testID="avc-confirmar-limpar" accessibilityViewIsModal>
            <Text style={e.titulo}>{tr("Foi engano?")}</Text>
            <Text style={e.texto}>
              {tr("Resposta registrada para")} «{tr(pedido.rotulo)}»: {pedido.respostas.map((r) => `«${tr(r)}»`).join(" · ")}.
            </Text>
            <Text style={e.texto}>
              {tr("Esta resposta sustenta uma retenção ou um bloqueio. Limpar registra uma correção com motivo «toque errado» e devolve a pergunta a não respondida.")}
            </Text>
            <View style={e.linha}>
              <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-confirmar-limpar-cancelar" onPress={onCancelar}>
                <Text style={e.botaoSecundarioTexto}>{tr("Manter a resposta")}</Text>
              </Pressable>
              <Pressable style={e.botaoPrincipal} accessibilityRole="button" testID="avc-confirmar-limpar-sim" onPress={onConfirmar}>
                <Text style={e.botaoPrincipalTexto}>{tr("Foi engano — limpar")}</Text>
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
