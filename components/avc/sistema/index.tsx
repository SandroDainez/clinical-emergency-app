/**
 * SISTEMA CLÍNICO — os componentes-base do AVC (PD-37).
 *
 * ── ⚠️⚠️ O QUE ESTE ARQUIVO É ──────────────────────────────────────────────
 *
 * O **esqueleto único** de tela do módulo, ⛔ e ⛔ não uma biblioteca genérica.
 * Cada componente aqui nasceu de uso concreto nas três superfícies-piloto
 * (Estabilização, Neurológico, Imagem) — ⛔ nenhum foi criado "para quando
 * precisar". ⚠️ Abstração antes da tela produz componente com trinta props ⛔ e
 * uma exceção por chamador (instrução do autor, 2026-09-05).
 *
 * ── ⚠️⚠️ AS TRÊS REGRAS QUE ⛔ NÃO SE QUEBRAM AQUI ─────────────────────────
 *
 *   ⛔ **⛔ Nenhum `fontSize`, `fontWeight` ⛔ ou `lineHeight` avulso.** Todo texto
 *      sai de `PAPEL` (`design-system/tipografia-clinica.ts`). A trava
 *      `valida-tipografia-clinica` reprova o contrário.
 *
 *   ⛔ **⛔ Nenhum hex.** Toda cor sai de `tema.cores` — ⛔ e por isso os dois
 *      temas nascem corretos, ⛔ e ⛔ não um depois do outro.
 *
 *   ⛔ **⛔ Nenhuma caixa por decoração.** Antes de desenhar contorno, a ordem é:
 *      *dá para remover o contêiner? dá para resolver com espaço e tipografia?
 *      precisa de divisor? só então `surfaceElevated`.* ⚠️ O objetivo é **menos
 *      caixas**, ⛔ e ⛔ não caixas mais bonitas.
 *
 * ── ⚠️⚠️ O ORÇAMENTO VERTICAL ──────────────────────────────────────────────
 *
 * Em 375×812, o cromado fixo (cabeçalho + contexto + navegação) cabe em ~140 px
 * dos 812 — **17%**. ⚠️ O resto é conteúdo clínico. ⛔ Header, contexto,
 * navegação ⛔ e título de fase juntos ⛔ não podem comer meia tela antes da
 * decisão aparecer (autor, 2026-09-05).
 */
import { useEffect, useRef, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useEstilosDoTema, useTheme, type Tema } from "../../../design-system/theme";
import { PAPEL } from "../../../design-system/tipografia-clinica";
import { ESPACO, LARGURA, RAIO, TOQUE } from "../../../design-system/tokens";
import { useTr } from "../../../lib/use-tr";

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · CABEÇALHO CLÍNICO — identidade e saída
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ Uma linha: sair + a síndrome aberta. ⛔ Sem subtítulo, ⛔ sem cronômetro
 * grande — o tempo de atendimento é contexto, ⛔ e vive no `PatientContext`.
 */
