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
import { bloqueiosComAcoes } from "../../avc/nucleo/derivacoes-e";
import { estadoDoPortaoIVT } from "../../avc/nucleo/portao-ivt";
import { ESTADOS, type EstadoClinico } from "../../design-system/estados-clinicos";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorNaInstancia } from "../../avc/nucleo/instancia";
import { CabecalhoDeBloco, CampoDaSuperficie, useDetalhes } from "./campos-clinicos";
import { CondutaDaPressao, CondutaGlicemica } from "./conduta-da-fonte";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO } from "../../design-system/tokens";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { useTr } from "../../lib/use-tr";

/**
 * ⚠️ ⛔ `PAPEL_EM_PALAVRAS` mudou de casa em 2026-09-08: ⛔ ele é do **desenho**
 * dos agentes, ⛔ e o desenho mora em `conduta-da-fonte.tsx`, ⛔ que as duas
 * telas chamam.
 */

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolherNaAcao: (acao: string, campo: string, valor: string) => void;
  onDesfazerNaAcao: (acao: string, campo: string) => void;
  onNovaAcao: (tipo: string) => void;
};

/**
 * ⚠️⚠️ ⛔ AS FRASES DO CICLO — ⛔ e ⛔ elas ⛔ não repetem as da Reperfusão.
 *
 * ⛔ Lá o médico pergunta *"posso decidir?"*; ⛔ aqui ⛔ ele pergunta *"o que
 * falta para eu ter resolvido?"*. ⚠️ Mesma regra, ⛔ duas perguntas.
 */
const TITULO_DO_CICLO: Readonly<Record<string, string>> = {
  bloqueado_corrigivel: "Problema detectado — ação corretiva ainda não registrada",
  aguardando_reavaliacao: "Ação registrada — aguardando a reavaliação",
  afericao_incompleta: "Nova aferição incompleta — complete para reavaliar",
  bloqueado_seguranca: "Há contraindicação de segurança, além do que se corrige aqui",
  nao_recomendada: "A diretriz não recomenda a trombólise neste caso",
  informacao_incompleta: "Nada mais a corrigir aqui",
  sem_criterios: "Nada mais a corrigir aqui",
  liberado: "Nada mais a corrigir aqui",
};

/** ⚠️ ⛔ Símbolo ⛔ e palavra — ⛔ cor sozinha ⛔ não é leitura (**E-15**). */
const SIMBOLO_DO_CICLO: Readonly<Record<string, EstadoClinico>> = {
  bloqueado_corrigivel: "corrigivel",
  aguardando_reavaliacao: "andamento",
  afericao_incompleta: "andamento",
  bloqueado_seguranca: "impede",
  nao_recomendada: "impede",
  informacao_incompleta: "favoravel",
  sem_criterios: "favoravel",
  liberado: "favoravel",
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
  /**
   * ── ⚠️⚠️ ⛔ O CICLO FECHA **AQUI**, ⛔ e ⛔ não na Reperfusão ─────────────
   *
   * ⚠️ Decisão do autor, 2026-09-07 (**item 11**): *"O médico ⛔ não deve
   * precisar voltar manualmente à Reperfusão para descobrir se liberou. A tela
   * deve mostrar o novo estado **imediatamente** após a reavaliação."*
   *
   * ⛔ ⛔ E ⛔ ela **⛔ não recalcula**: lê o mesmo `estadoDoPortaoIVT()` que a
   * Reperfusão lê. ⛔ Duas somas da mesma regra é como as duas telas passam a
   * discordar sobre o mesmo paciente (**I6**).
   */
  const portao = estadoDoPortaoIVT(estado);

  return (
    <View style={e.raiz} testID="avc-superficie-e-conteudo">
      {blocos.length === 0 ? (
        <Text style={e.vazio} testID="avc-e-sem-bloqueio">
          {tr("Nenhum bloqueio corrigível registrado. Nada nesta tela espera por ação.")}
        </Text>
      ) : null}

      {/**
        * ⚠️⚠️ ⛔ O ESTADO DO CICLO, ⛔ E ⛔ O QUE FALTA — ⛔ e ⛔ nunca um botão
        * mudo (**item 12**).
        *
        * ⛔ *"Aguardando nova aferição"* ⛔ e *"Aguardando nova avaliação
        * neurológica"* ⛔ são coisas diferentes, ⛔ e a frase vem do **motivo**
        * que o núcleo já nomeia — ⛔ a tela ⛔ não a inventa.
        */}
      <View style={e.cicloEstado} testID={`avc-e-ciclo-${portao.estado}`}>
        <Text style={e.cicloTitulo}>
          {ESTADOS[SIMBOLO_DO_CICLO[portao.estado] ?? "ausente"].simbolo}{" "}
          {tr(TITULO_DO_CICLO[portao.estado] ?? "")}
        </Text>
        {portao.motivos
          .filter((m) => m.camada === "correcao")
          .map((m) => (
            <Text key={m.id} style={e.cicloFalta} testID={`avc-e-ciclo-falta-${m.id}`}>
              {tr(m.rotulo)}
              {m.dado ? ` — ${tr(m.dado)}` : ""} · {tr(m.oQueFalta)}
            </Text>
          ))}
      </View>

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
                    /** ⚠️ ⛔ Ver `superficie-d.tsx`: literal `undefined` ⛔ é campo cego esperando o primeiro campo numérico. */
                    numero={(() => {
                      const v = valorNaInstancia(estado, a.instancia, campo.id)?.valor;
                      return typeof v === "number" ? v : undefined;
                    })()}
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
            {/**
              * ── ⚠️⚠️ COMO CORRIGIR — F-19, ⛔ e ⛔ só para a pressão ────────────
              *
              * ⚠️ Pedido do autor em 2026-09-06: *"contraindicações corrigíveis
              * PA ⛔ e glicemia ⛔ e maneira de corrigir, o que usar ⛔ e doses"*.
              *
              * ⚠️⚠️ ⛔ O DESENHO MUDOU DE ARQUIVO em 2026-09-08, ⛔ e ⛔ não de
              * conteúdo: ⛔ ele ⛔ agora é `CondutaDaPressao`, ⛔ que a
              * **Estabilização** também chama. ⛔ Duas telas montando o mesmo
              * bloco com JSX próprio divergiriam no primeiro campo novo.
              *
              * ⚠️ ⛔ O `prefixo` mantém os `testID` que as travas desta tela
              * ⛔ já mediam — ⛔ mudar de arquivo ⛔ não pode custar a
              * continuidade de garantia ⛔ nenhuma.
              */}
            {bloqueio.id === "pressao_acima_da_meta" ? <CondutaDaPressao prefixo="avc-e-" /> : null}

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
            {/**
              * ── ⚠️⚠️ F-18 · A GLICEMIA ⛔ NÃO CONTRAINDICA ────────────────────
              *
              * ⚠️ Mesmo movimento da pressão: ⛔ o desenho vive em
              * `CondutaGlicemica`, ⛔ e a Estabilização chama o **mesmo**.
              */}
            {bloqueio.id === "glicemia_alterada" ? <CondutaGlicemica prefixo="avc-e-" /> : null}

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
    cicloEstado: {
      gap: 2,
      padding: ESPACO.sm,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.surface,
    },
    cicloTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text, flexShrink: 1 },
    cicloFalta: { ...PAPEL.legenda, color: tema.cores.textSecondary, flexShrink: 1 },
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
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.controlBorder,
    },
    novaAcaoTexto: {
      ...PAPEL.tituloDeSecao, color: tema.cores.text,
    },
  });
