/**
 * «PRECISO DE AJUDA» — o outro botão GLOBAL do AVC (autor, 2026-09-13, 11ª rodada;
 * fecha AC-10). Mora no topo fixo, ao lado do «Paciente piorou».
 *
 * ⚠️ Opções do PDF. Cada uma (menos «paciente piorou») mostra o que existe no módulo ⛔
 * — ou DIZ que ⛔ existe —, oferece caminhos para superfícies com retorno preservado ⛔ e
 * permite registrar a conduta adotada fora do app. ⛔ Sem sugerir substituto, ⛔ sem
 * simular execução. «Paciente piorou» chama o mecanismo existente.
 *
 * ⚠️ ⛔ Beco sem saída: todo painel tem caminho, registro, «Voltar às opções» ⛔ e «Fechar».
 */
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { OPCOES_DE_AJUDA } from "../../avc/conteudo/ajuda";
import type { SuperficieId } from "../../avc/nucleo/tipos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

export function BotaoPrecisoDeAjuda({ onPress }: { onPress: () => void }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tr("Preciso de ajuda")}
      testID="avc-ajuda"
      style={({ pressed }) => [e.botaoGlobal, pressed ? e.pressionado : null]}
    >
      <Text style={e.botaoGlobalTexto}>{tr("Preciso de ajuda")}</Text>
    </Pressable>
  );
}

export function DialogoDeAjuda({
  aberto,
  onFechar,
  onCaminho,
  onRegistrar,
  onPiora,
}: {
  aberto: boolean;
  onFechar: () => void;
  onCaminho: (superficie: SuperficieId) => void;
  onRegistrar: (opcao: string, texto: string) => void;
  onPiora: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const corDoPlaceholder = useEstilosDoTema((tema) => ({ cor: { color: tema.cores.textSecondary } })).cor
    .color as string;
  const [opcao, setOpcao] = useState<string | undefined>(undefined);
  const [texto, setTexto] = useState("");
  const [registrado, setRegistrado] = useState(false);
  useEffect(() => {
    if (!aberto) {
      setOpcao(undefined);
      setTexto("");
      setRegistrado(false);
    }
  }, [aberto]);
  const atual = OPCOES_DE_AJUDA.find((o) => o.id === opcao);

  return (
    <Modal visible={aberto} transparent animationType="none" onRequestClose={onFechar}>
      <View style={e.fundo}>
        {aberto ? (
          <View style={e.caixa} testID="avc-ajuda-dialogo" accessibilityViewIsModal>
            <ScrollView contentContainerStyle={e.conteudo}>
              {atual === undefined ? (
                <>
                  <Text style={e.titulo}>{tr("Preciso de ajuda")}</Text>
                  {OPCOES_DE_AJUDA.map((o) => (
                    <Pressable
                      key={o.id}
                      style={e.opcao}
                      accessibilityRole="button"
                      testID={`avc-ajuda-opcao-${o.id}`}
                      onPress={() => {
                        if (o.abrePiora === true) {
                          onPiora();
                          return;
                        }
                        setOpcao(o.id);
                        setTexto("");
                        setRegistrado(false);
                      }}
                    >
                      <Text style={e.opcaoTexto}>{tr(o.rotulo)}</Text>
                    </Pressable>
                  ))}
                  <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-ajuda-fechar" onPress={onFechar}>
                    <Text style={e.botaoSecundarioTexto}>{tr("Fechar")}</Text>
                  </Pressable>
                </>
              ) : (
                <View style={e.painel} testID={`avc-ajuda-painel-${atual.id}`}>
                  <Text style={e.titulo}>{tr(atual.rotulo)}</Text>
                  <Text style={e.texto} testID="avc-ajuda-texto-da-opcao">{tr(atual.texto ?? "")}</Text>
                  {atual.caminhos.map((c) => (
                    <Pressable
                      key={c.superficie}
                      style={e.opcao}
                      accessibilityRole="button"
                      testID={`avc-ajuda-caminho-${atual.id}-${c.superficie}`}
                      onPress={() => onCaminho(c.superficie)}
                    >
                      <Text style={e.opcaoTexto}>{tr(c.rotulo)}</Text>
                    </Pressable>
                  ))}
                  {atual.registraCondutaExterna ? (
                    <View style={e.registro}>
                      <Text style={e.rotulo}>{tr("Conduta adotada fora do app (registro da equipe)")}</Text>
                      <TextInput
                        style={e.entrada}
                        value={texto}
                        onChangeText={(t) => {
                          setTexto(t);
                          setRegistrado(false);
                        }}
                        placeholder={tr("O que foi feito")}
                        placeholderTextColor={corDoPlaceholder}
                        accessibilityLabel={tr("Conduta adotada fora do app (registro da equipe)")}
                        multiline
                        testID="avc-ajuda-conduta"
                      />
                      <Pressable
                        style={e.botaoPrincipal}
                        accessibilityRole="button"
                        testID="avc-ajuda-registrar"
                        onPress={() => {
                          if (texto.trim() === "") return;
                          onRegistrar(atual.id, texto);
                          setTexto("");
                          setRegistrado(true);
                        }}
                      >
                        <Text style={e.botaoPrincipalTexto}>{tr("Registrar conduta externa")}</Text>
                      </Pressable>
                      {registrado ? (
                        <Text style={e.texto} testID="avc-ajuda-registrado">
                          {tr("Conduta externa registrada na linha do tempo.")}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                  <View style={e.linha}>
                    <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-ajuda-voltar" onPress={() => setOpcao(undefined)}>
                      <Text style={e.botaoSecundarioTexto}>{tr("Voltar às opções")}</Text>
                    </Pressable>
                    <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-ajuda-fechar" onPress={onFechar}>
                      <Text style={e.botaoSecundarioTexto}>{tr("Fechar")}</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    botaoGlobal: {
      flex: 1,
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1.5,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    botaoGlobalTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    pressionado: { opacity: 0.8 },
    fundo: { flex: 1, justifyContent: "center", padding: ESPACO.md, backgroundColor: "rgba(0,0,0,0.6)" },
    caixa: {
      maxHeight: "90%",
      borderRadius: RAIO.card,
      borderWidth: 1.5,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.surface,
    },
    conteudo: { gap: ESPACO.sm, padding: ESPACO.md },
    painel: { gap: ESPACO.sm },
    registro: { gap: ESPACO.xs },
    titulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    texto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    rotulo: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    opcao: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    opcaoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    entrada: {
      ...PAPEL.textoPrincipal,
      color: tema.cores.text,
      minHeight: TOQUE.minimo * 1.5,
      padding: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
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
      alignItems: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.primaryFill,
      backgroundColor: tema.cores.primaryFill,
    },
    botaoPrincipalTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill },
  });
