import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

/**
 * Cabeçalho com botão "Voltar" para as telas de referência ACLS.
 * router.back() retorna para onde o usuário estava (protocolo de PCR ou hub),
 * preservando o estado do protocolo via markProtocolSessionForResume.
 */
export default function ReferenceBackHeader({ label }: { label: string }) {
  const router = useRouter();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 4,
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => router.back()}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: "rgba(14,116,144,0.18)",
            borderWidth: 1,
            borderColor: "#0e7490",
            borderRadius: 999,
            paddingHorizontal: 16,
            paddingVertical: 10,
          },
          pressed && { opacity: 0.85 },
        ]}>
        <Text style={{ fontSize: 15, fontWeight: "800", color: "#22d3ee" }}>‹ Voltar</Text>
      </Pressable>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "800",
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
