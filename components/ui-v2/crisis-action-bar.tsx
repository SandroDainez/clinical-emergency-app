import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type CrisisAction = {
  id: string;
  label: string;
  onPress: () => void;
  critical?: boolean;
};

export type CrisisActionBarProps = {
  actions: CrisisAction[];
};

/**
 * Atalhos persistentes para deterioração clínica.
 *
 * Não substitui o fluxo e não diagnostica. Apenas mantém portas de escape
 * disponíveis quando o paciente piora de forma incompatível com a etapa atual.
 */
export function CrisisActionBar({ actions }: CrisisActionBarProps) {
  const e = useEstilosDoTema(criarEstilos);
  const visible = actions.slice(0, 4);

  if (!visible.length) return null;

  return (
    <View style={e.wrapper} accessibilityLabel="Ações de emergência">
      <View style={e.headingRow}>
        <Text style={e.eyebrow}>INTERCORRÊNCIA / PIORA SÚBITA</Text>
        <Text style={e.hint}>Acesso imediato sem perder o fluxo atual</Text>
      </View>

      <View style={e.actionsRow}>
        {visible.map((action) => (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            style={({ pressed }) => [
              e.action,
              action.critical && e.critical,
              pressed && e.pressed,
            ]}
          >
            <Text style={[e.label, action.critical && e.criticalLabel]} numberOfLines={2}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    wrapper: {
      gap: ESPACO.sm,
      paddingHorizontal: ESPACO.sm,
      paddingTop: ESPACO.sm,
      paddingBottom: ESPACO.md,
      borderTopWidth: 1,
      borderTopColor: t.cores.border,
      backgroundColor: t.cores.surface,
    },
    headingRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    },
    eyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "900",
      letterSpacing: 0.5,
      flexShrink: 0,
    },
    hint: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
      textAlign: "right",
      flex: 1,
    },
    actionsRow: {
      flexDirection: "row",
      gap: ESPACO.sm,
    },
    action: {
      flex: 1,
      minHeight: TOQUE.critico,
      minWidth: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
    },
    critical: {
      backgroundColor: t.cores.critical,
      borderColor: t.cores.critical,
    },
    label: {
      ...TIPOGRAFIA.micro,
      color: t.cores.text,
      fontWeight: "800",
      textAlign: "center",
    },
    criticalLabel: { color: t.cores.onCritical },
    pressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
  });