export function ClinicalHeader({
  titulo,
  escopo,
  marcador,
  relogio,
  onSair,
  aoLado,
}: {
  titulo: string;
  /** ⚠️ A linha de baixo — o escopo da síndrome. ⛔ Nunca o nome do módulo de novo. */
  escopo?: string;
  /** ⚠️ O estado do atendimento, em vermelho ⛔ e com marcador redondo. */
  marcador?: string;
  /**
   * ⚠️⚠️ O RELÓGIO CLÍNICO À DIREITA — ⛔ e ⛔ **não** o tempo de atendimento.
   *
   * ⚠️ Decisão do autor mantida (2026-09-05): *"contador grande correndo vira
   * ruído ansiogênico numa sala já tensa"*. ⛔ Na referência esse lugar é do
   * cronômetro; aqui ele é da **última vez visto bem** — o número que decide
   * janela ⛔ e elegibilidade. ⚠️ Mesma posição, mesmo peso, ⛔ conteúdo mais
   * útil.
   */
  relogio?: { readonly rotulo: string; readonly valor?: string; readonly onTocar?: () => void };
  onSair: () => void;
  aoLado?: ReactNode;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  /**
   * ⚠️⚠️ TRÊS COLUNAS, COMO NAS REFERÊNCIAS: sair · identidade · relógio.
   *
   * ⛔ A versão anterior era duas linhas empilhadas ⛔ e ⛔ nenhum relógio fixo —
   * ⛔ o tempo só existia dentro do contexto expandido, ⛔ que rolava. ⚠️ Aqui
   * ele fica **fora do ScrollView**, ⛔ e por isso ⛔ nunca some (§7.8).
   */
  return (
    <View style={e.header}>
      <View style={e.headerLado}>
        <Pressable
          onPress={onSair}
          accessibilityRole="button"
          accessibilityLabel={tr("Sair do módulo e voltar para a lista")}
          hitSlop={8}
          style={({ pressed }) => [e.headerSair, pressed && e.pressionado]}
        >
          <Text style={e.headerSairTexto}>{tr("‹ Voltar")}</Text>
        </Pressable>
      </View>

      <View style={e.headerCentro}>
        {marcador ? (
          <View style={e.headerMarcador}>
            <View style={e.headerMarcadorPonto} />
            <Text style={e.headerMarcadorTexto}>{tr(marcador)}</Text>
          </View>
        ) : null}
        <Text style={e.headerTitulo} numberOfLines={3}>{tr(titulo)}</Text>
        {escopo ? <Text style={e.headerEscopo} numberOfLines={2}>{tr(escopo)}</Text> : null}
      </View>

      <View style={e.headerLado}>
        {relogio ? (
          <Pressable
            onPress={relogio.onTocar}
            disabled={!relogio.onTocar}
            accessibilityRole={relogio.onTocar ? "button" : undefined}
            accessibilityLabel={`${tr(relogio.rotulo)}: ${relogio.valor ?? tr("não informado")}`}
            testID="avc-relogio-do-topo"
            style={({ pressed }) => [e.headerRelogio, pressed && e.pressionado]}
          >
            {/**
              * ⚠️ Ausência NEUTRA (**E-37**): sem o horário, o relógio mostra
              * travessão ⛔ e ⛔ não zero. ⛔ Zero seria uma medida ⛔ que ⛔ ninguém
              * fez.
              */}
            <Text style={[e.headerRelogioValor, relogio.valor === undefined && e.headerRelogioAusente]}>
              {relogio.valor ?? "—"}
            </Text>
            <Text style={e.headerRelogioRotulo} numberOfLines={2}>{tr(relogio.rotulo)}</Text>
          </Pressable>
        ) : null}
        {aoLado ?? null}
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2 · CONTEXTO DO PACIENTE — a faixa persistente
 * ────────────────────────────────────────────────────────────────────────── */

export type DadoDeContexto = {
  readonly id: string;
  readonly rotulo: string;
  /** ⛔ `undefined` = ⛔ ainda ⛔ não sabido. ⚠️ Ausência é NEUTRA, ⛔ nunca alerta. */
  readonly valor?: string;
  /** ⚠️ Para onde tocar leva, quando o dado ⛔ ainda ⛔ não existe. */
  readonly onTocar?: () => void;
};

/**
 * ⚠️⚠️ FAIXA, ⛔ E ⛔ NÃO CARD. ⛔ Sem contorno, ⛔ sem fundo próprio, ⛔ sem chips:
 * ela se separa do conteúdo por **um divisor e espaço**, ⛔ e nada mais.
 *
 * ⚠️ Ela **cresce com o atendimento**: só entram os dados que já existem, ⛔ e
 * quem ⛔ ainda ⛔ não foi medido aparece como travessão neutro, tocável, levando
 * a onde se registra. ⛔ Um painel que mostra dez campos vazios ⛔ não é contexto
 * — é formulário deitado.
 */
export function PatientContext({
  dados,
  aoFim,
}: {
  dados: readonly DadoDeContexto[];
  /**
   * ⚠️ Um controle no fim da faixa — ⛔ e ⛔ no máximo um. ⚠️ É por onde o
   * detalhe abre, quando existe detalhe. ⛔ A faixa inteira ⛔ não vira botão:
   * cada dado já leva ao campo onde se registra, ⛔ e os dois gestos brigariam.
   */
  aoFim?: ReactNode;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  if (dados.length === 0) return null;
  /**
   * ⚠️⚠️ OS `testID` SÃO OS ANTIGOS, ⛔ e ⛔ isso ⛔ não é descuido.
   *
   * ⚠️ A suíte e2e os usa para guardar **garantias clínicas** — que a ausência é
   * neutra, que tocar num vazio leva a onde se registra. ⛔ Renomeá-los por
   * motivo **cosmético** obrigaria a reescrever testes que protegem medicina,
   * ⛔ e teste reescrito é teste que deixa de provar o que provava.
   */
  return (
    <View style={e.contexto} testID="avc-resumo">
      {dados.map((d, i) => (
        <View key={d.id} style={e.contextoItem}>
          {i > 0 ? <Text style={e.contextoSep}>·</Text> : null}
          <Pressable
            onPress={d.onTocar}
            disabled={!d.onTocar}
            accessibilityRole={d.onTocar ? "button" : undefined}
            testID={`avc-contexto-${d.id}`}
            style={e.contextoToque}
          >
            <Text style={e.contextoRotulo}>{tr(d.rotulo)}</Text>
            <Text style={[e.contextoValor, d.valor === undefined && e.contextoAusente]}>
              {d.valor ?? "—"}
            </Text>
          </Pressable>
        </View>
      ))}
      {aoFim ?? null}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3 · NAVEGAÇÃO ENTRE FASES — a barra do polegar
 * ────────────────────────────────────────────────────────────────────────── */

export type Fase = {
  readonly id: string;
  readonly nome: string;
  readonly icone: ReactNode;
  /** ⚠️ Bloqueio corrigível nesta fase — ⛔ um ponto, ⛔ nunca um número. */
  readonly marcada?: boolean;
};

/**
 * ⚠️⚠️ ⛔ ELA ⛔ NÃO É UMA ÁRVORE. Qualquer fase abre a partir de qualquer outra,
 * em um toque, em qualquer ordem (§7.2, **E-11**). ⛔ Ela mostra **onde estou**,
 * ⛔ e ⛔ não "o que já terminei" — o autor manteve, em 2026-09-05, a decisão de
 * ⛔ não marcar fase como concluída: num catálogo de fatos, "concluir" ⛔ não tem
 * definição clínica.
 *
 * ⛔ ⛔ E ⛔ NÃO É PAINEL DE ALERTA: ⛔ nenhum badge com número.
 */
export function PhaseNavigation({
  fases,
  atual,
  onAbrir,
  paddingInferior,
}: {
  fases: readonly Fase[];
  atual: string;
  onAbrir: (id: string) => void;
  paddingInferior: number;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  const trilho = useRef<ScrollView | null>(null);
  const posicoes = useRef<Record<string, { x: number; largura: number }>>({});

  /**
   * ⚠️⚠️ A BARRA ⛔ NÃO ANDA SOZINHA — exigência do autor, 2026-09-05.
   *
   * ⛔ Trocar de fase por outro caminho (um botão do conteúdo, uma pendência)
   * deixava a aba ativa **fora da viewport**: o médico estava em "Reperfusão" ⛔ e
   * a barra mostrava "Estabilizar" aceso em lugar nenhum. ⚠️ Ele teria de rolar
   * a barra **para descobrir onde está** — ⛔ que é o oposto do que ela serve.
   *
   * ⚠️ Traz a ativa para a área visível a cada troca, ⛔ e ⛔ não a cada render.
   */
  useEffect(() => {
    const alvo = posicoes.current[atual];
    if (!alvo || !trilho.current) return;
    trilho.current.scrollTo({ x: Math.max(0, alvo.x - 24), animated: true });
  }, [atual]);

  /**
   * ⚠️⚠️ ROLÁVEL NA HORIZONTAL — corrigido em 2026-09-05 **na captura**.
   *
   * ⛔ Seis abas divididas em 375 px davam ~62 px cada, ⛔ e "Reperfusão"
   * truncava para *"Reperfus…"*. ⚠️ Nome clínico truncado ⛔ não é abreviação: é
   * um nome que deixou de identificar o que nomeia.
   *
   * ⛔ **⛔ Não** foi resolvido encolhendo a fonte — 11 pt já é o menor degrau da
   * escala, ⛔ e diminuir mais trocaria um defeito de leitura por outro.
   * ⛔ **⛔ Nem** abreviando: "Reperf." ⛔ não é imediatamente compreensível numa
   * sala com pressa.
   *
   * ⚠️ Rolar preserva as quatro propriedades que a barra ⛔ não pode perder:
   * ⛔ não-wizard, livre, compacta ⛔ e clara. ⚠️ E as primeiras abas continuam
   * visíveis sem gesto nenhum — quem ⛔ não rolar ⛔ não perde acesso, porque
   * ⛔ nenhuma fase depende de outra (**E-11**).
   */
  return (
    <View style={[e.navTrilho, { paddingBottom: paddingInferior }]}>
    <View style={e.colunaNav}>
    <ScrollView
      ref={trilho}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={e.nav}
      contentContainerStyle={e.navConteudo}
      testID="avc-barra"
    >
      {fases.map((f) => {
        const ativa = f.id === atual;
        return (
          <Pressable
            key={f.id}
            onPress={() => onAbrir(f.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: ativa }}
            accessibilityLabel={tr(f.nome)}
            testID={`avc-aba-${f.id}`}
            style={e.navItem}
            onLayout={(ev) => {
              const { x, width } = ev.nativeEvent.layout;
              posicoes.current[f.id] = { x, largura: width };
            }}
          >
            <View>
              {f.icone}
              {f.marcada ? <View style={e.navPonto} testID={`avc-aba-ponto-${f.id}`} /> : null}
            </View>
            <Text style={[e.navNome, ativa && e.navNomeAtivo]} numberOfLines={1} testID={`avc-rotulo-aba-${f.id}`}>
              {tr(f.nome)}
            </Text>
            <View style={ativa ? e.navSublinhado : e.navSublinhadoVazio} />
          </Pressable>
        );
      })}
    </ScrollView>
    {/**
      * ⚠️⚠️ AFFORDANCE DE CONTINUIDADE — ⛔ e ⛔ não uma seta grande.
      *
      * ⛔ Cortada a seco, a barra faz o médico acreditar que **só existem as
      * fases visíveis**. ⚠️ Um degradê estreito na borda direita diz *"tem mais
      * ali"* ⛔ sem acrescentar controle, ruído ⛔ nem área de toque nova.
      *
      * ⛔ `pointerEvents="none"`: ele ⛔ não pode roubar o toque da aba embaixo.
      */}
    <View style={e.navBorda} pointerEvents="none" testID="avc-barra-continua" />
    </View>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4 · CABEÇALHO DA FASE — o que esta tela quer
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ Nome da fase + **o que ela pede**. ⚠️ O objetivo em uma linha é o que
 * responde ao *teste de três segundos*: o médico chega ⛔ e sabe o que a tela
 * espera dele ⛔ sem ler o conteúdo inteiro.
 */
export function ScreenHeader({ nome, objetivo }: { nome: string; objetivo?: string }) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  return (
    <View style={e.fase} testID="avc-fase-cabecalho">
      <Text style={e.faseNome}>{tr(nome)}</Text>
      {objetivo ? <Text style={e.faseObjetivo}>{tr(objetivo)}</Text> : null}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5 · CARTÃO CLÍNICO — a única caixa do sistema
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ UM tipo de caixa, ⛔ e ⛔ não seis. ⚠️ `aninhado` ⛔ não desenha outra
 * moldura: ele **muda de degrau de superfície**, que é como o sistema separa
 * conteúdo interno ⛔ sem empilhar contornos.
 *
 * ⛔ Se o bloco ⛔ não precisa se separar, ⛔ ele ⛔ não usa este componente —
 * espaço ⛔ e tipografia bastam.
 */
export function ClinicalCard({
  children,
  aninhado,
  testID,
}: {
  children: ReactNode;
  aninhado?: boolean;
  testID?: string;
}) {
  const e = useEstilosDoTema(estilos);
  return (
    <View style={aninhado ? e.cardAninhado : e.card} testID={testID}>
      {children}
    </View>
  );
}

/** ⚠️ Título de seção — ⛔ texto ⛔ e espaço, ⛔ sem barra colorida de fundo. */
export function SectionTitle({ children, testID }: { children: string; testID?: string }) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  return <Text style={e.secao} testID={testID}>{tr(children)}</Text>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5b · ESTADO VAZIO — a ausência que PERTENCE ao campo
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ ELE ⛔ NÃO É TEXTO SOLTO — foi exatamente esse o defeito que a captura de
 * 2026-09-05 revelou: *"Sem essa informação"* flutuava **entre** dois relógios,
 * ⛔ sem pertencer visualmente a nenhum dos dois.
 *
 * ⚠️ Aqui a ausência é **parte do campo**: mesma indentação, mesmo bloco, ⛔ e
 * com o motivo dito. ⛔ Ausência ⛔ nunca é âmbar ⛔ e ⛔ nunca é erro — campo
 * vazio ⛔ não é achado (**E-37**: ⛔ não perguntado ≠ perguntado e ⛔ não sabido).
 */
export function EmptyState({
  texto,
  acao,
  testID,
}: {
  texto: string;
  /** ⚠️ Como sair do vazio — ⛔ quando existe saída. */
  acao?: ReactNode;
  testID?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  return (
    <View style={e.vazio} testID={testID}>
      <Text style={e.vazioTexto}>{tr(texto)}</Text>
      {acao ?? null}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5c · INFORMAÇÃO — o ⓘ, ⛔ e ⛔ nunca órfão
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ UM ÚNICO PADRÃO DE ⓘ NO MÓDULO INTEIRO — posição, tamanho, área de
 * toque ⛔ e comportamento.
 *
 * ⛔ A captura mostrava ⓘ flutuando **fora** da caixa que explicavam, em
 * tamanhos diferentes, alguns sozinhos numa linha. ⚠️ Um ⓘ que ⛔ não encosta no
 * que explica ⛔ não explica nada — ⛔ ele só ocupa espaço ⛔ e sugere que há algo
 * escondido em outro lugar.
 *
 * ⚠️ Ele vive **na linha do título** que acompanha, ⛔ e abre em revelação
 * embaixo — ⛔ nunca em modal, que tiraria o médico da tela.
 */
export function InfoToggle({
  aberto,
  onAlternar,
  rotuloAcessivel,
  testID,
}: {
  aberto: boolean;
  onAlternar: () => void;
  rotuloAcessivel: string;
  testID?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  return (
    <Pressable
      onPress={onAlternar}
      accessibilityRole="button"
      accessibilityState={{ expanded: aberto }}
      accessibilityLabel={tr(rotuloAcessivel)}
      hitSlop={10}
      testID={testID}
      style={({ pressed }) => [e.info, pressed && e.pressionado]}
    >
      <Text style={e.infoSimbolo}>{aberto ? "\u2212" : "\u24D8"}</Text>
    </Pressable>
  );
}

/** ⚠️ O texto que o ⓘ revela — ⛔ embaixo do que explica, ⛔ e recuado. */
export function InfoTexto({ children, testID }: { children: string; testID?: string }) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  return <Text style={e.infoTexto} testID={testID}>{tr(children)}</Text>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 6 · AÇÕES — principal e secundária
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ O RÓTULO NOMEIA O QUE ACONTECE, ⛔ e ⛔ não "continuar". ⚠️ Botão que
 * ⛔ não antecipa o efeito obriga o médico a descobrir apertando — ⛔ o que numa
 * emergência ⛔ ele ⛔ não pode pagar (autor, item 8 do briefing).
 */
export function PrimaryAction({
  rotulo,
  onPress,
  destrutiva,
  testID,
}: {
  rotulo: string;
  onPress: () => void;
  /** ⚠️ Vermelho ⛔ só quando a ação é de risco — ⛔ nunca por ênfase. */
  destrutiva?: boolean;
  testID?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tr(rotulo)}
      testID={testID}
      style={({ pressed }) => [
        destrutiva ? e.acaoCritica : e.acaoPrincipal,
        pressed && e.pressionado,
      ]}
    >
      <Text style={destrutiva ? e.acaoCriticaTexto : e.acaoPrincipalTexto}>{tr(rotulo)}</Text>
    </Pressable>
  );
}

/** ⚠️ Alternativa legítima — ⛔ contorno, ⛔ e ⛔ não preenchimento. */
export function SecondaryAction({
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
      testID={testID}
      style={({ pressed }) => [e.acaoSecundaria, pressed && e.pressionado]}
    >
      <Text style={e.acaoSecundariaTexto}>{tr(rotulo)}</Text>
    </Pressable>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 7 · SEÇÃO DE DECISÃO — a pergunta que domina a tela
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ A DECISÃO DOMINA A HIERARQUIA — ⛔ e ⛔ é isso que ela existe para fazer.
 *
 * ⚠️ Ela ⛔ **não** cria fluxo obrigatório: responder ⛔ não tranca ⛔ nada, ⛔ e
 * ⛔ nenhuma outra fase deixa de abrir (**E-11**). ⛔ Ela apenas põe **a pergunta
 * do momento** acima do resto, em vez de deixá-la competir com treze campos.
 */
export function DecisionSection({
  pergunta,
  contexto,
  children,
  testID,
}: {
  pergunta: string;
  contexto?: string;
  children: ReactNode;
  testID?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  /**
   * ⚠️⚠️ O CARD HERÓI — o *"Etapa atual"* das referências, desde 2026-09-06.
   *
   * ⛔ Antes ela era texto grande solto no meio do conteúdo: a pergunta que
   * governa a fase tinha o mesmo **fundo** que a lista de campos abaixo, ⛔ e
   * por isso ⛔ não dominava ⛔ nada. ⚠️ Agora ela tem tingimento, borda de
   * acento ⛔ e sobrancelha — ⛔ e é o **único** bloco da tela com esse
   * tratamento, porque dois heróis ⛔ não deixam ⛔ nenhum herói.
   *
   * ⚠️⚠️ ⛔ E ⛔ ela ⛔ CONTINUA ⛔ NÃO criando fluxo obrigatório (**E-11**):
   * ⛔ responder ⛔ não tranca ⛔ nada, ⛔ e qualquer fase segue abrindo a partir de
   * qualquer outra. ⛔ Por isso ⛔ também ⛔ não há contador *"3 de 4"* como na
   * referência — ⛔ ele prometeria uma sequência que este módulo ⛔ não tem.
   */
  return (
    <View style={e.decisao} testID={testID}>
      <View style={e.decisaoSobrancelha}>
        <View style={e.decisaoPonto} />
        <Text style={e.decisaoSobrancelhaTexto}>{tr("Decisão desta fase")}</Text>
      </View>
      <Text style={e.decisaoPergunta}>{tr(pergunta)}</Text>
      {contexto ? <Text style={e.decisaoContexto}>{tr(contexto)}</Text> : null}
      <View style={e.decisaoOpcoes}>{children}</View>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 8 · AVISO — quatro níveis, ⛔ e o vermelho é raro
 * ────────────────────────────────────────────────────────────────────────── */

export type NivelDeAviso = "info" | "atencao" | "risco" | "bloqueio";

/**
 * ⚠️⚠️ COR ⛔ NÃO É O ÚNICO SINAL (**E-15**): cada nível carrega **marcador em
 * texto** além da cor. ⛔ Quem ⛔ não distingue as cores precisa ler o mesmo que
 * os outros.
 *
 * ⚠️ `risco` ⛔ e `bloqueio` são **raros de propósito**. ⛔ Alerta vermelho em
 * tudo é *alert fatigue*: quando tudo grita, ⛔ nada é ouvido.
 */
export function WarningCard({
  nivel,
  titulo,
  texto,
  acao,
  testID,
}: {
  nivel: NivelDeAviso;
  titulo: string;
  texto?: string;
  acao?: ReactNode;
  testID?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(estilos);
  const porNivel = {
    info: { faixa: e.avisoInfo, marcador: "Informação", simbolo: "\u24D8", corDoTexto: e.avisoCorInfo },
    atencao: { faixa: e.avisoAtencao, marcador: "Atenção", simbolo: "\u26A0", corDoTexto: e.avisoCorAtencao },
    risco: { faixa: e.avisoRisco, marcador: "Risco", simbolo: "\u26A0", corDoTexto: e.avisoCorRisco },
    bloqueio: { faixa: e.avisoBloqueio, marcador: "Bloqueio clínico", simbolo: "\u2716", corDoTexto: e.avisoCorRisco },
  }[nivel];
  /**
   * ⚠️⚠️ ÍCONE + TINGIMENTO + AÇÃO — a forma das referências, desde 2026-09-06.
   *
   * ⛔ Antes era uma faixa lateral de 3 px sobre a superfície neutra: o aviso
   * tinha o mesmo fundo que o card comum ⛔ e só se distinguia por um fio na
   * lateral. ⚠️ Nas referências o alerta é um **bloco da cor dele**, com o
   * triângulo à esquerda ⛔ e a ação dentro — ⛔ e é a ação dentro que o
   * transforma de recado em ferramenta.
   *
   * ⚠️⚠️ ⛔ O MARCADOR EM TEXTO CONTINUA (**E-15**): quem ⛔ não distingue âmbar
   * de vermelho lê *"Atenção"* ⛔ ou *"Bloqueio clínico"* escrito.
   */
  return (
    <View style={[e.aviso, porNivel.faixa]} testID={testID}>
      <View style={e.avisoLinha}>
        <Text style={[e.avisoSimbolo, porNivel.corDoTexto]} accessibilityElementsHidden>
          {porNivel.simbolo}
        </Text>
        <View style={e.avisoCorpo}>
          <Text style={[e.avisoMarcador, porNivel.corDoTexto]}>{tr(porNivel.marcador)}</Text>
          <Text style={e.avisoTitulo}>{tr(titulo)}</Text>
          {texto ? <Text style={e.avisoTexto}>{tr(texto)}</Text> : null}
        </View>
      </View>
      {acao ?? null}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 8b · ESTADO DE SEGURANÇA — os cinco, ⛔ e ⛔ nunca só a cor
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ COMPONENTE NOVO, ⛔ e a justificativa é a regra do PD-37: **necessidade
 * clínica real ⛔ e reutilização certa**. ⛔ Todo módulo do app tem contraindicação,
 * ⛔ e hoje cada um inventa a sua forma de dizer isso.
 *
 * ── ⚠️⚠️ AS DUAS DISTINÇÕES QUE ELE EXISTE PARA PROTEGER ───────────────────
 *
 * ⛔ **"⛔ ainda ⛔ não sei" ⛔ NÃO É "sei ⛔ e há contraindicação".** ⚠️ O autor
 * marcou isso como crítico: ⛔ os dois ⛔ não podem parecer semelhantes. Falta de
 * dado é **trabalho pendente**; contraindicação é **achado**. ⛔ Confundi-los faz
 * o médico ou parar sem motivo, ou seguir sem checar.
 *
 * ⛔ **Desconhecido ⛔ NÃO é alerta.** ⚠️ Ele é neutro — reconhecível, ⛔ e ⛔ sem
 * cara de perigo. ⛔ Pintá-lo de âmbar transformaria toda tela recém-aberta num
 * campo minado.
 *
 * ⚠️⚠️ **COR ⛔ NUNCA SOZINHA (E-15):** cada estado carrega **rótulo em texto** ⛔ e
 * **símbolo**. Quem ⛔ não distingue as cores lê o mesmo que os outros.
 */
export type EstadoDeSegurancaVisual =
  | "desconhecido"
  | "verificado"
  | "atencao"
  | "relativa"
  | "bloqueio";

/**
 * ⚠️ A tradução do vocabulário do NÚCLEO para os cinco estados de tela.
 *
 * ⛔ Ela mora aqui, ⛔ e ⛔ não espalhada por superfície: o núcleo tem nove
 * estados, a tela tem cinco, ⛔ e a redução é **decisão de apresentação** — ⛔ que
 * precisa ser a mesma em todo lugar.
 */
export const ESTADO_VISUAL_DE_SEGURANCA: Readonly<Record<string, EstadoDeSegurancaVisual>> = {
  contraindicacao_nao_corrigivel: "bloqueio",
  bloqueio_corrigivel: "atencao",
  risco_aumentado: "atencao",
  situacao_individualizada: "relativa",
  informacao_insuficiente: "desconhecido",
  nao_perguntado: "desconhecido",
  nao_sei: "desconhecido",
  baixa_preocupacao_declarada: "verificado",
  nenhum_registrado: "verificado",
};

export function SafetyBadge({
  estado,
  testID,
}: {
  estado: EstadoDeSegurancaVisual;
  testID?: string;
}) {
  const tr = useTr();
  const tema = useTheme();
  const e = useEstilosDoTema(estilos);
  /**
   * ⚠️ Símbolo + rótulo + cor, nesta ordem de importância. ⛔ O símbolo ⛔ não é
   * emoji: renderiza igual em toda plataforma ⛔ e herda a cor do tema.
   */
  const porEstado: Record<EstadoDeSegurancaVisual, { simbolo: string; rotulo: string; cor: string }> = {
    /** ⛔ NEUTRO — ⛔ não é alerta. Falta de dado ⛔ não é achado. */
    desconhecido: { simbolo: "?", rotulo: "Desconhecido", cor: tema.cores.textSecondary },
    verificado: { simbolo: "✓", rotulo: "Verificado", cor: tema.cores.success },
    atencao: { simbolo: "!", rotulo: "Atenção", cor: tema.cores.warning },
    /** ⚠️ Exige julgamento — ⛔ e ⛔ não é "proibido". */
    relativa: { simbolo: "±", rotulo: "Contraindicação relativa", cor: tema.cores.warning },
    bloqueio: { simbolo: "✕", rotulo: "Contraindicação absoluta", cor: tema.cores.critical },
  };
  const v = porEstado[estado];
  return (
    <View style={[e.selo, { borderColor: v.cor }]} testID={testID}>
      <Text style={[e.seloSimbolo, { color: v.cor }]} accessibilityElementsHidden>
        {v.simbolo}
      </Text>
      <Text style={[e.seloRotulo, { color: v.cor }]}>{tr(v.rotulo)}</Text>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 9 · O ESQUELETO — o que toda superfície do AVC veste
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ RECONHECÍVEL EM TODA TELA — é este o ponto (autor, 2026-09-05):
 * *"o médico ⛔ não deve precisar reaprender a interface a cada fase"*.
 *
 * ⚠️ **Fixos**: cabeçalho ⛔ e contexto no topo, navegação no rodapé. ⛔ Eles
 * ⛔ não rolam, ⛔ e por isso o contexto do paciente ⛔ nunca some. **Rolável**:
 * ⛔ só o conteúdo clínico.
 */
export function ClinicalShell({
  header,
  contexto,
  navegacao,
  children,
}: {
  header: ReactNode;
  contexto?: ReactNode;
  navegacao: ReactNode;
  children: ReactNode;
}) {
  const e = useEstilosDoTema(estilos);
  return (
    <View style={e.shell}>
      {/**
        * ⚠️⚠️ O FUNDO ATRAVESSA A TELA; o **conteúdo** tem teto (2026-09-06).
        *
        * ⛔ Limitar o fundo deixaria faixas vazias nas laterais no desktop, ⛔ e
        * ⛔ pareceria que a tela quebrou. ⚠️ Quem tem teto é a **coluna de
        * leitura** — ⛔ e ela fica centrada.
        */}
      <View style={e.shellTopo}>
        <View style={e.coluna}>
          {header}
          {contexto ?? null}
        </View>
      </View>
      {children}
      {navegacao}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * ESTILOS — ⛔ nenhum hex, ⛔ nenhum tamanho de fonte avulso
 * ────────────────────────────────────────────────────────────────────────── */

function estilos(tema: Tema) {
  return {
    shell: { flex: 1, backgroundColor: tema.cores.bg } as const,
    /** ⚠️ A coluna de leitura — teto ⛔ e centrada. ⛔ Em 375 px ⛔ não faz efeito. */
    coluna: { width: "100%", maxWidth: LARGURA.leitura, alignSelf: "center" } as const,
    colunaNav: { width: "100%", maxWidth: LARGURA.leitura, alignSelf: "center" } as const,
    /** ⚠️ Divisor, ⛔ e ⛔ não card: o topo se separa por linha ⛔ e espaço. */
    shellTopo: {
      backgroundColor: tema.cores.bg,
      borderBottomWidth: 1,
      borderBottomColor: tema.cores.border,
      paddingHorizontal: ESPACO.md,
      paddingTop: ESPACO.sm,
      paddingBottom: ESPACO.sm,
      gap: ESPACO.xs,
    } as const,

    header: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.sm } as const,
    /**
     * ⚠️⚠️ 64 px, ⛔ e ⛔ não 82 — medido na captura de 2026-09-06.
     *
     * ⛔ Com 82 de cada lado, o centro ficava com ~215 px ⛔ e *"AVC isquêmico
     * agudo"* truncava para *"AVC isquêmico .."*. ⚠️ **Nome clínico ⛔ nunca
     * trunca**: quem cede espaço é a moldura, ⛔ e ⛔ não o nome.
     */
    headerLado: { width: 64, gap: ESPACO.xs } as const,
    headerCentro: { flex: 1, alignItems: "center", gap: 2 } as const,
    headerSair: { minHeight: TOQUE.minimo, justifyContent: "center" } as const,
    headerSairTexto: { ...PAPEL.textoPrincipal, color: tema.cores.primary } as const,
    headerMarcador: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs } as const,
    headerMarcadorPonto: {
      width: 8,
      height: 8,
      borderRadius: RAIO.badge,
      backgroundColor: tema.cores.critical,
    } as const,
    headerMarcadorTexto: { ...PAPEL.rotuloDeMetrica, color: tema.cores.critical } as const,
    headerTitulo: {
      ...PAPEL.tituloDaTela,
      color: tema.cores.text,
      textAlign: "center",
      /** ⚠️ ⛔ Ele encolhe até caber ⛔ antes de aceitar reticências. */
      flexShrink: 1,
    } as const,
    headerEscopo: {
      ...PAPEL.legenda,
      color: tema.cores.textSecondary,
      textAlign: "center",
    } as const,
    headerRelogio: { alignItems: "flex-end", minHeight: TOQUE.minimo, justifyContent: "center" } as const,
    headerRelogioValor: { ...PAPEL.tituloDeSecao, color: tema.cores.critical } as const,
    headerRelogioAusente: { color: tema.cores.textSecondary } as const,
    headerRelogioRotulo: {
      ...PAPEL.micro,
      color: tema.cores.textSecondary,
      textAlign: "right",
    } as const,

    contexto: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" } as const,
    contextoItem: { flexDirection: "row", alignItems: "center" } as const,
    contextoSep: { ...PAPEL.legenda, color: tema.cores.border, paddingHorizontal: ESPACO.xs } as const,
    contextoToque: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.xs } as const,
    contextoRotulo: { ...PAPEL.micro, color: tema.cores.textSecondary } as const,
    contextoValor: { ...PAPEL.legenda, color: tema.cores.text } as const,
    /** ⚠️ Ausência NEUTRA — ⛔ nunca âmbar: campo vazio ⛔ não é achado. */
    contextoAusente: { color: tema.cores.textSecondary } as const,

    /**
     * ⚠️⚠️ A BARRA É UMA **SUPERFÍCIE**, ⛔ e ⛔ não o fundo com um filete.
     *
     * ⚠️ Nas referências o rodapé é um bloco elevado, ⛔ visivelmente separado
     * do conteúdo — é o que faz a navegação parecer parte do aplicativo, ⛔ e
     * ⛔ não o fim da página. ⛔ Um filete de 1 px sobre o mesmo fundo ⛔ não
     * produz essa leitura.
     */
    navTrilho: {
      backgroundColor: tema.cores.surface,
      borderTopWidth: 1,
      borderTopColor: tema.cores.border,
      paddingTop: ESPACO.sm,
    } as const,
    nav: { flexGrow: 0 } as const,
    /** ⚠️ Faixa estreita na borda direita — presença, ⛔ e ⛔ não controle. */
    navBorda: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: ESPACO.md,
      borderRightWidth: 2,
      borderRightColor: tema.cores.border,
      opacity: 0.6,
    } as const,
    navConteudo: { paddingHorizontal: ESPACO.sm, gap: ESPACO.xs, alignItems: "flex-start" } as const,
    /**
     * ⚠️ Largura MÍNIMA, ⛔ e ⛔ não `flex: 1`: com `flex` as seis abas se
     * espremiam para caber ⛔ e o nome truncava. Com largura mínima, quem ⛔ não
     * couber sai para a rolagem ⛔ e mantém o nome inteiro.
     */
    navItem: {
      minWidth: 76,
      paddingHorizontal: ESPACO.xs,
      paddingBottom: ESPACO.xs,
      alignItems: "center",
      gap: ESPACO.xs,
      minHeight: TOQUE.minimo,
    } as const,
    navNome: { ...PAPEL.micro, color: tema.cores.textSecondary } as const,
    navNomeAtivo: { color: tema.cores.primary } as const,
    /**
     * ⚠️⚠️ O SUBLINHADO DA ABA ATIVA — ⛔ e ⛔ ele ⛔ não substitui a cor: soma.
     *
     * ⛔ Só a cor reprovaria **E-15** (quem ⛔ não distingue azul de cinza ficaria
     * sem saber onde está). ⚠️ Com o traço, a posição é legível **por forma**.
     */
    navSublinhado: {
      height: 3,
      width: 22,
      borderRadius: RAIO.badge,
      backgroundColor: tema.cores.primary,
    } as const,
    navSublinhadoVazio: { height: 3, width: 22 } as const,
    navPonto: {
      position: "absolute",
      top: -2,
      right: -4,
      width: 6,
      height: 6,
      borderRadius: RAIO.badge,
      backgroundColor: tema.cores.warning,
    } as const,

    fase: { gap: ESPACO.xs } as const,
    faseNome: { ...PAPEL.tituloDeSecao, color: tema.cores.text } as const,
    faseObjetivo: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary } as const,

    card: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.card,
      padding: ESPACO.md,
      gap: ESPACO.sm,
    } as const,
    /** ⚠️ Segundo degrau — ⛔ e ⛔ SEM borda: é o fundo que separa, ⛔ não a linha. */
    cardAninhado: {
      backgroundColor: tema.cores.surfaceElevated,
      borderRadius: RAIO.botao,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    } as const,

    secao: { ...PAPEL.tituloDeSecao, color: tema.cores.text } as const,

    /** ⚠️ Recuado ⛔ e discreto: pertence ao campo acima, ⛔ e ⛔ não compete com ele. */
    vazio: { paddingLeft: ESPACO.sm, gap: ESPACO.xs } as const,
    vazioTexto: { ...PAPEL.legenda, color: tema.cores.textSecondary } as const,

    info: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.badge,
    } as const,
    infoSimbolo: { ...PAPEL.legenda, color: tema.cores.textSecondary } as const,
    infoTexto: {
      ...PAPEL.textoSecundario,
      color: tema.cores.textSecondary,
      paddingLeft: ESPACO.sm,
    } as const,

    /**
     * ⚠️⚠️ PREENCHIMENTO SATURADO COM TEXTO BRANCO — a ação das referências.
     *
     * ⛔ Com `primary` (que no escuro é **claro**), o botão saía pálido ⛔ e
     * exigia texto escuro: parecia um campo desabilitado, ⛔ e ⛔ não a ação
     * principal da tela.
     */
    acaoPrincipal: {
      minHeight: TOQUE.critico,
      backgroundColor: tema.cores.primaryFill,
      borderRadius: RAIO.botao,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
    } as const,
    acaoPrincipalTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill } as const,
    acaoCritica: {
      minHeight: TOQUE.critico,
      backgroundColor: tema.cores.criticalFill,
      borderRadius: RAIO.botao,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
    } as const,
    acaoCriticaTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill } as const,
    acaoSecundaria: {
      minHeight: TOQUE.critico,
      borderWidth: 1,
      borderColor: tema.cores.primary,
      borderRadius: RAIO.botao,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
    } as const,
    acaoSecundariaTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.primary } as const,

    decisao: {
      gap: ESPACO.sm,
      backgroundColor: tema.cores.criticalTint,
      borderWidth: 1,
      borderColor: tema.cores.critical,
      borderRadius: RAIO.card,
      padding: ESPACO.md,
    } as const,
    decisaoSobrancelha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs } as const,
    decisaoPonto: {
      width: 8,
      height: 8,
      borderRadius: RAIO.badge,
      backgroundColor: tema.cores.critical,
    } as const,
    decisaoSobrancelhaTexto: { ...PAPEL.rotuloDeMetrica, color: tema.cores.critical } as const,
    decisaoPergunta: { ...PAPEL.tituloDaDecisao, color: tema.cores.text } as const,
    decisaoContexto: { ...PAPEL.textoPrincipal, color: tema.cores.textSecondary } as const,
    decisaoOpcoes: { gap: ESPACO.sm, paddingTop: ESPACO.xs } as const,

    /**
     * ⚠️ Bloco da própria cor — ⛔ e ⛔ ele ⛔ continua ⛔ não gritando: quem grita é
     * o vermelho, ⛔ e o vermelho é **raro**. `info` ⛔ e `atencao` são o caso
     * comum.
     */
    aviso: {
      borderRadius: RAIO.card,
      borderWidth: 1,
      padding: ESPACO.md,
      gap: ESPACO.sm,
    } as const,
    avisoLinha: { flexDirection: "row", gap: ESPACO.sm, alignItems: "flex-start" } as const,
    avisoCorpo: { flex: 1, gap: 2 } as const,
    avisoSimbolo: { ...PAPEL.tituloDaDecisao } as const,
    avisoInfo: {
      borderColor: tema.cores.info,
      backgroundColor: tema.cores.primaryTint,
    } as const,
    avisoAtencao: {
      borderColor: tema.cores.warning,
      backgroundColor: tema.cores.warningTint,
    } as const,
    avisoRisco: {
      borderColor: tema.cores.critical,
      backgroundColor: tema.cores.criticalTint,
    } as const,
    avisoBloqueio: {
      borderColor: tema.cores.critical,
      backgroundColor: tema.cores.criticalTint,
    } as const,
    avisoCorInfo: { color: tema.cores.info } as const,
    avisoCorAtencao: { color: tema.cores.warning } as const,
    avisoCorRisco: { color: tema.cores.critical } as const,
    avisoMarcador: { ...PAPEL.rotuloDeMetrica } as const,
    avisoTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text } as const,
    avisoTexto: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary } as const,

    selo: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      borderWidth: 1,
      borderRadius: RAIO.badge,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: 2,
      alignSelf: "flex-start",
    } as const,
    seloSimbolo: { ...PAPEL.micro } as const,
    seloRotulo: { ...PAPEL.micro } as const,

    pressionado: { opacity: 0.85 } as const,
  };
}
