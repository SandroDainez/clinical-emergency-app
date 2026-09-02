import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuidedDiscoveryCard } from "../../components/ui-v2";
import { guidedDiscoveryViewModel } from "../../lib/guided-discovery-adapter";
import { ESPACO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

const EXAMPLES = [
  ["avc", "hic_anticoag"],
  ["sca", "stemi_reperfusao"],
  ["tep", "estabilidade"],
] as const;

export default function GuidedDiscoveryShowcase() {
  const e = useEstilosDoTema(criarEstilos);
  const examples = EXAMPLES.map(([protocolId, nodeId]) =>
    guidedDiscoveryViewModel(protocolId, nodeId)
  ).filter(Boolean);

  return (
    <SafeAreaView style={e.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={e.content}>
        <Text style={e.title}>Descoberta guiada — UI V2</Text>
        <Text style={e.subtitle}>
          Exemplos derivados do registry canônico. Esta tela não duplica regras clínicas.
        </Text>

        {examples.map((model) => model ? (
          <View key={model.id} style={e.section}>
            <Text style={e.mode}>{model.readyInTree ? "Nó real existente" : "Plano preparado"}</Text>
            <GuidedDiscoveryCard
              eyebrow={model.eyebrow}
              title={model.title}
              sourceLabel={model.sourceLabel}
              steps={model.steps}
              sufficientWhen={model.sufficientWhen}
              onReturn={() => {}}
            />
          </View>
        ) : null)}
      </ScrollView>
    </SafeAreaView>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.cores.bg },
    content: { padding: ESPACO.lg, gap: ESPACO.xl },
    title: { ...TIPOGRAFIA.title, color: t.cores.text, fontWeight: "900" },
    subtitle: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary },
    section: { gap: ESPACO.sm },
    mode: { ...TIPOGRAFIA.micro, color: t.cores.primary, fontWeight: "800" },
  });
