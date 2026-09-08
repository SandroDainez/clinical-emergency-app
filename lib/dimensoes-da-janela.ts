/**
 * AS DIMENSÕES DA JANELA — ⚠️ **iguais às do build no primeiro quadro**.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA (medido em 2026-09-08) ──────────────
 *
 * ⛔ ⛔ Abrir **⛔ qualquer** `/modulos/*` em produção lançava
 * **React #418** — *"A tree hydrated but some attributes of the server rendered
 * HTML didn't match the client properties"*. ⚠️ ⛔ O app aparentava funcionar:
 * ⛔ o React descarta o HTML do build ⛔ e redesenha tudo no cliente.
 *
 * ⚠️⚠️ ⛔ A CAUSA, LIDA NO BUILD DE DESENVOLVIMENTO (⛔ e ⛔ não deduzida):
 *
 * ⛔ `react-native-web` inicia `Dimensions` com **`width: 0`** ⛔ e ⛔ só a
 * atualiza quando existe DOM (`canUseDOM`) — ⛔ ver
 * `react-native-web/dist/exports/Dimensions/index.js`. ⚠️ ⛔ No pré-render do
 * `expo export` (⛔ `output: "static"`) ⛔ não há DOM: ⛔ **toda** comparação
 * `width < N` do app é **verdadeira** no HTML do build.
 *
 * ⛔ ⛔ O nó exato apontado pelo React: `ModuleFlowHero` →
 * `tinyPhone && heroStyles.badgeRowNarrowMobile`.
 *
 *     build (width 0 → `tinyPhone`)  → `flexDirection: "column"`
 *     navegador (375 → ⛔ não é)     → `flexDirection: "row"`
 *
 * ⚠️ Duas classes diferentes no mesmo nó ⛔ e a hidratação morre ⛔ ali.
 *
 * ── ⚠️⚠️ POR QUE **ESTE** CONSERTO ────────────────────────────────────────
 *
 * ⛔ ⛔ Fixar uma largura de pré-render (375, 1024) ⛔ não resolve: ⛔ ela
 * acertaria um aparelho ⛔ e erraria todos os outros — ⛔ o mesmo defeito, em
 * outra largura.
 *
 * ⚠️ ⛔ A regra é a que este repositório já aplicou em `useUiV2Enabled`:
 * **⛔ o primeiro quadro do cliente tem de coincidir com o do build**, ⛔ e o
 * valor real entra ⛔ depois da montagem. ⚠️ ⛔ Na prática o médico ⛔ não vê
 * diferença — ⛔ o quadro do build ⛔ já é o que o navegador pinta hoje ⛔ antes
 * do React redesenhar; ⛔ o que muda é que ⛔ agora a hidratação **⛔ sobrevive**.
 *
 * ── ⚠️ ⛔ NATIVO ⛔ NÃO ESPERA ─────────────────────────────────────────────
 *
 * ⛔ ⛔ Em iOS/Android ⛔ não há pré-render ⛔ nenhum, ⛔ e devolver `0` no
 * primeiro quadro seria inventar um defeito de layout onde ⛔ não havia
 * problema. ⚠️ ⛔ A espera é **⛔ só na web**, ⛔ que é onde o build estático
 * existe.
 */
import { useEffect, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";

/**
 * ⚠️⚠️ O QUE O PRÉ-RENDER ENXERGA — ⛔ e ⛔ isto ⛔ não é uma escolha nossa:
 * ⛔ é o valor inicial do `Dimensions` do `react-native-web` ⛔ enquanto ⛔ não
 * há DOM. ⚠️ ⛔ Mudá-lo aqui ⛔ não muda o build: ⛔ só faria os dois voltarem
 * a discordar.
 */
export const DIMENSOES_DO_PRERENDER = { width: 0, height: 0 } as const;

/** ⚠️ ⛔ Só a web tem build estático — ⛔ e ⛔ só ela precisa esperar. */
const ESPERA_A_MONTAGEM = Platform.OS === "web";

export type DimensoesDaJanela = { readonly width: number; readonly height: number };

/**
 * ⚠️⚠️ ⛔ USE ⛔ ESTA, ⛔ E ⛔ NÃO `useWindowDimensions` DIRETO.
 *
 * ⛔ ⛔ Quem lê a largura ⛔ dentro do render ⛔ e ramifica por ela quebra a
 * hidratação ⛔ do build estático. ⚠️ Quem confere: `prova-hidratacao-estavel`.
 */
export function useDimensoesDaJanela(): DimensoesDaJanela {
  const real = useWindowDimensions();
  /**
   * ⚠️ ⛔ Começa `false` ⛔ **também no servidor**: ⛔ lá o efeito ⛔ nunca roda,
   * ⛔ e o valor devolvido é ⛔ exatamente o do pré-render.
   */
  const [montado, setMontado] = useState(!ESPERA_A_MONTAGEM);
  useEffect(() => setMontado(true), []);
  return montado ? real : DIMENSOES_DO_PRERENDER;
}

/** ⚠️ Atalho para quem ⛔ só precisa da largura — ⛔ a maioria dos chamadores. */
export function useLarguraDaJanela(): number {
  return useDimensoesDaJanela().width;
}
