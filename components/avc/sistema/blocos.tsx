/**
 * BLOCOS DE APRESENTAÇÃO — os que as REFERÊNCIAS têm, ⛔ e o módulo ⛔ não tinha.
 *
 * ── ⚠️⚠️ POR QUE ESTE ARQUIVO EXISTE ───────────────────────────────────────
 *
 * ⛔ Em 2026-09-06 o autor pôs lado a lado as referências que mandou ⛔ e a tela
 * entregue, ⛔ e perguntou: *"⛔ o designer, te pedi isso ⛔ e você me apresenta
 * isso — ⛔ está como pedi?"*. ⛔ **⛔ Não estava.**
 *
 * ⚠️ O esqueleto ⛔ e o comportamento estavam certos; o que faltava era a
 * **camada de apresentação** inteira. ⛔ Onde a referência tem uma grade de
 * tiles com número grande ⛔ e ícone colorido, a tela tinha `PA — · Glicemia —`
 * numa linha de texto cinza. ⛔ Onde a referência tem dois botões grandes verde
 * ⛔ e vermelho, a tela tinha uma lista de opções.
 *
 * ⚠️⚠️ ⛔ E O DIAGNÓSTICO DO ERRO DE MÉTODO, escrito para ⛔ não se repetir: eu
 * conferia *"⛔ está consistente com as outras telas?"* ⛔ e ⛔ nunca *"⛔ está
 * parecido com a referência?"*. ⛔ A matriz visual comparava as telas **entre
 * si**. ⛔ Passava no meu critério ⛔ e reprovava no do autor.
 *
 * ── ⚠️⚠️ O QUE ESTES BLOCOS ⛔ NÃO PODEM MUDAR ──────────────────────────────
 *
 * ⛔ **⛔ Nenhuma semântica clínica.** ⚠️ Ausência continua **neutra** ⛔ e ⛔ nunca
 * âmbar (**E-37**); ⛔ nada é afirmado por ausência (**E-23**); cor ⛔ nunca vem
 * sozinha (**E-15**). ⛔ A linguagem visual mudou; ⛔ a medicina ⛔ não.
 */
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useEstilosDoTema, useTheme, type Tema } from "../../../design-system/theme";
import { PAPEL } from "../../../design-system/tipografia-clinica";
import { SETA } from "../../../design-system/afordancia";
import { ESPACO, RAIO, TOQUE } from "../../../design-system/tokens";
import { useTr } from "../../../lib/use-tr";
import { Icone, type NomeDeIcone } from "../ui";

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · TILE DE SINAL VITAL — o bloco mais característico das referências
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ A cor do acento do tile. ⛔ Ela ⛔ **não** codifica gravidade — ⛔ ela
 * identifica **de que dado se trata**, exatamente como nas referências (PA
 * vermelho, SpO₂ ciano, glicemia roxo, NIHSS verde, peso âmbar).
 *
 * ⚠️⚠️ ⛔ E ⛔ ISSO ⛔ NÃO VIOLA **E-15**: o rótulo escrito (*"PA"*, *"Glicemia"*)
 * é quem nomeia o dado. ⛔ A cor é **reconhecimento rápido**, ⛔ e ⛔ nunca a
 * única portadora do significado — apague todas as cores ⛔ e o tile continua
 * dizendo a mesma coisa.
 */
export type AcentoDeTile = "critical" | "info" | "success" | "warning" | "debt" | "primary";

export type SinalVital = {
  readonly id: string;
  /** ⚠️ O nome do dado — ⛔ curto, ⛔ e ⛔ nunca truncado. */
  readonly rotulo: string;
  /** ⛔ `undefined` = ⛔ ainda ⛔ não medido. ⚠️ Ausência é NEUTRA. */
  readonly valor?: string;
  readonly unidade: string;
  readonly icone: NomeDeIcone;
  readonly acento: AcentoDeTile;
  /** ⚠️ Para onde tocar leva — o campo onde o dado se registra. */
  readonly onTocar?: () => void;
};

