/**
 * CAMPO DE ESCALA — o instrumento aberto e preenchido item a item.
 *
 * ── O PEDIDO QUE ORIGINOU (autor, 2026-08-29) ──────────────────────────────
 *
 * *"Essa escala o usuário não sabe, tem que ser clicável para abrir e
 * preencher."* Pedir o TOTAL pressupõe que alguém o calculou noutro lugar — e
 * no plantão isso significa ou não preencher, ou chutar.
 *
 * ⚠️⚠️ A DEFINIÇÃO DOS ITENS ⛔ NÃO NASCE AQUI. Ela vem da calculadora, com fonte
 * (Brott 1989 + adaptação brasileira de Pontes-Neto), via `avc/conteudo/nihss`.
 * Esta camada só desenha (E-29) — e ⛔ não conhece um único corte clínico.
 *
 * ⚠️⚠️ O `help` DA ESCALA FICA ATRÁS DO ⓘ DO ITEM (2026-08-29) — relato do
 * autor: *"no NIHSS ainda tem explicações confusas"*.
 *
 * ── O QUE ESTAVA EMPILHADO EM CADA ITEM ────────────────────────────────────
 *
 *   1. o rótulo, às vezes abreviado ("NC — perguntas");
 *   2. a linha de COMO TESTAR, que eu acrescentei;
 *   3. o `help` da calculadora — regra de PONTUAÇÃO, em taquigrafia com setas
 *      ("Afasia ou estupor que impede compreender as perguntas → 2").
 *
 * Duas linhas secundárias seguidas, uma delas dizendo quase o mesmo que a outra
 * (em 5a, "manter o braço por 10 s" e "Braço a 90° sentado… por 10 s"), e a
 * terceira falando de PONTOS quando o médico ainda está tentando entender o que
 * medir. ⛔ Isso ⛔ não é explicar: é competir consigo mesmo.
 *
 * ⚠️ AGORA: visível fica **como se testa**; a regra de pontuação fica a um toque,
 * no ⓘ do próprio item. ⛔ Ela ⛔ não sumiu — e ⛔ não podia sumir: "coma pontua 2 na
 * sensibilidade e 3 na linguagem" muda o total, e ⛔ ninguém adivinha pelo rótulo.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Campo } from "../../avc/conteudo/campo";
import { ITENS_NIHSS } from "../../avc/conteudo/nihss";
import { comoAvaliarItem, oQueAvaliaItem } from "../../avc/conteudo/explicacoes";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { BotaoDeInfo, DetalheDoCampo } from "./campos-clinicos";

type Props = {
  campo: Campo;
  /** O total já registrado, venha da escala ou de fora dela. */
  total: number | undefined;
  /** A pontuação por item já registrada. ⚠️ Vazio ⛔ não é zero. */
  pontos: Readonly<Record<string, number>>;
  detalheAberto: boolean;
  onAlternarDetalhe: () => void;
  /** Grava a escala inteira: um fato por item, mais o total. */
  onRegistrarEscala: (pontos: Record<string, number>, total: number) => void;
  onDesfazer: (campo: string) => void;
  /**
   * ⚠️⚠️ O SEGUNDO CAMINHO — pedido do autor em 2026-09-06: *"tem que deixar
   * opção de colocar o valor ⛔ ou expandir ⛔ e marcar um a um com os detalhes
   * para o usuário pouco experiente saber o que é cada um dos itens"*.
   *
   * ⚠️ ⛔ Os dois caminhos **já existiam** — a escala aqui, ⛔ e o total trazido
   * de fora no bloco *"NIHSS trazido de fora"*. ⛔ O que ⛔ não existia era a
   * **escolha visível**: os dois blocos ficavam separados na tela, ⛔ e quem
   * chegava com o escore na mão ⛔ não descobria onde informá-lo.
   *
   * ⚠️⚠️ ⛔ E ELES ⛔ CONTINUAM SENDO ⛔ DUAS ENTIDADES, ⛔ e ⛔ isso ⛔ não é
   * burocracia: o escore que **este** serviço mediu ⛔ e o que chegou pela
   * regulação têm **procedência diferente**, ⛔ e a procedência muda a confiança
   * ⛔ sem mudar o número (**E-03**). ⛔ Fundi-los num campo só apagaria de onde
   * veio o 14.
   */
  aoInformarTotal?: () => void;
};

