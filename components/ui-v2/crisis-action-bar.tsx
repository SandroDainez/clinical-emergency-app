import { useState } from "react";
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
 * Porta persistente para deterioração clínica.
 *
 * Mantém acesso imediato às intercorrências sem ocupar o espaço da decisão
 * principal quando o paciente está estável. Ao abrir, revela exatamente as
 * mesmas ações/rotas fornecidas pelo shell; não diagnostica nem muda fluxo.
 */
export function CrisisActionBar({ actions }: CrisisActionBarProps) {
  const e = useEstilosDoTema(criarEstilos);
  const [expanded, setExpanded] = useState(false);
  const visible = actions.slice(0, 4);

  if (!visible.length) return null;

  return (
    <View style={e.wrapper} accessibilityLabel="Ações de emergência">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Fechar ações de intercorrência" : "Abrir ações de intercorrência"}
        accessibilityHint="Use se o paciente apresentar piora súbita"
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [e.trigger, expanded && e.triggerExpanded, pressed && e.pressed]}
      >
        <View style={e.triggerLead}>
          <View style={e.urgentDot} />
          <View style={e.triggerCopy}>
            <Text style={e.triggerLabel}>PACIENTE PIOROU?</Text>
            <Text style={e.triggerHint}>Abrir intercorrências sem perder o fluxo atual</Text>
          </View>
        </View>
        <Text style={e.triggerChevron}>{expanded ? "⌃" : "⌄"}</Text>
      </Pressable>

      {expanded ? (
        <View style={e.expandedBlock}>
          <Text style={e.eyebrow}>INTERCORRÊNCIA / PIORA SÚBITA</Text>
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
      ) : null}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: ESPACO.sm,
      paddingTop: ESPACO.xs,
      paddingBottom: ESPACO.sm,
      borderTopWidth: 1,
      borderTopColor: t.cores.border,
      backgroundColor: t.cores.surface,
      gap: ESPACO.sm,
    },
    trigger: {
      minHeight: TOQUE.minimo,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.xs,
    },
    triggerExpanded: {
      borderColor: t.cores.critical,
    },
    triggerLead: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
    },
    urgentDot: {
      width: 9,
      height: 9,
      borderRadius: 999,
      backgroundColor: t.cores.critical,
    },
    triggerCopy: {
      flex: 1,
      minWidth: 0,
      gap: 1,
    },
    triggerLabel: {
      ...TIPOGRAFIA.micro,
      color: t.cores.text,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    triggerHint: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
    triggerChevron: {
      ...TIPOGRAFIA.body,
      color: t.cores.textSecondary,
      fontWeight: "900",
      width: 24,
      textAlign: "center",
    },
    expandedBlock: {
      gap: ESPACO.sm,
    },
    eyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "900",
      letterSpacing: 0.5,
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
