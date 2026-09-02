import { StyleSheet, Text, View } from "react-native";

import type { PcrInheritedContextViewModel } from "../../lib/pcr-handoff-context-adapter";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type PcrInheritedContextCardProps = {
  model: PcrInheritedContextViewModel;
  now?: number;
};

function formatAge(recordedAt: number | undefined, now: number): string {
  if (!recordedAt) return "horário não registrado";
  const seconds = Math.max(0, Math.floor((now - recordedAt) / 1000));
  if (seconds < 60) return "registrado agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `há ${hours} h ${remainder} min` : `há ${hours} h`;
}

/**
 * Contexto herdado é histórico e informativo. Este card não executa ação,
 * não cria botão e não interfere no algoritmo/temporizadores da PCR.
 *
 * O objetivo visual é impedir que um fato pré-PCR seja confundido com o estado
 * atual durante a ressuscitação: origem e idade permanecem visíveis em cada linha.
 */
export default function PcrInheritedContextCard({
  model,
  now = Date.now(),
}: PcrInheritedContextCardProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={e.card} accessibilityRole="summary">
      <View style={e.heading}>
        <Text style={e.eyebrow}>CONTEXTO PRÉ-PCR · {model.sourceLabel}</Text>
        <Text style={e.title}>{model.title}</Text>
      </View>

      <View style={e.historyNotice}>
        <Text style={e.historyEyebrow}>INFORMAÇÃO HISTÓRICA</Text>
        <Text style={e.historyText}>
          Use estes dados apenas para entender o que ocorreu antes da perda do pulso. O estado atual deve ser reavaliado durante a PCR.
        </Text>
      </View>

      <Text style={e.noDelayNote}>
        Não atrasar a reanimação para completar informações ausentes.
      </Text>

      <View style={e.list}>
        {model.items.map((item) => (
          <View key={item.id} style={e.row}>
            <View style={e.main}>
              <Text style={e.label}>{item.label}</Text>
              <Text style={item.missing ? e.missingValue : e.value}>{item.value}</Text>
              <View style={e.metaRow}>
                <Text style={e.preArrestLabel}>ANTES DA PCR</Text>
                <Text style={[e.age, item.missing && e.ageMissing]}>
                  {formatAge(item.recordedAt, now)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderLeftWidth: 5,
      borderColor: t.cores.border,
      borderLeftColor: t.cores.primary,
      borderRadius: RAIO.card,
      backgroundColor: t.cores.surface,
      padding: ESPACO.md,
      gap: ESPACO.md,
    },
    heading: {
      gap: 3,
    },
    eyebrow: {
      ...TIPOGRAFIA.micro,
      fontWeight: "900",
      letterSpacing: 0.7,
      color: t.cores.primary,
    },
    title: {
      ...TIPOGRAFIA.step,
      fontWeight: "800",
      color: t.cores.text,
    },
    historyNotice: {
      borderRadius: RAIO.input,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      padding: ESPACO.sm,
      gap: 3,
    },
    historyEyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    historyText: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "600",
    },
    noDelayNote: {
      ...TIPOGRAFIA.micro,
      color: t.cores.warning,
      fontWeight: "800",
    },
    list: {
      gap: ESPACO.sm,
    },
    row: {
      minHeight: 58,
      paddingTop: ESPACO.sm,
      borderTopWidth: 1,
      borderTopColor: t.cores.border,
    },
    main: {
      gap: 3,
    },
    label: {
      ...TIPOGRAFIA.micro,
      fontWeight: "700",
      color: t.cores.textSecondary,
    },
    value: {
      ...TIPOGRAFIA.caption,
      fontWeight: "800",
      color: t.cores.text,
    },
    missingValue: {
      ...TIPOGRAFIA.caption,
      fontWeight: "800",
      color: t.cores.warning,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: ESPACO.xs,
    },
    preArrestLabel: {
      fontSize: 9,
      lineHeight: 11,
      color: t.cores.textSecondary,
      fontWeight: "900",
      letterSpacing: 0.6,
    },
    age: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "600",
    },
    ageMissing: {
      color: t.cores.warning,
      fontWeight: "700",
    },
  });
