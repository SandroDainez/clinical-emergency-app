/**
 * A CALCULADORA DE GLASGOW — ⚠️ **E · V · M**, ⛔ e o total que sai deles.
 *
 * ── ⚠️⚠️⚠️ ⛔ POR QUE ELA EXISTE — pedido do autor, 2026-09-08 ─────────────
 *
 * ⛔ ⛔ *"Neurológico ao clicar tem que abrir calculadora para o usuário
 * escolher os números, ⛔ e a calculadora coloca no APP o resultado."*
 *
 * ⚠️ ⛔ É o **mesmo pedido** que criou a escala do NIHSS em 2026-08-29:
 * *"essa escala o usuário ⛔ não sabe, tem que ser clicável para abrir ⛔ e
 * preencher"*. ⛔ Aqui vale a mesma resposta, ⛔ com três itens em vez de
 * quinze.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ⛔ NÃO REUSEI `CampoDeEscala` ──────────────────────────
 *
 * ⛔ ⛔ Ele foi desenhado para **quinze** itens: modo foco, *"ver todos"*,
 * *"item 3 de 15"*, regras de pontuação recolhíveis. ⚠️ Com **três**, esse
 * maquinário ⛔ não ajuda — ⛔ ele atrapalha.
 *
 * ⚠️⚠️ ⛔ E ⛔ isso ⛔ **⛔ não** duplica conteúdo clínico: ⛔ os itens, as opções
 * ⛔ e os pontos vêm **da mesma ferramenta** (`avc/conteudo/glasgow.ts` →
 * `CALC_TOOLS`). ⛔ O que difere é o **desenho**, ⛔ porque a forma do dado é
 * outra.
 *
 * ── ⚠️⚠️⚠️ ⛔ O QUE ELA ⛔ NÃO FAZ ────────────────────────────────────────
 *
 * ⛔ ⛔ **⛔ Não interpreta.** ⛔ Nenhum *"GCS 8"*, ⛔ nenhum *"proteger via
 * aérea"*, ⛔ nenhum limiar. ⚠️ ⛔ O motor do AVC declara que **⛔ nenhuma fonte
 * deste módulo dá corte para Glasgow** — ⛔ e uma frase dessas ⛔ aqui seria
 * conduta nascendo na tela (**E-31**).
 *
 * ⛔ ⛔ **⛔ Não grava item a item.** ⚠️ A escala é **um gesto só**: gravar
 * enquanto o médico ainda escolhe encheria a trilha do **caminho** até a
 * medida, ⛔ e ⛔ nenhum desses passos é a medida.
 *
 * ⛔ ⛔ **⛔ Não apaga o que veio antes.** ⚠️ Confirmar acrescenta uma origem
 * nova à trilha; ⛔ o total digitado antes continua ⛔ lá, marcado.
 *
 * ── ⚠️⚠️⚠️ ⛔ POR QUE SÃO **DUAS** PEÇAS — pedido do autor, 2026-09-09 ────
 *
 * ⛔ ⛔ *"A escala de Glasgow na avaliação tem que ter botão ⛔ **ao lado**
 * para abrir a calculadora."*
 *
 * ⚠️ ⛔ O botão ⛔ e o painel ⛔ não moram mais ⛔ no mesmo lugar da tela: ⛔ o
 * botão vai ⛔ **ao lado do número**, ⛔ e o painel abre ⛔ **por baixo do
 * campo** — ⛔ ele tem quinze opções, ⛔ e ⛔ não cabe numa linha.
 *
 * ⚠️⚠️ ⛔ E ⛔ por isso o **aberto/fechado sai daqui**: ⛔ duas peças separadas
 * ⛔ não podem cada uma ter o seu. ⛔ Quem guarda é a superfície — ⛔ é estado
 * de **UI**, ⛔ como o acordeão dos eixos.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ITENS_GLASGOW, totalDoGlasgow } from "../../avc/conteudo/glasgow";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

/**
 * ── ⚠️⚠️⚠️ O BOTÃO — ⛔ ele vive **⛔ ao lado do número** ────────────────────
 *
 * ⚠️ ⛔ Curto ⛔ de propósito: ⛔ ele divide a linha com a caixa, a unidade ⛔ e
 * o `−/+`. ⛔ *"Calcular por E · V · M"* ⛔ ali dentro ⛔ ou quebra em três
 * linhas ⛔ ou espreme a caixa — ⛔ e o nome inteiro da escala já está escrito
 * ⛔ logo acima, ⛔ a um centímetro.
 *
 * ⚠️⚠️ ⛔ O **leitor de tela** ⛔ não perde ⛔ nada: `accessibilityLabel`
 * continua dizendo a frase inteira. ⛔ Encurtar o que se **vê** ⛔ não é
 * encurtar o que se **diz**.
 */
