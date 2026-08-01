import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  ESPACO,
  NUMERO_TABULAR,
  RAIO,
  TIPOGRAFIA,
} from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { useMovimentoReduzido } from "../../design-system/motion";
import type { TomSemantico } from "./badge";

export type ItemDeAcompanhamento = {
  rotulo: string;
  valor: string;
  /**
   * Destaque semântico. Deve refletir um sinal que o ENGINE já calcula — nunca
   * um limiar inventado aqui. Cor de alerta em tela clínica é informação, e
   * inventá-la na camada de apresentação seria criar decisão clínica.
   */
  tom?: TomSemantico;
  /** Ocupa a linha inteira do grid (valores longos, como o estado atual). */
  largura?: "normal" | "cheia";
  /**
   * Aparece na faixa fechada. Sem isto o item só é visto ao expandir.
   * Use com parcimônia: a faixa existe para não roubar a tela da ação.
   */
  resumo?: boolean;
  /**
   * Forma CURTA para a faixa fechada — rótulo e valor.
   *
   * Na primeira versão a faixa reaproveitava o rótulo do grid e truncava:
   * "CHOQUES" virava "CHO…" e "0 doses" virava "0 d…" numa tela de 390 px.
   * Reticências num painel clínico são pior que rótulo curto: escondem
   * justamente o que identifica o número.
   */
  resumoRotulo?: string;
  resumoValor?: string;
};

