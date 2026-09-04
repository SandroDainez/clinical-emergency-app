import { StyleSheet, Text, View } from "react-native";

import { SafetyGate } from "./ui-v2/safety-gate";
import { ESPACO, TIPOGRAFIA } from "../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../design-system/theme";

export type ClinicalCaseRecoveryGateProps = {
  caseId: string;
  protocolId?: string;
  startedAt: number;
  onDiscardAndStartNew: () => void;
};

export default function ClinicalCaseRecoveryGate({
  caseId,
  protocolId,
  startedAt,
  onDiscardAndStartNew,
}: ClinicalCaseRecoveryGateProps) {
  const e = useEstilosDoTema(criarEstilos);
  const startedLabel = new Date(startedAt).toLocaleString();

  return (
    <View style={e.root}>
      <SafetyGate
        severity="critical"
        title="Atendimento anterior interrompido por recarregamento"
        message="O app detectou um caso clínico que estava ativo antes do reload, mas o estado completo desse atendimento ainda não pode ser reconstruído com segurança. Para evitar repetição silenciosa de medicação, choque, trombólise ou outra intervenção, não será iniciado um novo fluxo automaticamente. Reconcilie o que já foi realizado antes de descartar este caso."
        primaryLabel="Descartar atendimento anterior e iniciar um novo caso"
        onPrimary={onDiscardAndStartNew}
      />
      <View style={e.meta}>
        <Text style={e.metaTitle}>Referência do atendimento interrompido</Text>
        <Text style={e.metaText}>Caso: {caseId}</Text>
        {protocolId ? <Text style={e.metaText}>Protocolo: {protocolId}</Text> : null}
        <Text style={e.metaText}>Iniciado: {startedLabel}</Text>
        <Text style={e.warningText}>
          Esta barreira é deliberadamente fail-closed. Ela não afirma que o estado anterior foi restaurado.
        </Text>
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: "center",
      padding: ESPACO.lg,
      gap: ESPACO.md,
      backgroundColor: t.cores.bg,
    },
    meta: {
      gap: ESPACO.xs,
      paddingHorizontal: ESPACO.xs,
    },
    metaTitle: {
      ...TIPOGRAFIA.caption,
      color: t.cores.text,
      fontWeight: "700",
    },
    metaText: {
      ...TIPOGRAFIA.micro,
      color: t.cores.textSecondary,
    },
    warningText: {
      ...TIPOGRAFIA.micro,
      color: t.cores.warning,
      fontWeight: "700",
      marginTop: ESPACO.xs,
    },
  });
