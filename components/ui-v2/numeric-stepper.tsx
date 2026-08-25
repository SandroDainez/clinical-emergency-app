import Slider from "@react-native-community/slider";
import { useCallback } from "react";
import {
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
  TOQUE,
} from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type NumericStepperProps = {
  valor: number;
  onChange: (valor: number) => void;
  min: number;
  max: number;
  /** Incremento dos botões −/+ e do slider. */
  passo?: number;
  rotulo?: string;
  unidade?: string;
  /** Casas decimais na exibição. Padrão: deduzido do passo. */
  casas?: number;
  disabled?: boolean;
  /** Texto de apoio abaixo do controle. */
  ajuda?: string;
  /**
   * Chamado quando o médico TERMINA de interagir com o controle — ao soltar a
   * barra ou ao tocar −/+ —, mesmo que o número não tenha mudado.
   *
   * ── O DEFEITO QUE ORIGINOU (2026-08-16) ─────────────────────────────────
   *
   * A barra parte de um valor de partida (o meio da faixa, ou 70 kg), e as
   * telas avisam que aquilo AINDA NÃO É UMA MEDIDA. O aviso saía quando o
   * valor era gravado — e o `Slider` só emite `onValueChange` quando o número
   * MUDA. Resultado: quem tocava a barra e parava no valor inicial continuava
   * marcado como "não informado".
   *
   * ⚠️ "NÃO INFORMADO" E "INFORMADO, E IGUAL AO PADRÃO" SÃO OPOSTOS — um é
   * ausência de medida, o outro é uma medida. O caso limite é banal: paciente
   * de 70 kg com a barra partindo de 70.
   *
   * E é NO FIM do gesto, não no início: marcar ao encostar criaria o defeito
   * inverso — campo "informado" por esbarrão, que é pior porque é silencioso.
   */
  onConfirmar?: (valor: number) => void;
  /**
   * ⚠️ O NÚMERO AINDA NÃO É UMA MEDIDA — exibe `—` no lugar dele.
   *
   * ── O DEFEITO QUE ORIGINOU (medido em 2026-08-25, na Tela 1 da SCA) ──────
   *
   * A barra parte do meio da faixa e mostrava esse número em tipo grande antes
   * de qualquer toque. Num campo OBRIGATÓRIO isso nunca apareceu, porque o
   * botão de avançar fica travado até o médico tocar. Num campo OPCIONAL — que
   * a Tela 1 introduziu — a tela dizia "Peso 140 kg" com o motor vazio, e o
   * médico podia seguir achando que informou.
   *
   * ⚠️ E PESO ALIMENTA DOSE: tenecteplase e enoxaparina são calculadas por
   * quilo. Um número que parece confirmado sem ninguém ter medido é a semente
   * de uma dose errada três telas adiante.
   *
   * A regra que isto implementa: nenhum valor numérico não informado pode
   * parecer confirmado na interface — a aparência tem de refletir o estado
   * real do motor. A BARRA continua na posição do meio (ela precisa de um
   * número para desenhar), mas o VALOR LIDO diz que não há valor.
   */
  naoInformado?: boolean;
  /**
   * O que aparece no lugar do número quando `naoInformado`.
   *
   * ⚠️ VEM DE FORA PORQUE ESTE COMPONENTE NÃO TRADUZ. Ele é `ui-v2` puro, sem
   * acesso ao `tr()`, e o app é bilíngue: uma frase escrita aqui ficaria em
   * português na tela em espanhol, e a varredura de tradução a acusaria — com
   * razão. Quem chama já tem o `tr()`.
   */
  textoAusente?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Controle numérico único do app — peso, idade, tempo, volume, PEEP, dose.
 *
 * O plano pede um só componente parametrizado em vez de um campo diferente por
 * grandeza, e slider + botões grandes em vez de digitação: no plantão, acertar
 * um número num teclado com luva é mais lento e mais sujeito a erro do que
 * arrastar e ajustar.
 *
 * Os botões −/+ respeitam o alvo mínimo de 44 px e continuam operáveis mesmo
 * quando o slider é pequeno demais para a precisão desejada.
 */
export function NumericStepper({
  valor,
  onChange,
  min,
  max,
  passo = 1,
  rotulo,
  unidade,
  casas,
  disabled = false,
  ajuda,
  onConfirmar,
  naoInformado = false,
  textoAusente = "—",
  style,
  testID,
}: NumericStepperProps) {
  const e = useEstilosDoTema(criarEstilos);
  const decimais = casas ?? (Number.isInteger(passo) ? 0 : String(passo).split(".")[1].length);

  const limitar = useCallback(
    (n: number) => {
      const preso = Math.min(max, Math.max(min, n));
      // Arredonda para o passo para não acumular erro de ponto flutuante ao
      // somar 0.1 várias vezes.
      const emPassos = Math.round((preso - min) / passo) * passo + min;
      return Number(emPassos.toFixed(decimais));
    },
    [min, max, passo, decimais]
  );

  const ajustar = (delta: number) => {
    const novo = limitar(valor + delta);
    onChange(novo);
    // Tocar −/+ é confirmação tanto quanto soltar a barra, e no extremo da
    // faixa o valor não muda — sem isto, o campo no mínimo ficaria "não
    // informado" para sempre.
    onConfirmar?.(novo);
  };

  const noMinimo = valor <= min;
  const noMaximo = valor >= max;

  return (
    <View style={[e.wrapper, style]} testID={testID}>
      {rotulo ? <Text style={e.rotulo}>{rotulo}</Text> : null}

      <View style={e.valorLinha}>
        {/* VÍRGULA, não ponto. `toFixed` devolve "0.13" e o app inteiro — texto
            clínico, presets, doses — escreve "0,13". Um separador diferente no
            número que se lê em voz alta para conferir é ruído desnecessário, e
            os dois idiomas do app (pt-BR e es-419) usam vírgula. Como todas as
            barras passam por aqui, corrigir no componente corrige em todas. */}
        <Text style={naoInformado ? e.valorAusente : e.valor}>
          {naoInformado ? textoAusente : valor.toFixed(decimais).replace(".", ",")}
        </Text>
        {/* A unidade some junto: "— kg" sugere que existe um número em kg em
            algum lugar. O que existe é a ausência dele. */}
        {unidade && !naoInformado ? <Text style={e.unidade}>{unidade}</Text> : null}
      </View>

      <View style={e.controles}>
        <BotaoPasso
          simbolo="−"
          onPress={() => ajustar(-passo)}
          disabled={disabled || noMinimo}
          accessibilityLabel={`Diminuir ${rotulo ?? "valor"}`}
          estilos={e}
          testID={testID ? `${testID}-menos` : undefined}
        />

        <View style={e.sliderArea}>
          <Slider
            value={valor}
            onValueChange={(v) => onChange(limitar(v))}
            onSlidingComplete={(v) => onConfirmar?.(limitar(v))}
            minimumValue={min}
            maximumValue={max}
            step={passo}
            disabled={disabled}
            minimumTrackTintColor={e.coresSlider.ativo}
            maximumTrackTintColor={e.coresSlider.trilho}
            thumbTintColor={e.coresSlider.ativo}
            accessibilityLabel={rotulo}
            style={e.slider}
          />
        </View>

        <BotaoPasso
          simbolo="+"
          onPress={() => ajustar(passo)}
          disabled={disabled || noMaximo}
          accessibilityLabel={`Aumentar ${rotulo ?? "valor"}`}
          estilos={e}
          testID={testID ? `${testID}-mais` : undefined}
        />
      </View>

      {ajuda ? <Text style={e.ajuda}>{ajuda}</Text> : null}
    </View>
  );
}

function BotaoPasso({
  simbolo,
  onPress,
  disabled,
  accessibilityLabel,
  estilos,
  testID,
}: {
  simbolo: string;
  onPress: () => void;
  disabled: boolean;
  accessibilityLabel: string;
  estilos: ReturnType<typeof criarEstilos>;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        estilos.botaoPasso,
        pressed && !disabled && estilos.botaoPressionado,
        disabled && estilos.botaoInativo,
      ]}
    >
      <Text style={estilos.simbolo}>{simbolo}</Text>
    </Pressable>
  );
}