/**
 * ⚠️⚠️ O NÚMERO É O ASSUNTO DO TILE, ⛔ e a tipografia diz isso: `metrica`
 * (22 pt, tabular) contra `rotuloDeMetrica` (13) ⛔ e `micro` (11) na unidade.
 *
 * ⛔ Rótulo, valor ⛔ e unidade em pesos parecidos foi o que fez a faixa antiga
 * ler como **uma frase**, ⛔ e ⛔ não como um painel de medidas.
 */
export function VitalTile({ vital, testID }: { vital: SinalVital; testID?: string }) {
  const tr = useTr();
  const tema = useTheme();
  const e = useEstilosDoTema(estilos);
  const ausente = vital.valor === undefined;
  /**
   * ⚠️⚠️ O ÍCONE MANTÉM A COR MESMO ⛔ SEM VALOR — corrigido em 2026-09-06, ⛔ e
   * a correção veio de captura do autor: *"isso ainda está assim"*, com os
   * quatro tiles cinza.
   *
   * ⛔ A versão anterior apagava o acento quando o dado faltava. ⚠️ Como ⛔ nada
   * está medido ao abrir o módulo, **a grade inteira nascia cinza** — ⛔ e a
   * primeira tela do app voltava a ser o que ele criticou: tudo igual.
   *
   * ⚠️⚠️ ⛔ E A REGRA CERTA É OUTRA: o acento diz **que dado é este** (PA,
   * glicemia, NIHSS), ⛔ e ⛔ isso ⛔ não depende de o paciente ter sido medido.
   * ⛔ Ele ⛔ não é estado clínico — ⛔ e por isso ⛔ não pode ser apagado por
   * ausência.
   *
   * ⚠️ Quem fica neutro é o **valor**: o travessão continua cinza, ⛔ e ⛔ nunca
   * âmbar (**E-37**). ⛔ A identidade colore; o estado, ⛔ não.
   */
  const cor = tema.cores[vital.acento];
  const conteudo = (
    <>
      <View style={[e.tileIcone, { backgroundColor: tema.cores.surface }]}>
        <Icone nome={vital.icone} tamanho={20} cor={cor} />
      </View>
      <View style={e.tileTextos}>
        <Text style={e.tileRotulo} numberOfLines={2}>{tr(vital.rotulo)}</Text>
        <Text style={[e.tileValor, ausente && e.tileValorAusente]} numberOfLines={1}>
          {vital.valor ?? "—"}
        </Text>
        <Text style={e.tileUnidade} numberOfLines={1}>{tr(vital.unidade)}</Text>
      </View>
    </>
  );
  if (!vital.onTocar) {
    return <View style={e.tile} testID={testID}>{conteudo}</View>;
  }
  return (
    <Pressable
      onPress={vital.onTocar}
      accessibilityRole="button"
      accessibilityLabel={`${tr(vital.rotulo)}: ${vital.valor ?? tr("não informado")}`}
      testID={testID}
      style={({ pressed }) => [e.tile, pressed && e.pressionado]}
    >
      {conteudo}
    </Pressable>
  );
}

/**
 * ⚠️ A grade — **três por linha**, como nas referências. ⛔ `flexWrap` com
 * largura percentual, ⛔ e ⛔ não colunas fixas: em 375 px dá três tiles
 * confortáveis, ⛔ e ⛔ nenhum sobra sozinho numa linha vazia.
 */
