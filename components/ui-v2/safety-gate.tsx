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
      <View style={e.heading}>
        <Text style={[e.eyebrow, critical && e.eyebrowCritical]}>
          {critical ? "BARREIRA DE SEGURANÇA" : "ATENÇÃO ANTES DE PROSSEGUIR"}
        </Text>
        <Text style={[e.title, critical && e.titleCritical]}>{title}</Text>
      </View>

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
        <View style={e.overrideBlock}>
          <Text style={e.overrideEyebrow}>EXCEÇÃO</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={overrideLabel}
            onPress={onOverride}
            style={({ pressed }) => [e.override, pressed && e.pressed]}
          >
            <Text style={e.overrideLabel}>{overrideLabel}</Text>
            <Text style={e.overrideHint}>A exceção deve ser registrada no atendimento</Text>
          </Pressable>
        </View>
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
      borderLeftWidth: 6,
      borderColor: t.cores.warning,
      padding: ESPACO.lg,
      gap: ESPACO.md,
    },
    wrapperCritical: { borderColor: t.cores.critical },
    heading: { gap: ESPACO.xs },
    eyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.warning,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    eyebrowCritical: { color: t.cores.critical },
    title: { ...TIPOGRAFIA.step, color: t.cores.text, fontWeight: "800" },
    titleCritical: { color: t.cores.text },
    message: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "500" },
    primary: {
      minHeight: TOQUE.critico,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      backgroundColor: t.cores.warning,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.md,
    },
    primaryCritical: { backgroundColor: t.cores.critical },
    primaryLabel: { ...TIPOGRAFIA.body, color: t.cores.bg, fontWeight: "800", textAlign: "center" },
    primaryCriticalLabel: { color: t.cores.onCritical },
    overrideBlock: {
      borderTopWidth: 1,
      borderTopColor: t.cores.border,
      paddingTop: ESPACO.sm,
      gap: ESPACO.xs,
    },
    overrideEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "700",
      letterSpacing: 0.6,
    },
    override: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      gap: 2,
    },
    overrideLabel: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "700" },
    overrideHint: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "400", textAlign: "center" },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
