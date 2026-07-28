import { Pressable, Text, View } from "react-native";

import { palette, spacing, typography } from "../design-tokens";
import { TOQUE } from "../../../design-system/tokens";
import { useTr } from "../../../lib/use-tr";

type StepHeaderBarProps = {
  protocolLabel: string;
  onBack: () => void;
  /** Título grande à direita (default "ACLS · Emergência"). */
  title?: string;
};

function StepHeaderBar({ protocolLabel, onBack, title = "ACLS · Emergência" }: StepHeaderBarProps) {
  const tr = useTr();
  return (
    <View
      style={{
        backgroundColor: "#383e4a",
        borderRadius: 22,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#565e6c",
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}>
      <Pressable
        onPress={onBack}
        style={{
          backgroundColor: "rgba(77,154,255,0.15)",
          paddingHorizontal: spacing.md,
          // 44 px é o mínimo do plano UI 2.0; antes eram 37 px. Terceiro botão de
          // voltar do app com o mesmo problema — os outros dois foram corrigidos
          // na Fase 3 (reference-back-header e module-back-to-hub). Fora da flag:
          // é segurança de toque, e este cabeçalho serve os 19 módulos do shell.
          minHeight: TOQUE.minimo,
          justifyContent: "center",
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "#7fb3ff",
        }}>
        <Text style={{ ...typography.small, color: "#7fb3ff", fontWeight: "800" }}>
          {tr("Voltar")}
        </Text>
      </Pressable>
      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <Text style={{ ...typography.small, color: palette.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>
          {tr(protocolLabel)}
        </Text>
        <Text style={{ ...typography.title, color: palette.text }}>{tr(title)}</Text>
      </View>
    </View>
  );
}

export default StepHeaderBar;
