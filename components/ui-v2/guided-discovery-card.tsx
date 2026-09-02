import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type GuidedDiscoveryVisualStep = {
  id: string;
  label: string;
  detail: string;
};

export type GuidedDiscoveryCardProps = {
  eyebrow?: string;
  title: string;
  sourceLabel?: string;
  steps: readonly GuidedDiscoveryVisualStep[];
  sufficientWhen: string;
  returnLabel?: string;
  onReturn?: () => void;
};

/**
 * Apresentação de descoberta guiada. Não contém regra clínica: recebe texto e
 * passos já derivados do domínio e apenas os torna acionáveis/legíveis.
 */
export function GuidedDiscoveryCard({
  eyebrow = "NÃO SEI — VAMOS DESCOBRIR",
  title,
  sourceLabel,
  steps,
  sufficientWhen,
  returnLabel = "Voltar à decisão",
  onReturn,
}: GuidedDiscoveryCardProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={e.wrapper} accessibilityRole="summary">
      <View style={e.heading}>
        <Text style={e.eyebrow}>{eyebrow}</Text>
        {sourceLabel ? <Text style={e.source}>{sourceLabel}</Text> : null}
      </View>

      <Text style={e.title}>{title}</Text>

      <View style={e.steps}>
        {steps.slice(0, 3).map((step, index) => (
          <View key={step.id} style={e.step}>
            <View style={e.numberBadge}>
              <Text style={e.numberText}>{index + 1}</Text>
            </View>
            <View style={e.stepBody}>
              <Text style={e.stepLabel}>{step.label}</Text>
              <Text style={e.stepDetail}>{step.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={e.sufficientBox}>
        <Text style={e.sufficientEyebrow}>QUANDO JÁ É SUFICIENTE</Text>
        <Text style={e.sufficientText}>{sufficientWhen}</Text>
      </View>

      {onReturn ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={returnLabel}
          onPress={onReturn}
          style={({ pressed }) => [e.returnButton, pressed && e.pressed]}
        >
          <Text style={e.returnButtonText}>{returnLabel}</Text>
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
      borderColor: t.cores.border,
      padding: ESPACO.lg,
      gap: ESPACO.md,
    },
    heading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    },
    eyebrow: { ...TIPOGRAFIA.micro, color: t.cores.primary, fontWeight: "900", flex: 1 },
    source: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "700" },
    title: { ...TIPOGRAFIA.step, color: t.cores.text, fontWeight: "800" },
    steps: { gap: ESPACO.md },
    step: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.md },
    numberBadge: {
      minWidth: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: t.cores.bg,
      borderWidth: 1,
      borderColor: t.cores.border,
      alignItems: "center",
      justifyContent: "center",
    },
    numberText: { ...TIPOGRAFIA.caption, color: t.cores.primary, fontWeight: "900" },
    stepBody: { flex: 1, gap: ESPACO.xs },
    stepLabel: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    stepDetail: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary, fontWeight: "500" },
    sufficientBox: {
      backgroundColor: t.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      padding: ESPACO.md,
      gap: ESPACO.xs,
    },
    sufficientEyebrow: { ...TIPOGRAFIA.micro, color: t.cores.success, fontWeight: "900" },
    sufficientText: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "600" },
    returnButton: {
      minHeight: TOQUE.minimo,
      borderRadius: RAIO.botao,
      backgroundColor: t.cores.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    returnButtonText: { ...TIPOGRAFIA.caption, color: t.cores.onPrimary, fontWeight: "900" },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
