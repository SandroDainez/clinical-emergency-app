/**
 * MARCOS DA TRANSFERÊNCIA — eventos de uma linha do tempo (autor, 2026-09-13, 11ª rodada).
 *
 * ⚠️ ⛔ Seletor de estado sugeria que se ESCOLHE um marco; ⚠️ marcos ACONTECEM. A ação é
 * «Registrar marco» (tipo + quando aconteceu) ⛔ e, abaixo, a lista dos já registrados.
 *
 * ⚠️ AC-69 · DOIS HORÁRIOS: «aconteceu às» (observado, editável por correção auditada)
 * ⛔ e «registrado às» (preservado). ⚠️ Cada marco tem a sua correção: horário ⛔ ou
 * "registrado por engano" — ⛔ nunca limpeza do conjunto.
 *
 * ⚠️ «Aconteceu agora» é escolha explícita do médico, ⛔ e ⛔ não padrão silencioso: o
 * seletor de hora continua exigindo toque para confirmar outro horário.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESTADOS_DA_TRANSFERENCIA } from "../../avc/conteudo/superficie-g";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { marcosDaTransferencia } from "../../avc/nucleo/transferencia";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { ConfirmacaoDeEngano } from "./confirmacao-de-engano";
import SeletorDeHora from "./seletor-de-hora";

type Hora = { readonly instante: number; readonly selecionado: boolean };

function horaCurta(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function MarcosDaTransferencia({
  estado,
  agora,
  onRegistrar,
  onCorrigirHora,
  onEngano,
}: {
  estado: EstadoAvc;
  agora: number;
  onRegistrar: (tipo: string, observado: number) => void;
  onCorrigirHora: (fatoId: string, observado: number) => void;
  onEngano: (fatoId: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const marcos = marcosDaTransferencia(estado);
  const [registrando, setRegistrando] = useState(false);
  const [tipo, setTipo] = useState<string | undefined>(undefined);
  const [horaNova, setHoraNova] = useState<Hora | null>(null);
  const [corrigindo, setCorrigindo] = useState<{ readonly fatoId: string; readonly hora: Hora } | null>(null);
  const [engano, setEngano] = useState<string | undefined>(undefined);

  const encerrar = () => {
    setRegistrando(false);
    setTipo(undefined);
    setHoraNova(null);
  };

  return (
    <View style={e.raiz} testID="avc-campo-transf_marco">
      <Text style={e.titulo}>{tr("Marcos da transferência")}</Text>
      <Text style={e.nota}>
        {tr("Cada marco entra na linha do tempo com o horário em que aconteceu e o horário em que foi registrado. Aceite só existe quando registrado.")}
      </Text>

      <View style={e.lista} testID="avc-g-marcos">
        {marcos.length === 0 ? <Text style={e.nota}>{tr("Nenhum marco registrado")}</Text> : null}
        {marcos.map((m) => (
          <View key={m.fatoId} style={e.item} testID={`avc-g-marco-item-${m.fatoId}`}>
            <Text style={e.itemTipo}>{tr(m.tipo)}</Text>
            <Text style={e.itemHoras}>
              {tr("aconteceu às")} {horaCurta(m.observado)} · {tr("registrado às")} {horaCurta(m.registradoEm)}
              {m.horarioCorrigido ? ` · ${tr("horário corrigido")}` : ""}
            </Text>
            <View style={e.linha}>
              <Pressable
                style={e.botaoSecundario}
                accessibilityRole="button"
                testID={`avc-g-marco-corrigir-hora-${m.fatoId}`}
                onPress={() => setCorrigindo({ fatoId: m.fatoId, hora: { instante: m.observado, selecionado: false } })}
              >
                <Text style={e.botaoSecundarioTexto}>{tr("Corrigir horário")}</Text>
              </Pressable>
              <Pressable
                style={e.botaoSecundario}
                accessibilityRole="button"
                testID={`avc-g-marco-engano-${m.fatoId}`}
                onPress={() => setEngano(m.fatoId)}
              >
                <Text style={e.botaoSecundarioTexto}>{tr("Registrado por engano")}</Text>
              </Pressable>
            </View>
            {corrigindo?.fatoId === m.fatoId ? (
              <SeletorDeHora
                rotulo="Quando aconteceu"
                instante={corrigindo.hora.instante}
                selecionado={corrigindo.hora.selecionado}
                agora={agora}
                onMudar={(i, escolheu) =>
                  setCorrigindo((c) => (c === null ? c : { ...c, hora: { instante: i, selecionado: escolheu || c.hora.selecionado } }))
                }
                onConfirmar={() => {
                  onCorrigirHora(m.fatoId, corrigindo.hora.instante);
                  setCorrigindo(null);
                }}
                onCancelar={() => setCorrigindo(null)}
              />
            ) : null}
          </View>
        ))}
      </View>

      {!registrando ? (
        <Pressable style={e.botaoPrincipal} accessibilityRole="button" testID="avc-g-registrar-marco" onPress={() => setRegistrando(true)}>
          <Text style={e.botaoPrincipalTexto}>{tr("Registrar marco")}</Text>
        </Pressable>
      ) : tipo === undefined ? (
        <View style={e.escolha}>
          <Text style={e.pergunta}>{tr("Qual marco aconteceu?")}</Text>
          <View style={e.linha}>
            {ESTADOS_DA_TRANSFERENCIA.map((t) => (
              <Pressable key={t} style={e.botaoSecundario} accessibilityRole="button" testID={`avc-g-marco-tipo-${t}`} onPress={() => setTipo(t)}>
                <Text style={e.botaoSecundarioTexto}>{tr(t)}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-g-marco-cancelar" onPress={encerrar}>
            <Text style={e.botaoSecundarioTexto}>{tr("Cancelar")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={e.escolha}>
          <Text style={e.pergunta}>
            {tr(tipo)}: {tr("quando aconteceu?")}
          </Text>
          {horaNova === null ? (
            <View style={e.linha}>
              <Pressable
                style={e.botaoSecundario}
                accessibilityRole="button"
                testID="avc-g-marco-agora"
                onPress={() => {
                  onRegistrar(tipo, agora);
                  encerrar();
                }}
              >
                <Text style={e.botaoSecundarioTexto}>{tr("Aconteceu agora")}</Text>
              </Pressable>
              <Pressable
                style={e.botaoSecundario}
                accessibilityRole="button"
                testID="avc-g-marco-informar-hora"
                onPress={() => setHoraNova({ instante: agora, selecionado: false })}
              >
                <Text style={e.botaoSecundarioTexto}>{tr("Informar horário")}</Text>
              </Pressable>
              <Pressable style={e.botaoSecundario} accessibilityRole="button" testID="avc-g-marco-cancelar" onPress={encerrar}>
                <Text style={e.botaoSecundarioTexto}>{tr("Cancelar")}</Text>
              </Pressable>
            </View>
          ) : (
            <SeletorDeHora
              rotulo="Quando aconteceu"
              instante={horaNova.instante}
              selecionado={horaNova.selecionado}
              agora={agora}
              onMudar={(i, escolheu) => setHoraNova((h) => ({ instante: i, selecionado: escolheu || (h?.selecionado ?? false) }))}
              onConfirmar={() => {
                onRegistrar(tipo, horaNova.instante);
                encerrar();
              }}
              onCancelar={() => setHoraNova(null)}
            />
          )}
        </View>
      )}

      <ConfirmacaoDeEngano
        aberto={engano !== undefined}
        titulo="Marco registrado por engano?"
        texto="O marco não é apagado: recebe correção com motivo «registrado por engano» e sai da linha do tempo. Os outros marcos não mudam."
        onManter={() => setEngano(undefined)}
        onCorrigir={() => {
          if (engano !== undefined) onEngano(engano);
          setEngano(undefined);
        }}
      />
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.sm },
    titulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    nota: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    lista: { gap: ESPACO.xs },
    item: {
      gap: ESPACO.xs,
      padding: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.surface,
    },
    itemTipo: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    itemHoras: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    linha: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    escolha: { gap: ESPACO.sm },
    pergunta: { ...PAPEL.textoPrincipal, color: tema.cores.text },
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
