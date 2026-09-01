/**
 * SUPERFÍCIE G · Destino — a tela.
 *
 * ⚠️⚠️ ESTA TELA MOSTRA POUCO, ⛔ E DIZ POR QUE É POUCO.
 *
 * ⚠️ Em F o risco era despejar 17 recomendações. Aqui é o oposto: com **dois**
 * enunciados, a tentação é preencher o vazio com logística que a diretriz
 * ⛔ nunca escreveu. ⛔ Transferência, regulação e conduta pós-EVT ⛔ não estão
 * aqui **de propósito**.
 *
 * ⚠️⚠️ A DECISÃO CENTRAL: **a ausência de grau é ESCRITA, ⛔ e ⛔ não sugerida.**
 *
 * ⛔ Se a Table 7 aparecesse só com estilo mais apagado, leria como
 * *"recomendação mais fraca"* — ⛔ e ⛔ não é isso: é **outra espécie de
 * enunciado**. Estilo lê como hierarquia; texto lê como categoria. Por isso o
 * selo com a frase da ausência aparece **nos dois** blocos que vêm da tabela.
 *
 * ⛔ ⛔ E a fronteira: *"⛔ não há recurso aqui"* ⛔ NUNCA vira *"terapia ⛔ não
 * indicada"*. O contexto operacional é bloco próprio, no fim, com a frase da
 * fronteira no topo.
 */
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  DESTINOS_RECOMENDADOS,
  FATOS_OPERACIONAIS,
  LACUNA_POS_EVT,
  REGRAS_DE_DESTINO,
} from "../../avc/conteudo/superficie-g";
import {
  contextoOperacional,
  faseDaMonitorizacao,
  monitorizacaoPosIvt,
  pertinenciaDaMonitorizacao,
  saidaDeFluxo,
} from "../../avc/nucleo/derivacoes-g";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import { numeroCurto } from "../../avc/nucleo/formato";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { CabecalhoDeBloco } from "./campos-clinicos";

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onIrParaCampo: (campo: string) => void;
};

/**
 * ⚠️⚠️ O SELO DA TABELA — repetido de propósito nos DOIS blocos.
 *
 * ⚠️ Decisão do autor, 2026-08-31: a repetição ⛔ não é ruído. A regra de
 * internação ⛔ e a monitorização vêm da **mesma** tabela operacional, ⛔ e o
 * médico ⛔ não pode inferir que uma ganhou grau por estar mais destacada.
 */
function SeloDaTabela() {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={e.selo} testID="avc-g-selo-table7">
      <Text style={e.seloTag}>{tr("TABLE 7")}</Text>
      <Text style={e.seloTexto}>{tr("a fonte não atribui COR/LOE")}</Text>
    </View>
  );
}

