import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type Href, useRouter } from "expo-router";

import { AppDesign } from "@/constants/app-design";
import { ModuleBackToHubLink } from "@/components/module-back-to-hub";
import ClinicalApp from "../../components/clinical-app";
import * as sepsisEngine from "../../sepsis-engine";

export default function SepsisScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <View style={styles.backRow}>
        <ModuleBackToHubLink onPress={() => router.replace("/(tabs)" as Href)} />
      </View>
      <ClinicalApp engine={sepsisEngine} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppDesign.canvas.tealBackdrop,
  },
  backRow: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
});
