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

  const ajustar = (delta: number) => onChange(limitar(valor + delta));

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
        <Text style={e.valor}>{valor.toFixed(decimais).replace(".", ",")}</Text>
        {unidade ? <Text style={e.unidade}>{unidade}</Text> : null}
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
      wrapper: { gap: ESPACO.sm },
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
