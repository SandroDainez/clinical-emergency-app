import { useEffect, useRef } from "react";
import {
  Animated,
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
};

export type TrackingPanelProps = {
  /** Cronômetro principal, já formatado pelo engine. */
  tempo?: { rotulo: string; valor: string; tom?: TomSemantico };
  itens: ItemDeAcompanhamento[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Painel de acompanhamento — Fase 5 do plano.
 *
 * As MESMAS informações de antes, em grid, com valor grande e rótulo pequeno.
 * Trocou caixas empilhadas em faixa por uma grade legível de relance, que é como
 * este painel é lido durante uma parada.
 *
 * ZERO alteração de fonte de dados: recebe strings prontas e não consulta engine,
 * não conta tempo e não decide nada. O cronômetro exibe o texto que o engine
 * fornece — o pulso de opacidade é decorativo e independente da contagem real,
 * exatamente como o plano pede.
 */
export function TrackingPanel({ tempo, itens, style, testID }: TrackingPanelProps) {
  const e = useEstilosDoTema(criarEstilos);
  const opacidade = usePulsoDeSegundo();

  return (
    <View style={[e.painel, style]} testID={testID}>
      {tempo ? (
        <View style={e.blocoTempo}>
          <Text style={e.rotulo}>{tempo.rotulo}</Text>
          <Animated.Text
            style={[e.tempo, tempo.tom ? e.valorTom[tempo.tom] : null, { opacity: opacidade }]}
            // Sem isto o leitor de tela soletra "zero dois dois quatro".
            accessibilityLabel={`${tempo.rotulo}: ${tempo.valor}`}
          >
            {tempo.valor}
          </Animated.Text>
        </View>
      ) : null}

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
              numberOfLines={2}
            >
              {item.valor}
            </Text>
          </View>
        ))}
      </View>
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
        padding: ESPACO.md,
        gap: ESPACO.md,
      },
      blocoTempo: { gap: 2 },
      // tabular-nums: sem isto os dígitos mudam de largura a cada segundo e o
      // número treme — justamente no elemento que se olha de relance.
      tempo: { ...TIPOGRAFIA.display, ...NUMERO_TABULAR, color: c.text },

      grade: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.md },
      celula: { minWidth: 96, flexGrow: 1, flexBasis: "28%", gap: 2 },
      celulaCheia: { flexBasis: "100%" },

      rotulo: {
        ...TIPOGRAFIA.micro,
        color: c.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      },
      valor: { ...TIPOGRAFIA.step, ...NUMERO_TABULAR, color: c.text },
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