export default function CampoDeEscala({
  campo,
  total,
  pontos,
  detalheAberto,
  onAlternarDetalhe,
  onRegistrarEscala,
  onDesfazer,
  aoInformarTotal,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const [aberta, setAberta] = useState(false);
  /**
   * ⚠️ RASCUNHO: a escala inteira é um gesto só. Gravar item a item encheria a
   * trilha de estados intermediários de um exame que ainda está acontecendo —
   * e o total de um NIHSS pela metade ⛔ não é um NIHSS.
   */
  const [rascunho, setRascunho] = useState<Record<string, number>>({});
  /** Quais regras de pontuação estão abertas. ⚠️ Fechadas por padrão. */
  const [regrasAbertas, setRegrasAbertas] = useState<readonly string[]>([]);
  /**
   * ⚠️⚠️ MODO FOCO — um item por vez (PD-37).
   *
   * ⛔ Os quinze itens juntos transformavam a escala num formulário: o médico
   * lia rótulo, manobra ⛔ e regra de pontuação de quinze coisas ao mesmo tempo,
   * ⛔ e a pergunta que ele precisa responder — *o que este paciente faz?* —
   * ficava perdida no meio.
   *
   * ⚠️⚠️ ⛔ ISTO ⛔ NÃO É UM WIZARD DO AVC. A sequência existe **dentro da
   * escala**, ⛔ que tem ordem de exame própria (**Brott 1989**); o módulo
   * continua livre — o médico sai daqui, abre outra fase ⛔ e volta, ⛔ e ⛔ nada
   * trava (**E-11**).
   *
   * ⚠️⚠️ ⛔ E ⛔ NÃO MUDA A SEMÂNTICA: a ordem dos itens, os critérios, os valores,
   * o rascunho ⛔ e a gravação em **gesto único** continuam idênticos. Muda
   * ⛔ apenas **quantos itens a tela mostra por vez**.
   */
  const [foco, setFoco] = useState(0);
  /** ⚠️ A revisão: a lista inteira, para conferir ⛔ ou corrigir qualquer item. */
  const [verTodos, setVerTodos] = useState(false);

  const emEdicao = { ...pontos, ...rascunho };
  const respondidos = ITENS_NIHSS.filter((v) => emEdicao[v.id] !== undefined).length;
  const completa = respondidos === ITENS_NIHSS.length;
  const parcial = ITENS_NIHSS.reduce((s, v) => s + (emEdicao[v.id] ?? 0), 0);

  return (
    <View style={[e.campo, total !== undefined && e.campoRespondido]} testID={`avc-campo-${campo.id}`}>
      <View style={e.topo}>
        <Text style={[e.marca, total !== undefined && e.marcaAtiva]} accessibilityElementsHidden>
          {total !== undefined ? "✓" : "○"}
        </Text>
        <Text style={e.rotulo}>{tr(campo.rotulo)}</Text>
        <BotaoDeInfo id={campo.id} onPress={onAlternarDetalhe} />
      </View>

      {detalheAberto ? <DetalheDoCampo campo={campo} /> : null}

      <View style={e.linhaDoValor}>
        <Text style={[e.valor, total === undefined && e.valorAusente]} testID={`avc-escala-valor-${campo.id}`}>
          {total === undefined ? tr("não informado") : String(total)}
        </Text>
        <Pressable
          style={[e.acao, e.acaoPrincipal]}
          accessibilityRole="button"
          testID={`avc-escala-abrir-${campo.id}`}
          onPress={() => setAberta((v) => !v)}
        >
          <Text style={[e.acaoTexto, e.acaoTextoPrincipal]}>
            {aberta
              ? tr("Fechar escala")
              : total === undefined
                ? tr("Avaliar item a item")
                : tr("Refazer escala")}
          </Text>
        </Pressable>
        {total !== undefined ? (
          <Pressable
            style={e.acao}
            accessibilityRole="button"
            testID={`avc-limpar-${campo.id}`}
            onPress={() => {
              setRascunho({});
              onDesfazer(campo.id);
            }}
          >
            <Text style={e.acaoTexto}>{tr("Limpar")}</Text>
          </Pressable>
        ) : null}
      </View>

      {/**
        * ⚠️⚠️ A ALTERNATIVA DECLARADA, ⛔ e ⛔ não escondida num bloco recolhido
        * lá embaixo. ⚠️ *"Já tenho o total"* é o caminho de quem chegou com o
        * escore medido por outro serviço — ⛔ e ele precisa ser **oferecido no
        * mesmo lugar** em que a escala é oferecida.
        *
        * ⛔ Ela some quando a escala já foi feita: aí ⛔ não há escolha a fazer.
        */}
      {aoInformarTotal && total === undefined && !aberta ? (
        <Pressable
          style={e.alternativa}
          accessibilityRole="button"
          testID={`avc-escala-informar-total-${campo.id}`}
          onPress={aoInformarTotal}
        >
          <Text style={e.alternativaTexto}>
            {tr("Já tenho o total, medido em outro serviço")}
          </Text>
        </Pressable>
      ) : null}

      {aberta ? (
        <View style={e.escala} testID={`avc-escala-${campo.id}`}>
          {/**
            * ⚠️⚠️ O CROMADO DA ESCALA — progresso ⛔ e a porta da revisão.
            *
            * ⚠️ O progresso diz **onde estou na escala**, ⛔ e ⛔ não "quanto
            * falta para liberar algo": ⛔ nada é liberado por completar o NIHSS.
            */}
          <View style={e.escalaTopo}>
            <Text style={e.escalaProgresso} testID={`avc-escala-progresso-${campo.id}`}>
              {verTodos
                ? tr("Todos os itens")
                : `${tr("Item")} ${foco + 1} ${tr("de")} ${ITENS_NIHSS.length}`}
            </Text>
            <Pressable
              style={e.escalaRevisar}
              accessibilityRole="button"
              testID={`avc-escala-ver-todos-${campo.id}`}
              onPress={() => setVerTodos((v) => !v)}
            >
              <Text style={e.acaoTexto}>
                {verTodos ? tr("Voltar ao item") : tr("Ver todos")}
              </Text>
            </Pressable>
          </View>

          {(verTodos ? ITENS_NIHSS : [ITENS_NIHSS[foco]]).map((item) => (
            <View key={item.id} style={e.item} testID={`avc-escala-item-${item.id}`}>
              <View style={e.itemTopo}>
                <Text style={e.itemRotulo}>{tr(item.label)}</Text>
                {item.help ? (
                  <Pressable
                    style={e.itemInfo}
                    accessibilityRole="button"
                    aria-expanded={regrasAbertas.includes(item.id)}
                    accessibilityLabel={tr("Regra de pontuação")}
                    testID={`avc-regra-abrir-${item.id}`}
                    onPress={() =>
                      setRegrasAbertas((r) =>
                        r.includes(item.id) ? r.filter((x) => x !== item.id) : [...r, item.id]
                      )
                    }
                  >
                    <Text style={e.itemInfoTexto}>ⓘ</Text>
                  </Pressable>
                ) : null}
              </View>
              {/**
                * ⚠️ O QUE O ITEM AVALIA — vem ANTES da manobra, porque quem ⛔ não
                * usa a escala todo dia precisa saber o que está medindo antes de
                * saber como medir.
                */}
              {oQueAvaliaItem(item.id) ? (
                <Text style={e.itemOQueAvalia} testID={`avc-o-que-avalia-${item.id}`}>
                  {tr(oQueAvaliaItem(item.id) as string)}
                </Text>
              ) : null}
              {/**
                * ⚠️ COMO SE TESTA, numa linha — das instruções da própria escala.
                * ⚠️ Fica em texto secundário de propósito: a escala já tem 15
                * itens, e explicação em corpo grande devolveria a rolagem que a
                * revisão visual acabou de tirar.
                */}
              {comoAvaliarItem(item.id) ? (
                <Text style={e.itemComoAvaliar} testID={`avc-como-avaliar-${item.id}`}>
                  {tr(comoAvaliarItem(item.id) as string)}
                </Text>
              ) : null}
              {item.help && regrasAbertas.includes(item.id) ? (
                <Text style={e.itemAjuda} testID={`avc-regra-${item.id}`}>
                  {tr(item.help)}
                </Text>
              ) : null}
              <View style={e.opcoes}>
                {item.options.map((o) => {
                  const ativa = emEdicao[item.id] === o.points;
                  return (
                    <Pressable
                      key={o.label}
                      style={[e.opcao, ativa && e.opcaoAtiva]}
                      accessibilityRole="radio"
                      aria-checked={ativa}
                      testID={`avc-escala-opcao-${item.id}-${o.points}`}
                      onPress={() => {
                        setRascunho((r) => ({ ...r, [item.id]: o.points }));
                        /**
                         * ⚠️ AVANÇO NATURAL — ⛔ e ⛔ só no modo foco. ⚠️ No último
                         * item ⛔ não avança: ⛔ não há para onde, ⛔ e pular para o
                         * rodapé esconderia a resposta que acabou de ser dada.
                         */
                        if (!verTodos && foco < ITENS_NIHSS.length - 1) {
                          setFoco((i) => i + 1);
                        }
                      }}
                    >
                      {/**
                        * ⚠️⚠️ A DESCRIÇÃO CLÍNICA VEM PRIMEIRO, ⛔ e o número
                        * **em segundo plano** (autor, 2026-09-05).
                        *
                        * ⛔ Antes era `rótulo · pontos` na mesma linha ⛔ e no
                        * mesmo peso: o médico escolhia **o número da escala**.
                        * ⚠️ Ele precisa pensar *"o que o paciente faz?"* — o
                        * ponto é **consequência**, ⛔ e ⛔ não a pergunta.
                        *
                        * ⛔ O valor gravado ⛔ NÃO mudou: continua `o.points`.
                        */}
                      <Text style={[e.opcaoTexto, ativa && e.opcaoTextoAtivo]}>
                        {ativa ? "✓ " : ""}
                        {tr(o.label)}
                      </Text>
                      <Text style={[e.opcaoPonto, ativa && e.opcaoPontoAtivo]}>{o.points}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {/**
            * ⚠️ VOLTAR AO ITEM ANTERIOR — ⛔ só no modo foco, ⛔ e ⛔ só quando há
            * anterior. ⚠️ Rever ⛔ não apaga: o rascunho guarda o que já foi
            * respondido, ⛔ e a opção marcada continua marcada.
            */}
          {!verTodos && foco > 0 ? (
            <Pressable
              style={e.escalaRevisar}
              accessibilityRole="button"
              testID={`avc-escala-anterior-${campo.id}`}
              onPress={() => setFoco((i) => Math.max(0, i - 1))}
            >
              <Text style={e.acaoTexto}>‹ {tr("Item anterior")}</Text>
            </Pressable>
          ) : null}

          <View style={e.rodape}>
            {/**
              * ⚠️ O PARCIAL ⛔ NÃO É O TOTAL, e a tela diz isso: enquanto faltar
              * item, o número é soma do que foi respondido — ⛔ não o escore do
              * paciente. Chamá-lo de NIHSS aqui seria o mesmo defeito da barra
              * que parece medida antes de alguém medir (§0.2).
              */}
            <Text style={e.parcial} testID={`avc-escala-parcial-${campo.id}`}>
              {completa ? tr("Total") : tr("Soma parcial")}: {parcial} · {respondidos}/{ITENS_NIHSS.length}
            </Text>
            <Pressable
              style={[e.confirmar, !completa && e.confirmarInativo]}
              accessibilityRole="button"
              aria-disabled={!completa}
              disabled={!completa}
              testID={`avc-escala-confirmar-${campo.id}`}
              onPress={() => {
                onRegistrarEscala(emEdicao, parcial);
                setRascunho({});
                setAberta(false);
              }}
            >
              <Text style={[e.confirmarTexto, !completa && e.confirmarTextoInativo]}>
                {completa
                  ? tr("Confirmar escala")
                  /**
                   * ⚠️⚠️ BLOQUEIO QUE **DIZ O QUE FALTA** (**E-26**).
                   *
                   * ⛔ Antes o botão ⛔ só ficava apagado — ⛔ e apagado ⛔ não
                   * explica. ⚠️ *"Faltam 12 itens"* diz **o que destrava**, ⛔ e
                   * ⛔ é a diferença entre um bloqueio ⛔ e um muro.
                   */
                  : (() => {
                      /**
                       * ⚠️ Plural — ⛔ *"Faltam 1 itens"* era o que saía com um
                       * item restante. ⛔ Concordância errada numa tela clínica
                       * ⛔ não é detalhe: ⛔ ela ensina a ⛔ não confiar no texto.
                       */
                      const faltam = ITENS_NIHSS.length - respondidos;
                      return faltam === 1
                        ? `${tr("Falta")} 1 ${tr("item")}`
                        : `${tr("Faltam")} ${faltam} ${tr("itens")}`;
                    })()}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    /**
     * ⚠️⚠️ ESTILOS REESCRITOS EM 2026-09-06 — ⛔ relato do autor sobre a escala
     * aberta: *"tudo misturado por cor, tudo igual"*.
     *
     * ⛔ A causa era estrutural: as opções usavam `bg` (quase-preto) **dentro**
     * de um card `surface`. ⚠️ Elas liam como **buracos**, ⛔ e ⛔ não como
     * botões — ⛔ e as três ficavam idênticas, porque a única diferença era um
     * contorno cinza.
     *
     * ⚠️ Agora a pilha de superfícies sobe: card `surface` → item
     * `surfaceElevated` → opção `surface` com contorno. ⛔ Cada degrau se
     * separa do anterior **pelo fundo**, ⛔ e ⛔ não por linha.
     */
    campo: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.card,
      padding: ESPACO.md,
      gap: ESPACO.sm,
      borderWidth: 1,
      borderColor: tema.cores.border,
    },
    /** ⚠️ Já respondida: contorno de ação, ⛔ e ⛔ não faixa lateral solta. */
    campoRespondido: { borderColor: tema.cores.primary },
    topo: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
    marca: { ...PAPEL.tituloDeSecao, color: tema.cores.textSecondary, width: 18, textAlign: "center" },
    marcaAtiva: { color: tema.cores.success },
    rotulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text, flex: 1 },

    linhaDoValor: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: ESPACO.sm },
    valor: { ...PAPEL.metrica, color: tema.cores.text, minWidth: 40 },
    valorAusente: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary, fontStyle: "italic" },
    acao: {
      minHeight: TOQUE.minimo, justifyContent: "center", paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 1, borderColor: tema.cores.controlBorder,
    },
    acaoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    /** ⚠️ O caminho principal é **preenchido**; a alternativa é texto. */
    acaoPrincipal: { backgroundColor: tema.cores.primaryFill, borderColor: tema.cores.primaryFill },
    acaoTextoPrincipal: { color: tema.cores.onFill },
    /**
     * ⚠️⚠️ ⛔ TUDO QUE SE TOCA GANHA CORPO, BORDA ⛔ E ALTURA — 2026-09-06.
     *
     * ⛔ Isto era **texto azul solto**. ⚠️ *"Já tenho o total"* é uma das duas
     * portas da escala: quem chega com o NIHSS medido fora ⛔ e ⛔ não vê a
     * porta refaz a escala inteira ⛔ ou desiste dela.
     */
    alternativa: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.primaryTint,
      borderWidth: 1.5,
      borderColor: tema.cores.primary,
    },
    alternativaTexto: { ...PAPEL.textoSecundario, color: tema.cores.primary },

    escala: { gap: ESPACO.sm, marginTop: ESPACO.xs },
    /** ⚠️ O 2º degrau — o item se separa do card **pelo fundo**. */
    item: {
      backgroundColor: tema.cores.surfaceElevated,
      borderRadius: RAIO.botao,
      padding: ESPACO.md,
      gap: ESPACO.xs,
    },
    itemTopo: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.sm },
    itemRotulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text, flex: 1 },
    itemInfo: {
      minWidth: TOQUE.minimo, minHeight: TOQUE.minimo,
      alignItems: "center", justifyContent: "center",
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    itemInfoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.textSecondary },
    itemAjuda: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    itemComoAvaliar: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    /** ⚠️ Um degrau acima da manobra: é o que destrava quem ⛔ não conhece o item. */
    itemOQueAvalia: { ...PAPEL.textoPrincipal, color: tema.cores.text },

    opcoes: { gap: ESPACO.sm, paddingTop: ESPACO.xs },
    /**
     * ⚠️⚠️ UMA OPÇÃO POR LINHA, ⛔ e ⛔ não três espremidas.
     *
     * ⛔ *"Paralisia parcial"* ⛔ e *"Desvio forçado"* ⛔ não cabem lado a lado
     * ⛔ sem encolher a fonte, ⛔ e **rótulo clínico ⛔ não encolhe**. ⚠️ Em
     * linha cheia o alvo também fica do tamanho do dedo.
     */
    opcao: {
      paddingVertical: ESPACO.sm, paddingHorizontal: ESPACO.md,
      minHeight: TOQUE.minimo, justifyContent: "center",
      flexDirection: "row", alignItems: "center", gap: ESPACO.sm,
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 1, borderColor: tema.cores.controlBorder,
    },
    /** ⚠️ Escolhida: **preenchida**, ⛔ e ⛔ não "um cinza um pouco diferente". */
    opcaoAtiva: { backgroundColor: tema.cores.primaryFill, borderColor: tema.cores.primaryFill },
    opcaoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text, flex: 1 },
    opcaoTextoAtivo: { color: tema.cores.onFill },
    /**
     * ⚠️⚠️ O PONTO É UM **SELO**, ⛔ e ⛔ não texto cinza de 11 px.
     *
     * ⛔ Ele estava tão apagado que as três opções liam iguais — ⛔ e o ponto é
     * a **consequência** da escolha: ⛔ ele precisa ser conferível de relance.
     * ⚠️ Continua **secundário ao rótulo**: quem se escolhe é o achado clínico,
     * ⛔ e ⛔ não o número.
     */
    opcaoPonto: {
      ...PAPEL.rotuloDeMetrica,
      color: tema.cores.textSecondary,
      minWidth: 26,
      textAlign: "center",
      overflow: "hidden",
      borderRadius: RAIO.badge,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.surfaceElevated,
      paddingVertical: 2,
    },
    opcaoPontoAtivo: {
      color: tema.cores.onFill,
      borderColor: tema.cores.onFill,
      backgroundColor: tema.cores.primaryFill,
    },

    escalaTopo: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", gap: ESPACO.sm,
    },
    escalaProgresso: { ...PAPEL.rotuloDeMetrica, color: tema.cores.textSecondary },
    /** ⚠️ *"Ver todos"* ⛔ e *"Item anterior"* são navegação — ⛔ e navegação é botão. */
    escalaRevisar: {
      minHeight: TOQUE.minimo,
      alignSelf: "flex-start",
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },

    rodape: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: ESPACO.sm },
    parcial: { ...PAPEL.textoPrincipal, color: tema.cores.text, flex: 1 },
    confirmar: {
      minHeight: TOQUE.critico, justifyContent: "center", paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.primaryFill, borderRadius: RAIO.botao,
      borderWidth: 1, borderColor: tema.cores.primaryFill,
    },
    /**
     * ⚠️⚠️ BLOQUEADO ⛔ NÃO É `opacity` — mudado em 2026-09-06.
     *
     * ⛔ `opacity: 0.35` sobre um botão azul dá um borrão que lê como **defeito
     * de renderização**, ⛔ e ⛔ não como *"ainda ⛔ não dá para confirmar"*.
     * ⚠️ Aqui ele vira contorno ⛔ sem preenchimento — ⛔ e a frase ao lado diz
     * **quantos itens faltam** (**E-26**: bloqueio ⛔ sem saída é muro).
     */
    confirmarInativo: {
      backgroundColor: "transparent",
      borderColor: tema.cores.border,
    },
    confirmarTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill },
    confirmarTextoInativo: { color: tema.cores.textSecondary },
  });
