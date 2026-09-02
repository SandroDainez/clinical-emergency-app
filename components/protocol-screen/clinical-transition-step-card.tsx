import { Pressable, StyleSheet, Text, View } from "react-native";

import type { FrontendTreeStep } from "../../core/decision-tree/types";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { Card, Tag } from "../ui-v2";

type TransitionStep = Extract<FrontendTreeStep, { kind: "transition" }>;

export type ClinicalTransitionStepCardProps = {
  title: string;
  summary?: string;
  disposition: TransitionStep["disposition"];
  exitCriteria: readonly string[];
  targets: TransitionStep["targets"];
  onOpenModule: (moduleId: string) => void;
  tr?: (text: string) => string;
  testID?: string;
};

const DISPOSITION_LABEL: Record<TransitionStep["disposition"], string> = {
  discharge: "Alta / observação domiciliar",
  observation: "Observação monitorizada",
  icu: "UTI / cuidado intensivo",
  other_module: "Transição de guia",
};

/**
 * Apresentação isolada de uma etapa de TRANSIÇÃO/DESTINO.
 *
 * Não decide destino, não altera moduleId, não reavalia critérios e não executa
 * handoff. Recebe tudo pronto do shell e apenas deixa claro que o fluxo chegou a
 * um destino, diferente de uma decisão ou de uma conduta clínica.
 */
export function ClinicalTransitionStepCard({
  title,
  summary,
  disposition,
  exitCriteria,
  targets,
  onOpenModule,
  tr = (text) => text,
  testID = "passo-de-transicao",
}: ClinicalTransitionStepCardProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={e.stack} testID={testID}>
      <Card tom="primary" style={e.card}>
        <Tag label={tr("Destino do atendimento")} />
        <Text style={e.destination}>{tr(DISPOSITION_LABEL[disposition])}</Text>
        <Text style={e.title}>{tr(title)}</Text>
        {summary ? <Text style={e.summary}>{tr(summary)}</Text> : null}

        {exitCriteria.length ? (
          <View style={e.criteriaBlock}>
            <Text style={e.eyebrow}>{tr("ANTES DE ENCERRAR ESTA ETAPA")}</Text>
            <View style={e.list}>
              {exitCriteria.map((item, index) => (
                <View key={index} style={e.row}>
                  <Text style={e.dot}>•</Text>
                  <Text style={e.item}>{tr(item)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </Card>

      {targets.length ? (
        <View style={e.targetsBlock}>
          <Text style={e.targetsEyebrow}>{tr("CONTINUAR EM OUTRO MÓDULO")}</Text>
          {targets.map((target) => (
            <Pressable
              key={target.moduleId}
              accessibilityRole="button"
              accessibilityLabel={`${tr(target.label)} — ${tr(target.reason)}`}
              onPress={() => onOpenModule(target.moduleId)}
              style={({ pressed }) => [e.targetButton, pressed && e.pressed]}
            >
              <View style={e.targetCopy}>
                <Text style={e.targetLabel}>{tr(target.label)}</Text>
                <Text style={e.targetReason}>{tr(target.reason)}</Text>
              </View>
              <Text style={e.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    stack: { gap: ESPACO.md },
    card: { gap: ESPACO.md },
    destination: {
      ...TIPOGRAFIA.micro,
      color: t.cores.primary,
      fontWeight: "900",
      letterSpacing: 0.7,
    },
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
    criteriaBlock: {
      gap: ESPACO.sm,
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      padding: ESPACO.md,
    },
    eyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    list: { gap: ESPACO.xs },
    row: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.sm },
    dot: {
      ...TIPOGRAFIA.body,
      color: t.cores.primary,
      fontWeight: "900",
      lineHeight: 22,
    },
    item: {
      flex: 1,
      ...TIPOGRAFIA.body,
      color: t.cores.text,
      fontWeight: "600",
    },
    targetsBlock: { gap: ESPACO.sm },
    targetsEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    targetButton: {
      minHeight: TOQUE.critico,
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.surface,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    targetCopy: { flex: 1, gap: 2 },
    targetLabel: {
      ...TIPOGRAFIA.caption,
      color: t.cores.primary,
      fontWeight: "900",
    },
    targetReason: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
    chevron: {
      ...TIPOGRAFIA.step,
      color: t.cores.primary,
      fontWeight: "900",
    },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