export function BotaoDaCalculadoraDeGlasgow({
  aberta,
  jaRegistrado,
  onAlternar,
}: {
  aberta: boolean;
  jaRegistrado: boolean;
  onAlternar: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: aberta }}
      accessibilityLabel={tr(
        jaRegistrado ? "Rever os componentes do Glasgow" : "Calcular o Glasgow pelos componentes"
      )}
      testID="avc-glasgow-abrir"
      onPress={onAlternar}
      style={({ pressed }) => [e.abrir, pressed ? e.pressionado : null]}
    >
      <Text style={e.abrirTexto} numberOfLines={1}>
        {tr(jaRegistrado ? "Rever" : "Calcular")}
      </Text>
    </Pressable>
  );
}

type Props = {
  /**
   * ⚠️ Os pontos **já registrados**, por componente. ⛔ Vazio ⛔ não é zero —
   * ⛔ o mínimo de cada item da escala é **1**.
   */
  pontos: Readonly<Record<string, number>>;
  /** ⚠️ Grava a escala inteira: ⛔ um fato por componente, ⛔ mais o total. */
  onRegistrar: (pontos: Record<string, number>, total: number) => void;
  /** ⚠️ ⛔ Fechar é da superfície — ⛔ o painel ⛔ não guarda o próprio aberto. */
  onFechar: () => void;
};

