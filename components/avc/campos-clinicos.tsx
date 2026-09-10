/**
 * OS CONTROLES CLÍNICOS DO AVC — usados por TODAS as superfícies.
 *
 * ⛔ NENHUMA medicina nasce aqui. Campo vem de `avc/conteudo/`, leitura vem de
 * `avc/nucleo/`, e esta camada só desenha (E-29).
 *
 * ── POR QUE ISTO SAIU DE `superficie-a.tsx` (2026-08-28) ───────────────────
 *
 * A Superfície A aprendeu sete coisas em revisão de tela — barra em vez de só
 * −/+, ARIA de rádio em vez de `accessibilityState` que o react-native-web ⛔ não
 * lê, rascunho para não sujar a trilha, "não informado" que ⛔ não pode parecer
 * número. Copiadas para a Superfície B, essas sete lições passariam a existir em
 * duas versões, e a próxima correção acertaria uma delas.
 *
 * ⚠️ Isto ⛔ NÃO é componente do app (§9.1): mora em `components/avc/` e ⛔ não
 * sai daqui enquanto um segundo módulo clínico não exigir o mesmo.
 */
import type React from "react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Campo } from "../../avc/conteudo/campo";
import { CAMPO_DE_OUTROS, opcaoDoValor, valorDaOpcao } from "../../avc/conteudo/campo";
import { AvisoDeApoioClinico } from "../../design-system/aviso-de-apoio-clinico";
import { alternarItem, estaSelecionado, itensSelecionados } from "../../avc/nucleo/selecao";
import {
  arredondaAoPasso,
  arredondaCasas,
  horaDeExibicao,
  numeroCurto,
} from "../../avc/nucleo/formato";
import { opcoesQueContam } from "../../avc/conteudo/nihss";
import { definicaoDoAchado } from "../../avc/conteudo/explicacoes";
import type { Leitura } from "../../avc/nucleo/leitura";
import SeletorDeHora from "./seletor-de-hora";
import { assuntoDoBloco, Icone, LinhaDeRelogio, Numero, type NomeDeIcone } from "./ui";
import { getPalette, tingir } from "../../design-system/paleta-de-area";
import { useEstilosDoTema, useTheme, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESTADOS, type EstadoClinico } from "../../design-system/estados-clinicos";
import { useTr } from "../../lib/use-tr";

/**
 * ⚠️ O SÍMBOLO SEGUE O `tom`, ⛔ NÃO A CONCLUSÃO — e o símbolo acompanha sempre
 * a cor, porque significado ⛔ nunca pode depender só dela (E-39).
 */
const SIMBOLO: Record<Leitura["tom"], string> = {
  atencao: "⚠",
  pendente: "?",
  informativo: "·",
};

/**
 * ⚠️ A cor da área vem da paleta do design system — a mesma que pinta o card do
 * hub e o resumo do módulo. ⛔ Nenhum hexadecimal nasce aqui: se a cor não existe
 * na paleta, ela é decisão de tema e entra em `design-system/`, onde a trava de
 * contraste a enxerga.
 */
const AREA_AVC = getPalette("AVC");

/** ⚠️ Atenção primeiro, pendência depois, informação por último (§7.3). */
const PESO_DO_TOM: Record<Leitura["tom"], number> = {
  atencao: 0,
  pendente: 1,
  informativo: 2,
};

/** Quais ⓘ estão abertos. ⚠️ Fechado por padrão: rastreabilidade ⛔ não disputa espaço. */
export function useDetalhes() {
  const [abertos, setAbertos] = useState<readonly string[]>([]);
  return {
    aberto: (id: string) => abertos.includes(id),
    alternar: (id: string) =>
      setAbertos((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id])),
  };
}

/**
 * O CABEÇALHO DE UM BLOCO CLÍNICO.
 *
 * ── O DEFEITO QUE ISTO CORRIGE (relato do autor, 2026-08-28) ───────────────
 *
 * *"Chegada ao pronto-socorro, última vez…, início do déficit…, via aérea e
 * oxigenação…, sat de O₂, P sist… tudo igual dentro da página, sem nenhum
 * destaque."*
 *
 * ⚠️⚠️ Estava literalmente igual: o título do bloco era uma legenda cinza de
 * 11 px, do mesmo peso do resto, e a página inteira tinha UM nível de leitura.
 * Numa tela que se lê por varredura — os olhos pulando de bloco em bloco — sem
 * degrau de hierarquia ⛔ não há varredura: há leitura linha a linha, que é o
 * que ninguém faz com o paciente na frente.
 *
 * ⚠️ A faixa usa a cor da ÁREA (a mesma do card no hub e do resumo), e o par
 * `badgeBg`/`badgeText` já é medido pela trava de contraste renderizado.
 */
export function CabecalhoDeBloco({
  titulo,
  testID,
  aberto,
  assunto,
}: {
  titulo: string;
  testID?: string;
  /**
   * ⚠️⚠️ ⛔ O **id do bloco**, ⛔ e ⛔ ele é quem traz cor ⛔ e ícone
   * (`ASSUNTO_DO_BLOCO`). ⛔ Sem ele o cabeçalho desenha ⛔ exatamente como
   * sempre desenhou — ⛔ a tabela cresce por decisão, ⛔ e ⛔ não por varredura.
   */
  assunto?: string;
  /**
   * ⚠️⚠️ SÓ PARA CABEÇALHO QUE ABRE E FECHA — e aí ele é **obrigatório**.
   *
   * ⚠️ Na revisão visual de 2026-08-30 a Coleta 1 recolhia e o cabeçalho ficava
   * **idêntico** ao de uma coleta aberta. Os valores dela sumiam da tela sem
   * ⛔ nenhum sinal de que dava para trazê-los de volta — e um resultado que o
   * médico ⛔ não consegue reencontrar é, na prática, um resultado perdido.
   *
   * ⚠️ `aria-expanded` sozinho ⛔ não resolve: ele fala com a tecnologia
   * assistiva, e ⛔ não com quem está olhando a tela.
   */
  aberto?: boolean;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  /**
   * ⚠️⚠️ CABEÇALHO QUE ABRE TEM **FORMA DE CONTROLE** — 2026-09-06.
   *
   * ⛔ Antes ele era texto em branco, igual a um título comum: ⛔ nada dizia que
   * dava para tocar. ⚠️ Agora ele ganha fundo, contorno ⛔ e o sinal à direita —
   * ⛔ e o título fixo continua sendo **só texto**, porque ⛔ ele ⛔ não faz nada.
   *
   * ⚠️ ⛔ A diferença de forma é a informação: **o que tem moldura, abre**.
   */
  const abrivel = aberto !== undefined;
  /**
   * ⚠️⚠️⚠️ ⛔ O SELO DO ASSUNTO — ⛔ ícone na cor do bloco, ⛔ e ⛔ o fundo é a
   * **mesma cor** a 14% sobre o card. ⛔ Duas cores para o mesmo assunto seriam
   * duas coisas a manter em sincronia (a doutrina de `paleta-de-area`).
   *
   * ⚠️ ⛔ E ⛔ ele ⛔ não substitui o título: ⛔ o nome do bloco fica ⛔ ao lado,
   * ⛔ e ⛔ é ⛔ ele quem diz o que é (**E-15**).
   */
  const tema = useTheme();
  const a = assuntoDoBloco(assunto);
  const cor = a === undefined ? undefined : tema.cores[a.cor];
  return (
    <View style={[e.blocoCabecalho, abrivel && e.blocoCabecalhoAbrivel]} testID={testID}>
      {a === undefined || cor === undefined ? (
        <View style={e.blocoBarra} />
      ) : (
        <View
          style={[e.blocoSelo, { backgroundColor: tingir(cor, tema.cores.surface, 0.14) }]}
          testID={`${testID ?? "bloco"}-selo`}
        >
          <Icone nome={a.icone} tamanho={15} cor={cor} />
        </View>
      )}
      <Text style={e.blocoTitulo}>{tr(titulo)}</Text>
      {aberto === undefined ? null : (
        <Text style={e.blocoEstado} testID={`${testID ?? "bloco"}-estado`}>
          {/**
            * ⚠️⚠️ O **ESTADO**, ⛔ e ⛔ não a ação — restaurado em 2026-09-06.
            *
            * ⛔ Eu havia trocado por *"abrir ▸"* / *"recolher ▾"*, ⛔ e
            * `avc-superficie-laboratorio` reprovou. ⚠️ A prova estava certa: a
            * garantia dela ⛔ não é dizer o que o toque faz — é dizer **que há
            * conteúdo escondido ali**.
            *
            * ⛔ *"Um resultado que o médico ⛔ não consegue reencontrar é, na
            * prática, um resultado perdido"* — o comentário deste componente já
            * dizia isso desde 2026-08-30.
            *
            * ⚠️ A affordance que faltava veio da **moldura**, ⛔ e ⛔ não da
            * palavra: ⛔ as duas coisas cabem juntas.
            */}
          {aberto ? `▾ ${tr("aberta")}` : `▸ ${tr("recolhida")}`}
        </Text>
      )}
    </View>
  );
}

/** ⚠️ O botão ⓘ. Pequeno, mas ⛔ nunca menor que o alvo mínimo de toque. */
export function BotaoDeInfo({ id, onPress }: { id: string; onPress: () => void }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Pressable
      style={e.info}
      /**
       * ⚠️⚠️ `hitSlop` EM VEZ DE ALTURA — e ⛔ isto ⛔ não afrouxa §7.18.
       *
       * ── O DEFEITO MEDIDO (2026-08-29) ─────────────────────────────────
       *
       * Com `minHeight: 44` no botão, um rótulo de UMA linha ficava mais baixo
       * que o ⓘ ao lado — e a linha inteira crescia para caber o botão,
       * abrindo um vão visível entre o nome do achado e a definição logo
       * abaixo. Parecia linha em branco.
       *
       * ⚠️ O ALVO DE TOQUE CONTINUA 44 px: `hitSlop` amplia a área sensível
       * para além do desenho, que é exatamente o mecanismo do RN para isto. O
       * que encolheu foi o RETÂNGULO PINTADO, ⛔ não a região que recebe o dedo.
       */
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={tr("Fonte e rastreabilidade")}
      testID={`avc-info-${id}`}
      onPress={onPress}
    >
      <Text style={e.infoTexto}>ⓘ</Text>
    </Pressable>
  );
}

/** A nota de fidelidade e o slot de fonte — atrás do ⓘ, ⛔ nunca na conduta. */
export function DetalheDoCampo({
  campo,
  children,
}: {
  campo: Campo;
  /** ⚠️ Rastreabilidade extra do campo — categorias da escala, como testar. */
  children?: React.ReactNode;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={e.detalhe} testID={`avc-detalhe-${campo.id}`}>
      {children}
      {campo.nota ? <Text style={e.detalheTexto}>{tr(campo.nota)}</Text> : null}
      <Text style={e.detalheTexto}>
        {tr("Fonte")}: {campo.fonte}
      </Text>
    </View>
  );
}

/**
 * ⚠️⚠️ A MARCA DE RESPOSTA — o que o autor chamou de *"não chamam atenção para
 * marcação"*.
 *
 * Um campo respondido e um campo intocado tinham exatamente a mesma moldura: a
 * única diferença era o fundo de uma opção lá dentro. Numa página de 14 campos,
 * saber **o que já foi respondido** é a informação que se busca de relance, e
 * ela ⛔ não existia.
 *
 * ⚠️ SÍMBOLO ANTES DE COR (E-39): o glifo diz sozinho, e a barra de accent é
 * reforço. ⛔ Isto ⛔ não é barra de progresso e ⛔ não cobra nada — ⛔ nenhum campo
 * do módulo é obrigatório (E-49). Diz o que EXISTE, ⛔ não o que falta.
 */
function MarcaDeResposta({ respondido }: { respondido: boolean }) {
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Text style={[e.marca, respondido && e.marcaAtiva]} accessibilityElementsHidden>
      {ESTADOS[respondido ? "favoravel" : "ausente"].simbolo}
    </Text>
  );
}