export function VitalGrid({ vitais, testID }: { vitais: readonly SinalVital[]; testID?: string }) {
  const e = useEstilosDoTema(estilos);
  if (vitais.length === 0) return null;
  return (
    <View style={e.grade} testID={testID}>
      {vitais.map((v) => (
        <View key={v.id} style={e.gradeCelula}>
          <VitalTile vital={v} testID={`avc-vital-${v.id}`} />
        </View>
      ))}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2 · CABEÇALHO DE CARD — título à esquerda, procedência à direita
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ *"Sinais vitais e dados iniciais"* / *"Última atualização: 09:38"*. ⚠️ A
 * direita é **procedência ou saída**, ⛔ e ⛔ nunca uma segunda ação principal.
 */
export function CardHeader({
  titulo,
  aoLado,
  testID,
}: {
  titulo: string;
  aoLado?: ReactNode;
  testID?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  return (
    <View style={e.cardHeader} testID={testID}>
      <Text style={e.cardHeaderTitulo}>{tr(titulo)}</Text>
      {aoLado ?? null}
    </View>
  );
}

/** ⚠️ O link discreto do canto — *"Ver protocolo →"*. ⛔ Ação, ⛔ e ⛔ não título. */
export function LinkAction({
  rotulo,
  onPress,
  testID,
}: {
  rotulo: string;
  onPress: () => void;
  testID?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tr(rotulo)}
      hitSlop={10}
      testID={testID}
      style={({ pressed }) => [e.link, pressed && e.pressionado]}
    >
      <Text style={e.linkTexto}>{tr(rotulo)}</Text>
      <Icone nome="adiante" tamanho={14} />
    </Pressable>
  );
}

/** ⚠️ Legenda do canto direito — horário, procedência, contagem. */
export function CardNota({ children }: { children: string }) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  return <Text style={e.cardNota}>{tr(children)}</Text>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3 · ETAPA ATUAL — o card herói da decisão
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ ⛔ ELE ⛔ NÃO SUBSTITUI `DecisionSection`, ⛔ e a diferença importa:
 *
 *   · `DecisionSection` é a pergunta **dentro** de uma superfície de coleta.
 *   · `EtapaAtual` é o card que **domina a tela** — sobrancelha de acento,
 *     pergunta grande, ⛔ e as ações imediatamente abaixo.
 *
 * ⚠️ É o *"Etapa atual / Elegibilidade para trombólise"* das referências, ⛔ e o
 * que faltava para a tela ter um **assunto** em vez de uma lista de assuntos.
 *
 * ⚠️⚠️ ⛔ E ⛔ ele ⛔ NÃO cria fluxo obrigatório (**E-11**): ⛔ nenhuma outra fase
 * deixa de abrir por causa dele. ⛔ *"Etapa atual"* descreve **onde a atenção
 * está**, ⛔ e ⛔ não uma ordem a cumprir — ⛔ por isso ⛔ não há contador
 * *"3 de 4"*, que prometeria uma sequência que o módulo ⛔ não tem.
 */
export function EtapaAtual({
  sobrancelha = "Etapa atual",
  pergunta,
  contexto,
  children,
  aoLado,
  testID,
}: {
  sobrancelha?: string;
  pergunta: string;
  contexto?: string;
  children?: ReactNode;
  /** ⚠️ ⛔ No máximo um controle — o ⓘ que explica a pergunta. */
  aoLado?: ReactNode;
  testID?: string;
}) {
  const tr = useTr();
  const tema = useTheme();
  const e = useEstilosDoTema(estilos);
  return (
    <View style={e.etapa} testID={testID}>
      <View style={e.etapaTopo}>
        <View style={e.etapaSobrancelha}>
          <Icone nome="reperfusao" tamanho={15} cor={tema.cores.critical} />
          <Text style={e.etapaSobrancelhaTexto}>{tr(sobrancelha)}</Text>
        </View>
        {aoLado ?? null}
      </View>
      <Text style={e.etapaPergunta}>{tr(pergunta)}</Text>
      {contexto ? <Text style={e.etapaContexto}>{tr(contexto)}</Text> : null}
      {children ? <View style={e.etapaAcoes}>{children}</View> : null}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4 · BOTÕES DE RESPOSTA — o par grande verde / vermelho
 * ────────────────────────────────────────────────────────────────────────── */

export type TomDeResposta = "sim" | "nao" | "neutro";

/**
 * ⚠️⚠️ ⛔ VERDE ⛔ NÃO É "BOM" ⛔ E VERMELHO ⛔ NÃO É "RUIM" — ⛔ eles são **sim** ⛔ e
 * **não**. ⚠️ *"⛔ Não elegível"* ⛔ não é um erro do médico ⛔ nem um alarme: ⛔ é
 * uma resposta clínica legítima, ⛔ e ela vale tanto quanto a outra.
 *
 * ⚠️ Cada botão carrega **símbolo ⛔ e palavra** (**E-15**): ✓ Sim · ✕ Não. ⛔ Quem
 * ⛔ não distingue as cores lê exatamente o mesmo.
 *
 * ⚠️ Altura `TOQUE.critico` (56): ⛔ é a decisão da tela, ⛔ e ⛔ não um item de
 * lista. ⚠️ O app é usado com luva ⛔ e pressa.
 */
export function RespostaAction({
  rotulo,
  tom,
  selecionada,
  onPress,
  testID,
}: {
  rotulo: string;
  tom: TomDeResposta;
  /** ⚠️ Já respondida — ⛔ o botão ⛔ não some, ⛔ ele fica **marcado**. */
  selecionada?: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  const simbolo = tom === "sim" ? "✓" : tom === "nao" ? "✕" : "•";
  const preenchimento =
    tom === "sim" ? e.respostaSim : tom === "nao" ? e.respostaNao : e.respostaNeutra;
  const textoDoTom = tom === "neutro" ? e.respostaTextoNeutro : e.respostaTexto;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionada }}
      accessibilityLabel={tr(rotulo)}
      testID={testID}
      style={({ pressed }) => [
        e.resposta,
        preenchimento,
        /**
         * ⚠️ Selecionada ganha **anel**, ⛔ e ⛔ não outra cor: trocar a cor
         * faria a resposta escolhida parecer um botão diferente do que foi
         * apertado.
         */
        selecionada && e.respostaSelecionada,
        pressed && e.pressionado,
      ]}
    >
      <Text style={textoDoTom} accessibilityElementsHidden>{simbolo}</Text>
      <Text style={textoDoTom} numberOfLines={1}>{tr(rotulo)}</Text>
    </Pressable>
  );
}

/** ⚠️ As respostas lado a lado — ⛔ mesma largura, ⛔ e ⛔ nenhuma maior. */
export function RespostaLinha({ children }: { children: ReactNode }) {
  const e = useEstilosDoTema(estilos);
  return <View style={e.respostaLinha}>{children}</View>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5 · CHECKLIST COM LINHA DO TEMPO — feito × pendente, ⛔ e o horário
 * ────────────────────────────────────────────────────────────────────────── */

export type ItemDeChecklist = {
  readonly id: string;
  readonly titulo: string;
  readonly detalhe?: string;
  /**
   * ⚠️⚠️ ⛔ TRÊS ESTADOS, ⛔ E ⛔ NÃO DOIS. ⚠️ *"pendente"* é trabalho ⛔ ainda
   * ⛔ não feito; *"⛔ não se aplica"* é uma **decisão já tomada**. ⛔ Achatá-los
   * num só faria a tela cobrar para sempre algo que o caso dispensou.
   */
  readonly estado: "feito" | "pendente" | "dispensado";
  /** ⛔ ⛔ Nunca inventado: só aparece quando o fato tem horário registrado. */
  readonly horario?: string;
  readonly onTocar?: () => void;
};

/**
 * ⚠️⚠️ A LINHA CONECTORA É O QUE FAZ ISTO SER UMA **TRAJETÓRIA**, ⛔ e ⛔ não uma
 * lista de caixas. ⚠️ Ela é o elemento das referências que mais mudava a
 * sensação da tela — ⛔ e ⛔ ela custa uma `View` de 2 px de largura.
 */
export function ChecklistTimeline({
  itens,
  testID,
}: {
  itens: readonly ItemDeChecklist[];
  testID?: string;
}) {
  const tr = useTr();
  const tema = useTheme();
  const e = useEstilosDoTema(estilos);
  if (itens.length === 0) return null;
  return (
    <View style={e.trilha} testID={testID}>
      {itens.map((item, i) => {
        const feito = item.estado === "feito";
        const dispensado = item.estado === "dispensado";
        const cor = feito
          ? tema.cores.success
          : dispensado
            ? tema.cores.textSecondary
            : tema.cores.border;
        const ultimo = i === itens.length - 1;
        /**
         * ⚠️⚠️ ⛔ NEM TODO PASSO LEVA A ALGUM LUGAR — ⛔ e os que levam ⛔ não
         * podiam ser distinguidos dos que ⛔ não levam. ⚠️ A seta ⛔ e a moldura
         * entram ⛔ só em quem tem `onTocar`; ⛔ pintar todos prometeria um toque
         * que a metade da lista ⛔ não cumpre.
         */
        const tocavel = item.onTocar !== undefined;
        const linha = (
          <View style={[e.trilhaItem, tocavel ? e.trilhaItemTocavel : null]}>
            <View style={e.trilhaMarcaColuna}>
              <View style={[e.trilhaMarca, { borderColor: cor }, feito && { backgroundColor: cor }]}>
                {/**
                  * ⚠️ Símbolo dentro do círculo — **E-15**: ⛔ o estado ⛔ não
                  * depende de o leitor distinguir verde de cinza.
                  */}
                {feito ? (
                  <Text style={e.trilhaMarcaSimbolo} accessibilityElementsHidden>{"✓"}</Text>
                ) : null}
              </View>
              {!ultimo ? <View style={e.trilhaLinha} /> : null}
            </View>
            <View style={e.trilhaTextos}>
              <View style={e.trilhaCabeca}>
                <Text style={e.trilhaTitulo}>{tr(item.titulo)}</Text>
                <Text style={e.trilhaHorario}>
                  {item.horario ?? tr(feito ? "registrado" : dispensado ? "não se aplica" : "pendente")}
                </Text>
              </View>
              {item.detalhe ? <Text style={e.trilhaDetalhe}>{tr(item.detalhe)}</Text> : null}
            </View>
            {tocavel ? <Text style={e.trilhaSeta}>{SETA}</Text> : null}
          </View>
        );
        if (!item.onTocar) return <View key={item.id} testID={`avc-passo-${item.id}`}>{linha}</View>;
        return (
          <Pressable
            key={item.id}
            onPress={item.onTocar}
            accessibilityRole="button"
            accessibilityLabel={`${tr(item.titulo)} — ${tr(item.estado === "feito" ? "registrado" : item.estado === "dispensado" ? "não se aplica" : "pendente")}`}
            testID={`avc-passo-${item.id}`}
            style={({ pressed }) => [pressed && e.pressionado]}
          >
            {linha}
          </Pressable>
        );
      })}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * ESTILOS — ⛔ nenhum hex, ⛔ nenhum tamanho de fonte avulso
 * ────────────────────────────────────────────────────────────────────────── */

function estilos(tema: Tema) {
  return {
    /* ── tiles ────────────────────────────────────────────────────────────── */
    grade: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm } as const,
    /**
     * ⚠️⚠️ **DOIS** por linha, ⛔ e ⛔ não três — medido na captura de 2026-09-06.
     *
     * ⛔ Com três, o tile ficava com ~58 px úteis depois do ícone, ⛔ e
     * *"Glicemia"* virava *"Glic…"*, *"NIHSS"* virava *"NIH…"*. ⚠️ A referência
     * usa três porque roda em 393 pt ⛔ e com rótulos de duas letras (*PA*,
     * *FC*); ⛔ os nossos são nomes clínicos, ⛔ e **nome clínico ⛔ não trunca**.
     *
     * ⚠️ ⛔ Copiar o número de colunas ⛔ e perder o nome seria copiar a forma
     * ⛔ e jogar fora o conteúdo.
     */
    gradeCelula: { width: "48%", flexGrow: 1 } as const,
    tile: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.controlSurface,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      paddingVertical: ESPACO.sm,
      paddingHorizontal: ESPACO.sm,
      minHeight: 76,
    } as const,
    tileIcone: {
      width: 38,
      height: 38,
      borderRadius: RAIO.botao,
      alignItems: "center",
      justifyContent: "center",
    } as const,
    tileTextos: { flex: 1, minWidth: 0 } as const,
    tileRotulo: { ...PAPEL.rotuloDeMetrica, color: tema.cores.textSecondary } as const,
    tileValor: { ...PAPEL.metrica, color: tema.cores.text } as const,
    /** ⚠️ O travessão da ausência é NEUTRO — ⛔ nunca âmbar, ⛔ nunca vermelho. */
    tileValorAusente: { color: tema.cores.textSecondary } as const,
    tileUnidade: { ...PAPEL.micro, color: tema.cores.textSecondary } as const,

    /* ── cabeçalho de card ────────────────────────────────────────────────── */
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    } as const,
    cardHeaderTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text, flexShrink: 1 } as const,
    cardNota: { ...PAPEL.legenda, color: tema.cores.textSecondary, flexShrink: 0 } as const,
    link: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs, flexShrink: 0 } as const,
    linkTexto: { ...PAPEL.legenda, color: tema.cores.primary } as const,

    /* ── etapa atual ──────────────────────────────────────────────────────── */
    /**
     * ⚠️⚠️ TINGIMENTO + BORDA DE ACENTO — é o que dá ao card herói a presença
     * que as referências têm. ⛔ Ele é o **único** bloco da tela com esse
     * tratamento: dois iguais ⛔ e ⛔ nenhum dos dois é herói.
     */
    etapa: {
      backgroundColor: tema.cores.criticalTint,
      borderWidth: 1,
      borderColor: tema.cores.critical,
      borderRadius: RAIO.card,
      padding: ESPACO.md,
      gap: ESPACO.sm,
    } as const,
    etapaTopo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    } as const,
    etapaSobrancelha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs } as const,
    etapaSobrancelhaTexto: { ...PAPEL.rotuloDeMetrica, color: tema.cores.critical } as const,
    etapaPergunta: { ...PAPEL.tituloDaDecisao, color: tema.cores.text } as const,
    etapaContexto: { ...PAPEL.textoPrincipal, color: tema.cores.textSecondary } as const,
    etapaAcoes: { gap: ESPACO.sm, paddingTop: ESPACO.xs } as const,

    /* ── respostas ────────────────────────────────────────────────────────── */
    respostaLinha: { flexDirection: "row", gap: ESPACO.sm } as const,
    resposta: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: ESPACO.sm,
      minHeight: TOQUE.critico,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.sm,
    } as const,
    respostaSim: { backgroundColor: tema.cores.successFill } as const,
    respostaNao: { backgroundColor: tema.cores.criticalFill } as const,
    /** ⚠️ *"Incerto"* / *"⛔ Não sei"* — ⛔ contorno, ⛔ e ⛔ nunca preenchido. */
    /**
     * ⚠️ Mesmos tokens do gêmeo `decisaoNeutra` em `ui/index.tsx` — ⛔ eles são
     * o **mesmo botão conceitual** (*"Incerto"* / *"⛔ Não sei"*), ⛔ e ficaram
     * com aparências diferentes até a auditoria de 2026-09-06 apontar.
     */
    respostaNeutra: {
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    } as const,
    respostaSelecionada: { borderWidth: 2, borderColor: tema.cores.text } as const,
    respostaTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill } as const,
    respostaTextoNeutro: { ...PAPEL.tituloDeSecao, color: tema.cores.text } as const,

    /* ── linha do tempo ───────────────────────────────────────────────────── */
    trilha: { gap: 0 } as const,
    trilhaItem: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm } as const,
    trilhaItemTocavel: {
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.xs,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    } as const,
    trilhaSeta: { ...PAPEL.tituloDeSecao, color: tema.cores.text } as const,
    trilhaMarcaColuna: { alignItems: "center", width: 26 } as const,
    trilhaMarca: {
      width: 22,
      height: 22,
      borderRadius: RAIO.badge,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    } as const,
    trilhaMarcaSimbolo: { ...PAPEL.micro, color: tema.cores.bg } as const,
    /** ⚠️ O fio que liga um passo ao próximo — ⛔ 2 px, ⛔ e é ele que faz a trajetória. */
    trilhaLinha: { flex: 1, width: 2, minHeight: ESPACO.md, backgroundColor: tema.cores.border } as const,
    trilhaTextos: { flex: 1, paddingBottom: ESPACO.md, gap: 2 } as const,
    trilhaCabeca: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    } as const,
    /** ⚠️ Nome clínico ⛔ NUNCA trunca — quem cede espaço é o horário. */
    trilhaTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text, flexShrink: 1 } as const,
    trilhaHorario: { ...PAPEL.legenda, color: tema.cores.textSecondary, flexShrink: 0 } as const,
    trilhaDetalhe: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary } as const,

    pressionado: { opacity: 0.85 } as const,
  };
}
