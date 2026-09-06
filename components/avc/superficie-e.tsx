/**
 * SUPERFÍCIE E · Correções — a tela.
 *
 * ⚠️⚠️ O QUE ESTA TELA ⛔ NÃO PODE FAZER:
 *
 *   ⛔ **dizer que corrigiu.** ⛔ Não existe botão "corrigido" aqui. O bloqueio cai
 *      em D, lendo **uma nova aferição** em Entrada e estabilização.
 *
 *   ⛔ **prescrever.** ⚠️ Desde 2026-09-06 ela **mostra** fármaco ⛔ e dose (F-19,
 *      transcrito), ⛔ mas ⛔ não prescreve: ⛔ nenhuma via, ⛔ nenhum preparo,
 *      ⛔ nenhuma diluição, ⛔ nenhuma bomba. ⚠️ ⛔ E ⛔ **não escolhe agente** —
 *      ⛔ não há evidência de superioridade entre eles, ⛔ e ordenar *"use
 *      labetalol"* inventaria uma hierarquia que a literatura ⛔ não dá.
 *
 *   ⛔ **obrigar sequência.** Quem chegou aqui com o tratamento já correndo
 *      registra `Iniciada` direto — ⛔ sem passar por uma sugestão que o app
 *      ⛔ nunca fez.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ACAO_E, ACOES_DE_CORRECAO } from "../../avc/conteudo/superficie-e";
import {
  ALVOS_GLICEMICOS,
  CORTES_GLICEMICOS,
  ERROS_A_EVITAR,
  PERGUNTA_QUE_DECIDE,
  TRATAMENTOS_GLICEMICOS,
} from "../../avc/conteudo/correcao-glicemica";
import {
  AGENTES_ANTI_HIPERTENSIVOS,
  ALERTA_DO_ESMOLOL,
  ALVOS_PRESSORICOS,
  type PapelDoAgente,
} from "../../avc/conteudo/antihipertensivos";
import { bloqueiosComAcoes } from "../../avc/nucleo/derivacoes-e";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorNaInstancia } from "../../avc/nucleo/instancia";
import { CabecalhoDeBloco, CampoDaSuperficie, useDetalhes } from "./campos-clinicos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { useTr } from "../../lib/use-tr";

/**
 * ⚠️ O papel em palavras — ⛔ e ⛔ ele ⛔ não é ranking. ⚠️ *"Preferencial"* aqui
 * significa **estava na tabela de 2019**, ⛔ e ⛔ não *"funciona melhor"*.
 */
const PAPEL_EM_PALAVRAS: Readonly<Record<PapelDoAgente, string>> = {
  preferencial_2019: "Na tabela da AHA/ASA de 2019",
  alternativa: "Alternativa",
  historico_br: "Prática histórica brasileira",
  reserva: "Reserva para caso grave ou refratário",
};

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolherNaAcao: (acao: string, campo: string, valor: string) => void;
  onDesfazerNaAcao: (acao: string, campo: string) => void;
  onNovaAcao: (tipo: string) => void;
};

