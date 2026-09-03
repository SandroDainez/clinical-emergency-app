import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type StaleObservationConfirmationCardProps = {
  label: string;
  value: string;
  unit?: string;
  age: string;
  origin?: string;
  onConfirm: () => void;
  onRemeasure: () => void;
  testID?: string;
};

/**
 * Gate visual para uma decisão que recebeu observação antiga.
 *
 * Não define validade nem libera a decisão sozinho. Recebe o bloqueio pronto
 * do runtime e devolve somente a intenção explícita do usuário.
 */
export function StaleObservationConfirmationCard({
  label,
  value,
  unit,
  age,
  origin,
  onConfirm,
  onRemeasure,
  testID = "confirmacao-observacao-antiga",
}: StaleObservationConfirmationCardProps) {
  const e = useEstilosDoTema(criarEstilos);
  const displayedValue = unit ? `${value} ${unit}` : value;

  return (
    <View style={e.card} accessibilityRole="alert" testID={testID}>
      <Text style={e.eyebrow}>DADO ANTIGO · CONFIRMAÇÃO OBRIGATÓRIA</Text>
      <Text style={e.title}>{label}</Text>
      <View style={e.observationRow}>
        <Text style={e.value}>{displayedValue}</Text>
        <Text style={e.age}>há {age}</Text>
      </View>
      {origin ? <Text style={e.origin}>Origem: {origin}</Text> : null}
      <Text style={e.explanation}>
        Esta medição ultrapassou a janela declarada para a decisão atual. Confirme que ainda deve ser usada ou registre uma nova medida.
      </Text>
      <View style={e.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Informar nova medida de ${label}`}
          onPress={onRemeasure}
          style={({ pressed }) => [e.secondary, pressed && e.pressed]}
        >
          <Text style={e.secondaryText}>INFORMAR NOVA MEDIDA</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Confirmar uso da medida antiga de ${label}`}
          onPress={onConfirm}
          style={({ pressed }) => [e.primary, pressed && e.pressed]}
        >
          <Text style={e.primaryText}>CONFIRMAR ESTA MEDIÇÃO</Text>
        </Pressable>
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    card: {
      gap: ESPACO.sm,
      borderRadius: RAIO.card,
      borderWidth: 2,
      borderColor: t.cores.warning,
      backgroundColor: t.cores.surface,
      padding: ESPACO.md,
    },
    eyebrow: { ...TIPOGRAFIA.micro, color: t.cores.warning, fontWeight: "900", letterSpacing: 0.5 },
    title: { ...TIPOGRAFIA.step, color: t.cores.text, fontWeight: "900" },
    observationRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: ESPACO.sm },
    value: { ...TIPOGRAFIA.title, color: t.cores.text, fontWeight: "900" },
    age: { ...TIPOGRAFIA.caption, color: t.cores.warning, fontWeight: "800" },
    origin: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "600" },
    explanation: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary, fontWeight: "500" },
    actions: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    secondary: {
      minHeight: TOQUE.critico,
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1.5,
      borderColor: t.cores.primary,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    primary: {
      minHeight: TOQUE.critico,
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      backgroundColor: t.cores.warning,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    secondaryText: { ...TIPOGRAFIA.micro, color: t.cores.primary, fontWeight: "900", textAlign: "center" },
    primaryText: { ...TIPOGRAFIA.micro, color: t.cores.bg, fontWeight: "900", textAlign: "center" },
    pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  });
