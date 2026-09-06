/**
 * AFORDÂNCIA — o que **se toca** precisa parecer que se toca.
 *
 * ── ⚠️⚠️ O DEFEITO QUE ISTO EXISTE PARA FECHAR ─────────────────────────────
 *
 * ⛔ O autor relatou a MESMA coisa **seis vezes** entre 2026-09-05 e 09-06:
 *
 * > *"esses botões ⛔ não estão funcionais, clica neles e ⛔ nada acontece"*
 * > *"aqui também ⛔ não dá para saber que faz parte do fluxo"*
 * > *"botões todos iguais, parecem textos"*
 * > *"isso tudo se parece com textos e ⛔ não botões funcionais"*
 * > *"relógios ⛔ não se parecem botões, se parecem textos"*
 * > *"temos que tudo que se parece texto transformar em botões, onde o usuário
 * >  ⛔ não tenha dúvidas que tem que clicar neles"*
 *
 * ⚠️⚠️ ⛔ E AS CINCO PRIMEIRAS VEZES EU CONSERTEI **⛔ SÓ O PEDAÇO DA CAPTURA**.
 * ⛔ Isso ⛔ não é conserto: é adiar. ⚠️ Este arquivo existe para que a próxima
 * decisão de afordância seja tomada **⛔ uma vez, aqui**, ⛔ e ⛔ não trinta vezes
 * espalhada por dezessete telas — onde a trigésima primeira nasce errada.
 *
 * ── ⚠️⚠️ AS TRÊS MARCAS, ⛔ E ⛔ POR QUE SÃO **TRÊS** ────────────────────────
 *
 * ⛔ Fundo sozinho ⛔ não basta: num tema escuro ele é quase o cartão de trás.
 * ⛔ Borda sozinha ⛔ não basta: ela vira moldura de citação.
 * ⛔ **E cor sozinha ⛔ nunca basta** (**E-15**) — quem ⛔ não distingue azul de
 * cinza tem de continuar sabendo onde encostar o dedo.
 *
 *   1. **preenchimento** — o alvo tem corpo, ⛔ e ⛔ não é o fundo da tela.
 *   2. **borda**         — o alvo tem **fim**: dá para ver onde ele acaba.
 *   3. **seta `›`**      — ⛔ sem depender de ⛔ nenhuma cor, ela diz *leva a
 *      algum lugar*. ⚠️ É a marca que sobrevive ao daltonismo ⛔ e ao brilho do
 *      sol na tela do plantão.
 *
 * ── ⚠️ O QUE ISTO ⛔ NÃO FAZ ─────────────────────────────────────────────────
 *
 * ⛔ ⛔ Não decide medicina, ⛔ não conhece campo, ⛔ não sabe o que é AVC.
 * ⛔ ⛔ Não pinta ESTADO clínico: `acao`/`pedido`/`controle` dizem **o que o
 *    toque faz**, ⛔ e ⛔ nunca se o paciente está bem ⛔ ou mal.
 */
import type { TextStyle, ViewStyle } from "react-native";

import { PAPEL } from "./tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "./tokens";
import type { Tema } from "./theme";

/**
 * ⚠️⚠️ A SETA É **UM CARACTERE**, ⛔ e ⛔ não um ícone importado.
 *
 * ⛔ Um SVG a mais em cada linha tocável de um módulo com ~120 delas é peso de
 * render ⛔ e mais uma coisa que pode ⛔ não carregar. ⚠️ `›` já está em toda
 * fonte do sistema, ⛔ e ⛔ não some.
 */
export const SETA = "›";

export type Afordancia = {
  /** ⚠️ A ação principal do bloco — preenchida, ⛔ e ⛔ uma por bloco. */
  readonly acao: ViewStyle;
  readonly acaoTexto: TextStyle;
  /**
   * ⚠️⚠️ **PEDIDO** — o app está pedindo um dado que ⛔ ainda ⛔ não tem.
   *
   * ⛔ ⛔ NÃO é alerta ⛔ e ⛔ não é âmbar: ausência é **estado**, ⛔ e ⛔ nunca
   * achado (**E-23**). ⚠️ Ele é azul de **ação** porque o que se pede é um
   * toque, ⛔ e ⛔ não porque falte algo de ruim.
   */
  readonly pedido: ViewStyle;
  readonly pedidoTexto: TextStyle;
  /** ⚠️ Botão secundário: existe, é tocável, ⛔ e ⛔ não disputa com a ação. */
  readonly controle: ViewStyle;
  readonly controleTexto: TextStyle;
  /** ⚠️ A linha inteira é o alvo — lista de campos, de blocos, de relógios. */
  readonly linha: ViewStyle;
  /** ⚠️ A seta que fecha a linha à direita. */
  readonly seta: TextStyle;
  /** ⚠️ Feedback de pressão — ⛔ o mesmo em todo o app. */
  readonly pressionado: ViewStyle;
};

export function afordancia(tema: Tema): Afordancia {
  return {
    acao: {
      minHeight: TOQUE.critico,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.primaryFill,
      borderWidth: 1,
      borderColor: tema.cores.primaryFill,
    },
    acaoTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill },

    /**
     * ⚠️ Preenchimento **de tinta**, ⛔ e ⛔ não transparência: sobre o cartão
     * escuro, `primaryTint` é o que faz o retângulo existir. ⚠️ A borda é de
     * 1,5 px porque em 1 px ela mede 1,19:1 contra o cartão — abaixo do que o
     * olho separa, ⛔ e foi essa a medida que gerou o relato do autor.
     */
    pedido: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: ESPACO.xs,
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.primaryTint,
      borderWidth: 1.5,
      borderColor: tema.cores.primary,
    },
    pedidoTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.primary },

    controle: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: ESPACO.xs,
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    controleTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },

    linha: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      minHeight: TOQUE.minimo,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.xs,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    /** ⚠️ ⛔ Cor de TEXTO, ⛔ e ⛔ não de ação: a seta ⛔ não pode depender de cor (E-15). */
    seta: { ...PAPEL.tituloDeSecao, color: tema.cores.text },

    pressionado: { opacity: 0.65 },
  };
}
