import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppDesign } from "../constants/app-design";

type Props = { onAccept: () => void };

export default function VentilationConsentScreen({ onAccept }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Ventilação mecânica</Text>
          <Text style={styles.title}>Regulagem com explicação passo a passo</Text>
          <Text style={styles.subtitle}>
            Informe cenário clínico, peso, altura e parâmetros do ventilador. O app calcula metas (ex.: volume por kg de
            peso predito) e explica em linguagem simples o que ajustar na máquina — para quem não usa ventilador todos os
            dias.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.featureList}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🧮</Text>
              <Text style={styles.featureText}>Peso predito (PBW) e relação Vt/kg para estratégia protetora</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>Cenários: ARDS, obstrutivo, pós-operatório, neuro, acidose metabólica</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>📟</Text>
              <Text style={styles.featureText}>Passo a passo no monitor do ventilador (menu, FR, PEEP, alarmes)</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            Conteúdo educativo; não substitui prescrição médica, fisioterapia especializada nem protocolo da unidade.
          </Text>

          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.92 }]} onPress={onAccept}>
            <Text style={styles.buttonText}>Iniciar</Text>
            <Text style={styles.buttonHint}>Abrir assistente de VM</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppDesign.canvas.tealBackdrop },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 18,
    paddingVertical: 28,
    gap: 16,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    backgroundColor: AppDesign.accent.lime,
    borderRadius: 32,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.2)",
  },
  badge: {
    fontSize: 12,
    fontWeight: "800",
    color: AppDesign.accent.limeDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: { fontSize: 24, fontWeight: "800", color: AppDesign.text.primary, lineHeight: 30 },
  subtitle: { fontSize: 15, color: "#1e293b", lineHeight: 22 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 14,
    ...AppDesign.shadow.card,
  },
  featureList: { gap: 12 },
  featureRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  featureIcon: { fontSize: 20 },
  featureText: { flex: 1, fontSize: 14, color: AppDesign.text.secondary, lineHeight: 20 },
  disclaimer: { fontSize: 12, color: AppDesign.text.muted, lineHeight: 18 },
  button: {
    backgroundColor: "#0f172a",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  buttonHint: { color: "#94a3b8", fontSize: 12 },
});
