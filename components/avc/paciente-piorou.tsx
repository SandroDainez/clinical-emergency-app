/**
 * «PACIENTE PIOROU» — ação GLOBAL do AVC (ajuste de rota do autor, 2026-09-13; AC-10, A11).
 *
 * ⚠️ O botão mora no topo fixo do shell, ⛔ fora da rolagem: ele ⛔ some ao rolar, ⛔ nem
 * fica atrás de bloco recolhido, em ⛔ nenhuma superfície.
 *
 * ⚠️ O diálogo diz o que o registro faz ⛔ e pede só o que o autor pediu: texto livre
 * opcional. ⛔ Sem limiar, ⛔ sem conduta — o horário ⛔ e o autor são carimbados.
 * «Cancelar» ⛔ registra nada.
 */
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

export function BotaoPacientePiorou({ onPress }: { onPress: () => void }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tr("Paciente piorou: registrar e reavaliar agora")}
      testID="avc-piorou"
      style={({ pressed }) => [e.botaoGlobal, pressed ? e.pressionado : null]}
    >
      <Text style={e.botaoGlobalTexto}>{tr("Paciente piorou")}</Text>
    </Pressable>
  );
}

export function DialogoPacientePiorou({
  aberto,
  onRegistrar,
  onCancelar,
}: {
  aberto: boolean;
  onRegistrar: (texto: string) => void;
  onCancelar: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const corDoPlaceholder = useEstilosDoTema((tema) => ({ cor: { color: tema.cores.textSecondary } })).cor
    .color as string;
  const [texto, setTexto] = useState("");
  useEffect(() => {
    if (aberto) setTexto("");
  }, [aberto]);
  return (
    <Modal visible={aberto} transparent animationType="none" onRequestClose={onCancelar}>
      <View style={e.fundo}>
        {aberto ? (
          <View style={e.caixa} testID="avc-piorou-dialogo" accessibilityViewIsModal>
            <Text style={e.titulo}>{tr("Paciente piorou")}</Text>
            <Text style={e.texto}>
              {tr("Registra o evento com o seu nome e o horário, cria a tarefa «Reavaliar agora» e reabre a avaliação de ameaças da Estabilização. Nada do que já foi registrado é apagado.")}
            </Text>
            <TextInput
              style={e.entrada}
              value={texto}
              onChangeText={setTexto}
              placeholder={tr("O que mudou (opcional)")}
              placeholderTextColor={corDoPlaceholder}
              accessibilityLabel={tr("O que mudou (opcional)")}
              multiline
              testID="avc-piorou-texto"
            />
            <View style={e.linha}>
              <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-piorou-cancelar" onPress={onCancelar}>
                <Text style={e.botaoSecundarioTexto}>{tr("Cancelar")}</Text>
              </Pressable>
              <Pressable style={e.botaoPrincipal} accessibilityRole="button" testID="avc-piorou-registrar" onPress={() => onRegistrar(texto)}>
                <Text style={e.botaoPrincipalTexto}>{tr("Registrar piora")}</Text>
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
    botaoGlobal: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1.5,
      borderColor: tema.cores.critical,
      backgroundColor: tema.cores.criticalTint,
    },
    botaoGlobalTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    pressionado: { opacity: 0.8 },
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
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.primaryFill,
      backgroundColor: tema.cores.primaryFill,
    },
    botaoPrincipalTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill },
  });