const criarEstilos = (t: Tema) => {
  const cores = t.cores;
  return {
    ...StyleSheet.create({
      /**
       * ⚠️ O CONTROLE GARANTE A PRÓPRIA LARGURA — quatro telas provaram que ele
       * não pode depender do hospedeiro.
       *
       * A varredura de barras renderizadas (e2e/barra-utilizavel.spec.ts) achou
       * SEIS barras inutilizáveis em quatro módulos, todas pela mesma causa: o
       * stepper posto dentro de um contêiner `flexDirection: "row"` sem largura
       * garantida — ao lado de um rótulo em `flex: 1`, dentro de uma linha de
       * chips com wrap, ou numa coluna de 48%. Os botões −/+ (44 px cada, alvo
       * mínimo de toque) consomem o que sobra e a trilha fica com 0 a 40 px.
       *
       * `flexBasis: "100%"` + `flexGrow: 1` fazem o controle ocupar a linha
       * inteira do pai; `minWidth` impede que um pai estreito o esmague. Como
       * TODAS as barras passam por aqui, corrigir no componente corrige em
       * todas — e a quinta tela nasce protegida, que é o ponto.
       *
       * ⚠️ O PISO É 200, NÃO 260, e o número saiu de medição: com 260 o
       * controle estourava o cartão de dose das Vasoativas (que tem
       * `overflow: hidden`) e o botão "+" saía cortado — a proteção criando um
       * defeito novo. 200 = 44 + 44 dos botões + ~112 de trilha, acima do piso
       * de usabilidade de 120 que a trava exige.
       *
       * Onde a largura ainda fica curta, a causa é OUTRA e tem dono: o rail
       * lateral permanente de 86 a 96 px das três calculadoras, que está sendo
       * convergido para o componente comum.
       */
      wrapper: { gap: ESPACO.sm, flexBasis: "100%", flexGrow: 1, minWidth: 200 },
      rotulo: { ...TIPOGRAFIA.micro, color: cores.textSecondary },
      valorLinha: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "center",
        gap: ESPACO.xs,
      },
      // tabular-nums: sem isto o número muda de largura ao arrastar o slider e
      // o valor "dança" na tela.
      valor: { ...TIPOGRAFIA.display, ...NUMERO_TABULAR, color: cores.text },
      // ⚠️ O "—" NÃO PODE USAR A DISPLAY. Na validação visual ele virou uma
      // barra branca grossa no meio da tela — lia-se como divisória gráfica,
      // não como "sem valor", e o médico não tinha por que interpretá-lo como
      // campo por preencher. Em corpo de texto e cor secundária ele volta a
      // ser o que é: a ausência do número, dita em voz baixa.
      valorAusente: { ...TIPOGRAFIA.body, color: cores.textSecondary },
      unidade: { ...TIPOGRAFIA.caption, color: cores.textSecondary },
      controles: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
      sliderArea: { flex: 1, justifyContent: "center" },
      slider: { width: "100%", height: TOQUE.minimo },
      botaoPasso: {
        width: TOQUE.critico,
        height: TOQUE.critico,
        borderRadius: RAIO.botao,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: cores.surface,
        borderWidth: 1,
        borderColor: cores.border,
      },
      botaoPressionado: { opacity: 0.85, transform: [{ scale: 0.96 }] },
      botaoInativo: { opacity: 0.35 },
      simbolo: { ...TIPOGRAFIA.title, color: cores.text, lineHeight: 30 },
      ajuda: { ...TIPOGRAFIA.micro, color: cores.textSecondary, fontWeight: "400" },
    }),
    coresSlider: { ativo: cores.primary, trilho: cores.border },
  };
};
