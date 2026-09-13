/**
 * AVISOS DO ATENDIMENTO PERSISTIDO — ⛔ só o necessário para recuperar o caso (AC-02).
 *
 *   · carregando: o módulo está lendo o registro local;
 *   · bloqueado: o mesmo caso já está aberto em outra aba (D-PEND-03);
 *   · caso recuperado: diz que o atendimento veio do registro ⛔ e oferece
 *     encerrá-lo — ⚠️ com confirmação, porque encerrar é irreversível na tela;
 *   · falha ao gravar: o atendimento continua, ⛔ mas só nesta aba.
 *
 * ⛔ Nenhum conteúdo clínico mora aqui.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MENSAGEM_CASO_ABERTO_EM_OUTRA_ABA } from "../../avc/persistencia/trava";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import type { FaseDoAtendimento } from "./use-atendimento-persistido";

function horaCurta(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function AtendimentoIndisponivel({ fase }: { fase: Exclude<FaseDoAtendimento, "pronto"> }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  if (fase === "bloqueado") {
    return (
      <View style={e.alerta} testID="avc-caso-aberto-em-outra-aba">
        <Text style={e.alertaTexto}>{tr(MENSAGEM_CASO_ABERTO_EM_OUTRA_ABA)}</Text>
      </View>
    );
  }
  return (
    <View style={e.aviso} testID="avc-recuperando">
      <Text style={e.avisoTexto}>{tr("Abrindo o registro local do atendimento…")}</Text>
    </View>
  );
}

export function FaixaDoAtendimentoPersistido({
  recuperadoDe,
  falhaAoGravar,
  onEncerrar,
}: {
  recuperadoDe: number | undefined;
  falhaAoGravar: boolean;
  onEncerrar: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const [confirmando, setConfirmando] = useState(false);
  if (recuperadoDe === undefined && !falhaAoGravar) return null;
  return (
    <View style={e.faixa}>
      {falhaAoGravar ? (
        <Text style={e.alertaTexto} testID="avc-persistencia-falhou">
          {tr("O registro local falhou: este atendimento continua só nesta aba.")}
        </Text>
      ) : null}
      {recuperadoDe !== undefined ? (
        <View style={e.recuperado} testID="avc-caso-recuperado">
          <Text style={e.avisoTexto}>
            {tr("Atendimento recuperado do registro local, aberto às")} {horaCurta(recuperadoDe)}
          </Text>
          {confirmando ? (
            <View style={e.linha}>
              <Pressable style={e.botao} accessibilityRole="button" testID="avc-encerrar-confirmar" onPress={onEncerrar}>
                <Text style={e.botaoTexto}>{tr("Confirmar: encerrar e abrir novo")}</Text>
              </Pressable>
              <Pressable style={e.botao} accessibilityRole="button" testID="avc-encerrar-cancelar" onPress={() => setConfirmando(false)}>
                <Text style={e.botaoTexto}>{tr("Continuar este atendimento")}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={e.botao} accessibilityRole="button" testID="avc-encerrar-atendimento" onPress={() => setConfirmando(true)}>
              <Text style={e.botaoTexto}>{tr("Encerrar este atendimento e abrir um novo")}</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    aviso: { padding: ESPACO.md, gap: ESPACO.sm },
    avisoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    alerta: {
      margin: ESPACO.md,
      padding: ESPACO.md,
      borderRadius: RAIO.card,
      borderWidth: 1.5,
      borderColor: tema.cores.critical,
      backgroundColor: tema.cores.surface,
    },
    alertaTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.critical },
    faixa: { gap: ESPACO.xs, paddingHorizontal: ESPACO.md, paddingTop: ESPACO.sm },
    recuperado: {
      gap: ESPACO.sm,
      padding: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.surface,
    },
    linha: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    botao: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.surfaceElevated,
    },
    botaoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
  });