export default function SuperficieE({
  estado,
  agora,
  onEscolherNaAcao,
  onDesfazerNaAcao,
  onNovaAcao,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const detalhes = useDetalhes();
  const blocos = bloqueiosComAcoes(estado);

  return (
    <View style={e.raiz} testID="avc-superficie-e-conteudo">
      {blocos.length === 0 ? (
        <Text style={e.vazio} testID="avc-e-sem-bloqueio">
          {tr("Nenhum bloqueio corrigível registrado. Nada nesta tela espera por ação.")}
        </Text>
      ) : null}

      {blocos.map(({ bloqueio, acoes }) => {
        const acao = ACOES_DE_CORRECAO.find((a) => a.bloqueio === bloqueio.id);
        return (
          <View key={bloqueio.id} style={e.grupo} testID={`avc-e-bloqueio-${bloqueio.id}`}>
            <CabecalhoDeBloco
              titulo={acao?.rotulo ?? bloqueio.id}
              testID={`avc-e-bloco-${bloqueio.id}`}
            />
            {/* ⚠️ Português primeiro, verbatim abaixo — o mesmo contrato de D. */}
            <Text style={e.formulacao} testID={`avc-e-formulacao-${bloqueio.id}`}>
              {tr(bloqueio.formulacao)}
            </Text>
            <Text style={e.verbo} testID={`avc-e-verbo-${bloqueio.id}`}>“{bloqueio.verbo}”</Text>

            {/**
              * ⚠️⚠️ O QUE RESOLVE — e a frase diz **uma nova aferição**, ⛔ não esta
              * tela. Sem ela, registrar a ação pareceria fechar o bloqueio.
              */}
            <Text style={e.resolve} testID={`avc-e-resolve-${bloqueio.id}`}>
              {tr("O que faz este bloqueio cair")}: {tr(bloqueio.resolvePor)} —{" "}
              {tr("registrada em Entrada e estabilização")}
            </Text>

            {/**
              * ⚠️⚠️ CADA AÇÃO É UMA INSTÂNCIA: duas intervenções antes da nova
              * aferição aparecem como **duas**, e ⛔ não uma sobrescrevendo a outra.
              */}
            {acoes.map((a, i) => (
              <View key={a.instancia} style={e.acao} testID={`avc-e-acao-${a.instancia}`}>
                <Text style={e.acaoTitulo}>
                  {tr("Ação")} {i + 1}
                </Text>
                {ACAO_E.filter((c) => c.id === "acao_estado").map((campo) => (
                  <CampoDaSuperficie
                    key={`${a.instancia}-${campo.id}`}
                    campo={{ ...campo, casa: "correcoes" }}
                    casaAtual="correcoes"
                    bruto={String(valorNaInstancia(estado, a.instancia, campo.id)?.valor ?? "")}
                    numero={undefined}
                    agora={agora}
                    detalheAberto={detalhes.aberto(`${a.instancia}-${campo.id}`)}
                    onAlternarDetalhe={() => detalhes.alternar(`${a.instancia}-${campo.id}`)}
                    onEscolher={(c, v) => onEscolherNaAcao(a.instancia, c, v)}
                    onMedir={() => undefined}
                    onHora={() => undefined}
                    onDesfazer={(c) => onDesfazerNaAcao(a.instancia, c)}
                  />
                ))}
              </View>
            ))}

            {/**
              * ── ⚠️⚠️ COMO CORRIGIR — F-19, ⛔ e ⛔ só para a pressão ────────────
              *
              * ⚠️ Pedido do autor em 2026-09-06: *"contraindicações corrigíveis
              * PA ⛔ e glicemia ⛔ e maneira de corrigir, o que usar ⛔ e doses"*.
              *
              * ⚠️⚠️ ⛔ CADA AGENTE CARREGA A **SUA** PROCEDÊNCIA, ⛔ e ⛔ nunca uma
              * etiqueta genérica: ⛔ **a AHA/ASA 2026 ⛔ não nomeia fármaco
              * algum** — varredura do documento inteiro deu **zero** ocorrências
              * para os oito agentes. ⚠️ O trio preferencial é da edição de
              * **2019**; esmolol ⛔ e nicardipino têm **bula**; metoprolol ⛔ e
              * nitroprussiato vêm de um **manual brasileiro de 2013**.
              *
              * ⛔ *"A AHA recomenda labetalol"* ⛔ e *"a AHA de 2019 listava
              * labetalol, ⛔ e a de 2026 ⛔ não lista fármaco algum"* ⛔ não são a
              * mesma afirmação.
              */}
            {bloqueio.id === "pressao_acima_da_meta" ? (
              <View style={e.terapeutica} testID="avc-e-terapeutica-pressao">
                <Text style={e.terapeuticaTitulo}>{tr("Agentes intravenosos")}</Text>
                <Text style={e.terapeuticaNota}>
                  {tr("A diretriz vigente dá alvos e não nomeia fármaco. Cada agente abaixo traz a sua própria procedência, e a escolha é do médico.")}
                </Text>

                {AGENTES_ANTI_HIPERTENSIVOS.map((ag) => (
                  <View key={ag.id} style={e.agente} testID={`avc-e-agente-${ag.id}`}>
                    <View style={e.agenteTopo}>
                      <Text style={e.agenteNome}>{tr(ag.nome)}</Text>
                      <Text style={e.agentePapel}>{tr(PAPEL_EM_PALAVRAS[ag.papel])}</Text>
                    </View>
                    {/**
                      * ⚠️ ⛔ Sem dose, ⛔ nenhuma é inventada: o bloco simplesmente
                      * ⛔ não a mostra, ⛔ e a procedência diz por quê.
                      */}
                    {ag.dose ? <Text style={e.agenteDose}>{tr(ag.dose)}</Text> : null}
                    {ag.titulacao ? <Text style={e.agenteLinha}>{tr(ag.titulacao)}</Text> : null}
                    {ag.maximo ? (
                      <Text style={e.agenteLinha}>{tr("Máximo")}: {tr(ag.maximo)}</Text>
                    ) : null}
                    {ag.quando ? (
                      <Text style={e.agenteLinha}>{tr("Quando")}: {tr(ag.quando)}</Text>
                    ) : null}
                    {ag.cautela ? (
                      <Text style={e.agenteCautela}>{tr("Cautela")}: {tr(ag.cautela)}</Text>
                    ) : null}
                    <Text style={e.agenteFonte}>{tr(ag.procedencia)}</Text>
                  </View>
                ))}

                {/**
                  * ⚠️⚠️ O ALERTA DO ESMOLOL — o achado de segurança deste slot.
                  * ⛔ Ele fica **junto dos agentes**, ⛔ e ⛔ não numa nota de
                  * rodapé: quem lê a dose do esmolol precisa ler isto ⛔ ali.
                  */}
                <View style={e.alerta} testID="avc-e-alerta-esmolol">
                  <Text style={e.alertaTitulo}>{tr(ALERTA_DO_ESMOLOL.titulo)}</Text>
                  <Text style={e.alertaTexto}>{tr(ALERTA_DO_ESMOLOL.texto)}</Text>
                </View>

                {/**
                  * ⚠️⚠️ OS ALVOS, com a força de cada um — ⛔ e ⛔ eles ⛔ não
                  * colapsam: 185/110 é **porta de entrada**; 180/105 é
                  * **manutenção**; ⛔ e `<140` aparece com **dano declarado**
                  * depois de recanalização.
                  */}
                <Text style={e.terapeuticaTitulo}>{tr("Alvos pressóricos")}</Text>
                {ALVOS_PRESSORICOS.map((alvo) => (
                  <View key={alvo.id} style={e.alvo} testID={`avc-e-alvo-${alvo.id}`}>
                    <Text style={e.alvoGrau}>
                      {alvo.apoioSemGrau
                        ? tr("Texto de apoio da diretriz, sem grau de recomendação")
                        : `${tr("COR")} ${alvo.cor} · ${tr("LOE")} ${alvo.loe}`}
                    </Text>
                    <Text style={e.alvoValor}>{tr(alvo.valor)}</Text>
                    <Text style={e.alvoContexto}>{tr(alvo.contexto)}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/**
              * ── ⚠️⚠️ F-18 · A GLICEMIA ⛔ NÃO CONTRAINDICA ────────────────────
              *
              * ⚠️ O bloco **abre pela pergunta**, ⛔ e ⛔ não pelas faixas: o que
              * decide ⛔ não é o número, ⛔ é o **déficit persistir depois da
              * correção**. ⛔ Uma tabela de cinco faixas no topo ensinaria o
              * oposto.
              *
              * ⚠️⚠️ ⛔ E O BLOCO DOS ERROS FICA **NA TELA**: `<50` ⛔ e `>400`
              * foram, por anos, critério de exclusão. ⚠️ Quem aprendeu assim
              * ⛔ não desaprende lendo uma faixa — ⛔ precisa ler que aquilo
              * mudou, ⛔ e o que ficou no lugar.
              */}
            {bloqueio.id === "glicemia_alterada" ? (
              <View style={e.terapeutica} testID="avc-e-terapeutica-glicemia">
                <View style={e.pergunta} testID="avc-e-pergunta-glicemia">
                  <Text style={e.perguntaGrau}>
                    {tr("COR")} {PERGUNTA_QUE_DECIDE.cor}
                  </Text>
                  <Text style={e.perguntaTexto}>{tr(PERGUNTA_QUE_DECIDE.pergunta)}</Text>
                  <Text style={e.perguntaRamo}>
                    {tr("Se persiste")}: {tr(PERGUNTA_QUE_DECIDE.sePersiste)}
                  </Text>
                  <Text style={e.perguntaRamo}>
                    {tr("Se desaparece")}: {tr(PERGUNTA_QUE_DECIDE.seDesaparece)}
                  </Text>
                </View>

                <Text style={e.terapeuticaTitulo}>{tr("Como corrigir")}</Text>
                {TRATAMENTOS_GLICEMICOS.map((t) => (
                  <View key={t.id} style={e.agente} testID={`avc-e-glicemia-${t.id}`}>
                    <Text style={e.agenteNome}>{tr(t.nome)}</Text>
                    {/**
                      * ⚠️ ⛔ Sem dose, ⛔ nenhuma é inventada — ⛔ e no caso da
                      * insulina **a ausência é a informação**.
                      */}
                    {t.dose ? <Text style={e.agenteDose}>{tr(t.dose)}</Text> : null}
                    <Text style={e.agenteLinha}>{tr(t.quando)}</Text>
                    {t.cautela ? (
                      <Text style={e.agenteCautela}>{tr(t.cautela)}</Text>
                    ) : null}
                    <Text style={e.agenteFonte}>{tr(t.procedencia)}</Text>
                  </View>
                ))}

                <Text style={e.terapeuticaTitulo}>{tr("O que cada faixa significa")}</Text>
                {CORTES_GLICEMICOS.map((c) => (
                  <View key={c.id} style={e.alvo} testID={`avc-e-corte-${c.id}`}>
                    <Text style={e.alvoValor}>{tr(c.faixa)}</Text>
                    <Text style={e.alvoContexto}>
                      {tr(c.natureza)} — {tr(c.conduta)}
                    </Text>
                    {/** ⚠️ ⛔ O que ⛔ **não** é fica escrito, ⛔ e ⛔ não implícito. */}
                    <Text style={e.alvoNaoE}>{tr(c.naoE)}</Text>
                  </View>
                ))}

                <Text style={e.terapeuticaTitulo}>{tr("Alvos glicêmicos")}</Text>
                {ALVOS_GLICEMICOS.map((a) => (
                  <View key={a.id} style={e.alvo} testID={`avc-e-alvo-glicemia-${a.id}`}>
                    <Text style={e.alvoGrau}>
                      {a.cor === "—" ? tr("Manejo hospitalar") : `${tr("COR")} ${a.cor}`}
                    </Text>
                    <Text style={e.alvoValor}>{tr(a.valor)}</Text>
                    <Text style={e.alvoContexto}>{tr(a.contexto)}</Text>
                  </View>
                ))}

                <View style={e.alerta} testID="avc-e-erros-glicemia">
                  <Text style={e.alertaTitulo}>
                    {tr("Leituras antigas que hoje estão erradas")}
                  </Text>
                  {ERROS_A_EVITAR.map((x) => (
                    <View key={x.errado} style={e.erro}>
                      <Text style={e.erroErrado}>{tr(x.errado)}</Text>
                      <Text style={e.erroCerto}>{tr(x.correto)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {acao ? (
              <Pressable
                style={e.novaAcao}
                accessibilityRole="button"
                testID={`avc-e-nova-acao-${bloqueio.id}`}
                onPress={() => onNovaAcao(acao.rotulo)}
              >
                <Text style={e.novaAcaoTexto}>
                  {acoes.length === 0 ? tr("Registrar ação") : tr("Registrar outra ação")}
                </Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },

    /* ── ⚠️ F-19 · como corrigir ─────────────────────────────────────────── */
    terapeutica: { gap: ESPACO.sm, paddingTop: ESPACO.sm },
    terapeuticaTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    terapeuticaNota: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },

    agente: {
      backgroundColor: tema.cores.surfaceElevated,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: 2,
    },
    agenteTopo: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    },
    agenteNome: { ...PAPEL.tituloDeSecao, color: tema.cores.text, flexShrink: 1 },
    /** ⚠️ O papel é **legenda**, ⛔ e ⛔ não selo de qualidade. */
    agentePapel: { ...PAPEL.micro, color: tema.cores.textSecondary, flexShrink: 0 },
    /** ⚠️ A dose é o que vai na veia — ⛔ ela ⛔ não divide peso com o resto. */
    agenteDose: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    agenteLinha: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    agenteCautela: { ...PAPEL.textoSecundario, color: tema.cores.warning },
    /** ⚠️ ⛔ Nunca omitida: dose ⛔ sem procedência ⛔ não é rastreável (E-30). */
    agenteFonte: { ...PAPEL.legenda, color: tema.cores.textSecondary },

    /** ⚠️ O alerta do esmolol — vermelho, porque aqui há **dano possível**. */
    alerta: {
      backgroundColor: tema.cores.criticalTint,
      borderWidth: 1,
      borderColor: tema.cores.critical,
      borderRadius: RAIO.botao,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    alertaTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.critical },
    alertaTexto: { ...PAPEL.textoSecundario, color: tema.cores.text },

    alvo: {
      backgroundColor: tema.cores.surfaceElevated,
      borderRadius: RAIO.botao,
      padding: ESPACO.sm,
      gap: 2,
    },
    alvoGrau: { ...PAPEL.micro, color: tema.cores.textSecondary },
    alvoValor: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    alvoContexto: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    /** ⚠️ ⛔ O que o corte **⛔ não** é — em `info`, porque é **contexto**. */
    alvoNaoE: { ...PAPEL.textoSecundario, color: tema.cores.info },

    /* ── ⚠️ F-18 · a pergunta que decide ─────────────────────────────────── */
    /**
     * ⚠️ Ela abre o bloco ⛔ e tem o peso da decisão: ⛔ o número ⛔ não decide,
     * ⛔ e a tela ⛔ não pode sugerir que decide.
     */
    pergunta: {
      backgroundColor: tema.cores.primaryTint,
      borderWidth: 1,
      borderColor: tema.cores.primary,
      borderRadius: RAIO.card,
      padding: ESPACO.md,
      gap: ESPACO.xs,
    },
    perguntaGrau: { ...PAPEL.rotuloDeMetrica, color: tema.cores.primary },
    perguntaTexto: { ...PAPEL.tituloDaDecisao, color: tema.cores.text },
    perguntaRamo: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },

    erro: { gap: 2, paddingTop: ESPACO.xs },
    /** ⚠️ Riscado ⛔ e apagado: ⛔ ele está ali para ser **reconhecido**, ⛔ não lido como conduta. */
    erroErrado: {
      ...PAPEL.textoSecundario,
      color: tema.cores.textSecondary,
      textDecorationLine: "line-through",
    },
    erroCerto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    vazio: { ...PAPEL.textoPrincipal, color: tema.cores.textSecondary },
    grupo: { gap: ESPACO.sm },
    formulacao: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    verbo: {
      ...PAPEL.legenda, color: tema.cores.textSecondary,
      fontStyle: "italic",
    },
    resolve: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    acao: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border, padding: ESPACO.sm, gap: ESPACO.xs,
    },
    acaoTitulo: {
      ...PAPEL.micro, color: tema.cores.textSecondary,
    },
    novaAcao: {
      alignSelf: "flex-start", paddingHorizontal: ESPACO.md, paddingVertical: ESPACO.sm,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    novaAcaoTexto: {
      ...PAPEL.tituloDeSecao, color: tema.cores.text,
    },
  });
