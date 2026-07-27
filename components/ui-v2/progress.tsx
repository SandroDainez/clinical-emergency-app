import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type ProgressProps = {
  /** 0 a 1. Valores fora da faixa são presos, não rejeitados. */
  valor: number;
  rotulo?: string;
  tom?: "primary" | "critical" | "success" | "warning";
  /** Mostra "3 / 8" ao lado do rótulo. */
  passos?: { atual: number; total: number };
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Barra de progresso — etapa do fluxo, ciclo de RCP, preenchimento de dados. */
export function Progress({
  valor,
  rotulo,
  tom = "primary",
  passos,
  style,
  testID,
}: ProgressProps) {
  const e = useEstilosDoTema(criarEstilos);
  const preso = Math.min(1, Math.max(0, Number.isFinite(valor) ? valor : 0));

  return (
    <View style={[e.wrapper, style]} testID={testID}>
      {rotulo || passos ? (
        <View style={e.cabecalho}>
          {rotulo ? <Text style={e.rotulo}>{rotulo}</Text> : null}
          {passos ? (
            <Text style={e.passos}>
              {passos.atual} / {passos.total}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        style={e.trilho}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(preso * 100) }}
        accessibilityLabel={rotulo}
      >
        <View style={[e.preenchimento, e.tom[tom], { width: `${preso * 100}%` }]} />
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) => ({
  ...StyleSheet.create({
    wrapper: { gap: ESPACO.xs },
    cabecalho: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    rotulo: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary },
    passos: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary },
    trilho: {
      height: 8,
      borderRadius: RAIO.badge,
      backgroundColor: t.cores.border,
      overflow: "hidden",
    },
    preenchimento: { height: "100%", borderRadius: RAIO.badge },
  }),
  tom: StyleSheet.create({
    primary: { backgroundColor: t.cores.primary },
    critical: { backgroundColor: t.cores.critical },
    success: { backgroundColor: t.cores.success },
    warning: { backgroundColor: t.cores.warning },
  }),
});
