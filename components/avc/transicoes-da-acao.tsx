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
 * AC-13 reaberto, item 3: cada linha separa o horário clínico («Horário clínico: …», «desconhecido» ou «não
 * informado») do horário do registro («Registrado às …»); um nunca preenche o outro. Na trombólise, a transição que
 * aceita horário (`aceitaGestoDeHorarioClinico`) oferece «Informar horário» e «Horário desconhecido».
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
import SeletorDeHora from "./seletor-de-hora";
import { useFoco } from "./sistema/foco";
import { aceitaGestoDeHorarioClinico, horarioClinicoDaTransicao } from "../../avc/nucleo/horario-clinico";

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
  campoDoHorario,
  agora,
  onHorarioClinico,
  onLimparHorarioClinico,
}: {
  estado: EstadoAvc;
  instancia: string;
  campo: string;
  /** ⚠️ Sem ele, a trilha só é lida: ⛔ oferece correção. */
  onCorrigirPorEngano?: (fatoId: string) => void;
  /** AC-13 reaberto, item 3: o campo que responde o horário clínico da transição; sem ele, a trilha não oferece o gesto. */
  campoDoHorario?: string;
  agora?: number;
  onHorarioClinico?: (fatoId: string, valor: number | "nao_sei") => void;
  onLimparHorarioClinico?: (fatoId: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const autoriaDe = useAutoriaDoAtendimento();
  const [aberto, setAberto] = useState(false);
  const [engano, setEngano] = useState<string | undefined>(undefined);
  const [editandoHorario, setEditandoHorario] = useState<
    { readonly fatoId: string; readonly instante: number; readonly selecionado: boolean } | undefined
  >(undefined);
  const foco = useFoco();
  const fatoDe = (fatoId: string) => estado.fatos.find((f) => f.id === fatoId);
  function linhaDoHorarioClinico(t: TransicaoDaAcao): string | undefined {
    const fato = fatoDe(t.fatoId);
    if (fato === undefined || t.tipo !== "registro") return undefined;
    const h = horarioClinicoDaTransicao(estado, fato);
    if (h.tipo === "nao_pedido") {
      /** Fora dos estados que pedem horário: mostra o horário clínico só quando foi gravado, nunca o do registro no lugar. */
      return typeof fato.horaClinica === "number" ? `${tr("Horário clínico")}: ${horaComData(fato.horaClinica)}` : undefined;
    }
    if (h.tipo === "conhecido") {
      return `${tr("Horário clínico")}: ${horaComData(h.ms)}${h.fonte === "ivt_inicio" ? ` · ${tr("início da administração")}` : ""}`;
    }
    if (h.tipo === "desconhecido_declarado") return tr("Horário clínico desconhecido");
    return tr("Horário clínico não informado");
  }
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
              {linhaDoHorarioClinico(t) !== undefined ? <Text style={e.meta}>{linhaDoHorarioClinico(t)}</Text> : null}
              <Text style={e.meta}>
                {tr("Registrado às")} {horaComData(t.horaRegistro)}
              </Text>
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
              {campoDoHorario !== undefined && agora !== undefined && onHorarioClinico !== undefined
                && t.tipo === "registro" && !t.invalidadaPorCorrecao
                && fatoDe(t.fatoId) !== undefined && aceitaGestoDeHorarioClinico(estado, fatoDe(t.fatoId)!) ? (
                <View
                  style={e.horario}
                  ref={(no) => foco.registrarGrupo([campoDoHorario], no)}
                  testID={`avc-horario-clinico-${instancia}-${i}`}
                >
                  {editandoHorario !== undefined && editandoHorario.fatoId === t.fatoId ? (
                    <SeletorDeHora
                      rotulo="Horário clínico da situação"
                      instante={editandoHorario.instante}
                      selecionado={editandoHorario.selecionado}
                      agora={agora}
                      onMudar={(instante, escolheuValor) =>
                        setEditandoHorario({ fatoId: t.fatoId, instante, selecionado: escolheuValor || editandoHorario.selecionado })}
                      onConfirmar={() => {
                        if (editandoHorario.selecionado) onHorarioClinico(t.fatoId, editandoHorario.instante);
                        setEditandoHorario(undefined);
                      }}
                      onCancelar={() => setEditandoHorario(undefined)}
                    />
                  ) : (
                    <View style={e.linhaDeBotoes}>
                      <Pressable
                        style={e.corrigir}
                        accessibilityRole="button"
                        testID={`avc-horario-clinico-informar-${instancia}-${i}`}
                        onPress={() => setEditandoHorario({ fatoId: t.fatoId, instante: agora, selecionado: false })}
                      >
                        <Text style={e.corrigirTexto}>{tr("Informar horário")}</Text>
                      </Pressable>
                      <Pressable
                        style={e.corrigir}
                        accessibilityRole="button"
                        testID={`avc-horario-clinico-desconhecido-${instancia}-${i}`}
                        onPress={() => onHorarioClinico(t.fatoId, "nao_sei")}
                      >
                        <Text style={e.corrigirTexto}>{tr("Horário desconhecido")}</Text>
                      </Pressable>
                      {onLimparHorarioClinico !== undefined
                        && horarioClinicoDaTransicao(estado, fatoDe(t.fatoId)!).tipo !== "nao_informado" ? (
                        <Pressable
                          style={e.corrigir}
                          accessibilityRole="button"
                          testID={`avc-horario-clinico-limpar-${instancia}-${i}`}
                          onPress={() => onLimparHorarioClinico(t.fatoId)}
                        >
                          <Text style={e.corrigirTexto}>{tr("Limpar")}</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  )}
                </View>
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
    horario: { gap: ESPACO.xs },
    linhaDeBotoes: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
  });
