/**
 * TRILHA DAS TRANSIÇÕES DE UMA AÇÃO — AC-13 (autor, 2026-09-14; `docs/decisoes.md`, 19ª rodada §8).
 *
 * ⚠️ Cada situação registrada fica visível, na ordem, com o horário ⛔ a autoria do fato (AC-40). ⛔ Nenhum estado
 * antigo some quando um novo é registrado; «não sei» aparece como informação ausente, ⛔ como estado. O registro
 * antigo «Realizada» é lido como administrada/concluída ⛔ e marcado como tal.
 *
 * ⛔ Esta camada só DESENHA: a trilha vem de `transicoesDoEstadoDaAcao` (`avc/nucleo/derivacoes-e.ts`).
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ROTULO_DO_ESTADO_DA_ACAO } from "../../avc/conteudo/superficie-e";
import { transicoesDoEstadoDaAcao } from "../../avc/nucleo/transicoes-da-acao";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { horaComData } from "../../avc/nucleo/formato";
import { marcaDeAutoria, type Autoria } from "../../avc/persistencia/autoria";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { useAutoriaDoAtendimento } from "./autoria-do-atendimento";

/** ⚠️ Quem registrou: conta ⛔ tem nome no módulo; sem conta, a marca de AC-40; sem evento no log, dito como tal. */
function rotuloDaAutoria(autoria: Autoria | undefined): string {
  if (autoria === undefined) return "autoria ainda não gravada";
  return marcaDeAutoria(autoria) ?? "registrado com conta";
}

export function TransicoesDaAcao({
  estado,
  instancia,
  campo,
}: {
  estado: EstadoAvc;
  instancia: string;
  campo: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const autoriaDe = useAutoriaDoAtendimento();
  const [aberto, setAberto] = useState(false);
  const transicoes = transicoesDoEstadoDaAcao(estado, instancia, campo);
  if (transicoes.length === 0) return null;

  return (
    <View style={e.raiz} testID={`avc-transicoes-${instancia}`}>
      <Pressable
        style={e.abrir}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        testID={`avc-transicoes-abrir-${instancia}`}
        onPress={() => setAberto((a) => !a)}
      >
        <Text style={e.abrirTexto}>
          {tr("Transições registradas")} ({transicoes.length}) {aberto ? "▾" : "›"}
        </Text>
      </Pressable>
      {aberto
        ? transicoes.map((t, i) => (
            <View key={t.fatoId} style={e.linha} testID={`avc-transicoes-${instancia}-${i}`}>
              <Text style={e.estado}>
                {t.estado === undefined ? tr("Não sei — situação não informada") : tr(ROTULO_DO_ESTADO_DA_ACAO[t.estado])}
              </Text>
              {t.legado ? <Text style={e.meta}>{tr("registro antigo")}: {tr(t.rotuloGravado)}</Text> : null}
              <Text style={e.meta}>{horaComData(t.horaClinica ?? t.horaRegistro)}</Text>
              <Text style={e.meta}>{tr(rotuloDaAutoria(autoriaDe(t.fatoId)))}</Text>
              <Text style={e.nivel}>{t.vigente ? tr("situação vigente") : tr("registro anterior")}</Text>
            </View>
          ))
        : null}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.xs, marginTop: ESPACO.xs },
    abrir: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    abrirTexto: { ...PAPEL.textoSecundario, color: tema.cores.primary, fontWeight: "700" },
    linha: { gap: 2, paddingVertical: ESPACO.xs, borderTopWidth: 1, borderTopColor: tema.cores.controlBorder },
    estado: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "700" },
    meta: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    nivel: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  });