export default function SuperficieG({ estado, agora, onEscolher, onIrParaCampo }: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);

  const pertinencia = useMemo(() => pertinenciaDaMonitorizacao(estado), [estado]);
  const tabela = useMemo(() => monitorizacaoPosIvt(estado), [estado]);
  const fase = useMemo(() => faseDaMonitorizacao(estado, agora), [estado, agora]);
  const saida = useMemo(() => saidaDeFluxo(estado), [estado]);
  const contexto = useMemo(() => contextoOperacional(estado), [estado]);

  return (
    <View style={e.raiz} testID="avc-superficie-g-conteudo">
      {/* ── 1 · recomendação graduada ──────────────────────────────────── */}
      <View style={e.grupo} testID="avc-g-recomendados">
        <CabecalhoDeBloco titulo={tr("Recomendação da diretriz")} testID="avc-g-bloco-rec" />
        {DESTINOS_RECOMENDADOS.map((d) => (
          <View key={d.id} style={e.rec} testID={`avc-g-rec-${d.id}`}>
            <Text style={e.grau} testID={`avc-g-grau-${d.id}`}>
              {tr("COR")} {d.cor} · {tr("LOE")} {d.loe}
            </Text>
            <Text style={e.titulo}>{tr(d.rotulo)}</Text>
            {/** ⚠️ Verbatim em inglês — ⛔ verbatim ⛔ não se traduz (§6.14). */}
            <Text style={e.verbo}>“{d.verbo}”</Text>
            {d.nota ? <Text style={e.nota}>{tr(d.nota)}</Text> : null}
            <Text style={e.fonte}>
              {d.localizacao} · {tr("slot")} {d.slot}
            </Text>
          </View>
        ))}
      </View>

      {/* ── 2 · regra operacional da Table 7 ───────────────────────────── */}
      <View style={e.grupo} testID="avc-g-operacionais">
        <CabecalhoDeBloco titulo={tr("Conduta operacional da tabela")} testID="avc-g-bloco-op" />
        {REGRAS_DE_DESTINO.map((r) => (
          <View key={r.id} style={e.op} testID={`avc-g-op-${r.id}`}>
            <SeloDaTabela />
            {/**
              * ⚠️⚠️ O **"OU"** É DA FONTE. ⛔ *"intensive care OR stroke unit"* —
              * exigir UTI pediria recurso mais escasso do que o enunciado pede.
              */}
            <Text style={e.titulo}>{tr(r.texto)}</Text>
            <Text style={e.fonte}>
              {r.localizacao} · {tr(r.populacao)}
            </Text>
          </View>
        ))}
      </View>

      {/**
        * ⚠️⚠️ 3 · MONITORIZAÇÃO — ⛔ SÓ QUANDO HÁ CONTEXTO PÓS-IVT.
        *
        * ⛔ Exibi-la a quem ⛔ não recebeu trombólise faria a Table 7 parecer
        * conduta geral do AVC. ⚠️ E o bloco ⛔ **não some** quando falta o
        * horário: o paciente continua em contexto pós-trombólise.
        */}
      {pertinencia.pertinente && tabela ? (
        <View style={e.grupo} testID="avc-g-monitorizacao">
          <CabecalhoDeBloco
            titulo={tr("Monitorização pós-trombólise")}
            testID="avc-g-bloco-monitorizacao"
          />
          <View style={e.mon}>
            <SeloDaTabela />

            {/**
              * ⚠️⚠️ FASE ⛔ NÃO É PERTINÊNCIA. Os três estados, ⛔ e ⛔ nenhum
              * deles apaga o contexto.
              */}
            {fase?.tipo === "fase" ? (
              <View style={e.faixaAtiva} testID="avc-g-fase-atual">
                <View style={e.faixaEsq}>
                  <Text style={e.faixaRotulo}>{tr("Fase atual")}</Text>
                  <Text style={e.faixaValor}>
                    {tabela.oQueSeMede.map((x) => tr(x)).join(" · ")}
                  </Text>
                </View>
                <Text style={e.faixaNumero}>
                  {fase.aCadaMin} {tr("min")}
                </Text>
              </View>
            ) : fase?.tipo === "sem_horario" ? (
              <Pressable
                style={e.faixaPendente}
                accessibilityRole="button"
                testID="avc-g-fase-sem-horario"
                onPress={() => onIrParaCampo(fase.campo)}
              >
                <View style={e.faixaEsq}>
                  <Text style={e.faixaRotuloPendente}>{tr("Contexto pós-trombólise")}</Text>
                  <Text style={e.faixaValor}>
                    {pertinencia.motivo === "iniciada"
                      ? tr("Trombólise iniciada")
                      : tr("Trombólise realizada")}
                  </Text>
                </View>
                <Text style={e.faixaPendenteTexto}>
                  {tr("falta o horário de início — toque para registrar")}
                </Text>
              </Pressable>
            ) : (
              /**
               * ⚠️⚠️ ⛔ 24 h ENCERRAM A TABELA, ⛔ E ⛔ NÃO A PERTINÊNCIA.
               *
               * ⛔ O contexto pós-trombólise continua afirmado na tela: quem
               * recebeu trombólise segue tendo recebido.
               */
              <View style={e.faixaFora} testID="avc-g-fase-fora">
                <View style={e.faixaEsq}>
                  <Text style={e.faixaRotuloFora}>{tr("Contexto pós-trombólise")}</Text>
                  <Text style={e.faixaValor}>
                    {pertinencia.motivo === "iniciada"
                      ? tr("Trombólise iniciada")
                      : tr("Trombólise realizada")}
                  </Text>
                </View>
                <Text style={e.faixaForaTexto}>{tr("fora da janela da tabela")}</Text>
              </View>
            )}

            {/**
              * ⚠️⚠️ AS TRÊS FASES SEMPRE VISÍVEIS — decisão do autor.
              *
              * ⚠️ Ver 15 → 30 → 60 ajuda a antecipar o que vem. ⛔ Sem horário,
              * ⛔ nenhuma fica ativa; ⛔ e ⛔ nenhuma some.
              */}
            <View style={e.fases} testID="avc-g-fases">
              {tabela.fases.map((f) => {
                const ativa = fase?.tipo === "fase" && fase.deHoras === f.deHoras;
                return (
                  <View
                    key={f.deHoras}
                    style={[e.faseCel, ativa ? e.faseCelAtiva : null]}
                    testID={`avc-g-fase-${f.deHoras}${ativa ? "-ativa" : ""}`}
                  >
                    <Text style={[e.faseHoras, ativa ? e.faseTextoAtivo : null]}>
                      {numeroCurto(f.deHoras, 1)}–{numeroCurto(f.ateHoras, 1)} {tr("h")}
                    </Text>
                    <Text style={[e.faseMin, ativa ? e.faseTextoAtivo : null]}>{f.aCadaMin}</Text>
                  </View>
                );
              })}
            </View>

            {/**
              * ⚠️⚠️ GATILHOS DE DETERIORAÇÃO EM **LISTA**, ⛔ e ⛔ não em
              * parágrafo — decisão do autor, 2026-08-31.
              *
              * ⛔ Em texto corrido o olho passa por cima, ⛔ e isto é conteúdo de
              * **resposta rápida**. ⚠️ A consequência fica SEPARADA abaixo.
              */}
            <View style={e.deterioracao} testID="avc-g-deterioracao">
              <Text style={e.deterioracaoTitulo}>{tr("Sinais de deterioração")}</Text>
              {tabela.deterioracao.sinais.map((s) => (
                <Text key={s} style={e.sinal} testID={`avc-g-sinal-${s}`}>
                  · {tr(s)}
                </Text>
              ))}
              <View style={e.condutas} testID="avc-g-condutas">
                {tabela.deterioracao.condutas.map((c) => (
                  <Text key={c} style={e.conduta}>
                    → {tr(c)}
                  </Text>
                ))}
              </View>
            </View>

            <View style={e.linha}>
              <Text style={e.linhaChave}>{tr("Adiar")}</Text>
              <Text style={e.linhaValor}>
                {tabela.adiar.itens.map((x) => tr(x)).join(", ")} — {tr(tabela.adiar.condicao)}
              </Text>
            </View>
            <View style={e.linha}>
              <Text style={e.linhaChave}>{tr("Imagem de controle")}</Text>
              <Text style={e.linhaValor}>{tr(tabela.imagemDeControle.texto)}</Text>
            </View>
            <View style={e.linha}>
              <Text style={e.linhaChave}>{tr("Pressão arterial")}</Text>
              <Text style={e.linhaValor}>
                {tr("Acima de")} {tabela.gatilhoPressorico.pasAcimaDe}/
                {tabela.gatilhoPressorico.padAcimaDe}: {tr(tabela.gatilhoPressorico.conduta)}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ 4 · A LACUNA PÓS-EVT — compacta, ⛔ e ⛔ sem número ⛔ nenhum.
        *
        * ⛔ Ela informa a ausência ⛔ e ⛔ não a preenche. ⛔ Copiar o esquema
        * pós-IVT por analogia é o que **E-31** proíbe.
        */}
      <View style={e.lacuna} testID="avc-g-lacuna-pos-evt">
        <Text style={e.lacunaTitulo}>{tr("Pós-trombectomia")}</Text>
        <Text style={e.lacunaTexto}>{tr(LACUNA_POS_EVT.texto)}</Text>
      </View>

      {/**
        * ⚠️⚠️ 5 · SAÍDA DE FLUXO — produzida em **Imagem**, ⛔ e ⛔ não aqui.
        *
        * ⛔ G ⛔ não decide se há hemorragia: quem lê imagem é C. Reimplementar
        * daria duas respostas para a mesma pergunta (I6).
        */}
      {saida ? (
        <View style={e.grupo} testID="avc-g-saida">
          <CabecalhoDeBloco titulo={tr("Saída de fluxo")} testID="avc-g-bloco-saida" />
          <View style={e.saidaCartao} testID={`avc-g-saida-${saida.saida}`}>
            <Text style={e.titulo}>{tr(saida.modulo)}</Text>
            <Text style={e.nota}>{tr(saida.oQueAcontece)}</Text>
            <Text style={e.fonte}>
              {tr("produzido em Imagem")}
              {saida.moduloExiste ? "" : ` · ${tr("o módulo ainda não existe")}`}
            </Text>
          </View>
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ 6 · CONTEXTO OPERACIONAL — POR ÚLTIMO, ⛔ E SEPARADO.
        *
        * ⛔ ⛔ ⛔ **⛔ NENHUMA resposta daqui chega à Superfície F.** A frase da
        * fronteira fica no topo do bloco, ⛔ e ⛔ não escondida numa nota: é ela
        * que impede geografia de virar critério clínico (F-03 §12).
        */}
      <View style={e.operacional} testID="avc-g-contexto-operacional">
        <Text style={e.operacionalTitulo}>{tr("Capacidade deste serviço")}</Text>
        <Text style={e.operacionalFronteira}>
          {tr(
            "Contexto operacional. Não altera indicação clínica nem elegibilidade a nenhuma terapia."
          )}
        </Text>
        {FATOS_OPERACIONAIS.map((f) => {
          const bruto = String(valorAtual(estado, f.id)?.valor ?? "");
          const lido = contexto.find((l) => l.id === f.id);
          return (
            <View key={f.id} style={e.pergunta} testID={`avc-g-fato-${f.id}`}>
              <Text style={e.perguntaTexto}>{tr(f.rotulo)}</Text>
              <View style={e.opcoes}>
                {f.opcoes.map((op) => {
                  const marcada = bruto === valorGravado(op);
                  return (
                    <Pressable
                      key={op}
                      style={[e.opcao, marcada ? e.opcaoAtiva : null]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: marcada }}
                      testID={`avc-g-opcao-${f.id}-${valorGravado(op)}`}
                      onPress={() => onEscolher(f.id, valorGravado(op))}
                    >
                      <Text style={[e.opcaoTexto, marcada ? e.opcaoTextoAtivo : null]}>
                        {tr(op)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {/**
                * ⚠️ A nota aparece ⛔ só quando o recurso foi negado — ⛔ e é ela
                * que nomeia o que aquilo é: indisponibilidade **operacional**.
                */}
              {lido?.estado === "indisponivel" ? (
                <Text style={e.operacionalNota} testID={`avc-g-nota-${f.id}`}>
                  {tr(f.nota)}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * ⚠️ O valor que a tela GRAVA — ⛔ e ⛔ não o rótulo.
 *
 * ⛔ O estado ⛔ nunca guarda `"Sim"`. Escrever o rótulo aqui repetiria o defeito
 * que a Superfície F já pagou: a leitura comparava rótulo, o estado tinha slug,
 * ⛔ e ⛔ nada funcionava ⛔ enquanto as provas passavam.
 */
function valorGravado(opcao: string): string {
  if (opcao === "Sim") return "sim";
  if (opcao === "Não") return "nao";
  return "nao_sei";
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    grupo: { gap: ESPACO.sm },

    /** ⚠️ Recomendação graduada — borda cheia, cor de identidade. */
    rec: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.primary,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    grau: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    titulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    verbo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontStyle: "italic",
    },
    nota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    fonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    /**
     * ⚠️⚠️ Regra de tabela — borda TRACEJADA e fundo recuado. ⛔ Mas o que
     * carrega a distinção é o SELO em texto, ⛔ e ⛔ não estes pixels.
     */
    op: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    selo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    seloTag: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      borderWidth: 1,
      borderColor: tema.cores.border,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.xs,
    },
    seloTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    mon: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.sm,
    },
    faixaEsq: { flex: 1, gap: 2 },
    faixaRotulo: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    faixaRotuloPendente: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    faixaRotuloFora: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    faixaValor: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "600" },
    faixaAtiva: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.primary,
      padding: ESPACO.sm,
    },
    faixaNumero: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    faixaPendente: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.warning,
      padding: ESPACO.sm,
    },
    faixaPendenteTexto: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.micro.fontSize,
      flexShrink: 1,
      textAlign: "right",
    },
    faixaFora: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
    },
    faixaForaTexto: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      flexShrink: 1,
      textAlign: "right",
    },

    fases: { flexDirection: "row", gap: ESPACO.xs },
    faseCel: {
      flex: 1,
      alignItems: "center",
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      paddingVertical: ESPACO.xs,
    },
    faseCelAtiva: { borderColor: tema.cores.primary },
    faseHoras: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    faseMin: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    faseTextoAtivo: { color: tema.cores.primary },

    deterioracao: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.warning,
      padding: ESPACO.sm,
      gap: 2,
    },
    deterioracaoTitulo: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      marginBottom: ESPACO.xs,
    },
    /** ⚠️ Uma linha por sinal — ⛔ parágrafo corrido esconde o quarto item. */
    sinal: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    condutas: {
      marginTop: ESPACO.xs,
      paddingTop: ESPACO.xs,
      borderTopWidth: 1,
      borderTopColor: tema.cores.border,
      gap: 2,
    },
    conduta: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "600",
    },

    linha: { gap: 2 },
    linhaChave: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    linhaValor: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },

    lacuna: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.debt,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    lacunaTitulo: {
      color: tema.cores.debt,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    lacunaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },

    saidaCartao: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },

    operacional: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.sm,
    },
    operacionalTitulo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    operacionalFronteira: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      paddingBottom: ESPACO.xs,
      borderBottomWidth: 1,
      borderBottomColor: tema.cores.border,
    },
    pergunta: { gap: ESPACO.xs },
    perguntaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    opcoes: { flexDirection: "row", gap: ESPACO.xs },
    opcao: {
      flex: 1,
      alignItems: "center",
      paddingVertical: ESPACO.sm,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
    },
    opcaoAtiva: { borderColor: tema.cores.textSecondary },
    opcaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    opcaoTextoAtivo: { fontWeight: "700" },
    operacionalNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
  });
