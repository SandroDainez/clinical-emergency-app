import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type DecisionPromptOption = {
  id: string;
  label: string;
  onPress: () => void;
  tone?: "default" | "primary" | "critical";
};

export type DecisionPromptProps = {
  eyebrow?: string;
  question: string;
  supportText?: string;
  options: DecisionPromptOption[];
  onDontKnow?: () => void;
  dontKnowLabel?: string;
};

/**
 * Uma tela, uma decisão dominante.
 *
 * O componente reduz carga cognitiva e reserva um caminho explícito para quem
 * não sabe responder. O ramo "não sei" não é decoração: ele deve levar a uma
 * descoberta guiada no motor clínico.
 */
export function DecisionPrompt({
  eyebrow,
  question,
  supportText,
  options,
  onDontKnow,
  dontKnowLabel = "Não sei — me ajude",
}: DecisionPromptProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={e.wrapper} accessibilityRole="summary">
      <View style={e.questionBlock}>
        <Text style={e.eyebrow}>{eyebrow ?? "DECISÃO CLÍNICA"}</Text>
        <Text style={e.question}>{question}</Text>
      </View>

      {supportText ? (
        <View style={e.supportBlock}>
          <Text style={e.supportEyebrow}>PARA DECIDIR</Text>
          <Text style={e.support}>{supportText}</Text>
        </View>
      ) : null}

      <View style={e.options}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            onPress={option.onPress}
            style={({ pressed }) => [
              e.option,
              option.tone === "primary" && e.optionPrimary,
              option.tone === "critical" && e.optionCritical,
              pressed && e.pressed,
            ]}
          >
            <Text
              style={[
                e.optionLabel,
                option.tone === "primary" && e.optionLabelOnColor,
                option.tone === "critical" && e.optionLabelOnCritical,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {onDontKnow ? (
        <View style={e.assistedPath}>
          <Text style={e.assistedEyebrow}>SE A INFORMAÇÃO NÃO ESTÁ CLARA</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={dontKnowLabel}
            accessibilityHint="Abrir avaliação guiada para obter informação suficiente e voltar a esta decisão"
            onPress={onDontKnow}
            style={({ pressed }) => [e.dontKnow, pressed && e.pressed]}
          >
            <Text style={e.dontKnowLabel}>{dontKnowLabel}</Text>
            <Text style={e.dontKnowHint}>Abrir avaliação guiada e depois voltar à decisão</Text>
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
      borderColor: t.cores.border,
      padding: ESPACO.lg,
      gap: ESPACO.lg,
    },
    questionBlock: {
      gap: ESPACO.xs,
      paddingBottom: ESPACO.xs,
    },
    eyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.primary,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    question: {
      ...TIPOGRAFIA.step,
      color: t.cores.text,
      fontWeight: "900",
      lineHeight: 28,
    },
    supportBlock: {
      borderLeftWidth: 3,
      borderLeftColor: t.cores.border,
      paddingLeft: ESPACO.md,
      gap: 3,
    },
    supportEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    support: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary, fontWeight: "500" },
    options: { gap: ESPACO.sm },
    option: {
      minHeight: TOQUE.critico,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.md,
    },
    optionPrimary: {
      backgroundColor: t.cores.primary,
      borderColor: t.cores.primary,
    },
    optionCritical: {
      backgroundColor: t.cores.critical,
      borderColor: t.cores.critical,
    },
    optionLabel: { ...TIPOGRAFIA.body, color: t.cores.text, fontWeight: "800", textAlign: "center" },
    optionLabelOnColor: { color: t.cores.onPrimary },
    optionLabelOnCritical: { color: t.cores.onCritical },
    assistedPath: {
      borderTopWidth: 1,
      borderTopColor: t.cores.border,
      paddingTop: ESPACO.md,
      gap: ESPACO.sm,
    },
    assistedEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    dontKnow: {
      minHeight: TOQUE.critico,
      borderRadius: RAIO.botao,
      borderWidth: 1.5,
      borderColor: t.cores.primary,
      backgroundColor: t.cores.surface,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    dontKnowLabel: { ...TIPOGRAFIA.caption, color: t.cores.primary, fontWeight: "900" },
    dontKnowHint: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "500", textAlign: "center" },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
