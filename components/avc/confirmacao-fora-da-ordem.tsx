/**
 * CONFIRMAÇÃO DE REGISTRO FORA DA ORDEM CAUSAL — AC-13 reaberto, item 5 (autor, 2026-09-14; `docs/decisoes.md`,
 * seção "AC-13 reaberto", §5 e §9, opção B).
 *
 * ⚠️ Aparece quando a situação escolhida contraria a ordem decidida pelo autor (`avc/nucleo/ordem-da-acao.ts`).
 * ⛔ Não bloqueia: registrar continua possível, como correção explícita do registro anterior, marcada na trilha.
 * ⚠️ O destaque visual fica no caminho seguro («Não registrar»), como na D-PEND-27.
 */
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { ROTULO_DO_ESTADO_DA_ACAO } from "../../avc/conteudo/superficie-e";
import type { ViolacaoDaOrdem } from "../../avc/nucleo/ordem-da-acao";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

export type PedidoForaDaOrdem = {
  readonly instancia: string;
  readonly campo: string;
  readonly valor: string;
  readonly violacao: ViolacaoDaOrdem;
};

export function ConfirmacaoForaDaOrdem({
  pedido,
  onRegistrarComoCorrecao,
  onCancelar,
}: {
  pedido: PedidoForaDaOrdem | undefined;
  onRegistrarComoCorrecao: () => void;
  onCancelar: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const v = pedido?.violacao;
  const novo = v ? `«${tr(ROTULO_DO_ESTADO_DA_ACAO[v.novo])}»` : "";
  const referencia = v?.referencia ? `«${tr(ROTULO_DO_ESTADO_DA_ACAO[v.referencia.estado])}»` : "";
  const iniciada = `«${tr(ROTULO_DO_ESTADO_DA_ACAO.iniciado)}»`;
  return (
    <Modal visible={pedido !== undefined} transparent animationType="none" onRequestClose={onCancelar}>
      <View style={e.fundo}>
        {v ? (
          <View style={e.caixa} testID="avc-confirmar-ordem" accessibilityViewIsModal>
            <Text style={e.titulo}>{tr("Registro fora da ordem")}</Text>
            <Text style={e.texto}>
              {v.regra === "retrocesso"
                ? `${novo} ${tr("vem antes de")} ${referencia}, ${tr("já registrada nesta ação.")}`
                : v.regra === "cancelada_depois_do_inicio"
                  ? `${novo} ${tr("só vale antes de")} ${iniciada}, ${tr("e esta ação já tem")} ${referencia} ${tr("registrada.")}`
                  : v.regra === "saida_de_estado_terminal"
                    ? `${referencia} ${tr("encerra esta ação. Mudar para")} ${novo} ${tr("só vale como correção ou reabertura explícita.")}`
                    : `${novo} ${tr("só vale depois de")} ${iniciada}, ${tr("que não foi registrada nesta ação.")}`}
            </Text>
            <Text style={e.texto}>
              {v.referencia
                ? tr("Registrar assim entra na trilha como correção do registro anterior, marcada fora da ordem causal. O que já foi registrado continua valendo.")
                : tr("Registrar assim entra na trilha marcado fora da ordem causal.")}
            </Text>
            <View style={e.linha}>
              <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-confirmar-ordem-corrigir" onPress={onRegistrarComoCorrecao}>
                <Text style={e.botaoSecundarioTexto}>{tr(v.referencia ? "Registrar como correção" : "Registrar fora da ordem")}</Text>
              </Pressable>
              <Pressable style={e.botaoPrincipal} accessibilityRole="button" testID="avc-confirmar-ordem-cancelar" onPress={onCancelar}>
                <Text style={e.botaoPrincipalTexto}>{tr("Não registrar")}</Text>
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