type PropsDeCampo = {
  campo: Campo;
  /** O valor cru gravado na trilha, ou vazio. ⛔ A tela ⛔ nunca inventa um. */
  bruto: string;
  detalheAberto: boolean;
  onAlternarDetalhe: () => void;
  onEscolher: (campo: string, valor: string) => void;
  /**
   * ── ⚠️⚠️⚠️ ⛔ O QUE FOI **ESCRITO** EM *"OUTROS"* — 2026-09-09 ───────────
   *
   * ⚠️ Pedido do autor: *"onde tem outros tem que ter opção de adicionar
   * quais outras o usuário quiser adicionar **escrevendo**"*.
   *
   * ⛔ ⛔ Ele vem de fora ⛔ porque é **fato na trilha**, ⛔ e ⛔ não rascunho de
   * tela: mora em `CAMPO_DE_OUTROS(campo.id)`, ⛔ e ⛔ volta ⛔ quando o médico
   * reabre.
   */
  textoDeOutros?: string;
  /**
   * ⚠️⚠️ O VALOR QUE A ESCALA DERIVA — decisão do autor, 2026-08-29, opção (a).
   *
   * Quando o NIHSS foi preenchido, os achados que a Table 4 define como cortes
   * de item já estão respondidos: a tela os mostra marcados e etiquetados
   * **"Vindo do NIHSS"**, em vez de reperguntar o que a escala respondeu.
   *
   * ⚠️ Tocar em qualquer opção passa a valer como registro DO MÉDICO — o NIHSS
   * ⛔ não é alterado, e a divergência entre os dois fica identificável.
   */
  derivado?: string;
  /**
   * ⚠️ Opções EMPILHADAS, uma por linha — para quando o rótulo é um descritor e
   * ⛔ não um chip. "3 · incapacidade moderada" em chip vira coluna estreita e
   * texto quebrado; empilhado, lê-se a escala inteira de cima a baixo, que é
   * como se lê uma escala.
   */
  empilhado?: boolean;
  /**
   * ⚠️⚠️ DESFAZER É OPERAÇÃO DE PRIMEIRA CLASSE (§7.16) — relato do autor,
   * 2026-08-28: *"cliquei em sem informação e não consigo desmarcar isso"*.
   *
   * Sem isto, um toque errado ficava para sempre: ⛔ não havia como um campo
   * voltar a "ninguém respondeu". ⚠️ E ⛔ não apaga nada — acrescenta uma
   * correção à trilha (§3.1).
   */
  onDesfazer: (campo: string) => void;
};

