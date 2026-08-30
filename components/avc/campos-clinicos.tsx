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
import { opcaoDoValor, valorDaOpcao } from "../../avc/conteudo/campo";
import { alternarItem, estaSelecionado, itensSelecionados } from "../../avc/nucleo/selecao";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import { opcoesQueContam } from "../../avc/conteudo/nihss";
import { definicaoDoAchado } from "../../avc/conteudo/explicacoes";
import type { Leitura } from "../../avc/nucleo/leitura";
import { NumericStepper } from "../ui-v2/numeric-stepper";
import SeletorDeHora from "./seletor-de-hora";
import { getPalette } from "../../design-system/paleta-de-area";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
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
export function CabecalhoDeBloco({ titulo, testID }: { titulo: string; testID?: string }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={e.blocoCabecalho} testID={testID}>
      <View style={e.blocoBarra} />
      <Text style={e.blocoTitulo}>{tr(titulo).toUpperCase()}</Text>
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
      {respondido ? "✓" : "○"}
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
      <View style={[e.opcoes, empilhado && e.opcoesEmpilhadas]} accessibilityRole="radiogroup">
        {(campo.opcoes ?? []).map((op) => {
          const valor = valorDaOpcao(op);
          const ativa = escolhido === op;
          return (
            <Pressable
              key={op}
              style={[e.opcao, empilhado && e.opcaoLarga, ativa && e.opcaoAtiva]}
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
              <Text style={[e.opcaoTexto, ativa && e.opcaoTextoAtivo]}>
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
}: PropsDeCampo) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const marcados = itensSelecionados(bruto);
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
          return (
            <Pressable
              key={op}
              style={[e.opcao, ativa && e.opcaoAtiva]}
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
              <Text style={[e.opcaoTexto, ativa && e.opcaoTextoAtivo]}>
                {ativa ? "☑ " : "☐ "}
                {tr(op)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {marcados.length > 0 ? (
        <Text style={e.campoAjuda} testID={`avc-multipla-resumo-${campo.id}`}>
          {marcados.map((m) => tr(m)).join(" · ")}
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
}: {
  campo: Campo;
  gravado: number | undefined;
  detalheAberto: boolean;
  onAlternarDetalhe: () => void;
  onMedir: (campo: string, valor: number) => void;
  onDesfazer: (campo: string) => void;
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

  /**
   * ⚠️ OS DEGRAUS SAEM DA FAIXA, ⛔ nunca de uma lista escrita à mão: um campo
   * novo nasce com degraus proporcionais ao que ele mede, em vez de herdar os
   * de outro campo por descuido. O segundo degrau só aparece quando a faixa é
   * larga o bastante para justificá-lo — em SpO₂ (50 a 100) ele seria maior que
   * metade da barra.
   */
  const passos = (faixa.max - faixa.min) / faixa.passo;
  /**
   * ⚠️ O DEGRAU MAIOR ENTRA ONDE O PERCURSO É LONGO, e a conta é do dedo, ⛔ não
   * da estética: uma PAS de 198 a partir do piso da barra são **13 toques** de
   * +10, e glicemia 240 a partir de 20 são **22**. Com o degrau de 50 caem para
   * quatro e cinco, ⛔ sem tocar na barra uma vez.
   *
   * ⛔ Ele ⛔ não entra em SpO₂ nem no NIHSS: ali 50 é mais que a faixa inteira,
   * e botão que ⛔ nunca move é ruído com cara de opção.
   */
  const degraus = (passos >= 150
    ? [-faixa.passo * 50, -faixa.passo * 10, faixa.passo * 10, faixa.passo * 50]
    : [-faixa.passo * 10, faixa.passo * 10]
  ).filter((d) => Math.abs(d) < faixa.max - faixa.min);

  /**
   * ⚠️⚠️ DEGRAU QUE ⛔ NÃO MOVE ⛔ NÃO REGISTRA — e isto ⛔ não é polimento.
   *
   * Com o campo intocado o polegar está no `min`, e "−10" ali cairia de volta
   * no `min` e o gravaria: um toque para BAIXO registraria **peso 30 kg** ou
   * **glicemia 20** como se alguém tivesse medido. É o mesmo motivo pelo qual o
   * `−` do `NumericStepper` nasce desabilitado no mínimo.
   */
  const naoMove = (d: number) =>
    Math.min(faixa.max, Math.max(faixa.min, valor + d)) === valor;

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
       * ⚠️⚠️ OS DEGRAUS GRANDES — relato do autor em 2026-08-28: *"não precisa
       * ter de deslizar, não funcional"*.
       *
       * ── O DEFEITO QUE ISTO FECHA ────────────────────────────────────────
       *
       * O passo fino é 1 **por decisão clínica**: com passo 10 o médico ⛔ não
       * conseguiria registrar glicemia 55, e o valor real atravessaria o limite
       * `<60` da fonte por limitação de controle. Só que com passo 1 a PA de
       * 198 mmHg fica a 138 toques do piso da barra — e a barra, no dedo, num
       * plantão, ⛔ não é um controle preciso. O resultado prático era **arrastar
       * ou desistir**.
       *
       * Os degraus grandes ⛔ não substituem o passo fino: eles levam perto, e o
       * −/+ do `NumericStepper` acerta o número. ⚠️ E ⛔ nenhum deles é um valor
       * predeterminado — são MOVIMENTOS relativos, e por isso ⛔ não reintroduzem
       * a partida que §0.2 proíbe.
       */}
      <View style={e.degraus}>
        {degraus.map((d) => (
          <Pressable
            key={d}
            style={[e.degrau, naoMove(d) && e.degrauInerte]}
            accessibilityRole="button"
            disabled={naoMove(d)}
            accessibilityLabel={`${tr(campo.rotulo)} ${d > 0 ? tr("mais") : tr("menos")} ${Math.abs(d)}`}
            testID={`avc-degrau-${campo.id}-${d > 0 ? "mais" : "menos"}-${Math.abs(d)}`}
            onPress={() => {
              const base = rascunho ?? gravado ?? faixa.min;
              const alvo = Math.min(faixa.max, Math.max(faixa.min, base + d));
              setRascunho(undefined);
              onMedir(campo.id, alvo);
            }}
          >
            <Text style={e.degrauTexto}>
              {d > 0 ? "+" : "−"}
              {Math.abs(d)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/**
       * ⚠️⚠️ `style={e.stepper}` ⛔ NÃO É AJUSTE FINO — é o conserto de um defeito
       * de layout que ROUBA CLIQUE, encontrado pelo e2e da Superfície B em
       * 2026-08-28.
       *
       * ── O DEFEITO ───────────────────────────────────────────────────────
       *
       * O `wrapper` do `NumericStepper` declara `flexBasis: "100%"` — correto
       * onde ele nasceu, dentro de uma linha, para ocupar a largura inteira e
       * quebrar. Dentro de uma COLUNA, `flexBasis: 100%` passa a valer sobre a
       * ALTURA: o controle inchou para 250 px, ultrapassou o cartão do campo
       * (268 px medidos, conteúdo até 403 px), e o bloco seguinte passou a
       * ficar POR CIMA do que sobrou.
       *
       * ⚠️ O efeito clínico: o "Registrar 0" existia, estava visível, e ⛔ não
       * recebia o toque — o Playwright ficou 60 s tentando clicar e o texto do
       * bloco de baixo interceptando. É exatamente a queixa do autor — *"tem que
       * ficar procurando onde tem que clicar"* — com uma causa medível.
       *
       * ⛔ Consertado AQUI e ⛔ não no `NumericStepper`: lá o `flexBasis: 100%`
       * está certo para os consumidores em linha, e mudá-lo mexeria no layout
       * de todos os módulos do app sem necessidade.
       */}
      <NumericStepper
        style={e.stepper}
        valor={valor}
        min={faixa.min}
        max={faixa.max}
        passo={faixa.passo}
        unidade={campo.unidade}
        naoInformado={naoInformado}
        // ⚠️ Já traduzido: o componente é `ui-v2` puro e ⛔ não tem `tr()`.
        textoAusente={tr("não informado")}
        onChange={(v) => setRascunho(v)}
        onConfirmar={(v) => {
          setRascunho(undefined);
          onMedir(campo.id, v);
        }}
        testID={`avc-grandeza-${campo.id}`}
      />

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
  return (
    <View style={[e.campo, respondido && e.campoRespondido]} testID={`avc-campo-${campo.id}`}>
      {/**
       * ⚠️ O RÓTULO TEM A LINHA DELE, E AS AÇÕES TÊM A DELAS. Espremidos na mesma
       * linha, os nomes de marco truncavam — e os marcos existem por serem
       * DIFERENTES: truncados, viram iguais.
       */}
      <View style={e.relogioLinha}>
        <Text style={[e.marca, respondido && e.marcaAtiva]} accessibilityElementsHidden>
          {respondido ? "✓" : "○"}
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

      {editando ? (
        <SeletorDeHora
          rotulo={campo.rotulo}
          instante={editando.instante}
          // ⚠️ Qualquer movimento em hora/minuto — e o "Agora" nomeado — é
          // interação explícita. ⛔ Abrir o seletor não é.
          selecionado={editando.selecionado}
          agora={agora}
          /**
           * ⚠️⚠️ O SEGUNDO ARGUMENTO PRESERVA A SELEÇÃO em vez de forçá-la.
           *
           * Mexer no **dia** ⛔ não é escolher o horário: se "Ontem" habilitasse
           * Confirmar, o marco viraria *ontem, na hora em que a tela abriu* — o
           * "agora como default silencioso" voltando por uma porta nova.
           */
          onMudar={(i, escolheuValor) =>
            setEditando((atual) => ({
              instante: i,
              selecionado: escolheuValor || (atual?.selecionado ?? false),
            }))
          }
          onConfirmar={() => {
            /**
             * ⚠️⚠️ `campo.relogio` DESCE COMO ESTÁ, inclusive `undefined`. Um campo
             * sem relógio declarado ⛔ não define marco nenhum — e forçar um
             * genérico aqui transformaria horário de exame em janela clínica.
             */
            onHora(campo.id, editando.instante, campo.relogio);
            setEditando(null);
          }}
          onCancelar={() => setEditando(null)}
        />
      ) : null}
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
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const emprestado = campo.casa !== casaAtual;

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
      />
    ) : campo.tipo === "multipla" ? (
      <CampoDeMultipla
        campo={campo}
        bruto={bruto}
        detalheAberto={detalheAberto}
        onAlternarDetalhe={onAlternarDetalhe}
        onEscolher={onEscolher}
        onDesfazer={onDesfazer}
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

  if (!emprestado) return controle;
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
      {controle}
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
                {SIMBOLO[l.tom]} {tr(l.curto)}
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
                <Text style={e.detalheTexto}>
                  {tr("Apoio ao julgamento clínico. A decisão permanece do médico.")}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
    </View>
  );
}

export const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    grupo: { gap: ESPACO.xs },
    /**
     * ⚠️ O TÍTULO DE BLOCO DEIXOU DE SER LEGENDA. Faixa com a cor da área, barra
     * de accent e tipo maior: o degrau de hierarquia que a varredura precisa.
     */
    blocoCabecalho: {
      flexDirection: "row", alignItems: "center", gap: ESPACO.sm,
      backgroundColor: AREA_AVC.badgeBg, borderRadius: RAIO.botao,
      paddingVertical: ESPACO.sm, paddingHorizontal: ESPACO.sm,
      marginTop: ESPACO.md,
    },
    blocoBarra: {
      width: 4, alignSelf: "stretch", minHeight: 18,
      borderRadius: RAIO.badge, backgroundColor: AREA_AVC.accent,
    },
    blocoTitulo: {
      color: AREA_AVC.badgeText, fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "800", letterSpacing: 1, flex: 1,
    },
    grupoTitulo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "700", letterSpacing: 1, marginTop: ESPACO.xs,
    },

    campo: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: ESPACO.xs,
      borderWidth: 1, borderColor: tema.cores.border,
      // ⚠️ A borda esquerda é o trilho de estado: neutra enquanto ninguém
      // respondeu, com a cor da área depois. ⛔ Largura constante, para o texto
      // ⛔ não dançar quando o campo é respondido.
      borderLeftWidth: 4, borderLeftColor: tema.cores.border,
    },
    campoRespondido: { borderLeftColor: AREA_AVC.accent },
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
    marcaAtiva: { color: tema.cores.text, fontWeight: "800" },
    campoAjuda: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    /**
     * ⚠️ Um degrau ACIMA da ajuda: a definição é o que destrava a resposta de
     * quem ⛔ não lembra o termo, e ⛔ não pode ficar do tamanho de rodapé.
     */
    campoDefinicao: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    // ── controle de hora ────────────────────────────────────────────────
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
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
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
    info: { minWidth: 24, minHeight: 24, alignItems: "center", justifyContent: "center" },
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
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
      maxWidth: "100%",
    },
    abrirEscolha: {
      alignSelf: "flex-start", minHeight: TOQUE.minimo, justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    abrirEscolhaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    opcoesEmpilhadas: { flexDirection: "column" },
    opcaoLarga: { alignSelf: "stretch", alignItems: "flex-start" },
    opcaoAtiva: { backgroundColor: tema.cores.primary, borderColor: tema.cores.primary },
    opcaoTexto: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "600",
      /** ⚠️ Deixa o texto QUEBRAR em vez de estourar o cartão. */
      flexShrink: 1,
    },
    opcaoTextoAtivo: { color: tema.cores.onPrimary, fontWeight: "700" },

    /** ⚠️ Neutraliza o `flexBasis: "100%"` do wrapper, que em coluna vira altura. */
    stepper: { flexGrow: 0, flexBasis: "auto", alignSelf: "stretch" },
    degraus: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    degrau: {
      minHeight: TOQUE.minimo, minWidth: 72,
      justifyContent: "center", alignItems: "center",
      paddingHorizontal: ESPACO.sm,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    degrauTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700" },
    /** ⚠️ Desabilitado se vê, ⛔ não some: botão que aparece e desaparece muda o alvo debaixo do dedo. */
    degrauInerte: { opacity: 0.35 },

    zero: {
      alignSelf: "flex-start", minHeight: TOQUE.minimo, justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
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
