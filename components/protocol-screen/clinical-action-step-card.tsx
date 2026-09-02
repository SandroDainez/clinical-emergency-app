import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { Card, Tag } from "../ui-v2";

export type ClinicalActionStepCardProps = {
  title: string;
  summary?: string;
  actions: readonly string[];
  evidence?: ReactNode;
  rationale?: ReactNode;
  onAdvance: () => void;
  tr?: (text: string) => string;
  testID?: string;
};

/**
 * Apresentação isolada da etapa de CONDUTA.
 *
 * Recebe a decisão já tomada pelo fluxo e não avalia gate, indicação, dose,
 * precedência ou elegibilidade. O componente apenas separa visualmente:
 *   1) o que deve ser executado agora;
 *   2) a procedência/justificativa recebida do chamador;
 *   3) o gesto de concluir a etapa e seguir.
 */
export function ClinicalActionStepCard({
  title,
  summary,
  actions,
  evidence,
  rationale,
  onAdvance,
  tr = (text) => text,
  testID = "passo-de-conduta",
}: ClinicalActionStepCardProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={e.stack} testID={testID}>
      <Card tom="critical" style={e.card}>
        <Tag label={tr("Conduta — fazer agora")} />
        <Text style={e.title}>{tr(title)}</Text>
        {summary ? <Text style={e.summary}>{tr(summary)}</Text> : null}

        <View style={e.executionBlock}>
          <Text style={e.executionEyebrow}>{tr("EXECUTE AGORA")}</Text>
          <View style={e.list}>
            {actions.map((item, index) => (
              <View key={index} style={e.row}>
                <View style={e.number}>
                  <Text style={e.numberText}>{index + 1}</Text>
                </View>
                <Text style={e.itemText}>{tr(item)}</Text>
              </View>
            ))}
          </View>
        </View>

        {evidence ? <View style={e.supportBlock}>{evidence}</View> : null}
        {rationale ? <View style={e.supportBlock}>{rationale}</View> : null}
      </Card>

      <View style={e.completionBlock}>
        <Text style={e.completionHint}>
          {tr("Depois de executar e conferir a conduta acima, registre a conclusão da etapa.")}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("Conduta executada — seguir para a próxima etapa")}
          onPress={onAdvance}
          style={({ pressed }) => [e.advance, pressed && e.pressed]}
        >
          <Text style={e.advanceEyebrow}>{tr("ETAPA CONCLUÍDA")}</Text>
          <Text style={e.advanceText}>{tr("Feito — continuar ›")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    stack: { gap: ESPACO.md },
    card: { gap: ESPACO.md },
    title: {
      ...TIPOGRAFIA.step,
      color: t.cores.text,
      fontWeight: "900",
    },
    summary: {
      ...TIPOGRAFIA.caption,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
    executionBlock: {
      gap: ESPACO.sm,
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      padding: ESPACO.md,
    },
    executionEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.critical,
      fontWeight: "900",
      letterSpacing: 0.7,
    },
    list: { gap: ESPACO.sm },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: ESPACO.sm,
    },
    number: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.cores.critical,
      flexShrink: 0,
    },
    numberText: {
      ...TIPOGRAFIA.micro,
      color: t.cores.onCritical,
      fontWeight: "900",
    },
    itemText: {
      flex: 1,
      ...TIPOGRAFIA.body,
      color: t.cores.text,
      fontWeight: "700",
    },
    supportBlock: {
      borderTopWidth: 1,
      borderTopColor: t.cores.border,
      paddingTop: ESPACO.sm,
    },
    completionBlock: {
      gap: ESPACO.sm,
    },
    completionHint: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
      textAlign: "center",
    },
    advance: {
      minHeight: TOQUE.critico,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.surface,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      gap: 2,
    },
    advanceEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    advanceText: {
      ...TIPOGRAFIA.caption,
      color: t.cores.primary,
      fontWeight: "900",
      textAlign: "center",
    },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
