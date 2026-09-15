/**
 * TRILHA DAS TRANSIÇÕES DE UMA AÇÃO — AC-13 (autor, 2026-09-14; `docs/decisoes.md`, 19ª rodada §8, e seção
 * "AC-13 reaberto", §2 e §9).
 *
 * ⚠️ Cada situação registrada fica visível, na ordem, com o horário ⛔ a autoria do fato (AC-40). ⛔ Nenhum estado
 * antigo some quando um novo é registrado; «não sei» aparece como informação ausente, ⛔ como estado. O registro
 * antigo «Realizada» é lido como administrada/concluída ⛔ e marcado como tal.
 *
 * ⚠️ «Limpar» ⛔ a correção por engano aparecem como linhas próprias. O registro corrigido por engano fica na trilha,
 * marcado como invalidado. A correção se pede aqui, registro a registro, com confirmação, quando a superfície oferece
 * o gesto: nesta rodada só a trombólise (Correções ⛔ muda, AC-13 reaberto §9).
 *
 * ⛔ Esta camada só DESENHA: a trilha vem de `transicoesDoEstadoDaAcao` (`avc/nucleo/transicoes-da-acao.ts`).
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ROTULO_DO_ESTADO_DA_ACAO } from "../../avc/conteudo/superficie-e";
import { transicoesDoEstadoDaAcao, type TransicaoDaAcao } from "../../avc/nucleo/transicoes-da-acao";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { horaComData } from "../../avc/nucleo/formato";
import { marcaDeAutoria, type Autoria } from "../../avc/persistencia/autoria";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { useAutoriaDoAtendimento } from "./autoria-do-atendimento";
import { ConfirmacaoDeEngano } from "./confirmacao-de-engano";

/** ⚠️ Quem registrou: conta ⛔ tem nome no módulo; sem conta, a marca de AC-40; sem evento no log, dito como tal. */
function rotuloDaAutoria(autoria: Autoria | undefined): string {
  if (autoria === undefined) return "autoria ainda não gravada";
  return marcaDeAutoria(autoria) ?? "registrado com conta";
}

function tituloDaLinha(t: TransicaoDaAcao): string {
  if (t.tipo === "limpeza") return "Campo limpo";
  if (t.tipo === "correcao_por_engano") return "Correção: registrado por engano";
  return t.estado === undefined ? "Não sei — situação não informada" : ROTULO_DO_ESTADO_DA_ACAO[t.estado];
}

export function TransicoesDaAcao({
  estado,
  instancia,
  campo,
  onCorrigirPorEngano,
}: {
  estado: EstadoAvc;
  instancia: string;
  campo: string;
  /** ⚠️ Sem ele, a trilha só é lida: ⛔ oferece correção. */
  onCorrigirPorEngano?: (fatoId: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const autoriaDe = useAutoriaDoAtendimento();
  const [aberto, setAberto] = useState(false);
  const [engano, setEngano] = useState<string | undefined>(undefined);
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
              <Text style={[e.estado, t.invalidadaPorCorrecao ? e.invalidado : null]}>{tr(tituloDaLinha(t))}</Text>
              {t.legado ? <Text style={e.meta}>{tr("registro antigo")}: {tr(t.rotuloGravado)}</Text> : null}
              <Text style={e.meta}>{horaComData(t.horaClinica ?? t.horaRegistro)}</Text>
              <Text style={e.meta}>{tr(rotuloDaAutoria(autoriaDe(t.fatoId)))}</Text>
              {t.foraDaOrdemCausal ? (
                <Text style={e.meta}>
                  {tr("fora da ordem causal")}
                  {t.registradaComoCorrecao ? ` · ${tr("registrado como correção")}` : ""}
                </Text>
              ) : null}
              {t.tipo === "registro" ? (
                <Text style={e.nivel}>
                  {t.invalidadaPorCorrecao ? tr("invalidado por correção") : t.vigente ? tr("situação vigente") : tr("registro anterior")}
                </Text>
              ) : null}
              {onCorrigirPorEngano !== undefined && t.tipo === "registro" && !t.invalidadaPorCorrecao ? (
                <Pressable
                  style={e.corrigir}
                  accessibilityRole="button"
                  testID={`avc-transicoes-corrigir-${instancia}-${i}`}
                  onPress={() => setEngano(t.fatoId)}
                >
                  <Text style={e.corrigirTexto}>{tr("Foi engano — corrigir")}</Text>
                </Pressable>
              ) : null}
            </View>
          ))
        : null}
      <ConfirmacaoDeEngano
        aberto={engano !== undefined}
        titulo="Situação registrada por engano?"
        texto="O registro não é apagado: fica na trilha, recebe correção com motivo «registrado por engano» e deixa de valer para a situação da ação. Os outros registros não mudam."
        onManter={() => setEngano(undefined)}
        onCorrigir={() => {
          if (engano !== undefined && onCorrigirPorEngano !== undefined) onCorrigirPorEngano(engano);
          setEngano(undefined);
        }}
      />
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
    invalidado: { textDecorationLine: "line-through", color: tema.cores.textSecondary },
    meta: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    nivel: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
    corrigir: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    corrigirTexto: { ...PAPEL.textoSecundario, color: tema.cores.text },
  });
