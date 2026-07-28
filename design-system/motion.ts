import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated } from "react-native";

/**
 * Movimento da UI 2.0 — Fase 8.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A regra que manda aqui é do plano, e é clínica, não estética:
 *
 *   "Proibido: animação que atrase feedback de ação crítica.
 *    Em emergência, resposta imediata > elegância."
 *
 * Por isso as animações deste arquivo são todas de ENTRADA e nunca de saída, e
 * o conteúdo é montado no mesmo instante em que existe. A opacidade sobe por
 * cima de algo que já está lá e já é tocável — nada espera a animação terminar.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Durações do plano. Nada além disto. */
export const DURACAO = {
  /** Retorno de toque. */
  toque: 100,
  /** Troca de etapa. */
  etapa: 200,
} as const;

/**
 * O sistema pede movimento reduzido?
 *
 * Devolve `null` enquanto não sabe — importante para não animar por engano antes
 * da resposta, e para o primeiro render do cliente coincidir com o do build
 * (mesma disciplina que evitou o L-001).
 */
export function useMovimentoReduzido(): boolean | null {
  const [reduzido, setReduzido] = useState<boolean | null>(null);

  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (vivo) setReduzido(v);
    });

    const inscricao = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      (v: boolean) => setReduzido(v)
    );

    return () => {
      vivo = false;
      inscricao?.remove?.();
    };
  }, []);

  return reduzido;
}

/**
 * Fade de entrada disparado quando `chave` muda — para troca de etapa.
 *
 * O conteúdo novo já está montado e tocável desde o primeiro frame: o que anima
 * é só a opacidade, de 0,4 para 1. Não parte de 0 de propósito — texto clínico
 * invisível, ainda que por 200 ms, é pior do que transição nenhuma.
 *
 * Com movimento reduzido, devolve opacidade fixa em 1 e não anima.
 */
export function useFadeDeEtapa(chave: string | number): Animated.Value {
  const opacidade = useRef(new Animated.Value(1)).current;
  const reduzido = useMovimentoReduzido();
  const primeira = useRef(true);

  useEffect(() => {
    // No primeiro render não há transição: a tela está abrindo, não trocando.
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    if (reduzido !== false) {
      opacidade.setValue(1);
      return;
    }

    opacidade.setValue(0.4);
    const animacao = Animated.timing(opacidade, {
      toValue: 1,
      duration: DURACAO.etapa,
      useNativeDriver: true,
    });
    animacao.start();
    return () => animacao.stop();
  }, [chave, reduzido, opacidade]);

  return opacidade;
}
