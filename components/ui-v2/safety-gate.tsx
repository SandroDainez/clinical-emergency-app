import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type SafetyGateProps = {
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  onOverride?: () => void;
  overrideLabel?: string;
  severity?: "warning" | "critical";
};

/**
 * Gate clínico com override explícito.
 *
 * O app impede omissão silenciosa sem bloquear uma emergência real. Quando
 * existir override, a camada de domínio deve registrar motivo e timestamp.
 */
export function SafetyGate({
  title,
  message,
  primaryLabel,
  onPrimary,
  onOverride,
  overrideLabel = "Prosseguir por exceção",
  severity = "warning",
}: SafetyGateProps) {
  const e = useEstilosDoTema(criarEstilos);
  const critical = severity === "critical";

  return (
    <View style={[e.wrapper, critical && e.wrapperCritical]} accessibilityRole="alert">
      <Text style={[e.title, critical && e.titleCritical]}>{title}</Text>
      <Text style={e.message}>{message}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        onPress={onPrimary}
        style={({ pressed }) => [e.primary, critical && e.primaryCritical, pressed && e.pressed]}
      >
        <Text style={[e.primaryLabel, critical && e.primaryCriticalLabel]}>{primaryLabel}</Text>
      </Pressable>

      {onOverride ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={overrideLabel}
          onPress={onOverride}
          style={({ pressed }) => [e.override, pressed && e.pressed]}
        >
          <Text style={e.overrideLabel}>{overrideLabel}</Text>
          <Text style={e.overrideHint}>A exceção deve ser registrada no atendimento</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: t.cores.surface,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderLeftWidth: 4,
      borderColor: t.cores.warning,
      padding: ESPACO.lg,
      gap: ESPACO.md,
    },
    wrapperCritical: { borderColor: t.cores.critical },
    title: { ...TIPOGRAFIA.step, color: t.cores.warning, fontWeight: "800" },
    titleCritical: { color: t.cores.critical },
    message: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "500" },
    primary: {
      minHeight: TOQUE.critico,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      backgroundColor: t.cores.warning,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    primaryCritical: { backgroundColor: t.cores.critical },
    primaryLabel: { ...TIPOGRAFIA.body, color: t.cores.bg, fontWeight: "800", textAlign: "center" },
    primaryCriticalLabel: { color: t.cores.onCritical },
    override: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      gap: 2,
    },
    overrideLabel: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "700" },
    overrideHint: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "400", textAlign: "center" },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
