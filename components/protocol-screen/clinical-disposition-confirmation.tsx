import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import {
  confirmExternalClinicalDisposition,
  getConfirmableExternalDisposition,
} from "../../lib/clinical-disposition-runtime";
import { useTr } from "../../lib/use-tr";
import { Card, Tag } from "../ui-v2";

export type ClinicalDispositionConfirmationProps = {
  protocolId: string;
  sourceNodeId: string;
};

/**
 * Confirmação documental de DESTINO REALIZADO.
 *
 * Não aparece em transições internas e não registra nada ao montar/renderizar.
 * O primeiro toque apenas abre a confirmação; somente o segundo toque afirmativo
 * chama o runtime append-only. O runtime é idempotente por transitionId.
 */
export function ClinicalDispositionConfirmation({
  protocolId,
  sourceNodeId,
}: ClinicalDispositionConfirmationProps) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const [confirming, setConfirming] = useState(false);
  const [, setRevision] = useState(0);
  const disposition = getConfirmableExternalDisposition({ protocolId, sourceNodeId });

  if (!disposition) return null;

  if (disposition.confirmed) {
    return (
      <Card tom="success" style={e.card} testID="destino-transferencia-confirmado">
        <Tag label={tr("Destino registrado")} />
        <Text style={e.title}>{tr(disposition.label)}</Text>
        <Text style={e.body}>
          {tr("Transferência registrada no histórico deste atendimento.")}
        </Text>
      </Card>
    );
  }

  if (confirming) {
    return (
      <Card tom="warning" style={e.card} testID="confirmar-destino-transferencia">
        <Tag label={tr("Confirmação necessária")} />
        <Text style={e.title}>{tr(disposition.label)}</Text>
        <Text style={e.body}>
          {tr("Registre somente se a transferência para este destino realmente foi efetivada.")}
        </Text>
        <View style={e.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirming(false)}
            style={({ pressed }) => [e.secondaryButton, pressed && e.pressed]}
          >
            <Text style={e.secondaryText}>{tr("Cancelar")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${tr("Confirmar transferência realizada para")} ${tr(disposition.label)}`}
            onPress={() => {
              confirmExternalClinicalDisposition({ transitionId: disposition.transitionId });
              setConfirming(false);
              setRevision((value) => value + 1);
            }}
            style={({ pressed }) => [e.primaryButton, pressed && e.pressed]}
            testID="confirmar-transferencia-realizada"
          >
            <Text style={e.primaryText}>{tr("Confirmar transferência realizada")}</Text>
          </Pressable>
        </View>
      </Card>
    );
  }

  return (
    <Card tom="neutral" style={e.card} testID="registrar-destino-transferencia">
      <Tag label={tr("Registro de destino")} />
      <Text style={e.title}>{tr(disposition.label)}</Text>
      <Text style={e.body}>
        {tr("A indicação de destino não registra a transferência automaticamente.")}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setConfirming(true)}
        style={({ pressed }) => [e.openButton, pressed && e.pressed]}
      >
        <Text style={e.openText}>{tr("Registrar transferência")}</Text>
      </Pressable>
    </Card>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    card: { gap: ESPACO.sm },
    title: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "900",
    },
    body: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
      fontWeight: "500",
    },
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: ESPACO.sm,
    },
    openButton: {
      minHeight: TOQUE.critico,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1.5,
      borderColor: t.cores.primary,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    openText: {
      ...TIPOGRAFIA.caption,
      color: t.cores.primary,
      fontWeight: "900",
    },
    primaryButton: {
      minHeight: TOQUE.critico,
      flex: 1,
      minWidth: 210,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      backgroundColor: t.cores.primary,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    primaryText: {
      ...TIPOGRAFIA.caption,
      color: t.cores.onPrimary,
      fontWeight: "900",
      textAlign: "center",
    },
    secondaryButton: {
      minHeight: TOQUE.critico,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    secondaryText: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "800",
    },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  });
