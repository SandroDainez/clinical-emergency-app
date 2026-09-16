/**
 * «PIORA CLÍNICA — O QUE FAZER AGORA» (D-140; autor, 2026-09-16).
 *
 * ⚠️ A tela que faltava: até aqui, «Paciente piorou» REGISTRAVA ⛔ e devolvia o médico a
 * uma tela de anotações. ⛔ Registrar ⛔ é conduzir. Esta tela abre logo depois do
 * registro ⛔ e diz o que o app consegue fazer AGORA.
 *
 * ⚠️⚠️ ⛔ CONTEÚDO CLÍNICO NOVO: ⛔ nenhuma frase é redigida aqui. A lista vem de
 * `acoesDaPioraClinica` — navegação, ⛔ e a Table 7 citada da constante.
 *
 * ⚠️ «Somente» é literal (pedido do autor): título, as ações ⛔ e sair. ⛔ Sem limiar, ⛔
 * sem número, ⛔ sem hipótese diagnóstica. A piora isolada ⛔ diagnostica hemorragia ⛔
 * nem cria contraindicação — ⛔ e esta tela ⛔ insinua que diagnostica.
 */
import { useEffect } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { AcaoDaPiora } from "../../avc/nucleo/deterioracao";
import { acoesDaPioraClinica } from "../../avc/nucleo/deterioracao";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

export function DialogoDaPioraClinica({
  aberto,
  estado,
  onAcao,
  onFechar,
}: {
  aberto: boolean;
  estado: EstadoAvc;
  onAcao: (acao: AcaoDaPiora) => void;
  onFechar: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const acoes = acoesDaPioraClinica(estado);

  /**
   * ⚠️ D-140 (autor, 2026-09-16): o modal BLOQUEIA de propósito — ⛔ e por isso precisa ser
   * RÁPIDO de dispensar. `Esc` no web; o `onRequestClose` do Modal cobre o botão «voltar».
   *
   * ⚠️⚠️ Dispensar ⛔ desfaz ⛔ nem corrige o evento de piora: ⛔ este atalho ⛔ toca no
   * estado clínico — ⛔ ele só fecha a camada de ação imediata. A piora já está registrada.
   */
  useEffect(() => {
    if (!aberto || typeof document === "undefined") return;
    const aoTeclar = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, onFechar]);

  return (
    <Modal visible={aberto} transparent animationType="none" onRequestClose={onFechar}>
      <View style={e.fundo}>
        {aberto ? (
          <View style={e.caixa} testID="avc-piora-acoes" accessibilityViewIsModal>
            <ScrollView contentContainerStyle={e.conteudo}>
              <Text style={e.titulo}>{tr("Piora clínica — o que fazer agora")}</Text>
              {acoes.map((a) => (
                <Pressable
                  key={a.id}
                  style={e.acao}
                  accessibilityRole="button"
                  accessibilityLabel={tr(a.rotulo)}
                  testID={`avc-piora-acao-${a.id}`}
                  onPress={() => onAcao(a)}
                >
                  <Text style={e.acaoTexto}>{tr(a.rotulo)}</Text>
                  {/**
                   * ⚠️ A procedência fica visível: o médico vê que ⛔ é opinião do app.
                   * ⛔ Isto ⛔ é conteúdo — é a etiqueta da fonte já transcrita.
                   */}
                  {a.fonte !== undefined ? <Text style={e.fonte}>{a.fonte}</Text> : null}
                </Pressable>
              ))}
              <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-piora-acoes-fechar" onPress={onFechar}>
                <Text style={e.botaoSecundarioTexto}>{tr("Continuar na tela atual")}</Text>
              </Pressable>
            </ScrollView>
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
      maxHeight: "90%",
      borderRadius: RAIO.card,
      borderWidth: 1.5,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.surface,
    },
    conteudo: { gap: ESPACO.sm, padding: ESPACO.md },
    titulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    acao: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      gap: ESPACO.xs,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    acaoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    fonte: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    botaoSecundario: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    botaoSecundarioTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
  });
