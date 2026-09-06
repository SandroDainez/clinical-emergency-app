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
import { CAMPO_DE_ITEM, ITENS_NIHSS } from "../../avc/conteudo/nihss";
import { comoAvaliarItem, oQueAvaliaItem } from "../../avc/conteudo/explicacoes";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
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
                      <Text style={e.opcaoPonto}>{o.points}</Text>
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
              <Text style={e.confirmarTexto}>{tr("Confirmar escala")}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    campo: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: ESPACO.xs,
      borderWidth: 1, borderColor: tema.cores.border,
      borderLeftWidth: 4, borderLeftColor: tema.cores.border,
    },
    campoRespondido: { borderLeftColor: tema.cores.primary },
    topo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    marca: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize, width: 16, textAlign: "center" },
    marcaAtiva: { color: tema.cores.text, fontWeight: "800" },
    rotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flex: 1, fontWeight: "600" },

    linhaDoValor: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: ESPACO.sm },
    valor: { color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700", minWidth: 40 },
    valorAusente: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "400", fontStyle: "italic" },
    acao: {
      minHeight: TOQUE.minimo, justifyContent: "center", paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    acaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    /** ⚠️ O caminho principal é **preenchido**; a alternativa é texto. */
    acaoPrincipal: { backgroundColor: tema.cores.primaryFill, borderColor: tema.cores.primaryFill },
    acaoTextoPrincipal: { color: tema.cores.onFill },
    alternativa: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
    },
    alternativaTexto: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "600",
    },

    escala: { gap: ESPACO.sm, marginTop: ESPACO.xs },
    item: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: ESPACO.xs,
    },
    itemTopo: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.xs },
    itemRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600", flex: 1 },
    itemInfo: {
      minWidth: TOQUE.minimo, minHeight: TOQUE.minimo,
      alignItems: "center", justifyContent: "center",
    },
    itemInfoTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    itemAjuda: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    itemComoAvaliar: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    /** ⚠️ Um degrau acima da manobra: é o que destrava quem ⛔ não conhece o item. */
    itemOQueAvalia: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    opcoes: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    opcao: {
      paddingVertical: ESPACO.xs, paddingHorizontal: ESPACO.sm,
      minHeight: TOQUE.minimo, justifyContent: "center",
      flexDirection: "row", alignItems: "center", gap: ESPACO.sm,
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    opcaoAtiva: { backgroundColor: tema.cores.primary, borderColor: tema.cores.primary },
    opcaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize, flex: 1 },
    opcaoTextoAtivo: { color: tema.cores.onPrimary, fontWeight: "700" },
    /**
     * ⚠️ O PONTO EM SEGUNDO PLANO — pequeno, secundário, à direita. ⛔ Ele ⛔ não
     * some (o médico precisa poder conferir a pontuação), ⛔ mas ⛔ também ⛔ não
     * é o que se escolhe.
     */
    opcaoPonto: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "600",
    },

    escalaTopo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    },
    escalaProgresso: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "600",
    },
    escalaRevisar: { minHeight: TOQUE.minimo, justifyContent: "center" },

    rodape: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: ESPACO.sm },
    parcial: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700", flex: 1 },
    confirmar: {
      minHeight: TOQUE.minimo, justifyContent: "center", paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.primary, borderRadius: RAIO.botao,
    },
    confirmarInativo: { opacity: 0.35 },
    confirmarTexto: { color: tema.cores.onPrimary, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700" },
  });
