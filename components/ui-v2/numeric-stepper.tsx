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
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Controle numérico único do app — peso, idade, tempo, volume, PEEP, dose.
 *
 * O slider serve para aproximação rápida. Os botões −/+ ficam visualmente mais
 * fortes porque são o mecanismo de ajuste fino e respeitam o passo canônico do
 * campo. Nenhuma parte deste componente escolhe um valor clínico pelo usuário.
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
  style,
  testID,
}: NumericStepperProps) {
  const e = useEstilosDoTema(criarEstilos);
  const decimais = casas ?? (Number.isInteger(passo) ? 0 : String(passo).split(".")[1].length);

  const limitar = useCallback(
    (n: number) => {
      const preso = Math.min(max, Math.max(min, n));
      const emPassos = Math.round((preso - min) / passo) * passo + min;
      return Number(emPassos.toFixed(decimais));
    },
    [min, max, passo, decimais]
  );

  const ajustar = (delta: number) => {
    const novo = limitar(valor + delta);
    onChange(novo);
    onConfirmar?.(novo);
  };

  const noMinimo = valor <= min;
  const noMaximo = valor >= max;
  const valorAcessivel = `${valor.toFixed(decimais).replace(".", ",")}${unidade ? ` ${unidade}` : ""}`;

  return (
    <View style={[e.wrapper, style]} testID={testID}>
      {rotulo ? <Text style={e.rotulo}>{rotulo}</Text> : null}

      <View style={e.valorLinha} accessibilityRole="summary" accessibilityLabel={`${rotulo ?? "Valor"}: ${valorAcessivel}`}>
        <Text style={e.valor}>{valor.toFixed(decimais).replace(".", ",")}</Text>
        {unidade ? <Text style={e.unidade}>{unidade}</Text> : null}
      </View>

      <View style={e.precisionHintRow}>
        <Text style={e.precisionHint}>APROXIME NA BARRA</Text>
        <Text style={e.precisionStep}>AJUSTE FINO · ± {passo.toFixed(decimais).replace(".", ",")}</Text>
      </View>

      <View style={e.controles}>
        <BotaoPasso
          simbolo="−"
          onPress={() => ajustar(-passo)}
          disabled={disabled || noMinimo}
          accessibilityLabel={`Diminuir ${rotulo ?? "valor"} em ${passo}`}
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
            accessibilityValue={{ min, max, now: valor, text: valorAcessivel }}
            style={e.slider}
          />
          <View style={e.rangeRow}>
            <Text style={e.rangeText}>{min.toFixed(decimais).replace(".", ",")}</Text>
            <Text style={e.rangeText}>{max.toFixed(decimais).replace(".", ",")}</Text>
          </View>
        </View>

        <BotaoPasso
          simbolo="+"
          onPress={() => ajustar(passo)}
          disabled={disabled || noMaximo}
          accessibilityLabel={`Aumentar ${rotulo ?? "valor"} em ${passo}`}
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
      wrapper: { gap: ESPACO.sm, flexBasis: "100%", flexGrow: 1, minWidth: 200 },
      rotulo: { ...TIPOGRAFIA.micro, color: cores.textSecondary, fontWeight: "700" },
      valorLinha: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "center",
        gap: ESPACO.xs,
      },
      valor: { ...TIPOGRAFIA.display, ...NUMERO_TABULAR, color: cores.text },
      unidade: { ...TIPOGRAFIA.caption, color: cores.textSecondary, fontWeight: "700" },
      precisionHintRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: ESPACO.sm,
      },
      precisionHint: {
        ...TIPOGRAFIA.micro,
        color: cores.textSecondary,
        fontWeight: "600",
        letterSpacing: 0.35,
      },
      precisionStep: {
        ...TIPOGRAFIA.micro,
        color: cores.primary,
        fontWeight: "900",
        letterSpacing: 0.35,
        textAlign: "right",
      },
      controles: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
      sliderArea: { flex: 1, justifyContent: "center", gap: 1 },
      slider: { width: "100%", height: TOQUE.minimo },
      rangeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 2,
        marginTop: -4,
      },
      rangeText: {
        fontSize: 9,
        lineHeight: 11,
        color: cores.textSecondary,
        fontWeight: "600",
      },
      botaoPasso: {
        width: TOQUE.critico,
        height: TOQUE.critico,
        borderRadius: RAIO.botao,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: cores.surface,
        borderWidth: 1.5,
        borderColor: cores.primary,
      },
      botaoPressionado: { opacity: 0.85, transform: [{ scale: 0.96 }] },
      botaoInativo: { opacity: 0.35, borderColor: cores.border },
      simbolo: { ...TIPOGRAFIA.title, color: cores.primary, lineHeight: 30, fontWeight: "800" },
      ajuda: { ...TIPOGRAFIA.micro, color: cores.textSecondary, fontWeight: "400" },
    }),
    coresSlider: { ativo: cores.primary, trilho: cores.border },
  };
};
