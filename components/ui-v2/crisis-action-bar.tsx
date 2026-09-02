import { useEffect, useState } from "react";
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
  /** Mudou a etapa clínica: a porta volta recolhida para a tela nascer previsível. */
  resetKey?: string | number;
};

/**
 * Porta persistente para deterioração clínica.
 *
 * Regra visual deliberada: tudo que executa uma ação precisa PARECER botão.
 * Informação clínica permanece texto/status; ação recebe superfície própria,
 * borda forte e um CTA explícito. O médico não deve precisar "testar" a tela
 * para descobrir onde é clicável.
 */
export function CrisisActionBar({ actions, resetKey }: CrisisActionBarProps) {
  const e = useEstilosDoTema(criarEstilos);
  const [expanded, setExpanded] = useState(false);
  const visible = actions;

  useEffect(() => {
    setExpanded(false);
  }, [resetKey]);

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
            <Text style={e.triggerHint}>Intercorrências sem perder o fluxo atual</Text>
          </View>
        </View>
        <View style={[e.triggerCta, expanded && e.triggerCtaExpanded]}>
          <Text style={[e.triggerCtaText, expanded && e.triggerCtaTextExpanded]}>
            {expanded ? "FECHAR" : "ABRIR"}
          </Text>
          <Text style={[e.triggerCtaArrow, expanded && e.triggerCtaTextExpanded]}>
            {expanded ? "▲" : "▼"}
          </Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={e.expandedBlock}>
          <Text style={e.eyebrow}>INTERCORRÊNCIA / PIORA SÚBITA</Text>
          <View style={e.actionsRow}>
            {visible.map((action) => (
              <Pressable
                key={action.id}
                accessibilityRole="button"
                accessibilityLabel={`Abrir módulo ${action.label}`}
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
                <View style={[e.actionCta, action.critical && e.actionCtaCritical]}>
                  <Text style={[e.actionCtaText, action.critical && e.actionCtaTextCritical]}>
                    ABRIR MÓDULO
                  </Text>
                  <Text style={[e.actionCtaArrow, action.critical && e.actionCtaTextCritical]}>›</Text>
                </View>
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
      minHeight: TOQUE.critico,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: t.cores.critical,
      backgroundColor: t.cores.bg,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    triggerExpanded: {
      backgroundColor: t.cores.surface,
    },
    triggerLead: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
    },
    urgentDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      backgroundColor: t.cores.critical,
    },
    triggerCopy: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    triggerLabel: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    triggerHint: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "600",
    },
    triggerCta: {
      minHeight: 36,
      minWidth: 88,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: RAIO.badge,
      backgroundColor: t.cores.critical,
      borderWidth: 1,
      borderColor: t.cores.critical,
      paddingHorizontal: ESPACO.sm,
    },
    triggerCtaExpanded: {
      backgroundColor: "transparent",
    },
    triggerCtaText: {
      ...TIPOGRAFIA.micro,
      color: t.cores.onCritical,
      fontWeight: "900",
      letterSpacing: 0.6,
    },
    triggerCtaTextExpanded: {
      color: t.cores.critical,
    },
    triggerCtaArrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.onCritical,
      fontWeight: "900",
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
      flexWrap: "wrap",
      gap: ESPACO.sm,
    },
    action: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 180,
      minHeight: TOQUE.critico + 16,
      minWidth: TOQUE.minimo,
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: t.cores.primary,
      backgroundColor: t.cores.bg,
    },
    critical: {
      backgroundColor: t.cores.critical,
      borderColor: t.cores.critical,
    },
    label: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "900",
      textAlign: "left",
    },
    criticalLabel: { color: t.cores.onCritical },
    actionCta: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: RAIO.badge,
      backgroundColor: t.cores.primary,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: 5,
    },
    actionCtaCritical: {
      backgroundColor: t.cores.onCritical,
    },
    actionCtaText: {
      fontSize: 9,
      lineHeight: 11,
      color: t.cores.onPrimary,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    actionCtaTextCritical: {
      color: t.cores.critical,
    },
    actionCtaArrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.onPrimary,
      fontWeight: "900",
    },
    pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  });