export function CampoDeEscolha({
  campo,
  bruto,
  derivado,
  empilhado = false,
  detalheAberto,
  onAlternarDetalhe,
  onEscolher,
  onDesfazer,
}: PropsDeCampo) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const manual = opcaoDoValor(campo, bruto);
  /**
   * ⚠️ O REGISTRO DO MÉDICO MANDA, e a escala preenche o silêncio. ⛔ Nunca o
   * contrário: um valor derivado que sobrescrevesse o dedo do médico seria o
   * app decidindo por ele.
   */
  const daEscala = manual === undefined && derivado !== undefined
    ? opcaoDoValor(campo, derivado) ?? derivado
    : undefined;
  const escolhido = manual ?? daEscala;
  const divergente = manual !== undefined && derivado !== undefined
    && valorDaOpcao(manual) !== derivado;

  /**
   * ⚠️⚠️ ESCALA COM DESCRITOR NASCE RECOLHIDA — relato do autor, 2026-08-29:
   * *"isso aqui tem que recolher e abrir quando clica para preencher"*.
   *
   * Seis linhas de descritor abertas por padrão empurram para baixo tudo o que
   * vem depois, e a tela deixa de ser varrida. ⛔ Recolher aqui ⛔ não esconde
   * conduta (§7.3): o valor escolhido continua VISÍVEL na linha fechada — o que
   * fica atrás do toque é a lista de opções, ⛔ não a resposta.
   */
  const [aberto, setAberto] = useState(false);
  /**
   * ⚠️ O `grau` continua recolhível por natureza — descritor de escala ⛔ não se lê
   * em chip. O resto é DECLARADO no conteúdo (`recolhivel`), e ⛔ não deduzido:
   * deduzir por número de opções faria a tela mudar de comportamento no dia em
   * que alguém acrescentasse uma opção.
   */
  const recolhivel = campo.tipo === "grau" || campo.recolhivel === true;
  const mostrarOpcoes = !recolhivel || aberto;

  /**
   * ⚠️ O QUE A ESCALA CHAMA ASSIM — pedido do autor para quem ⛔ não lembra o
   * termo. São as opções do próprio NIHSS que satisfazem o corte da Table 4, e
   * ⛔ não uma definição escrita de memória (E-31).
   */
  const doNihss = opcoesQueContam(campo.id);
  /**
   * ⚠️ A DEFINIÇÃO FICA VISÍVEL, as CATEGORIAS vão para o ⓘ — decisão visual do
   * autor, 2026-08-29: *"o nome do achado fica visível e a definição curta logo
   * abaixo em uma linha; detalhes de teste e categorias ficam no ⓘ. Senão
   * recuperamos justamente as telas de rolagem que acabamos de eliminar."*
   */
  const definicao = definicaoDoAchado(campo.id);
  return (
    <View style={[e.campo, escolhido !== undefined && e.campoRespondido]} testID={`avc-campo-${campo.id}`}>
      <View style={e.campoTopo}>
        <MarcaDeResposta respondido={escolhido !== undefined} />
        <Text style={e.campoRotulo}>{tr(campo.rotulo)}</Text>
        <BotaoDeInfo id={campo.id} onPress={onAlternarDetalhe} />
      </View>

      {/* ⚠️ `ajuda` é permanente porque muda a RESPOSTA; `nota` é fidelidade e
          fica atrás do ⓘ. Trocar os dois de lugar enche a tela de texto que o
          médico já sabe e esconde o que ele precisa ler antes de responder. */}
      {campo.ajuda ? <Text style={e.campoAjuda}>{tr(campo.ajuda)}</Text> : null}

      {/**
        * ⚠️ A ETIQUETA DIZ DE ONDE VEIO A RESPOSTA. Sem ela, um achado marcado
        * pela escala seria indistinguível de um marcado pelo médico — e a
        * primeira coisa que ele faria é desconfiar da tela.
        */}
      {/**
        * ⚠️⚠️ TRÊS PROCEDÊNCIAS, TRÊS ETIQUETAS — e a terceira faltava, achada na
        * checagem visual final de 2026-08-29.
        *
        * Havia etiqueta para "veio da escala" e para "o médico divergiu". Faltava
        * o caso do meio: **o médico registrou o mesmo valor que a escala deriva**.
        * Sem etiqueta, ele ficava idêntico a uma resposta manual qualquer — e a
        * pergunta que o autor quer responder de relance é *de onde veio isto*,
        * ⛔ não *coincide com a escala?*.
        *
        * ⚠️ ⛔ Nenhuma delas depende de cor: são palavras (E-39).
        */}
      {daEscala !== undefined ? (
        <Text style={e.origem} testID={`avc-origem-${campo.id}`}>{tr("Vindo do NIHSS")}</Text>
      ) : divergente ? (
        <Text style={e.origem} testID={`avc-divergencia-${campo.id}`}>
          {tr("Registro do médico, diferente do que a escala deriva")}
        </Text>
      ) : manual !== undefined && derivado !== undefined ? (
        <Text style={e.origem} testID={`avc-origem-manual-${campo.id}`}>
          {tr("Registro do médico")}
        </Text>
      ) : null}

      {definicao ? (
        <Text style={e.campoDefinicao} testID={`avc-definicao-${campo.id}`}>
          {tr(definicao)}
        </Text>
      ) : null}

      {detalheAberto ? (
        <DetalheDoCampo campo={campo}>
          {doNihss.length > 0 ? (
            <Text style={e.detalheTexto} testID={`avc-glossario-${campo.id}`}>
              {tr("Na escala do NIHSS conta como isto")}: {doNihss.map((o) => tr(o)).join(" · ")}
            </Text>
          ) : null}
        </DetalheDoCampo>
      ) : null}

      {recolhivel ? (
        <Pressable
          style={e.abrirEscolha}
          accessibilityRole="button"
          aria-expanded={aberto}
          testID={`avc-abrir-${campo.id}`}
          onPress={() => setAberto((v) => !v)}
        >
          <Text style={e.abrirEscolhaTexto}>
            {aberto
              ? tr("Fechar")
              : escolhido !== undefined
                ? `${tr(escolhido)} ✎`
                : tr("Preencher")}
          </Text>
        </Pressable>
      ) : null}

      {/**
       * ⚠️⚠️ `radiogroup` + `radio` + `aria-checked`, ⛔ NÃO `button`.
       *
       * O `Pressable` do react-native-web ⛔ **não lê `accessibilityState`** — a
       * versão anterior saía no DOM sem atributo ARIA nenhum, e a opção
       * escolhida se distinguia da não escolhida **apenas pela cor de fundo**.
       * E-37 exige que os três vazios sejam distinguíveis; para quem usa leitor
       * de tela — ou vê a tela sob sol forte — "fundo mais claro" ⛔ não é
       * distinção nenhuma.
       */}
      {mostrarOpcoes ? (
      <View
        style={[e.opcoes, empilhado && e.opcoesEmpilhadas, binaria(campo.opcoes) && e.opcoesDecisao]}
        accessibilityRole="radiogroup"
      >
        {(campo.opcoes ?? []).map((op) => {
          const valor = valorDaOpcao(op);
          const ativa = escolhido === op;
          /**
           * ⚠️⚠️ O PAR VERDE/VERMELHO DAS REFERÊNCIAS — 2026-09-06.
           *
           * ⚠️ O tom vem do **slug** (`sim` · `nao`), ⛔ e ⛔ nunca da posição:
           * uma pergunta cuja ordem fosse outra pintaria de vermelho a resposta
           * errada. ⛔ E verde ⛔ não significa "bom": *"Há hemorragia? **Sim**"*
           * é a pior notícia da tela ⛔ e continua verde, porque a cor identifica
           * a **resposta**, ⛔ e ⛔ não o desfecho.
           *
           * ⚠️ Por isso ela ⛔ nunca vem sozinha (**E-15**): o ✓ ⛔ e a palavra
           * dizem o mesmo que a cor.
           */
          const grande = binaria(campo.opcoes);
          const tom = !grande
            ? null
            : valor === "sim" ? e.opcaoSim : valor === "nao" ? e.opcaoNao : e.opcaoNeutra;
          const preenchida = grande && (valor === "sim" || valor === "nao");
          return (
            <Pressable
              key={op}
              style={[
                e.opcao,
                empilhado && e.opcaoLarga,
                grande && e.opcaoDecisao,
                tom,
                /**
                 * ⚠️ *"⛔ Não sei"* fica **tracejado ⛔ e apagado** enquanto ⛔ não
                 * é escolhido: ⛔ ele ⛔ não disputa com os achados clínicos ao
                 * lado. ⚠️ Escolhido, ⛔ ele se marca como qualquer outro — ⛔ é
                 * uma resposta legítima, ⛔ e ⛔ não um estado de erro.
                 */
                !grande && valor === "nao_sei" && !ativa && e.opcaoNaoSei,
                ativa && (grande ? e.opcaoMarcada : e.opcaoAtiva),
              ]}
              accessibilityRole="radio"
              aria-checked={ativa}
              testID={`avc-opcao-${campo.id}-${valor}`}
              /**
               * ⚠️ TOCAR NA ESCOLHIDA DESFAZ. É o gesto que todo mundo já tenta
               * — e que ⛔ não fazia nada. ⛔ Não há "limpar" separado aqui: um
               * segundo botão por campo encheria a tela de controle para o caso
               * raro, quando o alvo óbvio já estava debaixo do dedo.
               */
              onPress={() => (ativa ? onDesfazer(campo.id) : onEscolher(campo.id, valor))}
            >
              {/**
               * ⚠️⚠️ A MARCA `✓` ⛔ NÃO É ENFEITE — ela é o que sobra quando a cor
               * falha (E-39). E foi relatado pelo autor usando o app em
               * 2026-08-28: *"botões ruins de selecionar, não intuitivos, tem
               * que ficar procurando onde tem que clicar"*. Uma opção que só se
               * distingue por "fundo um pouco mais claro" ⛔ não se distingue.
               */}
              <Text
                style={[
                  e.opcaoTexto,
                  !grande && valor === "nao_sei" && !ativa && e.opcaoTextoNaoSei,
                  preenchida && e.opcaoTextoPreenchido,
                  ativa && !grande && e.opcaoTextoAtivo,
                ]}
              >
                {ativa ? "✓ " : ""}
                {tr(op)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      ) : null}
    </View>
  );
}

/**
 * ── ⚠️⚠️⚠️ A CAIXA DE *"OUTROS"* ⛔ — 2026-09-09 ─────────────────────────────
 *
 * ⚠️ Pedido do autor: *"onde tem outros tem que ter opção de adicionar quais
 * outras o usuário quiser adicionar **escrevendo**"*.
 *
 * ── ⚠️⚠️ ⛔ O QUE ⛔ ELA **⛔ NÃO** FAZ ─────────────────────────────────────
 *
 * ⛔ ⛔ **⛔ Não vira conduta.** ⚠️ ⛔ Ela ⛔ só existe ⛔ em campo cujos
 * `CONSUMIDORES` são **vazios** — ⛔ há trava medindo ⛔ isso. ⛔ O que se
 * escreve ⛔ aqui é **contexto do paciente**, ⛔ e ⛔ nenhuma recomendação
 * ⛔ deste módulo nasce dele.
 *
 * ⛔ ⛔ **⛔ Não grava a cada tecla.** ⚠️ A trilha é append-only: ⛔ um fato por
 * letra encheria o histórico com o **caminho** até a frase, ⛔ e ⛔ nenhuma
 * dessas letras é a informação. ⛔ Grava ⛔ ao sair do campo.
 *
 * ⛔ ⛔ **⛔ Não apaga sozinha.** ⚠️ Esvaziar o texto ⛔ é `onDesfazer` — ⛔ o
 * campo volta a *"ninguém escreveu"*, ⛔ que ⛔ não é o mesmo que *"escreveu
 * nada"* (**E-37**).
 */
function CaixaDeOutros({
  campo,
  texto,
  onGravar,
  onApagar,
}: {
  campo: string;
  texto: string | undefined;
  onGravar: (texto: string) => void;
  onApagar: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  /** ⚠️ ⛔ Rascunho ⛔ enquanto se digita — ⛔ o fato ⛔ só nasce ⛔ no `blur`. */
  const [rascunho, setRascunho] = useState<string | undefined>(undefined);
  const mostrado = rascunho ?? texto ?? "";
  return (
    <TextInput
      style={e.outrosCaixa}
      value={mostrado}
      onChangeText={setRascunho}
      onBlur={() => {
        const limpo = mostrado.trim();
        setRascunho(undefined);
        if (limpo === (texto ?? "")) return;
        if (limpo === "") onApagar();
        else onGravar(limpo);
      }}
      multiline
      placeholder={tr("Escreva quais")}
      placeholderTextColor={e.corPlaceholderOutros.color}
      accessibilityLabel={tr("Escreva quais")}
      testID={`avc-outros-${campo}`}
    />
  );
}

/**
 * SELEÇÃO MÚLTIPLA — achados que COEXISTEM no mesmo paciente (§7.6).
 *
 * ⚠️ A caixa (☑/☐) ⛔ não é enfeite: ela diz, ANTES do toque, que aqui se marca
 * mais de um — o rádio dizia o contrário. E o símbolo carrega o estado sozinho,
 * sem depender de cor (E-39).
 */
export function CampoDeMultipla({
  campo,
  bruto,
  detalheAberto,
  onAlternarDetalhe,
  onEscolher,
  onDesfazer,
  textoDeOutros,
}: PropsDeCampo) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const marcados = itensSelecionados(bruto);
  /**
   * ⚠️ ⛔ A caixa aparece ⛔ **⛔ só** quando *"Outros"* está marcado — ⛔ e ⛔ o
   * campo declara **qual** opção é essa, ⛔ em vez de a tela adivinhar por
   * prefixo.
   */
  const pedeTexto =
    campo.opcaoDeOutros !== undefined && marcados.includes(campo.opcaoDeOutros);
  return (
    <View style={[e.campo, marcados.length > 0 && e.campoRespondido]} testID={`avc-campo-${campo.id}`}>
      <View style={e.campoTopo}>
        <MarcaDeResposta respondido={marcados.length > 0} />
        <Text style={e.campoRotulo}>{tr(campo.rotulo)}</Text>
        <BotaoDeInfo id={campo.id} onPress={onAlternarDetalhe} />
      </View>

      {campo.ajuda ? <Text style={e.campoAjuda}>{tr(campo.ajuda)}</Text> : null}
      {detalheAberto ? <DetalheDoCampo campo={campo} /> : null}

      <View style={e.opcoes}>
        {(campo.opcoes ?? []).map((op) => {
          const ativa = estaSelecionado(bruto, op);
          /**
           * ⚠️⚠️⚠️ ⛔ *"Não sei"* TEM **UMA CARA SÓ** NO MÓDULO — 2026-09-07.
           *
           * ⛔ ⛔ O tratamento existia ⛔ e ⛔ era aplicado **⛔ só** nos campos de
           * `escolha`. ⚠️ Na lista **múltipla** ⛔ ele ⛔ nunca chegou: o autor
           * pôs as duas capturas lado a lado — ⛔ em *"Como o peso foi obtido"*
           * o *"Não sei"* saía tracejado ⛔ e apagado; ⛔ em *"Alergias
           * conhecidas"*, sólido ⛔ e branco, ⛔ **igual a «Penicilina»**.
           *
           * ⚠️ ⛔ A razão do estilo ⛔ já estava escrita ⛔ aqui: *"«Não sei»
           * ⛔ não é uma resposta clínica, ⛔ e ⛔ não pode parecer uma"*. ⛔ Numa
           * lista de alergias, ⛔ ele competia visualmente com um achado — ⛔ e
           * ⛔ um dos seis ⛔ não é achado.
           *
           * ⚠️⚠️ ⛔ E *"Nenhuma"* ⛔ **⛔ NÃO** entra aqui: ⛔ *"nenhuma alergia
           * conhecida"* é **resposta** — ⛔ alguém perguntou ⛔ e alguém
           * respondeu. ⛔ Achatar as duas apagaria a distinção de **E-37**.
           */
          const ignorancia = valorDaOpcao(op) === "nao_sei";
          return (
            <Pressable
              key={op}
              style={[e.opcao, ativa && e.opcaoAtiva, ignorancia && !ativa && e.opcaoNaoSei]}
              accessibilityRole="checkbox"
              aria-checked={ativa}
              testID={`avc-item-${campo.id}-${op}`}
              onPress={() => {
                const novo = alternarItem(bruto, op, campo.exclusivas ?? []);
                // ⚠️ Desmarcar o último ⛔ não grava vazio: devolve o campo a
                // "ninguém respondeu", que é o que ele passou a ser (§7.16).
                if (novo === "") onDesfazer(campo.id);
                else onEscolher(campo.id, novo);
              }}
            >
              <Text
                style={[
                  e.opcaoTexto,
                  ativa && e.opcaoTextoAtivo,
                  ignorancia && !ativa && e.opcaoTextoNaoSei,
                ]}
              >
                {ativa ? "☑ " : "☐ "}
                {tr(op)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {pedeTexto ? (
        <CaixaDeOutros
          campo={campo.id}
          texto={textoDeOutros}
          onGravar={(t) => onEscolher(CAMPO_DE_OUTROS(campo.id), t)}
          onApagar={() => onDesfazer(CAMPO_DE_OUTROS(campo.id))}
        />
      ) : null}

      {marcados.length > 0 ? (
        <Text style={e.campoAjuda} testID={`avc-multipla-resumo-${campo.id}`}>
          {marcados.map((m) => tr(m)).join(" · ")}
          {/**
            * ⚠️ ⛔ O escrito entra ⛔ no resumo — ⛔ senão *"Outros"* ⛔ ficaria
            * ⛔ no lugar da coisa, ⛔ que é o defeito que ⛔ ele veio corrigir.
            */}
          {pedeTexto && textoDeOutros ? `: ${textoDeOutros}` : ""}
        </Text>
      ) : null}
    </View>
  );
}

export function CampoDeGrandeza({
  campo,
  gravado,
  detalheAberto,
  onAlternarDetalhe,
  onMedir,
  onDesfazer,
  confirmacaoExplicita,
}: {
  campo: Campo;
  gravado: number | undefined;
  detalheAberto: boolean;
  onAlternarDetalhe: () => void;
  onMedir: (campo: string, valor: number) => void;
  onDesfazer: (campo: string) => void;
  /**
   * ⚠️⚠️ EM CORREÇÃO, CADA TOQUE ⛔ NÃO GRAVA — defeito achado pelo e2e do
   * sentinela do ASPECTS (2026-08-30).
   *
   * ⚠️ Com o degrau, corrigir 7 → 3 gravaria **quatro correções** na trilha, e a
   * auditoria leria que o médico corrigiu quatro vezes. ⛔ Ele corrigiu uma. O
   * gesto move o rascunho; **Confirmar** grava UM fato.
   */
  confirmacaoExplicita?: boolean;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  /**
   * ⚠️⚠️ O RASCUNHO EXISTE PARA NÃO SUJAR A TRILHA, e isso ⛔ não é detalhe.
   *
   * A trilha é APPEND-ONLY (§3.1): gravar a cada `onValueChange` da barra
   * escreveria quarenta "medidas" para um gesto só, e a auditoria — que existe
   * para reconstituir o que o médico sabia e quando — viraria ruído ilegível.
   *
   * A barra move o rascunho; **soltar** grava UM fato.
   */
  const [rascunho, setRascunho] = useState<number | undefined>(undefined);
  const faixa = campo.faixa;
  if (!faixa) return null;

  /**
   * ⚠️ TRÊS ESTADOS, ⛔ NÃO DOIS: gravado / em gesto / intocado. O intocado
   * mostra **não informado** mesmo com a barra desenhada numa posição — é a
   * regra §0.2, e é a mesma que impede um peso de 70 kg que ninguém mediu de
   * alimentar dose lá na frente.
   */
  const naoInformado = gravado === undefined && rascunho === undefined;
  /**
   * ⚠️⚠️ INTOCADO ⇒ POLEGAR NO `min`, ⛔ nunca no meio da faixa. A barra precisa
   * de um número para desenhar, e esse número é lido como escolha.
   */
  const valor = rascunho ?? gravado ?? faixa.min;

  return (
    <View style={[e.campo, gravado !== undefined && e.campoRespondido]} testID={`avc-campo-${campo.id}`}>
      <View style={e.campoTopo}>
        <MarcaDeResposta respondido={gravado !== undefined} />
        <Text style={e.campoRotulo}>{tr(campo.rotulo)}</Text>
        <BotaoDeInfo id={campo.id} onPress={onAlternarDetalhe} />
      </View>

      {campo.ajuda ? <Text style={e.campoAjuda}>{tr(campo.ajuda)}</Text> : null}
      {detalheAberto ? <DetalheDoCampo campo={campo} /> : null}

      {/**
        * ⚠️⚠️⚠️ ⛔ UM CONTROLE NUMÉRICO SÓ ⛔ NO MÓDULO — D-127, 2026-09-09.
        *
        * ⛔ ⛔ Aqui havia ⛔ `NumericStepper` ⛔ mais uma cópia própria dos
        * degraus. ⛔ Em Estabilização, ⛔ o **⛔ mesmo** `tipo: "grandeza"` ⛔ do
        * conteúdo ⛔ era desenhado ⛔ pelo `Numero` — ⛔ com caixa digitável ⛔ e
        * ⛔ sem degraus. ⚠️ ⛔ Medido em 375 px: ⛔ o controle de Peso começava em
        * ⛔ `x=36` ⛔ com 306 px, ⛔ o de PAS ⛔ em `x=16` ⛔ com 317 — ⛔ e ⛔ o
        * cartão de Peso ⛔ tinha ⛔ **⛔ 255 px** ⛔ de altura ⛔ contra ⛔ 116.
        * ⛔ Dois gestos, ⛔ duas geometrias, ⛔ duas famílias de `testID`.
        *
        * ⚠️ ⛔ O `Numero` ⛔ é quem fica: ⛔ ele já carrega ⛔ o contrato de
        * ausência (⛔ intocado mostra `—`, ⛔ apagar desfaz, ⛔ `−/+` inertes ⛔ sem
        * partida), ⛔ a caixa digitável ⛔ com o teclado do sistema, ⛔ e ⛔ o
        * `aoLado` ⛔ que ⛔ pendura a calculadora ⛔ **⛔ sem espremer a barra**.
        * ⛔ Os degraus ⛔ foram ⛔ **⛔ para dentro dele**, ⛔ com a mesma regra ⛔ e
        * ⛔ os mesmos `testID` — ⛔ e ⛔ **⛔ deixaram de existir aqui**, ⛔ porque
        * ⛔ duas cópias ⛔ de uma regra ⛔ é ⛔ como nasce ⛔ a terceira.
        *
        * ⛔ ⛔ O rótulo ⛔ vai oculto: ⛔ `campoTopo` ⛔ já o escreveu ⛔ acima, ⛔ e
        * ⛔ repeti-lo ⛔ ao lado da caixa ⛔ foi ⛔ **⛔ a causa medida** ⛔ das
        * larguras diferentes ⛔ que o autor ⛔ relatou ⛔ em 2026-09-08.
        */}
      <Numero
        campo={campo.id}
        rotulo={campo.rotulo}
        rotuloOculto
        unidade={campo.unidade}
        faixa={faixa}
        gravado={gravado}
        onMedir={onMedir}
        onDesfazer={onDesfazer}
        comBarra
        degraus
        commitOnConfirm={confirmacaoExplicita}
        /**
         * ⚠️⚠️ ⛔ O RASCUNHO DO `Numero` É **⛔ TEXTO**; ⛔ o daqui é ⛔ **⛔ número**
         * — ⛔ e ⛔ a ponte ⛔ entre os dois ⛔ **⛔ não pode ⛔ ser ⛔ `Number(t)`
         * ⛔ e pronto**.
         *
         * ⛔ ⛔ Digitando `178`, ⛔ os estados intermediários ⛔ são `1` ⛔ e `17`.
         * ⛔ Aceitá-los ⛔ como rascunho ⛔ faria ⛔ « Confirmar correção » ⛔ gravar
         * ⛔ uma PAS de 1 ⛔ se o dedo saísse ⛔ no meio ⛔ da digitação.
         *
         * ⚠️ ⛔ Então ⛔ só vira rascunho ⛔ o que ⛔ **⛔ cai dentro da faixa** —
         * ⛔ a mesma regra ⛔ que o `Numero` ⛔ aplica ⛔ para gravar.
         */
        rascunho={rascunho === undefined ? undefined : String(rascunho)}
        onRascunho={(texto) => {
          if (texto === undefined || texto === "") {
            setRascunho(undefined);
            return;
          }
          const n = Number(texto);
          setRascunho(
            Number.isFinite(n) && n >= faixa.min && n <= faixa.max ? n : undefined
          );
        }}
        testID={`avc-grandeza-${campo.id}`}
      />

      {confirmacaoExplicita ? (
        <Pressable
          style={e.zero}
          accessibilityRole="button"
          testID={`avc-confirmar-${campo.id}`}
          onPress={() => {
            const v = rascunho ?? gravado;
            setRascunho(undefined);
            if (v !== undefined) onMedir(campo.id, v);
          }}
        >
          <Text style={e.zeroTexto}>{tr("Confirmar correção")}</Text>
        </Pressable>
      ) : null}

      {/**
       * ⚠️⚠️ A PORTA DO ZERO — **E-10**, e só onde o conteúdo a declara.
       *
       * ── O DEFEITO QUE ISTO FECHA ────────────────────────────────────────
       *
       * Com o polegar no mínimo, o `−` do `NumericStepper` nasce DESABILITADO
       * (`noMinimo`) e o `+` sobe para 1. Numa grandeza comum isso é correto: o
       * zero ali é ausência. Numa ESCALA é o contrário — **NIHSS 0 é resposta**,
       * e é a resposta da população da Table 4 (NIHSS 0–5).
       *
       * Sem esta porta, registrar zero exigiria soltar a barra exatamente onde
       * ela já está, ou subir a 1 e voltar — e o `1` ficaria na trilha como uma
       * MEDIDA que ninguém mediu, num app cuja trilha é append-only.
       *
       * ⛔ Ela ⛔ não aparece em peso, PA nem glicemia: lá um toque em "registrar
       * 0" gravaria um valor clinicamente impossível com cara de medida.
       */}
      {/**
       * ⚠️⚠️ LIMPAR — relato do autor, 2026-08-28: *"os outros botões de deslizar
       * consegui fazer deslizar e se tento voltar ao zero não volta, nenhum
       * deles"*.
       *
       * ── O QUE ESTAVA ERRADO ────────────────────────────────────────────
       *
       * A barra VOLTAVA ao mínimo — o que ⛔ não resolvia nada, porque o mínimo é
       * um VALOR: o campo passava a dizer "30 kg", um peso que ninguém mediu,
       * pronto para alimentar dose. Depois do primeiro toque ⛔ não existia como
       * DESINFORMAR o campo, e é isso que este botão faz.
       *
       * ⚠️ Só aparece quando há valor gravado: botão que ⛔ não tem o que limpar é
       * ruído, e some para não competir com os degraus.
       */}
      {gravado !== undefined ? (
        <Pressable
          style={e.zero}
          accessibilityRole="button"
          accessibilityLabel={`${tr(campo.rotulo)}: ${tr("limpar")}`}
          testID={`avc-limpar-${campo.id}`}
          onPress={() => {
            setRascunho(undefined);
            onDesfazer(campo.id);
          }}
        >
          <Text style={e.zeroTexto}>{tr("Limpar")}</Text>
        </Pressable>
      ) : null}

      {campo.zeroValido ? (
        <Pressable
          style={e.zero}
          accessibilityRole="button"
          accessibilityLabel={`${tr(campo.rotulo)}: 0`}
          testID={`avc-grandeza-zero-${campo.id}`}
          onPress={() => {
            setRascunho(undefined);
            onMedir(campo.id, 0);
          }}
        >
          <Text style={e.zeroTexto}>{tr("Registrar 0")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * O CONTROLE DE HORA — ⚠️ um cartão como os demais, ⛔ nunca uma linha solta.
 *
 * ── POR QUE ELE SAIU DA SUPERFÍCIE A (2026-08-29) ──────────────────────────
 *
 * Ele morava em `superficie-a.tsx`, com um comentário dizendo *"o relógio ficou:
 * ele é exclusivo desta superfície"*. ⚠️ Isso deixou de ser verdade em dois
 * lugares ao mesmo tempo:
 *
 *   · a Superfície **B** já declarava `nihss_informado_hora` como `tipo: "hora"`
 *     — e a tela ⛔ não sabia desenhar hora: o campo caía no ramo de `escolha`,
 *     renderizava um cartão **sem opção nenhuma**, e o médico ⛔ não tinha como
 *     responder. ⚠️ **Campo impossível de responder é pior que campo ausente**:
 *     ele promete um dado que ⛔ nunca vai existir;
 *   · a Superfície **C** precisa do horário da tomografia.
 *
 * ⚠️ Duplicar as lições do seletor — "agora" ⛔ nunca como default silencioso,
 * desconhecido como resposta com botão visível, ⛔ nunca `String(instante)` na
 * tela — faria a próxima correção acertar uma das cópias.
 *
 * ⚠️⚠️ **E-36 · O CAMPO NOMEIA O RELÓGIO QUE ALIMENTA.** `campo.relogio` desce
 * para o dono, e um campo **sem** relógio declarado ⛔ não define marco nenhum —
 * é o caso do horário da tomografia, que é registro operacional e ⛔ jamais pode
 * virar marco de janela terapêutica (**E-21**).
 */
/**
 * ── ⚠️⚠️ O ÍCONE DO MARCO VEIO DA SUPERFÍCIE A — 2026-09-07, Fase 4 ────────
 *
 * ⛔ Ele morava em `superficie-a.tsx`, ⛔ onde a cronologia era desenhada. ⚠️ Com
 * ⛔ ela na Avaliação AVC (**C7**), copiar o ramo para a outra tela repetiria
 * ⛔ exatamente o que este arquivo existe para impedir — ⛔ e a próxima correção
 * acertaria ⛔ **uma** das cópias.
 *
 * ⚠️⚠️ ⛔ E ⛔ ELE É POR CAMPO, ⛔ NÃO POR TIPO: `nihss_informado_hora` ⛔ e o
 * horário da tomografia ⛔ **não** são marcos ⛔ e ⛔ não ganham ícone — ⛔ dar um
 * ⛔ a ⛔ eles sugeriria janela terapêutica ⛔ onde há registro operacional
 * (**E-21**).
 */
const ICONE_DO_MARCO: Readonly<Record<string, NomeDeIcone>> = {
  hora_chegada: "chegada",
  hora_ultima_vez_bem: "ultimaVezBem",
  hora_inicio_observado: "inicioObservado",
  hora_reconhecimento: "reconhecimento",
  hora_meio_do_sono: "meioDoSono",
};

export function CampoDeHora({
  campo,
  gravado,
  desconhecido,
  agora,
  detalheAberto,
  onAlternarDetalhe,
  onHora,
  onEscolher,
  onDesfazer,
}: {
  campo: Campo;
  gravado: number | undefined;
  desconhecido: boolean;
  agora: number;
  detalheAberto: boolean;
  onAlternarDetalhe: () => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onEscolher: (campo: string, valor: string) => void;
  onDesfazer: (campo: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  /**
   * O horário sendo editado, antes de virar fato. ⛔ Nada é gravado até confirmar.
   *
   * ⚠️ `selecionado` distingue **posição do controle** de **valor escolhido**.
   * Sem ele, abrir o seletor já valeria como resposta — e "agora" viraria o
   * default silencioso de um campo que decide janela terapêutica.
   */
  const [editando, setEditando] = useState<{ instante: number; selecionado: boolean } | null>(null);

  /**
   * ⚠️⚠️ O BOTÃO PRECISA PARECER UM BOTÃO — relato do autor usando o app em
   * 2026-08-28: *"botões ruins de selecionar, não intuitivos, tem que ficar
   * procurando onde tem que clicar"*.
   *
   * ⚠️ ⛔ NUNCA `String(instante)`: era daqui que saía o `1787922516903`.
   */
  const botaoDoValor = (
    <Pressable
      style={[e.relogioAcao, gravado !== undefined && e.relogioAcaoInformada]}
      accessibilityRole="button"
      accessibilityLabel={`${tr(campo.rotulo)}: ${
        gravado === undefined ? tr("não informado") : horaDeExibicao(gravado, agora)
      }`}
      testID={`avc-hora-${campo.id}`}
      onPress={() =>
        setEditando(
          editando
            ? null
            : {
                // ⚠️ Posiciona em `agora` por ergonomia quando não há marco —
                // ⛔ mas isso NÃO é seleção (ver `selecionado`).
                instante: gravado ?? agora,
                /**
                 * ⚠️ REEDITAR ⛔ NÃO É INFORMAR PELA PRIMEIRA VEZ. Se já existe um
                 * marco registrado, ele É um valor escolhido, e Confirmar nasce
                 * habilitado — exigir novo toque ali obrigaria o médico a mexer
                 * num horário correto só para reconfirmá-lo.
                 */
                selecionado: gravado !== undefined,
              }
        )
      }
    >
      <Text style={e.relogioValor} testID={`avc-hora-valor-${campo.id}`}>
        {gravado !== undefined ? `✓ ${horaDeExibicao(gravado, agora)} ✎` : tr("Informar horário")}
      </Text>
    </Pressable>
  );

  /**
   * ⚠️⚠️ DESCONHECIDO É RESPOSTA, e precisa de um BOTÃO VISÍVEL — §7.5 item 6 e
   * **E-02**, cujo exemplo canônico é o último-visto-bem.
   *
   * ⚠️ Só aparece onde o campo o declara: ⛔ nem todo horário tem "ninguém sabe
   * dizer" como resposta clínica com consequência própria.
   */
  const botaoDesconhecido = campo.aceitaDesconhecido ? (
    <Pressable
      style={[e.relogioAcao, desconhecido && e.relogioAcaoAtiva]}
      accessibilityRole="radio"
      aria-checked={desconhecido}
      accessibilityLabel={`${tr(campo.rotulo)}: ${tr("Sem essa informação")}`}
      testID={`avc-hora-desconhecido-${campo.id}`}
      /**
       * ⚠️⚠️ TOCAR DE NOVO DESFAZ — relato do autor, 2026-08-28: *"cliquei em sem
       * informação e não consigo desmarcar isso"*. ⚠️ Desfazer ⛔ não apaga:
       * corrige, e a trilha guarda as duas passagens.
       */
      onPress={() => (desconhecido ? onDesfazer(campo.id) : onEscolher(campo.id, "nao_sei"))}
    >
      <Text style={[e.relogioValor, desconhecido && e.relogioAcaoAtivaTexto]}>
        {desconhecido ? "✓ " : ""}
        {tr("Sem essa informação")}
      </Text>
    </Pressable>
  ) : null;

  const respondido = gravado !== undefined || desconhecido;

  /**
   * ── ⚠️⚠️ O MARCO TEM APRESENTAÇÃO PRÓPRIA, ⛔ e ⛔ ela é a que já existia ──
   *
   * ⛔ `LinhaDeRelogio` carrega o trabalho de afordância de 2026-09-06 — ⛔ o
   * sexto relato do autor sobre a mesma coisa: *"relógios ⛔ não se parecem
   * botões, se parecem textos"*. ⚠️ Desenhar o marco pelo caminho genérico
   * ⛔ desfaria ⛔ isso ⛔ em silêncio, ⛔ na fase que ⛔ só devia **recompor**.
   *
   * ⚠️ ⛔ O contrato de teste é o mesmo nos dois caminhos: `avc-hora-<id>`,
   * `avc-hora-desconhecido-<id>` ⛔ e `avc-campo-<id>`.
   */
  const icone = ICONE_DO_MARCO[campo.id];
  const seletor = editando ? (
    <SeletorDeHora
      rotulo={campo.rotulo}
      instante={editando.instante}
      selecionado={editando.selecionado}
      agora={agora}
      onMudar={(i, escolheuValor) =>
        setEditando((atual) => ({
          instante: i,
          selecionado: escolheuValor || (atual?.selecionado ?? false),
        }))
      }
      onConfirmar={() => {
        /**
         * ⚠️⚠️ `campo.relogio` DESCE COMO ESTÁ, inclusive `undefined` — ⛔ e ⛔ é
         * ⛔ este repasse que acende o relógio clínico. ⛔ Sem ⛔ ele o fato é
         * gravado ⛔ e o cabeçalho **apaga em silêncio**.
         */
        onHora(campo.id, editando.instante, campo.relogio);
        setEditando(null);
      }}
      onCancelar={() => setEditando(null)}
    />
  ) : null;

  if (icone !== undefined) {
    return (
      <View testID={`avc-campo-${campo.id}`}>
        <LinhaDeRelogio
          campo={campo.id}
          icone={icone}
          rotulo={campo.rotulo}
          valor={
            gravado !== undefined
              ? `✓ ${horaDeExibicao(gravado, agora)} ✎`
              : desconhecido
                ? "Sem essa informação"
                : "Informar horário"
          }
          estado={gravado !== undefined ? "registrado" : desconhecido ? "desconhecido" : "vazio"}
          /** ⚠️ Realce ⛔ só enquanto o campo revelado segue vazio. */
          destaque={campo.apareceQuando !== undefined && gravado === undefined}
          onPress={() =>
            setEditando(editando ? null : { instante: gravado ?? agora, selecionado: gravado !== undefined })
          }
          info={<BotaoDeInfo id={campo.id} onPress={onAlternarDetalhe} />}
        />
        {/**
          * ⚠️⚠️ A SUB-LINHA PERTENCE AO RELÓGIO ACIMA — ⛔ solta, ⛔ ela parecia
          * ⛔ pertencer ⛔ ao de baixo, ⛔ e num campo de horário ⛔ isso troca o
          * marco.
          */}
        {campo.aceitaDesconhecido ? (
          <View style={e.subLinhaDoMarco}>{botaoDesconhecido}</View>
        ) : null}
        {seletor}
        {detalheAberto ? <DetalheDoCampo campo={campo} /> : null}
      </View>
    );
  }

  return (
    <View style={[e.campo, respondido && e.campoRespondido]} testID={`avc-campo-${campo.id}`}>
      {/**
       * ⚠️ O RÓTULO TEM A LINHA DELE, E AS AÇÕES TÊM A DELAS. Espremidos na mesma
       * linha, os nomes de marco truncavam — e os marcos existem por serem
       * DIFERENTES: truncados, viram iguais.
       */}
      <View style={e.relogioLinha}>
        <Text style={[e.marca, respondido && e.marcaAtiva]} accessibilityElementsHidden>
          {ESTADOS[respondido ? "favoravel" : "ausente"].simbolo}
        </Text>
        <Text style={e.relogioRotulo} numberOfLines={2}>
          {tr(campo.rotulo)}
        </Text>
        <BotaoDeInfo id={campo.id} onPress={onAlternarDetalhe} />
      </View>

      {campo.ajuda ? <Text style={e.campoAjuda}>{tr(campo.ajuda)}</Text> : null}

      <View style={e.relogioAcoes}>
        {botaoDoValor}
        {botaoDesconhecido}
      </View>

      {detalheAberto ? <DetalheDoCampo campo={campo} /> : null}

      {seletor}
    </View>
  );
}


/**
 * TEXTO LIVRE — ⚠️ e ele existe para **um** campo do módulo inteiro.
 *
 * ⛔⛔ §0.3 PROÍBE CAIXA DE TEXTO PARA VALOR CLÍNICO, e a proibição continua
 * inteira. O único consumidor é a **identificação do paciente**, que é
 * `natureza: "administrativo"` — e a prova de cada superfície reprova `texto`
 * em campo clínico.
 */
export function CampoDeTexto({
  campo,
  valor,
  onEscrever,
  onDesfazer,
}: {
  campo: Campo;
  valor: string;
  onEscrever: (campo: string, valor: string) => void;
  onDesfazer: (campo: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const corDoPlaceholder = useEstilosDoTema((tema) => ({ cor: { color: tema.cores.textSecondary } })).cor
    .color as string;
  const respondido = valor.length > 0;
  return (
    <View style={[e.campo, respondido && e.campoRespondido]} testID={`avc-campo-${campo.id}`}>
      <View style={e.campoTopo}>
        <MarcaDeResposta respondido={respondido} />
        <Text style={e.campoRotulo}>{tr(campo.rotulo)}</Text>
      </View>
      {campo.ajuda ? <Text style={e.campoAjuda}>{tr(campo.ajuda)}</Text> : null}
      <TextInput
        style={e.entradaDeTexto}
        value={valor}
        onChangeText={(t) => (t.length === 0 ? onDesfazer(campo.id) : onEscrever(campo.id, t))}
        placeholder={tr("não informado")}
        /**
         * ⚠️ A COR VEM DO TEMA, e ⛔ não de um hexadecimal — `valida-paleta`
         * reprovou a primeira versão. Cor escrita à mão ⛔ não é vista pela trava
         * de contraste, e o placeholder é justamente texto de baixo contraste.
         */
        placeholderTextColor={corDoPlaceholder}
        testID={`avc-texto-${campo.id}`}
        accessibilityLabel={tr(campo.rotulo)}
      />
    </View>
  );
}

/**
 * ⚠️⚠️ O CAMPO DE UMA SUPERFÍCIE — **um** renderizador, para todas.
 *
 * ── POR QUE ELE EXISTE (2026-08-29) ────────────────────────────────────────
 *
 * A escolha de controle por `campo.tipo` estava escrita **três vezes** — A, B e
 * C —, e a quarta ia nascer com Paciente. Cada cópia já tinha divergido: só a A
 * sabia desenhar `hora`, e por isso um campo `tipo: "hora"` da B renderizava um
 * cartão **sem opção nenhuma**, impossível de responder.
 *
 * ⚠️ E é aqui que a **etiqueta de procedência** do campo emprestado vive — uma
 * vez, e ⛔ não quatro.
 */
/**
 * ⚠️⚠️ QUANDO A PERGUNTA MERECE OS BOTÕES GRANDES DA REFERÊNCIA.
 *
 * ⚠️ ⛔ Só quando **todas** as opções pertencem ao vocabulário binário do módulo
 * — `sim` · `nao` · `incerto` · `nao_sei`. ⛔ Aplicá-los a *"Este serviço /
 * Serviço externo / ⛔ Não sei"* daria três blocos de 56 px para escolher **onde
 * o exame foi feito**, roubando a tela da decisão que de fato importa.
 *
 * ⚠️ ⛔ É a diferença entre copiar a **forma** da referência ⛔ e copiar o
 * **critério** dela: lá o par verde/vermelho aparece ⛔ só na pergunta que
 * governa a conduta.
 */
const VOCABULARIO_BINARIO = new Set(["sim", "nao", "incerto", "nao_sei"]);

function binaria(opcoes: readonly string[] | undefined): boolean {
  if (!opcoes || opcoes.length === 0 || opcoes.length > 3) return false;
  return opcoes.every((o) => VOCABULARIO_BINARIO.has(valorDaOpcao(o)));
}

export function CampoDaSuperficie({
  campo,
  casaAtual,
  bruto,
  numero,
  agora,
  detalheAberto,
  onAlternarDetalhe,
  onEscolher,
  onMedir,
  onHora,
  onDesfazer,
  derivado,
  empilhado,
  nomeDaCasa,
  emCorrecao,
  textoDeOutros,
  onEntrarEmCorrecao,
  onCancelarCorrecao,
  onNovaMedida,
  rotuloDeNovaMedida,
}: {
  campo: Campo;
  /** A superfície que está desenhando. ⚠️ Diferente de `campo.casa` = emprestado. */
  casaAtual: string;
  bruto: string;
  numero: number | undefined;
  agora: number;
  detalheAberto: boolean;
  onAlternarDetalhe: () => void;
  onEscolher: (campo: string, valor: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onDesfazer: (campo: string) => void;
  derivado?: string;
  empilhado?: boolean;
  /** Como se chama a casa do campo, para a etiqueta. ⚠️ Traduzido pelo chamador. */
  nomeDaCasa?: string;
  /**
   * ⚠️⚠️ O CONTRATO DE CORREÇÃO — ⛔ ativo **só** onde a superfície o pede.
   *
   * > *"redigitar um analito já informado na mesma coleta ⛔ não pode ter
   * > semântica implícita. O gesto precisa ser explícito."* — autor, 2026-08-30
   *
   * ⚠️ Passando `onEntrarEmCorrecao`, o campo **já respondido** deixa de aceitar
   * escrita direta: ele vira **leitura**, com dois gestos nomeados lado a lado —
   * *Corrigir* e *Nova medida*. A tela **pergunta qual das duas**, em vez de
   * deduzir do que foi digitado.
   *
   * ⛔ Sem estas props ⛔ nada muda: as outras superfícies seguem exatamente como
   * estavam, e ⛔ nenhuma regra nova vaza para elas.
   */
  emCorrecao?: boolean;
  /** ⚠️ ⛔ O texto de *"Outros"*, ⛔ quando o campo aceita ⛔ um. */
  textoDeOutros?: string;
  onEntrarEmCorrecao?: () => void;
  onCancelarCorrecao?: () => void;
  onNovaMedida?: () => void;
  /** ⚠️ "Nova coleta" no Laboratório. ⚠️ Traduzido aqui dentro. */
  rotuloDeNovaMedida?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const emprestado = campo.casa !== casaAtual;

  /**
   * ⚠️⚠️ RESPONDIDO ⛔ NÃO É O MESMO QUE "TEM VALOR".
   *
   * ⛔ `nao_perguntado` é a trilha dizendo que o campo foi **desfeito** — ele
   * voltou a estar vazio, e vazio se preenche direto. Já `nao_sei` **é uma
   * resposta** (E-02): mudá-la é corrigir uma declaração, e exige o gesto.
   */
  const respondido = bruto !== "" && bruto !== "nao_perguntado";
  const emLeitura = onEntrarEmCorrecao !== undefined && respondido && !emCorrecao;

  const controle =
    campo.tipo === "hora" ? (
      <CampoDeHora
        campo={campo}
        gravado={numero}
        desconhecido={bruto === "nao_sei"}
        agora={agora}
        detalheAberto={detalheAberto}
        onAlternarDetalhe={onAlternarDetalhe}
        onHora={onHora}
        onEscolher={onEscolher}
        onDesfazer={onDesfazer}
      />
    ) : campo.tipo === "grandeza" ? (
      <CampoDeGrandeza
        campo={campo}
        gravado={numero}
        detalheAberto={detalheAberto}
        onAlternarDetalhe={onAlternarDetalhe}
        onMedir={onMedir}
        onDesfazer={onDesfazer}
        confirmacaoExplicita={emCorrecao}
      />
    ) : campo.tipo === "multipla" ? (
      <CampoDeMultipla
        campo={campo}
        bruto={bruto}
        detalheAberto={detalheAberto}
        onAlternarDetalhe={onAlternarDetalhe}
        onEscolher={onEscolher}
        onDesfazer={onDesfazer}
        textoDeOutros={textoDeOutros}
      />
    ) : campo.tipo === "numerico" ? (
      <CampoNumerico
        campo={campo}
        gravado={numero}
        detalheAberto={detalheAberto}
        onAlternarDetalhe={onAlternarDetalhe}
        onMedir={onMedir}
        onDesfazer={onDesfazer}
        /**
         * ⚠️⚠️ EM CORREÇÃO, SAIR DO CAMPO ⛔ NÃO GRAVA.
         *
         * ⚠️ O e2e *"cancelar ⛔ não grava nada"* achou isto: tocar em **Cancelar**
         * tira o foco da entrada, e o `blur` gravava **antes** do cancelamento
         * chegar. O médico desistia e o valor entrava assim mesmo — o oposto
         * exato do que o gesto promete.
         */
        confirmacaoExplicita={emCorrecao}
      />
    ) : campo.tipo === "texto" ? (
      <CampoDeTexto
        campo={campo}
        valor={bruto === "nao_perguntado" ? "" : bruto}
        onEscrever={onEscolher}
        onDesfazer={onDesfazer}
      />
    ) : (
      <CampoDeEscolha
        campo={campo}
        bruto={bruto}
        derivado={derivado}
        empilhado={empilhado}
        detalheAberto={detalheAberto}
        onAlternarDetalhe={onAlternarDetalhe}
        onEscolher={onEscolher}
        onDesfazer={onDesfazer}
      />
    );

  /**
   * ⚠️⚠️ O CARTÃO DE LEITURA — o que fecha a ambiguidade.
   *
   * ⚠️ Ele mostra o valor **sem** entrada editável e oferece os dois gestos
   * nomeados. ⛔ Sem diálogo modal: o gesto já é explícito por ser um botão que
   * diz o que faz, e um modal ⛔ só interromperia.
   *
   * ⚠️ **Nova medida aparece AQUI**, no ponto onde a ambiguidade nasce — e ⛔ não
   * ⛔ só no fim do painel. Quem quis medir de novo precisa achar a alternativa
   * no instante em que ela é a certa, ⛔ senão é empurrado a "corrigir" o que
   * ⛔ não era correção.
   */
  const leitura = (
    <View style={e.campo} testID={`avc-leitura-campo-${campo.id}`}>
      <View style={e.campoTopo}>
        {/**
          * ⚠️ O MARCADOR VEM JUNTO — achado na revisão visual de 2026-08-30.
          *
          * ⚠️⚠️ O cartão de leitura nascia sem ele, e o campo respondido perdia o
          * `✓` que todos os outros exibem. Quem varre a coluna lê estado pela
          * marca; um cartão sem marca no meio de cartões com marca ⛔ não é
          * "neutro" — parece ⛔ não respondido.
          */}
        <MarcaDeResposta respondido />
        <Text style={e.campoRotulo}>{tr(campo.rotulo)}</Text>
        <BotaoDeInfo id={campo.id} onPress={onAlternarDetalhe} />
      </View>
      {detalheAberto ? <DetalheDoCampo campo={campo} /> : null}

      <Text style={e.valorEmLeitura} testID={`avc-valor-${campo.id}`}>
        {bruto === "nao_sei"
          ? tr("Sem essa informação")
          : campo.tipo === "hora" && numero !== undefined
            ? horaDeExibicao(numero, agora)
            : numero !== undefined
              ? `${numeroCurto(numero, campo.faixa?.passo ?? 1)}`
                + `${campo.unidade ? ` ${tr(campo.unidade)}` : ""}`
              : tr(bruto)}
      </Text>

      {/**
        * ⚠️ LADO A LADO, e ⛔ não empilhados: as duas são **alternativas** de um
        * mesmo dilema, e empilhadas viravam quatro botões idênticos rolando pela
        * coluna — medido em 375 px na revisão visual.
        */}
      <View style={e.parDeGestos}>
        <Pressable
          style={e.botaoSecundario}
          accessibilityRole="button"
          testID={`avc-corrigir-${campo.id}`}
          onPress={onEntrarEmCorrecao}
        >
          <Text style={e.textoSecundario}>
            {tr(campo.rotuloDeCorrecao ?? "Corrigir resultado")}
          </Text>
        </Pressable>

        {onNovaMedida ? (
          <Pressable
            style={e.botaoSecundario}
            accessibilityRole="button"
            testID={`avc-nova-medida-${campo.id}`}
            onPress={onNovaMedida}
          >
            <Text style={e.textoSecundario}>{tr(rotuloDeNovaMedida ?? "Nova medida")}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  /** ⚠️ Em correção: o controle volta, com o aviso do que está acontecendo. */
  const corpo = emLeitura ? (
    leitura
  ) : emCorrecao ? (
    <View testID={`avc-corrigindo-${campo.id}`}>
      <Text style={e.avisoDeCorrecao}>
        {tr("Corrigindo o valor desta aferição. O anterior permanece na trilha.")}
      </Text>
      {controle}
      <Pressable
        style={e.botaoSecundario}
        accessibilityRole="button"
        testID={`avc-cancelar-correcao-${campo.id}`}
        onPress={onCancelarCorrecao}
      >
        {/* ⚠️⚠️ Cancelar ⛔ NÃO grava. Corrigir precisa ser abandonável, ⛔ senão vira armadilha. */}
        <Text style={e.textoSecundario}>{tr("Cancelar correção")}</Text>
      </Pressable>
    </View>
  ) : (
    controle
  );

  if (!emprestado) return corpo;
  return (
    <View testID={`avc-emprestado-${campo.id}`}>
      {/**
        * ⚠️⚠️ A ETIQUETA DIZ ONDE O FATO MORA, e ⛔ não que ele é uma cópia.
        *
        * ⚠️ Sem ela, o médico que responde o peso aqui e o vê preenchido no painel
        * Paciente pensa que respondeu duas vezes — e a primeira coisa que faz é
        * desconfiar da tela. É a mesma lição das três procedências do NIHSS.
        */}
      <Text style={e.origem}>
        {nomeDaCasa ? `${tr("Do painel")} ${tr(nomeDaCasa)}` : tr("De outra superfície")}
      </Text>
      {corpo}
    </View>
  );
}


/**
 * NÚMERO DIGITADO — ⚠️ **⛔ sem barra**, e com ajuste por ±.
 *
 * ── A FRONTEIRA DE §0.3, aprovada pelo autor em 2026-08-30 ────────────────
 *
 * > *"Entrada numérica estruturada ⛔ não é texto livre. O que §0.3 precisa
 * > impedir é um campo em que o médico escreve qualquer coisa sem tipo, sem
 * > unidade, sem domínio e sem semântica controlada."*
 *
 * ⚠️ **Por que ⛔ não é barra:** num analito de laboratório a barra sugere
 * **contínuo** e **faixa normal** — e a fonte ⛔ não dá faixa de normalidade, dá
 * **limiar de decisão**. Além disso o gesto real é **transcrever** o número do
 * laudo, ⛔ não deslizar até ele.
 *
 * ⛔⛔ E O `min`/`max` DA FAIXA ⛔ NÃO APARECE. Ele é limite **técnico** do
 * componente: ⛔ não é mensagem, ⛔ não é "valor máximo permitido", e ⛔ não
 * alimenta derivação nenhuma.
 */
export function CampoNumerico({
  campo,
  gravado,
  detalheAberto,
  onAlternarDetalhe,
  onMedir,
  onDesfazer,
  confirmacaoExplicita,
}: {
  campo: Campo;
  gravado: number | undefined;
  detalheAberto: boolean;
  onAlternarDetalhe: () => void;
  onMedir: (campo: string, valor: number) => void;
  onDesfazer: (campo: string) => void;
  /** ⚠️ Ver o comentário no chamador: em correção, sair do campo ⛔ não grava. */
  confirmacaoExplicita?: boolean;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  /**
   * ⚠️ O rascunho é TEXTO enquanto se digita — `1,` e `1,4` são estados válidos
   * do teclado que ⛔ não são números. Converter a cada tecla apagaria a vírgula
   * no instante em que ela é digitada.
   *
   * ⚠️ E o hook vem ANTES de qualquer saída: chamada condicional de hook é erro
   * de React, e ⛔ não detalhe de estilo.
   */
  const [rascunho, setRascunho] = useState<string | undefined>(undefined);
  const corSecundaria = useEstilosDoTema((tema) => ({ c: { color: tema.cores.textSecondary } }))
    .c.color as string;
  const faixa = campo.faixa;
  if (!faixa) return null;
  const exibido =
    rascunho ?? (gravado === undefined ? "" : numeroCurto(gravado, faixa.passo));

  /**
   * ⚠️ Aceita vírgula E ponto: o teclado do aparelho decide qual oferece.
   *
   * ⚠️ Arrow declarada DEPOIS da guarda, e ⛔ não `function`: declaração de função
   * é içada, e o TypeScript ⛔ não estreita `faixa` dentro dela — o que deixaria
   * `faixa.max` como possivelmente indefinido num cálculo que grava valor
   * clínico.
   */
  const aoTerminar = (texto: string) => {
    setRascunho(undefined);
    const limpo = texto.replace(",", ".").trim();
    if (limpo === "") {
      onDesfazer(campo.id);
      return;
    }
    const n = Number(limpo);
    if (!Number.isFinite(n)) return;
    /**
     * ⚠️⚠️ PRESO À FAIXA **TÉCNICA**, e arredondado apenas nas **CASAS** — e ⛔ não
     * na grade do passo.
     *
     * ⚠️ A primeira versão usava `arredondaAoPasso`, e em plaquetas (passo
     * `1000`) digitar **80** virava **0**: o componente apagava um resultado
     * verdadeiro e mostrava outro no lugar. O passo é o incremento do **ajuste**,
     * ⛔ não a grade dos valores possíveis.
     */
    const preso = Math.min(faixa.max, Math.max(faixa.min, n));
    onMedir(campo.id, arredondaCasas(preso, faixa.passo));
  };

  const ajustar = (delta: number) => {
    const base = gravado ?? 0;
    const preso = Math.min(faixa.max, Math.max(faixa.min, base + delta));
    onMedir(campo.id, arredondaAoPasso(preso, faixa.passo));
  };

  const respondido = gravado !== undefined;
  return (
    <View style={[e.campo, respondido && e.campoRespondido]} testID={`avc-campo-${campo.id}`}>
      <View style={e.campoTopo}>
        <MarcaDeResposta respondido={respondido} />
        <Text style={e.campoRotulo}>{tr(campo.rotulo)}</Text>
        <BotaoDeInfo id={campo.id} onPress={onAlternarDetalhe} />
      </View>
      {campo.ajuda ? <Text style={e.campoAjuda}>{tr(campo.ajuda)}</Text> : null}
      {detalheAberto ? <DetalheDoCampo campo={campo} /> : null}

      <View style={e.numericoLinha}>
        <Pressable
          style={e.passoNumerico}
          accessibilityRole="button"
          accessibilityLabel={`${tr(campo.rotulo)} −`}
          testID={`avc-numerico-menos-${campo.id}`}
          onPress={() => ajustar(-faixa.passo)}
        >
          <Text style={e.degrauTexto}>−</Text>
        </Pressable>

        <TextInput
          /**
           * ⚠️ VAZIO USA TIPOGRAFIA DE **PROSA**, e ⛔ não de número.
           *
           * ⚠️⚠️ "não informado" é um **estado**, e ⛔ não uma medida. Renderizado no
           * corpo grande e negrito reservado ao número, ele ⛔ **não cabia** na
           * caixa em 375 px e aparecia cortado — `não informad…`. Um estado
           * cortado é um estado ilegível, e E-37 exige que os três vazios sejam
           * distinguíveis **lendo a tela**.
           */
          style={[e.entradaNumerica, exibido === "" && e.entradaNumericaVazia]}
          value={exibido}
          inputMode="decimal"
          onChangeText={setRascunho}
          onBlur={() => { if (!confirmacaoExplicita) aoTerminar(exibido); }}
          onSubmitEditing={() => aoTerminar(exibido)}
          /** ⚠️ "⛔ não informado" é ESTADO, e ⛔ não um número — E-37, E-52. */
          placeholder={tr("não informado")}
          placeholderTextColor={corSecundaria}
          testID={`avc-numerico-${campo.id}`}
          accessibilityLabel={tr(campo.rotulo)}
        />
        {campo.unidade ? <Text style={e.unidade}>{tr(campo.unidade)}</Text> : null}

        <Pressable
          style={e.passoNumerico}
          accessibilityRole="button"
          accessibilityLabel={`${tr(campo.rotulo)} +`}
          testID={`avc-numerico-mais-${campo.id}`}
          onPress={() => ajustar(+faixa.passo)}
        >
          <Text style={e.degrauTexto}>+</Text>
        </Pressable>
      </View>

      {/**
        * ⚠️⚠️ A PORTA DO ZERO — **e o critério mudou em 2026-08-30**: ela existe
        * quando **zero é possível para a grandeza**, e ⛔ nunca por *"na prática
        * ⛔ não chega a zero"*. Plaqueta 0 é resultado que laboratório reporta.
        */}
      {/**
        * ⚠️⚠️ CONFIRMAR — ⛔ só em correção, porque ⛔ só ali o `blur` deixou de gravar.
        *
        * ⚠️ Fora da correção, sair do campo confirma, e um botão a mais seria
        * atrito em cima do gesto mais comum da tela.
        */}
      {confirmacaoExplicita ? (
        <Pressable
          style={e.zero}
          accessibilityRole="button"
          testID={`avc-confirmar-${campo.id}`}
          onPress={() => aoTerminar(exibido)}
        >
          <Text style={e.zeroTexto}>{tr("Confirmar correção")}</Text>
        </Pressable>
      ) : null}

      {campo.zeroValido && gravado !== 0 ? (
        <Pressable
          style={e.zero}
          accessibilityRole="button"
          testID={`avc-numerico-zero-${campo.id}`}
          onPress={() => onMedir(campo.id, 0)}
        >
          <Text style={e.zeroTexto}>{tr("Registrar 0")}</Text>
        </Pressable>
      ) : null}

      {respondido ? (
        <Pressable
          style={e.zero}
          accessibilityRole="button"
          testID={`avc-limpar-${campo.id}`}
          onPress={() => onDesfazer(campo.id)}
        >
          <Text style={e.zeroTexto}>{tr("Limpar")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * O PAINEL DE LEITURAS — ⚠️ E-46: são APOIO ao julgamento, ⛔ nunca veredito.
 *
 * ⚠️ Na tela vai só a frase curta. Os insumos e o slot de fonte que E-22/E-30
 * exigem ⛔ não sumiram — estão a um toque, no ⓘ.
 */
export function PainelDeLeituras({
  leituras,
  rotuloDoCampo,
  detalheAberto,
  onAlternarDetalhe,
}: {
  leituras: readonly (Leitura & { id: string })[];
  rotuloDoCampo: Record<string, string>;
  detalheAberto: (id: string) => boolean;
  onAlternarDetalhe: (id: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={e.grupo} testID="avc-grupo-alertas">
      {/* ⚠️ Mesmo degrau de hierarquia dos blocos clínicos: os alertas são
          leitura do sistema sobre o que foi respondido, ⛔ não rodapé. */}
      <CabecalhoDeBloco titulo="Alertas" testID="avc-bloco-alertas" />
      {[...leituras]
        .sort((a, b) => PESO_DO_TOM[a.tom] - PESO_DO_TOM[b.tom])
        .map((l) => (
          <View key={l.id} style={[e.leitura, e[l.tom]]} testID={`avc-leitura-${l.id}`}>
            <View style={e.leituraLinha}>
              <Text
                style={[e.leituraTexto, l.tom === "informativo" && e.leituraFraca]}
                testID={`avc-leitura-curto-${l.id}`}
              >
                {SIMBOLO[l.tom]}{" "}
                {/** ⚠️ Ver `sujeito` em `leitura.ts`: sem ele, quatro analitos
                    dariam quatro linhas idênticas. */}
                {l.sujeito ? `${tr(l.sujeito)} — ` : ""}
                {tr(l.curto)}
                {/** ⚠️ Ver `estudos` em `leitura.ts`: a leitura nomeia a origem. */}
                {l.estudos && l.estudos.length > 1
                  ? `: ${l.estudos.map((i) => rotuloDoCampo[i] ?? i).join(" · ")}`
                  : ""}
              </Text>
              <BotaoDeInfo id={`leitura-${l.id}`} onPress={() => onAlternarDetalhe(`leitura-${l.id}`)} />
            </View>
            {detalheAberto(`leitura-${l.id}`) ? (
              <View style={e.detalhe} testID={`avc-detalhe-leitura-${l.id}`}>
                <Text style={e.detalheTexto}>{tr(l.texto)}</Text>
                <Text style={e.detalheTexto}>
                  {tr("a partir de")}:{" "}
                  {l.insumos.map((i) => tr(rotuloDoCampo[i] ?? i)).join(", ")} · {l.fonte}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      {/**
        * ── ⚠️⚠️⚠️ ⛔ **⛔ UM** AVISO POR PAINEL — 2026-09-09 ────────────────
        *
        * ⚠️ Decisão do autor: *"`recomendacao` aparece **⛔ uma vez por bloco
        * de leituras**… ⛔ e ⛔ não uma vez por leitura"*.
        *
        * ⛔ ⛔ ⛔ Antes, a frase *"Apoio ao julgamento clínico. A decisão
        * permanece do médico."* ⛔ vinha ⛔ **⛔ colada ⛔ em cada leitura** —
        * ⛔ e ⛔ um painel com cinco alertas ⛔ a repetia ⛔ cinco vezes.
        *
        * ⚠️ ⛔ E ⛔ **⛔ só ⛔ se houver leitura**: ⛔ painel vazio ⛔ ainda
        * ⛔ não recomendou ⛔ nada.
        */}
      <AvisoDeApoioClinico
        variante="recomendacao"
        ha={leituras.length > 0}
        tr={tr}
        testID="avc-aviso-leituras"
      />

    </View>
  );
}

export const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    grupo: { gap: ESPACO.xs },
    /** ⚠️ ⛔ A caixa de *"Outros"* — 2026-09-09. ⛔ Ela **⛔ é** um campo, ⛔ e parece. */
    outrosCaixa: {
      ...PAPEL.textoPrincipal,
      color: tema.cores.text,
      backgroundColor: tema.cores.bg,
      borderWidth: 2,
      borderColor: tema.cores.controlBorder,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.sm,
      minHeight: TOQUE.minimo,
    },
    corPlaceholderOutros: { color: tema.cores.textSecondary },
    /**
     * ⚠️ O TÍTULO DE BLOCO DEIXOU DE SER LEGENDA. Faixa com a cor da área, barra
     * de accent e tipo maior: o degrau de hierarquia que a varredura precisa.
     */
    /**
     * ⚠️⚠️ A BARRA ROXA PREENCHIDA SAIU EM 2026-09-05 (PD-37) — ⛔ e a captura de
     * Reperfusão é que a condenou.
     *
     * ⛔ Cada bloco vinha dentro de uma faixa **roxa cheia**, em caixa alta, com
     * uma barrinha de acento: numa tela com seis blocos, isso dá **seis pesos
     * iguais** ⛔ e ⛔ nenhuma hierarquia — a dose que vai na veia competia com
     * *"O que falta colher"*.
     *
     * ⚠️ Agora é **texto ⛔ e espaço**, igual ao `SectionTitle` do sistema
     * congelado. ⛔ A hierarquia vem do papel tipográfico, ⛔ e ⛔ não de pintar a
     * largura da tela. ⚠️ Mudar aqui propaga para **todas** as superfícies de
     * uma vez — que é exatamente o ponto de haver um sistema.
     */
    blocoCabecalho: {
      flexDirection: "row", alignItems: "center", gap: ESPACO.sm,
      marginTop: ESPACO.md,
    },
    /** ⛔ Sem barra de acento: ⛔ não há mais faixa em que ela se apoie. */
    blocoBarra: { width: 0, height: 0 },
    /**
     * ⚠️⚠️ ⛔ O SELO ⛔ NÃO É A BARRA DE ACENTO QUE SAIU DAQUI.
     *
     * ⛔ A barra era uma **faixa vertical** que precisava de uma faixa em que se
     * apoiar, ⛔ e ⛔ ela ⛔ não tinha mais. ⚠️ O selo é **quadrado ⛔ e carrega
     * ícone**: ⛔ ele ⛔ não depende de faixa ⛔ nenhuma, ⛔ e ⛔ diz **de que
     * assunto é o bloco** — ⛔ que é informação, ⛔ e ⛔ não acabamento.
     */
    blocoSelo: {
      width: 26,
      height: 26,
      borderRadius: RAIO.botao,
      alignItems: "center",
      justifyContent: "center",
    },
    blocoTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text, flex: 1 },
    /** ⚠️ Só quem abre ganha moldura — ⛔ e é a moldura que convida o toque. */
    /**
     * ⚠️⚠️ ⛔ `surface` SOBRE `bg` MEDE **1,2:1** — ⛔ e ⛔ é por isso que o autor
     * continuou lendo estes cabeçalhos como texto depois da correção anterior.
     * ⚠️ A moldura existia no arquivo ⛔ e ⛔ quase ⛔ não existia na tela.
     */
    blocoCabecalhoAbrivel: {
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      minHeight: TOQUE.minimo,
      alignItems: "center",
    },
    /** ⚠️ Palavra + seta: ⛔ nem a forma ⛔ nem a cor carregam o estado sozinhas (E-39). */
    blocoEstado: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    grupoTitulo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "700", letterSpacing: 1, marginTop: ESPACO.xs,
    },

    /**
     * ⚠️⚠️ O CAMPO SOBE UM DEGRAU — 2026-09-06.
     *
     * ⛔ Relato do autor: *"tudo misturado, tudo com o mesmo padrão de cores,
     * ⛔ sem destaques"*. ⚠️ A causa: o campo usava `bg` — **o mesmo fundo da
     * tela** — ⛔ e as opções dentro dele usavam `surface`. ⛔ Resultado: campo,
     * opção ⛔ e fundo eram três tons quase idênticos, ⛔ e a única separação
     * era um contorno cinza.
     *
     * ⚠️ Agora: tela `bg` → campo `surface` → opção `surfaceElevated`. ⛔ Cada
     * degrau se separa **pelo fundo**, ⛔ e ⛔ não por linha.
     */
    campo: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.card,
      padding: ESPACO.md, gap: ESPACO.xs,
      borderWidth: 1, borderColor: tema.cores.border,
      // ⚠️ A borda esquerda é o trilho de estado: neutra enquanto ninguém
      // respondeu, com a cor da área depois. ⛔ Largura constante, para o texto
      // ⛔ não dançar quando o campo é respondido.
      borderLeftWidth: 4, borderLeftColor: tema.cores.border,
    },
    /** ⚠️ Respondido: **verde**, ⛔ e ⛔ não o roxo da área. ⚠️ É estado, ⛔ não marca. */
    campoRespondido: { borderLeftColor: tema.cores.success },
    /**
     * ⚠️ `flex-start`, ⛔ não `center`: com rótulo de quatro linhas — e os da
     * Table 4 têm —, a marca centralizada flutua no MEIO do texto e lê-se como
     * marcador de lista, ⛔ não como estado do campo. Medido no celular, 2026-08-29.
     */
    campoTopo: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.xs },
    campoRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flex: 1, fontWeight: "600" },
    /** ⚠️ Alinhado ao rótulo e sem alvo de toque: é informação, ⛔ não controle. */
    marca: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize,
      width: 16, textAlign: "center",
      // ⚠️ Acompanha a primeira linha do rótulo, ⛔ não o centro do bloco.
      lineHeight: TIPOGRAFIA.body.fontSize * 1.5,
    },
    /** ⚠️ Respondido: mesma cor do trilho — ⛔ o olho liga os dois. */
    marcaAtiva: { color: tema.cores.success, fontWeight: "800" },
    campoAjuda: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    /** ⚠️ Tipografia de VALOR: quem lê está conferindo um resultado, ⛔ não escaneando. */
    valorEmLeitura: {
      color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700",
      paddingVertical: ESPACO.sm,
    },
    /** ⚠️ Diz o que está acontecendo ANTES de o médico digitar, e ⛔ não depois. */
    avisoDeCorrecao: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      paddingBottom: ESPACO.sm,
    },
    /** ⚠️ Ver o comentário no cartão de leitura: alternativas, ⛔ não uma lista. */
    parDeGestos: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    botaoSecundario: {
      minHeight: TOQUE.minimo, justifyContent: "center", alignSelf: "flex-start",
      paddingHorizontal: ESPACO.md, marginTop: ESPACO.sm,
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.controlBorder,
    },
    textoSecundario: {
      color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700",
    },
    /**
     * ⚠️ Um degrau ACIMA da ajuda: a definição é o que destrava a resposta de
     * quem ⛔ não lembra o termo, e ⛔ não pode ficar do tamanho de rodapé.
     */
    campoDefinicao: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    // ── controle de hora ────────────────────────────────────────────────
    /**
     * ⚠️⚠️ ⛔ O RECUO É QUEM DIZ *"isto pertence ao relógio acima"* — ⛔ e ⛔ é a
     * mesma medida que a Superfície A usava, ⛔ trazida junto com o ramo.
     *
     * ⛔ `marginTop` POSITIVO: a versão com `-ESPACO.xs` era inofensiva
     * ⛔ enquanto a sub-linha era texto, ⛔ e virou **sobreposição** ⛔ assim que
     * ⛔ ela ganhou corpo de botão (relato do autor, 2026-09-06).
     */
    subLinhaDoMarco: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      paddingLeft: ESPACO.md,
      marginTop: ESPACO.xs,
      marginBottom: ESPACO.sm,
    },
    relogioLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs, minHeight: TOQUE.minimo },
    relogioRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flex: 1, minWidth: 120 },
    // ⚠️ `flexShrink` no VALOR e não no rótulo: entre encurtar "não informado"
    // e encurtar o nome do marco, quem cede é o texto genérico.
    relogioValor: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600", flexShrink: 1 },
    relogioAcoes: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    relogioAcaoAtiva: { backgroundColor: tema.cores.primary, borderColor: tema.cores.primary },
    relogioAcaoAtivaTexto: { color: tema.cores.onPrimary, fontWeight: "700" },
    /** ⚠️ Marco já informado fica com a borda da identidade — ⛔ sem depender só dela. */
    relogioAcaoInformada: { borderColor: tema.cores.primary },
    relogioAcao: {
      minHeight: TOQUE.minimo, justifyContent: "center",
      paddingHorizontal: ESPACO.md, paddingVertical: ESPACO.sm,
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.controlBorder,
    },
    numericoLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
    passoNumerico: {
      minWidth: TOQUE.minimo, minHeight: TOQUE.minimo,
      alignItems: "center", justifyContent: "center",
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.controlBorder,
    },
    entradaNumerica: {
      flexGrow: 1, minWidth: 90,
      color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700",
      textAlign: "center",
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
      minHeight: TOQUE.minimo, paddingHorizontal: ESPACO.sm,
    },
    /** ⚠️ Ver o comentário no `TextInput`: prosa, e ⛔ não número. */
    entradaNumericaVazia: {
      fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600",
    },
    unidade: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    entradaDeTexto: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      paddingHorizontal: ESPACO.sm,
      minHeight: TOQUE.minimo,
    },
    /** ⚠️ Procedência do valor — ⛔ não é ajuda clínica, é rastreabilidade (E-03). */
    origem: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize, fontStyle: "italic" },

    // ⚠️ Alvo mínimo de toque mesmo sendo um glifo pequeno (§7.18).
    /** ⚠️ ⛔ O ⓘ ⛔ também é botão: ⛔ sem moldura ⛔ ele some no meio do rótulo. */
    info: {
      minWidth: 26,
      minHeight: 26,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.badge,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    infoTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    detalhe: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: 2,
    },
    detalheTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    opcoes: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    /**
     * ⚠️ BORDA E TAMANHO ⛔ NÃO SÃO ESTÉTICA. Sem borda, o "botão" era um
     * retângulo quase da cor do cartão, e o autor relatou ter de procurar onde
     * clicar. A borda declara a área tocável ANTES do toque; o `minWidth` faz
     * "Sim" e "Não" terem alvo de dedo, ⛔ não de mouse.
     */
    /**
     * ⚠️ MEDIDO EM 375 px (2026-08-29): com `minWidth: 92` e padding `md`, o
     * trio Sim/Não/Incerto quebrava em duas linhas e "Incerto" descia sozinho —
     * ~100 px desperdiçados em CADA um dos onze achados, quase três telas de
     * rolagem só nisso.
     *
     * ⚠️ O alvo de toque ⛔ não encolheu: a ALTURA continua em `TOQUE.minimo`, que
     * é o que a regra de 44 px governa. O que cedeu foi largura ociosa.
     */
    /**
     * ⚠️⚠️ `maxWidth` E `flexShrink` — achados na revisão visual de 2026-08-30.
     *
     * Sem eles, uma opção mais larga que o cartão **transbordava e era cortada**:
     * *"Varfarina ou outro antagonista da vit…"* e *"Heparina ou heparina de
     * baixo peso…"* chegavam truncadas ao olho, num campo que governa a regra do
     * coagulograma. ⚠️ Rótulo cortado ⛔ não é estética: *"antagonista da vitamina
     * K"* e *"antagonista da vit"* ⛔ não são a mesma informação para quem lê com
     * pressa.
     */
    opcao: {
      paddingVertical: ESPACO.sm, paddingHorizontal: ESPACO.sm,
      minHeight: TOQUE.minimo, minWidth: 76,
      justifyContent: "center", alignItems: "center",
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 1, borderColor: tema.cores.controlBorder,
      maxWidth: "100%",
    },
    abrirEscolha: {
      alignSelf: "flex-start", minHeight: TOQUE.minimo, justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.controlBorder,
    },
    abrirEscolhaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    opcoesEmpilhadas: { flexDirection: "column" },
    opcaoLarga: { alignSelf: "stretch", alignItems: "flex-start" },
    opcaoAtiva: { backgroundColor: tema.cores.primaryFill, borderColor: tema.cores.primaryFill },
    opcaoTexto: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "600",
      /** ⚠️ Deixa o texto QUEBRAR em vez de estourar o cartão. */
      flexShrink: 1,
    },
    opcaoTextoAtivo: { color: tema.cores.onFill, fontWeight: "700" },
    /**
     * ⚠️⚠️ *"⛔ NÃO SEI"* ⛔ NÃO É UMA RESPOSTA CLÍNICA — ⛔ e ⛔ não pode parecer
     * uma. ⚠️ Ele é **ignorância declarada**, ⛔ e o núcleo já o separa
     * (`nao_sei`): ⛔ o que faltava era a tela separar também.
     *
     * ⛔ Com a mesma forma das outras, *"⛔ Não sei"* competia visualmente com
     * *"Varfarina"* ⛔ e *"Heparina"* — ⛔ e um dos três ⛔ não é um achado.
     */
    opcaoNaoSei: {
      backgroundColor: "transparent",
      borderStyle: "dashed",
      borderColor: tema.cores.border,
    },
    opcaoTextoNaoSei: { color: tema.cores.textSecondary },

    /**
     * ⚠️⚠️ A DECISÃO BINÁRIA OCUPA A LARGURA — ⛔ e ⛔ não um canto da linha.
     *
     * ⛔ Na captura de 2026-09-06, *"Sim | Não | Incerto"* apareciam em três
     * caixinhas espremidas à direita, com o enunciado clínico numa coluna
     * estreita à esquerda. ⚠️ Nas referências a pergunta é **cheia** ⛔ e as
     * respostas são blocos de 56 px embaixo dela.
     */
    opcoesDecisao: { alignSelf: "stretch", flexWrap: "nowrap" },
    opcaoDecisao: {
      flex: 1,
      minWidth: 0,
      minHeight: TOQUE.critico,
      borderWidth: 0,
      paddingHorizontal: ESPACO.xs,
    },
    opcaoSim: { backgroundColor: tema.cores.successFill },
    opcaoNao: { backgroundColor: tema.cores.criticalFill },
    /** ⚠️ *"Incerto"* ⛔ não é uma terceira cor: ⛔ é ausência de resposta. */
    opcaoNeutra: {
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    /** ⚠️ Escolhida ganha **anel**, ⛔ e ⛔ não outra cor. */
    opcaoMarcada: { borderWidth: 2, borderColor: tema.cores.text },
    opcaoTextoPreenchido: { color: tema.cores.onFill },

    /** ⚠️ Neutraliza o `flexBasis: "100%"` do wrapper, que em coluna vira altura. */
    stepper: { flexGrow: 0, flexBasis: "auto", alignSelf: "stretch" },
    degraus: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    degrau: {
      minHeight: TOQUE.minimo, minWidth: 72,
      justifyContent: "center", alignItems: "center",
      paddingHorizontal: ESPACO.sm,
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.controlBorder,
    },
    degrauTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700" },
    /** ⚠️ Desabilitado se vê, ⛔ não some: botão que aparece e desaparece muda o alvo debaixo do dedo. */
    degrauInerte: { opacity: 0.35 },

    zero: {
      alignSelf: "flex-start", minHeight: TOQUE.minimo, justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.controlBorder,
    },
    zeroTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },

    leitura: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.sm, gap: 2,
      borderLeftWidth: 3, borderLeftColor: tema.cores.border,
    },
    leituraLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    /**
     * ⚠️ A COR É REFORÇO, ⛔ NUNCA O PORTADOR DO SIGNIFICADO (E-39) — o símbolo
     * já diz tudo sozinho, e é ele que sobrevive ao daltonismo e ao brilho de
     * uma tela ao sol.
     */
    atencao: { borderLeftColor: tema.cores.warning },
    pendente: { borderLeftColor: tema.cores.textSecondary },
    informativo: { borderLeftColor: tema.cores.border },
    leituraTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flex: 1 },
    leituraFraca: { color: tema.cores.textSecondary },
  });