export default function CalculadoraDeGlasgow({ pontos, onRegistrar, onFechar }: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  /**
   * ⚠️ RASCUNHO: ⛔ o que está sendo escolhido **agora**, por cima do que ⛔ já
   * foi registrado. ⛔ Só o *"Usar este total"* transforma rascunho em fato.
   */
  const [rascunho, setRascunho] = useState<Record<string, number>>({});

  /**
   * ⚠️⚠️ ⛔ REABRIR MOSTRA O QUE FOI ESCOLHIDO — exigência do autor: ⛔ o
   * registrado entra ⛔ por baixo do rascunho, ⛔ e ⛔ por isso a calculadora
   * ⛔ nunca volta em branco depois de usada.
   */
  const emEdicao: Record<string, number> = { ...pontos, ...rascunho };
  const total = totalDoGlasgow(emEdicao);

  return (
    <View style={e.painel} testID="avc-glasgow-calculadora">
      {ITENS_GLASGOW.map((item) => (
        <View key={item.id} style={e.item} testID={`avc-glasgow-item-${item.id}`}>
          <Text style={e.itemRotulo}>{tr(item.label)}</Text>
          {item.options.map((op) => {
            const marcado = emEdicao[item.id] === op.points;
            return (
              <Pressable
                key={op.label}
                accessibilityRole="radio"
                accessibilityState={{ checked: marcado }}
                /**
                 * ⚠️ ⛔ `aria-checked` **explícito**: ⛔ medido no navegador, o
                 * `accessibilityState` sozinho ⛔ não chegava ao atributo — ⛔ e
                 * a trava lia `""` onde esperava `"true"`.
                 */
                aria-checked={marcado}
                accessibilityLabel={`${tr(item.label)}: ${tr(op.label)}`}
                testID={`avc-glasgow-${item.id}-${op.points}`}
                onPress={() => setRascunho((r) => ({ ...r, [item.id]: op.points }))}
                style={({ pressed }) => [
                  e.opcao,
                  marcado ? e.opcaoMarcada : null,
                  pressed ? e.pressionado : null,
                ]}
              >
                <Text style={[e.opcaoTexto, marcado ? e.opcaoTextoMarcado : null]}>
                  {tr(op.label)}
                </Text>
                {/** ⚠️ O ponto de cada opção — ⛔ ele é da escala, ⛔ e ⛔ não juízo. */}
                <Text style={e.opcaoPonto}>{op.points}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      {/**
        * ── ⚠️⚠️⚠️ O TOTAL ⛔ SÓ COM OS TRÊS ─────────────────────────────────
        *
        * ⛔ ⛔ Um Glasgow pela metade ⛔ não é um Glasgow, ⛔ e somar ⛔ o que
        * ⛔ já foi marcado daria **um número menor que o mínimo da escala**.
        * ⚠️ Enquanto falta componente, a tela diz ⛔ o que falta — ⛔ e ⛔ não
        * mostra soma parcial.
        */}
      <Text style={e.total} testID="avc-glasgow-total">
        {total === undefined
          ? tr("Escolha E, V e M para somar")
          : `${tr("Total")} ${total}`}
      </Text>

      <View style={e.acoes}>
        <Pressable
          accessibilityRole="button"
          disabled={total === undefined}
          accessibilityState={{ disabled: total === undefined }}
          testID="avc-glasgow-usar"
          onPress={() => {
            if (total === undefined) return;
            onRegistrar({ ...emEdicao }, total);
            setRascunho({});
            onFechar();
          }}
          style={({ pressed }) => [
            e.usar,
            total === undefined ? e.usarInerte : null,
            pressed ? e.pressionado : null,
          ]}
        >
          <Text style={[e.usarTexto, total === undefined ? e.usarTextoInerte : null]}>
            {tr("Usar este total")}
          </Text>
        </Pressable>

        {/** ⚠️ ⛔ Fechar ⛔ não grava — ⛔ e ⛔ não apaga o rascunho do que já era fato. */}
        <Pressable
          accessibilityRole="button"
          testID="avc-glasgow-fechar"
          onPress={() => {
            setRascunho({});
            onFechar();
          }}
          style={({ pressed }) => [e.fechar, pressed ? e.pressionado : null]}
        >
          <Text style={e.fecharTexto}>{tr("Fechar sem usar")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    /** ⚠️ ⛔ Ele ocupa a sobra da linha da caixa — ⛔ e ⛔ nunca o trilho. */
    abrir: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.primary,
      paddingHorizontal: ESPACO.sm,
    },
    abrirTexto: { ...PAPEL.textoPrincipal, color: tema.cores.primary },
    painel: {
      backgroundColor: tema.cores.surfaceElevated,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: tema.cores.border,
      padding: ESPACO.md,
      gap: ESPACO.sm,
    },
    item: { gap: ESPACO.xs },
    itemRotulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    opcao: {
      minHeight: TOQUE.minimo,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
      paddingHorizontal: ESPACO.md,
    },
    /** ⚠️ Marcado é **borda ⛔ e peso**, ⛔ e ⛔ não ⛔ só cor (**E-15**). */
    opcaoMarcada: { borderColor: tema.cores.primary, borderWidth: 2 },
    opcaoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text, flexShrink: 1 },
    opcaoTextoMarcado: { fontWeight: "700" },
    opcaoPonto: { ...PAPEL.rotuloDeMetrica, color: tema.cores.textSecondary },
    total: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    acoes: { gap: ESPACO.xs },
    usar: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.primaryFill,
    },
    usarInerte: { backgroundColor: tema.cores.controlSurface },
    usarTexto: { ...PAPEL.textoPrincipal, color: tema.cores.onFill, fontWeight: "700" },
    usarTextoInerte: { color: tema.cores.disabled },
    fechar: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
    },
    fecharTexto: { ...PAPEL.textoPrincipal, color: tema.cores.textSecondary },
    pressionado: { opacity: 0.7 },
  });
