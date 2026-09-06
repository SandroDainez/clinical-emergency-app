/**
 * FOCO DE CAMPO — levar o olho até onde o dado se registra.
 *
 * ── ⚠️⚠️ O DEFEITO QUE ISTO EXISTE PARA RESOLVER ───────────────────────────
 *
 * > *"Clico nos cards ⛔ e ⛔ não abre ⛔ nada. Depois clico em glicemia, PA,
 * > ⛔ nada abre."* — autor, 2026-09-06 (**terceira vez** que ele relata isto)
 *
 * ⛔ `irParaCampo()` fazia ⛔ **só** `verSuperficie()`: trocava a fase ⛔ e parava
 * aí. ⚠️ Quando o campo já estava na fase aberta — PA ⛔ e glicemia em
 * Estabilizar —, ⛔ o toque ⛔ não produzia **efeito ⛔ nenhum**.
 *
 * ⚠️ As duas correções anteriores foram parciais: a primeira fez a fase trocar,
 * a segunda fez a rolagem voltar ao topo. ⛔ ⛔ Nenhuma **levava até o campo**.
 *
 * ── ⚠️⚠️ POR QUE `measureInWindow`, ⛔ E ⛔ NÃO `onLayout` ──────────────────
 *
 * ⛔ A primeira versão usava `onLayout` para guardar a posição de cada grupo.
 * ⚠️ Medido no navegador: **ele ⛔ nunca disparou** nessas Views —
 * react-native-web o implementa sobre `ResizeObserver`, ⛔ e ⛔ nem sempre ele
 * observa o que se espera.
 *
 * ⚠️ `measureInWindow` existe em React Native ⛔ e em react-native-web, ⛔ e é
 * chamado **no momento do toque** — ⛔ quando a geometria já é real, ⛔ e ⛔ sem
 * depender de ⛔ nenhum evento ter acontecido antes.
 *
 * ⚠️ A conta é: `rolagem atual + (topo do grupo − topo da área rolável)`.
 *
 * ── ⚠️ O QUE ELE ⛔ NÃO FAZ ─────────────────────────────────────────────────
 *
 * ⛔ **⛔ Não trava ⛔ nada.** ⚠️ Rolar até um campo ⛔ não o torna obrigatório
 * ⛔ e ⛔ não cria ordem (**E-11**). ⛔ Ele move a viewport, ⛔ e ⛔ nada mais.
 *
 * ⛔ **⛔ Não registra fato.** ⛔ Nenhum campo é preenchido ⛔ ou marcado.
 */
import { createContext, useContext, type ReactNode } from "react";
import type { View } from "react-native";

/** ⚠️ O que o foco precisa saber medir. ⛔ Qualquer host component serve. */
export type NoMensuravel = Pick<View, "measureInWindow"> | null;

export type FocoDeCampo = {
  /**
   * ⚠️ Um grupo declara **quais campos contém** ⛔ e entrega o seu nó. ⛔ O foco
   * é pedido por campo: quem toca *"Pressão arterial"* ⛔ não sabe em que bloco
   * ela mora — ⛔ quem sabe é o bloco.
   */
  readonly registrarGrupo: (campos: readonly string[], no: NoMensuravel) => void;
  /** ⚠️ Leva a viewport até o campo. ⛔ Sem nó conhecido, ⛔ não faz nada. */
  readonly pedirFoco: (campo: string) => void;
};

/**
 * ⚠️⚠️ O PADRÃO É **INERTE**, ⛔ e ⛔ isso ⛔ não é descuido: uma superfície
 * renderizada fora do módulo (numa prova, num catálogo) ⛔ não pode quebrar por
 * ⛔ não ter provedor. ⛔ Ela ⛔ só ⛔ não rola.
 */
const Contexto = createContext<FocoDeCampo>({
  registrarGrupo: () => undefined,
  pedirFoco: () => undefined,
});

export function ProvedorDeFoco({
  valor,
  children,
}: {
  valor: FocoDeCampo;
  children: ReactNode;
}) {
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFoco(): FocoDeCampo {
  return useContext(Contexto);
}
