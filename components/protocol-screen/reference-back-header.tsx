import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { palette, spacing, typography } from "./design-tokens";
import { useTr } from "../../lib/use-tr";

/**
 * Cabeçalho das telas de referência ACLS (Ritmos, Farmacologia, Hs/Ts, Pós-PCR).
 * Mesmo visual em card do StepHeaderBar usado pelas telas de fluxo, para que as
 * telas de referência tenham a MESMA aparência dos demais módulos.
 * router.back() retorna para onde o usuário estava, preservando o estado do PCR.
 *
 * `label` no formato "ACLS · Título" é dividido em sobretítulo + título grande.
 */
export default function ReferenceBackHeader({ label }: { label: string }) {
  const tr = useTr();
  const router = useRouter();

  const parts = label.split("·").map((p) => p.trim());
  const eyebrow = parts.length > 1 ? parts[0] : "ACLS";
  const title = parts.length > 1 ? parts.slice(1).join(" · ") : label;

  return (
    <View
      style={{
        backgroundColor: "#262a32",
        borderRadius: 22,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#3a404a",
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => router.back()}
        style={({ pressed }) => [
          {
            backgroundColor: "rgba(77,154,255,0.15)",
            paddingHorizontal: spacing.md,
            paddingVertical: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "#4d9aff",
          },
          pressed && { opacity: 0.85 },
        ]}>
        <Text style={{ ...typography.small, color: "#4d9aff", fontWeight: "800" }}>{tr("Voltar")}</Text>
      </Pressable>
      <View style={{ alignItems: "flex-end", gap: 2, flexShrink: 1, paddingLeft: 12 }}>
        <Text
          style={{
            ...typography.small,
            color: palette.muted,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}>
          {eyebrow}
        </Text>
        <Text style={{ ...typography.title, color: palette.text }} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}
