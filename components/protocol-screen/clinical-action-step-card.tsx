import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ActionInteraction, TreeValues } from "../../core/decision-tree/types";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { Card, NumericStepper, Tag } from "../ui-v2";

export type ClinicalActionStepCardProps = {
  title: string;
  summary?: string;
  actions: readonly string[];
  interactions?: readonly ActionInteraction[];
  interactionValues?: TreeValues;
  canContinue?: boolean;
  onRecordValue?: (fieldId: string, value: string) => void;
  evidence?: ReactNode;
  rationale?: ReactNode;
  onAdvance: () => void;
  tr?: (text: string) => string;
  testID?: string;
};

export function ClinicalActionStepCard({
  title,
  summary,
  actions,
  interactions = [],
  interactionValues = {},
  canContinue = true,
  onRecordValue,
  evidence,
  rationale,
  onAdvance,
  tr = (text) => text,
  testID = "passo-de-conduta",
}: ClinicalActionStepCardProps) {
  const e = useEstilosDoTema(criarEstilos);
  const operacional = interactions.length > 0;
  const pendentes = interactions.filter((item) => !item.optional && interactionValues[item.id] === undefined).length;

  return (
    <View style={e.stack} testID={testID}>
      <Card tom="critical" style={e.card}>
        <Tag label={tr(operacional ? "Conduta — registrar execução" : "Conduta — fazer agora")} />
        <Text style={e.title}>{tr(title)}</Text>
        {summary ? <Text style={e.summary}>{tr(summary)}</Text> : null}

        <View style={e.executionBlock}>
          <Text style={e.executionEyebrow}>{tr(operacional ? "EXECUTE E REGISTRE" : "EXECUTE AGORA")}</Text>
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

        {operacional ? (
          <View style={e.operationalBlock}>
            <Text style={e.operationalTitle}>{tr("REGISTRO DO QUE FOI FEITO / ENCONTRADO")}</Text>
            {interactions.map((item) => {
              const atual = interactionValues[item.id];
              return (
                <View
                  key={item.id}
                  style={[
                    e.interactionCard,
                    item.kind === "number" ? e.interactionCardNumber : item.kind === "choice" ? e.interactionCardChoice : e.interactionCardConfirm,
                    atual !== undefined && e.interactionCardRecorded,
                  ]}
                  testID={`acao-${item.id}`}
                >
                  <View style={e.interactionHeader}>
                    <Text style={e.interactionLabel}>{tr(item.label)}</Text>
                    {atual !== undefined ? <Text style={e.recorded}>{tr("REGISTRADO")}</Text> : null}
                  </View>

                  {item.kind === "confirm" ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: atual !== undefined }}
                      onPress={() => onRecordValue?.(item.id, item.valueWhenDone ?? "feito")}
                      style={({ pressed }) => [e.confirmButton, atual !== undefined && e.confirmButtonDone, pressed && e.pressed]}
                    >
                      <Text style={[e.confirmText, atual !== undefined && e.confirmTextDone]}>
                        {atual !== undefined ? tr("✓ Realizado") : tr("Confirmar realização")}
                      </Text>
                    </Pressable>
                  ) : item.kind === "choice" ? (
                    <View style={e.choiceWrap}>
                      {item.options.map((option) => {
                        const selected = atual === option.value;
                        return (
                          <Pressable
                            key={option.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            onPress={() => onRecordValue?.(item.id, option.value)}
                            style={({ pressed }) => [e.choice, selected && e.choiceSelected, pressed && e.pressed]}
                          >
                            <Text style={[e.choiceText, selected && e.choiceTextSelected]}>{tr(option.label)}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <NumericStepper
                      valor={atual !== undefined && Number.isFinite(Number(atual)) ? Number(atual) : item.min}
                      valorVisivel={atual !== undefined}
                      onChange={(value) => onRecordValue?.(item.id, String(value))}
                      onConfirmar={(value) => onRecordValue?.(item.id, String(value))}
                      min={item.min}
                      max={item.max}
                      passo={item.step}
                      unidade={item.unit}
                      ajuda={atual === undefined ? tr("Valor ainda não informado — toque na barra para definir.") : undefined}
                      testID={`slider-${item.id}`}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ) : null}

        {evidence ? <View style={e.supportBlock}>{evidence}</View> : null}
        {rationale ? <View style={e.supportBlock}>{rationale}</View> : null}
      </Card>

      <View style={e.completionBlock}>
        <Text style={e.completionHint}>
          {operacional && pendentes > 0
            ? tr(`Defina o estado das ${pendentes} ação(ões) obrigatória(s) restante(s). Pendente é um estado válido quando oferecido.`)
            : tr("Depois de executar e conferir a conduta acima, registre a conclusão da etapa.")}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("Conduta executada — seguir para a próxima etapa")}
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
          onPress={onAdvance}
          style={({ pressed }) => [e.advance, !canContinue && e.advanceDisabled, pressed && canContinue && e.pressed]}
          testID="concluir-etapa"
        >
          <Text style={[e.advanceText, !canContinue && e.advanceTextDisabled]}>
            {canContinue ? tr("Feito — continuar ›") : tr("Complete os registros obrigatórios")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    stack: { gap: ESPACO.md },
    card: { gap: ESPACO.md },
    title: { ...TIPOGRAFIA.step, color: t.cores.text, fontWeight: "900" },
    summary: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary, fontWeight: "500" },
    executionBlock: {
      gap: ESPACO.sm,
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      padding: ESPACO.md,
    },
    executionEyebrow: { ...TIPOGRAFIA.micro, color: t.cores.critical, fontWeight: "900", letterSpacing: 0.7 },
    list: { gap: ESPACO.sm },
    row: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.sm },
    number: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.cores.critical,
      flexShrink: 0,
    },
    numberText: { ...TIPOGRAFIA.micro, color: t.cores.onCritical, fontWeight: "900" },
    itemText: { flex: 1, ...TIPOGRAFIA.body, color: t.cores.text, fontWeight: "700" },
    operationalBlock: { gap: ESPACO.sm },
    operationalTitle: { ...TIPOGRAFIA.caption, color: t.cores.primary, fontWeight: "900", letterSpacing: 0.5 },
    interactionCard: {
      gap: ESPACO.sm,
      borderWidth: 1,
      borderLeftWidth: 4,
      borderColor: t.cores.border,
      borderRadius: RAIO.input,
      padding: ESPACO.md,
      backgroundColor: t.cores.surface,
    },
    interactionCardConfirm: { borderLeftColor: t.cores.success },
    interactionCardChoice: { borderLeftColor: t.cores.primary },
    interactionCardNumber: { borderLeftColor: t.cores.warning },
    interactionCardRecorded: { borderColor: t.cores.success, backgroundColor: t.cores.bg },
    interactionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: ESPACO.sm },
    interactionLabel: { flex: 1, ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "800" },
    recorded: { ...TIPOGRAFIA.micro, color: t.cores.success, fontWeight: "900" },
    confirmButton: {
      minHeight: TOQUE.minimo,
      borderWidth: 1,
      borderColor: t.cores.border,
      borderRadius: RAIO.botao,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
    },
    confirmButtonDone: { borderColor: t.cores.success, backgroundColor: t.cores.bg },
    confirmText: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary, fontWeight: "800" },
    confirmTextDone: { color: t.cores.success },
    choiceWrap: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    choice: {
      minHeight: TOQUE.minimo,
      borderWidth: 1,
      borderColor: t.cores.border,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.md,
      alignItems: "center",
      justifyContent: "center",
    },
    choiceSelected: { borderColor: t.cores.primary, backgroundColor: t.cores.bg },
    choiceText: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "700" },
    choiceTextSelected: { color: t.cores.primary, fontWeight: "900" },
    supportBlock: { borderTopWidth: 1, borderTopColor: t.cores.border, paddingTop: ESPACO.sm },
    completionBlock: { gap: ESPACO.sm, alignItems: "center" },
    completionHint: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "500", textAlign: "center" },
    advance: {
      width: "100%",
      minHeight: Math.max(56, TOQUE.critico),
      borderRadius: RAIO.botao,
      borderWidth: 1.5,
      borderColor: t.cores.primary,
      backgroundColor: t.cores.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.lg,
      paddingVertical: ESPACO.md,
    },
    advanceDisabled: { borderColor: t.cores.border, backgroundColor: t.cores.surface },
    advanceText: { ...TIPOGRAFIA.body, color: t.cores.onPrimary, fontWeight: "900", textAlign: "center", letterSpacing: 0.2 },
    advanceTextDisabled: { color: t.cores.textSecondary },
    pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  });