export type TrackingPanelProps = {
  /** Cronômetro principal, já formatado pelo engine. */
  tempo?: { rotulo: string; valor: string; tom?: TomSemantico };
  itens: ItemDeAcompanhamento[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Painel de acompanhamento.
 *
 * ── POR QUE ELE ENCOLHEU ─────────────────────────────────────────────────────
 *
 * A versão anterior era um cartão alto: cronômetro grande, estado atual em
 * linha própria, três colunas de contadores e mais uma linha de via aérea. Numa
 * tela de celular isso empurrava o botão de ação para baixo da dobra — e o
 * usuário relatou exatamente isso: "está roubando muito a área de maior
 * interesse do app, o que desloca a área principal para baixo".
 *
 * Numa parada, o que precisa estar visível é O QUE FAZER AGORA. O placar é
 * consulta, não decisão: quantos choques já foram é informação de apoio, e
 * ninguém interrompe a compressão para conferir contador.
 *
 * Agora a faixa fechada mostra só o cronômetro e o que estiver marcado como
 * `resumo`, numa linha só. O resto continua tudo lá, atrás de um toque.
 *
 * ── O QUE NÃO MUDOU ──────────────────────────────────────────────────────────
 *
 * ZERO alteração de fonte de dados: recebe strings prontas, não consulta
 * engine, não conta tempo e não decide nada. Nenhuma informação foi removida —
 * ela mudou de lugar. O pulso de opacidade segue decorativo e independente da
 * contagem real.
 */
export function TrackingPanel({ tempo, itens, style, testID }: TrackingPanelProps) {
  const e = useEstilosDoTema(criarEstilos);
  const opacidade = usePulsoDeSegundo();
  const [aberto, setAberto] = useState(false);

  const noResumo = itens.filter((i) => i.resumo);
  const escondidos = itens.length - noResumo.length;

  return (
    <View style={[e.painel, style]} testID={testID}>
      <Pressable
        onPress={() => setAberto((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={aberto ? "Recolher acompanhamento" : "Expandir acompanhamento"}
        testID={testID ? `${testID}-alternar` : undefined}
        style={e.faixa}>
        {tempo ? (
          <View style={e.blocoTempo}>
            <Text style={e.rotuloFaixa}>{tempo.rotulo}</Text>
            <Animated.Text
              style={[e.tempo, tempo.tom ? e.valorTom[tempo.tom] : null, { opacity: opacidade }]}
              // Sem isto o leitor de tela soletra "zero dois dois quatro".
              accessibilityLabel={`${tempo.rotulo}: ${tempo.valor}`}
            >
              {tempo.valor}
            </Animated.Text>
          </View>
        ) : null}

        <View style={e.resumoLinha}>
          {noResumo.map((item) => (
            <View key={item.rotulo} style={e.pastilha}>
              <Text style={e.pastilhaRotulo} numberOfLines={1}>
                {item.resumoRotulo ?? item.rotulo}
              </Text>
              <Text
                style={[e.pastilhaValor, item.tom ? e.valorTom[item.tom] : null]}
                numberOfLines={1}>
                {item.resumoValor ?? item.valor}
              </Text>
            </View>
          ))}
        </View>

        {/* Contagem do que está recolhido junto do chevron, na MESMA linha.
            Numa linha própria ela custava uma faixa inteira de altura para
            mostrar dois caracteres — e altura aqui é o que empurra a ação para
            baixo da dobra. */}
        <Text style={e.chevron}>
          {aberto ? "▴" : escondidos > 0 ? `+${escondidos} ▾` : "▾"}
        </Text>
      </Pressable>

      {aberto ? (
        <View style={e.grade}>
          {itens.map((item) => (
            <View
              key={item.rotulo}
              style={[e.celula, item.largura === "cheia" && e.celulaCheia]}
            >
              <Text style={e.rotulo} numberOfLines={1}>
                {item.rotulo}
              </Text>
              <Text
                style={[e.valor, item.tom ? e.valorTom[item.tom] : null]}
                numberOfLines={3}
              >
                {item.valor}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Pulso de opacidade de 1 s, puramente decorativo.
 *
 * Não lê nem influencia o cronômetro real: é uma animação em laço, para o número
 * não parecer congelado quando o olho passa por ele. Respeita a preferência de
 * movimento reduzido do sistema — e, se ela estiver ligada, devolve opacidade
 * fixa em vez de animar.
 */
function usePulsoDeSegundo() {
  const opacidade = useRef(new Animated.Value(1)).current;
  // Hook compartilhado (design-system/motion.ts) em vez da consulta local que
  // existia aqui: a preferência de movimento reduzido tem de ser lida de um
  // lugar só, senão cada animação do app decide por conta própria.
  const reduzido = useMovimentoReduzido();

  useEffect(() => {
    if (reduzido !== false) {
      opacidade.setValue(1);
      return;
    }
    const laco = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 0.72, duration: 500, useNativeDriver: true }),
        Animated.timing(opacidade, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    laco.start();
    return () => laco.stop();
  }, [opacidade, reduzido]);

  return opacidade;
}

const criarEstilos = (t: Tema) => {
  const c = t.cores;
  return {
    ...StyleSheet.create({
      painel: {
        backgroundColor: c.surface,
        borderRadius: RAIO.card,
        borderWidth: 1,
        borderColor: c.border,
        paddingHorizontal: ESPACO.md,
        paddingVertical: ESPACO.sm,
        gap: ESPACO.sm,
      },
      // Faixa fechada: uma linha só. Alvo de toque garantido pela altura mínima.
      faixa: {
        flexDirection: "row",
        alignItems: "center",
        gap: ESPACO.md,
        minHeight: 44,
      },
      blocoTempo: { gap: 0, flexShrink: 0 },
      rotuloFaixa: {
        ...TIPOGRAFIA.micro,
        color: c.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      },
      resumoLinha: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "nowrap",
        gap: ESPACO.md,
        justifyContent: "flex-end",
      },
      pastilha: { alignItems: "flex-end", flexShrink: 1 },
      pastilhaRotulo: {
        ...TIPOGRAFIA.micro,
        color: c.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      pastilhaValor: { ...TIPOGRAFIA.step, ...NUMERO_TABULAR, color: c.text },
      chevron: { ...TIPOGRAFIA.caption, color: c.textSecondary, flexShrink: 0 },
      // tabular-nums: sem isto os dígitos mudam de largura a cada segundo e o
      // número treme — justamente no elemento que se olha de relance.
      // Era `display`. Na faixa fechada o cronômetro divide a linha com as
      // pastilhas, então desce para `title` — continua o maior elemento da faixa.
      tempo: { ...TIPOGRAFIA.title, ...NUMERO_TABULAR, color: c.text },

      grade: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.md },
      // 28% forçava TRÊS colunas e, numa tela de 390 px, "ANTIARRÍTMICO" virava
      // "ANTIARRÍT…" e "Não administrado" virava "Não admini…". Duas colunas
      // cabem o rótulo inteiro — e o painel expandido é justamente onde se vai
      // para LER, então truncar ali é perder a razão de abrir.
      celula: { minWidth: 130, flexGrow: 1, flexBasis: "45%", gap: 2 },
      celulaCheia: { flexBasis: "100%" },

      rotulo: {
        ...TIPOGRAFIA.micro,
        color: c.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      },
      valor: { ...TIPOGRAFIA.step, ...NUMERO_TABULAR, color: c.text },
      // 3 linhas: "Não administrado" quebra em duas e ainda sobra folga.
    }),

    valorTom: StyleSheet.create({
      neutro: { color: c.text },
      primary: { color: c.primary },
      critical: { color: c.critical },
      success: { color: c.success },
      warning: { color: c.warning },
    }),
  };
};
